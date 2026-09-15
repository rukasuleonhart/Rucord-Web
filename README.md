# Screen Share P2P (WebRTC bidirecional)

Compartilhamento de tela P2P entre usuários de uma sala, cada um podendo
compartilhar e assistir simultaneamente. O vídeo trafega direto entre os
navegadores (WebRTC); o servidor Node.js só faz **sinalização** via
Socket.IO — nenhum frame de vídeo passa pelo servidor.

## Como funciona

- **1 sala = N usuários** (o criador escolhe o limite, de 2 a 6).
- **1 `RTCPeerConnection` por par de usuários na sala.** Cada tela
  compartilhada é apenas uma `track` de vídeo adicionada a essa conexão
  com `pc.addTrack()`. Isso é o que permite todo mundo compartilhar ao
  mesmo tempo sem uma substituir a outra.
- **Sem câmera:** só `getDisplayMedia({ video: true, audio: true })`,
  usando o áudio do sistema/aba quando disponível.
- **Renegociação automática:** ao clicar em "Compartilhar" ou "Parar",
  `addTrack`/`replaceTrack` disparam `onnegotiationneeded`, que gera uma
  nova oferta/resposta SDP trocada via Socket.IO.
- **Perfect Negotiation:** como qualquer um dos lados pode iniciar uma
  renegociação a qualquer momento, o cliente usa o padrão *perfect
  negotiation* do WebRTC (um peer "polite", outro "impolite") para
  resolver colisões de oferta sem travar a conexão.
- **Mixer de áudio extra:** cada usuário pode adicionar fontes de áudio
  extras (Discord, jogo, outra aba) que são roteadas via Web Audio API
  no lado de quem recebe, com controle de volume/mudo por fonte.
- **Salas com senha e limite configurável**, chat de texto e
  reconexão automática após F5.

## Estrutura

```
screen-share-p2p/
├── package.json
├── server.js                # entrypoint: Express + HTTPS + Socket.IO
├── src/
│   ├── config.js             # constantes (portas, limites, paths)
│   ├── validation.js         # sanitização de entrada (sem Socket.IO)
│   ├── rooms.js               # RoomsService: regras de negócio de salas
│   ├── socket.js                # única camada que fala Socket.IO
│   └── httpsServer.js           # criação do servidor HTTPS
└── public/
    ├── index.html            # estrutura da página (sem lógica/estilo inline)
    ├── css/
    │   └── styles.css         # todo o CSS
    └── js/                    # ES modules (carregados via <script type="module">)
        ├── main.js             # entrypoint: importa os módulos de feature
        ├── dom.js              # referências centralizadas a elementos DOM
        ├── utils.js            # utilidades genéricas (escapeHtml)
        ├── state.js            # estado compartilhado (peers, sala atual, etc.)
        ├── socketClient.js     # instância única do socket.io
        ├── sounds.js           # sons de notificação (Web Audio API)
        ├── zoomPan.js          # zoom, pan, tela cheia, Picture-in-Picture
        ├── statsPanel.js       # resolução/fps/qualidade de conexão
        ├── webrtc.js           # peer connections, perfect negotiation, share/stop
        ├── audioMixer.js       # mixer de áudio extra (enviar/receber)
        ├── roomsLobby.js       # lista de salas, modais de criar/entrar
        ├── chat.js             # chat da sala
        ├── session.js          # sessionStorage + reentrada automática (F5)
        └── roomEvents.js       # orquestra os eventos de sala do servidor
```

### Por que essa divisão?

- **Backend:** `rooms.js` não sabe o que é Socket.IO — só entende "sala",
  "membro", "senha". `socket.js` é a única camada que traduz eventos de
  rede em chamadas a esse serviço. Isso torna a lógica de salas testável
  isoladamente e deixa claro onde mexer quando o transporte mudar.
- **Frontend:** cada módulo tem uma responsabilidade única (WebRTC, UI de
  lobby, chat, mixer de áudio, etc.), evitando um único arquivo de 3000+
  linhas com dezenas de variáveis globais. O estado compartilhado vive só
  em `state.js`; os outros módulos importam o que precisam em vez de
  declarar globais soltas.

## Rodando localmente

```bash
npm install
npm start
```

Abra `https://localhost:3000` em duas ou mais abas/navegadores (ou vários
computadores na mesma rede, trocando `localhost` pelo IP da máquina que
roda o servidor). Em cada aba, digite o **mesmo nome de sala** e clique em
"Entrar na sala" (ou crie a sala escolhendo o limite de participantes).
Depois, cada lado clica em "🖥 Compartilhar tela" quando quiser.

## Importante sobre HTTPS

`getDisplayMedia` (captura de tela) só funciona em **contextos seguros**:
`localhost` funciona sem HTTPS para testes, mas para usar em produção, entre
redes/domínios diferentes, você precisa servir a página via **HTTPS**
(ex.: atrás de um proxy reverso com certificado TLS, Nginx + Let's Encrypt,
ou uma plataforma como Render/Railway/Fly.io que já fornece HTTPS).

## Deploy em produção

**Este app não funciona na Vercel.** A Vercel roda cada rota como uma
função serverless isolada e de vida curta — não existe um processo Node
contínuo para o Socket.IO manter conexões abertas, e o estado das salas
(`RoomsService`, em memória) não sobrevive nem é compartilhado entre
invocações. Sinalização em tempo real com WebSocket precisa de um
processo que fique de pé o tempo todo.

Use uma plataforma que rode Node como processo persistente. O `render.yaml`
e o `Procfile` na raiz do projeto já deixam isso pronto:

- **Render**: conecte o repositório, ele detecta o `render.yaml`
  automaticamente (`npm install` + `npm start`). Gera HTTPS de graça.
- **Railway**: conecte o repositório, ele usa o `Procfile`
  (`web: node server.js`). Gera HTTPS de graça.
- **Fly.io**: `fly launch`, ele detecta o Node/Procfile e sobe o app.

Em qualquer uma delas a plataforma injeta a env var `PORT` automaticamente
(o `src/config.js` já lê `process.env.PORT`) e o servidor detecta
`NODE_ENV=production` para subir em HTTP puro (a plataforma cuida do
TLS/HTTPS na borda). Se quiser restringir o CORS do Socket.IO a um domínio
específico, defina a env var `ALLOWED_ORIGIN` (ex.:
`https://seu-front.vercel.app`) — sem ela, aceita qualquer origem, o que é
seguro quando front e back estão servidos do mesmo domínio, como é o caso
aqui (`server.js` já serve `public/` e o Socket.IO na mesma porta).

## Sobre o STUN/TURN

O `RTCPeerConnection` está configurado apenas com um servidor STUN público
(`stun:stun.l.google.com:19302`), suficiente para a maioria das redes
domésticas/NAT simples. Se os usuários estiverem atrás de NATs
simétricos/redes corporativas restritivas, a conexão direta pode falhar e
será necessário um servidor **TURN** (relay) — isso é orientação de rede, não
altera a arquitetura do código: basta adicionar as credenciais TURN no array
`iceServers` de `public/js/webrtc.js`.

## Extensões possíveis

- Múltiplas salas simultâneas já funcionam (o servidor já isola por `room`).
- O limite de participantes por sala já é configurável (2 a 6) na criação.
- Para salas muito maiores, a topologia mesh (1 `RTCPeerConnection` por par)
  deixa de escalar bem — a partir de algumas dezenas de participantes valeria
  migrar para um SFU, o que ficaria isolado em `public/js/webrtc.js` e
  `src/socket.js` sem afetar o resto do app.

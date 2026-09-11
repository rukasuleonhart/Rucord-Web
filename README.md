# Rucord Web

Aplicação de **compartilhamento de tela P2P** utilizando WebRTC.

Os usuários entram em uma sala e podem compartilhar a tela simultaneamente. O vídeo e o áudio são transmitidos diretamente entre os navegadores.

O servidor Node.js é responsável pela **sinalização WebRTC, gerenciamento das salas e chat**. Os frames de vídeo não passam pelo servidor.

## ✨ Recursos

* 🖥️ Compartilhamento de tela
* 🔊 Compartilhamento de áudio
* 👥 Salas de 2 a 6 participantes
* 🔐 Salas com senha
* 💬 Chat
* 🔄 Reconexão automática
* 🎚️ Mixer de áudio
* 📊 Informações de FPS, resolução e conexão
* 🔍 Zoom e pan
* 🖥️ Tela cheia
* 📺 Picture-in-Picture
* 🌐 Comunicação P2P com WebRTC

## 🛠️ Tecnologias

* Node.js
* Express
* Socket.IO
* WebRTC
* Web Audio API
* HTML
* CSS
* JavaScript ES Modules

## 📁 Estrutura

```text
screen-share-p2p/
│
├── cert/
│   ├── localhost+2.pem
│   └── localhost+2-key.pem
│
├── public/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js
│       ├── dom.js
│       ├── utils.js
│       ├── state.js
│       ├── socketClient.js
│       ├── sounds.js
│       ├── zoomPan.js
│       ├── statsPanel.js
│       ├── webrtc.js
│       ├── audioMixer.js
│       ├── roomsLobby.js
│       ├── chat.js
│       ├── session.js
│       └── roomEvents.js
│
├── src/
│   ├── config.js
│   ├── validation.js
│   ├── rooms.js
│   ├── socket.js
│   └── httpsServer.js
│
├── server.js
├── package.json
├── .gitignore
└── README.md
```

## 🚀 Instalação

No **Windows**, abra o PowerShell na pasta do projeto.

Instale as dependências:

```powershell
npm install
```

## 🔒 Configurar HTTPS

O projeto utiliza HTTPS para permitir o compartilhamento de tela.

### 1. Criar a pasta `cert`

```powershell
mkdir cert
```

### 2. Entrar na pasta

```powershell
cd cert
```

### 3. Instalar o certificado local

Se o `mkcert` ainda não estiver configurado:

```powershell
mkcert -install
```

### 4. Gerar o certificado

```powershell
mkcert localhost 127.0.0.1 ::1
```

Isso irá gerar os arquivos `.pem` dentro da pasta `cert`.

O resultado será semelhante a:

```text
cert/
├── localhost+2.pem
└── localhost+2-key.pem
```

> Os nomes dos arquivos podem variar dependendo dos endereços informados ao `mkcert`.

## ▶️ Executar

Volte para a pasta principal do projeto:

```powershell
cd ..
```

Execute:

```powershell
npm start
```

Abra no navegador:

```text
https://localhost:3000
```

## 🖥️ Acessar de outro computador

Para testar em outro computador na mesma rede:

1. Descubra o IPv4 da máquina que está executando o servidor:

```powershell
ipconfig
```

2. Gere um certificado incluindo o IP da máquina.

Por exemplo:

```powershell
cd cert
mkcert localhost 127.0.0.1 ::1 192.168.1.100
```

Substitua `192.168.1.100` pelo IPv4 da sua máquina.

3. Volte para a pasta do projeto:

```powershell
cd ..
```

4. Inicie o servidor:

```powershell
npm start
```

5. No outro computador, acesse:

```text
https://192.168.1.100:3000
```

O firewall do Windows pode solicitar permissão para o Node.js aceitar conexões.

## 👥 Como usar

1. Execute `npm start`.
2. Abra `https://localhost:3000`.
3. Crie uma sala ou entre em uma existente.
4. Compartilhe o nome e a senha da sala, se houver.
5. Clique em **Compartilhar tela**.

Cada participante pode compartilhar sua tela simultaneamente.

## 🌐 WebRTC

A aplicação utiliza uma arquitetura **P2P mesh**.

Cada participante estabelece uma conexão WebRTC com os demais participantes da sala.

```text
          Usuário A
          /       \
         /         \
        /           \
 Usuário B -------- Usuário C
```

O servidor não retransmite o vídeo.

Ele é utilizado para:

* gerenciamento das salas;
* entrada e saída de participantes;
* sinalização WebRTC;
* troca de ofertas e respostas SDP;
* troca de candidatos ICE;
* chat.

## 📡 STUN

O WebRTC utiliza STUN para auxiliar no estabelecimento das conexões P2P.

Atualmente:

```text
stun:stun.l.google.com:19302
```

Em algumas redes restritivas, uma conexão P2P direta pode não ser possível. Nesses casos, pode ser necessário adicionar um servidor TURN.

A configuração fica em:

```text
public/js/webrtc.js
```

## 🔊 Áudio

A captura utiliza:

```javascript
getDisplayMedia({
    video: true,
    audio: true
});
```

O áudio disponível depende do navegador e do conteúdo selecionado.

O projeto também possui um mixer baseado na Web Audio API para fontes adicionais de áudio.

## ⚠️ Limitação

A arquitetura utiliza conexões P2P entre os participantes.

Por isso, o consumo de CPU, memória e banda aumenta conforme o número de participantes.

O projeto foi pensado para **salas pequenas, de até 6 participantes**.

Para salas muito maiores, uma arquitetura baseada em **SFU** seria mais adequada.

## 🔐 Git

Os certificados não devem ser enviados para o Git.

Adicione ao `.gitignore`:

```gitignore
node_modules/
cert/
.env
*.log
```

## 📌 Resumo

No Windows:

```powershell
npm install

mkdir cert
cd cert

mkcert -install
mkcert localhost 127.0.0.1 ::1

cd ..

npm start
```

Depois acesse:

```text
https://localhost:3000
```

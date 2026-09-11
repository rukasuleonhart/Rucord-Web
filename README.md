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
Rucord-Web/
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

No **Windows**, abra o PowerShell ou CMD.

### 1. Clonar o projeto

Clone o repositório:

```powershell
git clone https://github.com/rukasuleonhart/Rucord-Web.git
```

Entre na pasta do projeto:

```powershell
cd Rucord-Web
```

### 2. Instalar as dependências

Execute:

```powershell
npm install
```

## 🔒 Configurar HTTPS

O projeto utiliza HTTPS para permitir o compartilhamento de tela.

Para gerar o certificado local, o projeto utiliza o **mkcert**.

### 3. Instalar o mkcert

No Windows, execute:

```powershell
winget install FiloSottile.mkcert
```

Após a instalação, **feche completamente o CMD ou PowerShell**.

Depois, abra um **novo CMD ou PowerShell**.

Entre novamente na pasta do projeto:

```powershell
cd Rucord-Web
```

> É importante abrir um novo terminal depois da instalação do `mkcert`, pois o Windows pode precisar atualizar a variável `PATH` para que o comando `mkcert` seja reconhecido.

### 4. Verificar a instalação

Execute:

```powershell
mkcert -version
```

Se o comando retornar a versão do `mkcert`, a instalação foi concluída corretamente.

### 5. Criar a pasta `cert`

Na pasta principal do projeto:

```powershell
mkdir cert
```

### 6. Entrar na pasta `cert`

```powershell
cd cert
```

### 7. Instalar a autoridade certificadora local

Execute:

```powershell
mkcert -install
```

Esse comando instala a autoridade certificadora local do `mkcert` no sistema.

### 8. Gerar o certificado

Execute:

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

### 1. Descobrir o IPv4 da máquina

Na máquina que está executando o servidor:

```powershell
ipconfig
```

Identifique o endereço IPv4, por exemplo:

```text
192.168.1.100
```

### 2. Gerar um certificado incluindo o IP da máquina

Entre na pasta `cert`:

```powershell
cd cert
```

Execute:

```powershell
mkcert localhost 127.0.0.1 ::1 192.168.1.100
```

Substitua `192.168.1.100` pelo IPv4 da sua máquina.

### 3. Voltar para a pasta do projeto

```powershell
cd ..
```

### 4. Iniciar o servidor

```powershell
npm start
```

### 5. Acessar pelo outro computador

No outro computador, acesse:

```text
https://192.168.1.100:3000
```

O firewall do Windows pode solicitar permissão para o Node.js aceitar conexões.

> **Importante:** para evitar problemas de certificado, o endereço utilizado para acessar o servidor deve estar incluído no certificado gerado pelo `mkcert`.

## 🌐 Acessar pela Internet

Para permitir que pessoas fora da sua rede local acessem o Rucord Web, é necessário configurar o **redirecionamento de porta (Port Forwarding)** no roteador.

### 1. Descobrir o IPv4 da máquina

Na máquina onde o servidor está executando:

```powershell
ipconfig
```

Identifique o endereço IPv4, por exemplo:

```text
192.168.1.100
```

### 2. Configurar o roteador

Acesse o painel de administração do seu roteador e procure uma opção como:

```text
Port Forwarding
Port Mapping
Redirecionamento de Portas
NAT
Virtual Server
```

Crie uma regra direcionando a porta utilizada pelo Rucord para o IPv4 da máquina que executa o servidor.

Por exemplo:

```text
Porta externa: 3000
IP interno:    192.168.1.100
Porta interna: 3000
Protocolo:     TCP
```

> A configuração exata varia de acordo com o modelo e fabricante do roteador.

### 3. Liberar a porta no Firewall do Windows

O Windows Firewall também pode bloquear conexões externas.

Certifique-se de que a porta utilizada pelo servidor esteja liberada para conexões de entrada.

### 4. Iniciar o servidor

Na pasta do projeto:

```powershell
npm start
```

### 5. Descobrir o IP externo

O endereço que será utilizado pelas pessoas é o **IP público da sua conexão com a Internet**, e não o IPv4 local como `192.168.x.x`.

O endereço terá este formato:

```text
https://SEU_IP_EXTERNO:PORTA
```

Por exemplo:

```text
https://200.100.50.25:3000
```

Esse é o endereço que pode ser enviado para as pessoas acessarem o servidor.

> **Importante:** o IP externo pode mudar dependendo do seu provedor de Internet. Se sua conexão utilizar **CGNAT**, o redirecionamento de portas pode não funcionar diretamente. Nesse caso, será necessário solicitar um IPv4 público ao provedor ou utilizar outra solução de acesso externo.

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

## 📌 Instalação rápida

No Windows:

### 1. Clonar o projeto

```powershell
git clone https://github.com/rukasuleonhart/Rucord-Web.git
cd Rucord-Web
```

### 2. Instalar as dependências

```powershell
npm install
```

### 3. Instalar o mkcert

```powershell
winget install FiloSottile.mkcert
```

### 4. Fechar e abrir novamente o terminal

**Feche completamente o CMD ou PowerShell.**

Depois abra um **novo CMD ou PowerShell** e entre novamente na pasta:

```powershell
cd Rucord-Web
```

### 5. Verificar o mkcert

```powershell
mkcert -version
```

### 6. Criar os certificados

```powershell
mkdir cert
cd cert

mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### 7. Iniciar o projeto

```powershell
cd ..

npm start
```

Depois acesse:

```text
https://localhost:3000
```

### Acesso pela rede local

```text
https://IP_LOCAL:3000
```

### Acesso pela Internet

Configure o **redirecionamento da porta no roteador**, libere a porta no firewall quando necessário e envie para os usuários:

```text
https://SEU_IP_EXTERNO:PORTA
```

## 🚀 Instalação

No **Windows**, abra o **PowerShell** ou **CMD** na pasta onde deseja clonar o projeto.

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

---

## 🔐 Configurar HTTPS

O projeto utiliza **HTTPS** para permitir recursos como o compartilhamento de tela.

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

> É importante abrir um novo terminal após a instalação do `mkcert`, pois o Windows pode precisar atualizar a variável `PATH` para que o comando `mkcert` seja reconhecido.

### 4. Verificar a instalação

Execute:

```powershell
mkcert -version
```

Se o comando retornar a versão do `mkcert`, a instalação foi concluída corretamente.

### 5. Criar a pasta `cert`

Na pasta principal do projeto, execute:

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

Isso irá gerar os arquivos de certificado dentro da pasta `cert`.

### 9. Voltar para a pasta do projeto

```powershell
cd ..
```

### 10. Iniciar o projeto

Execute:

```powershell
npm start
```

Depois, acesse:

```text
https://localhost:3000
```

---

## 🖥️ Acesso pela rede local

Para testar o projeto em outro computador conectado à mesma rede:

### 1. Descobrir o IPv4 da máquina

Na máquina que está executando o servidor, execute:

```powershell
ipconfig
```

Identifique o endereço **IPv4** da interface de rede utilizada.

Por exemplo:

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

> Se você já tiver gerado um certificado anteriormente, o certificado utilizado pelo servidor deverá ser substituído pelo novo certificado que inclui o endereço IP.

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

Substitua `192.168.1.100` pelo IPv4 da máquina que está executando o servidor.

O firewall do Windows pode solicitar permissão para o Node.js aceitar conexões.

> **Importante:** para evitar problemas relacionados ao certificado, o endereço utilizado para acessar o servidor deve estar incluído no certificado gerado pelo `mkcert`.

---

## 🌐 Acesso pela Internet

Para permitir que pessoas fora da sua rede local acessem o Rucord Web, é necessário configurar o **redirecionamento de porta (Port Forwarding)** no roteador.

De forma geral:

1. Configure o redirecionamento da porta utilizada pelo servidor para o computador que está executando o Rucord Web.
2. Libere a porta no firewall do Windows, se necessário.
3. Gere um certificado que inclua o endereço utilizado para acessar o servidor.
4. Envie aos usuários o endereço público do servidor.

O endereço poderá ter um formato semelhante a:

```text
https://SEU_IP_EXTERNO:PORTA
```

> **Atenção:** utilizar um certificado `mkcert` não é uma solução adequada para distribuir um serviço publicamente pela Internet, pois a autoridade certificadora local do `mkcert` não é confiável por padrão nos computadores dos outros usuários. Para acesso público, considere utilizar um certificado emitido por uma autoridade certificadora pública, como o Let's Encrypt.

---

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

Depois, abra um novo terminal e entre novamente na pasta do projeto:

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

Depois, acesse:

```text
https://localhost:3000
```

### Acesso pela rede local

Para acessar a partir de outro computador na mesma rede:

```text
https://IP_LOCAL:3000
```

O `IP_LOCAL` deve estar incluído no certificado gerado pelo `mkcert`.

### Acesso pela Internet

Configure o **redirecionamento da porta no roteador**, libere a porta no firewall quando necessário e utilize um certificado apropriado para acesso público.

O endereço poderá ser:

```text
https://SEU_IP_EXTERNO:PORTA
```

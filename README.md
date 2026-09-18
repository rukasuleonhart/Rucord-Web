## 🚀 Instalação

No **Windows**, abra o PowerShell na pasta do projeto.
No **Windows**, abra o PowerShell ou CMD.

Instale as dependências:
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
@@ -88,27 +104,65 @@ npm install

O projeto utiliza HTTPS para permitir o compartilhamento de tela.

### 1. Criar a pasta `cert`
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

### 2. Entrar na pasta
### 6. Entrar na pasta `cert`

```powershell
cd cert
```

### 3. Instalar o certificado local
### 7. Instalar a autoridade certificadora local

Se o `mkcert` ainda não estiver configurado:
Execute:

```powershell
mkcert -install
```

### 4. Gerar o certificado
Esse comando instala a autoridade certificadora local do `mkcert` no sistema.

### 8. Gerar o certificado

Execute:

```powershell
mkcert localhost 127.0.0.1 ::1
@@ -150,43 +204,60 @@ https://localhost:3000

Para testar em outro computador na mesma rede:

1. Descubra o IPv4 da máquina que está executando o servidor:
### 1. Descobrir o IPv4 da máquina

Na máquina que está executando o servidor:

```powershell
ipconfig
```

2. Gere um certificado incluindo o IP da máquina.
Identifique o endereço IPv4, por exemplo:

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

3. Volte para a pasta do projeto:
### 3. Voltar para a pasta do projeto

```powershell
cd ..
```

4. Inicie o servidor:
### 4. Iniciar o servidor

```powershell
npm start
```

5. No outro computador, acesse:
### 5. Acessar pelo outro computador

No outro computador, acesse:

```text
https://192.168.1.100:3000
```

O firewall do Windows pode solicitar permissão para o Node.js aceitar conexões.

> **Importante:** para evitar problemas de certificado, o endereço utilizado para acessar o servidor deve estar incluído no certificado gerado pelo `mkcert`.

## 🌐 Acessar pela Internet

Para permitir que pessoas fora da sua rede local acessem o Rucord Web, é necessário configurar o **redirecionamento de porta (Port Forwarding)** no roteador.
@@ -355,19 +426,58 @@ cert/
*.log
```

## 📌 Resumo
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
@@ -379,13 +489,15 @@ Depois acesse:
https://localhost:3000
```

Para acesso pela rede local:
### Acesso pela rede local

```text
https://IP_LOCAL:3000
```

Para acesso pela Internet, configure o **redirecionamento da porta no roteador**, libere a porta no firewall quando necessário e envie para os usuários:
### Acesso pela Internet

Configure o **redirecionamento da porta no roteador**, libere a porta no firewall quando necessário e envie para os usuários:

```text
https://SEU_IP_EXTERNO:PORTA

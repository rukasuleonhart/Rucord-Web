'use strict';

const path = require('path');
const express = require('express');
const { Server } = require('socket.io');

const config = require('./src/config');
const createHttpsServer = require('./src/httpsServer');
const RoomsService = require('./src/rooms');
const registerSocketHandlers = require('./src/socket');

// ======================================================
// APP
// ======================================================

const app = express();

app.use(express.static(path.join(__dirname, config.PUBLIC_DIR)));

// ======================================================
// HTTPS + SOCKET.IO
// ======================================================

const server = createHttpsServer(app, {
  rootDir: __dirname,
  certDir: config.CERT_DIR,
  certKeyFile: config.CERT_KEY_FILE,
  certFile: config.CERT_FILE
});

const io = new Server(server);

// ======================================================
// SALAS + SINALIZAÇÃO
// ======================================================

const roomsService = new RoomsService();

registerSocketHandlers(io, roomsService);

// ======================================================
// SUBIR SERVIDOR
// ======================================================

server.listen(config.PORT, '0.0.0.0', () => {
  console.log('');
  console.log('======================================');
  console.log('Servidor HTTPS Fake iniciado');
  console.log(`https://localhost:${config.PORT}`);
  console.log(`SEU_IP:${config.PORT}`);
  console.log('Não se esqueça de expor a porta 3000 no seu roteador');
  console.log('======================================');
});

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

app.use(
  express.static(
    path.join(__dirname, config.PUBLIC_DIR)
  )
);

// ======================================================
// HTTPS LOCALHOST + SOCKET.IO
// ======================================================

const server = createHttpsServer(app, {
  rootDir: __dirname,
  certDir: config.CERT_DIR,
  certKeyFile: config.CERT_KEY_FILE,
  certFile: config.CERT_FILE
});

const io = new Server(server, {
  cors: {
    origin: config.ALLOWED_ORIGIN || true,
    credentials: true
  }
});

// ======================================================
// SALAS + SINALIZAÇÃO
// ======================================================

const roomsService = new RoomsService();

registerSocketHandlers(io, roomsService);

// ======================================================
// SUBIR SERVIDOR
// ======================================================

server.listen(config.PORT, '0.0.0.0', () => {
  const isHttps = typeof server.setSecureContext === 'function';
  const protocol = isHttps ? 'https' : 'http';

  console.log('');
  console.log('======================================');
  console.log(`Servidor ${protocol.toUpperCase()} rodando`);
  console.log(`${protocol}://localhost:${config.PORT}`);
  console.log('======================================');
});

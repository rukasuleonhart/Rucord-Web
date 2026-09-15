'use strict';

// ======================================================
// CONFIGURAÇÃO CENTRAL DO SERVIDOR
// ======================================================

module.exports = {

  PORT: process.env.PORT || 3000,

  // Em produção, defina essa env var com a URL do seu front-end
  // (ex.: https://seu-app.vercel.app) para restringir o CORS do
  // Socket.IO. Se não for definida, aceita qualquer origem (ok
  // para deploys onde front e back estão no mesmo domínio).
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || null,

  PUBLIC_DIR: 'public',
  CERT_DIR: 'cert',
  CERT_KEY_FILE: 'localhost+2-key.pem',
  CERT_FILE: 'localhost+2.pem',

  // Limite de pessoas por sala. Quem cria a sala escolhe o
  // tamanho dentro desse intervalo.
  MIN_ROOM_SIZE: 2,
  MAX_ROOM_SIZE: 6,
  DEFAULT_ROOM_SIZE: 3,

  MAX_NAME_LENGTH: 30,
  MAX_CHAT_MESSAGE_LENGTH: 500

};

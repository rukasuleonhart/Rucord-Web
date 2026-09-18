'use strict';

// ======================================================
// CONFIGURAÇÃO CENTRAL DO SERVIDOR
// ======================================================

module.exports = {

  PORT: process.env.PORT || 3000,
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

'use strict';

const { MIN_ROOM_SIZE, MAX_ROOM_SIZE, DEFAULT_ROOM_SIZE } = require('./config');

// ======================================================
// SANITIZAÇÃO / VALIDAÇÃO DE ENTRADA
//
// Nenhuma dessas funções conhece Socket.IO ou o estado das
// salas — só recebem valores "crus" vindos do cliente e
// devolvem valores seguros para o resto do sistema usar.
// ======================================================

function sanitizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeRawString(value) {
  // Como sanitizeString, mas sem trim (usado pra senha, onde
  // espaços podem ser intencionais).
  return typeof value === 'string' ? value : '';
}

function clampRoomSize(value) {
  const parsed = parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_ROOM_SIZE;
  }

  return Math.min(MAX_ROOM_SIZE, Math.max(MIN_ROOM_SIZE, parsed));
}

function truncate(value, maxLength) {
  return value.slice(0, maxLength);
}

module.exports = {
  sanitizeString,
  sanitizeRawString,
  clampRoomSize,
  truncate
};

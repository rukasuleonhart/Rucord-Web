// ======================================================
// STATE
//
// Todo o estado mutável compartilhado entre módulos vive
// aqui. Coleções (Map/Set) são exportadas diretamente e
// mutadas em paz por quem precisar; valores primitivos são
// exportados como bindings vivos (let) + uma função setter,
// já que "import { x }" sempre lê o valor atual do módulo.
// ======================================================

// socket.id -> RTCPeerConnection
export const peers = new Map();

// socket.id -> { id, name }
export const participants = new Map();

// socket.id -> { makingOffer, ignoreOffer, polite }
export const negotiationState = new Map();

// socket.id -> RTCRtpSender (nosso vídeo local enviado para esse peer)
export const videoSenders = new Map();

// socket.id -> RTCRtpSender (nosso áudio local enviado para esse peer)
export const audioSenders = new Map();

// socket.id -> RTCRtpSender (nossa webcam enviada para esse peer)
export const cameraSenders = new Map();

// socket.id -> { cameraStreamId, cameraOn }
export const remoteMediaInfo = new Map();

// id ('local' ou socket.id) -> { zoom, panX, panY }
export const zoomState = new Map();

// Quem já teve o "início de compartilhamento" avisado por som.
export const sharingAnnounced = new Set();

// ======================================================
// SESSÃO ATUAL
// ======================================================

export let localStream = null;

export function setLocalStream(value) {
  localStream = value;
}

// Stream cru da webcam (getUserMedia). Null = câmera desligada.
export let cameraStream = null;

export function setCameraStream(value) {
  cameraStream = value;
}

export let currentRoom = null;

export function setCurrentRoom(value) {
  currentRoom = value;
}

export let currentName = null;

export function setCurrentName(value) {
  currentName = value;
}

// Limite padrão apenas para o estado inicial.
// O valor real da sala é definido pelo servidor.
export let currentRoomMaxUsers = 3;

export function setCurrentRoomMaxUsers(value) {
  const limit = Number(value);

  if (!Number.isFinite(limit) || limit < 1) {
    console.warn(
      '[STATE] Limite de sala inválido:',
      value
    );
    return;
  }

  currentRoomMaxUsers = limit;
}

export let currentPassword = null;

export function setCurrentPassword(value) {
  currentPassword = value;
}

// Senha usada na tentativa de create-room/join-room mais recente,
// guardada temporariamente até o servidor confirmar sucesso
// (vira currentPassword) ou erro.
export let pendingPassword = null;

export function setPendingPassword(value) {
  pendingPassword = value;
}

// null | 'joining' | 'creating'
// Controla o fluxo automático de reentrada na sala após um F5 /
// reconexão de socket, para diferenciar um erro vindo desse fluxo
// de um erro de digitação manual.
export let autoRejoinState = null;

export function setAutoRejoinState(value) {
  autoRejoinState = value;
}

// ======================================================
// CHAT
// ======================================================

export let chatOpen = false;

export function setChatOpen(value) {
  chatOpen = value;
}

export let unreadCount = 0;

export function setUnreadCount(value) {
  unreadCount = value;
}

// ======================================================
// STATS
// ======================================================

export let statsIntervalId = null;

export function setStatsIntervalId(value) {
  statsIntervalId = value;
}
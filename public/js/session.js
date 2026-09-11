import { roomInput, nameInput } from './dom.js';
import { socket } from './socketClient.js';
import {
  peers,
  currentRoom,
  currentName,
  currentPassword,
  setPendingPassword,
  setAutoRejoinState
} from './state.js';
import { setStatus, disableLobby } from './uiCore.js';
import { removePeer } from './webrtc.js';

// ======================================================
// PERSISTÊNCIA DE SESSÃO (SOBREVIVE A F5)
// ======================================================

const STORAGE_ROOM_KEY = 'screenshare:room';
const STORAGE_NAME_KEY = 'screenshare:name';
const STORAGE_PASSWORD_KEY = 'screenshare:password';

function safeStorageGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    // sessionStorage pode estar indisponível (modo privado, etc).
  }
}

export function safeStorageClear() {
  try {
    sessionStorage.removeItem(STORAGE_ROOM_KEY);
    sessionStorage.removeItem(STORAGE_NAME_KEY);
    sessionStorage.removeItem(STORAGE_PASSWORD_KEY);
  } catch (error) {
    // Ignora.
  }
}

export function saveSession(room, name, password) {
  safeStorageSet(STORAGE_ROOM_KEY, room);
  safeStorageSet(STORAGE_NAME_KEY, name);

  if (password) {
    safeStorageSet(STORAGE_PASSWORD_KEY, password);
  } else {
    try {
      sessionStorage.removeItem(STORAGE_PASSWORD_KEY);
    } catch (error) {
      // Ignora.
    }
  }
}

// ======================================================
// REENTRAR AUTOMATICAMENTE NA SALA
//
// Chamado sempre que o socket conecta (primeira conexão da
// aba ou reconexão após queda de rede). Se houver uma sala
// guardada (nesta sessão de aba, ou ainda em memória por
// causa de uma reconexão sem reload), tenta reentrar direto,
// sem passar pelo lobby.
// ======================================================

export function attemptAutoRejoin() {
  const room = currentRoom || safeStorageGet(STORAGE_ROOM_KEY);
  const name = currentName || safeStorageGet(STORAGE_NAME_KEY);
  const password = currentPassword || safeStorageGet(STORAGE_PASSWORD_KEY) || '';

  if (!room || !name) {
    return;
  }

  // Qualquer peer/participante em memória é de antes da reconexão
  // e está com o socket.id antigo — descarta tudo para reconstruir
  // do zero quando a sala for confirmada.
  for (const id of Array.from(peers.keys())) {
    removePeer(id);
  }

  roomInput.value = room;
  nameInput.value = name;

  disableLobby();
  setStatus(`Reconectando à sala "${room}"...`);

  setAutoRejoinState('joining');
  setPendingPassword(password);

  socket.emit('join-room', { room, name, password });
}

socket.on('connect', attemptAutoRejoin);

import {
  statusEl,
  roomInput,
  nameInput,
  createBtn,
  joinBtn,
  lobbyScreen,
  roomScreen,
  currentRoomEl,
  usersCountEl,
  usersNamesEl
} from './dom.js';

import {
  currentRoom,
  currentName,
  participants,
  currentRoomMaxUsers
} from './state.js';

import { startStatsLoop } from './statsPanel.js';

// ======================================================
// UI CORE
//
// Funções de interface usadas por vários módulos
// (lobby, sala, sessão).
// ======================================================

export function setStatus(message) {
  statusEl.textContent = message;
}

export function disableLobby() {
  roomInput.disabled = true;
  nameInput.disabled = true;
  createBtn.disabled = true;
  joinBtn.disabled = true;
}

export function enableLobby() {
  roomInput.disabled = false;
  nameInput.disabled = false;
  createBtn.disabled = false;
  joinBtn.disabled = false;
}

export function enterRoomUI() {
  lobbyScreen.style.display = 'none';
  roomScreen.style.display = 'block';

  currentRoomEl.textContent = currentRoom;

  updateUsersCount();
  startStatsLoop();
}

export function backToLobbyUI() {
  roomScreen.style.display = 'none';
  lobbyScreen.style.display = 'block';

  enableLobby();
}

export function updateUsersCount() {
  const count = participants.size + 1;

  console.log(
    '[USERS COUNT]',
    'count:', count,
    'limite:', currentRoomMaxUsers
  );

  usersCountEl.textContent =
    `${count}/${currentRoomMaxUsers} ${
      count === 1 ? 'participante' : 'participantes'
    }`;

  if (usersNamesEl) {
    const names = [
      currentName || 'Você',
      ...Array.from(participants.values()).map(
        user => user.name
      )
    ];

    usersNamesEl.textContent = names.join(', ');
  }
}
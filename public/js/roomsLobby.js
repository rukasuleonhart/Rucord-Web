import {
  roomInput,
  nameInput,
  createBtn,
  joinBtn,
  roomsList,
  createRoomModal,
  modalRoomName,
  modalCloseBtn,
  modalCancelBtn,
  modalConfirmBtn,
  createRoomPasswordInput,
  sizePicker,
  bandwidthPreview,
  bandwidthValue,
  bandwidthCopies,
  bandwidthStatusText,
  bandwidthHint,
  tableToggleBtn,
  bandwidthTable,
  bandwidthTableBody,
  bandwidthFootnote,
  joinPasswordModal,
  joinPasswordRoomName,
  joinPasswordInput,
  joinPasswordError,
  joinPasswordCloseBtn,
  joinPasswordCancelBtn,
  joinPasswordConfirmBtn
} from './dom.js';
import { socket } from './socketClient.js';
import { setPendingPassword } from './state.js';
import { escapeHtml } from './utils.js';
import { setStatus, disableLobby, enableLobby } from './uiCore.js';
import { ensureAudioCtx } from './sounds.js';

// ======================================================
// TABELA DE ESTIMATIVA DE BANDA
//
// Estimativa: ~5 Mbps de upload por cópia 1080p enviada.
// ======================================================

const ROOM_BANDWIDTH_TABLE = [
  {
    people: 2,
    uploadMbps: 5,
    copies: 1,
    status: 'Tranquilo',
    emoji: '🟢😎',
    color: '#2fbf71',
    hint: 'Tranquilo até em conexões mais simples.'
  },
  {
    people: 3,
    uploadMbps: 10,
    copies: 2,
    status: 'De boa',
    emoji: '🟢😌',
    color: '#2fbf71',
    hint: 'Funciona bem na maioria das conexões residenciais.'
  },
  {
    people: 4,
    uploadMbps: 15,
    copies: 3,
    status: 'Começou a suar',
    emoji: '🟡😬',
    color: '#f5a623',
    hint: 'Vale ter um upload estável de pelo menos 15 Mbps.'
  },
  {
    people: 5,
    uploadMbps: 20,
    copies: 4,
    status: 'Deus tenha piedade',
    emoji: '🟠🫠',
    color: '#ff8a3d',
    hint: 'Só recomendado com fibra e conexão bem estável.'
  },
  {
    people: 6,
    uploadMbps: 25,
    copies: 5,
    status: 'Seu roteador pediu demissão',
    emoji: '🔴💀',
    color: '#e5484d',
    hint: 'Alto risco de travamentos e perda de qualidade.'
  }
];

const DEFAULT_ROOM_SIZE = 3;

let selectedRoomSize = DEFAULT_ROOM_SIZE;

function getBandwidthInfo(size) {
  return ROOM_BANDWIDTH_TABLE.find((row) => row.people === size) || ROOM_BANDWIDTH_TABLE[1];
}

function renderSizePicker() {
  sizePicker.innerHTML = '';

  ROOM_BANDWIDTH_TABLE.forEach((row) => {
    const btn = document.createElement('button');

    btn.type = 'button';
    btn.className = 'size-btn';
    btn.textContent = row.people;
    btn.dataset.size = row.people;

    if (row.people === selectedRoomSize) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      selectedRoomSize = row.people;

      renderSizePicker();
      updateBandwidthPreview();
    });

    sizePicker.appendChild(btn);
  });
}

function updateBandwidthPreview() {
  const info = getBandwidthInfo(selectedRoomSize);

  bandwidthPreview.style.setProperty('--status-color', info.color);

  bandwidthValue.textContent = `${info.uploadMbps} Mbps`;
  bandwidthCopies.textContent = `${info.copies}`;
  bandwidthStatusText.textContent = `${info.emoji} ${info.status}`;
  bandwidthHint.textContent = info.hint;

  Array.from(bandwidthTableBody.querySelectorAll('tr')).forEach((tr) => {
    tr.classList.toggle('current-row', Number(tr.dataset.people) === selectedRoomSize);
  });
}

function renderBandwidthTable() {
  bandwidthTableBody.innerHTML = '';

  ROOM_BANDWIDTH_TABLE.forEach((row) => {
    const tr = document.createElement('tr');

    tr.dataset.people = row.people;

    tr.innerHTML = `
      <td>${row.people} pessoas</td>
      <td>~${row.uploadMbps} Mbps</td>
      <td>${row.emoji} ${row.status}</td>
    `;

    bandwidthTableBody.appendChild(tr);
  });
}

function openCreateRoomModal(roomName) {
  modalRoomName.textContent = roomName;

  selectedRoomSize = DEFAULT_ROOM_SIZE;
  createRoomPasswordInput.value = '';

  renderSizePicker();
  renderBandwidthTable();
  updateBandwidthPreview();

  bandwidthTable.classList.remove('open');
  bandwidthFootnote.classList.remove('open');
  tableToggleBtn.textContent = 'Ver tabela completa ▾';

  createRoomModal.classList.add('open');
}

function closeCreateRoomModal() {
  createRoomModal.classList.remove('open');
}

modalCloseBtn.addEventListener('click', closeCreateRoomModal);
modalCancelBtn.addEventListener('click', closeCreateRoomModal);

createRoomModal.addEventListener('click', (event) => {
  if (event.target === createRoomModal) {
    closeCreateRoomModal();
  }
});

tableToggleBtn.addEventListener('click', () => {
  const isOpen = bandwidthTable.classList.toggle('open');

  bandwidthFootnote.classList.toggle('open', isOpen);

  tableToggleBtn.textContent = isOpen ? 'Ocultar tabela completa ▴' : 'Ver tabela completa ▾';
});

createRoomPasswordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    modalConfirmBtn.click();
  }
});

modalConfirmBtn.addEventListener('click', () => {
  const room = roomInput.value.trim();
  const name = nameInput.value.trim();
  const password = createRoomPasswordInput.value;

  // Teste para ver o tamanho pelo console
  console.log('[CREATE ROOM] selectedRoomSize:', selectedRoomSize);

  setPendingPassword(password || null);

  socket.emit('create-room', {
    room,
    name,
    maxUsers: selectedRoomSize,
    password
  });

  setStatus('Criando sala...');

  disableLobby();
  closeCreateRoomModal();
});

// ======================================================
// LISTA DE SALAS
// ======================================================

/*socket.on('rooms', (rooms) => {
  renderRooms(rooms);
}); */
socket.on('rooms', (rooms) => {
  console.log('[ROOMS LIST] recebido do servidor:', rooms);
  renderRooms(rooms);
});

function renderRooms(rooms) {
  roomsList.innerHTML = '';

  if (!rooms.length) {
    roomsList.innerHTML = `
      <div class="rooms-empty">
        Nenhuma sala criada ainda.
      </div>
    `;

    return;
  }

  for (const room of rooms) {
    const div = document.createElement('div');

    //const maxUsers = room.maxUsers || 3;
    const maxUsers = room.maxUsers;
    const isFull = room.count >= maxUsers;

    const namesText =
      room.users && room.users.length ? room.users.map((user) => escapeHtml(user.name)).join(', ') : '';

    div.className = 'room-item';

    div.innerHTML = `
      <div class="room-info">
        <div class="room-name">
          ${escapeHtml(room.name)}
          ${room.hasPassword ? '<span class="room-lock" title="Sala com senha">🔒</span>' : ''}
        </div>

        <div class="room-users">
          👥 ${room.count}/${maxUsers}
          ${isFull ? '(cheia)' : ''}
        </div>

        ${namesText ? `<div class="room-users room-names">${namesText}</div>` : ''}
      </div>

      <button
        type="button"
        class="btn-primary room-join"
        ${isFull ? 'disabled' : ''}
      >
        ${isFull ? 'Cheia' : 'Entrar'}
      </button>
    `;

    const joinButton = div.querySelector('.room-join');

    if (!isFull) {
      joinButton.addEventListener('click', () => {
        roomInput.value = room.name;

        if (room.hasPassword) {
          openJoinPasswordModal(room.name);
          return;
        }

        joinRoom();
      });
    }

    roomsList.appendChild(div);
  }
}

// ======================================================
// CRIAR SALA
// ======================================================

createBtn.addEventListener('click', () => {
  ensureAudioCtx();

  const room = roomInput.value.trim();
  const name = nameInput.value.trim();

  if (!room) {
    setStatus('Digite o nome da sala.');
    roomInput.focus();
    return;
  }

  if (!name) {
    setStatus('Digite seu nome.');
    nameInput.focus();
    return;
  }

  openCreateRoomModal(room);
});

// ======================================================
// ENTRAR NA SALA
// ======================================================

joinBtn.addEventListener('click', () => joinRoom());

export function joinRoom(password) {
  ensureAudioCtx();

  const room = roomInput.value.trim();
  const name = nameInput.value.trim();

  if (!room) {
    setStatus('Digite o nome da sala.');
    return;
  }

  if (!name) {
    setStatus('Digite seu nome.');
    return;
  }

  setPendingPassword(password || null);

  socket.emit('join-room', {
    room,
    name,
    password: password || ''
  });

  setStatus('Entrando na sala...');

  disableLobby();
}

// ======================================================
// MODAL: SENHA PARA ENTRAR
// ======================================================

export function openJoinPasswordModal(roomName) {
  joinPasswordRoomName.textContent = roomName;

  joinPasswordInput.value = '';

  joinPasswordError.textContent = '';
  joinPasswordError.classList.remove('visible');

  joinPasswordModal.classList.add('open');

  setTimeout(() => joinPasswordInput.focus(), 50);
}

export function closeJoinPasswordModal() {
  joinPasswordModal.classList.remove('open');

  // Se o usuário desistiu de entrar, libera o lobby de novo (ele
  // pode ter sido desabilitado por uma tentativa anterior).
  enableLobby();
}

joinPasswordCloseBtn.addEventListener('click', closeJoinPasswordModal);
joinPasswordCancelBtn.addEventListener('click', closeJoinPasswordModal);

joinPasswordModal.addEventListener('click', (event) => {
  if (event.target === joinPasswordModal) {
    closeJoinPasswordModal();
  }
});

joinPasswordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    joinPasswordConfirmBtn.click();
  }
});

joinPasswordConfirmBtn.addEventListener('click', () => {
  const password = joinPasswordInput.value;

  if (!password) {
    joinPasswordError.textContent = 'Digite a senha da sala.';
    joinPasswordError.classList.add('visible');
    return;
  }

  joinPasswordError.classList.remove('visible');

  joinRoom(password);
});

socket.on('password-required', ({ room }) => {
  openJoinPasswordModal(room || roomInput.value.trim());
});

export function showJoinPasswordError(message) {
  joinPasswordError.textContent = message;
  joinPasswordError.classList.add('visible');
  joinPasswordInput.focus();
  joinPasswordInput.select();
}

export function isJoinPasswordModalOpen() {
  return joinPasswordModal.classList.contains('open');
}

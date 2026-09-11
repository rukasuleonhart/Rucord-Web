import { leaveBtn, roomInput, nameInput } from './dom.js';
import { socket } from './socketClient.js';
import {
  peers,
  participants,
  currentRoom,
  currentName,
  currentPassword,
  pendingPassword,
  autoRejoinState,
  currentRoomMaxUsers,
  setCurrentRoom,
  setCurrentName,
  setCurrentPassword,
  setPendingPassword,
  setAutoRejoinState,
  setCurrentRoomMaxUsers
} from './state.js';
import { setStatus, enterRoomUI, backToLobbyUI, updateUsersCount } from './uiCore.js';
import { saveSession, safeStorageClear } from './session.js';
import {
  createPeerConnection,
  createParticipantVideo,
  removePeer,
  stopSharing,
  stopCamera
} from './webrtc.js';
import { closeJoinPasswordModal, isJoinPasswordModalOpen, showJoinPasswordError } from './roomsLobby.js';
import { playJoinSound, playLeaveSound } from './sounds.js';
import { clearChat } from './chat.js';
import { stopStatsLoop } from './statsPanel.js';

// ======================================================
// SALA CRIADA
// ======================================================

socket.on('room-created', ({ room, name, maxUsers }) => {

  // debug
  console.log('[ROOM CREATED] limite recebido:', maxUsers);

  setCurrentRoom(room);
  setCurrentName(name);
  setCurrentPassword(pendingPassword);
  setPendingPassword(null);
  setAutoRejoinState(null);
  setCurrentRoomMaxUsers(maxUsers);

  saveSession(room, name, currentPassword);

  enterRoomUI();

  setStatus(`Sala "${room}" criada.`);

  // NÃO iniciamos getDisplayMedia automaticamente.
  // O usuário precisa clicar no botão.
});

// ======================================================
// USUÁRIOS DA SALA (quem acabou de entrar)
// ======================================================

socket.on('room-users', async (payload) => {
  // Aceita tanto o formato antigo (array) quanto o novo ({ users, maxUsers }).
  const users = Array.isArray(payload) ? payload : (payload && payload.users) || [];
  const maxUsers = Array.isArray(payload) ? null : payload && payload.maxUsers;

  // Precisa vir ANTES de enterRoomUI(), senão o contador do topo
  // é desenhado com o limite padrão do state (3).
  if (maxUsers) {
    setCurrentRoomMaxUsers(maxUsers);
  }

  if (!currentRoom) {
    setCurrentRoom(roomInput.value.trim());
  }

  if (!currentName) {
    setCurrentName(nameInput.value.trim());
  }

  setCurrentPassword(pendingPassword);
  setPendingPassword(null);
  setAutoRejoinState(null);

  saveSession(currentRoom, currentName, currentPassword);

  closeJoinPasswordModal();

  // Quem entrou também precisa mudar do lobby para a sala.
  enterRoomUI();

  setStatus(`Você entrou na sala "${currentRoom}".`);

  for (const user of users) {
    participants.set(user.id, user);

    createParticipantVideo(user);

    await createPeerConnection(user.id, user.name);
  }

  updateUsersCount();
});

// ======================================================
// NOVO USUÁRIO
// ======================================================

socket.on('user-joined', async (user) => {
  participants.set(user.id, user);

  createParticipantVideo(user);
  updateUsersCount();

  setStatus(`${user.name} entrou na sala.`);
  playJoinSound();

  await createPeerConnection(user.id, user.name);
});

// ======================================================
// USUÁRIO SAIU
// ======================================================

socket.on('user-left', ({ id }) => {
  const user = participants.get(id);

  if (user) {
    setStatus(`${user.name} saiu da sala.`);
    playLeaveSound();
  }

  removePeer(id);
});

// ======================================================
// ERRO DA SALA
// ======================================================

socket.on('room-error', (message) => {
  // Senha errada ao tentar entrar numa sala protegida: mantém o
  // modal de senha aberto e mostra o erro ali, sem resetar o
  // resto do lobby.
  if (message === 'Senha incorreta.' && isJoinPasswordModalOpen()) {
    setPendingPassword(null);
    showJoinPasswordError('Senha incorreta. Tente novamente.');
    return;
  }

  // Se estávamos tentando reentrar automaticamente após um F5 e a
  // sala não existe mais (ex.: éramos os únicos e o servidor já a
  // removeu), tentamos recriá-la com o mesmo nome, uma única vez,
  // antes de desistir e voltar ao lobby.
  if (autoRejoinState === 'joining' && message.includes('não existe')) {
    setAutoRejoinState('creating');

    setStatus('A sala não existe mais. Recriando...');

    socket.emit('create-room', {
      room: roomInput.value.trim(),
      name: nameInput.value.trim(),
      // Sem isso o servidor cai no DEFAULT_ROOM_SIZE (3) e a sala
      // recriada perde o limite original.
      maxUsers: currentRoomMaxUsers,
      password: pendingPassword || ''
    });

    return;
  }

  // Qualquer outro erro (na reentrada automática ou em uma
  // tentativa manual) volta ao lobby normalmente.
  setAutoRejoinState(null);
  setPendingPassword(null);

  closeJoinPasswordModal();
  safeStorageClear();

  setStatus(message);
});

// ======================================================
// SAIR
// ======================================================

leaveBtn.addEventListener('click', async () => {
  await stopSharing();
  await stopCamera();

  socket.emit('leave-room');

  for (const id of Array.from(peers.keys())) {
    removePeer(id);
  }

  setCurrentRoom(null);
  setCurrentName(null);
  setCurrentPassword(null);
  setAutoRejoinState(null);

  safeStorageClear();

  stopStatsLoop();
  clearChat();

  backToLobbyUI();

  setStatus('Você saiu da sala.');
});

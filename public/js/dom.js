// ======================================================
// DOM
//
// Único lugar que faz document.getElementById. O resto do
// app importa os elementos já resolvidos daqui, em vez de
// espalhar getElementById por todo canto.
// ======================================================

const byId = (id) => document.getElementById(id);

// -------------------- LOBBY --------------------
export const roomInput = byId('room');
export const nameInput = byId('name');
export const createBtn = byId('createBtn');
export const joinBtn = byId('joinBtn');
export const statusEl = byId('status');
export const roomsList = byId('roomsList');
export const roomScreen = byId('roomScreen');
export const lobbyScreen = byId('lobbyScreen');

// -------------------- SALA --------------------
export const shareBtn = byId('shareBtn');
export const stopBtn = byId('stopBtn');
export const camBtn = byId('camBtn');
export const localVideo = byId('localVideo');
export const localCamVideo = byId('localCamVideo');
export const localEmpty = byId('localEmpty');
export const currentRoomEl = byId('currentRoom');
export const usersCountEl = byId('usersCount');
export const usersNamesEl = byId('usersNames');
export const videosContainer = byId('videos');
export const leaveBtn = byId('leaveBtn');

// -------------------- CHAT --------------------
export const chatToggleBtn = byId('chatToggleBtn');
export const chatCloseBtn = byId('chatCloseBtn');
export const chatPanel = byId('chatPanel');
export const chatMessages = byId('chatMessages');
export const chatForm = byId('chatForm');
export const chatInput = byId('chatInput');
export const chatUnread = byId('chatUnread');


// -------------------- MODAL: CRIAR SALA (limite/senha) --------------------
export const createRoomModal = byId('createRoomModal');
export const modalRoomName = byId('modalRoomName');
export const modalCloseBtn = byId('modalCloseBtn');
export const modalCancelBtn = byId('modalCancelBtn');
export const modalConfirmBtn = byId('modalConfirmBtn');
export const createRoomPasswordInput = byId('createRoomPassword');

export const sizePicker = byId('sizePicker');
export const bandwidthPreview = byId('bandwidthPreview');
export const bandwidthValue = byId('bandwidthValue');
export const bandwidthCopies = byId('bandwidthCopies');
export const bandwidthStatus = byId('bandwidthStatus');
export const bandwidthDot = byId('bandwidthDot');
export const bandwidthStatusText = byId('bandwidthStatusText');
export const bandwidthHint = byId('bandwidthHint');

export const tableToggleBtn = byId('tableToggleBtn');
export const bandwidthTable = byId('bandwidthTable');
export const bandwidthTableBody = byId('bandwidthTableBody');
export const bandwidthFootnote = byId('bandwidthFootnote');

// -------------------- MODAL: SENHA PARA ENTRAR --------------------
export const joinPasswordModal = byId('joinPasswordModal');
export const joinPasswordRoomName = byId('joinPasswordRoomName');
export const joinPasswordInput = byId('joinPasswordInput');
export const joinPasswordError = byId('joinPasswordError');
export const joinPasswordCloseBtn = byId('joinPasswordCloseBtn');
export const joinPasswordCancelBtn = byId('joinPasswordCancelBtn');
export const joinPasswordConfirmBtn = byId('joinPasswordConfirmBtn');

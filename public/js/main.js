// ======================================================
// ENTRYPOINT
//
// Cada módulo abaixo registra seus próprios listeners de
// DOM/Socket.IO ao ser importado. A ordem de import não
// importa para o ES module graph (cada módulo só roda uma
// vez), mas é mantida em uma ordem lógica de leitura.
// ======================================================

import './zoomPan.js';
import './sounds.js';
import './webrtc.js';
import './roomsLobby.js';
import './chat.js';
import './session.js';
import './roomEvents.js';

import {
  shareBtn,
  stopBtn,
  camBtn,
  localVideo,
  localCamVideo,
  localEmpty,
  videosContainer
} from './dom.js';
import { socket } from './socketClient.js';
import {
  peers,
  participants,
  negotiationState,
  videoSenders,
  audioSenders,
  cameraSenders,
  remoteMediaInfo,
  zoomState,
  sharingAnnounced,
  localStream,
  setLocalStream,
  cameraStream,
  setCameraStream
} from './state.js';
import { escapeHtml } from './utils.js';
import { setStatus, updateUsersCount } from './uiCore.js';
import { setupVideoBoxControls } from './zoomPan.js';
import { showReconnectBadge } from './statsPanel.js';
import { playShareSound } from './sounds.js';

// ======================================================
// CONFIGURAÇÃO WEBRTC
// ======================================================

const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// ======================================================
// WEBCAM
//
// Este MediaStream é só um "envelope": o id dele nunca muda
// durante a sessão, e a track real da câmera entra e sai dele
// conforme o usuário liga/desliga. Como o id é estável, os
// outros participantes conseguem identificar qual das tracks
// de vídeo recebidas é webcam (e não tela) mesmo depois de
// várias trocas — um replaceTrack não redispara ontrack nem
// atualiza o msid do lado de lá.
// ======================================================

const cameraOutStream = new MediaStream();

// remoteId -> Map<streamId, MediaStream> com tudo que já chegou
// daquele peer, para poder redistribuir tela/câmera nos elementos
// certos quando a informação de qual é qual mudar.
const remoteStreams = new Map();

function getScreenVideoEl(id) {
  return id === 'local' ? localVideo : document.querySelector(`video[data-peer-id="${id}"]`);
}

function getCamVideoEl(id) {
  return id === 'local' ? localCamVideo : document.querySelector(`video[data-cam-id="${id}"]`);
}

function getBoxEl(id) {
  return document.querySelector(`.video-box[data-peer-id="${id}"]`);
}

/** Mostra/esconde a miniatura da câmera e alterna o modo "só câmera". */
function updateCamLayout(id, camOn) {
  const overlay = document.querySelector(`.cam-overlay[data-cam-id="${id}"]`);

  if (overlay) {
    overlay.classList.toggle('show', Boolean(camOn));
  }

  const box = getBoxEl(id);

  if (!box) {
    return;
  }

  const screenEl = getScreenVideoEl(id);
  const screenOn = Boolean(screenEl && screenEl.srcObject);

  box.classList.toggle('cam-only', Boolean(camOn) && !screenOn);
}

/** Distribui as streams recebidas de um peer entre tela e câmera. */
function renderRemoteStreams(remoteId) {
  const streams = remoteStreams.get(remoteId) || new Map();
  const info = remoteMediaInfo.get(remoteId);
  const cameraStreamId = info ? info.cameraStreamId : null;

  let screenStream = null;
  let camStream = null;

  for (const [streamId, stream] of streams) {
    if (cameraStreamId && streamId === cameraStreamId) {
      camStream = stream;
    } else {
      screenStream = stream;
    }
  }

  const screenEl = getScreenVideoEl(remoteId);
  const camEl = getCamVideoEl(remoteId);

  if (screenEl && screenEl.srcObject !== screenStream) {
    screenEl.srcObject = screenStream;

    if (screenStream) {
      screenEl.play().catch(() => {});
    }
  }

  if (camEl && camEl.srcObject !== camStream) {
    camEl.srcObject = camStream;

    if (camStream) {
      camEl.play().catch(() => {});
    }
  }

  const empty = document.querySelector(`.video-empty[data-peer-id="${remoteId}"]`);

  if (empty) {
    empty.style.display = screenStream ? 'none' : 'flex';
  }

  updateCamLayout(remoteId, Boolean(camStream) && Boolean(info && info.cameraOn));
}

/** Avisa os outros qual é o nosso stream de câmera e se ela está ligada. */
function sendMediaInfo(to) {
  socket.emit('media-info', {
    to: to || null,
    cameraStreamId: cameraOutStream.id,
    cameraOn: Boolean(cameraStream)
  });
}

socket.on('media-info', ({ from, cameraStreamId, cameraOn } = {}) => {
  if (!from) {
    return;
  }

  remoteMediaInfo.set(from, {
    cameraStreamId: cameraStreamId || null,
    cameraOn: Boolean(cameraOn)
  });

  renderRemoteStreams(from);
});

// ======================================================
// CRIAR VÍDEO DO PARTICIPANTE
// ======================================================

export function createParticipantVideo(user) {
  if (document.querySelector(`.video-box[data-peer-id="${user.id}"]`)) {
    return;
  }

  const box = document.createElement('div');

  box.className = 'video-box';
  box.dataset.peerId = user.id;

  box.innerHTML = `
    <span class="video-label" title="Arrastar para reordenar">
      ⠿ ${escapeHtml(user.name)}
    </span>

    <video
      autoplay
      playsinline
      data-peer-id="${user.id}"
    ></video>

    <div
      class="video-empty"
      data-peer-id="${user.id}"
    >
      Aguardando compartilhamento...
    </div>

    <div class="cam-overlay" data-cam-id="${user.id}">
      <video
        class="cam-video"
        autoplay
        playsinline
        data-cam-id="${user.id}"
      ></video>
    </div>

    <div class="video-stats" data-peer-id="${user.id}">
      <span class="quality-dot" data-peer-id="${user.id}"></span>
      <span class="stats-text" data-peer-id="${user.id}"></span>
    </div>

    <div class="reconnect-badge" data-peer-id="${user.id}">
      <span class="reconnect-spinner"></span>
      Reconectando...
    </div>

    <div class="video-controls" data-peer-id="${user.id}">
      <button type="button" class="zoom-out-btn" title="Diminuir zoom">−</button>
      <span class="zoom-level" data-peer-id="${user.id}">100%</span>
      <button type="button" class="zoom-in-btn" title="Aumentar zoom">+</button>
      <button type="button" class="zoom-reset-btn" title="Resetar zoom">⟲</button>

      <button type="button" class="volume-btn" title="Ativar/desativar som">🔊</button>
      <input
        type="range"
        class="volume-slider"
        min="0"
        max="100"
        value="100"
        title="Volume desta transmissão"
      >

      <button type="button" class="pip-btn" title="Picture-in-Picture">🗔</button>
      <button type="button" class="fullscreen-btn" title="Tela cheia">⛶</button>
    </div>

    <div class="resize-handle" title="Arrastar para redimensionar"></div>
  `;

  videosContainer.appendChild(box);

  setupVideoBoxControls(box, user.id);

  // A info de mídia (ou até as tracks) pode ter chegado antes do
  // box existir — reaplica agora que os elementos estão no DOM.
  renderRemoteStreams(user.id);
}

// ======================================================
// REMOVER PEER
// ======================================================

export function removePeer(id) {
  const pc = peers.get(id);

  if (pc) {
    pc.close();
    peers.delete(id);
  }

  participants.delete(id);
  negotiationState.delete(id);
  videoSenders.delete(id);
  audioSenders.delete(id);
  cameraSenders.delete(id);
  remoteMediaInfo.delete(id);
  remoteStreams.delete(id);
  zoomState.delete(id);
  sharingAnnounced.delete(id);

  const box = document.querySelector(`.video-box[data-peer-id="${id}"]`);

  if (box) {
    box.remove();
  }

  updateUsersCount();
}

// ======================================================
// CRIAR PEER (padrão "Perfect Negotiation")
//
// Cada lado assume um papel fixo (polite/impolite), calculado
// a partir da comparação dos dois IDs de socket. Isso garante
// que as duas pontas cheguem a papéis opostos, sem precisar
// combinar "quem manda a offer primeiro" manualmente.
// ======================================================

export async function createPeerConnection(remoteId, remoteName) {
  if (peers.has(remoteId)) {
    return peers.get(remoteId);
  }

  console.log('[WebRTC] Criando conexão com:', remoteName, remoteId);

  const pc = new RTCPeerConnection(rtcConfig);

  peers.set(remoteId, pc);

  const polite = socket.id < remoteId;

  negotiationState.set(remoteId, {
    makingOffer: false,
    ignoreOffer: false,
    polite
  });

  // Nossa tela (se já estivermos compartilhando).
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0];

    if (videoTrack) {
      const sender = pc.addTrack(videoTrack, localStream);
      videoSenders.set(remoteId, sender);
    }

    const audioTrack = localStream.getAudioTracks()[0];

    if (audioTrack) {
      const sender = pc.addTrack(audioTrack, localStream);
      audioSenders.set(remoteId, sender);
    }
  }

  // Nossa webcam (se já estiver ligada).
  if (cameraStream) {
    const camTrack = cameraOutStream.getVideoTracks()[0];

    if (camTrack) {
      const sender = pc.addTrack(camTrack, cameraOutStream);
      cameraSenders.set(remoteId, sender);
    }
  }

  // Quem é quem: manda o id do nosso stream de câmera para esse peer
  // antes de qualquer track chegar do outro lado.
  sendMediaInfo(remoteId);

  // ICE.
  pc.onicecandidate = ({ candidate }) => {
    if (!candidate) {
      return;
    }

    socket.emit('signal', {
      to: remoteId,
      data: { candidate }
    });
  };

  // Receber tela / câmera.
  pc.ontrack = (event) => {
    const stream = event.streams[0];

    if (!stream) {
      return;
    }

    console.log('[WebRTC] Track recebida de:', remoteName, event.track.kind);

    if (!remoteStreams.has(remoteId)) {
      remoteStreams.set(remoteId, new Map());
    }

    remoteStreams.get(remoteId).set(stream.id, stream);

    renderRemoteStreams(remoteId);

    showReconnectBadge(remoteId, false);

    const info = remoteMediaInfo.get(remoteId);
    const isCamera = Boolean(info && info.cameraStreamId === stream.id);

    if (event.track.kind === 'video' && !isCamera && !sharingAnnounced.has(remoteId)) {
      sharingAnnounced.add(remoteId);
      playShareSound();
    }

    event.track.addEventListener('ended', () => {
      const streams = remoteStreams.get(remoteId);

      // Só descarta a stream quando ela não tem mais vídeo vivo —
      // uma stream de tela com áudio + vídeo dispara 'ended' duas vezes.
      if (streams) {
        const stored = streams.get(stream.id);

        if (stored && !stored.getVideoTracks().some((track) => track.readyState === 'live')) {
          streams.delete(stream.id);
        }
      }

      if (event.track.kind === 'video' && !isCamera) {
        sharingAnnounced.delete(remoteId);
      }

      renderRemoteStreams(remoteId);
    });
  };

  // Estado da conexão.
  pc.onconnectionstatechange = () => {
    console.log('[WebRTC]', remoteName, 'connection:', pc.connectionState);

    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      showReconnectBadge(remoteId, true);
    }

    if (pc.connectionState === 'connected') {
      showReconnectBadge(remoteId, false);
    }

    if (pc.connectionState === 'failed') {
      console.error('[WebRTC] Conexão falhou:', remoteName);
      pc.restartIce();
    }

    if (pc.connectionState === 'closed') {
      removePeer(remoteId);
    }
  };

  // Negotiation needed — único lugar que cria offers. Evita a
  // corrida entre oferta manual e automática.
  pc.onnegotiationneeded = async () => {
    const state = negotiationState.get(remoteId);

    if (!state) {
      return;
    }

    try {
      state.makingOffer = true;

      await pc.setLocalDescription();

      socket.emit('signal', {
        to: remoteId,
        data: { description: pc.localDescription }
      });
    } catch (error) {
      console.error('[WebRTC] negotiationneeded:', error);
    } finally {
      state.makingOffer = false;
    }
  };

  return pc;
}

// ======================================================
// SIGNAL (padrão "Perfect Negotiation")
// ======================================================

socket.on('signal', async ({ from, data }) => {
  let pc = peers.get(from);

  if (!pc) {
    const user = participants.get(from);
    pc = await createPeerConnection(from, user?.name || 'Participante');
  }

  const state = negotiationState.get(from);

  if (!state) {
    return;
  }

  try {
    if (data.description) {
      const description = data.description;

      const offerCollision =
        description.type === 'offer' && (state.makingOffer || pc.signalingState !== 'stable');

      // Só o lado "impolite" ignora a offer em caso de colisão;
      // o lado "polite" sempre aceita e responde.
      state.ignoreOffer = !state.polite && offerCollision;

      if (state.ignoreOffer) {
        console.log('[WebRTC] Offer ignorada (colisão):', from);
        return;
      }

      await pc.setRemoteDescription(description);

      if (description.type === 'offer') {
        await pc.setLocalDescription();

        socket.emit('signal', {
          to: from,
          data: { description: pc.localDescription }
        });
      }
    } else if (data.candidate) {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (error) {
        if (!state.ignoreOffer) {
          console.warn('[WebRTC] ICE error:', error);
        }
      }
    }
  } catch (error) {
    console.error('[WebRTC] Erro no signal:', error);
  }
});

// ======================================================
// COMPARTILHAR TELA
// ======================================================

export async function startSharing() {
  // Já compartilhando.
  if (localStream) {
    return;
  }

  if (!navigator.mediaDevices?.getDisplayMedia) {
    setStatus(
      'Compartilhamento de tela não é suportado neste navegador/dispositivo (ex: celulares não suportam). Use um computador.'
    );
    return;
  }

  try {
    console.log('[Screen] Solicitando captura de tela...');

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    setLocalStream(stream);

    localVideo.srcObject = stream;
    localEmpty.style.display = 'none';

    updateCamLayout('local', Boolean(cameraStream));

    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    if (!videoTrack) {
      throw new Error('Nenhuma track de vídeo foi criada.');
    }

    videoTrack.addEventListener('ended', stopSharing);

    // Enviar para todos.
    for (const [id, pc] of peers) {
      console.log('[Screen] Enviando tela para:', id);

      const existingVideoSender = videoSenders.get(id);

      if (existingVideoSender) {
        await existingVideoSender.replaceTrack(videoTrack);
      } else {
        const sender = pc.addTrack(videoTrack, stream);
        videoSenders.set(id, sender);
      }

      if (audioTrack) {
        const existingAudioSender = audioSenders.get(id);

        if (existingAudioSender) {
          await existingAudioSender.replaceTrack(audioTrack);
        } else {
          const sender = pc.addTrack(audioTrack, stream);
          audioSenders.set(id, sender);
        }
      }
    }

    shareBtn.disabled = true;
    stopBtn.disabled = false;

    setStatus(
      audioTrack
        ? 'Sua tela está sendo compartilhada (com áudio).'
        : 'Sua tela está sendo compartilhada (sem áudio — o navegador ou a seleção não incluiu áudio).'
    );
  } catch (error) {
    console.error('[Screen] Erro:', error);

    setStatus('Não foi possível compartilhar a tela.');

    shareBtn.disabled = false;
  }
}

// ======================================================
// PARAR COMPARTILHAMENTO
// ======================================================

export async function stopSharing() {
  if (!localStream) {
    return;
  }

  const stream = localStream;
  setLocalStream(null);

  for (const sender of videoSenders.values()) {
    if (sender.track) {
      await sender.replaceTrack(null);
    }
  }

  for (const sender of audioSenders.values()) {
    if (sender.track) {
      await sender.replaceTrack(null);
    }
  }

  stream.getTracks().forEach((track) => track.stop());

  localVideo.srcObject = null;
  localEmpty.style.display = 'flex';

  updateCamLayout('local', Boolean(cameraStream));

  shareBtn.disabled = false;
  stopBtn.disabled = true;

  setStatus('Você parou de compartilhar sua tela.');
}

// ======================================================
// WEBCAM
//
// A câmera vai em uma track separada da tela: quem recebe
// mostra a tela no box e a webcam em uma miniatura no canto
// (ou no box inteiro, se a pessoa não estiver com a tela).
// ======================================================

function setCamButtonState(on) {
  camBtn.classList.toggle('active', on);
  camBtn.textContent = on ? '📷 Desligar câmera' : '📷 Ligar câmera';
}

export async function startCamera() {
  if (cameraStream) {
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus('Este navegador não permite acessar a câmera.');
    return;
  }

  camBtn.disabled = true;

  try {
    console.log('[Camera] Solicitando webcam...');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    const camTrack = stream.getVideoTracks()[0];

    if (!camTrack) {
      throw new Error('Nenhuma track de vídeo da câmera.');
    }

    setCameraStream(stream);

    // Troca a track dentro do envelope, preservando o id do stream.
    cameraOutStream.getVideoTracks().forEach((track) => cameraOutStream.removeTrack(track));
    cameraOutStream.addTrack(camTrack);

    localCamVideo.srcObject = cameraOutStream;
    localCamVideo.play().catch(() => {});

    updateCamLayout('local', true);

    // Câmera desligada pelo sistema/navegador (privacidade, USB, etc).
    camTrack.addEventListener('ended', () => {
      stopCamera();
    });

    for (const [id, pc] of peers) {
      const existing = cameraSenders.get(id);

      if (existing) {
        await existing.replaceTrack(camTrack);
      } else {
        const sender = pc.addTrack(camTrack, cameraOutStream);
        cameraSenders.set(id, sender);
      }
    }

    sendMediaInfo();

    setCamButtonState(true);
    setStatus('Sua câmera está ligada.');
  } catch (error) {
    console.error('[Camera] Erro:', error);

    setStatus('Não foi possível acessar a câmera. Verifique a permissão do navegador.');
  } finally {
    camBtn.disabled = false;
  }
}

export async function stopCamera() {
  if (!cameraStream) {
    return;
  }

  const stream = cameraStream;
  setCameraStream(null);

  // replaceTrack(null) mantém o transceiver de pé, então ligar a
  // câmera de novo não força uma renegociação do zero.
  for (const sender of cameraSenders.values()) {
    if (sender.track) {
      await sender.replaceTrack(null);
    }
  }

  cameraOutStream.getVideoTracks().forEach((track) => cameraOutStream.removeTrack(track));
  stream.getTracks().forEach((track) => track.stop());

  localCamVideo.srcObject = null;

  updateCamLayout('local', false);

  sendMediaInfo();

  setCamButtonState(false);
  setStatus('Sua câmera foi desligada.');
}

export function toggleCamera() {
  return cameraStream ? stopCamera() : startCamera();
}

shareBtn.addEventListener('click', startSharing);
stopBtn.addEventListener('click', stopSharing);
camBtn.addEventListener('click', toggleCamera);

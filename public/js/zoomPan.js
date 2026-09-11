import { localVideo } from './dom.js';
import { zoomState } from './state.js';
import { setupResizableBox } from './resizeBox.js';
import { setupDraggableBox } from './reorderBox.js';

// ======================================================
// ZOOM / PAN / TELA CHEIA / PICTURE-IN-PICTURE
// ======================================================

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function getZoomState(id) {
  if (!zoomState.has(id)) {
    zoomState.set(id, { zoom: 1, panX: 0, panY: 0 });
  }

  return zoomState.get(id);
}

export function getVideoEl(id) {
  return id === 'local' ? localVideo : document.querySelector(`video[data-peer-id="${id}"]`);
}

function getBoxEl(id) {
  return document.querySelector(`.video-box[data-peer-id="${id}"]`);
}

function clampPan(id) {
  const state = getZoomState(id);
  const box = getBoxEl(id);

  if (!box) {
    return;
  }

  if (state.zoom <= 1) {
    state.panX = 0;
    state.panY = 0;
    return;
  }

  const rect = box.getBoundingClientRect();

  // Limite aproximado de deslocamento para o conteúdo ampliado
  // não "sair" totalmente da área visível.
  const maxPanX = (rect.width * (state.zoom - 1)) / (2 * state.zoom);
  const maxPanY = (rect.height * (state.zoom - 1)) / (2 * state.zoom);

  state.panX = Math.max(-maxPanX, Math.min(maxPanX, state.panX));
  state.panY = Math.max(-maxPanY, Math.min(maxPanY, state.panY));
}

function applyZoom(id) {
  const state = getZoomState(id);
  const video = getVideoEl(id);

  if (!video) {
    return;
  }

  video.style.transformOrigin = 'center center';
  video.style.transform = `scale(${state.zoom}) translate(${state.panX}px, ${state.panY}px)`;
  video.style.cursor = state.zoom > 1 ? 'grab' : 'default';

  const label = document.querySelector(`.zoom-level[data-peer-id="${id}"]`);

  if (label) {
    label.textContent = `${Math.round(state.zoom * 100)}%`;
  }
}

function zoomIn(id) {
  const state = getZoomState(id);

  state.zoom = Math.min(MAX_ZOOM, Math.round((state.zoom + ZOOM_STEP) * 100) / 100);

  clampPan(id);
  applyZoom(id);
}

function zoomOut(id) {
  const state = getZoomState(id);

  state.zoom = Math.max(MIN_ZOOM, Math.round((state.zoom - ZOOM_STEP) * 100) / 100);

  clampPan(id);
  applyZoom(id);
}

function resetZoom(id) {
  const state = getZoomState(id);

  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;

  applyZoom(id);
}

function toggleFullscreen(box) {
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

  if (!isFullscreen) {
    if (box.requestFullscreen) {
      box.requestFullscreen();
    } else if (box.webkitRequestFullscreen) {
      box.webkitRequestFullscreen();
    }
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

async function togglePictureInPicture(id) {
  const video = getVideoEl(id);

  if (!video || !document.pictureInPictureEnabled) {
    return;
  }

  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  } catch (error) {
    console.error('[PiP] Erro:', error);
  }
}

/** Liga zoom, pan, tela cheia e PiP a um .video-box recém-criado. */
export function setupVideoBoxControls(box, id) {
  setupResizableBox(box);
  setupDraggableBox(box);

  const zoomOutBtn = box.querySelector('.zoom-out-btn');
  const zoomInBtn = box.querySelector('.zoom-in-btn');
  const zoomResetBtn = box.querySelector('.zoom-reset-btn');
  const fullscreenBtn = box.querySelector('.fullscreen-btn');
  const pipBtn = box.querySelector('.pip-btn');
  const volumeBtn = box.querySelector('.volume-btn');
  const volumeSlider = box.querySelector('.volume-slider');
  const video = getVideoEl(id);

  // ==================================================
  // VOLUME (por transmissão)
  // ==================================================

  if (volumeBtn && volumeSlider && video) {

    // Guarda o volume anterior pra restaurar ao tirar do mudo.
    let lastVolume = video.volume || 1;

    const syncVolumeUI = () => {
      const percent = video.muted ? 0 : Math.round(video.volume * 100);

      volumeSlider.value = percent;
      volumeBtn.textContent = percent === 0 ? '🔇' : '🔊';
    };

    volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();

      const value = Number(volumeSlider.value) / 100;

      video.volume = value;
      video.muted = value === 0;

      if (value > 0) {
        lastVolume = value;
      }

      syncVolumeUI();
    });

    volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      video.muted = !video.muted;

      if (!video.muted) {
        video.volume = lastVolume > 0 ? lastVolume : 1;
      }

      syncVolumeUI();
    });

    syncVolumeUI();

    volumeSlider.addEventListener('mousedown', (e) => e.stopPropagation());
    volumeSlider.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  }


  if (pipBtn) {
    if (!document.pictureInPictureEnabled) {
      pipBtn.style.display = 'none';
    } else {
      pipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePictureInPicture(id);
      });
    }
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomOut(id);
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomIn(id);
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetZoom(id);
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen(box);
    });
  }

  // Zoom com scroll do mouse.
  box.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();

      if (e.deltaY < 0) {
        zoomIn(id);
      } else {
        zoomOut(id);
      }
    },
    { passive: false }
  );

  // Pan (arrastar) com mouse / toque.
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;

  const onPointerDown = (clientX, clientY) => {
    const state = getZoomState(id);

    if (state.zoom <= 1) {
      return;
    }

    dragging = true;
    startX = clientX;
    startY = clientY;
    startPanX = state.panX;
    startPanY = state.panY;

    if (video) {
      video.style.cursor = 'grabbing';
    }
  };

  const onPointerMove = (clientX, clientY) => {
    if (!dragging) {
      return;
    }

    const state = getZoomState(id);

    state.panX = startPanX + (clientX - startX) / state.zoom;
    state.panY = startPanY + (clientY - startY) / state.zoom;

    clampPan(id);
    applyZoom(id);
  };

  const onPointerUp = () => {
    dragging = false;

    if (video) {
      video.style.cursor = 'grab';
    }
  };

  box.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onPointerUp);

  box.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) {
        return;
      }
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  box.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length !== 1) {
        return;
      }
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  box.addEventListener('touchend', onPointerUp);

  // Duplo clique reseta o zoom.
  box.addEventListener('dblclick', () => resetZoom(id));
}

document.addEventListener('DOMContentLoaded', () => {
  const localBox = document.querySelector('.video-box[data-peer-id="local"]');

  if (localBox) {
    setupVideoBoxControls(localBox, 'local');
  }
});

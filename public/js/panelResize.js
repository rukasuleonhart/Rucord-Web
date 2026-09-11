// ======================================================
// REDIMENSIONAR PAINÉIS LATERAIS (ex: chat)
//
// O painel ganha uma alça no canto inferior esquerdo.
// Arrastar para a esquerda aumenta a largura; arrastar
// para baixo aumenta a altura. Duplo clique volta ao
// tamanho padrão.
// ======================================================

const MIN_WIDTH = 260;
const MAX_WIDTH = 640;
const MIN_HEIGHT = 280;
const MAX_HEIGHT = 900;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Liga a alça de redimensionar de um painel (ex: #chatPanel). */
export function setupResizablePanel(panel) {
  const handle = panel.querySelector('.panel-resize-handle');

  if (!handle || handle.dataset.resizeReady) {
    return;
  }

  handle.dataset.resizeReady = 'true';

  let resizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  const applySize = (clientX, clientY) => {
    const width = clamp(startWidth + (startX - clientX), MIN_WIDTH, MAX_WIDTH);
    const height = clamp(startHeight + (clientY - startY), MIN_HEIGHT, MAX_HEIGHT);

    panel.style.width = `${width}px`;
    panel.style.height = `${height}px`;
  };

  const beginResize = (clientX, clientY) => {
    resizing = true;
    startX = clientX;
    startY = clientY;

    const rect = panel.getBoundingClientRect();

    startWidth = rect.width;
    startHeight = rect.height;

    panel.classList.add('resizing');
  };

  const endResize = () => {
    if (!resizing) {
      return;
    }

    resizing = false;
    panel.classList.remove('resizing');
  };

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    beginResize(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (!resizing) {
      return;
    }

    applySize(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', endResize);

  handle.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) {
        return;
      }

      e.stopPropagation();

      beginResize(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (!resizing || e.touches.length !== 1) {
        return;
      }

      applySize(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  window.addEventListener('touchend', endResize);

  handle.addEventListener('dblclick', (e) => {
    e.stopPropagation();

    panel.style.width = '';
    panel.style.height = '';
  });
}

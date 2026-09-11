// ======================================================
// REDIMENSIONAR CAIXAS DE VÍDEO
//
// Cada .video-box ganha uma alça no canto inferior direito
// (.resize-handle). Arrastando essa alça, o usuário define
// uma largura/altura própria para aquela caixa, independente
// das demais — como o layout agora é flex-wrap (não grid),
// cada caixa pode ter um tamanho totalmente diferente das
// outras sem "brigar" pelo espaço da mesma coluna/linha.
// ======================================================

const MIN_WIDTH = 220;
const MIN_HEIGHT = 140;
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Liga a alça de redimensionar de um .video-box recém-criado. */
export function setupResizableBox(box) {
  const handle = box.querySelector('.resize-handle');

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
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    const width = clamp(startWidth + deltaX, MIN_WIDTH, MAX_WIDTH);
    const height = clamp(startHeight + deltaY, MIN_HEIGHT, MAX_HEIGHT);

    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
    box.classList.add('resized');
  };

  const beginResize = (clientX, clientY) => {
    resizing = true;
    startX = clientX;
    startY = clientY;

    const rect = box.getBoundingClientRect();

    startWidth = rect.width;
    startHeight = rect.height;

    box.classList.add('resizing');
  };

  const endResize = () => {
    if (!resizing) {
      return;
    }

    resizing = false;
    box.classList.remove('resizing');
  };

  // -------------------- Mouse --------------------

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

  // -------------------- Toque --------------------

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

  // Duplo clique na alça: volta a ocupar o espaço padrão (flexível).
  handle.addEventListener('dblclick', (e) => {
    e.stopPropagation();

    box.style.width = '';
    box.style.height = '';
    box.classList.remove('resized');
  });
}

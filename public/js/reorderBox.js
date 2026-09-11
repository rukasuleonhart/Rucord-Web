// ======================================================
// REORDENAR CAIXAS DE VÍDEO (arrastar pela etiqueta)
//
// O usuário arrasta a etiqueta (.video-label, com o ícone
// ⠿) de uma caixa e solta sobre outra — a caixa arrastada
// troca de posição no layout (flex-wrap), ficando antes ou
// depois da caixa alvo conforme o lado em que foi solta.
// ======================================================

/** Liga o arraste-para-reordenar de um .video-box recém-criado. */
export function setupDraggableBox(box) {
  const handle = box.querySelector('.video-label');

  if (!handle || handle.dataset.dragReady) {
    return;
  }

  handle.dataset.dragReady = 'true';

  let dragging = false;

  const moveOver = (clientX, clientY) => {
    if (!dragging) {
      return;
    }

    const container = box.parentElement;

    if (!container) {
      return;
    }

    const elUnder = document.elementFromPoint(clientX, clientY);
    const target = elUnder ? elUnder.closest('.video-box') : null;

    if (!target || target === box || target.parentElement !== container) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const insertAfter = clientX > rect.left + rect.width / 2;

    if (insertAfter) {
      container.insertBefore(box, target.nextSibling);
    } else {
      container.insertBefore(box, target);
    }
  };

  const beginDrag = () => {
    dragging = true;
    box.classList.add('dragging');
  };

  const endDrag = () => {
    if (!dragging) {
      return;
    }

    dragging = false;
    box.classList.remove('dragging');
  };

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    beginDrag();
  });

  window.addEventListener('mousemove', (e) => moveOver(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  handle.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) {
        return;
      }

      e.stopPropagation();

      beginDrag();
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (!dragging || e.touches.length !== 1) {
        return;
      }

      moveOver(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  window.addEventListener('touchend', endDrag);
}

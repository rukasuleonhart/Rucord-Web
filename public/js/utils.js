// ======================================================
// UTILS
// ======================================================

/** Escapa texto para uso seguro dentro de innerHTML. */
export function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

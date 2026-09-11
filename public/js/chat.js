import { chatToggleBtn, chatCloseBtn, chatPanel, chatMessages, chatForm, chatInput, chatUnread } from './dom.js';
import { socket } from './socketClient.js';
import { chatOpen, setChatOpen, unreadCount, setUnreadCount } from './state.js';
import { escapeHtml } from './utils.js';
import { playChatSound } from './sounds.js';
import { setupResizablePanel } from './panelResize.js';

// ======================================================
// CHAT
// ======================================================

setupResizablePanel(chatPanel);

export function toggleChat(open) {
  setChatOpen(typeof open === 'boolean' ? open : !chatOpen);

  chatPanel.classList.toggle('open', chatOpen);

  if (chatOpen) {
    setUnreadCount(0);
    updateChatUnreadBadge();

    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.focus();
  }
}

function updateChatUnreadBadge() {
  chatUnread.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
  chatUnread.classList.toggle('show', unreadCount > 0);
}

export function clearChat() {
  chatMessages.innerHTML = `
    <div class="chat-empty">
      Nenhuma mensagem ainda.
    </div>
  `;

  setUnreadCount(0);
  updateChatUnreadBadge();

  toggleChat(false);
}

function appendChatMessage({ id, name, text, time }) {
  const empty = chatMessages.querySelector('.chat-empty');

  if (empty) {
    empty.remove();
  }

  const isOwn = id === socket.id;

  const div = document.createElement('div');

  div.className = 'chat-message' + (isOwn ? ' chat-message-own' : '');

  div.innerHTML = `
    <div class="chat-message-meta">
      <span class="chat-message-name">
        ${escapeHtml(isOwn ? 'Você' : name)}
      </span>
      <span class="chat-message-time">
        ${escapeHtml(time)}
      </span>
    </div>
    <div class="chat-message-text">
      ${escapeHtml(text)}
    </div>
  `;

  chatMessages.appendChild(div);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatToggleBtn.addEventListener('click', () => toggleChat());
chatCloseBtn.addEventListener('click', () => toggleChat(false));

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = chatInput.value.trim();

  if (!text) {
    return;
  }

  socket.emit('chat-message', { text });

  chatInput.value = '';
});

socket.on('chat-message', (msg) => {
  appendChatMessage(msg);

  const isOwn = msg.id === socket.id;

  if (!isOwn) {
    playChatSound();

    if (!chatOpen) {
      setUnreadCount(unreadCount + 1);
      updateChatUnreadBadge();
    }
  }
});

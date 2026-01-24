let messagesStore = {};

function openChat(name) {
  state.chat = name;
  document.getElementById('chatTitle').textContent = name;
  showScreen('chat');
  renderMessages();
}

function renderMessages() {
  const box = document.getElementById('messages');
  box.innerHTML = '';
  (messagesStore[state.chat] || []).forEach(m => {
    const div = document.createElement('div');
    div.className = 'message';
    div.textContent = m;
    box.appendChild(div);
  });
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) return;
  messagesStore[state.chat] = messagesStore[state.chat] || [];
  messagesStore[state.chat].push(state.username + ': ' + text);
  input.value = '';
  renderMessages();
}

function sendQuick(text) {
  messagesStore[state.chat] = messagesStore[state.chat] || [];
  messagesStore[state.chat].push(state.username + ': ' + text);
  renderMessages();
}
let messagesStore = {};

function openChat(contact) {
  state.chat = contact;
  chatTitle.textContent = contact.name;
  chatAvatar.src = contact.avatar;
  showScreen('chat');
  renderMessages();
}

function renderMessages() {
  messages.innerHTML = '';
  (messagesStore[state.chat.name] || []).forEach(m => {
    const div = document.createElement('div');
    div.className = 'message ' + m.from;
    div.textContent = m.text;
    messages.appendChild(div);
  });
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  pushMessage(text);
  messageInput.value = '';
}

function sendQuick(text) {
  pushMessage(text);
}

function pushMessage(text) {
  messagesStore[state.chat.name] ||= [];
  messagesStore[state.chat.name].push({ from: 'me', text });
  messagesStore[state.chat.name].push({ from: 'other', text: '...' });
  renderMessages();
}
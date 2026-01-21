const startScreen = document.getElementById('startScreen');
const mainScreen = document.getElementById('mainScreen');
const enterBtn = document.getElementById('enterBtn');
const nameInput = document.getElementById('nameInput');
const username = document.getElementById('username');

const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let currentChat = 'bestie';

const chats = {
  bestie: [{ text: 'Привет ✨', from: 'them' }],
  philo: [{ text: 'Что есть истина?', from: 'them' }],
  study: [{ text: 'Готов учиться 📚', from: 'them' }]
};

enterBtn.onclick = () => {
  if (!nameInput.value.trim()) return;
  username.textContent = nameInput.value;
  startScreen.classList.remove('active');
  mainScreen.classList.add('active');
  renderChat();
};

document.querySelectorAll('.chat-item').forEach(item => {
  item.onclick = () => {
    document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    currentChat = item.dataset.chat;
    renderChat();
  };
});

sendBtn.onclick = sendMessage;
messageInput.onkeydown = e => {
  if (e.key === 'Enter') sendMessage();
};

function sendMessage() {
  if (!messageInput.value.trim()) return;
  chats[currentChat].push({ text: messageInput.value, from: 'me' });
  messageInput.value = '';
  renderChat();
}

function renderChat() {
  messagesEl.innerHTML = '';
  chats[currentChat].forEach(m => {
    const div = document.createElement('div');
    div.className = 'msg ' + (m.from === 'me' ? 'me' : '');
    div.textContent = m.text;
    messagesEl.appendChild(div);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

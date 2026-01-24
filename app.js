const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');

const loginBtn = document.getElementById('loginBtn');
const nicknameInput = document.getElementById('nicknameInput');
const myName = document.getElementById('myName');

const contacts = document.querySelectorAll('.contact');
const chatHeader = document.getElementById('chatHeader');
const chatName = document.getElementById('chatName');
const chatStatus = document.getElementById('chatStatus');
const exitChat = document.getElementById('exitChat');

const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const startPanel = document.getElementById('startPanel');

let currentChat = null;

/* ВХОД */
loginBtn.onclick = () => {
  const nick = nicknameInput.value.trim();
  if (!nick) return;
  myName.textContent = nick;
  loginScreen.classList.remove('active');
  appScreen.classList.add('active');
};

/* КОНТАКТЫ */
contacts.forEach(contact => {
  contact.onclick = () => {
    currentChat = contact.dataset.name;
    chatName.textContent = currentChat;
    chatStatus.textContent = contact.dataset.status;
    chatHeader.classList.remove('hidden');
    messages.innerHTML = '';
    startPanel.classList.remove('hidden');
  };
});

/* ВЫХОД ИЗ ЧАТА */
exitChat.onclick = () => {
  chatHeader.classList.add('hidden');
  messages.innerHTML = '';
  currentChat = null;
};

/* ОТПРАВКА */
sendBtn.onclick = sendMessage;
messageInput.onkeydown = e => {
  if (e.key === 'Enter') sendMessage();
};

function sendMessage() {
  if (!currentChat) return;
  const text = messageInput.value.trim();
  if (!text) return;

  startPanel.classList.add('hidden');

  const msg = document.createElement('div');
  msg.className = 'message me';
  msg.textContent = text;
  messages.appendChild(msg);

  messageInput.value = '';
  messages.scrollTop = messages.scrollHeight;
}

/* ШАБЛОНЫ */
document.querySelectorAll('.template').forEach(btn => {
  btn.onclick = () => {
    messageInput.value = btn.textContent;
  };
});
// жёстко прячем модалки при старте
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('profileModal').classList.add('hidden');
  document.getElementById('settingsModal').classList.add('hidden');
});
const startScreen = document.getElementById('startScreen');
const app = document.getElementById('app');

const nameInput = document.getElementById('nameInput');
const enterBtn = document.getElementById('enterBtn');

const avatarSmall = document.getElementById('avatarSmall');
const avatarBig = document.getElementById('avatarBig');
const usernameSmall = document.getElementById('usernameSmall');

const chatList = document.getElementById('chatList');
const chat = document.getElementById('chat');
const chatTitle = document.getElementById('chatTitle');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

const profileModal = document.getElementById('profileModal');
const settingsModal = document.getElementById('settingsModal');

const colorPicker = document.getElementById('colorPicker');

const defaultAvatar = "https://i.imgur.com/8Km9tLL.png";

let currentChat = null;

const chats = [
  { id: 1, name: "Аня", messages: [] },
  { id: 2, name: "Макс", messages: [] },
  { id: 3, name: "Bestie 💛", messages: [] }
];

enterBtn.onclick = () => {
  if (!nameInput.value) return;

  startScreen.classList.add('hidden');
  app.classList.remove('hidden');

  usernameSmall.textContent = nameInput.value;
  avatarSmall.src = defaultAvatar;
  avatarBig.src = defaultAvatar;

  renderChats();
};

function renderChats() {
  chatList.innerHTML = "";
  chats.forEach(c => {
    const div = document.createElement('div');
    div.className = 'chatItem';
    div.textContent = c.name;
    div.onclick = () => openChat(c);
    chatList.appendChild(div);
  });
}

function openChat(c) {
  currentChat = c;
  chat.classList.remove('hidden');
  chatTitle.textContent = c.name;
  renderMessages();
}

function renderMessages() {
  messages.innerHTML = "";
  currentChat.messages.forEach(m => {
    const div = document.createElement('div');
    div.className = 'message';
    div.textContent = m;
    messages.appendChild(div);
  });
}

sendBtn.onclick = () => {
  if (!messageInput.value) return;
  currentChat.messages.push(messageInput.value);
  messageInput.value = "";
  renderMessages();
};

profileBtn.onclick = () => profileModal.classList.remove('hidden');
settingsBtn.onclick = () => settingsModal.classList.remove('hidden');

function closeProfile() {
  profileModal.classList.add('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

avatarInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    avatarBig.src = reader.result;
    avatarSmall.src = reader.result;
  };
  reader.readAsDataURL(file);
};

colorPicker.oninput = e => {
  document.documentElement.style.setProperty('--accent', e.target.value);
};

function setTheme(theme) {
  document.body.className = theme === 'dark' ? 'dark' : '';
}

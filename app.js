const chatList = document.getElementById('chatList');
const chatScreen = document.getElementById('chatScreen');
const settings = document.getElementById('settings');
const inputBar = document.getElementById('inputBar');

const backBtn = document.getElementById('backBtn');
const settingsBtn = document.getElementById('settingsBtn');

const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

const topName = document.getElementById('topName');
const topStatus = document.getElementById('topStatus');
const nameInput = document.getElementById('nameInput');
const fontSelect = document.getElementById('fontSelect');

let currentScreen = 'list';

function show(screen) {
  [chatList, chatScreen, settings].forEach(s => s.classList.remove('active'));
  inputBar.classList.add('hidden');
  backBtn.classList.add('hidden');

  if (screen === 'list') {
    chatList.classList.add('active');
    topStatus.textContent = '';
  }

  if (screen === 'chat') {
    chatScreen.classList.add('active');
    inputBar.classList.remove('hidden');
    backBtn.classList.remove('hidden');
    topStatus.textContent = 'в сети';
  }

  if (screen === 'settings') {
    settings.classList.add('active');
    backBtn.classList.remove('hidden');
  }

  currentScreen = screen;
}

document.querySelectorAll('.chat-item').forEach(chat => {
  chat.onclick = () => {
    messages.innerHTML = '';
    show('chat');
  };
});

backBtn.onclick = () => show('list');
settingsBtn.onclick = () => show('settings');

sendBtn.onclick = send;
messageInput.onkeydown = e => e.key === 'Enter' && send();

function send() {
  if (!messageInput.value.trim()) return;
  const msg = document.createElement('div');
  msg.className = 'message me';
  msg.textContent = messageInput.value;
  messages.appendChild(msg);
  messageInput.value = '';
}

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.onclick = () => {
    messageInput.value = btn.textContent;
    send();
    document.getElementById('chatIntro').style.display = 'none';
  };
}); 

nameInput.oninput = () => topName.textContent = nameInput.value || 'Арсений';

fontSelect.onchange = () => {
  const map = {
    system: 'system-ui',
    serif: 'Times New Roman',
    impact: 'Impact',
    monospace: 'monospace'
  };
  document.body.style.fontFamily = map[fontSelect.value];
};

show('list');
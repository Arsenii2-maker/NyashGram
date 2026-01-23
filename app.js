const screens = {
  start: startScreen,
  list: chatList,
  chat: chatScreen,
  settings: settings
};

const chats = {};
let currentChat = null;

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');

  header.classList.toggle('hidden', name === 'start');
  inputBar.classList.toggle('hidden', name !== 'chat');
}

startBtn.onclick = () => {
  const name = startName.value.trim() || 'Пользователь';
  document.body.dataset.username = name;
  show('list');
};

document.querySelectorAll('.chat-item').forEach(chat => {
  chat.onclick = () => {
    currentChat = chat.dataset.id;

    chatName.textContent = chat.dataset.name;
    chatStatus.textContent = chat.dataset.status;

    messages.innerHTML = '';
    chatIntro.style.display = chats[currentChat]?.length ? 'none' : 'block';

    (chats[currentChat] || []).forEach(m => addMessage(m.text, m.me));
    show('chat');
  };
});

backBtn.onclick = () => show('list');
settingsBtn.onclick = () => show('settings');

sendBtn.onclick = send;
messageInput.onkeydown = e => e.key === 'Enter' && send();

function send(textFromQuick) {
  const text = textFromQuick || messageInput.value.trim();
  if (!text) return;

  if (!chats[currentChat]) chats[currentChat] = [];
  chats[currentChat].push({ text, me: true });

  addMessage(text, true);
  messageInput.value = '';
  chatIntro.style.display = 'none';
}

function addMessage(text, me) {
  const msg = document.createElement('div');
  msg.className = 'message ' + (me ? 'me' : 'other');
  msg.textContent = text;
  messages.appendChild(msg);
}

document.querySelectorAll('.quick-list button').forEach(b => {
  b.onclick = () => send(b.textContent);
});

/* SETTINGS */

fontSelect.onchange = () => {
  document.body.style.fontFamily = fontSelect.value;
};

bgType.onchange = updateBG;
bgColor.oninput = updateBG;
bgColor2.oninput = updateBG;
bgImage.onchange = updateBG;

function updateBG() {
  if (bgType.value === 'color') {
    document.body.style.background = bgColor.value;
  }
  if (bgType.value === 'gradient') {
    document.body.style.background =
      `linear-gradient(135deg, ${bgColor.value}, ${bgColor2.value})`;
  }
  if (bgType.value === 'image') {
    const file = bgImage.files[0];
    if (file) {
      document.body.style.background =
        `url(${URL.createObjectURL(file)}) center/cover`;
    }
  }
}

show('start');
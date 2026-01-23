const screens = {
  start: startScreen,
  list: chatList,
  chat: chatScreen,
  settings: settings
};

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');

  header.classList.toggle('hidden', name === 'start');
  inputBar.style.display = name === 'chat' ? 'flex' : 'none';
}

startBtn.onclick = () => {
  chatName.textContent = startName.value || 'Пользователь';
  show('list');
};

document.querySelectorAll('.chat-item').forEach(chat => {
  chat.onclick = () => {
    chatName.textContent = chat.dataset.name;
    chatStatus.textContent = chat.dataset.status;
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

fontSelect.onchange = () => {
  document.body.style.fontFamily = fontSelect.value;
};

avatarInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  chatAvatar.src = url;
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
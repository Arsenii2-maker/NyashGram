let myName = '';
let currentChat = null;
const chats = {};

const screens = {
  start: startScreen,
  list: chatList,
  chat: chatScreen,
  settings
};

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');

  header.classList.toggle('hidden', name === 'start');
  inputBar.classList.toggle('hidden', name !== 'chat');
}

startBtn.onclick = () => {
  myName = startName.value.trim() || 'Пользователь';
  show('list');
};

document.querySelectorAll('.chat-item').forEach(item => {
  item.textContent = item.dataset.name;

  item.onclick = () => {
    currentChat = item.dataset.id;

    chatTitle.textContent = item.dataset.name;
    chatStatus.textContent = item.dataset.status;

    messages.innerHTML = '';
    (chats[currentChat] || []).forEach(m => render(m));

    chatIntro.style.display = chats[currentChat]?.length ? 'none' : 'block';
    show('chat');
  };
});

sendBtn.onclick = send;
messageInput.onkeydown = e => e.key === 'Enter' && send();

function send(textFromQuick) {
  const text = textFromQuick || messageInput.value.trim();
  if (!text) return;

  chats[currentChat] ??= [];
  chats[currentChat].push({ text });

  render({ text });
  messageInput.value = '';
  chatIntro.style.display = 'none';
}

function render(msg) {
  const el = document.createElement('div');
  el.className = 'message me';
  el.textContent = msg.text;
  messages.appendChild(el);
}

document.querySelectorAll('.quick').forEach(b =>
  b.onclick = () => send(b.textContent)
);

/* SETTINGS */
fontSelect.onchange = () => {
  document.body.style.fontFamily = fontSelect.value;
};

show('start');
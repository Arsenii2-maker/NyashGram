const screens = {
  login: loginScreen,
  list: chatListScreen,
  chat: chatScreen,
  settings: settingsScreen
};

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

let currentChat = null;

const nicknameInput = nicknameInput;
const enterBtn = enterBtn;
const myName = myName;
const myAvatar = myAvatar;

enterBtn.onclick = () => {
  if (!nicknameInput.value) return;
  localStorage.setItem("nyash_name", nicknameInput.value);
  myName.textContent = nicknameInput.value;
  show("list");
};

myName.textContent = localStorage.getItem("nyash_name") || "";

document.querySelectorAll(".chat-item").forEach(item => {
  item.onclick = () => {
    currentChat = item.dataset.user;
    chatName.textContent = currentChat;
    chatAvatar.src = item.querySelector("img").src;
    chatStatus.textContent = item.querySelector(".chat-status").textContent;
    loadMessages();
    show("chat");
  };
});

backBtn.onclick = () => show("list");
settingsBtn.onclick = () => show("settings");
closeSettings.onclick = () => show("list");

const messagesBox = messages;
const input = messageInput;

sendBtn.onclick = send;
input.addEventListener("keydown", e => e.key === "Enter" && send());

function loadMessages() {
  messagesBox.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("chat_" + currentChat) || "[]");

  if (saved.length === 0) {
    messagesBox.appendChild(createHint());
  }

  saved.forEach(text => {
    const div = document.createElement("div");
    div.className = "message me";
    div.textContent = text;
    messagesBox.appendChild(div);
  });
}

function send() {
  if (!input.value || !currentChat) return;

  const key = "chat_" + currentChat;
  const saved = JSON.parse(localStorage.getItem(key) || "[]");
  saved.push(input.value);
  localStorage.setItem(key, JSON.stringify(saved));

  if (document.querySelector(".hint")) {
    document.querySelector(".hint").remove();
  }

  const div = document.createElement("div");
  div.className = "message me";
  div.textContent = input.value;
  messagesBox.appendChild(div);

  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function createHint() {
  const hint = document.createElement("div");
  hint.className = "hint";
  hint.innerHTML = `
    <p>Начни общение ✨</p>
    <button class="quick">Привет!</button>
    <button class="quick">Как ты?</button>
    <button class="quick">Что нового?</button>
    <button class="quick">Чем занимаешься?</button>
    <button class="quick">NyashGram приветствует тебя 💖</button>
  `;

  hint.querySelectorAll(".quick").forEach(b => {
    b.onclick = () => input.value = b.textContent;
  });

  return hint;
}

/* ШРИФТЫ */
fontSelect.onchange = e => {
  document.body.style.fontFamily = e.target.value;
  localStorage.setItem("nyash_font", e.target.value);
};

const savedFont = localStorage.getItem("nyash_font");
if (savedFont) {
  document.body.style.fontFamily = savedFont;
  fontSelect.value = savedFont;
}

/* ФОН */
bgColor.oninput = e => {
  document.body.style.background = e.target.value;
  localStorage.setItem("nyash_bg", e.target.value);
};

const savedBg = localStorage.getItem("nyash_bg");
if (savedBg) document.body.style.background = savedBg;

/* АВАТАР */
avatarInput.onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    myAvatar.src = reader.result;
    localStorage.setItem("nyash_avatar", reader.result);
  };
  reader.readAsDataURL(file);
};

const savedAvatar = localStorage.getItem("nyash_avatar");
if (savedAvatar) myAvatar.src = savedAvatar;
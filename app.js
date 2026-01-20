const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const settingsScreen = document.getElementById("settingsScreen");

const enterBtn = document.getElementById("enterBtn");

> ♡⊹₊⟡⋆няɯиᴋ⊹₊⟡⋆♡:
const usernameInput = document.getElementById("usernameInput");
const profileName = document.getElementById("profileName");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");

const accentColor = document.getElementById("accentColor");
const bgInput = document.getElementById("bgInput");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.getElementById("avatarImg");

const lightTheme = document.getElementById("lightTheme");
const darkTheme = document.getElementById("darkTheme");

// ===== ВХОД =====
enterBtn.onclick = () => {
  if (!usernameInput.value) return;
  profileName.textContent = usernameInput.value;
  loginScreen.classList.remove("active");
  appScreen.classList.add("active");
};

// ===== ОТПРАВКА СООБЩЕНИЙ =====
sendBtn.onclick = sendMessage;
messageInput.onkeydown = e => {
  if (e.key === "Enter") sendMessage();
};

function sendMessage() {
  if (!messageInput.value) return;
  const div = document.createElement("div");
  div.className = "message";
  div.textContent = messageInput.value;
  messages.appendChild(div);
  messageInput.value = "";
  messages.scrollTop = messages.scrollHeight;
}

// ===== НАСТРОЙКИ =====
settingsBtn.onclick = () => settingsScreen.classList.add("active");
closeSettings.onclick = () => settingsScreen.classList.remove("active");

// ===== ЦВЕТ КНОПОК =====
accentColor.oninput = () => {
  document.documentElement.style.setProperty("--accent", accentColor.value);
};

// ===== ТЕМА =====
lightTheme.onclick = () => {
  document.body.classList.remove("dark");
  document.body.classList.add("light");
};

darkTheme.onclick = () => {
  document.body.classList.remove("light");
  document.body.classList.add("dark");
};

// ===== ОБОИ =====
bgInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("chat").style.backgroundImage =
    `url(${URL.createObjectURL(file)})`;
};

// ===== АВАТАР =====
avatarInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  avatarImg.src = URL.createObjectURL(file);
};


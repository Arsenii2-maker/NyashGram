const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");

const enterBtn = document.getElementById("enterBtn");
const usernameInput = document.getElementById("usernameInput");
const profileName = document.getElementById("profileName");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

const settingsBtn = document.getElementById("settingsBtn");
const settingsScreen = document.getElementById("settingsScreen");
const closeSettings = document.getElementById("closeSettings");

const accentColor = document.getElementById("accentColor");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.getElementById("avatarImg");

const lightTheme = document.getElementById("lightTheme");
const darkTheme = document.getElementById("darkTheme");

/* ===== ВХОД (ФИКС) ===== */
function enterApp() {
  const name = usernameInput.value.trim();
  if (!name) return;

  profileName.textContent = name;
  loginScreen.classList.remove("active");
  appScreen.classList.add("active");
}

enterBtn.addEventListener("click", enterApp);
enterBtn.addEventListener("touchstart", enterApp);

/* ===== СООБЩЕНИЯ ===== */
sendBtn.onclick = () => {
  if (!messageInput.value) return;
  const msg = document.createElement("div");
  msg.className = "message";
  msg.textContent = messageInput.value;
  messages.appendChild(msg);
  messageInput.value = "";
  messages.scrollTop = messages.scrollHeight;
};

/* ===== НАСТРОЙКИ ===== */
settingsBtn.onclick = () => settingsScreen.classList.add("active");
closeSettings.onclick = () => settingsScreen.classList.remove("active");

/* ===== ЦВЕТ ===== */
accentColor.oninput = () => {
  document.documentElement.style.setProperty("--accent", accentColor.value);
};

/* ===== ТЕМА ===== */
lightTheme.onclick = () => {
  document.body.className = "light";
};

darkTheme.onclick = () => {
  document.body.className = "dark";
};

/* ===== АВАТАР ===== */
avatarInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  avatarImg.src = URL.createObjectURL(file);
};

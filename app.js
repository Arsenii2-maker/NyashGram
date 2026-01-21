const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");

const usernameInput = document.getElementById("usernameInput");
const enterBtn = document.getElementById("enterBtn");

const usernameMini = document.getElementById("usernameMini");
const avatarMini = document.getElementById("avatarMini");

const profileScreen = document.getElementById("profileScreen");
const openProfile = document.getElementById("openProfile");
const closeProfile = document.getElementById("closeProfile");

const profileNameInput = document.getElementById("profileNameInput");
const profileBioInput = document.getElementById("profileBioInput");
const avatarInput = document.getElementById("avatarInput");
const avatarBig = document.getElementById("avatarBig");
const saveProfile = document.getElementById("saveProfile");

const settingsScreen = document.getElementById("settingsScreen");
const openSettings = document.getElementById("openSettings");
const closeSettings = document.getElementById("closeSettings");

const lightTheme = document.getElementById("lightTheme");
const darkTheme = document.getElementById("darkTheme");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

/* ===== ВХОД ===== */
enterBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return;

  usernameMini.textContent = name;
  profileNameInput.value = name;

  loginScreen.classList.remove("active");
  appScreen.classList.add("active");
};

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

/* ===== ПРОФИЛЬ ===== */
openProfile.onclick = () => profileScreen.classList.add("active");
closeProfile.onclick = () => profileScreen.classList.remove("active");

saveProfile.onclick = () => {
  usernameMini.textContent = profileNameInput.value;
  profileScreen.classList.remove("active");
};

/* ===== АВАТАР ===== */
avatarInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  avatarBig.src = url;
  avatarMini.src = url;
};

/* ===== НАСТРОЙКИ ===== */
openSettings.onclick = () => settingsScreen.classList.add("active");
closeSettings.onclick = () => settingsScreen.classList.remove("active");

lightTheme.onclick = () => document.body.className = "light";
darkTheme.onclick = () => document.body.className = "dark";

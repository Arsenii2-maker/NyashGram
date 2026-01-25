// ---------- SCREENS ----------
const screens = {
  login: loginScreen,
  contacts: contactsScreen,
  chat: chatScreen,
  settings: settingsScreen
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ---------- SETTINGS ----------
const defaultSettings = {
  name: "",
  theme: "pastel-pink",
  font: "system",
  avatar: "",
  status: "online"
};

const settings = {
  ...defaultSettings,
  ...JSON.parse(localStorage.getItem("nyashSettings") || "{}")
};

function saveSettings() {
  localStorage.setItem("nyashSettings", JSON.stringify(settings));
}

function applySettings() {
  document.body.dataset.theme = settings.theme;
  document.body.className = `font-${settings.font}`;
}

applySettings();

// ---------- LOGIN ----------
loginBtn.onclick = () => {
  if (!loginInput.value.trim()) return;
  settings.name = loginInput.value.trim();
  saveSettings();
  showScreen("contacts");
  renderContacts();
};

settings.name ? showScreen("contacts") : showScreen("login");

// ---------- SETTINGS UI ----------
settingsBtn.onclick = () => {
  settingsName.value = settings.name;
  themeSelect.value = settings.theme;
  fontSelect.value = settings.font;
  statusSelect.value = settings.status;
  showScreen("settings");
};

settingsBackBtn.onclick = () => showScreen("contacts");

saveSettingsBtn.onclick = () => {
  settings.name = settingsName.value.trim();
  settings.theme = themeSelect.value;
  settings.font = fontSelect.value;
  settings.status = statusSelect.value;
  saveSettings();
  applySettings();
  renderContacts();
  showScreen("contacts");
};

// ---------- AVATAR ----------
avatarInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    settings.avatar = reader.result;
    saveSettings();
    renderContacts();
  };
  reader.readAsDataURL(file);
};

// ---------- CHAT ----------
backBtn.onclick = () => showScreen("contacts");

sendBtn.onclick = () => {
  if (!messageInput.value) return;
  sendMessage(messageInput.value);
  messageInput.value = "";
};

messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});
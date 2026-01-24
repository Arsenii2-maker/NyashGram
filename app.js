// ===== Screens =====
const startScreen = document.getElementById("startScreen");
const contactsScreen = document.getElementById("contactsScreen");
const chatScreen = document.getElementById("chatScreen");
const settingsScreen = document.getElementById("settingsScreen");

const screens = [startScreen, contactsScreen, chatScreen, settingsScreen];

// ===== Elements =====
const nicknameInput = document.getElementById("nicknameInput");
const enterBtn = document.getElementById("enterBtn");
const myNameEl = document.getElementById("myName");
const contactsList = document.getElementById("contactsList");

const chatUserInfo = document.getElementById("chatUserInfo");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const quickPanel = document.getElementById("quickPanel");

const backBtn = document.getElementById("backBtn");
const openSettings = document.getElementById("openSettings");
const closeSettings = document.getElementById("closeSettings");

const fontSelect = document.getElementById("fontSelect");
const themeSelect = document.getElementById("themeSelect");

// ===== State =====
let myName = "";
let currentChatId = null;

// ===== Helpers =====
function showScreen(screen) {
  screens.forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

// ===== START =====
enterBtn.addEventListener("click", () => {
  myName = nicknameInput.value.trim() || "Nyash 💗";
  myNameEl.textContent = myName;
  showScreen(contactsScreen);
  renderContacts();
});

// ===== CONTACTS =====
function renderContacts() {
  contactsList.innerHTML = "";
  window.contacts.forEach(contact => {
    const div = document.createElement("div");
    div.className = "contact";
    div.textContent = `${contact.name} • ${contact.status}`;
    div.addEventListener("click", () => openChat(contact));
    contactsList.appendChild(div);
  });
}

// ===== CHAT =====
function openChat(contact) {
  currentChatId = contact.id;
  chatUserInfo.textContent = `${contact.name} (${contact.status})`;
  quickPanel.style.display = "flex";
  renderMessages();
  showScreen(chatScreen);
}

function renderMessages() {
  messages.innerHTML = "";
  window.chats[currentChatId].forEach(msg => {
    const div = document.createElement("div");
    div.className = `msg ${msg.fromMe ? "me" : "other"}`;
    div.textContent = msg.text;
    messages.appendChild(div);
  });
  messages.scrollTop = messages.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  sendMessage(currentChatId, text, true);
  messageInput.value = "";
  quickPanel.style.display = "none";
  renderMessages();
});

document.querySelectorAll(".quick").forEach(btn => {
  btn.addEventListener("click", () => {
    sendMessage(currentChatId, btn.textContent, true);
    quickPanel.style.display = "none";
    renderMessages();
  });
});

// ===== NAV =====
backBtn.addEventListener("click", () => {
  showScreen(contactsScreen);
});

openSettings.addEventListener("click", () => {
  showScreen(settingsScreen);
});

closeSettings.addEventListener("click", () => {
  showScreen(contactsScreen);
});

// ===== SETTINGS =====
fontSelect.addEventListener("change", e => {
  document.body.style.fontFamily = e.target.value;
});

themeSelect.addEventListener("change", e => {
  const t = e.target.value;
  const root = document.documentElement;

  if (t === "cozy") root.style.setProperty("--bg", "#ffe9f2");
  if (t === "mint") root.style.setProperty("--bg", "#eafff3");
  if (t === "cyber") root.style.setProperty("--bg", "#0f0f1a");
  if (t === "loft") root.style.setProperty("--bg", "#f1f1f1");
  if (t === "night") root.style.setProperty("--bg", "#101018");
  if (t === "lofi") root.style.setProperty("--bg", "#f7f2ff");
});
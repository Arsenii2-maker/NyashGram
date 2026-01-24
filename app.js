const screens = {
  start: startScreen,
  contacts: contactsScreen,
  chat: chatScreen,
  settings: settingsScreen
};

let currentChat = null;
let myName = "";

function show(screen) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

enterBtn.onclick = () => {
  myName = nicknameInput.value || "Nyash 💗";
  myNameSpan();
  show(contactsScreen);
  renderContacts();
};

function myNameSpan() {
  myName && (myNameEl = document.getElementById("myName")).textContent = myName;
}

function renderContacts() {
  contactsList.innerHTML = "";
  contacts.forEach(c => {
    const div = document.createElement("div");
    div.className = "contact";
    div.textContent = `${c.name} • ${c.status}`;
    div.onclick = () => openChat(c);
    contactsList.appendChild(div);
  });
}

function openChat(contact) {
  currentChat = contact.id;
  chatUserInfo.textContent = `${contact.name} (${contact.status})`;
  renderMessages();
  show(chatScreen);
}

function renderMessages() {
  messages.innerHTML = "";
  chats[currentChat].forEach(m => {
    const div = document.createElement("div");
    div.className = `msg ${m.fromMe ? "me" : "other"}`;
    div.textContent = m.text;
    messages.appendChild(div);
  });
}

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;
  sendMessage(currentChat, text, true);
  messageInput.value = "";
  quickPanel.style.display = "none";
  renderMessages();
};

document.querySelectorAll(".quick").forEach(b => {
  b.onclick = () => {
    sendMessage(currentChat, b.textContent, true);
    quickPanel.style.display = "none";
    renderMessages();
  };
});

backBtn.onclick = () => show(contactsScreen);

openSettings.onclick = () => show(settingsScreen);
closeSettings.onclick = () => show(contactsScreen);

fontSelect.onchange = e => {
  document.body.style.fontFamily = e.target.value;
};

themeSelect.onchange = e => {
  const t = e.target.value;
  if (t === "mint") document.documentElement.style.setProperty("--bg", "#eafff3");
  if (t === "cyber") document.documentElement.style.setProperty("--bg", "#0f0f1a");
  if (t === "loft") document.documentElement.style.setProperty("--bg", "#f1f1f1");
  if (t === "night") document.documentElement.style.setProperty("--bg", "#101018");
  if (t === "lofi") document.documentElement.style.setProperty("--bg", "#f7f2ff");
};
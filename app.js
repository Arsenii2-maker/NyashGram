const screens = {
  list: chatList,
  chat: chatScreen,
  settings,
  profile
};

function show(screen) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

openSettings.onclick = () => show(settings);
function closeSettings() { show(chatList); }

function openChat(name) {
  chatUserName.textContent = name;
  show(chatScreen);
}

function closeChat() {
  show(chatList);
}

function openProfile() {
  profileName.textContent = chatUserName.textContent;
  show(profile);
}

function closeProfile() {
  show(chatScreen);
}

function quickMsg(text) {
  messageInput.value = text;
}

function sendMessage() {
  if (!messageInput.value) return;
  const div = document.createElement("div");
  div.textContent = messageInput.value;
  messages.appendChild(div);
  messageInput.value = "";
}

function saveSettings() {
  myName.textContent = nameInput.value || "Я";
  document.documentElement.style.setProperty("--font", fontSelect.value);
  document.documentElement.style.setProperty("--btn", buttonColor.value);
  closeSettings();
}
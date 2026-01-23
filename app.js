const chatList = document.getElementById("chatList");
const chatScreen = document.getElementById("chatScreen");
const messages = document.getElementById("messages");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");

const settings = document.getElementById("settings");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");
const saveSettings = document.getElementById("saveSettings");

const myName = document.getElementById("myName");
const myAvatar = document.getElementById("myAvatar");
const nameInput = document.getElementById("nameInput");
const avatarInput = document.getElementById("avatarInput");

document.querySelectorAll(".chat-item").forEach(chat => {
  chat.addEventListener("click", () => {
    chatList.classList.remove("active");
    chatScreen.classList.add("active");
    messages.innerHTML = "";
  });
});

sendBtn.addEventListener("click", () => {
  if (!messageInput.value.trim()) return;

  const div = document.createElement("div");
  div.className = "message";
  div.textContent = messageInput.value;

  messages.appendChild(div);
  messageInput.value = "";
  messages.scrollTop = messages.scrollHeight;
});

settingsBtn.addEventListener("click", () => {
  settings.style.display = "flex";
  nameInput.value = myName.textContent;
});

closeSettings.addEventListener("click", () => {
  settings.style.display = "none";
});

saveSettings.addEventListener("click", () => {
  myName.textContent = nameInput.value || "User";

  if (avatarInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => myAvatar.src = e.target.result;
    reader.readAsDataURL(avatarInput.files[0]);
  }

  settings.style.display = "none";
});
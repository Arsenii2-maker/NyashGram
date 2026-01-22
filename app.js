const chatListScreen = document.getElementById("chatListScreen");
const chatScreen = document.getElementById("chatScreen");
const settingsScreen = document.getElementById("settingsScreen");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const chatTitle = document.getElementById("chatTitle");

document.querySelectorAll(".chat-item").forEach(chat => {
  chat.onclick = () => {
    chatTitle.textContent = chat.textContent;
    chatListScreen.classList.remove("active");
    chatScreen.classList.add("active");
  };
});

document.getElementById("backToChats").onclick = () => {
  chatScreen.classList.remove("active");
  chatListScreen.classList.add("active");
};

document.getElementById("sendBtn").onclick = () => {
  if (!messageInput.value) return;
  const msg = document.createElement("div");
  msg.className = "message me";
  msg.textContent = messageInput.value;
  messages.appendChild(msg);
  messageInput.value = "";
  messages.scrollTop = messages.scrollHeight;
};

document.getElementById("openSettings").onclick = () => {
  chatListScreen.classList.remove("active");
  settingsScreen.classList.add("active");
};

document.getElementById("closeSettings").onclick = () => {
  settingsScreen.classList.remove("active");
  chatListScreen.classList.add("active");
};

document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
};

document.getElementById("accentColor").oninput = e => {
  document.documentElement.style.setProperty("--accent", e.target.value);
};

document.getElementById("fontPicker").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const font = new FontFace("UserFont", reader.result);
    font.load().then(f => {
      document.fonts.add(f);
      document.body.style.fontFamily = "UserFont";
    });
  };
  reader.readAsArrayBuffer(file);
};

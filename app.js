const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");

const loginBtn = document.getElementById("loginBtn");
const backBtn = document.getElementById("backBtn");
const sendBtn = document.getElementById("sendBtn");

const usernameInput = document.getElementById("usernameInput");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

let username = "";

// LOGIN
loginBtn.onclick = () => {
  if (!usernameInput.value.trim()) return;
  username = usernameInput.value.trim();
  loginScreen.classList.remove("active");
  chatScreen.classList.add("active");
};

// BACK
backBtn.onclick = () => {
  chatScreen.classList.remove("active");
  loginScreen.classList.add("active");
};

// SEND MESSAGE
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  addMessage(text, "me");
  messageInput.value = "";

  // fake reply
  setTimeout(() => {
    addMessage("Я в сети 💬", "other");
  }, 600);
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
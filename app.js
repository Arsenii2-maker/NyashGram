const loginScreen = document.getElementById("loginScreen");
const contactsScreen = document.getElementById("contactsScreen");
const chatScreen = document.getElementById("chatScreen");

function showScreen(name) {
  [loginScreen, contactsScreen, chatScreen].forEach(s => s.classList.remove("active"));
  if (name === "login") loginScreen.classList.add("active");
  if (name === "contacts") contactsScreen.classList.add("active");
  if (name === "chat") chatScreen.classList.add("active");
}

const loginBtn = document.getElementById("loginBtn");
loginBtn.onclick = () => {
  const nick = document.getElementById("loginInput").value.trim();
  if (!nick) return;
  localStorage.setItem("nyashNick", nick);
  showScreen("contacts");
  renderContacts();
};

if (localStorage.getItem("nyashNick")) {
  showScreen("contacts");
  renderContacts();
}

document.getElementById("backBtn").onclick = () => showScreen("contacts");

document.getElementById("sendBtn").onclick = () => {
  const input = document.getElementById("messageInput");
  sendMessage(input.value);
  input.value = "";
};

document.getElementById("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendMessage(e.target.value);
    e.target.value = "";
  }
});

document.querySelectorAll(".intro-buttons button").forEach(btn => {
  btn.onclick = () => sendMessage(btn.textContent);
});
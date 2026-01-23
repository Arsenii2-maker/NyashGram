const screens = {
  login: document.getElementById("loginScreen"),
  list: document.getElementById("chatListScreen"),
  chat: document.getElementById("chatScreen"),
  settings: document.getElementById("settingsScreen")
};

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

const nicknameInput = document.getElementById("nicknameInput");
const enterBtn = document.getElementById("enterBtn");
const myName = document.getElementById("myName");
const myAvatar = document.getElementById("myAvatar");

enterBtn.onclick = () => {
  if (!nicknameInput.value) return;
  localStorage.setItem("name", nicknameInput.value);
  myName.textContent = nicknameInput.value;
  show("list");
};

myName.textContent = localStorage.getItem("name") || "";

document.querySelectorAll(".chat-item").forEach(item => {
  item.onclick = () => {
    document.getElementById("chatName").textContent = item.dataset.user;
    document.getElementById("chatAvatar").src = item.querySelector("img").src;
    document.getElementById("chatStatus").textContent =
      item.querySelector(".chat-status").textContent;
    show("chat");
  };
});

document.getElementById("backBtn").onclick = () => show("list");
document.getElementById("settingsBtn").onclick = () => show("settings");
document.getElementById("closeSettings").onclick = () => show("list");

const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");

document.getElementById("sendBtn").onclick = send;
input.addEventListener("keydown", e => e.key === "Enter" && send());

function send() {
  if (!input.value) return;
  const div = document.createElement("div");
  div.className = "message me";
  div.textContent = input.value;
  messages.appendChild(div);
  input.value = "";
  messages.scrollTop = messages.scrollHeight;
}

document.querySelectorAll(".quick").forEach(b => {
  b.onclick = () => {
    input.value = b.textContent;
  };
});

document.getElementById("fontSelect").onchange = e => {
  document.body.style.fontFamily = e.target.value;
};

document.getElementById("bgColor").oninput = e => {
  document.body.style.background = e.target.value;
};

document.getElementById("avatarInput").onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => myAvatar.src = reader.result;
  reader.readAsDataURL(file);
};
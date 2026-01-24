const chatHeader = document.querySelector(".chat-header");
const messagesContainer = document.querySelector(".messages");
const input = document.querySelector(".chat-input input");
const quickContainer = document.querySelector(".quick-messages");

const chats = {};

function openChat(contact) {
  activeContact = contact;

  chatHeader.textContent = contact.name;
  messagesContainer.innerHTML = "";

  if (!chats[contact.id]) {
    chats[contact.id] = [];
  }

  chats[contact.id].forEach(msg => renderMessage(msg));

  // мобильный режим: скрываем контакты
  if (document.body.dataset.device === "mobile") {
    document.querySelector(".contacts").style.display = "none";
  }
}

function sendMessage(text) {
  if (!activeContact || !text.trim()) return;

  const msg = {
    text,
    fromMe: true
  };

  chats[activeContact.id].push(msg);
  renderMessage(msg);
}

function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = "message";
  if (msg.fromMe) div.classList.add("me");

  div.textContent = msg.text;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ===== INPUT =====
input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendMessage(input.value);
    input.value = "";
  }
});

// ===== QUICK MESSAGES =====
const quickMessages = [
  "Привет!",
  "Как дела?",
  "Я занят",
  "Напишу позже",
  "Ок 👍"
];

function renderQuickMessages() {
  quickContainer.innerHTML = "";

  quickMessages.forEach(text => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = () => sendMessage(text);
    quickContainer.appendChild(btn);
  });
}

renderQuickMessages();
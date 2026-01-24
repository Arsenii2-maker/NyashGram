let currentChat = null;

function openChat(contact) {
  currentChat = contact;
  switchScreen("chat-screen");
  document.getElementById("chat-name").textContent = contact.name;
  document.getElementById("chat-avatar").src = contact.avatar;
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  if (!input.value) return;

  const msg = document.createElement("div");
  msg.className = "message";
  msg.textContent = input.value;

  document.getElementById("messages").appendChild(msg);
  input.value = "";
}
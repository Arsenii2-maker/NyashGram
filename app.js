document.addEventListener("DOMContentLoaded", () => {

  const loginScreen = document.getElementById("loginScreen");
  const contactsScreen = document.getElementById("contactsScreen");
  const chatScreen = document.getElementById("chatScreen");

  function showScreen(name) {
    [loginScreen, contactsScreen, chatScreen]
      .forEach(s => s.classList.remove("active"));

    if (name === "login") loginScreen.classList.add("active");
    if (name === "contacts") contactsScreen.classList.add("active");
    if (name === "chat") chatScreen.classList.add("active");
  }

  // ---------- LOGIN ----------
  const loginBtn = document.getElementById("loginBtn");
  const loginInput = document.getElementById("loginInput");

  loginBtn.addEventListener("click", () => {
    const nick = loginInput.value.trim();
    if (!nick) return;

    localStorage.setItem("nyashNick", nick);
    showScreen("contacts");
    renderContacts();
  });

  // ---------- AUTO LOGIN ----------
  if (localStorage.getItem("nyashNick")) {
    showScreen("contacts");
    renderContacts();
  } else {
    showScreen("login");
  }

  // ---------- BACK ----------
  document.getElementById("backBtn")
    .addEventListener("click", () => showScreen("contacts"));

  // ---------- SEND ----------
  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");

  sendBtn.addEventListener("click", () => {
    sendMessage(messageInput.value);
    messageInput.value = "";
  });

  messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      sendMessage(messageInput.value);
      messageInput.value = "";
    }
  });

  // ---------- INTRO BUTTONS ----------
  document.querySelectorAll(".intro-buttons button")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        sendMessage(btn.textContent);
      });
    });

});
const screens = {
  chats: chatListScreen,
  chat: chatScreen,
  settings: settingsScreen,
  profile: profileScreen
};

function openScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// Чаты
document.querySelectorAll(".chat-item").forEach(item => {
  item.onclick = () => {
    chatTitle.textContent = item.dataset.name;
    chatStatus.textContent = item.dataset.status;
    profilePhone.textContent = item.dataset.phone;
    profileName.textContent = item.dataset.name;
    profileStatus.textContent = item.dataset.status;
    openScreen("chat");
  };
});

backToChats.onclick = () => openScreen("chats");

// Сообщения
sendBtn.onclick = () => {
  if (!messageInput.value) return;
  const m = document.createElement("div");
  m.className = "message me";
  m.textContent = messageInput.value;
  messages.appendChild(m);
  messageInput.value = "";
  messages.scrollTop = messages.scrollHeight;
};

// Настройки
openSettings.onclick = () => openScreen("settings");
closeSettings.onclick = () => openScreen("chats");

// Профиль
openUserProfile.onclick = () => openScreen("profile");
closeProfile.onclick = () => openScreen("chat");

// Имя
nameInput.oninput = e => {
  myName.textContent = e.target.value;
};

// Аватар
avatarPicker.onchange = e => {
  const url = URL.createObjectURL(e.target.files[0]);
  myAvatar.style.backgroundImage = url(${url});
};

// Цвет кнопок
accentColor.oninput = e => {
  document.documentElement.style.setProperty("--accent", e.target.value);
};

// Тема
toggleTheme.onclick = () => {
  document.body.classList.toggle("dark");
};

// ФОН
bgType.onchange = () => {
  if (bgType.value === "solid") {
    document.body.style.background = bgColor1.value;
  }
  if (bgType.value === "gradient") {
    document.body.style.background =
      linear-gradient(160deg, ${bgColor1.value}, ${bgColor2.value});
  }
};

bgImage.onchange = e => {
  const url = URL.createObjectURL(e.target.files[0]);
  document.body.style.background = url(${url}) center/cover;
};

// ШРИФТ (исправлено)
fontPicker.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const font = new FontFace("UserFont", `url(${url})`);

  font.load().then(() => {
    document.fonts.add(font);
    document.documentElement.style.setProperty("--font", "UserFont");
  });
};

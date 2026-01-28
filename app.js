// ---------- SCREENS ----------
const screens = {
  login: document.getElementById("loginScreen"),
  contacts: document.getElementById("contactsScreen"),
  chat: document.getElementById("chatScreen"),
  settings: document.getElementById("settingsScreen")
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ---------- SETTINGS ----------
const defaultSettings = {
  name: "",
  theme: "pastel-pink",       // меняем на новую
  font: "system",
  avatar: ""
};

const settings = {
  ...defaultSettings,
  ...JSON.parse(localStorage.getItem("nyashSettings") || "{}")
};

function applySettings() {
  document.body.className = "";
  document.body.classList.add(`theme-${settings.theme}`);
  document.body.classList.add(`font-${settings.font}`);
}

applySettings();

// ---------- LOGIN ----------
const loginBtn = document.getElementById("loginBtn");
const loginInput = document.getElementById("loginInput");

loginBtn.onclick = () => {
  const nick = loginInput.value.trim();
  if (!nick) return;

  settings.name = nick;
  saveSettings();
  showScreen("contacts");
  renderContacts();
};

if (settings.name) {
  showScreen("contacts");
  renderContacts();
} else {
  showScreen("login");
}

// ---------- SETTINGS UI ----------
document.getElementById("settingsBtn").onclick = () => {
  document.getElementById("settingsName").value = settings.name;
  document.getElementById("themeSelect").value = settings.theme;
  document.getElementById("fontSelect").value = settings.font;
  showScreen("settings");
};

document.getElementById("settingsBackBtn").onclick = () =>
  showScreen("contacts");

document.getElementById("saveSettingsBtn").onclick = () => {
  settings.name = document.getElementById("settingsName").value.trim();
  settings.theme = document.getElementById("themeSelect").value;
  settings.font = document.getElementById("fontSelect").value;

  saveSettings();
  applySettings();
  renderContacts();
  showScreen("contacts");
};

// ---------- AVATAR ----------
function generateAvatar(el, image) {
  if (image) {
    el.style.backgroundImage = `url(${image})`;
  } else {
    const colors = ["#ff9acb", "#ffd6e8", "#c9f5e6", "#3fd2a2"];
    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const c2 = colors[Math.floor(Math.random() * colors.length)];
    el.style.backgroundImage = `linear-gradient(135deg, ${c1}, ${c2})`;
  }
}

// ---------- STORAGE ----------
function saveSettings() {
  localStorage.setItem("nyashSettings", JSON.stringify(settings));
}

// ---------- CHAT ----------
document.getElementById("backBtn").onclick =
  () => showScreen("contacts");

document.getElementById("sendBtn").onclick = () => {
  const input = document.getElementById("messageInput");
  sendMessage(input.value);
  input.value = "";
};



document.querySelectorAll(".intro-buttons button")
  .forEach(btn => {
    btn.onclick = () => sendMessage(btn.textContent);
  });
  const messageInput = document.getElementById("messageInput");

// Обработка клавиатуры в поле ввода
const messageInput = document.getElementById("messageInput");

messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    // Enter → всегда перенос строки (даже без Shift)
    // Ничего не делаем, браузер сам вставит \n
    // e.preventDefault() НЕ ставим — пусть Enter делает перенос
  }
});

// Кнопка отправки остаётся единственным способом отправить
document.getElementById("sendBtn").onclick = () => {
  const text = messageInput.value.trim();
  if (text) {
    sendMessage(text);
    messageInput.value = "";
    messageInput.style.height = "44px";  // возвращаем начальную высоту
  }
};

// Авто-рост высоты (чтобы поле росло при переносах строк)
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = `${messageInput.scrollHeight}px`;
});
// Аватарка: предпросмотр и сохранение
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

function updateAvatarPreview(base64) {
  if (base64) {
    avatarPreview.style.backgroundImage = `url(${base64})`;
    avatarPreview.style.backgroundSize = "cover";
  } else {
    generateAvatar(avatarPreview);  // твой существующий градиент
  }
}

// При выборе файла → предпросмотр + сохранение
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const base64 = e.target.result;
    settings.avatar = base64;
    saveSettings();
    updateAvatarPreview(base64);

    // Обновляем везде сразу
    renderContacts();  // если есть аватар в списке контактов (пока нет, но на будущее)
  };
  reader.readAsDataURL(file);
});

// При загрузке страницы — показываем сохранённый аватар
if (settings.avatar) {
  updateAvatarPreview(settings.avatar);
} else {
  generateAvatar(avatarPreview);
}

// Показываем аватар в шапке контактов (добавь в contactsScreen header, если хочешь)
const contactsHeader = document.querySelector("#contactsScreen .top-bar");
if (contactsHeader && !document.getElementById("myAvatarInContacts")) {
  const myAvatar = document.createElement("div");
  myAvatar.id = "myAvatarInContacts";
  myAvatar.className = "avatar";
  myAvatar.style.width = "36px";
  myAvatar.style.height = "36px";
  myAvatar.style.marginLeft = "auto";
  contactsHeader.appendChild(myAvatar);
  updateAvatarPreview(settings.avatar);  // вызовет обновление
}

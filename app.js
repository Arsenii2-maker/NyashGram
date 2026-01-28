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

document.getElementById("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    //sendMessage(e.target.value);
    e.target.value = "";
  }
});
// ------------------ АВАТАРКА ------------------
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

// Функция для установки аватарки (base64 или градиент)
function setAvatar(element, base64 = null) {
  if (base64) {
    element.style.backgroundImage = `url(${base64})`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";
  } else {
    // твой градиент-фallback
    const colors = ["#ff9acb", "#ffd6e8", "#c9f5e6", "#3fd2a2"];
    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const c2 = colors[Math.floor(Math.random() * colors.length)];
    element.style.backgroundImage = `linear-gradient(135deg, ${c1}, ${c2})`;
  }
}

// При выборе файла
if (avatarInput && avatarPreview) {
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      settings.avatar = base64;
      saveSettings();
      setAvatar(avatarPreview, base64);
      
      // Можно сразу обновить другие места, если они есть
      const myAvatarInContacts = document.getElementById("myAvatarInContacts");
      if (myAvatarInContacts) setAvatar(myAvatarInContacts, base64);
    };
    reader.readAsDataURL(file);
  });
}

// При загрузке страницы — показываем сохранённый или дефолт
window.addEventListener("load", () => {
  if (settings.avatar && avatarPreview) {
    setAvatar(avatarPreview, settings.avatar);
  } else if (avatarPreview) {
    setAvatar(avatarPreview);
  }
});

// ==========================
// NYASHGRAM — APP CORE
// ==========================

// ---------- STATE ----------
const AppState = {
  theme: localStorage.getItem("nyash_theme") || "cozy-pink",
  font: localStorage.getItem("nyash_font") || "Inter",
  sounds: localStorage.getItem("nyash_sounds") !== "off",
  avatar: localStorage.getItem("nyash_avatar") || null
};

// ---------- THEMES ----------
const Themes = {
  "cozy-pink": {
    bg: "#fff0f6",
    panel: "#ffe3ef",
    accent: "#ff7ab8",
    text: "#2b2b2b"
  },
  "mint": {
    bg: "#e9fff7",
    panel: "#d6fff0",
    accent: "#2ed3a2",
    text: "#1f2d2a"
  },
  "cyber": {
    bg: "#0d0f1a",
    panel: "#161a2b",
    accent: "#7c7cff",
    text: "#e6e6ff"
  },
  "loft": {
    bg: "#f2f2f2",
    panel: "#ffffff",
    accent: "#444444",
    text: "#111111"
  }
};

// ---------- FONTS ----------
const Fonts = [
  "Inter",
  "SF Pro Display",
  "Manrope",
  "Montserrat",
  "Poppins",
  "Nunito",
  "JetBrains Mono",
  "Comfortaa",
  "Rubik"
];

// ---------- APPLY THEME ----------
function applyTheme(name) {
  const theme = Themes[name];
  if (!theme) return;

  const r = document.documentElement;
  r.style.setProperty("--bg", theme.bg);
  r.style.setProperty("--panel", theme.panel);
  r.style.setProperty("--accent", theme.accent);
  r.style.setProperty("--text", theme.text);

  AppState.theme = name;
  localStorage.setItem("nyash_theme", name);
}

// ---------- APPLY FONT ----------
function applyFont(font) {
  document.body.style.fontFamily = font;
  AppState.font = font;
  localStorage.setItem("nyash_font", font);
}

// ---------- SOUNDS ----------
const Sounds = {
  click: new Audio("sounds/click.mp3"),
  send: new Audio("sounds/send.mp3"),
  open: new Audio("sounds/open.mp3")
};

function playSound(name) {
  if (!AppState.sounds) return;
  if (Sounds[name]) {
    Sounds[name].currentTime = 0;
    Sounds[name].play();
  }
}

// ---------- AVATAR ----------
function setAvatar(file) {
  const reader = new FileReader();
  reader.onload = () => {
    AppState.avatar = reader.result;
    localStorage.setItem("nyash_avatar", reader.result);
    document.querySelectorAll(".my-avatar").forEach(a => {
      a.style.backgroundImage = `url(${reader.result})`;
    });
  };
  reader.readAsDataURL(file);
}

// ---------- INIT SETTINGS UI ----------
function initSettings() {
  // themes
  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.onclick = () => {
      playSound("click");
      applyTheme(btn.dataset.theme);
    };
  });

  // fonts
  const fontSelect = document.getElementById("fontSelect");
  if (fontSelect) {
    Fonts.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      fontSelect.appendChild(opt);
    });

    fontSelect.value = AppState.font;
    fontSelect.onchange = () => {
      playSound("click");
      applyFont(fontSelect.value);
    };
  }

  // sounds toggle
  const soundToggle = document.getElementById("soundToggle");
  if (soundToggle) {
    soundToggle.checked = AppState.sounds;
    soundToggle.onchange = () => {
      AppState.sounds = soundToggle.checked;
      localStorage.setItem("nyash_sounds", AppState.sounds ? "on" : "off");
    };
  }

  // avatar
  const avatarInput = document.getElementById("avatarInput");
  if (avatarInput) {
    avatarInput.onchange = e => {
      playSound("click");
      setAvatar(e.target.files[0]);
    };
  }
}

// ---------- RESTORE ----------
function restoreApp() {
  applyTheme(AppState.theme);
  applyFont(AppState.font);

  if (AppState.avatar) {
    document.querySelectorAll(".my-avatar").forEach(a => {
      a.style.backgroundImage = `url(${AppState.avatar})`;
    });
  }
}

// ---------- GLOBAL BUTTON SOUND ----------
document.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    playSound("click");
  }
});

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  restoreApp();
  initSettings();
});
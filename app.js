// app.js — NyashGram v2.0 (ФИНАЛЬНАЯ ВЕРСИЯ)

const AppState = {
  currentUser: {
    name: localStorage.getItem('nyashgram_name') || "Няша",
    avatar: localStorage.getItem('nyashgram_avatar') || null,
    theme: localStorage.getItem('nyashgram_theme') || "pastel-pink",
    font: localStorage.getItem('nyashgram_font') || "font-cozy"
  },
  themes: [
    { id: "pastel-pink", name: "Pastel Pink" },
    { id: "milk-rose", name: "Milk Rose" },
    { id: "night-blue", name: "Night Blue" },
    { id: "lo-fi-beige", name: "Lo-Fi Beige" },
    { id: "soft-lilac", name: "Soft Lilac" }
  ],
  fonts: [
    { id: "font-system", name: "System" },
    { id: "font-rounded", name: "Rounded" },
    { id: "font-cozy", name: "Cozy" },
    { id: "font-elegant", name: "Elegant" },
    { id: "font-bold-soft", name: "Bold Soft" },
    { id: "font-mono-cozy", name: "Mono Cozy" }
  ]
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    if (id === 'contactsScreen' && typeof renderContacts === 'function') {
      renderContacts();
    }
    if (id === 'settingsScreen') {
      loadSettingsIntoUI();
    }
  }
}

function applyTheme(themeId) {
  AppState.themes.forEach(theme => {
    document.body.classList.remove(`theme-${theme.id}`);
  });
  document.body.classList.add(`theme-${themeId}`);
  AppState.currentUser.theme = themeId;
  localStorage.setItem("nyashgram_theme", themeId);
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === themeId) btn.classList.add('active');
  });
}

function applyFont(fontClass) {
  AppState.fonts.forEach(font => {
    document.body.classList.remove(font.id);
  });
  document.body.classList.add(fontClass);
  AppState.currentUser.font = fontClass;
  localStorage.setItem("nyashgram_font", fontClass);
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === fontClass) btn.classList.add('active');
  });
}

function loadSettingsIntoUI() {
  const settingsName = document.getElementById("settingsName");
  if (settingsName) settingsName.value = AppState.currentUser.name;
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === AppState.currentUser.theme) btn.classList.add('active');
  });
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === AppState.currentUser.font) btn.classList.add('active');
  });
}

function saveSettings() {
  const settingsName = document.getElementById("settingsName")?.value.trim();
  if (settingsName) {
    AppState.currentUser.name = settingsName;
    localStorage.setItem("nyashgram_name", settingsName);
  }
  showScreen("contactsScreen");
}

function checkAuth() {
  if (localStorage.getItem("nyashgram_entered") === "true") {
    applyTheme(AppState.currentUser.theme);
    applyFont(AppState.currentUser.font);
    showScreen("contactsScreen");
  } else {
    showScreen("phoneScreen");
    applyTheme("pastel-pink");
    applyFont("font-cozy");
  }
}

// Сохраняем настройки
document.addEventListener('DOMContentLoaded', function() {
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  // Кнопки тем
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });
  
  // Кнопки шрифтов
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFont(btn.dataset.font));
  });
  
  // Аватар
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = document.getElementById('avatarPreview');
          preview.style.backgroundImage = `url(${event.target.result})`;
          preview.style.backgroundSize = 'cover';
          preview.textContent = '';
          localStorage.setItem('nyashgram_avatar', event.target.result);
          AppState.currentUser.avatar = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Сохранение профиля
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      const name = document.getElementById('displayName')?.value.trim();
      if (!name) {
        alert('Введи имя!');
        return;
      }
      localStorage.setItem('nyashgram_name', name);
      localStorage.setItem('nyashgram_entered', 'true');
      AppState.currentUser.name = name;
      showScreen('contactsScreen');
    });
  }
  
  checkAuth();
});

window.showScreen = showScreen;
window.applyTheme = applyTheme;
window.applyFont = applyFont;
window.AppState = AppState;

console.log("✅ app.js загружен");
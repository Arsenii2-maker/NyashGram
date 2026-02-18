// app.js — NyashGram v2.0 (ребрендинг)
// Без Firebase, только локальное хранение, темы и шрифты
 
// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
const AppState = {
  currentUser: {
    name: "Няша",
    avatar: null,
    theme: "pastel-pink",
    font: "font-cozy"
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

// ========== УПРАВЛЕНИЕ ЭКРАНАМИ ==========
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    
    // Специальные действия при показе экранов
    if (id === 'contactsScreen' && typeof renderContacts === 'function') {
      renderContacts();
    }
    if (id === 'settingsScreen') {
      loadSettingsIntoUI();
    }
  }
}

// ========== УПРАВЛЕНИЕ ТЕМАМИ ==========
function applyTheme(themeId) {
  // Удаляем все классы тем с body
  AppState.themes.forEach(theme => {
    document.body.classList.remove(`theme-${theme.id}`);
  });
  
  // Добавляем новую тему
  document.body.classList.add(`theme-${themeId}`);
  
  // Сохраняем в состояние и localStorage
  AppState.currentUser.theme = themeId;
  localStorage.setItem("nyashgram_theme", themeId);
  
  // Обновляем активную кнопку в настройках
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === themeId) {
      btn.classList.add('active');
    }
  });
  
  console.log(`Тема применена: ${themeId}`);
}

// ========== УПРАВЛЕНИЕ ШРИФТАМИ ==========
function applyFont(fontClass) {
  // Удаляем все классы шрифтов с body
  AppState.fonts.forEach(font => {
    document.body.classList.remove(font.id);
  });
  
  // Добавляем новый шрифт
  document.body.classList.add(fontClass);
  
  // Сохраняем в состояние и localStorage
  AppState.currentUser.font = fontClass;
  localStorage.setItem("nyashgram_font", fontClass);
  
  // Обновляем активную кнопку в настройках
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === fontClass) {
      btn.classList.add('active');
    }
  });
  
  console.log(`Шрифт применён: ${fontClass}`);
}

// ========== ЗАГРУЗКА СОХРАНЁННЫХ НАСТРОЕК ==========
function loadSavedSettings() {
  // Загружаем имя
  const savedName = localStorage.getItem("nyashgram_name");
  if (savedName) {
    AppState.currentUser.name = savedName;
  }
  
  // Загружаем тему
  const savedTheme = localStorage.getItem("nyashgram_theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // Тема по умолчанию
    applyTheme("pastel-pink");
  }
  
  // Загружаем шрифт
  const savedFont = localStorage.getItem("nyashgram_font");
  if (savedFont) {
    applyFont(savedFont);
  } else {
    // Шрифт по умолчанию
    applyFont("font-cozy");
  }
  
  // Загружаем аватар
  const savedAvatar = localStorage.getItem("nyashgram_avatar");
  if (savedAvatar) {
    AppState.currentUser.avatar = savedAvatar;
  }
}

// ========== ЗАГРУЗКА НАСТРОЕК В UI ==========
function loadSettingsIntoUI() {
  // Имя в поле настроек
  const settingsName = document.getElementById("settingsName");
  if (settingsName) {
    settingsName.value = AppState.currentUser.name;
  }
  
  // Подсветка активной темы
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === AppState.currentUser.theme) {
      btn.classList.add('active');
    }
  });
  
  // Подсветка активного шрифта
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === AppState.currentUser.font) {
      btn.classList.add('active');
    }
  });
}

// ========== СОХРАНЕНИЕ НАСТРОЕК ==========
function saveSettings() {
  const settingsName = document.getElementById("settingsName")?.value.trim();
  if (settingsName) {
    AppState.currentUser.name = settingsName;
    localStorage.setItem("nyashgram_name", settingsName);
  }
  
  // Показываем контакты и обновляем их
  showScreen("contactsScreen");
  if (typeof renderContacts === "function") {
    renderContacts();
  }
}

// ========== ПРОВЕРКА АВТОРИЗАЦИИ ==========
function checkAuth() {
  const hasEntered = localStorage.getItem("nyashgram_entered");
  
  if (hasEntered === "true") {
    // Загружаем сохранённые настройки
    loadSavedSettings();
    // Сразу показываем контакты
    showScreen("contactsScreen");
    setTimeout(() => {
      if (typeof renderContacts === "function") {
        renderContacts();
      } else {
        console.warn("renderContacts не найдена — проверь подключение contacts.js");
      }
    }, 100);
  } else {
    // Первый вход — показываем экран номера
    showScreen("phoneScreen");
    // Ставим тему по умолчанию
    applyTheme("pastel-pink");
    applyFont("font-cozy");
  }
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
function setupEventListeners() {
  
  // ===== ЭКРАН НОМЕРА =====
  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) {
    // Убираем старые обработчики
    const newSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
    
    newSendBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Проверяем, активна ли кнопка (не disabled)
      if (!newSendBtn.disabled && newSendBtn.classList.contains('active')) {
        showScreen("codeScreen");
      }
    });
  }
  
  // ===== ЭКРАН КОДА =====
  const verifyBtn = document.getElementById("verifyBtn");
  if (verifyBtn) {
    const newVerifyBtn = verifyBtn.cloneNode(true);
    verifyBtn.parentNode.replaceChild(newVerifyBtn, verifyBtn);
    
    newVerifyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!newVerifyBtn.disabled && newVerifyBtn.classList.contains('active')) {
        const codeInput = document.getElementById("codeInput");
        const codeError = document.getElementById("codeError");
        
        // Получаем сгенерированный код из placeholder (убираем пробелы)
        const generatedCode = codeInput?.placeholder?.replace(/\s/g, "") || "";
        
        if (codeInput.value.trim() === generatedCode) {
          codeError.textContent = "";
          
          // Сохраняем флаг входа
          localStorage.setItem("nyashgram_entered", "true");
          
          // Сохраняем имя по умолчанию, если ещё нет
          if (!localStorage.getItem("nyashgram_name")) {
            localStorage.setItem("nyashgram_name", "Няша");
          }
          
          // Загружаем настройки
          loadSavedSettings();
          
          // Переходим на контакты
          showScreen("contactsScreen");
          if (typeof renderContacts === "function") {
            renderContacts();
          }
        } else {
          codeError.textContent = "Неверный код";
        }
      }
    });
  }
  
  // ===== ЭКРАН ПРОФИЛЯ =====
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    
    newSaveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("displayName");
      const name = nameInput?.value.trim();
      
      if (!name) {
        alert("Введи имя!");
        return;
      }
      
      // Сохраняем имя
      localStorage.setItem("nyashgram_name", name);
      AppState.currentUser.name = name;
      
      // Сохраняем аватар, если есть
      const avatarPreview = document.getElementById("avatarPreview");
      if (avatarPreview && avatarPreview.style.backgroundImage) {
        const avatarUrl = avatarPreview.style.backgroundImage.slice(5, -2);
        localStorage.setItem("nyashgram_avatar", avatarUrl);
        AppState.currentUser.avatar = avatarUrl;
      }
      
      // Сохраняем флаг входа (на случай, если дошли до профиля)
      localStorage.setItem("nyashgram_entered", "true");
      
      alert("Профиль сохранён! Добро пожаловать 💗");
      showScreen("contactsScreen");
      if (typeof renderContacts === "function") {
        renderContacts();
      }
    });
  }
  
  // ===== НАСТРОЙКИ =====
  // Кнопка открытия настроек
  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      showScreen("settingsScreen");
    });
  }
  
  // Кнопка назад из настроек
  const backFromSettingsBtn = document.getElementById("backFromSettingsBtn");
  if (backFromSettingsBtn) {
    backFromSettingsBtn.addEventListener("click", () => {
      showScreen("contactsScreen");
    });
  }
  
  // Сохранение настроек
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", saveSettings);
  }
  
  // Кнопки тем
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.theme;
      if (themeId) {
        applyTheme(themeId);
      }
    });
  });
  
  // Кнопки шрифтов
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const fontClass = btn.dataset.font;
      if (fontClass) {
        applyFont(fontClass);
      }
    });
  });
  
  // ===== ЧАТ =====
  // Кнопка назад из чата
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      showScreen("contactsScreen");
    });
  }
  
  // Отправка сообщения (обработчик в chat.js, но дублируем для надёжности)
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  const messageInput = document.getElementById("messageInput");
  
  if (sendMessageBtn && messageInput) {
    sendMessageBtn.addEventListener("click", () => {
      if (typeof window.sendMessage === 'function') {
        window.sendMessage();
      }
    });
    
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && typeof window.sendMessage === 'function') {
        window.sendMessage();
      }
    });
  }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log("NyashGram v2.0 загружается... 💗");
  
  // Проверяем авторизацию
  checkAuth();
  
  // Устанавливаем обработчики событий
  setupEventListeners();
  
  // Делаем функции глобально доступными (для вызова из HTML)
  window.showScreen = showScreen;
  window.applyTheme = applyTheme;
  window.applyFont = applyFont;
  window.AppState = AppState;
});

console.log("✅ app.js загружен — Firebase удалён, темы и шрифты работают");
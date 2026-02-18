// app.js — NyashGram v2.0 (ИСПРАВЛЕННАЯ ВЕРСИЯ)
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

// ========== ФУНКЦИИ ДЛЯ ЭКРАНА ВХОДА ==========
let generatedCode = "";

function generateCode() {
  generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeInput = document.getElementById("codeInput");
  if (codeInput) {
    codeInput.placeholder = generatedCode.split("").join(" ");
  }
  const codeHint = document.getElementById("generatedCodeHint");
  if (codeHint) {
    codeHint.textContent = generatedCode;
  }
  console.log("Сгенерирован код:", generatedCode);
  return generatedCode;
}

function checkPhoneInput() {
  const phoneInput = document.getElementById("phoneNumber");
  const sendBtn = document.getElementById("sendBtn");
  const errorMsg = document.getElementById("errorMessage");
  
  if (!phoneInput || !sendBtn) return;
  
  const phone = phoneInput.value.trim().replace(/\D/g, "");
  if (phone.length >= 9) {
    sendBtn.classList.add("active");
    sendBtn.disabled = false;
    if (errorMsg) errorMsg.textContent = "";
  } else {
    sendBtn.classList.remove("active");
    sendBtn.disabled = true;
    if (errorMsg && phone.length > 0) {
      errorMsg.textContent = "Номер слишком короткий";
    } else if (errorMsg) {
      errorMsg.textContent = "";
    }
  }
}

function checkCodeInput() {
  const codeInput = document.getElementById("codeInput");
  const verifyBtn = document.getElementById("verifyBtn");
  const codeError = document.getElementById("codeError");
  
  if (!codeInput || !verifyBtn) return;
  
  const entered = codeInput.value.trim();
  if (entered.length === 6) {
    if (entered === generatedCode) {
      if (codeError) codeError.textContent = "";
      verifyBtn.classList.add("active");
      verifyBtn.disabled = false;
    } else {
      if (codeError) codeError.textContent = "Неверный код";
      verifyBtn.classList.remove("active");
      verifyBtn.disabled = true;
    }
  } else {
    if (codeError) codeError.textContent = "";
    verifyBtn.classList.remove("active");
    verifyBtn.disabled = true;
  }
}

// ===== ЭКРАН КОДА =====
const codeInput = document.getElementById("codeInput");
if (codeInput) {
  // Удаляем старые обработчики
  const newCodeInput = codeInput.cloneNode(true);
  codeInput.parentNode.replaceChild(newCodeInput, codeInput);
  
  newCodeInput.addEventListener("input", function() {
    const entered = this.value.trim();
    const verifyBtn = document.getElementById("verifyBtn");
    const codeError = document.getElementById("codeError");
    
    if (!verifyBtn) return;
    
    if (entered.length === 6) {
      // Проверяем код (сравниваем с тем, что в placeholder)
      const placeholderCode = this.placeholder.replace(/\s/g, "");
      
      if (entered === placeholderCode) {
        if (codeError) codeError.textContent = "";
        verifyBtn.classList.add("active");
        verifyBtn.disabled = false;
      } else {
        if (codeError) codeError.textContent = "Неверный код";
        verifyBtn.classList.remove("active");
        verifyBtn.disabled = true;
      }
    } else {
      if (codeError) codeError.textContent = "";
      verifyBtn.classList.remove("active");
      verifyBtn.disabled = true;
    }
  });
}

const verifyBtn = document.getElementById("verifyBtn");
if (verifyBtn) {
  // Удаляем старые обработчики
  const newVerifyBtn = verifyBtn.cloneNode(true);
  verifyBtn.parentNode.replaceChild(newVerifyBtn, verifyBtn);
  
  newVerifyBtn.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Кнопка 'Войти' нажата");
    
    if (!this.disabled && this.classList.contains('active')) {
      const codeInput = document.getElementById("codeInput");
      const codeError = document.getElementById("codeError");
      
      if (!codeInput) return;
      
      const enteredCode = codeInput.value.trim();
      const placeholderCode = codeInput.placeholder.replace(/\s/g, "");
      
      console.log("Введён код:", enteredCode);
      console.log("Ожидаемый код:", placeholderCode);
      
      if (enteredCode === placeholderCode) {
        if (codeError) codeError.textContent = "";
        
        // Сохраняем флаг входа
        localStorage.setItem("nyashgram_entered", "true");
        
        // Сохраняем имя по умолчанию, если ещё нет
        if (!localStorage.getItem("nyashgram_name")) {
          localStorage.setItem("nyashgram_name", "Няша");
        }
        
        // Загружаем настройки
        if (typeof loadSavedSettings === 'function') {
          loadSavedSettings();
        }
        
        // Переходим на контакты
        showScreen("contactsScreen");
        
        // Рендерим контакты
        setTimeout(() => {
          if (typeof renderContacts === "function") {
            renderContacts();
          }
        }, 100);
        
      } else {
        if (codeError) codeError.textContent = "Неверный код";
      }
    }
  });
}
  
  // ===== ЭКРАН ПРОФИЛЯ =====
  const avatarInput = document.getElementById("avatarInput");
  if (avatarInput) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = document.getElementById("avatarPreview");
          if (preview) {
            preview.style.backgroundImage = `url(${event.target.result})`;
            preview.style.backgroundSize = "cover";
            preview.textContent = "";
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
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
  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      showScreen("settingsScreen");
    });
  }
  
  const backFromSettingsBtn = document.getElementById("backFromSettingsBtn");
  if (backFromSettingsBtn) {
    backFromSettingsBtn.addEventListener("click", () => {
      showScreen("contactsScreen");
    });
  }
  
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
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      showScreen("contactsScreen");
    });
  }
  
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  const messageInput = document.getElementById("messageInput");
  
  if (sendMessageBtn && messageInput) {
    sendMessageBtn.addEventListener("click", () => {
      if (typeof window.sendMessage === 'function') {
        window.sendMessage(messageInput.value);
      }
    });
    
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey && typeof window.sendMessage === 'function') {
        e.preventDefault();
        window.sendMessage(messageInput.value);
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
  window.generateCode = generateCode;
});

console.log("✅ app.js загружен — Firebase удалён, кнопка 'Получить код' ИСПРАВЛЕНА");
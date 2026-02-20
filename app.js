// app.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ

// Инициализация
if (!window.chatData) {
  window.chatData = {};
}

const AppState = {
  currentUser: {
    name: localStorage.getItem('nyashgram_name') || "Няша",
    username: localStorage.getItem('nyashgram_username') || "nyasha",
    avatar: localStorage.getItem('nyashgram_avatar') || null,
    theme: localStorage.getItem('nyashgram_theme') || "pastel-pink",
    mode: localStorage.getItem('nyashgram_mode') || "light",
    font: localStorage.getItem('nyashgram_font') || "font-cozy"
  }
};

// База занятых юзернеймов
let takenUsernames = JSON.parse(localStorage.getItem('nyashgram_taken_usernames') || '["nyasha", "nyashhelp_official", "nyashtalk_bot", "nyashgame_bot", "nyashhoroscope_bot", "bestie_nyash", "thinker_deep", "study_buddy", "melody_lover", "midnight_vibes", "admin", "user"]');

// Милые слова
const cuteWords = ["nyasha", "kawaii", "cutie", "sweetie", "honey", "bunny", "kitty", "pudding", "mochi", "cookie", "candy", "sugar", "strawberry", "cherry", "peach", "mango", "cloud", "star", "moon", "sunny", "rainbow", "sparkle", "glitter", "dream"];
const cuteSuffixes = ["chan", "kun", "san", "tan", "chin", "rin", "pii", "nyan", "mimi"];

// ===== ПРОСТАЯ СИСТЕМА ТЕМ =====
function setTheme(theme, mode) {
  // Сохраняем текущий шрифт
  const currentFont = AppState.currentUser.font;
  
  // Полностью очищаем классы на body
  document.body.className = '';
  
  // Добавляем класс темы и режима
  document.body.classList.add(`${theme}-${mode}`);
  
  // Добавляем класс шрифта
  document.body.classList.add(currentFont);
  
  // Сохраняем в состояние
  AppState.currentUser.theme = theme;
  AppState.currentUser.mode = mode;
  localStorage.setItem('nyashgram_theme', theme);
  localStorage.setItem('nyashgram_mode', mode);
  
  // 👇 ВАЖНО: сразу обновляем активные кнопки тем
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
  
  console.log('✅ Тема установлена:', `${theme}-${mode}`);
}

// Переключение режима (луна/солнце)
function toggleMode() {
  const newMode = AppState.currentUser.mode === 'light' ? 'dark' : 'light';
  
  // Анимация для кнопки
  const modeToggle = document.getElementById('themeModeToggle');
  if (modeToggle) {
    modeToggle.classList.add('mode-switch-animation');
    setTimeout(() => {
      modeToggle.classList.remove('mode-switch-animation');
    }, 300);
  }
  
  setTheme(AppState.currentUser.theme, newMode);
  
  if (modeToggle) {
    modeToggle.textContent = newMode === 'light' ? '☀️' : '🌙';
  }
}

// ===== ПРОВЕРКА ЮЗЕРНЕЙМА =====
function isValidUsername(username) {
  if (!username) return false;
  return /^[a-z0-9_]{3,50}$/.test(username);
}

function getUsernameError(username) {
  if (!username || username.length === 0) return 'Введи юзернейм!';
  if (username.length < 3) return 'Юзернейм должен быть минимум 3 символа';
  if (username.length > 50) return 'Юзернейм должен быть максимум 50 символов';
  if (!/^[a-z0-9_]+$/.test(username)) return 'Только латинские буквы, цифры и нижнее подчеркивание';
  return '';
}

function generateCuteUsername() {
  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const word = cuteWords[Math.floor(Math.random() * cuteWords.length)];
    const num = Math.floor(Math.random() * 999);
    const username = word + num;
    if (isValidUsername(username) && !isUsernameTaken(username)) {
      return username;
    }
  }
  return "nyasha_" + Date.now().toString().slice(-6);
}

function isUsernameTaken(username, currentUsername = null) {
  if (!username) return false;
  if (currentUsername && username.toLowerCase() === currentUsername.toLowerCase()) return false;
  return takenUsernames.some(u => u.toLowerCase() === username.toLowerCase());
}

function addUsername(username) {
  if (username && !takenUsernames.includes(username)) {
    takenUsernames.push(username);
    localStorage.setItem('nyashgram_taken_usernames', JSON.stringify(takenUsernames));
  }
}

function removeUsername(username) {
  const index = takenUsernames.indexOf(username);
  if (index > -1) {
    takenUsernames.splice(index, 1);
    localStorage.setItem('nyashgram_taken_usernames', JSON.stringify(takenUsernames));
  }
}

// ===== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.opacity = '0';
  });
  
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    setTimeout(() => {
      screen.style.opacity = '1';
    }, 50);
  }
  
  if (id === 'contactsScreen' && typeof renderContacts === 'function') {
    setTimeout(renderContacts, 100);
  }
}

// ===== ШРИФТЫ =====
function applyFont(fontClass) {
  document.body.classList.remove(
    'font-system', 'font-rounded', 'font-cozy', 
    'font-elegant', 'font-bold-soft', 'font-mono-cozy'
  );
  document.body.classList.add(fontClass);
  AppState.currentUser.font = fontClass;
  localStorage.setItem('nyashgram_font', fontClass);
  
  // 👇 ВАЖНО: сразу обновляем активные кнопки шрифтов
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === fontClass) {
      btn.classList.add('active');
    }
  });
  
  console.log('✅ Шрифт применён:', fontClass);
}

// ===== НАСТРОЙКИ =====
function loadSettingsIntoUI() {
  document.getElementById('settingsName').value = AppState.currentUser.name;
  document.getElementById('settingsUsername').value = AppState.currentUser.username;
  
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
  const newName = document.getElementById('settingsName').value.trim();
  const newUsername = document.getElementById('settingsUsername').value.trim().toLowerCase();
  const errorEl = document.getElementById('settingsUsernameError');
  
  if (!newName) return alert('Введи имя!');
  
  const usernameError = getUsernameError(newUsername);
  if (usernameError) {
    if (errorEl) errorEl.textContent = usernameError;
    return;
  }
  
  if (isUsernameTaken(newUsername, AppState.currentUser.username)) {
    if (errorEl) errorEl.textContent = 'Этот юзернейм уже занят!';
    return;
  }
  
  if (errorEl) errorEl.textContent = '';
  
  removeUsername(AppState.currentUser.username);
  
  AppState.currentUser.name = newName;
  AppState.currentUser.username = newUsername;
  
  localStorage.setItem('nyashgram_name', newName);
  localStorage.setItem('nyashgram_username', newUsername);
  addUsername(newUsername);
  
  document.getElementById('usernameDisplay').textContent = `@${newUsername}`;
  showScreen('contactsScreen');
}

// ===== АВТОРИЗАЦИЯ =====
let generatedCode = '';

function generateCode() {
  generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeInput = document.getElementById('codeInput');
  if (codeInput) {
    codeInput.placeholder = generatedCode.split('').join(' ');
    codeInput.value = '';
  }
  document.getElementById('generatedCodeHint').textContent = generatedCode;
}

function checkAuth() {
  if (localStorage.getItem('nyashgram_entered') === 'true') {
    addUsername(AppState.currentUser.username);
    
    // Устанавливаем тему из сохранённых данных
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    const modeToggle = document.getElementById('themeModeToggle');
    if (modeToggle) {
      modeToggle.textContent = AppState.currentUser.mode === 'light' ? '☀️' : '🌙';
    }
    
    showScreen('contactsScreen');
  } else {
    showScreen('phoneScreen');
    setTheme('pastel-pink', 'light');
    applyFont('font-cozy');
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram загружается...');
  
  // Экран номера
  const phoneInput = document.getElementById('phoneNumber');
  const sendBtn = document.getElementById('sendBtn');
  
  if (phoneInput && sendBtn) {
    phoneInput.addEventListener('input', function() {
      const phone = this.value.replace(/\D/g, '');
      if (phone.length >= 9) {
        sendBtn.classList.add('active');
        sendBtn.disabled = false;
      } else {
        sendBtn.classList.remove('active');
        sendBtn.disabled = true;
      }
    });
    
    sendBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!this.disabled && this.classList.contains('active')) {
        generateCode();
        showScreen('codeScreen');
      }
    });
  }
  
  // Экран кода
  const codeInput = document.getElementById('codeInput');
  const verifyBtn = document.getElementById('verifyBtn');
  
  if (codeInput && verifyBtn) {
    codeInput.addEventListener('input', function() {
      const entered = this.value.trim();
      const expected = this.placeholder.replace(/\s/g, '');
      
      if (entered.length === 6) {
        if (entered === expected) {
          verifyBtn.classList.add('active');
          verifyBtn.disabled = false;
          document.getElementById('codeError').textContent = '';
        } else {
          verifyBtn.classList.remove('active');
          verifyBtn.disabled = true;
          document.getElementById('codeError').textContent = 'Неверный код';
        }
      } else {
        verifyBtn.classList.remove('active');
        verifyBtn.disabled = true;
        document.getElementById('codeError').textContent = '';
      }
    });
    
    verifyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!this.disabled && this.classList.contains('active')) {
        localStorage.setItem('nyashgram_entered', 'true');
        if (!localStorage.getItem('nyashgram_name')) {
          localStorage.setItem('nyashgram_name', 'Няша');
        }
        if (!localStorage.getItem('nyashgram_username')) {
          const defaultUsername = generateCuteUsername();
          localStorage.setItem('nyashgram_username', defaultUsername);
          AppState.currentUser.username = defaultUsername;
        }
        showScreen('contactsScreen');
        if (typeof renderContacts === 'function') {
          setTimeout(renderContacts, 100);
        }
      }
    });
  }
  
  // Экран профиля
  const saveProfileBtn = document.getElementById('saveBtn');
  const profileUsernameInput = document.getElementById('displayUsername');
  const usernameErrorEl = document.getElementById('usernameError');
  const generateUsernameBtn = document.getElementById('generateUsernameBtn');
  
  if (generateUsernameBtn && profileUsernameInput) {
    generateUsernameBtn.addEventListener('click', function(e) {
      e.preventDefault();
      profileUsernameInput.value = generateCuteUsername();
      if (usernameErrorEl) usernameErrorEl.textContent = '';
    });
  }
  
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
      const name = document.getElementById('displayName').value.trim();
      const username = profileUsernameInput.value.trim().toLowerCase();
      
      if (!name) return alert('Введи имя!');
      
      const usernameError = getUsernameError(username);
      if (usernameError) {
        if (usernameErrorEl) usernameErrorEl.textContent = usernameError;
        return;
      }
      
      if (isUsernameTaken(username)) {
        if (usernameErrorEl) usernameErrorEl.textContent = 'Этот юзернейм уже занят!';
        return;
      }
      
      localStorage.setItem('nyashgram_name', name);
      localStorage.setItem('nyashgram_username', username);
      localStorage.setItem('nyashgram_entered', 'true');
      
      addUsername(username);
      
      AppState.currentUser.name = name;
      AppState.currentUser.username = username;
      
      showScreen('contactsScreen');
    });
  }
  
  // Настройки
  document.getElementById('settingsBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    loadSettingsIntoUI();
    showScreen('settingsScreen');
  });
  
  document.getElementById('backFromSettingsBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('contactsScreen');
  });
  
  document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
  
  // Кнопка генерации в настройках
  document.getElementById('settingsGenerateBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('settingsUsername').value = generateCuteUsername();
    document.getElementById('settingsUsernameError').textContent = '';
  });
  
  // Кнопка луны
  const themeModeToggle = document.getElementById('themeModeToggle');
  if (themeModeToggle) {
    themeModeToggle.addEventListener('click', toggleMode);
  }
  
  // Кнопки тем
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme, AppState.currentUser.mode);
    });
  });
  
  // Кнопки шрифтов
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFont(btn.dataset.font));
  });
  
  // Поиск
  document.getElementById('searchInput')?.addEventListener('input', function() {
    if (typeof window.filterContactsByUsername === 'function') {
      window.filterContactsByUsername(this.value);
    }
  });
  
  // Проверка авторизации
  checkAuth();
  
  // Экспорт
  window.showScreen = showScreen;
  window.applyFont = applyFont;
  window.AppState = AppState;
  window.generateCode = generateCode;
  window.toggleMode = toggleMode;
  window.setTheme = setTheme;
  
  console.log('✅ app.js готов');
});
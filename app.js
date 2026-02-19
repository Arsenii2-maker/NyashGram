// app.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ

// Инициализируем глобальный chatData если его нет
if (!window.chatData) {
  window.chatData = {};
}

// Режим темы (светлый/тёмный)
let currentThemeMode = localStorage.getItem('nyashgram_theme_mode') || 'light';

const AppState = {
  currentUser: {
    name: localStorage.getItem('nyashgram_name') || "Няша",
    username: localStorage.getItem('nyashgram_username') || "nyasha",
    avatar: localStorage.getItem('nyashgram_avatar') || null,
    theme: localStorage.getItem('nyashgram_theme') || "pastel-pink",
    font: localStorage.getItem('nyashgram_font') || "font-cozy"
  }
};

// База данных занятых юзернеймов
let takenUsernames = JSON.parse(localStorage.getItem('nyashgram_taken_usernames') || '["nyasha", "nyashhelp_official", "nyashtalk_bot", "nyashgame_bot", "nyashhoroscope_bot", "bestie_nyash", "thinker_deep", "study_buddy", "melody_lover", "midnight_vibes", "admin", "user"]');

// Милые слова для генерации юзернеймов
const cuteWords = [
  "nyasha", "kawaii", "cutie", "sweetie", "honey", "bunny", "kitty", "pudding", 
  "mochi", "cookie", "candy", "sugar", "strawberry", "cherry", "peach", "mango",
  "cloud", "star", "moon", "sunny", "rainbow", "sparkle", "glitter", "dream"
];

const cuteSuffixes = [
  "chan", "kun", "san", "tan", "chin", "rin", "pii", "nyan", "mimi"
];

// Функция переключения режима темы (ОТЛАДОЧНАЯ ВЕРСИЯ)
function toggleThemeMode() {
    console.log('🔴 КНОПКА НАЖАТА! Текущий режим:', currentThemeMode);
    
    const modeToggle = document.getElementById('themeModeToggle');
    
    if (currentThemeMode === 'light') {
        currentThemeMode = 'dark';
        if (modeToggle) modeToggle.textContent = '🌙';
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        console.log('🟢 Переключили на dark-mode');
    } else {
        currentThemeMode = 'light';
        if (modeToggle) modeToggle.textContent = '☀️';
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        console.log('🟢 Переключили на light-mode');
    }
    
    localStorage.setItem('nyashgram_theme_mode', currentThemeMode);
    
    // Проверяем, какие классы теперь на body
    console.log('📌 Классы body после переключения:', document.body.className);
    console.log('📌 Содержит dark-mode?', document.body.classList.contains('dark-mode'));
    console.log('📌 Содержит light-mode?', document.body.classList.contains('light-mode'));
    
    // Переприменяем текущую тему
    const currentTheme = AppState.currentUser.theme;
    document.body.classList.remove(
        'theme-pastel-pink', 'theme-milk-rose', 'theme-night-blue', 
        'theme-lo-fi-beige', 'theme-soft-lilac'
    );
    document.body.classList.add(`theme-${currentTheme}`);
    
    console.log('🎨 Фон после применения:', getComputedStyle(document.body).background);
}

// Проверка валидности юзернейма
function isValidUsername(username) {
  if (!username) return false;
  const regex = /^[a-z0-9_]{3,50}$/;
  return regex.test(username);
}

function getUsernameError(username) {
  if (!username || username.length === 0) return 'Введи юзернейм!';
  if (username.length < 3) return 'Юзернейм должен быть минимум 3 символа';
  if (username.length > 50) return 'Юзернейм должен быть максимум 50 символов';
  if (!/^[a-z0-9_]+$/.test(username)) return 'Только латинские буквы, цифры и нижнее подчеркивание';
  return '';
}

// Генерация случайного милого юзернейма
function generateCuteUsername() {
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    const format = Math.floor(Math.random() * 6);
    let username = '';
    
    switch(format) {
      case 0:
        username = cuteWords[Math.floor(Math.random() * cuteWords.length)] + 
                  Math.floor(Math.random() * 999);
        break;
      case 1:
        username = cuteWords[Math.floor(Math.random() * cuteWords.length)] + 
                  cuteWords[Math.floor(Math.random() * cuteWords.length)].slice(0, 5);
        break;
      case 2:
        username = cuteWords[Math.floor(Math.random() * cuteWords.length)] + 
                  cuteSuffixes[Math.floor(Math.random() * cuteSuffixes.length)];
        break;
      case 3:
        username = cuteWords[Math.floor(Math.random() * cuteWords.length)] + '_' + 
                  cuteWords[Math.floor(Math.random() * cuteWords.length)];
        break;
      default:
        const shortWords = ["nyu", "mya", "puu", "nyaa"];
        username = shortWords[Math.floor(Math.random() * shortWords.length)] + 
                  Math.floor(Math.random() * 999);
    }
    
    if (username.length > 50) username = username.slice(0, 50);
    
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

// Функция переключения экранов с анимацией
function showScreen(id) {
  const currentActive = document.querySelector('.screen.active');
  const newScreen = document.getElementById(id);
  
  if (currentActive) {
    currentActive.style.opacity = '0';
    setTimeout(() => {
      currentActive.classList.remove('active');
      if (newScreen) {
        newScreen.classList.add('active');
        setTimeout(() => {
          newScreen.style.opacity = '1';
        }, 50);
      }
    }, 300);
  } else {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (newScreen) {
      newScreen.classList.add('active');
      newScreen.style.opacity = '1';
    }
  }
  
  if (id === 'contactsScreen' && typeof renderContacts === 'function') {
    setTimeout(renderContacts, 350);
  }
}

// Применение темы
function applyTheme(themeId) {
  document.body.style.opacity = '0.5';
  
  setTimeout(() => {
    document.body.classList.remove(
      'theme-pastel-pink', 'theme-milk-rose', 'theme-night-blue', 
      'theme-lo-fi-beige', 'theme-soft-lilac'
    );
    
    document.body.classList.add(`theme-${themeId}`);
    
    AppState.currentUser.theme = themeId;
    localStorage.setItem('nyashgram_theme', themeId);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.theme === themeId) btn.classList.add('active');
    });
    
    document.body.style.opacity = '1';
    
    console.log('Тема применена:', themeId);
  }, 150);
}

// Применение шрифта
function applyFont(fontClass) {
  document.body.style.opacity = '0.5';
  
  setTimeout(() => {
    document.body.classList.remove(
      'font-system', 'font-rounded', 'font-cozy', 
      'font-elegant', 'font-bold-soft', 'font-mono-cozy'
    );
    document.body.classList.add(fontClass);
    AppState.currentUser.font = fontClass;
    localStorage.setItem('nyashgram_font', fontClass);
    
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.font === fontClass) btn.classList.add('active');
    });
    
    document.body.style.opacity = '1';
  }, 150);
}

// Загрузка настроек в UI
function loadSettingsIntoUI() {
  const nameInput = document.getElementById('settingsName');
  const usernameInput = document.getElementById('settingsUsername');
  if (nameInput) nameInput.value = AppState.currentUser.name;
  if (usernameInput) usernameInput.value = AppState.currentUser.username;
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === AppState.currentUser.theme) btn.classList.add('active');
  });
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === AppState.currentUser.font) btn.classList.add('active');
  });
}

// Сохранение настроек
function saveSettings() {
  const newName = document.getElementById('settingsName')?.value.trim();
  const newUsername = document.getElementById('settingsUsername')?.value.trim().toLowerCase();
  const errorEl = document.getElementById('settingsUsernameError');
  
  if (!newName) {
    alert('Введи имя!');
    return;
  }
  
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
  
  const display = document.getElementById('usernameDisplay');
  if (display) display.textContent = `@${newUsername}`;
  
  showScreen('contactsScreen');
}

// Проверка авторизации
function checkAuth() {
  if (localStorage.getItem('nyashgram_entered') === 'true') {
    addUsername(AppState.currentUser.username);
    
    // Загружаем сохранённый режим
    const savedMode = localStorage.getItem('nyashgram_theme_mode') || 'light';
    currentThemeMode = savedMode;
    
    // Добавляем класс режима на body
    document.body.classList.add(savedMode + '-mode');
    
    // Применяем сохранённую тему
    applyTheme(AppState.currentUser.theme);
    applyFont(AppState.currentUser.font);
    
    // Обновляем кнопку луны
    const modeToggle = document.getElementById('themeModeToggle');
    if (modeToggle) {
      modeToggle.textContent = savedMode === 'light' ? '☀️' : '🌙';
    }
    
    showScreen('contactsScreen');
  } else {
    showScreen('phoneScreen');
    // По умолчанию светлый режим
    document.body.classList.add('light-mode');
    applyTheme('pastel-pink');
    applyFont('font-cozy');
  }
}

// Генерация кода
let generatedCode = '';
function generateCode() {
  generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeInput = document.getElementById('codeInput');
  if (codeInput) {
    codeInput.placeholder = generatedCode.split('').join(' ');
    codeInput.value = '';
  }
  const hint = document.getElementById('generatedCodeHint');
  if (hint) hint.textContent = generatedCode;
  return generatedCode;
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram загружается...');
  
  // ===== ЭКРАН НОМЕРА =====
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
  
  // ===== ЭКРАН КОДА =====
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
          setTimeout(renderContacts, 350);
        }
      }
    });
  }
  
  // ===== ЭКРАН ПРОФИЛЯ =====
  const saveProfileBtn = document.getElementById('saveBtn');
  const profileUsernameInput = document.getElementById('displayUsername');
  const usernameErrorEl = document.getElementById('usernameError');
  const generateUsernameBtn = document.getElementById('generateUsernameBtn');
  
  if (generateUsernameBtn && profileUsernameInput) {
    generateUsernameBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const newUsername = generateCuteUsername();
      profileUsernameInput.value = newUsername;
      if (usernameErrorEl) usernameErrorEl.textContent = '';
    });
  }
  
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
      const name = document.getElementById('displayName')?.value.trim();
      const username = profileUsernameInput?.value.trim().toLowerCase();
      
      if (!name) {
        alert('Введи имя!');
        return;
      }
      
      const usernameError = getUsernameError(username);
      if (usernameError) {
        if (usernameErrorEl) usernameErrorEl.textContent = usernameError;
        return;
      }
      
      if (isUsernameTaken(username)) {
        if (usernameErrorEl) usernameErrorEl.textContent = 'Этот юзернейм уже занят!';
        return;
      }
      
      if (usernameErrorEl) usernameErrorEl.textContent = '';
      
      localStorage.setItem('nyashgram_name', name);
      localStorage.setItem('nyashgram_username', username);
      localStorage.setItem('nyashgram_entered', 'true');
      
      addUsername(username);
      
      AppState.currentUser.name = name;
      AppState.currentUser.username = username;
      
      showScreen('contactsScreen');
    });
  }
  
  // ===== НАСТРОЙКИ =====
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loadSettingsIntoUI();
      showScreen('settingsScreen');
    });
  }
  
  const backFromSettingsBtn = document.getElementById('backFromSettingsBtn');
  if (backFromSettingsBtn) {
    backFromSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('contactsScreen');
    });
  }
  
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  // Кнопка генерации юзернейма в настройках
  const settingsGenerateBtn = document.getElementById('settingsGenerateBtn');
  const settingsUsernameInput = document.getElementById('settingsUsername');
  if (settingsGenerateBtn && settingsUsernameInput) {
    settingsGenerateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const newUsername = generateCuteUsername();
      settingsUsernameInput.value = newUsername;
      document.getElementById('settingsUsernameError').textContent = '';
    });
  }
  
  // Кнопка переключения режима темы
  const themeModeToggle = document.getElementById('themeModeToggle');
  if (themeModeToggle) {
    themeModeToggle.textContent = currentThemeMode === 'light' ? '☀️' : '🌙';
    themeModeToggle.addEventListener('click', toggleThemeMode);
  }
  
  // Кнопки тем
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });
  
  // Кнопки шрифтов
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFont(btn.dataset.font));
  });
  
  // ===== ПОИСК =====
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (typeof window.filterContactsByUsername === 'function') {
        window.filterContactsByUsername(this.value);
      }
    });
  }
  
  // Проверка авторизации
  checkAuth();
  
  // Экспорт в глобальную область
  window.showScreen = showScreen;
  window.applyTheme = applyTheme;
  window.applyFont = applyFont;
  window.AppState = AppState;
  window.generateCode = generateCode;
  window.isUsernameTaken = isUsernameTaken;
  window.addUsername = addUsername;
  window.removeUsername = removeUsername;
  window.generateCuteUsername = generateCuteUsername;
  window.isValidUsername = isValidUsername;
  window.getUsernameError = getUsernameError;
  window.toggleThemeMode = toggleThemeMode;
  window.currentThemeMode = currentThemeMode;
  
  console.log('✅ app.js готов');
});
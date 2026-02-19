// app.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ

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
let takenUsernames = JSON.parse(localStorage.getItem('nyashgram_taken_usernames') || '["nyasha", "nyashhelp_official", "nyashtalk_bot", "bestie_nyash", "thinker_deep", "study_buddy", "melody_lover", "midnight_vibes", "admin", "user"]');

function isUsernameTaken(username, currentUsername = null) {
  if (!username) return false;
  // Если это текущий юзернейм пользователя, то не считаем занятым
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

// Функция переключения экранов
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    if (id === 'contactsScreen' && typeof renderContacts === 'function') {
      setTimeout(renderContacts, 50);
    }
  }
}

// Применение темы
function applyTheme(themeId) {
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
}

// Применение шрифта
function applyFont(fontClass) {
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
  
  if (!newUsername) {
    if (errorEl) errorEl.textContent = 'Введи юзернейм!';
    return;
  }
  
  // Проверка на уникальность
  if (isUsernameTaken(newUsername, AppState.currentUser.username)) {
    if (errorEl) errorEl.textContent = 'Этот юзернейм уже занят!';
    return;
  }
  
  if (errorEl) errorEl.textContent = '';
  
  // Удаляем старый юзернейм из занятых
  removeUsername(AppState.currentUser.username);
  
  // Обновляем данные
  AppState.currentUser.name = newName;
  AppState.currentUser.username = newUsername;
  
  localStorage.setItem('nyashgram_name', newName);
  localStorage.setItem('nyashgram_username', newUsername);
  
  // Добавляем новый юзернейм в занятые
  addUsername(newUsername);
  
  const display = document.getElementById('usernameDisplay');
  if (display) display.textContent = `@${newUsername}`;
  
  showScreen('contactsScreen');
}

// Проверка авторизации
function checkAuth() {
  if (localStorage.getItem('nyashgram_entered') === 'true') {
    // Добавляем текущего пользователя в список занятых, если его там нет
    addUsername(AppState.currentUser.username);
    
    applyTheme(AppState.currentUser.theme);
    applyFont(AppState.currentUser.font);
    showScreen('contactsScreen');
  } else {
    showScreen('phoneScreen');
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
          const defaultUsername = 'nyasha' + Math.floor(Math.random() * 1000);
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
  
  // ===== ЭКРАН ПРОФИЛЯ =====
  const saveProfileBtn = document.getElementById('saveBtn');
  const profileUsernameInput = document.getElementById('displayUsername');
  const usernameErrorEl = document.getElementById('usernameError');
  
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
      const name = document.getElementById('displayName')?.value.trim();
      const username = profileUsernameInput?.value.trim().toLowerCase();
      
      if (!name) {
        alert('Введи имя!');
        return;
      }
      
      if (!username) {
        if (usernameErrorEl) usernameErrorEl.textContent = 'Введи юзернейм!';
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
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    loadSettingsIntoUI();
    showScreen('settingsScreen');
  });
  
  document.getElementById('backFromSettingsBtn')?.addEventListener('click', () => {
    showScreen('contactsScreen');
  });
  
  document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
  
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
  
  console.log('✅ app.js готов');
});
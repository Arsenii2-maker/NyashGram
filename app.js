// app.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ

const AppState = {
  currentUser: {
    name: localStorage.getItem('nyashgram_name') || "Няша",
    avatar: localStorage.getItem('nyashgram_avatar') || null,
    theme: localStorage.getItem('nyashgram_theme') || "pastel-pink",
    font: localStorage.getItem('nyashgram_font') || "font-cozy"
  }
};

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
  if (nameInput) nameInput.value = AppState.currentUser.name;
  
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
  if (newName) {
    AppState.currentUser.name = newName;
    localStorage.setItem('nyashgram_name', newName);
    const display = document.getElementById('usernameDisplay');
    if (display) display.textContent = `@${newName}`;
  }
  showScreen('contactsScreen');
}

// Проверка авторизации
function checkAuth() {
  if (localStorage.getItem('nyashgram_entered') === 'true') {
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
        showScreen('contactsScreen');
        if (typeof renderContacts === 'function') {
          setTimeout(renderContacts, 100);
        }
      }
    });
  }
  
  // ===== ЭКРАН ПРОФИЛЯ =====
  const saveProfileBtn = document.getElementById('saveBtn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
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
  
  // Проверка авторизации
  checkAuth();
  
  // Экспорт в глобальную область
  window.showScreen = showScreen;
  window.applyTheme = applyTheme;
  window.applyFont = applyFont;
  window.AppState = AppState;
  window.generateCode = generateCode;
  
  console.log('✅ app.js готов');
});
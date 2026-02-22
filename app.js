// app.js — ПОЛНЫЙ ИСПРАВЛЕННЫЙ

const firebaseConfig = {
  apiKey: "AIzaSyCqTm_oMEVRjOwodVrhmWHLNl1DA4x9sUQ",
  authDomain: "nyashgram-e9f69.firebaseapp.com",
  projectId: "nyashgram-e9f69",
  storageBucket: "nyashgram-e9f69.firebasestorage.app",
  messagingSenderId: "54620743155",
  appId: "1:54620743155:web:4db4690057b103ef859e86",
  measurementId: "G-KXXQTJVEGV"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
let currentTheme = localStorage.getItem('nyashgram_theme') || 'pastel-pink';
let currentMode = localStorage.getItem('nyashgram_mode') || 'light';
let currentFont = localStorage.getItem('nyashgram_font') || 'font-cozy';

// ===== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ =====
function showScreen(id) {
  console.log('📱 Переключаем на экран:', id);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
  
  // Если открыли экран друзей, обновляем список
  if (id === 'friendsScreen' && typeof renderContacts === 'function') {
    setTimeout(renderContacts, 100);
  }
}

// ===== СИСТЕМА ТЕМ =====
function setTheme(theme, mode) {
  console.log('🎨 Применяем тему:', theme, mode);
  
  // Удаляем все классы тем и режимов
  document.body.classList.remove(
    'theme-pastel-pink', 'theme-milk-rose', 'theme-night-blue',
    'theme-lo-fi-beige', 'theme-soft-lilac', 'theme-forest-mint',
    'light-mode', 'dark-mode'
  );
  
  // Добавляем новые классы
  document.body.classList.add(`theme-${theme}`);
  document.body.classList.add(mode + '-mode');
  
  // Сохраняем
  currentTheme = theme;
  currentMode = mode;
  localStorage.setItem('nyashgram_theme', theme);
  localStorage.setItem('nyashgram_mode', mode);
  
  // Обновляем кнопку темы
  const modeBtn = document.getElementById('themeModeToggle');
  if (modeBtn) modeBtn.textContent = mode === 'light' ? '☀️' : '🌙';
  
  // Обновляем активные кнопки тем
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) btn.classList.add('active');
  });
  
  console.log('✅ Тема установлена:', theme, mode);
}

function toggleMode() {
  setTheme(currentTheme, currentMode === 'light' ? 'dark' : 'light');
}

// ===== СИСТЕМА ШРИФТОВ =====
function applyFont(fontClass) {
  console.log('✍️ Применяем шрифт:', fontClass);
  
  // Удаляем все классы шрифтов
  document.body.classList.remove(
    'font-system', 'font-rounded', 'font-cozy',
    'font-elegant', 'font-bold-soft', 'font-mono-cozy'
  );
  
  // Добавляем новый шрифт
  document.body.classList.add(fontClass);
  
  // Сохраняем
  currentFont = fontClass;
  localStorage.setItem('nyashgram_font', fontClass);
  
  // Обновляем активные кнопки шрифтов
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === fontClass) btn.classList.add('active');
  });
  
  console.log('✅ Шрифт установлен:', fontClass);
}

// ===== ЗАГРУЗКА =====
function showLoading(msg) {
  const overlay = document.getElementById('loadingOverlay');
  const msgEl = document.getElementById('loadingMessage');
  if (msgEl) msgEl.textContent = msg;
  if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ===== EMAIL РЕГИСТРАЦИЯ =====
async function registerWithEmail(name, email, password) {
  try {
    showLoading('создаём аккаунт...');
    
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    await user.sendEmailVerification();
    await user.updateProfile({ displayName: name });
    
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      theme: currentTheme,
      mode: currentMode,
      font: currentFont,
      createdAt: new Date()
    });
    
    hideLoading();
    alert('✅ письмо отправлено!');
    showScreen('loginMethodScreen');
    return true;
  } catch (error) {
    hideLoading();
    alert('❌ ' + (error.message || 'ошибка регистрации'));
    return false;
  }
}

// ===== EMAIL ВХОД =====
async function loginWithEmail(email, password) {
  try {
    showLoading('вход...');
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      hideLoading();
      alert('❌ подтверди email');
      return false;
    }
    
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      const userData = doc.data();
      if (userData.theme) setTheme(userData.theme, userData.mode || 'light');
      if (userData.font) applyFont(userData.font);
    }
    
    localStorage.setItem('nyashgram_user', user.uid);
    
    hideLoading();
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
    return true;
  } catch (error) {
    hideLoading();
    alert('❌ ' + (error.message || 'ошибка входа'));
    return false;
  }
}

// ===== АНОНИМНЫЙ ВХОД =====
async function loginAnonymously() {
  try {
    showLoading('создаём гостя...');
    await auth.signInAnonymously();
    hideLoading();
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
    return true;
  } catch (error) {
    hideLoading();
    alert('❌ ' + error.message);
    return false;
  }
}

// ===== ВЫХОД =====
async function logout() {
  await auth.signOut();
  localStorage.removeItem('nyashgram_user');
  showScreen('loginMethodScreen');
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram загружается...');
  
  // Применяем сохранённые настройки
  setTheme(currentTheme, currentMode);
  applyFont(currentFont);
  
  // ===== КНОПКИ ВХОДА =====
  document.getElementById('emailMethodBtn')?.addEventListener('click', () => {
    showScreen('emailRegisterScreen');
  });
  
  document.getElementById('anonymousMethodBtn')?.addEventListener('click', loginAnonymously);
  
  // ===== НАВИГАЦИЯ НАЗАД =====
  const backButtons = [
    'backToLoginFromRegBtn', 'backFromEmailLoginBtn', 'backToLoginFromVerifyBtn',
    'backFromSearchBtn', 'backFromSettingsBtn', 'backBtn'
  ];
  
  backButtons.forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      showScreen('friendsScreen');
    });
  });
  
  // ===== ССЫЛКИ =====
  document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailLoginScreen');
  });
  
  document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailRegisterScreen');
  });
  
  // ===== РЕГИСТРАЦИЯ =====
  document.getElementById('registerBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('regName')?.value;
    const email = document.getElementById('regEmail')?.value;
    const pass = document.getElementById('regPassword')?.value;
    const confirm = document.getElementById('regConfirmPassword')?.value;
    const errorEl = document.getElementById('regError');
    
    if (!name || !email || !pass || !confirm) {
      if (errorEl) errorEl.textContent = 'заполни все поля';
      return;
    }
    
    if (pass !== confirm) {
      if (errorEl) errorEl.textContent = 'пароли не совпадают';
      return;
    }
    
    if (pass.length < 6) {
      if (errorEl) errorEl.textContent = 'пароль минимум 6 символов';
      return;
    }
    
    if (errorEl) errorEl.textContent = '';
    await registerWithEmail(name, email, pass);
  });
  
  // ===== ВХОД =====
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail')?.value;
    const pass = document.
      getElementById('loginPassword')?.value;
    const errorEl = document.getElementById('loginError');
    
    if (!email || !pass) {
      if (errorEl) errorEl.textContent = 'введи email и пароль';
      return;
    }
    
    if (errorEl) errorEl.textContent = '';
    await loginWithEmail(email, pass);
  });
  
  // ===== ПОДТВЕРЖДЕНИЕ EMAIL =====
  document.getElementById('checkVerificationBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        showLoading('вход выполнен...');
        setTimeout(() => {
          hideLoading();
          showScreen('friendsScreen');
          if (typeof renderContacts === 'function') renderContacts();
        }, 1000);
      } else {
        alert('❌ email ещё не подтверждён');
      }
    }
  });
  
  document.getElementById('resendEmailBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.sendEmailVerification();
      alert('✅ письмо отправлено повторно');
    }
  });
  
  // ===== КНОПКИ ГЛАВНОГО ЭКРАНА =====
  document.getElementById('addFriendBtn')?.addEventListener('click', () => {
    alert('🔍 поиск друзей скоро будет');
  });
  
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    // Загружаем текущие настройки
    document.getElementById('settingsName').value = localStorage.getItem('nyashgram_name') || '';
    document.getElementById('settingsUsername').value = localStorage.getItem('nyashgram_username') || '';
    
    const emailEl = document.getElementById('profileEmail');
    if (emailEl) emailEl.textContent = auth.currentUser?.email || 'нет email';
    
    showScreen('settingsScreen');
  });
  
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
  // ===== СОХРАНЕНИЕ НАСТРОЕК =====
  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const name = document.getElementById('settingsName')?.value.trim();
    const username = document.getElementById('settingsUsername')?.value.trim();
    
    if (name) localStorage.setItem('nyashgram_name', name);
    if (username) localStorage.setItem('nyashgram_username', username);
    
    // Возвращаемся на главный экран
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
  });
  
  // ===== КНОПКИ ТЕМ =====
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      setTheme(theme, currentMode);
    });
  });
  
  // ===== КНОПКИ ШРИФТОВ =====
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const font = btn.dataset.font;
      applyFont(font);
    });
  });
  
  // ===== КНОПКА ТЕМЫ =====
  document.getElementById('themeModeToggle')?.addEventListener('click', toggleMode);
  
  // ===== КНОПКА ГЕНЕРАЦИИ =====
  document.getElementById('settingsGenerateBtn')?.addEventListener('click', () => {
    const randomUsername = 'user_' + Math.floor(Math.random() * 1000);
    document.getElementById('settingsUsername').value = randomUsername;
  });
  
  // ===== ВКЛАДКИ =====
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (typeof renderContacts === 'function') renderContacts();
    });
  });
  
  // ===== ПРОВЕРКА АВТОРИЗАЦИИ =====
  auth.onAuthStateChanged(user => {
    if (user) {
      // Уже вошли
      showScreen('friendsScreen');
      if (typeof renderContacts === 'function') renderContacts();
    } else {
      // Не вошли
      showScreen('loginMethodScreen');
    }
  });
});

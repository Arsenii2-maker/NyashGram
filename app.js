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

// ===== СИСТЕМА ТЕМ (ИСПРАВЛЕНО) =====
function setTheme(theme, mode) {
  console.log('🎨 Применяем тему:', theme, mode);
  
  // Удаляем все классы
  document.body.className = '';
  
  // Добавляем новые классы
  document.body.classList.add(`theme-${theme}`);
  document.body.classList.add(mode + '-mode');
  
  // Добавляем шрифт если есть
  const savedFont = localStorage.getItem('nyashgram_font');
  if (savedFont) {
    document.body.classList.add(savedFont);
  }
  
  // Сохраняем
  currentTheme = theme;
  currentMode = mode;
  localStorage.setItem('nyashgram_theme', theme);
  localStorage.setItem('nyashgram_mode', mode);
  
  // Обновляем кнопку темы
  const modeBtn = document.getElementById('themeModeToggle');
  if (modeBtn) {
    modeBtn.textContent = mode === 'light' ? '☀️' : '🌙';
  }
  
  console.log('✅ Тема установлена');
}

function toggleMode() {
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  setTheme(currentTheme, newMode);
}

// ===== ЭКРАНЫ =====
function showScreen(id) {
  console.log('📱 Переключаем на экран:', id);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
  }
}

// ===== ЗАГРУЗКА =====
function showLoading(msg) {
  const overlay = document.getElementById('loadingOverlay');
  const messageEl = document.getElementById('loadingMessage');
  if (messageEl) messageEl.textContent = msg;
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
    
    // Сохраняем в Firestore
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      theme: currentTheme,
      mode: currentMode,
      createdAt: new Date()
    });
    
    hideLoading();
    alert('✅ письмо отправлено! подтверди email');
    showScreen('loginMethodScreen');
    return true;
  } catch (error) {
    hideLoading();
    let message = 'ошибка регистрации';
    if (error.code === 'auth/email-already-in-use') message = 'email уже используется';
    if (error.code === 'auth/weak-password') message = 'пароль слишком слабый';
    alert('❌ ' + message);
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
      alert('❌ подтверди email сначала');
      return false;
    }
    
    // Загружаем данные пользователя
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      const userData = doc.data();
      if (userData.theme) setTheme(userData.theme, userData.mode || 'light');
    }
    
    localStorage.setItem('nyashgram_user', user.uid);
    
    hideLoading();
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
    return true;
  } catch (error) {
    hideLoading();
    let message = 'ошибка входа';
    if (error.code === 'auth/user-not-found') message = 'пользователь не найден';
    if (error.code === 'auth/wrong-password') message = 'неверный пароль';
    alert('❌ ' + message);
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
    alert('❌ ошибка: ' + error.message);
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
  
  // Применяем сохранённую тему
  setTheme(currentTheme, currentMode);
  
  // ===== КНОПКИ ВХОДА =====
  const emailMethodBtn = document.getElementById('emailMethodBtn');
  const anonymousMethodBtn = document.getElementById('anonymousMethodBtn');
  
  if (emailMethodBtn) {
    emailMethodBtn.addEventListener('click', () => {
      console.log('📧 Выбран вход по email');
      showScreen('emailRegisterScreen');
    });
  } else {
    console.error('❌ emailMethodBtn не найден');
  }
  
  if (anonymousMethodBtn) {
    anonymousMethodBtn.addEventListener('click', () => {
      console.log('👤 Выбран вход гостем');
      loginAnonymously();
    });
  } else {
    console.error('❌ anonymousMethodBtn не найден');
  }
  
  // ===== НАВИГАЦИЯ НАЗАД =====
  const backButtons = [
    'backToLoginFromRegBtn', 'backFromEmailLoginBtn', 'backFromSettingsBtn', 'backBtn'
  ];
  
  backButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        if (id === 'backBtn' || id === 'backFromSettingsBtn') {
          showScreen('friendsScreen');
        } else {
          showScreen('loginMethodScreen');
        }
      });
    }
  });
  
  // ===== ССЫЛКИ =====
  const showLoginLink = document.getElementById('showLoginLink');
  const showRegisterLink = document.getElementById('showRegisterLink');
  
  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('emailLoginScreen');
    });
  }
  
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      showScreen('emailRegisterScreen');
    });
  }
  
  // ===== РЕГИСТРАЦИЯ =====
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
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
  }
  
  // ===== ВХОД =====
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const email = document.getElementById('loginEmail')?.value;
      const pass = document.getElementById('loginPassword')?.value;
      const errorEl = document.getElementById('loginError');
      
      if (!email || !pass) {
        if (errorEl) errorEl.textContent = 'введи email и пароль';
        return;
      }
      
      if (errorEl) errorEl.textContent = '';
      await loginWithEmail(email, pass);
    });
  }
  
  // ===== КНОПКИ ГЛАВНОГО ЭКРАНА =====
  const addFriendBtn = document.getElementById('addFriendBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  
  if (addFriendBtn) {
    addFriendBtn.addEventListener('click', () => {
      alert('🔍 поиск друзей скоро будет');
    });
  }
  
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showScreen('settingsScreen');
    });
  }
  
  // ===== НАСТРОЙКИ =====
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      alert('💾 настройки сохранены');
    });
  }
  
  // ===== КНОПКА ТЕМЫ =====
  const themeModeToggle = document.getElementById('themeModeToggle');
  if (themeModeToggle) {
    themeModeToggle.addEventListener('click', toggleMode);
  }
  
  // ===== КНОПКИ ТЕМ =====
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      setTheme(theme, currentMode);
      
      // Обновляем активный класс
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // ===== ПРОВЕРКА АВТОРИЗАЦИИ =====
  const savedUser = localStorage.getItem('nyashgram_user');
  if (savedUser) {
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
  } else {
    showScreen('loginMethodScreen');
  }
});

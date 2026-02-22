// app.js — ПОЛНЫЙ С ДРУЗЬЯМИ

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

let currentTheme = localStorage.getItem('nyashgram_theme') || 'pastel-pink';
let currentMode = localStorage.getItem('nyashgram_mode') || 'light';
let currentFont = localStorage.getItem('nyashgram_font') || 'font-cozy';

// ===== ПОДСКАЗКИ =====
const loadingTips = [
  "🐱 NyashHelp поможет с любой темой!",
  "🎮 NyashGame знает много игр!",
  "🔮 NyashHoroscope расскажет о звёздах",
  "🍳 NyashCook поделится рецептами",
  "🌸 NyashTalk обожает болтать",
  "👥 Добавляй друзей по юзернейму!",
  "🎨 6 милых тем в настройках",
  "✍️ 6 красивых шрифтов",
  "📌 Чаты можно закреплять",
  "✏️ Чаты можно переименовывать"
];

let tipInterval = null;

function showLoadingScreen(msg = 'Загружаем...', duration = null) {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  document.getElementById('loadingMessage').textContent = msg;
  overlay.style.display = 'flex';
  
  showRandomTip();
  if (tipInterval) clearInterval(tipInterval);
  tipInterval = setInterval(showRandomTip, 3000);
  
  if (duration) setTimeout(hideLoadingScreen, duration);
}

function hideLoadingScreen() {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  if (tipInterval) clearInterval(tipInterval);
  overlay.style.display = 'none';
}

function showRandomTip() {
  const tipEl = document.getElementById('tipText');
  if (!tipEl) return;
  const randomIndex = Math.floor(Math.random() * loadingTips.length);
  tipEl.textContent = loadingTips[randomIndex];
}

// ===== ЭКРАНЫ =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.
    classList.add('active');
  if (id === 'friendsScreen' && typeof renderContacts === 'function') {
    setTimeout(renderContacts, 100);
  }
}

// ===== ТЕМЫ =====
function setTheme(theme, mode) {
  document.body.classList.remove(
    'theme-pastel-pink', 'theme-milk-rose', 'theme-night-blue',
    'theme-lo-fi-beige', 'theme-soft-lilac', 'theme-forest-mint',
    'light-mode', 'dark-mode'
  );
  document.body.classList.add(`theme-${theme}`, mode + '-mode');
  
  currentTheme = theme; currentMode = mode;
  localStorage.setItem('nyashgram_theme', theme);
  localStorage.setItem('nyashgram_mode', mode);
  
  const modeBtn = document.getElementById('themeModeToggle');
  if (modeBtn) modeBtn.textContent = mode === 'light' ? '☀️' : '🌙';
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) btn.classList.add('active');
  });
}

function toggleMode() {
  setTheme(currentTheme, currentMode === 'light' ? 'dark' : 'light');
}

// ===== ШРИФТЫ =====
function applyFont(fontClass) {
  document.body.classList.remove(
    'font-system', 'font-rounded', 'font-cozy',
    'font-elegant', 'font-bold-soft', 'font-mono-cozy'
  );
  document.body.classList.add(fontClass);
  currentFont = fontClass;
  localStorage.setItem('nyashgram_font', fontClass);
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === fontClass) btn.classList.add('active');
  });
}

// ===== РЕГИСТРАЦИЯ =====
async function registerWithEmail(name, email, password) {
  try {
    showLoadingScreen('создаём аккаунт...');
    const user = await auth.createUserWithEmailAndPassword(email, password);
    await user.user.sendEmailVerification();
    await user.user.updateProfile({ displayName: name });
    await db.collection('users').doc(user.user.uid).set({
      name, email, theme: currentTheme, mode: currentMode, font: currentFont
    });
    hideLoadingScreen();
    alert('✅ письмо отправлено!');
    showScreen('loginMethodScreen');
  } catch (error) {
    hideLoadingScreen();
    alert('❌ ' + (error.message || 'ошибка'));
  }
}

// ===== ВХОД =====
async function loginWithEmail(email, password) {
  try {
    showLoadingScreen('вход...');
    const user = await auth.signInWithEmailAndPassword(email, password);
    if (!user.user.emailVerified) {
      hideLoadingScreen();
      alert('❌ подтверди email');
      return;
    }
    hideLoadingScreen();
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
  } catch (error) {
    hideLoadingScreen();
    alert('❌ ' + (error.message || 'ошибка'));
  }
}

// ===== АНОНИМНО =====
async function loginAnonymously() {
  try {
    showLoadingScreen('создаём гостя...');
    await auth.signInAnonymously();
    hideLoadingScreen();
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
  } catch (error) {
    hideLoadingScreen();
    alert('❌ ' + error.message);
  }
}

// ===== ВЫХОД =====
async function logout() {
  await auth.signOut();
  showScreen('loginMethodScreen');
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  setTheme(currentTheme, currentMode);
  applyFont(currentFont);
  
  // Кнопки входа
  document.getElementById('emailMethodBtn')?.addEventListener('click', () => showScreen('emailRegisterScreen'));
  document.getElementById('anonymousMethodBtn')?.addEventListener('click', loginAnonymously);
  
  // Навигация назад
  ['backToLoginFromRegBtn', 'backFromEmailLoginBtn', 'backToLoginFromVerifyBtn', 
   'backFromSearchBtn', 'backFromSettingsBtn', 'backBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => showScreen('friendsScreen'));
  });
  
  // Ссылки
  document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailLoginScreen');
  });
  
  document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailRegisterScreen');
  });
  
  // Регистрация
  document.getElementById('registerBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('regName')?.value;
    const email = document.getElementById('regEmail')?.value;
    const pass = document.getElementById('regPassword')?.value;
    const confirm = document.getElementById('regConfirmPassword')?.value;
    
    if (!name || !email || !pass) return alert('заполни поля');
    if (pass !== confirm) return alert('пароли не совпадают');
    if (pass.length < 6) return alert('пароль минимум 6 символов');
    await registerWithEmail(name, email, pass);
  });
  
  // Вход
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail')?.value;
    const pass = document.getElementById('loginPassword')?.value;
    if (!email || !pass) return alert('введи email и пароль');
    await loginWithEmail(email, pass);
  });
  
  // Подтверждение
  document.getElementById('checkVerificationBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        showLoadingScreen('вход выполнен...', 1500);
        setTimeout(() => {
          hideLoadingScreen();
          showScreen('friendsScreen');
          if (typeof renderContacts === 'function') renderContacts();
        }, 1500);
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
  
  // Кнопки главного экрана
  document.getElementById('addFriendBtn')?.addEventListener('click', () => {
    alert('🔍 поиск друзей (будет скоро)');
  });
  
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    document.getElementById('settingsName').value = localStorage.getItem('nyashgram_name') || '';
    document.getElementById('settingsUsername').value = localStorage.getItem('nyashgram_username') || '';
    document.getElementById('profileEmail').textContent = auth.currentUser?.email || 'гость';
    showScreen('settingsScreen');
  });
  
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const name = document.getElementById('settingsName')?.value;
    const username = document.getElementById('settingsUsername')?.value;
    if (name) localStorage.setItem('nyashgram_name', name);
    if (username) localStorage.setItem('nyashgram_username', username);
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
  });
  
  document.getElementById('settingsGenerateBtn')?.addEventListener('click', () => {
    document.getElementById('settingsUsername').value = 'user_' + Math.floor(Math.random() * 1000);
  });
  
  // Кнопки тем
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme, currentMode));
  });
  
  // Кнопки шрифтов
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFont(btn.dataset.font));
  });
  
  document.getElementById('themeModeToggle')?.addEventListener('click', toggleMode);
  
  // Вкладки
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (typeof renderContacts === 'function') renderContacts();
    });
  });
  
  // Проверка входа
  auth.onAuthStateChanged(user => {
    if (user) {
      showScreen('friendsScreen');
      if (typeof renderContacts === 'function') renderContacts();
    } else {
      showScreen('loginMethodScreen');
    }
  });
});

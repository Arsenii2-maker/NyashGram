// app.js — ПОЛНЫЙ РАБОЧИЙ С 6 ТЕМАМИ И 6 ШРИФТАМИ

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

// ===== ПОДСКАЗКИ ДЛЯ ЭКРАНА ЗАГРУЗКИ =====
const loadingTips = [
  "🐱 NyashHelp поможет с любой темой о приложении!",
  "🎮 NyashGame знает много игр: угадай число, камень-ножницы-бумага!",
  "🔮 NyashHoroscope расскажет, что звёзды приготовили на сегодня",
  "🍳 NyashCook поделится милыми рецептами кексов и печенья!",
  "🌸 NyashTalk обожает болтать и узнавать секретики",
  "🎨 У нас 6 милых тем: pink, rose, blue, beige, lilac, mint!",
  "✍️ Можно менять шрифты в настройках!",
  "💕 Все боты очень любят общаться!",
  "📌 Чатики можно закреплять и переименовывать",
  "🌈 Каждый день новые подсказки!",
  "✨ NyashGram постоянно становится лучше",
  "🍰 NyashCook знает рецепт самых вкусных кексов!",
  "💗 Надеюсь, тебе у нас нравится!"
];

let tipInterval = null;

// ===== ЭКРАН ЗАГРУЗКИ =====
function showLoadingScreen(message = 'Загружаем...', duration = null) {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  
  const msgEl = document.getElementById('loadingMessage');
  if (msgEl) msgEl.textContent = message;
  
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  
  showRandomTip();
  
  if (tipInterval) clearInterval(tipInterval);
  tipInterval = setInterval(showRandomTip, 3000);
  
  if (duration) {
    setTimeout(() => {
      hideLoadingScreen();
    }, duration);
  }
}

function hideLoadingScreen() {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  
  if (tipInterval) {
    clearInterval(tipInterval);
    tipInterval = null;
  }
  
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);
}

function showRandomTip() {
  const tipEl = document.getElementById('tipText');
  const currentEl = document.getElementById('currentTip');
  const totalEl = document.getElementById('totalTips');
  
  if (!tipEl) return;
  
  const randomIndex = Math.floor(Math.random() * loadingTips.length);
  tipEl.textContent = loadingTips[randomIndex];
  
  if (currentEl) currentEl.textContent = randomIndex + 1;
  if (totalEl) totalEl.textContent = loadingTips.length;
}

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

// ===== СИСТЕМА ТЕМ (6 ШТУК) =====
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
  const modeBtn = document.
getElementById('themeModeToggle');
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

// ===== СИСТЕМА ШРИФТОВ (6 ШТУК) =====
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

// ===== EMAIL РЕГИСТРАЦИЯ =====
async function registerWithEmail(name, email, password) {
  try {
    showLoadingScreen('создаём аккаунт...');
    
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
    
    hideLoadingScreen();
    alert('✅ письмо отправлено! проверь почту');
    showScreen('loginMethodScreen');
    return true;
  } catch (error) {
    hideLoadingScreen();
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
    showLoadingScreen('вход...');
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      hideLoadingScreen();
      alert('❌ подтверди email сначала');
      return false;
    }
    
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      const userData = doc.data();
      if (userData.theme) setTheme(userData.theme, userData.mode || 'light');
      if (userData.font) applyFont(userData.font);
    }
    
    localStorage.setItem('nyashgram_user', user.uid);
    
    hideLoadingScreen();
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
    return true;
  } catch (error) {
    hideLoadingScreen();
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
    showLoadingScreen('создаём гостя...');
    await auth.signInAnonymously();
    hideLoadingScreen();
    showScreen('friendsScreen');
    if (typeof renderContacts === 'function') renderContacts();
    return true;
  } catch (error) {
    hideLoadingScreen();
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
  const emailMethodBtn = document.getElementById('emailMethodBtn');
  const anonymousMethodBtn = document.getElementById('anonymousMethodBtn');
  
  if (emailMethodBtn) {
    emailMethodBtn.addEventListener('click', () => {
      showScreen('emailRegisterScreen');
    });
  }
  
  if (anonymousMethodBtn) {
    anonymousMethodBtn.addEventListener('click', loginAnonymously);
  }
  
  // ===== НАВИГАЦИЯ НАЗАД =====
  const backButtons = [
    'backToLoginFromRegBtn', 'backFromEmailLoginBtn', 'backToLoginFromVerifyBtn',
    'backFromSettingsBtn', 'backBtn'
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
  
  // ===== ПОДТВЕРЖДЕНИЕ EMAIL =====
  const checkVerificationBtn = document.getElementById('checkVerificationBtn');
  const resendEmailBtn = document.getElementById('resendEmailBtn');
  
  if (checkVerificationBtn) {
    checkVerificationBtn.addEventListener('click', async () => {
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
  }
  
  if (resendEmailBtn) {
    resendEmailBtn.addEventListener('click', async () => {
      const user = auth.currentUser;
      if (user) {
        await user.sendEmailVerification();
        alert('✅ письмо отправлено повторно');
      }
    });
  }
  // ===== КНОПКИ ГЛАВНОГО ЭКРАНА =====
  const settingsBtn = document.getElementById('settingsBtn');
  
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      // Загружаем текущие настройки
      const nameInput = document.getElementById('settingsName');
      const usernameInput = document.getElementById('settingsUsername');
      const emailEl = document.getElementById('profileEmail');
      
      if (nameInput) nameInput.value = localStorage.getItem('nyashgram_name') || '';
      if (usernameInput) usernameInput.value = localStorage.getItem('nyashgram_username') || '';
      if (emailEl) emailEl.textContent = auth.currentUser?.email || 'гость';
      
      // Тип аккаунта
      const typeEl = document.getElementById('profileType');
      if (typeEl) {
        if (auth.currentUser?.isAnonymous) {
          typeEl.textContent = '👤 гостевой аккаунт';
        } else {
          typeEl.textContent = '✅ постоянный аккаунт';
        }
      }
      
      showScreen('settingsScreen');
    });
  }
  
  // ===== ВЫХОД =====
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // ===== СОХРАНЕНИЕ НАСТРОЕК =====
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const name = document.getElementById('settingsName')?.value.trim();
      const username = document.getElementById('settingsUsername')?.value.trim();
      
      if (name) localStorage.setItem('nyashgram_name', name);
      if (username) localStorage.setItem('nyashgram_username', username);
      
      showScreen('friendsScreen');
      if (typeof renderContacts === 'function') renderContacts();
    });
  }
  
  // ===== КНОПКА ГЕНЕРАЦИИ =====
  const generateBtn = document.getElementById('settingsGenerateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const randomUsername = 'user_' + Math.floor(Math.random() * 1000);
      document.getElementById('settingsUsername').value = randomUsername;
    });
  }
  
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
  const themeModeToggle = document.getElementById('themeModeToggle');
  if (themeModeToggle) {
    themeModeToggle.addEventListener('click', toggleMode);
  }
  
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
  
  console.log('✅ app.js готов');
});

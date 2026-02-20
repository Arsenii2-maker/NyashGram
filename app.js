// app.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ С EMAIL И APPLE

// ===== FIREBASE КОНФИГУРАЦИЯ =====
const firebaseConfig = {
  apiKey: "AIzaSyCqTm_oMEVRjOwodVrhmWHLNl1DA4x9sUQ",
  authDomain: "nyashgram-e9f69.firebaseapp.com",
  projectId: "nyashgram-e9f69",
  storageBucket: "nyashgram-e9f69.firebasestorage.app",
  messagingSenderId: "54620743155",
  appId: "1:54620743155:web:4db4690057b103ef859e86",
  measurementId: "G-KXXQTJVEGV"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Настройка сохранения сессии
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Провайдер для Apple
const appleProvider = new firebase.auth.OAuthProvider('apple.com');

// Инициализация
if (!window.chatData) {
  window.chatData = {};
}

const AppState = {
  currentUser: {
    uid: null,
    name: localStorage.getItem('nyashgram_name') || "Няша",
    username: localStorage.getItem('nyashgram_username') || "nyasha",
    avatar: localStorage.getItem('nyashgram_avatar') || null,
    email: localStorage.getItem('nyashgram_email') || null,
    theme: localStorage.getItem('nyashgram_theme') || "pastel-pink",
    mode: localStorage.getItem('nyashgram_mode') || "light",
    font: localStorage.getItem('nyashgram_font') || "font-cozy",
    isFake: false // Больше никакого фейка!
  }
};

// База занятых юзернеймов
let takenUsernames = JSON.parse(localStorage.getItem('nyashgram_taken_usernames') || '["nyasha", "nyashhelp_official", "nyashtalk_bot", "nyashgame_bot", "nyashhoroscope_bot", "bestie_nyash", "thinker_deep", "study_buddy", "melody_lover", "midnight_vibes", "admin", "user"]');

// Милые слова
const cuteWords = ["nyasha", "kawaii", "cutie", "sweetie", "honey", "bunny", "kitty", "pudding", "mochi", "cookie", "candy", "sugar", "strawberry", "cherry", "peach", "mango", "cloud", "star", "moon", "sunny", "rainbow", "sparkle", "glitter", "dream"];
const cuteSuffixes = ["chan", "kun", "san", "tan", "chin", "rin", "pii", "nyan", "mimi"];

// ===== СИСТЕМА ТЕМ =====
function setTheme(theme, mode) {
  const currentFont = AppState.currentUser.font;
  
  document.body.className = '';
  document.body.classList.add(`${theme}-${mode}`);
  document.body.classList.add(currentFont);
  
  AppState.currentUser.theme = theme;
  AppState.currentUser.mode = mode;
  localStorage.setItem('nyashgram_theme', theme);
  localStorage.setItem('nyashgram_mode', mode);
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
  
  console.log('✅ Тема установлена:', `${theme}-${mode}`);
}

function toggleMode() {
  const newMode = AppState.currentUser.mode === 'light' ? 'dark' : 'light';
  
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

// ===== ШРИФТЫ =====
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
    if (btn.dataset.font === fontClass) {
      btn.classList.add('active');
    }
  });
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

// ===== EMAIL РЕГИСТРАЦИЯ =====
async function registerWithEmail(name, email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    await user.sendEmailVerification();
    
    await user.updateProfile({
      displayName: name
    });
    
    const username = generateCuteUsername();
    
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      username: username,
      avatar: null,
      theme: 'pastel-pink',
      mode: 'light',
      font: 'font-cozy',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      emailVerified: false
    });
    
    addUsername(username);
    
    console.log('✅ Регистрация успешна!');
    showScreen('verifyEmailScreen');
    
    return { success: true, user };
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    
    let errorMessage = 'Ошибка регистрации';
    switch(error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Этот email уже зарегистрирован';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Некорректный email';
        break;
      case 'auth/weak-password':
        errorMessage = 'Пароль слишком слабый (минимум 6 символов)';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// ===== EMAIL ВХОД =====
async function loginWithEmail(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      return { 
        success: false, 
        error: 'Подтверди email по ссылке в письме',
        needVerification: true 
      };
    }
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    AppState.currentUser = {
      uid: user.uid,
      name: userData.name,
      username: userData.username,
      email: user.email,
      avatar: userData.avatar,
      theme: userData.theme || 'pastel-pink',
      mode: userData.mode || 'light',
      font: userData.font || 'font-cozy',
      isFake: false
    };
    
    localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
    localStorage.setItem('nyashgram_name', userData.name);
    localStorage.setItem('nyashgram_username', userData.username);
    localStorage.setItem('nyashgram_email', user.email);
    localStorage.setItem('nyashgram_theme', userData.theme || 'pastel-pink');
    localStorage.setItem('nyashgram_mode', userData.mode || 'light');
    localStorage.setItem('nyashgram_font', userData.font || 'font-cozy');
    localStorage.setItem('nyashgram_entered', 'true');
    
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    console.log('✅ Вход успешен!');
    showScreen('contactsScreen');
    if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
    
    return { success: true, user };
  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    
    let errorMessage = 'Ошибка входа';
    switch(error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Пользователь не найден';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Неверный пароль';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Некорректный email';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
}

// ===== APPLE ВХОД =====
async function loginWithApple() {
  try {
    const result = await auth.signInWithPopup(appleProvider);
    const user = result.user;
    
    // Проверяем, есть ли пользователь в базе
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      // Новый пользователь - создаём профиль
      const username = generateCuteUsername();
      const name = user.displayName || 'Apple User';
      
      await db.collection('users').doc(user.uid).set({
        name: name,
        email: user.email,
        username: username,
        avatar: user.photoURL,
        theme: 'pastel-pink',
        mode: 'light',
        font: 'font-cozy',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        emailVerified: true // Apple аккаунты уже подтверждены
      });
      
      addUsername(username);
    }
    
    // Загружаем данные пользователя
    const userData = (await db.collection('users').doc(user.uid).get()).data();
    
    AppState.currentUser = {
      uid: user.uid,
      name: userData.name,
      username: userData.username,
      email: user.email,
      avatar: userData.avatar,
      theme: userData.theme || 'pastel-pink',
      mode: userData.mode || 'light',
      font: userData.font || 'font-cozy',
      isFake: false
    };
    
    localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
    localStorage.setItem('nyashgram_name', userData.name);
    localStorage.setItem('nyashgram_username', userData.username);
    localStorage.setItem('nyashgram_email', user.email);
    localStorage.setItem('nyashgram_theme', userData.theme || 'pastel-pink');
    localStorage.setItem('nyashgram_mode', userData.mode || 'light');
    localStorage.setItem('nyashgram_font', userData.font || 'font-cozy');
    localStorage.setItem('nyashgram_entered', 'true');
    
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    console.log('✅ Вход через Apple успешен!');
    showScreen('contactsScreen');
    if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка входа через Apple:', error);
    
    let errorMessage = 'Ошибка входа через Apple';
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Вход отменён';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ===== ВЫХОД =====
async function logout() {
  try {
    await auth.signOut();
    
    localStorage.removeItem('nyashgram_user');
    localStorage.removeItem('nyashgram_entered');
    localStorage.removeItem('nyashgram_name');
    localStorage.removeItem('nyashgram_username');
    localStorage.removeItem('nyashgram_email');
    
    AppState.currentUser = {
      name: "Няша",
      username: "nyasha",
      avatar: null,
      theme: 'pastel-pink',
      mode: 'light',
      font: 'font-cozy',
      isFake: false
    };
    
    setTheme('pastel-pink', 'light');
    applyFont('font-cozy');
    
    showScreen('loginMethodScreen');
    console.log('✅ Выход выполнен');
  } catch (error) {
    console.error('❌ Ошибка выхода:', error);
  }
}

// ===== НАСТРОЙКИ =====
function loadSettingsIntoUI() {
  document.getElementById('settingsName').value = AppState.currentUser.name;
  document.getElementById('settingsUsername').value = AppState.currentUser.username;
  
  const emailEl = document.getElementById('profileEmail');
  if (emailEl) {
    emailEl.textContent = AppState.currentUser.email || 'Нет email';
  }
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === AppState.currentUser.theme) {
      btn.classList.add('active');
    }
  });
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.font === AppState.currentUser.font) {
      btn.classList.add('active');
    }
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

// ===== ПРОВЕРКА АВТОРИЗАЦИИ =====
function checkAuth() {
  const savedUser = localStorage.getItem('nyashgram_user');
  
  // Сначала устанавливаем тему по умолчанию
  setTheme('pastel-pink', 'light');
  applyFont('font-cozy');
  
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    AppState.currentUser = { ...AppState.currentUser, ...userData, isFake: false };
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    showScreen('contactsScreen');
  } else {
    showScreen('loginMethodScreen');
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram загружается...');
  
  // ===== НАВИГАЦИЯ =====
  document.getElementById('emailMethodBtn')?.addEventListener('click', () => {
    console.log('📧 Выбран вход по email');
    showScreen('emailRegisterScreen');
  });
  
  document.getElementById('appleMethodBtn')?.addEventListener('click', async () => {
    console.log('🍎 Выбран вход через Apple');
    const result = await loginWithApple();
    if (!result.success) {
      alert(result.error || 'Ошибка входа через Apple');
    }
  });
  
  document.getElementById('backToLoginFromRegBtn')?.addEventListener('click', () => {
    showScreen('loginMethodScreen');
  });
  
  document.getElementById('backFromEmailLoginBtn')?.addEventListener('click', () => {
    showScreen('loginMethodScreen');
  });
  
  document.getElementById('backToLoginFromVerifyBtn')?.addEventListener('click', () => {
    showScreen('loginMethodScreen');
  });
  
  document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailLoginScreen');
  });
  
  document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailRegisterScreen');
  });
  
  // ===== EMAIL РЕГИСТРАЦИЯ =====
  document.getElementById('registerBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    const errorEl = document.getElementById('regError');
    
    if (!name) {
      errorEl.textContent = 'Введи имя!';
      return;
    }
    
    if (!email || !email.includes('@')) {
      errorEl.textContent = 'Введи корректный email!';
      return;
    }
    
    if (password.length < 6) {
      errorEl.textContent = 'Пароль должен быть минимум 6 символов';
      return;
    }
    
    if (password !== confirm) {
      errorEl.textContent = 'Пароли не совпадают';
      return;
    }
    
    errorEl.textContent = '';
    
    const result = await registerWithEmail(name, email, password);
    
    if (!result.success) {
      errorEl.textContent = result.error;
    }
  });
  
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    if (!email || !email.includes('@')) {
      errorEl.textContent = 'Введи корректный email!';
      return;
    }
    
    if (!password) {
      errorEl.textContent = 'Введи пароль!';
      return;
    }
    
    errorEl.textContent = '';
    
    const result = await loginWithEmail(email, password);
    
    if (!result.success) {
      errorEl.textContent = result.error;
      
      if (result.needVerification) {
        showScreen('verifyEmailScreen');
      }
    }
  });
  
  document.getElementById('checkVerificationBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        // После подтверждения email, выполняем вход автоматически
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        AppState.currentUser = {
          uid: user.uid,
          name: userData.name,
          username: userData.username,
          email: user.email,
          avatar: userData.avatar,
          theme: userData.theme || 'pastel-pink',
          mode: userData.mode || 'light',
          font: userData.font || 'font-cozy',
          isFake: false
        };
        
        localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
        localStorage.setItem('nyashgram_name', userData.name);
        localStorage.setItem('nyashgram_username', userData.username);
        localStorage.setItem('nyashgram_email', user.email);
        localStorage.setItem('nyashgram_entered', 'true');
        
        setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
        applyFont(AppState.currentUser.font);
        
        showScreen('contactsScreen');
        if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
      } else {
        alert('Email ещё не подтверждён! Проверь почту и нажми на ссылку.');
      }
    }
  });
  
  document.getElementById('resendEmailBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.sendEmailVerification();
      alert('Письмо отправлено повторно! Проверь почту.');
    }
  });
  
  // ===== НАСТРОЙКИ =====
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
  
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
  document.getElementById('settingsGenerateBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('settingsUsername').value = generateCuteUsername();
    document.getElementById('settingsUsernameError').textContent = '';
  });
  
  const themeModeToggle = document.getElementById('themeModeToggle');
  if (themeModeToggle) {
    themeModeToggle.addEventListener('click', toggleMode);
  }
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme, AppState.currentUser.mode);
    });
  });
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFont(btn.dataset.font));
  });
  
  document.getElementById('searchInput')?.addEventListener('input', function() {
    if (typeof window.filterContactsByUsername === 'function') {
      window.filterContactsByUsername(this.value);
    }
  });
  
  // Проверяем авторизацию
  checkAuth();
  
  window.showScreen = showScreen;
  window.applyFont = applyFont;
  window.AppState = AppState;
  window.toggleMode = toggleMode;
  window.setTheme = setTheme;
  window.logout = logout;
  
  console.log('✅ app.js готов');
});
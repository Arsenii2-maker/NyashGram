// app.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ С EMAIL И ТЕЛЕФОН РЕГИСТРАЦИЕЙ

// ===== FIREBASE КОНФИГУРАЦИЯ =====
// Замените на свои данные из Firebase Console
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
    phoneNumber: localStorage.getItem('nyashgram_phone') || null,
    theme: localStorage.getItem('nyashgram_theme') || "pastel-pink",
    mode: localStorage.getItem('nyashgram_mode') || "light",
    font: localStorage.getItem('nyashgram_font') || "font-cozy",
    isFake: localStorage.getItem('nyashgram_entered') === 'true' && !localStorage.getItem('nyashgram_user')
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

// ===== EMAIL РЕГИСТРАЦИЯ И ВХОД =====

// Регистрация
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

// Вход
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

// ===== НАСТОЯЩАЯ РЕГИСТРАЦИЯ ПО ТЕЛЕФОНУ =====

let recaptchaVerifier;
let confirmationResult;
let recaptchaContainerId = 'recaptcha-container';

// Очистка старой reCAPTCHA
function clearRecaptcha() {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    } catch (e) {
      console.log('Ошибка очистки reCAPTCHA:', e);
    }
  }
  
  // Очищаем контейнер
  const container = document.getElementById(recaptchaContainerId);
  if (container) {
    container.innerHTML = '<div class="recaptcha-loading"><span>⏳ Загрузка капчи...</span></div>';
  }
}

// Инициализация reCAPTCHA (ИСПРАВЛЕННАЯ ВЕРСИЯ)
function setupRecaptcha() {
  // Очищаем старую капчу
  clearRecaptcha();
  
  // Даём время на очистку
  setTimeout(() => {
    const container = document.getElementById(recaptchaContainerId);
    if (!container) {
      console.error('❌ Контейнер reCAPTCHA не найден');
      return;
    }
    
    // Очищаем контейнер перед созданием новой капчи
    container.innerHTML = '';
    
    try {
      // ВАЖНО: создаём новый div для капчи
      const recaptchaDiv = document.createElement('div');
      recaptchaDiv.id = 'recaptcha-widget';
      container.appendChild(recaptchaDiv);
      
      recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-widget', {
        'size': 'normal',
        'callback': () => {
          console.log('✅ reCAPTCHA пройдена');
          const btn = document.getElementById('sendRealCodeBtn');
          if (btn) {
            btn.disabled = false;
            btn.classList.add('active');
          }
        },
        'expired-callback': () => {
          console.log('❌ reCAPTCHA истекла');
          const btn = document.getElementById('sendRealCodeBtn');
          if (btn) {
            btn.disabled = true;
            btn.classList.remove('active');
          }
          // Автоматически обновляем капчу
          setupRecaptcha();
        }
      });
      
      recaptchaVerifier.render().then((widgetId) => {
        console.log('✅ reCAPTCHA отрисована, widgetId:', widgetId);
      }).catch((error) => {
        console.error('❌ Ошибка рендера reCAPTCHA:', error);
        // Пробуем ещё раз через секунду
        setTimeout(() => setupRecaptcha(), 1000);
      });
      
    } catch (error) {
      console.error('❌ Ошибка создания reCAPTCHA:', error);
      // Пробуем ещё раз через секунду
      setTimeout(() => setupRecaptcha(), 1000);
    }
  }, 100);
}

// Отправка SMS (ИСПРАВЛЕННАЯ ВЕРСИЯ)
async function sendSmsCode(phoneNumber) {
  try {
    // Проверяем, есть ли капча
    if (!recaptchaVerifier) {
      console.log('🔄 Капча не найдена, создаём новую...');
      setupRecaptcha();
      // Даём время капче загрузиться
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (!recaptchaVerifier) {
      throw new Error('Не удалось создать капчу');
    }
    
    const appVerifier = recaptchaVerifier;
    console.log('📞 Отправляем SMS на:', phoneNumber);
    
    confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
    
    console.log('✅ SMS отправлен на:', phoneNumber);
    
    // Очищаем капчу после успешной отправки
    setTimeout(() => clearRecaptcha(), 1000);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки SMS:', error);
    
    let errorMessage = 'Ошибка отправки SMS';
    switch(error.code) {
      case 'auth/invalid-phone-number':
        errorMessage = 'Неверный формат номера';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Слишком много попыток. Подожди 1 минуту и попробуй снова';
        // Сбрасываем капчу при этой ошибке
        clearRecaptcha();
        setTimeout(() => setupRecaptcha(), 2000);
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Ошибка сети. Проверь подключение';
        break;
      case 'auth/captcha-check-failed':
        errorMessage = 'Ошибка капчи. Попробуй снова';
        clearRecaptcha();
        setTimeout(() => setupRecaptcha(), 1000);
        break;
      default:
        errorMessage = error.message || 'Неизвестная ошибка';
    }
    
    return { success: false, error: errorMessage };
  }
}

// Подтверждение SMS кода
async function verifySmsCode(code) {
  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    console.log('✅ Вход по телефону успешен:', user.phoneNumber);
    
    // Создаём профиль пользователя если его нет
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      const username = generateCuteUsername();
      await db.collection('users').doc(user.uid).set({
        name: 'Пользователь',
        username: username,
        phoneNumber: user.phoneNumber,
        avatar: null,
        theme: 'pastel-pink',
        mode: 'light',
        font: 'font-cozy',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      addUsername(username);
    }
    
    // Загружаем данные пользователя
    const userData = (await db.collection('users').doc(user.uid).get()).data();
    
    AppState.currentUser = {
      uid: user.uid,
      name: userData.name,
      username: userData.username,
      phoneNumber: user.phoneNumber,
      avatar: userData.avatar,
      theme: userData.theme || 'pastel-pink',
      mode: userData.mode || 'light',
      font: userData.font || 'font-cozy',
      isFake: false
    };
    
    localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
    localStorage.setItem('nyashgram_name', userData.name);
    localStorage.setItem('nyashgram_username', userData.username);
    localStorage.setItem('nyashgram_phone', user.phoneNumber);
    localStorage.setItem('nyashgram_theme', userData.theme || 'pastel-pink');
    localStorage.setItem('nyashgram_mode', userData.mode || 'light');
    localStorage.setItem('nyashgram_font', userData.font || 'font-cozy');
    localStorage.setItem('nyashgram_entered', 'true');
    
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    showScreen('contactsScreen');
    if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка подтверждения кода:', error);
    
    let errorMessage = 'Неверный код';
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Неверный код подтверждения';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ===== ВЫХОД =====
async function logout() {
  try {
    if (!AppState.currentUser.isFake) {
      await auth.signOut();
    }
    localStorage.removeItem('nyashgram_user');
    localStorage.removeItem('nyashgram_entered');
    localStorage.removeItem('nyashgram_name');
    localStorage.removeItem('nyashgram_username');
    localStorage.removeItem('nyashgram_email');
    localStorage.removeItem('nyashgram_phone');
    
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

// Отслеживание состояния аутентификации
auth.onAuthStateChanged(async (user) => {
  if (user && user.emailVerified) {
    console.log('🟢 Пользователь вошёл:', user.email);
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (userData) {
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
    }
  }
});

// ===== ФЕЙКОВАЯ РЕГИСТРАЦИЯ (старая) =====
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

function fakeLogin() {
  AppState.currentUser.isFake = true;
  localStorage.setItem('nyashgram_entered', 'true');
  setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
  applyFont(AppState.currentUser.font);
  showScreen('contactsScreen');
  if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
}

// ===== НАСТРОЙКИ =====
function loadSettingsIntoUI() {
  document.getElementById('settingsName').value = AppState.currentUser.name;
  document.getElementById('settingsUsername').value = AppState.currentUser.username;
  
  const emailEl = document.getElementById('profileEmail');
  if (emailEl) {
    emailEl.textContent = AppState.currentUser.email || AppState.currentUser.phoneNumber || 'Фейковый аккаунт';
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
  const fakeEntered = localStorage.getItem('nyashgram_entered');
  
  // Сначала устанавливаем тему по умолчанию (розовую)
  setTheme('pastel-pink', 'light');
  applyFont('font-cozy');
  
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    AppState.currentUser = { ...AppState.currentUser, ...userData, isFake: false };
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    showScreen('contactsScreen');
  } else if (fakeEntered === 'true') {
    AppState.currentUser.isFake = true;
    showScreen('contactsScreen');
  } else {
    showScreen('loginMethodScreen');
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram загружается...');
  
  // ===== НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ =====
  document.getElementById('phoneMethodBtn')?.addEventListener('click', () => {
    console.log('📱 Выбран вход по телефону (фейк)');
    showScreen('phoneScreen');
  });
  
  document.getElementById('realPhoneMethodBtn')?.addEventListener('click', () => {
    console.log('📱 Выбран вход по телефону (настоящий)');
    
    // Очищаем старую капчу перед показом экрана
    clearRecaptcha();
    
    showScreen('realPhoneScreen');
    
    // Даём время экрану появиться, затем создаём капчу
    setTimeout(() => setupRecaptcha(), 500);
  });
  
  document.getElementById('emailMethodBtn')?.addEventListener('click', () => {
    console.log('📧 Выбран вход по email');
    showScreen('emailRegisterScreen');
  });
  
  document.getElementById('backFromPhoneBtn')?.addEventListener('click', () => {
    showScreen('loginMethodScreen');
  });
  
  document.getElementById('backFromCodeBtn')?.addEventListener('click', () => {
    showScreen('phoneScreen');
  });
  
  document.getElementById('backFromProfileBtn')?.addEventListener('click', () => {
    showScreen('codeScreen');
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
  
  document.getElementById('backFromRealPhoneBtn')?.addEventListener('click', () => {
    clearRecaptcha();
    showScreen('loginMethodScreen');
  });
  
  document.getElementById('backFromSmsBtn')?.addEventListener('click', () => {
    // Не очищаем капчу при возврате на экран телефона, просто переключаем
    showScreen('realPhoneScreen');
  });
  
  document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailLoginScreen');
  });
  
  document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailRegisterScreen');
  });
  
  // ===== НАСТОЯЩАЯ РЕГИСТРАЦИЯ ПО ТЕЛЕФОНУ =====
  const realPhoneInput = document.getElementById('realPhoneNumber');
  const sendRealCodeBtn = document.getElementById('sendRealCodeBtn');

  if (realPhoneInput && sendRealCodeBtn) {
    realPhoneInput.addEventListener('input', function() {
      const phone = this.value.replace(/\D/g, '');
      if (phone.length >= 10) {
        sendRealCodeBtn.classList.add('active');
        sendRealCodeBtn.disabled = false;
      } else {
        sendRealCodeBtn.classList.remove('active');
        sendRealCodeBtn.disabled = true;
      }
    });
  }

  sendRealCodeBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const countryCode = document.getElementById('realCountryCode').value;
    const phone = document.getElementById('realPhoneNumber').value.replace(/\D/g, '');
    const fullPhone = countryCode + phone;
    
    const errorEl = document.getElementById('realPhoneError');
    
    const result = await sendSmsCode(fullPhone);
    
    if (result.success) {
      showScreen('smsCodeScreen');
    } else {
      errorEl.textContent = result.error;
    }
  });

  const smsCodeInput = document.getElementById('smsCodeInput');
  const verifySmsBtn = document.getElementById('verifySmsBtn');

  if (smsCodeInput && verifySmsBtn) {
    smsCodeInput.addEventListener('input', function() {
      if (this.value.length === 6) {
        verifySmsBtn.disabled = false;
        verifySmsBtn.classList.add('active');
      } else {
        verifySmsBtn.disabled = true;
        verifySmsBtn.classList.remove('active');
      }
    });
  }

  verifySmsBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const code = smsCodeInput.value.trim();
    const errorEl = document.getElementById('smsCodeError');
    
    const result = await verifySmsCode(code);
    
    if (!result.success) {
      errorEl.textContent = result.error;
    }
  });

  document.getElementById('resendSmsLink')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const countryCode = document.getElementById('realCountryCode').value;
    const phone = document.getElementById('realPhoneNumber').value.replace(/\D/g, '');
    const fullPhone = countryCode + phone;
    
    await sendSmsCode(fullPhone);
    alert('Код отправлен повторно!');
  });
  
  // ===== ФЕЙКОВАЯ РЕГИСТРАЦИЯ =====
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
        showScreen('profileScreen');
      }
    });
  }
  
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
      AppState.currentUser.isFake = true;
      
      fakeLogin();
    });
  }
  
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
  
  // Проверяем авторизацию и устанавливаем тему
  checkAuth();
  
  window.showScreen = showScreen;
  window.applyFont = applyFont;
  window.AppState = AppState;
  window.generateCode = generateCode;
  window.toggleMode = toggleMode;
  window.setTheme = setTheme;
  window.logout = logout;
  
  console.log('✅ app.js готов');
});
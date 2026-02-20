// app.js — С Email, Google и Анонимным входом

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

// Провайдеры
const googleProvider = new firebase.auth.GoogleAuthProvider();

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
    isAnonymous: false,
    isFake: false
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
// ===== СОВЕТЫ ДЛЯ ЭКРАНА ЗАГРУЗКИ =====
const loadingTips = [
  "⚙️ NyashHelp расскажет про приложение подробнее!",
  "🐱 У NyashTalk можно спросить про любую тему!",
  "🎮 NyashGame знает много игр: угадай число, камень-ножницы-бумага и другие!",
  "🔮 NyashHoroscope расскажет, что звёзды приготовили на сегодня",
  "💕 Bestie всегда поддержит и поднимет настроение",
  "🧠 Философ любит порассуждать о смысле жизни",
  "📚 Учёба поможет с домашкой и напомнит о контрольных",
  "🎧 Music Pal посоветует, что послушать",
  "🌙 Night Chat создан для ночных разговоров под звёздами",
  "🎨 Можно менять темы и шрифты в настройках",
  "📌 Чат можно закрепить вверху списка",
  "✏️ Чат можно переименовать как хочешь",
  "💬 Черновики сохраняются автоматически",
  "🌈 У нас 6 красивых тем оформления",
  "📱 Скоро появятся голосовые сообщения!",
  "🐾 В будущем у каждого будет свой питомец"
];

let tipInterval = null;

// Показать экран загрузки с советами
function showLoadingScreen(message = 'Загружаем твой мирок...', duration = null) {
  showScreen('loadingScreen');
  
  // Обновляем сообщение
  const msgEl = document.getElementById('loadingMessage');
  if (msgEl) msgEl.textContent = message;
  
  // Показываем первый совет
  showRandomTip();
  
  // Меняем советы каждые 3 секунды
  if (tipInterval) clearInterval(tipInterval);
  tipInterval = setInterval(showRandomTip, 3000);
  
  // Если указана длительность, скрываем через время
  if (duration) {
    setTimeout(() => {
      hideLoadingScreen();
    }, duration);
  }
}

// Скрыть экран загрузки
function hideLoadingScreen() {
  if (tipInterval) {
    clearInterval(tipInterval);
    tipInterval = null;
  }
  // Не скрываем сразу, даём время на последний совет
  setTimeout(() => {
    // Проверяем, не показываем ли мы другой экран
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen?.id === 'loadingScreen') {
      showScreen('contactsScreen');
    }
  }, 500);
}

// Показать случайный совет
function showRandomTip() {
  const tipEl = document.getElementById('tipText');
  const currentEl = document.getElementById('currentTip');
  const totalEl = document.getElementById('totalTips');
  
  if (!tipEl) return;
  
  const randomIndex = Math.floor(Math.random() * loadingTips.length);
  tipEl.textContent = loadingTips[randomIndex];
  
  if (currentEl) currentEl.textContent = randomIndex + 1;
  if (totalEl) totalEl.textContent = loadingTips.length;
  
  // Анимация появления
  tipEl.style.animation = 'none';
  tipEl.offsetHeight; // форсируем ререндер
  tipEl.style.animation = 'fadeIn 0.5s ease';
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
    // В начале loginWithGoogle добавьте:
showLoadingScreen('Вход через email...');
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    
    await user.sendEmailVerification();
    await user.updateProfile({ displayName: name });
    
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
      emailVerified: false,
      isAnonymous: false
    });
    
    addUsername(username);
    showScreen('verifyEmailScreen');
    return { success: true };
  } catch (error) {
    let errorMessage = 'Ошибка регистрации';
    if (error.code === 'auth/email-already-in-use') errorMessage = 'Этот email уже зарегистрирован';
    if (error.code === 'auth/weak-password') errorMessage = 'Пароль слишком слабый (минимум 6 символов)';
    // В конце, перед return:
setTimeout(() => hideLoadingScreen(), 1000);
    return { success: false, error: errorMessage };
  }
}

// ===== EMAIL ВХОД =====
async function loginWithEmail(email, password) {
  try {
    // В начале loginWithGoogle добавьте:
showLoadingScreen('Вход через email...');
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    
    if (!user.emailVerified) {
      return { success: false, error: 'Подтверди email по ссылке в письме', needVerification: true };
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
      isAnonymous: false
    };
    
    saveUserToStorage();
    return { success: true };
  } catch (error) {
    let errorMessage = 'Ошибка входа';
    if (error.code === 'auth/user-not-found') errorMessage = 'Пользователь не найден';
    if (error.code === 'auth/wrong-password') errorMessage = 'Неверный пароль';
    // В конце, перед return:
setTimeout(() => hideLoadingScreen(), 1000);
    return { success: false, error: errorMessage };
  }
}

// ===== GOOGLE ВХОД (С ПОДДЕРЖКОЙ ТЕЛЕФОНОВ) =====
async function loginWithGoogle() {
  try {
    console.log('🔄 Начинаем вход через Google...');
    // В начале loginWithGoogle добавьте:
showLoadingScreen('Вход через Google...');

    // Определяем, мобильное устройство или нет
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Мобильное устройство, используем redirect');
      
      // На мобильных используем редирект
      await auth.signInWithRedirect(googleProvider);
      
      // После редиректа результат обработается в getRedirectResult
      return { success: true, redirect: true };
    } else {
      console.log('💻 Десктоп, используем popup');
      
      // На десктопе используем popup
      const result = await auth.signInWithPopup(googleProvider);
      return await handleGoogleSignInResult(result);
    }
  } catch (error) {
    console.error('❌ Ошибка входа через Google:', error);
    
    let errorMessage = 'Ошибка входа через Google';
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Вход отменён';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Всплывающее окно заблокировано. Разрешите всплывающие окна.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
    }
    
    alert(errorMessage);
    // В конце, перед return:
setTimeout(() => hideLoadingScreen(), 1000);
    return { success: false, error: errorMessage };
  }
}

// Обработка результата Google входа
async function handleGoogleSignInResult(result) {
  const user = result.user;
  console.log('✅ Успешный вход через Google:', user.email);
  
  // Проверяем, есть ли пользователь в базе
  const userDoc = await db.collection('users').doc(user.uid).get();
  
  if (!userDoc.exists) {
    // Новый пользователь - создаём профиль
    const username = generateCuteUsername();
    await db.collection('users').doc(user.uid).set({
      name: user.displayName || 'Google User',
      email: user.email,
      username: username,
      avatar: user.photoURL || null,
      theme: 'pastel-pink',
      mode: 'light',
      font: 'font-cozy',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isAnonymous: false
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
    isAnonymous: false
  };
  
  // Сохраняем в localStorage
  localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
  localStorage.setItem('nyashgram_name', userData.name);
  localStorage.setItem('nyashgram_username', userData.username);
  localStorage.setItem('nyashgram_email', user.email);
  localStorage.setItem('nyashgram_entered', 'true');
  
  // Применяем настройки
  setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
  applyFont(AppState.currentUser.font);
  
  // Показываем экран контактов
  showScreen('contactsScreen');
  if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
  
  return { success: true };
}

// Обработка редиректа (для мобильных)
auth.getRedirectResult().then(async (result) => {
  if (result.user) {
    console.log('✅ Результат редиректа получен');
    await handleGoogleSignInResult(result);
  }
}).catch((error) => {
  console.error('❌ Ошибка редиректа:', error);
  alert('Ошибка входа: ' + error.message);
});
// ===== ОБРАБОТКА РЕДИРЕКТА ПОСЛЕ GOOGLE ВХОДА =====
// Этот код должен быть после определения handleGoogleSignInResult

// Обработка редиректа (для мобильных)
auth.getRedirectResult().then(async (result) => {
  console.log('🔄 Проверяем результат редиректа...');
  
  if (result.user) {
    console.log('✅ Результат редиректа получен, пользователь:', result.user.email);
    
    // Показываем индикатор загрузки
    const loading = document.getElementById('loadingIndicator');
    if (loading) loading.style.display = 'block';
    
    try {
      await handleGoogleSignInResult(result);
      console.log('✅ Вход через Google успешно завершён');
    } catch (error) {
      console.error('❌ Ошибка при обработке результата:', error);
      alert('Ошибка входа: ' + error.message);
    } finally {
      if (loading) loading.style.display = 'none';
    }
  } else {
    console.log('ℹ️ Нет результата редиректа');
  }
}).catch((error) => {
  console.error('❌ Ошибка редиректа:', error);
  
  // Показываем ошибку пользователю
  setTimeout(() => {
    alert('Ошибка входа: ' + (error.message || 'Неизвестная ошибка'));
  }, 500);
});

// ===== АНОНИМНЫЙ ВХОД =====
async function loginAnonymously() {
  try {
    console.log('🔄 Начинаем анонимный вход...');
    
    // Показываем экран загрузки
    showLoadingScreen('Создаём гостевой аккаунт...');
    
    const result = await auth.signInAnonymously();
    const user = result.user;
    
    console.log('✅ Анонимный вход успешен:', user.uid);
    
    const username = `guest_${Math.floor(Math.random() * 10000)}`;
    
    AppState.currentUser = {
      uid: user.uid,
      name: 'Гость',
      username: username,
      email: null,
      avatar: null,
      theme: 'pastel-pink',
      mode: 'light',
      font: 'font-cozy',
      isAnonymous: true
    };
    
    // Для анонимного входа сохраняем только в localStorage
    localStorage.setItem('nyashgram_anonymous', 'true');
    localStorage.setItem('nyashgram_entered', 'true');
    localStorage.setItem('nyashgram_name', 'Гость');
    localStorage.setItem('nyashgram_username', username);
    
    // Применяем настройки
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    // Даём время увидеть советы, потом показываем контакты
    setTimeout(() => {
      hideLoadingScreen();
      if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
    }, 2000);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка анонимного входа:', error);
    hideLoadingScreen();
    
    let errorMessage = 'Ошибка анонимного входа';
    if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Анонимный вход не включен в Firebase Console.';
    }
    
    alert(errorMessage);
    return { success: false, error: errorMessage };
  }
}
// ===== СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЯ =====
function saveUserToStorage() {
  localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
  localStorage.setItem('nyashgram_name', AppState.currentUser.name);
  localStorage.setItem('nyashgram_username', AppState.currentUser.username);
  if (AppState.currentUser.email) localStorage.setItem('nyashgram_email', AppState.currentUser.email);
  localStorage.setItem('nyashgram_theme', AppState.currentUser.theme);
  localStorage.setItem('nyashgram_mode', AppState.currentUser.mode);
  localStorage.setItem('nyashgram_font', AppState.currentUser.font);
  localStorage.setItem('nyashgram_entered', 'true');
  
  setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
  applyFont(AppState.currentUser.font);
  
  showScreen('contactsScreen');
  if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
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
    localStorage.removeItem('nyashgram_anonymous');
    
    AppState.currentUser = {
      name: "Няша",
      username: "nyasha",
      avatar: null,
      theme: 'pastel-pink',
      mode: 'light',
      font: 'font-cozy',
      isAnonymous: false
    };
    
    setTheme('pastel-pink', 'light');
    applyFont('font-cozy');
    
    showScreen('loginMethodScreen');
  } catch (error) {
    console.error('❌ Ошибка выхода:', error);
  }
}

// ===== НАСТРОЙКИ =====
function loadSettingsIntoUI() {
  document.getElementById('settingsName').value = AppState.currentUser.name;
  document.getElementById('settingsUsername').value = AppState.currentUser.username;
  
  const emailEl = document.getElementById('profileEmail');
  const typeEl = document.getElementById('profileType');
  
  if (emailEl) {
    emailEl.textContent = AppState.currentUser.email || 'Нет email';
  }
  
  if (typeEl) {
    if (AppState.currentUser.isAnonymous) {
      typeEl.textContent = '⚠️ Анонимный режим - данные не сохраняются';
    } else {
      typeEl.textContent = '✅ Постоянный аккаунт';
    }
  }
  
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
  if (AppState.currentUser.isAnonymous) {
    alert('В анонимном режиме настройки не сохраняются!');
    return;
  }
  
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
  const anonymous = localStorage.getItem('nyashgram_anonymous');
  
  // Показываем загрузку
  showLoadingScreen('Загружаем твой профиль...');
  
  // Устанавливаем тему по умолчанию
  setTheme('pastel-pink', 'light');
  applyFont('font-cozy');
  
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    AppState.currentUser = { ...AppState.currentUser, ...userData };
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('contactsScreen');
    }, 1500);
  } else if (anonymous === 'true') {
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('contactsScreen');
    }, 1500);
  } else {
    // Если не авторизован, сразу показываем экран входа
    hideLoadingScreen();
    showScreen('loginMethodScreen');
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram загружается...');
  
  // Навигация
  document.getElementById('emailMethodBtn')?.addEventListener('click', () => {
    showScreen('emailRegisterScreen');
  });
  
  document.getElementById('googleMethodBtn')?.addEventListener('click', async () => {
  console.log('🌐 Нажата кнопка Google');
  
  // Показываем индикатор загрузки
  const loading = document.getElementById('loadingIndicator');
  if (loading) loading.style.display = 'block';
  
  const result = await loginWithGoogle();
  
  // Если это редирект, индикатор останется
  if (!result.redirect) {
    if (loading) loading.style.display = 'none';
  }
});
  document.getElementById('anonymousMethodBtn')?.addEventListener('click', async () => {
    const result = await loginAnonymously();
    if (!result.success) alert(result.error);
  });
  
  // Навигация назад
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
  
  // Email регистрация
  document.getElementById('registerBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    const errorEl = document.getElementById('regError');
    
    if (!name) return errorEl.textContent = 'Введи имя!';
    if (!email || !email.includes('@')) return errorEl.textContent = 'Введи корректный email!';
    if (password.length < 6) return errorEl.textContent = 'Пароль должен быть минимум 6 символов';
    if (password !== confirm) return errorEl.textContent = 'Пароли не совпадают';
    
    errorEl.textContent = '';
    const result = await registerWithEmail(name, email, password);
    if (!result.success) errorEl.textContent = result.error;
  });
  
  // Email вход
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    if (!email || !email.includes('@')) return errorEl.textContent = 'Введи корректный email!';
    if (!password) return errorEl.textContent = 'Введи пароль!';
    
    errorEl.textContent = '';
    const result = await loginWithEmail(email, password);
    
    if (!result.success) {
      errorEl.textContent = result.error;
      if (result.needVerification) showScreen('verifyEmailScreen');
    }
  });
  
  // Подтверждение email
  document.getElementById('checkVerificationBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
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
          isAnonymous: false
        };
        
        saveUserToStorage();
      } else {
        alert('Email ещё не подтверждён!');
      }
    }
  });
  
  document.getElementById('resendEmailBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.sendEmailVerification();
      alert('Письмо отправлено повторно!');
    }
  });
  
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
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
  document.getElementById('settingsGenerateBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('settingsUsername').value = generateCuteUsername();
    document.getElementById('settingsUsernameError').textContent = '';
  });
  
  // Темы и шрифты
  document.getElementById('themeModeToggle')?.addEventListener('click', toggleMode);
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme, AppState.currentUser.mode));
  });
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFont(btn.dataset.font));
  });
  
  document.getElementById('searchInput')?.addEventListener('input', function() {
    if (typeof window.filterContactsByUsername === 'function') {
      window.filterContactsByUsername(this.value);
    }
  });
  
  checkAuth();
  
  // Экспорт
  window.showScreen = showScreen;
  window.applyFont = applyFont;
  window.AppState = AppState;
  window.toggleMode = toggleMode;
  window.setTheme = setTheme;
  window.logout = logout;
  
  console.log('✅ app.js готов');
});
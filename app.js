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
    console.log('🔄 Регистрация email...');
    
    showLoadingScreen('Создаём аккаунт...');
    
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
      emailVerified: false,
      isAnonymous: false,
      provider: 'email'
    });
    
    addUsername(username);
    
    console.log('✅ Регистрация успешна!');
    
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('verifyEmailScreen');
    }, 1500);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    hideLoadingScreen();
    
    let errorMessage = 'Ошибка регистрации';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Этот email уже зарегистрирован';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Пароль слишком слабый (минимум 6 символов)';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Некорректный email';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ===== EMAIL ВХОД =====
async function loginWithEmail(email, password) {
  try {
    console.log('🔄 Вход по email...');
    
    showLoadingScreen('Выполняем вход...');
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      hideLoadingScreen();
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
      isAnonymous: false
    };
    
    // Сохраняем в localStorage
    localStorage.removeItem('nyashgram_anonymous');
    localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
    localStorage.setItem('nyashgram_name', userData.name);
    localStorage.setItem('nyashgram_username', userData.username);
    localStorage.setItem('nyashgram_email', user.email);
    localStorage.setItem('nyashgram_theme', userData.theme || 'pastel-pink');
    localStorage.setItem('nyashgram_mode', userData.mode || 'light');
    localStorage.setItem('nyashgram_font', userData.font || 'font-cozy');
    localStorage.setItem('nyashgram_entered', 'true');
    
    // Применяем настройки
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('contactsScreen');
      if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
    }, 1500);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    hideLoadingScreen();
    
    let errorMessage = 'Ошибка входа';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Пользователь не найден';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Неверный пароль';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Некорректный email';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ===== GOOGLE ВХОД (ИСПРАВЛЕННАЯ ВЕРСИЯ) =====
async function loginWithGoogle() {
  try {
    console.log('🔄 Начинаем вход через Google...');
    
    // Определяем, мобильное устройство или нет
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Показываем загрузку
    showLoadingScreen('Подключаемся к Google...');
    
    // Настраиваем провайдер
    googleProvider.setCustomParameters({
      prompt: 'select_account' // Всегда показывать выбор аккаунта
    });
    
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
      
      // Скрываем загрузку
      hideLoadingScreen();
      
      return await handleGoogleSignInResult(result);
    }
  } catch (error) {
    console.error('❌ Ошибка входа через Google:', error);
    hideLoadingScreen();
    
    // Специальная обработка для ошибки "account-exists-with-different-credential"
    if (error.code === 'auth/account-exists-with-different-credential') {
      // Аккаунт уже существует с другим провайдером
      const email = error.email;
      const pendingCred = error.credential;
      
      // Спрашиваем пользователя, что делать
      const action = confirm(
        `Аккаунт с email ${email} уже существует.\n\n` +
        `Хотите войти в существующий аккаунт и привязать к нему Google?`
      );
      
      if (action) {
        // Показываем диалог входа для существующего аккаунта
        const password = prompt('Введите пароль от существующего аккаунта:');
        if (password) {
          try {
            // Входим с email/паролем
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Привязываем Google аккаунт
            await userCredential.user.linkWithCredential(pendingCred);
            
            console.log('✅ Аккаунты успешно связаны');
            
            // Загружаем данные пользователя
            const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
            const userData = userDoc.data();
            
            AppState.currentUser = {
              uid: userCredential.user.uid,
              name: userData.name,
              username: userData.username,
              email: userCredential.user.email,
              avatar: userData.avatar,
              theme: userData.theme || 'pastel-pink',
              mode: userData.mode || 'light',
              font: userData.font || 'font-cozy',
              isAnonymous: false
            };
            
            // Сохраняем в localStorage
            localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
            localStorage.setItem('nyashgram_entered', 'true');
            
            setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
            applyFont(AppState.currentUser.font);
            
            showScreen('contactsScreen');
            if (typeof renderContacts === 'function') setTimeout(renderContacts, 100);
            
            return { success: true };
          } catch (linkError) {
            alert('Ошибка при привязке аккаунта: ' + linkError.message);
          }
        }
      }
    }
    
    let errorMessage = 'Ошибка входа через Google';
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Вход отменён';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Всплывающее окно заблокировано';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Ошибка сети';
    }
    
    alert(errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ===== ОБРАБОТКА GOOGLE ВХОДА (СПЕЦИАЛЬНО ДЛЯ SAFARI) =====
async function handleGoogleSignInResult(result) {
  const user = result.user;
  console.log('✅ Успешный вход через Google:', user.email);
  
  showLoadingScreen('Загружаем профиль...');
  
  try {
    // Сохраняем информацию о входе ДО загрузки данных
    localStorage.setItem('google_login_success', 'true');
    localStorage.setItem('google_user_email', user.email);
    localStorage.setItem('google_user_uid', user.uid);
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      console.log('🆕 Новый пользователь Google');
      const username = generateCuteUsername();
      
      const newUser = {
        name: user.displayName || 'Google User',
        email: user.email,
        username: username,
        avatar: user.photoURL || null,
        theme: 'pastel-pink',
        mode: 'light',
        font: 'font-cozy',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        friends: [],
        friendRequests: [],
        online: true,
        providers: ['google']
      };
      
      await db.collection('users').doc(user.uid).set(newUser);
      addUsername(username);
      
      // Сразу сохраняем в AppState
      AppState.currentUser = {
        uid: user.uid,
        name: newUser.name,
        username: username,
        email: user.email,
        avatar: newUser.avatar,
        theme: 'pastel-pink',
        mode: 'light',
        font: 'font-cozy',
        isAnonymous: false
      };
    } else {
      console.log('🟢 Существующий пользователь Google');
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
      
      // Обновляем статус онлайн
      await db.collection('users').doc(user.uid).update({
        online: true,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
    localStorage.setItem('nyashgram_name', AppState.currentUser.name);
    localStorage.setItem('nyashgram_username', AppState.currentUser.username);
    localStorage.setItem('nyashgram_email', user.email);
    localStorage.setItem('nyashgram_theme', AppState.currentUser.theme);
    localStorage.setItem('nyashgram_mode', AppState.currentUser.mode);
    localStorage.setItem('nyashgram_font', AppState.currentUser.font);
    localStorage.setItem('nyashgram_entered', 'true');
    
    // Удаляем флаги
    localStorage.removeItem('google_redirect_started');
    
    // Применяем настройки
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    console.log('✅ Все данные сохранены, переходим на экран друзей');
    
    // Для Safari важно принудительно показать экран
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('friendsScreen');
      if (typeof renderFriendsScreen === 'function') renderFriendsScreen();
    }, 1000);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка при обработке Google входа:', error);
    
    // Проверяем, может у нас уже есть сохранённые данные
    const savedUid = localStorage.getItem('google_user_uid');
    if (savedUid === user.uid) {
      console.log('🔄 Используем сохранённые данные');
      
      AppState.currentUser = {
        uid: user.uid,
        name: localStorage.getItem('nyashgram_name') || 'Google User',
        username: localStorage.getItem('nyashgram_username') || generateCuteUsername(),
        email: user.email,
        avatar: null,
        theme: 'pastel-pink',
        mode: 'light',
        font: 'font-cozy',
        isAnonymous: false
      };
      
      localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
      localStorage.setItem('nyashgram_entered', 'true');
      
      setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
      applyFont(AppState.currentUser.font);
      
      setTimeout(() => {
        hideLoadingScreen();
        showScreen('friendsScreen');
      }, 1000);
      
      return { success: true };
    }
    
    hideLoadingScreen();
    return { success: false, error: error.message };
  }
}
// ===== ПРИВЯЗКА GOOGLE К СУЩЕСТВУЮЩЕМУ АККАУНТУ =====
async function linkGoogleToExistingAccount(email, password, googleCredential) {
  try {
    // Входим с email/паролем
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Привязываем Google
    await user.linkWithCredential(googleCredential);
    
    // Обновляем данные в Firestore
    await db.collection('users').doc(user.uid).update({
      providers: firebase.firestore.FieldValue.arrayUnion('google'),
      googleUid: googleCredential.providerId
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('❌ Ошибка привязки:', error);
    return { success: false, error: error.message };
  }
}
// ===== УЛУЧШЕННАЯ ОБРАБОТКА РЕДИРЕКТА ДЛЯ SAFARI =====
auth.getRedirectResult().then(async (result) => {
  console.log('🔄 Проверяем результат редиректа...');
  
  // Проверяем, есть ли результат
  if (result.user) {
    console.log('✅ Результат редиректа получен:', result.user.email);
    
    // Показываем загрузку
    showLoadingScreen('Завершаем вход...');
    
    try {
      await handleGoogleSignInResult(result);
    } catch (error) {
      console.error('❌ Ошибка обработки:', error);
      
      // Если ошибка, но пользователь есть - пробуем прямой вход
      if (result.user) {
        console.log('🔄 Пробуем прямой вход для пользователя:', result.user.email);
        
        // Сохраняем минимальные данные
        AppState.currentUser = {
          uid: result.user.uid,
          name: result.user.displayName || 'Google User',
          username: localStorage.getItem('nyashgram_username') || generateCuteUsername(),
          email: result.user.email,
          avatar: result.user.photoURL || null,
          theme: 'pastel-pink',
          mode: 'light',
          font: 'font-cozy',
          isAnonymous: false
        };
        
        localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
        localStorage.setItem('nyashgram_entered', 'true');
        localStorage.setItem('google_emergency_login', 'true');
        
        setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
        applyFont(AppState.currentUser.font);
        
        setTimeout(() => {
          hideLoadingScreen();
          showScreen('friendsScreen');
        }, 1000);
      }
    }
  } else {
    console.log('ℹ️ Нет результата редиректа');
    
    // Проверяем, может мы уже вошли ранее
    const savedUser = localStorage.getItem('nyashgram_user');
    const emergencyLogin = localStorage.getItem('google_emergency_login');
    
    if (savedUser) {
      console.log('🔄 Есть сохранённый пользователь, выполняем вход');
      const userData = JSON.parse(savedUser);
      AppState.currentUser = userData;
      setTheme(userData.theme, userData.mode);
      applyFont(userData.font);
      showScreen('friendsScreen');
    } else if (emergencyLogin) {
      console.log('🔄 Был экстренный вход');
      localStorage.removeItem('google_emergency_login');
    } else {
      hideLoadingScreen();
    }
  }
}).catch((error) => {
  console.error('❌ Ошибка редиректа:', error);
  
  // Для Safari пробуем восстановить сессию
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const savedUser = localStorage.getItem('nyashgram_user');
    if (savedUser) {
      console.log('🔄 Safari: восстанавливаем сессию');
      const userData = JSON.parse(savedUser);
      AppState.currentUser = userData;
      setTheme(userData.theme, userData.mode);
      applyFont(userData.font);
      showScreen('friendsScreen');
    } else {
      hideLoadingScreen();
      alert('Не удалось войти через Google. Используй email или попробуй ещё раз.');
    }
  } else {
    hideLoadingScreen();
    alert('Ошибка входа: ' + (error.message || 'Неизвестная ошибка'));
  }
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

// В начало функции checkAuth() добавьте:
function checkAuth() {
  console.log('🔍 Проверка авторизации...');
  
  // Сначала проверяем, может мы уже вошли через Google
  const savedUser = localStorage.getItem('nyashgram_user');
  const googleSuccess = localStorage.getItem('google_login_success');
  const emergencyLogin = localStorage.getItem('google_emergency_login');
  
  if (savedUser) {
    console.log('✅ Найден сохранённый пользователь');
    const userData = JSON.parse(savedUser);
    AppState.currentUser = { ...AppState.currentUser, ...userData };
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    showScreen('friendsScreen');
    return;
  }
  
  if (googleSuccess || emergencyLogin) {
    console.log('🔄 Был успешный Google вход, но данные не сохранились');
    localStorage.removeItem('google_login_success');
    localStorage.removeItem('google_emergency_login');
    // Показываем экран входа, но с сообщением
    showScreen('loginMethodScreen');
    setTimeout(() => {
      alert('Произошла ошибка при входе. Пожалуйста, войди через email или попробуй ещё раз.');
    }, 500);
    return;
  }
  
  // Если ничего нет - показываем экран входа
  showScreen('loginMethodScreen');
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
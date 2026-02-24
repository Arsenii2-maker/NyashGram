// app.js — ПОЛНЫЙ С РЕАЛЬНЫМИ ДРУЗЬЯМИ

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

// Настройка сохранения сессии
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
let currentTheme = localStorage.getItem('nyashgram_theme') || 'pastel-pink';
let currentMode = localStorage.getItem('nyashgram_mode') || 'light';
let currentFont = localStorage.getItem('nyashgram_font') || 'font-cozy';
let currentUser = null;

// ===== ПОДСКАЗКИ ДЛЯ ЗАГРУЗКИ =====
const loadingTips = [
  "🐱 NyashHelp поможет с любой темой!",
  "🎮 NyashGame знает много игр!",
  "🔮 NyashHoroscope расскажет о звёздах",
  "🍳 NyashCook поделится рецептами",
  "🌸 NyashTalk обожает болтать",
  "👥 Ищи друзей по юзернейму!",
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

// app.js — ПОЛНЫЙ С ПЛАВНЫМИ ПЕРЕХОДАМИ

// ===== СОСТОЯНИЕ =====
let isLoading = true;
let loadingStartTime = Date.now();

// ===== ПЛАВНОЕ ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ =====
function showScreen(id) {
  console.log('📱 Переключаем на экран:', id);
  
  const currentScreen = document.querySelector('.screen.active');
  const nextScreen = document.getElementById(id);
  
  if (!nextScreen) return;
  
  if (currentScreen) {
    // Плавно скрываем текущий экран
    currentScreen.style.opacity = '0';
    currentScreen.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      currentScreen.classList.remove('active');
      
      // Показываем новый экран с анимацией
      nextScreen.classList.add('active');
      nextScreen.style.opacity = '0';
      nextScreen.style.transform = 'scale(0.98)';
      
      setTimeout(() => {
        nextScreen.style.opacity = '1';
        nextScreen.style.transform = 'scale(1)';
      }, 50);
    }, 200);
  } else {
    // Если нет текущего экрана, просто показываем новый
    nextScreen.classList.add('active');
    nextScreen.style.opacity = '0';
    nextScreen.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      nextScreen.style.opacity = '1';
      nextScreen.style.transform = 'scale(1)';
    }, 50);
  }
  
  if (id === 'friendsScreen' && typeof window.renderContacts === 'function') {
    // Показываем загрузку контактов
    const list = document.getElementById('friendsList');
    if (list) {
      list.innerHTML = '<div class="loading-contacts">Загрузка контактов...</div>';
    }
    
    // Загружаем контакты с небольшой задержкой для плавности
    setTimeout(() => {
      window.renderContacts();
    }, 300);
  }
}

// ===== УЛУЧШЕННЫЙ ЭКРАН ЗАГРУЗКИ =====
function showLoadingScreen(message = 'Загружаем...', minDuration = 1000) {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  
  const msgEl = document.getElementById('loadingMessage');
  if (msgEl) msgEl.textContent = message;
  
  overlay.style.display = 'flex';
  overlay.style.opacity = '0';
  
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 50);
  
  showRandomTip();
  if (tipInterval) clearInterval(tipInterval);
  tipInterval = setInterval(showRandomTip, 3000);
  
  loadingStartTime = Date.now();
  isLoading = true;
  
  return new Promise((resolve) => {
    window.loadingResolve = resolve;
  });
}

function hideLoadingScreen() {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  
  const elapsedTime = Date.now() - loadingStartTime;
  const minDuration = 1000; // Минимальное время показа загрузки
  const delay = Math.max(0, minDuration - elapsedTime);
  
  setTimeout(() => {
    overlay.style.opacity = '0';
    
    if (tipInterval) {
      clearInterval(tipInterval);
      tipInterval = null;
    }
    
    setTimeout(() => {
      overlay.style.display = 'none';
      isLoading = false;
      if (window.loadingResolve) {
        window.loadingResolve();
        window.loadingResolve = null;
      }
    }, 300);
  }, delay);
}

// ===== ПРОВЕРКА АВТОРИЗАЦИИ (ИСПРАВЛЕНО) =====
async function checkAuthAndRedirect() {
  showLoadingScreen('Загружаем профиль...');
  
  const user = auth.currentUser;
  
  if (user && !user.isAnonymous) {
    try {
      await loadUserData(user.uid);
      
      // Загружаем друзей
      if (typeof window.loadFriends === 'function') {
        await window.loadFriends();
      }
      
      hideLoadingScreen();
      showScreen('friendsScreen');
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      hideLoadingScreen();
      showScreen('loginMethodScreen');
    }
  } else if (user && user.isAnonymous) {
    hideLoadingScreen();
    showScreen('friendsScreen');
  } else {
    hideLoadingScreen();
    showScreen('loginMethodScreen');
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram v3.5 загружается...');
  
  setTheme(currentTheme, currentMode);
  applyFont(currentFont);
  
  // Кнопки входа
  document.getElementById('emailMethodBtn')?.addEventListener('click', () => {
    showLoadingScreen('Переходим к регистрации...', 500);
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('emailRegisterScreen');
    }, 500);
  });
  
  document.getElementById('anonymousMethodBtn')?.addEventListener('click', async () => {
    showLoadingScreen('Создаём гостевой аккаунт...', 1000);
    await loginAnonymously();
    hideLoadingScreen();
  });
  
  // Навигация назад (ИСПРАВЛЕНО)
  document.getElementById('backToLoginFromRegBtn')?.addEventListener('click', () => {
    showScreen('loginMethodScreen');
  });
  
  document.getElementById('backFromEmailLoginBtn')?.addEventListener('click', () => {
    showScreen('loginMethodScreen');
  });
  
  document.getElementById('backToLoginFromVerifyBtn')?.addEventListener('click', () => {
    showScreen('loginMethodScreen');
  });
  
  document.getElementById('backFromSearchBtn')?.addEventListener('click', () => {
    showScreen('friendsScreen');
  });
  
  document.getElementById('backFromSettingsBtn')?.addEventListener('click', () => {
    showScreen('friendsScreen');
  });
  
  document.getElementById('backBtn')?.addEventListener('click', () => {
    showScreen('friendsScreen');
  });
  
  // Проверяем авторизацию
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    checkAuthAndRedirect();
  });
});

// ===== СИСТЕМА ТЕМ =====
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

// ===== СИСТЕМА ШРИФТОВ =====
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
    
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    await user.sendEmailVerification();
    await user.updateProfile({ displayName: name });
    
    // Создаём профиль в Firestore
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      username: name.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000),
      avatar: null,
      theme: currentTheme,
      mode: currentMode,
      font: currentFont,
      friends: [],
      friendRequests: [],
      online: true,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
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

// ===== ВХОД =====
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
    
    // Обновляем статус онлайн
    await db.collection('users').doc(user.uid).update({
      online: true,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    currentUser = user;
    hideLoadingScreen();
    showScreen('friendsScreen');
    if (typeof window.loadFriends === 'function') window.loadFriends();
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
    const userCredential = await auth.signInAnonymously();
    currentUser = userCredential.user;
    hideLoadingScreen();
    showScreen('friendsScreen');
    if (typeof window.renderContacts === 'function') window.renderContacts();
    return true;
  } catch (error) {
    hideLoadingScreen();
    alert('❌ ' + error.message);
    return false;
  }
}

// ===== ВЫХОД =====
async function logout() {
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    await db.collection('users').doc(auth.currentUser.uid).update({
      online: false,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  await auth.signOut();
  currentUser = null;
  showScreen('loginMethodScreen');
}

// ===== 🔥 НОВЫЕ ФУНКЦИИ ДЛЯ ДРУЗЕЙ =====

// ПОИСК ПОЛЬЗОВАТЕЛЕЙ
async function searchUsers(query) {
  if (!query || query.length < 2 || !auth.currentUser) return [];
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('username', '>=', query.toLowerCase())
      .where('username', '<=', query.toLowerCase() + '\uf8ff')
      .limit(20)
      .get();
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.id !== auth.currentUser.uid);
  } catch (error) {
    console.error('Ошибка поиска:', error);
    return [];
  }
}

// ===== ОТПРАВКА ЗАПРОСА В ДРУЗЬЯ (ИСПРАВЛЕНО) =====
async function sendFriendRequest(toUserId) {
  if (!auth.currentUser) return { success: false, error: 'не авторизован' };
  
  try {
    // Создаём объект запроса БЕЗ serverTimestamp внутри arrayUnion
    const request = {
      from: auth.currentUser.uid,
      timestamp: Date.now(), // Используем обычную дату вместо serverTimestamp
      status: 'pending'
    };
    
    // Отправляем запрос
    await db.collection('users').doc(toUserId).update({
      friendRequests: firebase.firestore.FieldValue.arrayUnion(request)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки запроса:', error);
    return { success: false, error: error.message };
  }
}


// ===== ПРИНЯТИЕ ЗАПРОСА (ИСПРАВЛЕНО) =====
async function acceptFriendRequest(fromUserId) {
  if (!auth.currentUser) return { success: false, error: 'не авторизован' };
  
  try {
    console.log('✅ Принимаем заявку от:', fromUserId);
    
    // Добавляем друга в свой список
    await db.collection('users').doc(auth.currentUser.uid).update({
      friends: firebase.firestore.FieldValue.arrayUnion(fromUserId)
    });
    
    // Добавляем себя в список друга
    await db.collection('users').doc(fromUserId).update({
      friends: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
    });
    
    // Получаем текущие заявки
    const userRef = db.collection('users').doc(auth.currentUser.uid);
    const userDoc = await userRef.get();
    const requests = userDoc.data().friendRequests || [];
    
    // Удаляем принятую заявку
    const updatedRequests = requests.filter(req => req.from !== fromUserId);
    
    // Обновляем
    await userRef.update({
      friendRequests: updatedRequests
    });
    
    // Создаём чат
    const chatId = await createPrivateChat(auth.currentUser.uid, fromUserId);
    
    // Обновляем список друзей
    if (typeof window.loadFriends === 'function') {
      window.loadFriends();
    }
    
    return { success: true, chatId };
  } catch (error) {
    console.error('❌ Ошибка принятия запроса:', error);
    return { success: false, error: error.message };
  }
}



// ===== УДАЛЕНИЕ ЗАПРОСА (ИСПРАВЛЕНО) =====
async function removeFriendRequest(fromUserId) {
  if (!auth.currentUser) return;
  
  try {
    const userRef = db.collection('users').doc(auth.currentUser.uid);
    const userDoc = await userRef.get();
    const requests = userDoc.data().friendRequests || [];
    
    // Фильтруем массив (убираем запрос от fromUserId)
    const updatedRequests = requests.filter(req => req.from !== fromUserId);
    
    // Обновляем документ (просто заменяем массив)
    await userRef.update({
      friendRequests: updatedRequests
    });
  } catch (error) {
    console.error('Ошибка удаления запроса:', error);
  }
}


// СОЗДАНИЕ ЧАТА
async function createPrivateChat(userId1, userId2) {
  // Проверяем, есть ли уже чат
  const chatsRef = db.collection('chats');
  const snapshot = await chatsRef
    .where('type', '==', 'private')
    .where('participants', 'array-contains', userId1)
    .get();
  
  const existingChat = snapshot.docs.find(doc => 
    doc.data().participants.includes(userId2)
  );
  
  if (existingChat) return existingChat.id;
  
  // Создаём новый чат
  const newChat = await chatsRef.add({
    type: 'private',
    participants: [userId1, userId2],
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastMessage: null,
    typing: {}
  });
  
  return newChat.id;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram v3.5 загружается...');
  
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
          if (typeof window.loadFriends === 'function') window.loadFriends();
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
  
  // Кнопка поиска друзей
  document.getElementById('searchFriendsBtn')?.addEventListener('click', () => {
    showScreen('searchFriendsScreen');
  });
  
  // Кнопка настроек
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    document.getElementById('settingsName').value = localStorage.getItem('nyashgram_name') || '';
    document.getElementById('settingsUsername').value = localStorage.getItem('nyashgram_username') || '';
    document.getElementById('profileEmail').textContent = auth.currentUser?.email || 'гость';
    showScreen('settingsScreen');
  });
  
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
  // Сохранение настроек
  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const name = document.getElementById('settingsName')?.value;
    const username = document.getElementById('settingsUsername')?.value;
    if (name) localStorage.setItem('nyashgram_name', name);
    if (username) localStorage.setItem('nyashgram_username', username);
    showScreen('friendsScreen');
    if (typeof window.renderContacts === 'function') window.renderContacts();
  });
  
  document.getElementById('settingsGenerateBtn')?.addEventListener('click', () => {
    document.getElementById('settingsUsername').value = 'user_' + Math.floor(Math.random() * 1000);
  });
  
  // Кнопки тем и шрифтов
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme, currentMode));
  });
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFont(btn.dataset.font));
  });
  
  document.getElementById('themeModeToggle')?.addEventListener('click', toggleMode);
  
  // Вкладки
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (typeof window.renderContacts === 'function') window.renderContacts();
    });
  });
  
  // 🔥 ПОИСК ПОЛЬЗОВАТЕЛЕЙ (НОВОЕ)
  const searchInput = document.getElementById('searchUsersInput');
  const resultsList = document.getElementById('searchResultsList');
  
  if (searchInput && resultsList) {
    let timeout;
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.trim();
      
      if (timeout) clearTimeout(timeout);
      
      if (query.length < 2) {
        resultsList.innerHTML = '';
        return;
      }
      
      timeout = setTimeout(async () => {
        const users = await searchUsers(query);
        
        if (users.length === 0) {
          resultsList.innerHTML = '<div class="empty-state">❌ ничего не найдено</div>';
          return;
        }
        
        resultsList.innerHTML = '';
        users.forEach(user => {
          const el = document.createElement('div');
          el.className = 'search-result-item';
          el.innerHTML = `
            <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
            <div class="info">
              <div class="name">${user.name || 'пользователь'}</div>
              <div class="username">@${user.username}</div>
            </div>
            <button class="add-friend-btn" data-id="${user.id}">➕</button>
          `;
          
          el.querySelector('.add-friend-btn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            const result = await sendFriendRequest(user.id);
            if (result.success) {
              alert('✅ запрос отправлен');
              searchInput.value = '';
              resultsList.innerHTML = '';
            } else {
              alert('❌ ошибка: ' + result.error);
            }
          });
          
          resultsList.appendChild(el);
        });
      }, 500);
    });
  }
  
  // Проверка авторизации
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user && !user.isAnonymous) {
      // Обновляем статус онлайн
      await db.collection('users').doc(user.uid).update({
        online: true,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      showScreen('friendsScreen');
      if (typeof window.loadFriends === 'function') window.loadFriends();
    } else if (user && user.isAnonymous) {
      showScreen('friendsScreen');
    } else {
      showScreen('loginMethodScreen');
    }
  });
  
  // Экспортируем функции для других скриптов
  window.showScreen = showScreen;
  window.searchUsers = searchUsers;
  window.sendFriendRequest = sendFriendRequest;
  window.acceptFriendRequest = acceptFriendRequest;
  window.createPrivateChat = createPrivateChat;
  window.db = db;
  window.auth = auth;
});


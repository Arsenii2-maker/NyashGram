// app.js — ПОЛНЫЙ С РАБОЧИМ ПОИСКОМ ДРУЗЕЙ

const firebaseConfig = {
  apiKey: "AIzaSyCqTm_oMEV_6e8E2SnE3x5jGR15jPcFbF8",
  authDomain: "nyashgram-ff9c4.firebaseapp.com",
  projectId: "nyashgram-ff9c4",
  storageBucket: "nyashgram-ff9c4.firebasestorage.app",
  messagingSenderId: "1091195998837",
  appId: "1:1091195998837:web:aa9e1e55030e7809ea6e27"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentTheme = localStorage.getItem('nyashgram_theme') || 'pastel-pink';
let currentMode = localStorage.getItem('nyashgram_mode') || 'light';
let currentFont = localStorage.getItem('nyashgram_font') || 'font-cozy';
let currentUser = null;

// ===== ПОДСКАЗКИ =====
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

// ===== ЭКРАНЫ =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
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
      name, email, username: name.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000),
      theme: currentTheme, mode: currentMode, font: currentFont, friends: [], friendRequests: []
    });
    hideLoadingScreen();
    alert('✅ письмо отправлено! проверь почту');
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
    currentUser = user.user;
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
    const user = await auth.signInAnonymously();
    currentUser = user.user;
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
  currentUser = null;
  showScreen('loginMethodScreen');
}

// ===== ПОИСК ПОЛЬЗОВАТЕЛЕЙ =====
async function searchUsers(query) {
  if (!query || query.length < 2) return [];
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('username', '>=', query.toLowerCase())
      .where('username', '<=', query.toLowerCase() + '\uf8ff')
      .limit(20)
      .get();
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.id !== currentUser?.uid);
  } catch (error) {
    console.error('Ошибка поиска:', error);
    return [];
  }
}

// ===== ОТПРАВКА ЗАПРОСА =====
async function sendFriendRequest(toUserId) {
  if (!currentUser) return { success: false, error: 'не авторизован' };
  
  try {
    await db.collection('users').doc(toUserId).update({
      friendRequests: firebase.firestore.FieldValue.arrayUnion({
        from: currentUser.uid,
        status: 'pending',
        timestamp: Date.now()
      })
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
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
    if (typeof renderContacts === 'function') renderContacts();
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
      if (typeof renderContacts === 'function') renderContacts();
    });
  });
  
  // Поиск пользователей
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
          resultsList.innerHTML = '<div class="empty-state">ничего не найдено</div>';
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
            alert(result.success ? '✅ запрос отправлен' : '❌ ' + result.error);
          });
          
          resultsList.appendChild(el);
        });
      }, 500);
    });
  }
  
  // Проверка входа
  auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
      showScreen('friendsScreen');
      if (typeof renderContacts === 'function') renderContacts();
    } else {
      showScreen('loginMethodScreen');
    }
  });
});

// app.js — ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ С ДРУЗЬЯМИ

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
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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
    isAnonymous: false
  },
  friends: [],
  chats: [],
  friendRequests: []
};

// База занятых юзернеймов
let takenUsernames = JSON.parse(localStorage.getItem('nyashgram_taken_usernames') || '["nyasha", "nyashhelp_official", "nyashtalk_bot", "nyashgame_bot", "nyashhoroscope_bot", "bestie_nyash", "thinker_deep", "study_buddy", "melody_lover", "midnight_vibes", "admin", "user"]');

// Милые слова
const cuteWords = ["nyasha", "kawaii", "cutie", "sweetie", "honey", "bunny", "kitty", "pudding", "mochi", "cookie", "candy", "sugar", "strawberry", "cherry", "peach", "mango", "cloud", "star", "moon", "sunny", "rainbow", "sparkle", "glitter", "dream"];

// ===== ПОДСКАЗКИ ДЛЯ ЗАГРУЗКИ =====
const loadingTips = [
  "🐱 NyashHelp поможет с любой темой о приложении!",
  "🎮 NyashGame знает много игр: угадай число, камень-ножницы-бумага и другие!",
  "🔮 NyashHoroscope расскажет, что звёзды приготовили на сегодня",
  "👥 Теперь можно добавлять настоящих друзей!",
  "📱 Ищи друзей по их юзернейму",
  "💬 Отправляй сообщения реальным людям",
  "✅ Статусы 'онлайн' покажут, кто сейчас в сети",
  "🎨 Можно менять темы и шрифты в настройках",
  "🌈 У нас 6 красивых тем оформления",
  "🌙 Ночной режим бережёт глаза",
  "📌 Чаты можно закреплять и переименовывать",
  "🎉 Добавлены анимации и плавные переходы",
  "💕 Bestie всегда поддержит и поднимет настроение",
  "🧠 Философ любит порассуждать о смысле жизни",
  "📚 Учёба поможет с домашкой и напомнит о контрольных",
  "🎧 Music Pal посоветует, что послушать",
  "🌙 Night Chat создан для ночных разговоров под звёздами",
  "✨ Каждый день новые советы и подсказки",
  "🔥 NyashGram постоянно развивается",
  "⭐ Скоро появятся голосовые сообщения!"
];

let tipInterval = null;

// ===== СИСТЕМА ТЕМ =====
function setTheme(theme, mode) {
  console.log('🎨 Применяем тему:', theme, mode);
  
  const currentFont = AppState.currentUser.font;
  
  // Полностью очищаем классы
  document.body.className = '';
  
  // Добавляем класс темы и режима
  document.body.classList.add(`theme-${theme}`);
  document.body.classList.add(mode + '-mode');
  document.body.classList.add(currentFont);
  
  // Сохраняем
  AppState.currentUser.theme = theme;
  AppState.currentUser.mode = mode;
  localStorage.setItem('nyashgram_theme', theme);
  localStorage.setItem('nyashgram_mode', mode);
  
  // Обновляем кнопки
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
  
  console.log('✅ Тема установлена:', `${theme}-${mode}`);
  console.log('📌 Классы body:', document.body.className);
}

function toggleMode() {
  const newMode = AppState.currentUser.mode === 'light' ? 'dark' : 'light';
  setTheme(AppState.currentUser.theme, newMode);
  
  const modeToggle = document.getElementById('themeModeToggle');
  if (modeToggle) {
    modeToggle.textContent = newMode === 'light' ? '☀️' : '🌙';
    modeToggle.classList.add('mode-switch-animation');
    setTimeout(() => modeToggle.classList.remove('mode-switch-animation'), 300);
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
  console.log('📱 Переключаем экран на:', id);
  
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
  
  if (id === 'friendsScreen') {
    renderFriendsScreen();
  }
}

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

// ===== ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ =====
async function loadUserData(uid) {
  try {
    showLoadingScreen('Загружаем профиль...');
    
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      AppState.currentUser = {
        ...AppState.currentUser,
        uid: uid,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email,
        theme: userData.theme || 'pastel-pink',
        mode: userData.mode || 'light',
        font: userData.font || 'font-cozy'
      };
      
      // Загружаем друзей
      if (userData.friends && userData.friends.length > 0) {
        const friendsData = await Promise.all(
          userData.friends.map(async (friendId) => {
            const friendDoc = await db.collection('users').doc(friendId).get();
            return { id: friendDoc.id, ...friendDoc.data() };
          })
        );
        AppState.friends = friendsData;
      }
      
      // Загружаем заявки
      if (userData.friendRequests) {
        const requestsData = await Promise.all(
          userData.friendRequests.map(async (request) => {
            const fromUserDoc = await db.collection('users').doc(request.from).get();
            return {
              ...request,
              fromUser: { id: fromUserDoc.id, ...fromUserDoc.data() }
            };
          })
        );
        AppState.friendRequests = requestsData;
      }
      
      // Загружаем чаты
      await loadUserChats(uid);
      
      // Сохраняем в localStorage
      localStorage.setItem('nyashgram_user', JSON.stringify(AppState.currentUser));
      localStorage.setItem('nyashgram_name', userData.name);
      localStorage.setItem('nyashgram_username', userData.username);
      if (userData.email) localStorage.setItem('nyashgram_email', userData.email);
      
      setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
      applyFont(AppState.currentUser.font);
      
      updateRequestsBadge();
      
      setTimeout(() => {
        hideLoadingScreen();
        showScreen('friendsScreen');
      }, 1500);
      
      return true;
    }
    hideLoadingScreen();
    return false;
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    hideLoadingScreen();
    return false;
  }
}

// ===== ЗАГРУЗКА ЧАТОВ =====
async function loadUserChats(uid) {
  try {
    const chatsSnapshot = await db.collection('chats')
      .where('participants', 'array-contains', uid)
      .orderBy('lastMessage.timestamp', 'desc')
      .get();
    
    const chats = [];
    
    for (const doc of chatsSnapshot.docs) {
      const chatData = doc.data();
      
      if (chatData.type === 'private') {
        const otherUserId = chatData.participants.find(id => id !== uid);
        const userDoc = await db.collection('users').doc(otherUserId).get();
        const userData = userDoc.data();
        
        chats.push({
          id: doc.id,
          ...chatData,
          otherUser: {
            id: otherUserId,
            name: userData.name,
            username: userData.username,
            avatar: userData.avatar,
            online: userData.online || false
          }
        });
      } else {
        chats.push({
          id: doc.id,
          ...chatData
        });
      }
    }
    
    AppState.chats = chats;
    return chats;
  } catch (error) {
    console.error('❌ Ошибка загрузки чатов:', error);
    return [];
  }
}

// ===== ПОИСК ПОЛЬЗОВАТЕЛЕЙ =====
async function searchUsers(query) {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('username', '>=', query.toLowerCase())
      .where('username', '<=', query.toLowerCase() + '\uf8ff')
      .limit(20)
      .get();
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => user.id !== AppState.currentUser.uid);
  } catch (error) {
    console.error('❌ Ошибка поиска:', error);
    return [];
  }
}

// ===== ОТПРАВКА ЗАПРОСА В ДРУЗЬЯ =====
async function sendFriendRequest(toUserId) {
  try {
    const fromUserId = AppState.currentUser.uid;
    const request = {
      from: fromUserId,
      status: 'pending',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(toUserId).update({
      friendRequests: firebase.firestore.FieldValue.arrayUnion(request)
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки запроса:', error);
    return { success: false, error: error.message };
  }
}

// ===== ПРИНЯТИЕ ЗАПРОСА =====
async function acceptFriendRequest(fromUserId) {
  try {
    const currentUserId = AppState.currentUser.uid;
    
    await db.collection('users').doc(currentUserId).update({
      friends: firebase.firestore.FieldValue.arrayUnion(fromUserId)
    });
    
    await db.collection('users').doc(fromUserId).update({
      friends: firebase.firestore.FieldValue.arrayUnion(currentUserId)
    });
    
    await removeFriendRequest(fromUserId);
    await createPrivateChat(currentUserId, fromUserId);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка принятия запроса:', error);
    return { success: false, error: error.message };
  }
}

// ===== УДАЛЕНИЕ ЗАПРОСА =====
async function removeFriendRequest(fromUserId) {
  const currentUserId = AppState.currentUser.uid;
  
  const userRef = db.collection('users').doc(currentUserId);
  const userDoc = await userRef.get();
  const requests = userDoc.data().friendRequests || [];
  
  const updatedRequests = requests.filter(req => req.from !== fromUserId);
  
  await userRef.update({
    friendRequests: updatedRequests
  });
}

// ===== СОЗДАНИЕ ЛИЧНОГО ЧАТА =====
async function createPrivateChat(userId1, userId2) {
  try {
    const chatsSnapshot = await db.collection('chats')
      .where('type', '==', 'private')
      .where('participants', 'array-contains', userId1)
      .get();
    
    const existingChat = chatsSnapshot.docs.find(doc => 
      doc.data().participants.includes(userId2)
    );
    
    if (existingChat) {
      return existingChat.id;
    }
    
    const chatRef = await db.collection('chats').add({
      type: 'private',
      participants: [userId1, userId2],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: null
    });
    
    return chatRef.id;
  } catch (error) {
    console.error('❌ Ошибка создания чата:', error);
    return null;
  }
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
async function sendMessage(chatId, text, type = 'text') {
  try {
    const message = {
      chatId: chatId,
      from: AppState.currentUser.uid,
      text: text,
      type: type,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      readBy: [AppState.currentUser.uid]
    };
    
    await db.collection('messages').add(message);
    
    await db.collection('chats').doc(chatId).update({
      lastMessage: {
        text: text,
        from: AppState.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        readBy: [AppState.currentUser.uid]
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
    return { success: false, error: error.message };
  }
}

// ===== СТАТУС ОНЛАЙН =====
function setUserOnline(uid) {
  db.collection('users').doc(uid).update({
    online: true,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function setUserOffline(uid) {
  db.collection('users').doc(uid).update({
    online: false,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ===== БОТЫ =====
const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp', avatar: null, description: 'помощник по приложению 🩷' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk', avatar: null, description: 'просто поболтать 🌸' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame', avatar: null, description: 'мини-игры 🎮' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope', avatar: null, description: 'гороскопы 🔮' }
];

// ===== ОБНОВЛЕНИЕ БЕЙДЖА =====
function updateRequestsBadge() {
  const badge = document.getElementById('requestsBadge');
  if (badge) {
    const count = AppState.friendRequests.length;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  }
}

// ===== ОТРИСОВКА ЭКРАНА ДРУЗЕЙ =====
function renderFriendsScreen() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'chats';
  
  if (activeTab === 'chats') {
    renderChats(list);
  } else if (activeTab === 'friends') {
    renderFriends(list);
  } else if (activeTab === 'requests') {
    renderRequests(list);
  }
}

function renderChats(list) {
  // Чаты с друзьями
  if (AppState.chats.length > 0) {
    const chatsHeader = document.createElement('div');
    chatsHeader.className = 'section-header';
    chatsHeader.textContent = '💬 последние чаты';
    list.appendChild(chatsHeader);
    
    AppState.chats.slice(0, 5).forEach(chat => {
      if (chat.type === 'private' && chat.otherUser) {
        const el = createChatElement(chat);
        list.appendChild(el);
      }
    });
  }
  
  // Боты
  const botsHeader = document.createElement('div');
  botsHeader.className = 'section-header';
  botsHeader.textContent = '🤖 няш-боты';
  list.appendChild(botsHeader);
  
  botUsers.forEach(bot => {
    const el = createBotElement(bot);
    list.appendChild(el);
  });
}

function renderFriends(list) {
  if (AppState.friends.length > 0) {
    AppState.friends.forEach(friend => {
      const el = createFriendElement(friend);
      list.appendChild(el);
    });
  } else {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state';
    emptyEl.innerHTML = `
      <div class="empty-icon">👥</div>
      <h3>у тебя пока нет друзей</h3>
      <p>найди друзей по юзернейму</p>
      <button id="findFriendsBtn" class="action-btn">🔍 найти</button>
    `;
    list.appendChild(emptyEl);
    
    document.getElementById('findFriendsBtn')?.addEventListener('click', () => {
      showScreen('searchFriendsScreen');
    });
  }
}

function renderRequests(list) {
  if (AppState.friendRequests.length > 0) {
    AppState.friendRequests.forEach(request => {
      const el = createRequestElement(request);
      list.appendChild(el);
    });
  } else {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state';
    emptyEl.innerHTML = `
      <div class="empty-icon">📨</div>
      <h3>нет заявок</h3>
      <p>когда кто-то захочет добавить тебя, они появятся здесь</p>
    `;
    list.appendChild(emptyEl);
  }
}

function createChatElement(chat) {
  const el = document.createElement('div');
  el.className = 'contact';
  el.setAttribute('data-id', chat.id);
  
  const lastMessage = chat.lastMessage?.text || 'нет сообщений';
  const time = chat.lastMessage?.timestamp ? 
    new Date(chat.lastMessage.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  el.innerHTML = `
    <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
    <div class="info">
      <div class="name">${chat.otherUser.name} ${chat.otherUser.online ? '<span class="online-dot">●</span>' : ''}</div>
      <div class="username">@${chat.otherUser.username}</div>
      <div class="last-message">${lastMessage} <span class="time">${time}</span></div>
    </div>
  `;
  
  el.onclick = () => openRealChat(chat, chat.id);
  
  return el;
}

function createFriendElement(friend) {
  const el = document.createElement('div');
  el.className = 'contact';
  el.setAttribute('data-id', friend.id);
  
  el.innerHTML = `
    <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
    <div class="info">
      <div class="name">${friend.name} ${friend.online ? '<span class="online-dot">●</span>' : ''}</div>
      <div class="username">@${friend.username}</div>
    </div>
    <button class="message-btn" data-id="${friend.id}">💬</button>
  `;
  
  el.querySelector('.message-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    startChatWithFriend(friend);
  });
  
  return el;
}

function createRequestElement(request) {
  const el = document.createElement('div');
  el.className = 'contact';
  
  el.innerHTML = `
    <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
    <div class="info">
      <div class="name">${request.fromUser.name}</div>
      <div class="username">@${request.fromUser.username}</div>
    </div>
    <div class="request-actions">
      <button class="accept-request" data-id="${request.from}">✅</button>
      <button class="reject-request" data-id="${request.from}">❌</button>
    </div>
  `;
  
  el.querySelector('.accept-request')?.addEventListener('click', (e) => {
    e.stopPropagation();
    acceptFriendRequest(request.from).then(() => {
      showLoadingScreen('заявка принята', 1000);
      loadUserData(AppState.currentUser.uid);
    });
  });
  
  el.querySelector('.reject-request')?.addEventListener('click', (e) => {
    e.stopPropagation();
    removeFriendRequest(request.from).then(() => {
      loadUserData(AppState.currentUser.uid);
    });
  });
  
  return el;
}

function createBotElement(bot) {
  const el = document.createElement('div');
  el.className = 'contact bot-section';
  el.setAttribute('data-id', bot.id);
  
  el.innerHTML = `
    <div class="avatar" style="background: linear-gradient(135deg, #c38ef0, #e0b0ff);"></div>
    <div class="info">
      <div class="name">${bot.name}</div>
      <div class="username">@${bot.username}</div>
      <div class="status">${bot.description}</div>
    </div>
  `;
  
  el.onclick = () => openBotChat(bot);
  
  return el;
}

function openRealChat(chat, chatId) {
  if (typeof window.openRealChat === 'function') {
    window.openRealChat(chat, chatId);
  }
}

async function startChatWithFriend(friend) {
  showLoadingScreen('открываем чат...', 1000);
  const chatId = await createPrivateChat(AppState.currentUser.uid, friend.id);
  if (typeof window.openRealChat === 'function') {
    window.openRealChat({
      id: friend.id,
      name: friend.name,
      username: friend.username,
      avatar: friend.avatar,
      online: friend.online
    }, chatId);
  }
}

function openBotChat(bot) {
  if (typeof window.openBotChat === 'function') {
    window.openBotChat(bot);
  }
}

// ===== EMAIL РЕГИСТРАЦИЯ =====
async function registerWithEmail(name, email, password) {
  try {
    showLoadingScreen('создаём аккаунт...', 3000);
    
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
      friends: [],
      friendRequests: [],
      providers: ['email']
    });
    
    addUsername(username);
    
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('verifyEmailScreen');
    }, 2000);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка:', error);
    hideLoadingScreen();
    
    let errorMessage = 'Ошибка регистрации';
    if (error.code === 'auth/email-already-in-use') errorMessage = 'email уже зарегистрирован';
    if (error.code === 'auth/weak-password') errorMessage = 'пароль слишком слабый';
    
    alert(errorMessage);
    return { success: false };
  }
}

// ===== EMAIL ВХОД =====
async function loginWithEmail(email, password) {
  try {
    showLoadingScreen('выполняем вход...', 3000);
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      hideLoadingScreen();
      showScreen('verifyEmailScreen');
      return { success: false, needVerification: true };
    }
    
    await db.collection('users').doc(user.uid).update({
      online: true,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await loadUserData(user.uid);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка:', error);
    hideLoadingScreen();
    
    let errorMessage = 'Ошибка входа';
    if (error.code === 'auth/user-not-found') errorMessage = 'пользователь не найден';
    if (error.code === 'auth/wrong-password') errorMessage = 'неверный пароль';
    
    alert(errorMessage);
    return { success: false };
  }
}

// ===== АНОНИМНЫЙ ВХОД =====
async function loginAnonymously() {
  try {
    showLoadingScreen('создаём гостевой аккаунт...', 3000);
    
    const result = await auth.signInAnonymously();
    const user = result.user;
    
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
    
    localStorage.setItem('nyashgram_anonymous', 'true');
    localStorage.setItem('nyashgram_entered', 'true');
    localStorage.setItem('nyashgram_name', 'Гость');
    localStorage.setItem('nyashgram_username', username);
    
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('friendsScreen');
      renderFriendsScreen();
    }, 2000);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка:', error);
    hideLoadingScreen();
    alert('Ошибка анонимного входа');
    return { success: false };
  }
}

// ===== ВЫХОД =====
async function logout() {
  try {
    showLoadingScreen('выходим...', 1500);
    
    if (AppState.currentUser.uid && !AppState.currentUser.isAnonymous) {
      await db.collection('users').doc(AppState.currentUser.uid).update({
        online: false,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await auth.signOut();
    
    localStorage.clear();
    
    AppState.currentUser = {
      name: "Няша",
      username: "nyasha",
      avatar: null,
      theme: 'pastel-pink',
      mode: 'light',
      font: 'font-cozy',
      isAnonymous: false
    };
    
    AppState.friends = [];
    AppState.chats = [];
    AppState.friendRequests = [];
    
    setTheme('pastel-pink', 'light');
    applyFont('font-cozy');
    
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('loginMethodScreen');
    }, 1500);
  } catch (error) {
    console.error('❌ Ошибка выхода:', error);
    hideLoadingScreen();
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NyashGram загружается...');
  
  setTheme('pastel-pink', 'light');
  applyFont('font-cozy');
  
  // Кнопки входа
  document.getElementById('emailMethodBtn')?.addEventListener('click', () => {
    showScreen('emailRegisterScreen');
  });
  
  document.getElementById('anonymousMethodBtn')?.addEventListener('click', loginAnonymously);
  
  // Навигация назад
  const backButtons = [
    'backToLoginFromRegBtn', 'backFromEmailLoginBtn', 'backToLoginFromVerifyBtn',
    'backFromSearchBtn', 'backFromSettingsBtn', 'backBtn'
  ];
  
  backButtons.forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      showScreen('friendsScreen');
    });
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
    
    if (!name) return errorEl.textContent = 'введи имя';
    if (!email || !email.includes('@')) return errorEl.textContent = 'некорректный email';
    if (password.length < 6) return errorEl.textContent = 'пароль минимум 6 символов';
    if (password !== confirm) return errorEl.textContent = 'пароли не совпадают';
    
    errorEl.textContent = '';
    const result = await registerWithEmail(name, email, password);
    if (!result.success) errorEl.textContent = 'ошибка регистрации';
  });
  
  // Email вход
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    if (!email || !email.includes('@')) return errorEl.textContent = 'некорректный email';
    if (!password) return errorEl.textContent = 'введи пароль';
    
    errorEl.textContent = '';
    const result = await loginWithEmail(email, password);
    if (!result.success && result.needVerification) {
      showScreen('verifyEmailScreen');
    }
  });
  
  // Подтверждение email
  document.getElementById('checkVerificationBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        showLoadingScreen('вход выполнен...', 1500);
        setTimeout(() => {
          hideLoadingScreen();
          showScreen('friendsScreen');
        }, 1500);
      } else {
        alert('email ещё не подтверждён');
      }
    }
  });
  
  document.getElementById('resendEmailBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.sendEmailVerification();
      alert('письмо отправлено повторно');
    }
  });
  
  // Кнопка добавления друзей
  document.getElementById('addFriendBtn')?.addEventListener('click', () => {
    showScreen('searchFriendsScreen');
  });
  
  // Поиск пользователей
  const searchInput = document.getElementById('searchUsersInput');
  const searchResults = document.getElementById('searchResultsList');
  
  if (searchInput && searchResults) {
    let searchTimeout;
    
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.trim();
      
      if (searchTimeout) clearTimeout(searchTimeout);
      
      if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
      }
      
      searchTimeout = setTimeout(async () => {
        const users = await searchUsers(query);
        
        if (users.length === 0) {
          searchResults.innerHTML = '<div class="empty-state">ничего не найдено</div>';
          return;
        }
        
        searchResults.innerHTML = '';
        users.forEach(user => {
          const el = document.createElement('div');
          el.className = 'search-result-item';
          el.innerHTML = `
            <div class="avatar" style="width: 40px; height: 40px;"></div>
            <div class="info">
              <div class="name">${user.name}</div>
              <div class="username">@${user.username}</div>
            </div>
            <button class="add-friend-btn" data-id="${user.id}">➕</button>
          `;
          
          el.querySelector('.add-friend-btn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            const result = await sendFriendRequest(user.id);
            if (result.success) {
              alert('запрос отправлен!');
            } else {
              alert('ошибка: ' + result.error);
            }
          });
          
          searchResults.appendChild(el);
        });
      }, 500);
    });
  }
  
  // Вкладки
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tab = btn.dataset.tab;
      document.getElementById('searchSection').style.display = tab === 'friends' ? 'block' : 'none';
      
      renderFriendsScreen();
    });
  });
  
  // Настройки
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    document.getElementById('settingsName').value = AppState.currentUser.name;
    document.getElementById('settingsUsername').value = AppState.currentUser.username;
    
    const emailEl = document.getElementById('profileEmail');
    if (emailEl) {
      emailEl.textContent = AppState.currentUser.email || 'нет email';
    }
    
    const typeEl = document.getElementById('profileType');
    if (typeEl) {
      if (AppState.currentUser.isAnonymous) {
        typeEl.textContent = '⚠️ анонимный режим';
      } else {
        typeEl.textContent = '✅ постоянный аккаунт';
      }
    }
    
    showScreen('settingsScreen');
  });
  
  document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
  document.getElementById('settingsGenerateBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('settingsUsername').value = generateCuteUsername();
  });
  
  // Темы
  document.getElementById('themeModeToggle')?.addEventListener('click', toggleMode);
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme, AppState.currentUser.mode));
  });
  
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFont(btn.dataset.font));
  });
  
  // Сохранение настроек
  function saveSettings() {
    if (AppState.currentUser.isAnonymous) {
      alert('в анонимном режиме настройки не сохраняются');
      return;
    }
    
    const newName = document.getElementById('settingsName').value.trim();
    const newUsername = document.getElementById('settingsUsername').value.trim().toLowerCase();
    const errorEl = document.getElementById('settingsUsernameError');
    
    if (!newName) return alert('введи имя');
    
    if (newUsername.length < 3 || newUsername.length > 50 || !/^[a-z0-9_]+$/.test(newUsername)) {
      errorEl.textContent = 'некорректный юзернейм';
      return;
    }
    
    if (isUsernameTaken(newUsername, AppState.currentUser.username)) {
      errorEl.textContent = 'юзернейм занят';
      return;
    }
    
    errorEl.textContent = '';
    
    db.collection('users').doc(AppState.currentUser.uid).update({
      name: newName,
      username: newUsername
    });
    
    removeUsername(AppState.currentUser.username);
    addUsername(newUsername);
    
    AppState.currentUser.name = newName;
    AppState.currentUser.username = newUsername;
    
    localStorage.setItem('nyashgram_name', newName);
    localStorage.setItem('nyashgram_username', newUsername);
    
    showScreen('friendsScreen');
  }
  
  // Проверка авторизации
  const savedUser = localStorage.getItem('nyashgram_user');
  const anonymous = localStorage.getItem('nyashgram_anonymous');
  
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    AppState.currentUser = { ...AppState.currentUser, ...userData };
    setTheme(AppState.currentUser.theme, AppState.currentUser.mode);
    applyFont(AppState.currentUser.font);
    showScreen('friendsScreen');
  } else if (anonymous === 'true') {
    showScreen('friendsScreen');
  } else {
    showScreen('loginMethodScreen');
  }
  
  // Экспорт
  window.showScreen = showScreen;
  window.AppState = AppState;
  window.logout = logout;
  window.setTheme = setTheme;
  window.applyFont = applyFont;
  window.showLoadingScreen = showLoadingScreen;
  window.hideLoadingScreen = hideLoadingScreen;
  
  console.log('✅ app.js готов');
});
// contacts.js — РАБОЧАЯ ВЕРСИЯ (как было)

// ===== БОТЫ =====
const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope' },
  { id: 'nyashcook', name: 'NyashCook', username: 'nyashcook' }
];

// ===== СОСТОЯНИЕ =====
let friendsList = [];
let friendRequests = [];
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');

// Делаем глобальными
window.customNames = customNames;
window.pinnedChats = pinnedChats;

// ===== ГРАДИЕНТЫ ДЛЯ БОТОВ =====
function getBotGradient(botId) {
  const gradients = {
    nyashhelp: 'linear-gradient(135deg, #c38ef0, #e0b0ff)',
    nyashtalk: 'linear-gradient(135deg, #85d1c5, #b0e0d5)',
    nyashgame: 'linear-gradient(135deg, #ffb347, #ff8c42)',
    nyashhoroscope: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
    nyashcook: 'linear-gradient(135deg, #ff9a9e, #fad0c4)'
  };
  return gradients[botId] || 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
}

// ===== ЧЕРНОВИКИ =====
function updateDraft(contactId, text) {
  if (text && text.trim()) {
    chatDrafts[contactId] = text;
  } else {
    delete chatDrafts[contactId];
  }
  localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(chatDrafts));
  renderContacts();
}

function getDraft(contactId) {
  return chatDrafts[contactId] || '';
}

// ===== ЗАКРЕПЛЕНИЕ =====
function isPinned(chatId) {
  return pinnedChats.includes(chatId);
}

function togglePin(chatId) {
  if (pinnedChats.includes(chatId)) {
    pinnedChats = pinnedChats.filter(id => id !== chatId);
  } else {
    pinnedChats.push(chatId);
  }
  localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
  renderContacts();
}

// ===== КАСТОМНЫЕ ИМЕНА =====
function getDisplayName(contactId, defaultName) {
  return customNames[contactId] || defaultName;
}

// ===== ЗАГРУЗКА ДРУЗЕЙ ИЗ FIREBASE =====
async function loadFriends() {
  console.log('👥 Загружаем друзей...');
  
  if (!window.auth || !window.auth.currentUser || window.auth.currentUser.isAnonymous) {
    console.log('❌ Нет авторизации или гость');
    return;
  }
  
  try {
    const userDoc = await window.db.collection('users').doc(window.auth.currentUser.uid).get();
    const userData = userDoc.data();
    
    if (!userData) return;
    
    console.log('📨 Данные пользователя:', userData);
    
    // Загружаем друзей
    if (userData.friends && userData.friends.length > 0) {
      console.log(`👥 Найдено ${userData.friends.length} друзей`);
      
      const friendsData = await Promise.all(
        userData.friends.map(async (friendId) => {
          const friendDoc = await window.db.collection('users').doc(friendId).get();
          return { id: friendDoc.id, ...friendDoc.data() };
        })
      );
      friendsList = friendsData;
    } else {
      friendsList = [];
    }
    
    // Загружаем заявки
    if (userData.friendRequests && userData.friendRequests.length > 0) {
      console.log(`📨 Найдено ${userData.friendRequests.length} заявок`);
      
      const requestsData = await Promise.all(
        userData.friendRequests.map(async (req) => {
          const userDoc = await window.db.collection('users').doc(req.from).get();
          return {
            ...req,
            fromUser: { id: userDoc.id, ...userDoc.data() }
          };
        })
      );
      friendRequests = requestsData;
      console.log('📨 Заявки после обработки:', friendRequests);
    } else {
      friendRequests = [];
    }
    
    // Обновляем бейдж
    updateRequestsBadge();
    
    // Рендерим
    renderContacts();
    
  } catch (error) {
    console.error('❌ Ошибка загрузки друзей:', error);
  }
}

// ===== ОБНОВЛЕНИЕ БЕЙДЖА =====
function updateRequestsBadge() {
  const badge = document.getElementById('requestsBadge');
  if (badge) {
    if (friendRequests.length > 0) {
      badge.textContent = friendRequests.length;
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  }
}

// ===== ОТРИСОВКА =====
function renderContacts() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'chats';
  
  list.innerHTML = '';
  
  if (activeTab === 'chats') {
    renderChats(list);
  } else if (activeTab === 'friends') {
    renderFriends(list);
  } else if (activeTab === 'requests') {
    renderRequests(list);
  }
}

function renderChats(list) {
  // Секция ботов
  const botsHeader = document.createElement('div');
  botsHeader.className = 'section-header';
  botsHeader.textContent = '🤖 няш-боты';
  list.appendChild(botsHeader);
  
  // Сортируем ботов: закреплённые сверху
  const sortedBots = [...botUsers].sort((a, b) => {
    const aPinned = isPinned(a.id) ? 1 : 0;
    const bPinned = isPinned(b.id) ? 1 : 0;
    return bPinned - aPinned;
  });
  
  sortedBots.forEach(bot => {
    const draft = getDraft(bot.id);
    const displayName = getDisplayName(bot.id, bot.name);
    const el = document.createElement('div');
    el.className = `contact ${isPinned(bot.id) ? 'pinned' : ''}`;
    el.setAttribute('data-id', bot.id);
    
    el.innerHTML = `
      <div class="avatar" style="background: ${getBotGradient(bot.id)}; background-size: cover;"></div>
      <div class="info">
        <div class="name">${displayName} ${isPinned(bot.id) ? '<span class="pin-icon">📌</span>' : ''}</div>
        <div class="username">@${bot.username}</div>
        ${draft ? `<div class="draft">📝 ${draft.slice(0, 25)}${draft.length > 25 ? '...' : ''}</div>` : ''}
      </div>
    `;
    
    el.onclick = () => {
      if (typeof window.openBotChat === 'function') {
        window.openBotChat(bot);
      }
    };
    
    list.appendChild(el);
  });
  
  // Секция друзей (если есть)
  if (friendsList.length > 0) {
    const friendsHeader = document.createElement('div');
    friendsHeader.className = 'section-header';
    friendsHeader.textContent = '👥 друзья';
    list.appendChild(friendsHeader);
    
    friendsList.forEach(friend => {
      const draft = getDraft(friend.id);
      const displayName = getDisplayName(friend.id, friend.name);
      const el = document.createElement('div');
      el.className = `contact ${isPinned(friend.id) ? 'pinned' : ''}`;
      el.setAttribute('data-id', friend.id);
      
      const onlineStatus = friend.online ? '<span class="online-dot">●</span>' : '';
      
      el.innerHTML = `
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
        <div class="info">
          <div class="name">${displayName} ${onlineStatus} ${isPinned(friend.id) ? '<span class="pin-icon">📌</span>' : ''}</div>
          <div class="username">@${friend.username}</div>
          ${draft ? `<div class="draft">📝 ${draft.slice(0, 25)}${draft.length > 25 ? '...' : ''}</div>` : ''}
        </div>
      `;
      
      el.onclick = () => {
        if (typeof window.openFriendChat === 'function') {
          window.openFriendChat(friend);
        }
      };
      
      list.appendChild(el);
    });
  }
}

function renderFriends(list) {
  if (friendsList.length > 0) {
    friendsList.forEach(friend => {
      const el = document.createElement('div');
      el.className = 'contact';
      el.setAttribute('data-id', friend.id);
      
      const onlineStatus = friend.online ? '<span class="online-dot">●</span>' : '';
      
      el.innerHTML = `
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
        <div class="info">
          <div class="name">${friend.name} ${onlineStatus}</div>
          <div class="username">@${friend.username}</div>
        </div>
        <button class="message-btn" data-id="${friend.id}">💬</button>
      `;
      
      el.querySelector('.message-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.openFriendChat === 'function') {
          window.openFriendChat(friend);
        }
      });
      
      el.onclick = () => {
        if (typeof window.openFriendChat === 'function') {
          window.openFriendChat(friend);
        }
      };
      
      list.appendChild(el);
    });
  } else {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state';
    emptyEl.innerHTML = `
      <div class="empty-icon">👥</div>
      <h3>у тебя пока нет друзей</h3>
      <p>найди друзей по юзернейму</p>
      <button id="findFriendsBtn" class="small-btn">🔍 найти</button>
    `;
    list.appendChild(emptyEl);
    
    setTimeout(() => {
      document.getElementById('findFriendsBtn')?.addEventListener('click', () => {
        if (typeof window.showScreen === 'function') {
          window.showScreen('searchFriendsScreen');
        }
      });
    }, 100);
  }
}

function renderRequests(list) {
  if (friendRequests.length > 0) {
    friendRequests.forEach(request => {
      const el = document.createElement('div');
      el.className = 'contact';
      
      el.innerHTML = `
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
        <div class="info">
          <div class="name">${request.fromUser?.name || 'пользователь'}</div>
          <div class="username">@${request.fromUser?.username || 'unknown'}</div>
        </div>
        <div class="request-actions">
          <button class="accept-request" data-id="${request.from}">✅</button>
          <button class="reject-request" data-id="${request.from}">❌</button>
        </div>
      `;
      
      list.appendChild(el);
      
      el.querySelector('.accept-request')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (typeof window.acceptFriendRequest === 'function') {
          const result = await window.acceptFriendRequest(request.from);
          if (result?.success) {
            loadFriends();
          }
        }
      });
      
      el.querySelector('.reject-request')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (typeof window.removeFriendRequest === 'function') {
          await window.removeFriendRequest(request.from);
          loadFriends();
        }
      });
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

// ===== СЛУШАТЕЛЬ ИЗМЕНЕНИЙ В FIREBASE =====
function listenToFriendChanges() {
  if (!window.auth?.currentUser || window.auth.currentUser.isAnonymous) return;
  
  window.db.collection('users').doc(window.auth.currentUser.uid)
    .onSnapshot((doc) => {
      if (doc.exists) {
        console.log('👥 Данные пользователя изменились');
        loadFriends();
      }
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('👥 contacts.js загружен');
  
  // Добавляем обработчики на табы
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderContacts();
    });
  });
  
  // Загружаем друзей если уже авторизованы
  if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
    setTimeout(() => {
      loadFriends();
      listenToFriendChanges();
    }, 500);
  }
  
  if (document.getElementById('friendsScreen')?.classList.contains('active')) {
    renderContacts();
  }
});

// ===== ЭКСПОРТ =====
window.loadFriends = loadFriends;
window.renderContacts = renderContacts;
window.updateDraft = updateDraft;
window.getDraft = getDraft;
window.togglePin = togglePin;
window.friendsList = friendsList;
window.friendRequests = friendRequests;
window.botUsers = botUsers;
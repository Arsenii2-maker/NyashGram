// contacts.js — ПОЛНЫЙ СПИСОК КОНТАКТОВ С БОТАМИ И ДРУЗЬЯМИ

// ===== БОТЫ (ПОСТОЯННЫЕ) =====
const botUsers = [
  { 
    id: 'nyashhelp', 
    name: 'NyashHelp', 
    username: 'nyashhelp', 
    avatar: null, 
    status: '🩷 всегда на связи',
    description: 'помощник по приложению',
    category: 'bot'
  },
  { 
    id: 'nyashtalk', 
    name: 'NyashTalk', 
    username: 'nyashtalk', 
    avatar: null, 
    status: '🌸 болталка',
    description: 'просто поболтать',
    category: 'bot'
  },
  { 
    id: 'nyashgame', 
    name: 'NyashGame', 
    username: 'nyashgame', 
    avatar: null, 
    status: '🎮 игры',
    description: 'мини-игры',
    category: 'bot'
  },
  { 
    id: 'nyashhoroscope', 
    name: 'NyashHoroscope', 
    username: 'nyashhoroscope', 
    avatar: null, 
    status: '🔮 гороскопы',
    description: 'предсказания',
    category: 'bot'
  }
];

// ===== РЕАЛЬНЫЕ ДРУЗЬЯ (БУДУТ ЗАГРУЖАТЬСЯ ИЗ FIREBASE) =====
let friendsList = [];

// ===== ПЕРЕМЕННЫЕ =====
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');

// ===== ГРАДИЕНТЫ ДЛЯ АВАТАРОК =====
const avatarGradients = [
  "linear-gradient(135deg, #fbc2c2, #c2b9f0)", // розово-лавандовый
  "linear-gradient(135deg, #ffd1dc, #ffe4e1)", // нежно-розовый
  "linear-gradient(135deg, #c2e0f0, #b0c2f0)", // голубой
  "linear-gradient(135deg, #f0d1b0, #f0b0c2)", // персиковый
  "linear-gradient(135deg, #e0c2f0, #c2b0f0)", // фиолетовый
  "linear-gradient(135deg, #b0f0d1, #b0e0f0)", // мятный
  "linear-gradient(135deg, #f0b0d1, #f0c2e0)", // розовый
  "linear-gradient(135deg, #d1f0b0, #c2e0b0)"  // салатовый
];

// ===== ПОЛУЧЕНИЕ ГРАДИЕНТА ПО ИМЕНИ =====
function getGradientForName(name) {
  if (!name) return avatarGradients[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarGradients[hash % avatarGradients.length];
}

// ===== ПРОВЕРКА ЗАКРЕПЛЕНИЯ =====
function isPinned(chatId) {
  return pinnedChats.includes(chatId);
}

// ===== ПОЛУЧЕНИЕ ЧЕРНОВИКА =====
function getDraft(chatId) {
  return chatDrafts[chatId] || '';
}

// ===== ОБНОВЛЕНИЕ ДРУЗЕЙ ИЗ APPSTATE =====
function updateFriendsFromAppState() {
  if (window.AppState && window.AppState.friends) {
    friendsList = window.AppState.friends;
  }
}

// ===== ОТРИСОВКА СПИСКА КОНТАКТОВ =====
function renderContacts() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  
  // Обновляем друзей из AppState
  updateFriendsFromAppState();
  
  list.innerHTML = '';
  
  // ===== ЗАКРЕПЛЁННЫЕ ЧАТЫ =====
  const pinnedBots = botUsers.filter(bot => isPinned(bot.id));
  const pinnedFriends = friendsList.filter(friend => isPinned(friend.id));
  
  if (pinnedBots.length > 0 || pinnedFriends.length > 0) {
    const pinnedHeader = document.createElement('div');
    pinnedHeader.className = 'section-header';
    pinnedHeader.innerHTML = '📌 закреплённые';
    list.appendChild(pinnedHeader);
    
    // Закреплённые боты
    pinnedBots.forEach(bot => {
      const el = createBotElement(bot, true);
      list.appendChild(el);
    });
    
    // Закреплённые друзья
    pinnedFriends.forEach(friend => {
      const el = createFriendElement(friend, true);
      list.appendChild(el);
    });
  }
  
  // ===== ЧАТЫ С ДРУЗЬЯМИ =====
  if (friendsList.length > 0) {
    const friendsHeader = document.createElement('div');
    friendsHeader.className = 'section-header';
    friendsHeader.innerHTML = '👥 друзья';
    list.appendChild(friendsHeader);
    
    // Сортируем: сначала незакреплённые
    const sortedFriends = [...friendsList].sort((a, b) => {
      const aPinned = isPinned(a.id) ? 1 : 0;
      const bPinned = isPinned(b.id) ? 1 : 0;
      return aPinned - bPinned; // незакреплённые сверху
    });
    
    sortedFriends.forEach(friend => {
      if (!isPinned(friend.id)) {
        const el = createFriendElement(friend);
        list.appendChild(el);
      }
    });
  }
  
  // ===== БОТЫ =====
  const botsHeader = document.createElement('div');
  botsHeader.className = 'section-header';
  botsHeader.innerHTML = '🤖 няш-боты';
  list.appendChild(botsHeader);
  
  // Сортируем ботов: сначала незакреплённые
  const sortedBots = [...botUsers].sort((a, b) => {
    const aPinned = isPinned(a.id) ? 1 : 0;
    const bPinned = isPinned(b.id) ? 1 : 0;
    return aPinned - bPinned;
  });
  
  sortedBots.forEach(bot => {
    if (!isPinned(bot.id)) {
      const el = createBotElement(bot);
      list.appendChild(el);
    }
  });
  
  // ===== ПУСТОЙ СПИСОК =====
  if (friendsList.length === 0 && botUsers.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state';
    emptyEl.innerHTML = `
      <div class="empty-icon">👥</div>
      <h3>здесь пока пусто</h3>
      <p>найди друзей по юзернейму</p>
      <button id="findFriendsBtn" class="action-btn">🔍 найти</button>
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

// ===== СОЗДАНИЕ ЭЛЕМЕНТА ДРУГА =====
function createFriendElement(friend, pinned = false) {
  const el = document.createElement('div');
  el.className = `contact ${pinned ? 'pinned' : ''}`;
  el.setAttribute('data-id', friend.id);
  
  const draft = getDraft(friend.id);
  const onlineStatus = friend.online ? '<span class="online-dot">●</span>' : '';
  
  el.innerHTML = `
    <div class="avatar" style="background: ${getGradientForName(friend.name)}; background-size: cover;"></div>
    <div class="info">
      <div class="name">${friend.name} ${onlineStatus}</div>
      <div class="username">@${friend.username}</div>
      ${draft ? `<div class="draft">${draft.slice(0, 25)}${draft.length > 25 ? '...' : ''}</div>` : ''}
    </div>
    ${pinned ? '<span class="pin-icon">📌</span>' : ''}
  `;
  
  el.onclick = () => {
    if (typeof window.openRealChat === 'function') {
      // Создаём объект чата для друга
      const chatObj = {
        id: friend.id,
        otherUser: {
          id: friend.id,
          name: friend.name,
          username: friend.username,
          avatar: friend.avatar,
          online: friend.online
        }
      };
      window.openRealChat(chatObj, friend.id);
    }
  };
  
  return el;
}

// ===== СОЗДАНИЕ ЭЛЕМЕНТА БОТА =====
function createBotElement(bot, pinned = false) {
  const el = document.createElement('div');
  el.className = `contact bot-section ${pinned ? 'pinned' : ''}`;
  el.setAttribute('data-id', bot.id);
  
  const draft = getDraft(bot.id);
  
  // Специальные градиенты для ботов
  let gradient;
  switch(bot.id) {
    case 'nyashhelp':
      gradient = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
      break;
    case 'nyashtalk':
      gradient = 'linear-gradient(135deg, #85d1c5, #b0e0d5)';
      break;
    case 'nyashgame':
      gradient = 'linear-gradient(135deg, #ffb347, #ff8c42)';
      break;
    case 'nyashhoroscope':
      gradient = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
      break;
    default:
      gradient = getGradientForName(bot.name);
  }
  
  el.innerHTML = `
    <div class="avatar" style="background: ${gradient}; background-size: cover;"></div>
    <div class="info">
      <div class="name">${bot.name}</div>
      <div class="username">@${bot.username}</div>
      <div class="status">${bot.status || bot.description}</div>
      ${draft ? `<div class="draft">${draft.slice(0, 25)}${draft.length > 25 ? '...' : ''}</div>` : ''}
    </div>
    ${pinned ? '<span class="pin-icon">📌</span>' : ''}
  `;
  
  el.onclick = () => {
    if (typeof window.openBotChat === 'function') {
      window.openBotChat(bot);
    }
  };
  
  return el;
}

// ===== ОБНОВЛЕНИЕ ЧЕРНОВИКА =====
function updateDraft(chatId, text) {
  if (!chatId) return;
  
  if (text && text.trim()) {
    chatDrafts[chatId] = text;
  } else {
    delete chatDrafts[chatId];
  }
  
  localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(chatDrafts));
  
  // Обновляем отображение, если открыт экран контактов
  if (document.getElementById('friendsScreen')?.classList.contains('active')) {
    renderContacts();
  }
}

// ===== ПОЛУЧЕНИЕ ИНФОРМАЦИИ О КОНТАКТЕ =====
function getContactInfo(contactId) {
  // Сначала ищем среди ботов
  const bot = botUsers.find(b => b.id === contactId);
  if (bot) return bot;
  
  // Потом среди друзей
  const friend = friendsList.find(f => f.id === contactId);
  if (friend) return friend;
  
  return null;
}

// ===== ЭКСПОРТ =====
window.botUsers = botUsers;
window.renderContacts = renderContacts;
window.updateDraft = updateDraft;
window.getContactInfo = getContactInfo;

// ===== СЛУШАТЕЛЬ ИЗМЕНЕНИЙ APPSTATE =====
// Проверяем каждые 2 секунды, не изменился ли список друзей
setInterval(() => {
  if (window.AppState && window.AppState.friends) {
    if (JSON.stringify(window.AppState.friends) !== JSON.stringify(friendsList)) {
      friendsList = window.AppState.friends;
      if (document.getElementById('friendsScreen')?.classList.contains('active')) {
        renderContacts();
      }
    }
  }
}, 2000);

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ contacts.js загружен');
  
  // Загружаем друзей из AppState если доступен
  if (window.AppState && window.AppState.friends) {
    friendsList = window.AppState.friends;
  }
  
  // Рендерим контакты если открыт экран
  if (document.getElementById('friendsScreen')?.classList.contains('active')) {
    setTimeout(renderContacts, 100);
  }
});
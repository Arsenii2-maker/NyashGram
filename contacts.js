// contacts.js — ПОЛНЫЙ С ПРИВЕТСТВИЯМИ И ПЕРЕИМЕНОВАНИЕМ

const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope' },
  { id: 'nyashcook', name: 'NyashCook', username: 'nyashcook' }
];

// Друзья (будут загружаться)
let friendsList = [];
let friendRequests = [];
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');

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

// ===== КАСТОМНЫЕ ИМЕНА =====
function getDisplayName(contactId, defaultName) {
  return customNames[contactId] || defaultName;
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

// ===== ОТРИСОВКА =====
function renderContacts() {
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
    el.className = `contact bot-section ${isPinned(bot.id) ? 'pinned' : ''}`;
    el.setAttribute('data-id', bot.id);
    
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
      case 'nyashcook':
        gradient = 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
        break;
    }
    
    el.innerHTML = `
      <div class="avatar" style="background: ${gradient}; background-size: cover;"></div>
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
      
      el.innerHTML = `
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
        <div class="info">
          <div class="name">${displayName} ${isPinned(friend.id) ? '<span class="pin-icon">📌</span>' : ''}</div>
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
      
      el.innerHTML = `
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
        <div class="info">
          <div class="name">${friend.name}</div>
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('friendsScreen')?.classList.contains('active')) {
    renderContacts();
  }
});

window.renderContacts = renderContacts;
window.updateDraft = updateDraft;
window.getDraft = getDraft;
window.togglePin = togglePin;

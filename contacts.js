// contacts.js — ПОЛНЫЙ ИСПРАВЛЕННЫЙ

const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope' }
];

let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');

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
    const el = document.createElement('div');
    el.className = `contact bot-section ${isPinned(bot.id) ? 'pinned' : ''}`;
    
    // Градиенты для ботов
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
        gradient = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
    }
    
    el.innerHTML = `
      <div class="avatar" style="background: ${gradient}; background-size: cover;"></div>
      <div class="info">
        <div class="name">${bot.name} ${isPinned(bot.id) ? '<span class="pin-icon">📌</span>' : ''}</div>
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
  
  // Секция друзей (пока пусто)
  const friendsHeader = document.createElement('div');
  friendsHeader.className = 'section-header';
  friendsHeader.textContent = '👥 друзья';
  list.appendChild(friendsHeader);
  
  const emptyFriends = document.createElement('div');
  emptyFriends.className = 'empty-state';
  emptyFriends.innerHTML = `
    <div class="empty-icon">👥</div>
    <p>тут пока никого нет</p>
    <button id="findFriendsBtn" class="small-btn">🔍 найти друга</button>
  `;
  list.appendChild(emptyFriends);
  
  setTimeout(() => {
    document.getElementById('findFriendsBtn')?.addEventListener('click', () => {
      alert('🔍 поиск друзей скоро будет!');
    });
  }, 100);
}

function renderFriends(list) {
  const emptyEl = document.createElement('div');
  emptyEl.
    className = 'empty-state';
  emptyEl.innerHTML = `
    <div class="empty-icon">👥</div>
    <h3>у тебя пока нет друзей</h3>
    <p>найди друзей по юзернейму</p>
    <button id="findFriendsBtn" class="small-btn">🔍 найти</button>
  `;
  list.appendChild(emptyEl);
  
  setTimeout(() => {
    document.getElementById('findFriendsBtn')?.addEventListener('click', () => {
      alert('🔍 поиск друзей скоро будет!');
    });
  }, 100);
}

function renderRequests(list) {
  const emptyEl = document.createElement('div');
  emptyEl.className = 'empty-state';
  emptyEl.innerHTML = `
    <div class="empty-icon">📨</div>
    <h3>нет заявок</h3>
    <p>когда кто-то захочет добавить тебя, они появятся здесь</p>
  `;
  list.appendChild(emptyEl);
}

// ===== ВКЛАДКИ =====
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderContacts();
    });
  });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  initTabs();
  
  if (document.getElementById('friendsScreen')?.classList.contains('active')) {
    renderContacts();
  }
});

// ===== ЭКСПОРТ =====
window.renderContacts = renderContacts;
window.updateDraft = updateDraft;
window.getDraft = getDraft;

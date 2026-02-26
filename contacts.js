// contacts.js — ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp', emoji: '🩷' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk', emoji: '🌸' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame', emoji: '🎮' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope', emoji: '🔮' },
  { id: 'nyashcook', name: 'NyashCook', username: 'nyashcook', emoji: '🍳' }
];

let friendsList = [];
let friendRequests = [];
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');

window.customNames = customNames;
window.pinnedChats = pinnedChats;
window.friendsList = friendsList;
window.friendRequests = friendRequests;

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
  window.pinnedChats = pinnedChats;
  renderContacts();
  window.showToast?.(pinnedChats.includes(chatId) ? '📌 Чат закреплён' : '📌 Чат откреплён', 'info');
}

function getDisplayName(contactId, defaultName) {
  return customNames[contactId] || defaultName;
}

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
    
    if (userData.friends && userData.friends.length > 0) {
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
    
    if (userData.friendRequests && userData.friendRequests.length > 0) {
      console.log(`📨 Найдено ${userData.friendRequests.length} заявок`);
      const requestsData = await Promise.all(
        userData.friendRequests.map(async (req) => {
          const fromId = typeof req === 'object' ? req.from : req;
          const userDoc = await window.db.collection('users').doc(fromId).get();
          return {
            from: fromId,
            fromUser: { id: userDoc.id, ...userDoc.data() },
            timestamp: typeof req === 'object' ? req.timestamp : Date.now()
          };
        })
      );
      friendRequests = requestsData;
      console.log('📨 Заявки:', friendRequests);
    } else {
      friendRequests = [];
    }
    
    window.friendsList = friendsList;
    window.friendRequests = friendRequests;
    
    updateRequestsBadge();
    renderContacts();
    
  } catch (error) {
    console.error('❌ Ошибка загрузки друзей:', error);
  }
}

function updateRequestsBadge() {
  const badge = document.getElementById('requestsBadge');
  if (badge) {
    if (friendRequests.length > 0) {
      badge.textContent = friendRequests.length;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

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
  const botsHeader = document.createElement('div');
  botsHeader.className = 'section-header';
  botsHeader.textContent = '🤖 няш-боты';
  list.appendChild(botsHeader);
  
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
      <div class="avatar" style="background: ${getBotGradient(bot.id)};">
        <span class="avatar-emoji">${bot.emoji || '🤖'}</span>
      </div>
      <div class="info">
        <div class="name">${displayName} ${isPinned(bot.id) ? '<span class="pin-icon">📌</span>' : ''}</div>
        <div class="username">@${bot.username}</div>
        ${draft ? `<div class="draft">📝 ${draft.slice(0, 25)}${draft.length > 25 ? '...' : ''}</div>` : ''}
      </div>
    `;
    
    el.onclick = () => window.openBotChat?.(bot);
    list.appendChild(el);
  });
  
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
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);">
          <span class="avatar-emoji">👤</span>
        </div>
        <div class="info">
          <div class="name">${displayName} ${onlineStatus} ${isPinned(friend.id) ? '<span class="pin-icon">📌</span>' : ''}</div>
          <div class="username">@${friend.username}</div>
          ${draft ? `<div class="draft">📝 ${draft.slice(0, 25)}${draft.length > 25 ? '...' : ''}</div>` : ''}
        </div>
      `;
      
      el.onclick = () => window.openFriendChat?.(friend);
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
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);">
          <span class="avatar-emoji">👤</span>
        </div>
        <div class="info">
          <div class="name">${friend.name} ${onlineStatus}</div>
          <div class="username">@${friend.username}</div>
        </div>
        <button class="message-btn" data-id="${friend.id}">💬</button>
      `;
      
      el.querySelector('.message-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.openFriendChat?.(friend);
      });
      
      el.onclick = () => window.openFriendChat?.(friend);
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
        window.showScreen?.('searchFriendsScreen');
      });
    }, 100);
  }
}

// ===== ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАЯВОК =====
function renderRequests(list) {
  console.log('📨 Рендерим заявки, количество:', friendRequests.length);
  
  if (friendRequests && friendRequests.length > 0) {
    friendRequests.forEach(request => {
      const el = document.createElement('div');
      el.className = 'contact request-item';
      
      const fromName = request.fromUser?.name || 'Пользователь';
      const fromUsername = request.fromUser?.username || 'unknown';
      
      el.innerHTML = `
        <div class="avatar" style="background: linear-gradient(135deg, #ffb6c1, #ff9eb5);">
          <span class="avatar-emoji">📨</span>
        </div>
        <div class="info">
          <div class="name">${fromName}</div>
          <div class="username">@${fromUsername}</div>
          <div class="request-time">${new Date(request.timestamp).toLocaleDateString()}</div>
        </div>
        <div class="request-actions">
          <button class="accept-request" data-id="${request.from}">✅</button>
          <button class="reject-request" data-id="${request.from}">❌</button>
        </div>
      `;
      
      list.appendChild(el);
      
      el.querySelector('.accept-request')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const result = await window.acceptFriendRequest?.(request.from);
        if (result?.success) {
          await loadFriends();
          window.showToast?.('✅ Заявка принята!', 'success');
        } else {
          window.showToast?.('❌ Ошибка при принятии', 'error');
        }
      });
      
      el.querySelector('.reject-request')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.removeFriendRequest?.(request.from);
        await loadFriends();
        window.showToast?.('❌ Заявка отклонена', 'info');
      });
    });
  } else {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📨</div>
        <h3>нет заявок</h3>
        <p>когда кто-то захочет добавить тебя, они появятся здесь</p>
      </div>
    `;
  }
}

function listenToFriendChanges() {
  if (!window.auth?.currentUser || window.auth.currentUser.isAnonymous) return;
  
  window.db.collection('users').doc(window.auth.currentUser.uid)
    .onSnapshot(() => {
      console.log('👥 Данные изменились');
      loadFriends();
    });
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('👥 contacts.js загружен');
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderContacts();
    });
  });
  
  if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
    setTimeout(() => {
      loadFriends();
      listenToFriendChanges();
    }, 500);
  }
  
  document.addEventListener('userAuthenticated', () => {
    loadFriends();
    listenToFriendChanges();
  });
});

window.loadFriends = loadFriends;
window.renderContacts = renderContacts;
window.updateDraft = updateDraft;
window.getDraft = getDraft;
window.togglePin = togglePin;
window.friendsList = friendsList;
window.friendRequests = friendRequests;
window.botUsers = botUsers;
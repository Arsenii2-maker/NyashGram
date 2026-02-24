// contacts.js — ПОЛНЫЙ АБСОЛЮТНО РАБОЧИЙ ФАЙЛ С ИСПРАВЛЕНИЯМИ

// ===== БОТЫ =====
const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp', emoji: '🩷' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk', emoji: '🌸' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame', emoji: '🎮' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope', emoji: '🔮' },
  { id: 'nyashcook', name: 'NyashCook', username: 'nyashcook', emoji: '🍳' }
];

// ===== СОСТОЯНИЕ =====
let friendsList = [];
let friendRequests = [];
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
let lastUpdateTime = 0;

// Делаем глобальными для других скриптов
window.customNames = customNames;
window.pinnedChats = pinnedChats;
window.friendsList = friendsList;
window.friendRequests = friendRequests;
window.botUsers = botUsers;

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
  
  // Показываем уведомление
  const message = pinnedChats.includes(chatId) ? '📌 чат закреплён' : '📌 чат откреплён';
  if (typeof window.showNotification === 'function') {
    window.showNotification(message);
  } else {
    alert(message);
  }
}

// ===== КАСТОМНЫЕ ИМЕНА =====
function getDisplayName(contactId, defaultName) {
  return customNames[contactId] || defaultName;
}

// ===== ОБНОВЛЕНИЕ БЕЙДЖА =====
function updateRequestsBadge() {
  const badge = document.getElementById('requestsBadge');
  if (badge) {
    if (friendRequests.length > 0) {
      badge.textContent = friendRequests.length;
      badge.style.display = 'inline-flex';
      badge.style.animation = 'badgePulse 0.3s ease';
      console.log('📨 Бейдж обновлён:', friendRequests.length);
    } else {
      badge.style.display = 'none';
      console.log('📨 Бейдж скрыт');
    }
  } else {
    console.warn('⚠️ Элемент requestsBadge не найден в HTML');
  }
}

// ===== ЗАГРУЗКА ДРУЗЕЙ ИЗ FIREBASE =====
async function loadFriends(force = false) {
  console.log('👥 Загружаем друзей...');
  
  // Защита от частых вызовов
  const now = Date.now();
  if (!force && now - lastUpdateTime < 2000) {
    console.log('⏳ Слишком частые запросы, пропускаем');
    return;
  }
  lastUpdateTime = now;
  
  if (!window.auth || !window.auth.currentUser) {
    console.log('❌ Нет авторизации');
    return;
  }
  
  if (window.auth.currentUser.isAnonymous) {
    console.log('👤 Гостевой режим - друзья недоступны');
    friendsList = [];
    friendRequests = [];
    renderContacts();
    return;
  }
  
  try {
    const userDoc = await window.db.collection('users').doc(window.auth.currentUser.uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ Документ пользователя не найден');
      return;
    }
    
    const userData = userDoc.data();
    console.log('📨 Данные пользователя:', userData);
    
    // Загружаем друзей
    if (userData.friends && Array.isArray(userData.friends) && userData.friends.length > 0) {
      console.log(`👥 Найдено ${userData.friends.length} друзей`);
      
      const friendsData = await Promise.all(
        userData.friends.map(async (friendId) => {
          try {
            const friendDoc = await window.db.collection('users').doc(friendId).get();
            if (friendDoc.exists) {
              return { 
                id: friendDoc.id, 
                ...friendDoc.data(),
                chatId: friendDoc.id // Для совместимости
              };
            }
          } catch (e) {
            console.error('❌ Ошибка загрузки друга:', e);
          }
          return null;
        })
      );
      
      friendsList = friendsData.filter(f => f !== null);
      console.log('👥 Друзья загружены:', friendsList);
    } else {
      friendsList = [];
      console.log('👥 Нет друзей');
    }
    
    // ЗАГРУЖАЕМ ЗАЯВКИ (исправлено!)
    if (userData.friendRequests && Array.isArray(userData.friendRequests) && userData.friendRequests.length > 0) {
      console.log(`📨 Найдено ${userData.friendRequests.length} заявок`);
      
      const requestsData = await Promise.all(
        userData.friendRequests.map(async (req) => {
          // Проверяем формат заявки
          const fromId = typeof req === 'object' ? req.from : req;
          const timestamp = typeof req === 'object' ? req.timestamp : Date.now();
          
          if (!fromId) return null;
          
          try {
            const userDoc = await window.db.collection('users').doc(fromId).get();
            if (userDoc.exists) {
              return {
                from: fromId,
                fromUser: { 
                  id: userDoc.id, 
                  name: userDoc.data().name || 'Пользователь',
                  username: userDoc.data().username || 'unknown'
                },
                timestamp: timestamp
              };
            }
          } catch (e) {
            console.error('❌ Ошибка загрузки пользователя заявки:', e);
          }
          return null;
        })
      );
      
      // Фильтруем null и undefined
      friendRequests = requestsData.filter(req => req !== null && req !== undefined);
      console.log('📨 ЗАЯВКИ ПОСЛЕ ОБРАБОТКИ:', friendRequests);
    } else {
      friendRequests = [];
      console.log('📨 Нет заявок');
    }
    
    // Обновляем бейдж
    updateRequestsBadge();
    
    // Рендерим интерфейс
    renderContacts();
    
    // Возвращаем данные для цепочек вызовов
    return { friends: friendsList, requests: friendRequests };
    
  } catch (error) {
    console.error('❌ Ошибка загрузки друзей:', error);
    return { friends: [], requests: [] };
  }
}

// ===== ПЛАВНОЕ ПОЯВЛЕНИЕ КОНТАКТОВ =====
function animateContacts(container) {
  const contacts = container.querySelectorAll('.contact, .contact-item');
  contacts.forEach((contact, index) => {
    contact.style.animation = `contactAppear 0.3s ease ${index * 0.05}s forwards`;
    contact.style.opacity = '0';
    contact.style.transform = 'translateY(10px)';
  });
}

// ===== ОТРИСОВКА =====
function renderContacts() {
  const list = document.getElementById('friendsList');
  if (!list) {
    console.error('❌ friendsList не найден');
    return;
  }
  
  // Определяем активный таб
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'chats';
  console.log('🎨 Рендерим вкладку:', activeTab);
  
  // Показываем загрузку
  list.innerHTML = '<div class="loading-contacts">✨ Загружаем контакты...</div>';
  
  // Небольшая задержка для плавности
  setTimeout(() => {
    list.innerHTML = '';
    
    if (activeTab === 'chats') {
      renderChats(list);
    } else if (activeTab === 'friends') {
      renderFriends(list);
    } else if (activeTab === 'requests') {
      renderRequests(list);
    }
    
    // Анимируем появление
    animateContacts(list);
  }, 200);
}

function renderChats(list) {
  // Секция ботов
  const botsHeader = document.createElement('div');
  botsHeader.className = 'section-header';
  botsHeader.innerHTML = '🤖 няш-боты <span class="section-count">5</span>';
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
      <div class="avatar" style="background: ${getBotGradient(bot.id)};">
        <span class="avatar-emoji">${bot.emoji || '🤖'}</span>
      </div>
      <div class="info">
        <div class="name">
          ${displayName}
          ${isPinned(bot.id) ? '<span class="pin-icon" title="закреплён">📌</span>' : ''}
        </div>
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
    friendsHeader.innerHTML = `👥 друзья <span class="section-count">${friendsList.length}</span>`;
    list.appendChild(friendsHeader);
    
    // Сортируем друзей: сначала онлайн, потом по имени
    const sortedFriends = [...friendsList].sort((a, b) => {
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
    
    sortedFriends.forEach(friend => {
      const draft = getDraft(friend.id);
      const displayName = getDisplayName(friend.id, friend.name || 'Друг');
      const el = document.createElement('div');
      el.className = `contact ${isPinned(friend.id) ? 'pinned' : ''}`;
      el.setAttribute('data-id', friend.id);
      
      const onlineStatus = friend.online ? 
        '<span class="online-dot" title="онлайн">●</span>' : 
        '<span class="offline-dot" title="офлайн">○</span>';
      
      el.innerHTML = `
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);">
          <span class="avatar-emoji">👤</span>
        </div>
        <div class="info">
          <div class="name">
            ${displayName} ${onlineStatus}
            ${isPinned(friend.id) ? '<span class="pin-icon">📌</span>' : ''}
          </div>
          <div class="username">@${friend.username || 'unknown'}</div>
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
      
      const onlineStatus = friend.online ? 
        '<span class="online-dot">●</span>' : 
        '<span class="offline-dot">○</span>';
      
      el.innerHTML = `
        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);">
          <span class="avatar-emoji">👤</span>
        </div>
        <div class="info">
          <div class="name">${friend.name || 'Друг'} ${onlineStatus}</div>
          <div class="username">@${friend.username || 'unknown'}</div>
        </div>
        <button class="message-btn" data-id="${friend.id}" title="написать">💬</button>
      `;
      
      // Обработчик для кнопки сообщения
      el.querySelector('.message-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.openFriendChat === 'function') {
          window.openFriendChat(friend);
        }
      });
      
      // Обработчик для всего элемента
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
      <button id="findFriendsBtn" class="small-btn">🔍 найти друзей</button>
    `;
    list.appendChild(emptyEl);
    
    // Добавляем обработчик на кнопку
    setTimeout(() => {
      document.getElementById('findFriendsBtn')?.addEventListener('click', () => {
        if (typeof window.showScreen === 'function') {
          window.showScreen('searchFriendsScreen');
        } else {
          console.error('❌ showScreen не определён');
        }
      });
    }, 100);
  }
}

// ===== ИСПРАВЛЕННАЯ ФУНКЦИЯ ОТОБРАЖЕНИЯ ЗАЯВОК =====
function renderRequests(list) {
  console.log('📨 Рендерим заявки:', friendRequests);
  
  if (friendRequests && friendRequests.length > 0) {
    friendRequests.forEach((request, index) => {
      // Создаём элемент
      const el = document.createElement('div');
      el.className = 'contact request-item';
      el.setAttribute('data-request-id', request.from);
      el.style.animationDelay = `${index * 0.1}s`;
      
      // Данные отправителя
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
          <button class="accept-request" data-id="${request.from}" title="принять">✅</button>
          <button class="reject-request" data-id="${request.from}" title="отклонить">❌</button>
        </div>
      `;
      
      // ✅ ВАЖНО: добавляем в DOM
      list.appendChild(el);
      
      // Добавляем обработчики ПОСЛЕ добавления в DOM
      const acceptBtn = el.querySelector('.accept-request');
      const rejectBtn = el.querySelector('.reject-request');
      
      if (acceptBtn) {
        acceptBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          acceptBtn.disabled = true;
          acceptBtn.textContent = '⏳';
          
          try {
            // Пытаемся принять заявку
            if (typeof window.acceptFriendRequest === 'function') {
              const result = await window.acceptFriendRequest(request.from);
              if (result && result.success) {
                await loadFriends(true);
                window.showNotification('✅ Заявка принята!');
              } else {
                throw new Error('Не удалось принять заявку');
              }
            } else {
              // Заглушка, если функция не определена
              console.warn('⚠️ acceptFriendRequest не определена');
              setTimeout(() => {
                // Имитируем успех для демо
                friendRequests = friendRequests.filter(r => r.from !== request.from);
                renderRequests(list);
                updateRequestsBadge();
                window.showNotification('✅ Заявка принята (демо)');
              }, 500);
            }
          } catch (error) {
            console.error('❌ Ошибка при принятии:', error);
            window.showNotification('❌ Ошибка при принятии заявки');
            acceptBtn.disabled = false;
            acceptBtn.textContent = '✅';
          }
        });
      }
      
      if (rejectBtn) {
        rejectBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          rejectBtn.disabled = true;
          rejectBtn.textContent = '⏳';
          
          try {
            if (typeof window.removeFriendRequest === 'function') {
              await window.removeFriendRequest(request.from);
              await loadFriends(true);
              window.showNotification('❌ Заявка отклонена');
            } else {
              // Заглушка
              setTimeout(() => {
                friendRequests = friendRequests.filter(r => r.from !== request.from);
                renderRequests(list);
                updateRequestsBadge();
                window.showNotification('❌ Заявка отклонена (демо)');
              }, 500);
            }
          } catch (error) {
            console.error('❌ Ошибка при отклонении:', error);
            window.showNotification('❌ Ошибка');
            rejectBtn.disabled = false;
            rejectBtn.textContent = '❌';
          }
        });
      }
    });
    
    console.log(`✅ Отображено ${friendRequests.length} заявок`);
  } else {
    // Пустое состояние
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state';
    emptyEl.innerHTML = `
      <div class="empty-icon">📨</div>
      <h3>нет заявок в друзья</h3>
      <p>когда кто-то захочет добавить тебя, они появятся здесь</p>
      <button id="goToSearchBtn" class="small-btn">🔍 поиск друзей</button>
    `;
    list.appendChild(emptyEl);
    
    // Обработчик для кнопки поиска
    setTimeout(() => {
      document.getElementById('goToSearchBtn')?.addEventListener('click', () => {
        if (typeof window.showScreen === 'function') {
          window.showScreen('searchFriendsScreen');
        }
      });
    }, 100);
    
    console.log('📭 Нет заявок для отображения');
  }
}

// ===== СЛУШАТЕЛЬ ИЗМЕНЕНИЙ В FIREBASE =====
function listenToFriendChanges() {
  if (!window.auth?.currentUser || window.auth.currentUser.isAnonymous) {
    console.log('👤 Гость, не слушаем изменения');
    return;
  }
  
  console.log('👥 Устанавливаем слушатель изменений друзей');
  
  window.db.collection('users').doc(window.auth.currentUser.uid)
    .onSnapshot((doc) => {
      if (doc.exists) {
        console.log('👥 Данные пользователя изменились, обновляем...');
        loadFriends(true);
      }
    }, (error) => {
      console.error('❌ Ошибка слушателя:', error);
    });
}

// ===== УТИЛИТЫ =====
function showNotification(message) {
  // Используем alert для простоты, но можно заменить на красивый тост
  alert(message);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('👥 contacts.js загружен и инициализирован');
  
  // Загружаем друзей если уже авторизованы
  setTimeout(() => {
    if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
      loadFriends(true);
      listenToFriendChanges();
    } else {
      console.log('👤 Ожидание авторизации...');
      
      // Слушаем событие авторизации
      document.addEventListener('userAuthenticated', () => {
        console.log('👤 Пользователь авторизован, загружаем друзей');
        loadFriends(true);
        listenToFriendChanges();
      });
    }
  }, 500);
  
  // Добавляем стили для анимации, если их нет
  if (!document.getElementById('contactsAnimations')) {
    const style = document.createElement('style');
    style.id = 'contactsAnimations';
    style.textContent = `
      @keyframes contactAppear {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes badgePulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      .badge {
        background: #ff4d6d;
        color: white;
        border-radius: 20px;
        padding: 2px 8px;
        font-size: 12px;
        margin-left: 5px;
        font-weight: bold;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
      }
      
      .request-item {
        background: rgba(255, 182, 193, 0.1);
        border-left: 3px solid #ff9eb5;
      }
      
      .request-actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }
      
      .accept-request, .reject-request {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .accept-request {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      }
      
      .accept-request:hover {
        background: #4caf50;
        color: white;
        transform: scale(1.1);
      }
      
      .reject-request {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
      }
      
      .reject-request:hover {
        background: #f44336;
        color: white;
        transform: scale(1.1);
      }
      
      .accept-request:disabled, .reject-request:disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      
      .request-time {
        font-size: 11px;
        color: var(--text-secondary, #666);
        margin-top: 2px;
      }
      
      .avatar-emoji {
        font-size: 24px;
        line-height: 48px;
        text-align: center;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .online-dot {
        color: #4caf50;
        font-size: 14px;
        margin-left: 4px;
      }
      
      .offline-dot {
        color: #999;
        font-size: 14px;
        margin-left: 4px;
      }
      
      .section-header {
        padding: 10px 16px 5px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary, #666);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .section-count {
        background: rgba(128, 128, 128, 0.2);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
      }
      
      .loading-contacts {
        padding: 40px 20px;
        text-align: center;
        color: var(--text-secondary, #999);
        font-size: 14px;
        animation: pulse 1.5s ease infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
});

// ===== ЭКСПОРТ =====
window.loadFriends = loadFriends;
window.renderContacts = renderContacts;
window.updateDraft = updateDraft;
window.getDraft = getDraft;
window.togglePin = togglePin;
window.showNotification = showNotification;
window.friendsList = friendsList;
window.friendRequests = friendRequests;
window.botUsers = botUsers;
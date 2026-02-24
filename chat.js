// chat.js — МИНИМАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let quickPanelVisible = true;
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');

// ===== КНОПКИ ДЕЙСТВИЙ =====
function toggleChatActions() {
  const panel = document.getElementById('chatActionsPanel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  }
}

function showRenameModal() {
  const modal = document.getElementById('renameModal');
  const input = document.getElementById('renameInput');
  if (modal && input && currentChatId) {
    const nameEl = document.getElementById('chatContactName');
    input.value = customNames[currentChatId] || (nameEl ? nameEl.textContent : '');
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 100);
  }
}

function hideRenameModal() {
  const modal = document.getElementById('renameModal');
  if (modal) modal.style.display = 'none';
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  if (!input || !currentChatId) return;
  
  const newName = input.value.trim();
  if (newName) {
    customNames[currentChatId] = newName;
    localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
    const nameEl = document.getElementById('chatContactName');
    if (nameEl) nameEl.textContent = newName;
    alert('✏️ имя изменено');
    
    if (typeof window.renderContacts === 'function') {
      window.renderContacts();
    }
  }
  hideRenameModal();
}

function togglePinChat() {
  if (!currentChatId) return;
  
  if (pinnedChats.includes(currentChatId)) {
    pinnedChats = pinnedChats.filter(id => id !== currentChatId);
    alert('📌 чат откреплён');
  } else {
    pinnedChats.push(currentChatId);
    alert('📌 чат закреплён');
  }
  
  localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
  
  if (typeof window.renderContacts === 'function') {
    window.renderContacts();
  }
}

function muteChat() {
  alert('🔇 звук выключен');
}

function deleteChatHistory() {
  if (!currentChatId) return;
  
  if (currentChatType === 'bot' && confirm('удалить историю чата с ботом?')) {
    delete chatMessages[currentChatId];
    localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
    document.getElementById('chatArea').innerHTML = '';
    alert('🗑️ история удалена');
  } else {
    alert('История сообщений с друзьями хранится в облаке');
  }
}

// ===== ОТКРЫТИЕ ЧАТА С БОТОМ =====
function openBotChat(bot) {
  console.log('Открываем чат с ботом:', bot);
  
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  
  const nameEl = document.getElementById('chatContactName');
  const usernameEl = document.getElementById('chatContactUsername');
  const avatarEl = document.getElementById('chatAvatar');
  
  if (nameEl) nameEl.textContent = customNames[bot.id] || bot.name;
  if (usernameEl) usernameEl.textContent = `@${bot.username}`;
  
  if (avatarEl) {
    if (bot.id === 'nyashhelp') avatarEl.style.background = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
    else if (bot.id === 'nyashtalk') avatarEl.style.background = 'linear-gradient(135deg, #85d1c5, #b0e0d5)';
    else if (bot.id === 'nyashgame') avatarEl.style.background = 'linear-gradient(135deg, #ffb347, #ff8c42)';
    else if (bot.id === 'nyashhoroscope') avatarEl.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
    else if (bot.id === 'nyashcook') avatarEl.style.background = 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
  }
  
  const quickPanel = document.getElementById('quickReplyPanel');
  if (quickPanel) {
    quickPanel.style.display = 'flex';
  }
  
  // Загружаем историю
  const area = document.getElementById('chatArea');
  if (area) {
    area.innerHTML = '';
    
    if (chatMessages[bot.id] && chatMessages[bot.id].length > 0) {
      chatMessages[bot.id].forEach(msg => {
        const el = document.createElement('div');
        el.className = `message ${msg.type}`;
        el.innerHTML = `${msg.text}<span class="message-time">${msg.timeString}</span>`;
        area.appendChild(el);
      });
    } else {
      const el = document.createElement('div');
      el.className = 'message bot';
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      el.innerHTML = `привет! я ${bot.name} 💕<span class="message-time">${time}</span>`;
      area.appendChild(el);
      
      if (!chatMessages[bot.id]) chatMessages[bot.id] = [];
      chatMessages[bot.id].push({
        type: 'bot',
        text: `привет! я ${bot.name} 💕`,
        timeString: time
      });
      localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
    }
    
    area.scrollTop = area.scrollHeight;
  }
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
function sendMessage() {
  const input = document.getElementById('messageInput');
  if (!input) return;
  
  const text = input.value.trim();
  if (!text || !currentChat) return;
  
  // Сообщение пользователя
  const area = document.getElementById('chatArea');
  if (area) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const el = document.createElement('div');
    el.className = 'message user';
    el.innerHTML = `${text}<span class="message-time">${time}</span>`;
    area.appendChild(el);
    
    if (!chatMessages[currentChatId]) chatMessages[currentChatId] = [];
    chatMessages[currentChatId].push({
      type: 'user',
      text: text,
      timeString: time
    });
    localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
  }
  
  input.value = '';
  area.scrollTop = area.scrollHeight;
  
  // Ответ бота
  if (currentChatType === 'bot') {
    setTimeout(() => {
      const responses = {
        nyashhelp: "спроси про темы или шрифты! 💕",
        nyashtalk: "ой, интересно! расскажи ещё 🥰",
        nyashgame: "хочешь поиграть? 🎮",
        nyashhoroscope: "сегодня отличный день! ✨",
        nyashcook: "хочешь рецепт? 🍳"
      };
      
      const response = responses[currentChatId] || "💕";
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const el = document.createElement('div');
      el.className = 'message bot';
      el.innerHTML = `${response}<span class="message-time">${time}</span>`;
      area.appendChild(el);
      
      chatMessages[currentChatId].push({
        type: 'bot',
        text: response,
        timeString: time
      });
      localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
      
      area.scrollTop = area.scrollHeight;
    }, 1000);
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 chat.js загружен');
  
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (typeof window.showScreen === 'function') {
        window.showScreen('friendsScreen');
      }
    });
  }
  
  const chatMenuBtn = document.getElementById('chatMenuBtn');
  if (chatMenuBtn) {
    chatMenuBtn.addEventListener('click', toggleChatActions);
  }
  
  const pinChatActionBtn = document.getElementById('pinChatActionBtn');
  if (pinChatActionBtn) {
    pinChatActionBtn.addEventListener('click', () => {
      togglePinChat();
      document.getElementById('chatActionsPanel').style.display = 'none';
    });
  }
  
  const renameChatBtn = document.getElementById('renameChatBtn');
  if (renameChatBtn) {
    renameChatBtn.addEventListener('click', () => {
      showRenameModal();
      document.getElementById('chatActionsPanel').style.display = 'none';
    });
  }
  
  const muteChatBtn = document.getElementById('muteChatBtn');
  if (muteChatBtn) {
    muteChatBtn.addEventListener('click', () => {
      muteChat();
      document.getElementById('chatActionsPanel').style.display = 'none';
    });
  }
  
  const deleteChatBtn = document.getElementById('deleteChatBtn');
  if (deleteChatBtn) {
    deleteChatBtn.addEventListener('click', () => {
      deleteChatHistory();
      document.getElementById('chatActionsPanel').style.display = 'none';
    });
  }
  
  const renameCancelBtn = document.getElementById('renameCancelBtn');
  if (renameCancelBtn) {
    renameCancelBtn.addEventListener('click', hideRenameModal);
  }
  
  const renameConfirmBtn = document.getElementById('renameConfirmBtn');
  if (renameConfirmBtn) {
    renameConfirmBtn.addEventListener('click', renameCurrentChat);
  }
  
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const messageInput = document.getElementById('messageInput');
  
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', sendMessage);
  }
  
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  window.openBotChat = openBotChat;
});
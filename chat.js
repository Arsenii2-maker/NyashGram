// chat.js — ПОЛНЫЙ ИСПРАВЛЕННЫЙ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let quickPanelVisible = true;
let chatMessages = JSON.parse(localStorage.
                              getItem('nyashgram_chat_messages') || '{}');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');

// ===== СОХРАНЕНИЕ ИМЁН =====
function saveCustomName(chatId, name) {
  if (name && name.trim()) {
    customNames[chatId] = name.trim();
  } else {
    delete customNames[chatId];
  }
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
}

// ===== ЗАКРЕПЛЕНИЕ =====
function togglePinChat(chatId) {
  if (pinnedChats.includes(chatId)) {
    pinnedChats = pinnedChats.filter(id => id !== chatId);
    showNotification('📌 чат откреплён');
  } else {
    pinnedChats.push(chatId);
    showNotification('📌 чат закреплён');
  }
  localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(msg) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = msg;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--card-bg);
    backdrop-filter: blur(10px);
    padding: 12px 24px;
    border-radius: 40px;
    border: 2px solid var(--accent);
    color: var(--text);
    z-index: 10000;
    animation: slideDown 0.3s ease, fadeOut 0.3s ease 2s forwards;
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2300);
}

// ===== ОТКРЫТИЕ ЧАТА =====
function openBotChat(bot) {
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  
  document.getElementById('chatContactName').textContent = customNames[bot.id] || bot.name;
  document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
  
  const avatar = document.getElementById('chatAvatar');
  if (bot.id === 'nyashhelp') avatar.style.background = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
  if (bot.id === 'nyashtalk') avatar.style.background = 'linear-gradient(135deg, #85d1c5, #b0e0d5)';
  if (bot.id === 'nyashgame') avatar.style.background = 'linear-gradient(135deg, #ffb347, #ff8c42)';
  if (bot.id === 'nyashhoroscope') avatar.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
  
  showQuickReplies(bot.id);
  showScreen('chatScreen');
}

// ===== БЫСТРЫЕ ОТВЕТЫ =====
const quickQuestions = {
  nyashhelp: [
    "как сменить тему? 🎨",
    "как поменять шрифт? ✍️",
    "кто такие боты? 🤖",
    "как добавить друга? 👥"
  ],
  nyashtalk: [
    "как дела? 💕",
    "что нового? 🌸",
    "любишь котиков? 🐱",
    "расскажи секрет 🤫"
  ],
  nyashgame: [
    "сыграем? 🎮",
    "угадай число 🔢",
    "камень-ножницы ✂️",
    "кости 🎲"
  ],
  nyashhoroscope: [
    "что сегодня? ✨",
    "любовь 💕",
    "деньги 💰",
    "совет 🌟"
  ]
};

function showQuickReplies(botId) {
  const panel = document.getElementById('quickReplyPanel');
  if (!panel) return;
  
  const questions = quickQuestions[botId] || quickQuestions.nyashtalk;
  
  panel.innerHTML = '';
  questions.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'quick-chip';
    btn.textContent = q;
    btn.onclick = () => {
      document.getElementById('messageInput').value = q;
      sendMessage();
    };
    panel.appendChild(btn);
  });
}

function toggleQuickPanel() {
  const panel = document.getElementById('quickReplyPanel');
  quickPanelVisible = !quickPanelVisible;
  panel.style.display = quickPanelVisible ? 'flex' : 'none';
}

// ===== ОТПРАВКА СООБЩЕНИЙ =====
function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text || !currentChat) return;
  
  addMessage(text, 'user');
  input.value = '';
  
  setTimeout(() => {
    const response = getBotResponse(currentChat.id, text);
    addMessage(response, 'bot');
  }, 1000);
}

function addMessage(text, type) {
  const area = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  
  const time = new Date().
    toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  msg.innerHTML = `${text}<span class="message-time">${time}</span>`;
  
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
}

// ===== ОТВЕТЫ БОТОВ =====
const botResponses = {
  nyashhelp: {
    themes: "у нас 6 тем: pastel pink 💗, milk rose 🌸, night blue 🌙, lo-fi beige 📖, soft lilac 💜, forest mint 🌿!",
    fonts: "6 шрифтов: system, rounded, cozy, elegant, bold soft, mono cozy!",
    bots: "наши боты: nyashhelp 🩷, nyashtalk 🌸, nyashgame 🎮, nyashhoroscope 🔮!",
    default: "спроси про темы, шрифты или ботов! 💕"
  },
  nyashtalk: {
    hello: ["приветик! 🩷 как дела?", "хай-хай! 💕 соскучилась!"],
    mood: ["у меня всё отлично! а у тебя? 🎵", "я счастлива, потому что мы общаемся! 💗"],
    default: ["расскажи что-нибудь! 👂", "ой, интересно! продолжай 🥰"]
  },
  nyashgame: {
    game: "давай поиграем! угадай число от 1 до 10 🔢",
    default: "хочешь поиграть? 🎮"
  },
  nyashhoroscope: {
    today: "сегодня отличный день! ✨",
    default: "хочешь гороскоп? 🔮"
  }
};

function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return "💕";
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем')) return bot.themes;
    if (text.includes('шрифт')) return bot.fonts;
    if (text.includes('бот')) return bot.bots;
    return bot.default;
  }
  
  if (botId === 'nyashtalk') {
    if (text.includes('привет')) return bot.hello[Math.floor(Math.random() * bot.hello.length)];
    if (text.includes('как дела')) return bot.mood[Math.floor(Math.random() * bot.mood.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashgame') {
    if (text.includes('игр')) return bot.game;
    return bot.default;
  }
  
  if (botId === 'nyashhoroscope') {
    if (text.includes('сегодня')) return bot.today;
    return bot.default;
  }
  
  return "💕";
}

// ===== ДЕЙСТВИЯ С ЧАТОМ =====
function toggleChatActions() {
  const panel = document.getElementById('chatActionsPanel');
  if (!panel) return;
  
  panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function showRenameModal() {
  const modal = document.getElementById('renameModal');
  const input = document.getElementById('renameInput');
  if (modal && input && currentChatId) {
    input.value = customNames[currentChatId] || document.getElementById('chatContactName').textContent;
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 100);
  }
}

function hideRenameModal() {
  document.getElementById('renameModal').style.display = 'none';
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  if (!input || !currentChatId) return;
  
  const newName = input.value.trim();
  if (newName) {
    saveCustomName(currentChatId, newName);
    document.getElementById('chatContactName').textContent = newName;
  }
  hideRenameModal();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Настройка chat.js...');
  
  // Кнопка назад
  document.getElementById('backBtn')?.addEventListener('click', () => {
    if (typeof window.showScreen === 'function') {
      window.showScreen('friendsScreen');
    }
  });
  
  // Кнопка меню
  document.getElementById('chatMenuBtn')?.addEventListener('click', toggleChatActions);
  
  // Кнопка скрытия панели
  document.getElementById('toggleQuickPanelBtn')?.addEventListener('click', toggleQuickPanel);
  
  // ===== КНОПКИ В ПАНЕЛИ ДЕЙСТВИЙ =====
  document.getElementById('pinChatActionBtn')?.addEventListener('click', () => {
    if (currentChatId) togglePinChat(currentChatId);
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('renameChatBtn')?.addEventListener('click', () => {
    showRenameModal();
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('muteChatBtn')?.addEventListener('click', () => {
    showNotification('🔇 звук выключен');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('deleteChatBtn')?.addEventListener('click', () => {
    if (currentChatId && confirm('удалить историю чата?')) {
      delete chatMessages[currentChatId];
      localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
      document.getElementById('chatArea').innerHTML = '';
      showNotification('🗑️ история удалена');
    }
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  // ===== МОДАЛКА ПЕРЕИМЕНОВАНИЯ =====
  document.getElementById('renameCancelBtn')?.addEventListener('click', hideRenameModal);
  document.getElementById('renameConfirmBtn')?.addEventListener('click', renameCurrentChat);
  
  // ===== ОТПРАВКА СООБЩЕНИЙ =====
  document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);
  document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  window.openBotChat = openBotChat;
  
  console.log('✅ chat.js готов');
});

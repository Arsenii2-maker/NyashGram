// chat.js — ПОЛНЫЙ ЧАТ С ДРУЗЬЯМИ И БОТАМИ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let unsubscribeMessages = null;

// ===== БОТЫ =====
const botResponses = {
  nyashhelp: {
    help: "я NyashHelp! могу рассказать о приложении, темах, шрифтах и друзьях",
    themes: "у нас 6 тем: pastel pink, milk rose, night blue, lo-fi beige, soft lilac, forest mint",
    fonts: "6 шрифтов: system, rounded, cozy, elegant, bold soft, mono cozy",
    friends: "теперь можно добавлять настоящих друзей! ищи их по юзернейму 🔍",
    default: "спроси меня о темах, шрифтах или друзьях"
  },
  nyashtalk: {
    weather: "сегодня отличная погода для общения ☀️",
    mood: "у меня отличное настроение, потому что мы общаемся",
    cats: "котики - это 90% милоты и 10% хулиганства 😸",
    food: "обожаю сладенькое! а ты? 🍰",
    default: "расскажи что-нибудь интересное"
  },
  nyashgame: {
    game: "давай поиграем! угадай число от 1 до 10",
    rps: "камень, ножницы, бумага? выбирай!",
    dice: "🎲 бросаю кубики...",
    default: "хочешь поиграть? у меня есть угадай число, камень-ножницы-бумага"
  },
  nyashhoroscope: {
    today: "звёзды говорят, что сегодня отличный день для новых знакомств",
    love: "в любви сегодня тебя ждёт гармония",
    money: "финансовый день - удачный для покупок",
    default: "хочешь узнать, что звёзды приготовили на сегодня? ✨"
  }
};

// ===== СОХРАНЕНИЕ КАСТОМНЫХ ИМЁН =====
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');

function saveCustomName(chatId, newName) {
  if (!newName || newName.trim() === '') {
    delete customNames[chatId];
  } else {
    customNames[chatId] = newName.trim();
  }
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
}

function getCustomName(chatId, defaultName) {
  return customNames[chatId] || defaultName;
}

// ===== ОТКРЫТИЕ ЧАТА С ДРУГОМ =====
function openRealChat(chat, chatId) {
  console.log('Открываем чат с другом:', chat);
  
  currentChat = chat;
  currentChatId = chatId;
  currentChatType = 'friend';
  
  window.showScreen('chatScreen');
  
  document.getElementById('chatContactName').textContent = getCustomName(chatId, chat.otherUser.name);
  document.getElementById('chatContactUsername').textContent = `@${chat.otherUser.username}`;
  document.getElementById('chatStatus').textContent = chat.otherUser.online ? 'онлайн' : 'офлайн';
  
  const avatar = document.getElementById('chatAvatar');
  avatar.style.background = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
  
  if (unsubscribeMessages) unsubscribeMessages();
  
  const chatArea = document.getElementById('chatArea');
  chatArea.innerHTML = '';
  
  window.showLoadingScreen('загружаем сообщения...', 1000);
  
  setTimeout(() => {
    chatArea.innerHTML = `
      <div class="message bot">
        начало переписки с @${chat.otherUser.username}
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
      </div>
    `;
    window.hideLoadingScreen();
  }, 1000);
}

// ===== ОТКРЫТИЕ ЧАТА С БОТОМ =====
function openBotChat(bot) {
  console.log('Открываем чат с ботом:', bot);
  
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  
  window.showScreen('chatScreen');
  
  document.getElementById('chatContactName').textContent = bot.name;
  document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
  document.getElementById('chatStatus').textContent = 'бот ✨';
  
  const avatar = document.getElementById('chatAvatar');
  avatar.style.background = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
  
  const chatArea = document.getElementById('chatArea');
  chatArea.innerHTML = '';
  
  addBotMessage(bot.id, getBotGreeting(bot.id));
}

function getBotGreeting(botId) {
  const greetings = {
    nyashhelp: "привет! я NyashHelp 🩷 спрашивай о приложении, темах, шрифтах или друзьях",
    nyashtalk: "приветик! давай болтать 🌸 о чём поговорим?",
    nyashgame: "🎮 привет! хочешь поиграть? угадай число, камень-ножницы-бумага?",
    nyashhoroscope: "🔮 привет! хочешь узнать, что звёзды приготовили на сегодня?"
  };
  return greetings[botId] || "привет! чем могу помочь?";
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
function sendMessage(text) {
  if (!text.trim() || !currentChat) return;
  
  const messageText = text.trim();
  const input = document.getElementById('messageInput');
  input.value = '';
  
  if (currentChatType === 'bot') {
    addUserMessage(messageText);
    showBotTyping();
    
    setTimeout(() => {
      hideBotTyping();
      const response = getBotResponse(currentChat.id, messageText);
      addBotMessage(currentChat.id, response);
    }, 1500);
  } else {
    addUserMessage(messageText);
    showBotTyping();
    
    setTimeout(() => {
      hideBotTyping();
      addBotMessage(currentChat.id, '🕒 сообщение будет доставлено когда друг появится онлайн');
    }, 1000);
  }
}

function getBotResponse(botId, message) {
  const bot = botResponses[botId];
  if (!bot) return "я тебя не понял...";
  
  message = message.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (message.includes('тем')) return bot.themes;
    if (message.includes('шрифт')) return bot.fonts;
    if (message.includes('друг') || message.includes('найт')) return bot.friends;
    return bot.default;
  }
  
  if (botId === 'nyashtalk') {
    if (message.includes('погод')) return bot.weather;
    if (message.includes('настроен')) return bot.mood;
    if (message.includes('кот') || message.includes('кош')) return bot.cats;
    if (message.includes('ед') || message.includes('куш')) return bot.food;
    return bot.default;
  }
  
  if (botId === 'nyashgame') {
    if (message.includes('игр') || message.includes('давай')) return bot.game;
    if (message.includes('камень')) return bot.rps;
    if (message.includes('кости') || message.includes('кубик')) return bot.dice;
    return bot.default;
  }
  
  if (botId === 'nyashhoroscope') {
    if (message.includes('сегодня') || message.includes('день')) return bot.today;
    if (message.includes('любов')) return bot.love;
    if (message.includes('денег') || message.includes('финанс')) return bot.money;
    return bot.default;
  }
  
  return "интересно... расскажи подробнее";
}

function addUserMessage(text) {
  const chatArea = document.getElementById('chatArea');
  const el = document.createElement('div');
  el.className = 'message user';
  el.innerHTML = `${text} <span class="message-time">${new Date().toLocaleTimeString()}</span>`;
  chatArea.appendChild(el);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addBotMessage(botId, text) {
  const chatArea = document.getElementById('chatArea');
  const el = document.createElement('div');
  el.className = 'message bot';
  el.innerHTML = `${text} <span class="message-time">${new Date().toLocaleTimeString()}</span>`;
  chatArea.appendChild(el);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showBotTyping() {
  document.getElementById('typingIndicator').style.display = 'flex';
}

function hideBotTyping() {
  document.getElementById('typingIndicator').style.display = 'none';
}

// ===== ДЕЙСТВИЯ С ЧАТОМ =====
function toggleChatActions() {
  const panel = document.getElementById('chatActionsPanel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || panel.style.display === '') {
    panel.style.display = 'flex';
    panel.style.animation = 'slideDown 0.25s ease';
  } else {
    panel.style.animation = 'slideUp 0.2s ease';
    setTimeout(() => {
      panel.style.display = 'none';
      panel.style.animation = '';
    }, 200);
  }
}

function showRenameModal() {
  const modal = document.getElementById('renameModal');
  const input = document.getElementById('renameInput');
  
  if (modal && input && currentChatId) {
    input.value = customNames[currentChatId] || document.getElementById('chatContactName').textContent;
    modal.style.display = 'flex';
    
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
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
  saveCustomName(currentChatId, newName);
  
  const nameEl = document.getElementById('chatContactName');
  if (nameEl) nameEl.textContent = newName || (currentChat?.otherUser?.name || currentChat?.name);
  
  hideRenameModal();
}

function togglePinChat() {
  let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
  
  if (pinnedChats.includes(currentChatId)) {
    pinnedChats = pinnedChats.filter(id => id !== currentChatId);
    alert('📌 чат откреплён');
  } else {
    pinnedChats.push(currentChatId);
    alert('📌 чат закреплён');
  }
  
  localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Настройка chat.js...');
  
  document.getElementById('backBtn')?.addEventListener('click', () => {
    if (unsubscribeMessages) unsubscribeMessages();
    window.showScreen('friendsScreen');
  });
  
  document.getElementById('chatMenuBtn')?.addEventListener('click', toggleChatActions);
  
  // Кнопки в панели действий
  document.getElementById('pinChatActionBtn')?.addEventListener('click', () => {
    togglePinChat();
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('renameChatBtn')?.addEventListener('click', () => {
    showRenameModal();
  });
  
  document.getElementById('muteChatBtn')?.addEventListener('click', () => {
    alert('🔇 уведомления выключены');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('deleteChatBtn')?.addEventListener('click', () => {
    if (confirm('удалить историю чата?')) {
      document.getElementById('chatArea').innerHTML = '';
      document.getElementById('chatActionsPanel').style.display = 'none';
    }
  });
  
  // Модалка переименования
  document.getElementById('renameCancelBtn')?.addEventListener('click', hideRenameModal);
  document.getElementById('renameConfirmBtn')?.addEventListener('click', renameCurrentChat);
  
  document.getElementById('renameInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') renameCurrentChat();
  });
  
  // Отправка сообщения
  const sendBtn = document.getElementById('sendMessageBtn');
  const input = document.getElementById('messageInput');
  
  sendBtn?.addEventListener('click', () => {
    if (input.value.trim()) sendMessage(input.value);
  });
  
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });
  
  // Экспорт
  window.openRealChat = openRealChat;
  window.openBotChat = openBotChat;
  window.sendMessage = sendMessage;
  
  console.log('✅ chat.js готов');
});
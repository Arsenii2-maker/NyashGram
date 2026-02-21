// chat.js — ЧАТЫ С ДРУЗЬЯМИ И БОТАМИ

let currentChat = null;
let currentChatId = null;
let currentChatType = null; // 'friend' или 'bot'
let unsubscribeMessages = null;
let unsubscribeTyping = null;
let typingTimeout = null;

// ===== БОТЫ =====
const botResponses = {
  nyashhelp: {
    help: "Я NyashHelp! Могу рассказать о приложении, темах, шрифтах и друзьях!",
    themes: "У нас 6 тем: Pastel Pink, Milk Rose, Night Blue, Lo-Fi Beige, Soft Lilac, Forest Mint!",
    fonts: "6 шрифтов: System, Rounded, Cozy, Elegant, Bold Soft, Mono Cozy!",
    friends: "Теперь можно добавлять настоящих друзей! Ищи их по юзернейму 🔍",
    default: "Спроси меня о темах, шрифтах или друзьях!"
  },
  nyashtalk: {
    weather: "Сегодня отличная погода для общения! ☀️",
    mood: "У меня отличное настроение, потому что мы общаемся!",
    cats: "Котики - это 90% милоты и 10% хулиганства! 😸",
    food: "Обожаю сладенькое! А ты? 🍰",
    default: "Расскажи что-нибудь интересное!"
  },
  nyashgame: {
    game: "Давай поиграем! Угадай число от 1 до 10",
    rps: "Камень, ножницы, бумага? Выбирай!",
    dice: "🎲 Бросаю кубики...",
    default: "Хочешь поиграть? У меня есть угадай число, камень-ножницы-бумага!"
  },
  nyashhoroscope: {
    today: "Звёзды говорят, что сегодня отличный день для новых знакомств!",
    love: "В любви сегодня тебя ждёт гармония!",
    money: "Финансовый день - удачный для покупок!",
    default: "Хочешь узнать, что звёзды приготовили на сегодня? ✨"
  }
};

// ===== ОТКРЫТИЕ ЧАТА С ДРУГОМ =====
function openRealChat(friend, chatId) {
  console.log('Открываем чат с другом:', friend);
  
  currentChat = friend;
  currentChatId = chatId;
  currentChatType = 'friend';
  
  showScreen('chatScreen');
  
  document.getElementById('chatContactName').textContent = friend.name;
  document.getElementById('chatContactUsername').textContent = `@${friend.username}`;
  document.getElementById('chatStatus').textContent = friend.online ? 'онлайн' : 'офлайн';
  
  const avatar = document.getElementById('chatAvatar');
  avatar.style.background = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
  avatar.style.backgroundSize = 'cover';
  
  // Подписываемся на новые сообщения
  if (unsubscribeMessages) unsubscribeMessages();
  unsubscribeMessages = window.listenToMessages(chatId, renderMessages);
  
  // Подписываемся на статус "печатает"
  if (unsubscribeTyping) unsubscribeTyping();
  unsubscribeTyping = window.listenToTyping(chatId, (typing) => {
    const typingEl = document.getElementById('typingIndicator');
    if (typing && typing[friend.id]) {
      typingEl.style.display = 'flex';
    } else {
      typingEl.style.display = 'none';
    }
  });
}

// ===== ОТКРЫТИЕ ЧАТА С БОТОМ =====
function openBotChat(bot) {
  console.log('Открываем чат с ботом:', bot);
  
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  
  showScreen('chatScreen');
  
  document.getElementById('chatContactName').textContent = bot.name;
  document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
  document.getElementById('chatStatus').textContent = 'бот ✨';
  
  const avatar = document.getElementById('chatAvatar');
  avatar.style.background = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
  avatar.style.backgroundSize = 'cover';
  
  // Очищаем область сообщений
  document.getElementById('chatArea').innerHTML = '';
  
  // Добавляем приветственное сообщение
  addBotMessage(bot.id, getBotGreeting(bot.id));
}

function getBotGreeting(botId) {
  const greetings = {
    nyashhelp: "Привет! Я NyashHelp 🩷 Спрашивай о приложении, темах, шрифтах или друзьях!",
    nyashtalk: "Приветик! Давай болтать! 🌸 О чём поговорим?",
    nyashgame: "🎮 Привет! Хочешь поиграть? Угадай число, камень-ножницы-бумага?",
    nyashhoroscope: "🔮 Привет! Хочешь узнать, что звёзды приготовили на сегодня?"
  };
  return greetings[botId] || "Привет! Чем могу помочь?";
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
async function sendMessage(text) {
  if (!text.trim() || !currentChat) return;
  
  const messageText = text.trim();
  const input = document.getElementById('messageInput');
  input.value = '';
  
  if (currentChatType === 'friend') {
    // Отправляем другу
    await window.sendMessage(currentChatId, messageText);
    
    // Отправляем статус "печатает" (false)
    await window.setTyping(currentChatId, false);
    
  } else if (currentChatType === 'bot') {
    // Показываем сообщение пользователя
    addUserMessage(messageText);
    
    // Бот "печатает"
    showBotTyping();
    
    // Отвечаем через секунду
    setTimeout(() => {
      hideBotTyping();
      const response = getBotResponse(currentChat.id, messageText);
      addBotMessage(currentChat.id, response);
    }, 1500);
  }
}

// ===== ОТПРАВКА СТАТУСА "ПЕЧАТАЕТ" =====
async function sendTypingStatus() {
  if (currentChatType === 'friend' && currentChatId) {
    await window.setTyping(currentChatId, true);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(async () => {
      await window.setTyping(currentChatId, false);
    }, 2000);
  }
}

// ===== ПОЛУЧЕНИЕ ОТВЕТА ОТ БОТА =====
function getBotResponse(botId, message) {
  const bot = botResponses[botId];
  if (!bot) return "Я тебя не понял...";
  
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
  
  return "Интересно... Расскажи подробнее!";
}

// ===== ОТРИСОВКА СООБЩЕНИЙ =====
function renderMessages(messages) {
  const chatArea = document.getElementById('chatArea');
  chatArea.innerHTML = '';
  
  messages.forEach(msg => {
    const isMe = msg.from === window.AppState.currentUser.uid;
    const el = document.createElement('div');
    el.className = `message ${isMe ? 'user' : 'bot'}`;
    el.textContent = msg.text;
    
    const time = msg.timestamp?.toDate?.() ? 
      new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    if (time) {
      const timeEl = document.createElement('span');
      timeEl.className = 'message-time';
      timeEl.textContent = time;
      el.appendChild(timeEl);
    }
    
    chatArea.appendChild(el);
  });
  
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addUserMessage(text) {
  const chatArea = document.getElementById('chatArea');
  const el = document.createElement('div');
  el.className = 'message user';
  el.textContent = text;
  chatArea.appendChild(el);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addBotMessage(botId, text) {
  const chatArea = document.getElementById('chatArea');
  const el = document.createElement('div');
  el.className = 'message bot';
  el.textContent = text;
  chatArea.appendChild(el);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showBotTyping() {
  document.getElementById('typingIndicator').style.display = 'flex';
}

function hideBotTyping() {
  document.getElementById('typingIndicator').style.display = 'none';
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Настройка chat.js...');
  
  // Кнопка назад
  document.getElementById('backBtn')?.addEventListener('click', () => {
    if (unsubscribeMessages) unsubscribeMessages();
    if (unsubscribeTyping) unsubscribeTyping();
    window.showScreen('friendsScreen');
  });
  
  // Кнопка меню чата
  document.getElementById('chatMenuBtn')?.addEventListener('click', () => {
    const panel = document.getElementById('chatActionsPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  });
  
  // Отправка сообщения
  const sendBtn = document.getElementById('sendMessageBtn');
  const input = document.getElementById('messageInput');
  
  sendBtn?.addEventListener('click', () => {
    sendMessage(input.value);
  });
  
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage(input.value);
    }
  });
  
  // Статус "печатает"
  input?.addEventListener('input', () => {
    sendTypingStatus();
  });
  
  // Кнопки в панели действий
  document.getElementById('muteChatBtn')?.addEventListener('click', () => {
    alert('🔇 Уведомления выключены (демо-режим)');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('deleteChatBtn')?.addEventListener('click', () => {
    if (confirm('Удалить историю чата?')) {
      document.getElementById('chatArea').innerHTML = '';
      document.getElementById('chatActionsPanel').style.display = 'none';
    }
  });
  
  // Экспорт функций
  window.openRealChat = openRealChat;
  window.openBotChat = openBotChat;
  window.sendMessage = sendMessage;
  
  console.log('✅ chat.js готов');
});
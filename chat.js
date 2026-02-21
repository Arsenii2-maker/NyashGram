// chat.js — ПОЛНЫЙ ЧАТ С ДРУЗЬЯМИ И БОТАМИ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let currentOtherUserId = null;
let unsubscribeMessages = null;
let unsubscribeTyping = null;
let typingTimeout = null;

// ===== ИНИЦИАЛИЗАЦИЯ ЧАТА =====
if (!window.chatData) {
  window.chatData = {};
}

let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');

// ===== МИЛЫЕ БЫСТРЫЕ ВОПРОСЫ =====
const quickQuestions = {
  nyashhelp: [
    "как сменить тему? 🎨",
    "как поменять шрифт? ✍️",
    "кто такие боты? 🤖",
    "как добавить друга? 👥",
    "что нового? ✨"
  ],
  nyashtalk: [
    "как дела? 💕",
    "что нового? 🌸",
    "любишь котиков? 🐱",
    "как погода? ☁️",
    "расскажи секрет 🤫"
  ],
  nyashgame: [
    "сыграем? 🎮",
    "угадай число 🔢",
    "камень-ножницы ✂️",
    "кости 🎲",
    "орёл-решка 🪙"
  ],
  nyashhoroscope: [
    "что сегодня? ✨",
    "любовный гороскоп 💕",
    "финансы 💰",
    "совет звёзд 🌟",
    "что завтра? 🔮"
  ]
};

// ===== МИЛЫЕ ОТВЕТЫ БОТОВ =====
const botResponses = {
  nyashhelp: {
    themes: "у нас 6 милых тем: pastel pink 💗, milk rose 🌸, night blue 🌙, lo-fi beige 📖, soft lilac 💜, forest mint 🌿! зайди в настройки и выбери любимую!",
    fonts: "6 классных шрифтов: system, rounded, cozy, elegant, bold soft, mono cozy! каждый такой уютный ✨",
    bots: "наши боты: nyashhelp 🩷 (это я), nyashtalk 🌸 (болтушка), nyashgame 🎮 (игровая), nyashhoroscope 🔮 (звёздная)!",
    friends: "ищи друзей по юзернейму в разделе 👥 друзья! просто нажми 🔍 и введи их имя",
    default: "спроси меня про темы, шрифты, ботов или друзей! я всё расскажу 💕"
  },
  nyashtalk: {
    hello: [
      "приветик! 🩷 как твои дела?",
      "хай-хай! 💕 соскучилась!",
      "здравствуй, мой хороший! 😽",
      "ой, кто пришёл! рада тебя видеть! ✨"
    ],
    mood: [
      "у меня сегодня игривое настроение! 🎵 а у тебя?",
      "я счастлива, потому что мы общаемся! 💗",
      "муррр... как котик на солнышке 🐾",
      "настроение - как радуга! разноцветное! 🌈"
    ],
    cats: [
      "мяу-мяу! 🐱 представляешь пушистого котика? уютно~",
      "котики - это 90% милоты и 10% хулиганства! 😸 у тебя есть питомец?",
      "я люблю котиков! они такие мягонькие! 🐾"
    ],
    weather: [
      "сегодня такое солнышко! ☀️ а у тебя как погода?",
      "дождик моросит... так уютно сидеть дома с чаем ☕",
      "ветерок гуляет... хорошо, что мы в чатике! 💨"
    ],
    secret: [
      "🤫 я скажу тебе секрет... я очень рада, что мы познакомились!",
      "секретик: сегодня будет что-то хорошее! ✨",
      "тсс... звёзды шепчут, что ты классный! ⭐"
    ],
    default: [
      "расскажи что-нибудь интересное! 👂",
      "ой, а я как раз об этом думала! продолжай 🥰",
      "правда? никогда такого не слышала! ✨",
      "милота! расскажи ещё! 💕"
    ]
  },
  nyashgame: {
    game: "давай поиграем! угадай число от 1 до 10 🔢",
    rps: "камень, ножницы, бумага! выбирай! 🪨✂️📄",
    dice: "🎲 бросаю кубики... у тебя выпало " + (Math.floor(Math.random() * 6) + 1) + " и " + (Math.floor(Math.random() * 6) + 1) + "!",
    coin: "🪙 бросаю монетку... " + (Math.random() < 0.5 ? "орёл!" : "решка!"),
    default: "хочешь поиграть? у меня есть угадай число, камень-ножницы-бумага, кости и орёл-решка! 🎮"
  },
  nyashhoroscope: {
    today: [
      "звёзды говорят, что сегодня отличный день для новых знакомств! ✨",
      "сегодня тебя ждёт приятный сюрприз! 💝",
      "энергия дня поможет тебе во всём! ☀️",
      "сегодня ты будешь особенно обаятелен! ⭐"
    ],
    love: [
      "в любви сегодня гармония и нежность! 💕",
      "звёзды благосклонны к твоему сердцу! 💗",
      "сегодня ты особенно привлекателен! ✨",
      "сердечные дела будут на высоте! 💘"
    ],
    money: [
      "финансовый день - удачный для покупок! 💰",
      "звёзды советуют отложить деньги на мечту! 🏦",
      "сегодня хорошо инвестировать в себя! 💎",
      "денежка сама идёт в руки! 🪙"
    ],
    advice: [
      "прислушайся к своей интуиции сегодня! 🎯",
      "звёзды советуют больше улыбаться! 😊",
      "сегодня отличный день для творчества! 🎨",
      "доверяй своему сердцу! 💕"
    ],
    default: [
      "хочешь узнать, что звёзды приготовили на сегодня? ✨",
      "скажи 'сегодня' или 'любовь' и я расскажу!",
      "звёзды готовы поделиться секретами! 🔮"
    ]
  }
};

// ===== СОХРАНЕНИЕ КАСТОМНЫХ ИМЁН =====
function saveCustomName(chatId, newName) {
  if (!newName || newName.trim() === '') {
    delete customNames[chatId];
  } else {
    customNames[chatId] = newName.trim();
  }
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
}

function getDisplayName(chatId, defaultName) {
  return customNames[chatId] || defaultName;
}

// ===== ЗАКРЕПЛЕНИЕ ЧАТА =====
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

function isChatPinned(chatId) {
  return pinnedChats.includes(chatId);
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
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
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2300);
}

// ===== СОХРАНЕНИЕ СООБЩЕНИЙ =====
function saveMessage(chatId, type, text) {
  if (!chatMessages[chatId]) {
    chatMessages[chatId] = [];
  }
  
  chatMessages[chatId].push({
    type: type,
    text: text,
    time: Date.now(),
    timeString: new Date().toLocaleTimeString()
  });
  
  // Ограничиваем историю последними 50 сообщениями
  if (chatMessages[chatId].length > 50) {
    chatMessages[chatId] = chatMessages[chatId].slice(-50);
  }
  
  localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
}

function loadChatHistory(chatId) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  
  area.innerHTML = '';
  
  if (chatMessages[chatId]) {
    chatMessages[chatId].forEach(msg => {
      const el = document.createElement('div');
      el.className = `message ${msg.type}`;
      el.innerHTML = `${msg.text} <span class="message-time">${msg.timeString}</span>`;
      area.appendChild(el);
    });
    area.scrollTop = area.scrollHeight;
  }
}

// ===== ЧЕРНОВИКИ =====
function saveDraft(chatId, text) {
  if (text && text.trim()) {
    chatDrafts[chatId] = text;
  } else {
    delete chatDrafts[chatId];
  }
  localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(chatDrafts));
}

function loadDraft(chatId) {
  const input = document.getElementById('messageInput');
  if (input && chatDrafts[chatId]) {
    input.value = chatDrafts[chatId];
  }
}

// ===== ОТКРЫТИЕ ЧАТА С ДРУГОМ =====
function openRealChat(chat, chatId) {
  console.log('Открываем чат с другом:', chat);
  
  currentChat = chat;
  currentChatId = chatId;
  currentChatType = 'friend';
  currentOtherUserId = chat.otherUser?.id || chat.id;
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
  
  const nameEl = document.getElementById('chatContactName');
  const usernameEl = document.getElementById('chatContactUsername');
  const avatarEl = document.getElementById('chatAvatar');
  
  if (nameEl) {
    nameEl.textContent = getDisplayName(chatId, chat.otherUser?.name || 'друг');
  }
  
  if (usernameEl) {
    usernameEl.textContent = `@${chat.otherUser?.username || 'unknown'}`;
  }
  
  if (avatarEl) {
    avatarEl.style.background = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
  }
  
  // Загружаем историю
  loadChatHistory(chatId);
  
  // Загружаем черновик
  loadDraft(chatId);
  
  // Если нет истории, показываем приветствие
  if (!chatMessages[chatId] || chatMessages[chatId].length === 0) {
    setTimeout(() => {
      addBotMessage('начало переписки с @' + (chat.otherUser?.username || 'другом') + ' 💕', false);
    }, 100);
  }
}

// ===== ОТКРЫТИЕ ЧАТА С БОТОМ =====
function openBotChat(bot) {
  console.log('Открываем чат с ботом:', bot);
  
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  currentOtherUserId = bot.id;
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
  
  const nameEl = document.getElementById('chatContactName');
  const usernameEl = document.getElementById('chatContactUsername');
  const avatarEl = document.getElementById('chatAvatar');
  
  if (nameEl) {
    nameEl.textContent = getDisplayName(bot.id, bot.name);
  }
  
  if (usernameEl) {
    usernameEl.textContent = `@${bot.username}`;
  }
  
  if (avatarEl) {
    avatarEl.style.background = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
  }
  
  // Загружаем историю
  loadChatHistory(bot.id);
  
  // Загружаем черновик
  loadDraft(bot.id);
  
  // Если нет истории, показываем приветствие
  if (!chatMessages[bot.id] || chatMessages[bot.id].length === 0) {
    const welcomeMessages = {
      nyashhelp: "привет! я NyashHelp 🩷 спрашивай о приложении, темах, шрифтах или друзьях!",
      nyashtalk: "приветик! давай болтать 🌸 о чём поговорим?",
      nyashgame: "🎮 привет! хочешь поиграть? угадай число, камень-ножницы-бумага?",
      nyashhoroscope: "🔮 привет! хочешь узнать, что звёзды приготовили на сегодня?"
    };
    
    setTimeout(() => {
      addBotMessage(welcomeMessages[bot.id] || "привет! давай общаться! 💕", true);
    }, 100);
  }
  
  // Показываем быстрые вопросы
  showQuickReplies(bot.id);
}

// ===== БЫСТРЫЕ ОТВЕТЫ =====
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

// ===== ОТПРАВКА СООБЩЕНИЯ =====
function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  
  if (!text || !currentChatId) return;
  
  // Сообщение пользователя
  addUserMessage(text, true);
  input.value = '';
  
  // Очищаем черновик
  saveDraft(currentChatId, '');
  
  if (currentChatType === 'bot') {
    // Показываем индикатор печати
    showTypingIndicator();
    
    // Ответ бота
    setTimeout(() => {
      hideTypingIndicator();
      const response = getBotResponse(currentChatId, text);
      addBotMessage(response, true);
    }, 1500);
  } else {
    // Для друзей - имитация ответа
    showTypingIndicator();
    
    setTimeout(() => {
      hideTypingIndicator();
      addBotMessage('💬 сообщение доставлено', true);
    }, 1000);
  }
}

function addUserMessage(text, save = true) {
  const area = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = 'message user';
  msg.innerHTML = `${text} <span class="message-time">${new Date().toLocaleTimeString()}</span>`;
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  
  if (save && currentChatId) {
    saveMessage(currentChatId, 'user', text);
  }
}

function addBotMessage(text, save = true) {
  const area = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.innerHTML = `${text} <span class="message-time">${new Date().toLocaleTimeString()}</span>`;
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  
  if (save && currentChatId) {
    saveMessage(currentChatId, 'bot', text);
  }
}

function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return 'спроси что-нибудь ещё! 💕';
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем') || text.includes('тему')) return bot.themes;
    if (text.includes('шрифт')) return bot.fonts;
    if (text.includes('бот')) return bot.bots;
    if (text.includes('друг') || text.includes('друз')) return bot.friends;
    return bot.default;
  }
  
  if (botId === 'nyashtalk') {
    if (text.includes('привет') || text.includes('хай') || text.includes('здравств')) {
      return bot.hello[Math.floor(Math.random() * bot.hello.length)];
    }
    if (text.includes('настроен') || text.includes('дела')) {
      return bot.mood[Math.floor(Math.random() * bot.mood.length)];
    }
    if (text.includes('кот') || text.includes('кош') || text.includes('мяу')) {
      return bot.cats[Math.floor(Math.random() * bot.cats.length)];
    }
    if (text.includes('погод') || text.includes('дожд') || text.includes('солн')) {
      return bot.weather[Math.floor(Math.random() * bot.weather.length)];
    }
    if (text.includes('секрет') || text.includes('тай')) {
      return bot.secret[Math.floor(Math.random() * bot.secret.length)];
    }
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashgame') {
    if (text.includes('игр') || text.includes('давай') || text.includes('сыгра')) return bot.game;
    if (text.includes('камень') || text.includes('ножницы') || text.includes('бумаг')) return bot.rps;
    if (text.includes('кост') || text.includes('кубик')) return bot.dice;
    if (text.includes('орёл') || text.includes('решка') || text.includes('монет')) return bot.coin;
    return bot.default;
  }
  
  if (botId === 'nyashhoroscope') {
    if (text.includes('сегодня') || text.includes('день')) {
      return bot.today[Math.floor(Math.random() * bot.today.length)];
    }
    if (text.includes('любов') || text.includes('сердц')) {
      return bot.love[Math.floor(Math.random() * bot.love.length)];
    }
    if (text.includes('денег') || text.includes('финанс') || text.includes('рубл')) {
      return bot.money[Math.floor(Math.random() * bot.money.length)];
    }
    if (text.includes('совет') || text.includes('помог')) {
      return bot.advice[Math.floor(Math.random() * bot.advice.length)];
    }
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  return 'интересно... расскажи подробнее! 💕';
}

// ===== ИНДИКАТОР ПЕЧАТИ =====
function showTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.style.display = 'flex';
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
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
    const currentName = document.getElementById('chatContactName').textContent;
    input.value = customNames[currentChatId] || currentName;
    modal.style.display = 'flex';
    
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
  }
}

function hideRenameModal() {
  const modal = document.getElementById('renameModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  if (!input || !currentChatId) return;
  
  const newName = input.value.trim();
  saveCustomName(currentChatId, newName);
  
  const nameEl = document.getElementById('chatContactName');
  if (nameEl) {
    nameEl.textContent = newName || (currentChat?.otherUser?.name || currentChat?.name || 'чат');
  }
  
  hideRenameModal();
  showNotification('✏️ имя изменено');
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
  
  // Кнопка меню чата
  document.getElementById('chatMenuBtn')?.addEventListener('click', toggleChatActions);
  
  // Кнопки в панели действий
  document.getElementById('pinChatActionBtn')?.addEventListener('click', () => {
    if (currentChatId) {
      togglePinChat(currentChatId);
    }
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('renameChatBtn')?.addEventListener('click', () => {
    showRenameModal();
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('muteChatBtn')?.addEventListener('click', () => {
    showNotification('🔇 уведомления выключены');
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
  
  // Модалка переименования
  document.getElementById('renameCancelBtn')?.addEventListener('click', hideRenameModal);
  document.getElementById('renameConfirmBtn')?.addEventListener('click', renameCurrentChat);
  
  document.getElementById('renameInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      renameCurrentChat();
    }
  });
  
  // Отправка сообщения
  const sendBtn = document.getElementById('sendMessageBtn');
  const input = document.getElementById('messageInput');
  
  sendBtn?.addEventListener('click', sendMessage);
  
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Черновик
  input?.addEventListener('input', () => {
    if (currentChatId) {
      saveDraft(currentChatId, input.value);
    }
  });
  
  // Экспорт функций
  window.openRealChat = openRealChat;
  window.openBotChat = openBotChat;
  window.sendMessage = sendMessage;
  
  console.log('✅ chat.js готов');
});
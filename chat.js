// chat.js — ПОЛНЫЙ С РЕАЛЬНЫМИ ДРУЗЬЯМИ v3.5
// ИСПРАВЛЕНО: двойная отправка, черновики, свайпы, закрепление

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let quickPanelVisible = true;
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let currentDraftChatId = null;
let isSending = false; // Флаг для предотвращения двойной отправки

// Слушатели Firebase
let messagesListener = null;
let chatListener = null;

// ===== МИЛЫЕ БЫСТРЫЕ ВОПРОСЫ =====
const quickQuestions = {
  nyashhelp: [
    "как сменить тему? 🎨",
    "как поменять шрифт? ✍️",
    "кто такие боты? 🤖",
    "сколько всего тем?",
    "расскажи о себе 💕"
  ],
  nyashtalk: [
    "как дела? 💕",
    "что нового? 🌸",
    "любишь котиков? 🐱",
    "расскажи секрет 🤫",
    "обними меня! 🫂"
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
    "любовь 💕",
    "деньги 💰",
    "совет 🌟",
    "что завтра? 🔮"
  ],
  nyashcook: [
    "что приготовить? 🍳",
    "кексы 🧁",
    "печенье 🍪",
    "тортик 🎂",
    "завтрак 🥞"
  ]
};

// ===== МИЛЫЕ ОТВЕТЫ БОТОВ =====
const botResponses = {
  nyashhelp: {
    themes: "у нас 6 милых тем: pastel pink 💗, milk rose 🌸, night blue 🌙, lo-fi beige 📖, soft lilac 💜, forest mint 🌿!",
    fonts: "6 шрифтов: system, rounded, cozy, elegant, bold soft, mono cozy!",
    bots: "наши боты: nyashhelp 🩷, nyashtalk 🌸, nyashgame 🎮, nyashhoroscope 🔮, nyashcook 🍳!",
    count: "6 тем, 6 шрифтов и 5 милых ботов!",
    default: "спроси про темы, шрифты или ботов! 💕"
  },
  nyashtalk: {
    hello: ["приветик! 🩷 как дела?", "хай-хай! 💕 соскучилась!", "здравствуй! 😽"],
    mood: ["у меня всё отлично! а у тебя? 🎵", "я счастлива, что мы общаемся! 💗"],
    cats: ["мяу-мяу! 🐱 люблю котиков!", "котики - это милота! 😸"],
    secret: ["🤫 ты самый лучший!", "секретик: сегодня будет хороший день ✨"],
    hug: ["обнимаю! 🫂", "крепкие обнимашки! 🤗"],
    default: ["расскажи что-нибудь! 👂", "ой, интересно! продолжай 🥰"]
  },
  nyashgame: {
    game: "давай поиграем! угадай число от 1 до 10 🔢",
    rps: "камень-ножницы-бумага? выбирай! ✂️",
    dice: "🎲 бросаю кубики... тебе выпало " + (Math.floor(Math.random() * 6) + 1),
    coin: "🪙 бросаю монетку... " + (Math.random() < 0.5 ? "орёл!" : "решка!"),
    default: "хочешь поиграть? 🎮"
  },
  nyashhoroscope: {
    today: "сегодня отличный день! ✨",
    love: "в любви гармония! 💕",
    money: "финансовый день - удачный! 💰",
    advice: "прислушайся к интуиции! 🎯",
    tomorrow: "завтра будет хороший день! 🌟",
    default: "хочешь гороскоп? 🔮"
  },
  nyashcook: {
    cake: "кексики: мука 200г, сахар 150г, яйца, масло, 25 мин при 180° 🧁",
    cookie: "печенье: масло 120г, сахар, яйцо, мука, шоколад, 15 мин 🍪",
    breakfast: "блинчики: молоко, яйца, мука, сахар, соль 🥞",
    muffin: "маффины с черникой: мука, сахар, яйца, молоко, масло, черника 🧁",
    pie: "яблочный пирог: яблоки, мука, сахар, яйца, корица 🥧",
    default: "спроси про кексы, печенье или тортик! 🍳"
  }
};

// ===== ПРИВЕТСТВИЯ =====
const greetings = {
  nyashhelp: "привет! я NyashHelp 🩷 твой помощник! спрашивай о приложении, темах или шрифтах!",
  nyashtalk: "приветик! я NyashTalk 🌸 давай болтать! как твои дела?",
  nyashgame: "🎮 привет! я NyashGame! хочешь поиграть? угадай число или камень-ножницы?",
  nyashhoroscope: "🔮 привет! я NyashHoroscope! хочешь узнать, что звёзды приготовили на сегодня?",
  nyashcook: "🍳 привет! я NyashCook! хочешь рецепт чего-нибудь вкусненького?"
};

// ===== 🔥 НОВЫЕ ФУНКЦИИ ДЛЯ РЕАЛЬНЫХ СООБЩЕНИЙ =====

// ОТПРАВКА СООБЩЕНИЯ ДРУГУ (ИСПРАВЛЕНО: убрана двойная отправка)
async function sendMessageToFriend(chatId, text) {
  if (!window.auth?.currentUser || !text.trim()) return false;
  
  try {
    await window.db.collection('messages').add({
      chatId: chatId,
      from: window.auth.currentUser.uid,
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      readBy: [window.auth.currentUser.uid]
    });
    
    await window.db.collection('chats').doc(chatId).update({
      lastMessage: {
        text: text,
        from: window.auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        readBy: [window.auth.currentUser.uid]
      }
    });
    
    return true;
  } catch (error) {
    console.error('Ошибка отправки:', error);
    return false;
  }
}

// СТАТУС "ПЕЧАТАЕТ..."
async function setTyping(chatId, isTyping) {
  if (!window.auth?.currentUser || !chatId) return;
  
  try {
    await window.db.collection('chats').doc(chatId).update({
      [`typing.${window.auth.currentUser.uid}`]: isTyping
    });
  } catch (error) {
    console.error('Ошибка статуса печати:', error);
  }
}

// СЛУШАТЕЛЬ СООБЩЕНИЙ
function listenToMessages(chatId, callback) {
  if (messagesListener) messagesListener();
  
  messagesListener = window.db.collection('messages')
    .where('chatId', '==', chatId)
    .orderBy('timestamp', 'asc')
    .onSnapshot((snapshot) => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages);
    }, (error) => {
      console.error('Ошибка слушателя:', error);
    });
  
  return messagesListener;
}

// СЛУШАТЕЛЬ СТАТУСА ЧАТА
function listenToChat(chatId, callback) {
  if (chatListener) chatListener();
  
  chatListener = window.db.collection('chats').doc(chatId)
    .onSnapshot((doc) => {
      if (doc.exists) callback(doc.data());
    });
  
  return chatListener;
}

// ===== СОХРАНЕНИЕ ИМЁН =====
function saveCustomName(chatId, name) {
  if (!window.customNames) window.customNames = {};
  if (name) window.customNames[chatId] = name;
  else delete window.customNames[chatId];
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(window.customNames));
  
  // Обновляем в списке контактов
  if (typeof window.renderContacts === 'function') {
    setTimeout(window.renderContacts, 100);
  }
}

function getCustomName(chatId, defaultName) {
  return window.customNames?.[chatId] || defaultName;
}

// ===== СОХРАНЕНИЕ СООБЩЕНИЙ (ДЛЯ БОТОВ) =====
function saveMessage(chatId, type, text) {
  if (!chatMessages[chatId]) chatMessages[chatId] = [];
  chatMessages[chatId].push({
    type: type,
    text: text,
    timeString: new Date().toLocaleTimeString()
  });
  if (chatMessages[chatId].length > 50) chatMessages[chatId] = chatMessages[chatId].slice(-50);
  localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
}

// ===== ЧЕРНОВИКИ =====
function saveCurrentDraft() {
  if (currentChatId) {
    const input = document.getElementById('messageInput');
    if (input) {
      const text = input.value.trim();
      if (text) {
        let drafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
        drafts[currentChatId] = text;
        localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(drafts));
      }
    }
  }
}

function loadDraft(chatId) {
  const input = document.getElementById('messageInput');
  if (!input) return;
  
  const drafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
  input.value = drafts[chatId] || '';
  currentDraftChatId = chatId;
}

// ===== ОТКРЫТИЕ ЧАТА С БОТОМ =====
function openBotChat(bot) {
  console.log('Открываем чат с ботом:', bot);
  
  // Очищаем слушатели
  if (messagesListener) messagesListener();
  if (chatListener) chatListener();
  
  // Сохраняем черновик предыдущего чата
  saveCurrentDraft();
  
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  
  const nameEl = document.getElementById('chatContactName');
  const usernameEl = document.getElementById('chatContactUsername');
  const avatarEl = document.getElementById('chatAvatar');
  
  if (nameEl) nameEl.textContent = getCustomName(bot.id, bot.name);
  if (usernameEl) usernameEl.textContent = `@${bot.username}`;
  
  if (avatarEl) {
    if (bot.id === 'nyashhelp') avatarEl.style.background = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
    else if (bot.id === 'nyashtalk') avatarEl.style.background = 'linear-gradient(135deg, #85d1c5, #b0e0d5)';
    else if (bot.id === 'nyashgame') avatarEl.style.background = 'linear-gradient(135deg, #ffb347, #ff8c42)';
    else if (bot.id === 'nyashhoroscope') avatarEl.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
    else if (bot.id === 'nyashcook') avatarEl.style.background = 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
  }
  
  // Показываем панель быстрых ответов для ботов
  const quickPanel = document.getElementById('quickReplyPanel');
  if (quickPanel) {
    quickPanel.style.display = 'flex';
    showQuickReplies(bot.id);
  }
  
  loadChatHistory(bot.id);
  loadDraft(bot.id);
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
}

// ===== ОТКРЫТИЕ ЧАТА С ДРУГОМ (ИСПРАВЛЕНО) =====
async function openFriendChat(friend) {
  console.log('Открываем чат с другом:', friend);
  
  // Очищаем слушатели
  if (messagesListener) messagesListener();
  if (chatListener) chatListener();
  
  // Сохраняем черновик предыдущего чата
  saveCurrentDraft();
  
  currentChat = friend;
  currentChatId = friend.id;
  currentChatType = 'friend';
  
  const nameEl = document.getElementById('chatContactName');
  const usernameEl = document.getElementById('chatContactUsername');
  const avatarEl = document.getElementById('chatAvatar');
  
  if (nameEl) nameEl.textContent = getCustomName(friend.id, friend.name);
  if (usernameEl) usernameEl.textContent = `@${friend.username}`;
  if (avatarEl) avatarEl.style.background = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
  
  // Скрываем панель быстрых ответов для друзей
  const quickPanel = document.getElementById('quickReplyPanel');
  if (quickPanel) {
    quickPanel.style.display = 'none';
  }
  
  // Создаём или получаем чат
  if (!friend.chatId) {
    const chatId = await window.createPrivateChat(window.auth.currentUser.uid, friend.id);
    friend.chatId = chatId;
    currentChatId = chatId;
  } else {
    currentChatId = friend.chatId;
  }
  
  // Подписываемся на сообщения
  listenToMessages(currentChatId, (messages) => {
    renderRealMessages(messages);
  });
  
  // Подписываемся на статус чата
  listenToChat(currentChatId, (chatData) => {
    if (chatData.typing) {
      const isTyping = chatData.typing[friend.id];
      const typingEl = document.getElementById('typingIndicator');
      if (typingEl) {
        typingEl.style.display = isTyping ? 'flex' : 'none';
      }
    }
  });
  
  loadDraft(currentChatId);
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
}

// ===== ОТРИСОВКА РЕАЛЬНЫХ СООБЩЕНИЙ =====
function renderRealMessages(messages) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  
  area.innerHTML = '';
  
  messages.forEach(msg => {
    const isMe = msg.from === window.auth?.currentUser?.uid;
    const el = document.createElement('div');
    el.className = `message ${isMe ? 'user' : 'bot'}`;
    
    const time = msg.timestamp?.toDate 
      ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    el.innerHTML = `${msg.text}<span class="message-time">${time}</span>`;
    area.appendChild(el);
  });
  
  area.scrollTop = area.scrollHeight;
}

// ===== ЗАГРУЗКА ИСТОРИИ ЧАТА =====
function loadChatHistory(chatId) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  
  area.innerHTML = '';
  
  if (chatMessages[chatId] && chatMessages[chatId].length > 0) {
    chatMessages[chatId].forEach(msg => {
      const el = document.createElement('div');
      el.className = `message ${msg.type}`;
      el.innerHTML = `${msg.text}<span class="message-time">${msg.timeString}</span>`;
      area.appendChild(el);
    });
  } else if (chatId && chatId.startsWith('nyash')) {
    // Приветствие для ботов
    const greeting = greetings[chatId] || "привет! давай общаться! 💕";
    const el = document.createElement('div');
    el.className = 'message bot';
    el.innerHTML = `${greeting}<span class="message-time">${new Date().toLocaleTimeString()}</span>`;
    area.appendChild(el);
    
    // Сохраняем приветствие
    saveMessage(chatId, 'bot', greeting);
  }
  
  area.scrollTop = area.scrollHeight;
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
      const input = document.getElementById('messageInput');
      if (input) {
        input.value = q;
        // Автоматически отправляем сообщение (можно убрать, если не нужно)
        // sendMessage();
      }
    };
    panel.appendChild(btn);
  });
}

function toggleQuickPanel() {
  const panel = document.getElementById('quickReplyPanel');
  if (!panel) return;
  quickPanelVisible = !quickPanelVisible;
  panel.style.display = quickPanelVisible ? 'flex' : 'none';
}
// ===== ОТПРАВКА СООБЩЕНИЯ (ИСПРАВЛЕНО: убрана двойная отправка и задержка ввода) =====
async function sendMessage() {
  const input = document.getElementById('messageInput');
  if (!input) return;
  
  // Защита от двойной отправки
  if (isSending) return;
  
  const text = input.value.trim();
  if (!text || !currentChat) return;
  
  // Блокируем кнопку отправки
  isSending = true;
  const sendBtn = document.getElementById('sendMessageBtn');
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
  }
  
  // ОЧЕНЬ ВАЖНО: сразу очищаем поле ввода, чтобы нельзя было заспамить
  input.value = '';
  
  // Очищаем черновик
  let drafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
  delete drafts[currentChatId];
  localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(drafts));
  
  if (currentChatType === 'friend') {
    // Отправляем другу через Firebase (реальное сообщение)
    const success = await sendMessageToFriend(currentChatId, text);
    
    // Визуально сообщение добавится через слушатель, ничего не делаем
    if (!success) {
      // Если ошибка, показываем уведомление
      showNotification('❌ Ошибка отправки');
      // Возвращаем текст обратно в поле
      input.value = text;
    }
    
    // Отправляем статус "печатает" (false)
    await setTyping(currentChatId, false);
  } else {
    // Отправляем боту (локально)
    addMessage(text, 'user', true);
    
    // Ответ бота
    setTimeout(() => {
      const response = getBotResponse(currentChatId, text);
      addMessage(response, 'bot', true);
    }, 1000);
  }
  
  // Разблокируем кнопку отправки через небольшую задержку
  setTimeout(() => {
    isSending = false;
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
    }
  }, 500);
}

// ===== ДОБАВЛЕНИЕ СООБЩЕНИЯ (ЛОКАЛЬНО) =====
function addMessage(text, type, save = false) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  msg.innerHTML = `${text}<span class="message-time">${time}</span>`;
  
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  
  if (save && currentChatId) {
    saveMessage(currentChatId, type, text);
  }
}

// ===== ПОЛУЧЕНИЕ ОТВЕТА ОТ БОТА =====
function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return "💕";
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем')) return bot.themes;
    if (text.includes('шрифт')) return bot.fonts;
    if (text.includes('бот')) return bot.bots;
    if (text.includes('сколько')) return bot.count;
    return bot.default;
  }
  
  if (botId === 'nyashtalk') {
    if (text.includes('привет')) return bot.hello[Math.floor(Math.random() * bot.hello.length)];
    if (text.includes('дела') || text.includes('настроен')) return bot.mood[Math.floor(Math.random() * bot.mood.length)];
    if (text.includes('кот')) return bot.cats[Math.floor(Math.random() * bot.cats.length)];
    if (text.includes('секрет')) return bot.secret[Math.floor(Math.random() * bot.secret.length)];
    if (text.includes('обним')) return bot.hug[Math.floor(Math.random() * bot.hug.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashgame') {
    if (text.includes('игр') || text.includes('давай')) return bot.game;
    if (text.includes('камень')) return bot.rps;
    if (text.includes('кост')) return bot.dice;
    if (text.includes('орёл')) return bot.coin;
    return bot.default;
  }
  
  if (botId === 'nyashhoroscope') {
    if (text.includes('сегодня')) return bot.today;
    if (text.includes('любов')) return bot.love;
    if (text.includes('денег')) return bot.money;
    if (text.includes('совет')) return bot.advice;
    if (text.includes('завтра')) return bot.tomorrow;
    return bot.default;
  }
  
  if (botId === 'nyashcook') {
    if (text.includes('кекс') || text.includes('маффин')) return bot.muffin;
    if (text.includes('печень')) return bot.cookie;
    if (text.includes('торт')) return bot.cake;
    if (text.includes('пирог')) return bot.pie;
    if (text.includes('завтрак')) return bot.breakfast;
    return bot.default;
  }
  
  return "💕";
}

// ===== ДЕЙСТВИЯ =====
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
    input.value = getCustomName(currentChatId, nameEl ? nameEl.textContent : '');
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 100);
  }
}

function hideRenameModal() {
  const modal = document.getElementById('renameModal');
  if (modal) modal.style.display = 'none';
}

// ===== ДЕЙСТВИЯ (ПОЛНОСТЬЮ ИСПРАВЛЕНЫ) =====

// ПЕРЕИМЕНОВАНИЕ ЧАТА (ТЕПЕРЬ РАБОТАЕТ ВЕЗДЕ)
function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  if (!input || !currentChatId) return;
  
  const newName = input.value.trim();
  if (newName) {
    saveCustomName(currentChatId, newName);
    const nameEl = document.getElementById('chatContactName');
    if (nameEl) nameEl.textContent = newName;
    
    // Принудительно обновляем список контактов
    if (typeof window.renderContacts === 'function') {
      window.renderContacts();
    }
    
    showNotification('✏️ имя изменено');
  }
  hideRenameModal();
}

// ЗАКРЕПЛЕНИЕ ЧАТА (ТЕПЕРЬ РАБОТАЕТ)
function togglePinChat() {
  if (!currentChatId) return;
  
  let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
  
  if (pinnedChats.includes(currentChatId)) {
    pinnedChats = pinnedChats.filter(id => id !== currentChatId);
    showNotification('📌 чат откреплён');
  } else {
    pinnedChats.push(currentChatId);
    showNotification('📌 чат закреплён');
  }
  
  localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
  
  // Принудительно обновляем список контактов
  if (typeof window.renderContacts === 'function') {
    window.renderContacts();
  }
}
// ===== УДАЛЕНИЕ ИСТОРИИ (ИСПРАВЛЕНО) =====
function deleteChatHistory() {
  if (!currentChatId) return;
  
  if (currentChatType === 'bot') {
    if (confirm('удалить историю чата с ботом?')) {
      delete chatMessages[currentChatId];
      localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
      const chatArea = document.getElementById('chatArea');
      if (chatArea) chatArea.innerHTML = '';
      
      // Добавляем новое приветствие
      if (currentChatId && currentChatId.startsWith('nyash')) {
        const greeting = greetings[currentChatId] || "привет! давай общаться! 💕";
        const el = document.createElement('div');
        el.className = 'message bot';
        el.innerHTML = `${greeting}<span class="message-time">${new Date().toLocaleTimeString()}</span>`;
        if (chatArea) {
          chatArea.appendChild(el);
          saveMessage(currentChatId, 'bot', greeting);
        }
      }
      showNotification('🗑️ история удалена');
    }
  } else {
    // Для друзей удаление истории из локального хранилища не имеет смысла,
    // так как сообщения хранятся в Firebase. Можно либо:
    // 1. Ничего не делать (просто показать уведомление)
    // 2. Удалить все сообщения из Firebase (сложно, нужно право)
    alert('История сообщений с друзьями хранится в облаке и не может быть удалена из этого чата');
  }
}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

// ===== ОБРАБОТКА СВАЙПОВ =====
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].clientX;
  handleSwipe();
}

function handleSwipe() {
  const swipeThreshold = 100; // минимальное расстояние для свайпа
  const swipeDistance = touchEndX - touchStartX;
  
  // Свайп вправо от левого края (возврат на главный экран)
  if (swipeDistance > swipeThreshold && touchStartX < 50) {
    // Проверяем, что мы не на главном экране
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id !== 'friendsScreen') {
      // Плавно возвращаемся
      if (typeof window.showScreen === 'function') {
        window.showScreen('friendsScreen');
      }
    }
  }
}

// ===== ОБРАБОТКА ФОКУСА НА ПОЛЕ ВВОДА =====
function setupInputFocusHandling() {
  const messageInput = document.getElementById('messageInput');
  if (!messageInput) return;
  
  messageInput.addEventListener('focus', () => {
    // Когда поле ввода получает фокус, добавляем класс для анимации
    document.body.classList.add('input-focused');
  });
  
  messageInput.addEventListener('blur', () => {
    // Когда поле ввода теряет фокус, убираем класс
    document.body.classList.remove('input-focused');
  });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 chat.js загружен');
  
  // Настройка обработки свайпов
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);
  
  // Настройка обработки фокуса на поле ввода
  setupInputFocusHandling();
  
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Сохраняем черновик перед уходом
      saveCurrentDraft();
      
      // Очищаем слушатели
      if (messagesListener) messagesListener();
      if (chatListener) chatListener();
      
      if (typeof window.showScreen === 'function') {
        window.showScreen('friendsScreen');
      }
    });
  }
  
  const chatMenuBtn = document.getElementById('chatMenuBtn');
  if (chatMenuBtn) {
    chatMenuBtn.addEventListener('click', toggleChatActions);
  }
  
  const toggleQuickPanelBtn = document.getElementById('toggleQuickPanelBtn');
  if (toggleQuickPanelBtn) {
    toggleQuickPanelBtn.addEventListener('click', toggleQuickPanel);
  }
  
  const pinChatActionBtn = document.getElementById('pinChatActionBtn');
  if (pinChatActionBtn) {
    pinChatActionBtn.addEventListener('click', () => {
      togglePinChat();
      const panel = document.getElementById('chatActionsPanel');
      if (panel) panel.style.display = 'none';
    });
  }
  
  const renameChatBtn = document.getElementById('renameChatBtn');
  if (renameChatBtn) {
    renameChatBtn.addEventListener('click', () => {
      showRenameModal();
      const panel = document.getElementById('chatActionsPanel');
      if (panel) panel.style.display = 'none';
    });
  }
  
  const muteChatBtn = document.getElementById('muteChatBtn');
  if (muteChatBtn) {
    muteChatBtn.addEventListener('click', () => {
      showNotification('🔇 звук выключен');
      const panel = document.getElementById('chatActionsPanel');
      if (panel) panel.style.display = 'none';
    });
  }
  
  const deleteChatBtn = document.getElementById('deleteChatBtn');
  if (deleteChatBtn) {
    deleteChatBtn.addEventListener('click', () => {
      deleteChatHistory();
      const panel = document.getElementById('chatActionsPanel');
      if (panel) panel.style.display = 'none';
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
      if (e.key === 'Enter' && !isSending) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    messageInput.addEventListener('input', (e) => {
      if (currentChatId) {
        // Сохраняем черновик
        let drafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
        if (e.target.value.trim()) {
          drafts[currentChatId] = e.target.value;
        } else {
          delete drafts[currentChatId];
        }
        localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(drafts));
        
        // Отправляем статус "печатает" другу (только для чатов с друзьями)
        if (currentChatType === 'friend' && currentChatId) {
          setTyping(currentChatId, e.target.value.trim().length > 0);
        }
      }
    });
  }
  // ===== УЛУЧШЕННАЯ ОБРАБОТКА СВАЙПОВ С АНИМАЦИЕЙ =====
let touchStartX = 0;
let touchEndX = 0;
let isSwiping = false;
let swipeStartTime = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  swipeStartTime = Date.now();
  isSwiping = true;
  
  // Добавляем класс для отключения transition во время свайпа
  const activeScreen = document.querySelector('.screen.active');
  if (activeScreen) {
    activeScreen.classList.add('swiping');
  }
}

function handleTouchMove(e) {
  if (!isSwiping) return;
  
  const currentX = e.touches[0].clientX;
  const diff = currentX - touchStartX;
  
  // Если свайп от левого края и достаточно длинный
  if (touchStartX < 50 && diff > 20) {
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
      // Применяем трансформацию в реальном времени
      const translateX = Math.min(diff * 0.5, 100);
      activeScreen.style.transform = `translateX(${translateX}px)`;
      activeScreen.style.opacity = 1 - (translateX / 200);
    }
  }
}

function handleTouchEnd(e) {
  if (!isSwiping) return;
  
  touchEndX = e.changedTouches[0].clientX;
  const swipeDistance = touchEndX - touchStartX;
  const swipeDuration = Date.now() - swipeStartTime;
  const activeScreen = document.querySelector('.screen.active');
  
  if (!activeScreen) {
    isSwiping = false;
    return;
  }
  
  // Убираем класс swiping
  activeScreen.classList.remove('swiping');
  
  // Проверяем, был ли свайп от левого края
  if (touchStartX < 50 && swipeDistance > 80 && swipeDuration < 300) {
    // Достаточно быстрый и длинный свайп - выполняем действие
    activeScreen.style.transform = '';
    activeScreen.style.opacity = '';
    
    // Добавляем класс анимации
    activeScreen.classList.add('swipe-right');
    
    setTimeout(() => {
      activeScreen.classList.remove('swipe-right');
      
      // Проверяем, что мы не на главном экране
      if (activeScreen.id !== 'friendsScreen') {
        if (typeof window.showScreen === 'function') {
          window.showScreen('friendsScreen');
        }
      }
    }, 200);
  } else {
    // Возвращаем на место с анимацией
    activeScreen.style.transform = '';
    activeScreen.style.opacity = '';
    activeScreen.classList.add('swipe-in');
    
    setTimeout(() => {
      activeScreen.classList.remove('swipe-in');
    }, 300);
  }
  
  isSwiping = false;
}

// Добавьте в инициализацию
document.addEventListener('touchstart', handleTouchStart, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: true });
document.addEventListener('touchend', handleTouchEnd, { passive: true });
  // Экспорт функций
  window.openBotChat = openBotChat;
  window.openFriendChat = openFriendChat;
  window.sendMessageToFriend = sendMessageToFriend;
  window.setTyping = setTyping;
  
  console.log('✅ chat.js готов');
});
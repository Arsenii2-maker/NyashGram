// chat.js — С МИЛЫМИ ОТВЕТАМИ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;

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
    hello: ["приветик! 🩷 как твои дела?", "хай-хай! 💕 соскучилась!", "здравствуй, мой хороший! 😽"],
    mood: ["у меня сегодня игривое настроение! 🎵 а у тебя?", "я счастлива, потому что мы общаемся! 💗", "муррр... как котик на солнышке 🐾"],
    cats: ["мяу-мяу! 🐱 представляешь пушистого котика? уютно~", "котики - это 90% милоты и 10% хулиганства! 😸 у тебя есть питомец?"],
    weather: ["сегодня такое солнышко! ☀️ а у тебя как погода?", "дождик моросит... так уютно сидеть дома с чаем ☕"],
    secret: ["🤫 я скажу тебе секрет... я очень рада, что мы познакомились!", "секретик: сегодня будет что-то хорошее! ✨"],
    default: ["расскажи что-нибудь интересное! 👂", "ой, а я как раз об этом думала! продолжай 🥰", "правда? никогда такого не слышала! ✨"]
  },
  nyashgame: {
    game: "давай поиграем! угадай число от 1 до 10 🔢",
    rps: "камень, ножницы, бумага! выбирай! 🪨✂️📄",
    dice: "🎲 бросаю кубики... у тебя выпало " + (Math.floor(Math.random() * 6) + 1) + " и " + (Math.floor(Math.random() * 6) + 1) + "!",
    coin: "🪙 бросаю монетку... " + (Math.random() < 0.5 ? "орёл!" : "решка!"),
    default: "хочешь поиграть? у меня есть угадай число, камень-ножницы-бумага, кости и орёл-решка! 🎮"
  },
  nyashhoroscope: {
    today: ["звёзды говорят, что сегодня отличный день для новых знакомств! ✨", "сегодня тебя ждёт приятный сюрприз! 💝", "энергия дня поможет тебе во всём! ☀️"],
    love: ["в любви сегодня гармония и нежность! 💕", "звёзды благосклонны к твоему сердцу! 💗", "сегодня ты особенно обаятелен! ✨"],
    money: ["финансовый день - удачный для покупок! 💰", "звёзды советуют отложить деньги на мечту! 🏦", "сегодня хорошо инвестировать в себя! 💎"],
    advice: ["прислушайся к своей интуиции сегодня! 🎯", "звёзды советуют больше улыбаться! 😊", "сегодня отличный день для творчества! 🎨"],
    default: ["хочешь узнать, что звёзды приготовили на сегодня? ✨", "скажи 'сегодня' или 'любовь' и я расскажу!"]
  }
};

// ===== ПЕРЕИМЕНОВАНИЕ =====
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');

function saveCustomName(chatId, name) {
  if (name) customNames[chatId] = name;
  else delete customNames[chatId];
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
}

// ===== ОТКРЫТИЕ ЧАТА =====
function openRealChat(chat, chatId) {
  currentChat = chat;
  currentChatId = chatId;
  currentChatType = 'friend';
  
  showScreen('chatScreen');
  
  document.getElementById('chatContactName').textContent = customNames[chatId] || chat.otherUser?.name || 'друг';
  document.getElementById('chatContactUsername').textContent = `@${chat.otherUser?.username || 'unknown'}`;
  
  const chatArea = document.getElementById('chatArea');
  chatArea.innerHTML = `
    <div class="message bot">
      начало переписки с @${chat.otherUser?.username || 'другом'} 💕
      <span class="message-time">${new Date().toLocaleTimeString()}</span>
    </div>
  `;
  
  showQuickReplies();
}

function openBotChat(bot) {
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  
  showScreen('chatScreen');
  
  document.getElementById('chatContactName').textContent = bot.name;
  document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
  
  const welcomeMessages = {
    nyashhelp: "привет! я NyashHelp 🩷 спрашивай о приложении, темах, шрифтах или друзьях!",
    nyashtalk: "приветик! давай болтать 🌸 о чём поговорим?",
    nyashgame: "🎮 привет! хочешь поиграть? угадай число, камень-ножницы-бумага?",
    nyashhoroscope: "🔮 привет! хочешь узнать, что звёзды приготовили на сегодня?"
  };
  
  const chatArea = document.getElementById('chatArea');
  chatArea.innerHTML = `
    <div class="message bot">
      ${welcomeMessages[bot.id] || "привет! давай общаться! 💕"}
      <span class="message-time">${new Date().toLocaleTimeString()}</span>
    </div>
  `;
  
  showQuickReplies();
}

// ===== БЫСТРЫЕ ОТВЕТЫ =====
function showQuickReplies() {
  const panel = document.getElementById('quickReplyPanel');
  if (!panel) return;
  
  const questions = quickQuestions[currentChatId] || quickQuestions.nyashtalk;
  
  panel.innerHTML = '';
  questions.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'quick-chip';
    btn.textContent = q;
    btn.onclick = () => sendMessage(q);
    panel.appendChild(btn);
  });
}

// ===== ОТПРАВКА =====
function sendMessage(text) {
  if (!text.trim() || !currentChat) return;
  
  const msgText = text.trim();
  const input = document.getElementById('messageInput');
  input.value = '';
  
  // Сообщение пользователя
  addMessage(msgText, 'user');
  
  // Черновик
  saveDraft(currentChatId, '');
  
  if (currentChatType === 'bot') {
    showTypingIndicator();
    
    setTimeout(() => {
      hideTypingIndicator();
      const response = getBotResponse(currentChatId, msgText);
      addMessage(response, 'bot');
    }, 1500);
  } else {
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      addMessage('🕒 сообщение доставлено', 'bot');
    }, 1000);
  }
}

function addMessage(text, type) {
  const chatArea = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  msg.innerHTML = `${text} <span class="message-time">${new Date().toLocaleTimeString()}</span>`;
  chatArea.appendChild(msg);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return 'спроси что-нибудь ещё! 💕';
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем')) return bot.themes;
    if (text.includes('шрифт')) return bot.fonts;
    if (text.includes('бот')) return bot.bots;
    if (text.includes('друг')) return bot.friends;
    return bot.default;
  }
  
  if (botId === 'nyashtalk') {
    if (text.includes('привет')) return bot.hello[Math.floor(Math.random() * bot.hello.length)];
    if (text.includes('настроен')) return bot.mood[Math.floor(Math.random() * bot.mood.length)];
    if (text.includes('кот') || text.includes('кош')) return bot.cats[Math.floor(Math.random() * bot.cats.length)];
    if (text.includes('погод')) return bot.weather[Math.floor(Math.random() * bot.weather.length)];
    if (text.includes('секрет')) return bot.secret[Math.floor(Math.random() * bot.secret.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashgame') {
    if (text.includes('игр') || text.includes('давай')) return bot.game;
    if (text.includes('камень')) return bot.rps;
    if (text.includes('кости') || text.includes('кубик')) return bot.dice;
    if (text.includes('орёл') || text.includes('решка')) return bot.coin;
    return bot.default;
  }
  
  if (botId === 'nyashhoroscope') {
    if (text.includes('сегодня') || text.includes('день')) return bot.today[Math.floor(Math.random() * bot.today.length)];
    if (text.includes('любов')) return bot.love[Math.floor(Math.random() * bot.love.length)];
    if (text.includes('денег') || text.includes('финанс')) return bot.money[Math.floor(Math.random() * bot.money.length)];
    if (text.includes('совет')) return bot.advice[Math.floor(Math.random() * bot.advice.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  return 'интересно... расскажи подробнее! 💕';
}

// ===== ЧЕРНОВИКИ =====
function saveDraft(chatId, text) {
  let drafts = JSON.parse(localStorage.getItem('nyashgram_drafts') || '{}');
  if (text) drafts[chatId] = text;
  else delete drafts[chatId];
  localStorage.setItem('nyashgram_drafts', JSON.stringify(drafts));
}

// ===== ДЕЙСТВИЯ =====
function toggleChatActions() {
  const panel = document.getElementById('chatActionsPanel');
  panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function showRenameModal() {
  const modal = document.getElementById('renameModal');
  const input = document.getElementById('renameInput');
  if (modal && input && currentChatId) {
    input.value = customNames[currentChatId] || document.getElementById('chatContactName').textContent;
    modal.style.display = 'flex';
  }
}

function hideRenameModal() {
  document.getElementById('renameModal').style.display = 'none';
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  if (!input || !currentChatId) return;
  
  const newName = input.value.trim();
  if (newName) customNames[currentChatId] = newName;
  else delete customNames[currentChatId];
  
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
  document.getElementById('chatContactName').textContent = newName || (currentChat?.otherUser?.name || currentChat?.name);
  hideRenameModal();
}

function togglePinChat() {
  let pinned = JSON.parse(localStorage.getItem('nyashgram_pinned') || '[]');
  if (pinned.includes(currentChatId)) {
    pinned = pinned.filter(id => id !== currentChatId);
    alert('📌 чат откреплён');
  } else {
    pinned.push(currentChatId);
    alert('📌 чат закреплён');
  }
  localStorage.setItem('nyashgram_pinned', JSON.stringify(pinned));
}

function showTypingIndicator() {
  document.getElementById('typingIndicator').style.display = 'flex';
}

function hideTypingIndicator() {
  document.getElementById('typingIndicator').style.display = 'none';
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  // Кнопки навигации
  document.getElementById('backBtn')?.addEventListener('click', () => showScreen('friendsScreen'));
  document.getElementById('chatMenuBtn')?.addEventListener('click', toggleChatActions);
  
  // Действия с чатом
  document.getElementById('pinChatActionBtn')?.addEventListener('click', () => {
    togglePinChat();
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('renameChatBtn')?.addEventListener('click', () => {
    showRenameModal();
    document.getElementById('chatActionsPanel').style.display = 'none';
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
  
  // Модалка
  document.getElementById('renameCancelBtn')?.addEventListener('click', hideRenameModal);
  document.getElementById('renameConfirmBtn')?.addEventListener('click', renameCurrentChat);
  
  // Отправка
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
  
  // Черновик
  input?.addEventListener('input', () => {
    if (currentChatId) saveDraft(currentChatId, input.value);
  });
  
  // Экспорт
  window.openRealChat = openRealChat;
  window.openBotChat = openBotChat;
  window.sendMessage = sendMessage;
});
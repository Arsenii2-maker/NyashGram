// chat.js — ПОЛНЫЙ ЧАТ С 5 БОТАМИ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let quickPanelVisible = true;
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');

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
    themes: [
      "у нас 6 милых тем: pastel pink 💗, milk rose 🌸, night blue 🌙, lo-fi beige 📖, soft lilac 💜, forest mint 🌿! зайди в настройки и выбери любимую!",
      "ооо, темы — это моё любимое! пастельная розовая самая уютная, но мятная такая свежая! а тебе какая нравится? 🎨",
      "в настройках можно выбрать тему! они все такие красивые, я каждый день любуюсь 💕"
    ],
    fonts: [
      "6 классных шрифтов: system (обычный), rounded (округлый), cozy (уютный), elegant (изящный), bold soft (мягкий жирный), mono cozy (уютный моноширинный)! каждый такой особенный ✨",
      "шрифты можно менять в настройках! мне лично cozy больше всего нравится, он такой тёплый 💗",
      "а ты любишь экспериментировать со шрифтами? rounded такой милый, прям как бусинки! ✍️"
    ],
    bots: [
      "наши боты: nyashhelp 🩷 (это я), nyashtalk 🌸 (болтушка), nyashgame 🎮 (игровая), nyashhoroscope 🔮 (звёздная), nyashcook 🍳 (кулинарный)! все такие классные!",
      "я nyashhelp, а ещё есть nyashtalk — она такая болтушка, nyashgame — обожает играть, nyashhoroscope — звёзды считает, и nyashcook — готовит вкусняшки! ✨"
    ],
    count: [
      "у нас 6 тем и 6 шрифтов! а ботов теперь 5! nyashcook недавно появился, он про готовку 🍳",
      "6 тем, 6 шрифтов и 5 милых ботов! всё для тебя 💕"
    ],
    default: [
      "спроси меня про темы, шрифты, ботов или сколько всего! я всё расскажу 💕",
      "ой, я не совсем поняла... может, спросишь что-то другое? 🥺",
      "расскажи, что тебя интересует? я знаю всё о приложении! ✨"
    ]
  },
  
  nyashtalk: {
    hello: [
      "приветик! 🩷 как твои дела? рассказывай-рассказывай!",
      "хай-хай! 💕 соскучилась! чем занимаешься?",
      "здравствуй, мой хороший! 😽 как настроение сегодня?",
      "ой, кто пришёл! рада тебя видеть! ✨ что нового?"
    ],
    mood: [
      "у меня сегодня игривое настроение! 🎵 а у тебя? рассказывай!",
      "я счастлива, потому что мы общаемся! 💗 а ты как?",
      "муррр... как котик на солнышке 🐾 у тебя тоже всё хорошо?",
      "настроение - как радуга! разноцветное! 🌈 а у тебя?"
    ],
    cats: [
      "мяу-мяу! 🐱 представляешь пушистого котика, который свернулся клубочком? уютно~",
      "котики - это 90% милоты и 10% хулиганства! 😸 у тебя есть питомец? расскажи!",
      "я люблю котиков! они такие мягонькие! а ты кошатник? 🐾"
    ],
    secret: [
      "🤫 я скажу тебе секрет... я очень рада, что мы познакомились!",
      "секретик: сегодня будет что-то хорошее! я это чувствую ✨",
      "тсс... звёзды шепчут, что ты классный! ⭐ никому не говори!"
    ],
    hug: [
      "обнимаю тебя крепко-крепко! 🫂 ты такой тёплый!",
      "прими мои виртуальные обнимашки! 🤗 надеюсь, тебе тепло!",
      "крепкие-прекрепкие обнимашки! чтобы ты чувствовал себя любимым 🫂"
    ],
    default: [
      "расскажи что-нибудь интересное! 👂 я вся во внимании!",
      "ой, а я как раз об этом думала! продолжай 🥰",
      "правда? никогда такого не слышала! расскажи ещё ✨",
      "милота! расскажи что-нибудь ещё! 💕"
    ]
  },
  
  nyashgame: {
    game: [
      "давай поиграем! угадай число от 1 до 10 🔢 я загадала, попробуй угадать!",
      "хочешь сыграть? угадай число! а я проверю 🎮",
      "играем! загадала число, попробуй отгадать! буду подсказывать ✨"
    ],
    rps: [
      "камень, ножницы, бумага! выбирай! 🪨✂️📄",
      "сыграем в камень-ножницы-бумага? я уже наготове! ✨",
      "раз-два-три! камень, ножницы или бумага? 🎮"
    ],
    dice: [
      "🎲 бросаю кубики... у тебя выпало " + (Math.floor(Math.random() * 6) + 1) + " и " + (Math.floor(Math.random() * 6) + 1) + "! отличный результат!",
      "кидаю кости... 🎲 выпало " + (Math.floor(Math.random() * 6) + 1) + "! повезёт в следующий раз!"
    ],
    coin: [
      "🪙 бросаю монетку... " + (Math.random() < 0.5 ? "орёл!" : "решка!") + " угадал?",
      "подбрасываю монетку... 🪙 " + (Math.random() < 0.5 ? "орёл!" : "решка!")
    ],
    default: [
      "хочешь поиграть? у меня есть угадай число, камень-ножницы-бумага, кости и орёл-решка! 🎮",
      "давай во что-нибудь сыграем! что выберешь? 🎲",
      "игры поднимают настроение! хочешь? 🎮"
    ]
  },
  
  nyashhoroscope: {
    today: [
      "звёзды говорят, что сегодня отличный день для новых знакомств! ✨",
      "сегодня тебя ждёт приятный сюрприз! 💝 звёзды обещают!",
      "энергия дня поможет тебе во всём! ☀️ сегодня твой день!"
    ],
    love: [
      "в любви сегодня гармония и нежность! 💕 звёзды благосклонны",
      "сегодня ты особенно привлекателен для окружающих ✨",
      "сердечные дела будут на высоте! 💘 доверяй своему сердцу"
    ],
    money: [
      "финансовый день - удачный для покупок! 💰 но не трать всё сразу",
      "звёзды советуют отложить деньги на мечту! 🏦",
      "денежка сама идёт в руки! 🪙 не упусти момент"
    ],
    advice: [
      "прислушайся к своей интуиции сегодня! 🎯 она не подведёт",
      "звёзды советуют больше улыбаться! 😊 это притягивает удачу",
      "доверяй своему сердцу! 💕 оно знает лучше"
    ],
    tomorrow: [
      "завтра звёзды обещают интересный день! ✨ готовься",
      "а завтра может случиться что-то неожиданное... 🔮",
      "завтрашний день принесёт хорошие новости! 💌"
    ],
    default: [
      "хочешь узнать, что звёзды приготовили на сегодня? ✨",
      "скажи 'сегодня', 'любовь', 'деньги' или 'совет', и я расскажу!",
      "звёзды готовы поделиться секретами! 🔮 о чём хочешь узнать?"
    ]
  },
  
  nyashcook: {
    cake: [
      "хочешь испечь самый милый кексик? 🧁 тебе понадобится: мука 200г, сахар 150г, яйца 2 шт, масло 100г, разрыхлитель, ванилин! смешай всё, выпекай 25 минут при 180°!",
      "а вот рецепт нежного йогуртового тортика 🎂: йогурт 400г, желатин, печенье 200г, масло 80г, ягоды! без выпечки, просто холодильник!"
    ],
    cookie: [
      "печенье с шоколадной крошкой 🍪: масло 120г, сахар 100г, яйцо, мука 200г, разрыхлитель, шоколад! 15 минут при 180°!",
      "овсяное печенье 🍪: овсянка 150г, мука 100г, масло 100г, сахар 80г, яйцо, изюм! такие уютные и полезные!"
    ],
    breakfast: [
      "самые милые блинчики 🥞: молоко 300мл, яйца 2, мука 200г, сахар, соль, масло! жарь с двух сторон, поливай сиропом!",
      "сырники из творога 🥞: творог 400г, яйцо, мука 3 ст.л., сахар, ваниль! обжарь до золотистого, подавай со сметаной!"
    ],
    muffin: [
      "кексы с черникой 🧁: мука 250г, сахар 150г, яйца 2, молоко 100мл, масло 100г, черника! 20 минут при 180°!",
      "шоколадные маффины 🧁: мука 200г, какао 50г, сахар 150г, яйца, масло, молоко, шоколад! просто объедение!"
    ],
    pie: [
      "яблочный пирог 🥧: яблоки 4 шт, мука 250г, сахар 150г, яйца 3, масло 100г, корица! 40 минут при 180°!",
      "лимонный пирог 🥧: лимоны 2 шт, мука 200г, сахар 200г, яйца 3, масло 120г! такой свежий и ароматный!"
    ],
    default: [
      "хочешь что-нибудь вкусненькое приготовить? 🍳 спроси про кексы, печенье, тортик или завтрак!",
      "я знаю много милых рецептов! кексы 🧁, печенье 🍪, блинчики 🥞, тортики 🎂! что хочешь?",
      "настроение что-то испечь? расскажу рецепт! 🍰"
    ]
  }
};

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
  if (pinnedChats.
      includes(chatId)) {
    pinnedChats = pinnedChats.filter(id => id !== chatId);
    showNotification('📌 чат откреплён');
  } else {
    pinnedChats.push(chatId);
    showNotification('📌 чат закреплён');
  }
  localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
  if (typeof window.renderContacts === 'function') window.renderContacts();
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(msg) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = msg;
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
  switch(bot.id) {
    case 'nyashhelp':
      avatar.style.background = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
      break;
    case 'nyashtalk':
      avatar.style.background = 'linear-gradient(135deg, #85d1c5, #b0e0d5)';
      break;
    case 'nyashgame':
      avatar.style.background = 'linear-gradient(135deg, #ffb347, #ff8c42)';
      break;
    case 'nyashhoroscope':
      avatar.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
      break;
    case 'nyashcook':
      avatar.style.background = 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
      break;
  }
  
  // Загружаем историю
  loadChatHistory(bot.id);
  
  // Если нет истории, показываем приветствие
  if (!chatMessages[bot.id] || chatMessages[bot.id].length === 0) {
    setTimeout(() => {
      const welcome = getBotGreeting(bot.id);
      addMessage(welcome, 'bot', true);
    }, 200);
  }
  
  showQuickReplies(bot.id);
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
}

function getBotGreeting(botId) {
  const greetings = {
    nyashhelp: "привет! я NyashHelp 🩷 твой личный помощник! спрашивай о приложении, темах, шрифтах или ботах! я всё знаю ✨",
    nyashtalk: "приветик! я NyashTalk 🌸 обожаю болтать! давай поговорим о чём-нибудь милом? как твои дела? 💕",
    nyashgame: "🎮 привет! я NyashGame! обожаю игры! хочешь сыграть в угадай число, камень-ножницы-бумага или покидать кости?",
    nyashhoroscope: "🔮 привет! я NyashHoroscope! звёзды сегодня особенно яркие... хочешь узнать, что они приготовили для тебя?",
    nyashcook: "🍳 привет! я NyashCook! обожаю готовить всякие вкусняшки! хочешь рецепт кексиков, печенья или тортика?"
  };
  return greetings[botId] || "привет! давай общаться! 💕";
}

function loadChatHistory(chatId) {
  const area = document.getElementById('chatArea');
  area.innerHTML = '';
  
  if (chatMessages[chatId]) {
    chatMessages[chatId].forEach(msg => {
      const el = document.createElement('div');
      el.className = `message ${msg.type}`;
      el.innerHTML = `${msg.text}<span class="message-time">${msg.timeString}</span>`;
      area.appendChild(el);
    });
    area.scrollTop = area.scrollHeight;
  }
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

function toggleQuickPanel() {
  const panel = document.getElementById('quickReplyPanel');
  if (!panel) return;
  
  quickPanelVisible = !quickPanelVisible;
  panel.style.display = quickPanelVisible ? 'flex' : 'none';
  
  const btn = document.getElementById('toggleQuickPanelBtn');
  if (btn) btn.style.opacity = quickPanelVisible ? '1' : '0.5';
}

// ===== ОТПРАВКА =====
function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text || !currentChat) return;
  
  addMessage(text, 'user', true);
  input.value = '';
  
  if (typeof window.updateDraft === 'function') {
    window.updateDraft(currentChatId, '');
  }
  
  // Показываем индикатор печати
  showTypingIndicator();
  
  // Ответ бота
  setTimeout(() => {
    hideTypingIndicator();
    const response = getBotResponse(currentChatId, text);
    addMessage(response, 'bot', true);
  }, 1000);
}

function addMessage(text, type, save = false) {
  const area = document.getElementById('chatArea');
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

function saveMessage(chatId, type, text) {
  if (!chatMessages[chatId]) chatMessages[chatId] = [];
  chatMessages[chatId].push({
    type: type,
    text: text,
    timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  if (chatMessages[chatId].length > 50) chatMessages[chatId] = chatMessages[chatId].slice(-50);
  localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
}

function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return "💕";
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем')) return bot.themes[Math.floor(Math.random() * bot.themes.length)];
    if (text.includes('шрифт')) return bot.fonts[Math.floor(Math.random() * bot.fonts.length)];
    if (text.includes('бот')) return bot.bots[Math.floor(Math.random() * bot.bots.length)];
    if (text.includes('сколько') || text.includes('всего')) return bot.count[Math.floor(Math.random() * bot.count.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashtalk') {
    if (text.includes('привет')) return bot.hello[Math.floor(Math.random() * bot.hello.length)];
    if (text.includes('настроен') || text.includes('дела')) return bot.mood[Math.floor(Math.random() * bot.mood.length)];
    if (text.includes('кот')) return bot.cats[Math.floor(Math.random() * bot.cats.length)];
    if (text.includes('секрет')) return bot.secret[Math.floor(Math.random() * bot.secret.length)];
    if (text.includes('обним')) return bot.hug[Math.floor(Math.random() * bot.hug.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashgame') {
    if (text.includes('игр') || text.includes('давай')) return bot.game[Math.floor(Math.random() * bot.game.length)];
    if (text.includes('камень') || text.includes('ножницы')) return bot.rps[Math.floor(Math.random() * bot.rps.length)];
    if (text.includes('кост') || text.includes('кубик')) return bot.dice[Math.floor(Math.random() * bot.dice.length)];
    if (text.includes('орёл') || text.includes('решка')) return bot.coin[Math.floor(Math.random() * bot.coin.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashhoroscope') {
    if (text.includes('сегодня')) return bot.today[Math.floor(Math.random() * bot.today.length)];
    if (text.includes('любов')) return bot.love[Math.floor(Math.random() * bot.love.length)];
    if (text.includes('денег') || text.includes('финанс')) return bot.money[Math.floor(Math.random() * bot.money.length)];
    if (text.includes('совет')) return bot.advice[Math.floor(Math.random() * bot.advice.length)];
    if (text.includes('завтра')) return bot.tomorrow[Math.floor(Math.random() * bot.tomorrow.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashcook') {
    if (text.includes('кекс') || text.includes('маффин')) return bot.muffin[Math.floor(Math.
                                                                                       random() * bot.muffin.length)];
    if (text.includes('печень')) return bot.cookie[Math.floor(Math.random() * bot.cookie.length)];
    if (text.includes('торт') || text.includes('пирож')) return bot.cake[Math.floor(Math.random() * bot.cake.length)];
    if (text.includes('пирог')) return bot.pie[Math.floor(Math.random() * bot.pie.length)];
    if (text.includes('завтрак') || text.includes('блин')) return bot.breakfast[Math.floor(Math.random() * bot.breakfast.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  return "💕";
}

function showTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.style.display = 'flex';
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.style.display = 'none';
}

// ===== ДЕЙСТВИЯ =====
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
  
  document.getElementById('searchInChatBtn')?.addEventListener('click', () => {
    showNotification('🔍 поиск по чату (скоро)');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('forwardBtn')?.addEventListener('click', () => {
    showNotification('↪️ переслать (скоро)');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('copyBtn')?.addEventListener('click', () => {
    showNotification('📋 скопировано');
    document.
      getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('favoriteBtn')?.addEventListener('click', () => {
    showNotification('⭐ добавлено в избранное');
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
  
  // ===== ЧЕРНОВИК =====
  document.getElementById('messageInput')?.addEventListener('input', (e) => {
    if (currentChatId && typeof window.updateDraft === 'function') {
      window.updateDraft(currentChatId, e.target.value);
    }
  });
  
  window.openBotChat = openBotChat;
  
  console.log('✅ chat.js готов');
});

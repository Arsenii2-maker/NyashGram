// chat.js — ПОЛНЫЙ ЧАТ С МИЛЫМИ ОТВЕТАМИ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let quickPanelVisible = true;
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');

// ===== МИЛЫЕ БЫСТРЫЕ ВОПРОСЫ =====
const quickQuestions = {
  nyashhelp: [
    "как сменить тему? 🎨",
    "как поменять шрифт? ✍️",
    "кто такие боты? 🤖",
    "как добавить друга? 👥",
    "что нового? ✨",
    "расскажи о себе 💕"
  ],
  nyashtalk: [
    "как дела? 💕",
    "что нового? 🌸",
    "любишь котиков? 🐱",
    "как погода? ☁️",
    "расскажи секрет 🤫",
    "обними меня! 🫂",
    "спой песню 🎵"
  ],
  nyashgame: [
    "сыграем? 🎮",
    "угадай число 🔢",
    "камень-ножницы ✂️",
    "кости 🎲",
    "орёл-решка 🪙",
    "во что поиграем? 🤔"
  ],
  nyashhoroscope: [
    "что сегодня? ✨",
    "любовный гороскоп 💕",
    "финансы 💰",
    "совет звёзд 🌟",
    "что завтра? 🔮",
    "какой у меня знак? ⭐"
  ]
};

// ===== МИЛЫЕ ОТВЕТЫ БОТОВ (ПОЛНАЯ ВЕРСИЯ) =====
const botResponses = {
  nyashhelp: {
    themes: [
      "у нас 6 милых тем: pastel pink 💗 (нежно-розовая), milk rose 🌸 (персиковая), night blue 🌙 (ночная синяя), lo-fi beige 📖 (уютная бежевая), soft lilac 💜 (лавандовая), forest mint 🌿 (мятная)! зайди в настройки и выбери любимую!",
      "ооо, темы — это моё любимое! пастельная розовая самая уютная, но мятная такая свежая! а тебе какая нравится? 🎨",
      "в настройках можно выбрать тему! они все такие красивые, я каждый день любуюсь 💕"
    ],
    fonts: [
      "6 классных шрифтов: system (обычный), rounded (округлый), cozy (уютный), elegant (изящный), bold soft (мягкий жирный), mono cozy (уютный моноширинный)! каждый такой особенный ✨",
      "шрифты можно менять в настройках! мне лично cozy больше всего нравится, он такой тёплый 💗",
      "а ты любишь экспериментировать со шрифтами? rounded такой милый, прям как бусинки! ✍️"
    ],
    bots: [
      "наши боты: nyashhelp 🩷 (это я), nyashtalk 🌸 (болтушка, обожает разговаривать), nyashgame 🎮 (игровая, знает много игр), nyashhoroscope 🔮 (звёздная, предсказывает будущее)! все такие классные!",
      "я nyashhelp, а ещё есть nyashtalk — она такая болтушка, nyashgame — обожает играть, и nyashhoroscope — звёзды считает ✨",
      "мы все очень разные, но очень дружные! хочешь с кем-то познакомиться поближе? 🤗"
    ],
    friends: [
      "ищи друзей по юзернейму в разделе 👥 друзья! просто нажми 🔍 и введи их имя, и можно добавить в друзья!",
      "хочешь найти друга? введи его юзернейм в поиске и отправь заявку! это очень просто 💕",
      "друзья — это самое главное! когда добавишь кого-то, сможете общаться в реальном времени ✨"
    ],
    default: [
      "спроси меня про темы, шрифты, ботов или друзей! я всё расскажу 💕",
      "ой, я не совсем поняла... может, спросишь про темы или шрифты? 🥺",
      "расскажи, что тебя интересует? я знаю всё о приложении! ✨",
      "хмм... может, хочешь узнать, как поменять тему или шрифт? 🎨"
    ]
  },
  nyashtalk: {
    hello: [
      "приветик! 🩷 как твои дела? рассказывай-рассказывай!",
      "хай-хай! 💕 соскучилась! чем занимаешься?",
      "здравствуй, мой хороший! 😽 как настроение сегодня?",
      "ой, кто пришёл! рада тебя видеть! ✨ что нового?",
      "привееет! 💗 я так ждала нашего разговора!"
    ],
    mood: [
      "у меня сегодня игривое настроение! 🎵 а у тебя? рассказывай!",
      "я счастлива, потому что мы общаемся! 💗 а ты как?",
      "муррр... как котик на солнышке 🐾 у тебя тоже всё хорошо?",
      "настроение - как радуга! разноцветное! 🌈 а у тебя?",
      "сегодня такой чудесный день! надеюсь, у тебя тоже ☀️"
    ],
    cats: [
      "мяу-мяу! 🐱 представляешь пушистого котика, который свернулся клубочком и мурлычет? уютно~",
      "котики - это 90% милоты и 10% хулиганства! 😸 у тебя есть питомец? расскажи!",
      "я люблю котиков! они такие мягонькие и пушистые! а ты кошатник или собачник? 🐾",
      "муррр... я как котик, только виртуальный! хочешь, помурчу? 😽",
      "котики делают этот мир лучше! согласен? 🐱"
    ],
    weather: [
      "сегодня такое солнышко за окном! ☀️ а у тебя как погода? тепло?",
      "дождик моросит... так уютно сидеть дома с чашечкой чая ☕ а ты любишь дождь?",
      "ветерок гуляет... хорошо, что мы в чатике, тут всегда тепло и уютно! 💨",
      "говорят, завтра будет радуга! 🌈 любишь смотреть на неё?",
      "снежок выпал! ❄️ можно лепить снеговиков! а у тебя какая погода?"
    ],
    secret: [
      "🤫 я скажу тебе секрет... я очень рада, что мы познакомились!",
      "секретик: сегодня будет что-то хорошее! я это чувствую ✨",
      "тсс... звёзды шепчут, что ты классный! ⭐ никому не говори!",
      "а вот секрет: я люблю сладкое! особенно пироженки 🍰",
      "секрет за секрет? расскажешь мне что-то? 🤫"
    ],
    hug: [
      "обнимаю тебя крепко-крепко! 🫂 ты такой тёплый!",
      "прими мои виртуальные обнимашки! 🤗 надеюсь, тебе тепло!",
      "обнимаю! помни, что ты не один, я всегда рядом 💕",
      "крепкие-прекрепкие обнимашки! чтобы ты чувствовал себя любимым 🫂"
    ],
    song: [
      "🎵 ля-ля-ля, я пою для тебя! а ты любишь петь?",
      "♪ я тебя люблю, я тебя люблю... ♪ ну как, похоже на песню? 😊",
      "а какую песню ты хочешь услышать? я могу помурлыкать что-нибудь 🎤",
      "в голове сейчас играет что-то милое... а у тебя? 🎶"
    ],
    default: [
      "расскажи что-нибудь интересное! 👂 я вся во внимании!",
      "ой, а я как раз об этом думала! продолжай, мне очень интересно 🥰",
      "правда? никогда такого не слышала! расскажи ещё ✨",
      "милота! расскажи что-нибудь ещё! 💕",
      "ух ты! а что дальше? мне так нравится тебя слушать!",
      "интересно-интересно... продолжай, я слушаю 👂",
      "какой ты интересный собеседник! 💗 давай болтать ещё!"
    ]
  },
  nyashgame: {
    game: [
      "давай поиграем! угадай число от 1 до 10 🔢 я загадала, попробуй угадать!",
      "хочешь сыграть? угадай число! а я проверю 🎮",
      "играем! загадала число, попробуй отгадать! если что, буду подсказывать ✨"
    ],
    rps: [
      "камень, ножницы, бумага! выбирай! 🪨✂️📄",
      "сыграем в камень-ножницы-бумага? я уже наготове! ✨",
      "раз-два-три! камень, ножницы или бумага? 🎮"
    ],
    dice: [
      "🎲 бросаю кубики... у тебя выпало " + (Math.floor(Math.random() * 6) + 1) + " и " + (Math.floor(Math.random() * 6) + 1) + "! отличный результат!",
      "кидаю кости... 🎲 выпало " + (Math.floor(Math.random() * 6) + 1) + "! повезёт в следующий раз!",
      "бросаю кубики... сумма " + (Math.floor(Math.random() * 12) + 2) + "! как тебе?"
    ],
    coin: [
      "🪙 бросаю монетку... " + (Math.random() < 0.5 ? "орёл!" : "решка!") + " угадал?",
      "подбрасываю монетку... 🪙 " + (Math.random() < 0.5 ? "орёл!" : "решка!"),
      "орёл или решка? 🪙 выпал " + (Math.random() < 0.5 ? "орёл!" : "решка!")
    ],
    win: [
      "🎉 ура! ты выиграл! молодец!",
      "поздравляю! ты победитель! 🏆",
      "вау! ты такой умный! выиграл! ✨"
    ],
    lose: [
      "😊 я выиграла! хочешь реванш?",
      "в этот раз повезло мне! сыграем ещё? 🎮",
      "ой, я выиграла! но ты тоже молодец!"
    ],
    draw: [
      "🤝 ничья! ещё разок?",
      "одинаково! давай ещё! 🎲",
      "у нас ничья! это так мило ✨"
    ],
    default: [
      "хочешь поиграть? у меня есть угадай число, камень-ножницы-бумага, кости и орёл-решка! 🎮",
      "давай во что-нибудь сыграем! что выберешь? 🎲",
      "скучно? давай поиграем! я знаю много игр ✨",
      "игры поднимают настроение! хочешь? 🎮"
    ]
  },
  nyashhoroscope: {
    today: [
      "звёзды говорят, что сегодня отличный день для новых знакомств! ✨",
      "сегодня тебя ждёт приятный сюрприз! 💝 звёзды обещают!",
      "энергия дня поможет тебе во всём! ☀️ сегодня твой день!",
      "сегодня ты будешь особенно обаятелен! ⭐ пользуйся!",
      "звёзды шепчут, что сегодня нужно улыбаться чаще! 😊"
    ],
    love: [
      "в любви сегодня гармония и нежность! 💕 звёзды благосклонны",
      "сегодня ты особенно привлекателен для окружающих ✨",
      "сердечные дела будут на высоте! 💘 доверяй своему сердцу",
      "звёзды говорят, что любовь рядом! присмотрись 👀",
      "одиноким звёзды обещают интересную встречу! 🌟"
    ],
    money: [
      "финансовый день - удачный для покупок! 💰 но не трать всё сразу",
      "звёзды советуют отложить деньги на мечту! 🏦",
      "сегодня хорошо инвестировать в себя! 💎 курсы, книги...",
      "денежка сама идёт в руки! 🪙 не упусти момент",
      "финансовый гороскоп: сегодня лучше копить, а не тратить"
    ],
    advice: [
      "прислушайся к своей интуиции сегодня! 🎯 она не подведёт",
      "звёзды советуют больше улыбаться! 😊 это притягивает удачу",
      "сегодня отличный день для творчества! 🎨 рисуй, пиши, твори",
      "доверяй своему сердцу! 💕 оно знает лучше",
      "звёзды говорят: отдохни сегодня, ты заслужил 🌙"
    ],
    tomorrow: [
      "завтра звёзды обещают интересный день! ✨ готовься",
      "а завтра может случиться что-то неожиданное... 🔮",
      "завтрашний день принесёт хорошие новости! 💌",
      "звёзды готовят сюрприз на завтра! 🎁"
    ],
    sign: [
      "твой знак зодиака влияет на настроение! а кто ты по знаку? ⭐",
      "каждый знак особенный! расскажи, кто ты, и я скажу, что звёзды готовят ✨",
      "овны сегодня активны, тельцы — усидчивы, а близнецы — общительны! а ты? 🔮"
    ],
    default: [
      "хочешь узнать, что звёзды приготовили на сегодня? ✨",
      "скажи 'сегодня', 'любовь', 'деньги' или 'совет', и я расскажу!",
      "звёзды готовы поделиться секретами! 🔮 о чём хочешь узнать?",
      "астрологи объявили: сегодня отличный день для вопросов! задавай ⭐",
      "звёзды шепчут... но я расскажу! о чём спросишь? 💫"
    ]
  }
};

// ===== СОХРАНЕНИЕ ИМЁН =====
function saveCustomName(chatId, name) {
  if (name) customNames[chatId] = name;
  else delete customNames[chatId];
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
}

// ===== СОХРАНЕНИЕ СООБЩЕНИЙ =====
function saveMessage(chatId, type, text) {
  if (!chatMessages[chatId]) chatMessages[chatId] = [];
  chatMessages[chatId].push({
    type: type,
    text: text,
    time: Date.now(),
    timeString: new Date().toLocaleTimeString()
  });
  if (chatMessages[chatId].length > 50) chatMessages[chatId] = chatMessages[chatId].slice(-50);
  localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
}

// ===== ОТКРЫТИЕ ЧАТА =====
function openBotChat(bot) {
  currentChat = bot.id;
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
    nyashhelp: "привет! я NyashHelp 🩷 твой личный помощник! спрашивай о приложении, темах, шрифтах или друзьях! я всё-всё знаю ✨",
    nyashtalk: "приветик! я NyashTalk 🌸 обожаю болтать! давай поговорим о чём-нибудь милом? как твои дела? 💕",
    nyashgame: "🎮 привет! я NyashGame! обожаю игры! хочешь сыграть в угадай число, камень-ножницы-бумага или покидать кости?",
    nyashhoroscope: "🔮 привет! я NyashHoroscope! звёзды сегодня особенно яркие... хочешь узнать, что они приготовили для тебя?"
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
    window.updateDraft(currentChat, '');
  }
  
  // Показываем индикатор печати
  showTypingIndicator();
  
  // Ответ бота
  setTimeout(() => {
    hideTypingIndicator();
    const response = getBotResponse(currentChat, text);
    addMessage(response, 'bot', true);
  }, 1500);
}

function addMessage(text, type, save = false) {
  const area = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  msg.innerHTML = `${text}<span class="message-time">${time}</span>`;
  
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  
  if (save && currentChat) {
    saveMessage(currentChat, type, text);
  }
}

function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return "ой, я не поняла... можешь повторить? 🥺";
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем') || text.includes('тему')) {
      return bot.themes[Math.floor(Math.random() * bot.themes.length)];
    }
    if (text.includes('шрифт')) {
      return bot.fonts[Math.floor(Math.random() * bot.fonts.length)];
    }
    if (text.includes('бот')) {
      return bot.bots[Math.floor(Math.random() * bot.bots.length)];
    }
    if (text.includes('друг') || text.includes('друз')) {
      return bot.friends[Math.floor(Math.random() * bot.friends.length)];
    }
    return bot.default[Math.floor(Math.random() * bot.default.length)];
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
    if (text.includes('обним') || text.includes('обнять')) {
      return bot.hug[Math.floor(Math.random() * bot.hug.length)];
    }
    if (text.includes('песн') || text.includes('спой')) {
      return bot.song[Math.floor(Math.random() * bot.song.length)];
    }
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashgame') {
    if (text.includes('игр') || text.includes('давай') || text.includes('сыгра')) {
      return bot.game[Math.floor(Math.random() * bot.game.length)];
    }
    if (text.includes('камень') || text.includes('ножницы') || text.includes('бумаг')) {
      return bot.rps[Math.floor(Math.random() * bot.rps.length)];
    }
    if (text.includes('кост') || text.includes('кубик')) {
      return bot.dice[Math.floor(Math.random() * bot.dice.length)];
    }
    if (text.includes('орёл') || text.includes('решка') || text.includes('монет')) {
      return bot.coin[Math.floor(Math.random() * bot.coin.length)];
    }
    return bot.default[Math.floor(Math.random() * bot.default.length)];
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
    if (text.includes('завтра')) {
      return bot.tomorrow[Math.floor(Math.random() * bot.tomorrow.length)];
    }
    if (text.includes('знак') || text.includes('зодиак')) {
      return bot.sign[Math.floor(Math.random() * bot.sign.length)];
    }
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  return "интересно... расскажи подробнее! 💕";
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
  panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function showRenameModal() {
  document.getElementById('renameModal').style.display = 'flex';
  document.getElementById('renameInput').value = customNames[currentChat] || '';
  setTimeout(() => document.getElementById('renameInput').focus(), 100);
}

function hideRenameModal() {
  document.getElementById('renameModal').style.display = 'none';
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  const newName = input.value.trim();
  if (newName) {
    saveCustomName(currentChat, newName);
    document.getElementById('chatContactName').textContent = newName;
  }
  hideRenameModal();
}

function togglePinChat() {
  alert('📌 чат закреплён (это демо)');
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  // Навигация
  document.getElementById('backBtn')?.addEventListener('click', () => {
    if (typeof window.showScreen === 'function') {
      window.showScreen('friendsScreen');
    }
  });
  
  // Кнопка меню
  document.getElementById('chatMenuBtn')?.addEventListener('click', toggleChatActions);
  
  // Кнопка скрытия панели
  document.getElementById('toggleQuickPanelBtn')?.addEventListener('click', toggleQuickPanel);
  
  // Кнопки действий
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
      if (currentChat) delete chatMessages[currentChat];
      document.getElementById('chatArea').innerHTML = '';
      localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
    }
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('searchInChatBtn')?.addEventListener('click', () => {
    alert('🔍 поиск по чату (будет скоро)');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('forwardBtn')?.addEventListener('click', () => {
    alert('↪️ переслать (будет скоро)');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('copyBtn')?.addEventListener('click', () => {
    alert('📋 скопировано');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('favoriteBtn')?.addEventListener('click', () => {
    alert('⭐ добавлено в избранное');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  // Модалка
  document.getElementById('renameCancelBtn')?.addEventListener('click', hideRenameModal);
  document.getElementById('renameConfirmBtn')?.addEventListener('click', renameCurrentChat);
  
  // Отправка
  document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);
  document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Черновик
  document.getElementById('messageInput')?.addEventListener('input', (e) => {
    if (currentChat && typeof window.updateDraft === 'function') {
      window.updateDraft(currentChat, e.target.value);
    }
  });
  
  window.openBotChat = openBotChat;
});

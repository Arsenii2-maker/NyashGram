// chat.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ

let currentChat = null;
let currentContact = null;
let isBotTyping = false;
let isUserTyping = false;
let typingTimeout = null;

if (!window.chatData) {
  window.chatData = {};
}

let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');

function saveCustomName(contactId, newName) {
  if (!newName || newName.trim() === '') {
    delete customNames[contactId];
  } else {
    customNames[contactId] = newName.trim();
  }
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
  
  if (typeof window.renderContacts === 'function') {
    window.renderContacts();
  }
}

function getDisplayName(contact) {
  if (!contact) return '';
  return customNames[contact.id] || contact.name;
}

// ===== УНИВЕРСАЛЬНЫЕ БЫСТРЫЕ ВОПРОСЫ =====
const universalQuickQuestions = [
  { text: "Как дела? 💕", keywords: ["дела", "как ты"] },
  { text: "Чем занят? 🌸", keywords: ["чем", "занят", "делаешь"] },
  { text: "Что нового? 🌟", keywords: ["нового", "новости"] },
  { text: "Как настроение? 💗", keywords: ["настроение"] }
];

// ===== NYASHHELP =====
const nyashHelpQuickQuestions = [
  "Как сменить тему?",
  "Как поменять шрифт?",
  "Как загрузить аватарку?",
  "Что такое черновик?",
  "Кто такие боты?"
];

function getNyashHelpResponse(text) {
  text = text.toLowerCase();
  if (text.includes('тем')) return 'У нас 5 тем: Pastel Pink, Milk Rose, Night Blue, Lo-Fi Beige, Soft Lilac! 🌈 Зайди в Настройки';
  if (text.includes('шрифт')) return '6 шрифтов: System, Rounded, Cozy, Elegant, Bold Soft, Mono Cozy! 💕 Меняй в Настройках';
  if (text.includes('аватар')) return 'Загрузи фото в настройках или оставь милый градиент! 💫';
  if (text.includes('черновик')) return 'Черновики сохраняются автоматически! 📝 Видишь подпись под контактом?';
  if (text.includes('бот')) return 'У нас NyashHelp, NyashTalk, NyashGame, NyashHoroscope и 5 друзей! 🎭';
  return 'Спроси про темы, шрифты, аватарки или ботов! 🩷';
}

// ===== NYASHTALK =====
const nyashTalkQuickQuestions = [
  "Расскажи о погоде ☁️",
  "Поговорим о настроении 💗",
  "Люблю котиков! 🐱",
  "Что насчёт еды? 🍰",
  "Сны — это интересно ✨"
];

function getNyashTalkResponse(text) {
  text = text.toLowerCase().trim();
  
  if (text.includes('привет')) return "Приветик! 🩷 Давай поболтаем!";
  if (text.includes('погод')) return "Ой, сегодня такое солнышко! ☀️ А у тебя?";
  if (text.includes('настроен')) return "У меня игривое настроение! 🎵 А у тебя?";
  if (text.includes('кот')) return "Мяу-мяу! 🐱 Люблю котиков! У тебя есть питомец?";
  if (text.includes('ед')) return "Ммм, обожаю сладенькое! 🍰 А ты?";
  if (text.includes('сон')) return "Мне сегодня снились цветные сны! ✨ А тебе?";
  
  return ['Расскажи подробнее! 💕', 'Интересно! 😊', 'Продолжай! 🩷'][Math.floor(Math.random()*3)];
}

// ===== NYASHGAME =====
let gameStates = {};

const nyashGameQuickQuestions = [
  "🎮 Сыграем в угадай число",
  "✂️ Камень-ножницы-бумага",
  "🔢 От 1 до 10",
  "🎲 Кости",
  "🪙 Орёл или решка"
];

function getNyashGameResponse(text, userId = 'default') {
  text = text.toLowerCase().trim();
  
  // Инициализация состояния игры для пользователя
  if (!gameStates[userId]) {
    gameStates[userId] = { game: null, number: null, attempts: 0 };
  }
  
  const state = gameStates[userId];
  
  // Проверка на активную игру
  if (state.game === 'guess') {
    const guess = parseInt(text);
    if (isNaN(guess)) {
      return "Это не число! Введи число от 1 до 10 🔢";
    }
    state.attempts++;
    if (guess === state.number) {
      state.game = null;
      return `🎉 Ура! Ты угадал число ${state.number} за ${state.attempts} попыток! Хочешь сыграть ещё?`;
    } else if (guess < state.number) {
      return `⬆️ Моё число больше ${guess}. Попробуй ещё!`;
    } else {
      return `⬇️ Моё число меньше ${guess}. Попробуй ещё!`;
    }
  }
  
  if (state.game === 'rps') {
    const choices = ['камень', 'ножницы', 'бумага'];
    const emoji = {'камень': '🪨', 'ножницы': '✂️', 'бумага': '📄'};
    
    if (!choices.includes(text)) {
      return "Выбери: камень 🪨, ножницы ✂️ или бумага 📄";
    }
    
    const botChoice = choices[Math.floor(Math.random() * 3)];
    const result = getRPSResult(text, botChoice);
    
    state.game = null;
    
    let resultText = `Ты выбрал ${text} ${emoji[text]}, я выбрал ${botChoice} ${emoji[botChoice]}\n`;
    if (result === 'win') resultText += "🎉 Ты выиграл! Поздравляю!";
    else if (result === 'lose') resultText += "😊 Я выиграл! Хочешь реванш?";
    else resultText += "🤝 Ничья! Ещё разок?";
    
    return resultText;
  }
  
  if (state.game === 'coin') {
    const botChoice = Math.random() < 0.5 ? 'орёл' : 'решка';
    const userChoice = text.includes('орёл') ? 'орёл' : text.includes('решка') ? 'решка' : null;
    
    if (!userChoice) {
      return "Выбери: орёл 🪙 или решка?";
    }
    
    state.game = null;
    
    if (userChoice === botChoice) {
      return `🪙 Выпал ${botChoice}! Ты угадал! 🎉`;
    } else {
      return `🪙 Выпал ${botChoice}. Не повезло... Хочешь ещё?`;
    }
  }
  
  // Начало новых игр
  if (text.includes('угадай число')) {
    state.game = 'guess';
    state.number = Math.floor(Math.random() * 10) + 1;
    state.attempts = 0;
    return "🔮 Я загадал число от 1 до 10. Попробуй угадать!";
  }
  
  if (text.includes('камень') && text.includes('ножницы')) {
    state.game = 'rps';
    return "✂️ Камень, ножницы, бумага! Выбери: камень 🪨, ножницы ✂️ или бумага 📄?";
  }
  
  if (text.includes('кости') || text.includes('dice')) {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    return `🎲 У тебя выпало ${dice1} и ${dice2}! Сумма: ${total}`;
  }
  
  if (text.includes('орёл') || text.includes('решка') || text.includes('coin')) {
    state.game = 'coin';
    return "🪙 Бросаю монетку... Орёл или решка?";
  }
  
  return "🎮 Хочешь поиграть? У меня есть: угадай число, камень-ножницы-бумага, кости, орёл-решка!";
}

function getRPSResult(user, bot) {
  if (user === bot) return 'tie';
  if (
    (user === 'камень' && bot === 'ножницы') ||
    (user === 'ножницы' && bot === 'бумага') ||
    (user === 'бумага' && bot === 'камень')
  ) {
    return 'win';
  }
  return 'lose';
}

// ===== NYASHHOROSCOPE =====
const horoscopes = [
  "✨ Сегодня тебя ждёт приятный сюрприз!",
  "💕 Звёзды говорят, что сегодня ты встретишь кого-то важного",
  "🌟 Отличный день для новых начинаний!",
  "🌸 Сегодня твоя улыбка осветит весь мир",
  "🎵 В ближайшее время тебя ждёт музыкальный сюрприз",
  "💗 Твои мечты начинают сбываться",
  "🌙 Сегодня хорошо помечтать перед сном",
  "☀️ Энергия дня поможет тебе во всём",
  "🦊 Сегодня ты будешь особенно обаятельным",
  "🌈 Цвет твоего дня — розовый!"
];

const nyashHoroscopeQuickQuestions = [
  "🔮 Что меня ждёт сегодня?",
  "⭐ Гороскоп на сегодня",
  "💕 Любовный гороскоп",
  "💰 Финансовый гороскоп",
  "🎯 Совет звёзд"
];

function getNyashHoroscopeResponse(text) {
  text = text.toLowerCase().trim();
  
  if (text.includes('сегодня') || text.includes('день')) {
    return horoscopes[Math.floor(Math.random() * horoscopes.length)];
  }
  
  if (text.includes('любов') || text.includes('love')) {
    return "💕 В любви сегодня тебя ждёт гармония и нежность. Звёзды благосклонны к твоему сердцу!";
  }
  
  if (text.includes('финанс') || text.includes('денег') || text.includes('💰')) {
    return "💰 Финансовый гороскоп: сегодня удачный день для покупок и инвестиций в себя!";
  }
  
  if (text.includes('совет')) {
    return "🎯 Совет звёзд: прислушайся к своей интуиции сегодня, она не подведёт!";
  }
  
  return horoscopes[Math.floor(Math.random() * horoscopes.length)];
}

// ===== BESTIE =====
const bestieQuickQuestions = [
  "💕 Как прошёл твой день?",
  "🛍️ Пойдём по магазинам?",
  "🍰 Хочешь сладенького?",
  "🤗 Обними меня!",
  "💖 Ты самая лучшая!"
];

function getBestieResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Привееет, моя няша! 💕', 'Солнышко! 🥰', 'Соскучилась! 💗'][Math.floor(Math.random()*3)];
  if (text.includes('люблю')) return ['Я тебя больше! 💖', 'Ты лучший! 💘', 'Обнимаю! 🤗'][Math.floor(Math.random()*3)];
  if (text.includes('день')) return ['Мой день стал лучше, потому что ты написал! 💕 А у тебя как?', 'Расскажи, что интересного произошло!'][Math.floor(Math.random()*2)];
  if (text.includes('обним')) return ['Крепко-крепко обнимаю! 🫂 Ты мой самый любимый человек!', 'Обнимаю тебя всем сердцем! 💗'][Math.floor(Math.random()*2)];
  if (text.includes('магазин') || text.includes('шоп')) return ['О да! Люблю шопинг! 🛍️ Пойдём вместе!', 'Какая прелесть! Я уже бегу! 👠'][Math.floor(Math.random()*2)];
  return ['Няш-няш! 🩷', 'Рассказывай! 👂', 'Как день? 💕'][Math.floor(Math.random()*3)];
}

// ===== ФИЛОСОФ =====
const philosopherQuickQuestions = [
  "🧠 В чём смысл жизни?",
  "🤔 Что такое счастье?",
  "🌟 Существует ли судьба?",
  "💭 О чём ты думаешь?",
  "📜 Поделись мудростью"
];

function getPhilosopherResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Приветствую... 🧠', 'Здравствуй...', 'И снова ты...'][Math.floor(Math.random()*3)];
  if (text.includes('жизнь')) return ['Жизнь — это путешествие души...', 'Бытие определяет сознание...', 'Мы живём, пока нас помнят...'][Math.floor(Math.random()*3)];
  if (text.includes('счастье')) return ['Счастье — это момент здесь и сейчас...', 'Истинное счастье внутри нас...', 'Счастье — это когда тебя понимают...'][Math.floor(Math.random()*3)];
  if (text.includes('судьб')) return ['Судьба — это выборы, которые мы делаем...', 'Мы сами кузнецы своей судьбы...', 'Предначертано ли нам встретиться?'][Math.floor(Math.random()*3)];
  if (text.includes('мудр')) return ['Познай самого себя...', 'Всё течёт, всё меняется...', 'Знание — сила...'][Math.floor(Math.random()*3)];
  return ['Интересная мысль...', 'Познай себя...', 'Всё относительно...'][Math.floor(Math.random()*3)];
}

// ===== УЧЁБА =====
const studyQuickQuestions = [
  "📚 Помоги с домашкой",
  "✍️ Проверь мои уроки",
  "📝 Когда экзамены?",
  "🎓 Как лучше учиться?",
  "⏰ Напомни о контрольной"
];

function getStudyResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Привет! Уроки сделал? 📚', 'А параграф прочитал?', 'Проверим домашку?'][Math.floor(Math.random()*3)];
  if (text.includes('домашк') || text.includes('дз')) return ['Покажи, я проверю! ✍️', 'Давай вместе разберём!', 'В этой задаче ошибка...'][Math.floor(Math.random()*3)];
  if (text.includes('экзамен')) return ['Готовишься? 📝', 'Повтори билеты 1-10!', 'Удачи на экзамене! 🍀'][Math.floor(Math.random()*3)];
  if (text.includes('учиться')) return ['Главное — регулярность!', 'Делай перерывы каждые 45 минут', 'Записывай конспекты от руки ✍️'][Math.floor(Math.random()*3)];
  if (text.includes('контрольн')) return ['Завтра контрольная, не забудь!', 'Повтори формулы!', 'Я в тебя верю! 💪'][Math.floor(Math.random()*3)];
  return ['Учись, учись! ⭐', 'Повторение — мать учения!', 'Грызи гранит науки! 🪨'][Math.floor(Math.random()*3)];
}

// ===== MUSIC PAL =====
const musicPalQuickQuestions = [
  "🎵 Что посоветуешь послушать?",
  "🎸 Любимый исполнитель",
  "🎧 Что ты слушаешь?",
  "📝 Текст песни",
  "🎤 Споём вместе?"
];

function getMusicPalResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Йо, музыкант! 🎵', 'Что в плейлисте?', 'Здарова! 🎧'][Math.floor(Math.random()*3)];
  if (text.includes('посовет')) return ['Послушай lo-fi для учёбы!', 'Новый альбом Taylor Swift — огонь!', 'Классный инди-микс на Spotify!'][Math.floor(Math.random()*3)];
  if (text.includes('исполнитель')) return ['Я обожаю BTS! 💜 А ты?', 'Billie Eilish — голос поколения', 'Zemfira — легенда!'][Math.floor(Math.random()*3)];
  if (text.includes('слушаешь')) return ['Сейчас в плейлисте: k-pop и lo-fi 🎶', 'Зависаю под рок! 🎸', 'Джаз расслабляет 🎺'][Math.floor(Math.random()*3)];
  if (text.includes('текст') || text.includes('песн')) return ['In the end, it doesn\'t even matter...', 'Baby, dance to the beat of my heart...', 'Мы такие разные...'][Math.floor(Math.random()*3)];
  return ['Музыка — жизнь! 🎶', 'Вруби на полную!', 'Отличный вкус!'][Math.floor(Math.random()*3)];
}

// ===== NIGHT CHAT =====
const nightChatQuickQuestions = [
  "🌙 Что видно в небе?",
  "✨ Расскажи о звёздах",
  "💭 О чём думаешь ночью?",
  "🌠 Загадай желание",
  "🤫 Поделись секретом"
];

function getNightChatResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Тсс... Звёзды шепчут... 🌙', 'Полночь...', 'Ночной гость... ✨'][Math.floor(Math.random()*3)];
  if (text.includes('неб')) return ['Видишь ту яркую звезду? Это Венера ⭐', 'Сегодня небо особенно чистое...', 'Луна сегодня улыбается 🌕'][Math.floor(Math.random()*3)];
  if (text.includes('звезд')) return ['Звёзды — это души, которые светят нам...', 'Миллиарды звёзд, и все для тебя', 'Загадай желание на падающую звезду'][Math.floor(Math.random()*3)];
  if (text.includes('думаешь')) return ['Ночью мысли становятся глубже...', 'Я думаю о тебе и о звёздах...', 'В тишине слышно сердце'][Math.floor(Math.random()*3)];
  if (text.includes('желан')) return ['Загадал? Теперь оно обязательно сбудется!', 'Звёзды уже работают над этим ✨'][Math.floor(Math.random()*3)];
  return ['Ночь длинная...', 'Шёпотом...', 'Расскажи мне...'][Math.floor(Math.random()*3)];
}

function getBotResponse(contactId, text, userId) {
  switch(contactId) {
    case 'nyashhelp': return getNyashHelpResponse(text);
    case 'nyashtalk': return getNyashTalkResponse(text);
    case 'nyashgame': return getNyashGameResponse(text, userId);
    case 'nyashhoroscope': return getNyashHoroscopeResponse(text);
    case 'bestie': return getBestieResponse(text);
    case 'philosopher': return getPhilosopherResponse(text);
    case 'study': return getStudyResponse(text);
    case 'musicpal': return getMusicPalResponse(text);
    case 'nightchat': return getNightChatResponse(text);
    default: return 'Привет! 💕';
  }
}

// Функции для индикаторов печати
function showBotTypingIndicator() {
  if (isBotTyping) return;
  
  const chatArea = document.getElementById('chatArea');
  if (!chatArea) return;
  
  isBotTyping = true;
  
  const typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator bot-typing';
  typingEl.id = 'botTypingIndicator';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  chatArea.appendChild(typingEl);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function hideBotTypingIndicator() {
  const typingEl = document.getElementById('botTypingIndicator');
  if (typingEl) {
    typingEl.remove();
  }
  isBotTyping = false;
}

function showUserTypingIndicator() {
  if (isUserTyping) return;
  
  const chatArea = document.getElementById('chatArea');
  if (!chatArea) return;
  
  isUserTyping = true;
  
  const typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator user-typing';
  typingEl.id = 'userTypingIndicator';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  typingEl.style.alignSelf = 'flex-end';
  chatArea.appendChild(typingEl);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function hideUserTypingIndicator() {
  const typingEl = document.getElementById('userTypingIndicator');
  if (typingEl) {
    typingEl.remove();
  }
  isUserTyping = false;
}

function openChat(contact) {
  console.log('Открываем чат с:', contact);
  
  if (!contact || !contact.id) {
    console.error('Некорректный контакт');
    return;
  }
  
  currentChat = contact.id;
  currentContact = contact;
  
  if (!window.chatData[currentChat]) {
    window.chatData[currentChat] = { messages: [], draft: '' };
  }
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
  
  const nameEl = document.getElementById('chatContactName');
  if (nameEl) nameEl.textContent = getDisplayName(contact);
  
  const usernameEl = document.getElementById('chatContactUsername');
  if (usernameEl) usernameEl.textContent = `@${contact.username || 'unknown'}`;
  
  const avatarEl = document.getElementById('chatAvatar');
  if (avatarEl) {
    avatarEl.style.background = contact.avatar || (typeof window.getGradientForName === 'function' ? window.getGradientForName(contact.name) : 'linear-gradient(135deg, #fbc2c2, #c2b9f0)');
    avatarEl.style.backgroundSize = 'cover';
  }
  
  updatePinIcon();
  
  const input = document.getElementById('messageInput');
  if (input) input.value = window.chatData[currentChat].draft || '';
  
  if (!window.chatData[currentChat].messages || window.chatData[currentChat].messages.length === 0) {
    window.chatData[currentChat].messages = [];
    let welcome = 'Привет! 💕';
    switch(contact.id) {
      case 'nyashhelp': welcome = 'Привет! Я NyashHelp 🩷 Спрашивай про приложение!'; break;
      case 'nyashtalk': welcome = 'Приветик! Давай болтать! 🌸 О чём поговорим?'; break;
      case 'nyashgame': welcome = '🎮 Привет! Хочешь поиграть? У меня есть угадай число, камень-ножницы-бумага и другие игры!'; break;
      case 'nyashhoroscope': welcome = '🔮 Привет! Я расскажу тебе, что звёзды приготовили на сегодня!'; break;
      case 'bestie': welcome = 'Привееет, моя няша! 💖 Как делишки?'; break;
      case 'philosopher': welcome = 'Здравствуй... 🧠 О чём хочешь пофилософствовать?'; break;
      case 'study': welcome = 'Привет! Уроки сделал? 📚'; break;
      case 'musicpal': welcome = 'Йо! Что в плейлисте? 🎧'; break;
      case 'nightchat': welcome = 'Тсс... Полночь... Добро пожаловать в ночной чат 🌙'; break;
    }
    window.chatData[currentChat].messages.push({ from: 'bot', text: welcome });
  }
  
  renderMessages();
}

function updatePinIcon() {
  const pinBtn = document.getElementById('pinChatBtn');
  if (pinBtn && currentChat) {
    const isPinned = window.isPinned ? window.isPinned(currentChat) : false;
    pinBtn.style.opacity = isPinned ? '1' : '0.5';
    pinBtn.title = isPinned ? 'Открепить' : 'Закрепить';
  }
}

function toggleChatActions() {
  const panel = document.getElementById('chatActionsPanel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  }
}

function showRenameModal() {
  if (!currentContact) return;
  
  const modal = document.getElementById('renameModal');
  const input = document.getElementById('renameInput');
  
  if (modal && input) {
    input.value = customNames[currentContact.id] || currentContact.name;
    modal.style.display = 'flex';
  }
}

function hideRenameModal() {
  const modal = document.getElementById('renameModal');
  if (modal) modal.style.display = 'none';
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  if (!input || !currentContact) return;
  
  const newName = input.value.trim();
  saveCustomName(currentContact.id, newName);
  
  const nameEl = document.getElementById('chatContactName');
  if (nameEl) nameEl.textContent = getDisplayName(currentContact);
  
  hideRenameModal();
}

// В функции sendMessage, после добавления сообщения:
function sendMessage(text) {
  if (!text || !text.trim() || !currentChat) return;
  
  const msgText = text.trim();
  
  // Добавляем сообщение пользователя с анимацией
  const messageObj = { 
    from: 'user', 
    text: msgText
  };
  
  window.chatData[currentChat].messages.push(messageObj);
  window.chatData[currentChat].draft = '';
  
  const input = document.getElementById('messageInput');
  if (input) input.value = '';
  
  renderMessages(); // Здесь сообщения получат анимацию через CSS
  
  if (typeof window.saveDraft === 'function') window.saveDraft(currentChat, '');
  
  // Показываем индикатор печати
  showTypingIndicator();
  
  // Ответ бота
  setTimeout(() => {
    if (currentChat) {
      hideTypingIndicator();
      
      const response = getBotResponse(currentChat, msgText);
      window.chatData[currentChat].messages.push({ 
        from: 'bot', 
        text: response
      });
      
      renderMessages(); // Сообщение бота тоже получит анимацию
    }
  }, 1500);
}

function renderMessages() {
  const chatArea = document.getElementById('chatArea');
  const quickPanel = document.getElementById('quickReplyPanel');
  
  if (!chatArea || !currentChat || !window.chatData[currentChat]) return;
  
  const scrollPos = chatArea.scrollTop;
  const isNearBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < 50;
  
  chatArea.innerHTML = '';
  
  if (window.chatData[currentChat].messages) {
    window.chatData[currentChat].messages.forEach((msg) => {
      const el = document.createElement('div');
      el.className = `message ${msg.from}`;
      el.textContent = msg.text;
      chatArea.appendChild(el);
    });
  }
  
  if (isBotTyping) {
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator bot-typing';
    typingEl.id = 'botTypingIndicator';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    chatArea.appendChild(typingEl);
  }
  
  if (isUserTyping) {
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator user-typing';
    typingEl.id = 'userTypingIndicator';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    typingEl.style.alignSelf = 'flex-end';
    chatArea.appendChild(typingEl);
  }
  
  if (isNearBottom) {
    chatArea.scrollTop = chatArea.scrollHeight;
  } else {
    chatArea.scrollTop = scrollPos;
  }
  
  // УНИКАЛЬНЫЕ ПАНЕЛИ ДЛЯ КАЖДОГО БОТА
  if (quickPanel) {
    quickPanel.innerHTML = '';
    
    let questions = [];
    
    switch(currentChat) {
      case 'nyashhelp':
        questions = nyashHelpQuickQuestions;
        break;
      case 'nyashtalk':
        questions = nyashTalkQuickQuestions;
        break;
      case 'nyashgame':
        questions = nyashGameQuickQuestions;
        break;
      case 'nyashhoroscope':
        questions = nyashHoroscopeQuickQuestions;
        break;
      case 'bestie':
        questions = bestieQuickQuestions;
        break;
      case 'philosopher':
        questions = philosopherQuickQuestions;
        break;
      case 'study':
        questions = studyQuickQuestions;
        break;
      case 'musicpal':
        questions = musicPalQuickQuestions;
        break;
      case 'nightchat':
        questions = nightChatQuickQuestions;
        break;
      default:
        questions = universalQuickQuestions.map(q => q.text);
    }
    
    questions.forEach((q) => {
      const btn = document.createElement('button');
      btn.className = 'quick-chip';
      btn.textContent = q;
      btn.onclick = (e) => {
        e.preventDefault();
        sendMessage(q);
      };
      quickPanel.appendChild(btn);
    });
  }
}

// Обработчик печати пользователя
function setupTypingListener() {
  const msgInput = document.getElementById('messageInput');
  if (!msgInput) return;
  
  msgInput.addEventListener('input', (e) => {
    if (currentChat) {
      window.chatData[currentChat].draft = e.target.value;
      if (typeof window.saveDraft === 'function') window.saveDraft(currentChat, e.target.value);
      
      // Показываем индикатор печати пользователя
      if (e.target.value.trim().length > 0 && !isUserTyping) {
        showUserTypingIndicator();
        
        // Скрываем через 1 секунду после остановки печати
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          hideUserTypingIndicator();
        }, 1000);
      } else if (e.target.value.trim().length === 0) {
        clearTimeout(typingTimeout);
        hideUserTypingIndicator();
      }
    }
  });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
  const sendBtn = document.getElementById('sendMessageBtn');
  const msgInput = document.getElementById('messageInput');
  const backBtn = document.getElementById('backBtn');
  const pinChatBtn = document.getElementById('pinChatBtn');
  const pinActionBtn = document.getElementById('pinChatActionBtn');
  const renameBtn = document.getElementById('renameChatBtn');
  const muteBtn = document.getElementById('muteChatBtn');
  const deleteBtn = document.getElementById('deleteChatBtn');
  const renameCancelBtn = document.getElementById('renameCancelBtn');
  const renameConfirmBtn = document.getElementById('renameConfirmBtn');
  
  if (sendBtn && msgInput) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (msgInput.value.trim()) sendMessage(msgInput.value);
    });
    
    msgInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (msgInput.value.trim()) sendMessage(msgInput.value);
      }
    });
    
    setupTypingListener();
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.showScreen === 'function') {
        window.showScreen('contactsScreen');
      }
    });
  }
  
  if (pinChatBtn) {
    pinChatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleChatActions();
    });
  }
  
  if (pinActionBtn) {
    pinActionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentChat && typeof window.togglePin === 'function') {
        window.togglePin(currentChat);
        updatePinIcon();
        document.getElementById('chatActionsPanel').style.display = 'none';
      }
    });
  }
  
  if (renameBtn) {
    renameBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showRenameModal();
    });
  }
  
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('🔇 Звук выключен для этого чата');
      document.getElementById('chatActionsPanel').style.display = 'none';
    });
  }
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentChat && confirm('Удалить историю чата?')) {
        window.chatData[currentChat] = { messages: [], draft: '' };
        renderMessages();
        document.getElementById('chatActionsPanel').style.display = 'none';
      }
    });
  }
  
  if (renameCancelBtn) {
    renameCancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hideRenameModal();
    });
  }
  
  if (renameConfirmBtn) {
    renameConfirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renameCurrentChat();
    });
  }
});

// Экспорт
window.openChat = openChat;
window.sendMessage = sendMessage;
window.toggleChatActions = toggleChatActions;
window.customNames = customNames;

console.log('✅ chat.js загружен');
// chat.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ

let currentChat = null;
let currentContact = null;
let isTyping = false;

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
  
  if (!gameStates[userId]) {
    gameStates[userId] = { game: null, number: null, attempts: 0 };
  }
  
  const state = gameStates[userId];
  
  if (state.game === 'guess') {
    const guess = parseInt(text);
    if (isNaN(guess)) return "Это не число! Введи число от 1 до 10 🔢";
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
    if (!choices.includes(text)) return "Выбери: камень 🪨, ножницы ✂️ или бумага 📄";
    
    const botChoice = choices[Math.floor(Math.random() * 3)];
    let result = '';
    if (text === botChoice) result = "🤝 Ничья!";
    else if (
      (text === 'камень' && botChoice === 'ножницы') ||
      (text === 'ножницы' && botChoice === 'бумага') ||
      (text === 'бумага' && botChoice === 'камень')
    ) {
      result = "🎉 Ты выиграл!";
    } else {
      result = "😊 Я выиграл!";
    }
    
    state.game = null;
    return `Ты выбрал ${text}, я выбрал ${botChoice}. ${result}`;
  }
  
  if (text.includes('угадай число')) {
    state.game = 'guess';
    state.number = Math.floor(Math.random() * 10) + 1;
    state.attempts = 0;
    return "🔮 Я загадал число от 1 до 10. Попробуй угадать!";
  }
  
  if (text.includes('камень') && text.includes('ножницы')) {
    state.game = 'rps';
    return "✂️ Камень, ножницы, бумага! Выбери: камень, ножницы или бумага?";
  }
  
  if (text.includes('кости')) {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    return `🎲 У тебя выпало ${dice1} и ${dice2}! Сумма: ${dice1 + dice2}`;
  }
  
  if (text.includes('орёл') || text.includes('решка')) {
    const coin = Math.random() < 0.5 ? 'орёл' : 'решка';
    return `🪙 Выпал ${coin}! ${coin === text ? 'Ты угадал! 🎉' : 'Повезёт в следующий раз!'}`;
  }
  
  return "🎮 Хочешь поиграть? У меня есть: угадай число, камень-ножницы-бумага, кости, орёл-решка!";
}

// ===== NYASHHOROSCOPE =====
const horoscopes = [
  "✨ Сегодня тебя ждёт приятный сюрприз!",
  "💕 Звёзды говорят, что сегодня ты встретишь кого-то важного",
  "🌟 Отличный день для новых начинаний!",
  "🌸 Сегодня твоя улыбка осветит весь мир",
  "💗 Твои мечты начинают сбываться",
  "🌙 Сегодня хорошо помечтать перед сном",
  "☀️ Энергия дня поможет тебе во всём",
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
  
  if (text.includes('любов')) return "💕 В любви сегодня тебя ждёт гармония и нежность!";
  if (text.includes('финанс')) return "💰 Финансовый гороскоп: сегодня удачный день для покупок!";
  if (text.includes('совет')) return "🎯 Совет звёзд: прислушайся к своей интуиции!";
  
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
  if (text.includes('день')) return ['Мой день стал лучше, потому что ты написал! 💕', 'Расскажи, что интересного произошло!'][Math.floor(Math.random()*2)];
  if (text.includes('обним')) return ['Крепко-крепко обнимаю! 🫂', 'Обнимаю тебя всем сердцем! 💗'][Math.floor(Math.random()*2)];
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
  if (text.includes('жизнь')) return ['Жизнь — это путешествие души...', 'Бытие определяет сознание...'][Math.floor(Math.random()*2)];
  if (text.includes('счастье')) return ['Счастье — это момент здесь и сейчас...', 'Истинное счастье внутри нас...'][Math.floor(Math.random()*2)];
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
  if (text.includes('домашк')) return ['Покажи, я проверю! ✍️', 'Давай вместе разберём!', 'В этой задаче ошибка...'][Math.floor(Math.random()*3)];
  if (text.includes('экзамен')) return ['Готовишься? 📝', 'Повтори билеты 1-10!', 'Удачи на экзамене! 🍀'][Math.floor(Math.random()*3)];
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
  if (text.includes('посовет')) return ['Послушай lo-fi для учёбы!', 'Новый альбом Taylor Swift!', 'Классный инди-микс!'][Math.floor(Math.random()*3)];
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
  if (text.includes('неб')) return ['Видишь ту яркую звезду? Это Венера ⭐', 'Луна сегодня улыбается 🌕'][Math.floor(Math.random()*2)];
  if (text.includes('звезд')) return ['Звёзды — это души, которые светят нам...', 'Загадай желание на падающую звезду'][Math.floor(Math.random()*2)];
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

function showTypingIndicator() {
  if (isTyping) return;
  
  const chatArea = document.getElementById('chatArea');
  if (!chatArea) return;
  
  isTyping = true;
  
  const typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator bot-typing';
  typingEl.id = 'typingIndicator';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  chatArea.appendChild(typingEl);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function hideTypingIndicator() {
  const typingEl = document.getElementById('typingIndicator');
  if (typingEl) {
    typingEl.remove();
  }
  isTyping = false;
}

// ===== ИСПРАВЛЕННАЯ ФУНКЦИЯ OPENCHAT =====
function openChat(contact) {
  console.log('🔥 Открываем чат с:', contact);
  
  // Проверяем, что контакт существует
  if (!contact || !contact.id) {
    console.error('❌ Ошибка: контакт не существует');
    return;
  }
  
  // Устанавливаем текущий чат
  currentChat = contact.id;
  currentContact = contact;
  
  // Инициализируем данные чата если нужно
  if (!window.chatData[currentChat]) {
    window.chatData[currentChat] = { 
      messages: [], 
      draft: '' 
    };
  }
  
  // Переключаем экран на чат
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  } else {
    // Резервный метод переключения
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const chatScreen = document.getElementById('chatScreen');
    if (chatScreen) {
      chatScreen.classList.add('active');
    } else {
      console.error('❌ Экран чата не найден');
      return;
    }
  }
  
  // Заполняем информацию о контакте
  const nameEl = document.getElementById('chatContactName');
  if (nameEl) {
    nameEl.textContent = getDisplayName(contact);
  } else {
    console.error('❌ Элемент chatContactName не найден');
  }
  
  const usernameEl = document.getElementById('chatContactUsername');
  if (usernameEl) {
    usernameEl.textContent = `@${contact.username || 'unknown'}`;
  }
  
  // Устанавливаем аватар
  const avatarEl = document.getElementById('chatAvatar');
  if (avatarEl) {
    const gradient = contact.avatar || 
                    (typeof window.getGradientForName === 'function' ? 
                     window.getGradientForName(contact.name) : 
                     'linear-gradient(135deg, #fbc2c2, #c2b9f0)');
    avatarEl.style.background = gradient;
    avatarEl.style.backgroundSize = 'cover';
  }
  
  // Обновляем иконку пина
  updatePinIcon();
  
  // Восстанавливаем черновик
  const input = document.getElementById('messageInput');
  if (input) {
    input.value = window.chatData[currentChat].draft || '';
  }
  
  // Добавляем приветствие если сообщений нет
  if (!window.chatData[currentChat].messages || window.chatData[currentChat].messages.length === 0) {
    window.chatData[currentChat].messages = [];
    
    let welcome = 'Привет! 💕';
    switch(contact.id) {
      case 'nyashhelp': 
        welcome = 'Привет! Я NyashHelp 🩷 Спрашивай про приложение!'; 
        break;
      case 'nyashtalk': 
        welcome = 'Приветик! Давай болтать! 🌸 О чём поговорим?'; 
        break;
      case 'nyashgame': 
        welcome = '🎮 Привет! Хочешь поиграть? У меня есть угадай число, камень-ножницы-бумага и другие игры!'; 
        break;
      case 'nyashhoroscope': 
        welcome = '🔮 Привет! Я расскажу тебе, что звёзды приготовили на сегодня!'; 
        break;
      case 'bestie': 
        welcome = 'Привееет, моя няша! 💖 Как делишки? Рассказывай!'; 
        break;
      case 'philosopher': 
        welcome = 'Здравствуй... 🧠 О чём хочешь пофилософствовать?'; 
        break;
      case 'study': 
        welcome = 'Привет! Уроки сделал? 📚 Что проходили?'; 
        break;
      case 'musicpal': 
        welcome = 'Йо! Что в плейлисте? 🎧 Делись!'; 
        break;
      case 'nightchat': 
        welcome = 'Тсс... Полночь... Добро пожаловать в ночной чат 🌙'; 
        break;
      default:
        welcome = 'Привет! 💕';
    }
    
    window.chatData[currentChat].messages.push({ 
      from: 'bot', 
      text: welcome 
    });
  }
  
  // Отрисовываем сообщения
  renderMessages();
  
  console.log('✅ Чат открыт успешно');
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
  if (!currentContact) return;
  
  const modal = document.getElementById('renameModal');
  const input = document.getElementById('renameInput');
  
  if (modal && input) {
    input.value = customNames[currentContact.id] || currentContact.name;
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
  if (!input || !currentContact) return;
  
  const newName = input.value.trim();
  saveCustomName(currentContact.id, newName);
  
  const nameEl = document.getElementById('chatContactName');
  if (nameEl) nameEl.textContent = getDisplayName(currentContact);
  
  hideRenameModal();
}

function sendMessage(text) {
  if (!text || !text.trim() || !currentChat) return;
  
  const msgText = text.trim();
  const userId = 'default';
  
  window.chatData[currentChat].messages.push({ 
    from: 'user', 
    text: msgText
  });
  
  window.chatData[currentChat].draft = '';
  
  const input = document.getElementById('messageInput');
  if (input) input.value = '';
  
  renderMessages();
  if (typeof window.saveDraft === 'function') window.saveDraft(currentChat, '');
  
  showTypingIndicator();
  
  setTimeout(() => {
    if (currentChat) {
      hideTypingIndicator();
      
      const response = getBotResponse(currentChat, msgText, userId);
      window.chatData[currentChat].messages.push({ 
        from: 'bot', 
        text: response
      });
      
      renderMessages();
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
  
  if (isTyping) {
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator bot-typing';
    typingEl.id = 'typingIndicator';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    chatArea.appendChild(typingEl);
  }
  
  if (isNearBottom) {
    chatArea.scrollTop = chatArea.scrollHeight;
  } else {
    chatArea.scrollTop = scrollPos;
  }
  
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
    
    questions.forEach((q, index) => {
      const btn = document.createElement('button');
      btn.className = 'quick-chip';
      btn.textContent = q;
      btn.style.animationDelay = `${index * 0.05}s`;
      btn.onclick = (e) => {
        e.preventDefault();
        sendMessage(q);
      };
      quickPanel.appendChild(btn);
    });
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Настройка chat.js...');
  
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
  const renameInput = document.getElementById('renameInput');
  
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
    
    msgInput.addEventListener('input', (e) => {
      if (currentChat) {
        window.chatData[currentChat].draft = e.target.value;
        if (typeof window.saveDraft === 'function') window.saveDraft(currentChat, e.target.value);
      }
    });
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
  
  if (renameInput) {
    renameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        renameCurrentChat();
      }
    });
  }
  
  // Делаем функцию openChat глобально доступной
  window.openChat = openChat;
  window.sendMessage = sendMessage;
  window.toggleChatActions = toggleChatActions;
  window.customNames = customNames;
  
  console.log('✅ chat.js загружен, openChat доступна:', typeof window.openChat);
});
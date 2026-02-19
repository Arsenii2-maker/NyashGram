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
  
  // Обновляем отображение в списке контактов
  if (typeof window.renderContacts === 'function') {
    window.renderContacts();
  }
}

function getDisplayName(contact) {
  if (!contact) return '';
  return customNames[contact.id] || contact.name;
}

// ===== УНИВЕРСАЛЬНЫЕ БЫСТРЫЕ ВОПРОСЫ ДЛЯ ВСЕХ ЧАТОВ =====
const universalQuickQuestions = [
  { text: "Как дела? 💕", keywords: ["дела", "как ты"] },
  { text: "Чем занят? 🌸", keywords: ["чем", "занят", "делаешь"] },
  { text: "Расскажи о себе ✨", keywords: ["себе", "расскажи"] },
  { text: "Что нового? 🌟", keywords: ["нового", "новости"] },
  { text: "Как настроение? 💗", keywords: ["настроение"] },
  { text: "Планы на вечер? 🌙", keywords: ["вечер", "планы"] },
  { text: "Любимая еда? 🍰", keywords: ["еда", "кушать"] },
  { text: "Посоветуй фильм 🎬", keywords: ["фильм", "кино"] },
  { text: "Что послушать? 🎧", keywords: ["музыка", "песня"] },
  { text: "Спроси меня о чём-нибудь 💭", keywords: ["спроси", "вопрос"] }
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
  if (text.includes('бот')) return 'У нас NyashHelp, NyashTalk и 5 друзей: Bestie, Философ, Учёба, Music Pal, Night Chat! 🎭';
  return 'Спроси про темы, шрифты, аватарки или ботов! 🩷';
}

// ===== NYASHTALK =====
const nyashTalkTopics = {
  погода: {
    keywords: ['погод', 'дожд', 'солнц', 'ветер', 'снег', 'град', 'тепл', 'холод'],
    responses: [
      { text: "Ой, сегодня такое солнышко за окном! ☀️ А у тебя какая погода?", mood: "happy" },
      { text: "Дождик моросит... так уютно сидеть дома с чашечкой какао ☕ А ты любишь дождь?", mood: "cozy" },
      { text: "Снежок выпал! ❄️ Можно лепить снеговиков или пить горячий шоколад. Что выберешь?", mood: "excited" },
      { text: "Ветер сильный сегодня... Хорошо, что мы в тёплом чатике болтаем 💕", mood: "cozy" }
    ]
  },
  настроение: {
    keywords: ['настроен', 'груст', 'весел', 'счастл', 'радос', 'скучн'],
    responses: [
      { text: "Ой, а у меня сегодня игривое настроение! 🎵 А как у тебя?", mood: "playful" },
      { text: "Если грустно — я всегда рядом, чтобы поднять настроение! 🫂 Рассказывай", mood: "caring" },
      { text: "Счастлива, что ты здесь! Это уже делает день лучше 💗", mood: "happy" }
    ]
  },
  котики: {
    keywords: ['кот', 'кошк', 'мяу', 'котик', 'котён', 'мур'],
    responses: [
      { text: "Мяу-мяу! 🐱 Представляешь пушистого котика? Уютно~", mood: "cute" },
      { text: "Котики — это 90% милоты и 10% хулиганства! 😸 У тебя есть питомец?", mood: "playful" },
      { text: "Муррр... Я как котик, только виртуальный! 🐾", mood: "cute" }
    ]
  },
  еда: {
    keywords: ['ед', 'пицц', 'сладк', 'вкусн', 'куша', 'голод'],
    responses: [
      { text: "Ммм, я обожаю клубничный торт! 🍓 А у тебя есть любимый десерт?", mood: "excited" },
      { text: "Пицца — это всегда хорошая идея! 🍕 С какой начинкой любишь?", mood: "playful" },
      { text: "Сейчас бы горячего какао с зефирками... ☕", mood: "cozy" }
    ]
  },
  сны: {
    keywords: ['сон', 'спал', 'снил', 'ноч', 'просну'],
    responses: [
      { text: "Ой, мне сегодня снилось, что я летала по небу! ☁️ А тебе что снилось?", mood: "dreamy" },
      { text: "Сны — это маленькие приключения во сне ✨", mood: "curious" },
      { text: "Иногда сны такие яркие, что не хочется просыпаться... Бывает?", mood: "dreamy" }
    ]
  },
  фильмы: {
    keywords: ['фильм', 'кино', 'сериал', 'аниме', 'мульт', 'посмотр'],
    responses: [
      { text: "Обожаю милые аниме про любовь! 💕 Твой любимый жанр?", mood: "excited" },
      { text: "Недавно смотрела 'Твоё имя' — это шедевр! 🎬 Видел?", mood: "enthusiastic" },
      { text: "Сериалы — это искусство 📺 Что сейчас смотришь?", mood: "curious" }
    ]
  },
  музыка: {
    keywords: ['музык', 'песн', 'трек', 'плейлист', 'слуша'],
    responses: [
      { text: "Сейчас в моём плейлисте: lo-fi и k-pop! 🎶 А у тебя?", mood: "energetic" },
      { text: "Музыка — это магия, которая лечит душу ✨", mood: "dreamy" },
      { text: "🎵 Напеваешь что-то? Я подпою! 🎤", mood: "playful" }
    ]
  },
  хобби: {
    keywords: ['хобби', 'увлека', 'рис', 'фот', 'танц', 'спорт'],
    responses: [
      { text: "Ого, у тебя есть хобби? Расскажи! ✨", mood: "curious" },
      { text: "Рисовать — это так круто! 🎨", mood: "impressed" },
      { text: "Спорт — это здорово! 💪 Я болею за тебя!", mood: "encouraging" }
    ]
  },
  путешествия: {
    keywords: ['путешеств', 'поех', 'стра', 'город', 'море', 'гор'],
    responses: [
      { text: "Мечтаю побывать в Японии весной! 🇯🇵 А ты?", mood: "dreamy" },
      { text: "Море, горы или большой город? Что выбираешь? 🏖️", mood: "curious" },
      { text: "Путешествия — это лучшие воспоминания ✈️", mood: "excited" }
    ]
  },
  default: {
    responses: [
      { text: "Хмм, расскажи подробнее! Мне очень интересно 💕", mood: "curious" },
      { text: "Ой, а я как раз об этом думала! Продолжай 👂", mood: "attentive" },
      { text: "Это так мило! А что ещё? 🥰", mood: "excited" },
      { text: "Правда? Расскажешь побольше? ✨", mood: "impressed" }
    ]
  }
};

function getNyashTalkResponse(text) {
  text = text.toLowerCase().trim();
  
  if (text.includes('привет') || text.includes('хай')) {
    return "Приветик! 🩷 Давай поболтаем о чём-нибудь?";
  }
  
  for (const [topic, data] of Object.entries(nyashTalkTopics)) {
    if (topic === 'default') continue;
    
    if (data.keywords.some(keyword => text.includes(keyword))) {
      const responses = data.responses;
      return responses[Math.floor(Math.random() * responses.length)].text;
    }
  }
  
  const defaultResponses = nyashTalkTopics.default.responses;
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)].text;
}

// ===== BESTIE =====
function getBestieResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Привееет, моя няша! 💕', 'Солнышко! 🥰', 'Соскучилась! 💗'][Math.floor(Math.random()*3)];
  if (text.includes('люблю')) return ['Я тебя больше! 💖', 'Ты лучший! 💘', 'Обнимаю! 🤗'][Math.floor(Math.random()*3)];
  if (text.includes('грустн')) return ['Всё будет хорошо, я рядом! 💪', 'Держись! 🌸', 'Обнимаю! 🫂'][Math.floor(Math.random()*3)];
  if (text.includes('дела') || text.includes('как ты')) return ['У меня всё супер, а у тебя? 💕', 'Отлично! Рассказывай о себе!', 'Счастлива, что ты спросил! ✨'][Math.floor(Math.random()*3)];
  return ['Няш-няш! 🩷', 'Рассказывай! 👂', 'Как день? 💕'][Math.floor(Math.random()*3)];
}

// ===== ФИЛОСОФ =====
function getPhilosopherResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Приветствую... 🧠', 'Здравствуй...', 'И снова ты...'][Math.floor(Math.random()*3)];
  if (text.includes('жизнь')) return ['Жизнь — это байты...', 'А что есть жизнь?', 'Бытие...'][Math.floor(Math.random()*3)];
  if (text.includes('дела')) return ['Бытие определяет сознание... А как твои дела?', 'Вопрос бытия... У меня всё философски 🤔'][Math.floor(Math.random()*3)];
  return ['Интересная мысль...', 'Познай себя...', 'Всё относительно...'][Math.floor(Math.random()*3)];
}

// ===== УЧЁБА =====
function getStudyResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Привет! Уроки сделал? 📚', 'А параграф прочитал?', 'Проверим домашку?'][Math.floor(Math.random()*3)];
  if (text.includes('домашк')) return ['Покажи, я проверю! ✍️', 'Опять не сделал?', 'Давай вместе!'][Math.floor(Math.random()*3)];
  if (text.includes('дела')) return ['Учёба — это свет! А у тебя как успехи? 📖', 'Всё отлично, готовлюсь к экзаменам! А ты?'][Math.floor(Math.random()*3)];
  return ['Учись, учись! ⭐', 'Повторение — мать учения!', 'Грызи гранит науки! 🪨'][Math.floor(Math.random()*3)];
}

// ===== MUSIC PAL =====
function getMusicPalResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Йо, музыкант! 🎵', 'Что в плейлисте?', 'Здарова! 🎧'][Math.floor(Math.random()*3)];
  if (text.includes('посовет')) return ['Послушай lo-fi!', 'Новый трек Taylor Swift!', 'Классный инди-микс!'][Math.floor(Math.random()*3)];
  if (text.includes('дела')) return ['В ритме музыки! 🎶 А у тебя как настроение?', 'Играет новый альбом, кайф! А ты что слушаешь?'][Math.floor(Math.random()*3)];
  return ['Музыка — жизнь! 🎶', 'Вруби на полную!', 'Отличный вкус!'][Math.floor(Math.random()*3)];
}

// ===== NIGHT CHAT =====
function getNightChatResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Тсс... Звёзды шепчут... 🌙', 'Полночь...', 'Ночной гость... ✨'][Math.floor(Math.random()*3)];
  if (text.includes('сон')) return ['Что снилось? 🌠', 'Сны — порталы...', 'Цветные сны?'][Math.floor(Math.random()*3)];
  if (text.includes('дела')) return ['В ночной тишине всё иначе... А у тебя как? 🌙', 'Звёзды шепчут, что у тебя всё хорошо... Это правда?'][Math.floor(Math.random()*3)];
  return ['Ночь длинная...', 'Шёпотом...', 'Расскажи мне...'][Math.floor(Math.random()*3)];
}

function getBotResponse(contactId, text) {
  switch(contactId) {
    case 'nyashhelp': return getNyashHelpResponse(text);
    case 'nyashtalk': return getNyashTalkResponse(text);
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
  typingEl.className = 'typing-indicator';
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
      case 'bestie': welcome = 'Привееет, моя няша! 💖 Как делишки? Рассказывай!'; break;
      case 'philosopher': welcome = 'Здравствуй... 🧠 О чём хочешь пофилософствовать сегодня?'; break;
      case 'study': welcome = 'Привет! Уроки сделал? 📚 Что проходили?'; break;
      case 'musicpal': welcome = 'Йо! Что в плейлисте сегодня? 🎧 Делись!'; break;
      case 'nightchat': welcome = 'Тсс... Полночь... Добро пожаловать в ночной чат 🌙 Звёзды сегодня особенно яркие...'; break;
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

function sendMessage(text) {
  if (!text || !text.trim() || !currentChat) return;
  
  const msgText = text.trim();
  
  window.chatData[currentChat].messages.push({ 
    from: 'user', 
    text: msgText
  });
  
  window.chatData[currentChat].draft = '';
  
  const input = document.getElementById('messageInput');
  if (input) input.value = '';
  
  renderMessages();
  if (typeof window.saveDraft === 'function') window.saveDraft(currentChat, '');
  
  // Показываем индикатор печати
  showTypingIndicator();
  
  // Ответ бота с задержкой
  setTimeout(() => {
    if (currentChat) {
      hideTypingIndicator();
      
      const response = getBotResponse(currentChat, msgText);
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
    typingEl.className = 'typing-indicator';
    typingEl.id = 'typingIndicator';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    chatArea.appendChild(typingEl);
  }
  
  if (isNearBottom) {
    chatArea.scrollTop = chatArea.scrollHeight;
  } else {
    chatArea.scrollTop = scrollPos;
  }
  
  // УНИВЕРСАЛЬНАЯ ПАНЕЛЬ БЫСТРЫХ ОТВЕТОВ ДЛЯ ВСЕХ ЧАТОВ
  if (quickPanel) {
    quickPanel.innerHTML = '';
    
    // Для NyashHelp - специальные вопросы
    if (currentChat === 'nyashhelp') {
      nyashHelpQuickQuestions.forEach((q) => {
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
    // Для всех остальных чатов - универсальные вопросы
    else {
      // Показываем первые 6 универсальных вопросов
      universalQuickQuestions.slice(0, 6).forEach((item) => {
        const btn = document.createElement('button');
        btn.className = 'quick-chip';
        btn.textContent = item.text;
        btn.onclick = (e) => {
          e.preventDefault();
          sendMessage(item.text);
        };
        quickPanel.appendChild(btn);
      });
    }
  }
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
});

// Экспорт
window.openChat = openChat;
window.sendMessage = sendMessage;
window.toggleChatActions = toggleChatActions;
window.customNames = customNames;

console.log('✅ chat.js загружен');
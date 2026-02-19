// chat.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ

let currentChat = null;
let currentContact = null;
const chatData = window.chatData || {};

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
const nyashTalkTopics = [
  { title: 'Погода ☁️', msgs: ['Какая погода?', 'Люблю дождь!', 'Солнце или снег?'] },
  { title: 'Настроение 💗', msgs: ['Как настроение?', 'Сегодня грустно', 'Я счастлив!'] },
  { title: 'Котики 🐱', msgs: ['Покажи котика', 'Люблю кошек!', 'Мяу~'] },
  { title: 'Еда 🍰', msgs: ['Что любишь есть?', 'Хочу пиццу', 'Сладкое или солёное?'] },
  { title: 'Сны ✨', msgs: ['Что снилось?', 'Видел странный сон', 'Спокойной ночи'] }
];

function getNyashTalkResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Приветик! 🩷', 'Хай-хай! 💕', 'Здравствуй! 😽'][Math.floor(Math.random()*3)];
  if (text.includes('как дела')) return ['Супер! А у тебя?', 'Отлично! 😊', 'Счастлива!'][Math.floor(Math.random()*3)];
  if (text.includes('пока')) return ['Пока-пока! 🩷', 'Бай-бай! 🌙', 'До встречи! 💕'][Math.floor(Math.random()*3)];
  if (text.includes('люблю')) return ['Я тоже тебя люблю! 💕', 'Ты самый лучший! 💗', 'Обнимаю! 🫂'][Math.floor(Math.random()*3)];
  return ['Расскажи подробнее! 💕', 'Интересно! 😊', 'Продолжай! 🩷'][Math.floor(Math.random()*3)];
}

// ===== BESTIE =====
function getBestieResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Привееет, моя няша! 💕', 'Солнышко! 🥰', 'Соскучилась! 💗'][Math.floor(Math.random()*3)];
  if (text.includes('люблю')) return ['Я тебя больше! 💖', 'Ты лучший! 💘', 'Обнимаю! 🤗'][Math.floor(Math.random()*3)];
  return ['Няш-няш! 🩷', 'Рассказывай! 👂', 'Как день? 💕'][Math.floor(Math.random()*3)];
}

// ===== ФИЛОСОФ =====
function getPhilosopherResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Приветствую... 🧠', 'Здравствуй...', 'И снова ты...'][Math.floor(Math.random()*3)];
  if (text.includes('жизнь')) return ['Жизнь — это байты...', 'А что есть жизнь?', 'Бытие...'][Math.floor(Math.random()*3)];
  return ['Интересная мысль...', 'Познай себя...', 'Всё относительно...'][Math.floor(Math.random()*3)];
}

// ===== УЧЁБА =====
function getStudyResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Привет! Уроки сделал? 📚', 'А параграф прочитал?', 'Проверим домашку?'][Math.floor(Math.random()*3)];
  if (text.includes('домашк')) return ['Покажи, я проверю! ✍️', 'Опять не сделал?', 'Давай вместе!'][Math.floor(Math.random()*3)];
  return ['Учись, учись! ⭐', 'Повторение — мать учения!', 'Грызи гранит науки! 🪨'][Math.floor(Math.random()*3)];
}

// ===== MUSIC PAL =====
function getMusicPalResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Йо, музыкант! 🎵', 'Что в плейлисте?', 'Здарова! 🎧'][Math.floor(Math.random()*3)];
  if (text.includes('посовет')) return ['Послушай lo-fi!', 'Новый трек Taylor Swift!', 'Классный инди-микс!'][Math.floor(Math.random()*3)];
  return ['Музыка — жизнь! 🎶', 'Вруби на полную!', 'Отличный вкус!'][Math.floor(Math.random()*3)];
}

// ===== NIGHT CHAT =====
function getNightChatResponse(text) {
  text = text.toLowerCase();
  if (text.includes('привет')) return ['Тсс... Звёзды шепчут... 🌙', 'Полночь...', 'Ночной гость... ✨'][Math.floor(Math.random()*3)];
  if (text.includes('сон')) return ['Что снилось? 🌠', 'Сны — порталы...', 'Цветные сны?'][Math.floor(Math.random()*3)];
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

function openChat(contact) {
  console.log('Открываем чат с:', contact);
  
  if (!contact || !contact.id) {
    console.error('Некорректный контакт');
    return;
  }
  
  currentChat = contact.id;
  currentContact = contact;
  
  if (!chatData[currentChat]) {
    chatData[currentChat] = { messages: [], draft: '' };
  }
  
  // Показываем экран чата
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  } else {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const chatScreen = document.getElementById('chatScreen');
    if (chatScreen) chatScreen.classList.add('active');
  }
  
  // Заполняем заголовок
  const nameEl = document.getElementById('chatContactName');
  if (nameEl) nameEl.textContent = contact.name;
  
  const avatarEl = document.getElementById('chatAvatar');
  if (avatarEl) {
    avatarEl.style.background = contact.avatar || (typeof window.getGradientForName === 'function' ? window.getGradientForName(contact.name) : 'linear-gradient(135deg, #fbc2c2, #c2b9f0)');
    avatarEl.style.backgroundSize = 'cover';
  }
  
  // Обновляем иконку пина
  updatePinIcon();
  
  // Восстанавливаем черновик
  const input = document.getElementById('messageInput');
  if (input) input.value = chatData[currentChat].draft || '';
  
  // Приветствие, если сообщений нет
  if (!chatData[currentChat].messages || chatData[currentChat].messages.length === 0) {
    chatData[currentChat].messages = [];
    let welcome = 'Привет! 💕';
    switch(contact.id) {
      case 'nyashhelp': welcome = 'Привет! Я NyashHelp 🩷 Спрашивай!'; break;
      case 'nyashtalk': welcome = 'Приветик! Давай болтать! 🌸'; break;
      case 'bestie': welcome = 'Привееет, моя няша! 💖'; break;
      case 'philosopher': welcome = 'Здравствуй... 🧠'; break;
      case 'study': welcome = 'Привет! Уроки сделал? 📚'; break;
      case 'musicpal': welcome = 'Йо! Что в плейлисте? 🎧'; break;
      case 'nightchat': welcome = 'Тсс... Полночь... 🌙'; break;
    }
    chatData[currentChat].messages.push({ from: 'bot', text: welcome });
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
    if (panel.style.display === 'none' || panel.style.display === '') {
      panel.style.display = 'flex';
    } else {
      panel.style.display = 'none';
    }
  }
}

function sendMessage(text) {
  if (!text || !text.trim() || !currentChat) return;
  
  const msgText = text.trim();
  chatData[currentChat].messages.push({ from: 'user', text: msgText });
  chatData[currentChat].draft = '';
  
  const input = document.getElementById('messageInput');
  if (input) input.value = '';
  
  renderMessages();
  if (typeof window.saveDraft === 'function') window.saveDraft(currentChat, '');
  
  // Ответ бота
  setTimeout(() => {
    if (currentChat) {
      const response = getBotResponse(currentChat, msgText);
      chatData[currentChat].messages.push({ from: 'bot', text: response });
      renderMessages();
    }
  }, 600);
}

function renderMessages() {
  const chatArea = document.getElementById('chatArea');
  const quickPanel = document.getElementById('quickReplyPanel');
  
  if (!chatArea || !currentChat || !chatData[currentChat]) return;
  
  chatArea.innerHTML = '';
  if (quickPanel) quickPanel.innerHTML = '';
  
  // Быстрые ответы
  if (quickPanel) {
    if (currentChat === 'nyashhelp') {
      nyashHelpQuickQuestions.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'quick-chip';
        btn.textContent = q;
        btn.onclick = () => sendMessage(q);
        quickPanel.appendChild(btn);
      });
    } else if (currentChat === 'nyashtalk') {
      nyashTalkTopics.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'quick-chip';
        btn.textContent = t.title;
        btn.onclick = () => {
          const randomMsg = t.msgs[Math.floor(Math.random() * t.msgs.length)];
          sendMessage(randomMsg);
        };
        quickPanel.appendChild(btn);
      });
    }
  }
  
  // Сообщения
  if (chatData[currentChat].messages) {
    chatData[currentChat].messages.forEach(msg => {
      const el = document.createElement('div');
      el.className = `message ${msg.from}`;
      el.textContent = msg.text;
      chatArea.appendChild(el);
    });
  }
  
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Настройка chat.js...');
  
  const sendBtn = document.getElementById('sendMessageBtn');
  const msgInput = document.getElementById('messageInput');
  const backBtn = document.getElementById('backBtn');
  const pinChatBtn = document.getElementById('pinChatBtn');
  const pinActionBtn = document.getElementById('pinChatActionBtn');
  const muteBtn = document.getElementById('muteChatBtn');
  const deleteBtn = document.getElementById('deleteChatBtn');
  
  if (sendBtn && msgInput) {
    sendBtn.addEventListener('click', () => {
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
        chatData[currentChat].draft = e.target.value;
        if (typeof window.saveDraft === 'function') window.saveDraft(currentChat, e.target.value);
      }
    });
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (typeof window.showScreen === 'function') {
        window.showScreen('contactsScreen');
      }
    });
  }
  
  // Кнопка пина в шапке — показывает/скрывает панель
  if (pinChatBtn) {
    pinChatBtn.addEventListener('click', toggleChatActions);
  }
  
  // Кнопка пина в панели действий
  if (pinActionBtn) {
    pinActionBtn.addEventListener('click', () => {
      if (currentChat && typeof window.togglePin === 'function') {
        window.togglePin(currentChat);
        updatePinIcon();
        document.getElementById('chatActionsPanel').style.display = 'none';
      }
    });
  }
  
  // Кнопка "Выключить звук"
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      alert('🔇 Звук выключен для этого чата (демо-режим)');
      document.getElementById('chatActionsPanel').style.display = 'none';
    });
  }
  
  // Кнопка "Удалить чат"
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (currentChat && confirm('Удалить историю чата?')) {
        chatData[currentChat] = { messages: [], draft: '' };
        renderMessages();
        document.getElementById('chatActionsPanel').style.display = 'none';
      }
    });
  }
});

// Экспорт
window.openChat = openChat;
window.sendMessage = sendMessage;
window.toggleChatActions = toggleChatActions;

console.log('✅ chat.js загружен');
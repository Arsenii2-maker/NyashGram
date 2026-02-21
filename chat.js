// chat.js — РАБОЧАЯ ВЕРСИЯ

let currentChat = null;
let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '{}');
let chatDrafts = JSON.parse(localStorage.getItem('chatDrafts') || '{}');

// ===== БОТЫ =====
const bots = {
  nyashhelp: {
    name: 'NyashHelp',
    username: 'nyashhelp',
    avatar: '💗',
    questions: [
      'как сменить тему?',
      'как поменять шрифт?',
      'кто такие боты?',
      'как добавить друга?'
    ],
    answers: {
      'тема': 'у нас 6 тем! зайди в настройки и выбери любимую 💕',
      'шрифт': '6 шрифтов: system, rounded, cozy, elegant, bold, mono ✨',
      'бот': 'я nyashhelp, а ещё есть nyashtalk, nyashgame, nyashhoroscope 🎮',
      'друг': 'ищи друзей по юзернейму в разделе 👥 друзья',
      'default': 'спроси про темы, шрифты или друзей!'
    }
  },
  nyashtalk: {
    name: 'NyashTalk',
    username: 'nyashtalk',
    avatar: '🌸',
    questions: [
      'как дела?',
      'что нового?',
      'любишь котиков?',
      'расскажи секрет'
    ],
    answers: {
      'привет': ['приветик! 💕', 'хай-хай! 🥰', 'здравствуй! ✨'],
      'дела': ['всё отлично! а у тебя?', 'муррр... хорошо!', 'счастлива, что ты спросил! 💗'],
      'кот': ['мяу! 🐱 обожаю котиков!', 'котики - это милота!', 'мур-мур 😸'],
      'секрет': ['🤫 я тоже люблю сладкое!', 'секретик: сегодня будет хороший день ✨'],
      'default': ['расскажи подробнее! 👂', 'ой, интересно! 😊', 'правда? продолжай! 💕']
    }
  },
  nyashgame: {
    name: 'NyashGame',
    username: 'nyashgame',
    avatar: '🎮',
    questions: [
      'сыграем?',
      'угадай число',
      'камень-ножницы',
      'кости'
    ],
    answers: {
      'игра': 'давай! угадай число от 1 до 10 🔢',
      'число': 'я загадала число, попробуй угадать!',
      'камень': 'камень-ножницы-бумага? выбирай! ✂️',
      'кости': '🎲 бросаю... ' + (Math.floor(Math.random()*6)+1),
      'default': 'хочешь поиграть? у меня много игр! 🎮'
    }
  },
  nyashhoroscope: {
    name: 'NyashHoroscope',
    username: 'nyashhoroscope',
    avatar: '🔮',
    questions: [
      'что сегодня?',
      'любовь',
      'деньги',
      'совет'
    ],
    answers: {
      'сегодня': ['сегодня отличный день! ✨', 'звёзды говорят - улыбайся! ☀️', 'ждут приятные сюрпризы! 💝'],
      'любовь': ['в любви сегодня гармония! 💕', 'ты очень обаятелен! ✨', 'сердце открыто для нового! 💗'],
      'деньги': ['финансовый день! 💰', 'удачно для покупок! 🛍️', 'копилка радуется! 🏦'],
      'совет': ['прислушайся к интуиции! 🎯', 'больше улыбайся! 😊', 'сегодня твой день! ⭐'],
      'default': 'хочешь узнать, что звёзды приготовили? ✨'
    }
  }
};

// ===== ОТКРЫТИЕ ЧАТА =====
function openChat(contact) {
  currentChat = contact.id;
  
  document.getElementById('chatContactName').textContent = contact.name;
  document.getElementById('chatContactUsername').textContent = `@${contact.username}`;
  
  // Загружаем историю
  loadChatHistory(contact.id);
  
  // Показываем быстрые вопросы
  showQuickQuestions(contact.id);
  
  showScreen('chatScreen');
}

function openBotChat(botId) {
  const bot = bots[botId];
  currentChat = botId;
  
  document.getElementById('chatContactName').textContent = bot.name;
  document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
  
  loadChatHistory(botId);
  showQuickQuestions(botId);
  
  // Приветствие если нет истории
  if (!chatHistory[botId]?.length) {
    addMessage('bot', `привет! я ${bot.name} ✨`);
  }
  
  showScreen('chatScreen');
}

// ===== ИСТОРИЯ =====
function loadChatHistory(chatId) {
  const area = document.getElementById('chatArea');
  area.innerHTML = '';
  
  if (chatHistory[chatId]) {
    chatHistory[chatId].forEach(msg => {
      addMessage(msg.type, msg.text, false);
    });
  }
}

function saveMessage(chatId, type, text) {
  if (!chatHistory[chatId]) chatHistory[chatId] = [];
  chatHistory[chatId].push({ type, text, time: Date.now() });
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// ===== ЧЕРНОВИКИ =====
function loadDraft(chatId) {
  document.getElementById('messageInput').value = chatDrafts[chatId] || '';
}

function saveDraft(chatId, text) {
  if (text) {
    chatDrafts[chatId] = text;
  } else {
    delete chatDrafts[chatId];
  }
  localStorage.setItem('chatDrafts', JSON.stringify(chatDrafts));
}

// ===== СООБЩЕНИЯ =====
function addMessage(type, text, save = true) {
  const area = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  msg.innerHTML = `${text} <span class="time">${new Date().toLocaleTimeString()}</span>`;
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
  
  if (save && currentChat) {
    saveMessage(currentChat, type, text);
  }
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text || !currentChat) return;
  
  addMessage('user', text);
  input.value = '';
  saveDraft(currentChat, '');
  
  // Ответ бота
  if (bots[currentChat]) {
    setTimeout(() => {
      const response = getBotResponse(currentChat, text);
      addMessage('bot', response);
    }, 1000);
  }
}

function getBotResponse(botId, text) {
  const bot = bots[botId].answers;
  const words = Object.keys(bot);
  
  for (let word of words) {
    if (text.toLowerCase().includes(word)) {
      const answer = bot[word];
      return Array.isArray(answer) ? answer[Math.floor(Math.random() * answer.length)] : answer;
    }
  }
  
  return bot.default || 'расскажи подробнее! 💕';
}

// ===== БЫСТРЫЕ ВОПРОСЫ =====
function showQuickQuestions(botId) {
  const panel = document.getElementById('quickReplyPanel');
  if (!panel) return;
  
  const questions = bots[botId]?.questions || [];
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

// ===== ДЕЙСТВИЯ =====
function toggleChatActions() {
  const panel = document.getElementById('chatActionsPanel');
  panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  // Кнопки
  document.getElementById('chatMenuBtn')?.addEventListener('click', toggleChatActions);
  document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);
  
  document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  document.getElementById('messageInput')?.addEventListener('input', (e) => {
    if (currentChat) saveDraft(currentChat, e.target.value);
  });
  
  // Действия
  document.getElementById('pinChatActionBtn')?.addEventListener('click', () => {
    alert('чат закреплён');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('renameChatBtn')?.addEventListener('click', () => {
    const newName = prompt('новое название:');
    if (newName) document.getElementById('chatContactName').textContent = newName;
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('muteChatBtn')?.addEventListener('click', () => {
    alert('звук выключен');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('deleteChatBtn')?.addEventListener('click', () => {
    if (confirm('удалить историю?')) {
      document.getElementById('chatArea').innerHTML = '';
      if (currentChat) delete chatHistory[currentChat];
      document.getElementById('chatActionsPanel').style.display = 'none';
    }
  });
  
  // Экспорт
  window.openChat = openChat;
  window.openBotChat = openBotChat;
  window.sendMessage = sendMessage;
  
  // Список ботов для демо
  window.bots = bots;
});
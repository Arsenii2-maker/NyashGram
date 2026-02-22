// chat.js — ЧАТ С КНОПКОЙ СКРЫТИЯ ПАНЕЛИ

let currentChat = null;
let quickPanelVisible = true;

// ===== БЫСТРЫЕ ВОПРОСЫ =====
const quickQuestions = {
  nyashhelp: [
    "как сменить тему?",
    "как поменять шрифт?",
    "кто такие боты?",
    "как добавить друга?"
  ],
  nyashtalk: [
    "как дела?",
    "что нового?",
    "любишь котиков?",
    "расскажи секрет"
  ],
  nyashgame: [
    "сыграем?",
    "угадай число",
    "камень-ножницы",
    "кости"
  ],
  nyashhoroscope: [
    "что сегодня?",
    "любовь",
    "деньги",
    "совет"
  ]
};

// ===== ОТВЕТЫ БОТОВ =====
const botResponses = {
  nyashhelp: {
    themes: "у нас 6 тем: pink, rose, blue, mint, lilac, beige!",
    fonts: "6 шрифтов: system, rounded, cozy, elegant, bold, mono",
    bots: "боты: nyashhelp, nyashtalk, nyashgame, nyashhoroscope",
    default: "спроси про темы или шрифты"
  },
  nyashtalk: {
    hello: ["привет! как дела?", "хай! 💕", "здравствуй!"],
    default: "расскажи подробнее"
  },
  nyashgame: {
    game: "угадай число от 1 до 10!",
    default: "хочешь поиграть?"
  },
  nyashhoroscope: {
    today: "сегодня отличный день!",
    default: "хочешь гороскоп?"
  }
};

// ===== ОТКРЫТИЕ ЧАТА С БОТОМ =====
function openBotChat(bot) {
  currentChat = bot.id;
  
  document.getElementById('chatContactName').textContent = bot.name;
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
  
  showQuickReplies(bot.id);
  showScreen('chatScreen');
}

// ===== ПОКАЗ БЫСТРЫХ ОТВЕТОВ =====
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

// ===== ПЕРЕКЛЮЧЕНИЕ ВИДИМОСТИ ПАНЕЛИ =====
function toggleQuickPanel() {
  const panel = document.getElementById('quickReplyPanel');
  if (!panel) return;
  
  quickPanelVisible = !quickPanelVisible;
  panel.style.display = quickPanelVisible ? 'flex' : 'none';
  
  const btn = document.getElementById('toggleQuickPanelBtn');
  if (btn) {
    btn.style.opacity = quickPanelVisible ? '1' : '0.5';
  }
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text || !currentChat) return;
  
  addMessage(text, 'user');
  input.value = '';
  
  // Очищаем черновик
  if (typeof window.updateDraft === 'function') {
    window.updateDraft(currentChat, '');
  }
  
  // Ответ бота
  setTimeout(() => {
    const response = getBotResponse(currentChat, text);
    addMessage(response, 'bot');
  }, 1000);
}

function addMessage(text, type) {
  const area = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  msg.innerHTML = `${text}<span class="message-time">${time}</span>`;
  
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
}

function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return 'спроси что-нибудь ещё';
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем')) return bot.themes;
    if (text.includes('шрифт')) return bot.fonts;
    if (text.includes('бот')) return bot.bots;
    return bot.default;
  }
  
  if (botId === 'nyashtalk') {
    if (text.includes('привет')) {
      const answers = bot.hello;
      return answers[Math.floor(Math.random() * answers.length)];
    }
    return bot.default;
  }
  
  if (botId === 'nyashgame') {
    if (text.includes('игр') || text.includes('давай')) return bot.game;
    return bot.default;
  }
  
  if (botId === 'nyashhoroscope') {
    if (text.includes('сегодня')) return bot.today;
    return bot.default;
  }
  
  return 'интересно...';
}

// ===== ДЕЙСТВИЯ С ЧАТОМ =====
function toggleChatActions() {
  const panel = document.getElementById('chatActionsPanel');
  panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function showRenameModal() {
  document.getElementById('renameModal').style.display = 'flex';
}

function hideRenameModal() {
  document.getElementById('renameModal').style.display = 'none';
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  const newName = input.value.trim();
  if (newName) {
    document.getElementById('chatContactName').textContent = newName;
  }
  hideRenameModal();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  // Кнопки навигации
  document.getElementById('backBtn')?.addEventListener('click', () => {
    if (typeof window.showScreen === 'function') {
      window.showScreen('friendsScreen');
    }
  });
  
  // Кнопка меню
  document.getElementById('chatMenuBtn')?.addEventListener('click', toggleChatActions);
  
  // Кнопка скрытия панели
  document.getElementById('toggleQuickPanelBtn')?.addEventListener('click', toggleQuickPanel);
  
  // Кнопки в панели действий
  document.getElementById('pinChatActionBtn')?.addEventListener('click', () => {
    alert('чат закреплён');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('renameChatBtn')?.addEventListener('click', () => {
    showRenameModal();
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('muteChatBtn')?.addEventListener('click', () => {
    alert('звук выключен');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('deleteChatBtn')?.addEventListener('click', () => {
    if (confirm('удалить историю?')) {
      document.getElementById('chatArea').innerHTML = '';
    }
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('searchInChatBtn')?.addEventListener('click', () => {
    alert('поиск по чату');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('forwardBtn')?.addEventListener('click', () => {
    alert('переслать сообщение');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('copyBtn')?.addEventListener('click', () => {
    alert('скопировано');
    document.getElementById('chatActionsPanel').style.display = 'none';
  });
  
  document.getElementById('favoriteBtn')?.addEventListener('click', () => {
    alert('добавлено в избранное');
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
  
  // Экспорт
  window.openBotChat = openBotChat;
  window.sendMessage = sendMessage;
});
// chat.js — ПОЛНЫЙ ЧАТ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;

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
    "как погода?"
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
    themes: "у нас 6 тем: pastel pink, milk rose, night blue, lo-fi beige, soft lilac, forest mint",
    fonts: "6 шрифтов: system, rounded, cozy, elegant, bold soft, mono cozy",
    bots: "боты: nyashhelp, nyashtalk, nyashgame, nyashhoroscope",
    friends: "ищи друзей по юзернейму в разделе 👥 друзья",
    default: "спроси про темы, шрифты, ботов или друзей"
  },
  nyashtalk: {
    default: "расскажи что-нибудь интересное!"
  },
  nyashgame: {
    game: "угадай число от 1 до 10!",
    default: "хочешь поиграть?"
  },
  nyashhoroscope: {
    today: "сегодня отличный день для новых знакомств ✨",
    default: "хочешь узнать, что звёзды приготовили?"
  }
};

// ===== ПЕРЕИМЕНОВАНИЕ =====
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');

function saveCustomName(chatId, name) {
  if (name) customNames[chatId] = name;
  else delete customNames[chatId];
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
}

function getDisplayName(chatId, defaultName) {
  return customNames[chatId] || defaultName;
}

// ===== ОТКРЫТИЕ ЧАТА =====
function openRealChat(chat, chatId) {
  currentChat = chat;
  currentChatId = chatId;
  currentChatType = 'friend';
  
  showScreen('chatScreen');
  
  document.getElementById('chatContactName').textContent = getDisplayName(chatId, chat.otherUser?.name || 'друг');
  document.getElementById('chatContactUsername').textContent = `@${chat.otherUser?.username || 'unknown'}`;
  
  // Очищаем и показываем приветствие
  const chatArea = document.getElementById('chatArea');
  chatArea.innerHTML = `
    <div class="message bot">
      начало переписки с @${chat.otherUser?.username || 'другом'}
    </div>
  `;
  
  // Показываем быстрые ответы
  showQuickReplies();
}

function openBotChat(bot) {
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  
  showScreen('chatScreen');
  
  document.getElementById('chatContactName').textContent = bot.name;
  document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
  
  const chatArea = document.getElementById('chatArea');
  chatArea.innerHTML = `
    <div class="message bot">
      привет! я ${bot.name} ✨
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
  
  const input = document.getElementById('messageInput');
  input.value = '';
  
  // Сообщение пользователя
  addMessage(text, 'user');
  
  // Сохраняем черновик
  saveDraft(currentChatId, '');
  
  if (currentChatType === 'bot') {
    // Ответ бота
    setTimeout(() => {
      const response = getBotResponse(currentChatId, text);
      addMessage(response, 'bot');
    }, 1000);
  }
}

function addMessage(text, type) {
  const chatArea = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  msg.textContent = text;
  chatArea.appendChild(msg);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return 'спроси что-нибудь ещё';
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем')) return bot.themes;
    if (text.includes('шрифт')) return bot.fonts;
    if (text.includes('бот')) return bot.bots;
    if (text.includes('друг')) return bot.friends;
    return bot.default;
  }
  
  if (botId === 'nyashtalk') return bot.default;
  if (botId === 'nyashgame') return text.includes('игр') ? bot.game : bot.default;
  if (botId === 'nyashhoroscope') return text.includes('сегодня') ? bot.today : bot.default;
  
  return 'интересно... расскажи подробнее';
}

// ===== ЧЕРНОВИКИ =====
function saveDraft(chatId, text) {
  let drafts = JSON.parse(localStorage.getItem('nyashgram_drafts') || '{}');
  if (text) drafts[chatId] = text;
  else delete drafts[chatId];
  localStorage.setItem('nyashgram_drafts', JSON.stringify(drafts));
}

function getDraft(chatId) {
  let drafts = JSON.parse(localStorage.getItem('nyashgram_drafts') || '{}');
  return drafts[chatId] || '';
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
  }
}

function hideRenameModal() {
  document.getElementById('renameModal').style.display = 'none';
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  if (!input || !currentChatId) return;
  
  const newName = input.value.trim();
  saveCustomName(currentChatId, newName);
  document.getElementById('chatContactName').textContent = newName || (currentChat?.otherUser?.name || currentChat?.name);
  hideRenameModal();
}

function togglePinChat() {
  let pinned = JSON.parse(localStorage.getItem('nyashgram_pinned') || '[]');
  if (pinned.includes(currentChatId)) {
    pinned = pinned.filter(id => id !== currentChatId);
  } else {
    pinned.push(currentChatId);
  }
  localStorage.setItem('nyashgram_pinned', JSON.stringify(pinned));
  alert(pinned.includes(currentChatId) ? 'чат закреплён' : 'чат откреплён');
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  // Кнопки
  document.getElementById('backBtn')?.addEventListener('click', () => showScreen('friendsScreen'));
  document.getElementById('chatMenuBtn')?.addEventListener('click', toggleChatActions);
  
  document.getElementById('pinChatActionBtn')?.addEventListener('click', () => {
    togglePinChat();
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
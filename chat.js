// chat.js — ПОЛНЫЙ С ГОЛОСОВЫМИ СООБЩЕНИЯМИ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let quickPanelVisible = true;
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let currentDraftChatId = null;
let isSending = false;

// Слушатели Firebase
let messagesListener = null;
let chatListener = null;

// ===== ГОЛОСОВЫЕ ПЕРЕМЕННЫЕ =====
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = 0;
let recordingTimer = null;
let audioPlayer = null;
const storage = firebase.storage();

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
    themes: "у нас 6 милых тем: pastel pink 💗, milk rose 🌸, night blue 🌙, lo-fi beige 📖, soft lilac 💜, forest mint 🌿!",
    fonts: "6 шрифтов: system, rounded, cozy, elegant, bold soft, mono cozy!",
    bots: "наши боты: nyashhelp 🩷, nyashtalk 🌸, nyashgame 🎮, nyashhoroscope 🔮, nyashcook 🍳!",
    count: "6 тем, 6 шрифтов и 5 милых ботов!",
    default: "спроси про темы, шрифты или ботов! 💕"
  },
  nyashtalk: {
    hello: ["приветик! 🩷 как дела?", "хай-хай! 💕 соскучилась!", "здравствуй! 😽"],
    mood: ["у меня всё отлично! а у тебя? 🎵", "я счастлива, что мы общаемся! 💗"],
    cats: ["мяу-мяу! 🐱 люблю котиков!", "котики - это милота! 😸"],
    secret: ["🤫 ты самый лучший!", "секретик: сегодня будет хороший день ✨"],
    hug: ["обнимаю! 🫂", "крепкие обнимашки! 🤗"],
    default: ["расскажи что-нибудь! 👂", "ой, интересно! продолжай 🥰"]
  },
  nyashgame: {
    game: "давай поиграем! угадай число от 1 до 10 🔢",
    rps: "камень-ножницы-бумага? выбирай! ✂️",
    dice: "🎲 бросаю кубики... тебе выпало " + (Math.floor(Math.random() * 6) + 1),
    coin: "🪙 бросаю монетку... " + (Math.random() < 0.5 ? "орёл!" : "решка!"),
    default: "хочешь поиграть? 🎮"
  },
  nyashhoroscope: {
    today: "сегодня отличный день! ✨",
    love: "в любви гармония! 💕",
    money: "финансовый день - удачный! 💰",
    advice: "прислушайся к интуиции! 🎯",
    tomorrow: "завтра будет хороший день! 🌟",
    default: "хочешь гороскоп? 🔮"
  },
  nyashcook: {
    cake: "кексики: мука 200г, сахар 150г, яйца, масло, 25 мин при 180° 🧁",
    cookie: "печенье: масло 120г, сахар, яйцо, мука, шоколад, 15 мин 🍪",
    breakfast: "блинчики: молоко, яйца, мука, сахар, соль 🥞",
    muffin: "маффины с черникой: мука, сахар, яйца, молоко, масло, черника 🧁",
    pie: "яблочный пирог: яблоки, мука, сахар, яйца, корица 🥧",
    default: "спроси про кексы, печенье или тортик! 🍳"
  }
};

// ===== ПРИВЕТСТВИЯ =====
const greetings = {
  nyashhelp: "привет! я NyashHelp 🩷 твой помощник! спрашивай о приложении, темах или шрифтах!",
  nyashtalk: "приветик! я NyashTalk 🌸 давай болтать! как твои дела?",
  nyashgame: "🎮 привет! я NyashGame! хочешь поиграть? угадай число или камень-ножницы?",
  nyashhoroscope: "🔮 привет! я NyashHoroscope! хочешь узнать, что звёзды приготовили на сегодня?",
  nyashcook: "🍳 привет! я NyashCook! хочешь рецепт чего-нибудь вкусненького?"
};

// ===== 🔥 НОВЫЕ ФУНКЦИИ ДЛЯ РЕАЛЬНЫХ СООБЩЕНИЙ =====

// ОТПРАВКА СООБЩЕНИЯ ДРУГУ
async function sendMessageToFriend(chatId, text) {
  if (!window.auth?.currentUser || !text.trim()) return false;
  
  try {
    await window.db.collection('messages').add({
      chatId: chatId,
      from: window.auth.currentUser.uid,
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      readBy: [window.auth.currentUser.uid]
    });
    
    await window.db.collection('chats').doc(chatId).update({
      lastMessage: {
        text: text,
        from: window.auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        readBy: [window.auth.currentUser.uid]
      }
    });
    
    return true;
  } catch (error) {
    console.error('Ошибка отправки:', error);
    return false;
  }
}

// СТАТУС "ПЕЧАТАЕТ..."
async function setTyping(chatId, isTyping) {
  if (!window.auth?.currentUser || !chatId) return;
  
  try {
    await window.db.collection('chats').doc(chatId).update({
      [`typing.${window.auth.currentUser.uid}`]: isTyping
    });
  } catch (error) {
    console.error('Ошибка статуса печати:', error);
  }
}

// СЛУШАТЕЛЬ СООБЩЕНИЙ
function listenToMessages(chatId, callback) {
  if (messagesListener) messagesListener();
  
  messagesListener = window.db.collection('messages')
    .where('chatId', '==', chatId)
    .orderBy('timestamp', 'asc')
    .onSnapshot((snapshot) => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages);
    }, (error) => {
      console.error('Ошибка слушателя:', error);
    });
  
  return messagesListener;
}

// СЛУШАТЕЛЬ СТАТУСА ЧАТА
function listenToChat(chatId, callback) {
  if (chatListener) chatListener();
  
  chatListener = window.db.collection('chats').doc(chatId)
    .onSnapshot((doc) => {
      if (doc.exists) callback(doc.data());
    });
  
  return chatListener;
}

// ===== СОХРАНЕНИЕ ИМЁН =====
function saveCustomName(chatId, name) {
  if (!window.customNames) window.customNames = {};
  if (name) window.customNames[chatId] = name;
  else delete window.customNames[chatId];
  localStorage.setItem('nyashgram_custom_names', JSON.stringify(window.customNames));
  
  if (typeof window.renderContacts === 'function') {
    setTimeout(window.renderContacts, 100);
  }
}

function getCustomName(chatId, defaultName) {
  return window.customNames?.[chatId] || defaultName;
}

// ===== СОХРАНЕНИЕ СООБЩЕНИЙ (ДЛЯ БОТОВ) =====
function saveMessage(chatId, type, text) {
  if (!chatMessages[chatId]) chatMessages[chatId] = [];
  chatMessages[chatId].push({
    type: type,
    text: text,
    timeString: new Date().toLocaleTimeString()
  });
  if (chatMessages[chatId].length > 50) chatMessages[chatId] = chatMessages[chatId].slice(-50);
  localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
}

// ===== ЧЕРНОВИКИ =====
function saveCurrentDraft() {
  if (currentChatId) {
    const input = document.getElementById('messageInput');
    if (input) {
      const text = input.value.trim();
      if (text) {
        let drafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
        drafts[currentChatId] = text;
        localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(drafts));
      }
    }
  }
}

function loadDraft(chatId) {
  const input = document.getElementById('messageInput');
  if (!input) return;
  
  const drafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
  input.value = drafts[chatId] || '';
  currentDraftChatId = chatId;
}

// ===== ОТКРЫТИЕ ЧАТА С БОТОМ =====
function openBotChat(bot) {
  console.log('Открываем чат с ботом:', bot);
  
  if (messagesListener) messagesListener();
  if (chatListener) chatListener();
  
  saveCurrentDraft();
  
  currentChat = bot;
  currentChatId = bot.id;
  currentChatType = 'bot';
  
  const nameEl = document.getElementById('chatContactName');
  const usernameEl = document.getElementById('chatContactUsername');
  const avatarEl = document.getElementById('chatAvatar');
  
  if (nameEl) nameEl.textContent = getCustomName(bot.id, bot.name);
  if (usernameEl) usernameEl.textContent = `@${bot.username}`;
  
  if (avatarEl) {
    if (bot.id === 'nyashhelp') avatarEl.style.background = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
    else if (bot.id === 'nyashtalk') avatarEl.style.background = 'linear-gradient(135deg, #85d1c5, #b0e0d5)';
    else if (bot.id === 'nyashgame') avatarEl.style.background = 'linear-gradient(135deg, #ffb347, #ff8c42)';
    else if (bot.id === 'nyashhoroscope') avatarEl.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
    else if (bot.id === 'nyashcook') avatarEl.style.background = 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
  }
  
  const quickPanel = document.getElementById('quickReplyPanel');
  if (quickPanel) {
    quickPanel.style.display = 'flex';
    showQuickReplies(bot.id);
  }
  
  loadChatHistory(bot.id);
  loadDraft(bot.id);
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
}

// ===== ОТКРЫТИЕ ЧАТА С ДРУГОМ =====
async function openFriendChat(friend) {
  console.log('Открываем чат с другом:', friend);
  
  if (messagesListener) messagesListener();
  if (chatListener) chatListener();
  
  saveCurrentDraft();
  
  currentChat = friend;
  currentChatId = friend.id;
  currentChatType = 'friend';
  
  const nameEl = document.getElementById('chatContactName');
  const usernameEl = document.getElementById('chatContactUsername');
  const avatarEl = document.getElementById('chatAvatar');
  
  if (nameEl) nameEl.textContent = getCustomName(friend.id, friend.name);
  if (usernameEl) usernameEl.textContent = `@${friend.username}`;
  if (avatarEl) avatarEl.style.background = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
  
  const quickPanel = document.getElementById('quickReplyPanel');
  if (quickPanel) {
    quickPanel.style.display = 'none';
  }
  
  if (!friend.chatId) {
    const chatId = await window.createPrivateChat(window.auth.currentUser.uid, friend.id);
    friend.chatId = chatId;
    currentChatId = chatId;
  } else {
    currentChatId = friend.chatId;
  }
  
  listenToMessages(currentChatId, (messages) => {
    renderRealMessages(messages);
  });
  
  listenToChat(currentChatId, (chatData) => {
    if (chatData.typing) {
      const isTyping = chatData.typing[friend.id];
      const typingEl = document.getElementById('typingIndicator');
      if (typingEl) {
        typingEl.style.display = isTyping ? 'flex' : 'none';
      }
    }
  });
  
  loadDraft(currentChatId);
  
  if (typeof window.showScreen === 'function') {
    window.showScreen('chatScreen');
  }
}

// ===== ОТРИСОВКА РЕАЛЬНЫХ СООБЩЕНИЙ С ГОЛОСОВЫМИ =====
function renderRealMessages(messages) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  
  area.innerHTML = '';
  
  messages.forEach(msg => {
    const isMe = msg.from === window.auth?.currentUser?.uid;
    
    if (msg.type === 'voice') {
      // Голосовое сообщение
      const el = document.createElement('div');
      el.className = `message voice ${isMe ? 'user' : 'bot'}`;
      
      const time = msg.timestamp?.toDate 
        ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      el.innerHTML = `
        <div class="voice-message">
          <button class="voice-play-btn" data-url="${msg.audioUrl || ''}">▶️</button>
          <div class="voice-timeline">
            <div class="voice-progress" style="width: 0%"></div>
          </div>
          <span class="voice-duration">${msg.duration || 0}с</span>
        </div>
        <span class="message-time">${time}</span>
      `;
      
      setTimeout(() => {
        const playBtn = el.querySelector('.voice-play-btn');
        const progressEl = el.querySelector('.voice-progress');
        const durationEl = el.querySelector('.voice-duration');
        
        if (playBtn && msg.audioUrl) {
          playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playVoiceMessage(msg.audioUrl, playBtn, durationEl, progressEl);
          });
        }
      }, 0);
      
      area.appendChild(el);
    } else {
      // Текстовое сообщение
      const el = document.createElement('div');
      el.className = `message ${isMe ? 'user' : 'bot'}`;
      
      const time = msg.timestamp?.toDate 
        ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      el.innerHTML = `${msg.text || ''}<span class="message-time">${time}</span>`;
      area.appendChild(el);
    }
  });
  
  area.scrollTop = area.scrollHeight;
}

// ===== ЗАГРУЗКА ИСТОРИИ ЧАТА =====
function loadChatHistory(chatId) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  
  area.innerHTML = '';
  
  if (chatMessages[chatId] && chatMessages[chatId].length > 0) {
    chatMessages[chatId].forEach(msg => {
      const el = document.createElement('div');
      el.className = `message ${msg.type}`;
      el.innerHTML = `${msg.text}<span class="message-time">${msg.timeString}</span>`;
      area.appendChild(el);
    });
  } else if (chatId && chatId.startsWith('nyash')) {
    const greeting = greetings[chatId] || "привет! давай общаться! 💕";
    const el = document.createElement('div');
    el.className = 'message bot';
    el.innerHTML = `${greeting}<span class="message-time">${new Date().toLocaleTimeString()}</span>`;
    area.appendChild(el);
    
    saveMessage(chatId, 'bot', greeting);
  }
  
  area.scrollTop = area.scrollHeight;
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
      const input = document.getElementById('messageInput');
      if (input) {
        input.value = q;
      }
    };
    panel.appendChild(btn);
  });
}

function toggleQuickPanel() {
  const panel = document.getElementById('quickReplyPanel');
  if (!panel) return;
  quickPanelVisible = !quickPanelVisible;
  panel.style.display = quickPanelVisible ? 'flex' : 'none';
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
async function sendMessage() {
  const input = document.getElementById('messageInput');
  if (!input) return;
  
  if (isSending) return;
  
  const text = input.value.trim();
  if (!text || !currentChat) return;
  
  isSending = true;
  const sendBtn = document.getElementById('sendMessageBtn');
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
  }
  
  input.value = '';
  
  let drafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
  delete drafts[currentChatId];
  localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(drafts));
  
  if (currentChatType === 'friend') {
    const success = await sendMessageToFriend(currentChatId, text);
    
    if (!success) {
      showNotification('❌ Ошибка отправки');
      input.value = text;
    }
    
    await setTyping(currentChatId, false);
  } else {
    addMessage(text, 'user', true);
    
    setTimeout(() => {
      const response = getBotResponse(currentChatId, text);
      addMessage(response, 'bot', true);
    }, 1000);
  }
  
  setTimeout(() => {
    isSending = false;
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
    }
  }, 500);
}

// ===== ДОБАВЛЕНИЕ СООБЩЕНИЯ =====
function addMessage(text, type, save = false) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  
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

// ===== ПОЛУЧЕНИЕ ОТВЕТА ОТ БОТА =====
function getBotResponse(botId, text) {
  const bot = botResponses[botId];
  if (!bot) return "💕";
  
  text = text.toLowerCase();
  
  if (botId === 'nyashhelp') {
    if (text.includes('тем')) return bot.themes;
    if (text.includes('шрифт')) return bot.fonts;
    if (text.includes('бот')) return bot.bots;
    if (text.includes('сколько')) return bot.count;
    return bot.default;
  }
  
  if (botId === 'nyashtalk') {
    if (text.includes('привет')) return bot.hello[Math.floor(Math.random() * bot.hello.length)];
    if (text.includes('дела') || text.includes('настроен')) return bot.mood[Math.floor(Math.random() * bot.mood.length)];
    if (text.includes('кот')) return bot.cats[Math.floor(Math.random() * bot.cats.length)];
    if (text.includes('секрет')) return bot.secret[Math.floor(Math.random() * bot.secret.length)];
    if (text.includes('обним')) return bot.hug[Math.floor(Math.random() * bot.hug.length)];
    return bot.default[Math.floor(Math.random() * bot.default.length)];
  }
  
  if (botId === 'nyashgame') {
    if (text.includes('игр') || text.includes('давай')) return bot.game;
    if (text.includes('камень')) return bot.rps;
    if (text.includes('кост')) return bot.dice;
    if (text.includes('орёл')) return bot.coin;
    return bot.default;
  }
  
  if (botId === 'nyashhoroscope') {
    if (text.includes('сегодня')) return bot.today;
    if (text.includes('любов')) return bot.love;
    if (text.includes('денег')) return bot.money;
    if (text.includes('совет')) return bot.advice;
    if (text.includes('завтра')) return bot.tomorrow;
    return bot.default;
  }
  
  if (botId === 'nyashcook') {
    if (text.includes('кекс') || text.includes('маффин')) return bot.muffin;
    if (text.includes('печень')) return bot.cookie;
    if (text.includes('торт')) return bot.cake;
    if (text.includes('пирог')) return bot.pie;
    if (text.includes('завтрак')) return bot.breakfast;
    return bot.default;
  }
  
  return "💕";
}

// ===== ГОЛОСОВЫЕ СООБЩЕНИЯ =====

async function uploadAudio(audioBlob, chatId) {
  const fileName = `voice_${Date.now()}.webm`;
  const storageRef = storage.ref(`chats/${chatId}/${fileName}`);
  
  showNotification('⏳ загрузка...');
  
  try {
    await storageRef.put(audioBlob);
    const url = await storageRef.getDownloadURL();
    return url;
  } catch (error) {
    console.error('Ошибка загрузки аудио:', error);
    showNotification('❌ ошибка загрузки');
    return null;
  }
}

async function startVoiceRecording() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('❌ Ваш браузер не поддерживает запись голоса');
      return;
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    recordingStartTime = Date.now();
    
    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
      
      stream.getTracks().forEach(track => track.stop());
      
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      if (audioBlob.size > 1000) {
        await sendVoiceMessage(audioBlob);
      } else {
        showNotification('❌ запись слишком короткая');
      }
      
      audioChunks = [];
      const btn = document.getElementById('voiceRecordBtn');
      if (btn) btn.classList.remove('recording');
    };
    
    mediaRecorder.start();
    const btn = document.getElementById('voiceRecordBtn');
    if (btn) btn.classList.add('recording');
    
    recordingTimer = setInterval(() => {
      const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
      if (duration >= 60) {
        stopVoiceRecording();
      } else if (duration % 5 === 0) {
        showNotification(`⏺ запись ${duration}с`);
      }
    }, 1000);
    
  } catch (error) {
    console.error('Ошибка доступа к микрофону:', error);
    
    if (error.name === 'NotAllowedError') {
      alert('❌ Нет доступа к микрофону');
    } else if (error.name === 'NotFoundError') {
      alert('❌ Микрофон не найден');
    } else {
      alert('❌ Ошибка: ' + error.message);
    }
  }
}

function stopVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }
  }
}

async function sendVoiceMessage(audioBlob) {
  if (!currentChatId) return;
  
  const audioUrl = await uploadAudio(audioBlob, currentChatId);
  if (!audioUrl) return;
  
  const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
  
  if (currentChatType === 'friend') {
    try {
      await window.db.collection('messages').add({
        chatId: currentChatId,
        from: window.auth.currentUser.uid,
        type: 'voice',
        audioUrl: audioUrl,
        duration: duration,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        readBy: [window.auth.currentUser.uid]
      });
      
      await window.db.collection('chats').doc(currentChatId).update({
        lastMessage: {
          text: '🎤 Голосовое сообщение',
          from: window.auth.currentUser.uid,
          type: 'voice',
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });
      
      showNotification('✅ голосовое отправлено');
    } catch (error) {
      console.error('Ошибка отправки:', error);
      showNotification('❌ ошибка отправки');
    }
  } else {
    addMessage('🎤 Голосовое сообщение (бот не может его прослушать)', 'bot', true);
  }
}

function playVoiceMessage(audioUrl, buttonElement, durationElement, progressElement) {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer = null;
  }
  
  audioPlayer = new Audio(audioUrl);
  
  audioPlayer.addEventListener('timeupdate', () => {
    if (progressElement) {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressElement.style.width = `${progress}%`;
    }
    
    if (durationElement) {
      const current = Math.floor(audioPlayer.currentTime);
      durationElement.textContent = `${current}с`;
    }
  });
  
  audioPlayer.addEventListener('ended', () => {
    buttonElement.textContent = '▶️';
    if (progressElement) {
      progressElement.style.width = '0%';
    }
    if (durationElement) {
      durationElement.textContent = `${Math.floor(audioPlayer.duration)}с`;
    }
    audioPlayer = null;
  });
  
  audioPlayer.play();
  buttonElement.textContent = '⏸️';
}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

// ===== ДЕЙСТВИЯ =====
function toggleChatActions() {
  const panel = document.getElementById('chatActionsPanel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  }
}

function showRenameModal() {
  const modal = document.getElementById('renameModal');
  const input = document.getElementById('renameInput');
  if (modal && input && currentChatId) {
    const nameEl = document.getElementById('chatContactName');
    input.value = getCustomName(currentChatId, nameEl ? nameEl.textContent : '');
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 100);
  }
}

function hideRenameModal() {
  const modal = document.getElementById('renameModal');
  if (modal) modal.style.display = 'none';
}

function renameCurrentChat() {
  const input = document.getElementById('renameInput');
  if (!input || !currentChatId) return;
  
  const newName = input.value.trim();
  if (newName) {
    saveCustomName(currentChatId, newName);
    const nameEl = document.getElementById('chatContactName');
    if (nameEl) nameEl.textContent = newName;
    
    showNotification('✏️ имя изменено');
  }
  hideRenameModal();
}

function togglePinChat() {
  if (!currentChatId) return;
  
  let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
  
  if (pinnedChats.includes(currentChatId)) {
    pinnedChats = pinnedChats.filter(id => id !== currentChatId);
    showNotification('📌 чат откреплён');
  } else {
    pinnedChats.push(currentChatId);
    showNotification('📌 чат закреплён');
  }
  
  localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
  
  if (typeof window.renderContacts === 'function') {
    window.renderContacts();
  }
}

function deleteChatHistory() {
  if (!currentChatId) return;
  
  if (currentChatType === 'bot') {
    if (confirm('удалить историю чата с ботом?')) {
      delete chatMessages[currentChatId];
      localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
      const chatArea = document.getElementById('chatArea');
      if (chatArea) chatArea.innerHTML = '';
      
      if (currentChatId && currentChatId.startsWith('nyash')) {
        const greeting = greetings[currentChatId] || "привет! давай общаться! 💕";
        const el = document.createElement('div');
        el.className = 'message bot';
        el.innerHTML = `${greeting}<span class="message-time">${new Date().toLocaleTimeString()}</span>`;
        if (chatArea) {
          chatArea.appendChild(el);
          saveMessage(currentChatId, 'bot', greeting);
        }
      }
      showNotification('🗑️ история удалена');
    }
  } else {
    alert('История сообщений с друзьями хранится в облаке');
  }
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 chat.js загружен');
  
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      saveCurrentDraft();
      if (messagesListener) messagesListener();
      if (chatListener) chatListener();
      if (typeof window.showScreen === 'function') {
        window.showScreen('friendsScreen');
      }
    });
  }
  
  const chatMenuBtn = document.getElementById('chatMenuBtn');
  if (chatMenuBtn) {
    chatMenuBtn.addEventListener('click', toggleChatActions);
  }
  
  const toggleQuickPanelBtn = document.getElementById('toggleQuickPanelBtn');
  if (toggleQuickPanelBtn) {
    toggleQuickPanelBtn.addEventListener('click', toggleQuickPanel);
  }
  
  const pinChatActionBtn = document.getElementById('pinChatActionBtn');
  if (pinChatActionBtn) {
    pinChatActionBtn.addEventListener('click', () => {
      togglePinChat();
      const panel = document.getElementById('chatActionsPanel');
      if (panel) panel.style.display = 'none';
    });
  }
  
  const renameChatBtn = document.getElementById('renameChatBtn');
  if (renameChatBtn) {
    renameChatBtn.addEventListener('click', () => {
      showRenameModal();
      const panel = document.getElementById('chatActionsPanel');
      if (panel) panel.style.display = 'none';
    });
  }
  
  const muteChatBtn = document.getElementById('muteChatBtn');
  if (muteChatBtn) {
    muteChatBtn.addEventListener('click', () => {
      showNotification('🔇 звук выключен');
      const panel = document.getElementById('chatActionsPanel');
      if (panel) panel.style.display = 'none';
    });
  }
  
  const deleteChatBtn = document.getElementById('deleteChatBtn');
  if (deleteChatBtn) {
    deleteChatBtn.addEventListener('click', () => {
      deleteChatHistory();
      const panel = document.getElementById('chatActionsPanel');
      if (panel) panel.style.display = 'none';
    });
  }
  
  const renameCancelBtn = document.getElementById('renameCancelBtn');
  if (renameCancelBtn) {
    renameCancelBtn.addEventListener('click', hideRenameModal);
  }
  
  const renameConfirmBtn = document.getElementById('renameConfirmBtn');
  if (renameConfirmBtn) {
    renameConfirmBtn.addEventListener('click', renameCurrentChat);
  }
  
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const messageInput = document.getElementById('messageInput');
  
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', sendMessage);
  }
  
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isSending) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    messageInput.addEventListener('input', (e) => {
      if (currentChatId) {
        let drafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
        if (e.target.value.trim()) {
          drafts[currentChatId] = e.target.value;
        } else {
          delete drafts[currentChatId];
        }
        localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(drafts));
        
        if (currentChatType === 'friend' && currentChatId) {
          setTyping(currentChatId, e.target.value.trim().length > 0);
        }
      }
    });
  }
  
  // ===== ОБРАБОТЧИКИ ГОЛОСА =====
  const voiceBtn = document.getElementById('voiceRecordBtn');
  if (voiceBtn) {
    voiceBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startVoiceRecording();
    });
    
    voiceBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      stopVoiceRecording();
    });
    
    voiceBtn.addEventListener('mouseleave', (e) => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopVoiceRecording();
      }
    });
    
    // Для мобильных
    voiceBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startVoiceRecording();
    });
    
    voiceBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopVoiceRecording();
    });
    
    voiceBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      stopVoiceRecording();
    });
  }
  
  window.openBotChat = openBotChat;
  window.openFriendChat = openFriendChat;
  window.sendMessageToFriend = sendMessageToFriend;
  window.setTyping = setTyping;
  
  console.log('✅ chat.js готов');
});
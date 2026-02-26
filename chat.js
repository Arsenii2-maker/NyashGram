// chat.js — ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ С ПОДДЕРЖКОЙ МОБИЛЬНЫХ УСТРОЙСТВ
let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let quickPanelVisible = true;
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let currentDraftChatId = null;
let isSending = false;

// ===== ГОЛОСОВЫЕ СООБЩЕНИЯ =====
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = 0;
let recordingTimer = null;
let audioContext = null;
let analyser = null;
let source = null;
let animationFrame = null;
let recordedAudioUrl = null;
let recordedAudioBlob = null;
let recordedDuration = 0;
let isRecording = false;
let audioPlayer = null;

// Слушатели Firebase
let messagesListener = null;
let chatListener = null;

// ===== ДИАГНОСТИКА МОБИЛЬНЫХ УСТРОЙСТВ =====
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
const isMobile = isIOS || isAndroid;

console.log('📱 Мобильная диагностика:', {
    iOS: isIOS,
    Android: isAndroid,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform
});

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

// ===== ФУНКЦИИ ДЛЯ ДРУЗЕЙ =====
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

// ===== ОТПРАВКА ГОЛОСОВОГО СООБЩЕНИЯ =====
async function sendVoiceMessageToFriend(chatId, audioBlob, duration) {
    if (!window.auth?.currentUser || !audioBlob) return false;
    
    try {
        const fileName = `voice_${Date.now()}.${isIOS ? 'm4a' : 'webm'}`;
        const storageRef = firebase.storage().ref(`chats/${chatId}/${fileName}`);
        await storageRef.put(audioBlob);
        const audioUrl = await storageRef.getDownloadURL();
        
        await window.db.collection('messages').add({
            chatId: chatId,
            from: window.auth.currentUser.uid,
            type: 'voice',
            audioUrl: audioUrl,
            duration: duration,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            readBy: [window.auth.currentUser.uid]
        });
        
        await window.db.collection('chats').doc(chatId).update({
            lastMessage: {
                text: '🎤 Голосовое сообщение',
                from: window.auth.currentUser.uid,
                type: 'voice',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }
        });
        
        return true;
    } catch (error) {
        console.error('Ошибка отправки голоса:', error);
        return false;
    }
}

// ===== ФУНКЦИИ ДЛЯ БОТОВ =====
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
    
    // В openBotChat добавить:
if (typeof window.updateCallButtonsVisibility === 'function') {
    window.updateCallButtonsVisibility();
}
    
    saveCurrentDraft();
    
    currentChat = bot;
    currentChatId = bot.id;
    currentChatType = 'bot';
    
    const nameEl = document.getElementById('chatContactName');
    const usernameEl = document.getElementById('chatContactUsername');
    const avatarEl = document.getElementById('chatAvatar');
    // Для ботов скрываем кнопки звонков
const audioCallBtn = document.getElementById('audioCallActionBtn');
const videoCallBtn = document.getElementById('videoCallActionBtn');
if (audioCallBtn) audioCallBtn.style.display = 'none';
if (videoCallBtn) videoCallBtn.style.display = 'none';
    if (nameEl) nameEl.textContent = customNames[bot.id] || bot.name;
    if (usernameEl) usernameEl.textContent = `@${bot.username}`;
    
    if (avatarEl) {
        const gradients = {
            nyashhelp: 'linear-gradient(135deg, #c38ef0, #e0b0ff)',
            nyashtalk: 'linear-gradient(135deg, #85d1c5, #b0e0d5)',
            nyashgame: 'linear-gradient(135deg, #ffb347, #ff8c42)',
            nyashhoroscope: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
            nyashcook: 'linear-gradient(135deg, #ff9a9e, #fad0c4)'
        };
        avatarEl.style.background = gradients[bot.id] || 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
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

async function openFriendChat(friend) {
    console.log('Открываем чат с другом:', friend);
    
    if (messagesListener) messagesListener();
    if (chatListener) chatListener();
    
    // В openFriendChat добавить:
if (typeof window.updateCallButtonsVisibility === 'function') {
    window.updateCallButtonsVisibility();
}
    
    saveCurrentDraft();
    
    currentChat = friend;
    currentChatId = friend.id;
    currentChatType = 'friend';
    
    const nameEl = document.getElementById('chatContactName');
    const usernameEl = document.getElementById('chatContactUsername');
    const avatarEl = document.getElementById('chatAvatar');
    
    if (nameEl) nameEl.textContent = customNames[friend.id] || friend.name;
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

function showQuickReplies(botId) {
    const panel = document.getElementById('quickReplyPanel');
    if (!panel) return;
    
    const questions = quickQuestions[botId] || quickQuestions.nyashtalk;
    // После того как настроили чат, добавляем кнопки звонков
setTimeout(() => {
    if (typeof window.addCallButtonsToChat === 'function') {
        window.addCallButtonsToChat();
    }
}, 500);
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

// ===== ФУНКЦИИ ДЛЯ СОХРАНЕНИЯ ИМЁН И ЗАКРЕПЛЕНИЯ =====
function saveCustomName(chatId, name) {
    if (name && name.trim()) {
        customNames[chatId] = name.trim();
    } else {
        delete customNames[chatId];
    }
    localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
    
    // Обновляем глобальную ссылку
    window.customNames = customNames;
    
    if (typeof window.renderContacts === 'function') {
        window.renderContacts();
    }
}

function togglePinChat() {
    if (!currentChatId) return;
    
    if (pinnedChats.includes(currentChatId)) {
        pinnedChats = pinnedChats.filter(id => id !== currentChatId);
        showNotification('📌 чат откреплён');
    } else {
        pinnedChats.push(currentChatId);
        showNotification('📌 чат закреплён');
    }
    
    localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
    
    // Обновляем глобальную ссылку
    window.pinnedChats = pinnedChats;
    
    if (typeof window.renderContacts === 'function') {
        window.renderContacts();
    }
}

function showRenameModal() {
    const modal = document.getElementById('renameModal');
    const input = document.getElementById('renameInput');
    if (modal && input && currentChatId) {
        const nameEl = document.getElementById('chatContactName');
        input.value = customNames[currentChatId] || (nameEl ? nameEl.textContent : '');
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

function muteChat() {
    showNotification('🔇 звук выключен');
}

// ===== СЛУШАТЕЛИ FIREBASE =====
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

function listenToChat(chatId, callback) {
    if (chatListener) chatListener();
    
    chatListener = window.db.collection('chats').doc(chatId)
        .onSnapshot((doc) => {
            if (doc.exists) callback(doc.data());
        });
    
    return chatListener;
}

// ===== ФУНКЦИИ ДЛЯ ГОЛОСА =====
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function createWaveformVisualizer(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    const canvas = document.getElementById('voiceWaveform');
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        if (!isRecording) return;
        
        animationFrame = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            
            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 100, 150)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    draw();
}

function showVoiceRecordingUI() {
    const inputArea = document.querySelector('.message-input-area');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const voiceBtn = document.getElementById('voiceRecordBtn');
    
    messageInput.style.display = 'none';
    sendBtn.style.display = 'none';
    voiceBtn.style.display = 'none';
    
    const voiceUI = document.createElement('div');
    voiceUI.className = 'voice-recording-ui';
    voiceUI.id = 'voiceRecordingUI';
    voiceUI.innerHTML = `
        <canvas id="voiceWaveform" class="voice-waveform"></canvas>
        <div class="voice-recording-controls">
            <span class="voice-timer" id="voiceTimer">0:00</span>
            <button id="stopRecordingBtn" class="voice-stop-btn">⏹️</button>
            <button id="cancelRecordingBtn" class="voice-cancel-btn">❌</button>
        </div>
    `;
    
    inputArea.appendChild(voiceUI);
    
    const canvas = document.getElementById('voiceWaveform');
    canvas.width = inputArea.clientWidth - 180;
    canvas.height = 50;
    
    recordingTimer = setInterval(() => {
        if (isRecording) {
            const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
            const timerEl = document.getElementById('voiceTimer');
            if (timerEl) {
                timerEl.textContent = formatTime(duration);
            }
        }
    }, 100);
}

function hideVoiceRecordingUI() {
    const voiceUI = document.getElementById('voiceRecordingUI');
    if (voiceUI) voiceUI.remove();
    
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    
    document.getElementById('messageInput').style.display = 'block';
    document.getElementById('sendMessageBtn').style.display = 'flex';
    document.getElementById('voiceRecordBtn').style.display = 'flex';
}

function showVoicePreviewUI(audioUrl, duration) {
    const inputArea = document.querySelector('.message-input-area');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const voiceBtn = document.getElementById('voiceRecordBtn');
    
    messageInput.style.display = 'none';
    sendBtn.style.display = 'none';
    voiceBtn.style.display = 'none';
    
    const previewUI = document.createElement('div');
    previewUI.className = 'voice-preview-ui';
    previewUI.id = 'voicePreviewUI';
    previewUI.innerHTML = `
        <div class="voice-preview">
            <button id="playPreviewBtn" class="voice-play-btn">▶️</button>
            <div class="voice-timeline-preview">
                <div class="voice-progress-preview" id="voiceProgressPreview" style="width: 0%"></div>
            </div>
            <span class="voice-duration-preview" id="previewDuration">${formatTime(duration)}</span>
            <button id="sendVoiceBtn" class="voice-send-btn">📤</button>
            <button id="deleteVoiceBtn" class="voice-delete-btn">🗑️</button>
        </div>
    `;
    
    inputArea.appendChild(previewUI);
    
    let playBtn = document.getElementById('playPreviewBtn');
    let sendVoiceBtn = document.getElementById('sendVoiceBtn');
    let deleteVoiceBtn = document.getElementById('deleteVoiceBtn');
    let progressEl = document.getElementById('voiceProgressPreview');
    let durationEl = document.getElementById('previewDuration');
    
    playBtn.addEventListener('click', () => {
        if (audioPlayer && audioPlayer.src === audioUrl && !audioPlayer.paused) {
            audioPlayer.pause();
            playBtn.textContent = '▶️';
        } else {
            if (audioPlayer) audioPlayer.pause();
            playVoiceMessage(audioUrl, playBtn, progressEl, durationEl);
        }
    });
    
    sendVoiceBtn.addEventListener('click', async () => {
        if (recordedAudioBlob && currentChatId) {
            if (currentChatType === 'friend') {
                await sendVoiceMessageToFriend(currentChatId, recordedAudioBlob, recordedDuration);
            } else {
                addMessage('🎤 Голосовое сообщение (бот не может его прослушать)', 'bot', true);
            }
            recordedAudioBlob = null;
            recordedAudioUrl = null;
            document.getElementById('voicePreviewUI').remove();
            
            document.getElementById('messageInput').style.display = 'block';
            document.getElementById('sendMessageBtn').style.display = 'flex';
            document.getElementById('voiceRecordBtn').style.display = 'flex';
        }
    });
    
    deleteVoiceBtn.addEventListener('click', () => {
        recordedAudioBlob = null;
        recordedAudioUrl = null;
        document.getElementById('voicePreviewUI').remove();
        
        document.getElementById('messageInput').style.display = 'block';
        document.getElementById('sendMessageBtn').style.display = 'flex';
        document.getElementById('voiceRecordBtn').style.display = 'flex';
    });
}

// ===== ЗАПИСЬ ГОЛОСА (С ПОДДЕРЖКОЙ МОБИЛЬНЫХ) =====
async function startVoiceRecording() {
    try {
        // Настройки для мобильных устройств
        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                // Для iOS важно
                sampleRate: isIOS ? 44100 : 48000,
                channelCount: 1
            }
        };
        
        console.log('📱 Запрос микрофона с настройками:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Определяем поддерживаемый MIME тип
        let mimeType = 'audio/webm';
        
        if (isIOS) {
            // iOS лучше работает с MP4/AAC
            if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            } else if (MediaRecorder.isTypeSupported('audio/aac')) {
                mimeType = 'audio/aac';
            } else if (MediaRecorder.isTypeSupported('audio/mpeg')) {
                mimeType = 'audio/mpeg';
            }
        } else if (isAndroid) {
            // Android хорошо с webm
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            }
        }
        
        // Проверяем поддержку
        const options = {};
        if (MediaRecorder.isTypeSupported(mimeType)) {
            options.mimeType = mimeType;
            console.log('✅ Используем формат:', mimeType);
        } else {
            console.log('⚠️ Формат не поддерживается, используем стандартный');
        }
        
        mediaRecorder = new MediaRecorder(stream, options);
        audioChunks = [];
        recordingStartTime = Date.now();
        isRecording = true;
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            isRecording = false;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            if (audioContext) {
                await audioContext.close();
                audioContext = null;
            }
            
            stream.getTracks().forEach(track => track.stop());
            
            // Определяем тип файла для сохранения
            const blobType = isIOS ? 'audio/mp4' : 'audio/webm';
            recordedAudioBlob = new Blob(audioChunks, { type: blobType });
            recordedAudioUrl = URL.createObjectURL(recordedAudioBlob);
            recordedDuration = Math.floor((Date.now() - recordingStartTime) / 1000);
            
            hideVoiceRecordingUI();
            
            if (recordedDuration > 1) {
                showVoicePreviewUI(recordedAudioUrl, recordedDuration);
            } else {
                document.getElementById('messageInput').style.display = 'block';
                document.getElementById('sendMessageBtn').style.display = 'flex';
                document.getElementById('voiceRecordBtn').style.display = 'flex';
                
                if (isMobile) {
                    alert('⏱️ Запись слишком короткая (нужно больше 1 секунды)');
                } else {
                    alert('⏱️ Запись слишком короткая');
                }
            }
            
            document.getElementById('voiceRecordBtn').classList.remove('recording');
        };
        
        mediaRecorder.start();
        document.getElementById('voiceRecordBtn').classList.add('recording');
        
        showVoiceRecordingUI();
        createWaveformVisualizer(stream);
        
    } catch (error) {
        console.error('❌ Ошибка доступа к микрофону:', error);
        
        if (error.name === 'NotAllowedError') {
            if (isIOS) {
                alert('📱 Разреши доступ к микрофону в настройках Safari');
            } else if (isAndroid) {
                alert('📱 Разреши доступ к микрофону в настройках браузера');
            } else {
                alert('❌ Нет доступа к микрофону');
            }
        } else if (error.name === 'NotFoundError') {
            alert('🎤 Микрофон не найден');
        } else {
            alert('❌ Ошибка доступа к микрофону');
        }
    }
}

function stopVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
}

function cancelVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordedAudioBlob = null;
        recordedAudioUrl = null;
        hideVoiceRecordingUI();
        document.getElementById('voiceRecordBtn').classList.remove('recording');
        
        document.getElementById('messageInput').style.display = 'block';
        document.getElementById('sendMessageBtn').style.display = 'flex';
        document.getElementById('voiceRecordBtn').style.display = 'flex';
    }
}

// ===== ВОСПРОИЗВЕДЕНИЕ ГОЛОСОВОГО (С ПОДДЕРЖКОЙ МОБИЛЬНЫХ) =====
function playVoiceMessage(audioUrl, buttonElement, progressElement, durationElement) {
    console.log('🎵 Мобильное воспроизведение:', audioUrl);
    
    // Останавливаем текущее воспроизведение
    if (window.currentAudioPlayer) {
        window.currentAudioPlayer.pause();
        window.currentAudioPlayer = null;
    }
    
    // Очищаем предыдущий URL если был
    if (window.currentAudioUrl) {
        URL.revokeObjectURL(window.currentAudioUrl);
    }
    
    // Создаём аудио элемент с правильными настройками для мобильных
    const audio = new Audio();
    
    // Важно для мобильных!
    audio.preload = 'metadata';
    audio.controls = false;
    
    // Проверяем поддержку форматов
    const canPlayMP3 = audio.canPlayType('audio/mpeg');
    const canPlayAAC = audio.canPlayType('audio/aac');
    const canPlayWebM = audio.canPlayType('audio/webm');
    
    console.log('📱 Поддержка форматов:', {
        mp3: canPlayMP3,
        aac: canPlayAAC,
        webm: canPlayWebM
    });
    
    // На iOS лучше всего работает MP3 или AAC
    if (isIOS) {
        if (audioUrl.includes('.webm')) {
            // Пробуем заменить на MP3 если есть
            const mp3Url = audioUrl.replace('.webm', '.mp3');
            const aacUrl = audioUrl.replace('.webm', '.aac');
            
            if (canPlayMP3 === 'probably' || canPlayMP3 === 'maybe') {
                console.log('🍎 iOS: пробуем MP3 версию');
                audio.src = mp3Url;
            } else if (canPlayAAC === 'probably' || canPlayAAC === 'maybe') {
                console.log('🍎 iOS: пробуем AAC версию');
                audio.src = aacUrl;
            } else {
                audio.src = audioUrl;
            }
        } else {
            audio.src = audioUrl;
        }
    } else {
        audio.src = audioUrl;
    }
    
    audio.volume = 1.0;
    
    // Обработчики событий
    audio.addEventListener('loadedmetadata', () => {
        console.log('✅ Аудио загружено, длительность:', audio.duration);
        if (durationElement) {
            const total = Math.floor(audio.duration);
            durationElement.textContent = formatTime(total);
        }
    });
    
    audio.addEventListener('timeupdate', () => {
        if (progressElement && audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressElement.style.width = `${progress}%`;
            
            if (durationElement && audio.currentTime) {
                const current = Math.floor(audio.currentTime);
                const total = Math.floor(audio.duration);
                durationElement.textContent = `${formatTime(current)} / ${formatTime(total)}`;
            }
        }
    });
    
    audio.addEventListener('play', () => {
        console.log('▶️ Воспроизведение началось');
        if (buttonElement) buttonElement.textContent = '⏸️';
    });
    
    audio.addEventListener('pause', () => {
        console.log('⏸️ Воспроизведение приостановлено');
        if (buttonElement) buttonElement.textContent = '▶️';
    });
    
    audio.addEventListener('ended', () => {
        console.log('⏹️ Воспроизведение завершено');
        if (buttonElement) buttonElement.textContent = '▶️';
        if (progressElement) progressElement.style.width = '0%';
        if (durationElement) {
            const total = Math.floor(audio.duration);
            durationElement.textContent = formatTime(total);
        }
        window.currentAudioPlayer = null;
    });
    
    audio.addEventListener('error', (e) => {
        console.error('❌ Ошибка воспроизведения на мобильном:', e);
        console.error('Код ошибки:', audio.error ? audio.error.code : 'unknown');
        console.error('Сообщение:', audio.error ? audio.error.message : 'unknown');
        
        if (isIOS) {
            // Для iOS показываем специальное сообщение
            if (buttonElement) {
                buttonElement.textContent = '🔊';
                buttonElement.style.animation = 'pulse 1s infinite';
                
                // Показываем подсказку
                const hint = document.getElementById('mobileAudioHint');
                if (!hint) {
                    const hintEl = document.createElement('div');
                    hintEl.id = 'mobileAudioHint';
                    hintEl.className = 'mobile-audio-hint';
                    hintEl.textContent = '👆 Нажми ещё раз для воспроизведения';
                    document.body.appendChild(hintEl);
                    
                    setTimeout(() => {
                        const h = document.getElementById('mobileAudioHint');
                        if (h) h.remove();
                    }, 3000);
                }
            }
        } else {
            alert('❌ Не удалось воспроизвести голосовое сообщение');
            if (buttonElement) buttonElement.textContent = '▶️';
        }
    });
    
    // Для мобильных: важно вызвать load() перед play()
    audio.load();
    
    // Пытаемся воспроизвести
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error('❌ Ошибка воспроизведения:', error);
            
            if (error.name === 'NotAllowedError' && isIOS) {
                console.log('🍎 iOS требует пользовательского жеста');
                
                if (buttonElement) {
                    buttonElement.textContent = '🔊';
                    buttonElement.style.animation = 'pulse 1s infinite';
                    
                    // Меняем обработчик на повторную попытку
                    buttonElement.onclick = (e) => {
                        e.stopPropagation();
                        buttonElement.textContent = '▶️';
                        buttonElement.style.animation = '';
                        playVoiceMessage(audioUrl, buttonElement, progressElement, durationElement);
                    };
                }
            } else {
                alert('❌ Ошибка воспроизведения на телефоне');
                if (buttonElement) buttonElement.textContent = '▶️';
            }
        });
    }
    
    window.currentAudioPlayer = audio;
    window.currentAudioUrl = audioUrl;
}

// ===== ОТРИСОВКА РЕАЛЬНЫХ СООБЩЕНИЙ =====
function renderRealMessages(messages) {
    const area = document.getElementById('chatArea');
    if (!area) return;
    
    area.innerHTML = '';
    
    messages.forEach(msg => {
        const isMe = msg.from === window.auth?.currentUser?.uid;
        
        if (msg.type === 'voice') {
            const el = document.createElement('div');
            el.className = `message voice ${isMe ? 'user' : 'bot'}`;
            
            const time = msg.timestamp?.toDate 
                ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const duration = msg.duration || 0;
            const durationStr = formatTime(duration);
            
            el.innerHTML = `
                <div class="voice-message">
                    <button class="voice-play-btn" data-url="${msg.audioUrl}">▶️</button>
                    <div class="voice-timeline">
                        <div class="voice-progress" style="width: 0%"></div>
                    </div>
                    <span class="voice-duration">${durationStr}</span>
                </div>
                <span class="message-time">${time}</span>
            `;
            
            area.appendChild(el);
        } else {
            const el = document.createElement('div');
            el.className = `message ${isMe ? 'user' : 'bot'}`;
            
            const time = msg.timestamp?.toDate 
                ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            el.innerHTML = `${msg.text}<span class="message-time">${time}</span>`;
            area.appendChild(el);
        }
    });
    
    // Добавляем обработчики для голосовых сообщений
    setTimeout(() => {
        document.querySelectorAll('.voice-play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                const messageEl = btn.closest('.message');
                const progressEl = messageEl.querySelector('.voice-progress');
                const durationEl = messageEl.querySelector('.voice-duration');
                
                playVoiceMessage(url, btn, progressEl, durationEl);
            });
        });
    }, 100);
    
    area.scrollTop = area.scrollHeight;
}

// ===== ЗАГРУЗКА ИСТОРИИ =====
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
        await sendMessageToFriend(currentChatId, text);
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

// ===== ДЕЙСТВИЯ =====
function toggleChatActions() {
    const panel = document.getElementById('chatActionsPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    }
}

function showNotification(msg) {
    // Для мобильных используем alert, но можно заменить на красивый тост
    if (isMobile) {
        alert(msg);
    } else {
        alert(msg);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 chat.js загружен (мобильная версия)');
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        // В обработчике backBtn
document.getElementById('audioCallActionBtn')?.remove();
document.getElementById('videoCallActionBtn')?.remove();
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
    
    // КНОПКИ ДЕЙСТВИЙ
    const pinChatActionBtn = document.getElementById('pinChatActionBtn');
    if (pinChatActionBtn) {
        pinChatActionBtn.addEventListener('click', () => {
            togglePinChat();
            document.getElementById('chatActionsPanel').style.display = 'none';
        });
    }
    
    const renameChatBtn = document.getElementById('renameChatBtn');
    if (renameChatBtn) {
        renameChatBtn.addEventListener('click', () => {
            showRenameModal();
            document.getElementById('chatActionsPanel').style.display = 'none';
        });
    }
    
    const muteChatBtn = document.getElementById('muteChatBtn');
    if (muteChatBtn) {
        muteChatBtn.addEventListener('click', () => {
            muteChat();
            document.getElementById('chatActionsPanel').style.display = 'none';
        });
    }
    
    const deleteChatBtn = document.getElementById('deleteChatBtn');
    if (deleteChatBtn) {
        deleteChatBtn.addEventListener('click', () => {
            deleteChatHistory();
            document.getElementById('chatActionsPanel').style.display = 'none';
        });
    }
    
    // МОДАЛКА
    const renameCancelBtn = document.getElementById('renameCancelBtn');
    if (renameCancelBtn) {
        renameCancelBtn.addEventListener('click', hideRenameModal);
    }
    
    const renameConfirmBtn = document.getElementById('renameConfirmBtn');
    if (renameConfirmBtn) {
        renameConfirmBtn.addEventListener('click', renameCurrentChat);
    }
    
    // ГОЛОС
    const voiceBtn = document.getElementById('voiceRecordBtn');
    if (voiceBtn) {
        // На мобильных обрабатываем touch события
        if (isMobile) {
            voiceBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (isRecording) {
                    stopVoiceRecording();
                } else {
                    startVoiceRecording();
                }
            });
        } else {
            voiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isRecording) {
                    stopVoiceRecording();
                } else {
                    startVoiceRecording();
                }
            });
        }
    }
    
    document.addEventListener('click', (e) => {
        if (e.target.id === 'stopRecordingBtn') {
            stopVoiceRecording();
        } else if (e.target.id === 'cancelRecordingBtn') {
            cancelVoiceRecording();
        }
    });
    
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
            }
        });
    }
    
    // Добавляем стили для мобильных подсказок
    if (!document.getElementById('mobileStyles')) {
        const style = document.createElement('style');
        style.id = 'mobileStyles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            
            .mobile-audio-hint {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 30px;
                font-size: 16px;
                z-index: 10000;
                animation: fadeOut 3s forwards;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                white-space: nowrap;
                font-weight: 500;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            @keyframes fadeOut {
                0% { opacity: 1; transform: translateX(-50%) translateY(0); }
                70% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
            
            .voice-play-btn.recording {
                animation: pulse 1s infinite;
                background: #ff4d6d;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
    
    window.openBotChat = openBotChat;
    window.openFriendChat = openFriendChat;
});
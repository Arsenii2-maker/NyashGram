// chat.js — ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

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

// Диагностика устройств
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
const isMobile = isIOS || isAndroid;

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

// ===== КАСТОМНЫЕ ИМЕНА (ИСПРАВЛЕНО) =====
function saveCustomName(chatId, name) {
    if (name && name.trim()) {
        customNames[chatId] = name.trim();
    } else {
        delete customNames[chatId];
    }
    
    localStorage.setItem('nyashgram_custom_names', JSON.stringify(customNames));
    window.customNames = customNames;
    
    const nameEl = document.getElementById('chatContactName');
    if (nameEl && chatId === currentChatId) {
        nameEl.textContent = name.trim();
    }
    
    if (typeof window.renderContacts === 'function') {
        window.renderContacts();
    }
}
    
    console.log('✅ Имя сохранено:', chatId, name);
}

function showRenameModal() {
    const modal = document.getElementById('renameModal');
    const input = document.getElementById('renameInput');
    
    if (!modal || !input || !currentChatId) return;
    
    const nameEl = document.getElementById('chatContactName');
    const currentName = customNames[currentChatId] || (nameEl ? nameEl.textContent : '');
    input.value = currentName;
    
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 100);
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
        window.showToast?.('✏️ Имя изменено');
    }
    
    hideRenameModal();
}

// ===== ФУНКЦИИ ДЛЯ БЫСТРЫХ ОТВЕТОВ (С ИСПРАВЛЕНИЕМ) =====
function showQuickReplies(botId) {
    console.log('💬 Показываем быстрые ответы для бота:', botId);
    
    const panel = document.getElementById('quickReplyPanel');
    if (!panel) return;
    
    const questions = quickQuestions[botId] || quickQuestions.nyashtalk;
    
    panel.innerHTML = '';
    
    questions.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'quick-chip';
        btn.textContent = q;
        
        btn.onclick = () => {
            console.log('📤 Быстрый ответ:', q);
            
            if (currentChatType === 'bot') {
                addMessage(q, 'user', true);
                
                setTimeout(() => {
                    const response = getBotResponse(currentChatId, q);
                    addMessage(response, 'bot', true);
                }, 1000);
            } else {
                sendMessageToFriend(currentChatId, q);
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

// ===== ФУНКЦИИ ДЛЯ ПАНЕЛИ ДЕЙСТВИЙ =====
function toggleChatActions() {
    const panel = document.getElementById('chatActionsPanel');
    if (!panel) return;
    
    const isVisible = panel.style.display === 'flex';
    panel.style.display = isVisible ? 'none' : 'flex';
}

function togglePinChat() {
    if (!currentChatId) return;
    
    if (pinnedChats.includes(currentChatId)) {
        pinnedChats = pinnedChats.filter(id => id !== currentChatId);
        window.showToast?.('📌 Чат откреплён');
    } else {
        pinnedChats.push(currentChatId);
        window.showToast?.('📌 Чат закреплён');
    }
    
    localStorage.setItem('nyashgram_pinned_chats', JSON.stringify(pinnedChats));
    window.pinnedChats = pinnedChats;
    
    if (typeof window.renderContacts === 'function') {
        window.renderContacts();
    }
}

function deleteChatHistory() {
    if (!currentChatId) return;
    
    if (currentChatType === 'bot') {
        if (confirm('Удалить историю чата с ботом?')) {
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
            window.showToast?.('🗑️ История удалена');
        }
    } else {
        window.showToast?.('История сообщений с друзьями хранится в облаке');
    }
}

function muteChat() {
    window.showToast?.('🔇 Звук выключен');
}

// ===== ФУНКЦИИ ДЛЯ ЗАГРУЗКИ ИСТОРИИ =====
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

// ===== ФУНКЦИИ ДЛЯ СОХРАНЕНИЯ СООБЩЕНИЙ =====
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

// ===== ФУНКЦИИ ДЛЯ ЧЕРНОВИКОВ =====
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

// ===== ФУНКЦИИ ДЛЯ ОТПРАВКИ СООБЩЕНИЙ =====
async function sendMessageToFriend(chatId, text) {
    if (!window.auth?.currentUser || !text.trim()) return false;
    
    try {
        const message = {
            chatId: chatId,
            from: window.auth.currentUser.uid,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            readBy: [window.auth.currentUser.uid]
        };
        
        await window.db.collection('messages').add(message);
        
        await window.db.collection('chats').doc(chatId).update({
            lastMessage: {
                text: text,
                from: window.auth.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            },
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error('❌ Ошибка отправки:', error);
        window.showToast?.('❌ Не удалось отправить сообщение', 'error');
        return false;
    }
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
            input.value = text;
        }
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

// ===== ГОЛОСОВЫЕ СООБЩЕНИЯ (ИСПРАВЛЕНО) =====
async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingStartTime = Date.now();
        isRecording = true;
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            isRecording = false;
            stream.getTracks().forEach(track => track.stop());
            
            recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            recordedAudioUrl = URL.createObjectURL(recordedAudioBlob);
            recordedDuration = Math.floor((Date.now() - recordingStartTime) / 1000);
            
            if (recordedDuration > 1) {
                if (currentChatType === 'friend') {
                    await sendVoiceMessageToFriend(currentChatId, recordedAudioBlob, recordedDuration);
                } else {
                    addMessage('🎤 Голосовое сообщение', 'user', true);
                }
            }
            
            document.getElementById('voiceRecordBtn').classList.remove('recording');
        };
        
        mediaRecorder.start();
        document.getElementById('voiceRecordBtn').classList.add('recording');
        
        recordingTimer = setInterval(() => {
            if (isRecording) {
                const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
                console.log('🎤 Запись:', duration, 'сек');
            }
        }, 1000);
        
        window.showToast?.('🎤 Запись начата...', 'info');
        
    } catch (error) {
        console.error('❌ Ошибка доступа к микрофону:', error);
        window.showToast?.('❌ Нет доступа к микрофону', 'error');
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

function cancelVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordedAudioBlob = null;
        recordedAudioUrl = null;
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        document.getElementById('voiceRecordBtn').classList.remove('recording');
        window.showToast?.('❌ Запись отменена', 'info');
    }
}

async function sendVoiceMessageToFriend(chatId, audioBlob, duration) {
    if (!window.auth?.currentUser || !audioBlob) return false;
    
    try {
        const fileName = `voice_${Date.now()}.webm`;
        const storageRef = firebase.storage().ref(`chats/${chatId}/${fileName}`);
        
        await storageRef.put(audioBlob);
        const audioUrl = await storageRef.getDownloadURL();
        
        const message = {
            chatId: chatId,
            from: window.auth.currentUser.uid,
            type: 'voice',
            audioUrl: audioUrl,
            duration: duration,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            readBy: [window.auth.currentUser.uid]
        };
        
        await window.db.collection('messages').add(message);
        
        await window.db.collection('chats').doc(chatId).update({
            lastMessage: {
                text: '🎤 Голосовое сообщение',
                from: window.auth.currentUser.uid,
                type: 'voice',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            },
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка отправки голоса:', error);
        return false;
    }
}

// ===== ОТКРЫТИЕ ЧАТА С БОТОМ =====
function openBotChat(bot) {
    console.log('🤖 Открываем чат с ботом:', bot);
    
    const chatArea = document.getElementById('chatArea');
    if (chatArea) chatArea.innerHTML = '';
    
    if (messagesListener) {
        messagesListener();
        messagesListener = null;
    }
    
    if (chatListener) {
        chatListener();
        chatListener = null;
    }
    
    saveCurrentDraft();
    
    currentChat = bot;
    currentChatId = bot.id;
    currentChatType = 'bot';
    
    if (typeof window.updateCallButtonsVisibility === 'function') {
        window.updateCallButtonsVisibility();
    }
    
    const nameEl = document.getElementById('chatContactName');
    const usernameEl = document.getElementById('chatContactUsername');
    const avatarEl = document.getElementById('chatAvatar');
    
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

// ===== ОТКРЫТИЕ ЧАТА С ДРУГОМ =====
async function openFriendChat(friend) {
    console.log('👥 Открываем чат с другом:', friend);
    
    const chatArea = document.getElementById('chatArea');
    if (chatArea) chatArea.innerHTML = '';
    
    const quickPanel = document.getElementById('quickReplyPanel');
    if (quickPanel) {
        quickPanel.style.display = 'none';
        quickPanel.innerHTML = '';
    }
    
    if (messagesListener) {
        messagesListener();
        messagesListener = null;
    }
    
    if (chatListener) {
        chatListener();
        chatListener = null;
    }
    
    saveCurrentDraft();
    
    currentChat = friend;
    currentChatId = friend.id;
    currentChatType = 'friend';
    
    if (typeof window.updateCallButtonsVisibility === 'function') {
        window.updateCallButtonsVisibility();
    }
    
    const nameEl = document.getElementById('chatContactName');
    const usernameEl = document.getElementById('chatContactUsername');
    const avatarEl = document.getElementById('chatAvatar');
    
    if (nameEl) nameEl.textContent = customNames[friend.id] || friend.name;
    if (usernameEl) usernameEl.textContent = `@${friend.username}`;
    if (avatarEl) avatarEl.style.background = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
    
    
    
    try {
        if (!friend.chatId) {
            const chatsSnapshot = await window.db.collection('chats')
                .where('participants', 'array-contains', window.auth.currentUser.uid)
                .get();
            
            let existingChat = null;
            chatsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.participants.includes(friend.id)) {
                    existingChat = { id: doc.id, ...data };
                }
            });
            
            if (existingChat) {
                friend.chatId = existingChat.id;
                currentChatId = existingChat.id;
            } else {
                const chatId = await window.createPrivateChat(window.auth.currentUser.uid, friend.id);
                friend.chatId = chatId;
                currentChatId = chatId;
            }
        } else {
            currentChatId = friend.chatId;
        }
    } catch (error) {
        console.error('❌ Ошибка при получении/создании чата:', error);
        return;
    }
    
    loadDraft(currentChatId);
    
    listenToMessages(currentChatId, (messages) => {
        renderRealMessages(messages);
    });
    
    listenToChat(currentChatId, (chatData) => {
        if (chatData && chatData.typing) {
            const isTyping = chatData.typing[friend.id];
            const typingEl = document.getElementById('typingIndicator');
            if (typingEl) {
                typingEl.style.display = isTyping ? 'flex' : 'none';
            }
        }
    });
    
    if (typeof window.showScreen === 'function') {
        window.showScreen('chatScreen');
    }
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
            console.error('❌ Ошибка слушателя сообщений:', error);
        });
    
    return messagesListener;
}

function listenToChat(chatId, callback) {
    if (chatListener) chatListener();
    
    chatListener = window.db.collection('chats').doc(chatId)
        .onSnapshot((doc) => {
            if (doc.exists) callback(doc.data());
        }, (error) => {
            console.error('❌ Ошибка слушателя чата:', error);
        });
    
    return chatListener;
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

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playVoiceMessage(audioUrl, buttonElement, progressElement, durationElement) {
    if (window.currentAudioPlayer) {
        window.currentAudioPlayer.pause();
        window.currentAudioPlayer = null;
    }
    
    const audio = new Audio(audioUrl);
    audio.volume = 1.0;
    
    audio.addEventListener('loadedmetadata', () => {
        if (durationElement) {
            const total = Math.floor(audio.duration);
            durationElement.textContent = formatTime(total);
        }
    });
    
    audio.addEventListener('timeupdate', () => {
        if (progressElement && audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressElement.style.width = `${progress}%`;
            
            if (durationElement) {
                const current = Math.floor(audio.currentTime);
                const total = Math.floor(audio.duration);
                durationElement.textContent = `${formatTime(current)} / ${formatTime(total)}`;
            }
        }
    });
    
    audio.addEventListener('play', () => {
        if (buttonElement) buttonElement.textContent = '⏸️';
    });
    
    audio.addEventListener('pause', () => {
        if (buttonElement) buttonElement.textContent = '▶️';
    });
    
    audio.addEventListener('ended', () => {
        if (buttonElement) buttonElement.textContent = '▶️';
        if (progressElement) progressElement.style.width = '0%';
        if (durationElement) {
            const total = Math.floor(audio.duration);
            durationElement.textContent = formatTime(total);
        }
        window.currentAudioPlayer = null;
    });
    
    audio.addEventListener('error', (e) => {
        console.error('❌ Ошибка воспроизведения:', e);
        window.showToast?.('❌ Не удалось воспроизвести', 'error');
        if (buttonElement) buttonElement.textContent = '▶️';
    });
    
    audio.play().catch(error => {
        console.error('❌ Ошибка воспроизведения:', error);
        window.showToast?.('❌ Не удалось воспроизвести', 'error');
    });
    
    window.currentAudioPlayer = audio;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
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
    
    const renameCancelBtn = document.getElementById('renameCancelBtn');
    if (renameCancelBtn) {
        renameCancelBtn.addEventListener('click', hideRenameModal);
    }
    
    const renameConfirmBtn = document.getElementById('renameConfirmBtn');
    if (renameConfirmBtn) {
        renameConfirmBtn.addEventListener('click', renameCurrentChat);
    }
    
    const voiceBtn = document.getElementById('voiceRecordBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isRecording) {
                stopVoiceRecording();
            } else {
                startVoiceRecording();
            }
        });
    }
    
    document.addEventListener('click', (e) => {
        if (e.target.id === 'stopRecordingBtn') {
            stopVoiceRecording();
        } else if (e.target.id === 'cancelRecordingBtn') {
            cancelVoiceRecording();
        }
    });
    
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    const messageInput = document.getElementById('messageInput');
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
});

// ===== ЭКСПОРТ =====
window.openBotChat = openBotChat;
window.openFriendChat = openFriendChat;
window.sendMessage = sendMessage;
window.togglePinChat = togglePinChat;
window.showRenameModal = showRenameModal;
window.renameCurrentChat = renameCurrentChat;
window.deleteChatHistory = deleteChatHistory;
window.muteChat = muteChat;
window.toggleQuickPanel = toggleQuickPanel;
window.showQuickReplies = showQuickReplies;
window.loadChatHistory = loadChatHistory;
window.renderRealMessages = renderRealMessages;
window.toggleChatActions = toggleChatActions;
window.playVoiceMessage = playVoiceMessage;
window.startVoiceRecording = startVoiceRecording;
window.stopVoiceRecording = stopVoiceRecording;
window.cancelVoiceRecording = cancelVoiceRecording;
window.sendVoiceMessageToFriend = sendVoiceMessageToFriend;
window.saveCustomName = saveCustomName;
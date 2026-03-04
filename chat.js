// chat.js — ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

// ===== ИМПОРТ ГЛОБАЛЬНЫХ ПЕРЕМЕННЫХ =====
let customNames = window.customNames || JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let pinnedChats = window.pinnedChats || JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');

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

// ===== ФУНКЦИИ ДЛЯ БЫСТРЫХ ОТВЕТОВ (ДОБАВЛЯЕМ РАНЬШЕ) =====
function showQuickReplies(botId) {
    console.log('💬 Показываем быстрые ответы для бота:', botId);
    
    const panel = document.getElementById('quickReplyPanel');
    if (!panel) {
        console.error('❌ Панель quickReplyPanel не найдена');
        return;
    }
    
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
                input.focus();
            }
        };
        panel.appendChild(btn);
    });
    
    console.log(`✅ Добавлено ${questions.length} быстрых ответов`);
}

function toggleQuickPanel() {
    console.log('🔄 Переключение панели быстрых ответов');
    
    const panel = document.getElementById('quickReplyPanel');
    if (!panel) return;
    
    quickPanelVisible = !quickPanelVisible;
    panel.style.display = quickPanelVisible ? 'flex' : 'none';
    
    console.log('📌 Панель быстрых ответов:', quickPanelVisible ? 'показана' : 'скрыта');
}

// ===== ФУНКЦИИ ДЛЯ ДРУЗЕЙ =====
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

// ===== ОТПРАВКА ГОЛОСОВОГО ДРУЗЬЯМ =====
async function sendVoiceMessageToFriend(chatId, audioBlob, duration) {
    console.log('🎤 Отправка голосового другу:', chatId);
    
    if (!window.auth?.currentUser || !audioBlob) return false;
    
    try {
        const fileName = `voice_${Date.now()}.webm`;
        const storageRef = firebase.storage().ref(`chats/${chatId}/${fileName}`);
        
        window.showToast?.('⏳ Отправка голосового...', 'info');
        
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
        
        window.showToast?.('✅ Голосовое отправлено!', 'success');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка отправки голоса:', error);
        window.showToast?.('❌ Не удалось отправить голосовое', 'error');
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
    console.log('🤖 Открываем чат с ботом:', bot);
    
    // 1. ПОЛНОСТЬЮ ОЧИЩАЕМ ИНТЕРФЕЙС
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.innerHTML = '';
        console.log('🧹 Очищена область чата');
    }
    
    // 2. Отключаем старые слушатели Firebase
    if (messagesListener) {
        messagesListener();
        messagesListener = null;
        console.log('🔇 Отключен старый слушатель сообщений');
    }
    
    if (chatListener) {
        chatListener();
        chatListener = null;
        console.log('🔇 Отключен старый слушатель чата');
    }
    
    // 3. Сохраняем черновик предыдущего чата
    saveCurrentDraft();
    
    // 4. Устанавливаем текущий чат
    currentChat = bot;
    currentChatId = bot.id;
    currentChatType = 'bot';
    console.log('📌 Текущий чат:', { id: currentChatId, type: currentChatType, name: bot.name });
    
    // 5. Обновляем интерфейс чата
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
    
    // 6. Для ботов показываем панель быстрых сообщений
    const quickPanel = document.getElementById('quickReplyPanel');
    if (quickPanel) {
        quickPanel.style.display = 'flex';
        showQuickReplies(bot.id);  // ← ТЕПЕРЬ ФУНКЦИЯ ОПРЕДЕЛЕНА ВЫШЕ!
        console.log('💬 Показана панель быстрых сообщений');
    }
    
    // 7. Для ботов скрываем кнопки звонков
    const audioCallBtn = document.getElementById('audioCallActionBtn');
    const videoCallBtn = document.getElementById('videoCallActionBtn');
    if (audioCallBtn) {
        audioCallBtn.style.display = 'none';
        console.log('🔇 Скрыта кнопка аудиозвонка');
    }
    if (videoCallBtn) {
        videoCallBtn.style.display = 'none';
        console.log('🔇 Скрыта кнопка видеозвонка');
    }
    
    // 8. Загружаем историю чата с ботом
    loadChatHistory(bot.id);
    
    // 9. Загружаем черновик для этого чата
    loadDraft(bot.id);
    
    // 10. Показываем экран чата
    if (typeof window.showScreen === 'function') {
        window.showScreen('chatScreen');
        console.log('🖥️ Показан экран чата');
    }
}

// ===== ОТКРЫТИЕ ЧАТА С ДРУГОМ =====
async function openFriendChat(friend) {
    console.log('👥 Открываем чат с другом:', friend);
    
    // 1. ПОЛНОСТЬЮ ОЧИЩАЕМ ИНТЕРФЕЙС
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.innerHTML = '';
        console.log('🧹 Очищена область чата');
    }
    
    // 2. Очищаем панель быстрых сообщений (она только для ботов)
    const quickPanel = document.getElementById('quickReplyPanel');
    if (quickPanel) {
        quickPanel.style.display = 'none';
        quickPanel.innerHTML = '';
        console.log('🧹 Скрыта панель быстрых сообщений');
    }
    
    // 3. Отключаем старые слушатели Firebase
    if (messagesListener) {
        messagesListener();
        messagesListener = null;
        console.log('🔇 Отключен старый слушатель сообщений');
    }
    
    if (chatListener) {
        chatListener();
        chatListener = null;
        console.log('🔇 Отключен старый слушатель чата');
    }
    
    // 4. Сохраняем черновик предыдущего чата
    saveCurrentDraft();
    
    // 5. Устанавливаем текущий чат
    currentChat = friend;
    currentChatId = friend.id;
    currentChatType = 'friend';
    console.log('📌 Текущий чат:', { id: currentChatId, type: currentChatType, name: friend.name });
    
    // 6. Обновляем интерфейс чата
    const nameEl = document.getElementById('chatContactName');
    const usernameEl = document.getElementById('chatContactUsername');
    const avatarEl = document.getElementById('chatAvatar');
    
    if (nameEl) nameEl.textContent = customNames[friend.id] || friend.name;
    if (usernameEl) usernameEl.textContent = `@${friend.username}`;
    if (avatarEl) avatarEl.style.background = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
    
    // 7. Для друзей показываем кнопки звонков
    const audioCallBtn = document.getElementById('audioCallActionBtn');
    const videoCallBtn = document.getElementById('videoCallActionBtn');
    if (audioCallBtn) {
        audioCallBtn.style.display = 'flex';
        console.log('📞 Показана кнопка аудиозвонка');
    }
    if (videoCallBtn) {
        videoCallBtn.style.display = 'flex';
        console.log('📹 Показана кнопка видеозвонка');
    }
    
    // 8. Получаем или создаём chatId
    try {
        if (!friend.chatId) {
            console.log('🔍 Ищем существующий чат...');
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
                console.log('✅ Найден существующий чат:', currentChatId);
            } else {
                console.log('🆕 Создаём новый чат...');
                const chatId = await window.createPrivateChat(window.auth.currentUser.uid, friend.id);
                friend.chatId = chatId;
                currentChatId = chatId;
                console.log('✅ Создан новый чат:', currentChatId);
            }
        } else {
            currentChatId = friend.chatId;
            console.log('✅ Используем существующий chatId:', currentChatId);
        }
    } catch (error) {
        console.error('❌ Ошибка при получении/создании чата:', error);
        window.showToast?.('❌ Не удалось открыть чат', 'error');
        return;
    }
    
    // 9. Загружаем черновик для этого чата
    loadDraft(currentChatId);
    
    // 10. Слушаем сообщения
    console.log('👂 Устанавливаем слушатель сообщений для чата:', currentChatId);
    listenToMessages(currentChatId, (messages) => {
        console.log(`📨 Получено ${messages.length} сообщений`);
        renderRealMessages(messages);
    });
    
    // 11. Слушаем изменения чата
    listenToChat(currentChatId, (chatData) => {
        if (chatData && chatData.typing) {
            const isTyping = chatData.typing[friend.id];
            const typingEl = document.getElementById('typingIndicator');
            if (typingEl) {
                typingEl.style.display = isTyping ? 'flex' : 'none';
            }
        }
    });
    
    // 12. Показываем экран чата
    if (typeof window.showScreen === 'function') {
        window.showScreen('chatScreen');
        console.log('🖥️ Показан экран чата');
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

// ===== ОСТАЛЬНЫЕ ФУНКЦИИ (ГОЛОС, РЕНДЕР, И Т.Д.) =====
// ... (здесь идут все остальные функции, которые у тебя уже есть)

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
        toggleQuickPanelBtn.addEventListener('click', toggleQuickPanel); // ← ТЕПЕРЬ ФУНКЦИЯ ЕСТЬ!
    }
    
    // ... остальные обработчики
});

// ===== ЭКСПОРТ =====
window.openBotChat = openBotChat;
window.openFriendChat = openFriendChat;
window.showQuickReplies = showQuickReplies; // ← ЭКСПОРТИРУЕМ!
window.toggleQuickPanel = toggleQuickPanel;   // ← ЭКСПОРТИРУЕМ!
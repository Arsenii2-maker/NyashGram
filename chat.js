// chat.js — ПОЛНАЯ ВЕРСИЯ ДЛЯ NYASHGRAM 💗

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let quickPanelVisible = true;
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let isSending = false;

// ===== СИСТЕМА НИКНЕЙМОВ (РЕДКОСТЬ + ПАСХАЛКА) =====
function generateNyashUsername() {
    const common = ['kitik', 'mimi', 'lapka', 'sun', 'star', 'cloud', 'berry', 'paw', 'tail', 'bun', 'cookie', 'milk', 'rose', 'fluff', 'donut', 'mochi', 'pudding', 'sparkle', 'dream', 'angel', 'sugar', 'honey', 'pixel', 'meow', 'purr', 'yumi', 'keks', 'marshmallow', 'toffee', 'caramel', 'lily', 'petal', 'cherry', 'peach', 'plum', 'kiwi', 'mango', 'bubble', 'pearl', 'gem', 'magic', 'soft', 'cozy', 'warm', 'hug', 'love', 'sweetie', 'cutie', 'beauty', 'fancy'];
    const rare = ['phantom_nyash', 'galaxy_cat', 'diamond_paw', 'ultra_mimi', 'super_neko', 'cosmic_tail', 'infinity_love', 'golden_berry', 'royal_fluff', 'divine_pudding'];
    const epic = ['legendary_kitik', 'mythical_rose', 'eternal_sparkle', 'nebula_cloud', 'god_mode_paw'];
    
    const chance = Math.random() * 100;
    let username = "";

    if (chance < 0.1) { // 0.1% шанс на пасхалку
        return "parallelogram";
    } else if (chance < 5) { // 5% шанс на эпик
        username = epic[Math.floor(Math.random() * epic.length)];
    } else if (chance < 20) { // 15% шанс на рарный
        username = rare[Math.floor(Math.random() * rare.length)];
    } else { // Остальное — коммон
        username = common[Math.floor(Math.random() * common.length)];
    }

    const randomNum = Math.floor(Math.random() * 999);
    return `${username}${randomNum}`;
}

// ===== ИНИЦИАЛИЗАЦИЯ ТЕМ И ШРИФТОВ =====
function applySavedTheme() {
    const theme = localStorage.getItem('nyashgram_theme') || 'pastel-pink';
    const font = localStorage.getItem('nyashgram_font') || 'font-cozy';
    document.body.className = `${theme} ${font}`;
}

// ===== ЛОГИКА БОТОВ (ОТВЕТЫ) =====
const botResponses = {
    nyashhelp: {
        themes: "У нас есть темы: pink, rose, blue, beige, lilac, mint! 🎨",
        fonts: "Шрифты: system, rounded, cozy, elegant, bold, mono! 📝",
        default: "Я NyashHelp! Помогу настроить твой уютный уголок. Спроси про темы или шрифты! 💕"
    },
    nyashtalk: {
        hello: ["Приветик! 🌸", "Мяу! Как дела?", "Хай-хай! Соскучилась! 💕"],
        default: ["Расскажи ещё! 🥰", "Ой, как интересно! ✨", "Чмок! 💋"]
    },
    nyashgame: { default: "Сыграем в угадай число? Загадай от 1 до 10! 🎲" },
    nyashhoroscope: { default: "Сегодня звёзды сулят тебе много обнимашек! 🔮" },
    nyashcook: { default: "Сегодня идеальный день для какао с зефирками! ☕" }
};

// ===== РАБОТА С ЧАТОМ =====
function openBotChat(bot) {
    currentChat = bot;
    currentChatId = bot.id;
    currentChatType = 'bot';
    
    document.getElementById('chatContactName').textContent = customNames[bot.id] || bot.name;
    document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
    
    const area = document.getElementById('chatArea');
    area.innerHTML = '';
    
    // Загрузка истории
    if (chatMessages[bot.id]) {
        chatMessages[bot.id].forEach(msg => addMessageToDOM(msg.text, msg.type, msg.time));
    } else {
        const greeting = botResponses[bot.id]?.default || "Приветик! 💕";
        addMessage(greeting, 'bot', true);
    }
    
    document.getElementById('quickReplyPanel').style.display = 'flex';
    window.showScreen('chatScreen');
}

async function openFriendChat(friend) {
    currentChat = friend;
    currentChatType = 'friend';
    currentChatId = friend.chatId || friend.id;

    document.getElementById('chatContactName').textContent = customNames[friend.id] || friend.name;
    document.getElementById('chatContactUsername').textContent = `@${friend.username}`;
    document.getElementById('quickReplyPanel').style.display = 'none';

    // Слушатель сообщений Firebase
    if (window.db) {
        window.db.collection('messages')
            .where('chatId', '==', currentChatId)
            .orderBy('timestamp', 'asc')
            .onSnapshot(snap => {
                const area = document.getElementById('chatArea');
                area.innerHTML = '';
                snap.forEach(doc => {
                    const m = doc.data();
                    const type = m.from === window.auth.currentUser.uid ? 'user' : 'bot';
                    addMessageToDOM(m.text, type, m.timestamp?.toDate().toLocaleTimeString() || '');
                });
                area.scrollTop = area.scrollHeight;
            });
    }

    window.showScreen('chatScreen');
}

function addMessage(text, type, save = false) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addMessageToDOM(text, type, time);
    
    if (save && currentChatId) {
        if (!chatMessages[currentChatId]) chatMessages[currentChatId] = [];
        chatMessages[currentChatId].push({ text, type, time });
        localStorage.setItem('nyashgram_chat_messages', JSON.stringify(chatMessages));
    }
}

function addMessageToDOM(text, type, time) {
    const area = document.getElementById('chatArea');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `${text}<span class="message-time">${time}</span>`;
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    input.value = '';
    // Telegram-style toggle
    document.getElementById('sendMessageBtn').style.display = 'none';
    document.getElementById('voiceRecordBtn').style.display = 'flex';

    if (currentChatType === 'bot') {
        addMessage(text, 'user', true);
        setTimeout(() => {
            const resp = botResponses[currentChatId]?.hello?.[0] || botResponses[currentChatId]?.default || "💕";
            addMessage(resp, 'bot', true);
        }, 800);
    } else {
        await window.db.collection('messages').add({
            chatId: currentChatId,
            from: window.auth.currentUser.uid,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    isSending = false;
}

// ===== ГОЛОСОВЫЕ СООБЩЕНИЯ =====
let mediaRecorder = null;
let isRecording = false;

async function toggleVoice() {
    const vBtn = document.getElementById('voiceRecordBtn');
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            isRecording = true;
            vBtn.classList.add('recording-active');
            vBtn.textContent = '⏹️';
            window.showToast?.('Записываю няшный голос... 🎤');
        } catch (e) { window.showToast?.('Нет доступа к микрофону! 😿'); }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        vBtn.classList.remove('recording-active');
        vBtn.textContent = '🎤';
        window.showToast?.('Голосовое отправлено! ✨');
    }
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();

    // Генерация ника
    const genBtn = document.getElementById('generateUsernameBtn');
    if (genBtn) {
        genBtn.onclick = () => {
            const nick = generateNyashUsername();
            const input = document.getElementById('profileUsername');
            input.value = nick;
            if (nick === 'parallelogram') window.showToast?.('💎 ОГО! ТЫ НАШЕЛ ПАСХАЛКУ: PARALLELOGRAM!');
            document.getElementById('createProfileBtn').disabled = false;
        };
    }

    // Ввод как в Телеграм
    const msgInput = document.getElementById('messageInput');
    msgInput.oninput = (e) => {
        const hasText = e.target.value.trim().length > 0;
        document.getElementById('sendMessageBtn').style.display = hasText ? 'flex' : 'none';
        document.getElementById('voiceRecordBtn').style.display = hasText ? 'none' : 'flex';
    };

    msgInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    document.getElementById('sendMessageBtn').onclick = sendMessage;
    document.getElementById('voiceRecordBtn').onclick = toggleVoice;

    // Темы
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = () => {
            const t = btn.dataset.theme;
            localStorage.setItem('nyashgram_theme', t);
            applySavedTheme();
        };
    });

    // Шрифты
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.onclick = () => {
            const f = btn.dataset.font;
            localStorage.setItem('nyashgram_font', f);
            applySavedTheme();
        };
    });

    // Назад
    document.getElementById('backBtn').onclick = () => window.showScreen('friendsScreen');

    // Звонки
    document.getElementById('callFriendBtn').onclick = () => {
        if (currentChatType === 'friend') {
            window.showToast?.('Вызываем няшу... 📞');
            // Тут вызов функции из calls.js
        } else {
            window.showToast?.('Боты стесняются говорить по телефону 😿');
        }
    };
});

// Экспорт функций
window.openBotChat = openBotChat;
window.openFriendChat = openFriendChat;
window.generateNyashUsername = generateNyashUsername;

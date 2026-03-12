// chat.js — ПОЛНАЯ И ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ NYASHGRAM 💗

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let isSending = false;

// Хранилища данных
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');

// ===== 1. ГЕНЕРАТОР НИКОВ (РЕДКОСТЬ + ПАСХАЛКА) =====
function generateNyashUsername() {
    const common = ['kitik', 'mimi', 'lapka', 'sun', 'star', 'cloud', 'berry', 'paw', 'tail', 'bun', 'cookie', 'milk', 'rose', 'fluff', 'donut', 'mochi', 'pudding', 'sparkle', 'dream', 'angel', 'sugar', 'honey', 'pixel', 'meow', 'purr', 'yumi', 'keks', 'marshmallow', 'toffee', 'caramel', 'lily', 'petal', 'cherry', 'peach', 'plum', 'kiwi', 'mango', 'bubble', 'pearl', 'gem', 'magic', 'soft', 'cozy', 'warm', 'hug', 'love', 'sweetie', 'cutie', 'beauty', 'fancy', 'mint', 'joy', 'smile', 'button', 'cupcake', 'muffin', 'waffle', 'jelly', 'pip', 'squish'];
    const rare = ['phantom_nyash', 'galaxy_cat', 'diamond_paw', 'ultra_mimi', 'super_neko', 'cosmic_tail', 'infinity_love', 'golden_berry', 'royal_fluff', 'divine_pudding', 'mystic_neko', 'starlight_paw'];
    const epic = ['legendary_kitik', 'mythical_rose', 'eternal_sparkle', 'nebula_cloud', 'god_mode_paw', 'omega_mimi'];
    
    const chance = Math.random() * 100;
    let nick = "";

    if (chance < 0.1) return "parallelogram"; // ПАСХАЛКА
    if (chance < 5) nick = epic[Math.floor(Math.random() * epic.length)];
    else if (chance < 20) nick = rare[Math.floor(Math.random() * rare.length)];
    else nick = common[Math.floor(Math.random() * common.length)];

    return `${nick}${Math.floor(Math.random() * 999)}`;
}

// ===== 2. ЛОГИКА 5 БОТОВ (ПОЛНАЯ) =====
const botLogic = {
    nyashhelp: (text) => {
        if (text.includes('тем')) return "У нас 6 милых тем: 🌸 Pastel Pink, 🌸 Milk Rose, 🌙 Night Blue, 📖 Lo-Fi Beige, 💜 Soft Lilac, 🌿 Forest Mint. Смени в настройках!";
        if (text.includes('шрифт')) return "Шрифты: system, rounded, cozy, elegant, bold, mono! Выбирай под настроение 📝";
        if (text.includes('бот')) return "Сейчас нас 5: я (помощник), NyashTalk 🌸, NyashGame 🎮, NyashHoroscope 🔮 и NyashCook 🍳.";
        return "Я NyashHelp! 🩷 Спроси меня про темы, шрифты или других ботов!";
    },
    nyashtalk: (text) => {
        if (text.includes('дела')) return "У меня всё отлично! А у тебя? Рассказывай, я внимательно слушаю 👂";
        if (text.includes('итали')) return "Ой, Италия прекрасна! 🍕 Скоро у нас появится NyashTravel, он расскажет всё!";
        return "Интересно! Расскажи об этом побольше... 💕";
    },
    nyashgame: (text) => {
        if (text.includes('игра')) return "Давай! Выбирай: 1. Угадай число 🔢, 2. Камень-ножницы ✂️, 3. Кости 🎲";
        return "Бросаю кости... Выпало 5! Твоя очередь! 🎲";
    },
    nyashhoroscope: (text) => {
        const signs = ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"];
        if (text.includes('телец')) return "♉ Телец: Сегодня отличный день для обнимашек! В любви гармония ✨";
        return "Напиши свой знак зодиака, и я загляну в звёзды! 🔮";
    },
    nyashcook: (text) => {
        if (text.includes('десерт')) return "Попробуй испечь кексики! 🧁 Нужна мука, сахар и капелька магии.";
        return "Что готовим? Выбирай: Выпечка 🥐, Супы 🍲, Салаты 🥗, Десерты 🍰";
    }
};

// ===== 3. УПРАВЛЕНИЕ ЧАТОМ =====
function openBotChat(bot) {
    currentChat = bot;
    currentChatId = bot.id;
    currentChatType = 'bot';
    
    document.getElementById('chatContactName').textContent = customNames[bot.id] || bot.name;
    document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
    
    const area = document.getElementById('chatArea');
    area.innerHTML = '';
    
    // Загрузка истории бота
    if (chatMessages[bot.id]) {
        chatMessages[bot.id].forEach(m => addMessageToDOM(m.text, m.type, m.time));
    } else {
        addMessage("Приветик! Я твой новый друг! 💕", 'bot', true);
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

    // Слушатель Firebase (Заявки и Сообщения)
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
            });
    }
    window.showScreen('chatScreen');
}

// ===== 4. СООБЩЕНИЯ И ВВОД (TELEGRAM STYLE) =====
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
    toggleInputState(false);

    if (currentChatType === 'bot') {
        addMessage(text, 'user', true);
        setTimeout(() => {
            const reply = botLogic[currentChatId](text.toLowerCase());
            addMessage(reply, 'bot', true);
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

function toggleInputState(hasText) {
    document.getElementById('sendMessageBtn').style.display = hasText ? 'flex' : 'none';
    document.getElementById('voiceRecordBtn').style.display = hasText ? 'none' : 'flex';
}

// ===== 5. ТЕМЫ, ШРИФТЫ И НИКИ (СОБЫТИЯ) =====
document.addEventListener('DOMContentLoaded', () => {
    // Применяем сохраненное
    document.body.className = `${localStorage.getItem('nyashgram_theme') || 'pastel-pink'} ${localStorage.getItem('nyashgram_font') || 'font-cozy'}`;

    // Рандом ника
    document.getElementById('generateUsernameBtn').onclick = () => {
        const nick = generateNyashUsername();
        document.getElementById('profileUsername').value = nick;
        if (nick === 'parallelogram') window.showToast?.('💎 НАЙДЕНА ПАСХАЛКА!');
        document.getElementById('createProfileBtn').disabled = false;
    };

    // Смена тем
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = () => {
            const t = btn.dataset.theme;
            localStorage.setItem('nyashgram_theme', t);
            document.body.className = `${t} ${localStorage.getItem('nyashgram_font') || ''}`;
        };
    });

    // Смена шрифтов
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.onclick = () => {
            const f = btn.dataset.font;
            localStorage.setItem('nyashgram_font', f);
            document.body.className = `${localStorage.getItem('nyashgram_theme') || ''} ${f}`;
        };
    });

    // Поле ввода
    const msgInput = document.getElementById('messageInput');
    msgInput.oninput = (e) => toggleInputState(e.target.value.trim().length > 0);
    msgInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    document.getElementById('sendMessageBtn').onclick = sendMessage;

    // Кнопка назад
    document.getElementById('backBtn').onclick = () => window.showScreen('friendsScreen');
});

// Экспорт
window.openBotChat = openBotChat;
window.openFriendChat = openFriendChat;
window.generateNyashUsername = generateNyashUsername;

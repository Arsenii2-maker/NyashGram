// chat.js — ПОЛНАЯ ВЕРСИЯ С ИСПРАВЛЕННЫМИ ГОЛОСОВЫМИ

let currentChat = null;
let currentChatId = null;
let currentChatType = null;
let isSending = false;
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let chatMessages = JSON.parse(localStorage.getItem('nyashgram_chat_messages') || '{}');

// ГОЛОСОВЫЕ
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = 0;
let isRecording = false;
let recordedAudioBlob = null;
let recordedAudioUrl = null;
let recordedDuration = 0;

// Слушатели Firebase
let messagesListener = null;

// ===== ОТКРЫТИЕ ЧАТА (БОТ) =====
function openBotChat(bot) {
    currentChat = bot;
    currentChatId = bot.id;
    currentChatType = 'bot';
    
    document.getElementById('chatContactName').textContent = customNames[bot.id] || bot.name;
    document.getElementById('chatContactUsername').textContent = `@${bot.username}`;
    document.getElementById('quickReplyPanel').style.display = 'flex';
    showQuickReplies(bot.id);
    
    loadChatHistory(bot.id);
    window.showScreen('chatScreen');
}

// ===== ОТКРЫТИЕ ЧАТА (ДРУГ) =====
async function openFriendChat(friend) {
    currentChat = friend;
    currentChatType = 'friend';
    
    // Скрываем панель ботов
    document.getElementById('quickReplyPanel').style.display = 'none';
    
    try {
        if (!friend.chatId) {
            const snap = await window.db.collection('chats')
                .where('participants', 'array-contains', window.auth.currentUser.uid).get();
            let existing = null;
            snap.forEach(doc => {
                if (doc.data().participants.includes(friend.id)) existing = doc.id;
            });
            currentChatId = existing || await window.createPrivateChat(window.auth.currentUser.uid, friend.id);
        } else {
            currentChatId = friend.chatId;
        }

        document.getElementById('chatContactName').textContent = customNames[friend.id] || friend.name;
        document.getElementById('chatContactUsername').textContent = `@${friend.username}`;
        
        listenToMessages(currentChatId);
        window.showScreen('chatScreen');
    } catch (e) {
        console.error(e);
        window.showToast?.('❌ Ошибка загрузки чата', 'error');
    }
}

// ===== СЛУШАТЕЛЬ СООБЩЕНИЙ =====
function listenToMessages(chatId) {
    if (messagesListener) messagesListener();
    messagesListener = window.db.collection('messages')
        .where('chatId', '==', chatId)
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            const msgs = [];
            snapshot.forEach(doc => msgs.push(doc.data()));
            renderRealMessages(msgs);
        });
}

function renderRealMessages(messages) {
    const area = document.getElementById('chatArea');
    area.innerHTML = '';
    messages.forEach(msg => {
        const isMe = msg.from === window.auth.currentUser.uid;
        const div = document.createElement('div');
        div.className = `message ${isMe ? 'user' : 'bot'}`;
        
        if (msg.type === 'voice') {
            div.innerHTML = `
                <div class="voice-message">
                    <button class="voice-play-btn" onclick="window.playVoiceMessage('${msg.audioUrl}', this)">▶️</button>
                    <div class="voice-duration">${msg.duration}с</div>
                </div>
            `;
        } else {
            div.textContent = msg.text;
        }
        area.appendChild(div);
    });
    area.scrollTop = area.scrollHeight;
}

// ===== ОТПРАВКА ТЕКСТА =====
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    if (currentChatType === 'friend') {
        await window.db.collection('messages').add({
            chatId: currentChatId,
            from: window.auth.currentUser.uid,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        await window.db.collection('chats').doc(currentChatId).update({
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: { text, from: window.auth.currentUser.uid }
        });
    } else {
        // Логика бота (из твоего скрипта)
        addMessage(text, 'user', true);
        setTimeout(() => addMessage("Мяу! Я тебя понял 💕", 'bot', true), 1000);
    }
    input.value = '';
    isSending = false;
}

// ===== ГОЛОСОВЫЕ (ЗАПИСЬ И ОТПРАВКА) =====
async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingStartTime = Date.now();
        
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = async () => {
            recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            recordedDuration = Math.floor((Date.now() - recordingStartTime) / 1000);
            
            if (recordedDuration > 0) {
                await uploadVoiceMessage();
            }
            stream.getTracks().forEach(t => t.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        document.getElementById('voiceRecordBtn').classList.add('recording');
        window.showToast?.('🎙️ Запись пошла...');
    } catch (e) {
        window.showToast?.('❌ Нет доступа к микрофону', 'error');
    }
}

async function uploadVoiceMessage() {
    if (!recordedAudioBlob || currentChatType !== 'friend') return;
    
    const fileName = `voice_${Date.now()}.webm`;
    const ref = window.storage.ref(`chats/${currentChatId}/${fileName}`);
    
    try {
        window.showLoading('Отправляем голос...');
        await ref.put(recordedAudioBlob);
        const url = await ref.getDownloadURL();
        
        await window.db.collection('messages').add({
            chatId: currentChatId,
            from: window.auth.currentUser.uid,
            type: 'voice',
            audioUrl: url,
            duration: recordedDuration,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        window.hideLoading();
    } catch (e) {
        console.error(e);
        window.hideLoading();
    }
}

function stopVoiceRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        document.getElementById('voiceRecordBtn').classList.remove('recording');
    }
}

// Глобальная функция для проигрывания
window.playVoiceMessage = (url, btn) => {
    const audio = new Audio(url);
    btn.textContent = '⏸️';
    audio.play();
    audio.onended = () => btn.textContent = '▶️';
};

// ===== ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);
    document.getElementById('messageInput')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
    
    const vBtn = document.getElementById('voiceRecordBtn');
    vBtn?.addEventListener('mousedown', startVoiceRecording);
    vBtn?.addEventListener('mouseup', stopVoiceRecording);
    vBtn?.addEventListener('touchstart', (e) => { e.preventDefault(); startVoiceRecording(); });
    vBtn?.addEventListener('touchend', (e) => { e.preventDefault(); stopVoiceRecording(); });

    document.getElementById('backBtn')?.addEventListener('click', () => window.showScreen('friendsScreen'));
    document.getElementById('chatMenuBtn')?.addEventListener('click', () => {
        const p = document.getElementById('chatActionsPanel');
        p.style.display = p.style.display === 'none' ? 'flex' : 'none';
    });
});

window.openBotChat = openBotChat;
window.openFriendChat = openFriendChat;

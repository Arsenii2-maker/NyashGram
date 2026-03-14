// calls.js — ИСПРАВЛЕННАЯ ВЕРСИЯ

// ===== СОСТОЯНИЕ ЗВОНКА =====
let peer = null;
let currentCall = null;
let localStream = null;
let remoteStream = null;
let isCallActive = false;
let isMuted = false;
let isVideoEnabled = true;
let isSpeakerOn = true;
let callStartTime = null;
let callTimerInterval = null;
let pendingCall = null;
let currentCallType = 'audio';
let currentCallPeerId = null;
let currentCallFriendId = null;
let peerReconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

// ===== ИНИЦИАЛИЗАЦИЯ PEER =====
function initPeer(userId) {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    
    try {
        peer = new Peer(userId, {
            config: {
                'iceServers': [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' }
                ]
            },
            debug: 0
        });
        
        peer.on('open', (id) => {
            console.log('✅ Peer готов, ID:', id);
            reconnectAttempts = 0;
            if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
                window.db.collection('users').doc(window.auth.currentUser.uid).update({
                    peerId: id,
                    online: true
                }).catch(() => {});
            }
        });
        
        peer.on('call', (call) => {
            console.log('📞 Входящий звонок от:', call.peer);
            pendingCall = call;
            showIncomingCallUI(call);
        });
        
        peer.on('error', (error) => {
            console.log('📞 Peer ошибка:', error.type);
        });
        
        peer.on('disconnected', () => {
            console.log('📞 Peer отключён');
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                if (peerReconnectTimer) clearTimeout(peerReconnectTimer);
                peerReconnectTimer = setTimeout(() => {
                    if (peer) peer.reconnect();
                }, 3000);
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка создания peer:', error);
    }
}

// ===== ПРОВЕРКА, МОЖНО ЛИ ЗВОНИТЬ =====
function canCall() {
    if (!window.currentChat) {
        console.log('📞 Нет текущего чата');
        return false;
    }
    
    const isFriend = window.currentChatType === 'friend';
    console.log('📞 Проверка:', { type: window.currentChatType, isFriend });
    
    return isFriend;
}

// ===== ПОЛУЧЕНИЕ МИКРОФОНА =====
async function getMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        return stream;
    } catch (error) {
        console.error('❌ Ошибка доступа к микрофону:', error);
        
        if (error.name === 'NotAllowedError') {
            window.showToast?.('🎤 Разреши доступ к микрофону', 'error');
        } else if (error.name === 'NotFoundError') {
            window.showToast?.('🎤 Микрофон не найден', 'error');
        } else {
            window.showToast?.('❌ Не удалось получить доступ к микрофону', 'error');
        }
        return null;
    }
}

// ===== НАЧАТЬ ЗВОНОК =====
async function startCall(friendId, friendPeerId) {
    console.log('📞 startCall вызван:', { friendId, friendPeerId });
    
    if (!canCall()) {
        console.log('❌ Нельзя звонить (не друг)');
        window.showToast?.('💬 Звонить можно только друзьям', 'info');
        return;
    }
    
    if (!friendPeerId) {
        console.log('❌ Нет peerId у друга');
        window.showToast?.('💤 Друг сейчас не в сети', 'info');
        return;
    }
    
    const stream = await getMicrophone();
    if (!stream) return;
    
    localStream = stream;
    
    showCallUI('outgoing', friendId);
    
    const call = peer.call(friendPeerId, localStream, {
        metadata: {
            from: window.auth.currentUser.uid,
            fromName: localStorage.getItem('nyashgram_name') || 'Пользователь'
        }
    });
    
    setupCallEvents(call, friendId);
}

// ===== ОТВЕТИТЬ НА ЗВОНОК =====
async function answerCall() {
    if (!pendingCall) return;
    
    console.log('📞 Отвечаем на звонок');
    
    const stream = await getMicrophone();
    if (!stream) return;
    
    localStream = stream;
    pendingCall.answer(localStream);
    
    currentCall = pendingCall;
    setupCallEvents(pendingCall, pendingCall.metadata?.from);
    
    const callScreen = document.getElementById('callScreen');
    if (callScreen) {
        const answerBtn = callScreen.querySelector('#callAnswerBtn');
        if (answerBtn) answerBtn.style.display = 'none';
        
        const stateEl = callScreen.querySelector('#callState');
        if (stateEl) stateEl.textContent = '🔊 Разговор...';
    }
}

// ===== НАСТРОЙКА СОБЫТИЙ ЗВОНКА =====
function setupCallEvents(call, friendId) {
    currentCall = call;
    
    call.on('stream', (remoteStream) => {
        console.log('📡 Получен удалённый поток');
        window.remoteStream = remoteStream;
        
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio) {
            remoteAudio.srcObject = remoteStream;
        }
        
        isCallActive = true;
        callStartTime = Date.now();
        startCallTimer();
        
        const stateEl = document.getElementById('callState');
        if (stateEl) stateEl.textContent = '🔊 Разговор...';
    });
    
    call.on('close', () => {
        console.log('📞 Звонок завершён');
        endCall();
    });
    
    call.on('error', (error) => {
        console.error('❌ Ошибка звонка:', error);
        window.showToast?.('❌ Ошибка во время звонка', 'error');
        endCall();
    });
}

// ===== ЗАВЕРШИТЬ ЗВОНОК =====
function endCall() {
    console.log('📞 Завершаем звонок');
    
    if (currentCall) {
        currentCall.close();
        currentCall = null;
    }
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    isCallActive = false;
    isMuted = false;
    pendingCall = null;
    
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }
    
    hideCallUI();
    
    const chatScreen = document.getElementById('chatScreen');
    if (chatScreen) chatScreen.style.display = 'flex';
    
    window.showToast?.('📞 Звонок завершён', 'info');
}

// ===== MUTE/UNMUTE =====
function toggleMute() {
    if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = isMuted;
        });
        
        isMuted = !isMuted;
        
        const muteBtn = document.getElementById('callMuteBtn');
        if (muteBtn) {
            muteBtn.textContent = isMuted ? '🔇' : '🎤';
            muteBtn.classList.toggle('muted', isMuted);
        }
    }
}

// ===== ГРОМКОСТЬ =====
function toggleSpeaker() {
    isSpeakerOn = !isSpeakerOn;
    
    const remoteAudio = document.getElementById('remoteAudio');
    if (remoteAudio) {
        remoteAudio.muted = !isSpeakerOn;
    }
    
    const speakerBtn = document.getElementById('callSpeakerBtn');
    if (speakerBtn) {
        speakerBtn.textContent = isSpeakerOn ? '🔊' : '🔈';
    }
}

// ===== ТАЙМЕР ЗВОНКА =====
function startCallTimer() {
    const timerEl = document.getElementById('callTimer');
    if (!timerEl) return;
    
    callTimerInterval = setInterval(() => {
        if (!callStartTime) return;
        
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// ===== UI ДЛЯ ЗВОНКОВ =====
function showCallUI(type, friendId) {
    const chatScreen = document.getElementById('chatScreen');
    const callScreen = document.getElementById('callScreen');
    
    if (!callScreen) {
        console.error('❌ Экран звонка не найден');
        return;
    }
    
    if (chatScreen) chatScreen.style.display = 'none';
    callScreen.style.display = 'flex';
    
    const friend = window.friendsList?.find(f => f.id === friendId) || 
                   { name: 'Пользователь' };
    
    const isIncoming = type === 'incoming';
    
    callScreen.innerHTML = `
        <div class="call-container">
            <div class="call-header">
                <button id="callBackBtn" class="call-icon-btn">←</button>
                <div class="call-status">
                    <div class="call-avatar">${friend.name?.[0] || '👤'}</div>
                    <div class="call-name">${friend.name || 'Друг'}</div>
                    <div class="call-state" id="callState">
                        ${type === 'outgoing' ? '📞 Звоним...' : '🔔 Входящий звонок'}
                    </div>
                </div>
                <div></div>
            </div>
            
            <div class="call-timer" id="callTimer">00:00</div>
            
            <div class="call-controls">
                <button id="callMuteBtn" class="call-control-btn">🎤</button>
                <button id="callSpeakerBtn" class="call-control-btn">🔊</button>
                <button id="callEndBtn" class="call-control-btn end-call">📞</button>
                ${isIncoming ? `
                    <button id="callAnswerBtn" class="call-control-btn answer-call">✅ Ответить</button>
                ` : ''}
            </div>
            
            <audio id="remoteAudio" autoplay></audio>
        </div>
    `;
    
    // Добавляем обработчики
    document.getElementById('callBackBtn').addEventListener('click', endCall);
    document.getElementById('callMuteBtn').addEventListener('click', toggleMute);
    document.getElementById('callSpeakerBtn').addEventListener('click', toggleSpeaker);
    document.getElementById('callEndBtn').addEventListener('click', endCall);
    
    if (isIncoming) {
        document.getElementById('callAnswerBtn').addEventListener('click', answerCall);
    }
}

function showIncomingCallUI(call) {
    pendingCall = call;
    const fromId = call.metadata?.from;
    showCallUI('incoming', fromId);
    
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
}

function hideCallUI() {
    const callScreen = document.getElementById('callScreen');
    if (callScreen) {
        callScreen.style.display = 'none';
    }
}

// ===== КНОПКИ В ПАНЕЛИ ДЕЙСТВИЙ =====
function addCallButtonsToPanel() {
    const actionsPanel = document.getElementById('chatActionsPanel');
    if (!actionsPanel) return;
    
    // Удаляем старые кнопки
    document.getElementById('audioCallActionBtn')?.remove();
    
    const audioCallBtn = document.createElement('button');
    audioCallBtn.id = 'audioCallActionBtn';
    audioCallBtn.className = 'action-btn';
    audioCallBtn.innerHTML = '📞';
    audioCallBtn.title = 'аудиозвонок';
    
    actionsPanel.prepend(audioCallBtn);
    
    audioCallBtn.addEventListener('click', handleCallClick);
}

async function handleCallClick() {
    console.log('📞 Нажата кнопка звонка');
    console.log('📞 Текущий чат:', {
        type: window.currentChatType,
        id: window.currentChatId,
        exists: !!window.currentChat
    });
    
    if (!window.currentChat || !window.currentChatId) {
        console.log('❌ Нет открытого чата');
        window.showToast?.('❌ Сначала открой чат с другом', 'error');
        return;
    }
    
    if (window.currentChatType !== 'friend') {
        console.log('❌ Это не друг, тип:', window.currentChatType);
        window.showToast?.('🤖 Ботам нельзя звонить', 'info');
        return;
    }
    
    try {
        const friendDoc = await window.db.collection('users').doc(window.currentChatId).get();
        
        if (!friendDoc.exists) {
            window.showToast?.('❌ Друг не найден', 'error');
            return;
        }
        
        const friendData = friendDoc.data();
        console.log('📞 Данные друга:', friendData);
        
        if (!friendData.peerId) {
            window.showToast?.('💤 Друг сейчас не в сети', 'info');
            return;
        }
        
        startCall(window.currentChatId, friendData.peerId);
        
    } catch (error) {
        console.error('❌ Ошибка при звонке:', error);
        window.showToast?.('❌ Не удалось совершить звонок', 'error');
    }
}

// ===== ОБНОВЛЕНИЕ ВИДИМОСТИ КНОПОК =====
function updateCallButtonsVisibility() {
    const audioBtn = document.getElementById('audioCallActionBtn');
    if (!audioBtn) return;
    
    if (window.currentChatType === 'friend') {
        audioBtn.style.display = 'flex';
        console.log('📞 Показываем кнопку звонка (друг)');
    } else {
        audioBtn.style.display = 'none';
        console.log('📞 Скрываем кнопку звонка (бот)');
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📞 calls.js загружен');
    
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    document.addEventListener('userAuthenticated', () => {
        if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
            const userId = window.auth.currentUser.uid;
            console.log('📞 Инициализация Peer для:', userId);
            setTimeout(() => initPeer(userId), 1000);
        }
    });
    
    const observer = new MutationObserver(() => {
        if (document.getElementById('chatActionsPanel') && !document.getElementById('audioCallActionBtn')) {
            addCallButtonsToPanel();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// ===== ЭКСПОРТ =====
window.startCall = startCall;
window.endCall = endCall;
window.answerCall = answerCall;
window.toggleMute = toggleMute;
window.toggleSpeaker = toggleSpeaker;
window.updateCallButtonsVisibility = updateCallButtonsVisibility;
window.canCall = canCall;
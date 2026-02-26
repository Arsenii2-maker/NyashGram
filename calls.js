// calls.js — АУДИО И ВИДЕО ЗВОНКИ ДЛЯ NYASHGRAM

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
let currentCallType = 'audio'; // 'audio' или 'video'
let currentCallPeerId = null;
let currentCallFriendId = null;

// ===== ИНИЦИАЛИЗАЦИЯ PEER =====
function initPeer(userId) {
    if (peer) {
        peer.destroy();
    }
    
    // Используем бесплатные STUN серверы Google
    peer = new Peer(userId, {
        config: {
            'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        }
    });
    
    peer.on('open', (id) => {
        console.log('✅ Peer готов, ID:', id);
        if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
            window.db.collection('users').doc(window.auth.currentUser.uid).update({
                peerId: id,
                online: true
            });
        }
    });
    
    peer.on('call', (call) => {
        console.log('📞 Входящий звонок от:', call.peer);
        console.log('📞 Метаданные:', call.metadata);
        
        pendingCall = call;
        
        // Получаем информацию о звонящем
        const isVideo = call.metadata?.type === 'video';
        
        // Показываем уведомление
        showIncomingCallUI(call, isVideo);
        
        // Вибрация на мобильных
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // Уведомление
        if (Notification.permission === 'granted') {
            new Notification(`📞 ${isVideo ? '📹' : '🎤'} Входящий ${isVideo ? 'видео' : 'аудио'} звонок!`, {
                body: 'Кто-то звонит тебе в NyashGram',
                icon: '/icon.png',
                silent: true
            });
        }
    });
    
    peer.on('error', (error) => {
        console.error('❌ Peer ошибка:', error);
        if (error.type === 'unavailable-id') {
            const newId = userId + '-' + Math.floor(Math.random() * 1000);
            initPeer(newId);
        } else {
            window.showToast?.('❌ Ошибка соединения', 'error');
        }
    });
    
    peer.on('disconnected', () => {
        console.log('📞 Peer отключён, переподключаемся...');
        setTimeout(() => {
            peer.reconnect();
        }, 3000);
    });
    
    return peer;
}

// ===== ПОЛУЧЕНИЕ МЕДИАПОТОКА =====
async function getMediaStream(withVideo = false) {
    try {
        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };
        
        if (withVideo) {
            constraints.video = {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            };
        }
        
        console.log('📹 Запрашиваем медиа:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
        
    } catch (error) {
        console.error('❌ Ошибка доступа к медиа:', error);
        
        if (error.name === 'NotAllowedError') {
            window.showToast?.('📹 Разреши доступ к камере и микрофону', 'error');
        } else if (error.name === 'NotFoundError') {
            window.showToast?.('📹 Камера или микрофон не найдены', 'error');
        } else {
            window.showToast?.('❌ Не удалось получить доступ к медиа', 'error');
        }
        return null;
    }
}

// ===== НАЧАТЬ ЗВОНОК =====
async function startCall(friendId, friendPeerId, callType = 'audio') {
    console.log(`📞 Начинаем ${callType} звонок с:`, friendId);
    
    if (!friendPeerId) {
        window.showToast?.('❌ Друг сейчас не в сети', 'error');
        return;
    }
    
    // Получаем медиапоток
    localStream = await getMediaStream(callType === 'video');
    if (!localStream) return;
    
    currentCallType = callType;
    currentCallPeerId = friendPeerId;
    currentCallFriendId = friendId;
    
    // Показываем UI звонка
    showCallUI('outgoing', friendId, callType);
    
    // Совершаем звонок с метаданными
    const callOptions = {
        metadata: {
            type: callType,
            from: window.auth.currentUser.uid,
            fromName: localStorage.getItem('nyashgram_name') || 'Пользователь'
        }
    };
    
    currentCall = peer.call(friendPeerId, localStream, callOptions);
    
    setupCallEvents(currentCall, friendId);
}

// ===== ОТВЕТИТЬ НА ЗВОНОК =====
async function answerCall(call, withVideo = false) {
    console.log('📞 Отвечаем на звонок');
    
    // Получаем медиапоток (с видео если нужно)
    localStream = await getMediaStream(withVideo);
    if (!localStream) return;
    
    // Отвечаем
    call.answer(localStream);
    
    currentCall = call;
    currentCallType = call.metadata?.type || 'audio';
    currentCallPeerId = call.peer;
    currentCallFriendId = call.metadata?.from;
    
    setupCallEvents(call, call.metadata?.from);
    
    // Обновляем UI
    document.getElementById('callState').textContent = '🔊 Разговор...';
    document.getElementById('callAnswerBtn').style.display = 'none';
}

// ===== НАСТРОЙКА СОБЫТИЙ ЗВОНКА =====
function setupCallEvents(call, friendId) {
    
    call.on('stream', (remoteStream) => {
        console.log('📡 Получен удалённый поток');
        
        window.remoteStream = remoteStream;
        
        // Подключаем видео если есть
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo && remoteStream.getVideoTracks().length > 0) {
            remoteVideo.srcObject = remoteStream;
            remoteVideo.style.display = 'block';
        }
        
        // Подключаем аудио
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio) {
            remoteAudio.srcObject = remoteStream;
        }
        
        isCallActive = true;
        callStartTime = Date.now();
        startCallTimer();
        
        // Обновляем UI
        document.getElementById('callState').textContent = '🔊 Разговор...';
        if (document.getElementById('callAnswerBtn')) {
            document.getElementById('callAnswerBtn').style.display = 'none';
        }
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
    isVideoEnabled = true;
    isSpeakerOn = true;
    pendingCall = null;
    
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }
    
    // Скрываем UI звонка
    hideCallUI();
    
    // Показываем экран чата
    document.getElementById('chatScreen').style.display = 'flex';
    
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
        
        window.showToast?.(isMuted ? '🔇 Микрофон выключен' : '🎤 Микрофон включён', 'info', 1500);
    }
}

// ===== ВКЛ/ВЫКЛ ВИДЕО =====
function toggleVideo() {
    if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        if (videoTracks.length > 0) {
            videoTracks.forEach(track => {
                track.enabled = !isVideoEnabled;
            });
            
            isVideoEnabled = !isVideoEnabled;
            
            const videoBtn = document.getElementById('callVideoBtn');
            if (videoBtn) {
                videoBtn.textContent = isVideoEnabled ? '📹' : '🚫';
                videoBtn.classList.toggle('video-off', !isVideoEnabled);
            }
            
            // Показываем/скрываем локальное видео
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.style.display = isVideoEnabled ? 'block' : 'none';
            }
            
            window.showToast?.(isVideoEnabled ? '📹 Видео включено' : '🚫 Видео выключено', 'info', 1500);
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
function showCallUI(type, friendId, callType = 'audio') {
    // Скрываем чат
    document.getElementById('chatScreen').style.display = 'none';
    
    // Показываем экран звонка
    const callScreen = document.getElementById('callScreen');
    if (!callScreen) return;
    
    callScreen.style.display = 'flex';
    
    // Получаем данные друга
    const friend = window.friendsList?.find(f => f.id === friendId) || 
                   { name: 'Пользователь', username: 'user' };
    
    const isVideo = callType === 'video';
    const isIncoming = type === 'incoming';
    
    callScreen.innerHTML = `
        <div class="call-container ${isVideo ? 'video-call' : ''}">
            <div class="call-header">
                <button id="callBackBtn" class="call-icon-btn">←</button>
                <div class="call-status">
                    <div class="call-avatar" id="callAvatar">${friend.name?.[0] || '👤'}</div>
                    <div class="call-name" id="callName">${friend.name || 'Друг'}</div>
                    <div class="call-state" id="callState">
                        ${type === 'outgoing' ? '📞 Звоним...' : '🔔 Входящий звонок'}
                    </div>
                </div>
                <div></div>
            </div>
            
            ${isVideo ? `
                <div class="video-container">
                    <video id="remoteVideo" class="remote-video" autoplay playsinline></video>
                    <video id="localVideo" class="local-video" autoplay playsinline muted></video>
                </div>
            ` : `
                <div class="call-timer" id="callTimer">00:00</div>
            `}
            
            <div class="call-controls">
                <button id="callMuteBtn" class="call-control-btn" title="микрофон">🎤</button>
                <button id="callSpeakerBtn" class="call-control-btn" title="громкость">🔊</button>
                ${isVideo ? '<button id="callVideoBtn" class="call-control-btn" title="видео">📹</button>' : ''}
                <button id="callEndBtn" class="call-control-btn end-call" title="завершить">📞</button>
                ${isIncoming ? `
                    <button id="callAnswerBtn" class="call-control-btn answer-call" title="ответить">
                        ✅ Ответить
                    </button>
                    <button id="callAnswerVideoBtn" class="call-control-btn answer-video-call" title="ответить с видео">
                        📹 Ответить с видео
                    </button>
                ` : ''}
            </div>
            
            <audio id="remoteAudio" autoplay></audio>
        </div>
    `;
    
    // Подключаем медиаэлементы
    if (isVideo && localStream) {
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
        }
    }
    
    // Обработчики
    document.getElementById('callBackBtn')?.addEventListener('click', () => {
        endCall();
    });
    
    document.getElementById('callMuteBtn')?.addEventListener('click', toggleMute);
    document.getElementById('callSpeakerBtn')?.addEventListener('click', toggleSpeaker);
    
    if (isVideo) {
        document.getElementById('callVideoBtn')?.addEventListener('click', toggleVideo);
    }
    
    document.getElementById('callEndBtn')?.addEventListener('click', endCall);
    
    if (isIncoming) {
        document.getElementById('callAnswerBtn')?.addEventListener('click', () => {
            if (pendingCall) {
                answerCall(pendingCall, false);
            }
        });
        
        document.getElementById('callAnswerVideoBtn')?.addEventListener('click', () => {
            if (pendingCall) {
                answerCall(pendingCall, true);
            }
        });
    }
}

function showIncomingCallUI(call, isVideo) {
    pendingCall = call;
    
    // Получаем ID звонящего
    const fromId = call.metadata?.from;
    
    // Показываем UI
    showCallUI('incoming', fromId, isVideo ? 'video' : 'audio');
    
    // Звук звонка (можно добавить потом)
    // playRingtone();
}

function hideCallUI() {
    const callScreen = document.getElementById('callScreen');
    if (callScreen) {
        callScreen.style.display = 'none';
    }
}

// ===== ДОБАВЛЯЕМ КНОПКИ ЗВОНКОВ В ПАНЕЛЬ ДЕЙСТВИЙ =====
function addCallButtonsToChat() {
    const actionsPanel = document.getElementById('chatActionsPanel');
    if (!actionsPanel) return;
    
    // Проверяем, не добавлены ли уже
    if (document.getElementById('audioCallActionBtn')) return;
    
    // Создаём кнопки
    const audioCallBtn = document.createElement('button');
    audioCallBtn.id = 'audioCallActionBtn';
    audioCallBtn.className = 'action-btn';
    audioCallBtn.innerHTML = '🎤';
    audioCallBtn.title = 'аудиозвонок';
    
    const videoCallBtn = document.createElement('button');
    videoCallBtn.id = 'videoCallActionBtn';
    videoCallBtn.className = 'action-btn';
    videoCallBtn.innerHTML = '📹';
    videoCallBtn.title = 'видеозвонок';
    
    // Добавляем в начало панели
    actionsPanel.prepend(videoCallBtn);
    actionsPanel.prepend(audioCallBtn);
    
    // Обработчики
    audioCallBtn.addEventListener('click', async () => {
        if (window.currentChatType !== 'friend') {
            window.showToast?.('🤖 Ботам нельзя звонить', 'info');
            return;
        }
        
        try {
            const friendDoc = await window.db.collection('users').doc(window.currentChatId).get();
            const friendData = friendDoc.data();
            
            if (!friendData.peerId) {
                window.showToast?.('💤 Друг сейчас не в сети', 'info');
                return;
            }
            
            startCall(window.currentChatId, friendData.peerId, 'audio');
            
        } catch (error) {
            console.error('❌ Ошибка:', error);
            window.showToast?.('❌ Не удалось совершить звонок', 'error');
        }
    });
    
    videoCallBtn.addEventListener('click', async () => {
        if (window.currentChatType !== 'friend') {
            window.showToast?.('🤖 Ботам нельзя звонить', 'info');
            return;
        }
        
        try {
            const friendDoc = await window.db.collection('users').doc(window.currentChatId).get();
            const friendData = friendDoc.data();
            
            if (!friendData.peerId) {
                window.showToast?.('💤 Друг сейчас не в сети', 'info');
                return;
            }
            
            startCall(window.currentChatId, friendData.peerId, 'video');
            
        } catch (error) {
            console.error('❌ Ошибка:', error);
            window.showToast?.('❌ Не удалось совершить звонок', 'error');
        }
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📞 calls.js загружен');
    
    // Запрашиваем разрешение на уведомления
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Инициализируем Peer после авторизации
    document.addEventListener('userAuthenticated', () => {
        if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
            const userId = window.auth.currentUser.uid;
            initPeer(userId);
        }
    });
    
    // Добавляем кнопки в панель действий при открытии чата
    const observer = new MutationObserver(() => {
        if (document.getElementById('chatActionsPanel') && !document.getElementById('audioCallActionBtn')) {
            addCallButtonsToChat();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Добавляем стили для звонков
    if (!document.getElementById('callStyles')) {
        const style = document.createElement('style');
        style.id = 'callStyles';
        style.textContent = `
            .call-screen {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
                display: none;
            }
            
            .call-container {
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 20px;
            }
            
            .call-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
            }
            
            .call-status {
                text-align: center;
            }
            
            .call-avatar {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                margin: 20px auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                border: 3px solid white;
            }
            
            .call-name {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
            }
            
            .call-state {
                font-size: 16px;
                opacity: 0.8;
            }
            
            .call-timer {
                text-align: center;
                font-size: 48px;
                font-family: monospace;
                margin: 40px 0;
                text-shadow: 0 0 10px rgba(255,255,255,0.5);
            }
            
            .call-controls {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: auto;
                padding: 20px;
                flex-wrap: wrap;
            }
            
            .call-control-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                background: rgba(255,255,255,0.2);
                color: white;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .call-control-btn:hover {
                transform: scale(1.1);
                background: rgba(255,255,255,0.3);
            }
            
            .call-control-btn.muted {
                background: rgba(255,0,0,0.3);
            }
            
            .call-control-btn.video-off {
                background: rgba(128,128,128,0.3);
            }
            
            .end-call {
                background: #ff4d6d;
            }
            
            .end-call:hover {
                background: #ff1a4d;
            }
            
            .answer-call, .answer-video-call {
                background: #4caf50;
                width: auto;
                padding: 0 20px;
                border-radius: 30px;
            }
            
            .answer-video-call {
                background: #9b59b6;
            }
            
            .call-icon-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                background: rgba(255,255,255,0.2);
                color: white;
                font-size: 20px;
                cursor: pointer;
            }
            
            /* Видеозвонки */
            .video-call .call-avatar {
                display: none;
            }
            
            .video-container {
                flex: 1;
                position: relative;
                margin: 10px 0;
                border-radius: 20px;
                overflow: hidden;
                background: #1a1a1a;
            }
            
            .remote-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .local-video {
                position: absolute;
                bottom: 20px;
                right: 20px;
                width: 120px;
                height: 160px;
                object-fit: cover;
                border-radius: 10px;
                border: 2px solid white;
                background: #333;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .incoming-call {
                animation: pulse 1s infinite;
            }
            
            /* Мобильная адаптация */
            @media (max-width: 480px) {
                .local-video {
                    width: 80px;
                    height: 120px;
                }
                
                .call-control-btn {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// ===== ЭКСПОРТ =====
window.startCall = startCall;
window.endCall = endCall;
window.answerCall = answerCall;
window.toggleMute = toggleMute;
window.toggleVideo = toggleVideo;
window.toggleSpeaker = toggleSpeaker;
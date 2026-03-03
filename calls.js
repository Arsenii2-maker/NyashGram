// calls.js — ИСПРАВЛЕННАЯ ВЕРСИЯ ТОЛЬКО ДЛЯ ЗВОНКОВ

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

// ===== ИНИЦИАЛИЗАЦИЯ PEER С УЛУЧШЕННЫМ ПОДКЛЮЧЕНИЕМ =====
function initPeer(userId) {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    
    try {
        // Используем более стабильные STUN серверы
        peer = new Peer(userId, {
            config: {
                'iceServers': [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' },
                    { urls: 'stun:stun4.l.google.com:19302' }
                ]
            },
            debug: 0, // Отключаем лишние логи
            secure: true // Используем безопасное соединение
        });
        
        peer.on('open', (id) => {
            console.log('✅ Peer готов, ID:', id);
            reconnectAttempts = 0; // Сбрасываем счётчик попыток
            if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
                window.db.collection('users').doc(window.auth.currentUser.uid).update({
                    peerId: id,
                    online: true
                }).catch(() => {});
            }
        });
        
        peer.on('call', (call) => {
            console.log('📞 Входящий звонок');
            pendingCall = call;
            const isVideo = call.metadata?.type === 'video';
            showIncomingCallUI(call, isVideo);
        });
        
        peer.on('error', (error) => {
            console.log('📞 Peer ошибка (игнорируем):', error.type);
            // Не показываем пользователю
        });
        
        peer.on('disconnected', () => {
            console.log('📞 Peer отключён');
            
            // Пытаемся переподключиться несколько раз
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`🔄 Попытка переподключения ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
                
                if (peerReconnectTimer) clearTimeout(peerReconnectTimer);
                peerReconnectTimer = setTimeout(() => {
                    if (peer) {
                        peer.reconnect();
                    }
                }, 3000);
            } else {
                console.log('❌ Не удалось переподключиться, создаём новый peer');
                // Пробуем создать новый peer с другим ID
                if (window.auth?.currentUser) {
                    setTimeout(() => {
                        initPeer(window.auth.currentUser.uid + '_' + Date.now());
                    }, 5000);
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка создания peer:', error);
    }
}

// ===== ПРОВЕРКА, МОЖНО ЛИ ЗВОНИТЬ =====
function canCall() {
    // Проверяем, что это друг, а не бот
    if (!window.currentChat) {
        console.log('📞 Нет текущего чата');
        return false;
    }
    
    // Друзья имеют тип 'friend', боты 'bot'
    const isFriend = window.currentChatType === 'friend';
    
    console.log('📞 Проверка звонка:', {
        currentChatId: window.currentChatId,
        currentChatType: window.currentChatType,
        isFriend: isFriend,
        canCall: isFriend
    });
    
    return isFriend;
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

// ===== НАЧАТЬ ЗВОНОК (С ПРАВИЛЬНОЙ ПРОВЕРКОЙ) =====
async function startCall(friendId, friendPeerId, callType = 'audio') {
    console.log('📞 Попытка звонка:', { friendId, friendPeerId, callType, currentChatType: window.currentChatType });
    
    // Проверяем, что это друг
    if (!canCall()) {
        console.log('❌ Звонок отклонён: не друг');
        window.showToast?.('💬 Звонить можно только друзьям', 'info', 2000);
        return;
    }
    
    if (!friendPeerId) {
        console.log('❌ Друг не в сети');
        window.showToast?.('💤 Друг сейчас не в сети', 'info', 2000);
        return;
    }
    
    try {
        console.log('🎤 Получаем доступ к микрофону...');
        localStream = await getMediaStream(callType === 'video');
        if (!localStream) return;
        
        currentCallType = callType;
        currentCallPeerId = friendPeerId;
        currentCallFriendId = friendId;
        
        showCallUI('outgoing', friendId, callType);
        
        console.log('📞 Совершаем звонок...');
        currentCall = peer.call(friendPeerId, localStream, {
            metadata: {
                type: callType,
                from: window.auth.currentUser.uid,
                fromName: localStorage.getItem('nyashgram_name') || 'Пользователь'
            }
        });
        
        setupCallEvents(currentCall, friendId);
        
    } catch (error) {
        console.error('❌ Ошибка звонка:', error);
        window.showToast?.('❌ Не удалось совершить звонок', 'error');
    }
}

// ===== ОТВЕТИТЬ НА ЗВОНОК =====
async function answerCall(call, withVideo = false) {
    console.log('📞 Отвечаем на звонок');
    
    localStream = await getMediaStream(withVideo);
    if (!localStream) return;
    
    call.answer(localStream);
    
    currentCall = call;
    currentCallType = call.metadata?.type || 'audio';
    currentCallPeerId = call.peer;
    currentCallFriendId = call.metadata?.from;
    
    setupCallEvents(call, call.metadata?.from);
    
    const callState = document.getElementById('callState');
    if (callState) callState.textContent = '🔊 Разговор...';
    
    const answerBtn = document.getElementById('callAnswerBtn');
    const answerVideoBtn = document.getElementById('callAnswerVideoBtn');
    if (answerBtn) answerBtn.style.display = 'none';
    if (answerVideoBtn) answerVideoBtn.style.display = 'none';
}

// ===== НАСТРОЙКА СОБЫТИЙ ЗВОНКА =====
function setupCallEvents(call, friendId) {
    
    call.on('stream', (remoteStream) => {
        console.log('📡 Получен удалённый поток');
        
        window.remoteStream = remoteStream;
        
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo && remoteStream.getVideoTracks().length > 0) {
            remoteVideo.srcObject = remoteStream;
            remoteVideo.style.display = 'block';
        }
        
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio) {
            remoteAudio.srcObject = remoteStream;
        }
        
        isCallActive = true;
        callStartTime = Date.now();
        startCallTimer();
        
        const callState = document.getElementById('callState');
        if (callState) callState.textContent = '🔊 Разговор...';
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
    
    hideCallUI();
    
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
    document.getElementById('chatScreen').style.display = 'none';
    
    const callScreen = document.getElementById('callScreen');
    if (!callScreen) return;
    
    callScreen.style.display = 'flex';
    
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
                    <button id="callAnswerBtn" class="call-control-btn answer-call" title="ответить">✅ Аудио</button>
                    <button id="callAnswerVideoBtn" class="call-control-btn answer-video-call" title="ответить с видео">📹 Видео</button>
                ` : ''}
            </div>
            
            <audio id="remoteAudio" autoplay></audio>
        </div>
    `;
    
    if (isVideo && localStream) {
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
        }
    }
    
    document.getElementById('callBackBtn')?.addEventListener('click', endCall);
    document.getElementById('callMuteBtn')?.addEventListener('click', toggleMute);
    document.getElementById('callSpeakerBtn')?.addEventListener('click', toggleSpeaker);
    
    if (isVideo) {
        document.getElementById('callVideoBtn')?.addEventListener('click', toggleVideo);
    }
    
    document.getElementById('callEndBtn')?.addEventListener('click', endCall);
    
    if (isIncoming) {
        document.getElementById('callAnswerBtn')?.addEventListener('click', () => {
            if (pendingCall) answerCall(pendingCall, false);
        });
        
        document.getElementById('callAnswerVideoBtn')?.addEventListener('click', () => {
            if (pendingCall) answerCall(pendingCall, true);
        });
    }
}

function showIncomingCallUI(call, isVideo) {
    pendingCall = call;
    const fromId = call.metadata?.from;
    showCallUI('incoming', fromId, isVideo ? 'video' : 'audio');
    
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

// ===== УДАЛЯЕМ КНОПКУ ИЗ ХЕДЕРА =====
function removeCallButtonFromHeader() {
    const oldCallBtn = document.getElementById('callFriendBtn');
    if (oldCallBtn) {
        oldCallBtn.remove();
        console.log('✅ Кнопка звонка удалена из хедера');
    }
}

// ===== ДОБАВЛЯЕМ КНОПКИ ТОЛЬКО В ПАНЕЛЬ ДЕЙСТВИЙ =====
function addCallButtonsToPanel() {
    const actionsPanel = document.getElementById('chatActionsPanel');
    if (!actionsPanel) return;
    
    // Удаляем старые кнопки
    document.getElementById('audioCallActionBtn')?.remove();
    document.getElementById('videoCallActionBtn')?.remove();
    
    // Создаём новые кнопки
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
    
    // Добавляем обработчики
    audioCallBtn.addEventListener('click', () => handleCallClick('audio'));
    videoCallBtn.addEventListener('click', () => handleCallClick('video'));
    
    console.log('✅ Кнопки звонков добавлены в панель действий');
}

async function handleCallClick(type) {
    console.log('📞 Нажата кнопка звонка:', type);
    console.log('📞 Текущий чат:', {
        currentChatId: window.currentChatId,
        currentChatType: window.currentChatType,
        currentChat: window.currentChat
    });
    
    // Проверяем, что это друг
    if (!window.currentChat) {
        console.log('❌ Нет текущего чата');
        window.showToast?.('❌ Ошибка: нет чата', 'error');
        return;
    }
    
    if (window.currentChatType !== 'friend') {
        console.log('❌ Это не друг, тип:', window.currentChatType);
        window.showToast?.('🤖 Ботам нельзя звонить', 'info', 2000);
        return;
    
    if (!window.currentChatId) {
        console.log('❌ Нет ID чата');
        window.showToast?.('❌ Ошибка: нет ID чата', 'error');
        return;
    }
    
    const friendData = friendDoc.data();
        console.log('📞 Данные друга:', friendData);
        
        if (!friendData.peerId) {
            console.log('❌ У друга нет peerId');
            window.showToast?.('💤 Друг сейчас не в сети', 'info', 2000);
            return;
        }
        
        console.log('📞 Запускаем звонок...');
        startCall(window.currentChatId, friendData.peerId, type);
        
    } catch (error) {
        console.error('❌ Ошибка при звонке:', error);
        window.showToast?.('❌ Не удалось совершить звонок', 'error');
    }
}
        
        

// ===== ОБНОВЛЕНИЕ ВИДИМОСТИ КНОПОК =====
function updateCallButtonsVisibility() {
    const audioBtn = document.getElementById('audioCallActionBtn');
    const videoBtn = document.getElementById('videoCallActionBtn');
    
    if (!audioBtn || !videoBtn) return;
    
    if (window.currentChatType === 'friend') {
        audioBtn.style.display = 'flex';
        videoBtn.style.display = 'flex';
        console.log('📞 Показываем кнопки звонков (друг)');
    } else {
        audioBtn.style.display = 'none';
        videoBtn.style.display = 'none';
        console.log('📞 Скрываем кнопки звонков (бот/другое)');
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📞 calls.js загружен');
    
    // Удаляем кнопку из хедера при загрузке
    removeCallButtonFromHeader();
    
    // Запрашиваем разрешение на уведомления
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Инициализируем Peer после авторизации
    document.addEventListener('userAuthenticated', () => {
        if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
            const userId = window.auth.currentUser.uid;
            console.log('📞 Инициализация Peer для пользователя:', userId);
            setTimeout(() => initPeer(userId), 1000);
        }
    });
    
    // Наблюдаем за появлением панели действий
    const observer = new MutationObserver(() => {
        if (document.getElementById('chatActionsPanel') && !document.getElementById('audioCallActionBtn')) {
            console.log('📞 Панель действий найдена, добавляем кнопки...');
            addCallButtonsToPanel();
            
            // Удаляем старую кнопку, если она вдруг появится
            removeCallButtonFromHeader();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Также проверяем каждые 2 секунды (на всякий случай)
    setInterval(() => {
        removeCallButtonFromHeader();
    }, 2000);
});

// ===== ЭКСПОРТ =====
window.startCall = startCall;
window.endCall = endCall;
window.answerCall = answerCall;
window.toggleMute = toggleMute;
window.toggleVideo = toggleVideo;
window.toggleSpeaker = toggleSpeaker;
window.updateCallButtonsVisibility = updateCallButtonsVisibility;
window.addCallButtonsToPanel = addCallButtonsToPanel;
window.canCall = canCall;
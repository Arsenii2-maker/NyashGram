// calls.js — ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

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

// ===== ИНИЦИАЛИЗАЦИЯ PEER =====
function initPeer(userId) {
    if (peer) peer.destroy();
    
    peer = new Peer(userId, {
        config: {
            'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        },
        debug: 1,
        secure: true
    });
    
    peer.on('open', (id) => {
        console.log('✅ Peer ID:', id);
        if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
            window.db.collection('users').doc(window.auth.currentUser.uid).update({ peerId: id, online: true });
        }
    });
    
    peer.on('call', (call) => {
        pendingCall = call;
        showIncomingCallUI(call, call.metadata?.type === 'video');
    });

    peer.on('error', (err) => console.error('Peer error:', err));
}

// ===== ПРОВЕРКА ВОЗМОЖНОСТИ ЗВОНКА =====
function canCall() {
    return window.currentChatType === 'friend';
}

// ===== МЕДИА ПОТОК =====
async function getMediaStream(withVideo = false) {
    try {
        const constraints = { 
            audio: true, 
            video: withVideo ? { facingMode: 'user' } : false 
        };
        return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
        window.showToast?.('❌ Нет доступа к камере/микрофону', 'error');
        return null;
    }
}

// ===== НАЧАТЬ ЗВОНОК =====
async function startCall(friendId, friendPeerId, callType = 'audio') {
    if (!friendPeerId) {
        window.showToast?.('💤 Друг не в сети', 'info');
        return;
    }
    
    localStream = await getMediaStream(callType === 'video');
    if (!localStream) return;
    
    showCallUI('outgoing', friendId, callType);
    
    currentCall = peer.call(friendPeerId, localStream, {
        metadata: { 
            type: callType, 
            from: window.auth.currentUser.uid,
            fromName: localStorage.getItem('nyashgram_name') 
        }
    });
    
    setupCallEvents(currentCall, friendId);
}

// ===== ОБРАБОТКА НАЖАТИЯ (ГЛАВНАЯ ПОЧИНКА) =====
async function handleCallClick(type) {
    if (!canCall() || !window.currentChatId) {
        window.showToast?.('🤖 Ботам звонить нельзя', 'info');
        return;
    }

    try {
        window.showLoading('Вызываем...');
        // 1. Находим чат, чтобы узнать участников
        const chatDoc = await window.db.collection('chats').doc(window.currentChatId).get();
        if (!chatDoc.exists) throw new Error('Чат не найден');
        
        const participants = chatDoc.data().participants;
        const friendId = participants.find(uid => uid !== window.auth.currentUser.uid);
        
        // 2. Находим данные друга (его peerId)
        const friendDoc = await window.db.collection('users').doc(friendId).get();
        const friendData = friendDoc.data();
        
        window.hideLoading();
        
        if (friendData && friendData.peerId) {
            startCall(friendId, friendData.peerId, type);
        } else {
            window.showToast?.('💤 Друг сейчас не в сети', 'info');
        }
    } catch (error) {
        console.error(error);
        window.hideLoading();
        window.showToast?.('❌ Ошибка связи', 'error');
    }
}

// ===== СОБЫТИЯ ЗВОНКА =====
function setupCallEvents(call, friendId) {
    call.on('stream', (stream) => {
        const remoteVideo = document.getElementById('remoteVideo');
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteVideo && stream.getVideoTracks().length > 0) remoteVideo.srcObject = stream;
        if (remoteAudio) remoteAudio.srcObject = stream;
        
        callStartTime = Date.now();
        startCallTimer();
        if(document.getElementById('callState')) document.getElementById('callState').textContent = '🔊 Разговор...';
    });
    
    call.on('close', endCall);
}

function endCall() {
    if (currentCall) currentCall.close();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    clearInterval(callTimerInterval);
    hideCallUI();
    document.getElementById('chatScreen').style.display = 'flex';
}

function startCallTimer() {
    const timerEl = document.getElementById('callTimer');
    callTimerInterval = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        const m = Math.floor(duration / 60).toString().padStart(2, '0');
        const s = (duration % 60).toString().padStart(2, '0');
        if(timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);
}

// ===== UI ЗВОНКА =====
function showCallUI(type, friendId, callType) {
    document.getElementById('chatScreen').style.display = 'none';
    const screen = document.getElementById('callScreen');
    screen.style.display = 'flex';
    screen.innerHTML = `
        <div class="call-container">
            <div class="call-name">Звонок</div>
            <div class="call-state" id="callState">Соединение...</div>
            <div class="call-timer" id="callTimer">00:00</div>
            <video id="remoteVideo" autoplay playsinline style="width:100%; border-radius:20px;"></video>
            <audio id="remoteAudio" autoplay></audio>
            <div class="call-controls">
                <button onclick="endCall()" class="end-call">📞</button>
            </div>
        </div>
    `;
}

function hideCallUI() {
    document.getElementById('callScreen').style.display = 'none';
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('userAuthenticated', () => {
        if (window.auth.currentUser && !window.auth.currentUser.isAnonymous) {
            initPeer(window.auth.currentUser.uid);
        }
    });
});

window.handleCallClick = handleCallClick;
window.endCall = endCall;

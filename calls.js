// calls.js — ПРОСТЫЕ АУДИОЗВОНКИ (БЕЗ ОШИБОК)

let peer = null;
let currentCall = null;
let localStream = null;
let isCallActive = false;
let callStartTime = null;
let callTimerInterval = null;
let pendingCall = null;

function initPeer(userId) {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    try {
        peer = new Peer(userId, {
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
            debug: 0
        });
        peer.on('open', id => {
            console.log('✅ Peer готов', id);
            if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
                window.db.collection('users').doc(window.auth.currentUser.uid).update({ peerId: id }).catch(()=>{});
            }
        });
        peer.on('call', call => {
            pendingCall = call;
            showIncomingCallUI(call);
        });
        peer.on('error', err => console.log('Peer error (ignore):', err.type));
        peer.on('disconnected', () => setTimeout(() => peer?.reconnect(), 3000));
    } catch(e) { console.error(e); }
}

function canCall() {
    return window.currentChatType === 'friend';
}

async function getMicrophone() {
    try {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch(e) {
        window.showToast?.('🎤 Разреши доступ к микрофону', 'error');
        return null;
    }
}

async function startCall(friendId, friendPeerId) {
    if (!canCall()) {
        window.showToast?.('💬 Звонить можно только друзьям', 'info');
        return;
    }
    if (!friendPeerId) {
        window.showToast?.('💤 Друг не в сети', 'info');
        return;
    }
    const stream = await getMicrophone();
    if (!stream) return;
    localStream = stream;
    showCallUI('outgoing', friendId);
    const call = peer.call(friendPeerId, localStream, { metadata: { from: window.auth.currentUser.uid, fromName: localStorage.getItem('nyashgram_name') } });
    setupCallEvents(call, friendId);
}

async function answerCall() {
    if (!pendingCall) return;
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

function setupCallEvents(call, friendId) {
    currentCall = call;
    call.on('stream', remoteStream => {
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio) remoteAudio.srcObject = remoteStream;
        isCallActive = true;
        callStartTime = Date.now();
        startCallTimer();
        const stateEl = document.getElementById('callState');
        if (stateEl) stateEl.textContent = '🔊 Разговор...';
    });
    call.on('close', () => endCall());
    call.on('error', err => { console.error(err); endCall(); });
}

function endCall() {
    if (currentCall) currentCall.close();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    isCallActive = false;
    if (callTimerInterval) clearInterval(callTimerInterval);
    hideCallUI();
    const chatScreen = document.getElementById('chatScreen');
    if (chatScreen) chatScreen.style.display = 'flex';
}

function toggleMute() {
    if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(t => t.enabled = !t.enabled);
        const muteBtn = document.getElementById('callMuteBtn');
        if (muteBtn) muteBtn.textContent = audioTracks[0].enabled ? '🎤' : '🔇';
    }
}

function toggleSpeaker() {
    const remoteAudio = document.getElementById('remoteAudio');
    if (remoteAudio) remoteAudio.muted = !remoteAudio.muted;
    const speakerBtn = document.getElementById('callSpeakerBtn');
    if (speakerBtn) speakerBtn.textContent = remoteAudio?.muted ? '🔈' : '🔊';
}

function startCallTimer() {
    const timerEl = document.getElementById('callTimer');
    if (!timerEl) return;
    callTimerInterval = setInterval(() => {
        if (!callStartTime) return;
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        timerEl.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    }, 1000);
}

function showCallUI(type, friendId) {
    const chatScreen = document.getElementById('chatScreen');
    const callScreen = document.getElementById('callScreen');
    if (!callScreen) return;
    if (chatScreen) chatScreen.style.display = 'none';
    callScreen.style.display = 'flex';
    const friend = window.friendsList?.find(f => f.id === friendId) || { name: 'Пользователь' };
    const isIncoming = type === 'incoming';
    callScreen.innerHTML = `
        <div class="call-container">
            <div class="call-header">
                <button id="callBackBtn" class="call-icon-btn">←</button>
                <div class="call-status">
                    <div class="call-avatar">${friend.name?.[0] || '👤'}</div>
                    <div class="call-name">${friend.name || 'Друг'}</div>
                    <div class="call-state" id="callState">${type === 'outgoing' ? '📞 Звоним...' : '🔔 Входящий звонок'}</div>
                </div>
                <div></div>
            </div>
            <div class="call-timer" id="callTimer">00:00</div>
            <div class="call-controls">
                <button id="callMuteBtn" class="call-control-btn">🎤</button>
                <button id="callSpeakerBtn" class="call-control-btn">🔊</button>
                <button id="callEndBtn" class="call-control-btn end-call">📞</button>
                ${isIncoming ? '<button id="callAnswerBtn" class="call-control-btn answer-call">✅ Ответить</button>' : ''}
            </div>
            <audio id="remoteAudio" autoplay></audio>
        </div>
    `;
    document.getElementById('callBackBtn')?.addEventListener('click', endCall);
    document.getElementById('callMuteBtn')?.addEventListener('click', toggleMute);
    document.getElementById('callSpeakerBtn')?.addEventListener('click', toggleSpeaker);
    document.getElementById('callEndBtn')?.addEventListener('click', endCall);
    if (isIncoming) {
        document.getElementById('callAnswerBtn')?.addEventListener('click', answerCall);
    }
}

function showIncomingCallUI(call) {
    pendingCall = call;
    const fromId = call.metadata?.from;
    showCallUI('incoming', fromId);
    if (navigator.vibrate) navigator.vibrate([200,100,200]);
}

function hideCallUI() {
    const callScreen = document.getElementById('callScreen');
    if (callScreen) callScreen.style.display = 'none';
}

function addCallButtonsToPanel() {
    const actionsPanel = document.getElementById('chatActionsPanel');
    if (!actionsPanel || document.getElementById('audioCallActionBtn')) return;
    const audioCallBtn = document.createElement('button');
    audioCallBtn.id = 'audioCallActionBtn';
    audioCallBtn.className = 'action-btn';
    audioCallBtn.innerHTML = '📞';
    audioCallBtn.title = 'аудиозвонок';
    actionsPanel.prepend(audioCallBtn);
    audioCallBtn.addEventListener('click', async () => {
        if (!window.currentChatId || window.currentChatType !== 'friend') {
            window.showToast?.('💬 Звонить можно только друзьям', 'info');
            return;
        }
        const friendDoc = await window.db.collection('users').doc(window.currentChatId).get();
        const friendData = friendDoc.data();
        if (!friendData.peerId) {
            window.showToast?.('💤 Друг не в сети', 'info');
            return;
        }
        startCall(window.currentChatId, friendData.peerId);
    });
}

function updateCallButtonsVisibility() {
    const btn = document.getElementById('audioCallActionBtn');
    if (btn) btn.style.display = window.currentChatType === 'friend' ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('userAuthenticated', () => {
        if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
            setTimeout(() => initPeer(window.auth.currentUser.uid), 1000);
        }
    });
    const observer = new MutationObserver(() => {
        if (document.getElementById('chatActionsPanel')) addCallButtonsToPanel();
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

window.startCall = startCall;
window.endCall = endCall;
window.answerCall = answerCall;
window.updateCallButtonsVisibility = updateCallButtonsVisibility;
// ===== УПРОЩЁННАЯ ВЕРСИЯ ЗВОНКОВ (ТОЛЬКО АУДИО) =====

// В функции getMediaStream убираем видео
async function getMediaStream() {
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
        window.showToast?.('❌ Нет доступа к микрофону', 'error');
        return null;
    }
}

// Упрощаем функцию звонка
async function startCall(friendId, friendPeerId) {
    if (!canCall()) {
        window.showToast?.('🤖 Ботам нельзя звонить', 'info');
        return;
    }
    
    if (!friendPeerId) {
        window.showToast?.('💤 Друг сейчас не в сети', 'info');
        return;
    }
    
    try {
        localStream = await getMediaStream();
        if (!localStream) return;
        
        showCallUI('outgoing', friendId);
        
        currentCall = peer.call(friendPeerId, localStream, {
            metadata: {
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

// Упрощаем UI звонка (без видео)
function showCallUI(type, friendId) {
    document.getElementById('chatScreen').style.display = 'none';
    
    const callScreen = document.getElementById('callScreen');
    if (!callScreen) return;
    
    callScreen.style.display = 'flex';
    
    const friend = window.friendsList?.find(f => f.id === friendId) || 
                   { name: 'Пользователь' };
    
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
                ${type === 'incoming' ? `
                    <button id="callAnswerBtn" class="call-control-btn answer-call">✅ Ответить</button>
                ` : ''}
            </div>
            
            <audio id="remoteAudio" autoplay></audio>
        </div>
    `;
    
    // Обработчики
    document.getElementById('callBackBtn').addEventListener('click', endCall);
    document.getElementById('callMuteBtn').addEventListener('click', toggleMute);
    document.getElementById('callSpeakerBtn').addEventListener('click', toggleSpeaker);
    document.getElementById('callEndBtn').addEventListener('click', endCall);
    
    if (type === 'incoming') {
        document.getElementById('callAnswerBtn').addEventListener('click', () => {
            if (pendingCall) answerCall(pendingCall);
        });
    }
}
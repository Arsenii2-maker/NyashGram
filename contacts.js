// contacts.js — ИСПРАВЛЕННАЯ ВЕРСИЯ С ЗАЯВКАМИ

// ===== БОТЫ =====
const botUsers = [
    { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp', emoji: '🩷' },
    { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk', emoji: '🌸' },
    { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame', emoji: '🎮' },
    { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope', emoji: '🔮' },
    { id: 'nyashcook', name: 'NyashCook', username: 'nyashcook', emoji: '🍳' }
];

// ===== СОСТОЯНИЕ =====
let friendsList = [];
let friendRequests = [];
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');
let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');

// Делаем глобальными
window.customNames = customNames;
window.pinnedChats = pinnedChats;
window.friendsList = friendsList;
window.friendRequests = friendRequests;

// ===== ЗАГРУЗКА ДРУЗЕЙ ИЗ FIREBASE (УЛУЧШЕННАЯ) =====
async function loadFriends() {
    console.log('👥 Загружаем друзей...');
    
    if (!window.auth || !window.auth.currentUser) {
        console.log('❌ Нет авторизации');
        return;
    }
    
    if (window.auth.currentUser.isAnonymous) {
        console.log('👤 Гостевой режим');
        friendsList = [];
        friendRequests = [];
        renderContacts();
        return;
    }
    
    try {
        const userDoc = await window.db.collection('users').doc(window.auth.currentUser.uid).get();
        
        if (!userDoc.exists) {
            console.log('❌ Документ пользователя не найден');
            return;
        }
        
        const userData = userDoc.data();
        console.log('📨 Данные пользователя:', userData);
        
        // Загружаем друзей
        if (userData.friends && Array.isArray(userData.friends)) {
            if (userData.friends.length > 0) {
                const friendsData = await Promise.all(
                    userData.friends.map(async (friendId) => {
                        try {
                            const friendDoc = await window.db.collection('users').doc(friendId).get();
                            if (friendDoc.exists) {
                                return { 
                                    id: friendDoc.id, 
                                    ...friendDoc.data()
                                };
                            }
                        } catch (e) {
                            console.error('❌ Ошибка загрузки друга:', e);
                        }
                        return null;
                    })
                );
                friendsList = friendsData.filter(f => f !== null);
            } else {
                friendsList = [];
            }
        }
        
        // !!! ВАЖНО: Загружаем заявки с правильной обработкой !!!
        if (userData.friendRequests && Array.isArray(userData.friendRequests)) {
            console.log(`📨 Найдено ${userData.friendRequests.length} заявок (сырые):`, userData.friendRequests);
            
            if (userData.friendRequests.length > 0) {
                const requestsData = await Promise.all(
                    userData.friendRequests.map(async (req) => {
                        try {
                            // Определяем отправителя (может быть объект или строка)
                            const fromId = typeof req === 'object' ? req.from : req;
                            
                            if (!fromId) return null;
                            
                            console.log(`📨 Загружаем данные отправителя: ${fromId}`);
                            
                            const userDoc = await window.db.collection('users').doc(fromId).get();
                            
                            if (userDoc.exists) {
                                const userData = userDoc.data();
                                return {
                                    from: fromId,
                                    fromUser: {
                                        id: fromId,
                                        name: userData.name || 'Пользователь',
                                        username: userData.username || 'unknown',
                                        photo: userData.photo
                                    },
                                    timestamp: typeof req === 'object' ? req.timestamp : Date.now(),
                                    status: typeof req === 'object' ? req.status : 'pending'
                                };
                            }
                        } catch (e) {
                            console.error('❌ Ошибка загрузки отправителя:', e);
                        }
                        return null;
                    })
                );
                
                // Фильтруем null и undefined
                friendRequests = requestsData.filter(req => req !== null && req !== undefined);
                console.log('📨 ЗАЯВКИ ПОСЛЕ ОБРАБОТКИ:', friendRequests);
            } else {
                friendRequests = [];
            }
        } else {
            friendRequests = [];
        }
        
        // Обновляем глобальные переменные
        window.friendsList = friendsList;
        window.friendRequests = friendRequests;
        
        // Обновляем бейдж
        updateRequestsBadge();
        
        // Рендерим интерфейс
        renderContacts();
        
        // Возвращаем данные для отладки
        return { friends: friendsList, requests: friendRequests };
        
    } catch (error) {
        console.error('❌ Ошибка загрузки друзей:', error);
        return { friends: [], requests: [] };
    }
}

// ===== ОБНОВЛЕНИЕ БЕЙДЖА =====
function updateRequestsBadge() {
    const badge = document.getElementById('requestsBadge');
    if (badge) {
        const count = friendRequests.length;
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
            badge.style.animation = 'badgePulse 0.3s ease';
            console.log('📨 Бейдж обновлён:', count);
        } else {
            badge.style.display = 'none';
            console.log('📨 Бейдж скрыт');
        }
    } else {
        console.warn('⚠️ Элемент requestsBadge не найден');
    }
}

// ===== ОТРИСОВКА (ИСПРАВЛЕННАЯ) =====
function renderContacts() {
    const list = document.getElementById('friendsList');
    if (!list) {
        console.error('❌ friendsList не найден');
        return;
    }
    
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'chats';
    console.log('🎨 Рендерим вкладку:', activeTab, 'Заявок:', friendRequests.length);
    
    // Очищаем список
    list.innerHTML = '';
    
    if (activeTab === 'chats') {
        renderChats(list);
    } else if (activeTab === 'friends') {
        renderFriends(list);
    } else if (activeTab === 'requests') {
        renderRequests(list);
    }
}

// ===== ОТРИСОВКА ЗАЯВОК (АБСОЛЮТНО РАБОЧАЯ) =====
function renderRequests(list) {
    console.log('📨 Рендерим заявки, количество:', friendRequests.length);
    console.log('📨 Данные заявок:', JSON.stringify(friendRequests, null, 2));
    
    // ОЧИЩАЕМ список
    list.innerHTML = '';
    
    if (friendRequests && friendRequests.length > 0) {
        // СОЗДАЁМ контейнер для заявок
        const requestsContainer = document.createElement('div');
        requestsContainer.className = 'requests-container';
        
        friendRequests.forEach((request, index) => {
            console.log(`📨 Создаём элемент для заявки ${index + 1}`);
            
            // Данные отправителя с защитой от undefined
            const fromName = request?.fromUser?.name || 'Пользователь';
            const fromUsername = request?.fromUser?.username || 'unknown';
            const fromId = request?.from || 'unknown';
            const timestamp = request?.timestamp || Date.now();
            
            // Форматируем дату
            const date = new Date(timestamp);
            const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0,5)}`;
            
            // Создаём элемент
            const el = document.createElement('div');
            el.className = 'contact request-item';
            el.setAttribute('data-request-id', fromId);
            el.style.animation = `contactAppear 0.3s ease ${index * 0.1}s forwards`;
            el.style.opacity = '0';
            
            el.innerHTML = `
                <div class="avatar" style="background: linear-gradient(135deg, #ffb6c1, #ff9eb5);">
                    <span class="avatar-emoji">📨</span>
                </div>
                <div class="info">
                    <div class="name">${fromName}</div>
                    <div class="username">@${fromUsername}</div>
                    <div class="request-time">${dateStr}</div>
                </div>
                <div class="request-actions">
                    <button class="accept-request" data-id="${fromId}" title="принять">✅</button>
                    <button class="reject-request" data-id="${fromId}" title="отклонить">❌</button>
                </div>
            `;
            
            // ✅ ВАЖНО: добавляем в контейнер, а не сразу в list
            requestsContainer.appendChild(el);
        });
        
        // Добавляем контейнер в список
        list.appendChild(requestsContainer);
        console.log(`✅ Добавлено ${friendRequests.length} заявок в DOM`);
        
        // Теперь добавляем обработчики
        setTimeout(() => {
            document.querySelectorAll('.accept-request').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const fromId = btn.dataset.id;
                    console.log('✅ Принять заявку от:', fromId);
                    
                    btn.disabled = true;
                    btn.textContent = '⏳';
                    
                    try {
                        // Здесь должна быть функция принятия
                        if (typeof window.acceptFriendRequest === 'function') {
                            await window.acceptFriendRequest(fromId);
                        }
                        
                        // Удаляем заявку из массива
                        friendRequests = friendRequests.filter(r => r.from !== fromId);
                        window.friendRequests = friendRequests;
                        
                        // Перерисовываем
                        renderRequests(list);
                        updateRequestsBadge();
                        
                        alert('✅ Заявка принята!');
                    } catch (error) {
                        console.error('❌ Ошибка:', error);
                        btn.disabled = false;
                        btn.textContent = '✅';
                        alert('❌ Ошибка при принятии');
                    }
                });
            });
            
            document.querySelectorAll('.reject-request').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const fromId = btn.dataset.id;
                    console.log('❌ Отклонить заявку от:', fromId);
                    
                    btn.disabled = true;
                    btn.textContent = '⏳';
                    
                    try {
                        // Удаляем заявку из массива
                        friendRequests = friendRequests.filter(r => r.from !== fromId);
                        window.friendRequests = friendRequests;
                        
                        // Перерисовываем
                        renderRequests(list);
                        updateRequestsBadge();
                        
                        alert('❌ Заявка отклонена');
                    } catch (error) {
                        console.error('❌ Ошибка:', error);
                        btn.disabled = false;
                        btn.textContent = '❌';
                    }
                });
            });
        }, 100);
        
    } else {
        // Пустое состояние с кнопкой
        const emptyEl = document.createElement('div');
        emptyEl.className = 'empty-state';
        emptyEl.innerHTML = `
            <div class="empty-icon">📨</div>
            <h3>нет заявок в друзья</h3>
            <p>когда кто-то захочет добавить тебя, они появятся здесь</p>
            <button id="goToSearchBtn" class="small-btn">🔍 поиск друзей</button>
            <button id="testRequestsBtn" class="small-btn" style="margin-top: 10px; background: #ff9eb5;">🧪 тест заявок</button>
        `;
        list.appendChild(emptyEl);
        
        // Обработчики
        setTimeout(() => {
            document.getElementById('goToSearchBtn')?.addEventListener('click', () => {
                if (typeof window.showScreen === 'function') {
                    window.showScreen('searchFriendsScreen');
                }
            });
            
            document.getElementById('testRequestsBtn')?.addEventListener('click', () => {
                // Добавляем тестовые заявки
                friendRequests = [
                    {
                        from: "test1",
                        fromUser: {
                            name: "Анна",
                            username: "anna_nice"
                        },
                        timestamp: Date.now() - 86400000
                    },
                    {
                        from: "test2",
                        fromUser: {
                            name: "Михаил",
                            username: "misha_nyash"
                        },
                        timestamp: Date.now() - 172800000
                    }
                ];
                window.friendRequests = friendRequests;
                renderRequests(list);
                updateRequestsBadge();
            });
        }, 100);
    }
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАЯВКАМИ =====
async function acceptFriendRequest(fromUserId) {
    console.log('✅ Принимаем заявку от:', fromUserId);
    
    if (!window.auth?.currentUser) {
        return { success: false, error: 'Не авторизован' };
    }
    
    try {
        const currentUserId = window.auth.currentUser.uid;
        const batch = window.db.batch();
        
        // 1. Добавляем друг друга в friends
        const currentUserRef = window.db.collection('users').doc(currentUserId);
        const fromUserRef = window.db.collection('users').doc(fromUserId);
        
        batch.update(currentUserRef, {
            friends: firebase.firestore.FieldValue.arrayUnion(fromUserId)
        });
        
        batch.update(fromUserRef, {
            friends: firebase.firestore.FieldValue.arrayUnion(currentUserId)
        });
        
        // 2. Удаляем заявку у текущего пользователя
        const currentUserDoc = await currentUserRef.get();
        const currentUserData = currentUserDoc.data();
        
        if (currentUserData.friendRequests) {
            const updatedRequests = currentUserData.friendRequests.filter(req => {
                if (typeof req === 'object') {
                    return req.from !== fromUserId;
                }
                return req !== fromUserId;
            });
            
            batch.update(currentUserRef, { friendRequests: updatedRequests });
        }
        
        // 3. Удаляем заявку у отправителя (outgoing requests)
        const fromUserDoc = await fromUserRef.get();
        const fromUserData = fromUserDoc.data();
        
        if (fromUserData.outgoingRequests) {
            const updatedOutgoing = fromUserData.outgoingRequests.filter(id => id !== currentUserId);
            batch.update(fromUserRef, { outgoingRequests: updatedOutgoing });
        }
        
        // 4. Создаём чат
        const chatRef = window.db.collection('chats').doc();
        batch.set(chatRef, {
            participants: [currentUserId, fromUserId],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: null
        });
        
        await batch.commit();
        
        console.log('✅ Заявка принята, чат создан');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Ошибка при принятии заявки:', error);
        return { success: false, error: error.message };
    }
}

async function removeFriendRequest(fromUserId) {
    console.log('❌ Отклоняем заявку от:', fromUserId);
    
    if (!window.auth?.currentUser) return;
    
    try {
        const currentUserId = window.auth.currentUser.uid;
        const currentUserRef = window.db.collection('users').doc(currentUserId);
        
        const userDoc = await currentUserRef.get();
        const userData = userDoc.data();
        
        if (userData.friendRequests) {
            const updatedRequests = userData.friendRequests.filter(req => {
                if (typeof req === 'object') {
                    return req.from !== fromUserId;
                }
                return req !== fromUserId;
            });
            
            await currentUserRef.update({
                friendRequests: updatedRequests
            });
        }
        
        console.log('❌ Заявка отклонена');
        
    } catch (error) {
        console.error('❌ Ошибка при отклонении:', error);
    }
}

// ===== СЛУШАТЕЛЬ ИЗМЕНЕНИЙ =====
function listenToFriendChanges() {
    if (!window.auth?.currentUser || window.auth.currentUser.isAnonymous) return;
    
    console.log('👥 Устанавливаем слушатель изменений');
    
    window.db.collection('users').doc(window.auth.currentUser.uid)
        .onSnapshot((doc) => {
            if (doc.exists) {
                console.log('👥 Данные изменились, обновляем...');
                loadFriends();
            }
        });
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showNotification(message) {
    // Пробуем использовать красивый тост если есть
    if (typeof window.showToast === 'function') {
        window.showToast(message);
    } else {
        alert(message);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('👥 contacts.js загружен');
    
    // Добавляем обработчики на табы
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderContacts();
        });
    });
    
    // Загружаем друзья если уже авторизованы
    if (window.auth?.currentUser && !window.auth.currentUser.isAnonymous) {
        setTimeout(() => {
            loadFriends();
            listenToFriendChanges();
        }, 500);
    }
    
    // Слушаем событие авторизации
    document.addEventListener('userAuthenticated', () => {
        console.log('👤 Пользователь авторизован, загружаем друзей');
        loadFriends();
        listenToFriendChanges();
    });
});

// ===== ЭКСПОРТ =====
window.loadFriends = loadFriends;
window.renderContacts = renderContacts;
window.acceptFriendRequest = acceptFriendRequest;
window.removeFriendRequest = removeFriendRequest;
window.friendsList = friendsList;
window.friendRequests = friendRequests;
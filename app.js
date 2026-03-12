// app.js — ПОЛНАЯ ВЕРСИЯ С ЗАГРУЗКОЙ И УЛУЧШЕННОЙ НАВИГАЦИЕЙ

// ===== FIREBASE КОНФИГ =====
const firebaseConfig = {
  apiKey: "AIzaSyCqTm_oMEVRjOwodVrhmWHLNl1DA4x9sUQ",
  authDomain: "nyashgram-e9f69.firebaseapp.com",
  projectId: "nyashgram-e9f69",
  storageBucket: "nyashgram-e9f69.firebasestorage.app",
  messagingSenderId: "54620743155",
  appId: "1:54620743155:web:4db4690057b103ef859e86",
  measurementId: "G-KXXQTJVEGV"
};

// ===== ИНИЦИАЛИЗАЦИЯ FIREBASE =====
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

window.auth = auth;
window.db = db;
window.storage = storage;

// ===== СОХРАНЯЕМ СЕССИЮ =====
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => console.log('✅ Сессия будет сохраняться'))
    .catch(error => console.error('❌ Ошибка сохранения сессии:', error));

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let currentUser = null;
let currentScreen = 'loginMethodScreen';

// ===== МИЛЫЕ СЛОВА =====
const cuteAdjectives = ['pinky', 'soft', 'fluffy', 'dreamy', 'sweet', 'tiny', 'magic', 'cloudy', 'sunny', 'cozy'];
const cuteNouns = ['cat', 'bunny', 'cloud', 'star', 'berry', 'moon', 'flower', 'peach', 'muffin', 'petal'];
const EXTRA_RARE = ['honeycomb', 'butterfly', 'dragonfly', 'strawberry'];
const SECRET_WORDS = ['parallelogram'];

// ===== МИЛЫЕ ОБЛАЧКА =====
function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== ПРИМЕНЕНИЕ ТЕМЫ =====
function applyTheme() {
    const theme = localStorage.getItem('nyashgram_theme') || 'pastel-pink';
    const mode = localStorage.getItem('nyashgram_mode') || 'light';
    const font = localStorage.getItem('nyashgram_font') || 'font-cozy';
    
    document.body.classList.remove(
        'theme-pastel-pink', 'theme-milk-rose', 'theme-night-blue',
        'theme-lo-fi-beige', 'theme-soft-lilac', 'theme-forest-mint',
        'mode-light', 'mode-dark',
        'font-system', 'font-rounded', 'font-cozy', 'font-elegant', 'font-bold-soft', 'font-mono-cozy'
    );
    
    document.body.classList.add(`theme-${theme}`, `mode-${mode}`, font);
    
    const modeBtn = document.getElementById('themeModeToggle');
    if (modeBtn) modeBtn.textContent = mode === 'light' ? '☀️' : '🌙';
}

// ===== ГЕНЕРАЦИЯ ЮЗЕРНЕЙМА =====
function generateCuteUsername() {
    if (Math.random() < 0.005) {
        const num = Math.random() < 0.3 ? Math.floor(Math.random() * 100) : '';
        return `parallelogram${num}`;
    }
    if (Math.random() < 0.01) {
        const rare = EXTRA_RARE[Math.floor(Math.random() * EXTRA_RARE.length)];
        const num = Math.random() < 0.3 ? Math.floor(Math.random() * 100) : '';
        return `${rare}${num}`;
    }
    const adj = cuteAdjectives[Math.floor(Math.random() * cuteAdjectives.length)];
    const noun = cuteNouns[Math.floor(Math.random() * cuteNouns.length)];
    let num = '';
    if (Math.random() < 0.4) num = Math.floor(Math.random() * 100).toString();
    let username = `${adj}_${noun}${num}`.toLowerCase().replace(/-/g, '_');
    if (username.length > 50) username = username.substring(0, 50);
    return username;
}

// ===== ПРОВЕРКА ЮЗЕРНЕЙМА =====
function isValidUsername(username) {
    if (!username || username.length < 3 || username.length > 50) return false;
    return /^[a-zA-Z0-9_]+$/.test(username);
}

// ===== ПРОВЕРКА УНИКАЛЬНОСТИ =====
async function isUsernameAvailable(username) {
    if (!isValidUsername(username)) return false;
    try {
        const doc = await db.collection('usernames').doc(username).get();
        return !doc.exists;
    } catch (error) {
        console.error('❌ Ошибка проверки username:', error);
        return false;
    }
}

// ===== СОХРАНЕНИЕ ПРОФИЛЯ =====
async function saveUserProfile(name, username) {
    if (!auth.currentUser) return false;
    try {
        const userId = auth.currentUser.uid;
        const available = await isUsernameAvailable(username);
        if (!available) {
            document.getElementById('usernameError').textContent = '❌ этот username уже занят';
            return false;
        }
        await db.collection('usernames').doc(username).set({
            uid: userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('users').doc(userId).set({
            name: name || 'Пользователь',
            username: username,
            email: auth.currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastUsernameChange: firebase.firestore.FieldValue.serverTimestamp(),
            friends: [],
            friendRequests: [],
            online: true
        });
        localStorage.setItem('nyashgram_name', name);
        localStorage.setItem('nyashgram_username', username);
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения профиля:', error);
        return false;
    }
}

// ===== ОБНОВЛЕНИЕ ЮЗЕРНЕЙМА =====
async function updateUsername(newUsername) {
    if (!auth.currentUser) return false;
    try {
        const userId = auth.currentUser.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (userData.lastUsernameChange) {
            const lastChange = userData.lastUsernameChange.toDate();
            const weekLater = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (new Date() < weekLater) {
                const daysLeft = Math.ceil((weekLater - new Date()) / (24 * 60 * 60 * 1000));
                showToast(`⏳ Можно менять раз в неделю. Осталось ${daysLeft} ${getDaysWord(daysLeft)}`, 'info');
                return false;
            }
        }
        
        const available = await isUsernameAvailable(newUsername);
        if (!available) {
            showToast('❌ Этот username уже занят', 'error');
            return false;
        }
        
        if (userData.username) {
            await db.collection('usernames').doc(userData.username).delete();
        }
        
        await db.collection('usernames').doc(newUsername).set({
            uid: userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('users').doc(userId).update({
            username: newUsername,
            lastUsernameChange: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        localStorage.setItem('nyashgram_username', newUsername);
        showToast('✨ Username обновлён!', 'success');
        return true;
    } catch (error) {
        console.error('❌ Ошибка обновления username:', error);
        showToast('❌ Ошибка при обновлении', 'error');
        return false;
    }
}

function getDaysWord(days) {
    if (days % 10 === 1 && days % 100 !== 11) return 'день';
    if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
    return 'дней';
}

// ===== ПОИСК ПОЛЬЗОВАТЕЛЯ =====
async function findUserByUsername(username) {
    try {
        const usernameDoc = await db.collection('usernames').doc(username).get();
        if (!usernameDoc.exists) return null;
        const { uid } = usernameDoc.data();
        const userDoc = await db.collection('users').doc(uid).get();
        return { id: uid, ...userDoc.data() };
    } catch (error) {
        console.error('❌ Ошибка поиска:', error);
        return null;
    }
}

// ===== ОТПРАВКА ЗАЯВКИ =====
async function sendFriendRequest(toUsername) {
    try {
        const toUser = await findUserByUsername(toUsername);
        if (!toUser) {
            showToast('❌ Пользователь не найден', 'error');
            return;
        }
        const toUserId = toUser.id;
        const currentUserId = auth.currentUser.uid;
        if (toUserId === currentUserId) {
            showToast('❌ Нельзя добавить самого себя', 'error');
            return;
        }
        await db.collection('users').doc(toUserId).update({
            friendRequests: firebase.firestore.FieldValue.arrayUnion({
                from: currentUserId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            })
        });
        await db.collection('users').doc(currentUserId).update({
            outgoingRequests: firebase.firestore.FieldValue.arrayUnion(toUserId)
        });
        showToast('✅ Заявка отправлена!', 'success');
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showToast('❌ Ошибка при отправке заявки', 'error');
    }
}

// ===== ПРИНЯТИЕ ЗАЯВКИ =====
async function acceptFriendRequest(fromUserId) {
    if (!auth.currentUser) return { success: false };
    try {
        const currentUserId = auth.currentUser.uid;
        const batch = db.batch();
        const currentUserRef = db.collection('users').doc(currentUserId);
        const fromUserRef = db.collection('users').doc(fromUserId);
        
        batch.update(currentUserRef, {
            friends: firebase.firestore.FieldValue.arrayUnion(fromUserId)
        });
        batch.update(fromUserRef, {
            friends: firebase.firestore.FieldValue.arrayUnion(currentUserId)
        });
        
        const currentUserDoc = await currentUserRef.get();
        const currentUserData = currentUserDoc.data();
        if (currentUserData.friendRequests) {
            const updatedRequests = currentUserData.friendRequests.filter(req => {
                if (typeof req === 'object') return req.from !== fromUserId;
                return req !== fromUserId;
            });
            batch.update(currentUserRef, { friendRequests: updatedRequests });
        }
        
        const fromUserDoc = await fromUserRef.get();
        const fromUserData = fromUserDoc.data();
        if (fromUserData.outgoingRequests) {
            const updatedOutgoing = fromUserData.outgoingRequests.filter(id => id !== currentUserId);
            batch.update(fromUserRef, { outgoingRequests: updatedOutgoing });
        }
        
        const chatRef = db.collection('chats').doc();
        batch.set(chatRef, {
            participants: [currentUserId, fromUserId],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: null
        });
        
        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error('❌ Ошибка при принятии заявки:', error);
        return { success: false, error: error.message };
    }
}

// ===== ОТКЛОНЕНИЕ ЗАЯВКИ =====
async function removeFriendRequest(fromUserId) {
    if (!auth.currentUser) return;
    try {
        const currentUserId = auth.currentUser.uid;
        const currentUserRef = db.collection('users').doc(currentUserId);
        const userDoc = await currentUserRef.get();
        const userData = userDoc.data();
        if (userData.friendRequests) {
            const updatedRequests = userData.friendRequests.filter(req => {
                if (typeof req === 'object') return req.from !== fromUserId;
                return req !== fromUserId;
            });
            await currentUserRef.update({ friendRequests: updatedRequests });
        }
    } catch (error) {
        console.error('❌ Ошибка при отклонении:', error);
    }
}

// ===== СОЗДАНИЕ ЧАТА =====
async function createPrivateChat(uid1, uid2) {
    try {
        const chatRef = db.collection('chats').doc();
        await chatRef.set({
            participants: [uid1, uid2],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return chatRef.id;
    } catch (error) {
        console.error('❌ Ошибка создания чата:', error);
        return null;
    }
}

// ===== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ (С АНИМАЦИЕЙ) =====
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    const target = document.getElementById(screenId);
    
    if (!target) return;

    // Плавное исчезновение текущих экранов
    screens.forEach(screen => {
        if (screen.classList.contains('active')) {
            screen.style.opacity = '0';
            screen.style.transform = 'translateY(10px)';
        }
        screen.classList.remove('active');
    });

    // Плавное появление нового экрана
    setTimeout(() => {
        target.classList.add('active');
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
        currentScreen = screenId;

        if (screenId === 'friendsScreen' && typeof window.renderContacts === 'function') {
            window.renderContacts();
        }
    }, 50);
}

// ===== ПРОВЕРКА ПРОФИЛЯ =====
async function checkUserProfile() {
    if (!auth.currentUser) return false;
    
    try {
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        
        if (!userDoc.exists) {
            showScreen('createProfileScreen');
            return false;
        }
        
        const userData = userDoc.data();
        localStorage.setItem('nyashgram_name', userData.name || '');
        localStorage.setItem('nyashgram_username', userData.username || '');
        localStorage.setItem('nyashgram_logged_in', 'true');
        
        if(document.getElementById('settingsName')) document.getElementById('settingsName').value = userData.name || '';
        if(document.getElementById('settingsUsername')) document.getElementById('settingsUsername').value = userData.username || '';
        if(document.getElementById('profileEmail')) document.getElementById('profileEmail').textContent = auth.currentUser.email || '';
        if(document.getElementById('profileType')) document.getElementById('profileType').textContent = auth.currentUser.isAnonymous ? '👤 гость' : '📧 email';
        
        applyTheme();
        return true;
    } catch (error) {
        console.error('❌ Ошибка проверки профиля:', error);
        return false;
    }
}

// ===== ВХОД =====
async function loginWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        if (result.user.emailVerified) {
            await checkUserProfile();
            showScreen('friendsScreen');
        } else {
            showScreen('verifyEmailScreen');
        }
    } catch (error) {
        if(document.getElementById('loginError')) document.getElementById('loginError').textContent = getErrorMessage(error);
    }
}

// ===== РЕГИСТРАЦИЯ =====
async function registerWithEmail(name, email, password) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        await result.user.sendEmailVerification();
        localStorage.setItem('nyashgram_name', name);
        showScreen('verifyEmailScreen');
    } catch (error) {
        if(document.getElementById('regError')) document.getElementById('regError').textContent = getErrorMessage(error);
    }
}

// ===== АНОНИМНЫЙ ВХОД =====
async function loginAnonymously() {
    try {
        await auth.signInAnonymously();
        const username = 'guest_' + Math.floor(Math.random() * 10000);
        localStorage.setItem('nyashgram_name', 'Гость');
        localStorage.setItem('nyashgram_username', username);
        localStorage.setItem('nyashgram_logged_in', 'true');
        showScreen('friendsScreen');
    } catch (error) {
        showToast('❌ Ошибка: ' + error.message, 'error');
    }
}

// ===== ВЫХОД =====
async function logout() {
    try {
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
            await db.collection('users').doc(auth.currentUser.uid).update({ online: false });
        }
        await auth.signOut();
        localStorage.removeItem('nyashgram_logged_in');
        showScreen('loginMethodScreen');
    } catch (error) {
        console.error('❌ Ошибка выхода:', error);
    }
}

// ===== СООБЩЕНИЯ ОБ ОШИБКАХ =====
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use': return '📧 Email уже используется';
        case 'auth/invalid-email': return '❌ Неверный email';
        case 'auth/weak-password': return '🔐 Слабый пароль (минимум 6 символов)';
        case 'auth/user-not-found': return '👤 Пользователь не найден';
        case 'auth/wrong-password': return '🔑 Неверный пароль';
        default: return error.message;
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NyashGram v3.5 загружается...');
    
    function showLoading(message = 'Загружаем...') {
        const overlay = document.getElementById('loadingOverlay');
        const msgEl = document.getElementById('loadingMessage');
        if (!overlay) return;
        msgEl.textContent = message;
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
    }
    
    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 500);
    }
    
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    
    const tips = [
        '💗 Говори по-няшному!', '🎨 У нас 6 милых тем', '🤖 5 ботов готовы помочь',
        '📝 Меняй шрифты в настройках', '✨ Отправляй голосовые сообщения', '🎮 Поиграй с NyashGame'
    ];
    
    const tipText = document.getElementById('tipText');
    if (tipText) {
        let tipIndex = 0;
        setInterval(() => {
            tipIndex = (tipIndex + 1) % tips.length;
            tipText.textContent = tips[tipIndex];
        }, 3000);
    }
    
    applyTheme();
    
    // Обработчики кнопок (упрощенно)
    document.getElementById('emailMethodBtn')?.addEventListener('click', () => showScreen('emailLoginScreen'));
    document.getElementById('anonymousMethodBtn')?.addEventListener('click', loginAnonymously);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        checkUserProfile();
        showScreen('settingsScreen');
    });
    document.getElementById('backFromSettingsBtn')?.addEventListener('click', () => showScreen('friendsScreen'));

    // Слушатель авторизации
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            if (!user.isAnonymous) await checkUserProfile();
            showScreen('friendsScreen');
            document.dispatchEvent(new CustomEvent('userAuthenticated'));
        } else {
            showScreen('loginMethodScreen');
        }
    });
});

window.showScreen = showScreen;
window.showToast = showToast;

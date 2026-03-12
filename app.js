// app.js — ПОЛНАЯ ВЕРСИЯ С ЗАГРУЗКОЙ ВЕЗДЕ

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
const cuteAdjectives = [ /* твои слова */ ];
const cuteNouns = [ /* твои слова */ ];
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

// ===== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        currentScreen = screenId;
        if (screenId === 'friendsScreen' && typeof window.renderContacts === 'function') {
            window.renderContacts();
        }
    }
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
        
        document.getElementById('settingsName').value = userData.name || '';
        document.getElementById('settingsUsername').value = userData.username || '';
        document.getElementById('profileEmail').textContent = auth.currentUser.email || '';
        document.getElementById('profileType').textContent = auth.currentUser.isAnonymous ? '👤 гость' : '📧 email';
        
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
        document.getElementById('loginError').textContent = getErrorMessage(error);
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
        document.getElementById('regError').textContent = getErrorMessage(error);
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
    
    // ===== ФУНКЦИИ УПРАВЛЕНИЯ ЗАГРУЗКОЙ =====
    function showLoading(message = 'Загружаем...') {
        const overlay = document.getElementById('loadingOverlay');
        const msgEl = document.getElementById('loadingMessage');
        if (!overlay) return;
        
        if (msgEl) msgEl.textContent = message;
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        console.log('⏳ Загрузка:', message);
    }
    
    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;
        
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '1';
        }, 500);
        console.log('✅ Загрузка скрыта');
    }
    
    // Делаем функции глобальными
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    
    // Советы для загрузки
    const tips = [
        '💗 Говори по-няшному!',
        '🎨 У нас 6 милых тем',
        '🤖 5 ботов готовы помочь',
        '📝 Меняй шрифты в настройках',
        '✨ Отправляй голосовые сообщения',
        '🎮 Поиграй с NyashGame',
        '🔮 Узнай гороскоп',
        '🍳 Найди рецепты',
        '💬 Общайся с друзьями',
        '📌 Закрепляй важные чаты',
        '👥 Добавляй друзей',
        '📞 Совершай звонки'
    ];
    
    // Запускаем ротацию советов
    const tipText = document.getElementById('tipText');
    const currentTip = document.getElementById('currentTip');
    const totalTips = document.getElementById('totalTips');
    
    if (tipText && currentTip && totalTips) {
        totalTips.textContent = tips.length;
        let tipIndex = 0;
        tipText.textContent = tips[0];
        currentTip.textContent = '1';
        
        setInterval(() => {
            tipIndex = (tipIndex + 1) % tips.length;
            tipText.textContent = tips[tipIndex];
            currentTip.textContent = tipIndex + 1;
        }, 3000);
    }
    
    // Применяем тему
    applyTheme();
    
    // ===== ОБРАБОТЧИКИ ЭКРАНОВ =====
    
    // Вход
    document.getElementById('emailMethodBtn')?.addEventListener('click', () => {
        showLoading('Подготовка входа...');
        setTimeout(() => {
            showScreen('emailLoginScreen');
            hideLoading();
        }, 300);
    });
    
    document.getElementById('anonymousMethodBtn')?.addEventListener('click', () => {
        showLoading('Вход гостем...');
        setTimeout(() => {
            loginAnonymously();
            hideLoading();
        }, 500);
    });
    
    // Регистрация
    document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoading('Загружаем регистрацию...');
        setTimeout(() => {
            showScreen('emailRegisterScreen');
            hideLoading();
        }, 300);
    });
    
    document.getElementById('backToLoginFromRegBtn')?.addEventListener('click', () => {
        showLoading('Возврат...');
        setTimeout(() => {
            showScreen('emailLoginScreen');
            hideLoading();
        }, 300);
    });
    
    document.getElementById('registerBtn')?.addEventListener('click', () => {
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        
        if (!name || !email || !password) {
            document.getElementById('regError').textContent = '❌ Заполни все поля';
            return;
        }
        if (password !== confirm) {
            document.getElementById('regError').textContent = '❌ Пароли не совпадают';
            return;
        }
        
        showLoading('Регистрация...');
        registerWithEmail(name, email, password);
        setTimeout(hideLoading, 2000);
    });
    
    // Вход по email
    document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoading('Загружаем вход...');
        setTimeout(() => {
            showScreen('emailLoginScreen');
            hideLoading();
        }, 300);
    });
    
    document.getElementById('backFromEmailLoginBtn')?.addEventListener('click', () => {
        showLoading('Возврат...');
        setTimeout(() => {
            showScreen('loginMethodScreen');
            hideLoading();
        }, 300);
    });
    
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            document.getElementById('loginError').textContent = '❌ Заполни все поля';
            return;
        }
        
        showLoading('Вход в аккаунт...');
        loginWithEmail(email, password);
        setTimeout(hideLoading, 2000);
    });
    
    // Подтверждение email
    document.getElementById('checkVerificationBtn')?.addEventListener('click', async () => {
        showLoading('Проверяем email...');
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
            await checkUserProfile();
            showScreen('friendsScreen');
        } else {
            showToast('📧 Email ещё не подтверждён', 'info');
        }
        hideLoading();
    });
    
    document.getElementById('resendEmailBtn')?.addEventListener('click', async () => {
        showLoading('Отправляем письмо...');
        await auth.currentUser.sendEmailVerification();
        showToast('📧 Письмо отправлено снова', 'success');
        hideLoading();
    });
    
    document.getElementById('backToLoginFromVerifyBtn')?.addEventListener('click', () => {
        showLoading('Возврат...');
        setTimeout(() => {
            showScreen('loginMethodScreen');
            hideLoading();
        }, 300);
    });
    
    // ===== ЭКРАН СОЗДАНИЯ ПРОФИЛЯ =====
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const generateBtn = document.getElementById('generateUsernameBtn');
    const createBtn = document.getElementById('createProfileBtn');
    const skipBtn = document.getElementById('skipProfileBtn');
    const usernameError = document.getElementById('usernameError');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            profileUsername.value = generateCuteUsername();
            usernameError.textContent = '';
            validateProfileForm();
        });
    }
    
    if (profileUsername) profileUsername.addEventListener('input', validateProfileForm);
    if (profileName) profileName.addEventListener('input', validateProfileForm);
    
    async function validateProfileForm() {
        const name = profileName.value.trim();
        const username = profileUsername.value.trim();
        if (!name || !username) {
            createBtn.disabled = true;
            return;
        }
        if (!isValidUsername(username)) {
            usernameError.textContent = '❌ Только a-z, 0-9 и _ (3-50 символов)';
            createBtn.disabled = true;
            return;
        }
        const available = await isUsernameAvailable(username);
        if (!available) {
            usernameError.textContent = '❌ Этот username уже занят';
            createBtn.disabled = true;
            return;
        }
        usernameError.textContent = '';
        createBtn.disabled = false;
    }
    
    if (createBtn) {
        createBtn.addEventListener('click', async () => {
            const name = profileName.value.trim();
            const username = profileUsername.value.trim();
            
            showLoading('Создаём профиль...');
            const success = await saveUserProfile(name, username);
            if (success) {
                showToast('✨ Профиль создан!', 'success');
                showScreen('friendsScreen');
            }
            hideLoading();
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', async () => {
            const name = 'Пользователь';
            const username = 'user_' + Math.floor(Math.random() * 10000);
            
            showLoading('Создаём автоматический профиль...');
            await saveUserProfile(name, username);
            showToast('👤 Профиль создан автоматически', 'info');
            showScreen('friendsScreen');
            hideLoading();
        });
    }
    
    // ===== НАСТРОЙКИ =====
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        showLoading('Загружаем настройки...');
        if (auth.currentUser) {
            document.getElementById('settingsName').value = localStorage.getItem('nyashgram_name') || '';
            document.getElementById('settingsUsername').value = localStorage.getItem('nyashgram_username') || '';
            document.getElementById('profileEmail').textContent = auth.currentUser.email || 'гость';
            document.getElementById('profileType').textContent = auth.currentUser.isAnonymous ? '👤 гость' : '📧 email';
        }
        showScreen('settingsScreen');
        hideLoading();
    });
    
    document.getElementById('backFromSettingsBtn')?.addEventListener('click', () => {
        showLoading('Возврат...');
        setTimeout(() => {
            showScreen('friendsScreen');
            hideLoading();
        }, 300);
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    document.getElementById('settingsGenerateBtn')?.addEventListener('click', () => {
        document.getElementById('settingsUsername').value = generateCuteUsername();
    });
    
    document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
        const newName = document.getElementById('settingsName').value.trim();
        const newUsername = document.getElementById('settingsUsername').value.trim();
        
        if (!newName || !newUsername) {
            showToast('❌ Заполни все поля', 'error');
            return;
        }
        
        showLoading('Сохраняем настройки...');
        
        const oldUsername = localStorage.getItem('nyashgram_username');
        const oldName = localStorage.getItem('nyashgram_name');
        
        try {
            if (newUsername !== oldUsername) {
                if (!isValidUsername(newUsername)) {
                    showToast('❌ Только a-z, 0-9 и _ (3-50 символов)', 'error');
                    hideLoading();
                    return;
                }
                const result = await updateUsername(newUsername);
                if (!result) {
                    hideLoading();
                    return;
                }
            }
            if (newName !== oldName) {
                localStorage.setItem('nyashgram_name', newName);
                if (auth.currentUser && !auth.currentUser.isAnonymous) {
                    await db.collection('users').doc(auth.currentUser.uid).update({ name: newName });
                }
            }
            showToast('✨ Настройки сохранены!', 'success');
            setTimeout(() => showScreen('friendsScreen'), 500);
        } catch (error) {
            console.error('❌ Ошибка:', error);
            showToast('❌ Ошибка при сохранении', 'error');
        }
        hideLoading();
    });
    
    // ===== ПОИСК ДРУЗЕЙ =====
    document.getElementById('searchFriendsBtn')?.addEventListener('click', () => {
        showLoading('Загружаем поиск...');
        showScreen('searchFriendsScreen');
        document.getElementById('searchUsersInput').value = '';
        document.getElementById('searchResultsList').innerHTML = '';
        hideLoading();
    });
    
    document.getElementById('backFromSearchBtn')?.addEventListener('click', () => {
        showLoading('Возврат...');
        setTimeout(() => {
            showScreen('friendsScreen');
            hideLoading();
        }, 300);
    });
    
    let searchTimeout;
    document.getElementById('searchUsersInput')?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            document.getElementById('searchResultsList').innerHTML = '';
            return;
        }
        
        showLoading('Ищем пользователя...');
        
        searchTimeout = setTimeout(async () => {
            const user = await findUserByUsername(query);
            const resultsList = document.getElementById('searchResultsList');
            
            if (user && user.id !== auth.currentUser.uid) {
                resultsList.innerHTML = `
                    <div class="contact">
                        <div class="avatar" style="background: linear-gradient(135deg, #fbc2c2, #c2b9f0);"></div>
                        <div class="info">
                            <div class="name">${user.name || 'Пользователь'}</div>
                            <div class="username">@${user.username}</div>
                        </div>
                        <button class="add-friend-btn" data-username="${user.username}">➕</button>
                    </div>
                `;
                
                resultsList.querySelector('.add-friend-btn')?.addEventListener('click', () => {
                    sendFriendRequest(user.username);
                });
            } else {
                resultsList.innerHTML = '<div class="empty-state">❌ пользователь не найден</div>';
            }
            hideLoading();
        }, 500);
    });
    
    // ===== ТЕМЫ =====
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            localStorage.setItem('nyashgram_theme', theme);
            applyTheme();
            showToast(`🎨 Тема изменена на ${btn.textContent}`, 'success', 2000);
        });
    });
    
    document.getElementById('themeModeToggle')?.addEventListener('click', () => {
        const mode = localStorage.getItem('nyashgram_mode') === 'light' ? 'dark' : 'light';
        localStorage.setItem('nyashgram_mode', mode);
        applyTheme();
        showToast(`${mode === 'light' ? '☀️' : '🌙'} ${mode === 'light' ? 'Светлая' : 'Тёмная'} тема`, 'info', 2000);
    });
    
    // ===== ШРИФТЫ =====
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const font = btn.dataset.font;
            localStorage.setItem('nyashgram_font', font);
            document.body.classList.remove('font-system', 'font-rounded', 'font-cozy', 'font-elegant', 'font-bold-soft', 'font-mono-cozy');
            document.body.classList.add(font);
            showToast(`📝 Шрифт: ${btn.textContent}`, 'info', 2000);
        });
    });
    
    // ===== СЛУШАТЕЛЬ АВТОРИЗАЦИИ =====
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('👤 Пользователь авторизован:', user.uid);
            
            localStorage.setItem('nyashgram_logged_in', 'true');
            
            if (!user.isAnonymous) {
                showLoading('Загружаем профиль...');
                await checkUserProfile();
                hideLoading();
            }
            
            document.dispatchEvent(new CustomEvent('userAuthenticated'));
            showScreen('friendsScreen');
            
        } else {
            console.log('👤 Пользователь не авторизован');
            
            // Проверяем, был ли пользователь ранее
            if (localStorage.getItem('nyashgram_logged_in') === 'true') {
                console.log('🔄 Была сессия, но Firebase её потерял. Пробуем восстановить...');
                localStorage.removeItem('nyashgram_logged_in');
            }
            
            showScreen('loginMethodScreen');
        }
    });
    
    // Если пользователь уже есть, показываем главный экран
    if (auth.currentUser) {
        showScreen('friendsScreen');
    }
});

// ===== ЭКСПОРТ =====
window.showScreen = showScreen;
window.showToast = showToast;
window.createPrivateChat = createPrivateChat;
window.acceptFriendRequest = acceptFriendRequest;
window.removeFriendRequest = removeFriendRequest;
window.generateCuteUsername = generateCuteUsername;
window.isValidUsername = isValidUsername;
window.findUserByUsername = findUserByUsername; 

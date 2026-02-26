// app.js — ПОЛНАЯ ВЕРСИЯ СО ВСЕМИ ИСПРАВЛЕНИЯМИ

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

// Делаем глобальными
window.auth = auth;
window.db = db;
window.storage = storage;

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let currentUser = null;
let currentScreen = 'loginMethodScreen';
let themeMode = localStorage.getItem('nyashgram_mode') || 'light';
let currentTheme = localStorage.getItem('nyashgram_theme') || 'pastel-pink';
let currentFont = localStorage.getItem('nyashgram_font') || 'font-cozy';

// ===== МИЛЫЕ АНГЛИЙСКИЕ СЛОВА ДЛЯ ГЕНЕРАЦИИ =====
const cuteAdjectives = [
    'cute', 'sweet', 'soft', 'fluffy', 'gentle', 'little', 'tiny', 'lovely',
    'adorable', 'charming', 'graceful', 'peaceful', 'sunny', 'rainy', 'cloudy',
    'happy', 'joyful', 'merry', 'bright', 'shiny', 'glowing', 'sparkly',
    'dreamy', 'magic', 'mystic', 'cosmic', 'stellar', 'lunar', 'solar',
    'berry', 'honey', 'sugar', 'candy', 'cookie', 'muffin', 'cupcake',
    'pink', 'purple', 'rainbow', 'pastel', 'velvet', 'silky', 'smooth',
    'bouncy', 'jumpy', 'wiggly', 'cuddly', 'snuggly', 'huggable', 'kissable',
    'cloud', 'star', 'moon', 'sun', 'flower', 'rose', 'lily', 'daisy',
    'ocean', 'wave', 'river', 'forest', 'meadow', 'garden', 'rain', 'snow'
];

const cuteNouns = [
    'cat', 'kitty', 'kitten', 'dog', 'puppy', 'bunny', 'rabbit',
    'fox', 'panda', 'bear', 'koala', 'otter', 'deer', 'fawn',
    'bird', 'robin', 'finch', 'duck', 'owl', 'hedgehog',
    'sun', 'moon', 'star', 'cloud', 'rain', 'rainbow', 'flower',
    'rose', 'lily', 'daisy', 'cherry', 'blossom', 'leaf', 'petal',
    'ocean', 'wave', 'river', 'forest', 'meadow', 'garden',
    'berry', 'strawberry', 'raspberry', 'blueberry', 'cherry',
    'peach', 'mango', 'coconut', 'honey', 'sugar', 'candy',
    'cookie', 'biscuit', 'muffin', 'cupcake', 'donut', 'cake',
    'fairy', 'elf', 'pixie', 'sprite', 'dream', 'magic', 'spell',
    'wish', 'hope', 'joy', 'bliss', 'peace', 'love', 'heart',
    'ribbon', 'bow', 'button', 'bubble', 'glitter', 'sparkle',
    'dewdrop', 'snowflake', 'raindrop', 'feather', 'pillow',
    'blanket', 'socks', 'mittens', 'scarf'
];

const EXTRA_RARE = ['honeycomb', 'butterfly', 'dragonfly', 'strawberry'];
const SECRET_WORDS = ['parallelogram'];

// ===== ГЕНЕРАЦИЯ МИЛОГО ЮЗЕРНЕЙМА =====
function generateCuteUsername() {
    // Редкая пасхалка - 0.5% шанс на parallelogram
    if (Math.random() < 0.005) {
        const num = Math.random() < 0.3 ? Math.floor(Math.random() * 100) : '';
        return `parallelogram${num}`;
    }
    
    // Очень редкие - 1% шанс
    if (Math.random() < 0.01) {
        const rare = EXTRA_RARE[Math.floor(Math.random() * EXTRA_RARE.length)];
        const num = Math.random() < 0.3 ? Math.floor(Math.random() * 100) : '';
        return `${rare}${num}`;
    }
    
    const adj = cuteAdjectives[Math.floor(Math.random() * cuteAdjectives.length)];
    const noun = cuteNouns[Math.floor(Math.random() * cuteNouns.length)];
    
    const separators = ['_', '.', '', '-'];
    const separator = separators[Math.floor(Math.random() * separators.length)];
    
    let num = '';
    if (Math.random() < 0.4) {
        num = Math.floor(Math.random() * 100).toString();
    }
    
    let username = `${adj}${separator}${noun}${num}`;
    username = username.toLowerCase();
    
    if (username.length > 50) {
        username = username.substring(0, 50);
    }
    
    return username;
}

// ===== ПРОВЕРКА ВАЛИДНОСТИ ЮЗЕРНЕЙМА =====
function isValidUsername(username) {
    if (!username || username.length < 3 || username.length > 50) return false;
    return /^[a-zA-Z0-9_]+$/.test(username);
}

// ===== ПРОВЕРКА УНИКАЛЬНОСТИ ЮЗЕРНЕЙМА =====
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
                alert(`⏳ Менять username можно раз в неделю. Осталось ${daysLeft} дн.`);
                return false;
            }
        }
        
        const available = await isUsernameAvailable(newUsername);
        if (!available) {
            alert('❌ этот username уже занят');
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
        alert('✅ Username обновлён!');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка обновления username:', error);
        return false;
    }
}

// ===== ПОИСК ПОЛЬЗОВАТЕЛЯ =====
async function findUserByUsername(username) {
    try {
        const usernameDoc = await db.collection('usernames').doc(username).get();
        
        if (!usernameDoc.exists) return null;
        
        const { uid } = usernameDoc.data();
        const userDoc = await db.collection('users').doc(uid).get();
        
        return {
            id: uid,
            ...userDoc.data()
        };
        
    } catch (error) {
        console.error('❌ Ошибка поиска:', error);
        return null;
    }
}

// ===== ОТПРАВКА ЗАЯВКИ В ДРУЗЬЯ =====
async function sendFriendRequest(toUsername) {
    try {
        const toUser = await findUserByUsername(toUsername);
        
        if (!toUser) {
            alert('❌ Пользователь не найден');
            return;
        }
        
        const toUserId = toUser.id;
        const currentUserId = auth.currentUser.uid;
        
        if (toUserId === currentUserId) {
            alert('❌ Нельзя добавить самого себя');
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
        
        alert('✅ Заявка отправлена!');
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        alert('❌ Ошибка при отправке заявки');
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
                if (typeof req === 'object') {
                    return req.from !== fromUserId;
                }
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
                if (typeof req === 'object') {
                    return req.from !== fromUserId;
                }
                return req !== fromUserId;
            });
            
            await currentUserRef.update({
                friendRequests: updatedRequests
            });
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
            lastMessage: null
        });
        return chatRef.id;
    } catch (error) {
        console.error('❌ Ошибка создания чата:', error);
        return null;
    }
}

// ===== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        currentScreen = screenId;
        
        if (screenId === 'friendsScreen' && typeof window.renderContacts === 'function') {
            window.renderContacts();
        }
    }
}

// ===== ПРОВЕРКА ПРОФИЛЯ ПОСЛЕ ВХОДА =====
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
        
        document.getElementById('settingsName').value = userData.name || '';
        document.getElementById('settingsUsername').value = userData.username || '';
        document.getElementById('profileEmail').textContent = auth.currentUser.email || '';
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка проверки профиля:', error);
        return false;
    }
}

// ===== ВХОД ЧЕРЕЗ EMAIL =====
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
        
        showScreen('friendsScreen');
        
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

// ===== ВЫХОД =====
async function logout() {
    try {
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
            await db.collection('users').doc(auth.currentUser.uid).update({
                online: false
            });
        }
        
        await auth.signOut();
        
        localStorage.clear();
        sessionStorage.clear();
        
        showScreen('loginMethodScreen');
        
    } catch (error) {
        console.error('❌ Ошибка выхода:', error);
    }
}

// ===== ТЕМЫ =====
function setTheme(themeId) {
    currentTheme = themeId;
    localStorage.setItem('nyashgram_theme', themeId);
    applyTheme();
}

function toggleThemeMode() {
    themeMode = themeMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('nyashgram_mode', themeMode);
    
    const modeBtn = document.getElementById('themeModeToggle');
    if (modeBtn) modeBtn.textContent = themeMode === 'light' ? '☀️' : '🌙';
    
    applyTheme();
}

function applyTheme() {
    document.body.className = `theme-${currentTheme} mode-${themeMode}`;
}

// ===== ШРИФТЫ =====
function setFont(fontClass) {
    currentFont = fontClass;
    localStorage.setItem('nyashgram_font', fontClass);
    document.body.className = document.body.className.split(' ').filter(c => !c.startsWith('font-')).join(' ');
    document.body.classList.add(fontClass);
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
    
    // Применяем тему и шрифт
    applyTheme();
    document.body.classList.add(currentFont);
    
    // ===== ОБРАБОТЧИКИ ЭКРАНОВ =====
    
    // Экран входа
    document.getElementById('emailMethodBtn').addEventListener('click', () => showScreen('emailLoginScreen'));
    document.getElementById('anonymousMethodBtn').addEventListener('click', loginAnonymously);
    
    // Регистрация
    document.getElementById('showRegisterLink').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('emailRegisterScreen');
    });
    
    document.getElementById('backToLoginFromRegBtn').addEventListener('click', () => showScreen('emailLoginScreen'));
    
    document.getElementById('registerBtn').addEventListener('click', () => {
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
        
        registerWithEmail(name, email, password);
    });
    
    // Вход по email
    document.getElementById('showLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('emailLoginScreen');
    });
    
    document.getElementById('backFromEmailLoginBtn').addEventListener('click', () => showScreen('loginMethodScreen'));
    
    document.getElementById('loginBtn').addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            document.getElementById('loginError').textContent = '❌ Заполни все поля';
            return;
        }
        
        loginWithEmail(email, password);
    });
    
    // Подтверждение email
    document.getElementById('checkVerificationBtn').addEventListener('click', async () => {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
            await checkUserProfile();
            showScreen('friendsScreen');
        } else {
            alert('📧 Email ещё не подтверждён');
        }
    });
    
    document.getElementById('resendEmailBtn').addEventListener('click', async () => {
        await auth.currentUser.sendEmailVerification();
        alert('📧 Письмо отправлено снова');
    });
    
    document.getElementById('backToLoginFromVerifyBtn').addEventListener('click', () => showScreen('loginMethodScreen'));
    
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
    
    if (profileUsername) {
        profileUsername.addEventListener('input', validateProfileForm);
    }
    
    if (profileName) {
        profileName.addEventListener('input', validateProfileForm);
    }
    
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
            
            const success = await saveUserProfile(name, username);
            if (success) {
                showScreen('friendsScreen');
            }
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', async () => {
            const name = 'Пользователь';
            const username = 'user_' + Math.floor(Math.random() * 10000);
            
            await saveUserProfile(name, username);
            showScreen('friendsScreen');
        });
    }
    
    // ===== НАСТРОЙКИ =====
    document.getElementById('settingsBtn').addEventListener('click', () => {
        if (auth.currentUser) {
            document.getElementById('settingsName').value = localStorage.getItem('nyashgram_name') || '';
            document.getElementById('settingsUsername').value = localStorage.getItem('nyashgram_username') || '';
            document.getElementById('profileEmail').textContent = auth.currentUser.email || 'гость';
            document.getElementById('profileType').textContent = auth.currentUser.isAnonymous ? '👤 гость' : '📧 email';
        }
        showScreen('settingsScreen');
    });
    
    document.getElementById('backFromSettingsBtn').addEventListener('click', () => showScreen('friendsScreen'));
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Генератор в настройках
    document.getElementById('settingsGenerateBtn').addEventListener('click', () => {
        document.getElementById('settingsUsername').value = generateCuteUsername();
    });
    
    // Сохранение настроек
    document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
        const newName = document.getElementById('settingsName').value.trim();
        const newUsername = document.getElementById('settingsUsername').value.trim();
        
        if (!newName || !newUsername) {
            alert('❌ Заполни все поля');
            return;
        }
        
        const oldUsername = localStorage.getItem('nyashgram_username');
        
        if (newUsername !== oldUsername) {
            await updateUsername(newUsername);
        }
        
        if (newName !== localStorage.getItem('nyashgram_name')) {
            localStorage.setItem('nyashgram_name', newName);
        }
        
        alert('✅ Настройки сохранены');
    });
    
    // ===== ПОИСК ДРУЗЕЙ =====
    document.getElementById('searchFriendsBtn').addEventListener('click', () => {
        showScreen('searchFriendsScreen');
        document.getElementById('searchUsersInput').value = '';
        document.getElementById('searchResultsList').innerHTML = '';
    });
    
    document.getElementById('backFromSearchBtn').addEventListener('click', () => showScreen('friendsScreen'));
    
    let searchTimeout;
    document.getElementById('searchUsersInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            document.getElementById('searchResultsList').innerHTML = '';
            return;
        }
        
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
                
                resultsList.querySelector('.add-friend-btn').addEventListener('click', () => {
                    sendFriendRequest(user.username);
                });
            } else {
                resultsList.innerHTML = '<div class="empty-state">❌ пользователь не найден</div>';
            }
        }, 500);
    });
    
    // ===== ТЕМЫ =====
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });
    
    document.getElementById('themeModeToggle').addEventListener('click', toggleThemeMode);
    
    // ===== ШРИФТЫ =====
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => setFont(btn.dataset.font));
    });
    
    // ===== СЛУШАТЕЛЬ АВТОРИЗАЦИИ =====
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('👤 Пользователь авторизован:', user.uid);
            
            if (!user.isAnonymous) {
                await checkUserProfile();
            }
            
            document.dispatchEvent(new CustomEvent('userAuthenticated'));
        } else {
            console.log('👤 Пользователь не авторизован');
            showScreen('loginMethodScreen');
        }
    });
});

// ===== ЭКСПОРТ =====
window.showScreen = showScreen;
window.createPrivateChat = createPrivateChat;
window.acceptFriendRequest = acceptFriendRequest;
window.removeFriendRequest = removeFriendRequest;
window.generateCuteUsername = generateCuteUsername;
window.isValidUsername = isValidUsername;
window.findUserByUsername = findUserByUsername;
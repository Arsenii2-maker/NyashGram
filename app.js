// app.js — ИДЕАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ

const firebaseConfig = {
  apiKey: "AIzaSyCqTm_oMEVRjOwodVrhmWHLNl1DA4x9sUQ",
  authDomain: "nyashgram-e9f69.firebaseapp.com",
  projectId: "nyashgram-e9f69",
  storageBucket: "nyashgram-e9f69.firebasestorage.app",
  messagingSenderId: "54620743155",
  appId: "1:54620743155:web:4db4690057b103ef859e86",
  measurementId: "G-KXXQTJVEGV"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let currentChat = null;

// ===== ЭКРАНЫ =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// ===== ТЕМЫ =====
function setTheme(theme, mode) {
  document.body.className = `${theme}-${mode}`;
  localStorage.setItem('theme', theme);
  localStorage.setItem('mode', mode);
}

// ===== ЗАГРУЗКА =====
function showLoading(msg) {
  document.getElementById('loadingMessage').textContent = msg;
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

// ===== РЕГИСТРАЦИЯ =====
async function registerWithEmail(name, email, password) {
  try {
    showLoading('создаём аккаунт...');
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    await user.sendEmailVerification();
    await user.updateProfile({ displayName: name });
    
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      username: name.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000),
      createdAt: new Date()
    });
    
    hideLoading();
    showScreen('verifyEmailScreen');
    return true;
  } catch (error) {
    hideLoading();
    alert(error.message);
    return false;
  }
}

// ===== ВХОД =====
async function loginWithEmail(email, password) {
  try {
    showLoading('вход...');
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      hideLoading();
      showScreen('verifyEmailScreen');
      return false;
    }
    
    const doc = await db.collection('users').doc(user.uid).get();
    currentUser = { uid: user.uid, ...doc.data() };
    
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    hideLoading();
    showScreen('friendsScreen');
    return true;
  } catch (error) {
    hideLoading();
    alert(error.message);
    return false;
  }
}

// ===== АНОНИМНО =====
async function loginAnonymously() {
  try {
    showLoading('создаём гостя...');
    await auth.signInAnonymously();
    hideLoading();
    showScreen('friendsScreen');
    return true;
  } catch (error) {
    hideLoading();
    alert(error.message);
    return false;
  }
}

// ===== ВЫХОД =====
async function logout() {
  await auth.signOut();
  localStorage.clear();
  showScreen('loginMethodScreen');
}

// ===== СОБЫТИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  // Навигация
  document.getElementById('emailMethodBtn')?.addEventListener('click', () => showScreen('emailRegisterScreen'));
  document.getElementById('anonymousMethodBtn')?.addEventListener('click', loginAnonymously);
  
  document.getElementById('backToLoginFromRegBtn')?.addEventListener('click', () => showScreen('loginMethodScreen'));
  document.getElementById('backFromEmailLoginBtn')?.addEventListener('click', () => showScreen('loginMethodScreen'));
  document.getElementById('backToLoginFromVerifyBtn')?.addEventListener('click', () => showScreen('loginMethodScreen'));
  
  document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailLoginScreen');
  });
  
  document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('emailRegisterScreen');
  });
  
  document.getElementById('backFromSearchBtn')?.addEventListener('click', () => showScreen('friendsScreen'));
  document.getElementById('backFromSettingsBtn')?.addEventListener('click', () => showScreen('friendsScreen'));
  document.getElementById('backBtn')?.addEventListener('click', () => showScreen('friendsScreen'));
  
  // Регистрация
  document.getElementById('registerBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    
    if (!name || !email || !pass) return alert('заполни все поля');
    if (pass !== confirm) return alert('пароли не совпадают');
    if (pass.length < 6) return alert('пароль минимум 6 символов');
    
    await registerWithEmail(name, email, pass);
  });
  
  // Вход
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    if (!email || !pass) return alert('введи email и пароль');
    await loginWithEmail(email, pass);
  });
  
  // Подтверждение
  document.getElementById('checkVerificationBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        const doc = await db.collection('users').doc(user.uid).get();
        currentUser = { uid: user.uid, ...doc.data() };
        showScreen('friendsScreen');
      } else {
        alert('email ещё не подтверждён');
      }
    }
  });
  
  document.getElementById('resendEmailBtn')?.addEventListener('click', async () => {
    await auth.currentUser?.sendEmailVerification();
    alert('письмо отправлено');
  });
  
  // Поиск
  document.getElementById('addFriendBtn')?.addEventListener('click', () => showScreen('searchFriendsScreen'));
  document.getElementById('settingsBtn')?.addEventListener('click', () => showScreen('settingsScreen'));
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
  // Вкладки
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Проверка входа
  if (localStorage.getItem('user')) {
    currentUser = JSON.parse(localStorage.getItem('user'));
    showScreen('friendsScreen');
  } else {
    showScreen('loginMethodScreen');
  }
  
  // Экспорт
  window.showScreen = showScreen;
  window.currentUser = currentUser;
});
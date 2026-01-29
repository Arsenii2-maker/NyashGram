// Глобальные переменные
let currentMood = 'cozy';
let moodOrbContainer = null;
let mainOrb = null;
let orbOptions = null;
let isDragging = false;
let currentX = 0, currentY = 0, initialX = 0, initialY = 0;

// Инициализация при открытии чата
function initMoodOrbs() {
  moodOrbContainer = document.getElementById('moodOrbContainer');
  mainOrb = document.getElementById('mainMoodOrb');
  orbOptions = document.getElementById('orbOptions');

  if (!moodOrbContainer) return;

  // Загрузка сохранённого mood и позиции
  currentMood = chatData[currentChat]?.mood || 'cozy';
  updateMainOrb();

  const savedPos = localStorage.getItem(`moodOrbPos_${currentChat}`);
  if (savedPos) {
    const pos = JSON.parse(savedPos);
    moodOrbContainer.style.left = pos.left;
    moodOrbContainer.style.top = pos.top;
    moodOrbContainer.style.right = 'auto';
    moodOrbContainer.style.bottom = 'auto';
  } else {
    // дефолтная позиция (справа снизу)
    moodOrbContainer.style.right = '20px';
    moodOrbContainer.style.bottom = '100px';
  }

  // Клик по главному orb → раскрытие/сворачивание
  mainOrb.addEventListener('click', toggleOrbOptions);

  // Клик по опциям → выбор mood
  orbOptions.querySelectorAll('.orb').forEach(orb => {
    orb.addEventListener('click', () => {
      currentMood = orb.dataset.mood;
      chatData[currentChat].mood = currentMood;
      updateMainOrb();
      toggleOrbOptions(); // сворачиваем после выбора
      applyMood(); // твоя функция изменения фона/цветов/звуков
    });
  });

  // Drag & drop
  moodOrbContainer.addEventListener('mousedown', startDrag);
  moodOrbContainer.addEventListener('touchstart', startDrag);
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

function updateMainOrb() {
  mainOrb.textContent = { cozy: '💗', night: '🌙', lofi: '🎧', chaotic: '💥' }[currentMood];
  mainOrb.className = `main-orb ${currentMood} active`;
}

function toggleOrbOptions() {
  orbOptions.classList.toggle('expanded');
}

// Drag функции (как в прошлом сообщении, но адаптированные)
function startDrag(e) {
  e.preventDefault();
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

  initialX = clientX - currentX;
  initialY = clientY - currentY;
  isDragging = true;
  moodOrbContainer.classList.add('dragging');
}

function onDrag(e) {
  if (!isDragging) return;
  e.preventDefault();

  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

  currentX = clientX - initialX;
  currentY = clientY - initialY;

  moodOrbContainer.style.left = `${currentX}px`;
  moodOrbContainer.style.top = `${currentY}px`;
  moodOrbContainer.style.right = 'auto';
  moodOrbContainer.style.bottom = 'auto';
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  moodOrbContainer.classList.remove('dragging');

  snapToEdge();
  saveMoodPosition();
}

function snapToEdge() {
  const rect = moodOrbContainer.getBoundingClientRect();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const margin = 20;

  let newLeft = rect.left;
  let newTop = rect.top;

  const distances = {
    left: rect.left,
    right: w - (rect.left + rect.width),
    top: rect.top,
    bottom: h - (rect.top + rect.height)
  };

  const closest = Object.keys(distances).reduce((a, b) => distances[a] < distances[b] ? a : b);

  if (closest === 'left')   newLeft = margin;
  if (closest === 'right')  newLeft = w - rect.width - margin;
  if (closest === 'top')    newTop = margin;
  if (closest === 'bottom') newTop = h - rect.height - margin - 20; // над клавиатурой

  moodOrbContainer.style.transition = 'left 0.45s cubic-bezier(0.34,1.56,0.64,1), top 0.45s cubic-bezier(0.34,1.56,0.64,1)';
  moodOrbContainer.style.left = `${newLeft}px`;
  moodOrbContainer.style.top = `${newTop}px`;

  setTimeout(() => moodOrbContainer.style.transition = '', 500);
}

function saveMoodPosition() {
  if (!moodOrbContainer || !currentChat) return;
  const rect = moodOrbContainer.getBoundingClientRect();
  localStorage.setItem(`moodOrbPos_${currentChat}`, JSON.stringify({
    left: moodOrbContainer.style.left,
    top: moodOrbContainer.style.top
  }));
}
let currentMood = 'cozy'; // дефолт

const moodSettings = {
  cozy: {
    bg: '#fff8fc',           // мягкий розовый
    bubbleMe: '#ffadd6',
    bubbleOther: '#ffe4f0',
    sound: 'cozy-pop.mp3',   // мягкий пузырьковый chime
    anim: 'cozy'
  },
  night: {
    bg: '#0d1a2b',
    bubbleMe: '#7ab8ff',
    bubbleOther: '#2a3b52',
    sound: 'night-chime.mp3', // тихий колокольчик
    anim: 'night'
  },
  lofi: {
    bg: '#fdfaf5',
    bubbleMe: '#d9b99b',
    bubbleOther: '#f0e6d9',
    sound: 'lofi-ding.mp3',   // расслабленный ding
    anim: 'lofi'
  },
  chaotic: {
    bg: '#fff0f0',
    bubbleMe: '#ff6b6b',
    bubbleOther: '#ffecec',
    sound: 'chaotic-boop.mp3', // быстрый игривый boop
    anim: 'chaotic'
  }
};
let currentChat = null;
const chatData = {};

function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");
  // Загружаем сохранённый mood для этого чата (если был)
currentMood = chatData[currentChat]?.mood || 'cozy';
applyMood();

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;
  document.getElementById("chatAvatar").style.background =
  gradientFor(contact.name);
  renderMessages();
}

function renderMessages() {
  const messages = document.getElementById("messages");
  const intro = document.getElementById("chatIntro");

  messages.innerHTML = "";

  if (chatData[currentChat].length === 0) {
    intro.style.display = "block";
    return;
  }

  intro.style.display = "none";

  chatData[currentChat].forEach(m => {
    const el = document.createElement("div");
    el.className = `message ${m.from}`;
    el.textContent = m.text;
    messages.appendChild(el);
  });
}

function sendMessage(text) {
  if (!text.trim()) return;
  chatData[currentChat].push({ from: "me", text });
  // Анимация + звук
const settings = moodSettings[currentMood];
new Audio(`sounds/${settings.sound}`).play(); // звук отправки
// Звук отправки в зависимости от mood
const currentSound = moodSettings[currentMood]?.sound || 'cozy-pop.mp3';
const audio = new Audio(`sounds/${currentSound}`);
audio.play().catch(err => console.log("Звук не сыграл:", err));  // если браузер блокирует — не паникуй
// Добавляем класс mood-anim к новому сообщению
  renderMessages();
  el.className = `message ${m.from} appear ${currentMood}`;
}
function applyMood() {
  const settings = moodSettings[currentMood];
  
  // Фон чата
  document.getElementById("chatScreen").style.background = settings.bg;
  document.getElementById("messages").style.background = settings.bg;
  
  // Цвета пузырей (переопределяем глобальные переменные)
  document.documentElement.style.setProperty('--bubble-me', settings.bubbleMe);
  document.documentElement.style.setProperty('--bubble-other', settings.bubbleOther);
  
  // Активная кнопка mood
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mood === currentMood);
  });
  
  // Сохраняем в chatData
  if (!chatData[currentChat]) chatData[currentChat] = [];
  chatData[currentChat].mood = currentMood;
}
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.onclick = () => {
    currentMood = btn.dataset.mood;
    applyMood();
  };
});

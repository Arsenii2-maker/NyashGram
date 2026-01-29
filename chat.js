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

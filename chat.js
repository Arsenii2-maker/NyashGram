let currentChat = null;
// Глобальные переменные
let currentMood = 'cozy';
let moodOrbContainer = null;
let mainOrb = null;
let orbOptions = null;
let isDragging = false;
let currentX = 0, currentY = 0, initialX = 0, initialY = 0;

const chatData = {};

function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");

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
  renderMessages();
}
//let currentMood = 'cozy';

function updateMainOrb() {
  const mainOrb = document.getElementById('mainMoodOrb');
  if (!mainOrb) return;
  
  mainOrb.textContent = { cozy: '💗', night: '🌙', lofi: '🎧', chaotic: '💥' }[currentMood];
  mainOrb.className = `main-orb ${currentMood}`;
}

function toggleOrbOptions() {
  const options = document.getElementById('orbOptions');
  if (options) options.classList.toggle('expanded');
}

function initMoodOrbs() {
  const mainOrb = document.getElementById('mainMoodOrb');
  if (!mainOrb) return;

  updateMainOrb();

  mainOrb.onclick = toggleOrbOptions;

  document.getElementById('orbOptions')?.querySelectorAll('.orb').forEach(orb => {
    orb.onclick = () => {
      currentMood = orb.dataset.mood;
      chatData[currentChat].mood = currentMood;
      updateMainOrb();
      toggleOrbOptions();
      applyMood(); // твоя функция изменения фона/цветов
    };
  });
}

// Вызываем только когда чат открыт

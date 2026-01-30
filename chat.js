let currentChat = null;
let currentMood = 'cozy'; // только одна объявление!

const chatData = {};

function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;

  // Используем gradientFor из contacts.js (она доступна, если порядок скриптов правильный)
  document.getElementById("chatAvatar").style.background = gradientFor(contact.name);

  renderMessages();

  // Инициализируем mood-орбы только когда чат открыт
  initMoodOrbs();
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

// Mood orb функции
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

  const options = document.getElementById('orbOptions');
  if (options) {
    options.querySelectorAll('.orb').forEach(orb => {
      orb.onclick = () => {
        currentMood = orb.dataset.mood;
        chatData[currentChat].mood = currentMood;
        updateMainOrb();
        toggleOrbOptions();
        // applyMood(); // если есть — вызови здесь
      };
    });
  }
}
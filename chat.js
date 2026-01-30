let currentChat = null;
let currentMood = 'cozy';

const chatData = {};

function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;
  document.getElementById("chatAvatar").style.background = gradientFor(contact.name);

  renderMessages();

  initMoodOrb();
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

// Mood orb
function updateMainOrb() {
  const orb = document.getElementById('mainMoodOrb');
  if (!orb) return;

  const emojis = { cozy: '💗', night: '🌙', lofi: '🎧', chaotic: '💥' };
  orb.textContent = emojis[currentMood] || '💗';
  orb.className = `main-orb ${currentMood}`;
}

function toggleOrbOptions() {
  const options = document.getElementById('orbOptions');
  if (options) options.classList.toggle('expanded');
}

function initMoodOrb() {
  const orb = document.getElementById('mainMoodOrb');
  if (!orb) return;

  updateMainOrb();
  orb.onclick = toggleOrbOptions;

  const options = document.getElementById('orbOptions');
  if (options) {
    options.querySelectorAll('.orb').forEach(opt => {
      opt.onclick = () => {
        currentMood = opt.dataset.mood;
        chatData[currentChat].mood = currentMood;
        updateMainOrb();
        toggleOrbOptions();
      };
    });
  }
}
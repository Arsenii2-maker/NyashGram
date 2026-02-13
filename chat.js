let currentChat = null;
let currentMood = 'cozy';

const chatData = {};

// ==================== NYASHHELP ====================
const nyashHelpResponses = {
  "тема": "Чтобы сменить тему — зайди в Настройки → Тема 🩷",
  "шрифт": "Шрифты меняются в Настройках → Шрифт. Самые милые — Cozy и Rounded~",
  "аватар": "Загрузи аватарку в Настройках → Аватарка. Любая фотка из галереи!",
  "сообщение": "Пиши внизу и жми ➤! Enter тоже отправляет ♡",
  "mood": "Mood — это настроение чата! Тапни по orb внизу справа → выбирай вайб 💗🌙🎧💥",
  "звук": "Звуки зависят от mood. Если тихо — проверь звук на телефоне!",
  "default": "Хмм... не совсем поняла 😿 Спроси по-другому или выбери вопрос ниже~"
};

function isNyashHelp() {
  return currentChat === "nyashhelp";
}

function getNyashHelpResponse(text) {
  text = text.toLowerCase();
  if (text.includes("тема")) return nyashHelpResponses["тема"];
  if (text.includes("шрифт")) return nyashHelpResponses["шрифт"];
  if (text.includes("аватар")) return nyashHelpResponses["аватар"];
  if (text.includes("сообщ")) return nyashHelpResponses["сообщение"];
  if (text.includes("mood")) return nyashHelpResponses["mood"];
  if (text.includes("звук")) return nyashHelpResponses["звук"];
  return nyashHelpResponses["default"];
}

// ==================== NYASHGPT ====================
function getNyashGPTResponse(text) {
  // Пока имитация (можно потом заменить на настоящий API)
  const responses = [
    "Ого, интересный вопрос! 🌍 Дай подумать...",
    "Хороший вопрос! Вот что я думаю...",
    "Я только что погуглил это в своей голове 😏",
    "Знаешь, это напоминает мне одну историю...",
    "Сейчас я в настроении ответить честно..."
  ];
  return responses[Math.floor(Math.random() * responses.length)] + " " + text;
}

// ==================== OPENCHAT ====================
function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;
  document.getElementById("chatAvatar").style.background = gradientFor(contact.name);

  // Приветствие для специальных чатов
  if (isNyashHelp()) {
    chatData[currentChat].push({ from: "nyashhelp", text: "Привет! Я NyashHelp 🩷 Спрашивай про приложение, я знаю всё-всё~ 💕" });
  } else if (currentChat === "nyashgpt") {
    chatData[currentChat].push({ from: "nyashgpt", text: "Привет! Я NyashGPT 🌍 Спрашивай что угодно — погоду, шутки, факты, советы... Я в интернете~ ✨" });
  }

  renderMessages();
}

// ==================== SENDMESSAGE ====================
function sendMessage(text) {
  if (!text.trim()) return;

  chatData[currentChat].push({ from: "me", text });
  renderMessages();

  // Ответ от NyashHelp
  if (isNyashHelp()) {
    setTimeout(() => {
      const response = getNyashHelpResponse(text);
      chatData[currentChat].push({ from: "nyashhelp", text: response });
      renderMessages();
    }, 700);
  }

  // Ответ от NyashGPT
  if (currentChat === "nyashgpt") {
    setTimeout(() => {
      const response = getNyashGPTResponse(text);
      chatData[currentChat].push({ from: "nyashgpt", text: response });
      renderMessages();
    }, 1200);
  }
}

// ==================== RENDERMESSAGES ====================
function renderMessages() {
  const messages = document.getElementById("messages");
  const intro = document.getElementById("chatIntro");

  messages.innerHTML = "";

  // Скрываем стандартную панель быстрых сообщений в NyashHelp и NyashGPT
  if (isNyashHelp() || currentChat === "nyashgpt") {
    intro.style.display = "none";
  } else if (chatData[currentChat].length === 0) {
    intro.style.display = "block";
  } else {
    intro.style.display = "none";
  }

  chatData[currentChat].forEach(m => {
    const el = document.createElement("div");
    el.className = `message ${m.from}`;
    el.textContent = m.text;
    messages.appendChild(el);
  });

  messages.scrollTop = messages.scrollHeight;
}

// ==================== INIT MOOD ORB ====================
function initMoodOrb() {
  const orb = document.getElementById('mainMoodOrb');
  if (!orb) return;

  updateMainOrb();
  orb.onclick = toggleOptions;

  const opts = document.getElementById('orbOptions');
  if (opts) {
    opts.querySelectorAll('.orb').forEach(opt => {
      opt.onclick = () => {
        currentMood = opt.dataset.mood;
        chatData[currentChat].mood = currentMood;
        updateMainOrb();
        toggleOptions();
      };
    });
  }
}

// Вызываем при открытии чата
function openChat(contact) {
  // ... (как выше)
  renderMessages();
  initMoodOrb();   // ← добавили
}
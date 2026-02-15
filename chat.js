let currentChat = null;
const chatData = {};

// ==================== NYASHHELP ====================
const nyashHelpResponses = {
  "тема": "Чтобы сменить тему — зайди в Настройки → Тема и выбери любую! 🩷",
  "шрифт": "Шрифты меняются в Настройках → Шрифт. Самые милые — Cozy и Rounded~",
  "аватар": "Загрузи аватарку в Настройках → Аватарка. Любая фотка из галереи подойдёт!",
  "сообщение": "Пиши в поле внизу и жми ➤! Enter тоже отправляет~",
  "mood": "Mood — это настроение чата! Тапни по orb внизу справа → выбирай вайб 💗🌙🎧💥",
  "звук": "Звуки зависят от mood. Если тихо — проверь настройки телефона!",
  "как добавить": "Пока друзей добавлять нельзя, но скоро будет! Пока наслаждайся болтовнёй с NyashHelp 🩷",
  "default": "Хмм... не совсем поняла 😿 Спроси по-другому или выбери вопрос ниже~"
};

const nyashHelpQuickQuestions = [
  "Как сменить тему?",
  "Как поменять шрифт?",
  "Как загрузить аватарку?",
  "Как отправить сообщение?",
  "Что такое mood?",
  "Как включить звук?",
  "Как добавить друга?"
];

// ==================== NYASHTALK ====================
const nyashTalkTopics = [
  { title: "О погоде ☁️", messages: ["Какая сегодня погода?", "Люблю дождь!", "Солнце или снег?"] },
  { title: "О настроении 💗", messages: ["Какой у тебя вайб?", "Сегодня грустно", "Я счастлив!"] },
  { title: "О котиках 🐱", messages: ["Покажи котика", "Люблю кошек!", "Мяу~"] },
  { title: "О еде 🍰", messages: ["Что ты любишь есть?", "Хочу пиццу", "Сладкое или солёное?"] },
  { title: "О снах ✨", messages: ["Что тебе снилось?", "Видел странный сон", "Спокойной ночи"] },
  { title: "О фильмах/аниме 🎬", messages: ["Какой твой любимый фильм?", "Смотрел новое аниме?", "Рекомендуй что-нибудь"] },
  { title: "О музыке 🎧", messages: ["Что слушаешь?", "Любимая песня?", "Включи что-нибудь"] },
  { title: "Секретики 🤫", messages: ["Расскажи секрет", "У меня есть секрет...", "Ты умеешь хранить тайны?"] },
  { title: "Планы на вечер 🌙", messages: ["Что делаешь вечером?", "Давай тусить", "Хочу сериал"] },
  { title: "Милые вещи 🧸", messages: ["Ты милый", "Самая милая в мире", "Плюшевый мишка"] }
];

function isNyashHelp() {
  return currentChat === "nyashhelp";
}

function isNyashTalk() {
  return currentChat === "nyashtalk";
}

function getNyashHelpResponse(text) {
  text = text.toLowerCase().trim();
  if (text.includes("тема") || text.includes("тему")) return nyashHelpResponses["тема"];
  if (text.includes("шрифт") || text.includes("шрифты")) return nyashHelpResponses["шрифт"];
  if (text.includes("аватар") || text.includes("фото")) return nyashHelpResponses["аватар"];
  if (text.includes("сообщ") || text.includes("отправ")) return nyashHelpResponses["сообщение"];
  if (text.includes("mood") || text.includes("настроение")) return nyashHelpResponses["mood"];
  if (text.includes("звук")) return nyashHelpResponses["звук"];
  if (text.includes("добавить")) return nyashHelpResponses["как добавить"];
  return nyashHelpResponses["default"];
}

function getNyashTalkResponse(text) {
  text = text.toLowerCase().trim();

  for (const topic of nyashTalkTopics) {
    for (const msg of topic.messages) {
      if (text.includes(msg.toLowerCase())) {
        const randomIndex = Math.floor(Math.random() * topic.messages.length);
        return "Ой, это так мило! 💕 " + topic.messages[randomIndex] + " А ты как думаешь?";
      }
    }
  }

  return "Хмм... интересно! 💕 Расскажи подробнее~";
}

// ==================== OPENCHAT ====================
function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;
  document.getElementById("chatAvatar").style.background = contact.avatar || gradientFor(contact.name);

  // Очищаем поле ввода при смене чата
  document.getElementById("messageInput").value = "";

  // Приветствие только один раз
  if (chatData[currentChat].length === 0) {
    if (isNyashHelp()) {
      chatData[currentChat].push({ from: "nyashhelp", text: "Привет! Я NyashHelp 🩷 Спрашивай про приложение, я знаю всё-всё~ 💕" });
    } else if (isNyashTalk()) {
      chatData[currentChat].push({ from: "nyashtalk", text: "Приветик! Я NyashTalk 🌸 Давай поболтаем о чём угодно милом~ Выбирай тему! 💕" });
    }
  }

  renderMessages();
}

// ==================== SENDMESSAGE ====================
function sendMessage(text) {
  if (!text.trim()) return;

  chatData[currentChat].push({ from: "me", text });
  renderMessages();

  if (isNyashHelp()) {
    setTimeout(() => {
      const response = getNyashHelpResponse(text);
      chatData[currentChat].push({ from: "nyashhelp", text: response });
      renderMessages();
    }, 800);
  }

  if (isNyashTalk()) {
    setTimeout(() => {
      const response = getNyashTalkResponse(text);
      chatData[currentChat].push({ from: "nyashtalk", text: response });
      renderMessages();
    }, 800);
  }
}

// ==================== RENDERMESSAGES ====================
function renderMessages() {
  const messages = document.getElementById("messages");
  const intro = document.getElementById("chatIntro");

  messages.innerHTML = "";

  // Скрываем стандартную панель для NyashHelp и NyashTalk
  intro.style.display = "none";

  // Панель для NyashHelp
  if (isNyashHelp()) {
    const helpPanel = document.createElement("div");
    helpPanel.className = "nyashhelp-quick";
    helpPanel.innerHTML = `
      <div class="intro-title">Частые вопросы 🩷</div>
      <div class="intro-buttons nyashhelp-buttons"></div>
    `;
    messages.appendChild(helpPanel);

    const container = helpPanel.querySelector(".nyashhelp-buttons");
    nyashHelpQuickQuestions.forEach(q => {
      const btn = document.createElement("button");
      btn.textContent = q;
      btn.addEventListener("click", () => sendMessage(q));
      container.appendChild(btn);
    });
  }

  // Панель для NyashTalk
  if (isNyashTalk()) {
    const talkPanel = document.createElement("div");
    talkPanel.className = "nyashtalk-quick";
    talkPanel.innerHTML = `
      <div class="intro-title">Выбери тему разговора 💕</div>
      <div class="intro-buttons nyashtalk-buttons"></div>
    `;
    messages.appendChild(talkPanel);

    const container = talkPanel.querySelector(".nyashtalk-buttons");
    nyashTalkTopics.forEach(topic => {
      const btn = document.createElement("button");
      btn.textContent = topic.title;
      btn.addEventListener("click", () => {
        // Отправляем случайное сообщение из темы
        const randomMsg = topic.messages[Math.floor(Math.random() * topic.messages.length)];
        sendMessage(randomMsg);
      });
      container.appendChild(btn);
    });
  }

  // Стандартная панель для обычных чатов
  if (!isNyashHelp() && !isNyashTalk() && chatData[currentChat].length === 0) {
    intro.style.display = "block";
  }

  // Сообщения
  if (chatData[currentChat]) {
    chatData[currentChat].forEach(m => {
      const el = document.createElement("div");
      el.className = `message ${m.from}`;
      el.textContent = m.text;
      messages.appendChild(el);
    });
  }

  messages.scrollTop = messages.scrollHeight;
}
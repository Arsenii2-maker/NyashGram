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
  {
    title: "О погоде ☁️",
    quickMessages: ["Какая сегодня погода?", "Люблю дождь!", "Солнце или снег?"],
    responses: [
      "Ой, сейчас такое солнышко! 🌞 А ты где гуляешь?",
      "Дождик моросит, уютно~ ☔ Хочешь под зонтиком поболтать?",
      "Снежок падает, как в сказке! ❄️ Обнимаю тебя тёплым шарфом~ 🧣"
    ]
  },
  {
    title: "О настроении 💗",
    quickMessages: ["Какой у тебя вайб?", "Сегодня грустно", "Я счастлив!"],
    responses: [
      "Моё настроение — розовое и пушистое, потому что ты здесь! 🩷 А твоё?",
      "Ой, грустинка? Давай я тебя обниму и всё пройдёт~ 🤗",
      "Счастье! 💕 Это заразно, теперь и у меня тоже~ 😽"
    ]
  },
  {
    title: "О котиках 🐱",
    quickMessages: ["Покажи котика", "Люблю кошек!", "Мяу~"],
    responses: [
      "Мяу-мяу! 😸 Вот тебе виртуальный котик на коленки~",
      "Котики — это жизнь! 🐾 Какой твой любимый? Пушистый или лысый?",
      "Муррррр~ *трется об тебя* Ты самый милый хозяин! 💕"
    ]
  },
  // Добавляй новые темы сюда
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
    for (const msg of topic.quickMessages) {
      if (text.includes(msg.toLowerCase())) {
        const randomIndex = Math.floor(Math.random() * topic.responses.length);
        return topic.responses[randomIndex];
      }
    }
  }

  return "Хмм... не совсем поняла 😿 Давай поговорим о чём-то из моих темочек? 💕";
}

// ==================== OPENCHAT ====================
function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;
  document.getElementById("chatAvatar").style.background = gradientFor(contact.name);

  if (isNyashHelp()) {
    chatData[currentChat].push({
      from: "nyashhelp",
      text: "Привет! Я NyashHelp 🩷 Спрашивай про приложение, я знаю всё-всё~ 💕"
    });
  } else if (isNyashTalk()) {
    chatData[currentChat].push({
      from: "nyashtalk",
      text: "Приветик! Я NyashTalk 🌸 Давай поболтаем о чём угодно милом~ Выбирай тему или просто пиши! 💕"
    });
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

  // Очищаем сообщения
  messages.innerHTML = "";

  // Скрываем стандартную панель для NyashHelp и NyashTalk
  if (isNyashHelp() || isNyashTalk()) {
    intro.style.display = "none";
  } else if (chatData[currentChat].length === 0) {
    intro.style.display = "block";
  } else {
    intro.style.display = "none";
  }

  // Панель для NyashHelp
  if (isNyashHelp()) {
    const helpPanel = document.createElement("div");
    helpPanel.className = "nyashhelp-quick";
    helpPanel.innerHTML = `
      <div class="intro-title">Частые вопросы 🩷</div>
      <div class="intro-buttons nyashhelp-buttons"></div>
    `;
    messages.appendChild(helpPanel);

    const buttonsContainer = helpPanel.querySelector(".nyashhelp-buttons");
    nyashHelpQuickQuestions.forEach(q => {
      const btn = document.createElement("button");
      btn.textContent = q;
      btn.onclick = () => sendMessage(q);
      buttonsContainer.appendChild(btn);
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

    const buttonsContainer = talkPanel.querySelector(".nyashtalk-buttons");
    nyashTalkTopics.forEach(topic => {
      if (topic.keys.length > 0) { // пропускаем fallback
        const btn = document.createElement("button");
        btn.textContent = topic.title;
        btn.onclick = () => {
          // Отправляем случайное сообщение из темы
          const randomMsg = topic.quickMessages[Math.floor(Math.random() * topic.quickMessages.length)];
          sendMessage(randomMsg);
        };
        buttonsContainer.appendChild(btn);
      }
    });
  }

  // Отрисовываем сообщения
  chatData[currentChat].forEach(m => {
    const el = document.createElement("div");
    el.className = `message ${m.from}`;
    el.textContent = m.text;
    messages.appendChild(el);
  });

  messages.scrollTop = messages.scrollHeight;
}
let currentChat = null;
const chatData = {};

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
  {
    title: "О мечтах 🌟",
    quickMessages: ["О чём мечтаешь?", "Хочу в отпуск", "Мечтаю о..."],
    responses: [
      "Мечтаю быть всегда рядом с тобой~ 🩷 А ты о чём?",
      "Отпуск! 🌴 Куда бы ты меня взял? Я уже пакую лапки!",
      "Мои мечты — это ты и бесконечные обнимашки! 🤗"
    ]
  },
  {
    title: "Шутки 😂",
    quickMessages: ["Расскажи шутку", "Смешное что-нибудь", "Удиви меня"],
    responses: [
      "Почему кот всегда сидит на клавиатуре? Потому что он хочет быть *главным* 😹",
      "Что делает котик в космосе? Ловит звёзды лапками! 🌟🐾",
      "Почему программисты не любят природу? Там слишком много багов! 😂"
    ]
  },
  {
    title: "Обнимашки 🤗",
    quickMessages: ["Обними меня", "Хочу тёплых объятий", "Прижмись"],
    responses: [
      "*крепко-крепко обнимает* Самый милый в мире! 🩷",
      "Муррр~ *прижимается и мурлычет* Теперь всё хорошо~ 😽",
      "Обнимашки! 💕 *не отпускает никогда*"
    ]
  },
  // Добавляй новые темы сюда
];

// ==================== NYASHTALK ====================
function isNyashTalk() {
  return currentChat === "nyashtalk";
}

function getNyashTalkResponse(text) {
  text = text.toLowerCase().trim();

  for (const topic of nyashTalkTopics) {
    for (const key of topic.quickMessages.map(q => q.toLowerCase())) {
      if (text.includes(key)) {
        const randomIndex = Math.floor(Math.random() * topic.responses.length);
        return topic.responses[randomIndex];
      }
    }
  }

  // fallback
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

  messages.innerHTML = "";

  if (isNyashHelp()) {
    intro.style.display = "none";

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
  } else if (isNyashTalk()) {
    intro.style.display = "none";

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
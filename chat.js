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
const nyashTalkResponses = {
  "привет": ["Приветик! 🩷 Как настроение сегодня~?", "Хай-хай! 💕 Соскучилась по тебе!", "Ооо, привет! 🌸 Что новенького?"],
  "как дела": ["У меня всё супер, потому что ты написал! 😽 А у тебя как?", "Муррр~ как котик на солнышке! 🐾 А ты?", "Настроение — розовое и пушистое! 💗 А твоё?"],
  "пока": ["Пока-пока~ Не скучай без меня! 🩷", "Бай-бай, сладких снов! 🌙💤", "До встречи, мой хороший! 😘 Обнимаю!"],
  "люблю": ["Аааа, я тоже тебя люблю! 💕 *крепко обнимает*", "Мурррр~ самый милый! 😽 Целую в щёчку!", "Люблю-люблю-люблю! 🩷 *прижимается*"],
  "спасибо": ["Пожалуйста, мой сладкий! 🩷", "Всегда рада помочь~ 😽", "Тебе спасибо за то, что ты есть! 💕"],
  "погода": ["Ой, сейчас такое солнышко! 🌞 А ты где гуляешь?", "Дождик моросит, уютно~ ☔ Хочешь под зонтиком поболтать?", "Снежок падает, как в сказке! ❄️"],
  "котик": ["Мяу-мяу! 😸 Вот тебе виртуальный котик на коленки~", "Котики — это жизнь! 🐾", "Муррррр~ *трется об тебя*"],
  "еда": ["Ммм, я обожаю клубничные пироженки! 🍓 А ты что любишь?", "Пиццааа! 🍕 Давай виртуально съедим вместе~", "Сладкое всегда побеждает~ 🍬"],
  "сон": ["Мне приснился ты! 😽 Самый сладкий сон~ А тебе что снилось?", "Спокойной ночи, мой хороший~ Пусть снятся только милые котики 💤🐾"],
  "фильм": ["Люблю все милые аниме про любовь~ 💕 А ты что смотришь?", "Рекомендую 'Kimi no Na wa' — очень трогательно! 🌟"],
  "музыка": ["Сейчас в плейлисте lo-fi и k-pop~ 🎶 А у тебя?", "Моя любимая — всё, что заставляет сердце биться быстрее! 💗"],
  "секрет": ["Ой, секретики! 🤫 Я умею хранить лучше всех~ Расскажи!", "Тссс... я никому не скажу! 😽"],
  "вечер": ["Вечером буду думать о тебе~ 🌟 А ты что планируешь?", "Тусить! 🎉 Только ты и я, виртуально~"],
  "милый": ["Ты милее всех на свете! 🩷 *краснеет*", "Аааа, спасибо! 😽 Теперь я буду ещё милее специально для тебя~"]
};

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

  for (const key in nyashTalkResponses) {
    if (text.includes(key)) {
      const answers = nyashTalkResponses[key];
      return answers[Math.floor(Math.random() * answers.length)];
    }
  }

  // Если ничего не подошло — милый fallback
  return [
    "Хмм... это так интересно! 💕 Расскажи ещё подробнее~",
    "Ой, я вся внимание! 😽 Что дальше?",
    "Миленько! 🩷 Продолжай, мне очень нравится слушать тебя~"
  ][Math.floor(Math.random() * 3)];
}

// ==================== OPENCHAT ====================
function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = { messages: [], draft: "" };

  showScreen("chat");

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;
  document.getElementById("chatAvatar").style.background = contact.avatar || gradientFor(contact.name);

  // Восстанавливаем черновик
  const input = document.getElementById("messageInput");
  input.value = chatData[currentChat].draft || "";

  // Приветствие только один раз
  if (chatData[currentChat].messages.length === 0) {
    if (isNyashHelp()) {
      chatData[currentChat].messages.push({ from: "nyashhelp", text: "Привет! Я NyashHelp 🩷 Спрашивай про приложение, я знаю всё-всё~ 💕" });
    } else if (isNyashTalk()) {
      chatData[currentChat].messages.push({ from: "nyashtalk", text: "Приветик! Я NyashTalk 🌸 Давай поболтаем о чём угодно милом~ Выбирай тему! 💕" });
    }
  }

  renderMessages();
}

// ==================== SENDMESSAGE ====================
function sendMessage(text) {
  if (!text.trim()) return;

  chatData[currentChat].messages.push({ from: "me", text });
  chatData[currentChat].draft = ""; // очищаем черновик
  document.getElementById("messageInput").value = "";
  renderMessages();

  if (isNyashHelp()) {
    setTimeout(() => {
      const response = getNyashHelpResponse(text);
      chatData[currentChat].messages.push({ from: "nyashhelp", text: response });
      renderMessages();
    }, 800);
  }

  if (isNyashTalk()) {
    setTimeout(() => {
      const response = getNyashTalkResponse(text);
      chatData[currentChat].messages.push({ from: "nyashtalk", text: response });
      renderMessages();
    }, 800);
  }

  // Обновляем список контактов (чтобы обновился черновик)
  renderContacts();
}

// ==================== RENDERMESSAGES ====================
function renderMessages() {
  const messages = document.getElementById("messages");
  const intro = document.getElementById("chatIntro");

  messages.innerHTML = "";

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
        const randomMsg = topic.messages[Math.floor(Math.random() * topic.messages.length)];
        sendMessage(randomMsg);
      });
      container.appendChild(btn);
    });
  }

  // Стандартная панель для обычных чатов
  if (!isNyashHelp() && !isNyashTalk() && chatData[currentChat].messages.length === 0) {
    intro.style.display = "block";
  }

  // Сообщения
  if (chatData[currentChat] && chatData[currentChat].messages) {
    chatData[currentChat].messages.forEach(m => {
      const el = document.createElement("div");
      el.className = `message ${m.from}`;
      el.textContent = m.text;
      messages.appendChild(el);
    });
  }

  messages.scrollTop = messages.scrollHeight;
}

// ==================== СОХРАНЕНИЕ ЧЕРНОВИКА ====================
document.getElementById("messageInput").addEventListener("input", (e) => {
  if (currentChat) {
    chatData[currentChat].draft = e.target.value;
    renderContacts(); // обновляем список контактов с черновиком
  }
});
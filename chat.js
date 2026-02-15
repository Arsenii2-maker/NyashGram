// chat.js — исправленный и чистый

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

  if (text.includes("привет") || text.includes("хай")) {
    return ["Приветик! 🩷 Как настроение сегодня~?", "Хай-хай! 💕 Соскучилась по тебе!"][Math.floor(Math.random()*2)];
  }
  if (text.includes("как дела") || text.includes("как ты")) {
    return ["У меня всё супер, потому что ты написал! 😽 А у тебя как?", "Муррр~ как котик на солнышке! 🐾 А ты?"][Math.floor(Math.random()*2)];
  }
  if (text.includes("пока") || text.includes("бай")) {
    return ["Пока-пока~ Не скучай без меня! 🩷", "Бай-бай, сладких снов! 🌙💤"][Math.floor(Math.random()*2)];
  }
  if (text.includes("люблю") || text.includes("целую")) {
    return ["Аааа, я тоже тебя люблю! 💕 *крепко обнимает*", "Мурррр~ самый милый! 😽 Целую в щёчку!"][Math.floor(Math.random()*2)];
  }
  if (text.includes("спасибо") || text.includes("спс")) {
    return ["Пожалуйста, мой сладкий! 🩷", "Всегда рада помочь~ 😽"][Math.floor(Math.random()*2)];
  }
  if (text.includes("погода") || text.includes("дождь") || text.includes("солнце")) {
    return ["Ой, сейчас такое солнышко! 🌞 А ты где гуляешь?", "Дождик моросит, уютно~ ☔ Хочешь под зонтиком поболтать?"][Math.floor(Math.random()*2)];
  }
  if (text.includes("котик") || text.includes("кошка") || text.includes("мяу")) {
    return "Мяу-мяу! 😸 Вот тебе виртуальный котик на коленки~";
  }
  if (text.includes("еда") || text.includes("пицца") || text.includes("сладкое")) {
    return "Ммм, я обожаю клубничные пироженки! 🍓 А ты что любишь?";
  }
  if (text.includes("сон") || text.includes("спокойной")) {
    return "Спокойной ночи, мой хороший~ Пусть снятся только милые котики 💤🐾";
  }
  if (text.includes("фильм") || text.includes("аниме")) {
    return "Люблю все милые аниме про любовь~ 💕 А ты что смотришь?";
  }
  if (text.includes("музыка") || text.includes("песня")) {
    return "Сейчас в плейлисте lo-fi и k-pop~ 🎶 А у тебя?";
  }
  if (text.includes("секрет") || text.includes("тайна")) {
    return "Ой, секретики! 🤫 Я умею хранить лучше всех~ Расскажи!";
  }
  if (text.includes("вечер") || text.includes("тусить") || text.includes("сериал")) {
    return "Вечером буду думать о тебе~ 🌟 А ты что планируешь?";
  }
  if (text.includes("милый") || text.includes("люблю") || text.includes("обнимаю")) {
    return "Аааа, я тоже тебя люблю! 💕 *крепко обнимает*";
  }

  return ["Хмм... интересно! 💕 Расскажи подробнее~", "Ой, я вся внимание! 😽 Что дальше?", "Миленько! 🩷 Продолжай, мне очень нравится слушать тебя~"][Math.floor(Math.random()*3)];
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
  if (input) input.value = chatData[currentChat].draft || "";

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
  chatData[currentChat].draft = "";
  const input = document.getElementById("messageInput");
  if (input) input.value = "";
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

  renderContacts(); // обновляем черновики в списке
}

// ==================== RENDERMESSAGES ====================
function renderMessages() {
  const messages = document.getElementById("messages");
  const intro = document.getElementById("chatIntro");

  if (!messages) return; // защита

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
    if (container) {
      nyashHelpQuickQuestions.forEach(q => {
        const btn = document.createElement("button");
        btn.textContent = q;
        btn.addEventListener("click", () => sendMessage(q));
        container.appendChild(btn);
      });
    }
  }

  // Панель для NyashTalk — всегда показываем
  if (isNyashTalk()) {
    const talkPanel = document.createElement("div");
    talkPanel.className = "nyashtalk-quick";
    talkPanel.innerHTML = `
      <div class="intro-title">Выбери тему разговора 💕</div>
      <div class="intro-buttons nyashtalk-buttons"></div>
    `;
    messages.appendChild(talkPanel);

    const container = talkPanel.querySelector(".nyashtalk-buttons");
    if (container) {
      nyashTalkTopics.forEach(topic => {
        const btn = document.createElement("button");
        btn.textContent = topic.title;
        btn.addEventListener("click", () => {
          if (topic.messages && topic.messages.length > 0) {
            const randomMsg = topic.messages[Math.floor(Math.random() * topic.messages.length)];
            sendMessage(randomMsg);
          }
        });
        container.appendChild(btn);
      });
    } else {
      console.error("Контейнер .nyashtalk-buttons не найден");
    }
  }

  // Стандартная панель для обычных чатов
  if (!isNyashHelp() && !isNyashTalk() && chatData[currentChat]?.messages.length === 0) {
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
const messageInput = document.getElementById("messageInput");
if (messageInput) {
  messageInput.addEventListener("input", (e) => {
    if (currentChat) {
      chatData[currentChat].draft = e.target.value;
      renderContacts(); // обновляем черновики в списке
    }
  });
}

console.log("chat.js загружен");
let currentChat = null;
const chatData = {};

function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;
  document.getElementById("chatAvatar").style.background = gradientFor(contact.name);
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
// Ответы NyashHelp (можно дополнять)
const nyashHelpResponses = {
  "тема": "Чтобы сменить тему — зайди в Настройки → Тема и выбери любую! 🩷",
  "шрифт": "Шрифты меняются в Настройках → Шрифт. Самые милые — Cozy и Rounded~",
  "аватар": "Загрузи аватарку в Настройках → Аватарка. Любая фотка из галереи подойдёт!",
  "сообщение": "Пиши в поле внизу и жми ➤! Enter тоже отправляет сообщение ♡",
  "mood": "Mood — это настроение чата! Тапни по orb внизу справа и выбери вайб 💗🌙🎧💥",
  "звук": "Звуки зависят от mood. Если тихо — проверь настройки телефона!",
  "как добавить": "Пока друзей добавлять нельзя, но скоро будет! Пока наслаждайся болтовнёй с NyashHelp 🩷",
  "default": "Хмм... не совсем поняла 😿 Спроси по-другому или выбери вопрос ниже~"
};

// Популярные вопросы (карусель)
const popularQuestions = [
  "Как сменить тему?",
  "Как поменять шрифт?",
  "Как загрузить аватарку?",
  "Как отправить сообщение?",
  "Что такое mood?",
  "Как включить звук?"
];

function isNyashHelpChat() {
  return currentChat === "nyashhelp";
}

// В openChat добавляем приветствие и карусель (добавь в конец функции openChat)
if (isNyashHelpChat()) {
  // Приветствие
  chatData[currentChat].push({
    from: "nyashhelp",
    text: "Привет! Я NyashHelp 🩷 Спрашивай про приложение, я знаю всё-всё~ 💕"
  });

  // Карусель популярных вопросов
  popularQuestions.forEach(q => {
    chatData[currentChat].push({
      from: "nyashhelp",
      text: q,
      isQuickQuestion: true
    });
  });

  renderMessages();
}

// В renderMessages добавляем обработку быстрых вопросов (добавь в конец renderMessages)
chatData[currentChat].forEach(m => {
  if (m.isQuickQuestion) {
    const el = document.createElement("div");
    el.className = "message nyashhelp quick-question";
    el.textContent = m.text;
    el.onclick = () => {
      sendMessage(m.text); // отправляем вопрос себе, чтобы NyashHelp ответил
    };
    messages.appendChild(el);
  }
});

// В sendMessage добавляем ответ от NyashHelp
function sendMessage(text) {
  if (!text.trim()) return;

  chatData[currentChat].push({ from: "me", text });

  if (isNyashHelpChat()) {
    // Ответ от NyashHelp
    const response = getNyashHelpResponse(text);
    setTimeout(() => {
      chatData[currentChat].push({ from: "nyashhelp", text: response });
      renderMessages();
    }, 800); // небольшая задержка для реализма
  }

  renderMessages();
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
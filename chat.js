let currentChat = null;
const chatData = {};

// ==================== NYASHHELP ====================
const nyashHelpQuickQuestions = [
  "Как сменить тему?",
  "Как поменять шрифт?",
  "Как загрузить аватарку?",
  "Как отправить сообщение?",
  "Что такое mood?",
  "Как включить звук?",
  "Как добавить друга?"
];

function isNyashHelp() {
  return currentChat === "nyashhelp";
}

function getNyashHelpResponse(text) {
  text = text.toLowerCase().trim();
  if (text.includes("тема")) return "Чтобы сменить тему — зайди в Настройки → Тема и выбери любую! 🩷";
  if (text.includes("шрифт")) return "Шрифты меняются в Настройках → Шрифт. Самые милые — Cozy и Rounded~";
  if (text.includes("аватар")) return "Загрузи аватарку в Настройках → Аватарка. Любая фотка из галереи подойдёт!";
  if (text.includes("сообщ") || text.includes("отправ")) return "Пиши в поле внизу и жми ➤! Enter тоже отправляет~";
  if (text.includes("mood")) return "Mood — это настроение чата! Тапни по orb внизу справа → выбирай вайб 💗🌙🎧💥";
  if (text.includes("звук")) return "Звуки зависят от mood. Если тихо — проверь настройки телефона!";
  if (text.includes("добавить")) return "Пока друзей добавлять нельзя, но скоро будет! Пока наслаждайся болтовнёй с NyashHelp 🩷";
  return "Хмм... не совсем поняла 😿 Спроси по-другому или выбери вопрос ниже~";
}

// ==================== NYASHTALK ====================
const nyashTalkTopics = [
  { title: "О погоде ☁️", messages: ["Сейчас такая хорошая погода!", "Дождик идёт, уютно~", "Солнце светит, пойдём гулять?"] },
  { title: "О настроении 💗", messages: ["У меня настроение супер!", "Сегодня немного грустно...", "Я счастлив, потому что ты здесь~"] },
  { title: "О котиках 🐱", messages: ["Мяу-мяу! 😸", "Хочу котика на коленки~", "Котики — это жизнь! 🐾"] },
  { title: "О еде 🍰", messages: ["Ммм, хочу клубничный торт!", "Пицца или суши?", "Сладкое всегда побеждает~ 🍬"] },
  { title: "О снах ✨", messages: ["Мне приснился ты! 😽", "Сон был странный...", "Пусть снятся только хорошие сны~ 🌙"] }
];

function isNyashTalk() {
  return currentChat === "nyashtalk";
}

function getNyashTalkResponse(text) {
  text = text.toLowerCase().trim();
  return "Миленько! 💕 Расскажи ещё~";
}

// ==================== OPENCHAT ====================
function openChat(contact) {
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = [];

  showScreen("chat");

  document.getElementById("chatName").textContent = contact.name;
  document.getElementById("chatStatus").textContent = contact.status;
  document.getElementById("chatAvatar").style.background = contact.avatar || gradientFor(contact.name);

  // Приветствие только при первом открытии
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

  // Добавляем сообщение пользователя
  chatData[currentChat].push({ from: "me", text });
  renderMessages();

  // Ответ от NyashHelp
  if (isNyashHelp()) {
    setTimeout(() => {
      const response = getNyashHelpResponse(text);
      chatData[currentChat].push({ from: "nyashhelp", text: response });
      renderMessages();
    }, 800);
  }

  // Ответ от NyashTalk
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
    const panel = document.createElement("div");
    panel.className = "nyashhelp-quick";
    panel.innerHTML = `
      <div class="intro-title">Частые вопросы 🩷</div>
      <div class="intro-buttons nyashhelp-buttons"></div>
    `;
    messages.appendChild(panel);

    const container = panel.querySelector(".nyashhelp-buttons");
    nyashHelpQuickQuestions.forEach(q => {
      const btn = document.createElement("button");
      btn.textContent = q;
      btn.addEventListener("click", () => sendMessage(q));
      container.appendChild(btn);
    });
  }

  // Панель для NyashTalk — всегда вверху
  if (isNyashTalk()) {
    const panel = document.createElement("div");
    panel.className = "nyashtalk-quick";
    panel.innerHTML = `
      <div class="intro-title">Выбери тему разговора 💕</div>
      <div class="intro-buttons nyashtalk-buttons"></div>
    `;
    messages.appendChild(panel);

    const container = panel.querySelector(".nyashtalk-buttons");
    nyashTalkTopics.forEach(topic => {
      const btn = document.createElement("button");
      btn.textContent = topic.title;
      btn.addEventListener("click", () => {
        const randomMsg = topic.quickMessages[Math.floor(Math.random() * topic.quickMessages.length)];
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
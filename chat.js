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
  "добавить": "Пока друзей добавлять нельзя, но скоро будет! Пока наслаждайся болтовнёй с NyashHelp 🩷",
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

function isNyashHelp() {
  return currentChat === "nyashhelp";
}

function getNyashHelpResponse(text) {
  text = text.toLowerCase().trim();
  if (text.includes("тема") || text.includes("тему")) return nyashHelpResponses["тема"];
  if (text.includes("шрифт") || text.includes("шрифты")) return nyashHelpResponses["шрифт"];
  if (text.includes("аватар") || text.includes("фото")) return nyashHelpResponses["аватар"];
  if (text.includes("сообщ") || text.includes("отправ")) return nyashHelpResponses["сообщение"];
  if (text.includes("mood") || text.includes("настроение")) return nyashHelpResponses["mood"];
  if (text.includes("звук") || text.includes("звук")) return nyashHelpResponses["звук"];
  if (text.includes("добавить") || text.includes("друга")) return nyashHelpResponses["добавить"];
  return nyashHelpResponses["default"];
}

// ==================== NYASHGPT ====================
const GEMINI_API_KEY = "AIzaSyCxwrtIx9r3t-EqgSuu-ZAP-VFoTbwU1K0"; // твой ключ уже вставлен

async function getNyashGPTResponse(text) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Ты NyashGPT — милый, добрый и немного игривый ИИ-помощник. Отвечай мило, с эмодзи, на русском языке. Вопрос пользователя: ${text}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      return "Ой... что-то пошло не так 😿 Попробуй ещё разок~";
    }
  } catch (error) {
    console.error("NyashGPT ошибка:", error);
    return `Упс... ошибка: ${error.message} 😿 Попробуй позже или другой вопрос!`;
  }
}

function isNyashGPT() {
  return currentChat === "nyashgpt";
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
  } else if (isNyashGPT()) {
    chatData[currentChat].push({
      from: "nyashgpt",
      text: "Привет! Я NyashGPT 🌍 Спрашивай что угодно — погоду, шутки, факты, советы... Я в интернете~ ✨"
    });
  }

  renderMessages();
}

// ==================== SENDMESSAGE ====================
async function sendMessage(text) {
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

  if (isNyashGPT()) {
    const loadingMsg = { from: "nyashgpt", text: "Думаю... 🌸" };
    chatData[currentChat].push(loadingMsg);
    renderMessages();

    const response = await getNyashGPTResponse(text);
    chatData[currentChat].pop(); // убираем "Думаю..."
    chatData[currentChat].push({ from: "nyashgpt", text: response });
    renderMessages();
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
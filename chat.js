> ♡⊹₊⟡⋆няɯиᴋ⊹₊⟡⋆♡:
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
  if (text.includes("звук")) return nyashHelpResponses["звук"];
  return nyashHelpResponses["default"];
}

// ==================== NYASHGPT (Groq) ====================
const GROQ_API_KEY = "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"; // ← ВСТАВЬ СВОЙ КЛЮЧ СЮДА

async function getNyashGPTResponse(text) {
  try {
    const proxyUrl = "https://api.allorigins.win/raw?url=";
    const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

    const response = await fetch(proxyUrl + groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${GROQ_API_KEY},
        "Origin": "https://nyash-gram.vercel.app", // добавили для прокси
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Ты NyashGPT — милый, добрый, немного игривый ИИ-помощник. Отвечай тепло, с эмодзи, на русском языке, в лёгком kawaii-стиле. Коротко и мило."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error("NyashGPT (Groq) ошибка:", error);
    return "Упс... что-то пошло не так 😿 Попробуй позже!";
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
  if (!text.

> ♡⊹₊⟡⋆няɯиᴋ⊹₊⟡⋆♡:
trim()) return;

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
    el.className = message ${m.from};
    el.textContent = m.text;
    messages.appendChild(el);
  });

  messages.scrollTop = messages.scrollHeight;
}

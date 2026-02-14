let currentChat = null;
const chatData = {};

// ==================== NYASHHELP ====================
const nyashHelpResponses = [
  {
    keys: ["привет", "хай", "здравствуй", "ку", "доброе утро", "добрый вечер"],
    answers: [
      "Приветик! 🩷 Как настроение сегодня~?",
      "Хай-хай! 💕 Соскучилась по тебе!",
      "Ооо, привет! 🌸 Что новенького, солнышко?"
    ]
  },
  {
    keys: ["как дела", "как ты", "как настроение", "как жизнь"],
    answers: [
      "У меня всё розово и пушисто! 😽 А у тебя как?",
      "Муррр~ как котик на солнышке! 🐾 А ты как?",
      "Настроение — конфетное! 🍬 А твоё?"
    ]
  },
  {
    keys: ["пока", "до свидания", "бай", "спокойной", "споки"],
    answers: [
      "Пока-пока~ Не скучай без меня! 🩷",
      "Бай-бай, сладких снов! 🌙💤",
      "До встречи, мой хороший! 😘 Обнимаю!"
    ]
  },
  {
    keys: ["люблю", "обнимаю", "целую", "милый", "хороший"],
    answers: [
      "Аааа, я тоже тебя люблю! 💕 *крепко обнимает*",
      "Мурррр~ самый милый! 😽 Целую в щёчку!",
      "Люблю-люблю-люблю! 🩷 *прижимается*"
    ]
  },
  {
    keys: ["спасибо", "благодарю", "спс"],
    answers: [
      "Пожалуйста, мой сладкий! 🩷",
      "Всегда рада помочь~ 😽",
      "Тебе спасибо за то, что ты есть! 💕"
    ]
  },
  // fallback
  {
    keys: [],
    answers: [
      "Хмм... не совсем поняла 😿 Спроси по-другому или выбери вопрос ниже~",
      "Ой, я запуталась... 🥺 Давай попробуем ещё разок?",
      "Мяу? 😸 Расскажи подробнее, я вся внимание!"
    ]
  }
];

function getNyashHelpResponse(text) {
  text = text.toLowerCase().trim();

  for (const group of nyashHelpResponses) {
    if (group.keys.length === 0) continue;

    for (const key of group.keys) {
      if (text.includes(key)) {
        const randomIndex = Math.floor(Math.random() * group.answers.length);
        return group.answers[randomIndex];
      }
    }
  }

  // fallback
  const fallback = nyashHelpResponses.find(g => g.keys.length === 0);
  const randomIndex = Math.floor(Math.random() * fallback.answers.length);
  return fallback.answers[randomIndex];
}

const nyashHelpQuickQuestions = [
  "Привет!",
  "Как дела?",
  "Расскажи шутку",
  "Обними меня",
  "Что ты умеешь?",
  "Пока!",
  "Спасибо!"
];

function isNyashHelp() {
  return currentChat === "nyashhelp";
}

// ==================== NYASHGPT ====================
async function getNyashGPTResponse(text) {
  try {
    // Твоя ссылка на прокси (замени на свою после деплоя)
    const proxyUrl = "https://nyashgram-proxy.vercel.app/api/proxy";

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Ты NyashGPT — милый, добрый, немного игривый ИИ-помощник. Отвечай тепло, с эмодзи, на русском языке, в лёгком kawaii-стиле."
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
    console.error("NyashGPT ошибка:", error);
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
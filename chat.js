// chat.js — NyashGram v2.0 (ФИНАЛЬНАЯ ВЕРСИЯ)

let currentChat = null;
const chatData = window.chatData || {};

// ========== NYASHHELP ==========
const nyashHelpQuickQuestions = [
  "Как сменить тему?",
  "Как поменять шрифт?",
  "Как загрузить аватарку?",
  "Что такое черновик?",
  "Кто такие боты?",
  "Расскажи про Bestie",
  "Расскажи про Философа"
];

function getNyashHelpResponse(text) {
  text = text.toLowerCase();
  if (text.includes("тем")) return "У нас 5 тем: Pastel Pink, Milk Rose, Night Blue, Lo-Fi Beige и Soft Lilac! 🌈 Зайди в Настройки → Тема";
  if (text.includes("шрифт")) return "6 шрифтов: System, Rounded, Cozy, Elegant, Bold Soft, Mono Cozy! 💕 Меняй в Настройках → Шрифт";
  if (text.includes("аватар")) return "Загрузи фото в настройках или оставь милый градиент! 💫";
  if (text.includes("черновик")) return "Черновики сохраняются автоматически! 📝 Видишь подпись под контактом?";
  if (text.includes("бот")) return "У нас NyashHelp (я), NyashTalk и 5 друзей: Bestie, Философ, Учёба, Music Pal, Night Chat! 🎭";
  if (text.includes("bestie")) return "Bestie — лучшая подруга! Всегда поддержит и порадуется 💖";
  if (text.includes("философ")) return "Философ любит рассуждать о жизни и смысле бытия 🧠";
  if (text.includes("учёб")) return "Учёба проверит домашку и напомнит о контрольных! 📚";
  if (text.includes("music")) return "Music Pal — твой муздруг! Посоветует треки 🎧";
  if (text.includes("night")) return "Night Chat — для ночных разговоров под звёздами 🌙";
  return "Хмм... Спроси про темы, шрифты, аватарки или ботов! 🩷";
}

// ========== NYASHTALK ==========
const nyashTalkTopics = [
  { title: "О погоде ☁️", messages: ["Какая погода?", "Люблю дождь!", "Солнце или снег?"] },
  { title: "О настроении 💗", messages: ["Как настроение?", "Сегодня грустно", "Я счастлив!"] },
  { title: "О котиках 🐱", messages: ["Покажи котика", "Люблю кошек!", "Мяу~"] },
  { title: "О еде 🍰", messages: ["Что любишь есть?", "Хочу пиццу", "Сладкое или солёное?"] },
  { title: "О снах ✨", messages: ["Что снилось?", "Видел странный сон", "Спокойной ночи"] },
  { title: "О фильмах 🎬", messages: ["Любимый фильм?", "Смотрел новое?", "Рекомендуй!"] },
  { title: "О музыке 🎧", messages: ["Что слушаешь?", "Любимая песня?", "Включи что-нибудь"] },
  { title: "О хобби 🎨", messages: ["Твоё хобби?", "Рисуешь?", "Фоткаешь?"] },
  { title: "О путешествиях ✈️", messages: ["Куда хочешь?", "Море или горы?", "Париж мечты"] }
];

function getNyashTalkResponse(text) {
  text = text.toLowerCase();
  if (text.includes("привет")) return ["Приветик! 🩷", "Хай-хай! 💕", "Здравствуй! 😽"][Math.floor(Math.random()*3)];
  if (text.includes("как дела")) return ["Супер! А у тебя?", "Отлично! 😊", "Счастлива!"][Math.floor(Math.random()*3)];
  if (text.includes("пока")) return ["Пока-пока! 🩷", "Бай-бай! 🌙", "До встречи! 💕"][Math.floor(Math.random()*3)];
  if (text.includes("люблю")) return ["Я тоже тебя люблю! 💕", "Ты самый лучший! 💗", "Обнимаю! 🫂"][Math.floor(Math.random()*3)];
  if (text.includes("спасибо")) return ["Пожалуйста! 🩷", "Всегда рада! 💕", "Обращайся! ✨"][Math.floor(Math.random()*3)];
  return ["Расскажи подробнее! 💕", "Интересно! 😊", "Продолжай! 🩷"][Math.floor(Math.random()*3)];
}

// ========== BESTIE ==========
function getBestieResponse(text) {
  text = text.toLowerCase();
  if (text.includes("привет")) return ["Привееет, моя няша! 💕", "Солнышко! 🥰", "Соскучилась! 💗"][Math.floor(Math.random()*3)];
  if (text.includes("люблю")) return ["Я тебя больше! 💖", "Ты лучший! 💘", "Обнимаю! 🤗"][Math.floor(Math.random()*3)];
  if (text.includes("грустн")) return ["Всё будет хорошо, я рядом! 💪", "Держись! 🌸", "Обнимаю! 🫂"][Math.floor(Math.random()*3)];
  return ["Няш-няш! 🩷", "Рассказывай! 👂", "Как день? 💕"][Math.floor(Math.random()*3)];
}

// ========== ФИЛОСОФ ==========
function getPhilosopherResponse(text) {
  text = text.toLowerCase();
  if (text.includes("привет")) return ["Приветствую, ищущий... 🧠", "Здравствуй...", "И снова ты..."][Math.floor(Math.random()*3)];
  if (text.includes("жизнь")) return ["Жизнь — это байты и пиксели...", "А что есть жизнь?", "Бытие определяет сознание..."][Math.floor(Math.random()*3)];
  if (text.includes("дума")) return ["Мысли материальны...", "О чём ты думаешь?", "Сознание... 🧠"][Math.floor(Math.random()*3)];
  return ["Интересная мысль...", "Познай себя...", "Всё относительно..."][Math.floor(Math.random()*3)];
}

// ========== УЧЁБА ==========
function getStudyResponse(text) {
  text = text.toLowerCase();
  if (text.includes("привет")) return ["Привет! Уроки сделал? 📚", "А параграф прочитал?", "Проверим домашку?"][Math.floor(Math.random()*3)];
  if (text.includes("домашк")) return ["Покажи, я проверю! ✍️", "Опять не сделал?", "Давай вместе!"][Math.floor(Math.random()*3)];
  if (text.includes("экзамен")) return ["Готовишься? 📝", "Повтори билеты!", "Удачи на экзамене! 🍀"][Math.floor(Math.random()*3)];
  return ["Учись, учись! ⭐", "Повторение — мать учения!", "Грызи гранит науки! 🪨"][Math.floor(Math.random()*3)];
}

// ========== MUSIC PAL ==========
function getMusicPalResponse(text) {
  text = text.toLowerCase();
  if (text.includes("привет")) return ["Йо, музыкант! 🎵", "Что в плейлисте?", "Здарова! 🎧"][Math.floor(Math.random()*3)];
  if (text.includes("посовет")) return ["Послушай lo-fi!", "Новый трек Taylor Swift!", "Классный инди-микс!"][Math.floor(Math.random()*3)];
  if (text.includes("рок")) return ["Рок — классика! 🎸", "AC/DC рулит!", "Queen forever!"][Math.floor(Math.random()*3)];
  return ["Музыка — жизнь! 🎶", "Вруби на полную!", "Отличный вкус!"][Math.floor(Math.random()*3)];
}

// ========== NIGHT CHAT ==========
function getNightChatResponse(text) {
  text = text.toLowerCase();
  if (text.includes("привет")) return ["Тсс... Звёзды шепчут... 🌙", "Полночь...", "Ночной гость... ✨"][Math.floor(Math.random()*3)];
  if (text.includes("сон")) return ["Что снилось? 🌠", "Сны — порталы...", "Цветные сны?"][Math.floor(Math.random()*3)];
  if (text.includes("звезд")) return ["Звёзды красивы... ⭐", "Загадай желание!", "Падающая звезда..."][Math.floor(Math.random()*3)];
  return ["Ночь длинная...", "Шёпотом...", "Расскажи мне..."][Math.floor(Math.random()*3)];
}

function getBotResponse(contactId, text) {
  switch(contactId) {
    case "nyashhelp": return getNyashHelpResponse(text);
    case "nyashtalk": return getNyashTalkResponse(text);
    case "bestie": return getBestieResponse(text);
    case "philosopher": return getPhilosopherResponse(text);
    case "study": return getStudyResponse(text);
    case "musicpal": return getMusicPalResponse(text);
    case "nightchat": return getNightChatResponse(text);
    default: return "Привет! 💕";
  }
}

function openChat(contact) {
  console.log("Открываем чат с:", contact);
  if (!contact || !contact.id) return;
  
  currentChat = contact.id;
  if (!chatData[currentChat]) chatData[currentChat] = { messages: [], draft: "" };

  window.showScreen("chatScreen");

  const nameEl = document.getElementById("chatContactName");
  if (nameEl) nameEl.textContent = contact.name;

  const avatarEl = document.getElementById("chatAvatar");
  if (avatarEl) {
    avatarEl.style.background = contact.avatar || window.getGradientForName(contact.name);
    avatarEl.style.backgroundSize = "cover";
  }

  const input = document.getElementById("messageInput");
  if (input) input.value = chatData[currentChat].draft || "";

  if (chatData[currentChat].messages.length === 0) {
    let welcome = "Привет! 💕";
    switch(contact.id) {
      case "nyashhelp": welcome = "Привет! Я NyashHelp 🩷 Спрашивай про приложение!"; break;
      case "nyashtalk": welcome = "Приветик! Давай болтать! 🌸"; break;
      case "bestie": welcome = "Привееет, моя няша! 💖"; break;
      case "philosopher": welcome = "Здравствуй, ищущий... 🧠"; break;
      case "study": welcome = "Привет! Уроки сделал? 📚"; break;
      case "musicpal": welcome = "Йо! Что в плейлисте? 🎧"; break;
      case "nightchat": welcome = "Тсс... Полночь... 🌙"; break;
    }
    chatData[currentChat].messages.push({ from: "bot", text: welcome });
  }

  renderMessages();
}

function sendMessage(text) {
  if (!text || !text.trim() || !currentChat) return;

  chatData[currentChat].messages.push({ from: "user", text: text.trim() });
  chatData[currentChat].draft = "";
  
  const input = document.getElementById("messageInput");
  if (input) input.value = "";
  
  renderMessages();
  if (typeof window.saveDraft === 'function') window.saveDraft(currentChat, "");

  setTimeout(() => {
    if (currentChat) {
      const response = getBotResponse(currentChat, text);
      chatData[currentChat].messages.push({ from: "bot", text: response });
      renderMessages();
    }
  }, 800);
}

function renderMessages() {
  const chatArea = document.getElementById("chatArea");
  const quickPanel = document.getElementById("quickReplyPanel");
  if (!chatArea || !currentChat || !chatData[currentChat]) return;

  chatArea.innerHTML = "";
  if (quickPanel) quickPanel.innerHTML = "";

  // Быстрые ответы
  if (currentChat === "nyashhelp" && quickPanel) {
    nyashHelpQuickQuestions.forEach(q => {
      const chip = document.createElement("button");
      chip.className = "quick-chip";
      chip.textContent = q;
      chip.onclick = () => sendMessage(q);
      quickPanel.appendChild(chip);
    });
  }
  
  if (currentChat === "nyashtalk" && quickPanel) {
    nyashTalkTopics.forEach(t => {
      const chip = document.createElement("button");
      chip.className = "quick-chip";
      chip.textContent = t.title;
      chip.onclick = () => {
        const msg = t.messages[Math.floor(Math.random() * t.messages.length)];
        sendMessage(msg);
      };
      quickPanel.appendChild(chip);
    });
  }

  // Сообщения
  chatData[currentChat].messages.forEach(msg => {
    const el = document.createElement("div");
    el.className = `message ${msg.from}`;
    el.textContent = msg.text;
    chatArea.appendChild(el);
  });

  chatArea.scrollTop = chatArea.scrollHeight;
}

// Отправка по Enter
document.addEventListener('DOMContentLoaded', function() {
  const sendBtn = document.getElementById('sendMessageBtn');
  const msgInput = document.getElementById('messageInput');

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      if (msgInput && msgInput.value.trim()) {
        sendMessage(msgInput.value);
      }
    });
  }

  if (msgInput) {
    msgInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (msgInput.value.trim()) {
          sendMessage(msgInput.value);
        }
      }
    });

    msgInput.addEventListener('input', (e) => {
      if (currentChat) {
        chatData[currentChat].draft = e.target.value;
        if (typeof window.saveDraft === 'function') {
          window.saveDraft(currentChat, e.target.value);
        }
      }
    });
  }
});

window.openChat = openChat;
window.sendMessage = sendMessage;

console.log("✅ chat.js загружен");
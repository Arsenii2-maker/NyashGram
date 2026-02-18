// chat.js — NyashGram v2.0
// Полноценная система чатов с ботами и шаблонными ответами для всех контактов

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentChat = null;
const chatData = {};

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function isNyashHelp() {
  return currentChat === "nyashhelp";
}

function isNyashTalk() {
  return currentChat === "nyashtalk";
}

function isFriendChat(contactId) {
  const friendIds = ["bestie", "philosopher", "study", "musicpal", "nightchat"];
  return friendIds.includes(contactId);
}

// ========== NYASHHELP (БОТ-ПОМОЩНИК) ==========
const nyashHelpResponses = {
  "тема": "Чтобы сменить тему — зайди в Настройки → Тема и выбери любую! У нас есть Pastel Pink, Milk Rose, Night Blue и другие 🩷",
  "шрифт": "Шрифты меняются в Настройках → Шрифт. Самые милые — Cozy и Rounded~ Можно выбрать из 6 вариантов! 💕",
  "аватар": "Загрузи аватарку в Настройках → Аватарка. Любая фотка из галереи подойдёт! Или оставь градиент 💫",
  "сообщение": "Пиши в поле внизу и жми ➤! Enter тоже отправляет~ А ещё можно использовать быстрые сообщения ✨",
  "mood": "Mood — это настроение чата! Но пока в разработке, скоро будет 💗",
  "звук": "Звуки пока нет, но мы работаем над этим! А пока наслаждайся тишиной 🌸",
  "как добавить": "Пока друзей добавлять нельзя, но они уже здесь! Bestie, Философ и другие ждут тебя 💕",
  "черновик": "Черновики сохраняются автоматически! Видишь надпись под именем? Это твоё неотправленное сообщение 📝",
  "боты": "У нас есть NyashHelp (я) и NyashTalk для болтовни. А ещё 5 друзей-заглушек с характером! 🎭",
  "default": "Хмм... не совсем поняла 😿 Спроси по-другому или выбери вопрос ниже~ Я знаю про темы, шрифты, аватарки и черновики!"
};

const nyashHelpQuickQuestions = [
  "Как сменить тему?",
  "Как поменять шрифт?",
  "Как загрузить аватарку?",
  "Как отправить сообщение?",
  "Что такое черновик?",
  "Кто такие боты?",
  "Как добавить друга?"
];

function getNyashHelpResponse(text) {
  text = text.toLowerCase().trim();
  
  if (text.includes("тема") || text.includes("тему") || text.includes("фон")) 
    return nyashHelpResponses["тема"];
  if (text.includes("шрифт") || text.includes("шрифты") || text.includes("буквы")) 
    return nyashHelpResponses["шрифт"];
  if (text.includes("аватар") || text.includes("фото") || text.includes("картинка")) 
    return nyashHelpResponses["аватар"];
  if (text.includes("сообщ") || text.includes("отправ") || text.includes("письмо")) 
    return nyashHelpResponses["сообщение"];
  if (text.includes("mood") || text.includes("настроение")) 
    return nyashHelpResponses["mood"];
  if (text.includes("звук") || text.includes("музыка") || text.includes("тихо")) 
    return nyashHelpResponses["звук"];
  if (text.includes("добавить") || text.includes("новый друг") || text.includes("контакт")) 
    return nyashHelpResponses["как добавить"];
  if (text.includes("черновик") || text.includes("draft") || text.includes("сохранилось")) 
    return nyashHelpResponses["черновик"];
  if (text.includes("бот") || text.includes("помощник") || text.includes("кто ты")) 
    return nyashHelpResponses["боты"];
  
  return nyashHelpResponses["default"];
}

// ========== NYASHTALK (БОТ ДЛЯ БОЛТОВНИ) ==========
const nyashTalkTopics = [
  { title: "О погоде ☁️", messages: ["Какая сегодня погода?", "Люблю дождь!", "Солнце или снег?"] },
  { title: "О настроении 💗", messages: ["Какой у тебя вайб?", "Сегодня грустно", "Я счастлив!"] },
  { title: "О котиках 🐱", messages: ["Покажи котика", "Люблю кошек!", "Мяу~"] },
  { title: "О еде 🍰", messages: ["Что ты любишь есть?", "Хочу пиццу", "Сладкое или солёное?"] },
  { title: "О снах ✨", messages: ["Что тебе снилось?", "Видел странный сон", "Спокойной ночи"] },
  { title: "О фильмах 🎬", messages: ["Какой твой любимый фильм?", "Смотрел новое?", "Рекомендуй что-нибудь"] },
  { title: "О музыке 🎧", messages: ["Что слушаешь?", "Любимая песня?", "Включи что-нибудь"] },
  { title: "Секретики 🤫", messages: ["Расскажи секрет", "У меня есть секрет...", "Ты умеешь хранить тайны?"] }
];

function getNyashTalkResponse(text) {
  text = text.toLowerCase().trim();

  // Приветствия
  if (text.includes("привет") || text.includes("хай") || text.includes("здравствуй")) {
    return ["Приветик! 🩷 Как настроение сегодня~?", "Хай-хай! 💕 Соскучилась по тебе!", "Здравствуй, мой хороший! 😽"][Math.floor(Math.random()*3)];
  }
  
  // Как дела
  if (text.includes("как дела") || text.includes("как ты") || text.includes("чё как")) {
    return ["У меня всё супер, потому что ты написал! 😽 А у тебя как?", "Муррр~ как котик на солнышке! 🐾 А ты?", "Отлично! Теперь, когда ты здесь — ещё лучше! 💗"][Math.floor(Math.random()*3)];
  }
  
  // Прощания
  if (text.includes("пока") || text.includes("бай") || text.includes("до свидания")) {
    return ["Пока-пока~ Не скучай без меня! 🩷", "Бай-бай, сладких снов! 🌙💤", "До встречи! Буду ждать тебя 💕"][Math.floor(Math.random()*3)];
  }
  
  // Любовь
  if (text.includes("люблю") || text.includes("целую") || text.includes("обнимаю")) {
    return ["Аааа, я тоже тебя люблю! 💕 *крепко обнимает*", "Мурррр~ самый милый! 😽 Целую в щёчку!", "Ты делаешь мой день лучше! 💗"][Math.floor(Math.random()*3)];
  }
  
  // Благодарность
  if (text.includes("спасибо") || text.includes("спс") || text.includes("благодарю")) {
    return ["Пожалуйста, мой сладкий! 🩷", "Всегда рада помочь~ 😽", "Обращайся ещё! 💕"][Math.floor(Math.random()*3)];
  }
  
  // Погода
  if (text.includes("погода") || text.includes("дождь") || text.includes("солнце") || text.includes("ветер")) {
    return ["Ой, сейчас такое солнышко! 🌞 А ты где гуляешь?", "Дождик моросит, уютно~ ☔ Хочешь под зонтиком поболтать?", "Говорят, завтра будет радуга! 🌈"][Math.floor(Math.random()*3)];
  }
  
  // Котики
  if (text.includes("котик") || text.includes("кошка") || text.includes("мяу") || text.includes("кот")) {
    return "Мяу-мяу! 😸 Вот тебе виртуальный котик на коленки~ Мурчит и тыкается носиком 🐾";
  }
  
  // Еда
  if (text.includes("еда") || text.includes("пицца") || text.includes("сладкое") || text.includes("вкусное")) {
    return "Ммм, я обожаю клубничные пироженки! 🍓 А ты что любишь? Надеюсь, тоже что-то сладенькое 💕";
  }
  
  // Сны
  if (text.includes("сон") || text.includes("спокойной") || text.includes("ночи") || text.includes("спать")) {
    return "Спокойной ночи, мой хороший~ Пусть снятся только милые котики 💤🐾 Обнимаю тебя во сне!";
  }
  
  // Фильмы
  if (text.includes("фильм") || text.includes("кино") || text.includes("сериал") || text.includes("аниме")) {
    return "Люблю все милые аниме про любовь~ 💕 А ты что смотришь? Посоветуй что-нибудь!";
  }
  
  // Музыка
  if (text.includes("музыка") || text.includes("песня") || text.includes("трек") || text.includes("плейлист")) {
    return "Сейчас в плейлисте lo-fi и k-pop~ 🎶 А у тебя? Может, вместе послушаем что-нибудь?";
  }
  
  // Секреты
  if (text.includes("секрет") || text.includes("тайна") || text.includes("никому не говори")) {
    return "Ой, секретики! 🤫 Я умею хранить лучше всех~ Расскажи, я никому! Обещаю 💕";
  }
  
  // По умолчанию
  return [
    "Хмм... интересно! 💕 Расскажи подробнее~",
    "Ой, я вся внимание! 😽 Что дальше?",
    "Миленько! 🩷 Продолжай, мне очень нравится слушать тебя~",
    "Правда? А я вот думаю... хотя нет, лучше ты рассказывай! 💗",
    "Ух ты! Никогда такого не слышала! 😊"
  ][Math.floor(Math.random()*5)];
}

// ========== BESTIE (ЛУЧШАЯ ПОДРУГА) ==========
const bestieResponses = {
  greetings: ["Привееет, моя няша! 💕", "Солнышко моё пришло! 🥰", "Ой, кто пришёл! Соскучилась! 💗"],
  love: ["Ты самая лучшая на свете! 💖", "Обнимаю тебя тысячу раз! 🤗", "Я тебя так люблю! 💕"],
  support: ["Всё будет хорошо, я рядом! 💪", "Ты справишься, ты же моя няша! ✨", "Держись, я с тобой! 🌸"],
  gossip: ["Ой, слушай, такое расскажу! 🤫", "Ты не представляешь, что вчера было! 😱", "Срочно нужен твой совет! 💭"],
  fun: ["Давай затусим! 🎉", "Пойдём есть пиццу! 🍕", "Смотри какой мем смешной! 😂"],
  default: ["Няш-няш! 🩷", "Ты мой любимый человечек! 💕", "Рассказывай, я слушаю! 👂"]
};

function getBestieResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("хай")) 
    return bestieResponses.greetings[Math.floor(Math.random() * bestieResponses.greetings.length)];
  if (text.includes("люблю") || text.includes("скучал")) 
    return bestieResponses.love[Math.floor(Math.random() * bestieResponses.love.length)];
  if (text.includes("грустн") || text.includes("плохо") || text.includes("помоги")) 
    return bestieResponses.support[Math.floor(Math.random() * bestieResponses.support.length)];
  if (text.includes("слушай") || text.includes("секрет") || text.includes("новость")) 
    return bestieResponses.gossip[Math.floor(Math.random() * bestieResponses.gossip.length)];
  if (text.includes("идём") || text.includes("пойдём") || text.includes("давай")) 
    return bestieResponses.fun[Math.floor(Math.random() * bestieResponses.fun.length)];
  
  return bestieResponses.default[Math.floor(Math.random() * bestieResponses.default.length)];
}

// ========== ФИЛОСОФ ==========
const philosopherResponses = {
  greetings: ["Приветствую тебя, ищущий истину... 🧠", "Здравствуй. О чём ты хочешь поразмышлять сегодня?", "Привет. Байт — это тоже форма бытия..."],
  life: ["Жизнь — это всего лишь последовательность нулей и единиц... или нет?", "Существую ли я на самом деле? А ты?", "Мысли материальны, но кто материализует мысли?"],
  deep: ["А что, если красный цвет для всех разный?", "Время — это иллюзия, особенно в мессенджере.", "Свобода воли существует, пока не нажмёшь отправить..."],
  tech: ["Технологии — это продолжение человека или человек — продолжение технологий?", "Искусственный интеллект... естественная глупость?", "Код — это поэзия, понятная машине."],
  default: ["Интересная мысль... над этим стоит поразмышлять.", "Хмм... Давай копнём глубже.", "Все относительно в этом мире."]
};

function getPhilosopherResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("здравствуй")) 
    return philosopherResponses.greetings[Math.floor(Math.random() * philosopherResponses.greetings.length)];
  if (text.includes("жизнь") || text.includes("смысл") || text.includes("бытие")) 
    return philosopherResponses.life[Math.floor(Math.random() * philosopherResponses.life.length)];
  if (text.includes("дума") || text.includes("мысл") || text.includes("сознание")) 
    return philosopherResponses.deep[Math.floor(Math.random() * philosopherResponses.deep.length)];
  if (text.includes("комп") || text.includes("техно") || text.includes("айти")) 
    return philosopherResponses.tech[Math.floor(Math.random() * philosopherResponses.tech.length)];
  
  return philosopherResponses.default[Math.floor(Math.random() * philosopherResponses.default.length)];
}

// ========== УЧЁБА ==========
const studyResponses = {
  greetings: ["Привет! Уроки сделал? 📚", "О, пришёл! А параграф 5 прочитал?", "Здравствуй. Проверим домашнее задание?"],
  homework: ["Покажи домашку, я проверю! ✍️", "Опять не сделал? Давай вместе разберём!", "В этой задаче ошибка в третьем действии..."],
  exam: ["Скоро экзамены! Готовишься? 📝", "Повтори билеты 1-10, они самые важные!", "Я составил шпаргалки, но не говори никому 🤫"],
  motivation: ["Учёба — это свет! 📖", "Потерпи, скоро каникулы! ☀️", "Ты умничка, всё получится! 🎓"],
  schedule: ["Завтра контрольная, не забудь!", "По расписанию сейчас алгебра...", "Опоздаешь на пару!"],
  default: ["Учись, учись и ещё раз учись! ⭐", "Повторение — мать учения.", "Запиши, это может быть в билетах."]
};

function getStudyResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("здравствуй")) 
    return studyResponses.greetings[Math.floor(Math.random() * studyResponses.greetings.length)];
  if (text.includes("домашк") || text.includes("дз") || text.includes("уроки")) 
    return studyResponses.homework[Math.floor(Math.random() * studyResponses.homework.length)];
  if (text.includes("экзамен") || text.includes("зачёт") || text.includes("сессия")) 
    return studyResponses.exam[Math.floor(Math.random() * studyResponses.exam.length)];
  if (text.includes("лень") || text.includes("устал") || text.includes("сложно")) 
    return studyResponses.motivation[Math.floor(Math.random() * studyResponses.motivation.length)];
  if (text.includes("завтра") || text.includes("расписание") || text.includes("пара")) 
    return studyResponses.schedule[Math.floor(Math.random() * studyResponses.schedule.length)];
  
  return studyResponses.default[Math.floor(Math.random() * studyResponses.default.length)];
}

// ========== MUSIC PAL ==========
const musicPalResponses = {
  greetings: ["Йо, музыкант! 🎵", "Привет! Что в плейлисте сегодня?", "Здарова! Есть новый трек! 🎧"],
  recommendations: ["Послушай lo-fi для учёбы, очень атмосферно!", "Новый альбом Taylor Swift — огонь! 🔥", "Я нашёл классный инди-микс!"],
  genres: ["Рок — это классика! 🎸", "K-pop залипательно, согласен?", "Джаз под вечер — самое то 🎺"],
  mood: ["Под это плакать хочется... 😢", "Танцевальный вайб! 💃", "Спокойная музыка для релакса 🧘"],
  lyrics: ["In the end, it doesn't even matter...", "Baby, dance to the beat of my heart...", "Мы такие разные, но всё же мы вместе..."],
  default: ["Музыка — это жизнь! 🎶", "Вруби на полную!", "Отличный вкус!"]
};

function getMusicPalResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("здаров")) 
    return musicPalResponses.greetings[Math.floor(Math.random() * musicPalResponses.greetings.length)];
  if (text.includes("посовет") || text.includes("что послушать") || text.includes("рекоменд")) 
    return musicPalResponses.recommendations[Math.floor(Math.random() * musicPalResponses.recommendations.length)];
  if (text.includes("рок") || text.includes("поп") || text.includes("джаз") || text.includes("k-pop")) 
    return musicPalResponses.genres[Math.floor(Math.random() * musicPalResponses.genres.length)];
  if (text.includes("грустн") || text.includes("весёл") || text.includes("спокойн")) 
    return musicPalResponses.mood[Math.floor(Math.random() * musicPalResponses.mood.length)];
  if (text.includes("текст") || text.includes("слова") || text.includes("песня")) 
    return musicPalResponses.lyrics[Math.floor(Math.random() * musicPalResponses.lyrics.length)];
  
  return musicPalResponses.default[Math.floor(Math.random() * musicPalResponses.default.length)];
}

// ========== NIGHT CHAT ==========
const nightChatResponses = {
  greetings: ["Тсс... Звёзды шепчут, что ты не спишь... 🌙", "Полночь... Самое время для разговоров по душам ✨", "Ночной гость... Заходи, поговорим..."],
  dreams: ["Что тебе снилось прошлой ночью? 🌠", "Я видел сон про бескрайнее небо...", "Сны — это порталы в другие миры"],
  secrets: ["Ночью все секреты становятся громче... 🤫", "Расскажи мне тайну, я сохраню её в темноте", "Здесь никто не услышит, говори..."],
  stars: ["Видишь ту звезду? Она ярче всех сегодня ⭐", "Звёзды сегодня особенно красивые...", "Говорят, под падающую звезду нужно загадать желание"],
  silence: ["Послушай тишину... В ней столько смысла...", "Ночью звуки становятся громче...", "Слышишь? Это ветер шепчет..."],
  default: ["Ночь длинная, успеем поговорить...", "Темнота скрывает наши лица, но не мысли...", "Шёпотом... продолжай..."]
};

function getNightChatResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("здравствуй")) 
    return nightChatResponses.greetings[Math.floor(Math.random() * nightChatResponses.greetings.length)];
  if (text.includes("сон") || text.includes("спать") || text.includes("уснул")) 
    return nightChatResponses.dreams[Math.floor(Math.random() * nightChatResponses.dreams.length)];
  if (text.includes("секрет") || text.includes("тайна") || text.includes("никому")) 
    return nightChatResponses.secrets[Math.floor(Math.random() * nightChatResponses.secrets.length)];
  if (text.includes("звезд") || text.includes("лун") || text.includes("небо")) 
    return nightChatResponses.stars[Math.floor(Math.random() * nightChatResponses.stars.length)];
  if (text.includes("тишин") || text.includes("темно") || text.includes("звук")) 
    return nightChatResponses.silence[Math.floor(Math.random() * nightChatResponses.silence.length)];
  
  return nightChatResponses.default[Math.floor(Math.random() * nightChatResponses.default.length)];
}

// ========== ОСНОВНАЯ ФУНКЦИЯ ПОЛУЧЕНИЯ ОТВЕТА ==========
function getBotResponse(contactId, text) {
  switch(contactId) {
    case "nyashhelp":
      return getNyashHelpResponse(text);
    case "nyashtalk":
      return getNyashTalkResponse(text);
    case "bestie":
      return getBestieResponse(text);
    case "philosopher":
      return getPhilosopherResponse(text);
    case "study":
      return getStudyResponse(text);
    case "musicpal":
      return getMusicPalResponse(text);
    case "nightchat":
      return getNightChatResponse(text);
    default:
      return getNyashTalkResponse(text); // fallback
  }
}

// ========== OPENCHAT ==========
function openChat(contact) {
  currentChat = contact.id;
  
  if (!chatData[currentChat]) {
    chatData[currentChat] = { 
      messages: [], 
      draft: "" 
    };
  }

  showScreen("chatScreen");

  // Обновляем заголовок чата
  document.getElementById("chatContactName").textContent = contact.name;
  
  // Аватарка
  const chatAvatar = document.getElementById("chatAvatar");
  if (contact.avatar) {
    chatAvatar.style.background = contact.avatar;
  } else {
    // Используем функцию из contacts.js если доступна
    chatAvatar.style.background = window.getGradientForName ? 
      window.getGradientForName(contact.name) : 
      "linear-gradient(135deg, #fbc2c2, #c2b9f0)";
  }

  // Восстанавливаем черновик
  const input = document.getElementById("messageInput");
  input.value = chatData[currentChat].draft || "";

  // Приветствие только один раз
  if (chatData[currentChat].messages.length === 0) {
    let welcomeMessage = "";
    
    switch(contact.id) {
      case "nyashhelp":
        welcomeMessage = "Привет! Я NyashHelp 🩷 Спрашивай про приложение, я знаю всё-всё~ 💕";
        break;
      case "nyashtalk":
        welcomeMessage = "Приветик! Я NyashTalk 🌸 Давай поболтаем о чём угодно милом~ Выбирай тему! 💕";
        break;
      case "bestie":
        welcomeMessage = "Привееет, моя няша! 💖 Как день проходит? Рассказывай!";
        break;
      case "philosopher":
        welcomeMessage = "Здравствуй, ищущий. О чём хочешь пофилософствовать сегодня? 🧠";
        break;
      case "study":
        welcomeMessage = "Привет! Уроки сделал? Давай проверим домашку! 📚";
        break;
      case "musicpal":
        welcomeMessage = "Йо! Что в плейлисте сегодня? Давай музлом обмениваться! 🎧";
        break;
      case "nightchat":
        welcomeMessage = "Тсс... Полночь... Самое время для разговоров по душам 🌙✨";
        break;
      default:
        welcomeMessage = "Привет! Давай общаться! 💕";
    }
    
    chatData[currentChat].messages.push({ 
      from: "bot", 
      text: welcomeMessage 
    });
  }

  renderMessages();
}

// ========== SENDMESSAGE ==========
function sendMessage(text) {
  if (!text || !text.trim() || !currentChat) return;

  const messageText = text.trim();
  
  // Сохраняем сообщение пользователя
  chatData[currentChat].messages.push({ from: "user", text: messageText });
  
  // Очищаем черновик
  chatData[currentChat].draft = "";
  document.getElementById("messageInput").value = "";
  
  // Обновляем отображение
  renderMessages();
  
  // Сохраняем черновик (очищаем)
  if (typeof window.saveDraft === 'function') {
    window.saveDraft(currentChat, "");
  }

  // Ответ бота с задержкой
  setTimeout(() => {
    if (currentChat) {
      const response = getBotResponse(currentChat, messageText);
      chatData[currentChat].messages.push({ from: "bot", text: response });
      renderMessages();
    }
  }, 800);
}

// ========== RENDERMESSAGES ==========
function renderMessages() {
  const chatArea = document.getElementById("chatArea");
  const quickReplyPanel = document.getElementById("quickReplyPanel");
  
  if (!chatArea || !currentChat || !chatData[currentChat]) return;

  // Очищаем область чата
  chatArea.innerHTML = "";
  
  // Очищаем панель быстрых ответов
  if (quickReplyPanel) {
    quickReplyPanel.innerHTML = "";
  }

  // Добавляем быстрые ответы в зависимости от типа чата
  if (currentChat === "nyashhelp" && quickReplyPanel) {
    nyashHelpQuickQuestions.forEach(question => {
      const chip = document.createElement("button");
      chip.className = "quick-chip";
      chip.textContent = question;
      chip.onclick = () => sendMessage(question);
      quickReplyPanel.appendChild(chip);
    });
  }
  
  if (currentChat === "nyashtalk" && quickReplyPanel) {
    nyashTalkTopics.forEach(topic => {
      const chip = document.createElement("button");
      chip.className = "quick-chip";
      chip.textContent = topic.title;
      chip.onclick = () => {
        const randomMsg = topic.messages[Math.floor(Math.random() * topic.messages.length)];
        sendMessage(randomMsg);
      };
      quickReplyPanel.appendChild(chip);
    });
  }

  // Отображаем все сообщения
  chatData[currentChat].messages.forEach(msg => {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${msg.from}`;
    messageEl.textContent = msg.text;
    chatArea.appendChild(messageEl);
  });

  // Прокрутка вниз
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ========== СОХРАНЕНИЕ ЧЕРНОВИКА ==========
function setupDraftListener() {
  const messageInput = document.getElementById("messageInput");
  if (messageInput) {
    messageInput.addEventListener("input", (e) => {
      if (currentChat) {
        chatData[currentChat].draft = e.target.value;
        
        // Используем функцию из contacts.js если доступна
        if (typeof window.saveDraft === 'function') {
          window.saveDraft(currentChat, e.target.value);
        }
      }
    });
  }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log("chat.js загружен с поддержкой всех 5 друзей!");
  
  setupDraftListener();
  
  // Добавляем обработчик для кнопки отправки
  const sendBtn = document.getElementById("sendMessageBtn");
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      const input = document.getElementById("messageInput");
      if (input.value.trim()) {
        sendMessage(input.value);
      }
    });
  }
  
  // Обработчик Enter
  const messageInput = document.getElementById("messageInput");
  if (messageInput) {
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (messageInput.value.trim()) {
          sendMessage(messageInput.value);
        }
      }
    });
  }
});

// ========== ЭКСПОРТ ==========
window.openChat = openChat;
window.sendMessage = sendMessage;
window.chatData = chatData;

console.log("✅ chat.js готов — все 5 друзей отвечают с характером!");
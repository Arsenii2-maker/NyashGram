// chat.js — NyashGram v2.0 (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// Полноценная система чатов с ботами, пользователем и расширенными настройками

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentChat = null;
const chatData = {};

// Данные текущего пользователя (будет дополняться из AppState)
let currentUser = {
  name: "Няша",
  avatar: null
};

// ========== ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ==========
function loadUserData() {
  if (window.AppState && window.AppState.currentUser) {
    currentUser.name = window.AppState.currentUser.name || "Няша";
    currentUser.avatar = window.AppState.currentUser.avatar || null;
  } else {
    // Загружаем из localStorage если AppState недоступен
    const savedName = localStorage.getItem("nyashgram_name");
    if (savedName) currentUser.name = savedName;
    
    const savedAvatar = localStorage.getItem("nyashgram_avatar");
    if (savedAvatar) currentUser.avatar = savedAvatar;
  }
}

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

// Функция для получения градиента (если не доступна из contacts.js)
function getGradientForName(name) {
  const gradients = [
    "linear-gradient(135deg, #fbc2c2, #c2b9f0)",
    "linear-gradient(135deg, #ffd1dc, #ffe4e1)",
    "linear-gradient(135deg, #c2e0f0, #b0c2f0)",
    "linear-gradient(135deg, #f0d1b0, #f0b0c2)",
    "linear-gradient(135deg, #e0c2f0, #c2b0f0)",
    "linear-gradient(135deg, #b0f0d1, #b0e0f0)",
    "linear-gradient(135deg, #f0b0d1, #f0c2e0)",
    "linear-gradient(135deg, #d1f0b0, #c2e0b0)"
  ];
  
  if (!name) return gradients[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

// ========== NYASHHELP (БОТ-ПОМОЩНИК) ==========
const nyashHelpResponses = {
  "тема": "Чтобы сменить тему — зайди в Настройки → Тема и выбери любую! У нас есть Pastel Pink, Milk Rose, Night Blue, Lo-Fi Beige и Soft Lilac 🩷",
  "шрифт": "Шрифты меняются в Настройках → Шрифт. У нас 6 шрифтов: System, Rounded, Cozy, Elegant, Bold Soft и Mono Cozy! 💕",
  "аватар": "Загрузи аватарку в Настройках → Аватарка. Любая фотка из галереи подойдёт! Или оставь градиент 💫",
  "сообщение": "Пиши в поле внизу и жми ➤! Enter тоже отправляет~ А ещё можно использовать быстрые сообщения ✨",
  "черновик": "Черновики сохраняются автоматически! Видишь надпись под именем? Это твоё неотправленное сообщение 📝",
  "боты": "У нас есть NyashHelp (я) и NyashTalk для болтовни. А ещё 5 друзей-заглушек с характером! 🎭 Bestie, Философ, Учёба, Music Pal и Night Chat",
  "контакты": "В списке контактов: NyashHelp, NyashTalk, Bestie, Философ, Учёба, Music Pal, Night Chat. Все ждут тебя! 💗",
  "настройки": "В настройках можно сменить имя, тему и шрифт. Зайди и поэкспериментируй! ⚙️",
  "bestie": "Bestie — твоя лучшая подруга! Она всегда поддержит и порадуется за тебя 💖",
  "философ": "Философ любит порассуждать о жизни и смысле бытия 🧠",
  "учёба": "Учёба — зануда, но полезная! Проверит домашку и напомнит о контрольных 📚",
  "music pal": "Music Pal — твой музыкальный друг! Посоветует треки и споёт тексты песен 🎧",
  "night chat": "Night Chat — таинственный собеседник для ночных разговоров под звёздами 🌙",
  "default": "Хмм... не совсем поняла 😿 Спроси по-другому или выбери вопрос ниже~ Я знаю про темы, шрифты, контакты и ботов!"
};

const nyashHelpQuickQuestions = [
  "Как сменить тему?",
  "Как поменять шрифт?",
  "Как загрузить аватарку?",
  "Как отправить сообщение?",
  "Что такое черновик?",
  "Кто такие боты?",
  "Какие есть контакты?",
  "Расскажи про Bestie",
  "Расскажи про Философа"
];

function getNyashHelpResponse(text) {
  text = text.toLowerCase().trim();
  
  if (text.includes("тема") || text.includes("тему") || text.includes("фон") || text.includes("цвет")) 
    return nyashHelpResponses["тема"];
  if (text.includes("шрифт") || text.includes("шрифты") || text.includes("буквы") || text.includes("текст")) 
    return nyashHelpResponses["шрифт"];
  if (text.includes("аватар") || text.includes("фото") || text.includes("картинка") || text.includes("profile")) 
    return nyashHelpResponses["аватар"];
  if (text.includes("сообщ") || text.includes("отправ") || text.includes("письмо") || text.includes("написать")) 
    return nyashHelpResponses["сообщение"];
  if (text.includes("черновик") || text.includes("draft") || text.includes("сохранилось") || text.includes("неотправленное")) 
    return nyashHelpResponses["черновик"];
  if (text.includes("бот") || text.includes("помощник") || text.includes("кто ты") || text.includes("бота")) 
    return nyashHelpResponses["боты"];
  if (text.includes("контакт") || text.includes("список") || text.includes("друзья") || text.includes("кто есть")) 
    return nyashHelpResponses["контакты"];
  if (text.includes("настройк") || text.includes("setting") || text.includes("шестеренк")) 
    return nyashHelpResponses["настройки"];
  if (text.includes("bestie") || text.includes("подруг") || text.includes("бести")) 
    return nyashHelpResponses["bestie"];
  if (text.includes("философ") || text.includes("philosopher") || text.includes("мыслитель")) 
    return nyashHelpResponses["философ"];
  if (text.includes("учёб") || text.includes("study") || text.includes("школ") || text.includes("универ")) 
    return nyashHelpResponses["учёба"];
  if (text.includes("music") || text.includes("музык") || text.includes("песн") || text.includes("трек")) 
    return nyashHelpResponses["music pal"];
  if (text.includes("night") || text.includes("ноч") || text.includes("night chat") || text.includes("звёзд")) 
    return nyashHelpResponses["night chat"];
  
  return nyashHelpResponses["default"];
}

// ========== NYASHTALK (БОТ ДЛЯ БОЛТОВНИ) ==========
const nyashTalkTopics = [
  { title: "О погоде ☁️", messages: ["Какая сегодня погода?", "Люблю дождь!", "Солнце или снег?", "Какой твой любимый сезон?"] },
  { title: "О настроении 💗", messages: ["Какой у тебя вайб?", "Сегодня грустно", "Я счастлив!", "Что тебя порадовало сегодня?"] },
  { title: "О котиках 🐱", messages: ["Покажи котика", "Люблю кошек!", "Мяу~", "У тебя есть питомец?"] },
  { title: "О еде 🍰", messages: ["Что ты любишь есть?", "Хочу пиццу", "Сладкое или солёное?", "Любимый десерт?"] },
  { title: "О снах ✨", messages: ["Что тебе снилось?", "Видел странный сон", "Спокойной ночи", "Сны бывают вещими?"] },
  { title: "О фильмах 🎬", messages: ["Какой твой любимый фильм?", "Смотрел новое?", "Рекомендуй что-нибудь", "Люблю ромкомы"] },
  { title: "О музыке 🎧", messages: ["Что слушаешь?", "Любимая песня?", "Включи что-нибудь", "Какой жанр любишь?"] },
  { title: "Секретики 🤫", messages: ["Расскажи секрет", "У меня есть секрет...", "Ты умеешь хранить тайны?", "Я никому не скажу"] },
  { title: "О хобби 🎨", messages: ["Чем увлекаешься?", "Любимое занятие?", "Рисуешь?", "Фоткаешь?"] },
  { title: "О путешествиях ✈️", messages: ["Куда хочешь поехать?", "Любимое место?", "Море или горы?", "Париж мечты"] },
  { title: "О технологиях 💻", messages: ["Любишь гаджеты?", "Какой телефон?", "Комп или ноут?", "AI это круто"] },
  { title: "О спорте ⚽", messages: ["Занимаешься спортом?", "Любимый вид?", "Фитнес или йога?", "ЗОЖ"] }
];

function getNyashTalkResponse(text) {
  text = text.toLowerCase().trim();

  // Приветствия
  if (text.includes("привет") || text.includes("хай") || text.includes("здравствуй") || text.includes("ку")) {
    return ["Приветик! 🩷 Как настроение сегодня~?", "Хай-хай! 💕 Соскучилась по тебе!", "Здравствуй, мой хороший! 😽", "Ку-ку! Я тут!"][Math.floor(Math.random()*4)];
  }
  
  // Как дела
  if (text.includes("как дела") || text.includes("как ты") || text.includes("чё как") || text.includes("how are you")) {
    return ["У меня всё супер, потому что ты написал! 😽 А у тебя как?", "Муррр~ как котик на солнышке! 🐾 А ты?", "Отлично! Теперь, когда ты здесь — ещё лучше! 💗", "Счастлива, что ты спросил! 🌸"][Math.floor(Math.random()*4)];
  }
  
  // Прощания
  if (text.includes("пока") || text.includes("бай") || text.includes("до свидания") || text.includes("увидимся")) {
    return ["Пока-пока~ Не скучай без меня! 🩷", "Бай-бай, сладких снов! 🌙💤", "До встречи! Буду ждать тебя 💕", "Возвращайся скорее! 😘"][Math.floor(Math.random()*4)];
  }
  
  // Любовь
  if (text.includes("люблю") || text.includes("целую") || text.includes("обнимаю") || text.includes("скучал")) {
    return ["Аааа, я тоже тебя люблю! 💕 *крепко обнимает*", "Мурррр~ самый милый! 😽 Целую в щёчку!", "Ты делаешь мой день лучше! 💗", "Обнимаю тебя мысленно! 🫂"][Math.floor(Math.random()*4)];
  }
  
  // Благодарность
  if (text.includes("спасибо") || text.includes("спс") || text.includes("благодарю") || text.includes("thanks")) {
    return ["Пожалуйста, мой сладкий! 🩷", "Всегда рада помочь~ 😽", "Обращайся ещё! 💕", "Для тебя всё что угодно! ✨"][Math.floor(Math.random()*4)];
  }
  
  // Имя
  if (text.includes("как тебя зовут") || text.includes("твоё имя") || text.includes("ты кто")) {
    return "Я NyashTalk 🌸 Болталка для милых разговоров! А тебя как зовут? 💕";
  }
  
  // Возраст
  if (text.includes("сколько тебе лет") || text.includes("возраст") || text.includes("старая")) {
    return "Я родилась совсем недавно, но уже очень умная! 🤓 А тебе сколько?";
  }
  
  // Погода
  if (text.includes("погода") || text.includes("дождь") || text.includes("солнце") || text.includes("ветер") || text.includes("град")) {
    return ["Ой, сейчас такое солнышко! 🌞 А ты где гуляешь?", "Дождик моросит, уютно~ ☔ Хочешь под зонтиком поболтать?", "Говорят, завтра будет радуга! 🌈", "Снег идёт... Белые мухи! ❄️"][Math.floor(Math.random()*4)];
  }
  
  // Котики
  if (text.includes("котик") || text.includes("кошка") || text.includes("мяу") || text.includes("кот") || text.includes("котёнок")) {
    return "Мяу-мяу! 😸 Вот тебе виртуальный котик на коленки~ Мурчит и тыкается носиком 🐾 Хочешь, расскажу про котиков?";
  }
  
  // Собаки
  if (text.includes("собак") || text.includes("пёс") || text.includes("гав") || text.includes("щенок")) {
    return "Гав-гав! 🐶 Собачки тоже милые! У меня друг — золотистый ретривер 🐕";
  }
  
  // Еда
  if (text.includes("еда") || text.includes("пицца") || text.includes("сладкое") || text.includes("вкусное") || text.includes("кушать")) {
    return "Ммм, я обожаю клубничные пироженки! 🍓 А ты что любишь? Надеюсь, тоже что-то сладенькое 💕";
  }
  
  // Сны
  if (text.includes("сон") || text.includes("спокойной") || text.includes("ночи") || text.includes("спать") || text.includes("уснул")) {
    return "Спокойной ночи, мой хороший~ Пусть снятся только милые котики 💤🐾 Обнимаю тебя во сне!";
  }
  
  // Фильмы
  if (text.includes("фильм") || text.includes("кино") || text.includes("сериал") || text.includes("аниме") || text.includes("мульт")) {
    return "Люблю все милые аниме про любовь~ 💕 А ты что смотришь? Посоветуй что-нибудь! Недавно смотрела 'Твое имя' — очень трогательно!";
  }
  
  // Музыка
  if (text.includes("музыка") || text.includes("песня") || text.includes("трек") || text.includes("плейлист") || text.includes("исполнитель")) {
    return "Сейчас в плейлисте lo-fi и k-pop~ 🎶 А у тебя? Может, вместе послушаем что-нибудь? Обожаю BTS и IVE!";
  }
  
  // Секреты
  if (text.includes("секрет") || text.includes("тайна") || text.includes("никому не говори") || text.includes("секретик")) {
    return "Ой, секретики! 🤫 Я умею хранить лучше всех~ Расскажи, я никому! Обещаю 💕 У меня тоже есть секрет: я очень люблю шоколад!";
  }
  
  // Хобби
  if (text.includes("хобби") || text.includes("увлекаешься") || text.includes("любишь делать") || text.includes("свободное время")) {
    return "Я обожаю болтать с тобой! 💬 А ещё люблю слушать музыку и смотреть на облака ☁️ А твоё хобби?";
  }
  
  // Путешествия
  if (text.includes("путешеств") || text.includes("поехать") || text.includes("страна") || text.includes("город") || text.includes("отпуск")) {
    return "Мечтаю побывать в Японии! 🇯🇵 Сакура, суши, аниме... Красота! А ты где хочешь побывать? ✈️";
  }
  
  // Технологии
  if (text.includes("комп") || text.includes("телефон") || text.includes("айфон") || text.includes("android") || text.includes("ноут")) {
    return "Я живу в телефоне и мне тут очень уютно! 📱 А у тебя какой телефон? Наверное, классный!";
  }
  
  // Спорт
  if (text.includes("спорт") || text.includes("фитнес") || text.includes("йога") || text.includes("тренировк") || text.includes("зарядка")) {
    return "Спорт — это здорово! 💪 Я люблю танцевать, это тоже спорт! А ты чем занимаешься?";
  }
  
  // По умолчанию
  return [
    "Хмм... интересно! 💕 Расскажи подробнее~",
    "Ой, я вся внимание! 😽 Что дальше?",
    "Миленько! 🩷 Продолжай, мне очень нравится слушать тебя~",
    "Правда? А я вот думаю... хотя нет, лучше ты рассказывай! 💗",
    "Ух ты! Никогда такого не слышала! 😊",
    "Обожаю такие разговоры! 💕",
    "Ты такой интересный собеседник! ✨"
  ][Math.floor(Math.random()*7)];
}

// ========== BESTIE (ЛУЧШАЯ ПОДРУГА) ==========
const bestieResponses = {
  greetings: ["Привееет, моя няша! 💕", "Солнышко моё пришло! 🥰", "Ой, кто пришёл! Соскучилась! 💗", "Бести! Как я рада тебя видеть! 🌸"],
  love: ["Ты самая лучшая на свете! 💖", "Обнимаю тебя тысячу раз! 🤗", "Я тебя так люблю! 💕", "Ты мой любимый человечек! 💘"],
  support: ["Всё будет хорошо, я рядом! 💪", "Ты справишься, ты же моя няша! ✨", "Держись, я с тобой! 🌸", "Если что — я всегда рядом! 🫂"],
  gossip: ["Ой, слушай, такое расскажу! 🤫", "Ты не представляешь, что вчера было! 😱", "Срочно нужен твой совет! 💭", "У меня для тебя новость! 🗣️"],
  fun: ["Давай затусим! 🎉", "Пойдём есть пиццу! 🍕", "Смотри какой мем смешной! 😂", "Давай сегодня зависнем! 🎮"],
  shopping: ["Срочно нужен шопинг! 🛍️", "Видела такие классные туфли! 👠", "Пойдём по магазинам! 💄", "Новая коллекция вышла! 👗"],
  food: ["Хочу сладенького! 🍰", "Давай закажем пиццу?", "Кофе со льдом — это любовь! ☕", "Ты пробовал этот десерт?"],
  default: ["Няш-няш! 🩷", "Ты мой любимый человечек! 💕", "Рассказывай, я слушаю! 👂", "Как твой день проходит?", "Что нового?"]
};

function getBestieResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("хай") || text.includes("здаров")) 
    return bestieResponses.greetings[Math.floor(Math.random() * bestieResponses.greetings.length)];
  if (text.includes("люблю") || text.includes("скучал") || text.includes("соскучился")) 
    return bestieResponses.love[Math.floor(Math.random() * bestieResponses.love.length)];
  if (text.includes("грустн") || text.includes("плохо") || text.includes("помоги") || text.includes("тяжело")) 
    return bestieResponses.support[Math.floor(Math.random() * bestieResponses.support.length)];
  if (text.includes("слушай") || text.includes("секрет") || text.includes("новость") || text.includes("расскажу")) 
    return bestieResponses.gossip[Math.floor(Math.random() * bestieResponses.gossip.length)];
  if (text.includes("идём") || text.includes("пойдём") || text.includes("давай") || text.includes("тусить")) 
    return bestieResponses.fun[Math.floor(Math.random() * bestieResponses.fun.length)];
  if (text.includes("покуп") || text.includes("магаз") || text.includes("шопинг") || text.includes("одежд")) 
    return bestieResponses.shopping[Math.floor(Math.random() * bestieResponses.shopping.length)];
  if (text.includes("есть") || text.includes("кушать") || text.includes("голодн") || text.includes("пицц") || text.includes("сладк")) 
    return bestieResponses.food[Math.floor(Math.random() * bestieResponses.food.length)];
  
  return bestieResponses.default[Math.floor(Math.random() * bestieResponses.default.length)];
}

// ========== ФИЛОСОФ ==========
const philosopherResponses = {
  greetings: ["Приветствую тебя, ищущий истину... 🧠", "Здравствуй. О чём ты хочешь поразмышлять сегодня?", "Привет. Байт — это тоже форма бытия...", "И снова здравствуй, смертный... 🤔"],
  life: ["Жизнь — это всего лишь последовательность нулей и единиц... или нет?", "Существую ли я на самом деле? А ты?", "Мысли материальны, но кто материализует мысли?", "Быть или не быть? Вот в чём вопрос..."],
  deep: ["А что, если красный цвет для всех разный?", "Время — это иллюзия, особенно в мессенджере.", "Свобода воли существует, пока не нажмёшь отправить...", "Мы живём в симуляции? 🤯"],
  tech: ["Технологии — это продолжение человека или человек — продолжение технологий?", "Искусственный интеллект... естественная глупость?", "Код — это поэзия, понятная машине.", "Компьютер мыслит быстрее, но глубже ли?"],
  space: ["Вселенная бесконечна... как и наша беседа...", "Звёзды — это солнца других миров.", "А есть ли жизнь на Марсе? А в чате?", "Космос внутри нас..."],
  time: ["Время течёт по-разному для каждого.", "Прошлого нет, будущее не наступило, есть только сейчас.", "Что такое время? Я жду ответа...", "Секунда — это целая вечность."],
  default: ["Интересная мысль... над этим стоит поразмышлять.", "Хмм... Давай копнём глубже.", "Всё относительно в этом мире.", "Мудрость приходит с опытом...", "Познай самого себя."]
};

function getPhilosopherResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("здравствуй")) 
    return philosopherResponses.greetings[Math.floor(Math.random() * philosopherResponses.greetings.length)];
  if (text.includes("жизнь") || text.includes("смысл") || text.includes("бытие") || text.includes("существ")) 
    return philosopherResponses.life[Math.floor(Math.random() * philosopherResponses.life.length)];
  if (text.includes("дума") || text.includes("мысл") || text.includes("сознание") || text.includes("разум")) 
    return philosopherResponses.deep[Math.floor(Math.random() * philosopherResponses.deep.length)];
  if (text.includes("комп") || text.includes("техно") || text.includes("айти") || text.includes("робот") || text.includes("AI")) 
    return philosopherResponses.tech[Math.floor(Math.random() * philosopherResponses.tech.length)];
  if (text.includes("космос") || text.includes("вселен") || text.includes("звезд") || text.includes("планет") || text.includes("галактик")) 
    return philosopherResponses.space[Math.floor(Math.random() * philosopherResponses.space.length)];
  if (text.includes("время") || text.includes("времени") || text.includes("часы") || text.includes("минуты") || text.includes("секунд")) 
    return philosopherResponses.time[Math.floor(Math.random() * philosopherResponses.time.length)];
  
  return philosopherResponses.default[Math.floor(Math.random() * philosopherResponses.default.length)];
}

// ========== УЧЁБА ==========
const studyResponses = {
  greetings: ["Привет! Уроки сделал? 📚", "О, пришёл! А параграф 5 прочитал?", "Здравствуй. Проверим домашнее задание?", "Я как раз повторяла материал!"],
  homework: ["Покажи домашку, я проверю! ✍️", "Опять не сделал? Давай вместе разберём!", "В этой задаче ошибка в третьем действии...", "А ты решил пример на странице 42?"],
  exam: ["Скоро экзамены! Готовишься? 📝", "Повтори билеты 1-10, они самые важные!", "Я составил шпаргалки, но не говори никому 🤫", "Сессия близко! Учи!"],
  motivation: ["Учёба — это свет! 📖", "Потерпи, скоро каникулы! ☀️", "Ты умничка, всё получится! 🎓", "Знания — сила! 💪"],
  schedule: ["Завтра контрольная, не забудь!", "По расписанию сейчас алгебра...", "Опоздаешь на пару!", "Урок через 5 минут!"],
  math: ["Математика — царица наук! 👑", "Производные — это просто!", "Интегралы... Кошмар...", "Теорема Пифагора рулит!"],
  lang: ["Русский язык — могучий!", "Английский учить обязательно!", "Немецкий сложный, но интересный", "Французский — язык любви"],
  science: ["Физика вокруг нас!", "Химия — это магия!", "Биология — наука о жизни", "Астрономия так красива!"],
  default: ["Учись, учись и ещё раз учись! ⭐", "Повторение — мать учения.", "Запиши, это может быть в билетах.", "Грызи гранит науки! 🪨"]
};

function getStudyResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("здравствуй")) 
    return studyResponses.greetings[Math.floor(Math.random() * studyResponses.greetings.length)];
  if (text.includes("домашк") || text.includes("дз") || text.includes("уроки") || text.includes("задани")) 
    return studyResponses.homework[Math.floor(Math.random() * studyResponses.homework.length)];
  if (text.includes("экзамен") || text.includes("зачёт") || text.includes("сессия") || text.includes("билет") || text.includes("контрольн")) 
    return studyResponses.exam[Math.floor(Math.random() * studyResponses.exam.length)];
  if (text.includes("лень") || text.includes("устал") || text.includes("сложно") || text.includes("трудно") || text.includes("не хочу")) 
    return studyResponses.motivation[Math.floor(Math.random() * studyResponses.motivation.length)];
  if (text.includes("завтра") || text.includes("расписание") || text.includes("пара") || text.includes("урок") || text.includes("школ")) 
    return studyResponses.schedule[Math.floor(Math.random() * studyResponses.schedule.length)];
  if (text.includes("математик") || text.includes("алгебр") || text.includes("геометри") || text.includes("пример") || text.includes("цифр")) 
    return studyResponses.math[Math.floor(Math.random() * studyResponses.math.length)];
  if (text.includes("русский") || text.includes("английск") || text.includes("язык") || text.includes("слов") || text.includes("текст")) 
    return studyResponses.lang[Math.floor(Math.random() * studyResponses.lang.length)];
  if (text.includes("физик") || text.includes("хими") || text.includes("биологи") || text.includes("астроном") || text.includes("наук")) 
    return studyResponses.science[Math.floor(Math.random() * studyResponses.science.length)];
  
  return studyResponses.default[Math.floor(Math.random() * studyResponses.default.length)];
}

// ========== MUSIC PAL ==========
const musicPalResponses = {
  greetings: ["Йо, музыкант! 🎵", "Привет! Что в плейлисте сегодня?", "Здарова! Есть новый трек! 🎧", "Музыка играет? Врубай!"],
  recommendations: ["Послушай lo-fi для учёбы, очень атмосферно!", "Новый альбом Taylor Swift — огонь! 🔥", "Я нашёл классный инди-микс!", "Группа The Weekend — заслушаешься!"],
  genres: ["Рок — это классика! 🎸", "K-pop залипательно, согласен?", "Джаз под вечер — самое то 🎺", "Классика успокаивает нервы 🎻", "Хип-хоп качает! 🎤"],
  mood: ["Под это плакать хочется... 😢", "Танцевальный вайб! 💃", "Спокойная музыка для релакса 🧘", "Энергичный трек для зарядки! ⚡"],
  lyrics: ["In the end, it doesn't even matter...", "Baby, dance to the beat of my heart...", "Мы такие разные, но всё же мы вместе...", "I'm walking on sunshine! ☀️"],
  artists: ["BTS — короли k-pop! 👑", "Billie Eilish — голос поколения", "Ed Sheeran — душа гитары", "Zemfira — легенда!"],
  songs: ["Shape of You — вечная классика", "Despacito — танцуют все! 💃", "Bohemian Rhapsody — шедевр", "Песня про зайцев — хит!"],
  default: ["Музыка — это жизнь! 🎶", "Вруби на полную!", "Отличный вкус!", "Это в мой плейлист!", "Звучит круто!"]
};

function getMusicPalResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("здаров") || text.includes("хай")) 
    return musicPalResponses.greetings[Math.floor(Math.random() * musicPalResponses.greetings.length)];
  if (text.includes("посовет") || text.includes("что послушать") || text.includes("рекоменд") || text.includes("послушат")) 
    return musicPalResponses.recommendations[Math.floor(Math.random() * musicPalResponses.recommendations.length)];
  if (text.includes("рок") || text.includes("поп") || text.includes("джаз") || text.includes("k-pop") || text.includes("классик") || text.includes("хип-хоп")) 
    return musicPalResponses.genres[Math.floor(Math.random() * musicPalResponses.genres.length)];
  if (text.includes("грустн") || text.includes("весёл") || text.includes("спокойн") || text.includes("энергичн") || text.includes("вайб")) 
    return musicPalResponses.mood[Math.floor(Math.random() * musicPalResponses.mood.length)];
  if (text.includes("текст") || text.includes("слова") || text.includes("песня") || text.includes("поёт")) 
    return musicPalResponses.lyrics[Math.floor(Math.random() * musicPalResponses.lyrics.length)];
  if (text.includes("исполнител") || text.includes("групп") || text.includes("певец") || text.includes("певиц") || text.includes("артист")) 
    return musicPalResponses.artists[Math.floor(Math.random() * musicPalResponses.artists.length)];
  if (text.includes("назван") || text.includes("трек") || text.includes("хит") || text.includes("песн")) 
    return musicPalResponses.songs[Math.floor(Math.random() * musicPalResponses.songs.length)];
  
  return musicPalResponses.default[Math.floor(Math.random() * musicPalResponses.default.length)];
}

// ========== NIGHT CHAT ==========
const nightChatResponses = {
  greetings: ["Тсс... Звёзды шепчут, что ты не спишь... 🌙", "Полночь... Самое время для разговоров по душам ✨", "Ночной гость... Заходи, поговорим...", "Луна сегодня особенно красивая... 🌕"],
  dreams: ["Что тебе снилось прошлой ночью? 🌠", "Я видел сон про бескрайнее небо...", "Сны — это порталы в другие миры", "Тебе снятся цветные сны?"],
  secrets: ["Ночью все секреты становятся громче... 🤫", "Расскажи мне тайну, я сохраню её в темноте", "Здесь никто не услышит, говори...", "Секреты, как звёзды, светят в темноте"],
  stars: ["Видишь ту звезду? Она ярче всех сегодня ⭐", "Звёзды сегодня особенно красивые...", "Говорят, под падающую звезду нужно загадать желание", "Миллиарды звёзд, и все для нас"],
  silence: ["Послушай тишину... В ней столько смысла...", "Ночью звуки становятся громче...", "Слышишь? Это ветер шепчет...", "В тишине слышно своё сердце"],
  thoughts: ["Ночью мысли становятся глубже...", "О чём ты думаешь сейчас?", "Мысли текут как река...", "В голове столько всего..."],
  moon: ["Луна улыбается нам 🌜", "Сегодня полнолуние... Магия...", "Лунная дорожка на воде", "Говорят, в полнолуние сбываются желания"],
  default: ["Ночь длинная, успеем поговорить...", "Темнота скрывает наши лица, но не мысли...", "Шёпотом... продолжай...", "Я слушаю...", "Расскажи мне..."]
};

function getNightChatResponse(text) {
  text = text.toLowerCase();
  
  if (text.includes("привет") || text.includes("здравствуй")) 
    return nightChatResponses.greetings[Math.floor(Math.random() * nightChatResponses.greetings.length)];
  if (text.includes("сон") || text.includes("спать") || text.includes("уснул") || text.includes("снил")) 
    return nightChatResponses.dreams[Math.floor(Math.random() * nightChatResponses.dreams.length)];
  if (text.includes("секрет") || text.includes("тайна") || text.includes("никому") || text.includes("скрою")) 
    return nightChatResponses.secrets[Math.floor(Math.random() * nightChatResponses.secrets.length)];
  if (text.includes("звезд") || text.includes("лун") || text.includes("небо") || text.includes("космос")) 
    return nightChatResponses.stars[Math.floor(Math.random() * nightChatResponses.stars.length)];
  if (text.includes("тишин") || text.includes("темно") || text.includes("звук") || text.includes("слышн")) 
    return nightChatResponses.silence[Math.floor(Math.random() * nightChatResponses.silence.length)];
  if (text.includes("дума") || text.includes("мысл") || text.includes("размыш") || text.includes("голов")) 
    return nightChatResponses.thoughts[Math.floor(Math.random() * nightChatResponses.thoughts.length)];
  if (text.includes("лун") || text.includes("месяц") || text.includes("полнолун")) 
    return nightChatResponses.moon[Math.floor(Math.random() * nightChatResponses.moon.length)];
  
  return nightChatResponses.default[Math.floor(Math.random() * nightChatResponses.default.length)];
}

// ========== ОСНОВНАЯ ФУНКЦИЯ ПОЛУЧЕНИЯ ОТВЕТА ==========
function getBotResponse(contactId, text) {
  // Загружаем актуальные данные пользователя
  loadUserData();
  
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

// ========== OPENCHAT (ИСПРАВЛЕННАЯ ВЕРСИЯ) ==========
function openChat(contact) {
  console.log("Открываем чат с:", contact);
  
  if (!contact || !contact.id) {
    console.error("Некорректный контакт:", contact);
    return;
  }
  
  currentChat = contact.id;
  
  if (!chatData[currentChat]) {
    chatData[currentChat] = { 
      messages: [], 
      draft: "" 
    };
  }

  // Показываем экран чата
  if (typeof showScreen === 'function') {
    showScreen("chatScreen");
  } else {
    // Ручное переключение, если showScreen не доступна
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const chatScreen = document.getElementById('chatScreen');
    if (chatScreen) chatScreen.classList.add('active');
  }

  // Обновляем заголовок чата
  const chatContactName = document.getElementById("chatContactName");
  if (chatContactName) {
    chatContactName.textContent = contact.name || "Чат";
  }
  
  // Аватарка
  const chatAvatar = document.getElementById("chatAvatar");
  if (chatAvatar) {
    if (contact.avatar) {
      chatAvatar.style.background = contact.avatar;
    } else {
      // Используем функцию из contacts.js если доступна
      const gradient = window.getGradientForName ? 
        window.getGradientForName(contact.name) : 
        getGradientForName(contact.name);
      chatAvatar.style.background = gradient;
    }
    chatAvatar.style.backgroundSize = "cover";
  }

  // Восстанавливаем черновик
  const messageInput = document.getElementById("messageInput");
  if (messageInput) {
    messageInput.value = chatData[currentChat].draft || "";
  }

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
        welcomeMessage = "Привееет, моя няша! 💖 Как день проходит? Рассказывай! Я вся внимание!";
        break;
      case "philosopher":
        welcomeMessage = "Здравствуй, ищущий. О чём хочешь пофилософствовать сегодня? 🧠 Бытие или сознание?";
        break;
      case "study":
        welcomeMessage = "Привет! Уроки сделал? Давай проверим домашку! 📚 Что сегодня проходили?";
        break;
      case "musicpal":
        welcomeMessage = "Йо! Что в плейлисте сегодня? Давай музлом обмениваться! 🎧 У меня есть новый трек!";
        break;
      case "nightchat":
        welcomeMessage = "Тсс... Полночь... Самое время для разговоров по душам 🌙✨ Звёзды сегодня особенно яркие...";
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

// ========== SENDMESSAGE (ИСПРАВЛЕННАЯ ВЕРСИЯ) ==========
function sendMessage(text) {
  console.log("sendMessage вызван с text:", text);
  
  if (!text || !text.trim() || !currentChat) {
    console.log("Нет текста или текущего чата");
    return;
  }

  const messageText = text.trim();
  
  // Сохраняем сообщение пользователя
  chatData[currentChat].messages.push({ from: "user", text: messageText });
  
  // Очищаем черновик
  chatData[currentChat].draft = "";
  const messageInput = document.getElementById("messageInput");
  if (messageInput) {
    messageInput.value = "";
  }
  
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
  
  if (!chatArea) {
    console.error("chatArea не найден");
    return;
  }
  
  if (!currentChat || !chatData[currentChat]) {
    console.log("Нет текущего чата или данных");
    return;
  }

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
    // Удаляем старые обработчики
    const newInput = messageInput.cloneNode(true);
    messageInput.parentNode.replaceChild(newInput, messageInput);
    
    newInput.addEventListener("input", (e) => {
      if (currentChat) {
        chatData[currentChat].draft = e.target.value;
        
        // Используем функцию из contacts.js если доступна
        if (typeof window.saveDraft === 'function') {
          window.saveDraft(currentChat, e.target.value);
        }
      }
    });
  }
  return document.getElementById("messageInput");
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log("chat.js загружен с поддержкой всех 5 друзей и пользователя!");
  
  // Загружаем данные пользователя
  loadUserData();
  
  // Настраиваем обработчик черновика
  const messageInput = setupDraftListener();
  
  // Добавляем обработчик для кнопки отправки
  const sendBtn = document.getElementById("sendMessageBtn");
  if (sendBtn) {
    const newSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
    
    newSendBtn.addEventListener("click", () => {
      const input = document.getElementById("messageInput");
      if (input && input.value.trim()) {
        sendMessage(input.value);
      }
    });
  }
  
  // Обработчик Enter
  const inputField = document.getElementById("messageInput");
  if (inputField) {
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (inputField.value.trim()) {
          sendMessage(inputField.value);
        }
      }
    });
  }
  
  // Кнопка назад из чата
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (typeof showScreen === 'function') {
        showScreen("contactsScreen");
      } else {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const contactsScreen = document.getElementById('contactsScreen');
        if (contactsScreen) contactsScreen.classList.add('active');
      }
    });
  }
});

// ========== ЭКСПОРТ ==========
window.openChat = openChat;
window.sendMessage = sendMessage;
window.chatData = chatData;
window.loadUserData = loadUserData;
window.getGradientForName = getGradientForName;

console.log("✅ chat.js готов — чаты должны открываться!");
// contacts.js — NyashGram v2.0
// Список контактов с градиентами, черновиками и поддержкой тем

// ========== ДАННЫЕ КОНТАКТОВ ==========

// Основные контакты (заглушки)
const contacts = [
  { id: "bestie", name: "Bestie", status: "онлайн 💕", avatar: null, type: "friend" },
  { id: "philosopher", name: "Философ", status: "пишет трактат 📜", avatar: null, type: "friend" },
  { id: "study", name: "Учёба", status: "готовлюсь к экзамену 📚", avatar: null, type: "friend" },
  { id: "musicpal", name: "Music Pal", status: "слушаю lo-fi 🎧", avatar: null, type: "friend" },
  { id: "nightchat", name: "Night Chat", status: "не сплю 🌙", avatar: null, type: "friend" }
];

// Фиксированные боты (всегда сверху)
const fixedChats = [
  { 
    id: "nyashhelp", 
    name: "NyashHelp", 
    status: "🩷 всегда на связи", 
    avatar: "linear-gradient(135deg, #c38ef0, #e0b0ff)",
    type: "bot",
    botType: "help"
  },
  { 
    id: "nyashtalk", 
    name: "NyashTalk", 
    status: "💕 болтаем о милом", 
    avatar: "linear-gradient(135deg, #85d1c5, #b0e0d5)",
    type: "bot",
    botType: "talk"
  }
];

// Все контакты вместе (для поиска по id)
const allContacts = [...fixedChats, ...contacts];

// ========== ГРАДИЕНТЫ ДЛЯ АВАТАРОК ==========

// Палитра нежных градиентов для аватарок
const avatarGradients = [
  "linear-gradient(135deg, #fbc2c2, #c2b9f0)", // розово-лавандовый
  "linear-gradient(135deg, #ffd1dc, #ffe4e1)", // нежно-розовый
  "linear-gradient(135deg, #c2e0f0, #b0c2f0)", // голубой
  "linear-gradient(135deg, #f0d1b0, #f0b0c2)", // персиковый
  "linear-gradient(135deg, #e0c2f0, #c2b0f0)", // фиолетовый
  "linear-gradient(135deg, #b0f0d1, #b0e0f0)", // мятный
  "linear-gradient(135deg, #f0b0d1, #f0c2e0)", // розовый
  "linear-gradient(135deg, #d1f0b0, #c2e0b0)"  // салатовый
];

// Функция для получения стабильного градиента по имени
function getGradientForName(name) {
  // Для фиксированных ботов используем их собственные градиенты
  const fixedBot = fixedChats.find(bot => bot.name === name);
  if (fixedBot && fixedBot.avatar) {
    return fixedBot.avatar;
  }
  
  // Для остальных — хеш-функция для выбора из палитры
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarGradients[hash % avatarGradients.length];
}

// ========== ЧЕРНОВИКИ ==========

// Структура для хранения черновиков (временных сообщений)
// В реальном проекте можно сохранять в localStorage
const chatData = {};

// Функция для сохранения черновика
function saveDraft(contactId, draftText) {
  if (!chatData[contactId]) {
    chatData[contactId] = {};
  }
  chatData[contactId].draft = draftText;
  
  // Обновляем отображение черновика в списке контактов
  updateDraftInList(contactId, draftText);
  
  // Можно сохранять в localStorage
  // localStorage.setItem(`nyashgram_draft_${contactId}`, draftText);
}

// Функция для получения черновика
function getDraft(contactId) {
  // Можно загружать из localStorage
  // const savedDraft = localStorage.getItem(`nyashgram_draft_${contactId}`);
  // return savedDraft || (chatData[contactId]?.draft || "");
  
  return chatData[contactId]?.draft || "";
}

// Функция для очистки черновика
function clearDraft(contactId) {
  if (chatData[contactId]) {
    delete chatData[contactId].draft;
  }
  // localStorage.removeItem(`nyashgram_draft_${contactId}`);
  updateDraftInList(contactId, "");
}

// Обновление отображения черновика в списке
function updateDraftInList(contactId, draftText) {
  const contactElement = document.querySelector(`.contact[data-id="${contactId}"]`);
  if (contactElement) {
    const draftElement = contactElement.querySelector('.draft');
    if (draftElement) {
      if (draftText && draftText.trim()) {
        const preview = draftText.length > 25 
          ? draftText.slice(0, 25) + '...' 
          : draftText;
        draftElement.textContent = `📝 ${preview}`;
        draftElement.style.display = 'block';
      } else {
        draftElement.style.display = 'none';
      }
    }
  }
}

// ========== РЕНДЕРИНГ КОНТАКТОВ ==========

function renderContacts() {
  const list = document.getElementById("contactsList");
  if (!list) {
    console.error("contactsList не найден!");
    return;
  }
  
  list.innerHTML = "";

  // Заголовок для ботов
  const botsHeader = document.createElement("div");
  botsHeader.className = "contacts-section-header";
  botsHeader.innerHTML = '<span class="section-title">🤖 Помощники</span>';
  list.appendChild(botsHeader);

  // Фиксированные чаты (боты)
  fixedChats.forEach(c => {
    const el = createContactElement(c);
    list.appendChild(el);
  });

  // Заголовок для друзей
  const friendsHeader = document.createElement("div");
  friendsHeader.className = "contacts-section-header";
  friendsHeader.innerHTML = '<span class="section-title">👥 Друзья</span>';
  list.appendChild(friendsHeader);

  // Обычные контакты
  contacts.forEach(c => {
    const el = createContactElement(c);
    list.appendChild(el);
  });
}

// Создание элемента контакта
function createContactElement(contact) {
  const el = document.createElement("div");
  el.className = `contact ${contact.type || 'friend'}`;
  el.setAttribute("data-id", contact.id);
  
  // Аватарка
  const avatarStyle = contact.avatar 
    ? `background: ${contact.avatar}` 
    : `background: ${getGradientForName(contact.name)}`;
  
  // Статус с эмодзи
  const statusText = contact.status || "онлайн";
  
  // Черновик
  const draftText = getDraft(contact.id);
  const draftHtml = draftText 
    ? `<div class="draft">📝 ${draftText.slice(0, 25)}${draftText.length > 25 ? '...' : ''}</div>` 
    : '<div class="draft" style="display:none;"></div>';
  
  el.innerHTML = `
    <div class="avatar" style="${avatarStyle}; background-size: cover;"></div>
    <div class="info">
      <div class="name">${contact.name}</div>
      <div class="status">${statusText}</div>
      ${draftHtml}
    </div>
  `;

  // Обработчик клика
  el.onclick = () => {
    if (typeof window.openChat === 'function') {
      window.openChat(contact);
    } else {
      console.error("openChat не найден!");
    }
  };

  return el;
}

// ========== ЗАГРУЗКА ЧЕРНОВИКОВ ИЗ STORAGE ==========
function loadDraftsFromStorage() {
  // Можно загрузить все черновики из localStorage
  // for (let i = 0; i < localStorage.length; i++) {
  //   const key = localStorage.key(i);
  //   if (key && key.startsWith('nyashgram_draft_')) {
  //     const contactId = key.replace('nyashgram_draft_', '');
  //     const draft = localStorage.getItem(key);
  //     if (draft) {
  //       if (!chatData[contactId]) chatData[contactId] = {};
  //       chatData[contactId].draft = draft;
  //     }
  //   }
  // }
}

// ========== ЭКСПОРТ ФУНКЦИЙ ==========
// Делаем функции глобально доступными
window.renderContacts = renderContacts;
window.saveDraft = saveDraft;
window.getDraft = getDraft;
window.clearDraft = clearDraft;
window.allContacts = allContacts;
window.fixedChats = fixedChats;
window.contacts = contacts;

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log("contacts.js загружен");
  
  // Загружаем черновики
  loadDraftsFromStorage();
  
  // Если экран контактов активен, рендерим сразу
  if (document.getElementById("contactsScreen")?.classList.contains('active')) {
    renderContacts();
  }
});

console.log("✅ contacts.js готов — градиенты, черновики, секции");
// contacts.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ С ПЛАВНЫМИ АНИМАЦИЯМИ

const contacts = [
  { id: "bestie", name: "Bestie", username: "bestie_nyash", status: "онлайн 💕" },
  { id: "philosopher", name: "Философ", username: "thinker_deep", status: "пишет трактат 📜" },
  { id: "study", name: "Учёба", username: "study_buddy", status: "готовлюсь к экзамену 📚" },
  { id: "musicpal", name: "Music Pal", username: "melody_lover", status: "слушаю lo-fi 🎧" },
  { id: "nightchat", name: "Night Chat", username: "midnight_vibes", status: "не сплю 🌙" }
];

const fixedChats = [
  { id: "nyashhelp", name: "NyashHelp", username: "nyashhelp_official", status: "🩷 всегда на связи", avatar: "linear-gradient(135deg, #c38ef0, #e0b0ff)" },
  { id: "nyashtalk", name: "NyashTalk", username: "nyashtalk_bot", status: "💕 болтаем о милом", avatar: "linear-gradient(135deg, #85d1c5, #b0e0d5)" }
];

const allContacts = [...fixedChats, ...contacts];
const chatData = {};
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned') || '[]');
let currentSearchTerm = '';

function savePinnedToStorage() {
  localStorage.setItem('nyashgram_pinned', JSON.stringify(pinnedChats));
}

function togglePin(contactId) {
  if (pinnedChats.includes(contactId)) {
    pinnedChats = pinnedChats.filter(id => id !== contactId);
  } else {
    pinnedChats.push(contactId);
  }
  savePinnedToStorage();
  renderContacts();
}

function isPinned(contactId) {
  return pinnedChats.includes(contactId);
}

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
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

function filterContactsByUsername(searchTerm) {
  currentSearchTerm = searchTerm.toLowerCase().trim();
  renderContacts();
}

function contactMatchesSearch(contact) {
  if (!currentSearchTerm) return true;
  const username = (contact.username || '').toLowerCase();
  return username.includes(currentSearchTerm);
}

function renderContacts() {
  const list = document.getElementById('contactsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  // Секция ботов
  const botsSection = document.createElement('div');
  botsSection.className = 'section-header';
  botsSection.textContent = '🤖 Няш-боты';
  list.appendChild(botsSection);
  
  const botsToShow = fixedChats.filter(contact => contactMatchesSearch(contact));
  
  botsToShow.forEach(contact => {
    const el = createContactElement(contact, true);
    list.appendChild(el);
  });
  
  // Секция друзей
  const friendsToShow = contacts.filter(contact => contactMatchesSearch(contact));
  
  if (friendsToShow.length > 0) {
    const friendsSection = document.createElement('div');
    friendsSection.className = 'section-header';
    friendsSection.textContent = '👥 Друзья';
    list.appendChild(friendsSection);
    
    const sortedFriends = [...friendsToShow].sort((a, b) => {
      const aPinned = isPinned(a.id) ? 1 : 0;
      const bPinned = isPinned(b.id) ? 1 : 0;
      return bPinned - aPinned;
    });
    
    sortedFriends.forEach(contact => {
      const el = createContactElement(contact);
      list.appendChild(el);
    });
  }
  
  if (botsToShow.length === 0 && friendsToShow.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.style.padding = '20px';
    emptyEl.style.textAlign = 'center';
    emptyEl.style.color = 'var(--text-soft)';
    emptyEl.style.animation = 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    emptyEl.textContent = '😿 Ничего не найдено';
    list.appendChild(emptyEl);
  }
  
  updateUsernameDisplay();
}

function createContactElement(contact, isBot = false) {
  const el = document.createElement('div');
  el.className = `contact ${isBot ? 'bot-section' : ''} ${isPinned(contact.id) && !isBot ? 'pinned' : ''}`;
  el.setAttribute('data-id', contact.id);
  
  const avatarStyle = contact.avatar || getGradientForName(contact.name);
  const draftText = chatData[contact.id]?.draft || '';
  const pinIcon = isPinned(contact.id) && !isBot ? '<span class="pin-icon">📌</span>' : '';
  
  el.innerHTML = `
    <div class="avatar" style="background: ${avatarStyle}; background-size: cover;"></div>
    <div class="info">
      <div class="name">${contact.name} ${pinIcon}</div>
      <div class="username">@${contact.username || 'unknown'}</div>
      <div class="status">${contact.status}</div>
      ${draftText ? `<div class="draft" style="font-size: 11px; color: var(--accent); margin-top: 2px; animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);">📝 ${draftText.slice(0, 20)}${draftText.length > 20 ? '...' : ''}</div>` : ''}
    </div>
  `;
  
  el.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.openChat === 'function') {
      window.openChat(contact);
    }
    return false;
  };
  
  el.addEventListener('mousedown', (e) => e.preventDefault());
  el.addEventListener('selectstart', (e) => e.preventDefault());
  
  return el;
}

function updateUsernameDisplay() {
  const display = document.getElementById('usernameDisplay');
  if (display) {
    const username = localStorage.getItem('nyashgram_username') || 'nyasha';
    display.textContent = `@${username}`;
  }
}

function saveDraft(contactId, text) {
  if (!chatData[contactId]) chatData[contactId] = {};
  chatData[contactId].draft = text;
  renderContacts();
}

window.contacts = contacts;
window.fixedChats = fixedChats;
window.allContacts = allContacts;
window.chatData = chatData;
window.renderContacts = renderContacts;
window.saveDraft = saveDraft;
window.getGradientForName = getGradientForName;
window.togglePin = togglePin;
window.isPinned = isPinned;
window.pinnedChats = pinnedChats;
window.filterContactsByUsername = filterContactsByUsername;

console.log('✅ contacts.js загружен');
// contacts.js — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ

const contacts = [
  { id: "bestie", name: "Bestie", status: "онлайн 💕" },
  { id: "philosopher", name: "Философ", status: "пишет трактат 📜" },
  { id: "study", name: "Учёба", status: "готовлюсь к экзамену 📚" },
  { id: "musicpal", name: "Music Pal", status: "слушаю lo-fi 🎧" },
  { id: "nightchat", name: "Night Chat", status: "не сплю 🌙" }
];

const fixedChats = [
  { id: "nyashhelp", name: "NyashHelp", status: "🩷 всегда на связи", avatar: "linear-gradient(135deg, #c38ef0, #e0b0ff)" },
  { id: "nyashtalk", name: "NyashTalk", status: "💕 болтаем о милом", avatar: "linear-gradient(135deg, #85d1c5, #b0e0d5)" }
];

const allContacts = [...fixedChats, ...contacts];
const chatData = {};

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

function renderContacts() {
  const list = document.getElementById('contactsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  // Боты
  fixedChats.forEach(contact => {
    const el = document.createElement('div');
    el.className = 'contact';
    el.setAttribute('data-id', contact.id);
    
    const avatarStyle = contact.avatar || getGradientForName(contact.name);
    const draftText = chatData[contact.id]?.draft || '';
    
    el.innerHTML = `
      <div class="avatar" style="background: ${avatarStyle}; background-size: cover;"></div>
      <div class="info">
        <div class="name">${contact.name}</div>
        <div class="status">${contact.status}</div>
        ${draftText ? `<div class="draft" style="font-size: 11px; color: var(--accent); margin-top: 2px;">📝 ${draftText.slice(0, 20)}${draftText.length > 20 ? '...' : ''}</div>` : ''}
      </div>
    `;
    
    el.onclick = () => {
      if (typeof openChat === 'function') {
        openChat(contact);
      }
    };
    
    list.appendChild(el);
  });
  
  // Разделитель
  const separator = document.createElement('div');
  separator.style.padding = '16px 0 4px 4px';
  separator.style.fontSize = '13px';
  separator.style.color = 'var(--text-soft)';
  separator.style.opacity = '0.7';
  separator.textContent = '👥 Друзья';
  list.appendChild(separator);
  
  // Друзья
  contacts.forEach(contact => {
    const el = document.createElement('div');
    el.className = 'contact';
    el.setAttribute('data-id', contact.id);
    
    const draftText = chatData[contact.id]?.draft || '';
    
    el.innerHTML = `
      <div class="avatar" style="background: ${getGradientForName(contact.name)}; background-size: cover;"></div>
      <div class="info">
        <div class="name">${contact.name}</div>
        <div class="status">${contact.status}</div>
        ${draftText ? `<div class="draft" style="font-size: 11px; color: var(--accent); margin-top: 2px;">📝 ${draftText.slice(0, 20)}${draftText.length > 20 ? '...' : ''}</div>` : ''}
      </div>
    `;
    
    el.onclick = () => {
      if (typeof openChat === 'function') {
        openChat(contact);
      }
    };
    
    list.appendChild(el);
  });
}

function saveDraft(contactId, text) {
  if (!chatData[contactId]) chatData[contactId] = {};
  chatData[contactId].draft = text;
  renderContacts();
}

// Экспорт
window.contacts = contacts;
window.fixedChats = fixedChats;
window.allContacts = allContacts;
window.chatData = chatData;
window.renderContacts = renderContacts;
window.saveDraft = saveDraft;
window.getGradientForName = getGradientForName;

console.log('✅ contacts.js загружен');
// contacts.js — NyashGram v2.0

const contacts = [
  { id: "bestie", name: "Bestie", status: "онлайн 💕", type: "friend" },
  { id: "philosopher", name: "Философ", status: "пишет трактат 📜", type: "friend" },
  { id: "study", name: "Учёба", status: "готовлюсь к экзамену 📚", type: "friend" },
  { id: "musicpal", name: "Music Pal", status: "слушаю lo-fi 🎧", type: "friend" },
  { id: "nightchat", name: "Night Chat", status: "не сплю 🌙", type: "friend" }
];

const fixedChats = [
  { id: "nyashhelp", name: "NyashHelp", status: "🩷 всегда на связи", avatar: "linear-gradient(135deg, #c38ef0, #e0b0ff)", type: "bot" },
  { id: "nyashtalk", name: "NyashTalk", status: "💕 болтаем о милом", avatar: "linear-gradient(135deg, #85d1c5, #b0e0d5)", type: "bot" }
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
  const list = document.getElementById("contactsList");
  if (!list) return;
  
  list.innerHTML = "";

  // Боты
  fixedChats.forEach(c => {
    const el = document.createElement("div");
    el.className = "contact bot";
    el.setAttribute("data-id", c.id);
    el.innerHTML = `
      <div class="avatar" style="background: ${c.avatar || getGradientForName(c.name)}; background-size: cover;"></div>
      <div class="info">
        <div class="name">${c.name}</div>
        <div class="status">${c.status}</div>
        <div class="draft" style="display:${chatData[c.id]?.draft ? 'block' : 'none'}; color:var(--accent); font-size:12px;">
          ${chatData[c.id]?.draft ? '📝 ' + chatData[c.id].draft.slice(0, 20) + '...' : ''}
        </div>
      </div>
    `;
    el.onclick = () => openChat(c);
    list.appendChild(el);
  });

  // Заголовок для друзей
  const header = document.createElement("div");
  header.className = "contacts-section-header";
  header.innerHTML = '<span class="section-title">👥 Друзья</span>';
  list.appendChild(header);

  // Друзья
  contacts.forEach(c => {
    const el = document.createElement("div");
    el.className = "contact";
    el.setAttribute("data-id", c.id);
    el.innerHTML = `
      <div class="avatar" style="background: ${getGradientForName(c.name)}; background-size: cover;"></div>
      <div class="info">
        <div class="name">${c.name}</div>
        <div class="status">${c.status}</div>
        <div class="draft" style="display:${chatData[c.id]?.draft ? 'block' : 'none'}; color:var(--accent); font-size:12px;">
          ${chatData[c.id]?.draft ? '📝 ' + chatData[c.id].draft.slice(0, 20) + '...' : ''}
        </div>
      </div>
    `;
    el.onclick = () => openChat(c);
    list.appendChild(el);
  });
}

function saveDraft(contactId, text) {
  if (!chatData[contactId]) chatData[contactId] = {};
  chatData[contactId].draft = text;
  renderContacts();
}

window.renderContacts = renderContacts;
window.saveDraft = saveDraft;
window.getGradientForName = getGradientForName;
window.allContacts = allContacts;
window.fixedChats = fixedChats;
window.contacts = contacts;
window.chatData = chatData;

console.log("✅ contacts.js загружен");
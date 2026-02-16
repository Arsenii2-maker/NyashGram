const contacts = [
  { id: 1, name: "Bestie", status: "online", avatar: "linear-gradient(135deg, #ff9acb, #ffd6e8)" },
  { id: 2, name: "Философ", status: "offline", avatar: "linear-gradient(135deg, #6c5ce7, #a29bfe)" },
  { id: 3, name: "Учёба", status: "online", avatar: "linear-gradient(135deg, #74b9ff, #0984e3)" },
  { id: 4, name: "Music Pal", status: "online", avatar: "linear-gradient(135deg, #fdcb6e, #e17055)" },
  { id: 5, name: "Night Chat", status: "offline", avatar: "linear-gradient(135deg, #2d3436, #636e72)" }
];

// Фиксированные боты сверху
const fixedChats = [
  {
    id: "nyashhelp",
    name: "NyashHelp",
    status: "🩷 всегда на связи",
    avatar: "linear-gradient(135deg, #ff9acb, #ffd6e8)"
  },
  {
    id: "nyashtalk",
    name: "NyashTalk",
    status: "💕 болтаем о милом",
    avatar: "linear-gradient(135deg, #a78bfa, #7ab8ff)"
  }
];

function gradientFor(name) {
  const hash = name.length * 77;
  return `linear-gradient(135deg, hsl(${hash},80%,75%), hsl(${hash+40},90%,85%))`;
}

function renderContacts() {
  const list = document.getElementById("contactsList");
  list.innerHTML = "";

  // Фиксированные боты
  fixedChats.forEach(c => {
    const el = document.createElement("div");
    el.className = "contact fixed";
    el.innerHTML = `
      <div class="avatar" style="background:${c.avatar}"></div>
      <div class="info">
        <div class="name">${c.name}</div>
        <div class="status">${c.status}</div>
        <div class="draft" style="display:none; color:var(--accent); font-size:12px; margin-top:2px;"></div>
      </div>
    `;

    // Черновик
    if (chatData[c.id] && chatData[c.id].draft) {
      el.querySelector(".draft").textContent = "Черновик: " + chatData[c.id].draft.slice(0, 30) + (chatData[c.id].draft.length > 30 ? "..." : "");
      el.querySelector(".draft").style.display = "block";
    }

    el.onclick = () => openChat(c);
    list.appendChild(el);
  });

  // Обычные контакты
  contacts.forEach(c => {
    const el = document.createElement("div");
    el.className = "contact";
    el.innerHTML = `
      <div class="avatar" style="background:${c.avatar || gradientFor(c.name)}"></div>
      <div class="info">
        <div class="name">${c.name}</div>
        <div class="status">${c.status}</div>
        <div class="draft" style="display:none; color:var(--accent); font-size:12px; margin-top:2px;"></div>
      </div>
    `;

    // Черновик
    if (chatData[c.id] && chatData[c.id].draft) {
      el.querySelector(".draft").textContent = "Черновик: " + chatData[c.id].draft.slice(0, 30) + (chatData[c.id].draft.length > 30 ? "..." : "");
      el.querySelector(".draft").style.display = "block";
    }

    el.onclick = () => openChat(c);
    list.appendChild(el);
  });
}
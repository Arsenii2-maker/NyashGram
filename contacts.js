const contacts = [
  { id: 1, name: "Bestie", status: "online" },
  { id: 2, name: "Философ", status: "пишет трактат" },
  { id: 3, name: "Учёба", status: "готовлюсь к экзамену" },
  { id: 4, name: "Music Pal", status: "слушаю lo-fi" },
  { id: 5, name: "Night Chat", status: "не сплю" }
];

const fixedChats = [
  { id: "nyashhelp", name: "NyashHelp", status: "🩷 всегда на связи" },
  { id: "nyashtalk", name: "NyashTalk", status: "💕 болтаем о милом" }
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
      <div class="avatar" style="background:${c.avatar || gradientFor(c.name)}"></div>
      <div class="info">
        <div class="name">${c.name}</div>
        <div class="status">${c.status}</div>
        <div class="draft" style="display:none; color:#ff9acb; font-size:12px; margin-top:4px;"></div>
      </div>
    `;

    if (chatData[c.id] && chatData[c.id].draft) {
      el.querySelector(".draft").textContent = "Черновик: " + chatData[c.id].draft.slice(0, 30) + "...";
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
      <div class="avatar" style="background:${gradientFor(c.name)}"></div>
      <div class="info">
        <div class="name">${c.name}</div>
        <div class="status">${c.status}</div>
        <div class="draft" style="display:none; color:#ff9acb; font-size:12px; margin-top:4px;"></div>
      </div>
    `;

    if (chatData[c.id] && chatData[c.id].draft) {
      el.querySelector(".draft").textContent = "Черновик: " + chatData[c.id].draft.slice(0, 30) + "...";
      el.querySelector(".draft").style.display = "block";
    }

    el.onclick = () => openChat(c);
    list.appendChild(el);
  });
}
const contacts = [
  { id: 1, name: "Bestie", status: "online" },
  { id: 2, name: "Философ", status: "offline" },
  { id: 3, name: "Учёба", status: "online" },
  { id: 4, name: "Music Pal", status: "online" },
  { id: 5, name: "Night Chat", status: "offline" }
];
 
const fixedChats = [
  {
    id: "nyashhelp",
    name: "NyashHelp",
    status: "🩷 всегда на связи",
    avatar: "linear-gradient(135deg, #ff9acb, #ffd6e8)"
  },
  {
    id: "nyashgpt",
    name: "NyashGPT",
    status: "🌍 ИИ в интернете",
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

  // NyashHelp всегда первый
  fixedChats.forEach(c => {
    const el = document.createElement("div");
    el.className = "contact fixed nyashhelp";
    el.innerHTML = `
      <div class="avatar" style="background:${c.avatar || gradientFor(c.name)}"></div>
      <div>
        <div>${c.name}</div>
        <div class="status">${c.status}</div>
      </div>
    `;
    el.onclick = () => openChat(c);
    list.appendChild(el);
  });

  // Обычные контакты
  contacts.forEach(c => {
    const el = document.createElement("div");
    el.className = "contact";
    el.innerHTML = `
      <div class="avatar" style="background:${gradientFor(c.name)}"></div>
      <div>
        <div>${c.name}</div>
        <div class="status">${c.status}</div>
      </div>
    `;
    el.onclick = () => openChat(c);
    list.appendChild(el);
  });
}
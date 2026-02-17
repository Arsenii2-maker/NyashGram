function renderContacts() {
  const list = document.getElementById("contactsList");
  list.innerHTML = "";

  // Фиксированные чаты
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
      <div class="avatar" style="background:${gradientFor(c.name)}"></div>
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
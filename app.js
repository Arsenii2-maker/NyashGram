const qs = id => document.getElementById(id);

const state = {
  name: localStorage.getItem("name") || "",
  status: localStorage.getItem("status") || "online",
  avatar: localStorage.getItem("avatar") || "",
  theme: localStorage.getItem("theme") || "pastel",
  font: localStorage.getItem("font") || "soft"
};

function applySettings() {
  document.body.dataset.theme = state.theme;
  document.body.dataset.font = state.font;
  qs("myName").textContent = state.name;
  qs("myStatus").textContent = state.status;

  if (state.avatar) {
    qs("myAvatar").style.backgroundImage = `url(${state.avatar})`;
    qs("avatarPreview").style.backgroundImage = `url(${state.avatar})`;
  }
}

qs("enterBtn").onclick = () => {
  state.name = qs("nicknameInput").value.trim();
  if (!state.name) return;

  localStorage.setItem("name", state.name);
  qs("loginScreen").classList.add("hidden");
  qs("app").classList.remove("hidden");
  applySettings();
};

qs("avatarInput").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    state.avatar = reader.result;
    localStorage.setItem("avatar", state.avatar);
    applySettings();
  };
  reader.readAsDataURL(file);
};

qs("openSettings").onclick = () => {
  qs("settings").classList.remove("hidden");
  qs("settingsName").value = state.name;
  qs("settingsStatus").value = state.status;
  qs("themeSelect").value = state.theme;
  qs("fontSelect").value = state.font;
};

qs("closeSettings").onclick = () => {
  state.name = qs("settingsName").value;
  state.status = qs("settingsStatus").value;
  state.theme = qs("themeSelect").value;
  state.font = qs("fontSelect").value;

  localStorage.setItem("name", state.name);
  localStorage.setItem("status", state.status);
  localStorage.setItem("theme", state.theme);
  localStorage.setItem("font", state.font);

  applySettings();
  qs("settings").classList.add("hidden");
};

if (state.name) {
  qs("loginScreen").classList.add("hidden");
  qs("app").classList.remove("hidden");
  applySettings();
}
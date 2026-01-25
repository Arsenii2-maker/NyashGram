const defaultSettings = {
  name: "",
  avatar: "",
  status: "online",
  theme: "pastel-pink",
  font: "system"
};

const settings = {
  ...defaultSettings,
  ...JSON.parse(localStorage.getItem("nyashSettings") || "{}")
};

function save() {
  localStorage.setItem("nyashSettings", JSON.stringify(settings));
}

function apply() {
  document.body.dataset.theme = settings.theme;
  document.body.dataset.font = settings.font;
}

apply();

/* LOGIN */
loginBtn.onclick = () => {
  settings.name = loginInput.value.trim();
  if (!settings.name) return;
  save();
  showScreen("contacts");
  renderContacts();
};

/* SETTINGS */
settingsBtn.onclick = () => {
  settingsName.value = settings.name;
  themeSelect.value = settings.theme;
  fontSelect.value = settings.font;
  statusSelect.value = settings.status;
  showScreen("settings");
};

settingsBackBtn.onclick = () => showScreen("contacts");

saveSettingsBtn.onclick = () => {
  settings.name = settingsName.value;
  settings.theme = themeSelect.value;
  settings.font = fontSelect.value;
  settings.status = statusSelect.value;
  save();
  apply();
  renderContacts();
  showScreen("contacts");
};

/* AVATAR */
avatarInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    settings.avatar = reader.result;
    save();
  };
  reader.readAsDataURL(file);
};
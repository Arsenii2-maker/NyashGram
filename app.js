let state = {
  username: localStorage.getItem('username'),
  avatar: localStorage.getItem('avatar'),
  theme: localStorage.getItem('theme') || 'pink',
  font: localStorage.getItem('font') || 'inter',
  chat: null
};

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
}

function enterApp() {
  const name = nameInput.value.trim();
  if (!name) return;
  state.username = name;
  localStorage.setItem('username', name);
  showScreen('contacts');
  renderContacts();
}

function openSettings() {
  settingsName.value = state.username;
  showScreen('settings');
}

function backToContacts() {
  showScreen('contacts');
}

function saveName() {
  state.username = settingsName.value;
  localStorage.setItem('username', state.username);
  backToContacts();
}

function setAvatar(e) {
  const reader = new FileReader();
  reader.onload = () => {
    state.avatar = reader.result;
    localStorage.setItem('avatar', state.avatar);
  };
  reader.readAsDataURL(e.target.files[0]);
}

function applyTheme() {
  document.body.className = '';
  if (state.theme === 'dark') document.body.classList.add('dark');
  document.body.classList.add(state.font);
}

function setTheme(t) {
  state.theme = t;
  localStorage.setItem('theme', t);
  applyTheme();
}

function setFont(f) {
  state.font = f;
  localStorage.setItem('font', f);
  applyTheme();
}

applyTheme();

if (state.username) {
  showScreen('contacts');
  renderContacts();
}
let state = {
  screen: 'start',
  username: localStorage.getItem('username'),
  theme: localStorage.getItem('theme') || 'pink',
  font: localStorage.getItem('font') || 'inter',
  chat: null
};

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  state.screen = name;
}

function enterApp() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) return;
  localStorage.setItem('username', name);
  state.username = name;
  showScreen('contacts');
  renderContacts();
}

function openSettings() {
  document.getElementById('settingsName').value = state.username;
  showScreen('settings');
}

function backToContacts() {
  showScreen('contacts');
}

function applyTheme() {
  document.body.className = '';
  if (state.theme === 'dark') document.body.classList.add('dark');
  if (state.font) document.body.classList.add(state.font);
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

function saveName() {
  const name = document.getElementById('settingsName').value;
  state.username = name;
  localStorage.setItem('username', name);
  backToContacts();
}

applyTheme();

if (state.username) {
  showScreen('contacts');
  renderContacts();
}
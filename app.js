const startScreen = document.getElementById('startScreen');
const mainScreen = document.getElementById('mainScreen');
const enterBtn = document.getElementById('enterBtn');
const nameInput = document.getElementById('nameInput');
const username = document.getElementById('username');

const profileModal = document.getElementById('profileModal');
const settingsModal = document.getElementById('settingsModal');

enterBtn.onclick = () => {
  if (!nameInput.value.trim()) return;
  username.textContent = nameInput.value;
  startScreen.classList.remove('active');
  mainScreen.classList.add('active');
};

document.getElementById('openProfile').onclick = () => {
  profileModal.classList.remove('hidden');
};

document.getElementById('openSettings').onclick = () => {
  settingsModal.classList.remove('hidden');
};

function closeProfile() {
  profileModal.classList.add('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

function setTheme(t) {
  document.body.classList.toggle('dark', t === 'dark');
}

document.getElementById('colorPicker').oninput = e => {
  document.documentElement.style.setProperty('--accent', e.target.value);
};

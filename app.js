const startScreen = document.getElementById('startScreen');
const mainScreen = document.getElementById('mainScreen');
const enterBtn = document.getElementById('enterBtn');
const usernameInput = document.getElementById('usernameInput');
const usernameLabel = document.getElementById('usernameLabel');

const profileModal = document.getElementById('profileModal');
const settingsModal = document.getElementById('settingsModal');

enterBtn.onclick = () => {
  if (!usernameInput.value.trim()) return;

  usernameLabel.textContent = usernameInput.value;
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

// Цвет
document.getElementById('accentPicker').oninput = e => {
  document.documentElement.style.setProperty('--accent', e.target.value);
};

// Тема
document.getElementById('themeToggle').onchange = e => {
  document.body.style.background = e.target.checked
    ? 'radial-gradient(circle at top, #222, #000)'
    : 'radial-gradient(circle at top, #ffd86f, #fc6262)';
};

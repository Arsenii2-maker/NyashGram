const screens = document.querySelectorAll('.screen');

function show(id) {
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

const name = localStorage.getItem('name');
if (!name) show('login-screen');
else {
  document.getElementById('my-name').textContent = name;
  show('contacts-screen');
}

document.getElementById('login-btn').onclick = () => {
  const n = document.getElementById('nickname-input').value;
  if (!n) return;
  localStorage.setItem('name', n);
  document.getElementById('my-name').textContent = n;
  show('contacts-screen');
};

document.getElementById('settings-btn').onclick = () => show('settings-screen');
document.getElementById('settings-back').onclick = () => show('contacts-screen');

document.getElementById('theme-select').onchange = e => {
  if (e.target.value === 'night') {
    document.documentElement.style.setProperty('--bg', '#0f0f1a');
    document.documentElement.style.setProperty('--text', '#fff');
  }
};

document.getElementById('font-select').onchange = e => {
  const f = {
    inter: 'Inter',
    poppins: 'Poppins',
    playfair: 'Playfair Display',
    mono: 'Roboto Mono'
  };
  document.documentElement.style.setProperty('--font', f[e.target.value]);
};
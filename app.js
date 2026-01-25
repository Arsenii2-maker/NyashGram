const themeSelect = document.getElementById('themeSelect');
const fontSelect = document.getElementById('fontSelect');
const body = document.body;

/* ===== LOAD SETTINGS ===== */
const savedTheme = localStorage.getItem('theme');
const savedFont = localStorage.getItem('font');

if (savedTheme) {
  body.dataset.theme = savedTheme;
  themeSelect.value = savedTheme;
}

if (savedFont) {
  body.dataset.font = savedFont;
  fontSelect.value = savedFont;
}

/* ===== CHANGE THEME ===== */
themeSelect.addEventListener('change', () => {
  body.dataset.theme = themeSelect.value;
  localStorage.setItem('theme', themeSelect.value);
});

/* ===== CHANGE FONT ===== */
fontSelect.addEventListener('change', () => {
  body.dataset.font = fontSelect.value;
  localStorage.setItem('font', fontSelect.value);
});
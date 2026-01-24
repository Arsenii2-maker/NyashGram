// ===== DEVICE DETECTION =====
function detectDevice() {
  const isMobile = window.innerWidth <= 768;
  document.body.dataset.device = isMobile ? "mobile" : "desktop";
}
 
window.addEventListener("resize", detectDevice);
detectDevice();

// ===== THEMES =====
const themes = ["theme-dark", "theme-light", "theme-neon", "theme-cyber"];
let currentTheme = 0;

function nextTheme() {
  document.body.classList.remove(...themes);
  currentTheme = (currentTheme + 1) % themes.length;
  document.body.classList.add(themes[currentTheme]);
}

// ===== FONTS =====
const fonts = ["font-system", "font-mono", "font-rounded", "font-future"];
let currentFont = 0;

function nextFont() {
  document.body.classList.remove(...fonts);
  currentFont = (currentFont + 1) % fonts.length;
  document.body.classList.add(fonts[currentFont]);
}

// ===== SETTINGS SHORTCUTS (TEMP) =====
document.addEventListener("keydown", e => {
  if (e.key === "t") nextTheme();
  if (e.key === "f") nextFont();
});
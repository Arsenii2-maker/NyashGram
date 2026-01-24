function switchScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goBack() {
  switchScreen("contacts-screen");
}

function openSettings() {
  switchScreen("settings-screen");
}

function saveSettings() {
  const theme = document.getElementById("themeSetting").value;

  if (theme === "night") {
    document.documentElement.style.setProperty("--bg", "#1e1b2e");
    document.documentElement.style.setProperty("--card", "#2b2740");
    document.documentElement.style.setProperty("--text", "#f5e9ff");
  }

  if (theme === "cozy") {
    document.documentElement.style.setProperty("--bg", "#fff5f8");
    document.documentElement.style.setProperty("--card", "#ffe4ec");
    document.documentElement.style.setProperty("--text", "#4a2c38");
  }

  goBack();
}
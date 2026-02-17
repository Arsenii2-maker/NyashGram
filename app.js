// app.js — минимальный, без Firebase, только переключение экранов и сохранение входа

// Функция переключения экранов (если у тебя нет в index.html)
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
}

// Проверяем, был ли уже вход
if (localStorage.getItem("nyashgram_entered") === "true") {
  showScreen("contactsScreen");
  // Вызываем рендер контактов сразу (contacts.js должен быть подключен)
  if (typeof renderContacts === "function") {
    renderContacts();
  } else {
    console.warn("renderContacts не найдена — проверь подключение contacts.js");
  }
} else {
  showScreen("phoneScreen");
}

// Обработчики кнопок (если они не в index.html, можно оставить здесь)

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const saveBtn = document.getElementById("saveBtn");

  // Получить код
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      // Генерация кода уже в index.html — просто переключаем экран
      showScreen("codeScreen");
    });
  }

  // Войти (фейковый код)
  if (verifyBtn) {
    verifyBtn.addEventListener("click", () => {
      const codeInput = document.getElementById("codeInput");
      const codeError = document.getElementById("codeError");
      const generatedCode = codeInput?.placeholder?.replace(/\s/g, ""); // берём из placeholder

      if (codeInput.value.trim() === generatedCode) {
        codeError.textContent = "";

        // Сохраняем флаг входа
        localStorage.setItem("nyashgram_entered", "true");

        // Переходим на контакты и рендерим
        showScreen("contactsScreen");
        if (typeof renderContacts === "function") {
          renderContacts();
        }
      } else {
        codeError.textContent = "Неверный код";
      }
    });
  }

  // Сохранить профиль → сразу на контакты
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const name = document.getElementById("displayName")?.value.trim();
      if (!name) {
        alert("Введи имя!");
        return;
      }

      // Можно сохранить имя в localStorage, если нужно
      localStorage.setItem("nyashgram_name", name);

      alert("Профиль сохранён! Добро пожаловать 🩷");
      showScreen("contactsScreen");
      if (typeof renderContacts === "function") {
        renderContacts();
      }
    });
  }
});

console.log("app.js загружен — Firebase удалён, вход сохраняется");
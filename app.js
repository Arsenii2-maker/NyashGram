// app.js — минимальная версия для запуска логина по номеру

// Функция переключения экранов
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = "none";
  });
  const screen = document.getElementById(name + "Screen");
  if (screen) {
    screen.style.display = "flex";
  } else {
    console.error("Экран не найден: " + name);
  }
}

// Ждём загрузки Firebase и проверяем авторизацию
window.addEventListener("load", () => {
  // Даём 1 секунду на инициализацию Firebase (если нужно — увеличь)
  setTimeout(() => {
    if (typeof auth === "undefined" || !auth) {
      console.error("auth не определён! Проверь подключение firebase.js");
      showScreen("phoneLogin"); // показываем на всякий случай
      return;
    }

    auth.onAuthStateChanged((user) => {
      if (user) {
        // Пользователь авторизован
        localStorage.setItem("userPhone", user.phoneNumber);
        localStorage.setItem("userUid", user.uid);

        // Проверяем профиль
        db.collection("users").doc(user.uid).get().then(doc => {
          if (doc.exists) {
            showScreen("contacts");
            if (typeof renderContacts === "function") {
              renderContacts();
            }
          } else {
            showScreen("profile");
          }
        }).catch(err => {
          console.error("Ошибка проверки профиля:", err);
          showScreen("profile");
        });
      } else {
        // Не авторизован — экран номера
        showScreen("phoneLogin");
      }
    });
  }, 1000); // небольшая задержка для подгрузки Firebase
});

// Остальные функции (настройки, чат и т.д.) можно добавить позже
console.log("app.js загружен");
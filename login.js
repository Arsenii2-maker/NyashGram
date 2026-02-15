// login.js

let confirmationResult = null;

// Функция показа экрана логина
function showLogin() {
  const loginScreen = document.getElementById("phoneLoginScreen");
  if (loginScreen) {
    loginScreen.style.display = "flex";
  }

  // Скрываем другие экраны (если нужно)
  const otherScreens = document.querySelectorAll('.screen:not(#phoneLoginScreen)');
  otherScreens.forEach(s => s.style.display = "none");
}

// Кнопка "Получить код"
const sendCodeBtn = document.getElementById("sendCodeBtn");
if (sendCodeBtn) {
  sendCodeBtn.addEventListener("click", async () => {
    const country = document.getElementById("countryCode")?.value;
    const phone = document.getElementById("phoneInput")?.value.trim();

    if (!country || !phone) {
      return alert("Выберите код страны и введите номер!");
    }

    const fullPhone = country + phone.replace(/\D/g, ""); // чистим номер от пробелов и символов

    try {
      const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible'
      });

      confirmationResult = await auth.signInWithPhoneNumber(fullPhone, appVerifier);
      document.getElementById("codeSection").style.display = "block";
      sendCodeBtn.disabled = true;
      alert("Код отправлен! Проверь SMS.");
    } catch (err) {
      alert("Ошибка отправки кода: " + err.message);
      console.error("Ошибка signInWithPhoneNumber:", err);
    }
  });
}

// Кнопка "Войти"
const verifyCodeBtn = document.getElementById("verifyCodeBtn");
if (verifyCodeBtn) {
  verifyCodeBtn.addEventListener("click", async () => {
    const code = document.getElementById("codeInput")?.value.trim();

    if (!code || code.length !== 6) {
      return alert("Введите 6-значный код из SMS!");
    }

    try {
      const credential = await confirmationResult.confirm(code);
      const user = credential.user;

      localStorage.setItem("userPhone", user.phoneNumber);
      localStorage.setItem("userUid", user.uid);

      alert("Вход успешен! UID: " + user.uid);
      window.location.href = "profile.html"; // или showScreen("profile")
    } catch (err) {
      alert("Неверный код или ошибка: " + err.message);
      console.error("Ошибка confirm:", err);
    }
  });
}

// При запуске проверяем, авторизован ли пользователь
window.addEventListener("load", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      localStorage.setItem("userPhone", user.phoneNumber);
      localStorage.setItem("userUid", user.uid);
      showScreen("contacts"); // или "main"
      // Можно добавить renderContacts() если нужно
    } else {
      showLogin();
    }
  });
});
// В начале файла
let confirmationResult = null;

// Функция показа экрана
function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  // остальные экраны скрыть
}

// Кнопка "Получить код"
document.getElementById("sendCode").addEventListener("click", async () => {
  const country = document.getElementById("countryCode").value;
  const phone = document.getElementById("phoneInput").value.trim();
  if (!phone) return alert("Введите номер!");

  const fullPhone = country + phone;

  try {
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible'
    });

    confirmationResult = await firebase.auth().signInWithPhoneNumber(fullPhone, appVerifier);
    document.getElementById("codeBox").style.display = "block";
    document.getElementById("sendCode").disabled = true;
    alert("Код отправлен!");
  } catch (err) {
    alert("Ошибка: " + err.message);
  }
});

// Кнопка "Войти"
document.getElementById("verifyCode").addEventListener("click", async () => {
  const code = document.getElementById("codeInput").value.trim();
  if (!code || code.length !== 6) return alert("Введите 6-значный код");

  try {
    const credential = await confirmationResult.confirm(code);
    const user = credential.user;

    // Сохраняем, что пользователь авторизован
    localStorage.setItem("userPhone", user.phoneNumber);
    localStorage.setItem("userUid", user.uid);

    // Переходим на экран профиля (создадим позже)
    window.location.href = "profile.html";
  } catch (err) {
    alert("Неверный код: " + err.message);
  }
});

// При запуске приложения
window.addEventListener("load", () => {
  if (localStorage.getItem("userPhone")) {
    showScreen("main"); // главный экран
  } else {
    showLogin();
  }
});
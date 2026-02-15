// app.js

// Экраны
const screens = {
  phoneLogin: document.getElementById("phoneLoginScreen"),
  profile: document.getElementById("profileScreen"), // создадим позже
  contacts: document.getElementById("contactsScreen"),
  chat: document.getElementById("chatScreen"),
  settings: document.getElementById("settingsScreen")
};

function showScreen(name) {
  Object.values(screens).forEach(s => {
    if (s) s.style.display = "none";
  });
  if (screens[name]) screens[name].style.display = "flex";
}

// При запуске — проверяем авторизацию
auth.onAuthStateChanged((user) => {
  if (user) {
    localStorage.setItem("userPhone", user.phoneNumber);
    localStorage.setItem("userUid", user.uid);

    // Проверяем, есть ли профиль
    db.collection("users").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        showScreen("contacts");
        renderContacts(); // твоя функция из contacts.js
      } else {
        showScreen("profile"); // экран имени и аватарки
      }
    }).catch(err => {
      console.error(err);
      showScreen("profile");
    });
  } else {
    showScreen("phoneLogin");
  }
});

// Логика номера и кода
const sendCodeBtn = document.getElementById("sendCodeBtn");
if (sendCodeBtn) {
  sendCodeBtn.addEventListener("click", async () => {
    const country = document.getElementById("countryCode").value;
    const phone = document.getElementById("phoneInput").value.trim().replace(/\D/g, "");
    if (!phone) return alert("Введите номер!");

    const fullPhone = country + phone;

    try {
      const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible'
      });

      const result = await auth.signInWithPhoneNumber(fullPhone, appVerifier);
      window.confirmationResult = result; // сохраняем глобально для verify
      document.getElementById("codeSection").style.display = "block";
      sendCodeBtn.disabled = true;
      alert("Код отправлен!");
    } catch (err) {
      alert("Ошибка: " + err.message);
      console.error(err);
    }
  });
}

const verifyCodeBtn = document.getElementById("verifyCodeBtn");
if (verifyCodeBtn) {
  verifyCodeBtn.addEventListener("click", async () => {
    const code = document.getElementById("codeInput").value.trim();
    if (!code || code.length !== 6) return alert("Код — 6 цифр");

    try {
      const credential = await window.confirmationResult.confirm(code);
      const user = credential.user;

      localStorage.setItem("userPhone", user.phoneNumber);
      localStorage.setItem("userUid", user.uid);

      showScreen("profile");
    } catch (err) {
      alert("Неверный код: " + err.message);
      console.error(err);
    }
  });
}

// Логика профиля (если экран есть)
const saveProfileBtn = document.getElementById("saveProfileBtn");
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", async () => {
    const name = document.getElementById("displayName").value.trim();
    if (!name) return alert("Введи имя!");

    const user = auth.currentUser;
    const file = document.getElementById("avatarInput")?.files[0];
    let avatarUrl = "";

    if (file) {
      const ref = storage.ref(`avatars/${user.uid}`);
      await ref.put(file);
      avatarUrl = await ref.getDownloadURL();
    }

    await db.collection("users").doc(user.uid).set({
      phone: user.phoneNumber,
      name,
      avatar: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff9acb&color=fff`,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    alert("Профиль сохранён!");
    showScreen("contacts");
    renderContacts();
  });
}

// Остальные функции (чат, настройки и т.д.) оставляем как были
// ...

console.log("app.js загружен и готов");
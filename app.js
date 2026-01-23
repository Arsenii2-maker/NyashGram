const startBtn = document.getElementById("startBtn");
const nicknameInput = document.getElementById("nicknameInput");

const screenNick = document.getElementById("screen-nick");
const screenChats = document.getElementById("screen-chats");

startBtn.addEventListener("click", () => {
  const nick = nicknameInput.value.trim();

  if (nick.length < 2) {
    alert("Ник слишком короткий ✨");
    return;
  }

  localStorage.setItem("nyash_nick", nick);

  screenNick.classList.remove("active");
  screenChats.classList.add("active");
});
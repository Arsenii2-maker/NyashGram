let currentRoom = "bestie";
let user = localStorage.getItem("nyash_user");

const rooms = {
  bestie: [],
  philosopher: []
};

window.onload = () => {
  if (user) {
    startApp();
  }
};

function awake() {
  const input = document.getElementById("nickname");
  const name = input.value.trim();
  if (!name) return;

  user = name.startsWith("@") ? name : "@" + name;
  localStorage.setItem("nyash_user", user);
  startApp();
}

function startApp() {
  document.getElementById("awakening").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("userTag").textContent = user;
  renderWhispers();
}

function switchRoom(room) {
  currentRoom = room;
  document.getElementById("roomTitle").textContent = "#" + room + " ✨";
  renderWhispers();
}

function sendWhisper() {
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  rooms[currentRoom].push({
    from: user,
    text
  });

  input.value = "";
  renderWhispers();
}

function renderWhispers() {
  const container = document.getElementById("whispers");
  container.innerHTML = "";

  rooms[currentRoom].forEach(msg => {
    const div = document.createElement("div");
    div.className = "whisper outgoing";
    div.textContent = msg.from + ": " + msg.text;
    container.appendChild(div);
  });

  container.scrollTop = container.scrollHeight;
}

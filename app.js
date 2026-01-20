function sendWhisper() {
  const input = document.getElementById("input");
  const text = input.value.trim();

  if (!text) return;

  const whispers = document.getElementById("whispers");

  const msg = document.createElement("div");
  msg.className = "whisper outgoing";
  msg.textContent = text;

  whispers.appendChild(msg);
  input.value = "";

  whispers.scrollTop = whispers.scrollHeight;
}

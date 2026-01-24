let current;

function openChat(c) {
  current = c;
  document.getElementById('chat-name').textContent = c.name;
  document.getElementById('chat-status').textContent = c.status;
  document.getElementById('messages').innerHTML = '';
  document.getElementById('start-panel').style.display = 'block';
  show('chat-screen');
}

document.getElementById('back-btn').onclick = () => show('contacts-screen');

document.getElementById('send-btn').onclick = send;

function send(text) {
  const input = document.getElementById('message-input');
  const msg = text || input.value;
  if (!msg) return;

  document.getElementById('start-panel').style.display = 'none';

  const div = document.createElement('div');
  div.className = 'message me';
  div.textContent = msg;
  document.getElementById('messages').appendChild(div);

  input.value = '';
}

document.querySelectorAll('.quick').forEach(b => {
  b.onclick = () => send(b.textContent);
});
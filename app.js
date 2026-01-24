document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const chatScreen = document.getElementById('chat-screen');

  const loginBtn = document.getElementById('login-btn');
  const usernameInput = document.getElementById('username-input');

  const sendBtn = document.getElementById('send-btn');
  const messageInput = document.getElementById('message-input');
  const messages = document.getElementById('messages');

  loginBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (!name) return;

    loginScreen.classList.remove('active');
    chatScreen.classList.add('active');
    chatScreen.style.display = 'flex';
  });

  sendBtn.addEventListener('click', sendMessage);

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const msg = document.createElement('div');
    msg.className = 'message';
    msg.textContent = text;

    messages.appendChild(msg);
    messageInput.value = '';
    messages.scrollTop = messages.scrollHeight;
  }
});
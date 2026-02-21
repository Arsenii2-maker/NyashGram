// contacts.js — КОНТАКТЫ

const contacts = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp', type: 'bot' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk', type: 'bot' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame', type: 'bot' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope', type: 'bot' }
];

function renderContacts() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  contacts.forEach(contact => {
    const el = document.createElement('div');
    el.className = 'contact';
    el.innerHTML = `
      <div class="avatar"></div>
      <div>
        <div class="name">${contact.name}</div>
        <div class="username">@${contact.username}</div>
      </div>
    `;
    
    el.onclick = () => window.openBotChat(contact.id);
    list.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', renderContacts);
// contacts.js — ПРОСТАЯ РАБОЧАЯ ВЕРСИЯ

const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope' },
  { id: 'nyashcook', name: 'NyashCook', username: 'nyashcook' }
];

let customNames = JSON.parse(localStorage.getItem('nyashgram_custom_names') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');

function renderContacts() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'chats';
  
  if (activeTab === 'chats') {
    // Боты
    const botsHeader = document.createElement('div');
    botsHeader.className = 'section-header';
    botsHeader.textContent = '🤖 няш-боты';
    list.appendChild(botsHeader);
    
    botUsers.forEach(bot => {
      const displayName = customNames[bot.id] || bot.name;
      const isPinned = pinnedChats.includes(bot.id);
      const el = document.createElement('div');
      el.className = `contact bot-section ${isPinned ? 'pinned' : ''}`;
      
      let gradient;
      switch(bot.id) {
        case 'nyashhelp': gradient = 'linear-gradient(135deg, #c38ef0, #e0b0ff)'; break;
        case 'nyashtalk': gradient = 'linear-gradient(135deg, #85d1c5, #b0e0d5)'; break;
        case 'nyashgame': gradient = 'linear-gradient(135deg, #ffb347, #ff8c42)'; break;
        case 'nyashhoroscope': gradient = 'linear-gradient(135deg, #9b59b6, #8e44ad)'; break;
        case 'nyashcook': gradient = 'linear-gradient(135deg, #ff9a9e, #fad0c4)'; break;
      }
      
      el.innerHTML = `
        <div class="avatar" style="background: ${gradient};"></div>
        <div class="info">
          <div class="name">${displayName} ${isPinned ? '📌' : ''}</div>
          <div class="username">@${bot.username}</div>
        </div>
      `;
      
      el.onclick = () => {
        if (typeof window.openBotChat === 'function') {
          window.openBotChat(bot);
        }
      };
      
      list.appendChild(el);
    });
  } else {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state';
    emptyEl.innerHTML = `
      <div class="empty-icon">${activeTab === 'friends' ? '👥' : '📨'}</div>
      <h3>тут пока пусто</h3>
      <p>скоро будет ✨</p>
    `;
    list.appendChild(emptyEl);
  }
}

// Вкладки
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderContacts();
  });
});

document.addEventListener('DOMContentLoaded', renderContacts);
window.renderContacts = renderContacts;
// contacts.js — ТОЛЬКО БОТЫ

const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope' }
];

let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');

function updateDraft(contactId, text) {
  if (text && text.trim()) {
    chatDrafts[contactId] = text;
  } else {
    delete chatDrafts[contactId];
  }
  localStorage.setItem('nyashgram_chat_drafts', JSON.stringify(chatDrafts));
  renderContacts();
}

function getDraft(contactId) {
  return chatDrafts[contactId] || '';
}

function renderContacts() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'chats';
  
  if (activeTab === 'chats') {
    // Только боты
    botUsers.forEach(bot => {
      const draft = getDraft(bot.id);
      const el = document.createElement('div');
      el.className = 'contact bot-section';
      
      let gradient;
      if (bot.id === 'nyashhelp') gradient = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
      if (bot.id === 'nyashtalk') gradient = 'linear-gradient(135deg, #85d1c5, #b0e0d5)';
      if (bot.id === 'nyashgame') gradient = 'linear-gradient(135deg, #ffb347, #ff8c42)';
      if (bot.id === 'nyashhoroscope') gradient = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
      
      el.innerHTML = `
        <div class="avatar" style="background: ${gradient};"></div>
        <div class="info">
          <div class="name">${bot.name}</div>
          <div class="username">@${bot.username}</div>
          ${draft ? `<div class="draft">📝 ${draft.slice(0, 20)}...</div>` : ''}
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
    // Пустые состояния для друзей и заявок
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state';
    emptyEl.style.textAlign = 'center';
    emptyEl.style.padding = '40px';
    emptyEl.style.opacity = '0.7';
    
    if (activeTab === 'friends') {
      emptyEl.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">👥</div>
        <h3>тут будут друзья</h3>
        <p>скоро добавим ✨</p>
      `;
    } else {
      emptyEl.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">📨</div>
        <h3>тут будут заявки</h3>
        <p>скоро добавим ✨</p>
      `;
    }
    
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
window.updateDraft = updateDraft;
window.getDraft = getDraft;

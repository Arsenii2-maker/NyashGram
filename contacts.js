// contacts.js — КОНТАКТЫ С ЧЕРНОВИКАМИ

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
  
  // Боты
  const botsHeader = document.createElement('div');
  botsHeader.className = 'section-header';
  botsHeader.textContent = '🤖 няш-боты';
  list.appendChild(botsHeader);
  
  botUsers.forEach(bot => {
    const draft = getDraft(bot.id);
    const el = document.createElement('div');
    el.className = 'contact bot-section';
    el.setAttribute('data-id', bot.id);
    
    let gradient;
    switch(bot.id) {
      case 'nyashhelp':
        gradient = 'linear-gradient(135deg, #c38ef0, #e0b0ff)';
        break;
      case 'nyashtalk':
        gradient = 'linear-gradient(135deg, #85d1c5, #b0e0d5)';
        break;
      case 'nyashgame':
        gradient = 'linear-gradient(135deg, #ffb347, #ff8c42)';
        break;
      case 'nyashhoroscope':
        gradient = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
        break;
    }
    
    el.innerHTML = `
      <div class="avatar" style="background: ${gradient}; background-size: cover;"></div>
      <div class="info">
        <div class="name">${bot.name}</div>
        <div class="username">@${bot.username}</div>
        ${draft ? `<div class="draft">📝 ${draft.slice(0, 25)}${draft.length > 25 ? '...' : ''}</div>` : ''}
      </div>
    `;
    
    el.onclick = () => {
      if (typeof window.openBotChat === 'function') {
        window.openBotChat(bot);
      }
    };
    
    list.appendChild(el);
  });
  
  // Друзья (заглушка)
  const friendsHeader = document.createElement('div');
  friendsHeader.className = 'section-header';
  friendsHeader.textContent = '👥 друзья';
  list.appendChild(friendsHeader);
  
  const emptyEl = document.createElement('div');
  emptyEl.className = 'empty-state';
  emptyEl.innerHTML = `
    <div class="empty-icon">👥</div>
    <p>найди друзей по юзернейму</p>
    <button id="findFriendsBtn" class="small-btn">🔍 найти</button>
  `;
  list.appendChild(emptyEl);
  
  setTimeout(() => {
    document.getElementById('findFriendsBtn')?.addEventListener('click', () => {
      alert('поиск друзей скоро будет!');
    });
  }, 100);
}

window.renderContacts = renderContacts;
window.updateDraft = updateDraft;
window.getDraft = getDraft;

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('friendsScreen')?.classList.contains('active')) {
    renderContacts();
  }
});

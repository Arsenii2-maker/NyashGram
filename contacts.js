// contacts.js — ТОЛЬКО БОТЫ (5 ШТУК)

const botUsers = [
  { id: 'nyashhelp', name: 'NyashHelp', username: 'nyashhelp' },
  { id: 'nyashtalk', name: 'NyashTalk', username: 'nyashtalk' },
  { id: 'nyashgame', name: 'NyashGame', username: 'nyashgame' },
  { id: 'nyashhoroscope', name: 'NyashHoroscope', username: 'nyashhoroscope' },
  { id: 'nyashcook', name: 'NyashCook', username: 'nyashcook' } // НОВЫЙ БОТ ПОВАР
];

let chatDrafts = JSON.parse(localStorage.getItem('nyashgram_chat_drafts') || '{}');
let pinnedChats = JSON.parse(localStorage.getItem('nyashgram_pinned_chats') || '[]');

// ===== ЧЕРНОВИКИ =====
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

// ===== ЗАКРЕПЛЕНИЕ =====
function isPinned(chatId) {
  return pinnedChats.includes(chatId);
}

// ===== ОТРИСОВКА =====
function renderContacts() {
  const list = document.getElementById('friendsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  // Только боты, никаких друзей!
  const botsHeader = document.createElement('div');
  botsHeader.className = 'section-header';
  botsHeader.textContent = '🤖 няш-боты';
  list.appendChild(botsHeader);
  
  // Сортируем ботов: закреплённые сверху
  const sortedBots = [...botUsers].sort((a, b) => {
    const aPinned = isPinned(a.id) ? 1 : 0;
    const bPinned = isPinned(b.id) ? 1 : 0;
    return bPinned - aPinned;
  });
  
  sortedBots.forEach(bot => {
    const draft = getDraft(bot.id);
    const el = document.createElement('div');
    el.className = `contact bot-section ${isPinned(bot.id) ? 'pinned' : ''}`;
    
    // Градиенты для ботов
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
      case 'nyashcook':
        gradient = 'linear-gradient(135deg, #ff9a9e, #fad0c4)'; // Нежный персиково-розовый
        break;
      default:
        gradient = 'linear-gradient(135deg, #fbc2c2, #c2b9f0)';
    }
    
    el.innerHTML = `
      <div class="avatar" style="background: ${gradient}; background-size: cover;"></div>
      <div class="info">
        <div class="name">${bot.name} ${isPinned(bot.id) ? '<span class="pin-icon">📌</span>' : ''}</div>
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
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('friendsScreen')?.classList.contains('active')) {
    renderContacts();
  }
});

// ===== ЭКСПОРТ =====
window.renderContacts = renderContacts;
window.updateDraft = updateDraft;
window.getDraft = getDraft;


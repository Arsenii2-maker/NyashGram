const contacts = [
  { name: 'Мия', status: 'online' },
  { name: 'Луна', status: 'offline' }
];

const list = document.getElementById('contacts-list');

contacts.forEach(c => {
  const div = document.createElement('div');
  div.className = 'contact';
  div.innerHTML = `<strong>${c.name}</strong><span>${c.status}</span>`;
  div.onclick = () => openChat(c);
  list.appendChild(div);
});
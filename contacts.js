const contacts = [
  { name: 'Alex', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: 'Mia', avatar: 'https://i.pravatar.cc/100?img=32' },
  { name: 'Luna', avatar: 'https://i.pravatar.cc/100?img=47' }
];

function renderContacts() {
  contactsList.innerHTML = '';
  contacts.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contact';
    div.innerHTML = `<img class="avatar" src="${c.avatar}"><span>${c.name}</span>`;
    div.onclick = () => openChat(c);
    contactsList.appendChild(div);
  });
}
const contacts = ['Alex', 'Mia', 'Luna'];

function renderContacts() {
  const list = document.getElementById('contactsList');
  list.innerHTML = '';
  contacts.forEach(c => {
    const div = document.createElement('div');
    div.textContent = c;
    div.onclick = () => openChat(c);
    list.appendChild(div);
  });
}
const contacts = [
  {
    id: 1,
    name: "Alex",
    avatar: "🙂"
  },
  {
    id: 2,
    name: "Mira",
    avatar: "🌸"
  },
  {
    id: 3,
    name: "Noah",
    avatar: "🌀"
  }
];

const contactsContainer = document.querySelector(".contacts");
let activeContact = null;

function renderContacts() {
  contactsContainer.innerHTML = "";

  contacts.forEach(contact => {
    const div = document.createElement("div");
    div.className = "contact";
    div.textContent = `${contact.avatar} ${contact.name}`;

    div.onclick = () => {
      openChat(contact);
    };

    contactsContainer.appendChild(div);
  });
}

renderContacts();
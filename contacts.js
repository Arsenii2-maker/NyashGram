const contacts = [
  { name: "Luna 💗", avatar: "https://i.pravatar.cc/100?img=5" },
  { name: "Miko 🌸", avatar: "https://i.pravatar.cc/100?img=12" }
];

const contactsList = document.getElementById("contacts-list");

contacts.forEach(c => {
  const div = document.createElement("div");
  div.className = "contact";
  div.textContent = c.name;
  div.onclick = () => openChat(c);
  contactsList.appendChild(div);
});
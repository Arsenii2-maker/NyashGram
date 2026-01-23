const screens = {
  nick: document.getElementById('screen-nickname'),
  chats: document.getElementById('screen-chats'),
  chat: document.getElementById('screen-chat')
}

let myName = localStorage.getItem('myName')
let currentChat = null

function show(screen) {
  Object.values(screens).forEach(s => s.classList.remove('active'))
  screens[screen].classList.add('active')
}

if (myName) show('chats')

document.getElementById('saveNickname').onclick = () => {
  myName = document.getElementById('nicknameInput').value.trim()
  if (!myName) return
  localStorage.setItem('myName', myName)
  show('chats')
}

document.querySelectorAll('.chat-item').forEach(item => {
  item.onclick = () => {
    currentChat = item.dataset.name
    document.getElementById('chatName').innerText = currentChat
    document.getElementById('chatAvatar').src =
      `https://api.dicebear.com/7.x/identicon/svg?seed=${currentChat}`
    document.getElementById('messages').innerHTML = ''
    show('chat')
  }
})

document.getElementById('backBtn').onclick = () => show('chats')

document.getElementById('sendBtn').onclick = send
document.getElementById('messageInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') send()
})

function send() {
  const input = document.getElementById('messageInput')
  if (!input.value.trim()) return

  const msg = document.createElement('div')
  msg.className = 'message me'
  msg.innerText = input.value
  document.getElementById('messages').appendChild(msg)

  input.value = ''
}
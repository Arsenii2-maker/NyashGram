window.chats = {
  1: [],
  2: [],
  3: []
};

function sendMessage(chatId, text, fromMe = true) {
  window.chats[chatId].push({ text, fromMe });
}
import { auth, onAuthStateChanged, getUserData, sendMessage, listenMessages } from './firebase.js';

const usernameField = document.getElementById('usernameField');
const messagesList = document.getElementById('messagesList');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let currentUser = null;
let userData = null;

onAuthStateChanged(auth, async user => {
  if (!user) { window.location.href = 'login.html'; return; }
  currentUser = user;
  usernameField.textContent = user.displayName ?? 'Player';
  userData = await getUserData(user.uid, user.displayName);
});

// realtime listener
listenMessages((msgs) => {
  messagesList.innerHTML = '';
  msgs.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
    messagesList.appendChild(div);
  });
  messagesList.scrollTop = messagesList.scrollHeight;
});

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;
  await sendMessage(currentUser.uid, currentUser.displayName || userData.username, text);
  messageInput.value = '';
});

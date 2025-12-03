import { auth, db, collection, addDoc, onSnapshot, query, orderBy, onAuthStateChanged, doc, updateDoc, increment } from './firebase.js';

const messagesList = document.getElementById('messagesList');
const chatForm = document.getElementById('chatForm');
let currentUserRef;

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUserRef = doc(db, 'users', user.uid);

  // Load chat messages in real-time
  const q = query(collection(db, 'chat'), orderBy('timestamp'));
  onSnapshot(q, snapshot => {
    messagesList.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
      messagesList.appendChild(div);
    });
  });
});

chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const text = chatForm.message.value;
  if (!text) return;

  // Add chat message
  await addDoc(collection(db, 'chat'), {
    username: auth.currentUser.email,
    text: text,
    timestamp: new Date()
  });

  // Increment messagesSent stat
  await updateDoc(currentUserRef, { messagesSent: increment(1) });

  chatForm.message.value = '';
});

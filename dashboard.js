import { auth, onAuthStateChanged, getUserData, db, doc, onSnapshot } from './firebase.js';

const usernameField = document.getElementById('usernameField');
const rankField = document.getElementById('rankField');
const tokensField = document.getElementById('tokens');
const goldsField = document.getElementById('goldsUnlocked');
const packsField = document.getElementById('packsOpened');
const messagesField = document.getElementById('messagesSent');
const friendsList = document.getElementById('friendsList');

onAuthStateChanged(auth, async (user) => {
  if (!user) { 
    window.location.href = 'login.html'; 
    return; 
  }

  // First, get initial data using your function
  const data = await getUserData(user.uid, user.displayName);

  usernameField.textContent = data.username || user.displayName || "User";
  rankField.textContent = data.rank || "New Player";
  tokensField.textContent = data.tokens ?? 0;
  goldsField.textContent = data.goldsUnlocked ?? 0;
  packsField.textContent = data.packsOpened ?? 0;
  messagesField.textContent = data.messagesSent ?? 0;

  friendsList.innerHTML = '';
  if (data.friends && data.friends.length) {
    data.friends.forEach(f => {
      const div = document.createElement('div');
      div.className = 'friend-item';
      div.innerHTML = `<div class="friend-pfp"></div><span>${f}</span>`;
      friendsList.appendChild(div);
    });
  } else {
    friendsList.innerHTML = `<p style="color:#7a6534;">You have no friends added yet.</p>`;
  }

  // Then attach a real-time listener to update stats dynamically
  const userRef = doc(db, 'users', user.uid);
  onSnapshot(userRef, (docSnap) => {
    if (!docSnap.exists()) return;
    const liveData = docSnap.data();

    tokensField.textContent = liveData.tokens ?? 0;
    goldsField.textContent = liveData.goldsUnlocked ?? 0;
    packsField.textContent = liveData.packsOpened ?? 0;
    messagesField.textContent = liveData.messagesSent ?? 0;
  });
});

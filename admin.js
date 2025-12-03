import { auth, db, onAuthStateChanged } from './firebase.js';
import { collection, doc, getDocs, setDoc, updateDoc, getDoc } from 'firebase/firestore';

const usersList = document.getElementById('usersList');
const packTokensInput = document.getElementById('packTokens');
const saveSettingsBtn = document.getElementById('saveGameSettings');

// Check admin access
onAuthStateChanged(auth, async user => {
  if (!user) { window.location.href = 'login.html'; return; }

  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) { window.location.href = 'login.html'; return; }

  const data = docSnap.data();
  if (!data.isAdmin) {
    alert('Access denied. Admins only.');
    window.location.href = 'dashboard.html';
    return;
  }

  // Load all users
  const usersSnap = await getDocs(collection(db, 'users'));
  usersList.innerHTML = '';
  usersSnap.forEach(u => {
    const d = u.data();
    const div = document.createElement('div');
    div.className = 'stat-card';
    div.innerHTML = `
      <strong>${d.username || 'User'}</strong><br>
      Tokens: <input type="number" value="${d.tokens ?? 0}" id="tokens-${u.id}"><br>
      Golds: <input type="number" value="${d.goldsUnlocked ?? 0}" id="golds-${u.id}"><br>
      Packs: <input type="number" value="${d.packsOpened ?? 0}" id="packs-${u.id}"><br>
      Messages: <input type="number" value="${d.messagesSent ?? 0}" id="messages-${u.id}"><br>
      <button onclick="saveUser('${u.id}')">Save</button>
    `;
    usersList.appendChild(div);
  });
});

// Save individual user
window.saveUser = async (uid) => {
  const tokens = Number(document.getElementById(`tokens-${uid}`).value);
  const golds = Number(document.getElementById(`golds-${uid}`).value);
  const packs = Number(document.getElementById(`packs-${uid}`).value);
  const messages = Number(document.getElementById(`messages-${uid}`).value);

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { tokens, goldsUnlocked: golds, packsOpened: packs, messagesSent: messages });
  alert('User updated!');
};

// Example: Save game settings
saveSettingsBtn.addEventListener('click', async () => {
  const tokens = Number(packTokensInput.value);
  if (!tokens) return alert('Enter a value');

  const settingsRef = doc(db, 'gameSettings', 'default');
  await setDoc(settingsRef, { packTokens: tokens });
  alert('Game settings updated!');
});

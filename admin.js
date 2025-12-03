import { auth, db, onAuthStateChanged } from './firebase.js';
import { collection, doc, getDocs, updateDoc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const usersList = document.getElementById('usersList');
const packTokensInput = document.getElementById('packTokens');
const saveSettingsBtn = document.getElementById('saveGameSettings');

let userRef;

// Check admin access
onAuthStateChanged(auth, async user => {
  if (!user) { window.location.href = 'login.html'; return; }

  userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists() || !docSnap.data().isAdmin) {
    alert('Access denied. Admins only.');
    window.location.href = 'dashboard.html';
    return;
  }

  loadUsers();
  loadGameSettings();
});

// Load all users with editable stats
async function loadUsers() {
  const usersSnap = await getDocs(collection(db, 'users'));
  usersList.innerHTML = '';
  usersSnap.forEach(u => {
    const d = u.data();
    const div = document.createElement('div');
    div.className = 'user-card';
    div.innerHTML = `
      <strong>${d.username || 'User'}</strong><br>
      Tokens: <input type="number" value="${d.tokens ?? 0}" id="tokens-${u.id}"><br>
      Golds: <input type="number" value="${d.goldsUnlocked ?? 0}" id="golds-${u.id}"><br>
      Packs: <input type="number" value="${d.packsOpened ?? 0}" id="packs-${u.id}"><br>
      Messages: <input type="number" value="${d.messagesSent ?? 0}" id="messages-${u.id}"><br>
      <button class="btn save" onclick="saveUser('${u.id}')">Save</button>
    `;
    usersList.appendChild(div);
  });
}

// Save individual user
window.saveUser = async (uid) => {
  const tokens = Number(document.getElementById(`tokens-${uid}`).value);
  const golds = Number(document.getElementById(`golds-${uid}`).value);
  const packs = Number(document.getElementById(`packs-${uid}`).value);
  const messages = Number(document.getElementById(`messages-${uid}`).value);

  const uRef = doc(db, 'users', uid);
  await updateDoc(uRef, { tokens, goldsUnlocked: golds, packsOpened: packs, messagesSent: messages });
  alert('User updated!');
}

// Load game settings
async function loadGameSettings() {
  const settingsRef = doc(db, 'gameSettings', 'default');
  onSnapshot(settingsRef, docSnap => {
    if (!docSnap.exists()) return;
    const data = docSnap.data();
    packTokensInput.value = data.packTokens ?? 0;
  });
}

// Save game settings
saveSettingsBtn.addEventListener('click', async () => {
  const tokens = Number(packTokensInput.value);
  if (!tokens) return alert('Enter a value');
  const settingsRef = doc(db, 'gameSettings', 'default');
  await setDoc(settingsRef, { packTokens: tokens });
  alert('Game settings updated!');
});

import { auth, db, onAuthStateChanged, signOut } from './firebase.js';
import { collection, doc, getDocs, getDoc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";

const pendingUsersList = document.getElementById('pendingUsersList');
const usersList = document.getElementById('usersList');
const packTokensInput = document.getElementById('packTokens');
const saveSettingsBtn = document.getElementById('saveGameSettings');
const logoutBtn = document.getElementById('logoutBtn');

let currentUserRef;

// Logout
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

// Check admin access
onAuthStateChanged(auth, async user => {
  if (!user) { window.location.href = 'login.html'; return; }

  currentUserRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(currentUserRef);
  if (!userSnap.exists() || !userSnap.data().isAdmin) {
    alert('Access denied. Admins only.');
    window.location.href = 'dashboard.html';
    return;
  }

  loadPendingUsers();
  loadExistingUsers();
  loadGameSettings();
});

// Pending users
async function loadPendingUsers() {
  const usersSnap = await getDocs(collection(db, 'users'));
  pendingUsersList.innerHTML = '';
  let hasPending = false;

  usersSnap.forEach(u => {
    const d = u.data();
    if (d.approved === false) {
      hasPending = true;
      const div = document.createElement('div');
      div.className = 'user-card';
      div.innerHTML = `
        <strong>${d.username || 'User'}</strong><br>
        Email: ${d.email || 'N/A'}<br>
        <button class="btn save" onclick="approveUser('${u.id}')">Approve</button>
        <button class="btn decline" onclick="declineUser('${u.id}')">Decline</button>
      `;
      pendingUsersList.appendChild(div);
    }
  });

  if (!hasPending) pendingUsersList.innerHTML = `<p style="color:#7a6534;">No pending users</p>`;
}

// Approve/Decline users
window.approveUser = async (uid) => {
  const uRef = doc(db, 'users', uid);
  await updateDoc(uRef, { approved: true });
  loadPendingUsers();
};

window.declineUser = async (uid) => {
  const uRef = doc(db, 'users', uid);
  await updateDoc(uRef, { approved: false }); // could also delete
  loadPendingUsers();
};

// Load and edit existing users
async function loadExistingUsers() {
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

window.saveUser = async (uid) => {
  const tokens = Number(document.getElementById(`tokens-${uid}`).value);
  const golds = Number(document.getElementById(`golds-${uid}`).value);
  const packs = Number(document.getElementById(`packs-${uid}`).value);
  const messages = Number(document.getElementById(`messages-${uid}`).value);

  const uRef = doc(db, 'users', uid);
  await updateDoc(uRef, { tokens, goldsUnlocked: golds, packsOpened: packs, messagesSent: messages });
  alert('User updated!');
};

// Load game settings
function loadGameSettings() {
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

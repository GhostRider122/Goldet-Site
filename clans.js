import { auth, onAuthStateChanged, getUserData } from './firebase.js';

const usernameField = document.getElementById('usernameField');
const clansList = document.getElementById('clansList');

onAuthStateChanged(auth, async user => {
  if (!user) { window.location.href='login.html'; return; }
  usernameField.textContent = user.displayName ?? 'Player';
  const data = await getUserData(user.uid, user.displayName);
  renderClans(data.clans || []);
});

function renderClans(clans) {
  clansList.innerHTML = '';
  if (!clans.length) {
    clansList.innerHTML = "<p style='color:#7a6534'>You are not in any clans.</p>";
    return;
  }
  clans.forEach(c => {
    const div = document.createElement('div');
    div.className = 'clan-item';
    div.innerHTML = `<strong>${c}</strong>`;
    clansList.appendChild(div);
  });
}

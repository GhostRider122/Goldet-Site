import { auth, onAuthStateChanged, fetchUsers } from './firebase.js';

const usernameField = document.getElementById('usernameField');
const leaderboardList = document.getElementById('leaderboardList');

onAuthStateChanged(auth, async user => {
  if (!user) window.location.href = 'login.html';
  usernameField.textContent = user.displayName ?? 'Player';
  const users = await fetchUsers();
  users.sort((a,b) => (b.tokens||0) - (a.tokens||0));
  leaderboardList.innerHTML = '';
  users.forEach((u,i) => {
    const div = document.createElement('div');
    div.className = 'leader-item';
    div.innerHTML = `<strong>#${i+1} ${u.username}</strong><span>Tokens: ${u.tokens ?? 0}</span>`;
    leaderboardList.appendChild(div);
  });
});

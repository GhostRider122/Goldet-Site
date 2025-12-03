import { auth, onAuthStateChanged, getUserData, updateUserData } from './firebase.js';

const usernameField = document.getElementById('usernameField');
const marketList = document.getElementById('marketList');

let currentUser = null;
let userData = null;

const marketItems = [
  { id: 'goldpack1', name: 'Gold Pack 1', price: 10 },
  { id: 'goldpack2', name: 'Gold Pack 2', price: 25 },
  { id: 'goldpack3', name: 'Gold Pack 3', price: 50 }
];

onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = 'login.html';
  currentUser = user;
  usernameField.textContent = user.displayName ?? 'Player';
  userData = await getUserData(user.uid, user.displayName);
  renderMarket();
});

function renderMarket(){
  marketList.innerHTML = '';
  marketItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'market-item';
    div.innerHTML = `<span>${item.name} - ${item.price} Tokens</span>`;
    const btn = document.createElement('button');
    btn.textContent = 'Buy';
    btn.style.marginLeft = '12px';
    btn.onclick = () => buyItem(item);
    div.appendChild(btn);
    marketList.appendChild(div);
  });
}

async function buyItem(item) {
  if (!userData) return;
  if ((userData.tokens || 0) < item.price) {
    alert('Not enough tokens');
    return;
  }
  const newTokens = (userData.tokens || 0) - item.price;
  const newInventory = userData.inventory ? [...userData.inventory, item] : [item];
  await updateUserData(currentUser.uid, { tokens: newTokens, inventory: newInventory });
  // refresh local copy
  userData.tokens = newTokens;
  userData.inventory = newInventory;
  alert('Purchase complete!');
}

import { auth, onAuthStateChanged, getUserData } from './firebase.js';

const usernameField = document.getElementById('usernameField');
const inventoryList = document.getElementById('inventoryList');
let userData = null;

onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href='login.html';
  usernameField.textContent = user.displayName ?? 'Player';
  userData = await getUserData(user.uid, user.displayName);
  renderInventory();
});

function renderInventory(){
  inventoryList.innerHTML = '';
  if (!userData || !userData.inventory || !userData.inventory.length) {
    inventoryList.innerHTML = "<p style='color:#7a6534'>No items in inventory.</p>";
    return;
  }
  userData.inventory.forEach(item => {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.textContent = item.name || 'Unknown Item';
    inventoryList.appendChild(div);
  });
}

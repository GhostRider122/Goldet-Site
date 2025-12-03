import { auth, db, onAuthStateChanged, doc, onSnapshot } from './firebase.js';

const inventoryContainer = document.getElementById('inventoryContainer');

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const docRef = doc(db, 'users', user.uid);

  // Real-time listener
  onSnapshot(docRef, docSnap => {
    if (!docSnap.exists()) return;
    const data = docSnap.data();
    const goldsUnlocked = data.goldsUnlocked || 0;

    // Clear current inventory
    inventoryContainer.innerHTML = '';

    // Render golds
    for (let i = 1; i <= goldsUnlocked; i++) {
      const goldDiv = document.createElement('div');
      goldDiv.className = 'inventory-gold';
      goldDiv.innerText = `Gold #${i}`;
      inventoryContainer.appendChild(goldDiv);
    }
  });
});

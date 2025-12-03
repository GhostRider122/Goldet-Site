import { signInWithEmailAndPassword, auth, onAuthStateChanged } from './firebase.js';

const form = document.getElementById('loginForm');
const email = document.getElementById('email');
const password = document.getElementById('password');
const errorDiv = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorDiv.textContent = '';
  try {
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value.trim());

    // Check if approved
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists() || !docSnap.data().approved) {
      alert('Your account is not approved yet by an admin.');
      await auth.signOut();
      return;
    }
    window.location.href = 'dashboard.html';
  } catch(err) {
    errorDiv.textContent = err.message;
  }
});

onAuthStateChanged(auth, user => {
  if (user) {
    window.location.href = 'dashboard.html';
  }
});

import { createUserWithEmailAndPassword, updateProfile, auth, onAuthStateChanged, getUserData } from './firebase.js';

const form = document.getElementById('registerForm');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const errorDiv = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorDiv.textContent = '';
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value.trim());
    const user = cred.user;
    await updateProfile(user, { displayName: username.value.trim() });
    // create user document with defaults
    await getUserData(user.uid, username.value.trim());
    window.location.href = 'dashboard.html';
  } catch(err) {
    errorDiv.textContent = err.message;
  }
});

onAuthStateChanged(auth, user => {
  if (user) window.location.href = 'dashboard.html';
});

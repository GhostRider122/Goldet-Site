<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Login | Goldet</title>
<link href="https://fonts.googleapis.com/css2?family=Titan+One&display=swap" rel="stylesheet"/>
<style>
  body{margin:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(135deg,#f4d7a6,#e5b34a);display:flex;align-items:center;justify-content:center;height:100vh;color:#3b2d10}
  .form{background:#db6a00;padding:22px;border-radius:14px;width:100%;max-width:360px;color:white;box-shadow:0 12px 30px rgba(0,0,0,0.12)}
  h1{font-family:'Titan One',cursive;margin:0 0 12px}
  input{width:100%;padding:10px;margin-bottom:12px;border-radius:8px;border:none}
  button{width:100%;padding:12px;border-radius:10px;border:none;background:#fff3e0;color:#a75c00;font-family:'Titan One',cursive;cursor:pointer}
  .error{background:#ff6f6f;padding:10px;border-radius:8px;margin-bottom:12px;display:none}
  .show-pass{display:flex;align-items:center;gap:8px;margin-bottom:10px}
</style>
</head>
<body>
  <form id="loginForm" class="form" autocomplete="off">
    <h1>Goldet Login</h1>
    <div id="error" class="error"></div>
    <input id="username" placeholder="Username" autocomplete="username" />
    <input id="password" type="password" placeholder="Password" autocomplete="current-password" />
    <label class="show-pass"><input type="checkbox" id="togglePass"> Show password</label>
    <button type="submit">Log In</button>
  </form>

<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
<script>
  /***** REPLACE with your Goldet Firebase config *****/
  const firebaseConfig = {
    apiKey: "REPLACE_WITH_YOUR_API_KEY",
    authDomain: "REPLACE_WITH_AUTHDOMAIN",
    databaseURL: "https://REPLACE_WITH_DB.firebaseio.com",
    projectId: "REPLACE_PROJECT_ID",
    storageBucket: "REPLACE_BUCKET",
    messagingSenderId: "REPLACE_SENDER_ID",
    appId: "REPLACE_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('error');
  const toggle = document.getElementById('togglePass');

  toggle.addEventListener('change', () => {
    document.getElementById('password').type = toggle.checked ? 'text' : 'password';
  });

  async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) return showError('Please fill both fields.');

    try {
      const usersRef = db.ref('users/' + username);
      const snap = await usersRef.get();
      if (!snap.exists()) return showError('User not found.');

      const userData = snap.val();
      const hashed = await hashPassword(password);

      if (userData.password !== hashed) return showError('Incorrect password.');

      if (!userData.approved) return showError('Account not approved by an admin.');

      // login success -> save session and redirect
      localStorage.setItem('goldetCurrentUser', username);
      alert('Login successful — redirecting to dashboard');
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error(err);
      showError('Login failed. Try again.');
    }
  });
</script>
</body>
</html>

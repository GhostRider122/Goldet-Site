import { auth, onAuthStateChanged, getUserData, logout } from './firebase.js';

const usernameField = document.getElementById('usernameField');
const rankField = document.getElementById('rankField');
const tokensField = document.getElementById('tokens');
const goldsField = document.getElementById('goldsUnlocked');
const packsField = document.getElementById('packsOpened');
const messagesField = document.getElementById('messagesSent');
const friendsList = document.getElementById('friendsList');

const lookupBtn = document.getElementById('lookupBtn');
const lookupPopup = document.getElementById('lookupPopup');
const lookupInput = document.getElementById('lookupInput');
const lookupSubmit = document.getElementById('lookupSubmit');
const lookupCancel = document.getElementById('lookupCancel');
const lookupError = document.getElementById('lookupError');

let currentUserData = null;   // your stats
let viewingUserUid = null;    // UID of user being looked up

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = 'login.html'; return; }
  const data = await getUserData(user.uid, user.displayName);
  usernameField.textContent = data.username || user.displayName || "User";
  rankField.textContent = data.rank || "New Player";
  tokensField.textContent = data.tokens ?? 0;
  goldsField.textContent = data.goldsUnlocked ?? 0;
  packsField.textContent = data.packsOpened ?? 0;
  messagesField.textContent = data.messagesSent ?? 0;

  // render friends
  friendsList.innerHTML = '';
  if (data.friends && data.friends.length) {
    data.friends.forEach(f => {
      const div = document.createElement('div');
      div.className = 'friend-item';
      div.innerHTML = `<div class="friend-pfp"></div><span>${f}</span>`;
      friendsList.appendChild(div);
    });
  } else {
    friendsList.innerHTML = `<p style="color:#7a6534;">You have no friends added yet.</p>`;
  }
});

// --- Lookup popup ---
lookupBtn.addEventListener('click', () => {
  lookupPopup.style.display = 'flex';
  lookupInput.value = '';
  lookupError.textContent = '';
});

lookupCancel.addEventListener('click', () => {
  lookupPopup.style.display = 'none';
});

// --- Submit lookup ---
lookupSubmit.addEventListener('click', async () => {
  const username = lookupInput.value.trim();
  if (!username) return;

  const usersSnap = await getDocs(collection(db, 'users'));
  let foundUser = null;
  usersSnap.forEach(u => {
    const d = u.data();
    if (d.username === username) foundUser = { uid: u.id, ...d };
  });

  if (!foundUser) {
    lookupError.textContent = 'User not found.';
    return;
  }

  viewingUserUid = foundUser.uid;
  renderStats(foundUser);
  renderLookupButtons();
  lookupPopup.style.display = 'none';
});

// --- Show back + friend buttons when viewing another user ---
function renderLookupButtons() {
  const container = usernameField.parentElement;
  let backBtn = document.getElementById('backStatsBtn');
  let friendBtn = document.getElementById('friendBtn');

  if (!backBtn) {
    backBtn = document.createElement('button');
    backBtn.id = 'backStatsBtn';
    backBtn.textContent = 'Back';
    backBtn.className = 'btn save';
    backBtn.style.marginLeft = '10px';
    backBtn.addEventListener('click', () => {
      renderStats(currentUserData);
      renderFriends(currentUserData);
      backBtn.remove();
      friendBtn.remove();
      viewingUserUid = null;
    });
    container.appendChild(backBtn);
  }

  if (!friendBtn) {
    friendBtn = document.createElement('button');
    friendBtn.id = 'friendBtn';
    friendBtn.textContent = 'Add Friend';
    friendBtn.className = 'btn save';
    friendBtn.style.marginLeft = '6px';
    friendBtn.addEventListener('click', sendFriendRequest);
    container.appendChild(friendBtn);
  }
}

// --- Send friend request ---
async function sendFriendRequest() {
  if (!viewingUserUid) return;
  const targetRef = doc(db, 'users', viewingUserUid);
  await updateDoc(targetRef, {
    friendRequests: arrayUnion(currentUserData.uid)
  });
  alert('Friend request sent!');
}

const friendRequestsList = document.getElementById('friendRequestsList');

function renderFriendRequests(userData) {
  friendRequestsList.innerHTML = '';
  if (userData.friendRequests && userData.friendRequests.length) {
    userData.friendRequests.forEach(async uid => {
      const fSnap = await getDoc(doc(db, 'users', uid));
      if (!fSnap.exists()) return;
      const d = fSnap.data();
      const div = document.createElement('div');
      div.className = 'friend-item';
      div.innerHTML = `<span>${d.username}</span>`;

      const acceptBtn = document.createElement('button');
      acceptBtn.textContent = 'Accept';
      acceptBtn.className = 'btn save';
      acceptBtn.style.marginLeft = '6px';
      acceptBtn.onclick = async () => {
        await updateDoc(doc(db, 'users', userData.uid), {
          friends: arrayUnion(uid),
          friendRequests: arrayRemove(uid)
        });
        await updateDoc(doc(db, 'users', uid), {
          friends: arrayUnion(userData.uid)
        });
        loadUserData(); // reload your stats and friends
      };

      const declineBtn = document.createElement('button');
      declineBtn.textContent = 'Decline';
      declineBtn.className = 'btn decline';
      declineBtn.style.marginLeft = '6px';
      declineBtn.onclick = async () => {
        await updateDoc(doc(db, 'users', userData.uid), {
          friendRequests: arrayRemove(uid)
        });
        loadUserData();
      };

      div.appendChild(acceptBtn);
      div.appendChild(declineBtn);
      friendRequestsList.appendChild(div);
    });
  } else {
    friendRequestsList.innerHTML = `<p style="color:#7a6534;">No pending requests</p>`;
  }
}



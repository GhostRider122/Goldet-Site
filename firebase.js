// firebase.js - generated bundle version
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, query, orderBy, onSnapshot, updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// --- REPLACE THESE VALUES if you want to use a different Firebase project ---
const firebaseConfig = {
  apiKey: "AIzaSyBo8CfnU9e2mt3KVubA3vQvD7nOdR-G7dg",
  authDomain: "goldet-site.firebaseapp.com",
  projectId: "goldet-site",
  storageBucket: "goldet-site.firebasestorage.app",
  messagingSenderId: "797852537240",
  appId: "1:797852537240:web:a5e39272573514f019dbed"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ---------------------------
// User helpers
// ---------------------------
export async function getUserData(uid, username = "User") {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const defaultData = {
      username: username,
      tokens: 0,
      goldsUnlocked: 0,
      packsOpened: 0,
      messagesSent: 0,
      inventory: [],
      clans: [],
      rank: "New Player"
    };
    await setDoc(userRef, defaultData);
    return defaultData;
  }
  return snap.data();
}

export async function updateUserData(uid, fields) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, fields);
}

export async function fetchUsers() {
  const snap = await getDocs(collection(db, "users"));
  const out = [];
  snap.forEach(d => out.push({ id: d.id, ...d.data() }));
  return out;
}

// ---------------------------
// Chat helpers
// ---------------------------
export async function sendMessage(uid, username, text) {
  await addDoc(collection(db, "messages"), {
    uid,
    username,
    text,
    timestamp: Date.now()
  });
}

export function listenMessages(callback) {
  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    const out = [];
    snap.forEach(d => out.push(d.data()));
    callback(out);
  });
}

// ---------------------------
// Auth helpers (exported for pages)
// ---------------------------
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut };
export async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
}

// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEKx_zRsC6r24d-l82MmEKIT1Y92cGc-U",
  authDomain: "nyashgram.firebaseapp.com",
  projectId: "nyashgram",
  storageBucket: "nyashgram.firebasestorage.app",
  messagingSenderId: "590608200225",
  appId: "1:590608200225:web:1b42cd61f7a0a00dbb6960"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
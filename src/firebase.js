import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChOYTAWzfoodQ0YN2DgvfxRB6VYOEWzDk",
  authDomain: "kurashi-recruit.firebaseapp.com",
  projectId: "kurashi-recruit",
  storageBucket: "kurashi-recruit.firebasestorage.app",
  messagingSenderId: "382434586185",
  appId: "1:382434586185:web:e33a9901680e4b17c35998"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

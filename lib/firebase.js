import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // ⬅️ Added this for chat
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAuJmZfUuyeq1YFUR-Ymuoqy4ZJ9Mnxh00",
  authDomain: "tinkerhack-project.firebaseapp.com",
  projectId: "tinkerhack-project",
  storageBucket: "tinkerhack-project.firebasestorage.app",
  messagingSenderId: "476173736903",
  appId: "1:476173736903:web:342c00866fdae7214497e2",
  measurementId: "G-NDFHD50J05"
};

// Initialize Firebase app once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);

// 🔥 Firestore (Used for Space Settings, Users, etc.)
export const db = getFirestore(app);

// 💬 Realtime Database (Used for Live Chat)
// We use 'rtdb' to avoid name conflicts with 'db'
export const rtdb = getDatabase(app);

// 📦 Storage (Used for uploading photos)
export const storage = getStorage(app);
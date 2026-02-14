import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Realtime DB for chat/music sync
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAuJmZfUuyeq1YFUR-Ymuoqy4ZJ9Mnxh00",
  authDomain: "tinkerhack-project.firebaseapp.com",
  databaseURL: "https://tinkerhack-project-default-rtdb.firebaseio.com", // Ensure this is your actual DB URL
  projectId: "tinkerhack-project",
  storageBucket: "tinkerhack-project.firebasestorage.app",
  messagingSenderId: "476173736903",
  appId: "1:476173736903:web:342c00866fdae7214497e2",
  measurementId: "G-NDFHD50J05"
};

// Singleton pattern to prevent re-initialization errors in Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getDatabase(app); // This matches your dashboard import
export const auth = getAuth(app);
export const storage = getStorage(app);


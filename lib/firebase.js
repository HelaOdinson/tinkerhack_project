import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

// Prevent re-initialization in Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);

// 🔥 Firestore (THIS is what your spaces use)
export const db = getFirestore(app);

// 📦 Storage (keep if needed)
export const storage = getStorage(app);

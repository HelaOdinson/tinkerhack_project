import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAuJmZfUuyeq1YFUR-Ymuoqy4ZJ9Mnxh00",
  authDomain: "tinkerhack-project.firebaseapp.com",
  projectId: "tinkerhack-project",
  storageBucket: "tinkerhack-project.firebasestorage.app",
  messagingSenderId: "476173736903",
  appId: "1:476173736903:web:342c00866fdae7214497e2",
  measurementId: "G-NDFHD50J05"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
//const analytics = getAnalytics(app);
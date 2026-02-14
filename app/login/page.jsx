"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // New user → create doc
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          groupId: null,
        });
      }

      const groupId = (userSnap.data() || {}).groupId;
      if (groupId) router.push("/dashboard");
      else router.push("/role");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Try again.");
    }
  };

  useEffect(() => {
    // Auto redirect if already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.push("/dashboard");
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gradient-to-br from-rose-400 to-amber-400 text-white">
      <h1 className="text-3xl font-bold">Welcome Back!</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-rose-400 to-amber-400 hover:from-amber-400 hover:to-rose-400 shadow-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
}
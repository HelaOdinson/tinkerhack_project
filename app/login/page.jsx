"use client";

import { useRouter } from "next/navigation";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          groupId: null,
        });
      }

      const groupId = (userSnap.data() || {}).groupId;
      if (groupId) router.push("/dashboard");
      else router.push("/roles");

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FFFDFB] font-sans">
        <img
            src="/stickers/otter.png"
            alt="Otter"
            className="absolute top-15 left-20 w-20 h-20 animate-bounce"
        />

        <img
            src="/stickers/tulips.png"
            alt="Tulip"
            className="absolute bottom-15 right-240 w-20 h-20 animate-bounce"
        />

      {/* LEFT SIDE - Login */}
      <div className="w-1/2 flex flex-col justify-center items-center px-16">

        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
          Welcome To BeyondMiles!
        </h1>

        <p className="text-gray-600 mb-8 text-center">
          Connect with your people, relive memories, and stay close no matter the miles.
        </p>

        <button
          onClick={handleLogin}
          className="w-full max-w-sm px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-rose-400 to-amber-400 hover:scale-105 transition-transform shadow-lg"
        >
          Sign in with Google
        </button>

        <p className="mt-6 text-gray-500 text-sm">
          New here? Just sign in to get started ✨
        </p>

      </div>

      {/* RIGHT SIDE - Image */}
      <div className="w-1/2 hidden md:block">
        <img
          src="/login.png"
          alt="Login Visual"
          className="h-full w-full object-cover"
        />
      </div>

    </div>
  );
}

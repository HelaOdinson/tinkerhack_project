"use client";

import { useRouter } from "next/navigation";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleGoogleAuth = async () => {
    try {
      // 🔥 Force Google to show account selection every time
      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 🆕 If user does NOT exist → create them
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "",
          spaces: []
        });

        router.push("/roles"); // New user
      } else {
        router.push("/my-spaces"); // Existing user
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FFFDFB] font-sans relative">

      {/* Stickers */}
      <img
        src="/stickers/otter.png"
        alt="Otter"
        className="absolute top-16 left-20 w-20 h-20 animate-bounce"
      />

      <img
        src="/stickers/tulips.png"
        alt="Tulip"
        className="absolute bottom-23 right-210 w-20 h-20 animate-bounce"
      />

      {/* LEFT SIDE */}
      <div className="w-1/2 flex flex-col justify-center items-center px-16">

        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
          Welcome To BeyondMiles!
        </h1>

        <p className="text-gray-600 mb-8 text-center">
          Connect with your people, relive memories, and stay close no matter the miles.
        </p>

        <button
          onClick={handleGoogleAuth}
          className="w-full max-w-sm px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-rose-400 to-amber-400 hover:scale-105 transition-transform shadow-lg"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-gray-500 text-sm text-center">
          New users will be asked to select their role ✨
        </p>

      </div>

      {/* RIGHT SIDE */}
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

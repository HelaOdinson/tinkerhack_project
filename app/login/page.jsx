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

      // 🆕 CASE 1: New User -> Create document and send to /roles
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "",
          spaces: []
        });

        router.push("/roles");
      } 
      // 🔄 CASE 2: Existing User Check
      else {
        const userData = userSnap.data();
        
        // If they exist but have no spaces, send them back to setup
        if (!userData.spaces || userData.spaces.length === 0) {
          router.push("/roles");
        } 
        // ✅ Existing user with active spaces
        else {
          router.push("/my-spaces");
        }
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FFFDFB] font-sans relative overflow-hidden">

      {/* Stickers - Floating animations */}
      <img
        src="/stickers/otter.png"
        alt="Otter"
        className="absolute top-16 left-20 w-20 h-20 animate-bounce z-10"
      />

      <img
        src="/stickers/tulips.png"
        alt="Tulip"
        className="absolute bottom-24 left-1/3 w-20 h-20 animate-bounce z-10"
      />

      {/* LEFT SIDE: Authentication UI */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-16 z-20">

        <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent text-center leading-tight">
          Welcome To BeyondMiles!
        </h1>

        <p className="text-gray-600 mb-8 text-center max-w-sm font-medium">
          Connect with your people, relive memories, and stay close no matter the miles.
        </p>

        {/* Updated Button: No Image */}
        <button
          onClick={handleGoogleAuth}
          className="w-full max-w-sm px-6 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-rose-400 to-amber-400 hover:scale-[1.02] transition-all shadow-xl shadow-rose-200/50 flex items-center justify-center"
        >
          Continue with Google
        </button>

        <p className="mt-8 text-gray-400 text-[10px] font-black uppercase tracking-widest text-center">
          New users will be asked to select their role ✨
        </p>

      </div>

      {/* RIGHT SIDE: Visual Hero */}
      <div className="w-1/2 hidden md:block relative">
        <img
          src="/login.png"
          alt="Login Visual"
          className="h-full w-full object-cover"
        />
        {/* Overlay gradient to blend with the left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDFB] via-transparent to-transparent"></div>
      </div>

    </div>
  );
}
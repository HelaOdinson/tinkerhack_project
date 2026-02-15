'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function JoinSpace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Capture the role from the URL (e.g., ?role=Couple)
  const joiningUserRole = searchParams.get('role'); 

  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Safety: If no role is selected, redirect back to selection after a delay
  useEffect(() => {
    if (!joiningUserRole && !loading) {
      setError("No role selected. Please go back to the selection page.");
    }
  }, [joiningUserRole]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joiningUserRole) {
      setError("Please select a role first.");
      return;
    }

    setError('');
    setLoading(true);

    const code = inviteCode.trim().toUpperCase();
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    try {
      // 2. Search central 'spaces' collection for the code
      const spacesSnapshot = await getDocs(collection(db, "spaces"));
      let foundSpace = null;

      spacesSnapshot.forEach((docSnap) => {
        if (docSnap.data().joinCode === code) {
          foundSpace = { ...docSnap.data(), docId: docSnap.id };
        }
      });

      if (!foundSpace) {
        setError("No space found with that code.");
        setLoading(false);
        return;
      }

      // 🔴 3. THE ROLE LOCK: Case-Insensitive Comparison
      // This prevents "Couple" vs "couple" from failing.
      const dbRole = foundSpace.role.toLowerCase();
      const userRole = joiningUserRole.toLowerCase();

      if (dbRole !== userRole) {
        setError(`Role Mismatch! This space was created for "${foundSpace.role}" users.`);
        setLoading(false);
        return;
      }

      // 4. CHECK MEMBER LIMITS (For Couple role)
      if (foundSpace.role === 'Couple' && foundSpace.members?.length >= 2) {
        setError("This Couple space is already full! ❤️");
        setLoading(false);
        return;
      }

      // 5. Prevent joining a space you're already in
      if (foundSpace.members?.includes(user.uid)) {
        router.push(`/dashboard/${foundSpace.id}`);
        return;
      }

      // 6. Update the central space document
      const spaceRef = doc(db, "spaces", foundSpace.docId);
      await updateDoc(spaceRef, {
        members: arrayUnion(user.uid)
      });

      // 7. Update the user's personal document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        spaces: arrayUnion({
            ...foundSpace,
            members: [...(foundSpace.members || []), user.uid]
        })
      });

      // Success!
      router.push(`/dashboard/${foundSpace.id}`);

    } catch (err) {
      console.error("Join Error:", err);
      setError("Failed to join. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-rose-50 shadow-2xl shadow-rose-100/30">
        
        <form onSubmit={handleJoin} className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Join as <span className="text-rose-400 capitalize">{joiningUserRole || '...'}</span>
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed italic">
              "Connecting two worlds with one code."
            </p>
          </div>

          <div className="space-y-4">
            <input 
              autoFocus
              type="text" 
              placeholder="CODE"
              maxLength={8}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-rose-200 outline-none text-center text-4xl font-black tracking-[0.3em] transition-all placeholder:text-slate-200 uppercase"
            />
            
            <button 
              type="submit"
              disabled={inviteCode.length < 4 || loading || !joiningUserRole}
              className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xl hover:bg-rose-500 transition-all disabled:opacity-50 shadow-xl active:scale-95 cursor-pointer"
            >
              {loading ? "Verifying..." : "Enter Space ✨"}
            </button>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                <p className="text-rose-500 text-xs font-bold text-center uppercase tracking-widest leading-tight">
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="h-[1px] bg-slate-100 w-full" />

          <Link 
            href="/roles" 
            className="block text-center text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest"
          >
            Change Role Selection
          </Link>
        </form>
      </div>
    </main>
  );
}
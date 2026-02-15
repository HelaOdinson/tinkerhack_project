'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export const dynamic = 'force-dynamic';


export default function JoinSpace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joiningUserRole = searchParams.get('role'); 

  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!joiningUserRole) {
      setError("No role selected. Please go back to selection.");
    }
  }, [joiningUserRole]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joiningUserRole) return;

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
      // 1. Direct fetch using the code as the ID
      const spaceRef = doc(db, "spaces", code);
      const spaceSnap = await getDoc(spaceRef);

      if (!spaceSnap.exists()) {
        setError("No space found with that code.");
        setLoading(false);
        return;
      }

      const foundSpace = spaceSnap.data();

      // 🔴 FIX: Changed 'spaceData' to 'foundSpace' and added discreet message
      if (foundSpace.role.toLowerCase() !== joiningUserRole.toLowerCase()) {
        setLoading(false);
        setError("Wrong role chosen for this space.");
        return;
      }

      // 2. Member Limit Check
      if (foundSpace.role === 'Couple' && foundSpace.members?.length >= 2) {
        setError("This space is full.");
        setLoading(false);
        return;
      }

      // 3. Update Master Space
      await updateDoc(spaceRef, {
        members: arrayUnion(user.uid)
      });

      // 4. Update User Profile
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        spaces: arrayUnion({
            ...foundSpace,
            members: [...(foundSpace.members || []), user.uid]
        })
      });

      router.push(`/dashboard/${code}`);

    } catch (err) {
      console.error(err);
      setError("Failed to join. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-rose-50 shadow-2xl">
        <form onSubmit={handleJoin} className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-black">Join as <span className="text-rose-400 capitalize">{joiningUserRole}</span></h1>
            <p className="text-slate-400 text-sm italic mt-2">Enter the shared code below</p>
          </div>

          <input 
            type="text" 
            placeholder="CODE"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-rose-200 outline-none text-center text-4xl font-black tracking-widest text-slate-900 uppercase"
          />
          
          <button 
            type="submit"
            disabled={inviteCode.length < 4 || loading}
            className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xl hover:bg-rose-500 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter Space ✨"}
          </button>

          {error && <p className="text-rose-500 text-[10px] font-black text-center uppercase tracking-widest bg-rose-50 p-3 rounded-xl">{error}</p>}
          
          <Link href="/roles" className="block text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">Back to Roles</Link>
        </form>
      </div>
    </main>
  );
}
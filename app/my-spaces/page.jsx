'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function MySpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        router.push('/login'); // Redirect to login if not authenticated
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Filter out any nulls and ensure each space has a valid ID/JoinCode
          const userSpaces = (data.spaces || []).filter(s => s && (s.id || s.joinCode));
          setSpaces(userSpaces);
        }
      } catch (error) {
        console.error("Error fetching spaces:", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (e, spaceId) => {
    e.stopPropagation(); 
    if (!confirm("Remove this space from your list?")) return;

    try {
      const user = auth.currentUser;
      const updatedSpaces = spaces.filter(s => (s.id || s.joinCode) !== spaceId);
      
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        spaces: updatedSpaces
      });

      setSpaces(updatedSpaces);
    } catch (error) {
      console.error("Error deleting space:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans p-10">
      
      {/* 1. HEADER AREA */}
      <div className="max-w-7xl mx-auto mb-16 flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-black italic text-slate-900 mb-3 tracking-tighter">
            My Spaces
          </h1>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.3em]">
            Your connected universes ✨
          </p>
        </div>

        <button 
          onClick={() => router.push('/roles')}
          className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl shadow-2xl hover:scale-110 hover:bg-rose-500 transition-all cursor-pointer border-4 border-white"
        >
          +
        </button>
      </div>

      {loading && (
        <div className="max-w-7xl mx-auto py-20 text-center animate-pulse">
            <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Syncing your worlds...</p>
        </div>
      )}

      {/* 2. SPACES GRID */}
      <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-3">

        {spaces.map((space) => {
          // Fallback to joinCode if id is missing
          const currentId = space.id || space.joinCode;
          
          return (
            <div
              key={currentId}
              onClick={() => router.push(`/dashboard/${currentId}`)}
              className="group relative cursor-pointer bg-white border border-rose-50 rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              {/* Delete Button (×) */}
              <button 
                onClick={(e) => handleDelete(e, currentId)}
                className="absolute top-8 right-8 w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center font-bold hover:bg-rose-100 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                ×
              </button>

              <div className="flex justify-between items-start mb-6">
                 <h2 className="text-2xl font-black text-slate-900 truncate pr-6 leading-tight">
                   {space.spaceName}
                 </h2>
              </div>

              <div className="inline-block bg-rose-50 px-4 py-1 rounded-full mb-6">
                  <p className="text-rose-400 font-black uppercase text-[9px] tracking-widest">
                  {space.role}
                  </p>
              </div>

              <div className="space-y-3 text-slate-500 text-sm font-semibold">
                <p className="flex items-center gap-3">📍 <span className="truncate">{space.homeCity} → {space.awayCity}</span></p>
                <p className="flex items-center gap-3">📏 {space.distance} KM APART</p>
                <p className="flex items-center gap-3">🗓 {space.reunionDate || "No Date Set"}</p>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
                 <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl font-mono text-amber-600 font-black tracking-widest text-xs">
                   {currentId}
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-rose-500 transition-all shadow-lg group-hover:shadow-rose-200">
                   ➔
                 </div>
              </div>
            </div>
          );
        })}

        {/* Create Card */}
        <div
          onClick={() => router.push('/roles')}
          className="cursor-pointer flex items-center justify-center rounded-[2.5rem] border-4 border-dashed border-rose-100 bg-white/40 hover:bg-rose-50 hover:border-rose-300 transition-all duration-500 min-h-[350px] group"
        >
          <div className="text-center group-hover:scale-110 transition-transform">
            <div className="text-7xl font-black text-rose-200 mb-4">+</div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
              Create New Space
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
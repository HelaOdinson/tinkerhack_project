'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSpaces(data.spaces || []);
        }
      } catch (error) {
        console.error("Error fetching spaces:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans p-10">
      
      {/* Heading */}
      <div className="mb-12">
        <h1 className="text-5xl font-black italic text-slate-800 mb-3">
          My Spaces
        </h1>
        <p className="text-slate-500 font-medium">
          All the little worlds you’ve created ✨
        </p>
      </div>

      {loading && (
        <p className="text-slate-400">Loading your spaces...</p>
      )}

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

        {/* Existing Spaces */}
        {spaces.map((space) => (
          <div
            key={space.id}
            onClick={() => router.push(`/dashboard/${space.id}`)}
            className="cursor-pointer bg-white border border-rose-100 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              {space.spaceName}
            </h2>

            <p className="text-rose-400 font-bold mb-4">
              {space.role}
            </p>

            <div className="space-y-1 text-slate-500 text-sm">
              <p>📍 {space.homeCity} → {space.awayCity}</p>
              <p>📏 {space.distance} km apart</p>
              <p>🗓 Reunion: {space.reunionDate}</p>
            </div>

            <div className="mt-6 inline-block bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl font-mono text-amber-600 font-bold tracking-widest text-sm">
              {space.joinCode}
            </div>
          </div>
        ))}

        {/* Add New Space Card */}
        <div
          onClick={() => router.push('/roles')}
          className="cursor-pointer flex items-center justify-center rounded-3xl border-2 border-dashed border-rose-200 bg-white/40 backdrop-blur-sm hover:bg-rose-50 transition-all duration-300 min-h-[250px]"
        >
          <div className="text-center">
            <div className="text-6xl font-black text-rose-300 mb-3">+</div>
            <p className="text-slate-400 font-bold">
              Create New Space
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function MySpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

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

      {/* Loading */}
      {loading && (
        <p className="text-slate-400">Loading your spaces...</p>
      )}

      {/* Empty */}
      {!loading && spaces.length === 0 && (
        <div className="bg-white border border-rose-100 rounded-3xl p-10 shadow-md text-center">
          <p className="text-slate-500 font-medium">
            You haven’t created a space yet.
          </p>
        </div>
      )}

      {/* Spaces */}
      <div className="grid gap-8 md:grid-cols-2">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="bg-white border border-rose-100 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
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
      </div>

    </main>
  );
}

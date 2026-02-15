'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SpaceDashboard() {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const foundSpace = userData.spaces?.find(
            (s) => s.id === id
          );

          setSpace(foundSpace || null);
        }
      } catch (error) {
        console.error("Error fetching space:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 font-semibold">
          Loading space...
        </p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-rose-400 font-semibold">
          Space not found.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 p-10">
      <h1 className="text-4xl font-black mb-3">
        {space.spaceName}
      </h1>

      <p className="text-rose-400 font-bold mb-6">
        {space.role}
      </p>

      <div className="space-y-2 text-slate-600">
        <p>📍 {space.homeCity} → {space.awayCity}</p>
        <p>📏 {space.distance} km apart</p>
        <p>🗓 Reunion: {space.reunionDate}</p>
        <p>🎟 Join Code: {space.joinCode}</p>
      </div>
    </main>
  );
}

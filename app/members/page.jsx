"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function MembersPage() {
  const auth = getAuth();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const groupId = userSnap.data()?.groupId;
      if (!groupId) return router.push("/role");

      const groupSnap = await getDoc(doc(db, "groups", groupId));
      const memberUIDs = groupSnap.data().members || [];

      const membersData = [];
      for (let uid of memberUIDs) {
        const memSnap = await getDoc(doc(db, "users", uid));
        membersData.push(memSnap.data());
      }

      setMembers(membersData);
      setLoading(false);
    };

    fetchMembers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 font-sans text-gray-900">
      <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">
        Members
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {members.map((m) => (
          <div
            key={m.email}
            className="flex flex-col items-center gap-2 border p-2 rounded shadow-sm bg-white"
          >
            <img
              src={m.photoURL}
              alt={m.name}
              className="w-16 h-16 rounded-full"
            />
            <p className="font-semibold text-gray-800">{m.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

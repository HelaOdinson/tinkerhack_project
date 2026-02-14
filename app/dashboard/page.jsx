"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DashboardPage() {
  const router = useRouter();
  const auth = getAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [memories, setMemories] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const groupId = userSnap.data()?.groupId;
      if (!groupId) return router.push("/role");

      const groupSnap = await getDoc(doc(db, "groups", groupId));
      if (!groupSnap.exists()) return router.push("/role");

      const data = groupSnap.data();
      setGroup({ ...data, groupId });
      setGroupName(data.groupName);
      setMeetDate(data.meetDate || "");
      setMemories(data.memories || []);
      setLoading(false);
    };

    fetchGroup();
  }, []);

  // Update group name
  const updateGroupName = async () => {
    const groupRef = doc(db, "groups", group.groupId);
    await updateDoc(groupRef, { groupName });
    alert("Group name updated!");
  };

  // Update meet date
  const updateMeetDate = async () => {
    const groupRef = doc(db, "groups", group.groupId);
    await updateDoc(groupRef, { meetDate });
    alert("Meet date updated!");
  };

  // Handle memory upload
  const handleUpload = async (e) => {
    if (!e.target.files[0]) return;
    setUploading(true);

    const file = e.target.files[0];
    const fileRef = ref(storage, `memories/${group.groupId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    const groupRef = doc(db, "groups", group.groupId);
    const newMemory = {
      imageUrl: url,
      uploadedBy: auth.currentUser.uid,
      timestamp: Date.now(),
    };
    await updateDoc(groupRef, { memories: arrayUnion(newMemory) });

    setMemories((prev) => [...prev, newMemory]);
    setUploading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 font-sans text-gray-900">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">
        Dashboard
      </h1>

      {/* Top Section */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="border px-3 py-2 rounded font-sans"
          placeholder="Group Name"
        />
        <button
          onClick={updateGroupName}
          className="px-4 py-2 rounded font-semibold bg-gradient-to-r from-rose-400 to-amber-400 text-white shadow"
        >
          Update Name
        </button>

        <input
          type="date"
          value={meetDate}
          onChange={(e) => setMeetDate(e.target.value)}
          className="border px-3 py-2 rounded font-sans"
        />
        <button
          onClick={updateMeetDate}
          className="px-4 py-2 rounded font-semibold bg-gradient-to-r from-rose-400 to-amber-400 text-white shadow"
        >
          Set Meet Date
        </button>
      </div>

      {/* Countdown */}
      {meetDate && (
        <Countdown date={meetDate} />
      )}

      {/* Member Avatars */}
      <div className="flex gap-4 my-6">
        {group.members.map((uid) => (
          <MemberAvatar key={uid} uid={uid} />
        ))}
      </div>

      {/* Memory Wall */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">
          Memory Wall
        </h2>
        <input type="file" onChange={handleUpload} disabled={uploading} />
        {uploading && <p>Uploading...</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {memories.map((m, idx) => (
            <img key={idx} src={m.imageUrl} alt="Memory" className="w-full h-32 object-cover rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Countdown Component
function Countdown({ date }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(date) - new Date();
      if (diff <= 0) {
        setTimeLeft("Today!");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <p className="text-lg font-semibold mb-4">
      Countdown to Meet: <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">{timeLeft}</span>
    </p>
  );
}

// Member Avatar Component
function MemberAvatar({ uid }) {
  const [member, setMember] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      const docSnap = await getDoc(doc(db, "users", uid));
      setMember(docSnap.data());
    };
    fetchMember();
  }, []);

  if (!member) return null;
  return (
    <img
      src={member.photoURL}
      alt={member.name}
      title={member.name}
      className="w-12 h-12 rounded-full"
    />
  );
}

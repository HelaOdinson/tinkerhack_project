"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DashboardPage() {
  const router = useRouter();
  const auth = getAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [memories, setMemories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sidebarPhotos, setSidebarPhotos] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [meetDate, setMeetDate] = useState("");

  const galleryRef = useRef(null);

  // Fetch user and group
  useEffect(() => {
    const fetchGroup = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return router.push("/roles");

      const userData = userSnap.data();
      const groupId = userData?.groupId;
      if (!groupId) return router.push("/roles");

      const groupSnap = await getDoc(doc(db, "groups", groupId));
      if (!groupSnap.exists()) return router.push("/roles");

      const data = groupSnap.data();
      setGroup({ ...data, groupId });
      setGroupName(data.groupName || "");
      setMeetDate(data.meetDate || "");
      setMessages(data.messages || []);
      setMemories(data.memories || []);
      setLoading(false);
    };

    fetchGroup();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  if (!group || !group.groupId)
    return (
      <div className="p-8 font-sans text-gray-900">
        <h1 className="text-2xl font-bold mb-4">
          You don’t have a group yet!
        </h1>
        <p>
          Go to{" "}
          <a href="/roles" className="text-rose-400 font-semibold">
            /roles
          </a>{" "}
          to create or join a space.
        </p>
      </div>
    );

  // Chat handlers
  const handleSend = async () => {
    if (!newMessage.trim() || !group) return;

    const msgObj = {
      text: newMessage,
      type: "primary1",
      uid: auth.currentUser.uid,
      timestamp: Date.now(),
    };

    setMessages([...messages, msgObj]);
    setNewMessage("");

    const groupRef = doc(db, "groups", group.groupId);
    await updateDoc(groupRef, { messages: arrayUnion(msgObj) });
  };

  // Memory upload
  const handleUploadMemory = async (e) => {
    if (!e.target.files[0] || !group) return;
    setUploading(true);

    const file = e.target.files[0];
    const fileRef = ref(storage, `memories/${group.groupId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    const groupRef = doc(db, "groups", group.groupId);
    const newMemory = { imageUrl: url, uploadedBy: auth.currentUser.uid, timestamp: Date.now() };
    await updateDoc(groupRef, { memories: arrayUnion(newMemory) });

    setMemories((prev) => [...prev, newMemory]);
    setUploading(false);
  };

  // Sidebar photo upload (not saved to grid)
  const handleSidebarUpload = (e) => {
    if (!e.target.files[0]) return;
    const fileURL = URL.createObjectURL(e.target.files[0]);
    setSidebarPhotos((prev) => [...prev, fileURL]);
  };

  // Scroll gallery left/right
  const scrollGallery = (dir) => {
    if (!galleryRef.current) return;
    galleryRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] font-sans p-6">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white">
          {group.groupName}
        </h1>
        <p className="mt-2 text-lg text-gray-700">
          {meetDate
            ? `Days until meet: ${Math.max(
                0,
                Math.ceil((new Date(meetDate) - new Date()) / (1000 * 60 * 60 * 24))
              )}`
            : "Set a meet date in your dashboard!"}
        </p>
      </header>

      <main className="grid grid-cols-12 gap-4">
        {/* Left: Members & Calendar */}
        <aside className="col-span-3 flex flex-col gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-2">Members</h2>
            <div className="flex flex-wrap gap-2">
              {group.members.map((uid) => (
                <MemberAvatar key={uid} uid={uid} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-2">Calendar</h2>
            <Calendar />
          </div>
        </aside>

        {/* Middle: Memory Gallery */}
        <section className="col-span-6 flex flex-col gap-2">
          <div className="bg-white rounded-lg p-4 shadow relative">
            <h2 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-amber-400">
              Memory Gallery
            </h2>

            {/* Carousel buttons */}
            <button
              onClick={() => scrollGallery(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow"
            >
              ◀
            </button>
            <button
              onClick={() => scrollGallery(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow"
            >
              ▶
            </button>

            <div
              ref={galleryRef}
              className="flex overflow-x-scroll gap-2 scroll-smooth p-2"
            >
              {memories.map((m, idx) => (
                <img
                  key={idx}
                  src={m.imageUrl}
                  alt="Memory"
                  className="rounded-lg cursor-pointer hover:scale-105 transition-transform w-40 h-32 object-cover"
                />
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <input type="file" onChange={handleUploadMemory} disabled={uploading} />
              {uploading && <span>Uploading...</span>}
            </div>
          </div>
        </section>

        {/* Right Sidebar: Camera / Photos */}
        <aside className="col-span-3 flex flex-col gap-4">
          <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <h2 className="font-semibold mb-2">Camera / Quick Photos</h2>
            <input type="file" onChange={handleSidebarUpload} />
            <div className="mt-2 grid grid-cols-1 gap-2 w-full">
              {sidebarPhotos.map((url, i) => (
                <img key={i} src={url} alt={`Quick ${i}`} className="rounded-lg w-full" />
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom: Chat (shorter width) */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-10/12 bg-white p-4 shadow-inner rounded-lg">
        <h2 className="font-semibold mb-2">Group Chat</h2>
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto mb-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded-lg self-start ${
                msg.type === "primary1"
                  ? "bg-rose-400 text-white"
                  : "bg-amber-400 text-white self-end"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-rose-400 text-white font-semibold"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

// Countdown & other helpers if needed

function MemberAvatar({ uid }) {
  const [member, setMember] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) setMember(docSnap.data());
    };
    fetchMember();
  }, [uid]);

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

// Simple Calendar component
function Calendar() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  return (
    <input
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="border px-3 py-2 rounded w-full"
    />
  );
}

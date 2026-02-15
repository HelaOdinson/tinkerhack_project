'use client';
import { use, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase'; 
import { 
  doc, getDoc, updateDoc, onSnapshot, arrayRemove, 
  collection, addDoc, query, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SmartDashboard({ params }) {
  const resolvedParams = use(params);
  const spaceId = resolvedParams?.id;
  const router = useRouter();
  const scrollRef = useRef(null);

  // --- STATES ---
  const [mounted, setMounted] = useState(false);
  const [spaceData, setSpaceData] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [showInfo, setShowInfo] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  const [timeHome, setTimeHome] = useState('');
  const [timeAway, setTimeAway] = useState('');
  const [daysLeft, setDaysLeft] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [pulseImage, setPulseImage] = useState(null);

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  // --- CHAT STATES ---
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const roleConfigs = {
    Couple: { icon: "❤️", reunion: "Days Until Reunion", pulse: "Our Daily Pulse", gap: "The Gap", showTimeDiff: true },
    Friends: { icon: "🍕", reunion: "Next Squad Meet", pulse: "Squad Status", gap: "Squad Spread", showTimeDiff: false },
    HouseFamily: { icon: "🏠", reunion: "Homecoming Date", pulse: "Family Pulse", gap: "Member Distance", showTimeDiff: false },
    Custom: { icon: "✨", reunion: "Next Milestone", pulse: "Pulse", gap: "The Gap", showTimeDiff: false }
  };

  const themes = {
    rose: { bg: "bg-[#FFF0F3]", border: "border-rose-200", text: "text-rose-700", title: "text-rose-950", accent: "bg-rose-400", card: "bg-rose-50 border-rose-300" },
    blue: { bg: "bg-[#E3F2FD]", border: "border-blue-200", text: "text-blue-700", title: "text-blue-950", accent: "bg-blue-400", card: "bg-blue-50 border-blue-300" }
  };

  // --- 1. DATA & CHAT FETCHING ---
  useEffect(() => {
    setMounted(true); // 🔥 Fixes Hydration Error
    if (!spaceId) return;

    let unsubscribeSpace;
    let unsubscribeChat;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const masterSpaceRef = doc(db, "spaces", spaceId);
        unsubscribeSpace = onSnapshot(masterSpaceRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 👥 Member Sync
            const details = await Promise.all((data.members || []).map(async (uid) => {
              const uDoc = await getDoc(doc(db, "users", uid));
              return { uid, ...uDoc.data() };
            }));
            setMembersDetails(details);

            // Fetch Local Nickname from User Profile
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userSpaces = userDoc.data()?.spaces || [];
            const localSpace = userSpaces.find(s => s.id === spaceId);

            setSpaceData({ ...data, partnerNickname: localSpace?.partnerNickname || '' });
            setNewNickname(localSpace?.partnerNickname || '');

            if (data.reunionDate) {
              const diff = new Date(data.reunionDate) - new Date();
              setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
            }
            setLoading(false);
          }
        });

        // 🔥 CHAT LISTENER
        const chatRef = collection(db, "spaces", spaceId, "messages");
        const q = query(chatRef, orderBy("createdAt", "asc"), limit(50));
        unsubscribeChat = onSnapshot(q, (snapshot) => {
          setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
        });

      } else { router.push('/login'); }
    });

    return () => {
      if (unsubscribeSpace) unsubscribeSpace();
      if (unsubscribeChat) unsubscribeChat();
      unsubscribeAuth();
    };
  }, [spaceId, router]);

  // --- 2. TIMERS (Restricted to Couple role) ---
  useEffect(() => {
    if (!mounted || !spaceData) return;
    const timer = setInterval(() => {
      const now = new Date();
      setTimeHome(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      const config = roleConfigs[spaceData.role || 'Couple'];
      if (config.showTimeDiff && spaceData.timeDiff) {
        const offset = parseFloat(spaceData.timeDiff);
        const awayDate = new Date(now.getTime() + (offset * 60 * 60 * 1000));
        setTimeAway(awayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mounted, spaceData]);

  // --- ACTIONS ---
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await addDoc(collection(db, "spaces", spaceId, "messages"), {
      text: newMessage,
      senderId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  const saveNickname = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    const updatedSpaces = userDoc.data().spaces.map(s => 
      s.id === spaceId ? { ...s, partnerNickname: newNickname } : s
    );
    await updateDoc(userRef, { spaces: updatedSpaces });
    setSpaceData(prev => ({ ...prev, partnerNickname: newNickname }));
    setIsEditingNickname(false);
  };

  const kickMember = async (uid) => {
    if (confirm("Kick member?")) {
      await updateDoc(doc(db, "spaces", spaceId), { members: arrayRemove(uid) });
    }
  };

  if (!mounted || loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-rose-400 font-black">SYNCING...</div>;

  const theme = themes[spaceData.settings?.theme || 'rose'];
  const config = roleConfigs[spaceData.role || 'Couple'];
  const isOwner = spaceData.ownerId === auth.currentUser?.uid;

  return (
    <main className={`flex min-h-screen ${theme.bg} relative overflow-hidden text-slate-800 font-sans`}>
      
      {/* SIDEBAR */}
      <aside className={`transition-all duration-500 bg-white/60 backdrop-blur-xl border-r border-white/20 flex flex-col p-6 sticky top-0 h-screen z-50 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mb-12 h-10 w-10 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
          <div className={`h-0.5 bg-slate-800 transition-all ${isSidebarOpen ? 'w-6 rotate-45 translate-y-2' : 'w-5'}`} />
          <div className={`h-0.5 bg-slate-800 w-5 transition-all ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
          <div className={`h-0.5 bg-slate-800 transition-all ${isSidebarOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
        </button>
        <nav className="space-y-8">
          <Link href="/my-spaces" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100 text-xl">🌌</div>
            {isSidebarOpen && <span className="font-black text-xs uppercase tracking-widest">My Spaces</span>}
          </Link>
          <Link href="/settings" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100 text-xl">⚙️</div>
            {isSidebarOpen && <span className="font-black text-xs uppercase tracking-widest">Settings</span>}
          </Link>
        </nav>
      </aside>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
            <header className="mb-10 flex justify-between items-end">
              <div className="cursor-pointer group" onClick={() => setShowInfo(true)}>
                  <h1 className={`font-romantic italic font-black text-6xl ${theme.title}`}>{spaceData.spaceName} {config.icon}</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 flex items-center gap-2">
                    {membersDetails.length > 1 ? (
                      <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Connected to {spaceData.partnerNickname || membersDetails.find(m => m.uid !== auth.currentUser.uid)?.displayName || "Partner"}</>
                    ) : "Waiting for Connection..."} • Info ℹ️
                  </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className={`bg-white p-6 rounded-[2.5rem] border ${theme.card} shadow-xl`}>
                        <h3 className={`font-romantic italic text-xl mb-4 text-center ${theme.text}`}>Timeline</h3>
                        <div className="grid grid-cols-7 gap-1 mb-4 text-[10px] font-black text-center text-slate-400 uppercase">
                          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d}>{d.charAt(0)}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                           {[...Array(31)].map((_, i) => (
                             <div key={i} className="aspect-square flex items-center justify-center text-xs font-bold rounded-full hover:bg-rose-50 cursor-pointer">{i+1}</div>
                           ))}
                        </div>
                    </div>
                    <div className="bg-[#FFF9C4] p-8 rounded-lg shadow-xl -rotate-2 border-t-[12px] border-amber-400/30 text-center">
                        <p className="text-[10px] font-black uppercase text-amber-900 mb-2 font-romantic italic">{config.reunion}</p>
                        <h4 className="text-5xl font-black text-slate-800">{daysLeft ?? '??'}</h4>
                    </div>
                </aside>

                {/* CENTER */}
                <section className="lg:col-span-6 space-y-8">
                    <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-[16px] border-white h-[400px] relative overflow-hidden flex items-center justify-center text-slate-200">
                      [Main Memory Placeholder]
                    </div>

                    {/* 🔥 TODAYS GLIMPSES */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Your Glimpse</p>
                            <label className="aspect-[4/5] bg-white rounded-[2rem] shadow-lg border-4 border-white flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all">
                                {pulseImage ? <Image src={pulseImage} alt="Pulse" fill className="object-cover" /> : 
                                <><span className="text-3xl mb-2">✨</span><p className="text-[9px] font-black uppercase text-slate-300">Add Glimpse</p></>}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => setPulseImage(URL.createObjectURL(e.target.files[0]))} />
                            </label>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Partner's Glimpse</p>
                            <div className="aspect-[4/5] bg-slate-100/50 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                                <span className="text-2xl mb-2">🔒</span>
                            </div>
                        </div>
                    </div>

                    {/* CHAT */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-6 h-[250px] flex flex-col border border-slate-50">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-3 p-2 no-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-bold ${msg.senderId === auth.currentUser?.uid ? `${theme.accent} text-white rounded-tr-none` : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendMessage} className="bg-slate-50 p-2 rounded-2xl flex gap-2">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Send note..." className="flex-1 bg-transparent px-4 outline-none text-xs font-bold text-slate-600" />
                            <button type="submit" className={`w-10 h-10 ${theme.accent} text-white rounded-xl font-bold`}>➔</button>
                        </form>
                    </div>
                </section>

                {/* RIGHT */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl text-center space-y-6">
                        <div><p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Local Time</p><p className="text-2xl font-black">{timeHome}</p></div>
                        {config.showTimeDiff && (
                          <>
                            <div className="h-[1px] bg-white/10" />
                            <div><p className="text-[9px] font-black text-amber-300 uppercase tracking-widest">Away Time</p><p className="text-2xl font-black text-amber-300">{timeAway || "..."}</p></div>
                          </>
                        )}
                    </div>
                    {/* 📏 DISTANCE & TIME GAP */}
                    <div className={`p-6 bg-white rounded-[2.5rem] shadow-xl border ${theme.border}`}>
                        <p className={`text-[10px] font-black uppercase text-center mb-4 tracking-widest ${theme.text}`}>{config.gap}</p>
                        <div className="relative w-full h-1 flex items-center bg-slate-100 rounded-full">
                            <div className={`absolute left-0 w-3 h-3 rounded-full border-2 border-white ${theme.accent}`} />
                            <div className="absolute right-0 w-3 h-3 rounded-full border-2 border-white bg-amber-400" />
                        </div>
                        <p className="text-xs font-black text-center mt-4 text-slate-900 uppercase">
                          {spaceData.distance ? `${spaceData.distance} KM APART` : "..."}
                        </p>
                        {spaceData.timeDiff && (
                          <p className="text-[9px] font-black text-slate-400 text-center mt-1 uppercase">
                            {Math.abs(spaceData.timeDiff)} Hours Difference
                          </p>
                        )}
                    </div>
                </aside>
            </div>
        </div>
      </div>

      {/* INFO DRAWER */}
      <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-all duration-500 z-[100] border-l border-slate-100 ${showInfo ? 'w-full md:w-[400px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 h-full flex flex-col">
          <button onClick={() => setShowInfo(false)} className="text-left font-black text-slate-300 hover:text-slate-900 mb-8 uppercase tracking-widest text-xs">✕ Close</button>
          <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
            <div>
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Space Members</h3>
              <div className="space-y-4">
                {membersDetails.map(member => (
                  <div key={member.uid} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-slate-300 text-xs">{member.displayName?.charAt(0) || "U"}</div>
                    <div className="flex-1">
                      <p className="text-slate-800 text-sm font-bold">{member.uid === auth.currentUser.uid ? "You" : (member.displayName || "Partner")}</p>
                      {member.uid !== auth.currentUser.uid && (
                        <button onClick={() => setIsEditingNickname(!isEditingNickname)} className="text-[9px] uppercase font-black text-rose-400">
                          {spaceData.partnerNickname ? `"${spaceData.partnerNickname}"` : "Set Nickname"}
                        </button>
                      )}
                    </div>
                    {isOwner && member.uid !== auth.currentUser.uid && (
                      <button onClick={() => kickMember(member.uid)} className="px-3 py-1 bg-rose-100 text-rose-500 rounded-lg text-[10px] font-black uppercase">Kick</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {isEditingNickname && (
              <div className="p-4 bg-rose-50 rounded-2xl space-y-3">
                <input type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} placeholder="Nickname" className="w-full p-2 rounded-xl text-xs font-bold" />
                <button onClick={saveNickname} className="w-full py-2 bg-rose-400 text-white rounded-xl text-[10px] font-black uppercase">Save</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
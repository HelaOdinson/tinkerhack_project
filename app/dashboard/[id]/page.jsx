'use client';
// 1. Added 'use' to the imports to correctly unwrap params
import { use, useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase'; 
import { 
  doc, getDoc, updateDoc, onSnapshot, arrayRemove, 
  collection, addDoc, query, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';

// 🔥 THIS IS THE CRITICAL ADDITION TO AVOID THE ERROR
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function DashboardContent({ spaceId }) {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const scrollRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [spaceData, setSpaceData] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [timeHome, setTimeHome] = useState('');
  const [timeAway, setTimeAway] = useState('');
  const [daysLeft, setDaysLeft] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [pulseImage, setPulseImage] = useState(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');

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

  useEffect(() => {
    setMounted(true);
    if (!spaceId) return;

    let unsubscribeSpace;
    let unsubscribeChat;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const masterSpaceRef = doc(db, "spaces", spaceId);
        unsubscribeSpace = onSnapshot(masterSpaceRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const details = await Promise.all((data.members || []).map(async (uid) => {
              const uDoc = await getDoc(doc(db, "users", uid));
              return { uid, ...uDoc.data() };
            }));
            setMembersDetails(details);
            
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const localSpace = (userDoc.data()?.spaces || []).find(s => s.id === spaceId);
            setSpaceData({ ...data, partnerNickname: localSpace?.partnerNickname || '' });
            setNewNickname(localSpace?.partnerNickname || '');

            if (data.reunionDate) {
              const diff = new Date(data.reunionDate) - new Date();
              setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
            }
            setLoading(false);
          }
        });

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

  if (!mounted || loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-rose-400 font-black">SYNCING...</div>;

  const theme = themes[spaceData?.settings?.theme || 'rose'];
  const config = roleConfigs[spaceData?.role || 'Couple'];

  return (
    <main className={`flex min-h-screen ${theme.bg} relative overflow-hidden text-slate-800 font-sans`}>
      <aside className={`transition-all duration-500 bg-white/60 backdrop-blur-xl border-r border-white/20 flex flex-col p-6 sticky top-0 h-screen z-50 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mb-12 h-10 w-10 flex items-center justify-center hover:bg-slate-100 rounded-xl cursor-pointer">
          {isSidebarOpen ? '✕' : '☰'}
        </button>
        <nav className="space-y-8">
          <Link href="/my-spaces" className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">🌌</Link>
          <Link href="/settings" className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">⚙️</Link>
        </nav>
      </aside>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          <header className="mb-10 cursor-pointer" onClick={() => setShowInfo(true)}>
            <h1 className={`font-romantic italic font-black text-6xl ${theme.title}`}>{spaceData.spaceName} {config.icon}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
              Connected to {spaceData.partnerNickname || "Partner"} • Info ℹ️
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3 space-y-6">
              <div className={`bg-white p-6 rounded-[2.5rem] border ${theme.card} shadow-xl`}>
                <div className="grid grid-cols-7 gap-1 mb-4 text-[10px] font-black text-center text-slate-400 uppercase">
                  {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(31)].map((_, i) => <div key={i} className="aspect-square flex items-center justify-center text-xs font-bold rounded-full hover:bg-rose-50 cursor-pointer">{i+1}</div>)}
                </div>
              </div>
              <div className="bg-[#FFF9C4] p-8 rounded-lg shadow-xl -rotate-2 text-center border-t-[12px] border-amber-400/30">
                <p className="text-[10px] font-black uppercase text-amber-900 mb-2 italic">{config.reunion}</p>
                <h4 className="text-5xl font-black text-slate-800">{daysLeft ?? '??'}</h4>
              </div>
            </aside>

            <section className="lg:col-span-6 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Your Glimpse</p>
                  <label className="aspect-[4/5] bg-white rounded-[2rem] shadow-lg border-4 border-white flex flex-col items-center justify-center relative overflow-hidden cursor-pointer">
                    {pulseImage ? <Image src={pulseImage} alt="Pulse" fill className="object-cover" /> : <span className="text-3xl">✨</span>}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setPulseImage(URL.createObjectURL(e.target.files[0]))} />
                  </label>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Partner's Glimpse</p>
                  <div className="aspect-[4/5] bg-slate-100/50 rounded-[2rem] border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-300 italic text-[10px]">Waiting...</div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-xl p-6 h-[300px] flex flex-col">
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
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a note..." className="flex-1 bg-transparent px-4 outline-none text-xs font-bold text-slate-600" />
                  <button type="submit" className={`w-10 h-10 ${theme.accent} text-white rounded-xl font-bold`}>➔</button>
                </form>
              </div>
            </section>

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
              <div className={`p-6 bg-white rounded-[2.5rem] shadow-xl border ${theme.border}`}>
                <p className={`text-[10px] font-black uppercase text-center mb-4 tracking-widest ${theme.text}`}>{config.gap}</p>
                <div className="relative w-full h-1 bg-slate-100 rounded-full flex items-center">
                  <div className={`absolute left-0 w-3 h-3 rounded-full border-2 border-white ${theme.accent}`} />
                  <div className="absolute right-0 w-3 h-3 rounded-full border-2 border-white bg-amber-400" />
                </div>
                <p className="text-xs font-black text-igtter mt-4 text-slate-900 uppercase">
                  {spaceData.distance ? `${spaceData.distance} KM APART` : "..."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

// 🔥 EXPORT WRAPPED IN SUSPENSE
export default function SmartDashboard({ params }) {
  // Use 'use' to safely unwrap the dynamic params for Next.js Client Components
  const resolvedParams = use(params);
  const spaceId = resolvedParams?.id;

  return (
    <Suspense fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <p className="text-rose-400 font-black animate-pulse uppercase tracking-widest">Entering Space...</p>
        </div>
    }>
      <DashboardContent spaceId={spaceId} />
    </Suspense>
  );
}
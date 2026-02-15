'use client';
import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase'; 
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'; // Added onSnapshot
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SmartDashboard({ params }) {
  const resolvedParams = use(params);
  const spaceId = resolvedParams.id;
  const router = useRouter();

  // --- STATES ---
  const [spaceData, setSpaceData] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]); // Track actual member data
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

  // --- CONFIGS ---
  const roleConfigs = {
    Couple: { icon: "❤️", reunion: "Days Until Reunion", pulse: "Our Daily Pulse", gap: "The Gap Between Us" },
    Friends: { icon: "🍕", reunion: "Next Squad Meet", pulse: "Squad Status", gap: "Squad Spread" },
    HouseFamily: { icon: "🏠", reunion: "Homecoming Date", pulse: "Family Pulse", gap: "Member Distance" },
    Custom: { icon: "✨", reunion: "Next Milestone", pulse: "Pulse", gap: "The Gap" }
  };

  const themes = {
    rose: { bg: "bg-[#FFF0F3]", border: "border-rose-200", text: "text-rose-700", title: "text-rose-950", accent: "bg-rose-400", chat: "bg-rose-400", card: "bg-rose-50 border-rose-300" },
    green: { bg: "bg-[#E8F5E9]", border: "border-emerald-200", text: "text-emerald-700", title: "text-emerald-950", accent: "bg-emerald-400", chat: "bg-emerald-500", card: "bg-emerald-50 border-emerald-300" },
    blue: { bg: "bg-[#E3F2FD]", border: "border-blue-200", text: "text-blue-700", title: "text-blue-950", accent: "bg-blue-400", chat: "bg-blue-500", card: "bg-blue-50 border-blue-300" },
    slate: { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-700", title: "text-slate-950", accent: "bg-slate-800", chat: "bg-slate-800", card: "bg-white border-slate-200" }
  };

  // --- REAL-TIME DATA FETCHING ---
  useEffect(() => {
    let unsubscribeSpace;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Listen to the MASTER space document for member changes
        const masterSpaceRef = doc(db, "spaces", spaceId);
        
        unsubscribeSpace = onSnapshot(masterSpaceRef, async (docSnap) => {
          if (docSnap.exists()) {
            const masterData = docSnap.data();
            
            // 2. Fetch Details for all members (names/profiles)
            const details = await Promise.all(
              masterData.members.map(async (uid) => {
                const uDoc = await getDoc(doc(db, "users", uid));
                return { uid, ...uDoc.data() };
              })
            );
            
            setMembersDetails(details);

            // 3. Sync with local user-specific space data (for nicknames)
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userSpaces = userDoc.data().spaces || [];
            const localSpace = userSpaces.find(s => s.id === spaceId);

            setSpaceData({ ...localSpace, ...masterData });
            setNewNickname(localSpace?.partnerNickname || '');
            
            if (localSpace?.reunionDate) {
              const target = new Date(localSpace.reunionDate);
              const today = new Date();
              const diffTime = target - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setDaysLeft(diffDays > 0 ? diffDays : 0);
            }
          }
          setLoading(false);
        });
      }
    });

    const timer = setInterval(() => {
      const now = new Date();
      setTimeHome(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (spaceData?.timeDiff) {
        const offset = parseFloat(spaceData.timeDiff);
        const awayDate = new Date(now.getTime() + (offset * 60 * 60 * 1000));
        setTimeAway(awayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, 1000);

    return () => {
      unsubscribeAuth();
      if (unsubscribeSpace) unsubscribeSpace();
      clearInterval(timer);
    };
  }, [spaceId, spaceData?.timeDiff]);

  // --- ACTIONS ---
  const handleImageChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const saveNickname = async () => {
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const updatedSpaces = userDoc.data().spaces.map(s => 
          s.id === spaceId ? { ...s, partnerNickname: newNickname } : s
        );
        await updateDoc(userRef, { spaces: updatedSpaces });
        setSpaceData({ ...spaceData, partnerNickname: newNickname });
        setIsEditingNickname(false);
      }
    } catch (err) { console.error(err); }
  };

  const leaveSpace = async () => {
    if (!confirm("Are you sure you want to leave this space?")) return;
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const updatedSpaces = userDoc.data().spaces.filter(s => s.id !== spaceId);
      await updateDoc(userRef, { spaces: updatedSpaces });
      router.push('/my-spaces');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse text-slate-400">Opening Space...</div>;
  if (!spaceData) return <div className="min-h-screen flex items-center justify-center font-black">Space Not Found</div>;

  const role = spaceData.role || 'Couple';
  const themeKey = spaceData.settings?.theme || 'rose';
  const currentTheme = themes[themeKey];
  const config = roleConfigs[role];

  return (
    <main className={`flex min-h-screen ${currentTheme.bg} transition-all duration-500 relative overflow-hidden`}>
      
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className={`transition-all duration-500 bg-white/60 backdrop-blur-xl border-r border-white/20 flex flex-col p-6 sticky top-0 h-screen shadow-xl z-50 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mb-12 h-10 w-10 flex flex-col justify-center items-center gap-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
          <div className={`h-0.5 bg-slate-800 transition-all ${isSidebarOpen ? 'w-6 rotate-45 translate-y-2' : 'w-5'}`} />
          <div className={`h-0.5 bg-slate-800 w-5 transition-all ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
          <div className={`h-0.5 bg-slate-800 transition-all ${isSidebarOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
        </button>
        <nav className="space-y-8">
          <Link href="/my-spaces" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100"><span className="text-xl">🌌</span></div>
            {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-700">My Spaces</span>}
          </Link>
          <Link href="/settings" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100"><span className="text-xl">⚙️</span></div>
            {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-700">Settings</span>}
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
            <header className="mb-10 flex justify-between items-end">
              <div className="cursor-pointer group" onClick={() => setShowInfo(true)}>
                  <h1 className={`font-romantic italic font-black text-6xl ${currentTheme.title}`}>
                    {spaceData.spaceName} {config.icon}
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 flex items-center gap-2">
                    {membersDetails.length > 1 ? (
                        <>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Connected to {spaceData.partnerNickname || "Member"}
                        </>
                    ) : (
                        "Waiting for Connection..."
                    )} • Info ℹ️
                  </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: CALENDAR */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className={`bg-white p-6 rounded-[2.5rem] border ${currentTheme.card} shadow-xl`}>
                        <h3 className={`font-romantic italic text-xl mb-4 text-center ${currentTheme.text}`}>Timeline</h3>
                        <div className="grid grid-cols-7 gap-1 text-[10px] font-black text-center text-slate-800 mb-4 uppercase">
                            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-8">
                            {[...Array(31)].map((_, i) => (
                                <div key={i} className={`aspect-square flex items-center justify-center text-xs font-bold rounded-full ${i === (new Date().getDate() - 1) ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>{i + 1}</div>
                            ))}
                        </div>
                        <button className={`w-full py-3 rounded-2xl border-2 border-dashed ${currentTheme.border} text-[10px] font-black uppercase ${currentTheme.text}`}>+ Add Event</button>
                    </div>
                </aside>

                {/* CENTER: MEMORIES */}
                <section className="lg:col-span-6 space-y-6">
                    <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-[16px] border-white h-[500px] relative group overflow-hidden">
                        <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-slate-50 transition-all group-hover:bg-slate-100">
                            {mainImage ? <Image src={mainImage} alt="Memory" fill className="object-cover" /> : <div className="text-center text-slate-400 group-hover:text-slate-600 transition-all flex flex-col items-center"><span className="text-6xl mb-4">📸</span><p className="font-romantic italic text-2xl mb-2">Primary Memory</p><p className="text-[10px] font-black uppercase underline tracking-widest">Import Image</p></div>}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setMainImage)} />
                        </label>
                    </div>
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-6 h-[260px] flex flex-col border border-slate-50">
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 italic font-black text-xl">
                            {membersDetails.length > 1 ? (
                                <div className="text-center text-slate-400">
                                    <span className="text-4xl mb-2 block">💬</span>
                                    <p>Connection Active</p>
                                </div>
                            ) : (
                                <p className="opacity-40 animate-pulse">Waiting for them to join...</p>
                            )}
                        </div>
                        <div className="bg-slate-50 p-2 rounded-2xl flex gap-2">
                            <input type="text" placeholder="Type a note..." className="flex-1 bg-transparent px-4 outline-none text-xs font-bold text-slate-600" />
                            <button className={`w-10 h-10 ${currentTheme.chat} text-white rounded-xl shadow-md`}>➔</button>
                        </div>
                    </div>
                </section>

                {/* RIGHT: CLOCKS */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6 text-center">
                        <div><p className="text-[9px] font-black opacity-60 uppercase mb-1 tracking-widest">{spaceData.homeCity || "Local"}</p><p className="text-2xl font-black">{timeHome}</p></div>
                        <div className="h-[1px] bg-white/10" />
                        <div><p className="text-[9px] font-black text-amber-300 uppercase mb-1 tracking-widest">{spaceData.awayCity || "Away"}</p><p className="text-2xl font-black text-amber-300">{timeAway}</p></div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50 min-h-[300px]">
                        <h3 className="text-[10px] font-black tracking-widest text-slate-500 mb-8 text-center uppercase">{config.pulse}</h3>
                        <div className="space-y-6 text-center group">
                            {/* USER PULSE */}
                            <label className="w-full aspect-video rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-300 hover:border-slate-400 cursor-pointer relative overflow-hidden">
                                {pulseImage ? <Image src={pulseImage} alt="Pulse" fill className="object-cover" /> : <><span className="text-xl">+</span><p className="text-[8px] font-black uppercase mt-1">Your Pulse</p></>}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setPulseImage)} />
                            </label>

                            {/* PARTNER PULSE SLOT */}
                            <div className={`w-full aspect-video rounded-3xl border-2 border-slate-100 flex flex-col items-center justify-center transition-all ${membersDetails.length > 1 ? 'bg-slate-50' : 'bg-slate-50/20 opacity-30'}`}>
                                {membersDetails.length > 1 ? (
                                    <p className="text-[8px] font-black uppercase text-slate-400 italic">Waiting for their photo</p>
                                ) : (
                                    <p className="text-[8px] font-black uppercase text-slate-300 italic">🔒 Locked</p>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
      </div>

      {/* SPACE INFO DRAWER */}
      <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-all duration-500 z-[100] border-l border-slate-100 ${showInfo ? 'w-full md:w-[400px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 h-full flex flex-col overflow-y-auto no-scrollbar">
          <button onClick={() => setShowInfo(false)} className="text-left font-black text-slate-300 hover:text-slate-900 mb-8 uppercase tracking-widest text-xs">✕ Close</button>
          
          <div className="text-center mb-10">
            <div className={`w-24 h-24 mx-auto rounded-[2.5rem] ${currentTheme.accent} flex items-center justify-center text-4xl mb-4 shadow-xl text-white`}>{config.icon}</div>
            <h2 className="text-3xl font-black text-slate-900">{spaceData.spaceName}</h2>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest italic">Shared World</p>
          </div>

          <div className="space-y-8 flex-1">
            {/* MEMBERS SECTION */}
            <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Members ({membersDetails.length})</h3>
                <div className="space-y-4">
                    {membersDetails.map(member => (
                        <div key={member.uid} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-slate-400 uppercase text-xs">
                                {member.displayName?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-slate-800 text-sm">
                                    {member.uid === auth.currentUser?.uid ? "You" : (spaceData.partnerNickname || member.displayName || "Partner")}
                                </p>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Connected</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* NICKNAME SECTION */}
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Personal Nickname</h3>
                  {!isEditingNickname && (
                    <button onClick={() => setIsEditingNickname(true)} className="text-[10px] font-black text-rose-400 uppercase underline cursor-pointer">Edit</button>
                  )}
               </div>
               {isEditingNickname ? (
                 <div className="flex flex-col gap-2">
                    <input type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} className="bg-white border border-slate-200 p-3 rounded-xl outline-none font-bold text-slate-700" placeholder="e.g. Bestie" autoFocus />
                    <div className="flex gap-2">
                       <button onClick={saveNickname} className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-black uppercase">Save</button>
                       <button onClick={() => setIsEditingNickname(false)} className="flex-1 bg-slate-200 text-slate-600 py-2 rounded-xl text-xs font-black uppercase">Cancel</button>
                    </div>
                 </div>
               ) : <p className="text-xl font-black text-slate-800">{spaceData.partnerNickname || "No nickname set"}</p>}
            </div>

            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
               <p className="text-[10px] font-black uppercase text-amber-700 mb-2">Invite Code</p>
               <p className="font-mono text-2xl font-black text-amber-600 tracking-widest">{spaceData.joinCode}</p>
            </div>
          </div>

          <button onClick={leaveSpace} className="w-full py-5 mt-6 rounded-2xl bg-rose-50 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all cursor-pointer">Leave Space</button>
        </div>
      </div>

      {/* OVERLAY */}
      {showInfo && <div onClick={() => setShowInfo(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]" />}
    </main>
  );
}
'use client';
import { use, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SmartDashboard({ params }) {
  const resolvedParams = use(params);
  const spaceId = resolvedParams.id;

  const [spaceData, setSpaceData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeHome, setTimeHome] = useState('');
  const [timeAway, setTimeAway] = useState('');
  const [daysLeft, setDaysLeft] = useState(null);
  
  const [mainImage, setMainImage] = useState(null);
  const [pulseImage, setPulseImage] = useState(null);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const spaces = userDoc.data().spaces || [];
          const currentSpace = spaces.find(s => s.id === spaceId);
          setSpaceData(currentSpace);
          
          if (currentSpace?.reunionDate) {
            const target = new Date(currentSpace.reunionDate);
            const today = new Date();
            const diffTime = target - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysLeft(diffDays > 0 ? diffDays : 0);
          }
        }
        setLoading(false);
      }
    });

    const timer = setInterval(() => {
      const now = new Date();
      setTimeHome(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      if (spaceData?.timeDiff) {
        const offset = parseFloat(spaceData.timeDiff);
        const awayDate = new Date(now.getTime() + (offset * 60 * 60 * 1000));
        setTimeAway(awayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setTimeAway("SET LOCATION 📍");
      }
    }, 1000);

    return () => { unsubscribe(); clearInterval(timer); };
  }, [spaceId, spaceData?.timeDiff]);

  const handleImageChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(URL.createObjectURL(file));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest text-slate-400">Opening Space...</div>;
  if (!spaceData) return <div className="min-h-screen flex items-center justify-center font-black">Space Not Found</div>;

  const role = spaceData.role || 'Couple';
  const themeKey = spaceData.settings?.theme || 'rose';
  const currentTheme = themes[themeKey];
  const config = roleConfigs[role];

  return (
    <main className={`flex min-h-screen ${currentTheme.bg} transition-all duration-500`}>
      
      {/* 🛠️ NAVIGATION SIDEBAR */}
      <aside className={`transition-all duration-500 bg-white/60 backdrop-blur-xl border-r border-white/20 flex flex-col p-6 sticky top-0 h-screen shadow-xl z-50 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        
        {/* Toggle Button */}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mb-12 h-10 w-10 flex flex-col justify-center items-center gap-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
          <div className={`h-0.5 bg-slate-800 transition-all ${isSidebarOpen ? 'w-6 rotate-45 translate-y-2' : 'w-5'}`} />
          <div className={`h-0.5 bg-slate-800 w-5 transition-all ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
          <div className={`h-0.5 bg-slate-800 transition-all ${isSidebarOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
        </button>

        {/* Navigation Links */}
        <nav className="space-y-8">
          <Link href="/my-spaces" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100">
              <span className="text-xl">🌌</span>
            </div>
            {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-700">My Spaces</span>}
          </Link>

          <Link href="/settings" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100">
              <span className="text-xl">⚙️</span>
            </div>
            {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-700">Settings</span>}
          </Link>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA (Proportions Restored) */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
            <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className={`font-romantic italic font-black text-6xl ${currentTheme.title}`}>
                {spaceData.spaceName} {config.icon}
                </h1>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2`}>
                {spaceData.vibe || "Day 0"} • {role} Space • Connected ✨
                </p>
            </div>
            </header>

            {/* Grid proportional split: 3-6-3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: CALENDAR & REUNION */}
            <aside className="lg:col-span-3 space-y-6">
                <div className={`bg-white p-6 rounded-[2.5rem] border ${currentTheme.card} shadow-xl`}>
                <h3 className={`font-romantic italic text-xl mb-4 text-center ${currentTheme.text}`}>Timeline</h3>
                <div className="grid grid-cols-7 gap-1 text-[10px] font-black text-center text-slate-800 mb-4 uppercase">
                    {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-8">
                    {[...Array(31)].map((_, i) => (
                        <div key={i} className={`aspect-square flex items-center justify-center text-xs font-bold rounded-full ${i === (new Date().getDate() - 1) ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>
                            {i + 1}
                        </div>
                    ))}
                </div>
                <button className={`w-full py-3 rounded-2xl border-2 border-dashed ${currentTheme.border} text-[10px] font-black uppercase ${currentTheme.text}`}>+ Add First Event</button>
                </div>

                <div className="bg-[#FFF9C4] p-8 rounded-lg shadow-xl -rotate-2 border-t-[12px] border-[#FBC02D]/30 text-center">
                <p className="text-[10px] font-black uppercase text-amber-900 mb-2">{config.reunion}</p>
                {daysLeft !== null ? (
                    <div>
                    <h4 className="text-5xl font-black text-slate-800">{daysLeft}</h4>
                    <p className="text-[10px] font-black uppercase text-slate-500 mt-1">Sundowns Left ✈️</p>
                    </div>
                ) : (
                    <button className="text-3xl font-black text-slate-800 opacity-20 hover:opacity-100 transition-all uppercase italic">Set Date</button>
                )}
                </div>
            </aside>

            {/* CENTER: MEMORIES & CHAT (Increased Width/Scale) */}
            <section className="lg:col-span-6 space-y-6">
                <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-[16px] border-white h-[500px] relative group overflow-hidden">
                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-slate-50 transition-all group-hover:bg-slate-100">
                    {mainImage ? (
                        <Image src={mainImage} alt="Memory" fill className="object-cover" />
                    ) : (
                        <div className="text-center text-slate-400 group-hover:text-slate-600 transition-all flex flex-col items-center">
                        <span className="text-6xl mb-4">📸</span>
                        <p className="font-romantic italic text-2xl mb-2">Primary Memory</p>
                        <p className="text-[10px] font-black uppercase underline tracking-widest">Import Image</p>
                        </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setMainImage)} />
                    </label>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl p-6 h-[260px] flex flex-col border border-slate-50">
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic font-black text-xl">
                    <span className="text-4xl mb-2">💬</span>
                    <p>Encrypted Chat Ready</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-2xl flex gap-2">
                    <input type="text" placeholder="Type a sweet note..." className="flex-1 bg-transparent px-4 outline-none text-xs font-bold text-slate-600" />
                    <button className={`w-10 h-10 ${currentTheme.chat} text-white rounded-xl shadow-md`}>➔</button>
                </div>
                </div>
            </section>

            {/* RIGHT: CLOCKS & PULSE */}
            <aside className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6 text-center">
                <div className="group">
                    <p className="text-[9px] font-black opacity-60 uppercase mb-1 tracking-widest">{spaceData.homeCity || "Your City"}</p>
                    <p className="text-2xl font-black">{timeHome}</p>
                </div>
                <div className="h-[1px] bg-white/10" />
                <div className="group">
                    <p className="text-[9px] font-black text-amber-300 uppercase mb-1 tracking-widest">{spaceData.awayCity || "Their City"}</p>
                    <p className="text-2xl font-black text-amber-300">{timeAway}</p>
                </div>
                </div>

                <div className={`p-6 bg-white rounded-[2.5rem] shadow-xl border ${currentTheme.border}`}>
                    <p className={`text-[10px] font-black uppercase text-center mb-4 tracking-widest ${currentTheme.text}`}>{config.gap}</p>
                    <div className="relative w-full h-10 flex items-center">
                    <div className="w-full h-1 bg-slate-100 rounded-full" />
                    <div className={`absolute left-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${currentTheme.accent}`} />
                    <div className="absolute right-0 w-4 h-4 rounded-full border-4 border-white shadow-sm bg-amber-400" />
                    </div>
                    <p className="text-xs font-black text-center mt-2 text-slate-900 uppercase">
                    {spaceData.distance ? `${spaceData.distance} KM APART` : "LOCATION REQUIRED"}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50 min-h-[300px]">
                <h3 className="text-[10px] font-black tracking-widest text-slate-500 mb-8 text-center uppercase">{config.pulse}</h3>
                <div className="space-y-6 text-center group">
                    <label className="w-full aspect-video rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-300 hover:border-slate-400 transition-all cursor-pointer relative overflow-hidden">
                        {pulseImage ? (
                        <Image src={pulseImage} alt="Pulse" fill className="object-cover" />
                        ) : (
                        <>
                            <span className="text-xl">+</span>
                            <p className="text-[8px] font-black uppercase mt-1">Take Photo</p>
                        </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setPulseImage)} />
                    </label>
                    <p className={`mt-3 font-romantic italic font-bold text-lg text-slate-800`}>You ✨</p>
                </div>
                </div>
            </aside>
            </div>
        </div>
      </div>
    </main>
  );
}
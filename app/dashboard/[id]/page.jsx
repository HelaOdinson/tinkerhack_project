'use client';
import { use, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth, rtdb } from '@/lib/firebase'; 
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SmartDashboard({ params }) {
  const resolvedParams = use(params);
  const spaceId = resolvedParams.id;

  const [spaceData, setSpaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeHome, setTimeHome] = useState('');
  const [timeAway, setTimeAway] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // 1. CONFIGURATION MAPPING: This defines the "Blank State" for each category
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

  // 2. DATA FETCHING
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const spaces = userDoc.data().spaces || [];
          const currentSpace = spaces.find(s => s.id === spaceId);
          setSpaceData(currentSpace);
        }
        setLoading(false);
      }
    });

    const timer = setInterval(() => {
      const now = new Date();
      setTimeHome(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTimeAway("SET LOCATION 📍"); // Default blank state
    }, 1000);

    return () => { unsubscribe(); clearInterval(timer); };
  }, [spaceId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest text-slate-400">Opening Space...</div>;
  if (!spaceData) return <div className="min-h-screen flex items-center justify-center font-black">Space Not Found</div>;

  // 3. APPLY SETTINGS
  const role = spaceData.role || 'Couple';
  const themeKey = spaceData.settings?.theme || 'rose';
  const currentTheme = themes[themeKey];
  const config = roleConfigs[role];

  return (
    <main className={`flex min-h-screen ${currentTheme.bg} transition-all duration-500 p-8`}>
      <div className="max-w-7xl mx-auto w-full">
        
        {/* HEADER */}
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className={`font-romantic italic font-black text-6xl ${currentTheme.title}`}>{spaceData.spaceName} {config.icon}</h1>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-2 ${currentTheme.text}`}>
               Day 0 • {role} Space • Connected ✨
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT: CALENDAR & REUNION */}
          <aside className="md:col-span-3 space-y-6">
            <div className={`bg-white p-6 rounded-[2.5rem] border ${currentTheme.card} shadow-xl`}>
               <h3 className={`font-romantic italic text-xl mb-4 text-center ${currentTheme.text}`}>Timeline</h3>
               <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-center opacity-10 mb-4">
                 {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
               </div>
               <div className="grid grid-cols-7 gap-1 mb-8 opacity-20">
                 {[...Array(31)].map((_, i) => <div key={i} className="aspect-square flex items-center justify-center text-xs font-bold text-slate-400">{i + 1}</div>)}
               </div>
               <button className={`w-full py-3 rounded-2xl border-2 border-dashed ${currentTheme.border} text-[10px] font-black uppercase ${currentTheme.text}`}>+ Add First Event</button>
            </div>

            <div className="bg-[#FFF9C4] p-8 rounded-lg shadow-xl -rotate-2 border-t-[12px] border-[#FBC02D]/30 text-center">
              <p className="text-[10px] font-black uppercase text-amber-700 mb-2">{config.reunion}</p>
              <button className="text-3xl font-black text-slate-800 opacity-20 hover:opacity-100 transition-all uppercase italic">Set Date</button>
            </div>
          </aside>

          {/* CENTER: MEMORIES & CHAT */}
          <section className="md:col-span-6 space-y-6">
            <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-[16px] border-white h-[450px] relative flex flex-col items-center justify-center text-center group overflow-hidden">
               <div className="opacity-20 flex flex-col items-center group-hover:opacity-100 transition-all">
                  <span className="text-6xl mb-4">📸</span>
                  <p className="font-romantic italic text-2xl mb-2">Primary Memory</p>
                  <button className="text-[10px] font-black uppercase underline tracking-widest">Import Image</button>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl p-4 h-[260px] flex flex-col border border-slate-50">
               <div className="flex-1 flex items-center justify-center text-slate-200 opacity-20 italic font-black text-xl">Private Connection Active</div>
               <div className="bg-slate-50 p-2 rounded-2xl flex gap-2">
                  <div className="flex-1 px-4 text-xs font-bold text-slate-300 flex items-center italic">Type a welcome note...</div>
                  <div className={`w-10 h-10 ${currentTheme.chat} opacity-20 rounded-xl`} />
               </div>
            </div>
          </section>

          {/* RIGHT: CLOCKS & PULSE */}
          <aside className="md:col-span-3 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6 text-center">
               <div className="group cursor-pointer">
                  <p className="text-[9px] font-black opacity-40 uppercase mb-1">Your Time</p>
                  <p className="text-xl font-black group-hover:text-amber-400">{timeHome}</p>
               </div>
               <div className="h-[1px] bg-white/10" />
               <div className="group cursor-pointer">
                  <p className="text-[9px] font-black opacity-40 uppercase mb-1">Away</p>
                  <p className="text-xl font-black group-hover:text-amber-400">SET LOCATION 📍</p>
               </div>
            </div>

            <div className={`p-6 bg-white rounded-[2.5rem] shadow-xl border ${currentTheme.border}`}>
                <p className={`text-[10px] font-black uppercase text-center mb-4 tracking-widest ${currentTheme.text}`}>{config.gap}</p>
                <div className="relative w-full h-10 flex items-center opacity-20">
                   <div className="w-full h-1 bg-slate-100 rounded-full" />
                   <div className={`absolute left-0 w-3 h-3 rounded-full ${currentTheme.accent}`} />
                   <div className="absolute right-0 w-3 h-3 rounded-full bg-amber-400" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50 min-h-[300px]">
               <h3 className="text-[10px] font-black tracking-widest text-slate-400 mb-8 text-center uppercase">{config.pulse}</h3>
               <div className="space-y-6 text-center group">
                  <div className="w-full aspect-video rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-slate-400 transition-all cursor-pointer">
                     <span className="text-xl">+</span>
                     <p className="text-[8px] font-black uppercase mt-1">Take Photo</p>
                  </div>
                  <p className={`mt-3 font-romantic italic font-bold text-lg ${currentTheme.text}`}>You ✨</p>
               </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
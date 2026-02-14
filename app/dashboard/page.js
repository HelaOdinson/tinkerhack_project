'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Dashboard() {
  const [theme, setTheme] = useState('rose');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeHome, setTimeHome] = useState('');
  const [timeAway, setTimeAway] = useState('');
  const [isZoomed, setIsZoomed] = useState(true);
  const [currentPic, setCurrentPic] = useState(1);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'her', text: 'Miss you already! ❤️' },
    { id: 2, sender: 'me', text: 'Me too, counting the days.' }
  ]);
  const [myPhoto, setMyPhoto] = useState('/memories/me.jpg');
  const [herPhoto, setHerPhoto] = useState('/memories/her.jpg');
  const chatEndRef = useRef(null);

  // Expanded Theme Object to control the Schedule Card colors
  const themes = {
    rose: { 
      bg: "bg-[#FFF0F3]", border: "border-rose-200", text: "text-rose-700", title: "text-rose-950", 
      accent: "bg-rose-400", chat: "bg-rose-400", card: "bg-rose-50 border-rose-300" 
    },
    green: { 
      bg: "bg-[#E8F5E9]", border: "border-emerald-200", text: "text-emerald-700", title: "text-emerald-950", 
      accent: "bg-emerald-400", chat: "bg-emerald-500", card: "bg-emerald-50 border-emerald-300" 
    },
    blue: { 
      bg: "bg-[#E3F2FD]", border: "border-blue-200", text: "text-blue-700", title: "text-blue-950", 
      accent: "bg-blue-400", chat: "bg-blue-500", card: "bg-blue-50 border-blue-300" 
    },
  };

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      setTimeHome(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const herDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      setTimeAway(herDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    const slideTimer = setInterval(() => setCurrentPic(prev => (prev % 3) + 1), 5000);
    return () => { clearInterval(timer); clearInterval(slideTimer); };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!mounted) return null;
  const currentTheme = themes[theme];

  return (
    <main className={`flex min-h-screen ${currentTheme.bg} transition-all duration-500 ease-in-out`}>
      
      {/* SIDEBAR */}
      <aside className={`transition-all duration-500 ease-in-out bg-white/40 backdrop-blur-2xl border-r border-white/20 flex flex-col p-4 sticky top-0 h-screen shadow-xl ${isSidebarExpanded ? 'w-72' : 'w-24'}`}>
        <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="flex flex-col gap-1.5 p-2 mb-10 cursor-pointer group w-fit">
          <div className={`h-0.5 w-6 bg-slate-800 transition-all ${isSidebarExpanded ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`h-0.5 w-6 bg-slate-800 transition-all ${isSidebarExpanded ? 'opacity-0' : ''}`} />
          <div className={`h-0.5 w-6 bg-slate-800 transition-all ${isSidebarExpanded ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        <div className={`flex items-center gap-3 mb-10 ${!isSidebarExpanded && 'justify-center'}`}>
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="Logo" fill className="object-contain rotate-[-5deg]" priority />
          </div>
          {isSidebarExpanded && <span className={`font-romantic italic font-black text-2xl ${currentTheme.title}`}>BeyondMiles</span>}
        </div>

        <nav className="flex-1 space-y-2">
          {['Dashboard', 'Memories', 'Settings'].map((item) => (
            <button key={item} className={`flex items-center gap-4 w-full px-3 py-3 rounded-xl hover:bg-white/60 transition-all font-bold text-sm ${currentTheme.text} ${!isSidebarExpanded && 'justify-center'}`}>
              <span className="text-xl">{item === 'Dashboard' ? '🏡' : item === 'Memories' ? '✨' : '⚙️'}</span>
              {isSidebarExpanded && <span>{item}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
          <div>
            <h1 className={`font-romantic italic font-black text-5xl tracking-tight ${currentTheme.title}`}>The Chaos Corner</h1>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${currentTheme.text}`}>5.5 Hours Apart • Connected ❤️</p>
          </div>

          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-3 rounded-3xl border border-white shadow-lg">
            <span className={`text-[10px] font-black uppercase tracking-widest mr-2 ${currentTheme.title}`}>Customise</span>
            {['rose', 'green', 'blue'].map((t) => (
              <button key={t} onClick={() => setTheme(t)} className={`w-8 h-8 rounded-full border-4 transition-transform hover:scale-110 ${t === 'rose' ? 'bg-rose-400' : t === 'green' ? 'bg-emerald-400' : 'bg-blue-400'} ${theme === t ? 'border-white shadow-md' : 'border-transparent opacity-70 cursor-pointer'}`} />
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto pb-10">
          
          {/* CALENDAR & SYNCED SCHEDULE */}
          <aside className="md:col-span-3 space-y-6">
            <div className={`bg-white p-6 rounded-[2.5rem] border ${currentTheme.border} shadow-2xl relative z-10`}>
              <h3 className={`font-romantic italic text-xl mb-4 text-center ${currentTheme.text}`}>Our Timeline</h3>
              <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-center opacity-30 mb-4">
                {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-8">
                {[...Array(31)].map((_, i) => (
                  <div key={i} className={`aspect-square flex items-center justify-center text-xs font-bold rounded-full ${i === 13 ? 'bg-slate-800 text-white shadow-lg' : `text-slate-400 ${currentTheme.text} opacity-80`}`}>{i + 1}</div>
                ))}
              </div>
              
              {/* FIXED & COLOR-SYNCED SCHEDULE CARD */}
              <div className={`p-4 rounded-2xl border-l-8 transition-colors duration-500 ${currentTheme.card} shadow-sm`}>
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🍿</span>
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-tighter">Netflix Night</p>
                 </div>
                 <p className={`text-sm font-bold ${currentTheme.text}`}>Stranger Things</p>
              </div>
            </div>

            <div className="bg-[#FFF9C4] p-8 rounded-lg shadow-xl -rotate-2 border-t-[12px] border-[#FBC02D]/30 text-center">
              <h4 className="text-7xl font-black text-slate-800 leading-none">12</h4>
              <p className="text-[10px] font-black uppercase text-amber-700 mt-2 italic">Sundowns Left ✈️</p>
            </div>
          </aside>

          {/* GALLERY & CHAT */}
          <section className="md:col-span-6 space-y-6">
            <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-[16px] border-white h-[450px] relative overflow-hidden group">
              <div onClick={() => setIsZoomed(!isZoomed)} className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-200 cursor-pointer">
                <Image src={`/memories/pic${currentPic}.jpg`} alt="Memory" fill priority className={`transition-all duration-1000 ${isZoomed ? 'object-cover object-top' : 'object-contain scale-95'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                  <p className="text-white font-romantic italic text-2xl drop-shadow-lg leading-tight">Forever favorite.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl p-4 h-[260px] flex flex-col border border-slate-50">
              <div className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium animate-reveal ${msg.sender === 'me' ? `${currentTheme.chat} text-white rounded-br-none` : 'bg-slate-100 text-slate-600 rounded-bl-none'}`}>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if (inputText.trim()) setMessages([...messages, { id: Date.now(), sender: 'me', text: inputText }]); setInputText(''); }} className="flex gap-2 mt-2 p-2 bg-slate-50 rounded-2xl">
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} type="text" placeholder="Send a note..." className="flex-1 bg-transparent px-4 outline-none text-sm font-medium text-slate-600" />
                <button type="submit" className={`w-10 h-10 ${currentTheme.chat} text-white rounded-xl hover:scale-110 transition-transform cursor-pointer shadow-md`}>➔</button>
              </form>
            </div>
          </section>

          {/* RIGHT ASIDE (Clocks & Pulse) */}
          <aside className="md:col-span-3 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl text-center">
               <div className="space-y-4">
                  <div>
                     <p className="text-[10px] font-black opacity-40 uppercase">Local</p>
                     <p className="text-2xl font-black">{timeHome}</p>
                  </div>
                  <div className="h-[1px] bg-white/10 w-full"></div>
                  <div>
                     <p className="text-[10px] font-black text-amber-300 uppercase">Her</p>
                     <p className="text-2xl font-black">{timeAway}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50">
               <h3 className="text-[10px] font-black tracking-widest text-slate-400 mb-6 text-center uppercase">Today's Pulse</h3>
               <div className="space-y-6">
                  <div className="text-center group">
                     <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-100 mb-2">
                        <Image src="/memories/me.jpg" alt="Me" fill className="object-cover" />
                     </div>
                     <p className={`font-romantic italic font-bold text-lg ${currentTheme.text}`}>Topher ✨</p>
                  </div>
                  <div className="text-center group">
                     <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-100 mb-2">
                        <Image src="/memories/her.jpg" alt="Her" fill className="object-cover" />
                     </div>
                     <p className={`font-romantic italic font-bold text-lg ${currentTheme.text}`}>Annabel 🌸</p>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
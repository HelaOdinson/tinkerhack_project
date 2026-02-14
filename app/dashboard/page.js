'use client';
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '../../lib/firebase'; 
import { ref, onValue, push, serverTimestamp } from 'firebase/database';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const spaceId = searchParams.get("space");
  const [theme, setTheme] = useState('rose');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeHome, setTimeHome] = useState('');
  const [timeAway, setTimeAway] = useState('');
  const [isZoomed, setIsZoomed] = useState(true);
  const [currentPic, setCurrentPic] = useState(1);
  const [inputText, setInputText] = useState('');
  
  const [messages, setMessages] = useState([
    { id: 'pre-1', sender: 'her', text: 'Kazhichoda??' },
    { id: 'pre-2', sender: 'me', text: 'Illeda innu pattiniya' }
  ]);
  
  const chatEndRef = useRef(null);

  const themes = {
    rose: { bg: "bg-[#FFF0F3]", border: "border-rose-200", text: "text-rose-700", title: "text-rose-950", accent: "bg-rose-400", chat: "bg-rose-400", card: "bg-rose-50 border-rose-300" },
    green: { bg: "bg-[#E8F5E9]", border: "border-emerald-200", text: "text-emerald-700", title: "text-emerald-950", accent: "bg-emerald-400", chat: "bg-emerald-500", card: "bg-emerald-50 border-emerald-300" },
    blue: { bg: "bg-[#E3F2FD]", border: "border-blue-200", text: "text-blue-700", title: "text-blue-950", accent: "bg-blue-400", chat: "bg-blue-500", card: "bg-blue-50 border-blue-300" },
  };

  const spaceConfig = {
    space1: { title: "Cyber Squad", tagline: "Encrypted & Connected 🔐" },
    space2: { title: "Web Wizards", tagline: "Building Magic Together ✨" },
    space3: { title: "AI Circle", tagline: "Learning Beyond Limits 🤖" },
  };

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      setTimeHome(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const herDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      setTimeAway(herDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    const messagesRef = ref(db, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgList = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setMessages([
          { id: 'pre-1', sender: 'her', text: 'Kazhichoda??' },
          { id: 'pre-2', sender: 'me', text: 'Illeda innu pattiniya' },
          ...msgList
        ]);
      }
    });

    const slideTimer = setInterval(() => setCurrentPic(prev => (prev % 3) + 1), 5000);
    return () => { clearInterval(timer); clearInterval(slideTimer); unsubscribe(); };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const nextPic = () => setCurrentPic(prev => (prev % 3) + 1);
  const prevPic = () => setCurrentPic(prev => (prev === 1 ? 3 : prev - 1));

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await push(ref(db, 'messages'), {
      text: inputText,
      sender: 'me',
      timestamp: serverTimestamp()
    });
    setInputText('');
  };

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
          <div className="relative w-10 h-10"><Image src="/logo.png" alt="Logo" fill className="object-contain rotate-[-5deg]" priority /></div>
          {isSidebarExpanded && <span className={`font-romantic italic font-black text-2xl ${currentTheme.title}`}>BeyondMiles</span>}
        </div>

        <nav className="flex-1 space-y-2">
          {['Dashboard', 'Settings'].map((item) => (
            <button key={item} className={`flex items-center gap-4 w-full px-3 py-3 rounded-xl hover:bg-white/60 transition-all font-bold text-sm ${currentTheme.text} ${!isSidebarExpanded && 'justify-center'}`}>
              <span className="text-xl">{item === 'Dashboard' ? '🏡' : '⚙️'}</span>
              {isSidebarExpanded && <span>{item}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
          <div>
            <h1 className={`font-romantic italic font-black text-5xl tracking-tight ${currentTheme.title}`}>
              {spaceId && spaceConfig[spaceId] ? spaceConfig[spaceId].title : "The Chaos Corner"}
            </h1>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${currentTheme.text}`}>
              {spaceId && spaceConfig[spaceId] ? spaceConfig[spaceId].tagline : "5.5 Hours Apart • Connected ❤️"}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-3 rounded-3xl border border-white shadow-lg">
            <span className={`text-[10px] font-black uppercase tracking-widest mr-2 ${currentTheme.title}`}>Customise</span>
            {['rose', 'green', 'blue'].map((t) => (
              <button key={t} onClick={() => setTheme(t)} className={`w-8 h-8 rounded-full border-4 transition-transform hover:scale-110 ${t === 'rose' ? 'bg-rose-400' : t === 'green' ? 'bg-emerald-400' : 'bg-blue-400'} ${theme === t ? 'border-white shadow-md' : 'border-transparent opacity-70 cursor-pointer'}`} />
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto pb-10">
          <aside className="md:col-span-3 space-y-6">
            <div className={`bg-white p-6 rounded-[2.5rem] border ${currentTheme.border} shadow-2xl relative z-10`}>
              <h3 className={`font-romantic italic text-xl mb-4 text-center ${currentTheme.text}`}>Our Timeline</h3>
              <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-center opacity-30 mb-4">
                {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-6">
                {[...Array(31)].map((_, i) => (
                  <div key={i} className={`aspect-square flex items-center justify-center text-xs font-bold rounded-full ${i === 13 ? 'bg-slate-800 text-white shadow-lg' : `text-slate-400 ${currentTheme.text} opacity-80`}`}>{i + 1}</div>
                ))}
              </div>
              <div className={`p-4 rounded-2xl border-l-8 transition-colors duration-500 ${currentTheme.card} shadow-sm mb-6`}>
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🍿</span>
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-tighter">Netflix Night</p>
                 </div>
                 <p className={`text-sm font-bold ${currentTheme.text}`}>Stranger Things</p>
              </div>

              <div className={`p-5 rounded-2xl bg-white/80 border-2 ${currentTheme.border} shadow-inner flex flex-col items-center text-center`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${currentTheme.text}`}>The Gap Between Us</p>
                <div className="relative w-full h-14 mb-4 flex items-center justify-center">
                  <div className="absolute w-full h-[3px] bg-slate-200 rounded-full top-1/2 -translate-y-1/2"></div>
                  <div className={`absolute left-0 w-4 h-4 rounded-full ${currentTheme.accent} border-2 border-white shadow-md z-20`}></div>
                  <div className="absolute right-0 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-md z-20 animate-pulse"></div>
                  <div className={`z-30 bg-slate-800 text-white px-4 py-1.5 rounded-full shadow-lg text-sm font-black italic tracking-tighter`}>8,200 km</div>
                </div>
                <div className="flex justify-between w-full px-2">
                  <div className="flex flex-col items-start"><span className="text-[8px] font-black uppercase opacity-40">From</span><span className={`text-xs font-black ${currentTheme.title}`}>Kerala 🌴</span></div>
                  <div className="flex flex-col items-end"><span className="text-[8px] font-black uppercase opacity-40">To</span><span className={`text-xs font-black ${currentTheme.title}`}>London 🎡</span></div>
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9C4] p-8 rounded-lg shadow-xl -rotate-2 border-t-[12px] border-[#FBC02D]/30 text-center">
              <h4 className="text-7xl font-black text-slate-800 leading-none">12</h4>
              <p className="text-[10px] font-black uppercase text-amber-700 mt-2 italic">Sundowns Left ✈️</p>
            </div>
          </aside>

          <section className="md:col-span-6 space-y-6 text-center">
            {/* Main Slideshow with Hover Indicators */}
            <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-[16px] border-white h-[450px] relative overflow-hidden group">
              <div onClick={() => setIsZoomed(!isZoomed)} className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-200 cursor-pointer">
                <Image src={`/memories/pic${currentPic}.jpg`} alt="Memory" fill priority className={`transition-all duration-1000 ${isZoomed ? 'object-cover object-top' : 'object-contain scale-95'}`} />
                
                {/* Left Indicator */}
                <button 
                  onClick={(e) => { e.stopPropagation(); prevPic(); }} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 z-30"
                >
                  ❮
                </button>
                
                {/* Right Indicator */}
                <button 
                  onClick={(e) => { e.stopPropagation(); nextPic(); }} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 z-30"
                >
                  ❯
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                  <p className="text-white font-romantic italic text-2xl drop-shadow-lg leading-tight">Forever favorite.</p>
                </div>
              </div>
            </div>

            <Link href="/memories" className={`inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white border-2 ${currentTheme.border} ${currentTheme.text} font-black uppercase text-[10px] tracking-[0.3em] shadow-lg hover:scale-105 transition-all active:scale-95 group`}>
              <span>Explore Gallery</span>
              <span className="group-hover:translate-x-1 transition-transform">✨</span>
            </Link>

            <div className="bg-white rounded-[2.5rem] shadow-xl p-4 h-[260px] flex flex-col border border-slate-50">
              <div className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${msg.sender === 'me' ? `${currentTheme.chat} text-white rounded-br-none` : 'bg-slate-100 text-slate-600 rounded-bl-none'}`}>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 mt-2 p-2 bg-slate-50 rounded-2xl">
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} type="text" placeholder="Type here..." className="flex-1 bg-transparent px-4 outline-none text-sm font-medium text-slate-600" />
                <button type="submit" className={`w-10 h-10 ${currentTheme.chat} text-white rounded-xl hover:scale-110 transition-transform cursor-pointer shadow-md`}>➔</button>
              </form>
            </div>
          </section>

          <aside className="md:col-span-3 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl text-center">
               <div className="space-y-4">
                  <div className="flex justify-between items-center"><p className="text-[10px] font-black opacity-40 uppercase">Local</p><p className="text-2xl font-black">{timeHome}</p></div>
                  <div className="h-[1px] bg-white/10 w-full"></div>
                  <div className="flex justify-between items-center"><p className="text-[10px] font-black text-amber-300 uppercase">Her</p><p className="text-2xl font-black">{timeAway}</p></div>
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
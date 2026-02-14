'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Dashboard() {
  const [theme, setTheme] = useState('rose');
  const [timeHome, setTimeHome] = useState('');
  const [timeAway, setTimeAway] = useState('');
  const [currentPic, setCurrentPic] = useState(1);
  const [mounted, setMounted] = useState(false);

  // States for the Uploadable Photos
  const [myPhoto, setMyPhoto] = useState('/memories/me.jpg');
  const [herPhoto, setHerPhoto] = useState('/memories/her.jpg');

  // Deep Themes Mapping
  const themes = {
    rose: "bg-[#FFF0F3] border-rose-200 accent-rose-500 text-rose-700 shadow-rose-200/50",
    green: "bg-[#E8F5E9] border-emerald-200 accent-emerald-500 text-emerald-700 shadow-emerald-200/50",
    blue: "bg-[#E3F2FD] border-blue-200 accent-blue-500 text-blue-700 shadow-blue-200/50",
  };

  // 1. Logic for Clocks, Slideshow, and Hydration
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      setTimeHome(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      // Adjust the 5.5 to your partner's actual timezone difference
      const herDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      setTimeAway(herDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    const slideTimer = setInterval(() => {
      setCurrentPic(prev => (prev % 3) + 1);
    }, 5000);

    return () => { clearInterval(timer); clearInterval(slideTimer); };
  }, []);

  // 2. Upload Handler Logic
  const handleUpload = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (r) => {
        if (target === 'me') setMyPhoto(r.target.result);
        if (target === 'her') setHerPhoto(r.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <main className={`min-h-screen ${themes[theme].split(' ')[0]} text-slate-800 p-4 md:p-8 font-sans transition-all duration-700`}>
      
      {/* HEADER: LOGO & THEME PICKER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-reveal">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Logo" width={55} height={55} className="drop-shadow-md" />
          <div>
            <h1 className="font-romantic italic font-black text-4xl text-slate-800 tracking-tight">The Chaos Corner</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full animate-pulse ${theme === 'rose' ? 'bg-rose-500' : theme === 'green' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Connected Globally</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-3 rounded-3xl border border-white shadow-lg">
          {['rose', 'green', 'blue'].map((t) => (
            <button 
              key={t} 
              onClick={() => setTheme(t)} 
              className={`w-10 h-10 rounded-full border-4 transition-all transform hover:scale-110 ${t === 'rose' ? 'bg-rose-400' : t === 'green' ? 'bg-emerald-400' : t === 'blue' ? 'bg-blue-400' : ''} ${theme === t ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 cursor-pointer'}`} 
            />
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
        
        {/* LEFT: CALENDAR WIDGET */}
        <aside className={`md:col-span-3 bg-white/90 p-6 rounded-[2.5rem] border ${themes[theme].split(' ')[1]} shadow-2xl animate-reveal delay-100`}>
          <h3 className="font-romantic italic text-xl mb-4 text-center">Our Timeline</h3>
          <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-center opacity-30 mb-4">
            {['S','M','T','W','T','F','S'].map((d, i) => <span key={`label-${i}`}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1 mb-8">
            {[...Array(31)].map((_, i) => (
              <div key={`day-${i}`} className={`aspect-square flex items-center justify-center text-xs rounded-full transition-colors ${i === 13 ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-100'}`}>{i + 1}</div>
            ))}
          </div>
          <div className={`p-5 rounded-2xl border-l-8 ${theme === 'rose' ? 'border-l-rose-400' : theme === 'green' ? 'border-l-emerald-400' : 'border-l-blue-400'} bg-white shadow-sm`}>
             <p className="text-[10px] font-black opacity-40 uppercase tracking-tighter">Netflix Night 🍿</p>
             <p className="text-sm font-bold">Stranger Things</p>
          </div>
        </aside>

        {/* CENTER: SLIDESHOW GALLERY */}
        <section className="md:col-span-6 space-y-6">
          <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-[16px] border-white h-[500px] relative overflow-hidden group animate-reveal delay-200">
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-slate-200">
              <Image 
                src={`/memories/pic${currentPic}.jpg`} 
                alt="Memory" 
                fill 
                className="object-cover transition-opacity duration-1000 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                <p className="text-white font-romantic italic text-3xl drop-shadow-lg leading-tight">Forever favorite moments.</p>
              </div>
            </div>
          </div>
          
          {/* CHAT BOX */}
          <form onSubmit={(e) => e.preventDefault()} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-4 animate-reveal">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl">💌</div>
            <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent outline-none font-medium text-slate-600" />
            <button type="submit" className={`w-12 h-12 rounded-2xl text-white shadow-lg transition-transform hover:scale-110 cursor-pointer ${theme === 'rose' ? 'bg-rose-500' : theme === 'green' ? 'bg-emerald-500' : 'bg-blue-500'}`}>➔</button>
          </form>
        </section>

        {/* RIGHT: REUNION & UPLOADABLE PULSE */}
        <aside className="md:col-span-3 space-y-6">
          
          {/* REUNION STICKY NOTE */}
          <div className="bg-[#FFF9C4] p-8 rounded-lg shadow-xl -rotate-2 border-t-[12px] border-[#FBC02D]/30 animate-reveal delay-300">
            <p className="font-romantic italic text-amber-800 text-xl text-center">Countdown:</p>
            <h4 className="text-7xl font-black text-slate-800 my-2 tracking-tighter text-center">12</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 text-center">Days until flight ✈️</p>
          </div>

          {/* DUAL CLOCKS */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl animate-reveal">
             <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black opacity-40 uppercase">Me</p>
                   <p className="text-2xl font-black">{timeHome}</p>
                </div>
                <div className="h-[1px] bg-white/10 w-full"></div>
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black text-amber-300 uppercase">Her</p>
                   <p className="text-2xl font-black">{timeAway}</p>
                </div>
             </div>
          </div>

          {/* INTERACTIVE TODAY'S PULSE (Uploadable) */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50 animate-reveal delay-400">
             <h3 className="text-[10px] font-black tracking-widest text-slate-400 mb-6 text-center uppercase">Today's Pulse</h3>
             <div className="grid grid-cols-2 gap-3">
                
                {/* My Pulse Upload */}
                <label className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-inner bg-slate-100 cursor-pointer group">
                   <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'me')} />
                   <Image src={myPhoto} alt="Me" fill className="object-cover group-hover:scale-110 transition-transform" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">CHANGE</div>
                </label>

                {/* Her Pulse Upload */}
                <label className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-inner bg-slate-100 cursor-pointer group">
                   <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'her')} />
                   <Image src={herPhoto} alt="Her" fill className="object-cover group-hover:scale-110 transition-transform" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">CHANGE</div>
                </label>

             </div>
          </div>

        </aside>
      </div>
    </main>
  );
}
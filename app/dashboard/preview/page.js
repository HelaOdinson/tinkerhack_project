'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function FullCategoryShowcase() {
  const [previews, setPreviews] = useState({});

  const configs = [
    {
      id: 'Couple',
      name: "The Couple Space",
      theme: { bg: "bg-[#FFF0F3]", border: "border-rose-200", text: "text-rose-700", title: "text-rose-950", accent: "bg-rose-400", chat: "bg-rose-400", card: "bg-rose-50 border-rose-300" },
      labels: { reunion: "Days Until Reunion ❤️", pulse: "Our Pulse", gap: "The Gap Between Us" },
      icon: "👩‍❤️‍👨"
    },
    {
      id: 'Friends',
      name: "The Squad Hub",
      theme: { bg: "bg-[#E3F2FD]", border: "border-blue-200", text: "text-blue-700", title: "text-blue-950", accent: "bg-blue-400", chat: "bg-blue-500", card: "bg-blue-50 border-blue-300" },
      labels: { reunion: "Next Squad Meet 🍕", pulse: "Squad Status", gap: "Squad Spread" },
      icon: "⚡"
    },
    {
      id: 'HouseFamily',
      name: "Roomie Basecamp",
      theme: { bg: "bg-[#E8F5E9]", border: "border-emerald-200", text: "text-emerald-700", title: "text-emerald-950", accent: "bg-emerald-400", chat: "bg-emerald-500", card: "bg-emerald-50 border-emerald-300" },
      labels: { reunion: "Homecoming Date 🏠", pulse: "Family Pulse", gap: "Member Distance" },
      icon: "🔑"
    },
    {
      id: 'Custom',
      name: "The Custom Lab",
      theme: { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-700", title: "text-slate-950", accent: "bg-slate-800", chat: "bg-slate-800", card: "bg-white border-slate-200" },
      labels: { reunion: "Next Milestone ✨", pulse: "Pulse", gap: "Gap" },
      icon: "🛠️"
    }
  ];

  const handleUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) setPreviews({ ...previews, [key]: URL.createObjectURL(file) });
  };

  return (
    <main className="min-h-screen bg-slate-200 p-10 space-y-20">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-black italic tracking-tighter">Space Template Gallery</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-4">Reviewing all 4 categories in "Day 0" Blank State</p>
      </header>

      {configs.map((space) => (
        <section key={space.id} className={`${space.theme.bg} rounded-[4rem] shadow-2xl p-12 border-[12px] border-white max-w-7xl mx-auto`}>
          
          {/* HEADER AREA */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className={`font-romantic italic font-black text-5xl ${space.theme.title}`}>{space.name} {space.icon}</h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${space.theme.text}`}>No Location Set • Connected ✨</p>
            </div>
            <button className="bg-white/50 backdrop-blur-md px-6 py-2 rounded-2xl text-[10px] font-black uppercase border border-white">Customize Theme</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* LEFT ASIDE: CALENDAR & REUNION */}
            <aside className="md:col-span-3 space-y-6">
              <div className={`bg-white p-6 rounded-[2.5rem] border ${space.theme.border} shadow-xl`}>
                <h3 className={`font-romantic italic text-xl mb-4 text-center ${space.theme.text}`}>Timeline</h3>
                <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-center opacity-30 mb-4">
                  {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {[...Array(31)].map((_, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center text-xs font-bold rounded-full text-slate-300">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <button className={`w-full py-3 rounded-2xl border-2 border-dashed ${space.theme.border} text-[10px] font-black uppercase ${space.theme.text}`}>+ Add First Event</button>
              </div>

              {/* REUNION WIDGET */}
              <div className="bg-[#FFF9C4] p-8 rounded-lg shadow-xl -rotate-2 border-t-[12px] border-[#FBC02D]/30 text-center cursor-pointer group">
                <p className="text-[10px] font-black uppercase text-amber-700 mb-2">{space.labels.reunion}</p>
                <h4 className="text-3xl font-black text-slate-800 opacity-20 group-hover:opacity-100 transition-all uppercase">Set Date</h4>
              </div>
            </aside>

            {/* CENTER SECTION: SLIDESHOW & CHAT */}
            <section className="md:col-span-6 space-y-6">
              <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-[16px] border-white h-[450px] relative overflow-hidden group">
                <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-slate-50 transition-all hover:bg-slate-100">
                  {previews[`${space.id}-main`] ? (
                    <Image src={previews[`${space.id}-main`]} alt="Memory" fill className="object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">📸</span>
                      <p className="font-romantic italic text-2xl text-slate-300">Import Memory</p>
                    </div>
                  )}
                  <input type="file" className="hidden" onChange={(e) => handleUpload(e, `${space.id}-main`)} />
                </label>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-xl p-4 h-[260px] flex flex-col border border-slate-50">
                <div className="flex-1 flex items-center justify-center opacity-10 font-black italic">Encrypted Chat Waiting...</div>
                <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl">
                  <div className="flex-1 text-sm font-bold text-slate-300 px-4 flex items-center italic">Start a conversation</div>
                  <div className={`w-10 h-10 ${space.theme.chat} rounded-xl opacity-20`} />
                </div>
              </div>
            </section>

            {/* RIGHT ASIDE: DISTANCE & PULSE */}
            <aside className="md:col-span-3 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl text-center space-y-4">
                 <div><p className="text-[9px] font-black opacity-40 uppercase">Your Time</p><p className="text-xl font-black">SET HOME 📍</p></div>
                 <div className="h-[1px] bg-white/10" />
                 <div><p className="text-[9px] font-black text-amber-300 uppercase">Away</p><p className="text-xl font-black">SET AWAY 📍</p></div>
              </div>

              {/* DISTANCE GAP WIDGET */}
              <div className={`p-6 bg-white rounded-[2.5rem] shadow-xl border ${space.theme.border}`}>
                <p className={`text-[10px] font-black uppercase text-center mb-4 tracking-widest ${space.theme.text}`}>{space.labels.gap}</p>
                <div className="relative w-full h-10 flex items-center">
                   <div className="w-full h-1 bg-slate-100 rounded-full" />
                   <div className={`absolute left-0 w-3 h-3 rounded-full ${space.theme.accent}`} />
                   <div className="absolute right-0 w-3 h-3 rounded-full bg-amber-400" />
                </div>
                <p className="text-[10px] font-black opacity-20 text-center mt-2 uppercase">Location Required</p>
              </div>

              {/* TODAY'S MOMENTS / PULSE */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50">
                <h3 className="text-[10px] font-black tracking-widest text-slate-400 mb-6 text-center uppercase">{space.labels.pulse}</h3>
                <div className="space-y-6">
                  <div className="text-center group">
                    <label className="relative block aspect-video rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer overflow-hidden transition-all hover:border-slate-400">
                      {previews[`${space.id}-pulse`] ? (
                        <Image src={previews[`${space.id}-pulse`]} alt="Pulse" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                          <span className="text-xl">🤳</span>
                          <p className="text-[8px] font-black uppercase mt-1">Add Pulse</p>
                        </div>
                      )}
                      <input type="file" className="hidden" onChange={(e) => handleUpload(e, `${space.id}-pulse`)} />
                    </label>
                    <p className={`mt-2 font-romantic italic font-bold text-lg ${space.theme.text}`}>You ✨</p>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </section>
      ))}
    </main>
  );
}
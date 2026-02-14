'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CreateSpace() {
  const [step, setStep] = useState(1);
  const [spaceName, setSpaceName] = useState('');
  const [vibe, setVibe] = useState('');
  const [locations, setLocations] = useState({ home: '', away: '' });
  const [reunionDate, setReunionDate] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false); // New state for copy feedback

  // Generate a random code when the user reaches the final step
  useEffect(() => {
    if (step === 5) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCode(code);
    }
  }, [step]);

  // New function to handle copying
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1 && spaceName) setStep(2);
    if (step === 3 && locations.home && locations.away) setStep(4);
    if (step === 4 && reunionDate) setStep(5);
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-rose-50 shadow-2xl shadow-rose-100/30 animate-reveal">
        
        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-rose-400' : 'bg-slate-100'}`}></div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6 animate-reveal">
              <h2 className="text-3xl font-black tracking-tight leading-tight">Name your <span className="text-rose-400">space</span>.</h2>
              <input autoFocus type="text" placeholder="e.g. The Chaos Corner" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-rose-200 outline-none text-lg" />
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold cursor-pointer transition-all hover:bg-rose-500">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-reveal">
              <h2 className="text-3xl font-black tracking-tight leading-tight">What's the <span className="text-amber-400">vibe</span> today?</h2>
              <div className="grid grid-cols-1 gap-3">
                {['Romantic 🕯️', 'Playful 🧸', 'Deep 🌊'].map((v) => (
                  <button key={v} type="button" onClick={() => { setVibe(v); setStep(3); }} className="w-full p-4 rounded-2xl border-2 border-slate-50 hover:border-amber-200 hover:bg-amber-50 text-left font-bold cursor-pointer">{v}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-reveal">
              <h2 className="text-3xl font-black tracking-tight leading-tight">Where are you <span className="text-rose-400">both</span>?</h2>
              <div className="space-y-3">
                <input autoFocus type="text" placeholder="Your City" value={locations.home} onChange={(e) => setLocations({...locations, home: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none" />
                <input type="text" placeholder="Their City" value={locations.away} onChange={(e) => setLocations({...locations, away: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none" />
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold cursor-pointer">Calculate Distance</button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-reveal">
              <h2 className="text-3xl font-black tracking-tight leading-tight">When is the <span className="text-rose-400">reunion</span>?</h2>
              <input autoFocus type="date" value={reunionDate} onChange={(e) => setReunionDate(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none cursor-pointer" />
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold cursor-pointer">Finish Setup</button>
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-6 animate-reveal">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black tracking-tight">Space Created!</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Share this code with your partner so they can join you.</p>
              
              {/* UPDATED CODE BOX WITH COPY FUNCTION */}
              <div 
                onClick={handleCopy}
                className="bg-amber-50 border-2 border-dashed border-amber-200 p-6 rounded-3xl mt-4 cursor-pointer hover:bg-amber-100 transition-all active:scale-95 group relative"
              >
                <span className="text-4xl font-black tracking-widest text-amber-600 select-all font-mono">
                  {generatedCode || 'BEYOND26'}
                </span>
                <p className="text-[10px] text-amber-400 mt-2 font-bold uppercase tracking-wider">
                  {copied ? '✅ Code Copied!' : 'Click to copy code'}
                </p>
              </div>

              <Link href="/dashboard">
                <button type="button" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-xl hover:bg-rose-500 transition-all cursor-pointer">Enter Space</button>
              </Link>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
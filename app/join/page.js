'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function JoinSpace() {
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (inviteCode.length >= 4) {
      // In your actual demo, you can just click through
      window.location.href = '/dashboard';
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-rose-50 shadow-2xl shadow-rose-100/30 animate-reveal">
        
        <form onSubmit={handleJoin} className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight mb-2">Join a <span className="text-rose-400">Space</span></h1>
            <p className="text-slate-500 font-medium leading-relaxed">Paste the unique 6-digit code sent by your partner.</p>
          </div>

          <div className="space-y-4">
            <input 
              autoFocus
              type="text" 
              placeholder="Ex: XM492P"
              maxLength={8}
              value={inviteCode.toUpperCase()}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full p-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-rose-200 outline-none text-center text-3xl font-black tracking-[0.2em] transition-all placeholder:text-slate-200 placeholder:tracking-normal"
            />
            
            <button 
              type="submit"
              disabled={inviteCode.length < 4}
              className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xl hover:bg-rose-500 transition-all disabled:opacity-50 cursor-pointer shadow-xl"
            >
              Enter Space
            </button>
          </div>

          <Link href="/create" className="block text-center text-slate-400 font-bold hover:text-amber-500 transition-colors cursor-pointer text-sm">
            Wait, I want to create a space instead →
          </Link>
        </form>
      </div>
    </main>
  );
}
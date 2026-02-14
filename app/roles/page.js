'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [customRole, setCustomRole] = useState('');

  const roles = [
    { id: 'partner', label: 'Girlfriend / Boyfriend', icon: '❤️' },
    { id: 'friend', label: 'Friend', icon: '🤝' },
    { id: 'sibling', label: 'Siblings', icon: '🧒' },
    { id: 'family', label: 'Family', icon: '🏠' },
  ];

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans p-6 flex flex-col items-center justify-center">
      
      {/* 1. STYLISH HEADING */}
      <div className="text-center mb-12 animate-reveal">
        <h1 className="font-romantic italic font-black text-5xl text-slate-800 mb-4">
          Whom are you staying close to?
        </h1>
        <p className="text-slate-500 font-medium">Select your relationship to personalize your space.</p>
      </div>

      {/* 2. ROLE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
        {roles.map((role, index) => (
          <button
            key={role.id}
            onClick={() => { setSelectedRole(role.id); setCustomRole(''); }}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 animate-reveal delay-${(index + 1) * 100} ${
              selectedRole === role.id 
              ? 'border-rose-400 bg-rose-50/50 shadow-md scale-[1.02]' 
              : 'border-slate-100 bg-white hover:border-amber-200 cursor-pointer'
            }`}
          >
            <span className="text-3xl">{role.icon}</span>
            <span className="font-bold text-lg text-slate-700">{role.label}</span>
          </button>
        ))}

        {/* CUSTOM OPTION */}
        <div className={`p-6 rounded-2xl border-2 bg-white flex flex-col gap-2 animate-reveal delay-500 transition-all ${selectedRole === 'custom' ? 'border-amber-400 shadow-md' : 'border-slate-100'}`}>
          <div className="flex items-center gap-4">
             <span className="text-3xl">✨</span>
             <input 
               type="text" 
               placeholder="Custom Relationship..." 
               value={customRole}
               onChange={(e) => { setCustomRole(e.target.value); setSelectedRole('custom'); }}
               className="bg-transparent border-none outline-none font-bold text-lg text-slate-700 placeholder:text-slate-300 w-full"
             />
          </div>
        </div>
      </div>

      {/* 3. CREATE OR JOIN OPTIONS (Only shows after selection) */}
      {(selectedRole || customRole) && (
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl animate-reveal">
          <Link href="/create" className="flex-1 cursor-pointer">
            <button className="w-full py-6 rounded-2xl bg-gradient-to-r from-rose-400 to-amber-400 text-white font-black text-xl shadow-xl hover:scale-105 transition-all cursor-pointer">
              Create Space
            </button>
          </Link>
          
          <Link href="/join" className="flex-1 cursor-pointer">
      <button className="w-full py-6 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 font-black text-xl hover:bg-slate-50 transition-all cursor-pointer">
        Join Space
      </button>
    </Link>
  </div>
)}

    </main>
  );
}
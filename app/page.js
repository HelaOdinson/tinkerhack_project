'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [randomQuote, setRandomQuote] = useState("keeping the bond alive, miles apart.");

  const subheadings = [
    "distance is just a test to see how far love can travel.",
    "12 days until chaos resumes 🫶",
    "keeping the bond alive, miles apart.",
    "because some people are worth the long flight.",
    "staying close in heart, even when far in miles.",
    "love knows no distance; it hath no continent."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * subheadings.length);
      setRandomQuote(subheadings[randomIndex]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans overflow-hidden">
      
      {/* 1. TASKBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo & Name Section */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image 
                src="/logo.png" 
                alt="Beyond Miles Logo" 
                fill 
                className="object-contain" 
              />
            </div>
            <span className="font-romantic italic font-black text-2xl text-slate-800 normal-case tracking-tighter">
              BeyondMiles
            </span>
          </div>

          {/* Taskbar Links - Support Option Added Back */}
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-500 text-sm">
            <a href="#features" className="hover:text-rose-400 transition-colors cursor-pointer">Features</a>
            <a href="#about" className="hover:text-rose-400 transition-colors cursor-pointer">Our Story</a>
            <a href="#support" className="hover:text-rose-400 transition-colors cursor-pointer">Support</a>
          </div>

          {/* Taskbar Sign Up Button */}
          <Link href="/login" className="cursor-pointer">
            <button className="bg-gradient-to-r from-rose-400 to-amber-400 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-transform text-sm cursor-pointer">
              Stay Close
            </button>
          </Link>
        </div>
      </nav>

      {/* 2. LANDING CONTENT */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        
        {/* TWO-LINE HEADING */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-[1.1] mb-6">
          <span className="block animate-reveal">Create a shared digital space for the</span>
          <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent block animate-reveal delay-100">
            people who matter
          </span>
        </h1>

        {/* RANDOMIZED SUBHEADING */}
        <p className="font-romantic italic text-2xl text-rose-400 mb-12 h-8 animate-reveal delay-200 transition-opacity duration-1000">
          {randomQuote}
        </p>

        {/* CENTER SIGN UP BUTTON */}
        <Link href="/login" className="cursor-pointer">
          <button className="bg-gradient-to-r from-rose-400 to-amber-400 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-rose-200 hover:scale-105 transition-all text-xl animate-reveal delay-200 cursor-pointer">
            Create Your Space
          </button>
        </Link>

      </section>

    </main>
  );
}
'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function CreateSpace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');

  const [step, setStep] = useState(1);
  const [spaceName, setSpaceName] = useState('');
  const [vibe, setVibe] = useState('');
  const [locations, setLocations] = useState({ home: '', away: '' });
  const [reunionDate, setReunionDate] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
<<<<<<< HEAD
  const [distance, setDistance] = useState(null);
  const [copied, setCopied] = useState(false);

  // 🌍 Get coordinates
  const getCityCoordinates = async (cityName) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${cityName}&format=json&limit=1`
    );
    const data = await res.json();
    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  };

  // 📏 Distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1 && spaceName) {
      setStep(2);
    }

    else if (step === 3 && locations.home && locations.away) {
      const homeCoords = await getCityCoordinates(locations.home);
      const awayCoords = await getCityCoordinates(locations.away);

      if (!homeCoords || !awayCoords) {
        alert("Enter valid cities");
        return;
      }

      const dist = calculateDistance(
        homeCoords.lat,
        homeCoords.lon,
        awayCoords.lat,
        awayCoords.lon
      );

      setDistance(dist);
      setStep(4);
    }

    else if (step === 4 && reunionDate) {
      const user = auth.currentUser;
      if (!user) return alert("Not logged in");
=======
  const [copied, setCopied] = useState(false); // New state for copy feedback
>>>>>>> a58f20d2da1198b3fb9d82b4a7f371010ab217ca

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCode(code);

<<<<<<< HEAD
      const newSpace = {
        id: crypto.randomUUID(),
        role,
        spaceName,
        vibe,
        homeCity: locations.home,
        awayCity: locations.away,
        distance,
        reunionDate,
        joinCode: code,
        createdAt: new Date().toISOString()
      };

      await updateDoc(doc(db, "users", user.uid), {
        spaces: arrayUnion(newSpace)
      });

      setStep(5);
    }
  };

  // ✅ COPY FUNCTION
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
=======
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
>>>>>>> a58f20d2da1198b3fb9d82b4a7f371010ab217ca
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-rose-50 shadow-2xl shadow-rose-100/30">
        
        <form onSubmit={handleSubmit}>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black">
                Name your <span className="text-rose-400">space</span>.
              </h2>
              <input
                autoFocus
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 outline-none"
              />
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold">
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black">
                What's the <span className="text-amber-400">vibe</span>?
              </h2>
              {['Romantic 🕯️', 'Playful 🧸', 'Deep 🌊'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setVibe(v); setStep(3); }}
                  className="w-full p-4 rounded-2xl border text-left font-bold"
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black">Where are you both?</h2>
              <input
                type="text"
                placeholder="Your City"
                value={locations.home}
                onChange={(e) => setLocations({ ...locations, home: e.target.value })}
                className="w-full p-4 rounded-2xl bg-slate-50"
              />
              <input
                type="text"
                placeholder="Their City"
                value={locations.away}
                onChange={(e) => setLocations({ ...locations, away: e.target.value })}
                className="w-full p-4 rounded-2xl bg-slate-50"
              />
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold">
                Calculate Distance
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black">When is the reunion?</h2>
              <input
                type="date"
                value={reunionDate}
                onChange={(e) => setReunionDate(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50"
              />
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold">
                Finish Setup
              </button>
            </div>
          )}

          {step === 5 && (
<<<<<<< HEAD
            <div className="text-center space-y-6 relative">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-black">Space Created!</h2>
              <p className="text-slate-500">Distance: {distance} km</p>

              {/* COPY BOX */}
              <div
                onClick={copyToClipboard}
                className="cursor-pointer bg-amber-50 border-2 border-dashed p-6 rounded-3xl hover:bg-amber-100 transition"
              >
                <span className="text-4xl font-black tracking-widest font-mono">
                  {generatedCode}
                </span>
                <p className="text-xs mt-2 font-bold uppercase">
                  Click to copy code
=======
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
>>>>>>> a58f20d2da1198b3fb9d82b4a7f371010ab217ca
                </p>
              </div>

              {/* POPUP */}
              {copied && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg">
                  Copied to clipboard!
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push('/my-spaces')}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-xl"
              >
                Enter Space
              </button>
            </div>
          )}

        </form>
      </div>
    </main>
  );
}

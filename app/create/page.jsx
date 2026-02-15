'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function CreateSpace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Couple'; // Default to Couple if not found

  const [step, setStep] = useState(1);
  const [spaceName, setSpaceName] = useState('');
  const [vibe, setVibe] = useState('');
  const [locations, setLocations] = useState({ home: '', away: '' });
  const [reunionDate, setReunionDate] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [distance, setDistance] = useState(null);
  const [timeDiff, setTimeDiff] = useState(null);
  const [copied, setCopied] = useState(false);

  const getCityCoordinates = async (cityName) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${cityName}&format=json&limit=1`
      );
      const data = await res.json();
      if (!data.length) return null;
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch {
      return null;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  const calculateTimeDifference = (lon1, lon2) => ((lon2 - lon1) / 15).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1 && spaceName) setStep(2);
    else if (step === 2 && vibe) setStep(3);
    else if (step === 3 && locations.home && locations.away) {
      const homeCoords = await getCityCoordinates(locations.home);
      const awayCoords = await getCityCoordinates(locations.away);
      if (!homeCoords || !awayCoords) return alert('Enter valid cities');

      const dist = calculateDistance(
        homeCoords.lat,
        homeCoords.lon,
        awayCoords.lat,
        awayCoords.lon
      );
      const tDiff = calculateTimeDifference(homeCoords.lon, awayCoords.lon);

      setDistance(dist);
      setTimeDiff(tDiff);
      setStep(4);
    } else if (step === 4 && reunionDate) {
      const user = auth.currentUser;
      if (!user) return alert('Not logged in');

      const code =
        window.crypto?.randomUUID?.().slice(0, 6).toUpperCase() ||
        Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCode(code);

      // --- TEMPLATE LOGIC: Set defaults based on the chosen role ---
      const defaultThemes = {
        Couple: 'rose',
        Friends: 'blue',
        HouseFamily: 'green',
        Custom: 'slate'
      };

      const newSpace = {
        id: code,
        role,
        spaceName,
        vibe,
        homeCity: locations.home,
        awayCity: locations.away,
        distance,
        timeDiff,
        reunionDate,
        joinCode: code,
        ownerId: user.uid,
        members: [user.uid],
        createdAt: new Date().toISOString(),
        // Add the settings block that the [id] dashboard expects
        settings: {
          theme: defaultThemes[role] || 'rose',
          backgroundImage: null,
          tagline: role === 'Couple' ? "Connected ❤️" : "Basecamp ✨"
        }
      };

      try {
        // Save to central spaces collection
        await addDoc(collection(db, 'spaces'), newSpace);
        
        // Save to user's personal spaces array
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { spaces: arrayUnion(newSpace) });
        
        setStep(5);
      } catch (err) {
        console.error(err);
        alert('Error creating space. Try again.');
      }
    }
  };

  const copyToClipboard = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradientBtn = "bg-gradient-to-r from-rose-400 to-amber-400 text-slate-900 font-bold";

  return (
    <main className="min-h-screen bg-[#FFFDFB] font-sans flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-[#FFFDFB] rounded-3xl p-10 border border-[#F0EAD6] shadow-lg">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900">
                Name your <span className="text-rose-400">space</span>
              </h2>
              <input
                autoFocus
                type="text"
                placeholder="e.g., Our Little World"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white text-slate-900 outline-none border border-slate-200"
              />
              <button type="submit" className={`w-full py-4 rounded-2xl ${gradientBtn} hover:opacity-90 transition-all`}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900">
                What's the <span className="text-amber-400">vibe</span>?
              </h2>
              {['Romantic 🕯️', 'Playful 🧸', 'Deep 🌊'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setVibe(v); setStep(3); }}
                  className={`w-full p-4 rounded-2xl border text-left bg-white border-slate-200 hover:border-amber-400 transition-all font-bold text-slate-800`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900">Where are you both?</h2>
              <input
                type="text"
                placeholder="Your City"
                value={locations.home}
                onChange={(e) => setLocations({ ...locations, home: e.target.value })}
                className="w-full p-4 rounded-2xl bg-white text-slate-900 border border-slate-200"
              />
              <input
                type="text"
                placeholder="Their City"
                value={locations.away}
                onChange={(e) => setLocations({ ...locations, away: e.target.value })}
                className="w-full p-4 rounded-2xl bg-white text-slate-900 border border-slate-200"
              />
              <button type="submit" className={`w-full py-4 rounded-2xl ${gradientBtn} hover:opacity-90 transition-all`}>
                Calculate Distance & Time
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900">When is the reunion?</h2>
              <input
                type="date"
                value={reunionDate}
                onChange={(e) => setReunionDate(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white text-slate-900 border border-slate-200"
              />
              <button type="submit" className={`w-full py-4 rounded-2xl ${gradientBtn} hover:opacity-90 transition-all`}>
                Finish Setup
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-6 relative">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-black text-slate-900">Space Created!</h2>
              <p className="text-slate-900 font-medium tracking-tight">Distance: {distance} km | Time Diff: {timeDiff} h</p>

              <div
                onClick={copyToClipboard}
                className={`cursor-pointer p-6 rounded-3xl border-2 border-dashed border-rose-400 bg-rose-50 hover:bg-rose-100 transition-all`}
              >
                <span className="text-4xl font-black tracking-widest font-mono text-rose-600">{generatedCode}</span>
                <p className="text-xs mt-2 font-bold uppercase text-rose-400">Click to copy code</p>
              </div>

              {copied && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold">
                  Copied!
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push(`/dashboard/${generatedCode}`)}
                className={`w-full py-4 rounded-2xl ${gradientBtn} hover:opacity-90 transition-all text-slate-900 font-black text-xl shadow-xl shadow-rose-200`}
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
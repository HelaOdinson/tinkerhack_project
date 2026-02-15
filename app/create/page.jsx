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
  const [distance, setDistance] = useState(null);
  const [copied, setCopied] = useState(false);

  // 🌍 Get coordinates using OpenStreetMap
  const getCityCoordinates = async (cityName) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${cityName}&format=json&limit=1`
      );
      const data = await res.json();
      if (!data.length) return null;

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // 📏 Calculate Haversine distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; // km

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
        alert("Please enter valid city names");
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
      if (!user) return alert("Please log in to save your space");

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCode(code);

      const newSpace = {
        id: crypto.randomUUID(),
        role,
        spaceName,
        vibe,
        homeCity: locations.home,
        awayCity: locations.away,
        distance: `${distance} km`,
        reunionDate,
        joinCode: code,
        createdAt: new Date().toISOString()
      };

      try {
        await updateDoc(doc(db, "users", user.uid), {
          spaces: arrayUnion(newSpace)
        });
        setStep(5);
      } catch (error) {
        console.error("Error saving space:", error);
        alert("Failed to create space. Please try again.");
      }
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB] text-slate-800 font-sans flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-rose-50 shadow-2xl shadow-rose-100/30">
        
        <form onSubmit={handleSubmit}>

          {step === 1 && (
            <div className="space-y-6 animate-reveal">
              <h2 className="text-3xl font-black">
                Name your <span className="text-rose-400">space</span>.
              </h2>
              <input
                autoFocus
                type="text"
                placeholder="e.g., Our Little World"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 outline-none border border-transparent focus:border-rose-200 transition-all"
              />
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-reveal">
              <h2 className="text-3xl font-black">
                What's the <span className="text-amber-400">vibe</span>?
              </h2>
              {['Romantic 🕯️', 'Playful 🧸', 'Deep 🌊'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setVibe(v); setStep(3); }}
                  className="w-full p-4 rounded-2xl border border-slate-100 text-left font-bold hover:bg-slate-50 hover:border-amber-200 transition-all"
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-reveal">
              <h2 className="text-3xl font-black">Where are you both?</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your City (e.g., Kerala)"
                  value={locations.home}
                  onChange={(e) => setLocations({ ...locations, home: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-50 outline-none border border-transparent focus:border-slate-200"
                />
                <input
                  type="text"
                  placeholder="Their City (e.g., London)"
                  value={locations.away}
                  onChange={(e) => setLocations({ ...locations, away: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-50 outline-none border border-transparent focus:border-slate-200"
                />
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold">
                Calculate Distance
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-reveal">
              <h2 className="text-3xl font-black">When is the reunion?</h2>
              <input
                type="date"
                value={reunionDate}
                onChange={(e) => setReunionDate(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 outline-none border border-transparent focus:border-rose-200"
              />
              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold">
                Finish Setup
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-6 animate-reveal">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black tracking-tight">Space Created!</h2>
              <p className="text-slate-500 font-medium">Distance: {distance} km</p>
              
              <div 
                onClick={copyToClipboard}
                className="bg-amber-50 border-2 border-dashed border-amber-200 p-6 rounded-3xl cursor-pointer hover:bg-amber-100 transition-all active:scale-95 relative group"
              >
                <span className="text-4xl font-black tracking-widest text-amber-600 font-mono">
                  {generatedCode}
                </span>
                <p className="text-[10px] text-amber-400 mt-2 font-bold uppercase tracking-wider">
                  {copied ? '✅ Code Copied!' : 'Click to copy code'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push('/my-spaces')}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-xl hover:bg-slate-800 transition-colors"
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
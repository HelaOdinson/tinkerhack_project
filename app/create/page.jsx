'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function CreateSpace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Couple';

  const [step, setStep] = useState(1);
  const [spaceName, setSpaceName] = useState('');
  const [vibe, setVibe] = useState('');
  const [locations, setLocations] = useState({ home: '', away: '' });
  const [reunionDate, setReunionDate] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [distance, setDistance] = useState(null);
  const [timeDiff, setTimeDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCityCoordinates = async (cityName) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?city=${cityName}&format=json&limit=1`);
      const data = await res.json();
      if (!data.length) return null;
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch { return null; }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  const calculateTimeDifference = (lon1, lon2) => ((lon2 - lon1) / 15).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1 && spaceName) setStep(2);
    else if (step === 2 && vibe) setStep(3);
    else if (step === 3 && locations.home && locations.away) {
      setLoading(true);
      const h = await getCityCoordinates(locations.home);
      const a = await getCityCoordinates(locations.away);
      if (!h || !a) { setLoading(false); return alert("Invalid cities"); }
      
      const dist = calculateDistance(h.lat, h.lon, a.lat, a.lon);
      const tDiff = calculateTimeDifference(h.lon, a.lon);
      
      setDistance(dist);
      setTimeDiff(tDiff);
      setLoading(false);
      setStep(4);
    } else if (step === 4 && reunionDate) {
      const user = auth.currentUser;
      if (!user) return alert('Not logged in');
      setLoading(true);
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCode(code);

      const newSpace = {
        id: code,
        joinCode: code,
        role,
        spaceName,
        vibe,
        homeCity: locations.home,
        awayCity: locations.away,
        distance, // 🔥 This is now passed to the DB
        timeDiff, // 🔥 This is now passed to the DB
        reunionDate,
        members: [user.uid],
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        settings: { theme: role === 'Couple' ? 'rose' : 'blue' }
      };

      try {
        await setDoc(doc(db, 'spaces', code), newSpace);
        await updateDoc(doc(db, 'users', user.uid), { spaces: arrayUnion(newSpace) });
        setStep(5);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-md bg-white border border-rose-50 rounded-[2.5rem] p-10 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-4xl font-black italic">Name your space</h2>
              <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold" placeholder="Our Galaxy..." value={spaceName} onChange={(e) => setSpaceName(e.target.value)} autoFocus />
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase">Continue</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic text-center">Pick the vibe</h2>
              {['Romantic 🕯️', 'Playful 🧸', 'Deep 🌊'].map(v => (
                <button key={v} type="button" onClick={() => { setVibe(v); setStep(3); }} className="w-full p-5 text-left rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 font-bold hover:border-rose-400">{v}</button>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic">Locations</h2>
              <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold mb-2" placeholder="Your City" value={locations.home} onChange={(e) => setLocations({...locations, home: e.target.value})} />
              <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold" placeholder="Their City" value={locations.away} onChange={(e) => setLocations({...locations, away: e.target.value})} />
              <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase">{loading ? 'Calculating...' : 'Calculate'}</button>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-4xl font-black italic">Reunion Date</h2>
              <input type="date" className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold" value={reunionDate} onChange={(e) => setReunionDate(e.target.value)} />
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase">Finish Setup</button>
            </div>
          )}
          {step === 5 && (
            <div className="text-center space-y-8">
              <div className="text-6xl animate-bounce">✨</div>
              <h2 className="text-3xl font-black italic">Universe Ready</h2>
              <div onClick={copyToClipboard} className="cursor-pointer p-8 rounded-[2.5rem] border-4 border-dashed border-rose-200 bg-rose-50/50 hover:bg-rose-50">
                <span className="text-5xl font-black tracking-widest font-mono text-rose-500">{generatedCode}</span>
                <p className="text-[10px] mt-4 font-black uppercase text-rose-300">{copied ? 'COPIED!' : 'CLICK TO COPY'}</p>
              </div>
              <button type="button" onClick={() => router.push(`/dashboard/${generatedCode}`)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase">Enter Space ✨</button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
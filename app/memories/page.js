'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function MemoryGallery() {
  const photos = [1, 2, 3, 4, 5, 6]; // Add more as you get more pics

  return (
    <main className="min-h-screen bg-[#FFF0F3] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-romantic italic font-black text-5xl text-slate-800">Our Photo Wall</h1>
          <Link href="/dashboard" className="px-6 py-2 bg-white rounded-full shadow-sm font-bold text-rose-400 hover:bg-rose-50 transition-all">← Back to Space</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((num) => (
            <div key={num} className="bg-white p-3 rounded-2xl shadow-xl rotate-[1deg] hover:rotate-0 transition-transform duration-500">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                <Image src={`/memories/pic${(num % 3) + 1}.jpg`} alt="Memory" fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
'use client';
import { use, useState, useEffect, useRef, Suspense } from 'react'; // Added Suspense
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase'; 
import { 
  doc, getDoc, updateDoc, onSnapshot, arrayRemove, 
  collection, addDoc, query, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation'; // Ensure this is imported

// 🔥 1. The main logic stays here
function DashboardContent({ spaceId }) {
  const router = useRouter();
  const searchParams = useSearchParams(); // 🔥 This is what caused the error
  const scrollRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [spaceData, setSpaceData] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [timeHome, setTimeHome] = useState('');
  const [timeAway, setTimeAway] = useState('');
  const [daysLeft, setDaysLeft] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [pulseImage, setPulseImage] = useState(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const roleConfigs = {
    Couple: { icon: "❤️", reunion: "Days Until Reunion", pulse: "Our Daily Pulse", gap: "The Gap", showTimeDiff: true },
    Friends: { icon: "🍕", reunion: "Next Squad Meet", pulse: "Squad Status", gap: "Squad Spread", showTimeDiff: false },
    HouseFamily: { icon: "🏠", reunion: "Homecoming Date", pulse: "Family Pulse", gap: "Member Distance", showTimeDiff: false },
    Custom: { icon: "✨", reunion: "Next Milestone", pulse: "Pulse", gap: "The Gap", showTimeDiff: false }
  };

  const themes = {
    rose: { bg: "bg-[#FFF0F3]", border: "border-rose-200", text: "text-rose-700", title: "text-rose-950", accent: "bg-rose-400", card: "bg-rose-50 border-rose-300" },
    blue: { bg: "bg-[#E3F2FD]", border: "border-blue-200", text: "text-blue-700", title: "text-blue-950", accent: "bg-blue-400", card: "bg-blue-50 border-blue-300" }
  };

  useEffect(() => {
    setMounted(true);
    if (!spaceId) return;

    let unsubscribeSpace;
    let unsubscribeChat;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const masterSpaceRef = doc(db, "spaces", spaceId);
        unsubscribeSpace = onSnapshot(masterSpaceRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const details = await Promise.all((data.members || []).map(async (uid) => {
              const uDoc = await getDoc(doc(db, "users", uid));
              return { uid, ...uDoc.data() };
            }));
            setMembersDetails(details);
            
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const localSpace = (userDoc.data()?.spaces || []).find(s => s.id === spaceId);
            setSpaceData({ ...data, partnerNickname: localSpace?.partnerNickname || '' });
            setNewNickname(localSpace?.partnerNickname || '');

            if (data.reunionDate) {
              const diff = new Date(data.reunionDate) - new Date();
              setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
            }
            setLoading(false);
          }
        });

        const chatRef = collection(db, "spaces", spaceId, "messages");
        const q = query(chatRef, orderBy("createdAt", "asc"), limit(50));
        unsubscribeChat = onSnapshot(q, (snapshot) => {
          setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
        });
      } else { router.push('/login'); }
    });

    return () => {
      if (unsubscribeSpace) unsubscribeSpace();
      if (unsubscribeChat) unsubscribeChat();
      unsubscribeAuth();
    };
  }, [spaceId, router]);

  useEffect(() => {
    if (!mounted || !spaceData) return;
    const timer = setInterval(() => {
      const now = new Date();
      setTimeHome(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const config = roleConfigs[spaceData.role || 'Couple'];
      if (config.showTimeDiff && spaceData.timeDiff) {
        const offset = parseFloat(spaceData.timeDiff);
        const awayDate = new Date(now.getTime() + (offset * 60 * 60 * 1000));
        setTimeAway(awayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mounted, spaceData]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await addDoc(collection(db, "spaces", spaceId, "messages"), {
      text: newMessage,
      senderId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  if (!mounted || loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-rose-400 font-black">SYNCING...</div>;

  const theme = themes[spaceData?.settings?.theme || 'rose'];
  const config = roleConfigs[spaceData?.role || 'Couple'];

  return (
    <main className={`flex min-h-screen ${theme.bg} relative overflow-hidden text-slate-800 font-sans`}>
        {/* ... (Your existing Sidebar, Center, and Right column JSX here) ... */}
        {/* Ensure the JSX matches the previous complete dashboard version */}
    </main>
  );
}

// 🔥 2. This is the Export that fixes the build error
export default function SmartDashboard({ params }) {
  const resolvedParams = use(params);
  const spaceId = resolvedParams?.id;

  return (
    <Suspense fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <p className="text-rose-400 font-black animate-pulse uppercase tracking-widest">Entering Space...</p>
        </div>
    }>
      <DashboardContent spaceId={spaceId} />
    </Suspense>
  );
}
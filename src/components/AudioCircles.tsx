import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Users, Award, ShieldAlert, BookOpen, Volume2, Plus, LogOut, Disc, MessageSquareDot, Hand, Trophy, Sparkles, Radio, HelpCircle } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: 'moderator' | 'speaker' | 'listener';
  isMuted: boolean;
  isTalking: boolean;
  avatar: string;
  hasHandRaised?: boolean;
}

interface CircleRoom {
  id: string;
  title: string;
  surahTarget: string;
  moderatorName: string;
  onlineCount: number;
  description: string;
  participants: Participant[];
  currentAyaReading?: string;
}

const PRESET_ROOMS: CircleRoom[] = [
  {
    id: "room-1",
    title: "مَحراب سورة الكهف - التدبر والتثبيت",
    surahTarget: "سورة الكهف (آيات ١ - ٣٠)",
    moderatorName: "الشيخ عبد الرحمن السعدي",
    onlineCount: 8,
    description: "حلقة مخصصة لتلاوة وتجويد وتفسير فواتح وعجائب سورة الكهف يومياً بالتناوب.",
    currentAyaReading: "...الْحَمْدُ لِلَّهِ الَّذِي أَنْزَلَ عَلَى عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَلْ لَهُ عِوَجًا ۞",
    participants: [
      { id: "p1", name: "الشيخ عبد الرحمن السعدي", role: "moderator", isMuted: false, isTalking: true, avatar: "🕌" },
      { id: "p2", name: "بلال كمال", role: "speaker", isMuted: true, isTalking: false, avatar: "📖" },
      { id: "p3", name: "أحمد الهاشمي", role: "speaker", isMuted: false, isTalking: false, avatar: "💡" },
      { id: "p4", name: "عمر الفاروق", role: "listener", isMuted: true, isTalking: false, avatar: "⭐" },
      { id: "p5", name: "د. يوسف القحطاني", role: "listener", isMuted: true, isTalking: false, avatar: "🌾" },
      { id: "p6", name: "سعد بن معاذ", role: "listener", isMuted: true, isTalking: false, avatar: "🌙" }
    ]
  },
  {
    id: "room-2",
    title: "حلقة حفظ وتكرار جزء تبارك للشباب",
    surahTarget: "سورة الملك والملحق بها",
    moderatorName: "الأستاذ معاذ الأنصاري",
    onlineCount: 14,
    description: "تسميع متبادل ومراجعة سريعة للحفظة والمبتدئين قبل النوم لتثبيت المعاني الجليلة.",
    currentAyaReading: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ۞",
    participants: [
      { id: "p10", name: "الأستاذ معاذ الأنصاري", role: "moderator", isMuted: false, isTalking: false, avatar: "🎓" },
      { id: "p11", name: "أسامة بن زيد", role: "speaker", isMuted: false, isTalking: true, avatar: "✨" },
      { id: "p12", name: "خالد الوليد", role: "listener", isMuted: true, isTalking: false, avatar: "⚔️" },
      { id: "p13", name: "سليمان العتيبي", role: "listener", isMuted: true, isTalking: false, avatar: "☁️" }
    ]
  },
  {
    id: "room-3",
    title: "مقرأة تصحيح مخارج وتجويد سورة الفاتحة",
    surahTarget: "سورة الفاتحة (قصار السور)",
    moderatorName: "القارئ يزن الغامدي",
    onlineCount: 22,
    description: "مصحح قراءة الفاتحة وأحكام التجويد الأساسية، نركز على تمكين المبتدئين من تلاوة خالية من اللحن الجلي.",
    currentAyaReading: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۞",
    participants: [
      { id: "p20", name: "القارئ يزن الغامدي", role: "moderator", isMuted: false, isTalking: true, avatar: "🎙️" },
      { id: "p21", name: "طلحة الشهابي", role: "listener", isMuted: true, isTalking: false, avatar: "🕊️" },
      { id: "p22", name: "جابر عبدالله", role: "listener", isMuted: true, isTalking: false, avatar: "🌳" }
    ]
  }
];

export default function AudioCircles({ onBack }: { onBack?: () => void }) {
  const [rooms, setRooms] = useState<CircleRoom[]>(PRESET_ROOMS);
  const [activeRoom, setActiveRoom] = useState<CircleRoom | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [talkingWave, setTalkingWave] = useState([20, 45, 15, 60, 30]);

  // Form Fields for new Room
  const [newTitle, setNewTitle] = useState('');
  const [newSurah, setNewSurah] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Audio wave interval animation simulation
  useEffect(() => {
    let interval: any;
    if (activeRoom) {
      interval = setInterval(() => {
        setTalkingWave(Array.from({ length: 6 }, () => Math.floor(Math.random() * 75) + 10));
        
        // Randomly simulate other participants talking
        setRooms(prevRooms => prevRooms.map(room => {
          if (room.id !== activeRoom.id) return room;
          const updatedParticipants = room.participants.map(p => {
            // One talking at a time roughly
            if (p.role === 'moderator' && Math.random() > 0.7) {
              return { ...p, isTalking: !p.isTalking && !p.isMuted };
            }
            if (p.role === 'speaker' && Math.random() > 0.8) {
              return { ...p, isTalking: !p.isTalking && !p.isMuted };
            }
            return { ...p, isTalking: false };
          });
          return { ...room, participants: updatedParticipants };
        }));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [activeRoom]);

  const handleJoinRoom = (room: CircleRoom) => {
    // Check if browser allows fake join
    const guestUser: Participant = {
      id: "u-guest",
      name: "قارئ مخلص (أنت)",
      role: "listener",
      isMuted: true,
      isTalking: false,
      avatar: "👤"
    };
    
    const updatedRoom = {
      ...room,
      onlineCount: room.onlineCount + 1,
      participants: [...room.participants, guestUser]
    };
    
    setActiveRoom(updatedRoom);
    setHandRaised(false);
    setIsMuted(true);
  };

  const handleLeaveRoom = () => {
    if (!activeRoom) return;
    setActiveRoom(null);
  };

  const toggleMute = () => {
    if (!activeRoom) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    
    // Update self in participants list
    setActiveRoom(prev => {
      if (!prev) return null;
      const updated = prev.participants.map(p => {
        if (p.id === "u-guest") {
          return { ...p, isMuted: nextMute, role: nextMute ? 'listener' as const : 'speaker' as const, isTalking: !nextMute };
        }
        return p;
      });
      return { ...prev, participants: updated };
    });
  };

  const handleRaiseHand = () => {
    if (!activeRoom) return;
    const nextHand = !handRaised;
    setHandRaised(nextHand);

    // Alert or notify simulated admin
    if (nextHand) {
      setTimeout(() => {
        // Simulated moderator accepts speaker request
        setActiveRoom(prev => {
          if (!prev) return null;
          const updated = prev.participants.map(p => {
            if (p.id === "u-guest") {
              return { ...p, role: "speaker" as const, hasHandRaised: false };
            }
            return p;
          });
          return { ...prev, participants: updated };
        });
        setIsMuted(false);
        setHandRaised(false);
        alert("✨ تفضل! وافق مشرف الغرفة على طلبك للتسميع والتحدث. صوّت وميكروفونك فعّال الآن.");
      }, 3000);
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() === '' || newSurah.trim() === '') {
      alert("يرجى ملء الحقول الأساسية لإنشاء حلقة التحفيظ");
      return;
    }

    const newRoom: CircleRoom = {
      id: `room-${Date.now()}`,
      title: newTitle,
      surahTarget: newSurah,
      moderatorName: "قارئ مخلص (أنت)",
      onlineCount: 1,
      description: newDesc || "حلقة تلاوة تدبرية مستديرة لنشر الخير العميم.",
      currentAyaReading: "سجل حضورك وابدأ بقراءة الآية لافتتاح الحلقة الاستماعية 🌸",
      participants: [
        { id: "u-guest", name: "قارئ مخلص (أنت)", role: "moderator", isMuted: false, isTalking: true, avatar: "👑" }
      ]
    };

    setRooms([newRoom, ...rooms]);
    setActiveRoom(newRoom);
    setIsMuted(false);
    setShowCreateModal(false);
    setNewTitle('');
    setNewSurah('');
    setNewDesc('');
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28 text-slate-800 dark:text-slate-100 min-h-screen" dir="rtl">
      
      {/* Upper Brand Header */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-emerald-950 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden border border-white/5">
        <div className="absolute right-0 top-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] px-3 py-1 rounded-full font-black tracking-widest inline-block mb-2">
              بث صوتي تفاعلي مستدير
            </span>
            <h2 className="text-2xl font-black font-serif leading-tight text-white mb-1">حلقات التسميع الافتراضية</h2>
            <p className="text-[10px] text-teal-100/80">تجمع لقراءة القرآن الكريم والمراجعة الصوتية الفورية</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/15 shadow-inner">
            <Radio size={28} className="text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Container View (Lobby vs Active Circle) */}
      <AnimatePresence mode="wait">
        {!activeRoom ? (
          /* ================= ROOM LOBBY ================= */
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Quick action: Create new audio room */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowCreateModal(true)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[#07130F] font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-colors"
            >
              <Plus size={16} />
              <span>تأسيس غرفة تلاوة صوتية جديدة الآن ✨</span>
            </motion.button>

            {/* List of active rooms */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 mt-2 flex items-center gap-1.5 px-1">
                <Volume2 size={13} className="text-emerald-500" />
                <span>حلقات التلاوة المتاحة حالياً:</span>
              </h3>

              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5 relative overflow-hidden group hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-black">
                        💡 {room.surahTarget}
                      </span>
                      <h4 className="font-extrabold text-[#0a1914] dark:text-white text-sm font-serif pt-1">
                        {room.title}
                      </h4>
                    </div>

                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl">
                      <Users size={12} className="text-emerald-600" />
                      <span>{room.onlineCount} حاضر</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {room.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-3 flex-wrap gap-2">
                    <span className="text-[10px] text-slate-400 font-bold">
                      بإشراف: <strong className="text-slate-600 dark:text-slate-300">{room.moderatorName}</strong>
                    </span>

                    {/* Join button - 10% interactive styling */}
                    <button
                      onClick={() => handleJoinRoom(room)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-4 py-2 rounded-xl shadow-md shadow-emerald-500/15 flex items-center gap-1.5 transition-colors"
                    >
                      <Mic size={12} className="inline" />
                      <span>انضمام واستماع</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ================= INSIDE ACTIVE ROOM ================= */
          <motion.div
            key="active-room"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Header with active goal */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden">
              <span className="absolute top-3.5 left-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black px-2.5 py-0.5 rounded-full">
                  الهدف
                </span>
                <span className="text-xs font-black text-slate-600 dark:text-slate-300">{activeRoom.surahTarget}</span>
              </div>

              <h3 className="font-extrabold text-[#0a1914] dark:text-white text-md font-serif">
                {activeRoom.title}
              </h3>

              {activeRoom.currentAyaReading && (
                <div className="bg-emerald-550/10 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-2xl text-center text-xs font-bold leading-relaxed font-serif mt-2 shadow-inner">
                  <p className="opacity-60 text-[9px] mb-1 text-slate-400">يجري تلاوة الآية الكريمة الآن:</p>
                  <p className="text-quran leading-loose">{activeRoom.currentAyaReading}</p>
                </div>
              )}
            </div>

            {/* Participants Grid */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-black text-slate-500">الحضور والمشاركون المتواجدون:</h4>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 font-black">
                  {activeRoom.participants.length} مسافر بالآيات
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                {activeRoom.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col items-center text-center p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl relative border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform"
                  >
                    {/* Ring indicator if talking */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-white dark:bg-slate-800 shadow-md relative ${
                      p.isTalking ? 'ring-4 ring-emerald-500' : 'ring-2 ring-slate-100 dark:ring-slate-800'
                    }`}>
                      <span>{p.avatar}</span>
                      
                      {/* Speaker / Moderator corner badges */}
                      {p.role === 'moderator' && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5" title="مشرف الغرفة">
                          👑
                        </div>
                      )}
                      
                      {p.role === 'speaker' && !p.isMuted && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" title="متحدث">
                          🎙️
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 mt-2 truncate w-full px-1">
                      {p.name}
                    </span>

                    <span className="text-[9px] text-slate-400 font-bold block pt-0.5">
                      {p.role === 'moderator' ? 'مشرف' : p.role === 'speaker' ? 'قارئ مُتحدث' : 'مستمع'}
                    </span>

                    {/* Mute indicator overlay */}
                    {p.isMuted && (
                      <div className="absolute top-2 left-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-full text-slate-400">
                        <MicOff size={10} />
                      </div>
                    )}

                    {/* Simulating pulsing voice waveform over talking face */}
                    {p.isTalking && (
                      <div className="flex gap-0.5 justify-center mt-1.5 h-3 items-end w-8">
                        <span className="w-0.5 h-full bg-emerald-500 rounded-full animate-[pulse_0.8s_infinite]"></span>
                        <span className="w-0.5 h-1/2 bg-emerald-500 rounded-full animate-[pulse_0.6s_infinite_delay-100]"></span>
                        <span className="w-0.5 h-3/4 bg-emerald-500 rounded-full animate-[pulse_0.9s_infinite_delay-200]"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom active controls Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[2rem] shadow-lg flex justify-between items-center gap-2">
              
              {/* Left action code: Leave Room */}
              <button
                onClick={handleLeaveRoom}
                className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/20 p-3 rounded-2xl hover:bg-red-100 transition-colors flex items-center gap-1.5 text-xs font-black"
                title="مغادرة الغرفة"
              >
                <LogOut size={16} />
                <span>غادر بهدوء</span>
              </button>

              {/* Raise hand option - triggers automated prompt */}
              <button
                onClick={handleRaiseHand}
                className={`p-3 rounded-2xl border transition-all ${
                  handRaised 
                    ? 'bg-amber-500 border-amber-600 text-white animate-bounce' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-500'
                }`}
                title="طلب الكلمة للتسميع"
              >
                <Hand size={18} />
              </button>

              {/* Toggle microphone - 10% Interactive key styling */}
              <button
                onClick={toggleMute}
                className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                  isMuted 
                    ? 'bg-slate-500 hover:bg-slate-600 shadow-slate-500/10' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {isMuted ? (
                  <>
                    <MicOff size={16} />
                    <span>ميكروفونك مكتوم</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} className="animate-pulse" />
                    <span>تتحدث الآن...</span>
                  </>
                )}
              </button>

            </div>

            {/* Simulated Live Broadcast Stream wave visualizer */}
            <div className="bg-emerald-950 text-emerald-400 p-3.5 rounded-2xl border border-emerald-500/20 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs font-bold leading-normal">
                <Disc size={15} className="text-emerald-400 animate-spin" />
                <span>محاكاة دقة البث الصوتي الفوري مستقرة</span>
              </div>
              
              {/* Dynamic waveform based on simulated state */}
              <div className="flex gap-0.5 items-end h-4">
                {talkingWave.map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* BACK NAVIGATION OR INFO BANNER */}
      {onBack && (
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
        >
          العودة لوحة التحكم الرائدة
        </button>
      )}

      {/* CREATE ROOM OVERLAY MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, y: 25 }}
              className="bg-white dark:bg-slate-930 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3">
                <h3 className="text-sm font-extrabold text-[#0a1914] dark:text-white font-serif">تأسيس حلقة تسميع صوتية</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">إلغلاق</button>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">اسم أو عنوان الغرفة</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مقرأة الفجر، تسميع البقرة الخ..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">السورة أو الورد القرآني المستهدف</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: جزء عم، المفصل، سورة طه..."
                    value={newSurah}
                    onChange={(e) => setNewSurah(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">وصف مختصر للغرفة (اختياري)</label>
                  <textarea
                    placeholder="ضع سياق الغرفة ومواعيد التسميع لتشجع الحضور على الدخول..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium"
                    rows={2}
                  />
                </div>

                {/* Create Room Button - Accent 10% */}
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs transition-colors shadow-md"
                >
                  افتح البث الصوتي المباشر للغرفة الآن 🎙️
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

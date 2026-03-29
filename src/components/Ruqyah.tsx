import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Shield, PlayCircle, BookOpen, Volume2, PauseCircle } from 'lucide-react';

export default function Ruqyah({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'text' | 'audio'>('text');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const ruqyahAyahs = [
    { id: 1, title: 'الفاتحة', text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ (1) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (2) الرَّحْمَنِ الرَّحِيمِ (3) مَالِكِ يَوْمِ الدِّينِ (4) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (5) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (6) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (7)' },
    { id: 2, title: 'آية الكرسي', text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ (255)' },
    { id: 3, title: 'الإخلاص', text: 'قُلْ هُوَ اللَّهُ أَحَدٌ (1) اللَّهُ الصَّمَدُ (2) لَمْ يَلِدْ وَلَمْ يُولَدْ (3) وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (4)' },
    { id: 4, title: 'الفلق', text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (1) مِنْ شَرِّ مَا خَلَقَ (2) وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ (3) وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ (4) وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ (5)' },
    { id: 5, title: 'الناس', text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ (1) مَلِكِ النَّاسِ (2) إِلَهِ النَّاسِ (3) مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ (4) الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ (5) مِنَ الْجِنَّةِ وَالنَّاسِ (6)' },
  ];

  const ruqyahAudio = [
    { id: 1, reciter: 'مشاري العفاسي', duration: '45:20', url: 'https://server8.mp3quran.net/afs/roqyah.mp3' },
    { id: 2, reciter: 'ماهر المعيقلي', duration: '38:15', url: 'https://server12.mp3quran.net/maher/roqyah.mp3' },
    { id: 3, reciter: 'سعد الغامدي', duration: '42:10', url: 'https://server7.mp3quran.net/s_gmd/roqyah.mp3' },
    { id: 4, reciter: 'أحمد العجمي', duration: '40:05', url: 'https://server10.mp3quran.net/ajm/roqyah.mp3' },
  ];

  const toggleAudio = (audio: typeof ruqyahAudio[0]) => {
    if (playingId === audio.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audio.url);
      audioRef.current.play().catch(console.error);
      setPlayingId(audio.id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex flex-col gap-4 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)]"
          >
            <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-white" />
          </button>
          <h1 className="text-xl font-bold font-serif text-white drop-shadow-md">
            الرقية الشرعية
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 shadow-inner border border-black/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-inner ${
              activeTab === 'text' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-text)]'
            }`}
          >
            <BookOpen size={16} />
            آيات الرقية
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-inner ${
              activeTab === 'audio' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-text)]'
            }`}
          >
            <Volume2 size={16} />
            استماع
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-6">
        {activeTab === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {ruqyahAyahs.map((ayah) => (
              <div key={ayah.id} className="card-3d bg-[var(--color-surface)] rounded-3xl p-6 shadow-lg border border-black/5 dark:border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center text-[var(--color-primary-light)] border border-[var(--color-primary)]/20 shadow-inner">
                    <Shield size={20} />
                  </div>
                  <h3 className="font-bold text-[var(--color-text)] text-lg font-serif">{ayah.title}</h3>
                </div>
                <p className="text-2xl leading-loose font-serif text-[var(--color-primary-light)] text-center relative z-10 drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  {ayah.text}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {ruqyahAudio.map((audio) => (
              <div key={audio.id} className={`card-3d rounded-3xl p-4 shadow-lg border transition-all flex items-center gap-4 ${playingId === audio.id ? 'border-[var(--color-primary-light)]/50 bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-black/5 dark:border-white/5 bg-[var(--color-surface)] hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10'}`}>
                <button 
                  onClick={() => toggleAudio(audio)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all border shadow-lg ${playingId === audio.id ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white border-[var(--color-primary-light)]/50 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-black/5 dark:bg-white/5 text-[var(--color-primary)] dark:text-[var(--color-primary-light)] border-black/10 dark:border-white/10 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/10'}`}
                >
                  {playingId === audio.id ? <PauseCircle size={28} /> : <PlayCircle size={28} className="ml-1" />}
                </button>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm mb-1 transition-colors ${playingId === audio.id ? 'text-[var(--color-primary-light)]' : 'text-[var(--color-text)]'}`}>
                    الرقية الشرعية الشاملة
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">بصوت {audio.reciter}</p>
                  
                  {playingId === audio.id && (
                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden border border-black/5 dark:border-white/5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] h-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                      />
                    </div>
                  )}
                </div>
                <div className="text-xs text-[var(--color-primary-light)] font-mono bg-[var(--color-primary)]/10 px-2.5 py-1.5 rounded-lg border border-[var(--color-primary)]/20 shadow-inner">
                  {audio.duration}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

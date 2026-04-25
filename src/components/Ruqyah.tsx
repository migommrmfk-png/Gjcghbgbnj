import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Play, Pause, Volume2, ArrowRight, BookOpen, Heart, Info } from 'lucide-react';

interface RuqyahSection {
  id: string;
  title: string;
  content: string[];
}

const ruqyahText: RuqyahSection[] = [
  {
    id: 'fatihah',
    title: 'سورة الفاتحة',
    content: [
      'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ (1) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (2) الرَّحْمَنِ الرَّحِيمِ (3) مَالِكِ يَوْمِ الدِّينِ (4) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (5) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (6) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (7)'
    ]
  },
  {
    id: 'baqarah_start',
    title: 'أوائل سورة البقرة',
    content: [
      'الم (1) ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِلْمُتَّقِينَ (2) الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ (3) وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ (4) أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ وَأُولَئِكَ هُمُ الْمُفْلِحُونَ (5)'
    ]
  },
  {
    id: 'ayat_alkursi',
    title: 'آية الكرسي',
    content: [
      'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ (255)'
    ]
  },
  {
    id: 'baqarah_end',
    title: 'خواتيم سورة البقرة',
    content: [
      'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ (285) لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ (286)'
    ]
  },
  {
    id: 'ikhlas_muawwidhat',
    title: 'الإخلاص والمعوذتين (3 مرات)',
    content: [
      'قُلْ هُوَ اللَّهُ أَحَدٌ (1) اللَّهُ الصَّمَدُ (2) لَمْ يَلِدْ وَلَمْ يُولَدْ (3) وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (4)',
      'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (1) مِنْ شَرِّ مَا خَلَقَ (2) وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ (3) وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ (4) وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ (5)',
      'قُلْ أَعُوذُ بِرَبِّ النَّاسِ (1) مَلِكِ النَّاسِ (2) إِلَهِ النَّاسِ (3) مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ (4) الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ (5) مِنَ الْجِنَّةِ وَالنَّاسِ (6)'
    ]
  },
  {
    id: 'duas',
    title: 'أدعية الرقية',
    content: [
      'أعوذ بكلمات الله التامات من شر ما خلق.',
      'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.',
      'أعوذ بكلمات الله التامة، من كل شيطان وهامة، ومن كل عين لامة.',
      'اللهم رب الناس أذهب البأس، اشفِ أنت الشافي، لا شفاء إلا شفاؤك، شفاءً لا يغادر سقماً.',
      'بسم الله أرقيك، من كل شيء يؤذيك، من شر كل نفس أو عين حاسد، الله يشفيك، بسم الله أرقيك.'
    ]
  }
];

export default function Ruqyah() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'audio'>('text');
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 bg-gradient-to-bl from-emerald-600 via-emerald-700 to-teal-900 text-white rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden border-b border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2 drop-shadow-md">الرقية الشرعية</h1>
            <p className="text-emerald-100 text-sm md:text-base opacity-90">حصن نفسك وأهل بيتك بآيات الله</p>
          </div>
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <Shield size={32} className="text-emerald-300 drop-shadow-lg" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-8 relative z-10">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'text'
                ? 'bg-white text-emerald-600 shadow-[0_4px_15px_rgba(0,0,0,0.1)] scale-100'
                : 'bg-white/10 text-emerald-50 hover:bg-white/20 scale-95 border border-white/10'
            }`}
          >
            <BookOpen size={20} className={activeTab === 'text' ? 'text-emerald-600' : 'text-emerald-200'} />
            <span>قراءة</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'audio'
                ? 'bg-white text-emerald-600 shadow-[0_4px_15px_rgba(0,0,0,0.1)] scale-100'
                : 'bg-white/10 text-emerald-50 hover:bg-white/20 scale-95 border border-white/10'
            }`}
          >
            <Volume2 size={20} className={activeTab === 'audio' ? 'text-emerald-600' : 'text-emerald-200'} />
            <span>استماع</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'text' ? (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="card-3d bg-emerald-50/80 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-start gap-4 shadow-sm relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <Info className="text-emerald-500 shrink-0 mt-1 relative z-10" size={24} />
                <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 relative z-10 font-medium">
                  يُستحب قراءة الرقية الشرعية مع النفث (النفخ الخفيف مع ريق يسير) على النفس أو المريض، أو القراءة في ماء والشرب منه.
                </p>
              </div>

              {ruqyahText.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-3d bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-xl border border-black/5 dark:border-white/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
                  
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-l from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent mb-6 flex items-center gap-3 font-serif">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shadow-inner border border-emerald-200/50 dark:border-emerald-700/50 group-hover:scale-110 transition-transform">
                      {index + 1}
                    </span>
                    {section.title}
                  </h3>
                  <div className="space-y-6 relative z-10">
                    {section.content.map((text, i) => (
                      <p key={i} className="text-xl md:text-2xl leading-[2.2] font-serif text-center text-slate-800 dark:text-slate-100">
                        {text}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="audio"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-10"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
                <div className="w-56 h-56 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] relative overflow-hidden border-4 border-white/20 dark:border-slate-800/50">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-20 MixBlendMode-overlay"></div>
                  <Shield size={90} className="text-white relative z-10 drop-shadow-xl" />
                  {isPlaying && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 border-4 border-white/30 rounded-full"
                    />
                  )}
                  {isPlaying && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0 border-4 border-white/20 rounded-full"
                    />
                  )}
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-l from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent font-serif drop-shadow-sm">الرقية الشرعية الشاملة</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">إذاعة الرقية الشرعية</p>
              </div>

              <button
                onClick={togglePlay}
                className={`w-24 h-24 rounded-[2rem] text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isPlaying 
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:shadow-[0_10px_30px_rgba(239,68,68,0.4)]' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)]'
                }`}
              >
                {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
              </button>

              {/* Audio Element */}
              <audio
                ref={audioRef}
                src="https://qurango.net/radio/roqiah"
                preload="none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

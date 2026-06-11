import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, X, Lock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

// ═══════════════════════════════════════════
// أيقونة المئذنة SVG
// ═══════════════════════════════════════════
const MinaretIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 160" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="8" rx="6" ry="8" />
    <rect x="37" y="15" width="6" height="10" />
    <ellipse cx="40" cy="25" rx="12" ry="5" />
    <rect x="34" y="30" width="12" height="6" />
    <path d="M28 36 Q40 30 52 36 L55 80 Q40 75 25 80 Z" />
    <rect x="25" y="80" width="30" height="8" rx="2" />
    <path d="M25 88 L20 130 L30 130 L30 100 L50 100 L50 130 L60 130 L55 88 Z" />
    <rect x="20" y="130" width="40" height="6" rx="3" />
    <rect x="24" y="136" width="32" height="18" rx="2" />
    <ellipse cx="40" cy="154" rx="18" ry="4" opacity="0.3" />
  </svg>
);

// ═══════════════════════════════════════════
// موجة الصوت المتحركة
// ═══════════════════════════════════════════
const SoundWave = ({ active }: { active: boolean }) => {
  const bars = [3, 7, 5, 9, 6, 11, 7, 5, 9, 4, 8, 6];
  return (
    <div className="flex items-center gap-0.5 h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-amber-400"
          style={{ height: active ? h * 3 : 4 }}
          animate={active ? {
            height: [h * 2, h * 3.5, h * 1.5, h * 3, h * 2],
            opacity: [0.6, 1, 0.7, 1, 0.6],
          } : { height: 4, opacity: 0.3 }}
          transition={{
            duration: 1.2,
            repeat: active ? Infinity : 0,
            delay: i * 0.08,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════
// دائرة النبض المتحركة
// ═══════════════════════════════════════════
const PulseRing = ({ delay, size }: { delay: number; size: number }) => (
  <motion.div
    className="absolute rounded-full border border-amber-400/30 pointer-events-none"
    style={{ width: size, height: size, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeOut' }}
  />
);

// ═══════════════════════════════════════════
// النجوم المتساقطة
// ═══════════════════════════════════════════
const FallingStar = ({ x, delay }: { key?: number | string; x: number; delay: number }) => (
  <motion.div
    className="absolute w-0.5 rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: -10, background: 'linear-gradient(to bottom, rgba(251,191,36,0.8), transparent)' }}
    animate={{ y: ['0vh', '110vh'], opacity: [0, 1, 0], height: [0, 60, 20] }}
    transition={{ duration: 2.5 + delay, repeat: Infinity, delay: delay * 3, ease: 'linear' }}
  />
);

// ═══════════════════════════════════════════
// بيانات الصلوات
// ═══════════════════════════════════════════
interface PrayerInfo {
  gradient: string;
  skyColors: [string, string, string];
  arabicText: string;
  period: string;
  stars: boolean;
  image: string;
}

const getPrayerInfo = (prayerName: string): PrayerInfo => {
  const prayers: Record<string, PrayerInfo> = {
    'الفجر': {
      gradient: 'from-indigo-950 via-purple-900 to-rose-900',
      skyColors: ['#1a0533', '#4a1563', '#c2185b'],
      arabicText: 'الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ',
      period: 'قبل شروق الشمس',
      stars: true,
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1080&auto=format&fit=crop',
    },
    'الظهر': {
      gradient: 'from-sky-900 via-blue-800 to-cyan-900',
      skyColors: ['#0c2461', '#1565C0', '#0097a7'],
      arabicText: 'أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ',
      period: 'منتصف النهار',
      stars: false,
      image: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=1080&auto=format&fit=crop',
    },
    'العصر': {
      gradient: 'from-orange-950 via-amber-900 to-yellow-900',
      skyColors: ['#4a1000', '#bf360c', '#f57f17'],
      arabicText: 'حَافِظُوا عَلَى الصَّلَوَاتِ',
      period: 'بعد الزوال',
      stars: false,
      image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1080&auto=format&fit=crop',
    },
    'المغرب': {
      gradient: 'from-rose-950 via-orange-900 to-amber-800',
      skyColors: ['#1a0010', '#880e4f', '#e65100'],
      arabicText: 'سُبْحَانَ اللَّهِ حِينَ تُمْسُونَ',
      period: 'بعد الغروب',
      stars: true,
      image: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1080&auto=format&fit=crop',
    },
    'العشاء': {
      gradient: 'from-slate-950 via-indigo-950 to-blue-950',
      skyColors: ['#020409', '#0d1b2a', '#1b263b'],
      arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ',
      period: 'بعد العشاء',
      stars: true,
      image: 'https://images.unsplash.com/photo-1534269222346-5a896154c41d?q=80&w=1080&auto=format&fit=crop',
    },
  };
  return prayers[prayerName] || prayers['الظهر'];
};

type Step = 'adhan' | 'locked' | 'swear' | 'missed' | 'reason' | 'masjidLock';

const MISS_REASONS = [
  "نوم غامق",
  "انشغال بالعمل/الدراسة",
  "نسيان",
  "تكاسل/تأجيل",
  "مرض/عذر شرعي",
  "غير ذلك"
];

const MASJID_MOTIVATORS = [
  {
    type: "آية كريمة",
    text: "۞ خُذُوا زِينَتَكُمْ عِندَ كُلِّ مَسْجِدٍ 📖",
    detail: "يأمر الله سبحانه بالتزين والتهيب عند القدوم لبيوته تلبية للمؤذن."
  },
  {
    type: "حديث شريف",
    text: "«صلاة الجماعة تفضل صلاة الفذ بسبع وعشرين درجة» ❤️",
    detail: "أجور مضاعفة عظيمة يمنحها رب البرية لخطواتك ومكثك في المسجد."
  },
  {
    type: "ترهيب وعقوبة",
    text: "«لقد هممت أن آمر بالصلاة فتقام، ثم آمر رجلا فيصلي بالناس، ثم أنطلق معي برجال معهم حزم من حطب إلى قوم لا يشهدون الصلاة فأحرق عليهم بيوتهم بالنار!» ⚠️",
    detail: "تحذير شديد اللهجة من المصطفى ﷺ لمن يسمع النداء المتكرر ويتهاون لحاجز هاتفي."
  },
  {
    type: "فضل المشي للمسجد",
    text: "«من غدا إلى المسجد أو راح، أعد الله له في الجنة نزلاً كلما غدا أو راح» ✨",
    detail: "كل خطوة للمسجد ترفعك درجة وتحط عنك خطيئة وتبسط لك نزلاً ملكياً بالخلد."
  }
];

// ═══════════════════════════════════════════
// المكوّن الرئيسي
// ═══════════════════════════════════════════
export default function AdhanOverlay({
  prayerName,
  time,
  onClose,
  onSnooze,
}: {
  prayerName: string;
  time: string;
  onClose: () => void;
  onSnooze?: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [muted, setMuted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  const [step, setStep] = useState<Step>('adhan');
  const [reason, setReason] = useState<string>('');
  const [masjidSecondsLeft, setMasjidSecondsLeft] = useState<number>(0);
  const [currentMotivatorIndex, setCurrentMotivatorIndex] = useState(0);
  const [lockDurationMinutes, setLockDurationMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('user_prayer_lock_duration');
    return saved ? parseInt(saved, 10) : 15;
  });
  
  const [prayerStreak, setPrayerStreak] = useState(() => {
    return parseInt(localStorage.getItem('prayerStreak') || '0', 10);
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const info = getPrayerInfo(prayerName);

  const updateStreak = (increment: boolean) => {
    const newStreak = increment ? prayerStreak + 1 : 0;
    setPrayerStreak(newStreak);
    localStorage.setItem('prayerStreak', newStreak.toString());
  };

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // تشغيل قفل المسجد الصارم عند التحميل إذا كان ساري المفعول
  useEffect(() => {
    const lockStartStr = localStorage.getItem('masjidLockStart');
    if (lockStartStr) {
      const lockStart = parseInt(lockStartStr, 10);
      const passed = Date.now() - lockStart;
      const savedDuration = localStorage.getItem('user_prayer_lock_duration');
      const durationMins = savedDuration ? parseInt(savedDuration, 10) : 15;
      const totalLock = durationMins * 60 * 1000;
      if (passed < totalLock) {
        setStep('masjidLock');
        setMasjidSecondsLeft(Math.floor((totalLock - passed) / 1000));
      } else {
        localStorage.removeItem('masjidLockStart');
      }
    }
  }, []);

  // كاونت داون قفل المسجد الصارم
  useEffect(() => {
    if (step === 'masjidLock') {
      // Rotate religious quotes every 35 seconds to keep reflection alive
      const quoteInterval = setInterval(() => {
        setCurrentMotivatorIndex(prev => (prev + 1) % MASJID_MOTIVATORS.length);
      }, 35000);

      const timer = setInterval(() => {
        const lockStartStr = localStorage.getItem('masjidLockStart');
        if (lockStartStr) {
          const lockStart = parseInt(lockStartStr, 10);
          const passed = Date.now() - lockStart;
          const savedDuration = localStorage.getItem('user_prayer_lock_duration');
          const durationMins = savedDuration ? parseInt(savedDuration, 10) : 15;
          const totalLock = durationMins * 60 * 1000;
          if (passed < totalLock) {
            setMasjidSecondsLeft(Math.floor((totalLock - passed) / 1000));
          } else {
            localStorage.removeItem('masjidLockStart');
            setStep('locked');
            clearInterval(timer);
          }
        } else {
          clearInterval(timer);
        }
      }, 1000);

      return () => {
        clearInterval(timer);
        clearInterval(quoteInterval);
      };
    }
  }, [step]);

  // تشغيل الأذان
  useEffect(() => {
    if (step !== 'adhan') {
      audioRef.current?.pause();
      return;
    }
    
    const keyMap: Record<string, string> = {
      'الفجر': 'Fajr',
      'الظهر': 'Dhuhr',
      'العصر': 'Asr',
      'المغرب': 'Maghrib',
      'العشاء': 'Isha'
    };
    const englishName = keyMap[prayerName] || 'Dhuhr';
    const savedSound = localStorage.getItem(`adhan_sound_${englishName}`) || 'https://server11.mp3quran.net/adhan/1.mp3';

    let audio: HTMLAudioElement;
    if (savedSound === 'silent' || savedSound === 'disabled') {
      audio = new Audio();
      setMuted(true);
    } else {
      audio = new Audio(savedSound);
    }
    audioRef.current = audio;

    audio.addEventListener('playing', () => setAudioPlaying(true));
    audio.addEventListener('pause', () => setAudioPlaying(false));
    audio.addEventListener('ended', () => setAudioPlaying(false));
    audio.addEventListener('error', () => {
       /* Fallback if the first fails */
       audio.src = 'https://www.islamcan.com/audio/adhan/azan3.mp3';
       audio.load();
    });

    const play = async () => {
      try {
        await audio.play();
      } catch {
        setAudioError(true);
      }
    };

    // تأخير لإظهار الأنيميشن أولاً
    const t1 = setTimeout(() => setShowContent(true), 300);
    const t2 = setTimeout(() => play(), 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      audio.pause();
      audio.src = '';
      audio.load();
    };
  }, [step]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleManualPlay = () => {
    audioRef.current?.play().then(() => setAudioError(false)).catch(console.error);
  };

  const completePrayerFlow = (madeUp: boolean = false) => {
    if (!madeUp) updateStreak(true);
    else updateStreak(false); // made up means missed time -> streak reset
    onClose();
  };

  const handleReasonSubmit = () => {
    // Save the reason logic here if needed
    updateStreak(false); // reset streak
    onClose();
  };

  const fallingStars = info.stars
    ? [
        { x: 10, delay: 0 }, { x: 25, delay: 0.4 }, { x: 45, delay: 0.9 },
        { x: 65, delay: 0.2 }, { x: 80, delay: 0.7 }, { x: 92, delay: 1.1 },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      dir="rtl"
    >
      {/* ── خلفية سماء متدرجة ── */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${info.skyColors[0]}, ${info.skyColors[1]}, ${info.skyColors[2]})`,
          }}
          animate={{ opacity: [0.8, 1, 0.85] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* صورة المسجد */}
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.18 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          src={info.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* طبقة ضبابية */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 pointer-events-none" />

        {/* نجوم متساقطة */}
        {fallingStars.map((s, i) => <FallingStar key={i} x={s.x} delay={s.delay} />)}
      </div>

      {/* ── زر الصوت ── */}
      {step === 'adhan' && (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        onClick={audioError ? handleManualPlay : toggleMute}
        className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/40 border border-white/20 backdrop-blur-md"
      >
        {muted ? (
          <VolumeX size={18} className="text-white/50" />
        ) : (
          <Volume2 size={18} className="text-amber-400" />
        )}
      </motion.button>
      )}

      {/* ── المحتوى الرئيسي ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-4">

        {/* المئذنة */}
        {step === 'adhan' && (
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
              className="relative mb-6 flex flex-col items-center"
            >
              {/* دوائر النبض خلف الأيقونة */}
              <div className="relative flex items-center justify-center">
                <PulseRing delay={0} size={100} />
                <PulseRing delay={1} size={100} />
                <PulseRing delay={2} size={100} />

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  {/* هالة ضوئية */}
                  <div
                    className="absolute inset-0 rounded-full "
                    style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)' }}
                  />
                  <MinaretIcon className="w-20 h-40 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                </motion.div>
              </div>

              {/* موجة الصوت */}
              <div className="mt-4">
                <SoundWave active={audioPlaying && !muted} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}

        {/* بطاقة العمليات والتفاعل */}
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              key={step}
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 70, damping: 18 }}
              className="w-full rounded-3xl overflow-hidden bg-black/60 border border-amber-400/20 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] text-center relative"
            >
              {/* شريط علوي ذهبي */}
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

              <div className="p-7">
                
                {/* ---------- خطوة 0: قفل الجماعة الصارم لمنع تشتيت الهاتف ---------- */}
                {step === 'masjidLock' && (
                  <>
                    <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4 text-amber-400">
                      <Lock size={32} />
                    </div>
                    <span className="inline-block bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                      🚨 قفل الجماعة الصارم والإنقاذ من ملهيات الهاتف
                    </span>
                    <h2 className="text-xl md:text-2xl font-black font-serif text-white mb-2 leading-snug">
                      الالتحاق بصلاة الجماعة بالمسجد
                    </h2>
                    
                    {/* Countdown Timer */}
                    <div className="my-5 bg-rose-950/30 border-2 border-rose-500/30 px-6 py-4 rounded-3xl inline-block shadow-inner backdrop-blur-md">
                      <p className="text-rose-400 text-[10px] font-black mb-1">الوقت المتبقي لانتهاء صلاة الجماعة والتحلل من القفل</p>
                      <p className="text-4xl md:text-5xl font-mono font-black text-rose-500 tabular-nums tracking-widest animate-pulse">
                        {Math.floor(masjidSecondsLeft / 60).toString().padStart(2, '0')}:
                        {(masjidSecondsLeft % 60).toString().padStart(2, '0')}
                      </p>
                    </div>

                    {/* Rotating Motivators and Verses */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-right mb-5 min-h-[140px] flex flex-col justify-between">
                      <div>
                        <span className="block text-[9px] font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
                          💡 تدبّر الأثر الشرعي — {MASJID_MOTIVATORS[currentMotivatorIndex].type}
                        </span>
                        <p className="text-[13px] md:text-sm font-bold text-white font-serif leading-relaxed">
                          {MASJID_MOTIVATORS[currentMotivatorIndex].text}
                        </p>
                      </div>
                      <p className="text-[11px] text-white/60 mt-3 border-t border-white/5 pt-2 italic font-light">
                        {MASJID_MOTIVATORS[currentMotivatorIndex].detail}
                      </p>
                    </div>

                    <div className="space-y-3.5 text-right p-4 bg-white/5 border border-white/5 rounded-2xl mb-5">
                      <span className="block text-[11px] font-black text-amber-400 mb-1">خطواتك لتدرك الصف الأول مع الإمام:</span>
                      <ul className="text-xs text-white/80 space-y-2 list-none">
                        <li>🎯 <b>1.</b> قم وتوضأ الآن وأحسن الوضوء (الطهور شطر الإيمان).</li>
                        <li>👕 <b>2.</b> ارتدِ أحسن ثيابك لتلقى العزيز الرحيم (خذوا زينتكم عند كل مسجد).</li>
                        <li>🚶 <b>3.</b> امشِ للمسجد بسكينة ووقار مكرراً دعاء الخطوات.</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-red-900/10 border border-red-500/10 rounded-2xl text-center">
                      <p className="text-[10px] text-rose-400 font-bold leading-normal">
                        ⚠️ هذا التطبيق مغلق تماماً بموجب "قفل الجماعة المباركة" حتى تنقضي الصلاة جماعة بالمسجد ولا يشتتك سكرول أو ريلز.
                      </p>
                    </div>
                  </>
                )}

                {/* ---------- خطوة 1: الأذان ---------- */}
                {step === 'adhan' && (
                  <>
                    <p className="text-amber-400/70 text-xs tracking-widest mb-1 font-light">{info.period}</p>
                    <h1 className="text-5xl font-bold text-amber-400 mb-2 font-serif drop-shadow-lg">{prayerName}</h1>
                    <p className="text-white/60 text-sm mb-6">حان وقت الصلاة</p>
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl mb-6 inline-block">
                      <p className="text-4xl font-mono font-bold text-white tabular-nums drop-shadow-md">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {/* اختيار مدة القفل */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-right mb-1">
                        <span className="block text-[11px] font-bold text-amber-400 mb-2">🎯 حدد مدة قفل الهاتف الصارم (بالدقائق):</span>
                        <div className="flex items-center gap-3 justify-center mb-1">
                          <button 
                            type="button" 
                            onClick={() => setLockDurationMinutes(m => Math.max(5, m - 5))}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white font-extrabold flex items-center justify-center cursor-pointer select-none border border-white/10"
                          >
                            -
                          </button>
                          <span className="text-xl font-mono font-black text-amber-300 px-3">{lockDurationMinutes} دقيقة</span>
                          <button 
                            type="button" 
                            onClick={() => setLockDurationMinutes(m => Math.min(60, m + 5))}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white font-extrabold flex items-center justify-center cursor-pointer select-none border border-white/10"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[10px] text-white/50 text-center leading-normal">لن تلمس هاتفك للرفاهية والريلز حتى تنتهي ركعات الجماعة بمسجدك.</p>
                      </div>

                      <button 
                        onClick={() => {
                          const startTime = Date.now();
                          localStorage.setItem('user_prayer_lock_duration', lockDurationMinutes.toString());
                          localStorage.setItem('masjidLockStart', startTime.toString());
                          setStep('masjidLock');
                          setMasjidSecondsLeft(lockDurationMinutes * 60);
                        }}
                        className="w-full py-4 rounded-2xl font-bold text-lg text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-2"
                      >
                        <Lock size={20} />
                        سأذهب لأصلي بالمسجد (قفل صلب)
                      </button>
                      <button 
                        onClick={() => {
                          if (onSnooze) onSnooze();
                          else onClose();
                        }}
                        className="w-full py-3 rounded-2xl font-semibold text-white/80 bg-white/10 hover:bg-white/15 transition-all text-sm"
                      >
                        غفوة 10 دقائق
                      </button>
                    </div>
                  </>
                )}

                {/* ---------- خطوة 2: القفل ---------- */}
                {step === 'locked' && (
                  <>
                    <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4 text-amber-400">
                      <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-serif">التطبيق مقفل</h2>
                    <p className="text-white/70 mb-6 leading-relaxed">
                      نحن بانتظارك لكي تؤدي الصلاة. <br />
                      الصلاة أهم من أي شيء في هذا التطبيق! 
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setStep('swear')}
                        className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      >
                        <CheckCircle size={20} />
                        أديت الصلاة
                      </button>
                      <button 
                        onClick={() => setStep('missed')}
                        className="w-full py-3 rounded-2xl font-medium text-white/60 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20"
                      >
                        فاتتني الصلاة (خرج الوقت)
                      </button>
                    </div>
                  </>
                )}

                {/* ---------- خطوة 3: القسم ---------- */}
                {step === 'swear' && (
                  <>
                    <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                      <Shield size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4 font-serif">قسم الصلاة</h2>
                    <p className="text-emerald-300/90 mb-5 font-bold text-lg leading-loose border-2 border-emerald-500/30 p-4 rounded-xl bg-emerald-900/20 border-dashed">
                      "أقسم بالله العظيم الذي لا إله إلا هو، أنني أديت صلاة {prayerName}."
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => completePrayerFlow(false)}
                        className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      >
                        أُشهد الله على ذلك
                      </button>
                      <button 
                        onClick={() => setStep('locked')}
                        className="w-full py-3 rounded-2xl font-medium text-white/70 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        تراجع (أستغفر الله، لم أصلِ بعد)
                      </button>
                    </div>
                  </>
                )}

                {/* ---------- خطوة 4: الفوات والقضاء ---------- */}
                {step === 'missed' && (
                  <>
                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-400">
                      <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-serif">فاتتك الصلاة!</h2>
                    <p className="text-white/70 mb-6 text-sm leading-relaxed">
                      (فَخَلَفَ مِن بَعْدِهِمْ خَلْفٌ أَضَاعُوا الصَّلَاةَ...) <br />
                      هل قمت بقضاء صلاة {prayerName} الآن؟
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setStep('reason')}
                        className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                      >
                        نعم، قضيتها وتُبت
                      </button>
                      <button 
                        onClick={() => setStep('locked')}
                        className="w-full py-3 rounded-2xl font-medium text-white/80 bg-red-500/20 hover:bg-red-500/30 transition-all border border-red-500/30 flex flex-col items-center justify-center"
                      >
                        <span>لا، لم أقضها بعد</span>
                        <span className="text-xs opacity-70 mt-1">اذهب وصلّها الآن لفتح التطبيق</span>
                      </button>
                    </div>
                  </>
                )}

                {/* ---------- خطوة 5: السبب ---------- */}
                {step === 'reason' && (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-3 font-serif">لماذا فوّت الصلاة؟</h2>
                    <p className="text-white/70 mb-5 text-xs">
                      المصارحة مع النفس أول خطوات التوبة. <br />
                      لماذا أضعت الصلاة عن وقتها؟ (سيتم تصفير السترايك)
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {MISS_REASONS.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => setReason(r)}
                          className={`p-2 py-3 text-xs font-bold rounded-xl border transition-all ${
                            reason === r 
                              ? 'bg-amber-500/30 border-amber-500 text-white shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={handleReasonSubmit}
                      disabled={!reason}
                      className="w-full py-4 rounded-2xl font-bold text-sm md:text-base text-white bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      حفظ وتوبة (فتح التطبيق)
                    </button>
                  </>
                )}

              </div>

              {/* شريط سفلي */}
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Streak Badge */}
        {showContent && prayerStreak > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-emerald-500/30 text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
          >
            <span className="font-bold text-sm">سترايك الصلاة الحالي:</span>
            <span className="font-mono font-black text-xl text-white drop-shadow-md">{prayerStreak}</span>
            <span className="text-xl">🔥</span>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, X } from 'lucide-react';

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

// ═══════════════════════════════════════════
// المكوّن الرئيسي
// ═══════════════════════════════════════════
export default function AdhanOverlay({
  prayerName,
  time,
  onClose,
}: {
  prayerName: string;
  time: string;
  onClose: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [muted, setMuted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const info = getPrayerInfo(prayerName);

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // تشغيل الأذان
  useEffect(() => {
    const audio = new Audio('https://download.quranicaudio.com/adhan/makkah.mp3');
    audioRef.current = audio;

    audio.addEventListener('playing', () => setAudioPlaying(true));
    audio.addEventListener('pause', () => setAudioPlaying(false));
    audio.addEventListener('ended', () => setAudioPlaying(false));

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
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleManualPlay = () => {
    audioRef.current?.play().then(() => setAudioError(false)).catch(console.error);
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
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          referrerPolicy="no-referrer"
        />

        {/* طبقة ضبابية */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {/* نجوم متساقطة */}
        {fallingStars.map((s, i) => <FallingStar key={i} x={s.x} delay={s.delay} />)}
      </div>

      {/* ── زر الإغلاق ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        onClick={onClose}
        className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <X size={18} className="text-white/70" />
      </motion.button>

      {/* ── زر الصوت ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        onClick={audioError ? handleManualPlay : toggleMute}
        className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {muted ? (
          <VolumeX size={18} className="text-white/50" />
        ) : (
          <Volume2 size={18} className="text-amber-400" />
        )}
      </motion.button>

      {/* ── المحتوى الرئيسي ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">

        {/* المئذنة */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
              className="relative mb-8 flex flex-col items-center"
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
                    className="absolute inset-0 rounded-full blur-2xl"
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

        {/* بطاقة المعلومات */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 70, damping: 18 }}
              className="w-full rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(251,191,36,0.2)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,191,36,0.05), inset 0 1px 0 rgba(251,191,36,0.15)',
              }}
            >
              {/* شريط علوي ذهبي */}
              <div
                className="h-0.5 w-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.8), transparent)' }}
              />

              <div className="p-7 text-center">
                {/* وقت الصلاة */}
                <p className="text-amber-400/70 text-xs tracking-widest mb-1 font-light">{info.period}</p>

                {/* اسم الصلاة */}
                <motion.h1
                  animate={{ textShadow: ['0 0 20px rgba(251,191,36,0.3)', '0 0 40px rgba(251,191,36,0.6)', '0 0 20px rgba(251,191,36,0.3)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-5xl font-bold text-amber-400 mb-1"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {prayerName}
                </motion.h1>

                <p className="text-white/40 text-sm mb-6">حان وقت الصلاة</p>

                {/* الساعة الحالية */}
                <div
                  className="inline-block px-6 py-3 rounded-2xl mb-6"
                  style={{
                    background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.15)',
                  }}
                >
                  <motion.p
                    key={currentTime.getSeconds()}
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-mono font-bold text-white tabular-nums"
                    style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
                  >
                    {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </motion.p>
                </div>

                {/* الآية / الذكر */}
                <div
                  className="rounded-2xl p-4 mb-6"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-white/80 text-lg leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                    {info.arabicText}
                  </p>
                </div>

                {/* زر الإغلاق */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl font-bold text-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%)',
                    color: '#1a0a00',
                    boxShadow: '0 8px 25px rgba(251,191,36,0.3)',
                  }}
                >
                  اللهم تقبّل صلاتي 🤲
                </motion.button>
              </div>

              {/* شريط سفلي */}
              <div
                className="h-0.5 w-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

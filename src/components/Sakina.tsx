import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, CloudRain, Waves, Flame, X, Volume2, VolumeX, Moon } from 'lucide-react';
import ReactPlayer from 'react-player';

const zikrSequence = [
  { text: 'سُبْحَانَ اللَّهِ', phase: 'شهيق - تنفس ببطء', duration: 4000 },
  { text: 'الْحَمْدُ لِلَّهِ', phase: 'احتفاظ - اشعر بالنعمة', duration: 4000 },
  { text: 'اللَّهُ أَكْبَرُ', phase: 'زفير - أخرج التوتر', duration: 4000 }
];

const ambientSounds = [
  { id: 'quran', name: 'القرآن الكريم', icon: <Moon size={20} />, color: 'bg-emerald-500', url: 'https://www.youtube.com/watch?v=R9ZzE15wXos' },
  { id: 'rain', name: 'مطر هادئ', icon: <CloudRain size={20} />, color: 'bg-blue-500', url: 'https://www.youtube.com/watch?v=mPZkdNFkNps' },
  { id: 'waves', name: 'أمواج البحر', icon: <Waves size={20} />, color: 'bg-cyan-500', url: 'https://www.youtube.com/watch?v=nep1qPtqAlA' },
  { id: 'wind', name: 'نسيم الرياح', icon: <Wind size={20} />, color: 'bg-teal-500', url: 'https://www.youtube.com/watch?v=QZ0B87Qng0E' },
];

const Player = ReactPlayer as any;

export default function Sakina({ onBack }: { onBack: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState(0);
  const [sound, setSound] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setStep((s) => (s + 1) % 3);
      }, 4000);
    } else {
      setStep(0);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const currentZikr = zikrSequence[step];

  const getOrbAnimation = (): any => {
    switch (step) {
      case 0: return { scale: 1.5, opacity: 0.8, transition: { duration: 4, ease: 'easeInOut' } }; // Expand
      case 1: return { scale: 1.5, opacity: 1, transition: { duration: 4, ease: 'linear' } }; // Hold
      case 2: return { scale: 1, opacity: 0.5, transition: { duration: 4, ease: 'easeInOut' } }; // Shrink
      default: return { scale: 1, opacity: 0.5 };
    }
  };

  const selectedSound = ambientSounds.find(s => s.id === sound);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050B14] text-white flex flex-col items-center justify-center overflow-hidden" 
      dir="rtl"
    >
      {selectedSound && (
        <div className="hidden">
          {React.createElement(Player, {
            url: selectedSound.url,
            playing: true,
            loop: true,
            muted: isMuted,
            volume: 1,
            width: "0",
            height: "0"
          })}
        </div>
      )}

      {/* Background Ambient Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <button onClick={() => { setSound(null); onBack(); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10">
          <X size={24} className="text-white/70" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-serif text-emerald-100/90 font-bold tracking-wider">خيمة السكينة</h1>
          <p className="text-xs text-white/40 tracking-widest mt-1">تأمل، تنفس، واذكر الله</p>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10">
          {isMuted ? <VolumeX size={24} className="text-white/70" /> : <Volume2 size={24} className="text-white/70" />}
        </button>
      </div>

      {/* Breathing Orb */}
      <div className="relative w-64 h-64 flex items-center justify-center z-10 m-auto mt-10">
        <motion.div
           animate={isActive ? getOrbAnimation() : { scale: 1, opacity: 0.3 }}
          className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-600/30 blur-2xl"
        />
        <motion.div
          animate={isActive ? getOrbAnimation() : { scale: 1, opacity: 0.5 }}
          className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-500/20 shadow-[0_0_50px_rgba(52,211,153,0.3)] border border-white/10 backdrop-blur-md"
        />
        <div className="relative z-10 text-center flex flex-col items-center justify-center w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={isActive ? step : 'idle'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center w-full"
            >
              {isActive ? (
                <>
                  <p className="text-emerald-200/80 text-xs mb-3 font-medium tracking-wide">{currentZikr.phase}</p>
                  <h2 className="text-3xl font-bold font-serif text-white tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{currentZikr.text}</h2>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <Wind size={32} className="text-emerald-400 mb-3 opacity-80" />
                  <h2 className="text-xl font-bold font-serif text-white/80">استعد للسكينة</h2>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-16 w-full px-8 z-20 flex flex-col items-center gap-10">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-12 py-4 rounded-full font-bold text-lg tracking-wide transition-all shadow-lg ${
            isActive 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
              : 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400'
          }`}
        >
          {isActive ? 'إنهاء الجلسة' : 'ابدأ لحظة السكينة'}
        </button>

        {/* Ambient Sounds */}
        <div className="w-full flex justify-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          {ambientSounds.map((env) => (
            <button
              key={env.id}
              onClick={() => setSound(sound === env.id ? null : env.id)}
              className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-2 border flex-1 ${
                sound === env.id 
                  ? 'bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative' 
                  : 'bg-transparent border-transparent text-white/50 hover:bg-white/5'
              }`}
            >
              <div className={`${sound === env.id ? env.color + ' text-white shadow-lg' : 'text-white/50 bg-black/20'} p-2.5 rounded-full transition-colors`}>
                {env.icon}
              </div>
              <span className={`text-[10px] whitespace-nowrap font-bold ${sound === env.id ? 'text-white' : 'text-white/40'}`}>
                {env.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

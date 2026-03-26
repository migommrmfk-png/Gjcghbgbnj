import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Edit2, ChevronRight, MoreHorizontal, Palette, Square, CircleDot, Sparkles, Settings as SettingsIcon, X, Volume2, VolumeX, Vibrate } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

export default function Tasbeeh() {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('tasbeehCount');
    return saved ? parseInt(saved) : 0;
  });
  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem('tasbeehTarget');
    return saved ? parseInt(saved) : 33;
  });
  const [rounds, setRounds] = useState(() => {
    const saved = localStorage.getItem('tasbeehRounds');
    return saved ? parseInt(saved) : 1;
  });
  const [currentZikr, setCurrentZikr] = useState(() => {
    return localStorage.getItem('tasbeehZikr') || "سُبْحَانَ اللَّهِ";
  });
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tasbeehSound') !== 'false';
  });
  const [vibrationPattern, setVibrationPattern] = useState<'short' | 'long' | 'double' | 'none'>(() => {
    return (localStorage.getItem('tasbeehVibration') as any) || 'short';
  });
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(target.toString());
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    localStorage.setItem('tasbeehCount', count.toString());
    localStorage.setItem('tasbeehTarget', target.toString());
    localStorage.setItem('tasbeehRounds', rounds.toString());
    localStorage.setItem('tasbeehZikr', currentZikr);
    localStorage.setItem('tasbeehSound', soundEnabled.toString());
    localStorage.setItem('tasbeehVibration', vibrationPattern);
  }, [count, target, rounds, currentZikr, soundEnabled, vibrationPattern]);

  const azkarList = [
    "سُبْحَانَ اللَّهِ",
    "الْحَمْدُ لِلَّهِ",
    "اللَّهُ أَكْبَرُ",
    "لَا إِلَهَ إِلَّا اللَّهُ",
    "أَسْتَغْفِرُ اللَّهَ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    "سُبْحَانَ اللَّهِ الْعَظِيمِ"
  ];

  const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }

    // Add particle effect
    const newParticle = {
      id: Date.now(),
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
    };
    setParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);

    if (count + 1 >= target) {
      setCount(0);
      setRounds(rounds + 1);
      if (navigator.vibrate && vibrationPattern !== 'none') {
        navigator.vibrate([200, 100, 200]);
      }
    } else {
      setCount(count + 1);
      if (navigator.vibrate && vibrationPattern !== 'none') {
        if (vibrationPattern === 'short') navigator.vibrate(50);
        else if (vibrationPattern === 'long') navigator.vibrate(150);
        else if (vibrationPattern === 'double') navigator.vibrate([50, 50, 50]);
      }
    }
  };

  const reset = () => {
    setCount(0);
    setRounds(1);
  };

  const changeZikr = () => {
    const currentIndex = azkarList.indexOf(currentZikr);
    const nextIndex = (currentIndex + 1) % azkarList.length;
    setCurrentZikr(azkarList[nextIndex]);
    reset();
  };

  const saveTarget = () => {
    const newTarget = parseInt(tempTarget);
    if (!isNaN(newTarget) && newTarget > 0) {
      setTarget(newTarget);
      setCount(0);
      setRounds(1);
    }
    setIsEditingTarget(false);
  };

  const progress = (count / target) * 100;
  const circumference = 2 * Math.PI * 120; // radius is 120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] relative overflow-hidden pb-32" dir="rtl">
      {/* Animated Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-primary)] blur-[120px] rounded-full pointer-events-none"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 mt-2">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <SettingsIcon className="text-[var(--color-text)]" size={24} />
          </button>
          <button onClick={reset} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <RotateCcw className="text-[var(--color-text)]" size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="font-bold text-[var(--color-text)] text-lg tracking-wide">المسبحة الذكية</span>
          </div>
          <Sparkles className="text-[var(--color-primary)]" size={24} />
        </div>
      </div>

      {/* Zikr Display (Holographic Screen) */}
      <div className="px-6 mt-4 z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden"
        >
          {/* Holographic lines */}
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,var(--color-primary)_2px,var(--color-primary)_4px)] pointer-events-none mix-blend-overlay"></div>
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] px-3 py-1 rounded-full font-mono text-xs tracking-widest border border-[var(--color-primary)]/20 shadow-inner">
              ROUND {rounds.toString().padStart(2, '0')}
            </div>
            <button onClick={changeZikr} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition-colors bg-black/5 dark:bg-white/5 p-2 rounded-full border border-black/5 dark:border-white/5">
              <ChevronRight className="rotate-180" size={20} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.h2 
              key={currentZikr}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text)] text-center my-6 leading-relaxed drop-shadow-sm relative z-10"
            >
              {currentZikr}
            </motion.h2>
          </AnimatePresence>

          <div className="flex justify-center items-end gap-2 relative z-10" dir="ltr">
            {isEditingTarget ? (
              <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/10 dark:border-white/10">
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-20 text-center text-3xl font-mono font-bold bg-transparent text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] outline-none"
                  autoFocus
                />
                <button 
                  onClick={saveTarget}
                  className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  حفظ
                </button>
              </div>
            ) : (
              <div 
                className="cursor-pointer group flex items-baseline bg-black/5 dark:bg-white/5 px-6 py-2 rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-[var(--color-primary)]/30 transition-all"
                onClick={() => {
                  setTempTarget(target.toString());
                  setIsEditingTarget(true);
                }}
              >
                <span className="text-6xl font-mono font-bold text-[var(--color-primary)] drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  {count.toString().padStart(3, '0')}
                </span>
                <span className="text-xl font-mono text-[var(--color-text-muted)] ml-2 group-hover:text-[var(--color-primary)] transition-colors">
                  /{target}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Main Clicker Button Area */}
      <div className="flex-1 flex flex-col items-center justify-center mt-4 relative z-10">
        <div className="relative flex items-center justify-center">
          
          {/* Circular Progress Bar */}
          <svg className="absolute w-[320px] h-[320px] -rotate-90 pointer-events-none">
            {/* Background Circle */}
            <circle
              cx="160"
              cy="160"
              r="120"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="160"
              cy="160"
              r="120"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ strokeDasharray: circumference }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary-light)" />
                <stop offset="100%" stopColor="var(--color-primary-dark)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Particles */}
          <AnimatePresence>
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 2, x: p.x, y: p.y }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-3 h-3 rounded-full bg-[var(--color-primary)] blur-[2px] pointer-events-none z-30"
              />
            ))}
          </AnimatePresence>

          {/* The 3D Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePress}
            className="w-52 h-52 rounded-full relative outline-none touch-manipulation z-20 group"
          >
            {/* Outer Bezel */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.2)] border border-white/5 flex items-center justify-center">
              
              {/* Inner Depression */}
              <div className="w-44 h-44 rounded-full bg-black/60 shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] flex items-center justify-center border border-black relative overflow-hidden">
                
                {/* Glowing Core */}
                <div className={`absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] opacity-80 transition-opacity duration-200 ${isPressed ? 'opacity-100' : ''}`}></div>
                
                {/* Texture */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
                
                {/* Center Element */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center relative z-10 transition-all duration-200 ${
                  isPressed 
                    ? 'bg-black/40 shadow-[inset_0_5px_15px_rgba(0,0,0,0.6)] scale-95' 
                    : 'bg-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.3),inset_0_2px_5px_rgba(255,255,255,0.2)] backdrop-blur-sm'
                }`}>
                  <div className={`absolute inset-0 rounded-full border-2 border-white/20 ${isPressed ? 'scale-90 opacity-50' : 'scale-100 opacity-100'} transition-all duration-200`}></div>
                  <CircleDot className={`w-10 h-10 transition-colors duration-200 ${isPressed ? 'text-[var(--color-primary)] drop-shadow-[0_0_10px_var(--color-primary)]' : 'text-[var(--color-text)] opacity-90'}`} />
                </div>

                {/* Reflection Highlight */}
                <div className="absolute top-0 left-1/4 right-1/4 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-md pointer-events-none"></div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between z-20 pointer-events-none">
        <button 
          onClick={() => setIsThemeSelectorOpen(true)}
          className="w-14 h-14 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors pointer-events-auto"
        >
          <Palette className="text-[var(--color-text)]" size={24} />
        </button>
        <button className="w-14 h-14 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors pointer-events-auto">
          <Edit2 className="text-[var(--color-text)]" size={24} />
        </button>
      </div>

      <ThemeSelector 
        isOpen={isThemeSelectorOpen} 
        onClose={() => setIsThemeSelectorOpen(false)} 
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-surface)] border border-black/10 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setIsSettingsOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={24} />
                </button>
                <h3 className="text-xl font-bold text-[var(--color-text)]">إعدادات المسبحة</h3>
              </div>

              <div className="space-y-6">
                {/* Sound Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[var(--color-text)]">
                    {soundEnabled ? <Volume2 size={20} className="text-[var(--color-primary)]" /> : <VolumeX size={20} className="text-[var(--color-text-muted)]" />}
                    <span className="font-medium">الصوت</span>
                  </div>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-[var(--color-primary)]' : 'bg-white/20'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${soundEnabled ? 'left-1' : 'right-1'}`} />
                  </button>
                </div>

                {/* Vibration Setting */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[var(--color-text)] mb-2">
                    <Vibrate size={20} className="text-[var(--color-primary)]" />
                    <span className="font-medium">نمط الاهتزاز</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', label: 'بدون' },
                      { id: 'short', label: 'قصير' },
                      { id: 'long', label: 'طويل' },
                      { id: 'double', label: 'مزدوج' }
                    ].map(pattern => (
                      <button
                        key={pattern.id}
                        onClick={() => setVibrationPattern(pattern.id as any)}
                        className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors border ${
                          vibrationPattern === pattern.id 
                            ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]' 
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[var(--color-text-muted)] hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {pattern.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ChevronRight, Sparkles, Settings as SettingsIcon, X, Volume2, VolumeX, Vibrate } from 'lucide-react';

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
  const [isResetPressed, setIsResetPressed] = useState(false);

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
    e.preventDefault();
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
    setIsResetPressed(true);
    setTimeout(() => setIsResetPressed(false), 150);
    setCount(0);
    setRounds(1);
  };

  const changeZikr = () => {
    const currentIndex = azkarList.indexOf(currentZikr);
    const nextIndex = (currentIndex + 1) % azkarList.length;
    setCurrentZikr(azkarList[nextIndex]);
    setCount(0);
    setRounds(1);
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

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] relative overflow-hidden pb-24" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--color-primary)]/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 mt-2">
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <SettingsIcon className="text-[var(--color-text)]" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--color-text)] text-lg tracking-wide">المسبحة الإلكترونية</span>
          <Sparkles className="text-[var(--color-primary)]" size={24} />
        </div>
      </div>

      {/* Zikr Display */}
      <div className="px-6 mt-2 z-10">
        <div className="bg-[var(--color-surface)] border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-lg relative overflow-hidden text-center">
          <button onClick={changeZikr} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-2 bg-black/5 dark:bg-white/5 rounded-full">
            <ChevronRight className="rotate-180" size={24} />
          </button>
          
          <AnimatePresence mode="wait">
            <motion.h2 
              key={currentZikr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl md:text-3xl font-serif font-bold text-[var(--color-text)] my-2 leading-relaxed"
            >
              {currentZikr}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>

      {/* Digital Counter Device */}
      <div className="flex-1 flex items-center justify-center mt-8 relative z-10 px-4">
        <div className="relative w-full max-w-[340px] aspect-square bg-[var(--color-surface)] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_2px_5px_rgba(255,255,255,0.1)] border border-black/5 dark:border-white/5 flex flex-col items-center justify-center p-6">
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-black/5 dark:text-white/5"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]"
              initial={{ strokeDasharray: "0 289" }}
              animate={{ strokeDasharray: `${(count / target) * 289} 289` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </svg>

          {/* Screen Area */}
          <div className="absolute top-12 flex flex-col items-center">
            <div className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-widest mb-1">
              الدورة {rounds}
            </div>
            <div className="text-5xl font-bold text-[var(--color-text)] tracking-tight drop-shadow-sm font-serif">
              {count}
            </div>
            
            {/* Target Edit */}
            <div className="mt-2">
              {isEditingTarget ? (
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-full border border-black/10 dark:border-white/10">
                  <input
                    type="number"
                    value={tempTarget}
                    onChange={(e) => setTempTarget(e.target.value)}
                    className="w-12 text-center text-sm font-bold bg-transparent text-[var(--color-text)] outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={saveTarget}
                    className="bg-[var(--color-primary)] text-white px-2 py-1 rounded-full text-xs font-bold"
                  >
                    حفظ
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setTempTarget(target.toString());
                    setIsEditingTarget(true);
                  }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] text-xs font-medium transition-colors bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full"
                >
                  الهدف: {target}
                </button>
              )}
            </div>
          </div>

          {/* Main Count Button */}
          <div className="absolute bottom-12">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onPointerDown={handlePress}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-[0_10px_25px_rgba(0,0,0,0.4),inset_0_4px_10px_rgba(255,255,255,0.3)] border-4 border-[var(--color-surface)] flex items-center justify-center relative overflow-hidden group"
              style={{ touchAction: 'manipulation' }}
            >
              {/* Button Inner Depression */}
              <div className={`absolute inset-1 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] transition-all duration-100 ${isPressed ? 'shadow-[inset_0_8px_15px_rgba(0,0,0,0.4)] opacity-80' : 'shadow-[inset_0_2px_5px_rgba(255,255,255,0.4)] opacity-100'}`}></div>
              
              {/* Ripple Effect Container */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-full h-full rounded-full border-4 border-white/30 transition-transform duration-300 ${isPressed ? 'scale-110 opacity-0' : 'scale-50 opacity-100'}`}></div>
              </div>
              
              <span className="relative z-10 text-white font-bold text-2xl drop-shadow-md">سبّح</span>
            </motion.button>
          </div>

          {/* Reset Button */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={reset}
              className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 shadow-sm border border-black/10 dark:border-white/10 flex items-center justify-center transition-colors"
            >
              <RotateCcw size={18} className="text-[var(--color-text-muted)]" />
            </motion.button>
          </div>

        </div>
      </div>

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
                    className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-[var(--color-primary)]' : 'bg-black/20 dark:bg-white/20'}`}
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

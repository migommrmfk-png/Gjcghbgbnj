import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ChevronRight, Sparkles, Settings as SettingsIcon, X, Volume2, VolumeX, Vibrate } from 'lucide-react';

export default function Tasbeeh({ onBack }: { onBack?: () => void }) {
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
  const audioCtxRef = React.useRef<AudioContext | null>(null);

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
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioCtx = audioCtxRef.current;
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden pb-24" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 mt-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-md">
            <SettingsIcon className="text-slate-600 dark:text-slate-400" size={24} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 dark:text-slate-100 text-xl tracking-wide">المسبحة الإلكترونية</span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_5px_15px_rgba(16,185,129,0.3)] border border-white/20">
            <Sparkles className="text-white" size={20} />
          </div>
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm mr-2 block">
              <ChevronRight size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Zikr Display */}
      <div className="px-6 mt-4 z-10">
        <div className="card-3d bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden text-center min-h-[140px] flex items-center justify-center border border-black/5 dark:border-white/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <button onClick={changeZikr} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors p-3 bg-white dark:bg-slate-800 rounded-[1rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-x-1 active:scale-95 z-20">
            <ChevronRight className="rotate-180" size={22} />
          </button>
          
          <AnimatePresence mode="wait">
            <motion.h2 
              key={currentZikr}
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
              className="text-3xl md:text-5xl font-serif font-bold bg-gradient-to-l from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent my-2 leading-[1.6] drop-shadow-sm px-8 relative z-10"
            >
              {currentZikr}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>

      {/* Digital Counter Device */}
      <div className="flex-1 flex items-center justify-center mt-6 relative z-10 px-4">
        <div className="relative w-full max-w-[340px] aspect-square rounded-[3rem] flex flex-col items-center justify-center p-6 card-3d bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden group">
          
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-50"></div>
          <div className="absolute inset-2 rounded-[2.5rem] border border-slate-100/50 dark:border-slate-800/50 shadow-inner"></div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-md z-10" viewBox="0 0 100 100">
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-100 dark:text-slate-800/50"
            />
            <motion.rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="46"
              fill="none"
              stroke="url(#emeraldGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 289" }}
              animate={{ strokeDasharray: `${(count / target) * 289} 289` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Screen Area */}
          <div className="absolute top-12 flex flex-col items-center glass dark:glass-dark px-8 py-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-inner z-20">
            <div className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
              الدورة {rounds}
            </div>
            <div className="text-6xl font-bold bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight drop-shadow-sm font-serif">
              {count}
            </div>
            
            {/* Target Edit */}
            <div className="mt-3">
              {isEditingTarget ? (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-[1rem] border border-slate-200 dark:border-slate-700 shadow-inner">
                  <input
                    type="number"
                    value={tempTarget}
                    onChange={(e) => setTempTarget(e.target.value)}
                    className="w-16 text-center text-sm font-bold bg-transparent text-slate-800 dark:text-slate-100 outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={saveTarget}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-[0.8rem] text-xs font-bold shadow-md hover:shadow-lg transition-shadow"
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
                  className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 text-xs font-bold transition-colors bg-slate-50 dark:bg-slate-800/80 px-5 py-2 rounded-[1rem] border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  الهدف: {target}
                </button>
              )}
            </div>
          </div>

          {/* Main Count Button */}
          <div className="absolute bottom-8 z-30">
            <button
              onPointerDown={handlePress}
              className={`w-36 h-36 rounded-full flex items-center justify-center relative outline-none select-none transition-all duration-100 ${
                isPressed 
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-[inset_0_10px_20px_rgba(0,0,0,0.4),0_2px_5px_rgba(16,185,129,0.3)] translate-y-[8px]' 
                  : 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-[0_15px_0_#065f46,0_25px_35px_rgba(16,185,129,0.4),inset_0_2px_5px_rgba(255,255,255,0.4)] hover:-translate-y-1 hover:shadow-[0_18px_0_#065f46,0_30px_40px_rgba(16,185,129,0.5),inset_0_2px_5px_rgba(255,255,255,0.4)]'
              }`}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`absolute inset-0 rounded-full border border-white/20 transition-all ${isPressed ? 'opacity-0' : 'opacity-100'}`}></div>
              <div className={`absolute inset-2 rounded-full transition-all duration-75 ${isPressed ? 'bg-black/10' : 'bg-gradient-to-tl from-black/10 to-transparent'}`}></div>
              <span className={`relative z-10 font-bold text-4xl font-serif tracking-wide transition-all duration-75 drop-shadow-md ${isPressed ? 'text-white/80 scale-95' : 'text-white text-shadow-sm'}`}>
                سبّح
              </span>
            </button>
          </div>

          {/* Reset Button */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={reset}
              className="w-12 h-12 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:-translate-y-1"
            >
              <RotateCcw size={20} className="text-slate-500 hover:text-emerald-500 transition-colors" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={24} />
                </button>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">إعدادات المسبحة</h3>
              </div>

              <div className="space-y-6">
                {/* Sound Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    {soundEnabled ? <Volume2 size={20} className="text-emerald-500" /> : <VolumeX size={20} className="text-slate-400" />}
                    <span className="font-medium">الصوت</span>
                  </div>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${soundEnabled ? 'left-1' : 'right-1'}`} />
                  </button>
                </div>

                {/* Vibration Setting */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 mb-2">
                    <Vibrate size={20} className="text-emerald-500" />
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
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
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

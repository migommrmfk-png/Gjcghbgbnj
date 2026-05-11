import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Droplets, Leaf, ShieldAlert, Sparkles, Trophy, Star, ShieldCheck } from 'lucide-react';

export default function MuslimGarden({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState<number>(() => parseInt(localStorage.getItem('muslimGarden_level') || '1', 10));
  const [experience, setExperience] = useState<number>(() => parseInt(localStorage.getItem('muslimGarden_xp') || '0', 10));
  const [showAnimation, setShowAnimation] = useState<'water' | 'protect' | null>(null);

  const xpToNextLevel = level * 50;

  useEffect(() => {
    localStorage.setItem('muslimGarden_level', String(level));
    localStorage.setItem('muslimGarden_xp', String(experience));
  }, [level, experience]);

  const addExperience = (amount: number, type: 'water' | 'protect') => {
    if (navigator.vibrate) navigator.vibrate(50);
    setShowAnimation(type);
    
    setTimeout(() => {
      setExperience(prev => {
        let newXp = prev + amount;
        if (newXp >= xpToNextLevel) {
          if (level < 15) {
            setLevel(l => l + 1);
            return newXp - xpToNextLevel;
          } else {
            return prev; // Max level reached
          }
        }
        return Math.max(0, newXp);
      });
      setTimeout(() => setShowAnimation(null), 1000);
    }, 500);
  };

  const getGardenState = () => {
    if (level <= 2) return { emoji: "🌱", character: "🧍‍♂️", ground: "bg-amber-900/40", sky: "from-blue-200 to-white dark:from-slate-800 dark:to-slate-900", text: "بذرة الإخلاص" };
    if (level <= 5) return { emoji: "🌿", character: "🚶‍♂️", ground: "bg-emerald-900/60", sky: "from-blue-300 to-blue-100 dark:from-slate-700 dark:to-slate-800", text: "نبتة اليقين" };
    if (level <= 8) return { emoji: "🪴", character: "🏃‍♂️", ground: "bg-emerald-800/80", sky: "from-blue-400 to-blue-200 dark:from-slate-600 dark:to-slate-800", text: "شجيرة التقوى" };
    if (level <= 11) return { emoji: "🌳", character: "🧑‍🌾", ground: "bg-emerald-700", sky: "from-sky-400 to-blue-300 dark:from-indigo-900 dark:to-slate-800", text: "شجرة الإحسان" };
    return { emoji: "🕌🌳✨", character: "👳‍♂️", ground: "bg-emerald-600", sky: "from-indigo-500 to-purple-400 dark:from-indigo-950 dark:to-purple-900", text: "بستان الفردوس" };
  };

  const state = getGardenState();
  const progressPercent = Math.min((experience / xpToNextLevel) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 z-20 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <button onClick={onBack} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">
          <ArrowRight size={24} className="text-slate-500 hover:text-emerald-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-serif text-emerald-500 flex items-center gap-2">
            <Leaf size={20} /> بستان العبادات
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700/50">
          <Star size={16} className="text-amber-500 fill-amber-500" />
          <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">مستوى {level}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col pt-8 pb-32">
        {/* Game Scene */}
        <div className={`relative w-full h-[45vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-end bg-gradient-to-b ${state.sky} transition-colors duration-1000`}>
          
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <motion.div 
            animate={{ x: [0, -20, 0] }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
            className="absolute top-10 right-10 text-4xl opacity-50"
          >☁️</motion.div>
          <motion.div 
            animate={{ x: [0, 30, 0] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} 
            className="absolute top-20 left-10 text-3xl opacity-40"
          >☁️</motion.div>

          {/* Plant & Character */}
          <div className="relative z-10 flex items-end justify-center w-full mb-10 gap-4">
            
            <AnimatePresence>
              {showAnimation === 'water' && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 text-2xl z-20"
                >💧</motion.div>
              )}
              {showAnimation === 'protect' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1.5, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 text-3xl z-20"
                >🛡️</motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              key={level}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-[100px] leading-none drop-shadow-2xl z-10 origin-bottom"
              style={{ filter: "drop-shadow(0 20px 10px rgba(0,0,0,0.3))" }}
            >
              {state.emoji}
            </motion.div>

            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: showAnimation === 'water' ? [-15, 0] : [0, 5, -5, 0]
              }}
              transition={{ 
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: showAnimation === 'water' ? 0.5 : 4, repeat: showAnimation === 'water' ? 0 : Infinity, ease: "easeInOut" }
              }}
              className="text-[80px] drop-shadow-xl z-20 absolute -right-6 bottom-4"
            >
              {state.character}
            </motion.div>
          </div>

          {/* Ground */}
          <div className={`w-full h-16 ${state.ground} mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.2)] transition-colors duration-1000 z-0 border-t border-black/10 dark:border-white/10`} />
        </div>

        {/* Status Card */}
        <div className="mt-6 card-3d bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] border border-black/5 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
          
          <div className="relative z-10 text-center mb-6">
            <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100 mb-1">{state.text}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">واصل رعاية بستانك لترتفع درجاتك</p>
          </div>

          <div className="relative z-10 mb-2 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
            <span>{experience} XP</span>
            <span>{xpToNextLevel} XP للترقية</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner border border-black/5 dark:border-white/5 relative z-10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_linear_infinite]"></div>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button 
            onClick={() => addExperience(15, 'water')}
            className="card-3d bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-white shadow-lg active:scale-95 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner group-hover:scale-110 transition-transform">
              <Droplets size={28} />
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg mb-0.5">سقيا الطاعة</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">+15 XP</span>
            </div>
          </button>

          <button 
            onClick={() => addExperience(25, 'protect')}
            className="card-3d bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-white shadow-lg active:scale-95 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner group-hover:scale-110 transition-transform">
              <ShieldCheck size={28} />
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg mb-0.5">حماية واعتصام</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">+25 XP</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

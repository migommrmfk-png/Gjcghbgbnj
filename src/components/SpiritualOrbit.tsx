import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Moon, Sun, Book, Heart, Shield, Droplets, X } from 'lucide-react';

// Data for the orbit
const ORBIT_DATA = [
  { id: 'fard', name: 'الصلوات الخمس', icon: <Sun size={18} />, maxCount: 5, color: '#F59E0B', orbitSize: 160, duration: 30 },
  { id: 'sunnah', name: 'السنن الرواتب', icon: <Moon size={18} />, maxCount: 12, color: '#3B82F6', orbitSize: 240, duration: 40 },
  { id: 'quran', name: 'ورد القرآن', icon: <Book size={18} />, maxCount: 1, color: '#10B981', orbitSize: 320, duration: 50 },
  { id: 'azkar', name: 'الأذكار', icon: <Shield size={18} />, maxCount: 2, color: '#8B5CF6', orbitSize: 400, duration: 60 },
  { id: 'charity', name: 'الصدقة', icon: <Heart size={18} />, maxCount: 1, color: '#F43F5E', orbitSize: 480, duration: 70 },
];

export default function SpiritualOrbit({ onBack }: { onBack: () => void }) {
  const [progress, setProgress] = useState<Record<string, number>>({
    fard: 0, sunnah: 0, quran: 0, azkar: 0, charity: 0
  });

  const handleTap = (id: string, maxCount: number) => {
    setProgress(prev => {
      const current = prev[id] || 0;
      if (current < maxCount) {
        if (navigator.vibrate) navigator.vibrate(50);
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const totalProgress = Object.keys(progress).reduce((acc, key) => acc + (progress[key] / ORBIT_DATA.find(o => o.id === key)!.maxCount), 0);
  const totalPercentage = totalProgress / ORBIT_DATA.length; // 0 to 1

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#020617] text-white flex flex-col items-center justify-center overflow-hidden" 
      dir="rtl"
    >
      {/* Background stars */}
      <div className="absolute inset-0 opacity-40 select-none pointer-events-none">
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}></div>
        ))}
      </div>

       {/* Header */}
       <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10">
          <X size={24} className="text-white/70" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-serif text-amber-100/90 font-bold tracking-wider">مدار العبادات</h1>
          <p className="text-xs text-amber-200/40 mt-1 tracking-widest">اجعل قلبك مركزاً للطاعات</p>
        </div>
        <div className="w-12"></div> {/* Spacer */}
      </div>

      <div className="relative w-full h-full flex items-center justify-center -mt-10 overflow-hidden">
        {/* Central Heart (The Soul) */}
        <motion.div 
          className="absolute z-10 flex flex-col items-center justify-center"
          animate={{
            scale: 1 + (totalPercentage * 0.4),
            filter: `drop-shadow(0 0 ${10 + (totalPercentage * 80)}px rgba(252, 211, 77, ${0.3 + totalPercentage * 0.7})) border-radius: 50%`
          }}
          transition={{ duration: 1 }}
        >
           <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner transition-colors duration-1000 ${totalPercentage > 0 ? 'bg-gradient-to-br from-yellow-100 to-yellow-500 text-yellow-900 border-4 border-yellow-200 shadow-[0_0_50px_rgba(250,204,21,0.5)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
             <Droplets size={32} className={totalPercentage > 0 ? "text-yellow-800 animate-pulse" : "text-slate-500"} />
           </div>
           <span className={`absolute -bottom-8 text-xs font-bold tracking-widest whitespace-nowrap transition-colors duration-1000 ${totalPercentage > 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-white/30'}`}>
             القلب
           </span>
        </motion.div>

        {/* Orbits & Planets */}
        {ORBIT_DATA.map((orbit, index) => {
          const currentAmount = progress[orbit.id];
          const isComplete = currentAmount === orbit.maxCount;
          
          return (
            <div key={orbit.id} className="absolute flex items-center justify-center pointer-events-none" style={{ width: orbit.orbitSize, height: orbit.orbitSize }}>
              {/* Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed transition-colors duration-1000" style={{ opacity: isComplete ? 0.3 : 0.1, borderColor: isComplete ? orbit.color : 'rgba(255,255,255,0.5)' }} />
              
              {/* Planet System */}
              <motion.div 
                className="absolute inset-0 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: orbit.duration * (isComplete ? 0.5 : 1), repeat: Infinity, ease: "linear" }}
              >
                {/* The Planet itself */}
                <div 
                  className="absolute w-12 h-12 rounded-full flex flex-col items-center justify-center cursor-pointer pointer-events-auto hover:scale-110 transition-transform z-20 shadow-lg"
                  style={{ 
                    top: -24, 
                    left: '50%', 
                    marginLeft: -24, 
                    backgroundColor: currentAmount > 0 ? orbit.color : '#0f172a',
                    boxShadow: currentAmount > 0 ? `0 0 20px ${orbit.color}50, inset 0 -4px 10px rgba(0,0,0,0.3)` : 'inset 0 -4px 10px rgba(0,0,0,0.5)',
                    border: `1px solid ${currentAmount > 0 ? orbit.color : '#334155'}`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTap(orbit.id, orbit.maxCount);
                  }}
                  title={orbit.name}
                >
                  <div className={currentAmount > 0 ? "text-white drop-shadow-md" : "text-slate-500"}>
                    {orbit.icon}
                  </div>
                  {/* Progress minimal indicator inside planet */}
                  {orbit.maxCount > 1 && (
                    <span className="absolute -bottom-6 text-[11px] font-black" style={{ color: currentAmount > 0 ? orbit.color : '#64748b', textShadow: currentAmount > 0 ? `0 0 8px ${orbit.color}80` : 'none' }}>
                      {currentAmount}/{orbit.maxCount}
                    </span>
                  )}
                  {/* Name label that stays upright - advanced technique would require counter rotation, 
                      but we'll just show it on tap or keep it minimal for now since it rotates */}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

       {/* Bottom Text Area */}
       <div className="absolute bottom-12 px-6 text-center w-full max-w-sm z-20">
         <p className="text-white/50 text-sm leading-loose">
           اضغط على كل كوكب عند إتمام العبادة، ليتسارع في مداره ويُنير قلبك.
         </p>
         <AnimatePresence>
          {totalPercentage === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-400 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.2)] backdrop-blur-md">
              ما شاء الله! قلبك يشع بنور الطاعات اليوم والتفّت حولك العبادات.
            </motion.div>
          )}
         </AnimatePresence>
       </div>
    </motion.div>
  );
}

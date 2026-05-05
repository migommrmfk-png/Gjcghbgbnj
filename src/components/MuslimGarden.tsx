import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, TreePine, Flower2, Droplets, Leaf, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ShieldAlert } from 'lucide-react';

export default function MuslimGarden({ onBack }: { onBack: () => void }) {
  // Tree Level: 0 to 10
  const [treeLevel, setTreeLevel] = useState<number>(1);
  const [points, setPoints] = useState<number>(0);

  const pointsToLevelUp = 10;

  const handleGoodDeed = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setPoints(prev => {
      const next = prev + 3;
      if (next >= pointsToLevelUp && treeLevel < 10) {
        setTreeLevel(l => Math.min(l + 1, 10));
        return next - pointsToLevelUp;
      }
      return Math.min(next, pointsToLevelUp);
    });
  };

  const handleBadDeed = () => {
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    setPoints(prev => {
      const next = prev - 4;
      if (next < 0) {
        if (treeLevel > 0) {
          setTreeLevel(l => Math.max(l - 1, 0));
          return pointsToLevelUp + next; // e.g. 10 - 4 = 6
        }
        return 0;
      }
      return next;
    });
  };

  const getTreeIcon = () => {
    if (treeLevel === 0) return <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 opacity-50 flex items-center justify-center"><Leaf size={20} className="text-slate-600" /></div>;
    if (treeLevel <= 2) return <Sprout size={64} className="text-emerald-400 opacity-80 animate-pulse" />;
    if (treeLevel <= 5) return <TreePine size={100} className="text-emerald-500 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />;
    if (treeLevel <= 8) return <Flower2 size={130} className="text-pink-400 drop-shadow-[0_0_20px_rgba(244,114,182,0.5)]" />;
    return <TreePine size={180} className="text-emerald-300 drop-shadow-[0_0_30px_rgba(52,211,153,0.8)]" />;
  };

  const getTreeName = () => {
    if (treeLevel === 0) return "أرض قاحلة";
    if (treeLevel <= 2) return "بذرة طاعة";
    if (treeLevel <= 5) return "نبتة خير";
    if (treeLevel <= 8) return "زهرة الإحسان";
    return "شجرة مثمرة";
  };

  const getMessage = () => {
    if (treeLevel === 0) return "بادر بالاستغفار والطاعات لتروي أرضك.";
    if (treeLevel === 10) return "ما شاء الله! شجرتك اكتملت وثمرت بفضل الله.";
    if (points === 0) return "شجرتك تنتظر سقيا الأعمال الصالحة.";
    return "استمر، فكل طاعة تزيد من نور شجرتك.";
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05110E] text-white flex flex-col overflow-hidden" dir="rtl">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-1000" style={{ opacity: Math.max(0.2, treeLevel / 10) }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center z-20 relative bg-gradient-to-b from-[#05110E] to-transparent">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10">
            <ChevronLeft size={24} className="text-white/70" />
          </button>
          <div>
            <h1 className="text-2xl font-serif text-emerald-100 font-bold drop-shadow-md">شجرة الإيمان</h1>
            <p className="text-xs text-emerald-200/50 mt-1 uppercase tracking-widest">تنمو بالطاعات وتذبل بالمعاصي</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 -mt-10">
        
        {/* The Tree */}
        <div className="relative w-full aspect-square max-w-sm flex flex-col items-center justify-end p-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={treeLevel}
               initial={{ scale: 0.5, y: 50, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.8, y: -50, opacity: 0 }}
               transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
               className="relative z-10 flex flex-col items-center justify-end h-full"
             >
                {getTreeIcon()}
             </motion.div>
           </AnimatePresence>

           {/* Grass/Pot line */}
           <motion.div 
             className="w-3/4 h-8 bg-emerald-900/40 rounded-full blur-md absolute bottom-10 z-0"
             animate={{ width: 100 + (treeLevel * 20) }}
           />
           <div className="w-48 h-3 bg-gradient-to-r from-transparent via-emerald-800 to-transparent rounded-full absolute bottom-14 z-10"></div>
        </div>

        {/* Status */}
        <div className="text-center mt-4 bg-emerald-950/40 px-6 py-4 rounded-3xl border border-emerald-500/20 backdrop-blur-md shadow-lg">
          <h2 className="text-2xl font-serif font-bold text-white mb-2">{getTreeName()}</h2>
          <p className="text-emerald-200/80 text-sm">{getMessage()}</p>
          
          {/* Progress to next level */}
          {treeLevel < 10 && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-emerald-300 font-mono mb-1 px-1">
                <span>المستوى {treeLevel}</span>
                <span>المستوى {treeLevel + 1}</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(points / pointsToLevelUp) * 100}%` }}
                  transition={{ type: "spring", bounce: 0 }}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Buttons */}
      <div className="px-6 pb-12 pt-6 shrink-0 relative z-20 flex gap-4">
         <button 
           onClick={handleGoodDeed}
           className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 transition-all text-white rounded-3xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-400/30"
         >
           <Droplets size={28} className="drop-shadow-md" />
           <span className="font-bold text-sm tracking-wide">طاعة (+3)</span>
         </button>

         <button 
           onClick={handleBadDeed}
           className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-white/80 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 border border-slate-600/50"
         >
           <ShieldAlert size={28} className="text-rose-400 opacity-80" />
           <span className="font-bold text-sm text-slate-300 tracking-wide">ذنب (-4)</span>
         </button>
      </div>
    </div>
  );
}

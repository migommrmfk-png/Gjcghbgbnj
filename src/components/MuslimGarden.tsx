import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, TreePine, Flower2, Droplets, Sun, CalendarDays, X, ChevronLeft } from 'lucide-react';

// Generates the last 30 days
const generateLast30Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export default function MuslimGarden({ onBack }: { onBack: () => void }) {
  const [gardenData, setGardenData] = useState<Record<string, number>>({});
  const days = generateLast30Days();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Load random dummy data on mount (to make it look alive)
  useEffect(() => {
    const data: Record<string, number> = {};
    days.forEach(day => {
      // randomly assign levels 0 to 4 (0: unplanted, 1: sprout, 2: small plant, 3: flower, 4: big tree)
      data[day] = Math.floor(Math.random() * 5);
    });
    setGardenData(data);
  }, []);

  const getDayIcon = (level: number) => {
    switch (level) {
      case 0: return <div className="w-4 h-4 rounded-full bg-slate-800 border border-white/5 opacity-50" />;
      case 1: return <Sprout size={24} className="text-emerald-400 opacity-80" />;
      case 2: return <TreePine size={32} className="text-emerald-500" />;
      case 3: return <Flower2 size={32} className="text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]" />;
      case 4: return <TreePine size={40} className="text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />;
      default: return <div className="w-4 h-4 rounded-full bg-slate-800" />;
    }
  };

  const getWaterCount = () => {
    return Object.values(gardenData).reduce((sum, val) => sum + val, 0);
  };

  // Water the selected day manually for interactive feel
  const waterPlant = (day: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setGardenData(prev => {
      const newVal = (prev[day] || 0) + 1;
      return { ...prev, [day]: newVal > 4 ? 4 : newVal };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05110E] text-white flex flex-col overflow-hidden" dir="rtl">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
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
            <h1 className="text-2xl font-serif text-emerald-100 font-bold drop-shadow-md">بستان العبادات</h1>
            <p className="text-xs text-emerald-200/50 mt-1 uppercase tracking-widest">كل طاعة زرعة في بستانك</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 relative z-10">
        
        {/* Info Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-emerald-950/40 rounded-3xl p-6 border border-emerald-500/20 backdrop-blur-md shadow-2xl mb-8 flex justify-between items-center"
        >
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">النمو الإجمالي</p>
            <div className="text-4xl font-bold text-white flex items-baseline gap-2">
              {getWaterCount()} 
              <span className="text-sm font-normal text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">قطرة نور</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)] transform rotate-3">
            <Droplets size={32} className="text-white drop-shadow-lg" />
          </div>
        </motion.div>

        <h2 className="text-xl font-bold font-serif mb-6 flex items-center gap-2 text-slate-200">
          <CalendarDays size={20} className="text-emerald-500" />
          بستان الشهر الجاري
        </h2>

        {/* The Garden Grid */}
        <div className="grid grid-cols-5 gap-3 sm:gap-4 justify-items-center">
          {days.map((day, index) => {
            const level = gardenData[day] || 0;
            const isToday = index === days.length - 1;
            
            return (
              <motion.div 
                key={day}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.02, type: 'spring' }}
                onClick={() => setSelectedDay(day)}
                className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-end p-2 cursor-pointer transition-all duration-300
                  ${isToday ? 'border-2 border-emerald-500 bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border border-white/5 bg-white/5 hover:bg-white/10'}
                `}
                style={{ 
                  boxShadow: level > 2 ? `0 0 ${level * 5}px rgba(52,211,153,${level * 0.1}) inset` : 'none'
                }}
              >
                <span className="absolute top-2 right-2 text-[10px] text-white/30 font-mono font-bold">
                  {new Date(day).getDate()}
                </span>
                
                <div className="flex-1 flex items-center justify-center w-full">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={level}
                      initial={{ scale: 0.5, y: 10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="origin-bottom"
                    >
                      {getDayIcon(level)}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Ground Line */}
                <div className="h-1 w-8 rounded-full bg-emerald-900/50 mt-1"></div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Selected Day Interaction Panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-[#091e18] border-t border-emerald-500/20 rounded-t-[40px] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-30 backdrop-blur-xl"
          >
            <button onClick={() => setSelectedDay(null)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full">
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-black/40 to-emerald-900/40 border border-emerald-500/30 rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-emerald-500/10 blur-xl"></div>
                 <div className="relative z-10 transform scale-150">
                    {getDayIcon(gardenData[selectedDay] || 0)}
                 </div>
              </div>
              <div className="flex-1">
                <p className="text-emerald-400 font-bold text-sm tracking-widest">{new Intl.DateTimeFormat('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(selectedDay))}</p>
                <h3 className="text-2xl font-serif text-white mt-1 mb-3">
                  {gardenData[selectedDay] === 0 ? 'يوم خالي' :
                   gardenData[selectedDay] === 1 ? 'بذرة طاعة' :
                   gardenData[selectedDay] === 2 ? 'نبتة خير' :
                   gardenData[selectedDay] === 3 ? 'زهرة الإحسان' : 'شجرة مثمرة'}
                </h3>
                
                <button 
                  onClick={() => waterPlant(selectedDay)}
                  disabled={(gardenData[selectedDay] || 0) >= 4}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Droplets size={20} />
                  {(gardenData[selectedDay] || 0) >= 4 ? 'اكتمل النمو بفضل الله' : 'اسقِ هذا اليوم بطاعة'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

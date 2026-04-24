import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, PlayCircle, Award, Smile, Heart, Music } from 'lucide-react';

export default function KidsQuran({ onBack }: { onBack: () => void }) {
  const [activeSurah, setActiveSurah] = useState<number | null>(null);

  const kidsSurahs = [
    { id: 1, name: 'الفاتحة', ayahs: 7, color: 'bg-rose-400', stars: 3 },
    { id: 112, name: 'الإخلاص', ayahs: 4, color: 'bg-sky-400', stars: 3 },
    { id: 113, name: 'الفلق', ayahs: 5, color: 'bg-emerald-400', stars: 2 },
    { id: 114, name: 'الناس', ayahs: 6, color: 'bg-amber-400', stars: 0 },
    { id: 108, name: 'الكوثر', ayahs: 3, color: 'bg-purple-400', stars: 0 },
    { id: 110, name: 'النصر', ayahs: 3, color: 'bg-indigo-400', stars: 0 },
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <button
          onClick={onBack}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
        >
          <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-400" />
        </button>
        <h1 className="text-2xl font-bold font-serif text-emerald-400 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          <Smile size={28} className="text-emerald-500" />
          مصحف الأطفال
        </h1>
      </div>

      <div className="space-y-6 mt-4">
        {/* Welcome Banner */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-[2rem] p-6 text-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden border border-emerald-500/30"
        >
          <div className="absolute left-0 top-0 w-32 h-32 bg-emerald-500/20 rounded-full -ml-10 -mt-10 blur-3xl"></div>
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-emerald-400 drop-shadow-md">
                بطل القرآن! <Award size={24} className="text-emerald-500" />
              </h2>
              <p className="text-white/80 font-medium">لقد جمعت 8 نجوم اليوم</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center border border-emerald-400/50 shadow-[0_0_20px_rgba(212,175,55,0.5)]">
              <Star size={40} className="text-white fill-white" />
            </div>
          </div>
        </motion.div>

        {/* Surahs Grid */}
        <div className="grid grid-cols-2 gap-4">
          {kidsSurahs.map((surah, index) => (
            <motion.button
              key={surah.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveSurah(surah.id)}
              className={`card-3d bg-white dark:bg-slate-900 rounded-3xl p-4 text-slate-800 dark:text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/5 relative overflow-hidden hover:scale-105 transition-transform text-right flex flex-col hover:border-emerald-400/30 group`}
            >
              <div className={`absolute inset-0 opacity-10 ${surah.color} mix-blend-overlay`}></div>
              <div className="absolute -left-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Music size={80} className="text-emerald-500" />
              </div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10 shadow-inner">
                  {surah.ayahs} آيات
                </div>
                <PlayCircle size={28} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2 relative z-10 group-hover:text-emerald-400 transition-colors">سورة {surah.name}</h3>
              
              <div className="flex gap-1 mt-auto relative z-10 bg-black/5 dark:bg-black/20 p-2 rounded-xl border border-black/5 dark:border-white/5 w-max">
                {[1, 2, 3].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    className={star <= surah.stars ? "text-emerald-500 fill-emerald-500 drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" : "text-black/20 dark:text-white/20"} 
                  />
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Fun Fact */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card-3d bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-emerald-500/20 flex items-center gap-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shrink-0 border border-emerald-400/50 shadow-[0_0_15px_rgba(212,175,55,0.4)] relative z-10">
            <Heart size={32} className="fill-current" />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-emerald-400 mb-1 text-lg drop-shadow-sm">هل تعلم؟</h3>
            <p className="text-sm text-white/80 leading-relaxed">قراءة سورة الإخلاص 3 مرات تعادل قراءة القرآن كاملاً!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, BookOpen, Target, Calendar, CheckCircle2, Flame, Settings } from 'lucide-react';

export default function QuranPlan({ onBack }: { onBack: () => void }) {
  const [hasPlan, setHasPlan] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [pagesPerDay, setPagesPerDay] = useState(5);
  const [goal, setGoal] = useState('reading'); // reading or memorization
  
  const [plan, setPlan] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const savedPlan = localStorage.getItem('quranPlan');
    if (savedPlan) {
      const parsed = JSON.parse(savedPlan);
      setPlan(parsed.plan);
      setGoal(parsed.goal);
      setHasPlan(true);
      calculateProgress(parsed.plan);
    }
  }, []);

  const calculateProgress = (currentPlan: any[]) => {
    if (!currentPlan || currentPlan.length === 0) return;
    const completed = currentPlan.filter(p => p.status === 'completed').length;
    setProgress((completed / currentPlan.length) * 100);
  };

  const generatePlan = () => {
    const totalPages = 604;
    const days = Math.ceil(totalPages / pagesPerDay);
    const newPlan = [];
    
    for (let i = 1; i <= days; i++) {
      const startPage = (i - 1) * pagesPerDay + 1;
      const endPage = Math.min(i * pagesPerDay, totalPages);
      newPlan.push({
        day: i,
        target: goal === 'reading' ? `قراءة الصفحات ${startPage} - ${endPage}` : `حفظ الصفحات ${startPage} - ${endPage}`,
        status: i === 1 ? 'current' : 'pending'
      });
    }
    
    setPlan(newPlan);
    setHasPlan(true);
    calculateProgress(newPlan);
    localStorage.setItem('quranPlan', JSON.stringify({ plan: newPlan, goal, pagesPerDay }));
  };

  const toggleDayStatus = (dayIndex: number) => {
    const newPlan = [...plan];
    const currentStatus = newPlan[dayIndex].status;
    
    if (currentStatus === 'completed') {
      newPlan[dayIndex].status = 'current';
    } else {
      newPlan[dayIndex].status = 'completed';
      // Set next pending to current
      const nextPendingIndex = newPlan.findIndex((p, i) => i > dayIndex && p.status === 'pending');
      if (nextPendingIndex !== -1) {
        newPlan[nextPendingIndex].status = 'current';
      }
    }
    
    setPlan(newPlan);
    calculateProgress(newPlan);
    localStorage.setItem('quranPlan', JSON.stringify({ plan: newPlan, goal, pagesPerDay }));
  };

  const resetPlan = () => {
    localStorage.removeItem('quranPlan');
    setHasPlan(false);
    setSetupStep(0);
  };

  if (!hasPlan) {
    return (
      <div className="max-w-md mx-auto p-4 pb-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100" dir="rtl">
        <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
          <button onClick={onBack} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">
            <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500" />
          </button>
          <h1 className="text-2xl font-bold font-serif text-emerald-500">إعداد خطة القرآن</h1>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {setupStep === 0 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-6 shadow-inner border border-emerald-100 dark:border-emerald-500/20 transform rotate-3">
                    <BookOpen size={48} />
                  </div>
                  <h2 className="text-3xl font-bold font-serif mb-3 text-slate-800 dark:text-slate-100">ما هو هدفك؟</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">اختر هدفك لنقوم بتخصيص خطة مناسبة لك</p>
                </div>
                
                <div className="grid gap-4">
                  <button onClick={() => { setGoal('reading'); setSetupStep(1); }} className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] flex items-center gap-5 hover:border-emerald-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10  group-hover:bg-emerald-500/20 transition-colors"></div>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform relative z-10 border border-white/20">
                      <BookOpen size={28} className="drop-shadow-sm" />
                    </div>
                    <div className="text-right relative z-10">
                      <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors mb-1">ختم القرآن (تلاوة)</h3>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">قراءة القرآن الكريم كاملاً بتدبر</p>
                    </div>
                    <ArrowRight size={20} className="mr-auto text-emerald-500/0 group-hover:text-emerald-500 transform translate-x-4 group-hover:translate-x-0 transition-all relative z-10" />
                  </button>

                  <button onClick={() => { setGoal('memorization'); setSetupStep(1); }} className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] flex items-center gap-5 hover:border-teal-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-10 -mt-10  group-hover:bg-teal-500/20 transition-colors"></div>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(20,184,166,0.3)] group-hover:scale-110 transition-transform relative z-10 border border-white/20">
                      <Target size={28} className="drop-shadow-sm" />
                    </div>
                    <div className="text-right relative z-10">
                      <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 group-hover:text-teal-500 transition-colors mb-1">حفظ القرآن</h3>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">حفظ ورد يومي من الصفحات</p>
                    </div>
                    <ArrowRight size={20} className="mr-auto text-teal-500/0 group-hover:text-teal-500 transform translate-x-4 group-hover:translate-x-0 transition-all relative z-10" />
                  </button>
                </div>
              </motion.div>
            )}

            {setupStep === 1 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <Calendar size={64} className="mx-auto text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">كم صفحة يومياً؟</h2>
                  <p className="text-slate-500 dark:text-slate-400">حدد مقدار ما تستطيع إنجازه يومياً</p>
                </div>
                
                <div className="card-3d p-8 rounded-2xl text-center">
                  <div className="text-6xl font-bold text-emerald-400 mb-8">{pagesPerDay}</div>
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    value={pagesPerDay} 
                    onChange={(e) => setPagesPerDay(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-2">
                    <span>1 صفحة</span>
                    <span>40 صفحة</span>
                  </div>
                </div>

                <button onClick={generatePlan} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all">
                  إنشاء الخطة
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80 backdrop- border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-white dark:bg-slate-900 shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
            <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-400" />
          </button>
          <h1 className="text-2xl font-bold font-serif text-emerald-400 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            خطة القرآن
          </h1>
        </div>
        <button onClick={resetPlan} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-white dark:bg-slate-900">
          <Settings size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <div className="mt-4 space-y-6">
        {/* Progress Card with Image */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-white/5"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url('https://i.pinimg.com/736x/f6/3c/65/f63c65c270d7406f52285188d8b2d423.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-2xl font-bold font-serif mb-1 text-emerald-400 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                  {goal === 'reading' ? 'خطة التلاوة' : 'خطة الحفظ'}
                </h2>
                <p className="text-white/80 text-sm font-medium">معدل الإنجاز: {Math.round(progress)}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-400/50 shadow-[0_0_15px_rgba(212,175,55,0.4)] transform rotate-3">
                <Flame size={24} className="text-white" />
              </div>
            </div>
            
            <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden border border-white/10 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              />
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="card-3d bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Calendar className="text-emerald-500" />
            الجدول اليومي
          </h3>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-white/10 before:to-transparent">
            {plan.map((day, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 ${
                  day.status === 'completed' ? 'bg-emerald-500 text-white' : 
                  day.status === 'current' ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500' : 
                  'bg-white dark:bg-slate-900 border-white/10 text-slate-500 dark:text-slate-400'
                }`}>
                  {day.status === 'completed' ? <CheckCircle2 size={20} /> : <span className="text-sm font-bold">{day.day}</span>}
                </div>
                
                <div 
                  onClick={() => toggleTaskStatus(index)}
                  className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-lg cursor-pointer transition-all ${
                  day.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30' : 
                  day.status === 'current' ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 
                  'bg-white dark:bg-slate-900 border-white/5 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${day.status === 'completed' ? 'text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>اليوم {day.day}</span>
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      day.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 
                      day.status === 'current' ? 'bg-emerald-500 text-white font-bold' : 
                      'bg-white/5 text-slate-500 dark:text-slate-400'
                    }`}>
                      {day.status === 'completed' ? 'مكتمل' : day.status === 'current' ? 'اليوم' : 'قادم'}
                    </span>
                  </div>
                  <p className={`text-sm ${day.status === 'completed' ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-500 dark:text-slate-400'}`}>
                    {day.target}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function toggleTaskStatus(index: number) {
    toggleDayStatus(index);
  }
}

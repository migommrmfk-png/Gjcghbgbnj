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
      <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)] text-white" dir="rtl">
        <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-white/5">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)]">
            <ArrowRight size={24} className="text-[var(--color-text-muted)]" />
          </button>
          <h1 className="text-2xl font-bold font-serif text-[var(--color-primary-light)]">إعداد خطة القرآن</h1>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {setupStep === 0 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <BookOpen size={64} className="mx-auto text-[var(--color-primary)] mb-4" />
                  <h2 className="text-2xl font-bold mb-2">ما هو هدفك؟</h2>
                  <p className="text-[var(--color-text-muted)]">اختر هدفك لنقوم بتخصيص الخطة لك</p>
                </div>
                
                <div className="grid gap-4">
                  <button onClick={() => { setGoal('reading'); setSetupStep(1); }} className="card-3d p-6 rounded-2xl flex items-center gap-4 hover:border-[var(--color-primary)]/50 transition-all">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                      <BookOpen size={24} />
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg">ختم القرآن (تلاوة)</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">قراءة القرآن الكريم كاملاً</p>
                    </div>
                  </button>
                  <button onClick={() => { setGoal('memorization'); setSetupStep(1); }} className="card-3d p-6 rounded-2xl flex items-center gap-4 hover:border-[var(--color-primary)]/50 transition-all">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                      <Target size={24} />
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg">حفظ القرآن</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">حفظ صفحات محددة يومياً</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {setupStep === 1 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <Calendar size={64} className="mx-auto text-[var(--color-primary)] mb-4" />
                  <h2 className="text-2xl font-bold mb-2">كم صفحة يومياً؟</h2>
                  <p className="text-[var(--color-text-muted)]">حدد مقدار ما تستطيع إنجازه يومياً</p>
                </div>
                
                <div className="card-3d p-8 rounded-2xl text-center">
                  <div className="text-6xl font-bold text-[var(--color-primary-light)] mb-8">{pagesPerDay}</div>
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    value={pagesPerDay} 
                    onChange={(e) => setPagesPerDay(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                  />
                  <div className="flex justify-between text-sm text-[var(--color-text-muted)] mt-2">
                    <span>1 صفحة</span>
                    <span>40 صفحة</span>
                  </div>
                </div>

                <button onClick={generatePlan} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all">
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
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center justify-between bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
            <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" />
          </button>
          <h1 className="text-2xl font-bold font-serif text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            خطة القرآن
          </h1>
        </div>
        <button onClick={resetPlan} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)]">
          <Settings size={20} className="text-[var(--color-text-muted)]" />
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
                <h2 className="text-2xl font-bold font-serif mb-1 text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                  {goal === 'reading' ? 'خطة التلاوة' : 'خطة الحفظ'}
                </h2>
                <p className="text-white/80 text-sm font-medium">معدل الإنجاز: {Math.round(progress)}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl flex items-center justify-center border border-[var(--color-primary-light)]/50 shadow-[0_0_15px_rgba(212,175,55,0.4)] transform rotate-3">
                <Flame size={24} className="text-white" />
              </div>
            </div>
            
            <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden border border-white/10 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] h-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              />
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="card-3d bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="text-[var(--color-primary)]" />
            الجدول اليومي
          </h3>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--color-primary)] before:via-white/10 before:to-transparent">
            {plan.map((day, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--color-surface)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 ${
                  day.status === 'completed' ? 'bg-[var(--color-primary)] text-white' : 
                  day.status === 'current' ? 'bg-[var(--color-surface)] border-[var(--color-primary)] text-[var(--color-primary)]' : 
                  'bg-[var(--color-surface)] border-white/10 text-[var(--color-text-muted)]'
                }`}>
                  {day.status === 'completed' ? <CheckCircle2 size={20} /> : <span className="text-sm font-bold">{day.day}</span>}
                </div>
                
                <div 
                  onClick={() => toggleTaskStatus(index)}
                  className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-lg cursor-pointer transition-all ${
                  day.status === 'completed' ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30' : 
                  day.status === 'current' ? 'bg-[var(--color-surface)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 
                  'bg-[var(--color-surface)] border-white/5 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${day.status === 'completed' ? 'text-[var(--color-primary-light)]' : 'text-white'}`}>اليوم {day.day}</span>
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      day.status === 'completed' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]' : 
                      day.status === 'current' ? 'bg-[var(--color-primary)] text-white font-bold' : 
                      'bg-white/5 text-[var(--color-text-muted)]'
                    }`}>
                      {day.status === 'completed' ? 'مكتمل' : day.status === 'current' ? 'اليوم' : 'قادم'}
                    </span>
                  </div>
                  <p className={`text-sm ${day.status === 'completed' ? 'text-white/70 line-through' : 'text-[var(--color-text-muted)]'}`}>
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

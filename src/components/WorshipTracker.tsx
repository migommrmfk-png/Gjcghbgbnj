import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, Star, Target, CheckCircle2, Flame, ChevronDown, ChevronUp } from 'lucide-react';

const ALL_TASKS = [
  // المستوى الأول: الأساسيات (مبتدئ)
  { id: 1, title: 'صلاة الفجر في وقتها', points: 50, level: 1, category: 'الصلاة' },
  { id: 2, title: 'صلاة الظهر في وقتها', points: 30, level: 1, category: 'الصلاة' },
  { id: 3, title: 'صلاة العصر في وقتها', points: 30, level: 1, category: 'الصلاة' },
  { id: 4, title: 'صلاة المغرب في وقتها', points: 30, level: 1, category: 'الصلاة' },
  { id: 5, title: 'صلاة العشاء في وقتها', points: 30, level: 1, category: 'الصلاة' },
  { id: 6, title: 'أذكار الصباح', points: 20, level: 1, category: 'الأذكار' },
  { id: 7, title: 'أذكار المساء', points: 20, level: 1, category: 'الأذكار' },
  { id: 8, title: 'قراءة صفحة من القرآن', points: 20, level: 1, category: 'القرآن' },
  { id: 25, title: 'بر الوالدين (اتصال أو زيارة)', points: 40, level: 1, category: 'أعمال صالحة' },
  { id: 26, title: 'الوضوء قبل النوم', points: 20, level: 1, category: 'الطهارة' },
  { id: 27, title: 'قول بسم الله قبل الأكل', points: 10, level: 1, category: 'سنن' },
  { id: 28, title: 'قول الحمد لله بعد الأكل', points: 10, level: 1, category: 'سنن' },
  { id: 43, title: 'السواك عند الوضوء', points: 15, level: 1, category: 'سنن' },
  { id: 44, title: 'الدعاء بعد الأذان', points: 20, level: 1, category: 'الأذكار' },
  { id: 45, title: 'صلاة ركعتين بعد الوضوء', points: 30, level: 1, category: 'الصلاة' },
  
  // المستوى الثاني: النوافل (متوسط)
  { id: 9, title: 'السنن الرواتب (12 ركعة)', points: 60, level: 2, category: 'الصلاة' },
  { id: 10, title: 'صلاة الضحى', points: 40, level: 2, category: 'الصلاة' },
  { id: 11, title: 'قراءة جزء من القرآن', points: 50, level: 2, category: 'القرآن' },
  { id: 12, title: 'ورد الاستغفار (100 مرة)', points: 30, level: 2, category: 'الأذكار' },
  { id: 13, title: 'الصلاة على النبي (100 مرة)', points: 30, level: 2, category: 'الأذكار' },
  { id: 14, title: 'الصدقة اليومية', points: 50, level: 2, category: 'أعمال صالحة' },
  { id: 29, title: 'صيام الإثنين أو الخميس', points: 80, level: 2, category: 'الصيام' },
  { id: 30, title: 'حفظ حديث نبوي', points: 40, level: 2, category: 'العلم' },
  { id: 31, title: 'إماطة الأذى عن الطريق', points: 30, level: 2, category: 'أعمال صالحة' },
  { id: 32, title: 'التبسم في وجه أخيك', points: 20, level: 2, category: 'أعمال صالحة' },
  { id: 46, title: 'قراءة سورة يس', points: 40, level: 2, category: 'القرآن' },
  { id: 47, title: 'صلاة تحية المسجد', points: 30, level: 2, category: 'الصلاة' },
  { id: 48, title: 'الدعاء بين الأذان والإقامة', points: 30, level: 2, category: 'أعمال صالحة' },
  
  // المستوى الثالث: الاجتهاد (متقدم)
  { id: 15, title: 'قيام الليل', points: 80, level: 3, category: 'الصلاة' },
  { id: 16, title: 'قراءة سورة الملك قبل النوم', points: 40, level: 3, category: 'القرآن' },
  { id: 17, title: 'حفظ آية جديدة', points: 50, level: 3, category: 'القرآن' },
  { id: 18, title: 'التكبير المطلق (للعيد)', points: 40, level: 3, category: 'الأذكار' },
  { id: 19, title: 'الدعاء للوالدين', points: 30, level: 3, category: 'أعمال صالحة' },
  { id: 33, title: 'صلاة الوتر', points: 50, level: 3, category: 'الصلاة' },
  { id: 34, title: 'قراءة سورة الكهف (يوم الجمعة)', points: 60, level: 3, category: 'القرآن' },
  { id: 35, title: 'الدعاء للمسلمين بظهر الغيب', points: 40, level: 3, category: 'أعمال صالحة' },
  { id: 36, title: 'حضور مجلس علم', points: 70, level: 3, category: 'العلم' },
  { id: 37, title: 'التسبيح (100 مرة)', points: 30, level: 3, category: 'الأذكار' },
  { id: 49, title: 'قراءة سورة البقرة', points: 100, level: 3, category: 'القرآن' },
  { id: 50, title: 'صيام 3 أيام من كل شهر', points: 90, level: 3, category: 'الصيام' },
  { id: 51, title: 'الاعتكاف في المسجد (ساعة)', points: 60, level: 3, category: 'أعمال صالحة' },
  
  // المستوى الرابع: الإحسان (خبير)
  { id: 20, title: 'صلاة الإشراق', points: 60, level: 4, category: 'الصلاة' },
  { id: 21, title: 'الدعاء في ثلث الليل الأخير', points: 70, level: 4, category: 'أعمال صالحة' },
  { id: 22, title: 'صلة الرحم', points: 80, level: 4, category: 'أعمال صالحة' },
  { id: 23, title: 'إطعام مسكين أو مساعدة محتاج', points: 100, level: 4, category: 'أعمال صالحة' },
  { id: 24, title: 'التفكر في خلق الله (10 دقائق)', points: 50, level: 4, category: 'أعمال صالحة' },
  { id: 38, title: 'صيام الأيام البيض', points: 100, level: 4, category: 'الصيام' },
  { id: 39, title: 'حفظ وجه من القرآن', points: 100, level: 4, category: 'القرآن' },
  { id: 40, title: 'كفالة يتيم (مساهمة)', points: 150, level: 4, category: 'أعمال صالحة' },
  { id: 41, title: 'إصلاح ذات البين', points: 120, level: 4, category: 'أعمال صالحة' },
  { id: 42, title: 'الدعوة إلى الله بالحكمة', points: 90, level: 4, category: 'أعمال صالحة' },
  { id: 52, title: 'ختم القرآن في شهر', points: 200, level: 4, category: 'القرآن' },
  { id: 53, title: 'حفظ جزء كامل من القرآن', points: 300, level: 4, category: 'القرآن' },
  { id: 54, title: 'الصدقة الجارية (مساهمة)', points: 200, level: 4, category: 'أعمال صالحة' },
];

const LEVEL_NAMES = {
  1: 'مبتدئ (الأساسيات)',
  2: 'متوسط (النوافل)',
  3: 'متقدم (الاجتهاد)',
  4: 'خبير (الإحسان)'
};

export default function WorshipTracker({ onBack }: { onBack: () => void }) {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
  const [expandedLevels, setExpandedLevels] = useState<number[]>([1]);
  
  useEffect(() => {
    const savedData = localStorage.getItem('worshipTrackerV2');
    const lastDate = localStorage.getItem('worshipTrackerDateV2');
    const today = new Date().toDateString();

    if (savedData) {
      const parsed = JSON.parse(savedData);
      setPoints(parsed.points || 0);
      setLevel(parsed.level || 1);
      setStreak(parsed.streak || 0);
      
      if (lastDate === today) {
        setCompletedTaskIds(parsed.completedTaskIds || []);
      } else {
        // New day, reset tasks but keep points/level
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate !== yesterday.toDateString()) {
          setStreak(0);
        }
        setCompletedTaskIds([]);
      }
    }
    localStorage.setItem('worshipTrackerDateV2', today);
  }, []);

  const saveProgress = (newCompletedIds: number[], newPoints: number, newLevel: number, newStreak: number) => {
    localStorage.setItem('worshipTrackerV2', JSON.stringify({
      points: newPoints,
      level: newLevel,
      streak: newStreak,
      completedTaskIds: newCompletedIds
    }));
  };

  const toggleTask = (task: typeof ALL_TASKS[0]) => {
    const isCompleting = !completedTaskIds.includes(task.id);
    const newCompletedIds = isCompleting 
      ? [...completedTaskIds, task.id] 
      : completedTaskIds.filter(id => id !== task.id);
      
    const pointDiff = isCompleting ? task.points : -task.points;
    let newPoints = points + pointDiff;
    if (newPoints < 0) newPoints = 0;
    
    let newLevel = Math.floor(newPoints / 1000) + 1;
    if (newLevel > 4) newLevel = 4; // Max level 4 for now
    
    // Check if all level 1 tasks completed for streak
    const level1Tasks = ALL_TASKS.filter(t => t.level === 1);
    const allL1CompletedNow = level1Tasks.every(t => newCompletedIds.includes(t.id));
    const allL1CompletedBefore = level1Tasks.every(t => completedTaskIds.includes(t.id));
    
    let newStreak = streak;
    if (allL1CompletedNow && !allL1CompletedBefore) {
      newStreak += 1;
    } else if (!allL1CompletedNow && allL1CompletedBefore) {
      newStreak = Math.max(0, newStreak - 1);
    }

    setPoints(newPoints);
    setLevel(newLevel);
    setStreak(newStreak);
    setCompletedTaskIds(newCompletedIds);
    
    saveProgress(newCompletedIds, newPoints, newLevel, newStreak);
  };

  const calculateProgress = () => {
    if (level >= 4) return 100;
    const nextLevelPoints = level * 1000;
    const currentLevelPoints = (level - 1) * 1000;
    const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const toggleLevelExpand = (lvl: number) => {
    setExpandedLevels(prev => 
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <button
          onClick={onBack}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
        >
          <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-400" />
        </button>
        <h1 className="text-2xl font-bold font-serif text-emerald-400 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          متابعة العبادات
        </h1>
      </div>

      <div className="space-y-6 mt-4">
        {/* User Level Card with Image Background */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-[2rem] p-8 text-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden border border-black/5 dark:border-white/5"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url('https://i.pinimg.com/736x/3f/8b/77/3f8b77626915152a54b38d7c49b6b801.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <p className="text-white/80 text-sm font-bold mb-1">المستوى الحالي</p>
              <h2 className="text-3xl font-bold font-serif text-emerald-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                {LEVEL_NAMES[level as keyof typeof LEVEL_NAMES] || `مستوى ${level}`}
              </h2>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white border border-emerald-400/50 shadow-[0_0_20px_rgba(212,175,55,0.5)] transform rotate-3">
              <Trophy size={40} />
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-white">{points} نقطة</span>
              <span className="text-white/80">{level >= 4 ? 'الحد الأقصى' : `${level * 1000} نقطة للمستوى التالي`}</span>
            </div>
            <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden border border-white/10 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20 relative z-10">
            <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30 shadow-inner">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-xs text-white/70">سلسلة الأيام</p>
                <p className="font-bold text-white">{streak} يوم متتالي</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shadow-inner">
                <Target size={20} />
              </div>
              <div>
                <p className="text-xs text-white/70">المهام المنجزة</p>
                <p className="font-bold text-white">{completedTaskIds.length} مهمة اليوم</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Tasks by Level */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((lvl) => {
            const levelTasks = ALL_TASKS.filter(t => t.level === lvl);
            const isExpanded = expandedLevels.includes(lvl);
            const completedInLevel = levelTasks.filter(t => completedTaskIds.includes(t.id)).length;
            const isLocked = level < lvl && lvl > 1; // Level 1 is always unlocked

            return (
              <div key={lvl} className={`card-3d bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-60' : 'hover:border-emerald-500/30'}`}>
                <button 
                  onClick={() => !isLocked && toggleLevelExpand(lvl)}
                  className={`w-full p-5 flex items-center justify-between ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                      isLocked ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400' :
                      lvl === 1 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                      lvl === 2 ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
                      lvl === 3 ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' :
                      'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    }`}>
                      <Star size={24} />
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">المستوى {lvl}: <span className="font-serif">{LEVEL_NAMES[lvl as keyof typeof LEVEL_NAMES].split(' ')[0]}</span></h3>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                        {isLocked ? `يفتح عند الوصول للمستوى ${lvl}` : `${completedInLevel} من ${levelTasks.length} مهام منجزة`}
                      </p>
                    </div>
                  </div>
                  {!isLocked && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-transform">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && !isLocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                        {levelTasks.map((task, index) => {
                          const isCompleted = completedTaskIds.includes(task.id);
                          return (
                            <motion.div
                              key={task.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleTask(task)}
                              className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                                isCompleted 
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 shadow-sm' 
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-inner ${
                                  isCompleted 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                    : 'border-slate-300 dark:border-slate-600 text-transparent'
                                }`}>
                                  <CheckCircle2 size={14} />
                                </div>
                                <div>
                                  <span className={`font-bold text-sm block transition-colors ${isCompleted ? 'text-emerald-600 dark:text-emerald-400 line-through opacity-80' : 'text-slate-800 dark:text-slate-100'}`}>
                                    {task.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{task.category}</span>
                                </div>
                              </div>
                              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors ${
                                isCompleted 
                                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30'
                                  : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm'
                              }`}>
                                +{task.points} نقطة
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

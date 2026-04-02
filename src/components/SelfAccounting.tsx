import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowRight, TrendingUp, Calendar as CalendarIcon, Award, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DailyTask {
  id: string;
  title: string;
  category: 'prayer' | 'quran' | 'dhikr' | 'behavior';
  points: number;
}

const TASKS: DailyTask[] = [
  { id: 'fajr', title: 'صلاة الفجر في وقتها', category: 'prayer', points: 10 },
  { id: 'dhuhr', title: 'صلاة الظهر في وقتها', category: 'prayer', points: 10 },
  { id: 'asr', title: 'صلاة العصر في وقتها', category: 'prayer', points: 10 },
  { id: 'maghrib', title: 'صلاة المغرب في وقتها', category: 'prayer', points: 10 },
  { id: 'isha', title: 'صلاة العشاء في وقتها', category: 'prayer', points: 10 },
  { id: 'sunnah', title: 'السنن الرواتب (12 ركعة)', category: 'prayer', points: 15 },
  { id: 'witr', title: 'صلاة الوتر', category: 'prayer', points: 10 },
  { id: 'quran', title: 'قراءة ورد القرآن', category: 'quran', points: 20 },
  { id: 'morning_dhikr', title: 'أذكار الصباح', category: 'dhikr', points: 10 },
  { id: 'evening_dhikr', title: 'أذكار المساء', category: 'dhikr', points: 10 },
  { id: 'istighfar', title: 'الاستغفار 100 مرة', category: 'dhikr', points: 5 },
  { id: 'no_gossip', title: 'تجنب الغيبة والنميمة', category: 'behavior', points: 15 },
  { id: 'charity', title: 'صدقة (ولو بابتسامة)', category: 'behavior', points: 10 },
  { id: 'parents', title: 'بر الوالدين / الدعاء لهما', category: 'behavior', points: 15 },
];

export default function SelfAccounting({ onBack }: { onBack?: () => void }) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [history, setHistory] = useState<Record<string, number>>({});
  const [todayScore, setTodayScore] = useState(0);
  
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedCompleted = localStorage.getItem(`accounting_${todayStr}`);
    if (savedCompleted) {
      setCompletedTasks(JSON.parse(savedCompleted));
    }
    
    const savedHistory = localStorage.getItem('accounting_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [todayStr]);

  useEffect(() => {
    const score = completedTasks.reduce((total, taskId) => {
      const task = TASKS.find(t => t.id === taskId);
      return total + (task ? task.points : 0);
    }, 0);
    setTodayScore(score);
    
    localStorage.setItem(`accounting_${todayStr}`, JSON.stringify(completedTasks));
    
    const newHistory = { ...history, [todayStr]: score };
    setHistory(newHistory);
    localStorage.setItem('accounting_history', JSON.stringify(newHistory));
  }, [completedTasks, todayStr]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const totalPossibleScore = TASKS.reduce((acc, task) => acc + task.points, 0);
  const percentage = Math.round((todayScore / totalPossibleScore) * 100) || 0;

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-500';
    if (pct >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreMessage = (pct: number) => {
    if (pct >= 80) return 'ممتاز! يوم حافل بالطاعات، استمر.';
    if (pct >= 50) return 'جيد، لكن يمكنك تقديم المزيد غداً إن شاء الله.';
    return 'يوم يحتاج إلى مراجعة، جدد نيتك واستعن بالله.';
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden" dir="rtl">
      <div className="pt-12 pb-6 px-6 bg-gradient-to-b from-teal-700 to-teal-900 text-white rounded-b-[2.5rem] shadow-lg shrink-0 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="relative z-10 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all">
              <ArrowRight size={24} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold font-serif flex items-center gap-2"><TrendingUp size={24}/> ورد المحاسبة</h1>
            <p className="text-white/80 text-sm">حاسبوا أنفسكم قبل أن تحاسبوا</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        
        {/* Score Card */}
        <div className="bg-[var(--color-surface)] p-6 rounded-3xl shadow-sm border border-[var(--color-border)] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <h2 className="text-lg font-bold mb-4 opacity-80">نتيجة اليوم</h2>
          
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[var(--color-border)]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <motion.path
                className={getScoreColor(percentage)}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${percentage}, 100`}
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${percentage}, 100` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</span>
            </div>
          </div>
          
          <p className="text-center font-medium opacity-90">{getScoreMessage(percentage)}</p>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-2">أعمال اليوم</h3>
          
          {['prayer', 'quran', 'dhikr', 'behavior'].map(category => {
            const categoryTasks = TASKS.filter(t => t.category === category);
            const categoryTitles = {
              prayer: 'الصلاة',
              quran: 'القرآن',
              dhikr: 'الذكر',
              behavior: 'السلوك والمعاملات'
            };
            
            return (
              <div key={category} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
                <div className="bg-[var(--color-bg)] px-4 py-2 font-bold text-sm opacity-70 border-b border-[var(--color-border)]">
                  {categoryTitles[category as keyof typeof categoryTitles]}
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {categoryTasks.map(task => {
                    const isCompleted = completedTasks.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-bg)] transition-colors text-right"
                      >
                        <span className={`font-medium ${isCompleted ? 'opacity-50 line-through' : ''}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded-lg">
                            +{task.points}
                          </span>
                          {isCompleted ? (
                            <CheckCircle2 className="text-emerald-500" size={24} />
                          ) : (
                            <Circle className="text-[var(--color-border)]" size={24} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

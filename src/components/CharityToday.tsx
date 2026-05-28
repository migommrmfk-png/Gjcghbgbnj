import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, CheckCircle2, RefreshCw, Sparkles, Share2, Award, Calendar } from 'lucide-react';

interface GoodDeed {
  id: number;
  text: string;
  category: string;
  hadithRef?: string;
  rewardValue: number; // spiritual points
}

const DAILY_DEEDS: GoodDeed[] = [
  { id: 1, text: "التبسم في وجه أخيك المسلم (جرّبها مع أول شخص تقابله اليوم!).", category: "معاملات", hadithRef: "تبسمك في وجه أخيك لك صدقة - رواه الترمذي", rewardValue: 30 },
  { id: 2, text: "سقاية الطيور أو الحيوانات بنثر بعض الماء أو الأرز المطل على شرفتك.", category: "إحسان", rewardValue: 50 },
  { id: 3, text: "إرسال رسالة شكر ودعاء صادقة لوالديك أو لشخص له فضل عليك.", category: "بر وصلة", rewardValue: 40 },
  { id: 4, text: "الاستغفار لنفسك وللمؤمنين والمؤمنات ٢٧ مرة لتنال أجرهم.", category: "ذكر ودعاء", hadithRef: "من استغفر للمؤمنين والمؤمنات كتب الله له بكل مؤمن ومؤمنة حسنة", rewardValue: 30 },
  { id: 5, text: "إماطة الأذى عن الطريق (غصن شوك، زجاج مكسور، أو قاذورات قد تضر غيرك).", category: "إحسان", hadithRef: "ويميط الأذى عن الطريق صدقة - رواه البخاري", rewardValue: 50 },
  { id: 6, text: "التصدق بملابس أو كتب فائضة عن حاجتك وتجهيزها لتسليمها لجمعية خيرية.", category: "مالي", rewardValue: 100 },
  { id: 7, text: "قول كلمة طيبة ترفع همة أخيك المسلم أو تجبر بها خاطره المتعب.", category: "معاملات", hadithRef: "والكلمة الطيبة صدقة - رواه البخاري", rewardValue: 30 },
  { id: 8, text: "مساعدة محتاج يحمل متاعاً ثقيلاً، أو إرشاد تائه في الطريق اليوم.", category: "إحسان", hadithRef: "وتعين الرجل في دابته فتحمله عليها... صدقة", rewardValue: 50 },
  { id: 9, text: "مشاركة كائن حي آخر طعامك اليوم (لقيمات صغيرة لقطة جائعة، أو نمل).", category: "إحسان", hadithRef: "في كل ذات كبد رطبة أجر - رواه البخاري", rewardValue: 40 },
  { id: 10, text: "إفشاء السلام على من عرفت ومن لم تعرف اليوم بابتسامة دافئة.", category: "معاملات", rewardValue: 30 }
];

export default function CharityToday() {
  const [currentDeed, setCurrentDeed] = useState<GoodDeed>(DAILY_DEEDS[0]);
  const [isDone, setIsDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Load persisted state
    const savedDeedId = localStorage.getItem('charity_today_id');
    const savedDate = localStorage.getItem('charity_today_date');
    const todayStr = new Date().toDateString();

    const savedStreak = parseInt(localStorage.getItem('charity_streak') || '0');
    const savedTotal = parseInt(localStorage.getItem('charity_total_completed') || '0');
    const savedPoints = parseInt(localStorage.getItem('charity_points') || '0');

    setStreak(savedStreak);
    setTotalCompleted(savedTotal);
    setPoints(savedPoints);

    if (savedDate === todayStr) {
      setIsDone(localStorage.getItem('charity_today_done') === 'true');
      if (savedDeedId) {
        const found = DAILY_DEEDS.find(d => d.id === parseInt(savedDeedId));
        if (found) setCurrentDeed(found);
      }
    } else {
      // It's a new day! Handle streak safety
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (savedDate !== yesterday.toDateString() && savedDate !== todayStr) {
        // Streak broken
        setStreak(0);
        localStorage.setItem('charity_streak', '0');
      }

      // Pick a random deed for the new day
      const randomIndex = Math.floor(Math.random() * DAILY_DEEDS.length);
      const chosen = DAILY_DEEDS[randomIndex];
      setCurrentDeed(chosen);
      setIsDone(false);

      localStorage.setItem('charity_today_id', chosen.id.toString());
      localStorage.setItem('charity_today_date', todayStr);
      localStorage.setItem('charity_today_done', 'false');
    }
  }, []);

  const handleComplete = () => {
    if (isDone) return;
    
    const todayStr = new Date().toDateString();
    const newStreak = streak + 1;
    const newTotal = totalCompleted + 1;
    const newPoints = points + currentDeed.rewardValue;

    setStreak(newStreak);
    setTotalCompleted(newTotal);
    setPoints(newPoints);
    setIsDone(true);
    setShowConfetti(true);

    localStorage.setItem('charity_today_done', 'true');
    localStorage.setItem('charity_streak', newStreak.toString());
    localStorage.setItem('charity_total_completed', newTotal.toString());
    localStorage.setItem('charity_points', newPoints.toString());

    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  const handleShuffle = () => {
    // Let user change their daily good deed check only if not completed yet
    if (isDone) return;
    let nextDeed;
    do {
      nextDeed = DAILY_DEEDS[Math.floor(Math.random() * DAILY_DEEDS.length)];
    } while (nextDeed.id === currentDeed.id);

    setCurrentDeed(nextDeed);
    localStorage.setItem('charity_today_id', nextDeed.id.toString());
  };

  const shareDeed = () => {
    const text = `🌸 صدقة اليوم وفعل الخير: "${currentDeed.text}"\n✨ شاركني الطاعات وحمّل تطبيق الحق الإيماني المبارك!`;
    if (navigator.share) {
      navigator.share({ title: 'صدقة اليوم', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ صدقة اليوم لقلوبكم العامرة! شاركها مع أحبابك.');
    }
  };

  return (
    <div className="card-3d bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group">
      {/* Background Islamic Pattern Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-xl pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>

      <div className="relative z-10 space-y-4">
        {/* Header Title Grid */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Heart size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm font-serif">صدقة اليوم وفعل الخير</h3>
              <p className="text-[10px] text-slate-400 font-medium">كل معروف صدقة • بادر قبل الغروب</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Award size={14} />
            <span>{points} نقطة</span>
          </div>
        </div>

        {/* The Action Card Content */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[22px] border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
          <span className="absolute top-3 right-4 text-[9px] px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full font-black">
            {currentDeed.category}
          </span>
          
          <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-200 font-bold font-serif px-2 py-4">
            {currentDeed.text}
          </p>

          {currentDeed.hadithRef && (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-center gap-1.5 px-4 mb-1">
              <Sparkles size={12} />
              <span>{currentDeed.hadithRef}</span>
            </div>
          )}
        </div>

        {/* Actions Button Row */}
        <div className="flex items-center gap-2.5">
          {isDone ? (
            <div className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 relative overflow-hidden">
              <CheckCircle2 size={16} />
              <span>جزاك الله خيراً! فعلت الخير اليوم 🎉</span>
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 -skew-x-12 translate-x-full animate-shimmer"></div>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>قمت بهذا العمل المبارك! ✔️</span>
            </button>
          )}

          {!isDone && (
            <button
              onClick={handleShuffle}
              className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 hover:text-emerald-500 transition-colors"
              title="تغيير العمل"
            >
              <RefreshCw size={17} />
            </button>
          )}

          <button
            onClick={shareDeed}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-705 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 hover:text-emerald-500 transition-colors"
            title="مشاركة الصدقة"
          >
            <Share2 size={17} />
          </button>
        </div>

        {/* Motivational Streak Banner */}
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium px-1">
          <div className="flex items-center gap-1">
            <Calendar size={13} className="text-amber-500" />
            <span>سلسلة الخير المتصلة: <strong className="text-amber-500">{streak} أيام</strong></span>
          </div>
          <div>
            <span>إجمالي الأعمال: <strong className="text-emerald-500">{totalCompleted}</strong></span>
          </div>
        </div>
      </div>

      {/* Visual reward animation overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-950/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-4 text-white"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="space-y-3"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                ✨
              </div>
              <h4 className="font-extrabold text-lg text-emerald-400 font-serif">تقبل الله طاعتك!</h4>
              <p className="text-xs text-emerald-100 max-w-[240px] mx-auto leading-relaxed">
                "إنّ الدالَ على الخيرِ كفاعِلِه".. كسبت <span className="font-black text-amber-300">+{currentDeed.rewardValue}</span> نقطة فداءً لليوم!
              </p>
              <button
                onClick={() => setShowConfetti(false)}
                className="mt-2 bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-xl text-xs font-black text-white"
              >
                الحمد لله 🧡
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

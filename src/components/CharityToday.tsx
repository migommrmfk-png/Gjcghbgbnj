import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getGeminiClient } from '../lib/gemini';
import { 
  Heart, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Share2, 
  Award, 
  Calendar, 
  Coins, 
  Lock, 
  Plus, 
  Trash2, 
  Smile, 
  Activity, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

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
  { id: 4, text: "الاستغفار لنفسك وللمؤمنين والمؤمنات ٢٧ مرة لتنال أجرهم الفضيل.", category: "ذكر ودعاء", hadithRef: "من استغفر للمؤمنين والمؤمنات كتب الله له بكل مؤمن ومؤمنة حسنة", rewardValue: 30 },
  { id: 5, text: "إماطة الأذى عن الطريق (غصن شوك، زجاج مكسور، أو قاذورات قد تضر غيرك).", category: "إحسان", hadithRef: "ويميط الأذى عن الطريق صدقة - رواه البخاري", rewardValue: 50 },
  { id: 6, text: "التصدق بملابس أو كتب فائضة عن حاجتك وتجهيزها لتسليمها لجمعية خيرية.", category: "مالي", rewardValue: 100 },
  { id: 7, text: "قول كلمة طيبة ترفع همة أخيك المسلم أو تجبر بها خاطره المتعب.", category: "معاملات", hadithRef: "والكلمة الطيبة صدقة - رواه البخاري", rewardValue: 30 },
  { id: 8, text: "مساعدة محتاج يحمل متاعاً ثقيلاً، أو إرشاد تائه في الطريق اليوم.", category: "إحسان", hadithRef: "وتعين الرجل في دابته فتحمله عليها... صدقة", rewardValue: 50 },
  { id: 9, text: "مشاركة كائن حي آخر طعامك اليوم (لقيمات صغيرة لقطة جائعة، أو نمل).", category: "إحسان", hadithRef: "في كل ذات كبد رطبة أجر - رواه البخاري", rewardValue: 40 },
  { id: 10, text: "إفشاء السلام على من عرفت ومن لم تعرف اليوم بابتسامة دافئة.", category: "معاملات", rewardValue: 30 }
];

interface SavingsLog {
  id: number;
  date: string;
  amount: number;
  note: string;
}

interface SecretDeedLog {
  id: number;
  date: string;
  deed: string;
}

export default function CharityToday() {
  const [activeSection, setActiveSection] = useState<'deed' | 'ai-deed' | 'charity-box' | 'secret-log'>('deed');
  
  // Standard Good Deed States
  const [currentDeed, setCurrentDeed] = useState<GoodDeed>(DAILY_DEEDS[0]);
  const [isDone, setIsDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [points, setPoints] = useState(0);

  // Custom AI Good Deed States
  const [selectedContext, setSelectedContext] = useState<'home' | 'work' | 'street' | 'family' | 'mosque'>('family');
  const [aiDeedText, setAiDeedText] = useState<string>("");
  const [aiDeedHadith, setAiDeedHadith] = useState<string>("");
  const [aiDeedLoading, setAiDeedLoading] = useState<boolean>(false);
  const [aiDeedPoints, setAiDeedPoints] = useState<number>(50);
  const [aiDeedIsDone, setAiDeedIsDone] = useState<boolean>(false);

  // Charity Box / Savings Piggybank states
  const [savingsHistory, setSavingsHistory] = useState<SavingsLog[]>([]);
  const [newSavingsAmount, setNewSavingsAmount] = useState<string>("");
  const [newSavingsNote, setNewSavingsNote] = useState<string>("");

  // Private Secret Good Deed logs
  const [secretLogs, setSecretLogs] = useState<SecretDeedLog[]>([]);
  const [newSecretDeed, setNewSecretDeed] = useState<string>("");

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

    // Load savings history from localstorage
    try {
      const savedSavings = localStorage.getItem('charity_savings_history');
      if (savedSavings) {
        setSavingsHistory(JSON.parse(savedSavings));
      }
    } catch (e) { console.error(e); }

    // Load secret good deeds logs from localstorage
    try {
      const savedSecrets = localStorage.getItem('charity_secret_logs');
      if (savedSecrets) {
        setSecretLogs(JSON.parse(savedSecrets));
      }
    } catch (e) { console.error(e); }

    if (savedDate === todayStr) {
      setIsDone(localStorage.getItem('charity_today_done') === 'true');
      if (savedDeedId) {
        const found = DAILY_DEEDS.find(d => d.id === parseInt(savedDeedId));
        if (found) setCurrentDeed(found);
      }
    } else {
      // It's a new day! Handle streak safety (reset state)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (savedDate !== yesterday.toDateString() && savedDate !== todayStr) {
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

  // Generate Custom AI Good Deed
  const handleGenerateAIDeed = async () => {
    setAiDeedLoading(true);
    setAiDeedText("");
    setAiDeedHadith("");
    setAiDeedIsDone(false);

    const contextMapAr = {
      home: "في المنزل وغرفة الجلوس ومع إخوتي الصغار أو أهل بيتي",
      work: "في مكان العمل / الدراسة ومع زملائي ورؤسائي أو العملاء المترددين اليوم",
      street: "في الشارع والمواصلات العامة والمقاهي والأماكن المشتركة وفي طريقي",
      family: "مع والدي، جدتي، أرحامي، الأقارب من الدرجة الأولى والثانية والمكالمات الهاتفية",
      mosque: "في المسجد ومع جيراني المصلين وحلقات الذكر والقرآن ومصلى الحي"
    };

    const targetAr = contextMapAr[selectedContext];
    const prompt = `أنت عالم روحاني رقيق، خبير بالتنمية الاجتماعية الإسلامية وبث طاقة الإحسان بالقلوب.
اقترح عمل خير يومي وصدقة سلوكية مبتكرة، بسيطة وعميقة الأثر يمكنني القيام بها اليوم في السياق التالي:
"${targetAr}"

يرجى صياغة الاقتراح بأسلوب إيماني آسر، ثم قم بإدراج حديث نبوي أو آية قرآنية تدعم قيمة هذا العمل وعظيم أجره عند الرحمن.
أرجع النتيجة بصيغة JSON صالحة ومطابقة تماماً وخالية من الـ markdown الخارجي:
{
  "deed": "نص الاقتراح والعمل الإيجابي اللطيف البسيط المبتكر",
  "evidence": "الآية أو الحديث النبوي المسند أو السلفي المربوط بالأثر"
}`;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text);
      setAiDeedText(parsed.deed || "");
      setAiDeedHadith(parsed.evidence || "");
    } catch (e) {
      // Fallback AI deeds
      const fallbackMap = {
        home: "تنظيف وترتيب زوايا الجلوس في المنزل دون طلب، وبث رائحة البخور أو العطر الطاردة للكسل وإسعاد أهل بيتك بابتسامة.",
        work: "تقديم مساعدة تقنية أو تذليل صعوبة معينة لزميل في العمل يجد صعوبة في الفهم أو لديه أعباء متزايدة اليوم.",
        street: "شراء زجاجة ماء باردة وتقديمها لعاملي النظافة أو البناء الذين يجهدون تحت فورة الحر في الطرقات اليوم.",
        family: "تخصيص 10 دقائق للاتصال بصلة رحم لم تتكلم معها منذ مدة (خال، عمة، إلخ) والسؤال بصدق عن أحوالهم وتمنياتك الطيبة لهم.",
        mosque: "ترتيب المصاحف الطائرة في المسجد وتنظيف رفوف الكتب وإثراء المسجد بنشر روائح زكية مثل دهن العود."
      };
      setAiDeedText(fallbackMap[selectedContext]);
      setAiDeedHadith("إنّ الدالّ على الخير كفاعله - رواه الترمذي");
    } finally {
      setAiDeedLoading(false);
    }
  };

  const completeAIDeed = () => {
    if (aiDeedIsDone) return;
    const newPoints = points + aiDeedPoints;
    const newTotal = totalCompleted + 1;
    const newStreak = streak + 1;

    setPoints(newPoints);
    setTotalCompleted(newTotal);
    setStreak(newStreak);
    setAiDeedIsDone(true);
    setShowConfetti(true);

    localStorage.setItem('charity_points', newPoints.toString());
    localStorage.setItem('charity_total_completed', newTotal.toString());
    localStorage.setItem('charity_streak', newStreak.toString());

    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  // Saving Box handlers
  const handleAddSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newSavingsAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newLog: SavingsLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: parsedAmount,
      note: newSavingsNote.trim() || "صدقة جارية مقتطعة"
    };

    const updated = [newLog, ...savingsHistory];
    setSavingsHistory(updated);
    setNewSavingsAmount("");
    setNewSavingsNote("");
    localStorage.setItem('charity_savings_history', JSON.stringify(updated));

    // Increase score points as motivation
    const bonusPoints = points + 20;
    setPoints(bonusPoints);
    localStorage.setItem('charity_points', bonusPoints.toString());
  };

  const handleClearSavings = (id: number) => {
    const updated = savingsHistory.filter(item => item.id !== id);
    setSavingsHistory(updated);
    localStorage.setItem('charity_savings_history', JSON.stringify(updated));
  };

  const getTotalSavings = () => {
    return savingsHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
  };

  // Secret Log handlers
  const handleAddSecretDeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretDeed.trim()) return;

    const newLog: SecretDeedLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
      deed: newSecretDeed.trim()
    };

    const updated = [newLog, ...secretLogs];
    setSecretLogs(updated);
    setNewSecretDeed("");
    localStorage.setItem('charity_secret_logs', JSON.stringify(updated));

    // Points prize for secret good deeds!
    const bonusPoints = points + 40;
    setPoints(bonusPoints);
    localStorage.setItem('charity_points', bonusPoints.toString());
  };

  const handleClearSecretDeed = (id: number) => {
    const updated = secretLogs.filter(item => item.id !== id);
    setSecretLogs(updated);
    localStorage.setItem('charity_secret_logs', JSON.stringify(updated));
  };


  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.2rem] p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>

      <div className="relative z-10 space-y-5">
        
        {/* Header Title Grid */}
        <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Heart size={20} className="text-white fill-white/25" />
            </div>
            <div>
              <h3 className="font-bold text-slate-850 dark:text-slate-100 text-[13px] font-serif">سِجلّ الصدقات وصنائع المعروف</h3>
              <p className="text-[10px] text-slate-400 font-bold">بادر بالخير الخفي • ضاعف رصيدك الإيماني لليوم</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1.5 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400">
            <Award size={13} />
            <span>{points} نقطة معرجة</span>
          </div>
        </div>

        {/* Dynamic Category Navigation Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl gap-1 border border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveSection('deed')}
            className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${
              activeSection === 'deed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            صدقة اليوم
          </button>
          
          <button
            onClick={() => setActiveSection('ai-deed')}
            className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${
              activeSection === 'ai-deed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            موجّه الخير AI 🧠
          </button>

          <button
            onClick={() => setActiveSection('charity-box')}
            className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${
              activeSection === 'charity-box' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            حصالة الصدقات 🪙
          </button>

          <button
            onClick={() => setActiveSection('secret-log')}
            className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${
              activeSection === 'secret-log' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            صدقة السر 🔐
          </button>
        </div>


        {/* --- SECTION 1: STANDARD DAY DEED --- */}
        {activeSection === 'deed' && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-[22px] border border-slate-100 dark:border-slate-800 relative min-h-[120px] flex flex-col justify-center">
              <span className="absolute top-3 right-4 text-[8px] font-black px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                {currentDeed.category}
              </span>
              
              <p className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-200 font-bold px-1.5 py-4 text-center">
                {currentDeed.text}
              </p>

              {currentDeed.hadithRef && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold border-t border-dashed border-slate-200 dark:border-slate-800/60 pt-3 flex items-center justify-center gap-1 px-4 text-center">
                  <Sparkles size={11} className="flex-shrink-0" />
                  <span>{currentDeed.hadithRef}</span>
                </div>
              )}
            </div>

            {/* Actions Buttons */}
            <div className="flex items-center gap-2">
              {isDone ? (
                <div className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10">
                  <CheckCircle2 size={15} />
                  <span>تقبل الله! أتممت عمل الخير بنجاح 🌸</span>
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>سجل إنجاز العمل الآن ✔️</span>
                </button>
              )}

              {!isDone && (
                <button
                  onClick={handleShuffle}
                  className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-emerald-500 transition-colors"
                  title="تغيير العمل"
                >
                  <RefreshCw size={15} />
                </button>
              )}

              <button
                onClick={shareDeed}
                className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-emerald-500 transition-colors"
                title="مشاركة"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        )}


        {/* --- SECTION 2: AI DYNAMIC GUIDED DEEDS --- */}
        {activeSection === 'ai-deed' && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-black">اختر سياقك/مكانك الذي تقضي فيه يومك ليتم تخصيص العمل:</label>
              <div className="grid grid-cols-5 gap-1">
                {(['family', 'home', 'work', 'street', 'mosque'] as const).map((ctx) => {
                  const arName = { family: 'الأهل', home: 'البيت', work: 'الدراسة', street: 'الطريق', mosque: 'المسجد' }[ctx];
                  return (
                    <button
                      key={ctx}
                      onClick={() => setSelectedContext(ctx)}
                      className={`py-2 text-[10px] font-black rounded-lg border transition-all ${
                        selectedContext === ctx
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-400'
                      }`}
                    >
                      {arName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Generator Button */}
            {!aiDeedText && !aiDeedLoading && (
              <button
                onClick={handleGenerateAIDeed}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-650 hover:to-teal-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Sparkles size={14} />
                <span>فريد: ابتكار عمل خير خاص بي الآن بالذكاء الاصطناعي ✨</span>
              </button>
            )}

            {aiDeedLoading && (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <RefreshCw className="animate-spin text-emerald-500 mx-auto" size={24} />
                <p className="text-[11px] font-bold text-slate-400">يقوم الذكاء الاصطناعي لـ "محراب الحق" بصياغة واجب معروفي غاية في الدقة لأجلك...</p>
              </div>
            )}

            {aiDeedText && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 space-y-3"
              >
                <span className="inline-block text-[8px] bg-emerald-500/10 text-emerald-650 dark:text-emerald-355 px-2 py-0.5 rounded-full font-black">
                  اقتراح موجه الذكاء الذكي
                </span>
                
                <p className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-100 font-bold">
                  {aiDeedText}
                </p>

                {aiDeedHadith && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold border-t border-dashed border-emerald-500/10 pt-2.5 flex items-center gap-1">
                    📖 <span>{aiDeedHadith}</span>
                  </p>
                )}

                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex gap-2.5">
                  {aiDeedIsDone ? (
                    <div className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-center text-[10px] font-black flex items-center justify-center gap-1 shadow">
                      <CheckCircle2 size={13} />
                      <span>تقبل الله منكم صالح الإحسان! (+{aiDeedPoints} نقطة)</span>
                    </div>
                  ) : (
                    <button
                      onClick={completeAIDeed}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={13} />
                      <span>سجل إنجاز الواجب المخصص ✔️</span>
                    </button>
                  )}

                  <button
                    onClick={handleGenerateAIDeed}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"
                    title="توليد اقتراح آخر"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}


        {/* --- SECTION 3: SAVINGS PIGGYBANK CARD --- */}
        {activeSection === 'charity-box' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-center space-y-0.5 border-l border-black/5 dark:border-white/5">
                <Coins size={18} className="text-amber-500 mx-auto mb-1" />
                <span className="block text-[8px] text-slate-400 font-bold">مجموع مدخراتك المقتطعة</span>
                <span className="text-md font-black text-slate-800 dark:text-slate-100">{getTotalSavings()}</span>
              </div>
              <div className="text-center space-y-0.5">
                <Activity size={18} className="text-emerald-500 mx-auto mb-1" />
                <span className="block text-[8px] text-slate-400 font-bold">عمليات الخرائط والمساهمة</span>
                <span className="text-md font-black text-slate-800 dark:text-slate-100">{savingsHistory.length} ودائع</span>
              </div>
            </div>

            {/* Embedded Form to add deposit */}
            <form onSubmit={handleAddSavings} className="space-y-2 border-b border-black/5 dark:border-white/5 pb-3">
              <span className="block text-[10px] text-slate-400 font-black">أضف وديعة صدقة جديدة لحصالتك الخاصة لتوزيعها لاحقاً:</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="المبلغ..."
                  value={newSavingsAmount}
                  onChange={(e) => setNewSavingsAmount(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 text-center"
                  required
                />
                <input
                  type="text"
                  placeholder="الهدف (إطعام، ماء...)"
                  value={newSavingsNote}
                  onChange={(e) => setNewSavingsNote(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 col-span-2"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={13} />
                <span>إيداع الصدقة في صندوق الحفظ (+20 نقطة)</span>
              </button>
            </form>

            {/* Savings logs slider */}
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 divide-y divide-black/5 dark:divide-white/5">
              {savingsHistory.length === 0 ? (
                <div className="text-center py-4 text-[10px] text-slate-400 font-medium">حصالة الصدقات فارغة حالياً. ابدأ بادخار قليل من مالك ولو ريالاً واحداً لوجه الله وسجله.</div>
              ) : (
                savingsHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-[10px] font-bold pt-1.5 first:pt-0">
                    <div className="text-right">
                      <span className="text-slate-700 dark:text-slate-100 block font-serif">{item.note}</span>
                      <span className="text-[8px] text-slate-400 block">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-black">+{item.amount}</span>
                      <button
                        type="button"
                        onClick={() => handleClearSavings(item.id)}
                        className="text-slate-350 hover:text-red-500"
                        title="حذف"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}


        {/* --- SECTION 4: SECRET GOOD DEED LOGS (Locked private logs) --- */}
        {activeSection === 'secret-log' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
              "صدقة السر تُطفئ غضب الرب"؛ هنا يمكنك تدوين أعمالك الطيبة الخفية والسرية التي لا يعلمها أحد كأرشيف روحي خاص بك في جهازك للذكرى والتفكر الإيجابي.
            </p>

            <form onSubmit={handleAddSecretDeed} className="space-y-2 border-b border-black/5 dark:border-white/5 pb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثال: ابتعت كيس دجاج لجار معسر وأرسلته دون الإفصاح عن اسمي..."
                  value={newSecretDeed}
                  onChange={(e) => setNewSecretDeed(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm transition-colors flex-shrink-0"
                >
                  <Lock size={12} />
                  <span>طمر بالسر (+40 ن)</span>
                </button>
              </div>
            </form>

            {/* Secret deed list */}
            <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
              {secretLogs.length === 0 ? (
                <div className="text-center py-4 text-[10px] text-slate-400 font-medium">سجل صدقات السر فارغ. أضف صدقة سر وتصدق خفية لتضمن النعيم وطهر فؤادك.</div>
              ) : (
                secretLogs.map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] font-bold">
                    <div className="text-right flex items-center gap-2">
                      <span className="text-amber-500 flex-shrink-0">🔒</span>
                      <div>
                        <p className="text-slate-700 dark:text-slate-200">{item.deed}</p>
                        <span className="text-[8px] text-slate-400">{item.date}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClearSecretDeed(item.id)}
                      className="p-1 text-slate-350 hover:text-red-500 transition-colors"
                      title="حذف الأثر"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Motivational Streak Banner */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-black px-1 pt-1.5 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-amber-500" />
            <span>سلسلة الخير المتصلة: <strong className="text-amber-500">{streak} أيام متواصلة</strong></span>
          </div>
          <div>
            <span>إجمالي المعروف: <strong className="text-emerald-500">{totalCompleted} أعمال</strong></span>
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
            className="absolute inset-0 bg-emerald-950/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-4 text-white rounded-[2.2rem]"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="space-y-3"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl animate-bounce">
                ✨
              </div>
              <h4 className="font-extrabold text-sm text-emerald-300 font-serif">تقبل الله طاعاتك وإحسانك!</h4>
              <p className="text-[11px] text-emerald-100 max-w-[220px] mx-auto leading-relaxed">
                "إنّ الدالَ على الخيرِ كفاعِلِه".. نلت رصيد طاقة معنوية مضافاً في ميزان حسناتك!
              </p>
              <button
                type="button"
                onClick={() => setShowConfetti(false)}
                className="mt-2 bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-xl text-[10px] font-black text-white"
              >
                الحمد لله حمداً كثيراً 🧡
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

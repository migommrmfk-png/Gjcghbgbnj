import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  BookOpen, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Settings, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  CheckSquare, 
  Square, 
  Info, 
  Check,
  ChevronDown
} from 'lucide-react';
import { getGeminiClient, Type } from '../lib/gemini';

export default function QuranPlan({ onBack }: { onBack: () => void }) {
  const [hasPlan, setHasPlan] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  
  // Custom states for conventional plans
  const [pagesPerDay, setPagesPerDay] = useState(5);
  const [goal, setGoal] = useState('reading'); // reading, memorization, revision, or ai-taqwa
  
  // Custom states for AI Taqwa Plan Setup
  const [spiritualGoal, setSpiritualGoal] = useState('تدبر مكثف ومجاهدة النفس');
  const [dailyTime, setDailyTime] = useState('أكثر من ٣٠ دقيقة بقليل');
  const [currentLevel, setCurrentLevel] = useState('متوسط (أقرأ بانتظام ولكن دون التزام يومي ورد)');
  const [focusSurahs, setFocusSurahs] = useState('كل المصحف الشريف');
  
  // App state
  const [plan, setPlan] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [planTitle, setPlanTitle] = useState('خطة القرآن الكريم');
  const [focusDetails, setFocusDetails] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Daily task sub-checkboxes for AI Taqwa Plan
  // Format: { [dayIndex: number]: { target: boolean, upkeep: boolean, reflection: boolean } }
  const [dayChecklists, setDayChecklists] = useState<{ [key: number]: { target: boolean; upkeep: boolean; reflection: boolean } }>({});

  useEffect(() => {
    const savedPlan = localStorage.getItem('quranPlan');
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan);
        setPlan(parsed.plan || []);
        setGoal(parsed.goal || 'reading');
        setPlanTitle(parsed.planTitle || 'خطة القرآن الكريم');
        setFocusDetails(parsed.focusDetails || '');
        setHasPlan(true);
        
        // Load checklists
        const savedChecklists = localStorage.getItem('taqwaChecklists');
        if (savedChecklists) {
          setDayChecklists(JSON.parse(savedChecklists));
        }
        
        calculateProgress(parsed.plan || []);
      } catch (err) {
        console.error("Error loading plan", err);
      }
    }
  }, []);

  const calculateProgress = (currentPlan: any[]) => {
    if (!currentPlan || currentPlan.length === 0) return;
    const completed = currentPlan.filter(p => p.status === 'completed').length;
    setProgress((completed / currentPlan.length) * 105 ? Math.min((completed / currentPlan.length) * 100, 100) : 0);
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
        target: goal === 'reading' 
          ? `قراءة الصفحات ${startPage} - ${endPage}` 
          : goal === 'memorization' 
          ? `حفظ الصفحات ${startPage} - ${endPage}`
          : `مراجعة الصفحات ${startPage} - ${endPage}`,
        upkeep: `تأكيد وصيانة ورد الأمس (الصفحات ${Math.max(1, startPage - pagesPerDay)} - ${startPage - 1})`,
        reflection: `تدبر معاني الآيات والوقوف على قيم التقوى والعمل الإيماني والخشوع والسكينة.`,
        status: i === 1 ? 'current' : 'pending'
      });
    }
    
    setPlan(newPlan);
    setPlanTitle(goal === 'reading' ? 'ورد التلاوة والختمة المتكاملة' : goal === 'memorization' ? 'خطة حفظ وحماية الآيات المقررة' : 'منهج المراجعة الرمضاني واليومي');
    setFocusDetails('منهج تذكرة يومية منسقة لحث الهمّة والحفاظ على الصلة بالوحي الرباني.');
    setHasPlan(true);
    calculateProgress(newPlan);
    localStorage.setItem('quranPlan', JSON.stringify({ 
      plan: newPlan, 
      goal, 
      pagesPerDay,
      planTitle: goal === 'reading' ? 'ورد التلاوة والختمة المتكاملة' : 'خطة حفظ وحماية الآيات المقررة',
      focusDetails: 'منهج تذكرة يومية منسقة لحث الهمّة والحفاظ على الصلة بالوحي الرباني.'
    }));
  };

  // Generation method for the AI customized Taqwa plan (منهج التقوى المخصص بالذكاء الاصطناعي)
  const generateAiTaqwaPlan = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const ai = getGeminiClient();
      
      const prompt = `أنت عالم رباني ومربٍ إيماني خبير في كتاب الله وتوجيه المسلم لبناء "منهج التقوى" وتنمية الإيمان وصيانة الورد اليومي.
يريد صياغة خطة منهجية مخصصة وميسرة تسمى "منهج التقوى المخصص" لختمة قرآنية مركزة وصيانة ورد دائم.

تفاصيل المستخدم:
1. الهدف الإيماني والروحي: ${spiritualGoal}
2. وقت الفراغ المتاح يوميا للقرآن: ${dailyTime}
3. مستوى التلاوة والانتظام الحالي: ${currentLevel}
4. السور أو النطاق التركيزي المفضل: ${focusSurahs}

المطلوب: توليد خطة روحية متكاملة مدتها 10 أيام كمرحلة أولى نموذجية مصممة خصيصاً له لتثبيت العدادات وصيانة الورد وتلاوة الختمة المقررة.
يجب أن ترجع النتيجة كصيغة JSON مطابقة تماماً للمواصفات التالية:
{
  "planTitle": "اسم ملهم ومبهج للخطة الإيمانية لـ منهج التقوى",
  "period": "10 أيام",
  "focusDetails": "وصف وجيز وإرشادات عامة للنصيحة النبوية ومقاصد التقوى لهذا المنهج المخصص",
  "days": [
    {
      "day": 1,
      "target": "الورد القرآني المقرر تلاوته/حفظه بدقة مع السورة ورقم الآية أو الصفحات الكافية للوصول للختمة",
      "upkeep": "مهمة صيانة الورد المحددة لليوم لمنع التفلت والمحافظة على ديمومة ما قرأه (مثلاً: مراجعة كذا، أو الاستماع لتلاوة قرأها بالأمس)",
      "reflection": "سلوك التقوى ومفتاح التدبر والوعي الروحي ليدبره العبد ويعمل به في يومه"
    },
    ... (توليد 10 أيام متتابعة بدقة)
  ]
}

تنبيه: لا ترجع أي نصوص إضافية خارج الـ JSON. يجب أن يكون الـ JSON صالح وسلس جداً وخالٍ من الأخطاء العرضية، وباللغة العربية المشرقة والربانية الصادقة.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planTitle: { type: Type.STRING },
              period: { type: Type.STRING },
              focusDetails: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    target: { type: Type.STRING },
                    upkeep: { type: Type.STRING },
                    reflection: { type: Type.STRING }
                  },
                  required: ["day", "target", "upkeep", "reflection"]
                }
              }
            },
            required: ["planTitle", "period", "focusDetails", "days"]
          }
        }
      });

      const responseText = response.text || '';
      const parsedData = JSON.parse(responseText);

      // format the status
      const updatedDays = parsedData.days.map((d: any, index: number) => ({
        ...d,
        status: index === 0 ? 'current' : 'pending'
      }));

      setPlan(updatedDays);
      setPlanTitle(parsedData.planTitle || 'منهج التقوى المخصص بالذكاء الاصطناعي');
      setFocusDetails(parsedData.focusDetails || '');
      setGoal('ai-taqwa');
      setHasPlan(true);

      // Reset checked tasks
      const newChecklists: any = {};
      updatedDays.forEach((_: any, index: number) => {
        newChecklists[index] = { target: false, upkeep: false, reflection: false };
      });
      setDayChecklists(newChecklists);

      localStorage.setItem('quranPlan', JSON.stringify({ 
        plan: updatedDays, 
        goal: 'ai-taqwa', 
        planTitle: parsedData.planTitle,
        focusDetails: parsedData.focusDetails
      }));
      localStorage.setItem('taqwaChecklists', JSON.stringify(newChecklists));
      calculateProgress(updatedDays);

    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'حدث خطأ في صياغة الذكاء الاصطناعي للمنهج، يرجى المحاولة ثانيةً.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleDayStatus = (dayIndex: number) => {
    const newPlan = [...plan];
    const currentStatus = newPlan[dayIndex].status;
    
    if (currentStatus === 'completed') {
      newPlan[dayIndex].status = 'current';
    } else {
      newPlan[dayIndex].status = 'completed';
      // Auto progress: Set next pending to current
      const nextPendingIndex = newPlan.findIndex((p, i) => i > dayIndex && p.status === 'pending');
      if (nextPendingIndex !== -1) {
        newPlan[nextPendingIndex].status = 'current';
      }
    }
    
    setPlan(newPlan);
    calculateProgress(newPlan);
    localStorage.setItem('quranPlan', JSON.stringify({ plan: newPlan, goal, planTitle, focusDetails }));
  };

  const syncSpecificTaqwaCheck = (dayIndex: number, type: 'target' | 'upkeep' | 'reflection') => {
    const updatedChecklists = { ...dayChecklists };
    if (!updatedChecklists[dayIndex]) {
      updatedChecklists[dayIndex] = { target: false, upkeep: false, reflection: false };
    }
    updatedChecklists[dayIndex][type] = !updatedChecklists[dayIndex][type];
    setDayChecklists(updatedChecklists);
    localStorage.setItem('taqwaChecklists', JSON.stringify(updatedChecklists));

    // If all checked, automatically mark day completed if not already!
    const dayObj = updatedChecklists[dayIndex];
    const allDone = dayObj.target && dayObj.upkeep && dayObj.reflection;
    
    const newPlan = [...plan];
    if (allDone && newPlan[dayIndex].status !== 'completed') {
      newPlan[dayIndex].status = 'completed';
      // advance
      const nextPendingIndex = newPlan.findIndex((p, i) => i > dayIndex && p.status === 'pending');
      if (nextPendingIndex !== -1) {
        newPlan[nextPendingIndex].status = 'current';
      }
      setPlan(newPlan);
      calculateProgress(newPlan);
      localStorage.setItem('quranPlan', JSON.stringify({ plan: newPlan, goal, planTitle, focusDetails }));
    } else if (!allDone && newPlan[dayIndex].status === 'completed') {
      newPlan[dayIndex].status = 'current';
      setPlan(newPlan);
      calculateProgress(newPlan);
      localStorage.setItem('quranPlan', JSON.stringify({ plan: newPlan, goal, planTitle, focusDetails }));
    }
  };

  const resetPlan = () => {
    if (confirm('هل أنت متأكد من رغبتك في حذف جدول الورد الحالي وتعيين منهج تقوى جديد؟')) {
      localStorage.removeItem('quranPlan');
      localStorage.removeItem('taqwaChecklists');
      setHasPlan(false);
      setSetupStep(0);
      setPlan([]);
      setProgress(0);
      setDayChecklists({});
    }
  };

  if (!hasPlan) {
    return (
      <div className="max-w-md mx-auto p-4 pb-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150" dir="rtl">
        <div className="sticky top-0 z-20 py-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">
              <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500" />
            </button>
            <h1 className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5">
              <span>منهج الختم والتقوى</span>
              <Sparkles size={18} className="text-amber-500 animate-pulse" />
            </h1>
          </div>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {setupStep === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-650 dark:text-emerald-400 mb-4 shadow-inner border border-emerald-100 dark:border-emerald-500/20 transform rotate-2">
                    <BookOpen size={40} className="text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black font-serif text-slate-900 dark:text-slate-100">حدد خطتك الإيمانية المقررة</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 font-medium leading-relaxed px-4">
                    اختر المنهج المخصص لك لحفظ العبادة وصيانة الورد القرآني بذكاء
                  </p>
                </div>

                <div className="grid gap-3.5">
                  {/* AI CUSTOM OPTION FIRST (USER’S SPECIFIC REQUEST) */}
                  <button 
                    onClick={() => { setGoal('ai-taqwa'); setSetupStep(2); }} 
                    className="group relative overflow-hidden text-right p-5 rounded-[2rem] border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-transparent hover:border-emerald-500/80 hover:-translate-y-1 transition-all flex items-start gap-4 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-[1.5rem] bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-[0_5px_15px_rgba(16,185,129,0.3)] border border-white/25">
                      <Sparkles size={24} className="text-amber-300 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-slate-905 dark:text-white group-hover:text-emerald-500">منهج التقوى بالذكاء الاصطناعي 🧠</h3>
                        <span className="text-[9px] bg-amber-400 hover:bg-amber-500 text-slate-900 font-black px-1.5 py-0.5 rounded-full">موصى به</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed font-semibold">
                        يقوم الذكاء الاصطناعي بصياغة منهج متقن للختمة القرآنية المقررة وصيانة الورد اليومي ومفاتيح التدبر المخصصة حسب مستواك ووقتك المتاح.
                      </p>
                    </div>
                  </button>

                  <div className="text-[10px] text-center text-slate-400 font-extrabold tracking-widest my-1">أو اختر منهجاً تقليدياً بسيطاً</div>

                  {/* READ SEAL */}
                  <button 
                    onClick={() => { setGoal('reading'); setSetupStep(1); }} 
                    className="group text-right p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/30 hover:bg-slate-50 dark:hover:bg-slate-850 hover:-translate-y-0.5 transition-all flex items-start gap-4 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-[1.2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-500">منهج التلاوة الكاملة (ختمة)</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-400 leading-normal font-medium">قراءة القرآن الكريم كاملاً بورد يومي منسق حسب عدد الصفحات.</p>
                    </div>
                  </button>

                  {/* MEMORIZE */}
                  <button 
                    onClick={() => { setGoal('memorization'); setSetupStep(1); }} 
                    className="group text-right p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/30 hover:bg-slate-50 dark:hover:bg-slate-850 hover:-translate-y-0.5 transition-all flex items-start gap-4 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-[1.2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-amber-500 shrink-0">
                      <Target size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-500">منهج حفظ ورد جديد</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-400 leading-normal font-medium">حفظ الآيات المقررة مع تثبيت مستمر ومراجعة مخصصة لعدم التفلت.</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Pages per day input (Conventional) */}
            {setupStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="text-center mb-6">
                  <Calendar size={56} className="mx-auto text-emerald-555 text-emerald-500 mb-3" />
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif">كم صفحة تقرر لوردك اليومي؟</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">تحديد ورد مستدام يحفظ همّتك وصيانة الورد</p>
                </div>

                <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center space-y-6 shadow-sm">
                  <div className="text-6xl font-black text-emerald-500 font-serif">{pagesPerDay}</div>
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    value={pagesPerDay} 
                    onChange={(e) => setPagesPerDay(parseInt(e.target.value))}
                    className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                    <span>صفحة واحدة يومياً</span>
                    <span>٤٠ صفحة (جزءان كاملان)</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setSetupStep(0)} className="px-5 py-3.5 rounded-xl text-slate-550 border border-slate-200 dark:border-slate-800 font-bold text-xs">
                    رجوع
                  </button>
                  <button onClick={generatePlan} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/15 text-xs">
                    بناء الختمة والورد اليدوي
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Custom variables for AI Taqwa Plan */}
            {setupStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="text-center mb-2">
                  <Sparkles size={40} className="mx-auto text-emerald-500 animate-bounce mb-2" />
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">تخصيص منهج التقوى بالذكاء الاصطناعي</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">أجب لنقرر ووردك ونضمن صيانة الختمة بذكاء رباني</p>
                </div>

                <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm text-xs">
                  {/* Q1 */}
                  <div className="space-y-1.5 text-right">
                    <label className="font-extrabold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                      <Heart size={12} className="text-rose-500" />
                      <span>ما هو غايتك الكبرى من هذا المنهج؟</span>
                    </label>
                    <select 
                      value={spiritualGoal} 
                      onChange={(e) => setSpiritualGoal(e.target.value)}
                      className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl font-medium text-slate-800 dark:text-white text-xs"
                    >
                      <option value="تدبر مكثف ومجاهدة النفس والتزام طاعات الصلاة المقررة">تدبر مكثف ومجاهدة النفس وصيانة الورد</option>
                      <option value="تلاوة ختمة كبرى سريعة للتبرك والراحة النفسية">ختمة تلاوة سريعة وبناء ديمومة</option>
                      <option value="حفظ سور مقررة بطريقة التكرار المتين وصيانة الحفظ لئلا يتفلت">حفظ وتثبيت متين وصيانة الورد بالأمس</option>
                      <option value="زيادة التركيز والخشوع وطرد الوساوس وكسل العبادة">خشوع وتركيز وزيادة طاقات الإيمان</option>
                    </select>
                  </div>

                  {/* Q2 */}
                  <div className="space-y-1.5 text-right">
                    <label className="font-extrabold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                      <Calendar size={12} className="text-amber-500" />
                      <span>كم دقيقة تستطيع تخصيصها للورد باليوم؟</span>
                    </label>
                    <select 
                      value={dailyTime} 
                      onChange={(e) => setDailyTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl font-medium text-slate-800 dark:text-white text-xs"
                    >
                      <option value="من ١٠ إلى ١٥ دقيقة (ورد سريع ميسّر)">١٠-١٥ دقيقة (ميسر ويناسب الكثرة أعمالهم)</option>
                      <option value="أكثر من ٣٠ دقيقة بقليل (متوسط التركيز)">٢٠-٣٠ دقيقة (متوازن وعميق)</option>
                      <option value="ساعة كاملة (منهج مكثف ومجاهدة مروية)">ساعة كاملة (منهج إيماني متكامل ومجاهدة عالية)</option>
                    </select>
                  </div>

                  {/* Q3 */}
                  <div className="space-y-1.5 text-right">
                    <label className="font-extrabold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                      <Layers size={12} className="text-indigo-500" />
                      <span>مستوى صلتك وقراءتك الحالية للذكر الحكيم:</span>
                    </label>
                    <select 
                      value={currentLevel} 
                      onChange={(e) => setCurrentLevel(e.target.value)}
                      className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl font-medium text-slate-800 dark:text-white text-xs"
                    >
                      <option value="مبتدئ (أواجه ثقلاً كبيراً وأريد دافع طاعة)">أريد خطة ميسرة جداً تكسر جمود الهمة</option>
                      <option value="متوسط (أقرأ أحياناً بانتظام وأريد المحافظة والالتزام)">متوسط وأريد الالتزام بصيانة الورد والختمة</option>
                      <option value="متقدم (أقرأ يومياً وأبحث عن توجيه تدبر عميق ومراقبة صيانة)">متقدم وأريد تدبر نخبوي رباني دقيق</option>
                    </select>
                  </div>

                  {/* Q4 */}
                  <div className="space-y-1.5 text-right">
                    <label className="font-extrabold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                      <Target size={12} className="text-emerald-500" />
                      <span>هل تود التركيز على سور معينة في منهجك؟</span>
                    </label>
                    <input 
                      type="text" 
                      value={focusSurahs} 
                      onChange={(e) => setFocusSurahs(e.target.value)}
                      placeholder="مثال: سورة البقرة، قصار السور، جزء عم..."
                      className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                {aiError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center gap-1.5 text-right leading-relaxed">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                <div className="flex gap-2 text-xs">
                  <button 
                    disabled={aiLoading} 
                    onClick={() => setSetupStep(0)} 
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-bold"
                  >
                    رجوع
                  </button>
                  <button 
                    disabled={aiLoading} 
                    onClick={generateAiTaqwaPlan}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-amber-500 text-white rounded-xl font-black shadow-md shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>جاري صياغة منهجك بالذكاء الاصطناعي...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-300 animate-pulse" />
                        <span>إنشاء منهج التقوى المقرّر بالذكاء الاصطناعي 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-right" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-white dark:bg-slate-900 shadow-sm">
            <ArrowRight size={22} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500" />
          </button>
          <div>
            <h1 className="text-lg font-black font-serif text-slate-900 dark:text-white flex items-center gap-1">
              <span>{goal === 'ai-taqwa' ? 'منهج التقوى الذكي' : 'خطة الورد والختمة'}</span>
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
            </h1>
            <span className="block text-[9px] text-slate-400 font-bold leading-none">تعديل وصيانة وردك المقرّر</span>
          </div>
        </div>
        <button 
          onClick={resetPlan} 
          className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl transition-all border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
          title="مسح وتعديل الخطة"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {/* Progress Card */}
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-[2.2rem] p-6 text-white shadow-xl relative overflow-hidden border border-white/5"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(5,46,22,0.85), rgba(2,15,10,0.95)), url('https://i.pinimg.com/736x/f6/3c/65/f63c65c270d7406f52285188d8b2d423.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1 max-w-[80%]">
                <span className="text-[9px] bg-emerald-500/25 border border-emerald-400/35 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full inline-block">
                  {goal === 'ai-taqwa' ? 'منهج التقوى المخصص بالذكاء الاصطناعي ✨' : 'ورد الختم اليومي'}
                </span>
                <h2 className="text-xl font-black font-serif text-white leading-relaxed">
                  {planTitle}
                </h2>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-amber-400 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg transform rotate-3 shrink-0">
                <Flame size={20} className="text-emerald-950 animate-pulse" />
              </div>
            </div>

            {/* General instructions */}
            {focusDetails && (
              <p className="text-[11px] text-emerald-200/90 leading-relaxed font-semibold bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-900/40">
                💡 {focusDetails}
              </p>
            )}
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-black text-amber-300">
                <span>صيانة وردك المنهجي</span>
                <span>{Math.round(progress)}% من الإنجاز</span>
              </div>
              <div className="w-full bg-emerald-950/80 rounded-full h-3 overflow-hidden border border-emerald-900/50 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-400 h-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline of Days */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-205 flex items-center gap-1.5">
              <Calendar className="text-emerald-500" size={16} />
              <span>وردك المقرّر ومتابعة الصيانة اليومية</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-extrabold">المدة: {plan.length} أيام</span>
          </div>

          <div className="space-y-4">
            {plan.map((day, index) => {
              const checklist = dayChecklists[index] || { target: false, upkeep: false, reflection: false };
              const isCurrent = day.status === 'current';
              const isCompleted = day.status === 'completed';
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-[2rem] border p-5 transition-all text-right space-y-3.5 relative overflow-hidden ${
                    isCompleted 
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 opacity-80' 
                      : isCurrent 
                      ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/30' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {/* Watermark of Day Number */}
                  <div className="absolute left-4 top-2 text-6xl font-black font-mono text-slate-100/30 dark:text-slate-800/20 pointer-events-none select-none">
                    {day.day}
                  </div>

                  {/* Day Title & Header */}
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        isCompleted ? 'bg-emerald-555 bg-emerald-500 text-white' : 
                        isCurrent ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 border border-emerald-300' : 
                        'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isCompleted ? <Check size={14} /> : day.day}
                      </div>
                      <span className={`text-sm font-black font-serif ${isCompleted ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                        اليوم {day.day} {isCurrent && '• الورد اليومي وعملك الحالي 🟢'}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleDayStatus(index)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-xl cursor-pointer active:scale-95 transition-all ${
                        isCompleted 
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                      }`}
                    >
                      {isCompleted ? 'تراجع عن الإكمال' : 'أنجزت اليوم بالكامل ✅'}
                    </button>
                  </div>

                  {/* SUB CHECKLIST / DETAILED WORKSHOP TASKS (صيانة ورد والختمة المخصصة) */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
                    {/* Task 1: الورد والختمة المقررة */}
                    <div 
                      onClick={() => syncSpecificTaqwaCheck(index, 'target')}
                      className={`p-3 rounded-2xl border text-xs text-right cursor-pointer flex items-start gap-2.5 transition-all active:scale-[0.99] ${
                        checklist.target 
                          ? 'bg-emerald-500/10 border-emerald-555 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-350' 
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      <button className="shrink-0 mt-0.5" type="button">
                        {checklist.target ? (
                          <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                      </button>
                      <div className="space-y-0.5">
                        <span className="block font-black text-xs text-emerald-600 dark:text-emerald-400">📖 الورد والختمة المقرّرة:</span>
                        <p className={`font-semibold leading-relaxed text-[11px] ${checklist.target ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                          {day.target}
                        </p>
                      </div>
                    </div>

                    {/* Task 2: صيانة الورد ومنع التفلت */}
                    <div 
                      onClick={() => syncSpecificTaqwaCheck(index, 'upkeep')}
                      className={`p-3 rounded-2xl border text-xs text-right cursor-pointer flex items-start gap-2.5 transition-all active:scale-[0.99] ${
                        checklist.upkeep 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300' 
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      <button className="shrink-0 mt-0.5" type="button">
                        {checklist.upkeep ? (
                          <CheckSquare size={16} className="text-amber-500" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                      </button>
                      <div className="space-y-0.5">
                        <span className="block font-black text-xs text-amber-600 dark:text-amber-400">🛡️ صيانة الورد اليومي (التثبيت والمراجعة):</span>
                        <p className={`font-semibold leading-relaxed text-[11px] ${checklist.upkeep ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                          {day.upkeep || "مراجعة خمس صفحات من محفوظاتك السابقة والاستماع لصفحتين بتركيز."}
                        </p>
                      </div>
                    </div>

                    {/* Task 3: ورد التدبر والعمل بالآيات */}
                    <div 
                      onClick={() => syncSpecificTaqwaCheck(index, 'reflection')}
                      className={`p-3 rounded-2xl border text-xs text-right cursor-pointer flex items-start gap-2.5 transition-all active:scale-[0.99] ${
                        checklist.reflection 
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-800 dark:text-purple-300' 
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-101 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      <button className="shrink-0 mt-0.5" type="button">
                        {checklist.reflection ? (
                          <CheckSquare size={16} className="text-purple-500" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                      </button>
                      <div className="space-y-0.5">
                        <span className="block font-black text-xs text-purple-600 dark:text-purple-400">✨ سلوك التقوى ومفتاح التدبر اليومي:</span>
                        <p className={`font-semibold leading-relaxed text-[11px] ${checklist.reflection ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                          {day.reflection || "استشعر سعة رحمة الله عند كل آية رحمة، وادعُ العلي القدير بالمغفرة بحب وإخلاص."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footnote of current status */}
                  {isCurrent && (
                    <div className="text-[10px] text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-1.5 rounded-xl border border-emerald-500/10 animate-pulse">
                      🌱 قم بإنجاز ومعاينة المهام الثلاث بالأعلى لإتمام منهج يومك تلقائياً
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

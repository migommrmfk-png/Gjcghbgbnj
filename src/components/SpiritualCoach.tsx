import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  HelpCircle, 
  ArrowLeft, 
  Compass, 
  ChevronRight, 
  Smile, 
  BookOpen, 
  Moon, 
  Activity,
  Heart,
  FileText,
  Flame,
  CheckCircle2,
  RefreshCw,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

interface SpiritualCoachProps {
  onBack: () => void;
}

export default function SpiritualCoach({ onBack }: SpiritualCoachProps) {
  const [loading, setLoading] = useState(false);
  const [coachResponse, setCoachResponse] = useState<string>("");
  const [activeConcern, setActiveConcern] = useState<string>("");
  
  // Voice synthesis states
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(() => {
    return localStorage.getItem('sheikh_voice_active') !== 'false';
  });

  // Handle SpeechSynthesis Toggle and Cancel
  useEffect(() => {
    localStorage.setItem('sheikh_voice_active', String(isVoiceActive));
    if (!isVoiceActive) {
      window.speechSynthesis?.cancel();
    }
  }, [isVoiceActive]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakWithSheikhVoice = (text: string) => {
    if (!isVoiceActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      
      // Clean up markdown syntax for voice reading
      const speechReadyText = text
        .replace(/[*#_`~\\-]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/[a-zA-Z]/g, '') // Hide non-arabic letters to avoid robotic spells
        .trim();

      const utterance = new SpeechSynthesisUtterance(speechReadyText);
      utterance.rate = 0.80;  // Calm, deliberate pacing
      utterance.pitch = 0.90; // Deep, masculine, wise sheikh tone of voice

      // Try finding direct Arabic male voices or fallback to avoiding female voices
      const voices = window.speechSynthesis.getVoices();
      const arVoices = voices.filter(v => v.lang.startsWith('ar') || v.lang.startsWith('AR'));
      
      const maleKeywords = ['naayf', 'maged', 'tarik', 'male', 'hazem', 'zakaria', 'shakir', 'youssef', 'saeed', 'hamzah', 'musa', 'salem', 'faisal', 'khalid', 'bassam', 'mohamed', 'omar', 'ali', 'ibrahim', 'boy', 'man', 'sheikh'];
      const femaleKeywords = ['hoda', 'mariam', 'leila', 'yasmin', 'zeina', 'sana', 'female', 'laila', 'salma', 'amina', 'rauda', 'zara', 'kamala', 'kamilah', 'fawzia', 'ghada', 'latifa', 'maha', 'noha', 'ranya', 'salwa', 'warda', 'girl', 'woman', 'lady'];

      let selectedVoice = arVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        return maleKeywords.some(keyword => nameLower.includes(keyword));
      });

      if (!selectedVoice) {
        selectedVoice = arVoices.find(v => {
          const nameLower = v.name.toLowerCase();
          return !femaleKeywords.some(keyword => nameLower.includes(keyword));
        });
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else if (arVoices.length > 0) {
        utterance.voice = arVoices[0];
      } else {
        utterance.lang = 'ar-EG';
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis failure:", e);
    }
  };

  // Trigger speak whenever coach response changes
  useEffect(() => {
    if (coachResponse && !loading) {
      speakWithSheikhVoice(coachResponse);
    }
  }, [coachResponse, loading]);
  
  // Local habit analysis states
  const [prayerStreak, setPrayerStreak] = useState<number>(5);
  const [memorizationCount, setMemorizationCount] = useState<number>(0);
  const [donePrayersTodayCount, setDonePrayersTodayCount] = useState<number>(3);
  const [tasbeehToday, setTasbeehToday] = useState<number>(100);
  const [spiritualVigor, setSpiritualVigor] = useState<number>(75); // 0-100 spiritual energy gauge

  // Load actual user habits from local storage
  useEffect(() => {
    // 1. Prayer Streak
    const streakVal = parseInt(localStorage.getItem("prayerStreak") || "5", 10);
    setPrayerStreak(streakVal);

    // 2. Memorization Portions
    try {
      const ports = JSON.parse(localStorage.getItem("memorized_portions") || "[]");
      setMemorizationCount(ports.length);
    } catch (_) {
      setMemorizationCount(2);
    }

    // 3. Worship tracker prayers done today
    try {
      const tracker = JSON.parse(localStorage.getItem("worshipTrackerV2") || "{}");
      const doneCount = Object.values(tracker).filter(Boolean).length;
      if (doneCount > 0) {
        setDonePrayersTodayCount(doneCount);
      }
    } catch (_) {}

    // 4. Tasbeeh progress
    try {
      const widgetTotal = parseInt(localStorage.getItem("arabic_widget_total_dhikr") || "133", 10);
      setTasbeehToday(widgetTotal);
    } catch (_) {}

    // Calculate a dynamic "Spiritual Vigor / مقياس الهمة الإيمانية" Based on streaks and activities
    let vigor = 60; // base score
    vigor += Math.min(streakVal * 5, 25); // streak bonus
    vigor += Math.min(memorizationCount * 8, 15); // memorization bonus
    vigor += Math.min(tasbeehToday / 15, 10); // dhikr bonus
    vigor = Math.min(vigor, 100);
    setSpiritualVigor(vigor);

    // Trigger initial warm greeting
    generateGreeting(streakVal, memorizationCount, tasbeehToday);
  }, []);

  const generateGreeting = (streak: number, memo: number, tasbeeh: number) => {
    let text = `أهلاً بك يا رفيق الدرب في رحاب التزكية النفسية. 👋🌱\n\n`;
    text += `بناءً على تتبع أورادك الحالية:\n`;
    text += `- حافظت على أداء النوافل واستمرت همتك ترفع **سلسلة صلوات لـ ${streak} أيام متواصلة** ماشاء الله!\n`;
    if (memo > 0) {
      text += `- أتممت حفظ وتثبيت **${memo} مقاطع قرآنية** في فؤادك بنجاح.\n`;
    } else {
      text += `- تطلّع لتبدأ أولى خطوات حفظ وتثبيت السور الكريمة لتنعم بالوقار.\n`;
    }
    text += `- لهج لسانك بـ **${tasbeeh} استغفار وتسبيحة** في ميزان حسناتك اليوم.\n\n`;
    text += `لقد رصدت همتك الطيبة وهي بمعدل **عالي ومبشر (${Math.round(streak * 10)}% نمو روحي)**. أنت تسير في الدرب القويم؛ إذا شعرت بفتور أو حاجة لجرعة تدبر مخصصة، فاختر من الصناديق بالأسفل لنقوم بجلسة علاج وموعظة روحي بـالذكاء الاصطناعي.`;
    setCoachResponse(text);
  };

  const handleConsultCoach = async (concernType: string, concernTitle: string) => {
    setLoading(true);
    setActiveConcern(concernType);
    setCoachResponse("");

    const habitContext = `
    User local habits analysis:
    - Prayer streak in days: ${prayerStreak}
    - Quran portions memorized: ${memorizationCount}
    - Tasks done today: ${donePrayersTodayCount} prayers and ${tasbeehToday} recitations
    - Target issue: ${concernTitle} (${concernType})
    `;

    const cleanPrompt = `
    أنت "المرشد والمدرب الروحي الإسلامي الذكي" (Spiritual Coach). هدفك توجيه المسلم ومخاطبته برفق، محبة، وبكلام بليغ خاشع يمس الروح، بهدف تحفيزه وتثبيت عزيمته ومقاومة فتور الهمة.
    يواجه المستخدم حالياً هذه المشكلة بعينها: "${concernTitle}".
    سياق عاداته الإيمانية الحالية في التطبيق التي رصدناها:
    ${habitContext}

    المطلوب منك:
    1. صغ له رسالة ترحيبية تربوية تمس قلبه الحزين برقة، مستشهداً بآية قرآنية رقيقة أو حديث نبوي شريف يطابق حالته.
    2. حلل عاداته بلطف لتثني على نقاط قوته (مثل صموده في سلسلة الصلوات لـ ${prayerStreak} أيام، أو تسابيح اليوم) لإشعاره بأنه ليس بعيداً عن الله.
    3. قدم له "أربعة أفعال إيمانية عملية ويسيرة للتطبيق فوراً" (مثلاً: ركعتين في الصباح، قراءة صفحة واحدة بتدبر، البوح بدعاء سر، الصدقة بكلمة طيبة) لكسر هذا الفتور الحاصل وإعادته لمساره الإيماني بضربات سريعة وبدون مشقة.
    4. اجعل الخطاب باللغة العربية الفصحى البارعة، غنياً بعبارات التفاؤل والرجاء برحمة الباري تبارك وتعالى. تجنب التعقيد اللاهوتي، واكتب بنظام الفقرات المنسقة والنقاط الواضحة.
    `;

    try {
      const response = await fetch("/api/gemini/generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gemini-3.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: cleanPrompt }]
            }
          ],
          config: {
            temperature: 0.75,
            topK: 64
          },
          customApiKey: localStorage.getItem('user_custom_gemini_key') || undefined
        })
      });

      if (!response.ok) {
        throw new Error("API failed");
      }

      const resData = await response.json();
      if (resData && resData.text) {
        setCoachResponse(resData.text);
      } else {
        throw new Error("No response");
      }
    } catch (e) {
      console.warn("Spiritual coach calling Gemini API failed, launching fallback message format gracefully.");
      // Graceful high-quality offline spiritual counselor template builder
      let fallbackText = `أبشر يا أخي الحبيب الخاشع وتفائل بالخير عملاً؛ 🌟\n\n`;
      fallbackText += `وردك الحالي صامد ومبارك (حافظت على سلسلة الصلوات والخشوع لـ ${prayerStreak} أيام متتالية)، وهذا برهان ودليل يبرهن رغبة قلبك الصادقة للتقرب والخضوع لباري الخلق.\n\n`;
      fallbackText += `لعلاج **"${concernTitle}"** المزعجة وفتور الهمة، إليك المنهج الميسر فورياً برحمة الله:\n`;
      fallbackText += `1. **إيقاظ النوايا الصالحة**: ردد الاستغفار 30 مرة لتهيئة التربة القلبية لاستقبال النور والسكينة الإلهية.\n`;
      fallbackText += `2. **المصحف الشاهد**: اقرأ نصف صفحة فقط من المصحف الشريف بتؤدة شديدة وصوتٍ مسموع تطيب فيه مسامع روحك البديعة.\n`;
      fallbackText += `3. **سجدة تذلل بمحبة**: ركعتان خفيفتان للضحى أو قيام الليل تشكو فيهما لربك عجزك بثقة طالباً العون المباشر.\n`;
      fallbackText += `4. **إسعاد شخص محزون**: تطييب خاطر إنسان والابتسام في مواجهة أهلك ليدخل السرور والرحمة لقلبك تارة أخرى.\n\n`;
      fallbackText += `سورة الشرح تذكرك دوماً: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا"، فاستعن بالله المنان ولا تعجز!`;
      setCoachResponse(fallbackText);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDiagnostic = () => {
    generateGreeting(prayerStreak, memorizationCount, tasbeehToday);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#07130F] text-white p-5 pb-28 relative" dir="rtl">
      {/* Top Navigator */}
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={onBack}
          className="p-3 rounded-full bg-emerald-950/40 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-900/30 transition-all flex items-center justify-center"
          id="coach_back_btn"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-bold text-amber-400 font-serif flex items-center gap-1.5">
          <Sparkles size={16} className="text-[#C59F60]" />
          <span>المدرب الروحي الذكي</span>
        </span>
        <div className="w-10"></div>
      </div>

      {/* Hero Display */}
      <div className="p-5 bg-gradient-to-r from-emerald-950 to-emerald-900 rounded-[30px] border border-emerald-800/30 shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] bg-amber-400/20 text-[#E2C392] px-2 py-0.5 rounded-full font-black border border-amber-500/20">تزكية نفسية ذكية</span>
            <h2 className="text-xl font-serif font-black text-amber-100">مرشدك الإيماني المصمم لك</h2>
            <p className="text-xs text-emerald-300">يحلل عاداتك ويقاوم فتور الهمة بنور العلم</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-500/20">
            <Compass className="animate-spin" style={{ animationDuration: "12s" }} size={24} />
          </div>
        </div>

        {/* Real Dynamic Vigor Gauge (الهمة الإيمانية) */}
        <div className="mt-5 space-y-2 bg-[#07130F]/60 p-3 rounded-2xl border border-emerald-900/40">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>📈 رصيد طاقتك القلبية الحالية</span>
            <span className="text-amber-400">{spiritualVigor}% (مبشر ومبارك)</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-l from-emerald-500 via-emerald-400 to-amber-500 rounded-full"
              style={{ width: `${spiritualVigor}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-emerald-400/80 leading-relaxed text-right pt-0.5">
            * يتم الحساب ديناميكياً بدراسة استمرار أدائك المكتوب بالسبحة، خطة التلاوة، السلسلة المتواصلة وأوراد الذكر.
          </p>
        </div>
      </div>

      {/* Habit Metrics List */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-center space-y-1">
          <Flame className="text-amber-500 mx-auto" size={20} />
          <p className="text-[10px] text-slate-400">سلسلة الطهارة والصلوات</p>
          <p className="text-sm font-black font-serif text-slate-100">{prayerStreak} أيام متصلة</p>
        </div>

        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-center space-y-1">
          <BookOpen className="text-emerald-400 mx-auto" size={20} />
          <p className="text-[10px] text-slate-400">سقف حفظ القرآن الكريم</p>
          <p className="text-sm font-black font-serif text-slate-100">{memorizationCount} مقاطع محفوظة</p>
        </div>
      </div>

      {/* AI Diagnostic Output Box */}
      <div className="bg-[#0A1612] rounded-[28px] border border-emerald-800/30 overflow-hidden shadow-lg mb-6">
        <div className="bg-emerald-950/50 p-4 border-b border-emerald-900/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-black text-amber-200">صوت التوجيه الروحي الذكي</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsVoiceActive(prev => !prev)} 
              className={`p-1.5 rounded-xl transition-all border ${
                isVoiceActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-300/30' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-emerald-400'
              }`}
              title={isVoiceActive ? "كتم القراءة الصوتية" : "تفعيل القراءة الصوتية للشيخ"}
            >
              {isVoiceActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
            <button 
              onClick={handleResetDiagnostic}
              className="p-1 px-2.5 text-[10px] bg-emerald-900/40 hover:bg-emerald-900/70 border border-emerald-850 text-emerald-300 rounded-xl transition-all"
              title="إعادة فحص سريع لحالتي اليومية"
            >
              إعادة الفحص
            </button>
          </div>
        </div>

        <div className="p-5 font-sans whitespace-pre-line text-xs leading-relaxed text-slate-200 space-y-3 min-h-[140px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <RefreshCw className="animate-spin text-amber-400" size={28} />
              <p className="text-[11px] text-emerald-400 font-bold">يقوم المرشد الروحي بقراءة صهوة عبادَاتك وصياغة المنهج الميسر لقلبك المكبَّل...</p>
            </div>
          ) : (
            coachResponse
          )}
        </div>
      </div>

      {/* Diagnostic trigger list */}
      <h3 className="text-xs font-black text-[#E2C392] mb-3 pr-1">🛡️ تشخيص فتور الهمة وعقد الإرادة:</h3>
      <p className="text-[10px] text-slate-405 leading-relaxed mb-3">
        انقر على الحالة التي تشعر بها ليتولى نظام التوجيه ذو الذكاء الاصطناعي معالجة فتورك من هدايات الوحي الشريف:
      </p>

      <div className="space-y-2">
        <button
          onClick={() => handleConsultCoach("fatigue", "فتور الهمة وقفر النفس تجاه الصلوات والعبادات")}
          className="w-full p-4 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 active:scale-99 rounded-2xl flex items-center justify-between transition-all group text-right"
          disabled={loading}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🍂</span>
            <div>
              <h4 className="text-xs font-black text-slate-100 group-hover:text-amber-200 transition-colors">علاج الفتور والتهاون بالنوافل والسنن</h4>
              <p className="text-[9px] text-slate-450 leading-relaxed mt-0.5">صعوبة المباشرة أو التكاسل العارض بالأداء.</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => handleConsultCoach("life_noise", "ضغوط الحياة وتشعب مشاغل الدنيا وغياب السكينة")}
          className="w-full p-4 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 active:scale-99 rounded-2xl flex items-center justify-between transition-all group text-right"
          disabled={loading}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💼</span>
            <div>
              <h4 className="text-xs font-black text-slate-100 group-hover:text-amber-200 transition-colors">علاج الغوص في غمار مشاغل الحياة والعمل</h4>
              <p className="text-[9px] text-slate-450 leading-relaxed mt-0.5">ضياع التقدم والورد بسبب الازدحام اليومي المفرط.</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => handleConsultCoach("dry_heart", "قسوة في القلب والابتعاد وأثر الذنوب المعكّرة لصفو النفس")}
          className="w-full p-4 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 active:scale-99 rounded-2xl flex items-center justify-between transition-all group text-right"
          disabled={loading}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🖤</span>
            <div>
              <h4 className="text-xs font-black text-slate-100 group-hover:text-amber-200 transition-colors">علاج قسوة النفس وعكر الذنوب والابتعاد</h4>
              <p className="text-[9px] text-slate-450 leading-relaxed mt-0.5">الشعور بحجاب وبلادة تجاه تلاوة الآيات.</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => handleConsultCoach("quran_struggle", "صعوبة في الحفظ والتفلت السريع للقرآن")}
          className="w-full p-4 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 active:scale-99 rounded-2xl flex items-center justify-between transition-all group text-right"
          disabled={loading}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📖</span>
            <div>
              <h4 className="text-xs font-black text-slate-100 group-hover:text-amber-200 transition-colors">صعوبة التزام الحفظ وتفلت تلاوة السور</h4>
              <p className="text-[9px] text-slate-450 leading-relaxed mt-0.5">علاج صعوبة الثبات لضمان عدم الكسر والهجران.</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

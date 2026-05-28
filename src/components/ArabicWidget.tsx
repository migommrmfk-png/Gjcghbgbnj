import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, Check, Share2, Clipboard, Sun, Moon, Flame, Heart, Play, BookOpen, Clock } from "lucide-react";

interface ArabicWidgetProps {
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
}

export default function ArabicWidget({ onNavigate }: ArabicWidgetProps) {
  const [activeTab, setActiveTab] = useState<"dhikr" | "verse" | "prayers">("dhikr");
  
  // Dhikr custom state
  const dhikrOptions = [
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 33, title: "التسبيح" },
    { text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ", count: 100, title: "الاستغفار" },
    { text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", count: 100, title: "التوحيد" },
    { text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", count: 10, title: "الصلاة على النبي" },
    { text: "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا", count: 33, title: "التحميد" }
  ];
  const [selectedDhikrIndex, setSelectedDhikrIndex] = useState(0);
  const [dhikrCount, setDhikrCount] = useState(0);
  const [totalToday, setTotalToday] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("arabic_widget_total_dhikr") || "0", 10);
    } catch { return 0; }
  });

  const curDhikr = dhikrOptions[selectedDhikrIndex];

  // Refreshes the verse list
  const arabicVerses = [
    {
      text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      surah: "سورة الشرح - الآية 6",
      reflection: "مهما اشتدت الأزمات وزاد الكرب، ثق تماماً بوعود الرحمن القادر على تفريج الهموم بوجوه لم تكن تظنها."
    },
    {
      text: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
      surah: "سورة غافر - الآية 60",
      reflection: "الملكُ يدعوك لسؤاله ورفع شكواك وجبر خاطرك، السجود مساحة من البوح والسكينة لتخفيف وطأة دنيا تنهك القلوب."
    },
    {
      text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      surah: "سورة الرعد - الآية 28",
      reflection: "حين تزدحم الضغوط وتحتد المشاعر المقلقة، اعزم على تسبيح يلم شعث قلبك، فالذكر طمأنينة وبلسم مجرب."
    },
    {
      text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
      surah: "سورة الطلاق - الآية 2-3",
      reflection: "التقوى والمخارج رزق مضمون، التمس التقوى في معاملاتك البسيطة، تجد الفطنة واليسر في أمورك المعقدة."
    },
    {
      text: "فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
      surah: "سورة البقرة - الآية 186",
      reflection: "لا تدَع الصعاب تملي عليك بُعد الإجابة؛ قرب الله أسرع إليك من أنفاسك، فحدثه بكل ما يعتمل في صدرك بيقين تام."
    }
  ];

  const [verseIndex, setVerseIndex] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load and save local state
  useEffect(() => {
    const savedCount = localStorage.getItem(`arabic_widget_count_${selectedDhikrIndex}`);
    if (savedCount) {
      setDhikrCount(parseInt(savedCount, 10));
    } else {
      setDhikrCount(0);
    }
  }, [selectedDhikrIndex]);

  const handleDhikrClick = () => {
    // Increment specific and total
    const nextCount = dhikrCount + 1;
    setDhikrCount(nextCount);
    localStorage.setItem(`arabic_widget_count_${selectedDhikrIndex}`, nextCount.toString());

    const nextTotal = totalToday + 1;
    setTotalToday(nextTotal);
    localStorage.setItem("arabic_widget_total_dhikr", nextTotal.toString());

    // Simple audio click synth
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
  };

  const handleResetDhikr = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDhikrCount(0);
    localStorage.setItem(`arabic_widget_count_${selectedDhikrIndex}`, "0");
  };

  const handleNextVerse = () => {
    setVerseIndex((prev) => (prev + 1) % arabicVerses.length);
    setShowReflection(false);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 5 prayers widget checkoff state
  const [prayersChecked, setPrayersChecked] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem("arabic_widget_prayers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed.data || {};
      }
    } catch {}
    return { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
  });

  const togglePrayer = (id: string) => {
    const updated = { ...prayersChecked, [id]: !prayersChecked[id] };
    setPrayersChecked(updated);
    localStorage.setItem("arabic_widget_prayers", JSON.stringify({
      date: new Date().toDateString(),
      data: updated
    }));
  };

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0e2c22] via-[#091f18] to-[#040e0b] border border-emerald-500/20 shadow-2xl p-6 text-white"
    >
      {/* Visual Pattern Overlays */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Widget Header Badge */}
      <div className="flex justify-between items-center mb-5 relative z-10 border-b border-emerald-500/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 font-serif tracking-wider">ويدجت اليقين المطور</h3>
            <p className="text-[10px] text-emerald-300/60 font-medium">طاعتك اليومية بلمسات تفاعلية</p>
          </div>
        </div>
        
        {/* Sparkline stats */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <Flame size={12} className="text-amber-500 animate-pulse" />
          <span className="text-[10px] font-bold text-amber-200">{totalToday} ذِكر</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-emerald-950/40 p-1 rounded-2xl border border-emerald-500/10 mb-5 relative z-10">
        <button
          onClick={() => setActiveTab("dhikr")}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all relative ${
            activeTab === "dhikr"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md border border-emerald-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          الذِّكر اليدوي
        </button>
        <button
          onClick={() => setActiveTab("verse")}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all relative ${
            activeTab === "verse"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md border border-emerald-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          آية اليوم والتدبر
        </button>
        <button
          onClick={() => setActiveTab("prayers")}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
            activeTab === "prayers"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md border border-emerald-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          سجل المهام
        </button>
      </div>

      {/* Tab Contents Content */}
      <AnimatePresence mode="wait">
        {activeTab === "dhikr" && (
          <motion.div
            key="dhikr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            {/* Dhikr Selector Badges */}
            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none justify-start">
              {dhikrOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDhikrIndex(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    selectedDhikrIndex === idx
                      ? "bg-amber-500 text-amber-950 font-black shadow-sm"
                      : "bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/40"
                  }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>

            {/* Main Clickable Area */}
            <div 
              onClick={handleDhikrClick}
              className="bg-emerald-950/20 border border-emerald-500/10 rounded-[24px] p-5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-emerald-950/40 active:scale-[0.98] transition-all relative group overflow-hidden"
            >
              {/* Floating Ripple Decoration */}
              <div className="absolute inset-0 bg-emerald-500/5 group-hover:scale-110 transition-transform duration-500 rounded-[24px]"></div>

              <div className="text-center relative z-10 px-2">
                <p className="text-xs text-emerald-300 font-medium mb-1.5">الذكر الحالي</p>
                <h4 className="text-base font-bold text-center leading-relaxed text-amber-100 min-h-[48px] flex items-center justify-center font-serif">
                  "{curDhikr.text}"
                </h4>
              </div>

              {/* Progress Circle & Counter */}
              <div className="relative w-28 h-28 flex items-center justify-center z-10">
                <svg className="w-full h-full transform -rotate-95">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="6"
                    stroke="#051c14"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="7"
                    stroke={dhikrCount >= curDhikr.count ? "#f59e0b" : "#10b981"}
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - Math.min(dhikrCount / curDhikr.count, 1))}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                {/* Embedded count indicator */}
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span className="text-3xl font-black font-mono text-white tracking-widest">{dhikrCount}</span>
                  <span className="text-[9px] font-bold text-emerald-400">الهدف: {curDhikr.count}</span>
                </div>
              </div>

              {/* Tips & Bottom Controls */}
              <div className="w-full flex justify-between items-center relative z-10 border-t border-emerald-500/5 pt-3">
                <span className="text-[10px] text-emerald-400/80 font-semibold">اضغط على البطاقة لتعداد الذكر ✨</span>
                <button
                  onClick={handleResetDhikr}
                  className="p-1 px-3 text-[10px] bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/20 font-bold transition-all"
                  title="تصفير العداد"
                >
                  تصفير
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Verses */}
        {activeTab === "verse" && (
          <motion.div
            key="verse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            <div className="bg-[#051410] rounded-2xl p-5 border border-emerald-500/10 space-y-4">
              <div className="flex justify-between items-center text-xs text-emerald-400 font-semibold">
                <div className="flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>آية معينة وهداية</span>
                </div>
                <button
                  onClick={handleNextVerse}
                  className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25 text-emerald-300 hover:text-white hover:bg-emerald-500/20 active:scale-95 transition-all text-[11px] font-bold"
                >
                  <RefreshCw size={12} className="animate-spin-slow" />
                  <span>آية أخرى</span>
                </button>
              </div>

              <div className="text-center py-2">
                <p className="text-lg font-bold font-serif leading-loose text-amber-50">
                  {arabicVerses[verseIndex].text}
                </p>
                <span className="text-[10px] font-bold text-emerald-400/70 block mt-2">
                  — {arabicVerses[verseIndex].surah}
                </span>
              </div>

              {/* Trigger Button Reflection */}
              <div className="border-t border-emerald-500/5 pt-3 flex justify-between items-center">
                <button
                  onClick={() => setShowReflection(!showReflection)}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
                >
                  <span>{showReflection ? "إخفاء التدبر والغرس" : "تدبّر وفائدة من الآية"}</span>
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCopyText(`${arabicVerses[verseIndex].text}\n\n[${arabicVerses[verseIndex].surah}]`)}
                    className="p-1.5 bg-emerald-950/60 rounded-lg text-emerald-300 border border-emerald-500/10 hover:text-white transition-all"
                    title="نسخ الآية"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Clipboard size={14} />}
                  </button>
                </div>
              </div>

              {/* Reflection Expandable Details */}
              <AnimatePresence>
                {showReflection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-emerald-950/30 rounded-xl p-3 border border-emerald-500/5 text-amber-100/90 text-xs leading-relaxed font-serif"
                  >
                    <div className="font-extrabold text-amber-300 mb-1">أثر الآية لليوم:</div>
                    {arabicVerses[verseIndex].reflection}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Habits / Checklist and quick prayer task widget */}
        {activeTab === "prayers" && (
          <motion.div
            key="prayers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-emerald-300">سجل إتمام الفرائض لليوم</h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {Object.values(prayersChecked).filter(Boolean).length} من 5 مكتمل
                </p>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: "fajr", name: "الفجر" },
                  { id: "dhuhr", name: "الظهر" },
                  { id: "asr", name: "العصر" },
                  { id: "maghrib", name: "المغرب" },
                  { id: "isha", name: "العشاء" }
                ].map((p) => {
                  const isDone = prayersChecked[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePrayer(p.id)}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${
                        isDone
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-emerald-400 shadow-lg shadow-emerald-500/10"
                          : "bg-emerald-950/40 border-emerald-500/10 text-emerald-300/60 hover:border-emerald-500/30"
                      }`}
                    >
                      <span className="text-[10px] font-bold mb-1.5">{p.name}</span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isDone 
                          ? "bg-white border-white text-emerald-700" 
                          : "border-emerald-500/30"
                      }`}>
                        {isDone && <Check size={11} strokeWidth={4} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Motivational message when they pray */}
              <p className="text-[10px] text-emerald-400 bg-emerald-500/5 p-2 rounded-xl text-center border border-emerald-500/15">
                {Object.values(prayersChecked).filter(Boolean).length === 5 
                  ? "ما شاء الله! تمت المحافظة على كافة الصلوات الخمس اليوم في أوقاتها. ثبتك الله برحمته 🕋"
                  : "المحافظة على الصلوات في أوقاتها أولى الخطوات نحو الرضا والسعادة الدنيوية."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

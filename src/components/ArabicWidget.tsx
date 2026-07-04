import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, RefreshCw, Check, Share2, Clipboard, Sun, Moon, Flame, 
  Heart, BookOpen, Clock, Plus, Minus, Trash2, Volume2, VolumeX, 
  Smile, Trophy, TrendingUp, Palette, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import toast from "react-hot-toast";

interface ArabicWidgetProps {
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
}

interface CustomDhikr {
  id: string;
  text: string;
  count: number;
  title: string;
}

export default function ArabicWidget({ onNavigate }: ArabicWidgetProps) {
  const [activeTab, setActiveTab] = useState<"dhikr" | "verse" | "prayers">("dhikr");
  
  // Custom design themes (inter-widget state only)
  // "روضة" (Shades of Emerald/Gold), "عقيق" (Maroon/Amber), "كحلي" (Navy/Teal), "محراب" (Charcoal/Champagne)
  const [widgetTheme, setWidgetTheme] = useState<"rawdah" | "aqeeq" | "indigo" | "mihrab">(() => {
    return (localStorage.getItem("arabic_widget_theme") as any) || "rawdah";
  });

  // Sound toggle state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("arabic_widget_sound_enabled") !== "false";
  });

  // Share/load eastern numerals style
  const [useEasternNumerals, setUseEasternNumerals] = useState<boolean>(() => {
    return localStorage.getItem("use_eastern_numerals") === "true";
  });

  // Dhikr states
  const defaultDhikrOptions: CustomDhikr[] = [
    { id: "1", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 33, title: "التسبيح" },
    { id: "2", text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ", count: 100, title: "الاستغفار" },
    { id: "3", text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", count: 100, title: "التوحيد" },
    { id: "4", text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", count: 10, title: "الصلاة على النبي" },
    { id: "5", text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ", count: 33, title: "الحوقلة" },
  ];

  const [dhikrList, setDhikrList] = useState<CustomDhikr[]>(() => {
    try {
      const saved = localStorage.getItem("arabic_widget_custom_dhikr_list");
      return saved ? JSON.parse(saved) : defaultDhikrOptions;
    } catch {
      return defaultDhikrOptions;
    }
  });

  const [selectedDhikrId, setSelectedDhikrId] = useState<string>(() => {
    return localStorage.getItem("arabic_widget_selected_dhikr_id") || "1";
  });

  const [dhikrCount, setDhikrCount] = useState<number>(0);
  const [totalToday, setTotalToday] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("arabic_widget_total_dhikr") || "0", 10);
    } catch { return 0; }
  });

  // New custom dhikr creation state
  const [isAddingDhikr, setIsAddingDhikr] = useState(false);
  const [newDhikrText, setNewDhikrText] = useState("");
  const [newDhikrTitle, setNewDhikrTitle] = useState("");
  const [newDhikrTarget, setNewDhikrTarget] = useState(33);

  const curDhikr = dhikrList.find(d => d.id === selectedDhikrId) || dhikrList[0] || defaultDhikrOptions[0];

  // Load and save local state for current count
  useEffect(() => {
    const savedCount = localStorage.getItem(`arabic_widget_count_v2_${curDhikr.id}`);
    if (savedCount) {
      setDhikrCount(parseInt(savedCount, 10));
    } else {
      setDhikrCount(0);
    }
    localStorage.setItem("arabic_widget_selected_dhikr_id", curDhikr.id);
  }, [selectedDhikrId, curDhikr.id]);

  // Save custom lists
  const saveCustomDhikrList = (list: CustomDhikr[]) => {
    setDhikrList(list);
    localStorage.setItem("arabic_widget_custom_dhikr_list", JSON.stringify(list));
  };

  const handleCreateDhikr = () => {
    if (!newDhikrText.trim() || !newDhikrTitle.trim()) {
      toast.error("يرجى ملء جميع الخانات لكتابة ذكر جديد ✍️");
      return;
    }
    const newDhikr: CustomDhikr = {
      id: Date.now().toString(),
      text: newDhikrText.trim(),
      title: newDhikrTitle.trim(),
      count: newDhikrTarget <= 0 ? 33 : newDhikrTarget
    };
    const updated = [...dhikrList, newDhikr];
    saveCustomDhikrList(updated);
    setSelectedDhikrId(newDhikr.id);
    setIsAddingDhikr(false);
    setNewDhikrText("");
    setNewDhikrTitle("");
    setNewDhikrTarget(33);
    toast.success("تمت إضافة الذكر المخصص لقائمتك اليومية بنجاح 🌱");
  };

  const handleDeleteDhikr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (defaultDhikrOptions.some(d => d.id === id)) {
      toast.error("لا يمكن حذف الأذكار الكلاسيكية الأساسية 🔒");
      return;
    }
    const filtered = dhikrList.filter(d => d.id !== id);
    saveCustomDhikrList(filtered);
    if (selectedDhikrId === id) {
      setSelectedDhikrId(defaultDhikrOptions[0].id);
    }
    localStorage.removeItem(`arabic_widget_count_v2_${id}`);
    toast.success("تمت إزالة الذكر الخاص من قائمتك.");
  };

  // Sound synthesizer for counts
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Multi-tonal soft ceramic clink sound
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6 highest chime
      gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
  };

  const handleDhikrClick = () => {
    const nextCount = dhikrCount + 1;
    setDhikrCount(nextCount);
    localStorage.setItem(`arabic_widget_count_v2_${curDhikr.id}`, nextCount.toString());

    const nextTotal = totalToday + 1;
    setTotalToday(nextTotal);
    localStorage.setItem("arabic_widget_total_dhikr", nextTotal.toString());
    
    playClickSound();

    if (nextCount === curDhikr.count) {
      toast.success(`أحسنت! أتممت الورد المقترح لـ ${curDhikr.title} 🎉`, {
        icon: '🕋',
        style: { borderRadius: '16px', background: '#064e3b', color: '#fff' }
      });
    }
  };

  const handleResetDhikr = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDhikrCount(0);
    localStorage.setItem(`arabic_widget_count_v2_${curDhikr.id}`, "0");
    toast.success("تم تصفير عداد الذكر الحالي.");
  };

  // Verses state by feelings (Heart Therapy - طب القلوب الإلهي)
  type FeelingType = "peace" | "grief" | "anxiety" | "apathy" | "urgency";
  
  const feelingCategories: Record<FeelingType, { title: string; icon: string; verse: string; surah: string; reflection: string }> = {
    peace: {
      title: "طمأنينة وسكينة",
      icon: "🧘",
      verse: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      surah: "سورة الرعد - الآية 28",
      reflection: "الذكر هنا ليس مجرد نطق آلي عابر، بل هو تفويض كامل للأمور واستحضار لعظمة المولى؛ فتذوب معه هواجس الخوف، وتعود النفس لموطن رشاقتها واطمئنانها."
    },
    grief: {
      title: "ضيق وحزن",
      icon: "😔",
      verse: "وَلَقَدْ نَعْلَمُ أَنَّكَ يَضِيقُ صَدْرُكَ بِمَا يَقُولُونَ * فَسَبِّحْ بِحَمْدِ رَبِّكَ وَكُن مِّنَ السَّاجِدِينَ",
      surah: "سورة الحجر - الآيات 97-98",
      reflection: "حين تخنقك الكلمات وضغوط الحياة، يعطيك الله مفتاح الصدر المنشرح: الحركة والانحناء في محراب العبادة. تنفيس الهموم تضمنته خطى التسبيح ودموع الساجدين الصادقة."
    },
    anxiety: {
      title: "قلق وتشتت",
      icon: "😰",
      verse: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      surah: "سورة الشرح - الآيات 5-6",
      reflection: "التكرار الإعلاني ليس تأكيداً للمستقبل فحسب، بل هو قانون كوني حتمي: اليسر مولود في بطن العسر وفي زمن واحد معه. لا ترقب نهاية الظلمة بل ترقّب تبلور الفرج الخفي بداخلها."
    },
    apathy: {
      title: "ضعف وفتور",
      icon: "💪",
      verse: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ",
      surah: "سورة البقرة - الآية 286",
      reflection: "أنت لست مطالباً بقدرات الأبطال الأسطورية بل بوُسع رُوحك البسيطة. يرى الله محاولاتك الصغيرة وهفواتك المتعبة ويجبر نقصك. تقبل حدودك البدنية والتقط قوتك بلطف."
    },
    urgency: {
      title: "حاجة وإلحاح",
      icon: "🤲",
      verse: "أَمَّن يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ السُّوءَ وَيَجْعَلُكُمْ خُلَفَاءَ الْأَرْضِ",
      surah: "سورة النمل - الآية 62",
      reflection: "الوصول لحالة المضطر الذي انسدّت أمامه الطرق المادية هو أفضل شرط روحي لاستحقاق الإجابة الفورية. ضعفك المحض هو الباب الذي يدخلك إلى بحار غِنى الله المطلق."
    }
  };

  const [activeFeeling, setActiveFeeling] = useState<FeelingType>("peace");
  const [showReflection, setShowReflection] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const curFeelingData = feelingCategories[activeFeeling];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("تم نسخ الآية المباركة والتدبير لمشاركتها والوعي بها 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  // Expanded Ritual Checklist with 3 Categories
  const [obligationsChecked, setObligationsChecked] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem("arabic_widget_obligations");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed.data || {};
      }
    } catch {}
    return { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
  });

  const [sunnahChecked, setSunnahChecked] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem("arabic_widget_sunnah");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed.data || {};
      }
    } catch {}
    return { duha: false, rawatib: false, witr: false, qiyam: false };
  });

  const [goodDeedsChecked, setGoodDeedsChecked] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem("arabic_widget_gooddeeds");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed.data || {};
      }
    } catch {}
    return { quranPage: false, morningAzkar: false, eveningAzkar: false, sleepAzkar: false, charity: false };
  });

  const [checklistExpandedSection, setChecklistExpandedSection] = useState<"obligations" | "sunnah" | "deeds">("obligations");

  const saveChecklistState = (type: "ob" | "sn" | "gd", val: any) => {
    const today = new Date().toDateString();
    if (type === "ob") {
      setObligationsChecked(val);
      localStorage.setItem("arabic_widget_obligations", JSON.stringify({ date: today, data: val }));
    } else if (type === "sn") {
      setSunnahChecked(val);
      localStorage.setItem("arabic_widget_sunnah", JSON.stringify({ date: today, data: val }));
    } else if (type === "gd") {
      setGoodDeedsChecked(val);
      localStorage.setItem("arabic_widget_gooddeeds", JSON.stringify({ date: today, data: val }));
    }
  };

  const toggleObligation = (id: string) => {
    const updated = { ...obligationsChecked, [id]: !obligationsChecked[id] };
    saveChecklistState("ob", updated);
  };

  const toggleSunnah = (id: string) => {
    const updated = { ...sunnahChecked, [id]: !sunnahChecked[id] };
    saveChecklistState("sn", updated);
  };

  const toggleGoodDeed = (id: string) => {
    const updated = { ...goodDeedsChecked, [id]: !goodDeedsChecked[id] };
    saveChecklistState("gd", updated);
  };

  // Calculate dynamic "Spiritual Energy Meter" (0 to 14 total checked deeds)
  const totalTasks = 5 + 4 + 5; // obligations (5) + sunnah (4) + deeds (5) = 14 total tasks
  const completedTasksCount = 
    Object.values(obligationsChecked).filter(Boolean).length +
    Object.values(sunnahChecked).filter(Boolean).length +
    Object.values(goodDeedsChecked).filter(Boolean).length;

  const progressPercentage = Math.round((completedTasksCount / totalTasks) * 100);

  // Dynamic Spiritual Titles/Ranks
  const getSpiritualSpur = (percentage: number) => {
    if (percentage === 100) return { title: "مُحسِن رباني سابق بالخيرات 👑", quote: "هنيئاً لك! أتممت ميثاق الهمّة المكتمل اليوم بيقين." };
    if (percentage >= 70) return { title: "صاحب همّة وعزيمة عالية ✨", quote: "طوبي لقلبك؛ قطعت شوطاً طيباً للارتقاء في مدارج السالكين." };
    if (percentage >= 40) return { title: "مُقتَصِد دؤوب في الطاعة 🌙", quote: "خطى مباركة مستديمة؛ واصل السير خطوة بخطوة للكمال الإيماني." };
    if (percentage > 0) return { title: "مَسْتفتِح همّته الإيمانية 🌱", quote: "بداية الغيث قطرة؛ استعن بالله والتقط طاعة أخرى لتزدان رُوحك." };
    return { title: "بانتظار غرسك اليوم المبارك 🕊️", quote: "اليوم فرصة عظيمة لكتابة ميثاق رضا جديد؛ ابدأ بصلاتك الحالية." };
  };

  // Handle Widget Local Themes Styling Mapping
  const themeStyles = {
    rawdah: {
      from: "from-[#0a231b] via-[#051410] to-[#020807]",
      border: "border-emerald-500/20",
      accentHex: "#10b981",
      glowHex: "#059669",
      goldHex: "#C59F60"
    },
    aqeeq: {
      from: "from-[#391010] via-[#1a0707] to-[#080202]",
      border: "border-amber-700/30",
      accentHex: "#f59e0b",
      glowHex: "#b45309",
      goldHex: "#e0ad36"
    },
    indigo: {
      from: "from-[#0a1a30] via-[#050d1a] to-[#010307]",
      border: "border-blue-500/20",
      accentHex: "#06b6d4",
      glowHex: "#0891b2",
      goldHex: "#38bdf8"
    },
    mihrab: {
      from: "from-[#1c1c1a] via-[#0f100e] to-[#050505]",
      border: "border-[#e2c392]/20",
      accentHex: "#c59f60",
      glowHex: "#8f6929",
      goldHex: "#f5e3c3"
    }
  };

  const selectedStyle = themeStyles[widgetTheme];

  const changeWidgetTheme = () => {
    const keys: Array<keyof typeof themeStyles> = ["rawdah", "aqeeq", "indigo", "mihrab"];
    const curIdx = keys.indexOf(widgetTheme);
    const nextIdx = (curIdx + 1) % keys.length;
    const nextTheme = keys[nextIdx];
    setWidgetTheme(nextTheme);
    localStorage.setItem("arabic_widget_theme", nextTheme);
    toast.success("تم تغيير المظهر الخاص بالويدجت 🎨");
  };

  // Eastern Arabic numerals converters if useEasternNumerals is enabled
  const formatArabicNum = (n: number | string): string => {
    if (!useEasternNumerals) return n.toString();
    const easternDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return n.toString().replace(/\d/g, (digit) => easternDigits[parseInt(digit)]);
  };

  // Glowing tasbeeh beads rendering calculations (cycle of up to 11 visual bead components)
  const renderBeadsRepresentation = () => {
    const beadCount = 11;
    const activeBeadIndex = (dhikrCount - 1 + curDhikr.count * 10) % beadCount;
    return (
      <div className="flex gap-2.5 justify-center py-2 relative z-10 select-none">
        {Array.from({ length: beadCount }).map((_, i) => {
          const isActive = dhikrCount > 0 && i === activeBeadIndex;
          const isPassed = dhikrCount > 0 && (i < activeBeadIndex || (activeBeadIndex === beadCount - 1 && i === activeBeadIndex));
          return (
            <motion.div
              key={i}
              animate={{ 
                scale: isActive ? 1.4 : isPassed ? 1.05 : 0.85,
                background: isActive 
                  ? `${selectedStyle.goldHex}` 
                  : isPassed 
                    ? `${selectedStyle.accentHex}` 
                    : "#1e293b",
                boxShadow: isActive 
                  ? `0 0 14px ${selectedStyle.goldHex}80` 
                  : "none"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-3.5 h-3.5 rounded-full border border-white/10"
              style={{
                background: "#1e293b"
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${selectedStyle.from} border ${selectedStyle.border} shadow-2xl p-6 text-white text-right`}
    >
      {/* Visual Pattern Overlays */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Row */}
      <div className="flex justify-between items-center mb-5 relative z-10 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8.5 h-8.5 rounded-2xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/10 shadow-inner">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div className="text-right">
            <h3 className="text-xs font-serif font-black text-amber-200 tracking-wider flex items-center gap-1.5">
              <span>ويدجت اليقين المطور</span>
              <span className="text-[9px] bg-amber-900/40 border border-amber-500/20 text-amber-300 font-sans font-bold px-1.5 py-0.5 rounded-full">v3.5 PRO</span>
            </h3>
            <p className="text-[10px] text-slate-300/80 font-serif">منظومة الرضا والورد اليومي الذكي الخاص بك</p>
          </div>
        </div>
        
        {/* Sparkline & Quick Config Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={changeWidgetTheme}
            className="p-1 px-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs active:scale-95 transition-all text-slate-300"
            title="تعديل المظهر"
          >
            <Palette size={13} className="inline ml-1" />
            <span className="text-[10px] font-bold">المظهر</span>
          </button>

          <button
            onClick={() => {
              const prev = soundEnabled;
              setSoundEnabled(!prev);
              localStorage.setItem("arabic_widget_sound_enabled", (!prev).toString());
              toast.success(!prev ? "تم تفعيل صوت نقرات التسبيح 🔊" : "تم كتم الصوت 🔇");
            }}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 active:scale-95"
            title={soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>
      </div>

      {/* Spiritual Energy Dynamic Meter Widget Box */}
      <div className="mb-4 bg-white/5 rounded-2xl p-3 border border-white/5 relative overflow-hidden flex justify-between items-center gap-3">
        <div className="flex-1">
          <p className="text-[10px] text-slate-400 font-serif leading-none">مؤشر طاقة الروح لليوم:</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-white/10 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-[#e2c392]" 
                style={{ width: `${progressPercentage}%` }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
            <span className="text-xs font-mono font-black text-amber-200">{formatArabicNum(progressPercentage)}%</span>
          </div>
          <p className="text-[9px] text-slate-300 mt-1.5 leading-tight font-serif italic truncate max-w-[210px]">
            "{getSpiritualSpur(progressPercentage).quote}"
          </p>
        </div>
        
        <div className="bg-amber-400/10 p-2 rounded-xl border border-amber-400/20 text-center min-w-[85px]">
          <span className="text-[9px] font-sans font-black text-amber-400 block mb-0.5">مقامك لليوم</span>
          <span className="text-[10px] font-bold text-amber-100 block truncate">{completedTasksCount >= 10 ? "سابَق بالخيرات" : "مقتصد دؤوب"}</span>
        </div>
      </div>

      {/* Tab Switcher Selector Grid */}
      <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 mb-5 relative z-10">
        <button
          onClick={() => setActiveTab("dhikr")}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all relative font-serif ${
            activeTab === "dhikr"
              ? "bg-gradient-to-r from-amber-500 to-amber-700 text-amber-950 shadow-md border border-amber-400/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          التلاوات والذكر 📿
        </button>
        <button
          onClick={() => setActiveTab("verse")}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all relative font-serif ${
            activeTab === "verse"
              ? "bg-gradient-to-r from-amber-500 to-amber-700 text-amber-950 shadow-md border border-amber-400/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          طب القلوب 🕊️
        </button>
        <button
          onClick={() => setActiveTab("prayers")}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all font-serif ${
            activeTab === "prayers"
              ? "bg-gradient-to-r from-amber-500 to-amber-700 text-amber-950 shadow-md border border-amber-400/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          الورد والمهام 📜
        </button>
      </div>

      {/* Tab Contents Main Display */}
      <AnimatePresence mode="wait">
        
        {/* Tab 1: Interactive Digitizing Tasbeeh */}
        {activeTab === "dhikr" && (
          <motion.div
            key="dhikr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            {/* Custom List of Presets & Added Custom Dhikr */}
            <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none justify-start relative">
              {dhikrList.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDhikrId(opt.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                    selectedDhikrId === opt.id
                      ? "bg-amber-400 text-amber-950 font-extrabold shadow-sm"
                      : "bg-[#05110B] text-slate-300 hover:bg-white/5 border border-white/5"
                  }`}
                >
                  <span>{opt.title}</span>
                  {!defaultDhikrOptions.some(d => d.id === opt.id) && (
                    <span 
                      onClick={(e) => handleDeleteDhikr(opt.id, e)}
                      className="text-red-600 hover:text-red-400 font-extrabold p-0.5 text-[8px]"
                      title="حذف الذكر"
                    >
                      ✕
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setIsAddingDhikr(!isAddingDhikr)}
                className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/20 text-emerald-300 hover:text-white transition-all"
              >
                + إضافة ذكر خاص ✍️
              </button>
            </div>

            {/* Expander to Input custom dhikr */}
            {isAddingDhikr && (
              <div className="bg-[#05110b] border border-white/5 rounded-2xl p-4 text-right space-y-3">
                <h4 className="text-xs font-bold text-amber-300 font-serif">كتابة ذكر مخصص جديد لقائمتك التفاعلية</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">الاسم الدلالي للذكر:</label>
                    <input
                      type="text"
                      value={newDhikrTitle}
                      onChange={(e) => setNewDhikrTitle(e.target.value)}
                      placeholder="مثال: الحسبنة والاستغفار"
                      className="w-full bg-[#1e293b]/30 text-[#FEEDCE] rounded-xl px-2.5 py-1.5 text-xs text-right border border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">العدد المستهدف (رقم):</label>
                    <input
                      type="number"
                      value={newDhikrTarget}
                      onChange={(e) => setNewDhikrTarget(parseInt(e.target.value, 10))}
                      placeholder="100"
                      className="w-full bg-[#1e293b]/30 text-[#FEEDCE] rounded-xl px-2.5 py-1.5 text-xs text-right border border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 block mb-1">صيغة ونصف الذكر الشريف بالتشكيل:</label>
                  <input
                    type="text"
                    value={newDhikrText}
                    onChange={(e) => setNewDhikrText(e.target.value)}
                    placeholder="مثال: حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"
                    className="w-full bg-[#1e293b]/30 text-[#FEEDCE] rounded-xl px-3 py-2 text-xs text-right border border-white/10 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingDhikr(false)}
                    className="text-[10px] text-slate-400 hover:underline px-2"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleCreateDhikr}
                    className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-3 py-1 rounded-xl text-[10px]"
                  >
                    حفظ في قائمة الأوراد
                  </button>
                </div>
              </div>
            )}

            {/* Visual Tactile Beads Progress Chain */}
            {renderBeadsRepresentation()}

            {/* Clickable Digital Sanctuary Deck */}
            <div 
              onClick={handleDhikrClick}
              className="bg-white/5 border border-white/5 rounded-[28px] p-5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all relative group overflow-hidden"
            >
              {/* Highlight Ripple overlay */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px]"></div>

              <div className="text-center relative z-10 w-full px-2">
                <p className="text-[10px] text-amber-300 font-serif mb-1 uppercase tracking-wider">الورد والذكر النشط الآن</p>
                <h4 className="text-base font-serif font-bold text-center leading-relaxed text-[#FEEDCE] min-h-[48px] flex items-center justify-center">
                  "{curDhikr.text}"
                </h4>
              </div>

              {/* Glowing Interactive Circle */}
              <div className="relative w-28 h-28 flex items-center justify-center z-10">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="4"
                    stroke="rgba(255,255,255,0.04)"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="5"
                    stroke={dhikrCount >= curDhikr.count ? `${selectedStyle.goldHex}` : `${selectedStyle.accentHex}`}
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - Math.min(dhikrCount / curDhikr.count, 1))}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                {/* Numeric center overlay */}
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span className="text-3xl font-black font-mono tracking-wider">{formatArabicNum(dhikrCount)}</span>
                  <span className="text-[9px] font-bold text-slate-300 font-serif">الهدف: {formatArabicNum(curDhikr.count)}</span>
                </div>
              </div>

              {/* Click instruction bar */}
              <div className="w-full flex justify-between items-center relative z-10 border-t border-white/5 pt-3">
                <span className="text-[9px] text-[#FEEDCE]/70 font-bold animate-pulse">✨ أنقر على كامل مساحة البطاقة لتعداد الورد لليوم</span>
                <button
                  onClick={handleResetDhikr}
                  className="p-1 px-3 text-[10px] bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 border border-red-500/15 font-bold transition-all ms-2"
                  title="تصفير العداد"
                >
                  تصفير
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Heart Therapy Verse Healing */}
        {activeTab === "verse" && (
          <motion.div
            key="verse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            <div className="bg-[#05110B] rounded-3xl p-5 border border-white/5 space-y-4">
              
              {/* Feel / Emotion buttons grid */}
              <div>
                <span className="text-[10px] text-slate-400 font-serif block mb-2">كيف تجد قلبك ووجدانك الساعة الحالية؟ 🕊️</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.keys(feelingCategories) as FeelingType[]).map((feel) => {
                    const fData = feelingCategories[feel];
                    const isActive = feel === activeFeeling;
                    return (
                      <button
                        key={feel}
                        onClick={() => {
                          setActiveFeeling(feel);
                          setShowReflection(true);
                        }}
                        className={`py-2 rounded-xl flex flex-col items-center gap-1.5 border transition-all ${
                          isActive
                            ? "bg-amber-400 text-[#05110B] border-amber-400 font-black shadow-lg"
                            : "bg-white/5 border-white/5 text-slate-300 hover:border-white/10"
                        }`}
                      >
                        <span className="text-sm">{fData.icon}</span>
                        <span className="text-[8px] font-bold tracking-tight text-center truncate w-full px-1">{fData.title.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Treated Quranic and deep philosophical Reflection Card */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden text-center space-y-3">
                <div className="flex justify-between items-center text-[10px] text-amber-300 font-serif">
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} />
                    <span>الدواء الإلهي المناسب لـ {curFeelingData.title}</span>
                  </span>
                  
                  <button 
                    onClick={() => handleCopyText(`${curFeelingData.verse}\n\n[${curFeelingData.surah}]\n\nالتدبر: ${curFeelingData.reflection}\n\nعبر ويدجت اليقين المطور 📜`)}
                    className="p-1.5 bg-white/5 rounded-lg text-slate-300 border border-white/5 hover:text-white transition-all scale-95"
                    title="نسخ ومشاركة"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Clipboard size={12} />}
                  </button>
                </div>

                <div className="py-2">
                  <p className="text-lg font-bold font-serif leading-loose text-[#FEEDCE]">
                    "{curFeelingData.verse}"
                  </p>
                  <span className="text-[10px] font-serif text-[#C59F60] block mt-1">
                    {curFeelingData.surah}
                  </span>
                </div>

                {/* Substantive psychiatric/Islamic reflection paragraph */}
                {showReflection && (
                  <div className="border-t border-white/5 pt-3 text-right">
                    <span className="text-[10px] font-sans font-black text-amber-300 block mb-1">الوقائع والتدبر الوجداني:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-serif">
                      {curFeelingData.reflection}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Detailed Multi-ritual Checklist */}
        {activeTab === "prayers" && (
          <motion.div
            key="prayers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            <div className="bg-[#05110B] border border-white/5 rounded-3xl p-5 space-y-4">
              
              {/* Internal Category Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[10px] font-bold font-serif">
                <button
                  onClick={() => setChecklistExpandedSection("obligations")}
                  className={`py-1.5 text-center rounded-lg transition-all ${
                    checklistExpandedSection === "obligations"
                      ? "bg-amber-400 text-[#05110B]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  الفرائض المكتوبة ({formatArabicNum(Object.values(obligationsChecked).filter(Boolean).length)}/٥)
                </button>
                <button
                  onClick={() => setChecklistExpandedSection("sunnah")}
                  className={`py-1.5 text-center rounded-lg transition-all ${
                    checklistExpandedSection === "sunnah"
                      ? "bg-amber-400 text-[#05110B]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  السنن والرواتب ({formatArabicNum(Object.values(sunnahChecked).filter(Boolean).length)}/٤)
                </button>
                <button
                  onClick={() => setChecklistExpandedSection("deeds")}
                  className={`py-1.5 text-center rounded-lg transition-all ${
                    checklistExpandedSection === "deeds"
                      ? "bg-amber-400 text-[#05110B]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  صالح الطاعات ({formatArabicNum(Object.values(goodDeedsChecked).filter(Boolean).length)}/٥)
                </button>
              </div>

              {/* 1. Obligations list category */}
              {checklistExpandedSection === "obligations" && (
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: "fajr", name: "الفجر", reward: "نور وحفظ" },
                    { id: "dhuhr", name: "الظهر", reward: "بركة السعي" },
                    { id: "asr", name: "العصر", reward: "الوسطى العظمى" },
                    { id: "maghrib", name: "المغرب", reward: "سكينة الأهل" },
                    { id: "isha", name: "العشاء", reward: "ذمة الرحمن" }
                  ].map((p) => {
                    const isDone = obligationsChecked[p.id];
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleObligation(p.id)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all ${
                          isDone
                            ? "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950 border-amber-400 shadow-md"
                            : "bg-white/5 border-white/5 text-slate-300 hover:border-white/10"
                        }`}
                      >
                        <span className="text-[10px] font-bold font-serif mb-1">{p.name}</span>
                        <span className={`text-[7px] ${isDone ? "text-amber-950" : "text-slate-400"} mb-1.5`}>{p.reward}</span>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                          isDone 
                            ? "bg-amber-950 border-amber-950 text-amber-300" 
                            : "border-white/20"
                        }`}>
                          {isDone && <Check size={8} strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Sunan & Supererogatory Checkboxes */}
              {checklistExpandedSection === "sunnah" && (
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "duha", name: "الضحى", x: "صدقة الجوارح" },
                    { id: "rawatib", name: "الرواتب", x: "بيت في الجنة" },
                    { id: "witr", name: "الوتر", x: "نور وظلمة" },
                    { id: "qiyam", name: "القيام", x: "شرف المؤمن" }
                  ].map((p) => {
                    const isDone = sunnahChecked[p.id];
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleSunnah(p.id)}
                        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all ${
                          isDone
                            ? "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950 border-amber-400 shadow-md"
                            : "bg-white/5 border-white/5 text-slate-300 hover:border-white/10"
                        }`}
                      >
                        <span className="text-[10px] font-bold font-serif mb-1">{p.name}</span>
                        <span className={`text-[7px] ${isDone ? "text-amber-950" : "text-slate-400"} mb-1.5`}>{p.x}</span>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                          isDone 
                            ? "bg-amber-950 border-amber-950 text-amber-300" 
                            : "border-white/20"
                        }`}>
                          {isDone && <Check size={8} strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. Daily Good Deeds & Charitires */}
              {checklistExpandedSection === "deeds" && (
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: "quranPage", name: "ورد القرآن", y: "صفحة تلاها" },
                    { id: "morningAzkar", name: "أذكار الصباح", y: "تحصين الغدو" },
                    { id: "eveningAzkar", name: "أذكار المساء", y: "تحصين الرواح" },
                    { id: "sleepAzkar", name: "أذكار النوم", y: "وقاية مبيت" },
                    { id: "charity", name: "صدقة اليوم", y: "وقاية بلاء" }
                  ].map((p) => {
                    const isDone = goodDeedsChecked[p.id];
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleGoodDeed(p.id)}
                        className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl border transition-all ${
                          isDone
                            ? "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950 border-amber-400 shadow-md"
                            : "bg-white/5 border-white/5 text-slate-300 hover:border-white/10"
                        }`}
                      >
                        <span className="text-[9px] font-bold font-serif mb-1">{p.name.split(' ')[0]}</span>
                        <span className={`text-[7px] ${isDone ? "text-amber-950" : "text-slate-400"} mb-1.5`}>{p.y}</span>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                          isDone 
                            ? "bg-amber-950 border-amber-950 text-amber-300" 
                            : "border-white/20"
                        }`}>
                          {isDone && <Check size={8} strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Informative advice based on progress */}
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center text-[10px] text-slate-300 leading-relaxed font-serif">
                {progressPercentage === 100 
                  ? "تبارك الرحمن! لقد ختمت كافة أوراد يومك وطاعاتك المخططة بنجاح منقطع النظير. دمت ذخراً ونوراً لوطنك وأمتك 🕋" 
                  : "عزز همتك بالنقرة الواحدة؛ كل فريضة أو نافلة تُحييها بقلب خاشع هي خطوة تقربك من منازل الراضين المقبولين."}
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

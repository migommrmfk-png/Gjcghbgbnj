import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  MapPin, 
  Compass, 
  Heart, 
  Activity, 
  Moon, 
  ChevronLeft, 
  Calendar, 
  Quote, 
  Share2,
  Sparkles,
  Sun,
  Bot,
  Mic,
  Target,
  Radio,
  Flame,
  Info,
  Puzzle,
  Wind,
  Video,
  Scan,
  Hourglass,
  Baby,
  ImageIcon,
  Bell,
  Book
} from "lucide-react";
import { motion } from "motion/react";
import { usePrayerTimes } from "../contexts/PrayerTimesContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from '../supabase';
import DownloadAppBanner from "./DownloadAppBanner";
import MoodTracker from "./MoodTracker";
import { useTranslation } from 'react-i18next';
import { getGeminiClient } from "../lib/gemini";
import { CheckCircle2, RefreshCw, AlertCircle, Sparkles as SparklesIcon, Trash2, Sliders, ChevronRight as ChevronRightIcon } from "lucide-react";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { prayerTimes, hijriDate, gregorianDate, locationName, loading, error } = usePrayerTimes();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [nextPrayerTime, setNextPrayerTime] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyAyah, setDailyAyah] = useState<{text: string, surah: string} | null>(null);
  const [dailyHadith, setDailyHadith] = useState<{text: string, narrator: string} | null>(null);
  const [dailyDua, setDailyDua] = useState<{text: string, source: string} | null>(null);
  const [streak, setStreak] = useState<number>(1);
  const [isFasting, setIsFasting] = useState<boolean>(false);
  const [isDuhaPrayed, setIsDuhaPrayed] = useState<boolean>(false);
  const [prayedToday, setPrayedToday] = useState<Record<string, boolean>>({
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false
  });
  const [lastReadQuran, setLastReadQuran] = useState<{ surahNumber: number, surahName: string } | null>(null);
  const [tasbeehProgress, setTasbeehProgress] = useState<{ count: number, target: number } | null>(null);
  const [dailyNiyyah, setDailyNiyyah] = useState<string>("");
  const [isEditingNiyyah, setIsEditingNiyyah] = useState<boolean>(false);

  // AI Personalization Onboarding State
  const [userRoutine, setUserRoutine] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("user_custom_ai_routine") || "[]");
    } catch { return []; }
  });
  const [routineChecked, setRoutineChecked] = useState<{ [key: string]: boolean }>(() => {
    try {
      const today = new Date().toDateString();
      const parsed = JSON.parse(localStorage.getItem("user_custom_ai_routine_checked") || "{}");
      if (parsed.date === today) return parsed.checked || {};
    } catch {}
    return {};
  });
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({ goal: "", time: "", level: "" });
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiOnboarding, setShowAiOnboarding] = useState(() => {
    return !localStorage.getItem("user_custom_ai_routine");
  });

  // Daily Quranic Khatmah State
  const [quranPlanData, setQuranPlanData] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("quranPlan") || "null");
    } catch { return null; }
  });

  // What should I read today state handles
  const [whatToReadOpen, setWhatToReadOpen] = useState(false);
  const [selectedSpiritualState, setSelectedSpiritualState] = useState<string | null>(null);
  const [aiPrescription, setAiPrescription] = useState("");
  const [aiPrescriptionLoading, setAiPrescriptionLoading] = useState(false);

  const handleSaveRoutineChecked = (updatedChecked: { [key: string]: boolean }) => {
    const today = new Date().toDateString();
    setRoutineChecked(updatedChecked);
    localStorage.setItem("user_custom_ai_routine_checked", JSON.stringify({ date: today, checked: updatedChecked }));
  };

  const handleCompleteQuranPlanDay = (dayIndex: number) => {
    if (!quranPlanData) return;
    const newPlan = [...quranPlanData.plan];
    newPlan[dayIndex].status = "completed";
    
    // Set next pending to current
    const nextPendingIndex = newPlan.findIndex((p: any, i: number) => i > dayIndex && p.status === "pending");
    if (nextPendingIndex !== -1) {
      newPlan[nextPendingIndex].status = "current";
    }
    
    const updated = { ...quranPlanData, plan: newPlan };
    setQuranPlanData(updated);
    localStorage.setItem("quranPlan", JSON.stringify(updated));
  };

  const handleGenerateAiRoutine = async () => {
    setAiLoading(true);
    
    const goalMap: any = {
      quran: "تلاوة وحفظ القرآن الكريم 📖",
      prayers: "المواظبة والخشوع في الصلوات والسنن الرواتب 🕌",
      knowledge: "التفقه في الدين والحديث الشريف والسيرة النبوية 📚",
      peace: "السكينة والأدعية وأذكار التحصين والرقية 🌿"
    };

    const timeMap: any = {
      "10m": "١٠ دقائق خفيفة ومستمرة ⏱️",
      "30m": "٣٠ دقيقة خاشعة متكاملة ⏳",
      "1h": "ساعة فأكثر للاستثمار الإيماني 🕋"
    };

    const levelMap: any = {
      beginner: "مبتدئ يبحث عن الأساسيات وبناء العادة 🌟",
      mid: "متوسط يبحث عن تكثيف الأوردة والمحافظة 📈",
      advanced: "متقدم يسعى للتفكر العميق والمراجعة الدؤوبة 🎓"
    };

    const goalLabel = goalMap[quizAnswers.goal] || "التقرب إلى الله";
    const timeLabel = timeMap[quizAnswers.time] || "وقت مرن";
    const levelLabel = levelMap[quizAnswers.level] || "عام";

    // Standard high-quality fallback lists to guarantee zero-failure robustness
    const fallbackMap: any = {
      quran: {
        "10m": ["تلاوة صفحتين من القرآن الكريم بتمعن بعد صلاة الفجر", "تصفح معاني آية واحدة مع التفسير الميسر", "ترديد أذكار الصباح كاملة والحمد لله"],
        "30m": ["تلاوة ٥ صفحات من القرآن الكريم بتدبر هادئ", "تنبيه النفس لتعديل مقدار ورد التلاوة اليومي", "سماع تلاوة مرتلة خاشعة لعشر دقائق"],
        "1h": ["تلاوة حزب كامل من الذكر الحكيم يومياً", "مراجعة خمسة صفحات من محفوظاتك القرآنية السابقة", "حفظ ٣ آيات جديدة مع تدبر تفسير السعدي المبارك"]
      },
      prayers: {
        "10m": ["المحافظة على صلاة الوتر ولو ركعة واحدة قبل المنام", "ترديد أذكار ما بعد الصلاة مباشرة بدقة خاشعة", "المحافظة على تكبيرة الإحرام بالمسجد"],
        "30m": ["تأدية بعض السنن الرواتب المرفقة بالفرائض الخمس", "جلسة استغفار خاشعة وتوبة صادقة لمدة ٥ دقائق كاملة", "صلاة ركعتي الضحى لفتح أبواب البركة لنهارك"],
        "1h": ["المحافظة التامة على الرواتب الاثني عشر والضحى والوتر", "الاستغفار بالأسحار والتهجد بركعتين قبل صلاة الفجر", "جلسة تدبر ودعاء مباركة بين الأذان والإقامة بمسجد الحي"]
      },
      knowledge: {
        "10m": ["قراءة حديث شريف واحد من الأربعين النووية بشرح مختصر", "التفكر بوعي في معاني اسم واحد من أسماء الله الحسنى", "قراءة صفحة من كتاب في تفاسير الآيات العطرة"],
        "30m": ["قراءة باب نافع من رياض الصالحين والمداومة عليه", "الاستماع لمقطع فقهي توعوي أو سلسلة مواعظ إيمانية", "مراجعة أحكام طهارة القلوب وتزكية النفس"],
        "1h": ["دراسة صفحتين من كتاب في الفقه الميسر أو أصول السيرة", "الاستماع لدرس شرعي متكامل ميسر", "حفظ حديث شريف وصياغة فوائده الشرعية لنشره"]
      },
      peace: {
        "10m": ["الالتزام الكامل بقراءة أذكار الصباح في وقتها الأصلي", "تلاوة آية الكرسي والمعوذات للتحصين دبر كل مكتوبة", "جلسة استغفار خاشعة ١٠٠ مرة لرفع الكروب والهموم"],
        "30m": ["تلاوة أذكار الصباح والمساء كاملة بخشوع وحضور قلب", "سماع الرقية الشرعية المسكّنة لطرد الوساوس وطلي العافية", "المحافظة على قول لا حول ولا قوة إلا بالله ١٠٠ مرة بيقين"],
        "1h": ["ورد صلاة على النبي ﷺ ١٠٠٠ مرة لفتح بركات الدنيا والآخرة", "تلاوة سورة الملك المنجية من عذاب القبر قبل النوم برضا", "جلسة مناجاة طويلة وبوح لله تعالى بجميع الأمنيات بدعاء خاشع"]
      }
    };

    let generatedRoutine: string[] = [];

    // Attempt actual Gemini generation
    try {
      const client = getGeminiClient();
      const prompt = `أنا مستخدم مسلم. إجابات التخصيص الإيماني الخاصة بي:
- هدفي الإيماني الأكبر: ${goalLabel}
- الوقت اليومي المتاح: ${timeLabel}
- مستواي الحالي: ${levelLabel}

اكتب لي برنامجاً يومياً إيمانياً مخصصاً مبهجاً ومقنعاً وعملياً جداً مكون من 3 أو 4 بنود عملية يومية واضحة ومحددة تناسب الوقت والمستوى والهدف تماماً. اكتب الرد كقائمة JSON تحتوي مصفوفة من السلاسل النصية "tasks" فقط كالمثال التالي: {"tasks": ["بند 1", "بند 2"]}. لا تكتب أي كلام آخر خارج سياق الرد أو وسوم ماركداون لكي أستطيع تحليله بشكل مباشر وموثوق.`;
      
      const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      if (res && res.text) {
        const cleanedText = res.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        if (parsed && Array.isArray(parsed.tasks)) {
          generatedRoutine = parsed.tasks;
        }
      }
    } catch (e) {
      console.warn("Gemini personalization call missed, loading local smart synthesis fallback:", e);
    }

    if (generatedRoutine.length === 0) {
      const goalKey = quizAnswers.goal || "peace";
      const timeKey = quizAnswers.time || "30m";
      generatedRoutine = fallbackMap[goalKey]?.[timeKey] || fallbackMap["peace"]["30m"];
    }

    setUserRoutine(generatedRoutine);
    localStorage.setItem("user_custom_ai_routine", JSON.stringify(generatedRoutine));
    handleSaveRoutineChecked({});
    setShowAiOnboarding(false);
    setAiLoading(false);
  };

  const handleResetRoutine = () => {
    localStorage.removeItem("user_custom_ai_routine");
    setUserRoutine([]);
    setShowAiOnboarding(true);
    setQuizStep(0);
    setQuizAnswers({ goal: "", time: "", level: "" });
  };

  const handleAskAiPrescription = async (moodKey: string, verseText: string) => {
    setAiPrescriptionLoading(true);
    setAiPrescription("");
    try {
      const client = getGeminiClient();
      const prompt = `بصفتك واعظ روحي إسلامي رقيق القلب ومحب، وبناء على اختيار المستخدم لمشاعر: "${moodKey}" وتلاوته للآية الكريمة: "${verseText}". اكتب له رسالة مبهجة، دافئة جداً، وقصيرة من 2-3 أسطر تعيد الطمأنينة لقلبه وتوضح له كيف يعيش ببركة هذه الآية اليوم مجسداً معانيها. قل له كلمات تلمس فؤاده بلغة عربية عذبة فصيحة ومثيرة للتفاؤل والسكون العجيب.`;
      
      const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      if (res && res.text) {
        setAiPrescription(res.text);
      }
    } catch (e) {
      setAiPrescription("أبشر وتفاءل يا أخي الطيب وحليفك الصبر والإيمان؛ آيات الله ملاذك الآمن وحصنك المتين في كل حال. تأمل هذه الآية ورددها بيقين تفرج الكرب وتزول المتاعب.");
    } finally {
      setAiPrescriptionLoading(false);
    }
  };


  useEffect(() => {
    const today = new Date().toDateString();
    
    // Load Prayer Tracker
    const prayersSaved = localStorage.getItem('prayedToday');
    if (prayersSaved) {
      try {
        const parsed = JSON.parse(prayersSaved);
        if (parsed.date === today) {
          setPrayedToday(parsed.data);
        }
      } catch (e) {}
    }

    const fastingSaved = localStorage.getItem('fastingToday');
    if (fastingSaved) {
      try {
        const parsed = JSON.parse(fastingSaved);
        if (parsed.date === today) {
          setIsFasting(parsed.isFasting);
        }
      } catch (e) {}
    }

    // Load Duha Tracker
    const duhaSaved = localStorage.getItem('duhaToday');
    if (duhaSaved) {
      try {
        const parsed = JSON.parse(duhaSaved);
        if (parsed.date === today) {
          setIsDuhaPrayed(parsed.isDuhaPrayed);
        }
      } catch (e) {}
    }

    const lastVisit = localStorage.getItem('lastVisitDate');
    let currentStreak = parseInt(localStorage.getItem('appStreak') || '0', 10);
    let streakUpdated = false;

    if (lastVisit !== today) {
      if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      localStorage.setItem('lastVisitDate', today);
      localStorage.setItem('appStreak', currentStreak.toString());
      streakUpdated = true;
    } else if (currentStreak === 0) {
      currentStreak = 1;
      localStorage.setItem('appStreak', '1');
      streakUpdated = true;
    }
    setStreak(currentStreak);

    // Sync with Firestore if logged in
    if (user && streakUpdated) {
      const syncStreak = async () => {
        try {
          const { data, error } = await supabase.from('users').select('streak').eq('uid', user.id).single();
          if (data && data.streak !== currentStreak) {
            await supabase.from('users').update({ streak: currentStreak }).eq('uid', user.id);
          }
        } catch (err: any) {
          console.error("Error syncing streak:", err);
        }
      };
      syncStreak();
    } else if (user && !streakUpdated) {
      // Just fetch it to make sure it matches
      const fetchStreak = async () => {
        try {
          const { data, error } = await supabase.from('users').select('streak').eq('uid', user.id).single();
          if (data && data.streak && data.streak > currentStreak) {
            setStreak(data.streak);
            localStorage.setItem('appStreak', data.streak.toString());
          }
        } catch (err: any) {
          console.error("Error fetching streak:", err);
        }
      };
      fetchStreak();
    }

    const quranSaved = localStorage.getItem('quranLastRead');
    if (quranSaved) {
      try {
        setLastReadQuran(JSON.parse(quranSaved));
      } catch (e) {}
    }

    const tasbeehSaved = localStorage.getItem('tasbeehCount');
    const tasbeehTarget = localStorage.getItem('tasbeehTarget');
    if (tasbeehSaved && tasbeehTarget) {
      const count = parseInt(tasbeehSaved, 10);
      const target = parseInt(tasbeehTarget, 10);
      if (count > 0) {
        setTasbeehProgress({ count, target });
      }
    }

    const niyyahSaved = localStorage.getItem('dailyNiyyah');
    if (niyyahSaved) {
      try {
        const parsed = JSON.parse(niyyahSaved);
        if (parsed.date === today) {
          setDailyNiyyah(parsed.text);
        } else {
          setDailyNiyyah(""); // clear for new day
        }
      } catch(e){}
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second to improve performance
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAyah = async () => {
      const today = new Date().toDateString();
      const cachedAyahStr = localStorage.getItem('dailyAyah');
      
      if (cachedAyahStr) {
        try {
          const cachedAyah = JSON.parse(cachedAyahStr);
          if (cachedAyah.date === today) {
            setDailyAyah(cachedAyah.data);
            return;
          }
        } catch (e) {}
      }

      try {
        const res = await fetch(`https://ummahapi.com/api/quran/random`);
        if (!res.ok) throw new Error("API response not ok");
        const data = await res.json();
        const ayahData = {
          text: data.data.verse.arabic,
          surah: `${data.data.surah.name_arabic} - آية ${data.data.verse.ayah}`
        };
        setDailyAyah(ayahData);
        localStorage.setItem('dailyAyah', JSON.stringify({ date: today, data: ayahData }));
      } catch (e) {
        console.warn("Using fallback daily ayah due to fetch error");
        const fallbackAyah = {
          text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
          surah: "سورة الشرح - آية 6"
        };
        setDailyAyah(fallbackAyah);
      }
    };

    const fetchHadith = async () => {
      const today = new Date().toDateString();
      const cachedHadithStr = localStorage.getItem('dailyHadith');
      
      if (cachedHadithStr) {
        try {
          const cachedHadith = JSON.parse(cachedHadithStr);
          if (cachedHadith.date === today) {
            setDailyHadith(cachedHadith.data);
            return;
          }
        } catch (e) {}
      }

      // A small static list of beautiful Hadiths for the dashboard
      const hadiths = [
        { text: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى", narrator: "رواه البخاري ومسلم" },
        { text: "من حسن إسلام المرء تركه ما لا يعنيه", narrator: "رواه الترمذي" },
        { text: "الكلمة الطيبة صدقة", narrator: "رواه البخاري ومسلم" },
        { text: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه", narrator: "رواه البخاري ومسلم" },
        { text: "الدين النصيحة", narrator: "رواه مسلم" },
        { text: "من لا يَرْحَم لا يُرْحَم", narrator: "رواه البخاري ومسلم" },
        { text: "خيركم من تعلم القرآن وعلمه", narrator: "رواه البخاري" }
      ];
      
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      const selectedHadith = hadiths[dayOfYear % hadiths.length];
      
      setDailyHadith(selectedHadith);
      localStorage.setItem('dailyHadith', JSON.stringify({ date: today, data: selectedHadith }));
    };

    const fetchDua = async () => {
      const today = new Date().toDateString();
      const cachedDuaStr = localStorage.getItem('dailyDua');
      
      if (cachedDuaStr) {
        try {
          const cachedDua = JSON.parse(cachedDuaStr);
          if (cachedDua.date === today) {
            setDailyDua(cachedDua.data);
            return;
          }
        } catch (e) {}
      }

      const duas = [
        { text: "اللهم إنك عفو تحب العفو فاعف عني", source: "دعاء ليلة القدر" },
        { text: "يا مقلب القلوب ثبت قلبي على دينك", source: "دعاء النبي ﷺ" },
        { text: "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار", source: "سورة البقرة" },
        { text: "رب اشرح لي صدري ويسر لي أمري", source: "سورة طه" },
        { text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى", source: "دعاء النبي ﷺ" },
        { text: "اللهم أعني على ذكرك وشكرك وحسن عبادتك", source: "دعاء النبي ﷺ" },
        { text: "اللهم إني أعوذ بك من زوال نعمتك وتحول عافيتك وفجاءة نقمتك وجميع سخطك", source: "دعاء النبي ﷺ" }
      ];
      
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      const selectedDua = duas[dayOfYear % duas.length];
      
      setDailyDua(selectedDua);
      localStorage.setItem('dailyDua', JSON.stringify({ date: today, data: selectedDua }));
    };

    fetchAyah();
    fetchHadith();
    fetchDua();
  }, []);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "م" : "ص";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const prayersList = [
    { id: "Fajr", name: "الفجر", icon: "🌅" },
    { id: "Sunrise", name: "الشروق", icon: "☀️" },
    { id: "Dhuhr", name: "الظهر", icon: "🌞" },
    { id: "Asr", name: "العصر", icon: "🌤️" },
    { id: "Maghrib", name: "المغرب", icon: "🌇" },
    { id: "Isha", name: "العشاء", icon: "🌙" },
  ];

  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    for (const prayer of prayersList) {
      if (prayer.id === "Sunrise") continue;

      const timeStr = prayerTimes[prayer.id as keyof typeof prayerTimes];
      if (!timeStr) continue;

      const [hours, minutes] = timeStr.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        return {
          ...prayer,
          time: timeStr,
          minutesLeft: prayerMinutes - currentMinutes,
        };
      }
    }

    // If all prayers today are done, next is Fajr tomorrow
    const fajrTimeStr = prayerTimes.Fajr;
    const [fHours, fMinutes] = fajrTimeStr.split(":").map(Number);
    const fajrMinutes = fHours * 60 + fMinutes;
    const minutesLeft = (24 * 60 - currentMinutes) + fajrMinutes;

    return { ...prayersList[0], time: fajrTimeStr, minutesLeft };
  };

  const nextPrayer = getNextPrayer();
  const nextPrayerName = nextPrayer?.name || "";

  useEffect(() => {
    if (nextPrayer) {
      const hours = Math.floor(nextPrayer.minutesLeft / 60);
      const mins = nextPrayer.minutesLeft % 60;
      setNextPrayerTime(`${hours > 0 ? `${hours} ساعة و ` : ""}${mins} دقيقة`);
    }
  }, [nextPrayer, currentTime]);

  const toggleFasting = () => {
    const today = new Date().toDateString();
    const newStatus = !isFasting;
    setIsFasting(newStatus);
    localStorage.setItem('fastingToday', JSON.stringify({ date: today, isFasting: newStatus }));
  };

  const toggleDuha = () => {
    const today = new Date().toDateString();
    const newStatus = !isDuhaPrayed;
    setIsDuhaPrayed(newStatus);
    localStorage.setItem('duhaToday', JSON.stringify({ date: today, isDuhaPrayed: newStatus }));
  };

  const getFastingOccasion = () => {
    if (!hijriDate) return null;

    const month = hijriDate.month.ar;
    const day = parseInt(hijriDate.day, 10);
    const weekday = hijriDate.weekday.ar;

    // 1. Ramadan
    if (month === "رمضان" || month.includes("رمضان")) {
      return "صيام رمضان";
    }

    // 2. Arafah
    if ((month === "ذو الحجة" || month.includes("الحجة")) && day === 9) {
      return "صيام يوم عرفة";
    }

    // 3. Ashura & Tasu'a
    if ((month === "محرم" || month.includes("محرم")) && (day === 9 || day === 10)) {
      return day === 9 ? "صيام تاسوعاء" : "صيام عاشوراء";
    }

    // 4. White Days
    if (day === 13 || day === 14 || day === 15) {
      return "صيام الأيام البيض";
    }

    // 5. Mondays and Thursdays
    if (weekday === "الاثنين" || weekday === "الخميس" || weekday.includes("الاثنين") || weekday.includes("الخميس")) {
      return `صيام يوم ${weekday}`;
    }

    // 6. Shawwal (Optional 6 days)
    if ((month === "شوال" || month.includes("شوال")) && day > 1 && day <= 30) {
      return "صيام الست من شوال";
    }

    // 7. Sha'ban (Recommended to fast a lot)
    if ((month === "شعبان" || month.includes("شعبان")) && day < 30) {
      return "صيام شعبان";
    }

    return null;
  };

  const fastingOccasion = getFastingOccasion();

  const togglePrayer = (prayerId: string) => {
    const today = new Date().toDateString();
    const newPrayers = { ...prayedToday, [prayerId]: !prayedToday[prayerId] };
    setPrayedToday(newPrayers);
    localStorage.setItem('prayedToday', JSON.stringify({ date: today, data: newPrayers }));
  };

  const getBackgroundStyle = () => {
    if (!nextPrayer) return "bg-gradient-to-br from-emerald-500 to-teal-700";
    switch (nextPrayer.id) {
      case "Fajr":
      case "Sunrise":
        return "bg-gradient-to-br from-indigo-500 to-blue-700";
      case "Dhuhr":
        return "bg-gradient-to-br from-teal-400 to-emerald-600";
      case "Asr":
        return "bg-gradient-to-br from-amber-400 to-orange-600";
      case "Maghrib":
        return "bg-gradient-to-br from-rose-500 to-pink-700";
      case "Isha":
        return "bg-gradient-to-br from-slate-800 to-indigo-950";
      default:
        return "bg-gradient-to-br from-emerald-500 to-teal-700";
    }
  };

  const getSmartAthkar = () => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 11) {
      return { title: "أذكار الصباح", desc: "ابدأ يومك بذكر الله", icon: "🌅", id: "azkar" };
    } else if (hour >= 15 && hour < 20) {
      return { title: "أذكار المساء", desc: "اختم نهارك بذكر الله", icon: "🌇", id: "azkar" };
    } else if (hour >= 20 || hour < 4) {
      return { title: "أذكار النوم", desc: "حصن نفسك قبل النوم", icon: "🌙", id: "azkar" };
    }
    return null;
  };

  const smartAthkar = getSmartAthkar();

  const handleShare = async (text: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    }
  };

  const menuItems = [
    {
      id: "quran",
      title: t('quran', 'القرآن الكريم'),
      icon: <BookOpen size={28} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "azkar",
      title: t('azkar', 'الأذكار'),
      icon: <Heart size={28} />,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      id: "qibla",
      title: t('qibla', 'القبلة'),
      icon: <Compass size={28} />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      id: "tasbeeh",
      title: t('tasbeeh', 'السبحة'),
      icon: <Activity size={28} />,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      id: "calendar",
      title: t('hijri_calendar', 'التقويم الهجري'),
      icon: <Calendar size={28} />,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      id: "hadith",
      title: t('hadiths', 'الأحاديث'),
      icon: <BookOpen size={28} />,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) return t('good_morning');
    if (hour >= 12 && hour < 17) return t('good_afternoon');
    if (hour >= 17 && hour < 20) return t('good_evening');
    return t('good_night');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-28 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* Premium Header Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-[32px] bg-[#0A1914] text-white shadow-2xl shadow-emerald-900/20"
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none" style={{ backgroundImage: 'url("/src/assets/images/hajj_kaaba_dome_1779803270795.png")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-900/60 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10 p-6 flex flex-col justify-center space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-medium text-emerald-50 tracking-wide">{getGreeting()}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-emerald-200/80 text-xs font-medium">
                <MapPin size={12} />
                <span>{locationName || t('locating')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/10">
                  <Flame size={14} className="text-orange-400" />
                  <span>{streak} {t('days_streak')}</span>
                </div>
              )}
              <button 
                onClick={() => onNavigate("notifications")}
                className="relative bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 text-white hover:bg-white/20 transition-colors"
                title="الإشعارات"
              >
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A1914]"></span>
              </button>
            </div>
          </div>

          {hijriDate && (
            <div className="flex flex-col items-center justify-center py-4 border-y border-white/5">
              <h1 className="text-3xl font-bold font-serif mb-1 text-white tracking-wide">
                {hijriDate.day} {hijriDate.month.ar} {hijriDate.year}
              </h1>
              <p className="text-emerald-200/70 text-sm font-medium tracking-wide">
                {hijriDate.weekday.ar} • {gregorianDate}
              </p>
            </div>
          )}

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                {t('next_prayer')}
              </p>
              <h3 className="text-xl font-bold text-white mt-0.5">{nextPrayerName}</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono tracking-tighter text-emerald-400">
                {nextPrayerTime}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Eid al-Adha Special Interactive Event Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.03 }}
        onClick={() => onNavigate("eid-special")}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-800 shadow-xl shadow-amber-500/10 p-5 flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-all border border-amber-400/30"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none group-hover:scale-105 transition-transform duration-700" 
          style={{ backgroundImage: 'url("/src/assets/images/eid_adha_greeting_1779803251178.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-emerald-950/95"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl animate-pulse"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 backdrop-blur-md rounded-[18px] flex items-center justify-center border border-amber-400/30 text-amber-300">
             <span className="text-2xl animate-bounce">🐏</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5 tracking-wide flex items-center gap-1.5 font-serif">
              بوابة عيد الأضحى المبارك
              <span className="bg-amber-400 text-amber-950 text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest animate-pulse">نشط الآن</span>
            </h3>
            <p className="text-emerald-200 text-xs font-medium">تكبيرات العيد • صانع بطاقات التهنئة • طاعات عرفة</p>
          </div>
        </div>
        <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-amber-500 group-hover:text-amber-950 transition-colors">
          <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} />
        </div>
      </motion.div>

      {/* Interactive AI Personalization Onboarding / Customized Routine Checklist */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.04 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full -ml-10 -mt-10 blur-xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          
          {/* Header Title of AI Routine Section */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <Bot size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0A1914] dark:text-emerald-50 text-sm font-serif">
                  منهج التقوى المخصص بالذكاء الاصطناعي
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">خطتك المبرمجة ديناميكياً لليوم</p>
              </div>
            </div>
            {!showAiOnboarding && (
              <button
                onClick={handleResetRoutine}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1.5 rounded-xl transition-colors"
                title="إعادة التخصيص"
              >
                <Sliders size={13} />
                <span>تعديل</span>
              </button>
            )}
          </div>

          {/* ONBOARDING QUIZ */}
          {showAiOnboarding ? (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-xs font-black text-rose-500">مطلوب التخصيص الإيماني</span>
                <span className="text-[10px] font-mono text-slate-400">سؤال {quizStep + 1} من ٣</span>
              </div>

              {quizStep === 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">١. ما هو هدفك الإيماني الأكبر حالياً لكي نركز عليه؟</p>
                  <div className="grid gap-2">
                    {[
                      { id: "quran", label: "تلاوة وحفظ القرآن الكريم 📖" },
                      { id: "prayers", label: "المواظبة والخشوع في الصلوات والسنن الرواتب 🕌" },
                      { id: "knowledge", label: "التفقه في الدين والحديث الشريف والسيرة النبوية 📚" },
                      { id: "peace", label: "السكينة والأدعية وأذكار التحصين والرقية 🌿" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, goal: opt.id })}
                        className={`text-right p-3 rounded-xl text-xs font-bold transition-all border ${
                          quizAnswers.goal === opt.id
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 1 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">٢. ما هو الوقت الذي تستطيع التزامه يومياً في تطبيق اليقين؟</p>
                  <div className="grid gap-2">
                    {[
                      { id: "10m", label: "١٠ دقائق خفيفة ومستمرة يومياً ⏱️" },
                      { id: "30m", label: "٣٠ dقيقة مباركة هادئة خاشعة ⏳" },
                      { id: "1h", label: "ساعة مباركة فأكثر للاستثمار الإيماني العميق 🕋" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, time: opt.id })}
                        className={`text-right p-3 rounded-xl text-xs font-bold transition-all border ${
                          quizAnswers.time === opt.id
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">٣. كيف تعرّف خلفيتك في العلوم الشرعية والعبادات حالياً؟</p>
                  <div className="grid gap-2">
                    {[
                      { id: "beginner", label: "مبتدئ يبحث عن الأساسيات وبناء العادة والالتزام 🌟" },
                      { id: "mid", label: "متوسط يبحث عن تكثيف الأوردة والمحافظة والتفسير 📈" },
                      { id: "advanced", label: "متقدم يسعى للتفكر العميق ومراجعة محفوظات المتون 🎓" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, level: opt.id })}
                        className={`text-right p-3 rounded-xl text-xs font-bold transition-all border ${
                          quizAnswers.level === opt.id
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Navigation Trigger Bar */}
              <div className="flex justify-between items-center pt-2">
                {quizStep > 0 ? (
                  <button
                    onClick={() => setQuizStep(quizStep - 1)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg"
                  >
                    السابق
                  </button>
                ) : (
                  <div></div>
                )}

                {quizStep < 2 ? (
                  <button
                    onClick={() => setQuizStep(quizStep + 1)}
                    disabled={
                      (quizStep === 0 && !quizAnswers.goal) ||
                      (quizStep === 1 && !quizAnswers.time)
                    }
                    className="text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/10"
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateAiRoutine}
                    disabled={!quizAnswers.level || aiLoading}
                    className="text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 px-5 py-2 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>جاري صياغة خطتك...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon size={14} />
                        <span>تأكيد وصياغة كإضافة بالذكاء الاصطناعي ✨</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* COMPLIMENTARY REGISTERED GOALS */
            <div className="space-y-3">
              <div className="grid gap-2">
                {userRoutine.map((task, index) => {
                  const isChecked = !!routineChecked[index];
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        const copy = { ...routineChecked };
                        copy[index] = !copy[index];
                        handleSaveRoutineChecked(copy);
                      }}
                      className={`flex gap-3 items-center p-3 rounded-2xl cursor-pointer border transition-all ${
                        isChecked
                          ? "bg-emerald-50/50 dark:bg-emerald-500/5 text-slate-400 border-emerald-400/40 line-through"
                          : "bg-slate-50 dark:bg-slate-800/40 text-[#0A1914] dark:text-slate-100 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30"
                      }`}
                    >
                      <button
                        className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center transition-colors border-2 shrink-0 ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {isChecked && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        )}
                      </button>
                      <span className="text-xs font-serif leading-relaxed font-bold flex-1 text-right">{task}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress metrics */}
              {userRoutine.length > 0 && (
                <div className="flex justify-between items-center bg-indigo-50/40 dark:bg-[#111827] p-3 rounded-2xl border border-indigo-100/50 dark:border-slate-800">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400">معدل الانجاز لجرعة اليوم:</span>
                    <span className="text-xs font-serif font-black text-indigo-500">
                      {Object.keys(routineChecked).filter(k => routineChecked[k]).length} من {userRoutine.length} طاعات مكتملة
                    </span>
                  </div>
                  {Object.keys(routineChecked).filter(k => routineChecked[k]).length === userRoutine.length ? (
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg animate-bounce">
                      طوبى لك مكتمل تماماً! 🎉
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-400 font-serif">ثابر لتحقيق طموحاتك</span>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>

      {/* Structured Quranic Khatmah Dashboard Integration */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0A1914] dark:text-emerald-50 text-sm font-serif">
                  صيانة الورد والختمة القرآنية المقررة
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">الورد الإلزامي والورد اليومي المبارك</p>
              </div>
            </div>
            {quranPlanData && (
              <button
                onClick={() => onNavigate("quran-plan")}
                className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-xl transition-colors"
              >
                <span>إدارة الخطة</span>
                <ChevronLeft size={13} />
              </button>
            )}
          </div>

          {!quranPlanData ? (
            /* CTA to build a Quran plan */
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 border border-dashed border-amber-300 dark:border-amber-500/20 rounded-2xl text-center space-y-3">
              <div className="text-amber-500 animate-bounce flex justify-center"><AlertCircle size={28} /></div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                🚨 لم تقم بإعداد خطة ختمة قرآنية تلتزم بها يومياً بعد! صمّم خطتك الآن في ثوانٍ لتحافظ على ورد تلاوتك وتفادي الهجر.
              </p>
              <button
                onClick={() => onNavigate("quran-plan")}
                className="w-full bg-amber-500 text-white hover:bg-amber-600 transition-colors py-2.5 rounded-xl font-bold text-xs shadow-md shadow-amber-500/20"
              >
                تخصيص وبرمجة خطة ختمتي الآن 📖
              </button>
            </div>
          ) : (
            /* Show actual Khatmah track details */
            (() => {
              // Find the active 'current' target
              const planArray = quranPlanData.plan || [];
              const currIdx = planArray.findIndex((p: any) => p.status === "current");
              const completedCount = planArray.filter((p: any) => p.status === "completed").length;
              const totalDays = planArray.length;
              const progressPercentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

              if (currIdx === -1) {
                // All items completed
                return (
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-4 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 leading-relaxed">
                      🎉 هنيئاً لك! لقد تم إكمال الختمة المباركة بالكامل ومصادقة التلاوات كاملة. نسأل الله القبول والثبات.
                    </p>
                    <button
                      onClick={() => onNavigate("quran-plan")}
                      className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all"
                    >
                      ابدأ ختمة جديدة ببركة ومستوى آخر 📖
                    </button>
                  </div>
                );
              }

              const activeDay = planArray[currIdx];

              return (
                <div className="space-y-3">
                  
                  {/* Strict Red Pulsing Banner to enforce reading Khatmah */}
                  <div className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-2xl flex items-center gap-3 text-xs">
                    <AlertCircle size={20} className="shrink-0 animate-pulse text-red-500" />
                    <p className="font-extrabold leading-normal font-serif text-[11px] block">
                      انتبه: لم تسجل إكمال ورد تلاوة القرآن ومراجعتك المقررة لهذا اليوم بعد! لا تهجر كتابك الحكيم وبادر الآن لتبلغ الأجور.
                    </p>
                  </div>

                  {/* Active target display & checking option */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 font-mono">اليوم المقرّر {activeDay.day} من {totalDays}</span>
                      <span className="text-xs font-bold text-[#0A1914] dark:text-slate-100 font-serif block mt-0.5">{activeDay.target}</span>
                    </div>
                    <button
                      onClick={() => handleCompleteQuranPlanDay(currIdx)}
                      className="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-black text-[11px] px-3.5 py-2 rounded-xl shadow-md shadow-emerald-500/10"
                    >
                      تمت القراءة ✔️
                    </button>
                  </div>

                  {/* Overall Khatmah target progress bar */}
                  <div className="space-y-1.5 px-0.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>إجمالي رصيد الإنجاز في الختمة:</span>
                      <span className="font-bold text-amber-500">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>

                </div>
              );
            })()
          )}
        </div>
      </motion.div>

      {/* Daily Niyyah (Intention) Tracker */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-xl transition-transform group-hover:scale-110 duration-700"></div>
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
               <Sparkles size={20} />
             </div>
             <div>
               <h3 className="font-bold text-slate-800 dark:text-slate-100">نية اليوم</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400">إنما الأعمال بالنيات</p>
             </div>
           </div>
           
           {isEditingNiyyah ? (
             <div className="flex gap-2">
               <input 
                 autoFocus
                 type="text" 
                 value={dailyNiyyah} 
                 onChange={(e) => setDailyNiyyah(e.target.value)}
                 className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                 placeholder="اكتب هدفك الروحي لليوم..."
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     setIsEditingNiyyah(false);
                     localStorage.setItem('dailyNiyyah', JSON.stringify({ date: new Date().toDateString(), text: dailyNiyyah }));
                   }
                 }}
               />
               <button 
                 onClick={() => {
                   setIsEditingNiyyah(false);
                   localStorage.setItem('dailyNiyyah', JSON.stringify({ date: new Date().toDateString(), text: dailyNiyyah }));
                 }}
                 className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-amber-600"
               >
                 حفظ
               </button>
             </div>
           ) : (
             <div 
               onClick={() => setIsEditingNiyyah(true)}
               className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
               {dailyNiyyah || <span className="text-slate-400">اضغط هنا لكتابة نيتك أو هدفك الروحي لليوم...</span>}
             </div>
           )}
        </div>
      </motion.div>

      {/* Modern Quick Access */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3 bg-white dark:bg-slate-900 rounded-[32px] p-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800"
      >
        <button onClick={() => onNavigate("quran")} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
            <BookOpen size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">القرآن</span>
        </button>
        <button onClick={() => onNavigate("azkar")} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-800/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
            <Heart size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">الأذكار</span>
        </button>
        <button onClick={() => onNavigate("qibla")} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
            <Compass size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">القبلة</span>
        </button>
        <button onClick={() => onNavigate("tasbeeh")} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
            <Activity size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">السبحة</span>
        </button>
      </motion.div>

      {/* Explore More Row */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 pt-1 px-1 -mx-1"
      >
        {lastReadQuran && (
          <button onClick={() => onNavigate("quran")} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-l from-emerald-600 to-emerald-800 pr-2 pl-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-shadow">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <BookOpen size={16} />
            </div>
            <div className="text-right">
               <span className="block text-[10px] text-emerald-100/90 leading-none mb-0.5">تابع القراءة</span>
               <span className="block text-[11px] font-bold text-white leading-none">{lastReadQuran.surahName}</span>
            </div>
          </button>
        )}

        <button onClick={() => setWhatToReadOpen(true)} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-l from-indigo-500 to-purple-500 pr-2 pl-4 py-2.5 rounded-full border border-indigo-400 shadow-md hover:shadow-lg transition-shadow">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <span className="text-[11px] font-bold text-white">ماذا أقرأ الآن؟</span>
        </button>

        <button onClick={() => onNavigate("dawah")} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-l from-emerald-500 to-teal-500 pr-2 pl-4 py-2.5 rounded-full border border-emerald-400 shadow-md hover:shadow-lg transition-shadow">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Share2 size={16} />
          </div>
          <span className="text-[11px] font-bold text-white">شارك دعوة</span>
        </button>

        <button onClick={() => onNavigate("radio")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Radio size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الإذاعة</span>
        </button>

        <button onClick={() => onNavigate("hadith")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Quote size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الحديث</span>
        </button>

        <button onClick={() => onNavigate("quran-plan")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الختمة</span>
        </button>

        <button onClick={() => onNavigate("smart-plan")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Target size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الخطة الذكية</span>
        </button>

        <button onClick={() => onNavigate("dreams")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Moon size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">تفسير الأحلام</span>
        </button>

        <button onClick={() => onNavigate("names")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Heart size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">أسماء الله</span>
        </button>

        <button onClick={() => onNavigate("ruqyah")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Activity size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الرقية الشرعية</span>
        </button>
      </motion.div>

      {/* AI Assistant Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        onClick={() => onNavigate("muslim-ai")}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo-500 to-blue-500 shadow-xl shadow-indigo-500/20 p-5 flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-all"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none group-hover:scale-105 transition-transform duration-700" 
          style={{ backgroundImage: 'url("/src/assets/images/names_allah_background_1779805712797.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/80 to-blue-500/80"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-10 -mt-10 blur-md group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-[18px] flex items-center justify-center border border-white/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-0.5 tracking-wide flex items-center gap-2">
              {t('muslim_ai')} 
              <span className="bg-white text-indigo-600 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">NEW</span>
            </h3>
            <p className="text-indigo-50 text-xs font-medium opacity-90">{t('ai_assistant_desc')}</p>
          </div>
        </div>
        <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
          <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} />
        </div>
      </motion.div>


      {/* Prayers Row */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card-3d bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex justify-between items-center mb-5 px-1 relative z-10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>
            {t('prayer_times')}
          </h3>
          <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
             {locationName || "مكة المكرمة"}
          </span>
        </div>
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-[24px] shadow-inner relative z-10 border border-slate-100 dark:border-slate-700/50">
          {prayersList.map((prayer) => {
            const isNext = nextPrayer?.id === prayer.id;
            const time = prayerTimes ? prayerTimes[prayer.id as keyof typeof prayerTimes] : "--:--";
            return (
              <div
                key={prayer.id}
                className={`flex flex-col items-center justify-center py-3 px-1 rounded-[20px] transition-all flex-1 min-w-0 ${
                  isNext
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 transform scale-[1.05]"
                    : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                <span className={`text-[11px] font-bold mb-1 truncate w-full text-center ${isNext ? 'opacity-100' : ''}`}>{prayer.name}</span>
                <span className={`text-sm font-bold font-mono tracking-tight ${isNext ? '' : 'text-slate-800 dark:text-slate-200'}`}>{formatTime(time).split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
        {nextPrayer && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium px-2">
             <span>باقي على الصلاة القادمة: <span className="font-bold text-emerald-500">{nextPrayerTime}</span></span>
             <span className="text-[10px] text-slate-400">({nextPrayerName})</span>
          </div>
        )}
        <div className="mt-3 text-[10px] text-center text-emerald-600/70 dark:text-emerald-400/70 font-medium flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          المصدر: Aladhan (معتمد للأوقات الشرعية)
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Daily Content Bento - Ayah */}
        {dailyAyah && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 cursor-pointer shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] group hover:shadow-xl hover:-translate-y-1 transition-all"
            onClick={() => handleShare(`${dailyAyah.text}\n\n[${dailyAyah.surah}]`, t('ayah_of_day'))}
          >
            <div className="flex items-center gap-2 mb-4 text-emerald-500">
              <BookOpen size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('ayah_of_day')}</span>
            </div>
            <p className="text-lg font-serif text-slate-800 dark:text-slate-100 leading-loose mb-4">
              {dailyAyah.text}
            </p>
            <p className={`text-[10px] font-bold text-slate-400 text-${isRTL ? 'left' : 'right'}`}>
              {dailyAyah.surah}
            </p>
          </motion.div>
        )}

        {/* Daily Content Bento - Hadith */}
        {dailyHadith && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 cursor-pointer shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] group hover:shadow-xl hover:-translate-y-1 transition-all"
            onClick={() => handleShare(`${dailyHadith.text}\n\n[${dailyHadith.narrator}]`, t('hadith_of_day'))}
          >
            <div className="flex items-center gap-2 mb-4 text-amber-500">
              <Quote size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('hadith_of_day')}</span>
            </div>
            <p className="text-sm font-serif text-slate-800 dark:text-slate-100 leading-relaxed mb-4">
              {dailyHadith.text}
            </p>
            <p className={`text-[10px] font-bold text-slate-400 text-${isRTL ? 'left' : 'right'}`}>
              {dailyHadith.narrator}
            </p>
          </motion.div>
        )}
      </div>

      {/* Smart Athkar Bento */}
      {smartAthkar && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-[32px] p-5 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between"
          onClick={() => onNavigate(smartAthkar.id)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[20px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {smartAthkar.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-0.5">{smartAthkar.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{smartAthkar.desc}</p>
            </div>
          </div>
          <ChevronLeft size={16} className={`text-slate-400 ${isRTL ? '' : 'rotate-180'} group-hover:-translate-x-1 transition-transform`} />
        </motion.div>
      )}

      {/* Quick Dua Wall Preview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-5 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all cursor-pointer group" onClick={() => onNavigate("dua-wall")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-[20px] flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <Heart size={20} className="fill-current" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-serif">حائط الدعاء</h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">شارك دعاءك مع المجتمع</p>
              </div>
            </div>
            <div className="text-[10px] font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
              تصفح
            </div>
          </div>
        </div>
      </motion.div>

      {/* Highlighted Hijri Calendar Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.48 }}
          className="col-span-1 sm:col-span-2 md:col-span-3 mt-4"
        >
          <div 
            onClick={() => onNavigate("calendar")}
            className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-[24px] p-6 shadow-lg shadow-amber-500/20 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-amber-400/50"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none group-hover:scale-105 transition-transform duration-700" 
              style={{ backgroundImage: 'url("/src/assets/images/hadith_scroll_background_1779805688768.png")' }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/80 to-orange-600/80"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-md group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-900/10 rounded-full -ml-10 -mb-10 blur-sm"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-white/90 text-sm font-bold mb-1 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} />
                  التقويم الهجري
                </h2>
                {hijriDate ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-serif text-white">{hijriDate.day}</span>
                    <span className="text-xl font-bold text-white/90">{hijriDate.month.ar}</span>
                    <span className="text-white/80 font-medium ml-2">{hijriDate.year}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-white">جاري التحميل...</span>
                )}
              </div>
              
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                <ChevronLeft size={24} className={isRTL ? '' : 'rotate-180'} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Features Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-1 sm:col-span-2 md:col-span-3 mt-4"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <Bot size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('ai_features')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div 
              onClick={() => onNavigate("dreams")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Moon size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('dream_interpretation')}</span>
            </div>
            <div 
              onClick={() => onNavigate("muslim-ai")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('recitation_correction')}</span>
            </div>
            <div 
              onClick={() => onNavigate("quran-reflection")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">تأملات قرآنية</span>
            </div>
            <div 
              onClick={() => onNavigate("halal-checker")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-teal-50 dark:bg-teal-500/10 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scan size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">الماسح الغذائي</span>
            </div>
          </div>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-1 sm:col-span-2 md:col-span-3 mt-4"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <Compass size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('explore_more')}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(item.id)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] flex flex-col items-center justify-center p-5 gap-3 aspect-square group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-[16px] ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">
                  {item.title}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

      {/* Dynamic Spiritual Diagnosis & Quran Recommender Drawer/Modal */}
      {whatToReadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-right relative">
              <button
                onClick={() => {
                  setWhatToReadOpen(false);
                  setSelectedSpiritualState(null);
                  setAiPrescription("");
                }}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all text-sm font-bold"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <SparklesIcon size={20} className="text-amber-300 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-black font-serif">ماذا أقرأ اليوم؟ • الطبيب القرآني الذكي</h3>
                  <p className="text-[11px] text-indigo-100 font-medium">اختر حالتك النفسية أو الروحية لنصف لك الدواء الإشعاعي</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-right overflow-y-auto max-h-[70vh]">
              {!selectedSpiritualState ? (
                /* Select Spiritual Mood state */
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500">من فضلك كيف تجد فؤادك الآن؟</p>
                  <div className="grid gap-2.5">
                    {[
                      { id: "anxious", label: "أشعر بالقلق والتوتر وتشتت التفكير 😰", color: "hover:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20" },
                      { id: "sad", label: "أشعر بالحزن والضيق وانكسار الصدر 😞", color: "hover:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20" },
                      { id: "gratitude", label: "أعيش في شكر ونعمة وفرح بفضل ربي 🥰", color: "hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20" },
                      { id: "sluggish", label: "أجد كسلاً وفتوراً عن العبادة والواجبات 🥱", color: "hover:border-amber-500 bg-amber-50/20 dark:bg-amber-950/20" },
                      { id: "guidance", label: "أطلب الهداية واليقين وزيادة الثبات 🕋", color: "hover:border-purple-500 bg-purple-50/20 dark:bg-purple-950/20" }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedSpiritualState(m.id);
                          setAiPrescription("");
                        }}
                        className={`w-full p-4 rounded-2xl text-xs font-bold transition-all border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-right flex items-center justify-between ${m.color}`}
                      >
                        <span className="font-serif font-black">{m.label}</span>
                        <ChevronLeft size={16} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Mood Recommendation Results screen */
                (() => {
                  const moodRecommendations: { [key: string]: { title: string, text: string, surah: string, explanation: string, page: number } } = {
                    anxious: {
                      title: "علاج القلق والتوتر بآيات السكينة",
                      text: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
                      surah: "سورة الرعد - آية ٢٨",
                      explanation: "هذه الآية الكريمة تطمئن القلوب وتذهب الروع والوجل بمجرد الذكر والتسبيح والثقة بجبر الله للنفوس الضعيفة الواجلة.",
                      page: 253
                    },
                    sad: {
                      title: "علاج الحزن والضيق بآيات الانشراح واليسر",
                      text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
                      surah: "سورة الشرح - آية ٥-٦",
                      explanation: "تأكيد رباني قاطع بأن العسر لا يغلب يسرين، وأن بعد كل انقباض في الصدر تساع وفرج عظيم يمسح دمعة المحزونين.",
                      page: 596
                    },
                    gratitude: {
                      title: "آيات الشكر واستدامة النعم وزيادتها",
                      text: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
                      surah: "سورة إبراهيم - آية ٧",
                      explanation: "قانون رباني واضح ومؤكد؛ شكر الله على نعمة الصحة، الإسلام، والتوفيق هو مفتاح الاستدامة والزيادة الدائمة في الخيرات.",
                      page: 256
                    },
                    sluggish: {
                      title: "علاج الكسل وفتور العبادة بآيات الشوق للجنة",
                      text: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ",
                      surah: "سورة آل عمران - آية ١٣٣",
                      explanation: "دعوة ملؤها المحبة والشغف من علام الغيوب، تحث المسافر إلى ربه على الإسراع والمنافسة في جني الحسنات وبلوغ درجات الفردوس.",
                      page: 66
                    },
                    guidance: {
                      title: "آيات طلب الهداية واليقين وسؤال الثبات",
                      text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ • صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
                      surah: "سورة الفاتحة - آية ٦-٧",
                      explanation: "أعظم دعاء يكرره المسلم في كل ركعة، يسأل فيه ربه الهداية لسبل السلام والتمسك بالحق حتى الممات.",
                      page: 1
                    }
                  };

                  const rec = moodRecommendations[selectedSpiritualState];
                  if (!rec) return null;
                  return (
                    <div className="space-y-5">
                      
                      {/* Back handle */}
                      <button
                        onClick={() => {
                          setSelectedSpiritualState(null);
                          setAiPrescription("");
                        }}
                        className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"
                      >
                        <ChevronRightIcon size={14} />
                        <span>العودة لقائمة الحالات</span>
                      </button>

                      {/* Spiritual Prescription Main Verse */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 p-5 rounded-3xl text-center space-y-3 shadow-inner">
                        <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 text-[10px] font-black px-2.5 py-1 rounded-full">{rec.title}</span>
                        <p className="text-base text-slate-900 dark:text-emerald-100 font-serif font-extrabold leading-loose py-2">
                          「 {rec.text} 」
                        </p>
                        <p className="text-[11px] font-black text-slate-400 font-serif">{rec.surah}</p>
                      </div>

                      {/* Human Explanation brief */}
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                        <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1 font-serif">💡 أثر وتفسير الآية لشفائك:</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif font-bold">
                          {rec.explanation}
                        </p>
                      </div>

                      {/* Interactive AI Prescriber Button with live Gemini SDK proxy */}
                      <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-400">استشارة الطبيب الإيماني بالذكاء الاصطناعي:</span>
                          <button
                            onClick={() => handleAskAiPrescription(selectedSpiritualState, rec.text)}
                            disabled={aiPrescriptionLoading}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center gap-1 disabled:opacity-50"
                          >
                            {aiPrescriptionLoading ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                <span>جاري تحضير البلسم...</span>
                              </>
                            ) : (
                              <>
                                <Bot size={12} />
                                <span>اطلب مواساة روحية خاصة ✨</span>
                              </>
                            )}
                          </button>
                        </div>

                        {aiPrescription && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200/30 p-4 rounded-2xl"
                          >
                            <p className="text-xs text-slate-700 dark:text-indigo-100 leading-relaxed font-serif font-bold whitespace-pre-wrap">
                              {aiPrescription}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Primary Navigation to Read full Pages button */}
                      <button
                        onClick={() => {
                          setWhatToReadOpen(false);
                          onNavigate("quran");
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors py-3 rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/15"
                      >
                        اذهب لتصفح السورة كاملة بالقرآن العظيم 📖
                      </button>

                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/40 px-6 py-4 flex justify-end border-t border-slate-100 dark:border-slate-800/60">
              <button
                onClick={() => {
                  setWhatToReadOpen(false);
                  setSelectedSpiritualState(null);
                  setAiPrescription("");
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-600 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

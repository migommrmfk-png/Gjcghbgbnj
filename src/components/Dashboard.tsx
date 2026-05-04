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
  Puzzle
} from "lucide-react";
import { motion } from "motion/react";
import { usePrayerTimes } from "../contexts/PrayerTimesContext";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import DownloadAppBanner from "./DownloadAppBanner";
import MoodTracker from "./MoodTracker";
import { useTranslation } from 'react-i18next';

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
          const userRef = doc(db, 'users', user.id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.streak !== currentStreak) {
              await updateDoc(userRef, { streak: currentStreak });
            }
          }
        } catch (err: any) {
          if (!err?.message?.includes('offline')) {
            console.error("Error syncing streak:", err);
          }
        }
      };
      syncStreak();
    } else if (user && !streakUpdated) {
      // Just fetch it to make sure it matches
      const fetchStreak = async () => {
        try {
          const userRef = doc(db, 'users', user.id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.streak && data.streak > currentStreak) {
              setStreak(data.streak);
              localStorage.setItem('appStreak', data.streak.toString());
            }
          }
        } catch (err: any) {
          if (!err?.message?.includes('offline')) {
            console.error("Error fetching streak:", err);
          }
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
        const randomAyah = Math.floor(Math.random() * 6236) + 1;
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}`);
        if (!res.ok) throw new Error("API response not ok");
        const data = await res.json();
        const ayahData = {
          text: data.data.text,
          surah: `${data.data.surah.name} - آية ${data.data.numberInSurah}`
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
      title: t('quran'),
      icon: <BookOpen size={28} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "smart-plan",
      title: t('smartPlan', 'AI Smart Plan'),
      icon: <Target size={28} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "azkar",
      title: t('azkar'),
      icon: <Heart size={28} />,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      id: "qibla",
      title: t('qibla'),
      icon: <Compass size={28} />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      id: "tasbeeh",
      title: t('tasbeeh'),
      icon: <Activity size={28} />,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      id: "calendar",
      title: t('hijri_calendar'),
      icon: <Calendar size={28} />,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      id: "hadith",
      title: t('hadiths'),
      icon: <BookOpen size={28} />,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      id: "stories",
      title: t('prophet_stories'),
      icon: <BookOpen size={28} />,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      id: "duas",
      title: t('duas'),
      icon: <Heart size={28} />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      id: "names",
      title: t('names_of_allah'),
      icon: <Info size={28} />,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
    },
    {
      id: "radio",
      title: t('radio'),
      icon: <Radio size={28} />,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      id: "games",
      title: t('games_and_challenges'),
      icon: <Puzzle size={28} />,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-900/40"></div>
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
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/10">
                <Flame size={14} className="text-orange-400" />
                <span>{streak} {t('days_streak')}</span>
              </div>
            )}
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
        <button onClick={() => onNavigate("radio")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Radio size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الإذاعة</span>
        </button>
        
        <button onClick={() => onNavigate("reels")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Share2 size={16} /> {/* Using Share2 temporarily, Play would be better but not imported */}
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">مقاطع تلاوات</span>
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

      {/* Sakina Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.18 }}
        onClick={() => onNavigate("sakina")}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-teal-500 to-emerald-600 shadow-xl shadow-teal-500/20 p-5 flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-all"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-10 -mt-10 blur-sm group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-[18px] flex items-center justify-center border border-white/20">
            <Wind size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-0.5 tracking-wide flex items-center gap-2">
              خيمة السكينة
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider text-teal-100">ميزة جديدة ومبتكرة</span>
            </h3>
            <p className="text-teal-50 text-xs font-medium opacity-90">دمج التأمل الإسلامي مع مؤثرات الطبيعة</p>
          </div>
        </div>
        <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-teal-600 transition-colors">
          <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} />
        </div>
      </motion.div>

      {/* Spiritual Orbit Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => onNavigate("orbit")}
        className="relative overflow-hidden rounded-[32px] bg-indigo-950 shadow-xl shadow-indigo-900/20 p-6 flex flex-col justify-center cursor-pointer group active:scale-[0.98] transition-all border border-indigo-500/20"
      >
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between text-white w-full">
          <div>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 drop-shadow-md">
              فلك العبادات 
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider">مبتكر</span>
            </h3>
            <p className="text-indigo-200 text-xs opacity-90 tracking-wide font-medium">اجعل طاعاتك تدور حول قلبك</p>
          </div>
          <div className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-amber-500/20 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-colors shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 22a10 10 0 0 1-10-10"/></svg>
          </div>
        </div>
      </motion.div>

      {/* Muslim Garden Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.22 }}
        onClick={() => onNavigate("garden")}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-emerald-900 to-teal-950 shadow-xl shadow-emerald-900/20 p-6 flex flex-col justify-center cursor-pointer group active:scale-[0.98] transition-all border border-emerald-500/20"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaves-pattern.png')] bg-repeat"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-4 text-white">
          <div className="w-14 h-14 bg-emerald-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-400/30 group-hover:bg-emerald-500/40 transition-colors shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 drop-shadow-md"><path d="M12 22v-3"/><path d="m11 19-3-3"/><path d="m13 19 3-3"/><path d="m7 16-2-2"/><path d="m17 16 2-2"/><path d="M12 2l3 3-3 3-3-3 3-3z"/><path d="m9 5-2-2"/><path d="m15 5 2-2"/><path d="m7 9-2-2"/><path d="m17 9 2-2"/></svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 drop-shadow-md">
              بستان العبادات 
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider">حصري</span>
            </h3>
            <p className="text-emerald-100/70 text-xs font-medium">كل طاعة زرعة في بستانك</p>
          </div>
        </div>
      </motion.div>

      {/* Prayers Row */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] p-5 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]"
      >
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('prayer_times')}</h3>
        </div>
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[24px]">
          {prayersList.map((prayer) => {
            const isNext = nextPrayer?.id === prayer.id;
            const time = prayerTimes ? prayerTimes[prayer.id as keyof typeof prayerTimes] : "--:--";
            return (
              <div
                key={prayer.id}
                className={`flex flex-col items-center justify-center p-2 rounded-[20px] transition-all flex-1 min-w-0 ${
                  isNext
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transform scale-105"
                    : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                <span className={`text-[10px] font-bold mb-1 truncate w-full text-center ${isNext ? 'opacity-100' : ''}`}>{prayer.name}</span>
                <span className={`text-xs font-bold font-mono ${isNext ? '' : 'text-slate-800 dark:text-slate-200'}`}>{formatTime(time).split(' ')[0]}</span>
              </div>
            );
          })}
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
              onClick={() => onNavigate("muslim-ai")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
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
              onClick={() => onNavigate("muslim-ai")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('fatwas_and_questions')}</span>
            </div>
            <div 
              onClick={() => onNavigate("muslim-ai")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('spiritual_guide')}</span>
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
    </div>
  );
}

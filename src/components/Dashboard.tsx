import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Compass,
  BookOpen,
  Heart,
  Activity,
  Info,
  Radio,
  ChevronLeft,
  Puzzle,
  Share2,
  Quote,
  Flame,
  Moon,
  Sparkles,
  Sun,
  Bot,
  Mic
} from "lucide-react";
import { motion } from "motion/react";
import { usePrayerTimes } from "../contexts/PrayerTimesContext";
import DownloadAppBanner from "./DownloadAppBanner";
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { prayerTimes, hijriDate, gregorianDate, locationName, loading, error } = usePrayerTimes();
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
    } else if (currentStreak === 0) {
      currentStreak = 1;
      localStorage.setItem('appStreak', '1');
    }
    setStreak(currentStreak);

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
    if (!nextPrayer) return "from-[var(--color-primary-dark)] to-[var(--color-primary)]";
    switch (nextPrayer.id) {
      case "Fajr":
      case "Sunrise":
        return "from-[#0a1118] to-[#1a2b3c] bg-[url('https://images.unsplash.com/photo-1519817914152-2a241f6d54f6?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay";
      case "Dhuhr":
        return "from-[#0d1b2a] to-[#1b263b] bg-[url('https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay";
      case "Asr":
        return "from-[#1a221d] to-[#2d3a33] bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay";
      case "Maghrib":
        return "from-[#2a1a1a] to-[#3d2626] bg-[url('https://images.unsplash.com/photo-1551041777-ed277b8dd348?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay";
      case "Isha":
        return "from-[#0a0f0d] to-[#141c18] bg-[url('https://images.unsplash.com/photo-1507676184212-d0330a15233c?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay";
      default:
        return "from-[var(--color-primary-dark)] to-[var(--color-primary)]";
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
      color: "text-[var(--color-primary)]",
      bg: "bg-[var(--color-primary)]/10",
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-32" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Card 3D - Dynamic Background */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${getBackgroundStyle()} text-white shadow-2xl transition-all duration-1000 border border-white/10`}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/40 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>

        <div className="relative z-10 p-8 flex flex-col items-center text-center space-y-6 mt-4">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">{getGreeting()}</h2>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30 backdrop-blur-sm">
                <span>🔥</span>
                <span>{streak} {t('days_streak')}</span>
              </div>
            )}
          </div>
          <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} bg-black/40 px-5 py-2 rounded-full text-sm backdrop-blur-md border border-white/10 shadow-inner`}>
            <MapPin size={16} className="text-[var(--color-primary)]" />
            <span className="font-medium">{locationName || t('locating')}</span>
          </div>

          {hijriDate && (
            <div className="mt-2">
              <h1 className="text-4xl font-bold font-serif mb-2 drop-shadow-lg text-[var(--color-primary-light)]">
                {hijriDate.day} {hijriDate.month.ar} {hijriDate.year}
              </h1>
              <p className="text-white/80 text-lg font-medium drop-shadow-md">
                {hijriDate.weekday.ar} • {gregorianDate}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Bento Grid */}
      <div className="bento-grid">
        {/* Prayer Times Bento */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bento-item-large bento-card bento-card-primary"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold font-serif mb-1">{t('prayer_times')}</h2>
                <div className="flex items-center gap-2 text-white/70 text-sm font-bold">
                  <MapPin size={14} />
                  {locationName || t('locating')}
                </div>
              </div>
              <div className={`text-${isRTL ? 'left' : 'right'}`}>
                <p className="text-4xl font-bold font-mono tracking-tighter">
                  {nextPrayerTime}
                </p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                  {t('next_prayer')}: {nextPrayerName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {prayersList.map((prayer) => {
                const isNext = nextPrayer?.id === prayer.id;
                const time = prayerTimes ? prayerTimes[prayer.id as keyof typeof prayerTimes] : "--:--";
                return (
                  <div
                    key={prayer.id}
                    className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                      isNext
                        ? "bg-white text-[var(--color-bg)] shadow-lg scale-105"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase mb-1 opacity-60">
                      {prayer.name}
                    </span>
                    <span className="text-sm font-bold font-mono">{formatTime(time)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Muslim AI Agent Bento */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bento-item-large bento-card cursor-pointer group relative overflow-hidden"
          onClick={() => onNavigate("muslim-ai")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] opacity-90 transition-opacity group-hover:opacity-100"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-black/10 shadow-inner group-hover:scale-110 transition-transform">
                <Sparkles size={28} className="text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  {t('muslim_ai')}
                  <span className="bg-black/20 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">AI</span>
                </h3>
                <p className="text-white/80 text-sm font-medium">{t('ai_assistant_desc')}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-black/10 group-hover:bg-black/20 transition-colors">
              <ChevronLeft size={20} className={`text-white ${isRTL ? '' : 'rotate-180'}`} />
            </div>
          </div>
        </motion.div>

        {/* Daily Content Bento - Ayah */}
        {dailyAyah && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bento-card bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/30 cursor-pointer"
            onClick={() => handleShare(`${dailyAyah.text}\n\n[${dailyAyah.surah}]`, t('ayah_of_day'))}
          >
            <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
              <BookOpen size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{t('ayah_of_day')}</span>
            </div>
            <p className="text-quran text-xl text-gray-800 dark:text-amber-50 leading-loose mb-4 line-clamp-4">
              {dailyAyah.text}
            </p>
            <p className={`text-[10px] font-bold text-amber-600/60 dark:text-amber-400/60 text-${isRTL ? 'left' : 'right'}`}>
              {dailyAyah.surah}
            </p>
          </motion.div>
        )}

        {/* Daily Content Bento - Hadith */}
        {dailyHadith && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bento-card bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200/50 dark:border-amber-700/30 cursor-pointer"
            onClick={() => handleShare(`${dailyHadith.text}\n\n[${dailyHadith.narrator}]`, t('hadith_of_day'))}
          >
            <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
              <Quote size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{t('hadith_of_day')}</span>
            </div>
            <p className="text-sm text-gray-800 dark:text-amber-50 leading-relaxed mb-4 line-clamp-5 font-medium">
              {dailyHadith.text}
            </p>
            <p className={`text-[10px] font-bold text-amber-600/60 dark:text-amber-400/60 text-${isRTL ? 'left' : 'right'}`}>
              {dailyHadith.narrator}
            </p>
          </motion.div>
        )}

        {/* Smart Athkar Bento */}
        {smartAthkar && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="bento-card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200/50 dark:border-indigo-700/30 cursor-pointer group"
            onClick={() => onNavigate(smartAthkar.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={18} className="animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('smart_suggestion')}</span>
              </div>
              <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{smartAthkar.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">{smartAthkar.title}</h3>
            <p className="text-xs text-[var(--color-text-muted)] font-medium">{smartAthkar.desc}</p>
          </motion.div>
        )}

        {/* AI Features Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-1 sm:col-span-2 md:col-span-3 mt-4"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <Bot size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-bold text-[var(--color-text)]">{t('ai_features')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div 
              onClick={() => onNavigate("muslim-ai")}
              className="bg-[var(--color-surface)] border border-black/5 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center group shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">{t('dream_interpretation')}</span>
            </div>
            <div 
              onClick={() => onNavigate("muslim-ai")}
              className="bg-[var(--color-surface)] border border-black/5 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center group shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">{t('recitation_correction')}</span>
            </div>
            <div 
              onClick={() => onNavigate("muslim-ai")}
              className="bg-[var(--color-surface)] border border-black/5 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center group shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot size={24} />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">{t('fatwas_and_questions')}</span>
            </div>
            <div 
              onClick={() => onNavigate("muslim-ai")}
              className="bg-[var(--color-surface)] border border-black/5 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center group shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart size={24} />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">{t('spiritual_guide')}</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Tracking Bento */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bento-item-large bento-card bg-[var(--color-surface)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-serif">{t('worship_tracker')}</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-primary)]/10 rounded-full">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-[var(--color-primary)]">
                {streak} {t('days_streak')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Prayer Tracker */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                {t('prayers')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prayersList.filter(p => p.id !== "Sunrise").map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePrayer(p.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                      prayedToday[p.id]
                        ? "bg-[var(--color-primary)] text-white shadow-lg"
                        : "bg-black/5 dark:bg-white/5 text-[var(--color-text-muted)] hover:bg-black/10 dark:hover:bg-white/10"
                    }`}
                  >
                    {p.name[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Tracker: Fasting or Duha */}
            {fastingOccasion ? (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest truncate">
                  {fastingOccasion}
                </p>
                <button
                  onClick={toggleFasting}
                  className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    isFasting
                      ? "bg-orange-500 text-white shadow-lg"
                      : "bg-black/5 dark:bg-white/5 text-[var(--color-text-muted)]"
                  }`}
                >
                  <Moon size={14} />
                  <span className="text-xs font-bold">{isFasting ? t('fasting') : t('not_fasting')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest truncate">
                  {t('duha_prayer')}
                </p>
                <button
                  onClick={toggleDuha}
                  className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    isDuhaPrayed
                      ? "bg-amber-500 text-white shadow-lg"
                      : "bg-black/5 dark:bg-white/5 text-[var(--color-text-muted)]"
                  }`}
                >
                  <Sun size={14} />
                  <span className="text-xs font-bold">{isDuhaPrayed ? t('prayed') : t('not_prayed')}</span>
                </button>
              </div>
            )}

            {/* Quran Tracker */}
            <div className="space-y-3 cursor-pointer" onClick={() => onNavigate("quran")}>
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                {t('quran')}
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--color-text)] truncate">
                  {lastReadQuran ? lastReadQuran.surahName : t('start_reading')}
                </span>
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] w-1/3"></div>
                </div>
              </div>
            </div>

            {/* Dhikr Tracker */}
            <div className="space-y-3 cursor-pointer" onClick={() => onNavigate("tasbeeh")}>
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                {t('azkar')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-text)]">
                  {tasbeehProgress ? `${tasbeehProgress.count}/${tasbeehProgress.target}` : "0/100"}
                </span>
                <Activity size={14} className="text-[var(--color-primary)]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Features Grid 3D */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-4"
      >
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(item.id)}
            className="card-3d flex flex-col items-center justify-center p-5 gap-3 aspect-square group"
          >
            <div
              className={`w-14 h-14 rounded-full ${item.bg} ${item.color} flex items-center justify-center shadow-inner group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all`}
            >
              {item.icon}
            </div>
            <span className="text-xs font-bold text-[var(--color-text)] text-center leading-tight">
              {item.title}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

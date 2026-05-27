import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Sparkles,
  Award,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
}

interface GregorianDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string };
  month: { number: number; en: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
}

interface CalendarDay {
  hijri: HijriDate;
  gregorian: GregorianDate;
}

const EVENTS = [
  { month: 9, day: 1, title: "بداية شهر رمضان المبارك 🌙" },
  { month: 9, day: 17, title: "ذكرى غزوة بدر الكبرى ⚔️" },
  { month: 9, day: 20, title: "ذكرى فتح مكة المكرمة 🕋" },
  { month: 9, day: 21, title: "بداية العشر الأواخر من رمضان ✨" },
  { month: 10, day: 1, title: "عيد الفطر المبارك 🎉" },
  { month: 12, day: 9, title: "يوم عرفة العظيم 🤲" },
  { month: 12, day: 10, title: "عيد الأضحى المبارك 🐑" },
  { month: 1, day: 1, title: "رأس السنة الهجرية الجديدة 🏔️" },
  { month: 1, day: 10, title: "يوم عاشوراء المبارك 🌊" },
  { month: 3, day: 12, title: "المولد النبوي الشريف ﷺ 🌸" },
  { month: 7, day: 27, title: "ذكرى الإسراء والمعراج 🌌" },
  { month: 8, day: 15, title: "ليلة النصف من شعبان 🕌" },
];

export default function HijriCalendar({ onBack }: { onBack?: () => void }) {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hijriMonthName, setHijriMonthName] = useState("");
  const [hijriYear, setHijriYear] = useState("");
  
  // Selected day details for premium interactive popup
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [userNotes, setUserNotes] = useState<{ [key: string]: string[] }>(() => {
    try {
      return JSON.parse(localStorage.getItem("hijri_calendar_devotions") || "{}");
    } catch {
      return {};
    }
  });
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    fetchCalendar(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    localStorage.setItem("hijri_calendar_devotions", JSON.stringify(userNotes));
  }, [userNotes]);

  const fetchCalendar = async (month: number, year: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`,
      );
      const data = await res.json();
      setCalendarData(data.data);

      if (data.data.length > 0) {
        setHijriMonthName(data.data[0].hijri.month.ar);
        setHijriYear(data.data[0].hijri.year);
        
        // Auto-select today
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        const foundToday = data.data.find((d: CalendarDay) => d.gregorian.date === todayStr);
        if (foundToday) {
          setSelectedDay(foundToday);
        } else {
          setSelectedDay(data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getEventForDay = (hijriMonth: number, hijriDay: number) => {
    return EVENTS.find((e) => e.month === hijriMonth && e.day === hijriDay);
  };

  // Astronomical Moon Phase SVG Generator based on Hijri Day
  const getMoonPhaseDetails = (dayNum: number): { name: string; description: string; svg: React.ReactNode } => {
    if (dayNum === 1) {
      return {
        name: "محاق (هلال الليلة الأولى)",
        description: "بداية الشهر الهجري المبارك وولادة الهلال الجديد.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#1e293b" opacity="0.9" />
            <path d="M50 10 A40 40 0 0 1 50 90 A40 40 0 0 0 50 10" fill="#fbbf24" opacity="0.2" />
          </svg>
        )
      };
    } else if (dayNum >= 2 && dayNum <= 7) {
      return {
        name: "هلال متزايد (تربيع أول مبكر)",
        description: "رؤية مباركة وسنة تكبير واستهلال.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#1e293b" />
            <path d="M50 10 A40 40 0 0 1 50 90 A30 40 0 0 0 50 10" fill="#fbbf24" />
          </svg>
        )
      };
    } else if (dayNum === 8) {
      return {
        name: "التربيع الأول",
        description: "نصف القمر مضاء تماماً باليمين.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#1e293b" />
            <path d="M50 10 A40 40 0 0 1 50 90 Z" fill="#fbbf24" />
          </svg>
        )
      };
    } else if (dayNum >= 9 && dayNum <= 12) {
      return {
        name: "أحدب متزايد",
        description: "اكتمل معظم وجه القمر استعداداً لليالي البيض.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#1e293b" />
            <path d="M50 10 A40 40 0 0 1 50 90 A-15 40 0 0 1 50 10" fill="#fbbf24" />
          </svg>
        )
      };
    } else if (dayNum >= 13 && dayNum <= 15) {
      return {
        name: `البدر الكامل (ليالي البيض: ${dayNum})`,
        description: "بدر ساطع. يُسن صيام الأيام البيض (١٣، ١٤، ١٥) لنيل الأجر العظيم.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-xl animate-pulse">
            <circle cx="50" cy="50" r="40" fill="#334155" />
            <circle cx="50" cy="50" r="40" fill="url(#grad)" />
            <defs>
              <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="70%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#f59e0b" />
              </radialGradient>
            </defs>
          </svg>
        )
      };
    } else if (dayNum >= 16 && dayNum <= 21) {
      return {
        name: "أحدب متناقص",
        description: "بدأ البدر بالتراجع رويداً رويداً.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#f59e0b" />
            <path d="M50 10 A40 40 0 0 1 50 90 A-15 40 0 0 0 50 10" fill="#1e293b" />
          </svg>
        )
      };
    } else if (dayNum === 22) {
      return {
        name: "التربيع الأخير",
        description: "نصف القمر الأيسر فقط مضاء.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#fbbf24" />
            <path d="M50 10 A40 40 0 0 1 50 90 Z" fill="#1e293b" />
          </svg>
        )
      };
    } else if (dayNum >= 23 && dayNum <= 28) {
      return {
        name: "هلال متناقص (المحاق الأخير)",
        description: "يتناقص الهلال استعداداً لاختتام الشهر وبداية دورة جديدة.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#fbbf24" />
            <path d="M50 10 A40 40 0 0 1 50 90 A30 40 0 0 1 50 10" fill="#1e293b" />
          </svg>
        )
      };
    } else {
      return {
        name: "محاق (مظلم)",
        description: "قمر غائب تماماً بانتظار ولادة الشهر الهجري القادم.",
        svg: (
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#0f172a" />
          </svg>
        )
      };
    }
  };

  // Notes and Goals handlers
  const handleAddGoal = () => {
    if (!selectedDay || !noteInput.trim()) return;
    const key = selectedDay.hijri.date;
    const currentList = userNotes[key] || [];
    setUserNotes({
      ...userNotes,
      [key]: [...currentList, noteInput.trim()]
    });
    setNoteInput("");
  };

  const handleDeleteGoal = (index: number) => {
    if (!selectedDay) return;
    const key = selectedDay.hijri.date;
    const currentList = userNotes[key] || [];
    const updated = currentList.filter((_, idx) => idx !== index);
    if (updated.length === 0) {
      const copy = { ...userNotes };
      delete copy[key];
      setUserNotes(copy);
    } else {
      setUserNotes({
        ...userNotes,
        [key]: updated
      });
    }
  };

  // Determine standard fasting days (Mondays, Thursdays, and Ayam Al-Beed)
  const isFastingDayRecommendation = (day: CalendarDay): { status: boolean; msg: string } => {
    const isMonday = day.hijri.weekday.en.toLowerCase() === "monday";
    const isThursday = day.hijri.weekday.en.toLowerCase() === "thursday";
    const hijriDayNum = parseInt(day.hijri.day);
    const isAyamBeed = hijriDayNum === 13 || hijriDayNum === 14 || hijriDayNum === 15;
    
    // Exception: Ramadan (fasting is already obligatory)
    if (day.hijri.month.number === 9) {
      return { status: true, msg: "صيام فريضة شهر رمضان المبارك 🕋" };
    }

    if (isAyamBeed) {
      return { status: true, msg: "صيام سنة الأيام البيض المباركة (الأجر كصيام الدهر)" };
    }
    if (isMonday) {
      return { status: true, msg: "صيام تطوع سنة يوم الاثنين (سنة النبي ﷺ)" };
    }
    if (isThursday) {
      return { status: true, msg: "صيام تطوع سنة يوم الخميس (ترفع فيه الأعمال)" };
    }
    return { status: false, msg: "" };
  };

  if (loading && calendarData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] bg-slate-50 dark:bg-[#07130F]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-md mx-auto p-4 space-y-5 pb-24 min-h-screen bg-slate-50 dark:bg-[#07130F] text-slate-800 dark:text-slate-100"
      dir="rtl"
    >
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-2 flex items-center justify-center p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs text-slate-600 dark:text-slate-300 w-max"
        >
          <ArrowRight size={18} className="ml-1 text-emerald-500" />
          <span className="text-xs font-bold font-serif">العودة للرئيسية</span>
        </button>
      )}

      {/* Decorative 3D Hijri Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 rounded-[2.5rem] p-6 text-white shadow-lg shadow-amber-500/30 relative overflow-hidden border border-amber-400/30"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-xs"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-950/20 rounded-full -ml-10 -mb-10 blur-xs"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-[20px] flex items-center justify-center mb-3 border border-white/30 shadow-inner">
            <CalendarIcon size={28} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold font-serif drop-shadow-md text-white">
            التقويم الهجري التفاعلي
          </h1>
          <p className="text-amber-50 text-[11px] font-medium tracking-wide">
            رصد منازل القمر، السنن، ومذكرات العبادة اليومية المخصصة الواقعية 🌙
          </p>
        </div>
      </motion.div>

      {/* Hijri Month Controls */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-[2rem]"
      >
        <button
          onClick={handlePrevMonth}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
        >
          <ChevronRight size={20} className="text-slate-500 dark:text-slate-400 hover:text-amber-500" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black font-serif text-amber-600 dark:text-amber-500 mb-0.5">
            {hijriMonthName} {hijriYear} هـ
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {new Date(currentYear, currentMonth - 1).toLocaleString("ar-SA", {
              month: "long",
            })}{" "}
            {currentYear} م
          </p>
        </div>
        <button
          onClick={handleNextMonth}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
        >
          <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400 hover:text-amber-500" />
        </button>
      </motion.div>

      {/* Interactive Grid Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-[2rem] relative"
      >
        <div className="grid grid-cols-7 gap-1.5 mb-3 text-center">
          {["الأحد", "الأثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map((day, i) => (
            <div key={i} className="text-[10px] font-bold text-amber-600 dark:text-amber-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty placeholders to align days correctly */}
          {calendarData.length > 0 &&
            Array.from({
              length: new Date(currentYear, currentMonth - 1, 1).getDay(),
            }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square opacity-20"></div>
            ))}

          {calendarData.map((day, i) => {
            const hijriDayVal = parseInt(day.hijri.day);
            const event = getEventForDay(day.hijri.month.number, hijriDayVal);
            const isToday = day.gregorian.date === new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
            const isSelected = selectedDay && selectedDay.hijri.date === day.hijri.date;
            const fastingRec = isFastingDayRecommendation(day);
            const notesList = userNotes[day.hijri.date] || [];

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative cursor-pointer border transition-all duration-300 ${
                  isToday
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md border-amber-400"
                    : isSelected
                      ? "bg-amber-100/50 dark:bg-amber-500/10 border-amber-400 text-amber-600 dark:text-amber-500 font-bold scale-[1.02]"
                      : event
                        ? "bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-500/20"
                        : fastingRec.status
                          ? "bg-emerald-50/70 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-500 border-emerald-100 dark:border-emerald-500/10"
                          : "bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800 border-transparent"
                }`}
              >
                <span className="text-[15px] font-serif font-black">
                  {hijriDayVal}
                </span>
                <span className={`text-[9px] ${isToday ? 'text-white/80' : 'text-slate-400'}`}>
                  {parseInt(day.gregorian.day)}
                </span>
                
                {/* Visual Indicators */}
                <div className="absolute bottom-1 flex gap-0.5 justify-center">
                  {event && (
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  )}
                  {notesList.length > 0 && (
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Day Dynamic Interactive View */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedDay.hijri.date}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md rounded-[2rem] space-y-4"
          >
            {/* Day Title with realistic moon graphics */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                {/* Interactive Moon Icon Display */}
                {getMoonPhaseDetails(parseInt(selectedDay.hijri.day)).svg}
                <div>
                  <h4 className="font-extrabold text-amber-600 dark:text-amber-500 text-base leading-none">
                    {selectedDay.hijri.day} {selectedDay.hijri.month.ar} {selectedDay.hijri.year} هـ
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    {selectedDay.hijri.weekday.ar} • {selectedDay.gregorian.weekday.en}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-600 dark:text-slate-300">
                  {selectedDay.gregorian.date} م
                </span>
                <span className="text-[9px] text-slate-400 block font-serif">البلد: مكة المكرمة</span>
              </div>
            </div>

            {/* Moon Phase description */}
            <div className="bg-amber-500/10 dark:bg-amber-500/5 p-3 rounded-2xl border border-amber-500/20 text-xs">
              <span className="font-extrabold text-amber-600 dark:text-amber-400 block mb-1">
                منزلة القمر اليوم: {getMoonPhaseDetails(parseInt(selectedDay.hijri.day)).name}
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-serif text-[11px]">
                {getMoonPhaseDetails(parseInt(selectedDay.hijri.day)).description}
              </p>
            </div>

            {/* Fasting & General Recommendations */}
            {(() => {
              const rec = isFastingDayRecommendation(selectedDay);
              if (rec.status) {
                return (
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-400">
                    <Award size={16} className="text-emerald-500 shrink-0" />
                    <span className="font-black leading-tight">{rec.msg}</span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Custom Events / Historical Hijri Incident */}
            {(() => {
              const hist = getEventForDay(selectedDay.hijri.month.number, parseInt(selectedDay.hijri.day));
              if (hist) {
                return (
                  <div className="bg-orange-50 dark:bg-orange-500/5 p-3 border border-orange-200 dark:border-orange-500/10 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-extrabold">
                      <Sparkles size={14} />
                      <span>حدث تاريخي إيماني في مثل هذا اليوم:</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium font-serif">{hist.title}</p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Daily Devotional Tracker & Notes for that Hijri Day */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-slate-500 flex items-center gap-1.5 px-1">
                <CheckCircle size={14} className="text-indigo-500" />
                <span>أهدافي وعباداتي ومذكراتي لهذا اليوم الهجري:</span>
              </h5>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="مثال: ختم جزء جديد، صيام غد لله، دعاء محدد..."
                  className="flex-1 text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
                />
                <button
                  onClick={handleAddGoal}
                  className="bg-indigo-500 text-white hover:bg-indigo-600 p-2.5 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(userNotes[selectedDay.hijri.date] || []).map((note, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span className="flex-1 text-right font-serif font-bold">{note}</span>
                    <button
                      onClick={() => handleDeleteGoal(index)}
                      className="text-red-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                
                {(!userNotes[selectedDay.hijri.date] || userNotes[selectedDay.hijri.date].length === 0) && (
                  <div className="text-center py-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-[10px]">
                    قم بتدوين نوايا الصيام، ختم القرآن، أو سنن السواك وقيام الليل لهذا اليوم لتثبيتها بجدول عملك الإلهي التفاعلي.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Historical Calendar Events */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h3 className="font-extrabold text-amber-600 dark:text-amber-500 px-2 font-serif text-base">
          المناسبات الإسلامية لهذا الشهر الهجري
        </h3>
        {calendarData
          .filter((day) => getEventForDay(day.hijri.month.number, parseInt(day.hijri.day)))
          .map((day) => {
            const histEvent = getEventForDay(day.hijri.month.number, parseInt(day.hijri.day));
            if (!histEvent) return null;
            return (
              <div
                key={day.hijri.date}
                onClick={() => setSelectedDay(day)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center gap-3 shadow-xs hover:border-amber-500/40 hover:scale-[1.01] transition-all relative"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex flex-col items-center justify-center text-amber-500 border border-amber-100 dark:border-amber-500/20 font-bold">
                  <span className="text-lg leading-none">{parseInt(day.hijri.day)}</span>
                  <span className="text-[9px] mt-0.5">{day.hijri.month.ar}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                    {histEvent.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{day.gregorian.date} م</p>
                </div>
              </div>
            );
          })}
        
        {calendarData.filter((day) =>
          getEventForDay(day.hijri.month.number, parseInt(day.hijri.day)),
        ).length === 0 && (
          <div className="text-center text-slate-400 text-[11px] py-6 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800">
             لا توجد مناسبات مسجلة أو غنائم تاريخية مصادفة لهذا الشهر الهجري المفعل.
          </div>
        )}
      </motion.div>
    </div>
  );
}

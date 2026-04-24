import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";

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
  { month: 9, day: 1, title: "بداية شهر رمضان" },
  { month: 10, day: 1, title: "عيد الفطر المبارك" },
  { month: 12, day: 9, title: "يوم عرفة" },
  { month: 12, day: 10, title: "عيد الأضحى المبارك" },
  { month: 1, day: 1, title: "رأس السنة الهجرية" },
  { month: 3, day: 12, title: "المولد النبوي الشريف" },
  { month: 7, day: 27, title: "الإسراء والمعراج" },
  { month: 8, day: 15, title: "النصف من شعبان" },
];

export default function HijriCalendar() {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hijriMonthName, setHijriMonthName] = useState("");
  const [hijriYear, setHijriYear] = useState("");

  useEffect(() => {
    fetchCalendar(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  const fetchCalendar = async (month: number, year: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`,
      );
      const data = await res.json();
      setCalendarData(data.data);

      // Set Hijri month and year from the first day of the month
      if (data.data.length > 0) {
        setHijriMonthName(data.data[0].hijri.month.ar);
        setHijriYear(data.data[0].hijri.year);
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

  if (loading && calendarData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-md mx-auto p-4 space-y-6 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950"
      dir="rtl"
    >
      {/* Header 3D */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-3xl p-6 text-slate-800 dark:text-slate-100 shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold font-serif mb-2 flex items-center gap-2 drop-shadow-md text-slate-800 dark:text-slate-100">
            <CalendarIcon size={24} className="text-emerald-500" />
            التقويم الهجري
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">مواقيت ومناسبات</p>
        </div>
      </motion.div>

      {/* Calendar Controls 3D */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card-3d p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-lg rounded-3xl"
      >
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-black/10 dark:hover:border-white/10 bg-black/5 dark:bg-white/5"
        >
          <ChevronRight
            size={24}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100"
          />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100">
            {hijriMonthName} {hijriYear}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {new Date(currentYear, currentMonth - 1).toLocaleString("ar-EG", {
              month: "long",
            })}{" "}
            {currentYear}
          </p>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-black/10 dark:hover:border-white/10 bg-black/5 dark:bg-white/5"
        >
          <ChevronLeft size={24} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100" />
        </button>
      </motion.div>

      {/* Calendar Grid 3D */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card-3d p-4 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-lg rounded-3xl"
      >
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((day, i) => (
            <div key={i} className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Empty slots for first day of month */}
          {calendarData.length > 0 &&
            Array.from({
              length: new Date(currentYear, currentMonth - 1, 1).getDay(),
            }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

          {calendarData.map((day, i) => {
            const event = getEventForDay(
              day.hijri.month.number,
              parseInt(day.hijri.day),
            );
            const isToday =
              day.gregorian.date ===
              new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl relative cursor-pointer transition-colors ${
                  isToday
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-emerald-400/50"
                    : event
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner"
                      : "bg-black/5 dark:bg-white/5 text-slate-800 dark:text-slate-100 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5"
                }`}
                title={event?.title}
              >
                <span className="text-sm font-bold font-mono">
                  {parseInt(day.hijri.day)}
                </span>
                <span
                  className={`text-[8px] ${isToday ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {parseInt(day.gregorian.day)}
                </span>
                {event && !isToday && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(212,175,55,0.8)]"></div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Events List 3D */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h3 className="font-bold text-emerald-400 px-2 font-serif">مناسبات الشهر</h3>
        {calendarData.map((day) => {
          const event = getEventForDay(
            day.hijri.month.number,
            parseInt(day.hijri.day),
          );
          if (!event) return null;

          return (
            <div
              key={day.hijri.date}
              className="card-3d p-4 bg-white dark:bg-slate-900 flex items-center gap-4 border-r-4 border-emerald-500 rounded-2xl shadow-lg border-y border-l border-black/5 dark:border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 shadow-inner">
                <span className="text-lg leading-none">
                  {parseInt(day.hijri.day)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{day.hijri.month.ar}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{event.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{day.gregorian.date}</p>
              </div>
            </div>
          );
        })}
        {calendarData.filter((day) =>
          getEventForDay(day.hijri.month.number, parseInt(day.hijri.day)),
        ).length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm py-4 bg-white dark:bg-slate-900 rounded-2xl border border-white/5 shadow-inner">
            لا توجد مناسبات في هذا الشهر
          </div>
        )}
      </motion.div>
    </div>
  );
}

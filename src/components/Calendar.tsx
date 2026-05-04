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
        className="bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 rounded-[2.5rem] p-8 text-white shadow-[0_15px_30px_-10px_rgba(245,158,11,0.5)] relative overflow-hidden border border-amber-400/30"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/20 rounded-full -mr-12 -mt-12 "></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-900/20 rounded-full -ml-10 -mb-10 "></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[16px] flex items-center justify-center mb-4 border border-white/30 shadow-inner">
            <CalendarIcon size={32} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-bold font-serif mb-2 drop-shadow-md text-white">
            التقويم الهجري
          </h1>
          <p className="text-amber-50 font-medium">مواقيت وأيام مباركة</p>
        </div>
      </motion.div>

      {/* Calendar Controls 3D */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card-3d p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] rounded-[2rem]"
      >
        <button
          onClick={handlePrevMonth}
          className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800"
        >
          <ChevronRight
            size={24}
            className="text-slate-500 dark:text-slate-400"
          />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-500 mb-1">
            {hijriMonthName} {hijriYear}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            {new Date(currentYear, currentMonth - 1).toLocaleString("ar-EG", {
              month: "long",
            })}{" "}
            {currentYear}
          </p>
        </div>
        <button
          onClick={handleNextMonth}
          className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800"
        >
          <ChevronLeft size={24} className="text-slate-500 dark:text-slate-400" />
        </button>
      </motion.div>

      {/* Calendar Grid 3D */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card-3d p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] relative"
      >
        <div className="absolute top-0 left-8 right-8 flex justify-around -mt-3">
           <div className="w-3 h-8 bg-slate-200 dark:bg-slate-700 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm"></div>
           <div className="w-3 h-8 bg-slate-200 dark:bg-slate-700 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm"></div>
           <div className="w-3 h-8 bg-slate-200 dark:bg-slate-700 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm"></div>
           <div className="w-3 h-8 bg-slate-200 dark:bg-slate-700 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm"></div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4 text-center mt-3">
          {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((day, i) => (
            <div key={i} className="text-xs font-bold text-amber-600 dark:text-amber-500">
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
                whileHover={{ scale: 1.1, translateY: -2 }}
                className={`aspect-square flex flex-col items-center justify-center rounded-[14px] relative cursor-pointer transition-all duration-300 ${
                  isToday
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 border border-amber-400"
                    : event
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/30"
                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                }`}
                title={event?.title}
              >
                <span className="text-[15px] font-bold font-mono">
                  {parseInt(day.hijri.day)}
                </span>
                <span
                  className={`text-[9px] font-medium mt-0.5 ${isToday ? "text-white/80" : "text-slate-400"}`}
                >
                  {parseInt(day.gregorian.day)}
                </span>
                {event && !isToday && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-sm"></div>
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
        className="space-y-4"
      >
        <h3 className="font-bold text-amber-600 dark:text-amber-500 px-2 font-serif text-lg">مناسبات الشهر</h3>
        {calendarData.map((day) => {
          const event = getEventForDay(
            day.hijri.month.number,
            parseInt(day.hijri.day),
          );
          if (!event) return null;

          return (
            <div
              key={day.hijri.date}
              className="bg-white dark:bg-slate-900 rounded-[20px] p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full -mr-8 -mt-8 "></div>
              
              <div className="w-14 h-14 rounded-[16px] bg-amber-50 dark:bg-amber-500/10 flex flex-col items-center justify-center text-amber-500 font-bold border border-amber-100 dark:border-amber-500/20">
                <span className="text-xl leading-none">
                  {parseInt(day.hijri.day)}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">{day.hijri.month.ar}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{event.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{day.gregorian.date}</p>
              </div>
            </div>
          );
        })}
        {calendarData.filter((day) =>
          getEventForDay(day.hijri.month.number, parseInt(day.hijri.day)),
        ).length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm py-8 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)]">
            لا يوجد مناسبات مسجلة هذا الشهر
          </div>
        )}
      </motion.div>
    </div>
  );
}

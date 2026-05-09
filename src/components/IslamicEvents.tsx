import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Info, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Event {
  title: string;
  month: number;
  day: number;
  dateStr?: string;
  daysRemaining?: number;
  isPast?: boolean;
}

export default function IslamicEvents({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHijriDate, setCurrentHijriDate] = useState<{ day: number, month: number, year: number } | null>(null);

  useEffect(() => {
    fetchCurrentDate();
  }, []);

  const fetchCurrentDate = async () => {
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const dateStr = `${dd}-${mm}-${yyyy}`;

      // Calculate fallback using Intl.DateTimeFormat if needed
      let hDay, hMonth, hYear;
      try {
        const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${dateStr}`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        
        const hijri = data.data.hijri;
        hDay = parseInt(hijri.day);
        hMonth = hijri.month.number;
        hYear = parseInt(hijri.year);
      } catch (err) {
        console.warn('Fallback to Intl.DateTimeFormat for Hijri date', err);
        const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
          day: 'numeric', month: 'numeric', year: 'numeric'
        }).formatToParts(today);
        
        hDay = parseInt(parts.find(p => p.type === 'day')?.value || '1');
        hMonth = parseInt(parts.find(p => p.type === 'month')?.value || '1');
        hYear = parseInt(parts.find(p => p.type === 'year')?.value || '1445');
      }

      setCurrentHijriDate({ day: hDay, month: hMonth, year: hYear });

      const islamicEvents: Event[] = [
        { title: "رأس السنة الهجرية", month: 1, day: 1 },
        { title: "عاشوراء", month: 1, day: 10 },
        { title: "المولد النبوي الشريف", month: 3, day: 12 },
        { title: "الإسراء والمعراج", month: 7, day: 27 },
        { title: "النصف من شعبان", month: 8, day: 15 },
        { title: "بداية شهر رمضان", month: 9, day: 1 },
        { title: "غزوة بدر الكبرى", month: 9, day: 17 },
        { title: "فتح مكة", month: 9, day: 20 },
        { title: "ليلة القدر", month: 9, day: 27 },
        { title: "عيد الفطر", month: 10, day: 1 },
        { title: "يوم التروية", month: 12, day: 8 },
        { title: "يوم عرفة", month: 12, day: 9 },
        { title: "عيد الأضحى", month: 12, day: 10 },
        { title: "أيام التشريق", month: 12, day: 11 },
      ];

      // Calculate days remaining roughly for sorting
      const processedEvents = islamicEvents.map(ev => {
        let remainingMonths = ev.month - hMonth;
        let remainingDays = ev.day - hDay;
        
        // Very rough approximation for sorting
        let totalDaysDiff = (remainingMonths * 29.5) + remainingDays;
        
        let isPast = totalDaysDiff < 0;
        if (isPast) {
          // It's coming next year
          totalDaysDiff += 354; // approximate lunar year
        }

        return {
          ...ev,
          daysRemaining: totalDaysDiff,
          isPast: isPast
        };
      });

      processedEvents.sort((a, b) => (a.daysRemaining || 0) - (b.daysRemaining || 0));
      setEvents(processedEvents);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    return months[month - 1];
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20 overflow-y-auto">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
            <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-xl font-bold font-kufi">المناسبات الإسلامية</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev, idx) => {
              const isToday = ev.daysRemaining !== undefined && ev.daysRemaining < 1 && ev.daysRemaining > -1;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border ${isToday ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-100 dark:border-slate-700'} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      <span className="text-lg font-bold leading-none">{ev.day}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {ev.day} {getMonthName(ev.month)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-left shrink-0">
                    {isToday ? (
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        اليوم!
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold">
                        {Math.round(ev.daysRemaining || 0)} يوم
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

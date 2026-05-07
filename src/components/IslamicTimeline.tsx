import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Hourglass } from 'lucide-react';

const timelineEvents = [
  { year: "1 هـ", event: "الهجرة النبوية", desc: "هجرة النبي محمد ﷺ من مكة إلى المدينة المنورة وتأسيس الدولة الإسلامية." },
  { year: "2 هـ", event: "غزوة بدر الكبرى", desc: "أول معركة فاصلة في الإسلام، انتصر فيها المسلمون على قريش." },
  { year: "3 هـ", event: "غزوة أحد", desc: "المعركة الثانية بين المسلمين وقريش عند جبل أحد." },
  { year: "5 هـ", event: "غزوة الخندق (الأحزاب)", desc: "حصار المدينة من قبل جيوش الأحزاب وخندق سلمان الفارسي." },
  { year: "6 هـ", event: "صلح الحديبية", desc: "معاهدة سلام بين المسلمين وقريش فتحت الباب للانتشار الواسع للإسلام." },
  { year: "8 هـ", event: "فتح مكة", desc: "دخول النبي ﷺ مكة فاتحاً دون قتال وإزالة الأصنام من الكعبة." },
  { year: "10 هـ", event: "حجة الوداع", desc: "الحجة الوحيدة التي أداها النبي ﷺ وخطبته الشهيرة التي أرسى فيها مبادئ الإسلام." },
  { year: "11 هـ", event: "وفاة النبي ﷺ", desc: "انتقال النبي ﷺ إلى الرفيق الأعلى وتولي أبو بكر الصديق الخلافة." },
  { year: "13 هـ", event: "تولي عمر بن الخطاب", desc: "بداية الفتوحات الإسلامية الكبرى في الشام والعراق ومصر." },
  { year: "23 هـ", event: "تولي عثمان بن عفان", desc: "جمع القرآن الكريم في مصحف واحد وبداية الأسطول البحري الإسلامي." },
  { year: "35 هـ", event: "تولي علي بن أبي طالب", desc: "نقل العاصمة إلى الكوفة وظهور بعض الفتن السياسية." },
  { year: "41 هـ", event: "الدولة الأموية", desc: "تأسيس الدولة الأموية على يد معاوية بن أبي سفيان في دمشق." },
  { year: "132 هـ", event: "الدولة العباسية", desc: "سقوط الدولة الأموية وقيام الخلافة العباسية ونقل العاصمة إلى بغداد." },
];

export default function IslamicTimeline({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20 overflow-y-auto">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
            <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-xl font-bold font-kufi">خط الزمن الإسلامي</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto py-8">
        <div className="flex items-center gap-3 mb-8 text-emerald-600 dark:text-emerald-400 justify-center">
          <Hourglass size={32} />
          <h2 className="text-2xl font-bold font-kufi">أحداث شكلت التاريخ الإسلامي</h2>
        </div>

        <div className="relative border-r-2 border-emerald-200 dark:border-emerald-800 pr-6 mr-3 space-y-8">
          {timelineEvents.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Timeline Dot */}
              <div className="absolute -right-8 top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-50 dark:ring-slate-900 z-10"></div>
              
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="inline-block bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold font-mono mb-2">
                  {item.year}
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{item.event}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

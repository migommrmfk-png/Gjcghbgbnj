import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, History, Plus, Minus, RotateCcw, AlertTriangle, Save, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface QazaPrayers {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

export default function QazaTracker({ onBack }: { onBack: () => void }) {
  const [qaza, setQaza] = useState<QazaPrayers>({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("qazaPrayers");
    if (saved) {
      try {
        setQaza(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse qaza prayers", e);
      }
    }
  }, []);

  const updateQaza = (prayer: keyof QazaPrayers, amount: number) => {
    setQaza((prev) => {
      const newValue = Math.max(0, prev[prayer] + amount); // Prevent negative
      return { ...prev, [prayer]: newValue };
    });
    setHasUnsavedChanges(true);
  };

  const calculateTotal = () => {
    return Object.values(qaza).reduce((a, b) => a + b, 0);
  };

  const saveQaza = () => {
    localStorage.setItem("qazaPrayers", JSON.stringify(qaza));
    setHasUnsavedChanges(false);
    toast.success("تم حفظ التعديلات بنجاح");
  };

  const PRAYERS = [
    { id: "fajr" as keyof QazaPrayers, name: "الفجر", color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
    { id: "dhuhr" as keyof QazaPrayers, name: "الظهر", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
    { id: "asr" as keyof QazaPrayers, name: "العصر", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
    { id: "maghrib" as keyof QazaPrayers, name: "المغرب", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
    { id: "isha" as keyof QazaPrayers, name: "العشاء", color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-300" },
    { id: "witr" as keyof QazaPrayers, name: "الوتر", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 bg-gradient-to-bl from-rose-600 via-rose-700 to-red-900 text-white rounded-b-[2.5rem] shadow-xl shrink-0 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (hasUnsavedChanges) saveQaza();
                onBack();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/20"
            >
              <ArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-serif">قضاء الصلوات</h1>
              <p className="text-rose-100 text-sm opacity-90 mt-1">تتبع ما فاتك من صلوات لتقضيها</p>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
            <History size={24} className="text-rose-200" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {/* Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-start gap-4 flex-col sm:flex-row">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center shrink-0 text-amber-500">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">عن قضاء الفوائت</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              اتفق العلماء على وجوب قضاء الصلوات المفروضة التي فاتت لأي عذر. قم بتسجيل ما فاتك هنا، وكلما صليت نافلة أو صليت فرضاً، اقضِ معه فرضاً فائتاً لعل الله يعفو عنك.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-2xl text-center">
             <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">{calculateTotal()}</div>
             <div className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70">إجمالي الفوائت</div>
          </div>
          <button 
             onClick={() => {
               if(window.confirm("هل أنت متأكد من تصفير جميع الصلوات؟ (يُستخدم فقط إذا أتممت القضاء بالاجمال)")) {
                  setQaza({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 });
                  setHasUnsavedChanges(true);
               }
             }}
             className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-900/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-colors"
          >
             <RotateCcw size={24} className="text-slate-400 group-hover:text-red-500 transition-colors" />
             <div className="text-xs font-bold text-slate-500 group-hover:text-red-600 transition-colors">تصفير الكل</div>
          </button>
        </div>

        {/* Counters */}
        <div className="space-y-3">
          {PRAYERS.map((prayer) => (
            <div key={prayer.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className={`w-3 h-10 ${prayer.bg} rounded-full`}></div>
                 <div>
                   <h3 className={`font-bold text-lg ${prayer.color} dark:${prayer.color}`}>{prayer.name}</h3>
                   <p className="text-xs text-slate-400 font-medium">متبقي: <span className="font-bold text-slate-600 dark:text-slate-300">{qaza[prayer.id]}</span></p>
                 </div>
               </div>

               <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => updateQaza(prayer.id, 1)}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all text-red-500"
                  >
                    <Plus size={20} />
                  </button>
                  <div className="w-8 text-center font-bold text-lg text-slate-800 dark:text-slate-200">
                    {qaza[prayer.id]}
                  </div>
                  <button 
                    onClick={() => updateQaza(prayer.id, -1)}
                    disabled={qaza[prayer.id] === 0}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all text-emerald-500 disabled:opacity-50 disabled:active:scale-100"
                  >
                    <Minus size={20} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Save Button */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 z-40"
          >
            <button
              onClick={saveQaza}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-l from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_10px_30px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
              <Save size={20} />
              حفظ التعديلات
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

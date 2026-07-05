import React, { useState, useEffect } from "react";
import { Info, ArrowRight, Search, BookOpen, Share2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getFull99Names, NameOfAllah } from "../data/namesOfAllah";
import toast from "react-hot-toast";

export default function NamesOfAllah({ onBack }: { onBack?: () => void }) {
  const [names, setNames] = useState<NameOfAllah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);

  useEffect(() => {
    setNames(getFull99Names());
    setLoading(false);
  }, []);

  const filteredNames = names.filter(
    (n) =>
      n.name.includes(searchQuery) ||
      n.meaning.includes(searchQuery) ||
      n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleShare = (name: NameOfAllah) => {
    const text = `✨ من أسماء الله الحسنى: ${name.name} (${name.transliteration})\n📖 معناه: ${name.meaning}\n🌱 تفسيره: ${name.explanation}\n📌 الشاهد القرآني: ${name.reference}\n\nتمت المشاركة من تطبيق هذا ديني 💚`;
    if (navigator.share) {
      navigator.share({
        title: name.name,
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("تم نسخ اسم الله وشرحه لمشاركته بنجاح! 📋✨");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (selectedName) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="max-w-md mx-auto bg-slate-50 dark:bg-[#07130F] min-h-screen pb-28 relative text-right"
        dir="rtl"
      >
        {/* Floating Background Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="sticky top-0 bg-white/90 dark:bg-[#0A1914]/90 backdrop-blur-md shadow-sm z-20 px-4 py-4 flex items-center gap-4 border-b border-black/5 dark:border-[#122A21]">
          <button
            onClick={() => setSelectedName(null)}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-[#122A21] rounded-2xl transition-all border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A1914] shadow-xs"
          >
            <ArrowRight size={22} className="text-slate-500 hover:text-emerald-500 transition-colors" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-black font-serif text-slate-800 dark:text-slate-100">
              تفاصيل الاسم الشريف
            </h1>
          </div>
          <button
            onClick={() => handleShare(selectedName)}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-[#122A21] rounded-2xl transition-all border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A1914] shadow-xs"
            title="مشاركة"
          >
            <Share2 size={18} className="text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Main Card with Arabic Letter Accent */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-[2.2rem] p-8 text-center bg-gradient-to-br from-[#0F291E] via-[#05110C] to-[#010503] border-2 border-emerald-500/25 text-white relative overflow-hidden shadow-xl"
          >
            {/* Elegant Background elements */}
            <div className="absolute right-0 top-0 w-44 h-44 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="absolute left-0 bottom-0 w-36 h-36 bg-emerald-400/5 rounded-full -ml-10 -mb-10 blur-xl"></div>
            <div className="absolute inset-0 bg-radial-[circle_at_center] from-emerald-500/10 to-transparent opacity-60"></div>
            
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-800 px-3.5 py-1.5 rounded-full inline-block">
                الاسم رقم {selectedName.number.toLocaleString('ar-EG')}
              </span>
              <h2 className="text-6xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 py-1 drop-shadow-[0_4px_12px_rgba(245,158,11,0.2)]">
                {selectedName.name}
              </h2>
              <p className="text-sm font-bold text-slate-450 tracking-wider">
                {selectedName.transliteration}
              </p>
            </div>
          </motion.div>

          {/* Quick Meaning Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-6 bg-white dark:bg-[#0A1914] border border-black/5 dark:border-[#122A21] shadow-xs space-y-3"
          >
            <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-black/5 dark:border-[#122A21] pb-2.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>المعنى المبرور</span>
            </h3>
            <p className="text-slate-800 dark:text-slate-200 font-serif text-lg leading-relaxed font-bold">
              {selectedName.meaning}
            </p>
          </motion.div>

          {/* Detailed Spiritual Explanation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-[2rem] p-6 bg-white dark:bg-[#0A1914] border border-black/5 dark:border-[#122A21] shadow-xs space-y-4"
          >
            <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-black/5 dark:border-[#122A21] pb-2.5">
              <BookOpen size={14} className="text-emerald-500" />
              <span>التفسير والأثر الإيماني للذكر</span>
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-loose text-justify font-serif text-base font-medium">
              {selectedName.explanation}
            </p>
          </motion.div>

          {/* Quranic Reference Witness */}
          {selectedName.reference && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 shadow-xs flex items-center justify-between"
            >
              <div className="text-right">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold block uppercase tracking-wider">الشاهد القرآني الكريم</span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-450 block mt-1 font-serif">
                  {selectedName.reference}
                </span>
              </div>
              <div className="w-9 h-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <BookOpen size={16} />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-28 text-right relative min-h-screen" dir="rtl">
      {/* Floating Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-[#0F291E] via-[#05110C] to-[#010503] rounded-[2.2rem] p-7 text-white shadow-xl relative overflow-hidden border-2 border-emerald-500/20"
      >
        <div className="absolute inset-0 bg-radial-[circle_at_center] from-emerald-500/10 to-transparent opacity-60"></div>
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 right-4 p-2.5 hover:bg-white/10 rounded-2xl transition-all z-20 border border-white/5 bg-black/20"
          >
            <ArrowRight size={20} className="text-white" />
          </button>
        )}
        <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full -mr-10 -mt-10 blur-md"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg transform rotate-3 border border-white/10">
            <Info size={30} className="text-yellow-100" />
          </div>
          <h1 className="text-3xl font-black font-serif mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200">
            أسماء الله الحسنى
          </h1>
          <p className="text-emerald-400 text-xs font-extrabold tracking-widest uppercase">
            ولله الأسماء الحسنى فادعوه بها 🌱
          </p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-white dark:bg-[#0A1914] border border-black/5 dark:border-[#122A21] shadow-xs rounded-[1.5rem]"
      >
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-emerald-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-4 pr-11 py-3.5 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 font-bold placeholder-slate-400 dark:placeholder-slate-550 outline-none text-sm"
          placeholder="ابحث عن اسم الله، تفسيره، رقمه..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Names Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        {filteredNames.map((name, index) => (
          <motion.button
            key={name.number}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(1.5, index * 0.012) }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedName(name)}
            className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 text-center flex flex-col items-center justify-center gap-2 group hover:border-emerald-500/25 hover:shadow-md transition-all border border-black/5 dark:border-[#122A21] shadow-xs cursor-pointer relative overflow-hidden"
          >
            <span className="absolute top-2.5 right-3.5 text-[8px] font-mono text-slate-400 dark:text-slate-500 font-black">
              #{name.number.toLocaleString('ar-EG')}
            </span>
            
            <span className="text-2xl font-black font-serif text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors pt-2.5">
              {name.name}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black">
              {name.meaning}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {filteredNames.length === 0 && (
        <div className="text-center py-12 text-slate-400 font-bold">
          لم يتم العثور على أي نتائج مطابقة لبحثك. 🔍
        </div>
      )}
    </div>
  );
}

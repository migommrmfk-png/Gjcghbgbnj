import React, { useState, useEffect } from "react";
import { Info, ArrowRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NameOfAllah {
  name: string;
  transliteration: string;
  en: { meaning: string };
  ar: { meaning: string };
}

export default function NamesOfAllah({ onBack }: { onBack?: () => void }) {
  const [names, setNames] = useState<NameOfAllah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);

  useEffect(() => {
    fetch("https://api.aladhan.com/v1/asmaAlHusna")
      .then((res) => res.json())
      .then((data) => {
        setNames(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredNames = names.filter(
    (n) =>
      n.name.includes(searchQuery) ||
      n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        className="max-w-md mx-auto bg-white dark:bg-slate-950 min-h-screen pb-24"
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm z-20 px-4 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedName(null)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <ArrowRight size={24} className="text-slate-500 hover:text-emerald-500" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100">
              أسماء الله الحسنى
            </h1>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-3xl p-8 text-center bg-emerald-500 text-white relative overflow-hidden border border-emerald-600 shadow-sm"
          >
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 "></div>
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 "></div>

            <div className="relative z-10">
              <h2 className="text-6xl font-bold font-serif mb-4 text-white">
                {selectedName.name}
              </h2>
              <p className="text-xl font-bold mb-2 text-emerald-100">
                {selectedName.transliteration}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              المعنى
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-loose text-justify font-serif text-lg">
              {/* Fallback to English meaning if Arabic isn't available in API */}
              {selectedName.en.meaning}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-emerald-500 rounded-3xl p-8 text-white shadow-sm relative overflow-hidden border border-emerald-600"
      >
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-20"
          >
            <ArrowRight size={24} className="text-white" />
          </button>
        )}
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 "></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 "></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-white mb-6 shadow-sm transform rotate-3 border border-white/30">
            <Info size={40} />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-2 text-white">
            أسماء الله الحسنى
          </h1>
          <p className="text-emerald-100 text-sm font-bold">
            ولله الأسماء الحسنى فادعوه بها
          </p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl"
      >
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-emerald-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-4 pr-12 py-4 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 font-bold placeholder-slate-400 outline-none"
          placeholder="ابحث عن اسم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Names Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        {filteredNames.map((name, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedName(name)}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-3 group hover:border-emerald-500/30 transition-colors border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <span className="text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
              {name.name}
            </span>
            <span className="text-xs text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-bold transition-colors">
              {name.transliteration}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

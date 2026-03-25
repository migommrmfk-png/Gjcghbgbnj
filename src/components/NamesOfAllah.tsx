import React, { useState, useEffect } from "react";
import { Info, ArrowRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NameOfAllah {
  name: string;
  transliteration: string;
  en: { meaning: string };
  ar: { meaning: string };
}

export default function NamesOfAllah() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (selectedName) {
    return (
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        className="max-w-md mx-auto bg-[var(--color-bg)] min-h-screen pb-24"
        dir="rtl"
      >
        {/* Header 3D */}
        <div className="sticky top-0 bg-[var(--color-bg)]/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 px-4 py-4 flex items-center gap-4 border-b border-black/5 dark:border-white/5">
          <button
            onClick={() => setSelectedName(null)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
          >
            <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold font-serif text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
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
            className="card-3d p-8 text-center bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white relative overflow-hidden border border-[var(--color-primary)]/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
          >
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>

            <div className="relative z-10">
              <h2 className="text-6xl font-bold font-serif mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] text-[var(--color-primary-light)]">
                {selectedName.name}
              </h2>
              <p className="text-xl font-bold mb-2 text-[var(--color-text-muted)]">
                {selectedName.transliteration}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card-3d p-6 bg-[var(--color-surface)] border border-black/5 dark:border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 border-b border-black/5 dark:border-white/10 pb-2">
              المعنى
            </h3>
            <p className="text-[var(--color-text)] leading-loose text-justify font-serif text-lg">
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
      {/* Header 3D */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-[2rem] p-8 text-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden border border-white/10"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-white mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)] transform rotate-3 border border-white/30">
            <Info size={40} />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-2 text-white drop-shadow-md">
            أسماء الله الحسنى
          </h1>
          <p className="text-white/80 text-sm font-bold">
            ولله الأسماء الحسنى فادعوه بها
          </p>
        </div>
      </motion.div>

      {/* Search Bar 3D */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative card-3d overflow-hidden bg-[var(--color-surface)] border border-black/5 dark:border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <input
          type="text"
          className="block w-full pl-4 pr-12 py-4 bg-transparent border-none focus:ring-0 text-[var(--color-text)] font-bold placeholder-[var(--color-text-muted)] outline-none"
          placeholder="ابحث عن اسم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Names Grid 3D */}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedName(name)}
            className="card-3d bg-[var(--color-surface)] p-6 text-center flex flex-col items-center justify-center gap-3 group hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 transition-colors border border-black/5 dark:border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <span className="text-3xl font-bold font-serif text-[var(--color-primary-light)] group-hover:text-white drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-colors">
              {name.name}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] font-bold transition-colors">
              {name.transliteration}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

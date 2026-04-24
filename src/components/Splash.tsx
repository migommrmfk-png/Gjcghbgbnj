import React, { useEffect } from "react";
import { motion } from "motion/react";
import { MoonStar } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-emerald-50 dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
          className="relative mb-6 text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-slate-900/50 p-6 rounded-full shadow-lg border border-emerald-100 dark:border-slate-800"
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <MoonStar size={56} strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold font-serif text-slate-800 dark:text-slate-100"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          هذا ديني
        </motion.h1>
      </motion.div>
    </div>
  );
}

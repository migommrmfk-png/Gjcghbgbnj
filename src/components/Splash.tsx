import React, { useEffect } from "react";
import { motion } from "motion/react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0A1914] dark:bg-[#07130F] flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Custom Modern Logo */}
        <motion.div 
          className="relative mb-8"
          initial={{ rotate: -20, y: 10 }}
          animate={{ rotate: 0, y: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0Z" fill="url(#paint0_linear)"/>
            <path d="M72 50C72 62.1503 62.1503 72 50 72C37.8497 72 28 62.1503 28 50C28 37.8497 37.8497 28 50 28" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <path d="M50 28C62.1503 28 72 37.8497 72 50" stroke="url(#paint1_linear)" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="50" cy="50" r="8" fill="white"/>
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="paint1_linear" x1="50" y1="28" x2="72" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.h1
          className="text-4xl font-extrabold font-serif text-white tracking-widest"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          اليقين
        </motion.h1>
        <motion.p
          className="text-emerald-300/70 mt-3 text-sm font-medium tracking-widest uppercase"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          طمأنينة القلب
        </motion.p>
      </motion.div>
    </div>
  );
}

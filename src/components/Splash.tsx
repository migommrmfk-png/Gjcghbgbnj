import React, { useEffect } from "react";
import { motion } from "motion/react";
import Logo from "./Logo";

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
    <div className="fixed inset-0 bg-white dark:bg-[#07130F] flex flex-col items-center justify-center overflow-hidden z-50">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542816417-0983cb9c62ce?q=80&w=2000&auto=format&fit=crop")' }}
      ></div>
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C6A45F]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
          className="relative mb-6"
          initial={{ rotate: -10, y: 10 }}
          animate={{ rotate: 0, y: 0 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
        >
          <Logo className="w-40 h-40" />
        </motion.div>

        <motion.h1
          className="text-5xl font-extrabold font-serif text-[#16334F] dark:text-white tracking-widest mt-4 drop-shadow-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          يقين
        </motion.h1>
        
        {/* Decorative dots under title as in logo */}
        <motion.div 
          className="flex gap-2 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="w-2.5 h-2.5 bg-[#C6A45F] rotate-45"></div>
          <div className="w-2.5 h-2.5 bg-[#C6A45F] rotate-45"></div>
        </motion.div>

        <motion.p
          className="text-[#C6A45F] mt-4 text-base font-semibold tracking-widest"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          طمأنينة القلب .. نور الإيمان
        </motion.p>
        
        <motion.div 
          className="flex items-center gap-2 mt-2 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="h-[1px] w-12 bg-[#C6A45F]"></div>
          <div className="w-1.5 h-1.5 bg-[#C6A45F] rotate-45"></div>
          <div className="h-[1px] w-12 bg-[#C6A45F]"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}

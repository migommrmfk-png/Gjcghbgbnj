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
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 via-emerald-800 to-teal-900 flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 2 + 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
          className="relative mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/3602/3602145.png" alt="Logo" className="w-24 h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] filter brightness-0 invert" />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold font-serif text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          هذا ديني
        </motion.h1>
      </motion.div>

      {/* Bottom Pattern */}
      <motion.div
        className="absolute bottom-0 w-full h-48 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat-x bg-[length:120px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
    </div>
  );
}

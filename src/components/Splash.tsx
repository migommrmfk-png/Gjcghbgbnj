import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Moon } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[var(--color-primary)] flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 opacity-50">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
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
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-6">
          <Moon
            size={100}
            className="text-[var(--color-gold)] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]"
            strokeWidth={1.5}
          />
          <motion.div
            className="absolute inset-0 bg-[var(--color-gold)] blur-2xl opacity-20 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <motion.h1
          className="text-5xl font-bold font-serif text-[var(--color-primary-light)] drop-shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          هذا ديني
        </motion.h1>
      </motion.div>

      {/* Bottom Mosque Silhouette */}
      <motion.div
        className="absolute bottom-0 w-full h-48 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat-x"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.2 }}
        transition={{ delay: 0.8, duration: 1 }}
      />
    </div>
  );
}

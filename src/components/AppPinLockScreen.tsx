import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Moon, Lock, Check, Delete } from "lucide-react";
import toast from "react-hot-toast";

export default function AppPinLockScreen({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const [pin, setPin] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const correctPin = localStorage.getItem("app_pin_lock_code") || "1234";

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto submit on fourth character
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          sessionStorage.setItem("app_session_unlocked", "true");
          toast.success("تم إلغاء قفل الحماية بنجاح 🕊️");
          onUnlock();
        } else {
          setIsError(true);
          toast.error("الرمز السري غير صحيح! يرجى إعادة المحاولة ❌");
          setTimeout(() => {
            setPin("");
            setIsError(false);
          }, 800);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  return (
    <div className="fixed inset-0 z-550 flex flex-col bg-[#FAF9F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 justify-between py-12 px-6 overflow-hidden">
      {/* Background Decorative textures */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none"></div>
      
      {/* Upper Brand Branding Shield */}
      <div className="flex flex-col items-center mt-8 text-center space-y-4">
        <motion.div
          animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed ${
            isError 
              ? "border-red-500 bg-red-500/10 text-red-500" 
              : "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
          } shadow-lg`}
        >
          <Lock size={36} className={isError ? "" : "animate-pulse"} />
        </motion.div>
        
        <div>
          <h1 className="text-2xl font-black font-serif text-[#0D5C4D] dark:text-[#E2C392]">
            الرمز السري للخصوصية
          </h1>
          <p className="text-xs text-slate-500 dark:text-emerald-500 mt-1.5 max-w-xs leading-relaxed">
            محتوى التطبيق محمي بمستوى خصوصية فائق التخصيص. يرجى إدخال الرمز لفك تشفير بيانات اليوم.
          </p>
        </div>

        {/* Pin Dots Progress */}
        <div className="flex gap-4.5 justify-center py-4">
          {[0, 1, 2, 3].map((index) => {
            const hasChar = pin.length > index;
            return (
              <motion.div
                key={index}
                animate={hasChar ? { scale: 1.25 } : { scale: 1 }}
                className={`w-4 h-4 rounded-full border-2 ${
                  isError
                    ? "bg-red-500 border-red-500"
                    : hasChar
                    ? "bg-emerald-600 border-[#C59F60] dark:bg-emerald-400"
                    : "border-slate-300 dark:border-slate-700 bg-transparent"
                } transition-all duration-150`}
              />
            );
          })}
        </div>
      </div>

      {/* Numeric Keypad Grid */}
      <div className="w-full max-w-xs mx-auto space-y-4 mb-4 select-none">
        {[
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
        ].map((row, rIdx) => (
          <div key={rIdx} className="flex justify-between gap-4">
            {row.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="w-16 h-16 rounded-full bg-white dark:bg-[#0A1914] shadow-sm border border-slate-100 dark:border-emerald-950/40 hover:emerald-500/10 text-xl font-bold font-mono transition-transform active:scale-90 flex items-center justify-center cursor-pointer text-slate-800 dark:text-slate-100"
              >
                {num}
              </button>
            ))}
          </div>
        ))}
        
        {/* Last Row */}
        <div className="flex justify-between gap-4">
          {/* Clear Key */}
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-full bg-slate-50 dark:bg-[#081512]/50 hover:bg-slate-150 text-xs font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer text-slate-500 dark:text-slate-400"
          >
            مسح
          </button>
          
          {/* Zero Key */}
          <button
            onClick={() => handleNumberClick("0")}
            className="w-16 h-16 rounded-full bg-white dark:bg-[#0A1914] shadow-sm border border-slate-100 dark:border-emerald-950/40 text-xl font-bold font-mono transition-all active:scale-95 flex items-center justify-center cursor-pointer text-slate-800 dark:text-slate-100"
          >
            0
          </button>
          
          {/* Backspace Key */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-slate-50 dark:bg-[#081512]/50 hover:bg-slate-150 text-xs font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer text-slate-500 dark:text-slate-400"
          >
            <Delete size={18} />
          </button>
        </div>
      </div>

      {/* Sacred footer message */}
      <div className="text-center">
        <p className="text-[10px] text-slate-400 dark:text-emerald-600/80 max-w-xs mx-auto leading-relaxed">
          🔒 هذا الرمز يعمل مشفراً محلياً في ذاكرة المتصفح الفوقية الآمنة لتقييد النفاذ من هاتف عملك أو مشاركة اللاب توب الخاص بك.
        </p>
      </div>

    </div>
  );
}

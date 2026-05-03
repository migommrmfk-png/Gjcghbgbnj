import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Sparkles, Coffee, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SupportWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const hasSeenSupport = sessionStorage.getItem('supportModalShown');
    if (!hasSeenSupport) {
      // Show modal after a short delay so the dashboard loads first
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('supportModalShown', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir={isRTL ? "rtl" : "ltr"}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-sm relative overflow-hidden shadow-2xl border border-rose-100 dark:border-rose-900/30"
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-rose-500 to-pink-600 opacity-10 dark:opacity-20"></div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="p-8 flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-rose-500/30 rotate-3">
              <Heart size={40} className="animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold font-serif mb-3 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={20} className="text-rose-500" />
              ادعم تطبيق اليقين
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              هذا التطبيق مجاني بالكامل وبدون إعلانات ابتغاء مرضاة الله. دعمك يساعدنا على الاستمرار وتطوير المزيد من المميزات لنفع المسلمين.
            </p>

            <div className="space-y-3 w-full">
               <button 
                onClick={() => {
                  window.open("https://wa.me/201062082229", "_blank");
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-rose-500/25 transition-all active:scale-95"
              >
                <Coffee size={18} />
                <span>ادعم التطبيق الآن</span>
              </button>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <span>ربما لاحقاً</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

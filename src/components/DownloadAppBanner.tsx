import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, AlertTriangle, X } from 'lucide-react';

export default function DownloadAppBanner() {
  const [showWarning, setShowWarning] = useState(false);

  const handleDownloadClick = () => {
    setShowWarning(true);
  };

  const proceedToDownload = () => {
    window.open('https://www.mediafire.com/file/5ffg5lqeh6nutw8/app3952997-3tpsyv_%25281%2529.apk/file', '_blank');
    setShowWarning(false);
  };

  return (
    <div className="relative mt-2 mb-6">
      {/* Banner Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-1 shadow-[0_10px_20px_rgba(16,185,129,0.2)] cursor-pointer"
        onClick={!showWarning ? handleDownloadClick : undefined}
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-white/20">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full shadow-inner">
              <Smartphone className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg drop-shadow-md">حمل تطبيق الأندرويد</h3>
              <p className="text-emerald-50 text-xs mt-1 opacity-90">تجربة أسرع ومميزات أكثر بدون إنترنت</p>
            </div>
          </div>
          <div className="bg-white text-emerald-600 p-3 rounded-full shadow-lg transform transition-transform hover:rotate-12">
            <Download size={24} />
          </div>
        </div>
      </motion.div>

      {/* Warning Modal/Inline */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 relative backdrop-blur-md">
              <button
                onClick={() => setShowWarning(false)}
                className="absolute top-3 left-3 text-amber-600/60 hover:text-amber-600 transition-colors bg-amber-500/10 rounded-full p-1"
              >
                <X size={20} />
              </button>
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-amber-500/20 p-2 rounded-full shrink-0">
                  <AlertTriangle className="text-amber-600" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-700 dark:text-amber-500 mb-1">تنبيه هام قبل التثبيت</h4>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    نظراً لأن التطبيق يتم تحميله من خارج متجر جوجل بلاي، يرجى التأكد من تفعيل خيار <strong className="text-amber-700 dark:text-amber-500">"تثبيت التطبيقات من مصادر غير معروفة"</strong> في إعدادات الحماية بهاتفك.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={proceedToDownload}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                متابعة التحميل الآن
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

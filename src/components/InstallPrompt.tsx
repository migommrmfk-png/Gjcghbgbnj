import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a slight delay to not overwhelm the user immediately
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 z-50 bg-emerald-600 text-white rounded-2xl p-4 shadow-lg border border-emerald-500"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Download size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isRTL ? 'تحميل التطبيق' : 'Install App'}
                </h3>
                <p className="text-emerald-100 text-xs">
                  {isRTL ? 'أضف التطبيق للشاشة الرئيسية لسهولة الوصول.' : 'Add app to home screen for easy access.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                {isRTL ? 'تثبيت الآن' : 'Install'}
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

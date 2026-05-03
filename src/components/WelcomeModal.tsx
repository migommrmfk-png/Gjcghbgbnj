import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Bell } from 'lucide-react';
import { requestNotificationPermission } from '../services/NotificationService';

interface WelcomeModalProps {
  onEnableNotifications?: () => void;
}

export default function WelcomeModal({ onEnableNotifications }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasRequestedNotifications, setHasRequestedNotifications] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsOpen(false);
  };

  const handleEnableNotifications = async () => {
    setHasRequestedNotifications(true);
    const granted = await requestNotificationPermission();
    if (granted) {
      localStorage.setItem('prayerNotificationsEnabled', 'true');
      localStorage.setItem('autoAdhanEnabled', 'true');
      if (onEnableNotifications) onEnableNotifications();
    } else {
      localStorage.setItem('prayerNotificationsEnabled', 'false');
    }
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleClose}
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10"></div>
            
            <button 
              onClick={handleClose} 
              className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
            >
              <X size={20} className="text-gray-600" />
            </button>

            <div className="flex flex-col items-center text-center mt-4 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                <Heart size={40} className="text-amber-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-emerald-600 font-serif mb-2">
                مرحباً بك في اليقين
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-6 font-sans">
                تطبيقك الإسلامي الشامل، صُمم بحب ليكون رفيقك اليومي في الطاعات. نسأل الله أن يتقبل منا ومنكم صالح الأعمال.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-2xl w-full mb-6 border border-gray-100">
                <p className="text-sm text-gray-500 font-bold mb-1">تم التطوير بواسطة</p>
                <p className="text-lg font-bold text-emerald-500">محمد أحمد</p>
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                {!hasRequestedNotifications && (
                  <button
                    onClick={handleEnableNotifications}
                    className="w-full py-3 bg-yellow-500 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Bell size={20} />
                    تفعيل إشعارات الصلاة
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  ابدأ التصفح
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

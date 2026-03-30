import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, BookOpen, MapPin, Compass, Radio, Heart, Info, Moon, Palette, Bot, MessageCircle, Puzzle, Bell, BellOff, Volume2, VolumeX, HandHeart, Trophy, Library, Image as ImageIcon, Smile, Target, Users, Calculator, Shield, Map, Gift, LogIn, LogOut, User, Globe } from 'lucide-react';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function MoreMenu({ 
  onNavigate, 
  notificationsEnabled, 
  onToggleNotifications 
}: { 
  onNavigate: (tab: string) => void,
  notificationsEnabled?: boolean,
  onToggleNotifications?: () => Promise<boolean> | void
}) {
  const [showToast, setShowToast] = useState(false);
  const { autoAdhanEnabled, setAutoAdhanEnabled } = usePrayerTimes();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const [showLangModal, setShowLangModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleToggleNotifications = async () => {
    if (onToggleNotifications) {
      const success = await onToggleNotifications();
      if (success === false) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLangModal(false);
  };

  const languages = [
    { code: 'ar', name: 'العربية', nativeName: 'العربية' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ];

  const categories = [
    {
      title: 'المكتبة والتعلم',
      image: 'https://i.pinimg.com/736x/87/1b/2f/871b2f81152a51f801a61327111b1511.jpg',
      items: [
        { id: 'muslim-ai', label: 'الذكاء الاصطناعي', icon: <Bot size={24} />, color: 'bg-indigo-500' },
        { id: 'stories', label: 'قصص الأنبياء', icon: <BookOpen size={24} />, color: 'bg-purple-500' },
        { id: 'prayer-guide', label: 'كيفية الصلاة', icon: <BookOpen size={24} />, color: 'bg-amber-600' },
        { id: 'names', label: 'أسماء الله الحسنى', icon: <Heart size={24} />, color: 'bg-pink-500' },
        { id: 'hadith', label: 'الأحاديث', icon: <BookOpen size={24} />, color: 'bg-red-400' },
        { id: 'duas', label: 'الأدعية', icon: <Heart size={24} />, color: 'bg-emerald-400' },
      ]
    },
    {
      title: 'أدوات ومواسم',
      image: 'https://i.pinimg.com/736x/3f/8b/77/3f8b77626915152a54b38d7c49b6b801.jpg',
      items: [
        { id: 'qibla', label: 'اتجاه القبلة', icon: <Compass size={24} />, color: 'bg-orange-500' },
        { id: 'calendar', label: 'التقويم الهجري', icon: <Calendar size={24} />, color: 'bg-blue-500' },
        { id: 'zakat', label: 'حاسبة الزكاة', icon: <Calculator size={24} />, color: 'bg-emerald-600' },
        { id: 'hajj', label: 'دليل الحج والعمرة', icon: <Map size={24} />, color: 'bg-amber-700' },
      ]
    },
    {
      title: 'مجتمع وتحديات',
      image: 'https://i.pinimg.com/736x/60/76/8b/60768b598b049d53c7a36e1c94411d73.jpg',
      items: [
        { id: 'worship-tracker', label: 'متابعة العبادات', icon: <Trophy size={24} />, color: 'bg-amber-500' },
        { id: 'quran-plan', label: 'خطة القرآن', icon: <Target size={24} />, color: 'bg-emerald-500' },
        { id: 'social', label: 'المجتمع والتحديات', icon: <Users size={24} />, color: 'bg-rose-500' },
        { id: 'games', label: 'ألعاب وتحديات', icon: <Puzzle size={24} />, color: 'bg-teal-500' },
      ]
    },
    {
      title: 'صوتيات',
      image: 'https://i.pinimg.com/736x/f6/3c/65/f63c65c270d7406f52285188d8b2d423.jpg',
      items: [
        { id: 'radio', label: 'إذاعة القرآن', icon: <Radio size={24} />, color: 'bg-red-500' },
      ]
    },
    {
      title: 'إعدادات',
      image: 'https://i.pinimg.com/736x/d4/ec/c9/d4ecc94676a666d6911d5167e424458d.jpg',
      items: [
        { id: 'notifications', label: notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات', icon: notificationsEnabled ? <BellOff size={24} /> : <Bell size={24} />, color: notificationsEnabled ? 'bg-gray-500' : 'bg-yellow-500' },
        { id: 'auto-adhan', label: autoAdhanEnabled ? 'إيقاف الأذان التلقائي' : 'تفعيل الأذان التلقائي', icon: autoAdhanEnabled ? <VolumeX size={24} /> : <Volume2 size={24} />, color: autoAdhanEnabled ? 'bg-gray-500' : 'bg-emerald-500' },
        { id: 'language', label: 'تغيير اللغة', icon: <Globe size={24} />, color: 'bg-indigo-600' },
        { id: 'support', label: 'ادعم التطبيق', icon: <HandHeart size={24} />, color: 'bg-rose-500' },
        { id: 'whatsapp', label: 'تواصل معنا', icon: <MessageCircle size={24} />, color: 'bg-[#25D366]' },
        { id: 'auth', label: user ? 'تسجيل الخروج' : 'تسجيل الدخول', icon: user ? <LogOut size={24} /> : <LogIn size={24} />, color: user ? 'bg-red-500' : 'bg-blue-500' },
      ]
    }
  ];

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-32" dir="rtl">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-[2rem] p-8 text-[var(--color-text)] shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden border border-black/5 dark:border-white/10"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 dark:bg-black/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10 text-center">
          {user ? (
            <div className="flex flex-col items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full border-2 border-[var(--color-primary)]" referrerPolicy="no-referrer" loading="lazy" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center border-2 border-[var(--color-primary)]">
                  <User size={40} className="text-[var(--color-primary-light)]" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold font-serif mb-1 text-[var(--color-primary-light)] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">{user.displayName || 'مستخدم'}</h1>
                <p className="text-[var(--color-text-muted)] text-sm">{user.email}</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold font-serif mb-2 text-[var(--color-primary-light)] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">المزيد</h1>
              <p className="text-[var(--color-text-muted)] text-sm font-bold">اكتشف المزيد من الخدمات الإسلامية</p>
            </>
          )}
        </div>
      </motion.div>

      <div className="space-y-8">
        {categories.map((category, catIndex) => (
          <motion.div 
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-1 h-6 bg-[var(--color-primary)] rounded-full"></div>
              <h2 className="text-xl font-bold text-[var(--color-text)] font-serif">
                {category.title}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {category.items.map((item, index) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (item.id === 'whatsapp') {
                      window.open('https://wa.me/201062082229', '_blank');
                    } else if (item.id === 'notifications') {
                      handleToggleNotifications();
                    } else if (item.id === 'auto-adhan') {
                      setAutoAdhanEnabled(!autoAdhanEnabled);
                    } else if (item.id === 'language') {
                      setShowLangModal(true);
                    } else if (item.id === 'auth') {
                      if (user) {
                        handleLogout();
                      } else {
                        onNavigate('auth');
                      }
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  className="relative group overflow-hidden rounded-3xl bg-[var(--color-surface)] border border-black/5 dark:border-white/5 p-4 flex flex-col items-start gap-4 shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[var(--color-primary)]/10 transition-colors"></div>
                  
                  <div className={`w-12 h-12 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                  </div>
                  
                  <div className="relative z-10 text-right w-full">
                    <span className="font-bold text-[var(--color-text)] text-sm block">{item.label}</span>
                    <div className="w-6 h-1 bg-[var(--color-primary)]/30 rounded-full mt-2 group-hover:w-12 transition-all"></div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center pb-8">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50 whitespace-nowrap"
          >
            <BellOff size={20} />
            <span className="font-bold">يرجى تفعيل الإشعارات من إعدادات المتصفح</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLangModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLangModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--color-surface)] border border-black/10 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 text-center">اختر اللغة</h3>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-right px-4 py-3 rounded-xl font-bold transition-colors ${
                      i18n.language === lang.code
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-black/5 dark:bg-white/5 text-[var(--color-text)] hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLangModal(false)}
                className="w-full mt-4 py-3 rounded-xl font-bold text-[var(--color-text-muted)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                إلغاء
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

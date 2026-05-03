import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, BookOpen, MapPin, Compass, Radio, Heart, Info, Moon, Palette, Bot, MessageCircle, Puzzle, Bell, BellOff, Volume2, VolumeX, HandHeart, Trophy, Library, Image as ImageIcon, Smile, Target, Users, Calculator, Shield, Map, Gift, LogIn, LogOut, User, Globe, TrendingUp, Play, Circle, Sun, Settings, Download, Crown, Award } from 'lucide-react';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeProvider';

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
  const { autoAdhanEnabled, setAutoAdhanEnabled, calculationMethod, setCalculationMethod, asrMethod, setAsrMethod } = usePrayerTimes();
  const { user, logout, linkWithGoogle, linkWithGithub } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [linking, setLinking] = useState(false);
  const [linkMethod, setLinkMethod] = useState<'google' | 'github'>('google');

  const [showLangModal, setShowLangModal] = useState(false);
  const [showPrayerSettingsModal, setShowPrayerSettingsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    if (user?.isAnonymous) {
      setShowLogoutConfirm(true);
      return;
    }
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
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

  const handleLinkGoogle = async () => {
    setLinking(true);
    setLinkMethod('google');
    try {
      await linkWithGoogle();
    } catch (error) {
      console.error("Failed to link account", error);
    } finally {
      setLinking(false);
    }
  };

  const handleLinkGithub = async () => {
    setLinking(true);
    setLinkMethod('github');
    try {
      await linkWithGithub();
    } catch (error) {
      console.error("Failed to link account", error);
    } finally {
      setLinking(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLangModal(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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

  const calculationMethods = [
    { id: 4, name: 'أم القرى (مكة المكرمة)' },
    { id: 5, name: 'الهيئة العامة للمساحة (مصر)' },
    { id: 3, name: 'رابطة العالم الإسلامي' },
    { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
    { id: 1, name: 'جامعة العلوم الإسلامية (كراتشي)' },
  ];

  const asrMethods = [
    { id: 0, name: 'شافعي، مالكي، حنبلي (الجمهور)' },
    { id: 1, name: 'حنفي' },
  ];

  const categories = [
    {
      title: t('library_and_learning', 'المكتبة والتعلم'),
      image: 'https://i.pinimg.com/736x/87/1b/2f/871b2f81152a51f801a61327111b1511.jpg',
      items: [
        { id: 'muslim-ai', label: t('muslim_ai', 'الذكاء الاصطناعي'), icon: <Bot size={24} />, color: 'bg-indigo-500' },
        { id: 'dreams', label: t('dream_interpretation', 'تفسير الأحلام'), icon: <Moon size={24} />, color: 'bg-indigo-700' },
        { id: 'stories', label: t('prophet_stories', 'قصص الأنبياء'), icon: <BookOpen size={24} />, color: 'bg-purple-500' },
        { id: 'prayer-guide', label: t('prayer_guide', 'كيفية الصلاة'), icon: <BookOpen size={24} />, color: 'bg-amber-600' },
        { id: 'names', label: t('names_of_allah', 'أسماء الله الحسنى'), icon: <Heart size={24} />, color: 'bg-pink-500' },
        { id: 'hadith', label: t('hadiths', 'الأحاديث'), icon: <BookOpen size={24} />, color: 'bg-red-400' },
        { id: 'duas', label: t('duas', 'الأدعية'), icon: <Heart size={24} />, color: 'bg-emerald-400' },
      ]
    },
    {
      title: t('tools_and_seasons', 'أدوات ومواسم'),
      image: 'https://i.pinimg.com/736x/3f/8b/77/3f8b77626915152a54b38d7c49b6b801.jpg',
      items: [
        { id: 'tasbeeh', label: t('tasbeeh', 'السبحة الإلكترونية'), icon: <Circle size={24} />, color: 'bg-indigo-500' },
        { id: 'ruqyah', label: t('ruqyah', 'الرقية الشرعية'), icon: <Shield size={24} />, color: 'bg-teal-500' },
        { id: 'qibla', label: t('qibla', 'اتجاه القبلة'), icon: <Compass size={24} />, color: 'bg-orange-500' },
        { id: 'calendar', label: t('hijri_calendar', 'التقويم الهجري'), icon: <Calendar size={24} />, color: 'bg-blue-500' },
        { id: 'zakat', label: t('zakat_calculator', 'حاسبة الزكاة'), icon: <Calculator size={24} />, color: 'bg-emerald-600' },
        { id: 'inheritance', label: t('inheritance_calculator', 'حاسبة المواريث'), icon: <Calculator size={24} />, color: 'bg-emerald-800' },
        { id: 'hajj', label: t('hajj_guide', 'دليل الحج والعمرة'), icon: <Map size={24} />, color: 'bg-amber-700' },
      ]
    },
    {
      title: t('community_and_challenges', 'مجتمع وتحديات'),
      image: 'https://i.pinimg.com/736x/60/76/8b/60768b598b049d53c7a36e1c94411d73.jpg',
      items: [
        { id: 'dua-wall', label: t('dua_wall', 'حائط الدعاء'), icon: <HandHeart size={24} />, color: 'bg-rose-500' },
        { id: 'accounting', label: t('self_accounting', 'ورد المحاسبة'), icon: <TrendingUp size={24} />, color: 'bg-teal-600' },
        { id: 'smart-plan', label: t('smart_plan', 'الخطة الذكية'), icon: <Target size={24} />, color: 'bg-emerald-600' },
        { id: 'worship-tracker', label: t('worship_tracker', 'متابعة العبادات'), icon: <Trophy size={24} />, color: 'bg-amber-500' },
        { id: 'quran-plan', label: t('quran_plan', 'خطة القرآن'), icon: <BookOpen size={24} />, color: 'bg-emerald-500' },
        { id: 'quiz', label: t('islamic_quiz', 'اختبر معلوماتك'), icon: <Award size={24} />, color: 'bg-indigo-600' },
        { id: 'social', label: t('social_and_challenges', 'المجتمع والتحديات'), icon: <Users size={24} />, color: 'bg-rose-500' },
        { id: 'games', label: t('games_and_challenges', 'ألعاب وتحديات'), icon: <Puzzle size={24} />, color: 'bg-teal-500' },
      ]
    },
    {
      title: t('audios', 'صوتيات'),
      image: 'https://i.pinimg.com/736x/f6/3c/65/f63c65c270d7406f52285188d8b2d423.jpg',
      items: [
        { id: 'reels', label: t('quran_reels', 'تلاوات خاشعة'), icon: <Play size={24} />, color: 'bg-purple-600' },
        { id: 'radio', label: t('quran_radio', 'إذاعة القرآن'), icon: <Radio size={24} />, color: 'bg-red-500' },
        { id: 'downloads', label: t('downloads', 'التنزيلات'), icon: <Download size={24} />, color: 'bg-emerald-600' },
      ]
    },
    {
      title: t('settings', 'إعدادات'),
      image: 'https://i.pinimg.com/736x/d4/ec/c9/d4ecc94676a666d6911d5167e424458d.jpg',
      items: [
        { id: 'subscription', label: t('subscriptions', 'الباقات والترقية'), icon: <Crown size={24} />, color: 'bg-amber-500' },
        { id: 'admin', label: 'إدارة التراخيص', icon: <Shield size={24} />, color: 'bg-indigo-600' },
        { id: 'theme', label: theme === 'dark' ? t('light_mode', 'الوضع النهاري') : t('dark_mode', 'الوضع الليلي'), icon: theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />, color: 'bg-slate-700' },
        { id: 'prayer-settings', label: t('prayer_settings', 'إعدادات الصلاة'), icon: <Settings size={24} />, color: 'bg-emerald-600' },
        { id: 'notifications', label: notificationsEnabled ? t('disable_notifications', 'إيقاف الإشعارات') : t('enable_notifications', 'تفعيل الإشعارات'), icon: notificationsEnabled ? <BellOff size={24} /> : <Bell size={24} />, color: notificationsEnabled ? 'bg-gray-500' : 'bg-yellow-500' },
        { id: 'auto-adhan', label: autoAdhanEnabled ? t('disable_auto_adhan', 'إيقاف الأذان التلقائي') : t('enable_auto_adhan', 'تفعيل الأذان التلقائي'), icon: autoAdhanEnabled ? <VolumeX size={24} /> : <Volume2 size={24} />, color: autoAdhanEnabled ? 'bg-gray-500' : 'bg-emerald-500' },
        { id: 'language', label: t('change_language', 'تغيير اللغة'), icon: <Globe size={24} />, color: 'bg-indigo-600' },
        { id: 'support', label: t('support_app', 'ادعم التطبيق'), icon: <HandHeart size={24} />, color: 'bg-rose-500' },
        { id: 'whatsapp', label: t('contact_us', 'تواصل معنا'), icon: <MessageCircle size={24} />, color: 'bg-[#25D366]' },
        { id: 'auth', label: user ? t('logout', 'تسجيل الخروج') : t('login', 'تسجيل الدخول'), icon: user ? <LogOut size={24} /> : <LogIn size={24} />, color: user ? 'bg-red-500' : 'bg-blue-500' },
      ]
    }
  ];

  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-32" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-[0_8px_32px_-8px_rgba(16,185,129,0.3)] relative overflow-hidden text-center border border-white/10"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          {user ? (
            <div className="flex flex-col items-center gap-3 w-full">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full border-2 border-white/30 shadow-md object-cover mb-2" referrerPolicy="no-referrer" loading="lazy" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 shadow-md mb-2">
                  <User size={40} className="text-emerald-50" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold font-serif text-white mb-1">
                  {user.isAnonymous ? 'حساب زائر' : (user.displayName || 'مستخدم')}
                </h1>
                {!user.isAnonymous && <p className="text-emerald-100/90 text-xs font-mono bg-black/10 px-3 py-1 rounded-full">{user.email}</p>}
                
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  {!user.app_metadata?.providers?.includes('google') && (
                    <button
                      onClick={handleLinkGoogle}
                      disabled={linking}
                      className="bg-white text-emerald-700 text-sm font-bold py-2 px-4 rounded-full shadow-sm hover:bg-emerald-50 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100 min-w-32"
                    >
                      {linking && linkMethod === 'google' ? (
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-80" />
                          <span>ربط بجوجل</span>
                        </>
                      )}
                    </button>
                  )}
                  {!user.app_metadata?.providers?.includes('github') && (
                    <button
                      onClick={handleLinkGithub}
                      disabled={linking}
                      className="bg-[#24292e] text-white text-sm font-bold py-2 px-4 rounded-full shadow-sm hover:bg-[#2c3137] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100 min-w-32 border border-white/10"
                    >
                      {linking && linkMethod === 'github' ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" className="w-4 h-4 opacity-80 invert" />
                          <span>ربط بـ Github</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-md mb-4">
                 <Settings size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold font-serif mb-2 text-white">المزيد</h1>
              <p className="text-emerald-50 text-sm font-medium bg-black/10 px-4 py-2 rounded-full mt-2">اكتشف الخدمات والميزات الإضافية</p>
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
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif">
                {category.title}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {category.items.map((item, index) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (item.id === 'whatsapp') {
                      window.open('https://wa.me/201062082229', '_blank');
                    } else if (item.id === 'notifications') {
                      handleToggleNotifications();
                    } else if (item.id === 'auto-adhan') {
                      setAutoAdhanEnabled(!autoAdhanEnabled);
                    } else if (item.id === 'theme') {
                      toggleTheme();
                    } else if (item.id === 'prayer-settings') {
                      setShowPrayerSettingsModal(true);
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
                  className="card-3d relative overflow-hidden rounded-[20px] p-4 flex flex-col items-center gap-3 text-center group hover:border-emerald-500/30"
                >
                  <div className="absolute inset-0 bg-white/10 dark:bg-slate-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className={`w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform relative z-10 border border-white/20`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 22 })}
                  </div>
                  
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{item.label}</span>
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-sm flex items-center gap-2 z-50 whitespace-nowrap"
          >
            <BellOff size={20} />
            <span className="font-bold">يرجى تفعيل الإشعارات من إعدادات المتصفح</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-xl border border-slate-100 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
                {t('warning', 'تحذير')}
              </h3>
              <p className="text-center text-slate-500 mb-6 text-sm leading-relaxed">
                {t('logout_warning_desc', 'أنت تستخدم حساب زائر. إذا قمت بتسجيل الخروج الآن، ستفقد جميع بياناتك (النقاط، المستوى، الإنجازات) ولن تتمكن من استعادتها. هل أنت متأكد؟')}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                >
                  {t('cancel_and_stay', 'إلغاء والبقاء')}
                </button>
                <button
                  onClick={confirmLogout}
                  className="w-full py-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  {t('logout_anyway', 'تسجيل الخروج على أي حال')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLangModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowLangModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">اختر اللغة</h3>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-right px-4 py-3 rounded-xl font-bold transition-colors ${
                      i18n.language === lang.code
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLangModal(false)}
                className="w-full mt-4 py-3 rounded-xl font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrayerSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowPrayerSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Settings size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">إعدادات الصلاة</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">طريقة الحساب</label>
                  <div className="space-y-2">
                    {calculationMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setCalculationMethod(method.id)}
                        className={`w-full text-right px-4 py-3 rounded-xl font-bold transition-colors text-sm ${
                          calculationMethod === method.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المذهب الفقهي (لصلاة العصر)</label>
                  <div className="space-y-2">
                    {asrMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setAsrMethod(method.id)}
                        className={`w-full text-right px-4 py-3 rounded-xl font-bold transition-colors text-sm ${
                          asrMethod === method.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPrayerSettingsModal(false)}
                className="w-full mt-6 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                حفظ وإغلاق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, BookOpen, MapPin, Compass, Radio, Heart, Info, Moon, Palette, Bot, MessageCircle, Puzzle, Bell, BellOff, BellRing, Volume2, VolumeX, HandHeart, Trophy, Library, Image as ImageIcon, Smile, Target, Users, Calculator, Shield, Map, Gift, LogIn, LogOut, User, Globe, TrendingUp, Play, Circle, Sun, Settings, Download, Crown, Award, Activity, Wind, TreePine, CheckCircle, Baby, Hourglass, History, Share2, VideoOff } from 'lucide-react';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme, NEON_COLORS } from './ThemeProvider';

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
  const { user, userData, logout, linkWithGoogle, linkWithGithub } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [showNeonModal, setShowNeonModal] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkMethod, setLinkMethod] = useState<'google' | 'github'>('google');

  const [showLangModal, setShowLangModal] = useState(false);
  const [showPrayerSettingsModal, setShowPrayerSettingsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(() => localStorage.getItem('customUserAvatar') || 'initial');
  const [reelsLocked, setReelsLocked] = useState(() => localStorage.getItem('reels_locked') === 'true');

  const defaultAvatars = [
    { id: 'initial', name: 'رمز الحرف الأول' },
    { id: 'classic-man', name: 'الرمز الرجالي الكلاسيكي' },
    { id: 'modern-man', name: 'الرمز الرجالي العصري' },
    { id: 'modest-woman', name: 'الرمز النسائي المحتشم' },
    { id: 'abaya-woman', name: 'الرمز النسائي العباءة' },
    { id: 'spiritual-lunar', name: 'الرمز الروحاني العام' },
  ];

  const renderAvatarSvg = (id: string, name: string) => {
    const firstLetter = name ? name.trim().charAt(0) : 'ص';
    switch (id) {
      case 'initial':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#14b8a6" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="3 3" />
            <text x="50" y="60" fill="#fef08a" fontSize="33" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">{firstLetter}</text>
          </svg>
        );
      case 'classic-man':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="50" r="48" fill="#1e293b" />
            <path d="M44,65 L56,65 L54,75 L46,75 Z" fill="#e0a96d" />
            <ellipse cx="50" cy="46" rx="18" ry="22" fill="#e0a96d" />
            <path d="M30,85 C30,70 40,68 50,68 C60,68 70,70 70,85 Z" fill="#ffffff" />
            <line x1="50" y1="68" x2="50" y2="85" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M42,68 L50,75 L58,68" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
          </svg>
        );
      case 'modern-man':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="50" r="48" fill="#0f172a" />
            <rect x="45" y="60" width="10" height="15" fill="#f5b08c" />
            <ellipse cx="50" cy="45" rx="17" ry="20" fill="#f5b08c" />
            <path d="M30,38 C30,30 40,25 50,25 C60,25 70,30 70,38 C70,38 66,31 50,31 C34,31 30,38 30,38 Z" fill="#1e1e1e" />
            <rect x="36" y="42" width="12" height="8" rx="2" fill="none" stroke="#fecdd3" strokeWidth="2" />
            <rect x="52" y="42" width="12" height="8" rx="2" fill="none" stroke="#fecdd3" strokeWidth="2" />
            <line x1="48" y1="46" x2="52" y2="46" stroke="#fecdd3" strokeWidth="2.5" />
            <line x1="33" y1="44" x2="36" y2="44" stroke="#fecdd3" strokeWidth="1.5" />
            <line x1="64" y1="44" x2="67" y2="44" stroke="#fecdd3" strokeWidth="1.5" />
            <path d="M28,82 C28,70 38,68 50,68 C62,68 72,70 72,82 Z" fill="#047857" />
            <path d="M44,68 L50,76 L56,68 Z" fill="#ffffff" />
          </svg>
        );
      case 'modest-woman':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="50" r="48" fill="#faf5ff" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="#fbcfe8" strokeWidth="1" />
            <ellipse cx="50" cy="52" rx="26" ry="32" fill="#f472b6" />
            <ellipse cx="50" cy="46" rx="14" ry="17" fill="#fed7aa" />
            <path d="M34,42 C34,28 42,23 50,23 C58,23 66,28 66,42 C66,56 58,68 50,68 C42,68 34,56 34,42 Z" fill="#fbcfe8" fillOpacity="0.9" />
            <path d="M42,28 C46,25 54,25 58,28" fill="none" stroke="#db2777" strokeWidth="2" />
            <path d="M22,83 C22,70 35,66 50,66 C65,66 78,70 78,83 Z" fill="#f472b6" />
          </svg>
        );
      case 'abaya-woman':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="50" r="48" fill="#1e1b4b" />
            <path d="M32,48 C32,32 40,24 50,24 C60,24 68,32 68,48 C68,54 60,64 50,64 C40,64 32,54 32,48 Z" fill="#111827" />
            <circle cx="50" cy="27" r="1.5" fill="#fbbf24" />
            <path d="M48,27 L52,27" stroke="#fbbf24" strokeWidth="0.5" />
            <path d="M20,85 C20,68 30,64 50,64 C70,64 80,68 80,85 Z" fill="#030712" />
            <path d="M48,64 C48,70 44,78 40,85 M52,64 C52,70 56,78 60,85" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.4" fill="none" />
          </svg>
        );
      case 'spiritual-lunar':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="50" r="48" fill="#0f172a" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="1.5" />
            <path d="M42,32 C58,32 65,45 65,58 C65,71 52,80 38,78 C48,76 56,66 56,55 C56,44 48,34 38,33 C39.5,32.5 41,32 42,32 Z" fill="#e2e8f0" />
            <g transform="translate(68, 30) scale(0.6)">
              <polygon points="10,0 12,7 19,7 13,11 15,18 10,14 5,18 7,11 1,7 8,7" fill="#fbbf24" />
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    if (userData?.isAnonymous) {
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

  const toggleReelsLock = () => {
    const newVal = !reelsLocked;
    setReelsLocked(newVal);
    localStorage.setItem('reels_locked', String(newVal));
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
        { id: 'muslim-ai', label: t('muslim_ai', 'الذكاء الاصطناعي'), icon: <Bot size={24} />, color: 'bg-[#0D5C4D]' },
        { id: 'spiritual-coach', label: t('spiritual_coach', 'المرشد والمدرب الروحي الذكي 🤖🌱'), icon: <Award size={24} />, color: 'bg-amber-500', isNew: true },
        { id: 'creed-rituals', label: 'العقيدة والشعائر 📖', icon: <BookOpen size={24} />, color: 'bg-[#0A4D40]', isNew: true },
        { id: 'tajweed-education-hub', label: t('tajweed_education_hub', 'مصحح التجويد والتعلم'), icon: <Award size={24} />, color: 'bg-emerald-600' },
        { id: 'stories', label: t('prophet_stories', 'قصص الأنبياء'), icon: <BookOpen size={24} />, color: 'bg-[#0A4D40]' },
        { id: 'prayer-guide', label: t('prayer_guide', 'كيفية الصلاة'), icon: <BookOpen size={24} />, color: 'bg-[#C59F60]' },
        { id: 'names', label: t('names_of_allah', 'أسماء الله الحسنى'), icon: <Heart size={24} />, color: 'bg-[#9F793E]' },
        { id: 'hadith', label: t('hadiths', 'الأحاديث'), icon: <BookOpen size={24} />, color: 'bg-emerald-600' },
        { id: 'duas', label: t('duas', 'الأدعية'), icon: <Heart size={24} />, color: 'bg-emerald-500' },
      ]
    },
    {
      title: t('tools_and_seasons', 'أدوات ومواسم'),
      image: 'https://i.pinimg.com/736x/3f/8b/77/3f8b77626915152a54b38d7c49b6b801.jpg',
      items: [
        { id: 'tasbeeh', label: t('tasbeeh', 'السبحة الإلكترونية'), icon: <Circle size={24} />, color: 'bg-[#C59F60]' },
        { id: 'ruqyah', label: t('ruqyah', 'الرقية الشرعية'), icon: <Shield size={24} />, color: 'bg-emerald-600' },
        { id: 'qibla', label: t('qibla', 'اتجاه القبلة'), icon: <Compass size={24} />, color: 'bg-teal-650' },
        { id: 'qaza-tracker', label: t('qaza_tracker', 'قضاء الفوائت'), icon: <History size={24} />, color: 'bg-amber-600', isNew: true },
        { id: 'calendar', label: t('hijri_calendar', 'التقويم الهجري'), icon: <Calendar size={24} />, color: 'bg-[#0D5C4D]' },
        { id: 'zakat', label: t('zakat_calculator', 'حاسبة الزكاة'), icon: <Calculator size={24} />, color: 'bg-[#0A4D40]' },
        { id: 'hajj', label: t('hajj_guide', 'دليل الحج والعمرة'), icon: <Map size={24} />, color: 'bg-[#9F793E]' },
        { id: 'halal-checker', label: t('halal_checker', 'المدقق الحلال'), icon: <CheckCircle size={24} />, color: 'bg-emerald-700' },
      ]
    },
    {
      title: t('community_and_challenges', 'مجتمع وتحديات'),
      image: 'https://i.pinimg.com/736x/60/76/8b/60768b598b049d53c7a36e1c94411d73.jpg',
      items: [
        { id: 'quran-plan', label: t('quran_plan', 'خطة القرآن'), icon: <BookOpen size={24} />, color: 'bg-emerald-500' },
        { id: 'games', label: t('games_and_challenges', 'المسابقات والألعاب الدينية'), icon: <Trophy size={24} />, color: 'bg-amber-600' },
      ]
    },
    {
      title: t('audios', 'صوتيات'),
      image: 'https://i.pinimg.com/736x/f6/3c/65/f63c65c270d7406f52285188d8b2d423.jpg',
      items: [
        { id: 'radio', label: t('quran_radio', 'إذاعة القرآن'), icon: <Radio size={24} />, color: 'bg-red-500' },
        { id: 'downloads', label: t('downloads', 'التنزيلات'), icon: <Download size={24} />, color: 'bg-emerald-600' },
      ]
    },
    {
      title: t('settings', 'إعدادات'),
      image: 'https://i.pinimg.com/736x/d4/ec/c9/d4ecc94676a666d6911d5167e424458d.jpg',
      items: [
        { id: 'theme', label: theme === 'dark' ? t('light_mode', 'الوضع النهاري') : t('dark_mode', 'الوضع الليلي'), icon: theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />, color: 'bg-slate-700' },
        { id: 'accessibility-hub', label: t('accessibility_hub', 'تسهيل الاستخدام وكبار السن'), icon: <Settings size={24} />, color: 'bg-amber-500' },
        { id: 'neon-accent', label: 'لون النيون الفوسفوري', icon: <Palette size={24} />, color: 'bg-emerald-500' },
        { id: 'prayer-settings', label: t('prayer_settings', 'إعدادات الصلاة'), icon: <Settings size={24} />, color: 'bg-emerald-600' },
        { id: 'advanced-notifications', label: t('advanced_notifications_custom', 'تخصيص الأذان والتنبيهات'), icon: <BellRing size={24} />, color: 'bg-amber-500' },
        { id: 'privacy-settings', label: t('privacy_high_security', 'الخصوصية والأمان الفائق'), icon: <Shield size={24} />, color: 'bg-indigo-600' },
        { id: 'trust-covenant', label: 'ميثاق الأمانة والخصوصية (Local-First) 🔐☀️', icon: <Shield size={24} />, color: 'bg-emerald-600', isNew: true },
        { id: 'notifications', label: notificationsEnabled ? t('disable_notifications', 'إيقاف الإشعارات') : t('enable_notifications', 'تفعيل الإشعارات'), icon: notificationsEnabled ? <BellOff size={24} /> : <Bell size={24} />, color: notificationsEnabled ? 'bg-gray-500' : 'bg-yellow-500' },
        { id: 'auto-adhan', label: autoAdhanEnabled ? t('disable_auto_adhan', 'إيقاف الأذان التلقائي') : t('enable_auto_adhan', 'تفعيل الأذان التلقائي'), icon: autoAdhanEnabled ? <VolumeX size={24} /> : <Volume2 size={24} />, color: autoAdhanEnabled ? 'bg-gray-500' : 'bg-emerald-500' },
        { id: 'lock-reels', label: reelsLocked ? 'تفعيل مقاطع التلاوة (الريلز)' : 'قفل مقاطع التلاوة (منع التشتيت)', icon: <VideoOff size={24} />, color: reelsLocked ? 'bg-emerald-600' : 'bg-red-500' },
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
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          {user ? (
            <div className="flex flex-col items-center gap-3 w-full animate-fade-in">
              <div 
                onClick={() => setShowAvatarModal(true)}
                className="relative cursor-pointer group mb-2 hover:scale-105 transition-transform duration-300"
              >
                <div className="w-20 h-20 rounded-full border-2 border-white/30 shadow-md bg-white/5 overflow-hidden flex items-center justify-center">
                  {renderAvatarSvg(customAvatar, userData?.displayName || user.displayName || 'مستخدم')}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 p-1.5 rounded-full border border-emerald-600 shadow-md hover:bg-yellow-400">
                  <Palette size={12} className="text-white fill-current" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-white mb-1">
                  {userData?.isAnonymous ? 'حساب زائر' : (userData?.displayName || user.displayName || 'مستخدم')}
                </h1>
                {!userData?.isAnonymous && <p className="text-emerald-100/90 text-xs font-mono bg-black/10 px-3 py-1 rounded-full">{user.email}</p>}
                
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  {/* OAuth Linking Buttons Removed */}
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
            <div className="relative overflow-hidden rounded-[24px] mb-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${category.image})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-l from-slate-900/90 via-slate-900/60 to-transparent"></div>
              <div className="relative z-10 px-6 py-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white font-serif drop-shadow-md">
                  {category.title}
                </h2>
              </div>
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
                    } else if (item.id === 'lock-reels') {
                      toggleReelsLock();
                    } else if (item.id === 'neon-accent') {
                      setShowNeonModal(true);
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
                    } else if (item.id === 'quran-plan') {
                      localStorage.setItem("quran_sub_tab", "plans");
                      onNavigate("quran");
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  className="card-3d relative overflow-hidden rounded-[20px] p-4 flex flex-col items-center gap-3 text-center group hover:border-emerald-500/30"
                >
                  <div className="absolute inset-0 bg-white/10 dark:bg-slate-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className={`w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform relative z-10 border border-white/20`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 22 })}
                  </div>
                  
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex justify-center items-center gap-1">
                      {item.label}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Developer Signature Card - Professional & Beautiful */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-6 bg-gradient-to-br from-[#0c221d] to-slate-900/90 border border-amber-500/30 rounded-3xl p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 mb-2">
            <Award className="text-amber-400" size={24} />
          </div>
          <span className="text-[10px] text-amber-400/95 font-bold tracking-widest uppercase font-mono">
            مطور ومبرمج التطبيق
          </span>
          <h4 className="text-lg font-black text-white font-serif tracking-tight">
            المهندس محمد أحمد
          </h4>
          <p className="text-[11px] text-slate-450 max-w-[280px] leading-relaxed">
            تم تشذيب وبناء صرح اليقين بأحدث نماذج الذكاء الاصطناعي والتقنيات البرمجية الحديثة خدمةً للأمة الإسلامية.
          </p>
          <div className="flex gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[9px] text-emerald-400 font-bold">نسخة الـ v3.5 - اليقين الإسلامي الذكي</span>
          </div>
        </div>
      </motion.div>

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
        {showNeonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowNeonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center font-serif">لون النيون الفوسفوري الخاص بك ✨</h3>
              <p className="text-slate-400 text-xs text-center mb-5">اختر درجة النيون اللامعة والمريحة للعين لتطبيقها كسمة عامة</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(NEON_COLORS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setAccent(key);
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col gap-2.5 items-center justify-center relative ${
                      accent === key 
                        ? 'ring-2 ring-emerald-500 border-transparent bg-slate-50 dark:bg-slate-950 shadow-md' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg"
                      style={{ 
                        backgroundColor: value.config.primary,
                        boxShadow: `0 4px 14px ${value.config.primary}50` 
                      }}
                    >
                      <Palette size={18} />
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-205">
                      {value.name.split(" ")[0]}
                    </span>
                    {accent === key && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowNeonModal(false)}
                className="w-full py-3 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
              >
                تطبيق وحفظ السمة المصممة 👍
              </button>
            </motion.div>
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

      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAvatarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center font-serif">اختر رمز حسابك الافتراضي 📿</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-6 leading-relaxed">
                اضبط صورتك الرمزية المتطابقة مع بيئة التطبيق الشرعية السليمة والمريحة
              </p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {defaultAvatars.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => {
                      localStorage.setItem('customUserAvatar', av.id);
                      setCustomAvatar(av.id);
                    }}
                    className={`p-2 rounded-2xl border transition-all flex flex-col gap-2 items-center justify-center relative ${
                      customAvatar === av.id 
                        ? 'ring-2 ring-emerald-500 border-transparent bg-slate-50 dark:bg-slate-950 shadow-md' 
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-850">
                      {renderAvatarSvg(av.id, userData?.displayName || user?.displayName || 'مستخدم')}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">
                      {av.name.split(" ")[1] || av.name}
                    </span>
                    {customAvatar === av.id && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[8px] font-black">✓</span>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                تطبيق وحفظ التغييرات 👍
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

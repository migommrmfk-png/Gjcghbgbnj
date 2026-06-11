import React, { useState, useEffect, useCallback, Suspense, lazy, useRef } from "react";
import toast, { Toaster } from 'react-hot-toast';
import {
  Home,
  BookOpen,
  Heart,
  Activity,
  MoreHorizontal,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Splash from "./components/Splash";
import Onboarding from "./components/Onboarding";
import AdhanOverlay from "./components/AdhanOverlay";
import WelcomeModal from "./components/WelcomeModal";
import SupportWelcomeModal from "./components/SupportWelcomeModal";
import { ThemeProvider } from "./components/ThemeProvider";
import { PrayerTimesProvider } from "./contexts/PrayerTimesContext";
import { usePrayerNotifications } from "./hooks/usePrayerNotifications";
import { useTranslation } from 'react-i18next';

import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Eager load main components for instant switching
import Dashboard from "./components/Dashboard";
import Quran from "./components/Quran";
import Azkar from "./components/Azkar";
import Tasbeeh from "./components/Tasbeeh";
import MoreMenu from "./components/MoreMenu";

// Lazy load secondary components
const Qibla = lazy(() => import("./components/Qibla"));
const NamesOfAllah = lazy(() => import("./components/NamesOfAllah"));
const Hadith = lazy(() => import("./components/Hadith"));
const Duas = lazy(() => import("./components/Duas"));
const HijriCalendar = lazy(() => import("./components/Calendar"));
const IslamicRadio = lazy(() => import("./components/Radio"));
const ProphetStories = lazy(() => import("./components/ProphetStories"));
const MuslimAI = lazy(() => import("./components/MuslimAI"));
const Games = lazy(() => import("./components/Games"));
const PrayerGuide = lazy(() => import("./components/PrayerGuide"));
const SupportApp = lazy(() => import("./components/SupportApp"));
const WorshipTracker = lazy(() => import("./components/WorshipTracker"));
const SocialChallenges = lazy(() => import("./components/SocialChallenges"));
const ZakatCalculator = lazy(() => import("./components/ZakatCalculator"));
const HajjUmrahGuide = lazy(() => import("./components/HajjUmrahGuide"));
const Auth = lazy(() => import("./components/Auth"));
const Ruqyah = lazy(() => import("./components/Ruqyah"));
const Downloads = lazy(() => import("./components/Downloads"));

const NotificationsPage = lazy(() => import("./components/NotificationsPage"));
const AdvancedNotificationsSettings = lazy(() => import("./components/AdvancedNotificationsSettings"));
const PrivacySettings = lazy(() => import("./components/PrivacySettings"));

const HalalChecker = lazy(() => import("./components/HalalChecker"));

const QazaTracker = lazy(() => import("./components/QazaTracker"));
const AudioCircles = lazy(() => import("./components/AudioCircles"));
const FatwaLibrary = lazy(() => import("./components/FatwaLibrary"));
const AccessibilityHub = lazy(() => import("./components/AccessibilityHub"));
const TajweedEducationHub = lazy(() => import("./components/TajweedEducationHub"));
const TrustCovenant = lazy(() => import("./components/TrustCovenant"));
const SpiritualCoach = lazy(() => import("./components/SpiritualCoach"));
const IslamicCreedRituals = lazy(() => import("./components/IslamicCreedRituals"));
import InstallPrompt from "./components/InstallPrompt";
import ChatOverlay from "./components/ChatOverlay";
import AppPinLockScreen from "./components/AppPinLockScreen";

// Loading fallback for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
  </div>
);

const SALAWAT_AHADITH = [
  "«مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا» 💚 (صحيح مسلم)",
  "«أَوْلَى النَّاسِ بِي يَوْمَ الْقِيَامَةِ أَكْثَرُهُمْ عَلَيَّ صَلَاةً» ✨ (سنن الترمذي)",
  "«الْبَخِيلُ مَنْ ذُكِرْتُ عِنْدَهُ فَلَمْ يُصَلِّ عَلَيَّ» ⚠️ (سنن الترمذي)",
  "«أَكْثِرُوا الصَّلَاةَ عَلَيَّ فِي يَوْمِ الْجُمُعَةِ وَلَيْلَةِ الْجُمُعَةِ» 🕋 (حديث صحيح)",
  "«إِذًا تُكْفَى هَمَّكَ، وَيُغْفَرُ لَكَ ذَنْبُكَ» 🕊️ (حديث صحيح)"
];

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [previousTab, setPreviousTab] = useState("home");
  const [adhanData, setAdhanData] = useState<{ prayerName: string, time: string, step?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [salawatTooltip, setSalawatTooltip] = useState(false);
  const [activeHadithIdx, setActiveHadithIdx] = useState(0);
  const [salawatCount, setSalawatCount] = useState(() => {
    return parseInt(localStorage.getItem('user_salawat_count') || '0', 10);
  });
  const [isLocked, setIsLocked] = useState(() => {
    const pinEnabled = localStorage.getItem("app_pin_lock_enabled") === "true";
    const sessionUnlocked = sessionStorage.getItem("app_session_unlocked") === "true";
    return pinEnabled && !sessionUnlocked;
  });

  const mainRef = useRef<HTMLElement | null>(null);

  // Smooth scroll container to the top on tab changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  useEffect(() => {
    const locked = localStorage.getItem('currentPrayerLock');
    const snooze = localStorage.getItem('snoozeAdhanUntil');
    const now = new Date().getTime();
    
    if (locked) {
      if (!snooze || now > parseInt(snooze)) {
        try {
          setAdhanData(JSON.parse(locked));
        } catch(e) {}
      } else {
        // Still snoozing, set a timeout to show it when snooze expires
        const remaining = parseInt(snooze) - now;
        setTimeout(() => {
          try {
            setAdhanData(JSON.parse(localStorage.getItem('currentPrayerLock') || 'null'));
          } catch(e) {}
        }, remaining);
      }
    }
  }, []);

  const handlePrayerTime = useCallback((prayerName: string, time: string) => {
    const data = { prayerName, time };
    setAdhanData(data);
    localStorage.setItem('currentPrayerLock', JSON.stringify(data));
  }, []);

  const handleCloseAdhan = () => {
    localStorage.removeItem('currentPrayerLock');
    localStorage.removeItem('snoozeAdhanUntil');
    setAdhanData(null);
  };

  const handleSnoozeAdhan = () => {
    if (adhanData) {
      const snoozeUntil = new Date().getTime() + 10 * 60 * 1000;
      localStorage.setItem('snoozeAdhanUntil', snoozeUntil.toString());
      setAdhanData(null);
      
      setTimeout(() => {
        const locked = localStorage.getItem('currentPrayerLock');
        const snooze = localStorage.getItem('snoozeAdhanUntil');
        if (locked && (!snooze || new Date().getTime() > parseInt(snooze))) {
          try {
            setAdhanData(JSON.parse(locked));
          } catch(e) {}
        }
      }, 10 * 60 * 1000);
    }
  };

  const { notificationsEnabled, toggleNotifications, setNotificationsEnabled } = usePrayerNotifications(handlePrayerTime);
  const { user, userData, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();

  const handleSalawatClick = () => {
    const currentCount = parseInt(localStorage.getItem('user_salawat_count') || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem('user_salawat_count', newCount.toString());
    setSalawatCount(newCount);

    try {
      const savedTracker = localStorage.getItem('worshipTrackerV2');
      let points = 0;
      let level = 1;
      let streak = 0;
      let completedTaskIds: number[] = [];
      if (savedTracker) {
        const parsed = JSON.parse(savedTracker);
        points = parsed.points || 0;
        level = parsed.level || 1;
        streak = parsed.streak || 0;
        completedTaskIds = parsed.completedTaskIds || [];
      }
      const newPoints = points + 5;
      let newLevel = Math.floor(newPoints / 1000) + 1;
      if (newLevel > 4) newLevel = 4;
      
      localStorage.setItem('worshipTrackerV2', JSON.stringify({
        points: newPoints,
        level: newLevel,
        streak,
        completedTaskIds,
        lastUpdated: new Date().toDateString()
      }));

      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }

    const randomIdx = Math.floor(Math.random() * SALAWAT_AHADITH.length);
    setActiveHadithIdx(randomIdx);
    toast.success(`صلى الله عليه وسلم 💚 (${newCount} مرّات) (+5 نقاط إيمانية)`);
  };

  const handleNavigate = (tab: string) => {
    setPreviousTab(activeTab);
    setActiveTab(tab);
  };

  const handleBack = () => {
    setActiveTab(previousTab);
  };

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("hasOnboarded");
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasOnboarded", "true");
    setShowOnboarding(false);
  };

  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard onNavigate={handleNavigate} />;
      case "quran":
        return <Quran />;
      case "azkar":
        return <Azkar />;
      case "tasbeeh":
        return <Tasbeeh />;
      case "more":
        return <MoreMenu onNavigate={handleNavigate} notificationsEnabled={notificationsEnabled} onToggleNotifications={toggleNotifications} />;
      case "qibla":
        return <Qibla />;
      case "names":
        return <NamesOfAllah onBack={handleBack} />;
      case "hadith":
        return <Hadith onBack={handleBack} />;
      case "duas":
        return <Duas onBack={handleBack} />;
      case "calendar":
        return <HijriCalendar onBack={handleBack} />;
      case "radio":
        return <IslamicRadio onBack={handleBack} />;
      case "stories":
        return <ProphetStories onBack={handleBack} />;
      case "muslim-ai":
        return <MuslimAI onBack={handleBack} />;
      case "games":
        return <Games onBack={handleBack} />;
      case "prayer-guide":
        return <PrayerGuide onBack={handleBack} />;
      case "support":
        return <SupportApp onBack={handleBack} />;
      case "worship-tracker":
        return <WorshipTracker onBack={handleBack} />;
      case "social":
        return <SocialChallenges onBack={handleBack} />;
      case "zakat":
        return <ZakatCalculator onBack={handleBack} />;
      case "hajj":
        return <HajjUmrahGuide onBack={handleBack} />;

      case "auth":
        return <Auth onBack={handleBack} />;
      case "ruqyah":
        return <Ruqyah onBack={handleBack} />;
      case "qaza-tracker":
        return <QazaTracker onBack={handleBack} />;

      case "accounting":
        return <WorshipTracker onBack={handleBack} />;
      case "downloads":
        return <Downloads onBack={handleBack} />;
      case "quiz":
        return <Games onBack={handleBack} />;
      case "audio-circles":
        return <AudioCircles onBack={handleBack} />;
      case "competitions":
        return <Games onBack={handleBack} />;
      case "fatwas":
        return <FatwaLibrary onBack={handleBack} onNavigateToAi={() => handleNavigate("muslim-ai")} />;

      case "notifications":
        return <NotificationsPage onBack={handleBack} />;

      case "advanced-notifications":
        return <AdvancedNotificationsSettings onBack={handleBack} />;

      case "privacy-settings":
        return <PrivacySettings onBack={handleBack} />;

      case "accessibility-hub":
        return <AccessibilityHub onBack={handleBack} />;

      case "tajweed-education-hub":
        return <TajweedEducationHub onBack={handleBack} />;

      case "spiritual-coach":
        return <SpiritualCoach onBack={handleBack} />;

      case "trust-covenant":
        return <TrustCovenant onBack={handleBack} />;

      case "halal-checker":
        return <HalalChecker onBack={handleBack} />;
      case "creed-rituals":
        return <IslamicCreedRituals onBack={handleBack} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (showSplash || authLoading) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!user) {
    return <Auth />;
  }

  if (isLocked) {
    return <AppPinLockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div
      className="flex flex-col flex-1 h-full w-full bg-[#f4f7f6] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 font-sans overflow-hidden relative"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <InstallPrompt />
      <ChatOverlay />
      <SupportWelcomeModal />
      <WelcomeModal onEnableNotifications={() => setNotificationsEnabled(true)} />
      
      <AnimatePresence>
        {adhanData && (
          <AdhanOverlay 
            prayerName={adhanData.prayerName} 
            time={adhanData.time} 
            onClose={handleCloseAdhan}
            onSnooze={handleSnoozeAdhan}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-28 relative scroll-smooth-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="h-full"
          >
            <Suspense fallback={<LoadingFallback />}>
              {renderTab()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating AI Button */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 100);
        }}
        onClick={() => {
          if (!isDragging) {
            handleNavigate("muslim-ai");
          }
        }}
        className={`fixed bottom-28 ${isRTL ? 'right-5' : 'left-5'} z-50 flex items-center justify-center w-[52px] h-[52px] bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[22px] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all cursor-grab active:cursor-grabbing border border-white/20`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles size={24} className="text-white animate-pulse" />
      </motion.div>

      {/* Universal Floating "صلّ على النبي ﷺ" Blessing Widget */}
      <div 
        className={`fixed bottom-28 ${isRTL ? 'left-5' : 'right-5'} z-50 flex flex-col items-end`}
        onMouseEnter={() => setSalawatTooltip(true)}
        onMouseLeave={() => setSalawatTooltip(false)}
      >
        <AnimatePresence>
          {salawatTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="absolute bottom-16 bg-white dark:bg-[#0A1914] p-4 rounded-2xl shadow-xl shadow-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 w-56 text-center"
              style={{ [isRTL ? 'left' : 'right']: 0 }}
            >
              <p className="text-[10px] text-emerald-500 font-extrabold mb-1.5">💡 فضل الصلاة على النبي</p>
              <p className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                {SALAWAT_AHADITH[activeHadithIdx]}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-emerald-950 text-[10px] text-slate-400 font-bold flex justify-between">
                <span>إجمالي صلواتك:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{salawatCount}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleSalawatClick}
          className="flex flex-col items-center justify-center w-[52px] h-[52px] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[22px] shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all border border-white/20 text-white select-none cursor-pointer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg font-serif font-black leading-none translate-y-0.5">ﷺ</span>
          <span className="text-[8.5px] font-black leading-none opacity-90 mt-1 whitespace-nowrap">صلّ على محمد</span>
        </motion.button>
      </div>

      {/* Modern Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-5 right-5 bg-white/95 backdrop-blur-md dark:bg-[#0A1914]/95 border border-white dark:border-[#122A21] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] z-40 rounded-[28px] h-[72px]">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
          <NavItem
            icon={<Home />}
            label={t('app_name') === "اليقين" ? "الرئيسية" : "Home"}
            isActive={activeTab === "home"}
            onClick={() => handleNavigate("home")}
          />
          <NavItem
            icon={<BookOpen />}
            label={t('quran')}
            isActive={activeTab === "quran"}
            onClick={() => handleNavigate("quran")}
          />
          <NavItem
            icon={<Heart />}
            label={t('azkar')}
            isActive={activeTab === "azkar"}
            onClick={() => handleNavigate("azkar")}
          />
          <NavItem
            icon={<Activity />}
            label={t('tasbeeh')}
            isActive={activeTab === "tasbeeh"}
            onClick={() => handleNavigate("tasbeeh")}
          />
          <NavItem
            icon={<MoreHorizontal />}
            label={t('more')}
            isActive={activeTab === "more"}
            onClick={() => handleNavigate("more")}
          />
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PrayerTimesProvider>
          <Toaster position="top-center" toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }} />
          <AppContent />
        </PrayerTimesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function NavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center h-full flex-1 group ${
        isActive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
      } transition-colors duration-300`}
    >
      <div className="relative flex flex-col items-center gap-1.5">
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/40 rounded-[18px] w-14 h-14 -m-4 left-1/2 -ml-7 top-1/2 -mt-7 z-0"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-1">
          {React.cloneElement(icon as React.ReactElement<any>, {
            size: isActive ? 24 : 22,
            strokeWidth: isActive ? 2.5 : 2,
            className: `transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105'}`
          })}
          <span
            className={`text-[10px] font-bold transition-all duration-300 whitespace-nowrap ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 absolute bottom-0"}`}
          >
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}

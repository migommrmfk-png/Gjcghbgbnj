import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
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
const QuranPlan = lazy(() => import("./components/QuranPlan"));
const SocialChallenges = lazy(() => import("./components/SocialChallenges"));
const DuaWall = lazy(() => import("./components/DuaWall"));
const ZakatCalculator = lazy(() => import("./components/ZakatCalculator"));
const HajjUmrahGuide = lazy(() => import("./components/HajjUmrahGuide"));
const Auth = lazy(() => import("./components/Auth"));
const SmartPlan = lazy(() => import("./components/SmartPlan"));
const Ruqyah = lazy(() => import("./components/Ruqyah"));
const InheritanceCalculator = lazy(() => import("./components/InheritanceCalculator"));
const DreamInterpretation = lazy(() => import("./components/DreamInterpretation"));
const QuranReels = lazy(() => import("./components/QuranReels"));
const SelfAccounting = lazy(() => import("./components/SelfAccounting"));

// Loading fallback for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
  </div>
);

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [previousTab, setPreviousTab] = useState("home");
  const [adhanData, setAdhanData] = useState<{ prayerName: string, time: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePrayerTime = useCallback((prayerName: string, time: string) => {
    setAdhanData({ prayerName, time });
  }, []);

  const { notificationsEnabled, toggleNotifications, setNotificationsEnabled } = usePrayerNotifications(handlePrayerTime);
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();

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
        return <Hadith />;
      case "duas":
        return <Duas />;
      case "calendar":
        return <HijriCalendar />;
      case "radio":
        return <IslamicRadio />;
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
      case "quran-plan":
        return <QuranPlan onBack={handleBack} />;
      case "social":
        return <SocialChallenges onBack={handleBack} />;
      case "dua-wall":
        return <DuaWall onBack={handleBack} />;
      case "zakat":
        return <ZakatCalculator onBack={handleBack} />;
      case "hajj":
        return <HajjUmrahGuide onBack={handleBack} />;
      case "smart-plan":
        return <SmartPlan onBack={handleBack} />;
      case "auth":
        return <Auth onBack={handleBack} />;
      case "ruqyah":
        return <Ruqyah />;
      case "inheritance":
        return <InheritanceCalculator onBack={handleBack} />;
      case "dreams":
        return <DreamInterpretation onBack={handleBack} />;
      case "reels":
        return <QuranReels onBack={handleBack} />;
      case "accounting":
        return <SelfAccounting onBack={handleBack} />;
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

  return (
    <div
      className="flex flex-col flex-1 h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden relative"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <WelcomeModal onEnableNotifications={() => setNotificationsEnabled(true)} />
      <AnimatePresence>
        {adhanData && (
          <AdhanOverlay 
            prayerName={adhanData.prayerName} 
            time={adhanData.time} 
            onClose={() => setAdhanData(null)} 
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 relative">
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
            setActiveTab("muslim-ai");
          }
        }}
        className={`fixed bottom-44 ${isRTL ? 'right-4' : 'left-4'} z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-full shadow-lg hover:shadow-xl transition-all cursor-grab active:cursor-grabbing border border-white/20`}
        initial={{ scale: 0, x: isRTL ? 100 : -100 }}
        animate={{ scale: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Sparkles size={28} className="text-white animate-pulse" />
        <span className={`absolute -top-1 ${isRTL ? '-right-1' : '-left-1'} flex h-4 w-4`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white/50"></span>
        </span>
      </motion.div>

      {/* WhatsApp Floating Button */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 100);
        }}
        onClick={() => {
          if (!isDragging) {
            window.open('https://wa.me/201062082229', '_blank');
          }
        }}
        className={`fixed bottom-28 ${isRTL ? 'right-4' : 'left-4'} z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:bg-[#20bd5a] transition-colors cursor-grab active:cursor-grabbing`}
        initial={{ scale: 0, x: isRTL ? 100 : -100 }}
        animate={{ scale: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </motion.div>
        <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" style={{ zIndex: -1 }}></span>
      </motion.div>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-40 rounded-full h-16">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-4">
          <NavItem
            icon={<Home />}
            label={t('app_name') === "هذا ديني" ? "الرئيسية" : "Home"}
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
      className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-500 group ${
        isActive
          ? "text-emerald-500 scale-105"
          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      }`}
    >
      <div className="relative">
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute -inset-x-4 -inset-y-2 bg-emerald-50 dark:bg-emerald-500/15 rounded-full"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-1">
          {React.cloneElement(icon as React.ReactElement, {
            size: isActive ? 24 : 22,
            strokeWidth: isActive ? 2.5 : 2,
            className: `transition-all duration-300 ${isActive ? 'drop-shadow-sm' : 'group-hover:scale-110'}`
          })}
          <span
            className={`text-[10px] font-bold transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
          >
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}

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
const Downloads = lazy(() => import("./components/Downloads"));
const IslamicQuiz = lazy(() => import("./components/IslamicQuiz"));
const Subscription = lazy(() => import("./components/Subscription"));
const SubscriptionAdmin = lazy(() => import("./components/SubscriptionAdmin"));
const KidsQuran = lazy(() => import("./components/KidsQuran"));
const MoodTracker = lazy(() => import("./components/MoodTracker"));
const Sakina = lazy(() => import("./components/Sakina"));
const SpiritualOrbit = lazy(() => import("./components/SpiritualOrbit"));
const MuslimGarden = lazy(() => import("./components/MuslimGarden"));
import InstallPrompt from "./components/InstallPrompt";
import ChatOverlay from "./components/ChatOverlay";

// Loading fallback for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
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
  const { user, userData, loading: authLoading } = useAuth();
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
      case "downloads":
        return <Downloads onBack={handleBack} />;
      case "quiz":
        return <IslamicQuiz onBack={handleBack} />;
      case "subscription":
        return <Subscription onBack={handleBack} />;
      case "admin":
        return <SubscriptionAdmin onBack={handleBack} />;
      case "kids-quran":
        return <KidsQuran onBack={handleBack} />;
      case "sakina":
        return <Sakina onBack={handleBack} />;
      case "orbit":
        return <SpiritualOrbit onBack={handleBack} />;
      case "garden":
        return <MuslimGarden onBack={handleBack} />;
      case "mood-tracker":
        return (
          <div className="p-4 pb-24 max-w-md mx-auto pt-8 min-h-screen" dir="rtl">
            <button
              onClick={handleBack}
              className="mb-4 flex items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-[0_5px_15px_rgba(0,0,0,0.2)] w-max"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400 rotate-180"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
            <MoodTracker />
          </div>
        );
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
            onClose={() => setAdhanData(null)} 
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-28 relative">
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
          {React.cloneElement(icon as React.ReactElement, {
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

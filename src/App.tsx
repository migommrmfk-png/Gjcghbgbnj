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
const Hadith = lazy(() => import("./Hadith"));
const Duas = lazy(() => import("./components/Duas"));
const HijriCalendar = lazy(() => import("./components/Calendar"));
const IslamicRadio = lazy(() => import("./components/Radio"));
const Stories = lazy(() => import("./components/Stories"));
const MuslimAI = lazy(() => import("./components/MuslimAI"));
const Games = lazy(() => import("./components/Games"));
const PrayerGuide = lazy(() => import("./components/PrayerGuide"));
const SupportApp = lazy(() => import("./components/SupportApp"));
const WorshipTracker = lazy(() => import("./components/WorshipTracker"));
const QuranPlan = lazy(() => import("./components/QuranPlan"));
const SocialChallenges = lazy(() => import("./components/SocialChallenges"));
const ZakatCalculator = lazy(() => import("./components/ZakatCalculator"));
const Ruqyah = lazy(() => import("./components/Ruqyah"));
const HajjUmrahGuide = lazy(() => import("./components/HajjUmrahGuide"));
const Auth = lazy(() => import("./components/Auth"));

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
  const [adhanData, setAdhanData] = useState<{ prayerName: string, time: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePrayerTime = useCallback((prayerName: string, time: string) => {
    setAdhanData({ prayerName, time });
  }, []);

  const { notificationsEnabled, toggleNotifications, setNotificationsEnabled } = usePrayerNotifications(handlePrayerTime);
  const { user, loading: authLoading } = useAuth();

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

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard onNavigate={setActiveTab} />;
      case "quran":
        return <Quran />;
      case "azkar":
        return <Azkar />;
      case "tasbeeh":
        return <Tasbeeh />;
      case "more":
        return <MoreMenu onNavigate={setActiveTab} notificationsEnabled={notificationsEnabled} onToggleNotifications={toggleNotifications} />;
      case "qibla":
        return <Qibla />;
      case "names":
        return <NamesOfAllah />;
      case "hadith":
        return <Hadith />;
      case "duas":
        return <Duas />;
      case "calendar":
        return <HijriCalendar />;
      case "radio":
        return <IslamicRadio />;
      case "stories":
        return <Stories onBack={() => setActiveTab("more")} />;
      case "muslim-ai":
        return <MuslimAI onBack={() => setActiveTab("more")} />;
      case "games":
        return <Games onBack={() => setActiveTab("more")} />;
      case "prayer-guide":
        return <PrayerGuide onBack={() => setActiveTab("more")} />;
      case "support":
        return <SupportApp onBack={() => setActiveTab("more")} />;
      case "worship-tracker":
        return <WorshipTracker onBack={() => setActiveTab("more")} />;
      case "quran-plan":
        return <QuranPlan onBack={() => setActiveTab("more")} />;
      case "social":
        return <SocialChallenges onBack={() => setActiveTab("more")} />;
      case "zakat":
        return <ZakatCalculator onBack={() => setActiveTab("more")} />;
      case "ruqyah":
        return <Ruqyah onBack={() => setActiveTab("more")} />;
      case "hajj":
        return <HajjUmrahGuide onBack={() => setActiveTab("more")} />;
      case "auth":
        return <Auth onBack={() => setActiveTab("more")} />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
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
      className="flex flex-col flex-1 h-full w-full bg-[var(--color-bg)] text-[var(--color-text)] font-sans overflow-hidden relative"
      dir="rtl"
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
        className="fixed bottom-44 right-4 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:shadow-[0_0_30px_rgba(212,175,55,0.8)] transition-all cursor-grab active:cursor-grabbing border border-white/20"
        initial={{ scale: 0, x: 100 }}
        animate={{ scale: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Sparkles size={28} className="text-black animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary-light)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--color-primary)] border border-white/50"></span>
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
        className="fixed bottom-28 right-4 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:bg-[#20bd5a] transition-colors cursor-grab active:cursor-grabbing"
        initial={{ scale: 0, x: 100 }}
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
      <nav className="fixed bottom-6 left-4 right-4 bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-primary)]/20 shadow-2xl z-40 rounded-3xl">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          <NavItem
            icon={<Home />}
            label="الرئيسية"
            isActive={activeTab === "home"}
            onClick={() => setActiveTab("home")}
          />
          <NavItem
            icon={<BookOpen />}
            label="القرآن"
            isActive={activeTab === "quran"}
            onClick={() => setActiveTab("quran")}
          />
          <NavItem
            icon={<Heart />}
            label="الأذكار"
            isActive={activeTab === "azkar"}
            onClick={() => setActiveTab("azkar")}
          />
          <NavItem
            icon={<Activity />}
            label="السبحة"
            isActive={activeTab === "tasbeeh"}
            onClick={() => setActiveTab("tasbeeh")}
          />
          <NavItem
            icon={<MoreHorizontal />}
            label="المزيد"
            isActive={activeTab === "more"}
            onClick={() => setActiveTab("more")}
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
      className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
        isActive
          ? "text-[var(--color-primary)]"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -top-1 w-12 h-1 bg-[var(--color-primary)] rounded-b-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div
        className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? "bg-[var(--color-primary)]/10 scale-110" : "scale-100"}`}
      >
        {React.cloneElement(icon as React.ReactElement, {
          size: 22,
          strokeWidth: isActive ? 2.5 : 2,
        })}
      </div>
      <span
        className={`text-[10px] font-bold transition-all duration-300 ${isActive ? "opacity-100" : "opacity-70"}`}
      >
        {label}
      </span>
    </button>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Play,
  Square,
  Clock,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Compass,
  AlertCircle,
  Vibrate,
  ShieldAlert,
  Moon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// Interface Definitions
interface PrayerNotificationConfig {
  adhanSound: string;        // URL or 'silent' or 'disabled'
  preAdhanEnabled: boolean;
  preAdhanTime: number;      // minutes before
  preAdhanMessage: string;
  postAdhanEnabled: boolean;
  postAdhanTime: number;     // minutes after
  postAdhanMessage: string;
}

interface GeneralReminder {
  id: string;
  enabled: boolean;
  time: string;              // HH:MM
  message: string;
  title: string;
}

const ADHAN_VOICES = [
  { id: "makkah", name: "أذان الحرم المكي الشريف", url: "https://server11.mp3quran.net/adhan/1.mp3" },
  { id: "madinah", name: "أذان الحرم المدني الشريف", url: "https://www.islamcan.com/audio/adhan/azan3.mp3" },
  { id: "alaqsa", name: "أذان المسجد الأقصى المبارك", url: "https://www.islamcan.com/audio/adhan/azan1.mp3" },
  { id: "abdulbasit", name: "أذان الشيخ عبد الباسط عبد الصمد", url: "https://www.islamcan.com/audio/adhan/azan20.mp3" },
  { id: "turkish", name: "أذان تركي رقيق هادئ", url: "https://www.islamcan.com/audio/adhan/azan15.mp3" },
  { id: "silent", name: "صامت (تنبيه بالاهتزاز فقط 📳)", url: "silent" },
  { id: "disabled", name: "إيقاف تنبيه الصوت كلياً 🔇", url: "disabled" },
];

const DEFAULT_PRAYERS_CONFIG: Record<string, PrayerNotificationConfig> = {
  Fajr: {
    adhanSound: "https://server11.mp3quran.net/adhan/1.mp3",
    preAdhanEnabled: true,
    preAdhanTime: 15,
    preAdhanMessage: "اقترب موعد أذان الفجر، استيقظ لفضل ركعتي الفجر فإنهما خير من الدنيا وما فيها ✨",
    postAdhanEnabled: true,
    postAdhanTime: 10,
    postAdhanMessage: "حان وقت ركعتي الفريضة وسنة الفجر، تقبّل الله طاعتكم"
  },
  Dhuhr: {
    adhanSound: "https://server11.mp3quran.net/adhan/1.mp3",
    preAdhanEnabled: true,
    preAdhanTime: 10,
    preAdhanMessage: "تأهب للوضوء وبادر لإدراك الصف الأول في صلاة الظهر 🕌",
    postAdhanEnabled: true,
    postAdhanTime: 15,
    postAdhanMessage: "اقتربت إقامة صلاة الظهر، ردد الأذكار ولا تنسَ السنن الرواتب"
  },
  Asr: {
    adhanSound: "https://server11.mp3quran.net/adhan/1.mp3",
    preAdhanEnabled: true,
    preAdhanTime: 10,
    preAdhanMessage: "أقبلت صلاة العصر، صلاة الوسطى المباركة.. هيّئ نفسك لأداء الفريضة 🕊️",
    postAdhanEnabled: true,
    postAdhanTime: 10,
    postAdhanMessage: "اقتربت إقامة صلاة العصر، نفعكم الله بالركوع والدعاء المستجاب"
  },
  Maghrib: {
    adhanSound: "https://server11.mp3quran.net/adhan/1.mp3",
    preAdhanEnabled: true,
    preAdhanTime: 10,
    preAdhanMessage: "أقرب صلاة الغروب، تأهب لانتهاء يومك بصلاة المغرب وشكر نعم الله المديدة 🌅",
    postAdhanEnabled: true,
    postAdhanTime: 5,
    postAdhanMessage: "دخل وقت صلاة المغرب وسنتها المؤكدة، يسر الله لكم القبول"
  },
  Isha: {
    adhanSound: "https://server11.mp3quran.net/adhan/1.mp3",
    preAdhanEnabled: true,
    preAdhanTime: 15,
    preAdhanMessage: "صلاة العشاء على الأبواب، أنهِ يومك السعيد في كنف المودة والسكينة والوقوف بين يدي الله 🌌",
    postAdhanEnabled: true,
    postAdhanTime: 10,
    postAdhanMessage: "شارف وقت إقامة صلاة العشاء، لا تنسَ الشكر والاستعداد لركعة الوتر الهامسة"
  }
};

const DEFAULT_GENERAL_REMINDERS: GeneralReminder[] = [
  {
    id: "friday_rem",
    title: "تذكير يوم الجمعة العظيم 🕋",
    enabled: true,
    time: "09:00",
    message: "يا باغي الخير، أقبل يوم الجمعة المبارك! رتل سورة الكهف وعطّر لسانك بالصلاة على المصطفى ﷺ 📿"
  },
  {
    id: "qiyam_rem",
    title: "تنبيه قيام الليل والوتر في الأسحار ✨",
    enabled: true,
    time: "02:30",
    message: "ألا مستغفر مسترزق؟ شرف المؤمن قيام الليل، تنازل الرحمن في ثلث الليل الأخير ينادي فقم والتمس بركاته 🌌"
  },
  {
    id: "fasting_rem",
    title: "تذكير صيام الاثنين والخميس والأيام البيض 🍃",
    enabled: true,
    time: "20:30",
    message: "تذكير بفضائل صيام الغد إن استطعت.. تسحّروا فإن في السحور بركة ونالوا شرف الطاعات والجنة"
  },
  {
    id: "morning_azkar",
    title: "أذكار الصباح ☀️",
    enabled: true,
    time: "06:00",
    message: "أصبحنا وأصبح الملك لله.. حان وقت تحصين النفس بأذكار الصباح والبدء بيوم منير"
  },
  {
    id: "evening_azkar",
    title: "أذكار المساء 🌙",
    enabled: true,
    time: "17:00",
    message: "أمسينا وأمسى الملك لله.. رطب لسانك بأذكار المساء واطمئن تحت رعاية الباري وكنفه"
  }
];

export default function AdvancedNotificationsSettings({
  onBack,
}: {
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar" || i18n.language === "ur";

  // State Management
  const [prayersConfig, setPrayersConfig] = useState<Record<string, PrayerNotificationConfig>>(() => {
    const saved = localStorage.getItem("prayer_notifications_individual_config");
    return saved ? JSON.parse(saved) : DEFAULT_PRAYERS_CONFIG;
  });

  const [generalReminders, setGeneralReminders] = useState<GeneralReminder[]>(() => {
    const saved = localStorage.getItem("general_islamic_reminders_config");
    return saved ? JSON.parse(saved) : DEFAULT_GENERAL_REMINDERS;
  });

  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    return localStorage.getItem("prayer_vibration_enabled") !== "false";
  });

  const [silentModeOverride, setSilentModeOverride] = useState<boolean>(() => {
    return localStorage.getItem("prayer_silent_override") === "true";
  });

  // UI Active State
  const [activeAccordion, setActiveAccordion] = useState<string | null>("Fajr");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Audio Previews Ref
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Stop playing on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.src = "";
      }
    };
  }, []);

  // Save changes to localStorage helper
  const saveToLocalStorage = (
    newConfig: Record<string, PrayerNotificationConfig>,
    newGenerals: GeneralReminder[],
    newVib: boolean,
    newOverride: boolean
  ) => {
    localStorage.setItem("prayer_notifications_individual_config", JSON.stringify(newConfig));
    localStorage.setItem("general_islamic_reminders_config", JSON.stringify(newGenerals));
    localStorage.setItem("prayer_vibration_enabled", String(newVib));
    localStorage.setItem("prayer_silent_override", String(newOverride));
    
    // Also save simple individual standard sound keys for easy retro-compatibility
    Object.keys(newConfig).forEach((prayerKey) => {
      localStorage.setItem(`adhan_sound_${prayerKey}`, newConfig[prayerKey].adhanSound);
    });
  };

  const notifyChange = () => {
    toast.success("تم حفظ تعديلات التنبيهات المتقدمة بنجاح 🕊️", {
      icon: "💾",
    });
  };

  // Sound play handler for Live Previewing
  const handleTogglePlayVoice = (voiceUrl: string, voiceId: string) => {
    if (voiceUrl === "silent" || voiceUrl === "disabled") {
      toast("تم كتم الصوت أو حظر الرنين لهذه الصلاة", { icon: "🔇" });
      return;
    }

    if (playingVoiceId === voiceId) {
      // Stop
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.src = "";
      }
      setPlayingVoiceId(null);
    } else {
      // Play
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const audio = new Audio(voiceUrl);
      audioPreviewRef.current = audio;
      setPlayingVoiceId(voiceId);

      audio.play().catch((e) => {
        console.error("Audio playback error", e);
        toast.error("فشل تشغيل الصوت للمعاينة، يرجى التحقق من اتصال الإنترنت 🌐");
        setPlayingVoiceId(null);
      });

      audio.addEventListener("ended", () => {
        setPlayingVoiceId(null);
      });
    }
  };

  // Modify individual prayer config
  const handleUpdateConfig = (
    prayerName: string,
    key: keyof PrayerNotificationConfig,
    value: any
  ) => {
    const updated = {
      ...prayersConfig,
      [prayerName]: {
        ...prayersConfig[prayerName],
        [key]: value,
      },
    };
    setPrayersConfig(updated);
    saveToLocalStorage(updated, generalReminders, vibrationEnabled, silentModeOverride);
  };

  // Modify general reminder config
  const handleUpdateGeneralReminder = (id: string, updates: Partial<GeneralReminder>) => {
    const updated = generalReminders.map((rem) =>
      rem.id === id ? { ...rem, ...updates } : rem
    );
    setGeneralReminders(updated);
    saveToLocalStorage(prayersConfig, updated, vibrationEnabled, silentModeOverride);
  };

  const handleResetToDefaults = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في إعادة تعيين كافة التنبيهات والأذان للوضع الافتراضي؟")) {
      setPrayersConfig(DEFAULT_PRAYERS_CONFIG);
      setGeneralReminders(DEFAULT_GENERAL_REMINDERS);
      setVibrationEnabled(true);
      setSilentModeOverride(false);
      saveToLocalStorage(DEFAULT_PRAYERS_CONFIG, DEFAULT_GENERAL_REMINDERS, true, false);
      toast.success("تمت العودة للضبط المصنعي والروحي الافتراضي 🕌");
    }
  };

  const getPrayerNameArabic = (prayerKey: string) => {
    switch (prayerKey) {
      case "Fajr": return "الفجر";
      case "Dhuhr": return "الظهر";
      case "Asr": return "العصر";
      case "Maghrib": return "المغرب";
      case "Isha": return "العشاء";
      default: return prayerKey;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FAF9F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 overflow-y-auto pb-24">
      {/* Dynamic Header with premium Islamic pattern style */}
      <div className="pt-12 pb-8 px-6 bg-[#0A1914] text-white rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden border-b border-amber-300/20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1080&auto=format&fit=crop")',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-[#0D5C4D]/60 via-[#0A1914]/90 to-[#041D15]/95 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/30 rounded-full -ml-16 -mb-16"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioPreviewRef.current) {
                  audioPreviewRef.current.pause();
                }
                onBack();
              }}
              className="p-2.5 hover:bg-white/10 rounded-full transition-all border border-white/10 bg-white/5 shadow-md flex items-center justify-center cursor-pointer"
            >
              <ArrowRight size={22} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-serif leading-tight drop-shadow-md text-[#E2C392]">
                تخصيص الإشعارات المتقدمة
              </h1>
              <p className="text-emerald-100/80 text-xs md:text-sm font-medium mt-1">
                حدد أصوات الأذان وتنبيهات ما قبل وبعد الفروض الروحية لكل صلاة
              </p>
            </div>
          </div>
          <div className="w-12 h-12 bg-[#0D5C4D] backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-300/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] shrink-0">
            <BellRing size={24} className="text-[#E2C392]" />
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-6 pt-6">
        
        {/* Core Quick Warnings & Global Settings */}
        <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-[#9F793E] dark:text-[#E2C392]" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">تحكم الإشعارات الشامل</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-emerald-950/10 rounded-2xl border border-slate-100 dark:border-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-[#9F793E] rounded-xl">
                  <Vibrate size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">الاهتزاز مع الأذان</h4>
                  <p className="text-[10px] text-slate-500 dark:text-emerald-400">تنبيه بالاهتزاز مستمر على هاتف العمل</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={vibrationEnabled}
                  onChange={(e) => {
                    setVibrationEnabled(e.target.checked);
                    saveToLocalStorage(prayersConfig, generalReminders, e.target.checked, silentModeOverride);
                    toast.success(e.target.checked ? "تم تفعيل الاهتزاز بنجاح 📳" : "تم إلغاء الاهتزاز 📴");
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#0D5C4D]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-emerald-950/10 rounded-2xl border border-slate-100 dark:border-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 dark:bg-[#0D5C4D]/20 text-emerald-600 rounded-xl">
                  <ShieldAlert size={18} className="text-emerald-500 dark:text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">تجاوز الوضع الصامت</h4>
                  <p className="text-[10px] text-slate-500 dark:text-emerald-400">إطلاق الأذان لإنقاذ الصلاة في الصامت</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={silentModeOverride}
                  onChange={(e) => {
                    setSilentModeOverride(e.target.checked);
                    saveToLocalStorage(prayersConfig, generalReminders, vibrationEnabled, e.target.checked);
                    toast.success(e.target.checked ? "مفعل: سيتجاوز الرنين الوضع الصامت 🔈" : "تم إلغاء تجاوز الوضع الصامت");
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#0D5C4D]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 1. SECTION: PRAYERS INDIVIDUAL CONFIGS (أوقات الصلوات والتحكم المنفرد) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-bold font-serif text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock size={20} className="text-[#0D5C4D] dark:text-emerald-400" />
              أصوات الأذان والتنبيهات المخصصة للفروض
            </h2>
          </div>

          <div className="space-y-3.5">
            {Object.keys(prayersConfig).map((prayerKey) => {
              const config = prayersConfig[prayerKey];
              const isExpanded = activeAccordion === prayerKey;
              const prayerNameAr = getPrayerNameArabic(prayerKey);

              return (
                <div
                  key={prayerKey}
                  className="bg-white dark:bg-[#0A1914] rounded-3xl overflow-hidden border border-slate-100 dark:border-emerald-950/40 shadow-sm group duration-300"
                >
                  {/* Header Row */}
                  <div
                    onClick={() => setActiveAccordion(isExpanded ? null : prayerKey)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-emerald-950/5 select-none"
                  >
                    <div className="flex items-center gap-4">
                      {/* Prayer Circle Label */}
                      <div className="w-12 h-12 rounded-2xl bg-[#0D5C4D]/5 dark:bg-[#0D5C4D]/10 text-[#0D5C4D] dark:text-[#E2C392] flex flex-col items-center justify-center font-bold font-serif group-hover:scale-105 transition-transform duration-300">
                        <span className="text-base font-extrabold leading-none">{prayerNameAr}</span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                          صلاة {prayerNameAr}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-400 mt-0.5">
                          صوت:{" "}
                          {
                            ADHAN_VOICES.find((v) => v.url === config.adhanSound)?.name ||
                            "مخصص"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status indicator pill */}
                      {(config.preAdhanEnabled || config.postAdhanEnabled) && (
                        <span className="hidden sm:inline bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20">
                          تنبيه ذكي مفعل
                        </span>
                      )}
                      
                      <div className="text-slate-400 text-xs">
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </div>
                  </div>

                  {/* Settings Expand Block utilizing AnimatePresence */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-slate-50 dark:border-emerald-950/20 bg-slate-50/50 dark:bg-[#07130F]/40"
                      >
                        <div className="p-5 space-y-5">
                          
                          {/* Part 1: Adhan Voice Selector */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              صوت مؤذن صلاة {prayerNameAr}:
                            </label>

                            <div className="grid gap-2">
                              {ADHAN_VOICES.map((voice) => {
                                const isSelected = config.adhanSound === voice.url;
                                const isPlayingThis = playingVoiceId === voice.id;

                                return (
                                  <div
                                    key={voice.id}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                                      isSelected
                                        ? "bg-[#0D5C4D]/5 dark:bg-[#0D5C4D]/20 border-[#C59F60] text-emerald-900 dark:text-emerald-300"
                                        : "bg-white dark:bg-[#0A1914] border-slate-100 dark:border-emerald-950/50 hover:border-slate-200 dark:hover:border-emerald-800"
                                    }`}
                                  >
                                    <div
                                      onClick={() => {
                                        handleUpdateConfig(prayerKey, "adhanSound", voice.url);
                                        toast(`تم تعيين ${voice.name} لفرض ${prayerNameAr}`, { icon: "✅" });
                                      }}
                                      className="flex-1 flex items-center gap-3 cursor-pointer"
                                    >
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                          isSelected
                                            ? "border-[#C59F60]"
                                            : "border-slate-300 dark:border-slate-600"
                                        }`}
                                      >
                                        {isSelected && (
                                          <div className="w-2.5 h-2.5 rounded-full bg-[#C59F60]" />
                                        )}
                                      </div>
                                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {voice.name}
                                      </div>
                                    </div>

                                    {/* Preview Sound Button */}
                                    {voice.url !== "silent" && voice.url !== "disabled" && (
                                      <button
                                        onClick={() => handleTogglePlayVoice(voice.url, voice.id)}
                                        className={`p-1.5 px-3 rounded-xl border flex items-center gap-1.5 text-[11px] font-black transition-all ${
                                          isPlayingThis
                                            ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                                            : "bg-[#9F793E]/10 dark:bg-[#E2C392]/10 border-[#c59f60]/20 text-[#9F793E] dark:text-[#E2C392] hover:bg-[#c59f60]/20"
                                        }`}
                                      >
                                        {isPlayingThis ? (
                                          <>
                                            <Square size={12} className="fill-current" />
                                            <span>إيقاف</span>
                                          </>
                                        ) : (
                                          <>
                                            <Play size={12} className="fill-current" />
                                            <span>استماع</span>
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <hr className="border-slate-100 dark:border-emerald-950/20" />

                          {/* Part 2: Pre-Adhan Reminders Setup */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Bell className="text-amber-500" size={16} />
                                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-300">
                                  تنبيه هائم ما قبل الأذان
                                </span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={config.preAdhanEnabled}
                                  onChange={(e) =>
                                    handleUpdateConfig(prayerKey, "preAdhanEnabled", e.target.checked)
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:transition-all peer-checked:bg-[#0D5C4D]"></div>
                              </label>
                            </div>

                            {config.preAdhanEnabled && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3.5 bg-white dark:bg-[#0A1914] p-4 rounded-2xl border border-slate-100 dark:border-emerald-950/50"
                              >
                                <div>
                                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-emerald-400 mb-1.5">
                                    <span>صوت التذكير قبل الأذان بـ:</span>
                                    <span className="font-mono font-black text-[#9F793E] dark:text-[#E2C392]">
                                      {config.preAdhanTime} دقيقة
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="60"
                                    value={config.preAdhanTime}
                                    onChange={(e) =>
                                      handleUpdateConfig(
                                        prayerKey,
                                        "preAdhanTime",
                                        parseInt(e.target.value, 10)
                                      )
                                    }
                                    className="w-full h-1.5 bg-slate-100 dark:bg-emerald-950/50 rounded-lg appearance-none cursor-pointer accent-[#0D5C4D]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    رسالة التنبيه الذكية:
                                  </span>
                                  <textarea
                                    value={config.preAdhanMessage}
                                    onChange={(e) =>
                                      handleUpdateConfig(prayerKey, "preAdhanMessage", e.target.value)
                                    }
                                    rows={2}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-100 dark:border-emerald-950/30 bg-slate-50 dark:bg-[#07130F] focus:outline-none focus:border-[#0D5C4D] text-slate-700 dark:text-emerald-50 leading-relaxed resize-none font-serif font-semibold"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </div>

                          <hr className="border-slate-100 dark:border-emerald-950/20" />

                          {/* Part 3: Post-Adhan Reminders Setup */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BellRing className="text-emerald-500" size={16} />
                                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-300">
                                  تنبيه الإقامة وحرمة الفريضة (بعد الأذان)
                                </span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={config.postAdhanEnabled}
                                  onChange={(e) =>
                                    handleUpdateConfig(prayerKey, "postAdhanEnabled", e.target.checked)
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:transition-all peer-checked:bg-[#0D5C4D]"></div>
                              </label>
                            </div>

                            {config.postAdhanEnabled && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3.5 bg-white dark:bg-[#0A1914] p-4 rounded-2xl border border-slate-100 dark:border-emerald-950/50"
                              >
                                <div>
                                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-emerald-400 mb-1.5">
                                    <span>تنبيه الإقامة أو السنن الرواتب بعد:</span>
                                    <span className="font-mono font-black text-[#9F793E] dark:text-[#E2C392]">
                                      {config.postAdhanTime} دقيقة
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="45"
                                    value={config.postAdhanTime}
                                    onChange={(e) =>
                                      handleUpdateConfig(
                                        prayerKey,
                                        "postAdhanTime",
                                        parseInt(e.target.value, 10)
                                      )
                                    }
                                    className="w-full h-1.5 bg-slate-100 dark:bg-emerald-950/50 rounded-lg appearance-none cursor-pointer accent-[#9F793E]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    رسالة تنبيه المسجد والصلوات:
                                  </span>
                                  <textarea
                                    value={config.postAdhanMessage}
                                    onChange={(e) =>
                                      handleUpdateConfig(prayerKey, "postAdhanMessage", e.target.value)
                                    }
                                    rows={2}
                                    className="w-full text-xs p-3 rounded-xl border border-slate-100 dark:border-emerald-950/30 bg-slate-50 dark:bg-[#07130F] focus:outline-none focus:border-[#C59F60] text-slate-700 dark:text-emerald-50 leading-relaxed resize-none font-serif font-semibold"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. SECTION: GENERAL SMART REMINDERS (تذكيرات وعبادات الإسلام الأخرى) */}
        <div className="space-y-3">
          <h2 className="font-bold font-serif text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 px-2 pt-2">
            <Sparkles size={20} className="text-[#C59F60]" />
            محطات التذكير والعبادات السنية والوطنية
          </h2>

          <div className="space-y-4">
            {generalReminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white dark:bg-[#0A1914] p-5 rounded-3xl border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 text-[#9F793E] dark:text-[#E2C392] font-semibold text-xs leading-none">
                      🕒 {rem.time}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                        {rem.title}
                      </h3>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rem.enabled}
                      onChange={(e) => handleUpdateGeneralReminder(rem.id, { enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#0D5C4D]"></div>
                  </label>
                </div>

                {rem.enabled && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-emerald-400">ساعة إرسال التنبيه:</span>
                        <input
                          type="time"
                          value={rem.time}
                          onChange={(e) => handleUpdateGeneralReminder(rem.id, { time: e.target.value })}
                          className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-100 dark:border-emerald-950/30 bg-slate-50 dark:bg-[#07130F] focus:outline-none focus:border-[#0D5C4D] text-slate-700 dark:text-slate-200"
                        />
                      </div>

                      <div className="flex gap-2 justify-end self-end">
                        <button
                          onClick={() => {
                            toast(`تم جدولة ${rem.title} بنجاح!`, { icon: "🔔" });
                          }}
                          className="text-[11px] font-black bg-[#0D5C4D]/10 hover:bg-[#0D5C4D]/25 border border-emerald-500/20 text-[#0D5C4D] dark:text-emerald-400 p-2.5 px-3.5 rounded-xl transition-all"
                        >
                          اختبار التنبيه 📱
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-emerald-400">نص الرسالة المنبثقة:</span>
                      <textarea
                        value={rem.message}
                        onChange={(e) => handleUpdateGeneralReminder(rem.id, { message: e.target.value })}
                        rows={2}
                        className="w-full text-xs p-3 rounded-xl border border-slate-100 dark:border-emerald-950/30 bg-slate-50 dark:bg-[#07130F] focus:outline-none focus:border-[#E2C392] text-slate-700 dark:text-slate-100 leading-relaxed font-serif font-semibold resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="flex gap-3.5 pt-4">
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-gradient-to-r from-[#0D5C4D] to-[#0A1914] text-white hover:opacity-95 font-bold font-serif rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/10 text-center text-sm md:text-base border border-amber-300/20"
          >
            حفظ كافة التغييرات والعودة لقائمة الإعدادات
          </button>
          
          <button
            onClick={handleResetToDefaults}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/25 p-3.5 px-4.5 rounded-2xl transition-all font-bold font-serif text-sm flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw size={16} />
            إعادة تعيين
          </button>
        </div>

      </div>
    </div>
  );
}

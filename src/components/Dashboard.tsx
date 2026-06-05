import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  MapPin, 
  Compass, 
  Heart, 
  Activity, 
  Moon, 
  ChevronLeft, 
  Calendar, 
  Quote, 
  Share2,
  Sparkles,
  Sun,
  Bot,
  Mic,
  Target,
  Radio,
  Trophy,
  ShieldCheck,
  Volume2,
  Flame,
  Info,
  Puzzle,
  Wind,
  Video,
  Scan,
  Hourglass,
  Baby,
  ImageIcon,
  Bell,
  Book
} from "lucide-react";
import { motion } from "motion/react";
import { usePrayerTimes } from "../contexts/PrayerTimesContext";
import { useAuth } from "../contexts/AuthContext";
import { db, OperationType, handleFirestoreError } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DownloadAppBanner from "./DownloadAppBanner";
import CharityToday from "./CharityToday";
import ArabicWidget from "./ArabicWidget";
import { useTranslation } from 'react-i18next';
import { getGeminiClient } from "../lib/gemini";
import VoiceSearchAssistant from "./VoiceSearchAssistant";
import { requestNotificationPermission } from "../services/NotificationService";
import toast from 'react-hot-toast';
import { CheckCircle2, RefreshCw, AlertCircle, Sparkles as SparklesIcon, Trash2, Sliders, ChevronRight as ChevronRightIcon, ChevronDown, Search, Globe, Key } from "lucide-react";

export const POPULAR_CITIES = [
  { name: "مكة المكرمة", lat: 21.4225, lon: 39.8262, country: "المملكة العربية السعودية" },
  { name: "المدينة المنورة", lat: 24.4672, lon: 39.6111, country: "المملكة العربية السعودية" },
  { name: "القاهرة", lat: 30.0444, lon: 31.2357, country: "مصر" },
  { name: "الرياض", lat: 24.7136, lon: 46.6753, country: "المملكة العربية السعودية" },
  { name: "جدة", lat: 21.4858, lon: 39.1925, country: "المملكة العربية السعودية" },
  { name: "القدس الشريف", lat: 31.7683, lon: 35.2137, country: "فلسطين المحتلة" },
  { name: "بغداد", lat: 33.3152, lon: 44.3661, country: "العراق" },
  { name: "عمان", lat: 31.9539, lon: 35.9106, country: "الأردن" },
  { name: "الإسكندرية", lat: 31.2001, lon: 29.9187, country: "مصر" },
  { name: "دبي", lat: 25.2048, lon: 55.2708, country: "الإمارات العربية المتحدة" },
  { name: "الكويت", lat: 29.3759, lon: 47.9774, country: "الكويت" },
  { name: "المنامة", lat: 26.2285, lon: 50.586, country: "البحرين" },
  { name: "الدوحة", lat: 25.2854, lon: 51.531, country: "قطر" },
  { name: "مسقط", lat: 23.5859, lon: 58.4059, country: "عمان" },
  { name: "صنعاء", lat: 15.3694, lon: 44.191, country: "اليمن" },
  { name: "الخرطوم", lat: 15.5007, lon: 32.5599, country: "السودان" },
  { name: "طرابلس", lat: 32.8872, lon: 13.1913, country: "ليبيا" },
  { name: "تونس", lat: 36.8065, lon: 10.1815, country: "تونس" },
  { name: "الجزائر", lat: 36.7525, lon: 3.042, country: "الجزائر" },
  { name: "الدار البيضاء", lat: 33.5731, lon: -7.5898, country: "المغرب" }
];

export function calculateDistanceToKaaba(lat: number, lon: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومترات
  const dLat = (21.4225 - lat) * Math.PI / 180;
  const dLon = (39.8262 - lon) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat * Math.PI / 180) * Math.cos(21.4225 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { 
    prayerTimes, 
    hijriDate, 
    gregorianDate, 
    locationName, 
    userLocation, 
    loading, 
    error, 
    updateLocation, 
    detectLocation, 
    resetToDefault 
  } = usePrayerTimes();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [nextPrayerTime, setNextPrayerTime] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Location Modal States
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchCityQuery, setSearchCityQuery] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");
  const [customLocName, setCustomLocName] = useState("");
  const [locateState, setLocateState] = useState<"idle" | "locating" | "success" | "error">("idle");
  const [locateError, setLocateError] = useState("");

  useEffect(() => {
    if (userLocation) {
      setCustomLat(userLocation.lat.toString());
      setCustomLon(userLocation.lon.toString());
      setCustomLocName(locationName);
    }
  }, [userLocation, locationName, locationModalOpen]);
  const [dailyAyah, setDailyAyah] = useState<{text: string, surah: string} | null>(null);
  const [dailyHadith, setDailyHadith] = useState<{text: string, narrator: string} | null>(null);
  const [dailyDua, setDailyDua] = useState<{text: string, source: string} | null>(null);
  const [streak, setStreak] = useState<number>(1);
  const [isFasting, setIsFasting] = useState<boolean>(false);
  const [isDuhaPrayed, setIsDuhaPrayed] = useState<boolean>(false);
  const [prayedToday, setPrayedToday] = useState<Record<string, boolean>>({
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false
  });
  const [lastReadQuran, setLastReadQuran] = useState<{ surahNumber: number, surahName: string } | null>(null);
  const [tasbeehProgress, setTasbeehProgress] = useState<{ count: number, target: number } | null>(null);
  const [dailyNiyyah, setDailyNiyyah] = useState<string>("");
  const [isEditingNiyyah, setIsEditingNiyyah] = useState<boolean>(false);
  const [niyyahLoading, setNiyyahLoading] = useState<boolean>(false);
  const [niyyahSuggestions, setNiyyahSuggestions] = useState<string[]>([]);
  const [niyyahError, setNiyyahError] = useState<string>("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>(() => localStorage.getItem('user_custom_gemini_key') || '');
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(() => !!localStorage.getItem('user_custom_gemini_key'));
  const [elderlyMode, setElderlyMode] = useState<boolean>(() => localStorage.getItem("elderlyModeEnabled") === "true");
  const [spiritualFirstMode, setSpiritualFirstMode] = useState<boolean>(() => localStorage.getItem("spiritualFirstModeEnabled") === "true");

  // Voice Search Assistant & Mosque Mode states
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [mosqueModeEnabled, setMosqueModeEnabled] = useState(() => localStorage.getItem("mosqueModeEnabled") === "true");
  const [mosqueModeMuteDuration, setMosqueModeMuteDuration] = useState(() => parseInt(localStorage.getItem("mosqueModeMuteDuration") || "20", 10));

  const toggleMosqueMode = () => {
    const nextVal = !mosqueModeEnabled;
    setMosqueModeEnabled(nextVal);
    localStorage.setItem("mosqueModeEnabled", nextVal ? "true" : "false");
    window.dispatchEvent(new Event("storage"));
    if (nextVal) {
      toast.success(`تم تفعيل وضع المسجد الصامت تلقائياً لمدة ${mosqueModeMuteDuration} دقيقة من فترات الصلاة! 🕌`);
    } else {
      toast.success("تم إيقاف وضع المسجد الصامت؛ عادت الإشعارات للوضع الافتراضي.");
    }
  };

  const updateMosqueModeDuration = (duration: number) => {
    setMosqueModeMuteDuration(duration);
    localStorage.setItem("mosqueModeMuteDuration", duration.toString());
    window.dispatchEvent(new Event("storage"));
    toast.success(`تم تعيين مدة كتم الصلاة إلى ${duration} دقيقة.`);
  };

  const checkMosqueCurrentlyMuting = () => {
    if (!mosqueModeEnabled) return null;
    if (!prayerTimes) return null;

    const nowCheck = new Date();
    const currentMins = nowCheck.getHours() * 60 + nowCheck.getMinutes();

    const prayers = [
      { id: "Fajr", name: "الفجر" },
      { id: "Dhuhr", name: "الظهر" },
      { id: "Asr", name: "العصر" },
      { id: "Maghrib", name: "المغرب" },
      { id: "Isha", name: "العشاء" },
    ];

    for (const pr of prayers) {
      const timeStr = prayerTimes[pr.id as keyof typeof prayerTimes];
      if (!timeStr) continue;
      const cleanTimeStr = timeStr.split(' ')[0];
      const [h, m] = cleanTimeStr.split(':').map(Number);
      const prayerMins = h * 60 + m;

      if (currentMins >= prayerMins && currentMins <= (prayerMins + mosqueModeMuteDuration)) {
        return {
          prayerName: pr.name,
          remaining: (prayerMins + mosqueModeMuteDuration) - currentMins
        };
      }
    }
    return null;
  };

  const activeMuteInfo = checkMosqueCurrentlyMuting();

  const [showNotificationRequest, setShowNotificationRequest] = useState<boolean>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const alreadyDismissed = localStorage.getItem("dismissed_notification_request") === "true";
      return !alreadyDismissed && Notification.permission !== "granted";
    }
    return false;
  });

  const handleRequestNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const granted = await requestNotificationPermission();
      if (granted) {
        localStorage.setItem("prayerNotificationsEnabled", "true");
        localStorage.setItem("autoAdhanEnabled", "true");
        window.dispatchEvent(new Event("storage"));
        toast.success("تم تفعيل إشعارات الأذان الإيمانية بنجاح! 🔔");
      } else {
        localStorage.setItem("prayerNotificationsEnabled", "false");
        toast.error("لم يتم منح إذن الإشعارات من المتصفح.");
      }
      setShowNotificationRequest(false);
    } else {
      toast.error("هذا المتصفح لا يدعم الإشعارات.");
    }
  };

  const handleDismissNotificationRequest = () => {
    localStorage.setItem("dismissed_notification_request", "true");
    setShowNotificationRequest(false);
  };

  const handleGenerateNiyyah = async () => {
    setNiyyahLoading(true);
    setNiyyahError("");
    setNiyyahSuggestions([]);
    try {
      const prompt = `اقترح 3 نوايا إيمانية أو سلوكية دينية قصيرة ومجاهدة ومؤثرة لليوم باللغة العربية المشرقة والربانية الصادقة، تعزز التقوى والإخلاص وحسن الخلق ومحبة الخير وصنائع المعروف للناس. الأوراد والعبادات. أرجع الإجابة كصيغة JSON صالحة تماماً مكوّنة من مصفوفة نصوص تسمى "intentions":
{
  "intentions": [
    "النية المقترحة الأولى بأسلوب رباني رائع ومحبب للقلوب",
    "النية المقترحة الثانية بأسلوب رائع وجميل ومبتكر",
    "النية المقترحة الثالثة بأسلوب رائع"
  ]
}
لا تضع أي نصوص أخرى خارج الـ JSON.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text);
      if (parsed && Array.isArray(parsed.intentions)) {
        setNiyyahSuggestions(parsed.intentions);
      } else {
        throw new Error("تنسيق الرد غير صالح");
      }
    } catch (err: any) {
      console.error(err);
      // Beautiful fallback intentions
      setNiyyahSuggestions([
        "تجديد الإخلاص لله في القول والعمل ومراقبة خطرات الصدر والقلب التزاماً بالسنة المباركة.",
        "جبر خواطر العباد بابتسامة دافئة وكلمة طيبة وإماطة الأذى عن طرقات المسلمين بغية مرضاة الخالق.",
        "الاستكثار من زاد الآخرة بالبقاء على وضوء طيلة اليوم والمداومة على أوراد صيانة القرآن والذكر الرباني."
      ]);
    } finally {
      setNiyyahLoading(false);
    }
  };

  // AI Personalization Onboarding State
  const [userRoutine, setUserRoutine] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("user_custom_ai_routine") || "[]");
    } catch { return []; }
  });
  const [routineChecked, setRoutineChecked] = useState<{ [key: string]: boolean }>(() => {
    try {
      const today = new Date().toDateString();
      const parsed = JSON.parse(localStorage.getItem("user_custom_ai_routine_checked") || "{}");
      if (parsed.date === today) return parsed.checked || {};
    } catch {}
    return {};
  });
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({ goal: "", time: "", level: "" });
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiOnboarding, setShowAiOnboarding] = useState(() => {
    return !localStorage.getItem("user_custom_ai_routine");
  });

  // Daily Quranic Khatmah State
  const [quranPlanData, setQuranPlanData] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("quranPlan") || "null");
    } catch { return null; }
  });

  // What should I read today state handles
  const [whatToReadOpen, setWhatToReadOpen] = useState(false);
  const [selectedSpiritualState, setSelectedSpiritualState] = useState<string | null>(null);
  const [aiPrescription, setAiPrescription] = useState("");
  const [aiPrescriptionLoading, setAiPrescriptionLoading] = useState(false);

  const handleSaveRoutineChecked = (updatedChecked: { [key: string]: boolean }) => {
    const today = new Date().toDateString();
    setRoutineChecked(updatedChecked);
    localStorage.setItem("user_custom_ai_routine_checked", JSON.stringify({ date: today, checked: updatedChecked }));
  };

  const handleCompleteQuranPlanDay = (dayIndex: number) => {
    if (!quranPlanData) return;
    const newPlan = [...quranPlanData.plan];
    newPlan[dayIndex].status = "completed";
    
    // Set next pending to current
    const nextPendingIndex = newPlan.findIndex((p: any, i: number) => i > dayIndex && p.status === "pending");
    if (nextPendingIndex !== -1) {
      newPlan[nextPendingIndex].status = "current";
    }
    
    const updated = { ...quranPlanData, plan: newPlan };
    setQuranPlanData(updated);
    localStorage.setItem("quranPlan", JSON.stringify(updated));
  };

  const handleGenerateAiRoutine = async () => {
    setAiLoading(true);
    
    const goalMap: any = {
      quran: "تلاوة وحفظ القرآن الكريم 📖",
      prayers: "المواظبة والخشوع في الصلوات والسنن الرواتب 🕌",
      knowledge: "التفقه في الدين والحديث الشريف والسيرة النبوية 📚",
      peace: "السكينة والأدعية وأذكار التحصين والرقية 🌿"
    };

    const timeMap: any = {
      "10m": "١٠ دقائق خفيفة ومستمرة ⏱️",
      "30m": "٣٠ دقيقة خاشعة متكاملة ⏳",
      "1h": "ساعة فأكثر للاستثمار الإيماني 🕋"
    };

    const levelMap: any = {
      beginner: "مبتدئ يبحث عن الأساسيات وبناء العادة 🌟",
      mid: "متوسط يبحث عن تكثيف الأوردة والمحافظة 📈",
      advanced: "متقدم يسعى للتفكر العميق والمراجعة الدؤوبة 🎓"
    };

    const goalLabel = goalMap[quizAnswers.goal] || "التقرب إلى الله";
    const timeLabel = timeMap[quizAnswers.time] || "وقت مرن";
    const levelLabel = levelMap[quizAnswers.level] || "عام";

    // Standard high-quality fallback lists to guarantee zero-failure robustness
    const fallbackMap: any = {
      quran: {
        "10m": ["تلاوة صفحتين من القرآن الكريم بتمعن بعد صلاة الفجر", "تصفح معاني آية واحدة مع التفسير الميسر", "ترديد أذكار الصباح كاملة والحمد لله"],
        "30m": ["تلاوة ٥ صفحات من القرآن الكريم بتدبر هادئ", "تنبيه النفس لتعديل مقدار ورد التلاوة اليومي", "سماع تلاوة مرتلة خاشعة لعشر دقائق"],
        "1h": ["تلاوة حزب كامل من الذكر الحكيم يومياً", "مراجعة خمسة صفحات من محفوظاتك القرآنية السابقة", "حفظ ٣ آيات جديدة مع تدبر تفسير السعدي المبارك"]
      },
      prayers: {
        "10m": ["المحافظة على صلاة الوتر ولو ركعة واحدة قبل المنام", "ترديد أذكار ما بعد الصلاة مباشرة بدقة خاشعة", "المحافظة على تكبيرة الإحرام بالمسجد"],
        "30m": ["تأدية بعض السنن الرواتب المرفقة بالفرائض الخمس", "جلسة استغفار خاشعة وتوبة صادقة لمدة ٥ دقائق كاملة", "صلاة ركعتي الضحى لفتح أبواب البركة لنهارك"],
        "1h": ["المحافظة التامة على الرواتب الاثني عشر والضحى والوتر", "الاستغفار بالأسحار والتهجد بركعتين قبل صلاة الفجر", "جلسة تدبر ودعاء مباركة بين الأذان والإقامة بمسجد الحي"]
      },
      knowledge: {
        "10m": ["قراءة حديث شريف واحد من الأربعين النووية بشرح مختصر", "التفكر بوعي في معاني اسم واحد من أسماء الله الحسنى", "قراءة صفحة من كتاب في تفاسير الآيات العطرة"],
        "30m": ["قراءة باب نافع من رياض الصالحين والمداومة عليه", "الاستماع لمقطع فقهي توعوي أو سلسلة مواعظ إيمانية", "مراجعة أحكام طهارة القلوب وتزكية النفس"],
        "1h": ["دراسة صفحتين من كتاب في الفقه الميسر أو أصول السيرة", "الاستماع لدرس شرعي متكامل ميسر", "حفظ حديث شريف وصياغة فوائده الشرعية لنشره"]
      },
      peace: {
        "10m": ["الالتزام الكامل بقراءة أذكار الصباح في وقتها الأصلي", "تلاوة آية الكرسي والمعوذات للتحصين دبر كل مكتوبة", "جلسة استغفار خاشعة ١٠٠ مرة لرفع الكروب والهموم"],
        "30m": ["تلاوة أذكار الصباح والمساء كاملة بخشوع وحضور قلب", "سماع الرقية الشرعية المسكّنة لطرد الوساوس وطلي العافية", "المحافظة على قول لا حول ولا قوة إلا بالله ١٠٠ مرة بيقين"],
        "1h": ["ورد صلاة على النبي ﷺ ١٠٠٠ مرة لفتح بركات الدنيا والآخرة", "تلاوة سورة الملك المنجية من عذاب القبر قبل النوم برضا", "جلسة مناجاة طويلة وبوح لله تعالى بجميع الأمنيات بدعاء خاشع"]
      }
    };

    let generatedRoutine: string[] = [];

    // Attempt actual Gemini generation
    try {
      const client = getGeminiClient();
      const prompt = `أنا مستخدم مسلم. إجابات التخصيص الإيماني الخاصة بي:
- هدفي الإيماني الأكبر: ${goalLabel}
- الوقت اليومي المتاح: ${timeLabel}
- مستواي الحالي: ${levelLabel}

اكتب لي برنامجاً يومياً إيمانياً مخصصاً مبهجاً ومقنعاً وعملياً جداً مكون من 3 أو 4 بنود عملية يومية واضحة ومحددة تناسب الوقت والمستوى والهدف تماماً. اكتب الرد كقائمة JSON تحتوي مصفوفة من السلاسل النصية "tasks" فقط كالمثال التالي: {"tasks": ["بند 1", "بند 2"]}. لا تكتب أي كلام آخر خارج سياق الرد أو وسوم ماركداون لكي أستطيع تحليله بشكل مباشر وموثوق.`;
      
      const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      if (res && res.text) {
        const cleanedText = res.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        if (parsed && Array.isArray(parsed.tasks)) {
          generatedRoutine = parsed.tasks;
        }
      }
    } catch (e) {
      console.warn("Gemini personalization call missed, loading local smart synthesis fallback:", e);
    }

    if (generatedRoutine.length === 0) {
      const goalKey = quizAnswers.goal || "peace";
      const timeKey = quizAnswers.time || "30m";
      generatedRoutine = fallbackMap[goalKey]?.[timeKey] || fallbackMap["peace"]["30m"];
    }

    setUserRoutine(generatedRoutine);
    localStorage.setItem("user_custom_ai_routine", JSON.stringify(generatedRoutine));
    handleSaveRoutineChecked({});
    setShowAiOnboarding(false);
    setAiLoading(false);
  };

  const handleResetRoutine = () => {
    localStorage.removeItem("user_custom_ai_routine");
    setUserRoutine([]);
    setShowAiOnboarding(true);
    setQuizStep(0);
    setQuizAnswers({ goal: "", time: "", level: "" });
  };

  const handleAskAiPrescription = async (moodKey: string, verseText: string) => {
    setAiPrescriptionLoading(true);
    setAiPrescription("");
    try {
      const client = getGeminiClient();
      const prompt = `بصفتك واعظ روحي إسلامي رقيق القلب ومحب، وبناء على اختيار المستخدم لمشاعر: "${moodKey}" وتلاوته للآية الكريمة: "${verseText}". اكتب له رسالة مبهجة، دافئة جداً، وقصيرة من 2-3 أسطر تعيد الطمأنينة لقلبه وتوضح له كيف يعيش ببركة هذه الآية اليوم مجسداً معانيها. قل له كلمات تلمس فؤاده بلغة عربية عذبة فصيحة ومثيرة للتفاؤل والسكون العجيب.`;
      
      const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      if (res && res.text) {
        setAiPrescription(res.text);
      }
    } catch (e) {
      setAiPrescription("أبشر وتفاءل يا أخي الطيب وحليفك الصبر والإيمان؛ آيات الله ملاذك الآمن وحصنك المتين في كل حال. تأمل هذه الآية ورددها بيقين تفرج الكرب وتزول المتاعب.");
    } finally {
      setAiPrescriptionLoading(false);
    }
  };


  useEffect(() => {
    const today = new Date().toDateString();
    
    // Load Prayer Tracker
    const prayersSaved = localStorage.getItem('prayedToday');
    if (prayersSaved) {
      try {
        const parsed = JSON.parse(prayersSaved);
        if (parsed.date === today) {
          setPrayedToday(parsed.data);
        }
      } catch (e) {}
    }

    const fastingSaved = localStorage.getItem('fastingToday');
    if (fastingSaved) {
      try {
        const parsed = JSON.parse(fastingSaved);
        if (parsed.date === today) {
          setIsFasting(parsed.isFasting);
        }
      } catch (e) {}
    }

    // Load Duha Tracker
    const duhaSaved = localStorage.getItem('duhaToday');
    if (duhaSaved) {
      try {
        const parsed = JSON.parse(duhaSaved);
        if (parsed.date === today) {
          setIsDuhaPrayed(parsed.isDuhaPrayed);
        }
      } catch (e) {}
    }

    const lastVisit = localStorage.getItem('lastVisitDate');
    let currentStreak = parseInt(localStorage.getItem('appStreak') || '0', 10);
    let streakUpdated = false;

    if (lastVisit !== today) {
      if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      localStorage.setItem('lastVisitDate', today);
      localStorage.setItem('appStreak', currentStreak.toString());
      streakUpdated = true;
    } else if (currentStreak === 0) {
      currentStreak = 1;
      localStorage.setItem('appStreak', '1');
      streakUpdated = true;
    }
    setStreak(currentStreak);

    // Sync with Firestore if logged in
    if (user && user.uid !== 'local_guest' && streakUpdated) {
      const syncStreak = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.streak !== currentStreak) {
              await updateDoc(userDocRef, { streak: currentStreak });
            }
          }
        } catch (err: any) {
          console.error("Error syncing streak:", err);
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        }
      };
      syncStreak();
    } else if (user && user.uid !== 'local_guest' && !streakUpdated) {
      // Just fetch it to make sure it matches
      const fetchStreak = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.streak && data.streak > currentStreak) {
              setStreak(data.streak);
              localStorage.setItem('appStreak', data.streak.toString());
            }
          }
        } catch (err: any) {
          console.error("Error fetching streak:", err);
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        }
      };
      fetchStreak();
    }

    const quranSaved = localStorage.getItem('quranLastRead');
    if (quranSaved) {
      try {
        setLastReadQuran(JSON.parse(quranSaved));
      } catch (e) {}
    }

    const tasbeehSaved = localStorage.getItem('tasbeehCount');
    const tasbeehTarget = localStorage.getItem('tasbeehTarget');
    if (tasbeehSaved && tasbeehTarget) {
      const count = parseInt(tasbeehSaved, 10);
      const target = parseInt(tasbeehTarget, 10);
      if (count > 0) {
        setTasbeehProgress({ count, target });
      }
    }

    const niyyahSaved = localStorage.getItem('dailyNiyyah');
    if (niyyahSaved) {
      try {
        const parsed = JSON.parse(niyyahSaved);
        if (parsed.date === today) {
          setDailyNiyyah(parsed.text);
        } else {
          setDailyNiyyah(""); // clear for new day
        }
      } catch(e){}
    }
  }, []);

  const [activeFlagshipIcon, setActiveFlagshipIcon] = useState(() => {
    return localStorage.getItem('user_favorite_flagship_icon') || 'dua';
  });

  useEffect(() => {
    const handleUpdateIcon = () => {
      setActiveFlagshipIcon(localStorage.getItem('user_favorite_flagship_icon') || 'dua');
      setElderlyMode(localStorage.getItem("elderlyModeEnabled") === "true");
      setSpiritualFirstMode(localStorage.getItem("spiritualFirstModeEnabled") === "true");
    };
    window.addEventListener('storage', handleUpdateIcon);
    window.addEventListener('elderly-mode-change', handleUpdateIcon);
    window.addEventListener('spiritual-mode-change', handleUpdateIcon);
    const interval = setInterval(handleUpdateIcon, 1500);
    return () => {
      window.removeEventListener('storage', handleUpdateIcon);
      window.removeEventListener('elderly-mode-change', handleUpdateIcon);
      window.removeEventListener('spiritual-mode-change', handleUpdateIcon);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second to improve performance
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAyah = async () => {
      const today = new Date().toDateString();
      const cachedAyahStr = localStorage.getItem('dailyAyah');
      
      if (cachedAyahStr) {
        try {
          const cachedAyah = JSON.parse(cachedAyahStr);
          if (cachedAyah.date === today) {
            setDailyAyah(cachedAyah.data);
            return;
          }
        } catch (e) {}
      }

      try {
        const res = await fetch(`https://ummahapi.com/api/quran/random`);
        if (!res.ok) throw new Error("API response not ok");
        const data = await res.json();
        const ayahData = {
          text: data.data.verse.arabic,
          surah: `${data.data.surah.name_arabic} - آية ${data.data.verse.ayah}`
        };
        setDailyAyah(ayahData);
        localStorage.setItem('dailyAyah', JSON.stringify({ date: today, data: ayahData }));
      } catch (e) {
        console.warn("Using fallback daily ayah due to fetch error");
        const fallbackAyah = {
          text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
          surah: "سورة الشرح - آية 6"
        };
        setDailyAyah(fallbackAyah);
      }
    };

    const fetchHadith = async () => {
      const today = new Date().toDateString();
      const cachedHadithStr = localStorage.getItem('dailyHadith');
      
      if (cachedHadithStr) {
        try {
          const cachedHadith = JSON.parse(cachedHadithStr);
          if (cachedHadith.date === today) {
            setDailyHadith(cachedHadith.data);
            return;
          }
        } catch (e) {}
      }

      // A small static list of beautiful Hadiths for the dashboard
      const hadiths = [
        { text: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى", narrator: "رواه البخاري ومسلم" },
        { text: "من حسن إسلام المرء تركه ما لا يعنيه", narrator: "رواه الترمذي" },
        { text: "الكلمة الطيبة صدقة", narrator: "رواه البخاري ومسلم" },
        { text: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه", narrator: "رواه البخاري ومسلم" },
        { text: "الدين النصيحة", narrator: "رواه مسلم" },
        { text: "من لا يَرْحَم لا يُرْحَم", narrator: "رواه البخاري ومسلم" },
        { text: "خيركم من تعلم القرآن وعلمه", narrator: "رواه البخاري" }
      ];
      
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      const selectedHadith = hadiths[dayOfYear % hadiths.length];
      
      setDailyHadith(selectedHadith);
      localStorage.setItem('dailyHadith', JSON.stringify({ date: today, data: selectedHadith }));
    };

    const fetchDua = async () => {
      const today = new Date().toDateString();
      const cachedDuaStr = localStorage.getItem('dailyDua');
      
      if (cachedDuaStr) {
        try {
          const cachedDua = JSON.parse(cachedDuaStr);
          if (cachedDua.date === today) {
            setDailyDua(cachedDua.data);
            return;
          }
        } catch (e) {}
      }

      const duas = [
        { text: "اللهم إنك عفو تحب العفو فاعف عني", source: "دعاء ليلة القدر" },
        { text: "يا مقلب القلوب ثبت قلبي على دينك", source: "دعاء النبي ﷺ" },
        { text: "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار", source: "سورة البقرة" },
        { text: "رب اشرح لي صدري ويسر لي أمري", source: "سورة طه" },
        { text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى", source: "دعاء النبي ﷺ" },
        { text: "اللهم أعني على ذكرك وشكرك وحسن عبادتك", source: "دعاء النبي ﷺ" },
        { text: "اللهم إني أعوذ بك من زوال نعمتك وتحول عافيتك وفجاءة نقمتك وجميع سخطك", source: "دعاء النبي ﷺ" }
      ];
      
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      const selectedDua = duas[dayOfYear % duas.length];
      
      setDailyDua(selectedDua);
      localStorage.setItem('dailyDua', JSON.stringify({ date: today, data: selectedDua }));
    };

    fetchAyah();
    fetchHadith();
    fetchDua();
  }, []);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "م" : "ص";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const prayersList = [
    { id: "Fajr", name: "الفجر", icon: "🌅" },
    { id: "Sunrise", name: "الشروق", icon: "☀️" },
    { id: "Dhuhr", name: "الظهر", icon: "🌞" },
    { id: "Asr", name: "العصر", icon: "🌤️" },
    { id: "Maghrib", name: "المغرب", icon: "🌇" },
    { id: "Isha", name: "العشاء", icon: "🌙" },
  ];

  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    for (const prayer of prayersList) {
      if (prayer.id === "Sunrise") continue;

      const timeStr = prayerTimes[prayer.id as keyof typeof prayerTimes];
      if (!timeStr) continue;

      const [hours, minutes] = timeStr.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        return {
          ...prayer,
          time: timeStr,
          minutesLeft: prayerMinutes - currentMinutes,
        };
      }
    }

    // If all prayers today are done, next is Fajr tomorrow
    const fajrTimeStr = prayerTimes.Fajr;
    const [fHours, fMinutes] = fajrTimeStr.split(":").map(Number);
    const fajrMinutes = fHours * 60 + fMinutes;
    const minutesLeft = (24 * 60 - currentMinutes) + fajrMinutes;

    return { ...prayersList[0], time: fajrTimeStr, minutesLeft };
  };

  const nextPrayer = getNextPrayer();
  const nextPrayerName = nextPrayer?.name || "";

  useEffect(() => {
    if (nextPrayer) {
      const hours = Math.floor(nextPrayer.minutesLeft / 60);
      const mins = nextPrayer.minutesLeft % 60;
      setNextPrayerTime(`${hours > 0 ? `${hours} ساعة و ` : ""}${mins} دقيقة`);
    }
  }, [nextPrayer, currentTime]);

  const toggleFasting = () => {
    const today = new Date().toDateString();
    const newStatus = !isFasting;
    setIsFasting(newStatus);
    localStorage.setItem('fastingToday', JSON.stringify({ date: today, isFasting: newStatus }));
  };

  const toggleDuha = () => {
    const today = new Date().toDateString();
    const newStatus = !isDuhaPrayed;
    setIsDuhaPrayed(newStatus);
    localStorage.setItem('duhaToday', JSON.stringify({ date: today, isDuhaPrayed: newStatus }));
  };

  const getFastingOccasion = () => {
    if (!hijriDate) return null;

    const month = hijriDate.month.ar;
    const day = parseInt(hijriDate.day, 10);
    const weekday = hijriDate.weekday.ar;

    // 1. Ramadan
    if (month === "رمضان" || month.includes("رمضان")) {
      return "صيام رمضان";
    }

    // 2. Arafah
    if ((month === "ذو الحجة" || month.includes("الحجة")) && day === 9) {
      return "صيام يوم عرفة";
    }

    // 3. Ashura & Tasu'a
    if ((month === "محرم" || month.includes("محرم")) && (day === 9 || day === 10)) {
      return day === 9 ? "صيام تاسوعاء" : "صيام عاشوراء";
    }

    // 4. White Days
    if (day === 13 || day === 14 || day === 15) {
      return "صيام الأيام البيض";
    }

    // 5. Mondays and Thursdays
    if (weekday === "الاثنين" || weekday === "الخميس" || weekday.includes("الاثنين") || weekday.includes("الخميس")) {
      return `صيام يوم ${weekday}`;
    }

    // 6. Shawwal (Optional 6 days)
    if ((month === "شوال" || month.includes("شوال")) && day > 1 && day <= 30) {
      return "صيام الست من شوال";
    }

    // 7. Sha'ban (Recommended to fast a lot)
    if ((month === "شعبان" || month.includes("شعبان")) && day < 30) {
      return "صيام شعبان";
    }

    return null;
  };

  const fastingOccasion = getFastingOccasion();

  const togglePrayer = (prayerId: string) => {
    const today = new Date().toDateString();
    const newPrayers = { ...prayedToday, [prayerId]: !prayedToday[prayerId] };
    setPrayedToday(newPrayers);
    localStorage.setItem('prayedToday', JSON.stringify({ date: today, data: newPrayers }));
  };

  const getBackgroundStyle = () => {
    if (!nextPrayer) return "bg-gradient-to-br from-[#0D5C4D] to-[#073B31]";
    switch (nextPrayer.id) {
      case "Fajr":
      case "Sunrise":
        return "bg-gradient-to-br from-[#073B31] via-[#0D5C4D] to-[#C59F60]";
      case "Dhuhr":
        return "bg-gradient-to-br from-[#0D5C4D] to-[#1D8A74]";
      case "Asr":
        return "bg-gradient-to-br from-[#9F793E] to-[#C59F60]";
      case "Maghrib":
        return "bg-gradient-to-br from-[#0D5C4D] via-[#E2A247] to-[#9F793E]";
      case "Isha":
        return "bg-gradient-to-br from-[#073B31] to-[#090E0C]";
      default:
        return "bg-gradient-to-br from-[#0D5C4D] to-[#073B31]";
    }
  };

  const getSmartAthkar = () => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 11) {
      return { title: "أذكار الصباح", desc: "ابدأ يومك بذكر الله", icon: "🌅", id: "azkar" };
    } else if (hour >= 15 && hour < 20) {
      return { title: "أذكار المساء", desc: "اختم نهارك بذكر الله", icon: "🌇", id: "azkar" };
    } else if (hour >= 20 || hour < 4) {
      return { title: "أذكار النوم", desc: "حصن نفسك قبل النوم", icon: "🌙", id: "azkar" };
    }
    return null;
  };

  const smartAthkar = getSmartAthkar();

  const handleShare = async (text: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    }
  };

  const menuItems = [
    {
      id: "quran",
      title: t('quran', 'القرآن الكريم'),
      icon: <BookOpen size={28} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "azkar",
      title: t('azkar', 'الأذكار'),
      icon: <Heart size={28} />,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      id: "qibla",
      title: t('qibla', 'القبلة'),
      icon: <Compass size={28} />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      id: "tasbeeh",
      title: t('tasbeeh', 'السبحة'),
      icon: <Activity size={28} />,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      id: "calendar",
      title: t('hijri_calendar', 'التقويم الهجري'),
      icon: <Calendar size={28} />,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      id: "hadith",
      title: t('hadiths', 'الأحاديث'),
      icon: <BookOpen size={28} />,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) return t('good_morning');
    if (hour >= 12 && hour < 17) return t('good_afternoon');
    if (hour >= 17 && hour < 20) return t('good_evening');
    return t('good_night');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';

  if (spiritualFirstMode) {
    const getSpiritualTimePeriod = () => {
      const hour = currentTime.getHours();
      if (hour >= 4 && hour < 12) {
        return "morning";
      } else if (hour >= 12 && hour < 18) {
        return "afternoon";
      } else {
        return "night";
      }
    };

    const period = getSpiritualTimePeriod();

    const getPeriodHeading = () => {
      switch (period) {
        case "morning":
          return {
            title: "فجر الإيمان والصباح 🌅",
            verse: "«أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا»",
            verseSource: "سورة الإسراء - الآية 78",
            routine: "أذكار الصباح • ورد المصحف الشريف • صلاة الضحى",
            bg: "bg-gradient-to-b from-[#0A2016] via-[#05110B] to-[#020805]"
          };
        case "afternoon":
          return {
            title: "سكينة الظهر والعصر ☀️",
            verse: "«الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»",
            verseSource: "سورة الرعد - الآية 28",
            routine: "أوراد ما بعد الصلاة • حزب التلاوة اليومي • الاستغفار وورد العصر",
            bg: "bg-gradient-to-b from-[#111c16] via-[#07130F] to-[#020805]"
          };
        default:
          return {
            title: "خشوع الليل والمساء 🌌",
            verse: "«وَمِنَ اللَّيْلِ فَاسْجُدْ لَهُ وَسَبِّحْهُ لَيْلًا طَوِيلًا»",
            verseSource: "سورة الإنسان - الآية 26",
            routine: "ورد أذكار المساء • سورة الملك • أذكار النوم وقيام الليل",
            bg: "bg-gradient-to-b from-[#030c08] via-[#010805] to-[#000402]"
          };
      }
    };

    const headerDetails = getPeriodHeading();

    return (
      <div className={`min-h-screen ${headerDetails.bg} text-[#E2C392] p-5 pb-28 relative overflow-hidden`} dir="rtl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-[#C59F60]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Minimal Quiet Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
            <span className="text-xs font-black text-amber-200/90 font-serif">الوضع الروحي والمحلي الموحد 🌱</span>
          </div>

          <button 
            onClick={() => {
              localStorage.setItem("spiritualFirstModeEnabled", "false");
              window.dispatchEvent(new Event("storage"));
              window.dispatchEvent(new Event("spiritual-mode-change"));
              toast.success("تم الانتقال إلى الوضع العام للتطبيق ✨");
            }}
            className="px-3.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-900/30 rounded-full text-xs font-bold transition-all"
          >
            العودة للوضع المعتاد ⬅️
          </button>
        </div>

        {/* Breathtaking Divine Vessel Card */}
        <div className="bg-emerald-950/20 rounded-[36px] border border-emerald-900/30 p-6 shadow-2xl relative mb-6 backdrop-blur-lg">
          <span className="absolute -top-3 right-5 bg-gradient-to-r from-amber-500 to-[#C59F60] text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
            فترتك الروحية الحالية
          </span>
          <h1 className="text-2xl font-serif font-black text-[#E2C392] mb-1">{headerDetails.title}</h1>
          <p className="text-xs text-slate-300/80 mb-4">{headerDetails.routine}</p>

          <div className="p-4 bg-[#07130F]/80 rounded-2xl border border-emerald-900/30 text-center space-y-2 relative">
            <p className="text-xs font-serif leading-relaxed text-amber-100/90 italic">
              {headerDetails.verse}
            </p>
            <p className="text-[10px] text-[#C59F60]">{headerDetails.verseSource}</p>
          </div>

          {/* Symmetrical Time and Next Prayer indicator with no noisy details */}
          <div className="mt-4 flex justify-between items-center bg-emerald-950/70 p-4 rounded-xl border border-emerald-900/20">
            <div>
              <p className="text-[10px] text-emerald-400/95 font-bold">الحين هو:</p>
              <h3 className="text-xl font-bold text-white font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-amber-400 font-bold">صلاة {nextPrayerName || "القادمة"}:</p>
              <h3 className="text-xl font-mono text-amber-200 font-black">{nextPrayerTime || "قريباً"}</h3>
            </div>
          </div>
        </div>

        {/* Dynamic single-tap cards representing EXACTLY what the user needs right now */}
        <h3 className="text-xs font-black text-[#E2C392] mb-3 pr-2">👇 عباداتك الميسرة بلمسة واحدة:</h3>
        <div className="space-y-4 mb-6">
          {/* Action 1: Reading Quran */}
          <button
            onClick={() => onNavigate("quran")}
            className="w-full text-right p-5 bg-gradient-to-r from-emerald-900/40 to-emerald-950/20 hover:from-emerald-900/55 hover:to-emerald-950/45 border border-emerald-800/20 rounded-[28px] shadow-lg flex items-center justify-between transition-all group scale-100 active:scale-98"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E2C392]/10 rounded-2xl flex items-center justify-center text-[#E2C392] border border-[#E2C392]/20">
                <span className="text-2xl">📖</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-100 font-serif">قراءة الورد القرآني</h2>
                <p className="text-xs text-slate-400">تابع تلاوة وحفظ حزبك المختار من حيث وقفت بنقرة واحدة</p>
              </div>
            </div>
            <span className="text-amber-400 font-bold group-hover:translate-x-[-4px] transition-transform">⬅️</span>
          </button>

          {/* Action 2: Remedying or consulting Azkar */}
          <button
            onClick={() => onNavigate("azkar")}
            className="w-full text-right p-5 bg-gradient-to-r from-[#8E7E4F]/20 to-[#07130F] hover:from-[#c2ae6e]/30 hover:to-[#07130F] border border-[#C59F60]/20 rounded-[28px] shadow-lg flex items-center justify-between transition-all group scale-100 active:scale-98"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                <span className="text-2xl">📿</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-100 font-serif">
                  {period === "morning" ? "أوراد وأذكار الصباح" : period === "afternoon" ? "أذكار بعد الصلاة اليومية" : "أذكار المساء والنوم"}
                </h2>
                <p className="text-xs text-slate-400">الحصن الحصين للعباد والأوراد الميسرة لهذه الساعة المباركة</p>
              </div>
            </div>
            <span className="text-amber-400 font-bold group-hover:translate-x-[-4px] transition-transform">⬅️</span>
          </button>

          {/* Action 3: AI Spiritual Coach */}
          <button
            onClick={() => onNavigate("spiritual-coach")}
            className="w-full text-right p-5 bg-gradient-to-r from-emerald-950/50 to-[#07130F] hover:from-emerald-900/40 hover:to-[#07130F] border border-emerald-700/25 rounded-[28px] shadow-lg flex items-center justify-between transition-all group scale-100 active:scale-98"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-[#E2C392] font-serif flex items-center gap-1.5">
                  <span>المدرب الروحي الذكي</span>
                  <span className="text-[9px] bg-amber-400 text-emerald-950 rounded-full px-1.5 py-0.5 font-sans font-black">AI</span>
                </h2>
                <p className="text-xs text-slate-450">تحليل عاداتك الإيمانية، تشخيص وعلاج فتور الهمة بنور العلم</p>
              </div>
            </div>
            <span className="text-amber-400 font-bold group-hover:translate-x-[-4px] transition-transform">⬅️</span>
          </button>
        </div>

        {/* Secondary Trust & Safety / Support Control widgets but completely distraction-free */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-3xl grid grid-cols-2 gap-3 text-center mb-4">
          <button
            onClick={() => onNavigate("trust-covenant")}
            className="flex flex-col items-center justify-center p-3 bg-[#07130F]/70 border border-emerald-900/35 hover:border-[#C59F60]/20 rounded-2xl transition-all"
          >
            <span className="text-xl mb-1">🔐</span>
            <span className="text-[11px] font-black text-slate-200">الخصوصية المحلية</span>
            <span className="text-[9px] text-slate-450">بياناتك لا تغادر جهازك</span>
          </button>

          <button
            onClick={() => onNavigate("tasbeeh")}
            className="flex flex-col items-center justify-center p-3 bg-[#07130F]/70 border border-emerald-900/35 hover:border-[#C59F60]/20 rounded-2xl transition-all"
          >
            <span className="text-xl mb-1">📿</span>
            <span className="text-[11px] font-black text-slate-200">مسباح العبادة</span>
            <span className="text-[9px] text-slate-450">عدّاد النور والبركات</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
          ﴿وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ﴾ • جميع المعالجات تُدار على جهازك محلياً بخصوصية حديدية 🛡️
        </p>
      </div>
    );
  }

  if (elderlyMode) {
    return (
      <div className="max-w-md mx-auto p-5 space-y-6 pb-28 min-h-screen text-right" dir="rtl">
        {/* Large Elderly Header */}
        <div className="bg-[#0A1914] text-white p-6 rounded-[36px] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-lg"></div>
          <p className="text-amber-400 text-sm font-black">مرحباً بك يا والدنا العزيز في تطبيق العبادة 👵👴</p>
          <h1 className="text-2xl font-black font-serif mt-1 text-[#E2C392]">مفتاح الطاعة والسكينة</h1>
          {hijriDate && (
             <p className="text-sm font-bold text-slate-350 mt-2">
               اليوم هو: {hijriDate.weekday.ar} • {hijriDate.day} {hijriDate.month.ar}
             </p>
          )}

          {/* Next Prayer Big Card */}
          <div className="mt-4 p-4 rounded-2xl border border-emerald-500/20 flex justify-between items-center bg-emerald-950/70">
             <div>
               <p className="text-[11px] text-emerald-300 font-extrabold">الصلاة القادمة:</p>
               <h3 className="text-base font-black text-white">{nextPrayerName}</h3>
             </div>
             <div className="text-left">
               <p className="text-2xl font-mono font-black text-[#E2C392]">{nextPrayerTime}</p>
             </div>
          </div>
        </div>

        {/* MASSIVE TILES GRID (2 or 1 Column of massive action buttons) */}
        <div className="space-y-4">
           <button 
             onClick={() => onNavigate("quran")} 
             className="w-full p-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[28px] shadow-lg flex items-center justify-between transition-all scale-100 active:scale-95"
           >
             <div className="flex items-center gap-4">
               <span className="text-4xl">📖</span>
               <div className="text-right">
                 <h2 className="text-2xl font-black font-serif">المصحف الشريف</h2>
                 <p className="text-sm text-emerald-150">قراءة القرآن الكريم بخطوط كبيرة وواضحة جداً</p>
               </div>
             </div>
             <span className="text-2xl font-serif">⬅️</span>
           </button>

           <button 
             onClick={() => onNavigate("azkar")} 
             className="w-full p-6 bg-amber-500 hover:bg-amber-600 text-[#07130F] rounded-[28px] shadow-lg flex items-center justify-between transition-all scale-100 active:scale-95"
           >
             <div className="flex items-center gap-4">
               <span className="text-4xl">🕌</span>
               <div className="text-right text-slate-900">
                 <h2 className="text-2xl font-black font-serif">الأذكار والتحصين</h2>
                 <p className="text-sm text-slate-800 font-bold">أذكار الصباح والمساء واليقين بلمسة واحدة</p>
               </div>
             </div>
             <span className="text-2xl">⬅️</span>
           </button>

           <button 
             onClick={() => onNavigate("tasbeeh")} 
             className="w-full p-6 bg-teal-600 hover:bg-teal-700 text-white rounded-[28px] shadow-lg flex items-center justify-between transition-all scale-100 active:scale-95"
           >
             <div className="flex items-center gap-4">
               <span className="text-4xl">📿</span>
               <div className="text-right">
                 <h2 className="text-2xl font-black font-serif">السبحة الإلكترونية</h2>
                 <p className="text-sm text-teal-150">عداد تسبيح بأزرار عملاقة لا يحتاج لنظارة</p>
               </div>
             </div>
             <span className="text-2xl">⬅️</span>
           </button>

           <button 
             onClick={() => onNavigate("qibla")} 
             className="w-full p-6 bg-sky-600 hover:bg-sky-700 text-white rounded-[28px] shadow-lg flex items-center justify-between transition-all scale-100 active:scale-95"
           >
             <div className="flex items-center gap-4">
               <span className="text-4xl">🕋</span>
               <div className="text-right">
                 <h2 className="text-2xl font-black font-serif">اتجاه القبلة الميسر</h2>
                 <p className="text-sm text-sky-150">معرفة اتجاه الكعبة المشرفة بسهولة تامة</p>
               </div>
             </div>
             <span className="text-2xl">⬅️</span>
           </button>
        </div>

        {/* Quick Font Size control for easy tweak */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <p className="text-sm font-black text-slate-600 dark:text-slate-350">🎚️ التحكم السريع بحجم خطوط التطبيق الحالية:</p>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 shrink-0">معتاد</span>
            <input 
              type="range"
              min="1"
              max="1.6"
              step="0.1"
              value={parseFloat(localStorage.getItem("fontSizeScale") || "1.35")}
              onChange={(e) => {
                const scale = e.target.value;
                localStorage.setItem("fontSizeScale", scale);
                window.dispatchEvent(new Event("storage"));
                window.dispatchEvent(new Event("fontSizeChange"));
                toast.success("تم تحديث حجم الخط لكامل التطبيق! 🔍");
              }}
              className="flex-1 accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0">ضخم ({parseFloat(localStorage.getItem("fontSizeScale") || "1.35").toFixed(1)}x)</span>
          </div>
        </div>

        {/* Exit Elder mode or adjust accessibility accessibility-hub */}
        <div className="space-y-3 pt-2">
           <button 
             onClick={() => onNavigate("accessibility-hub")} 
             className="w-full py-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm lg:text-base rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm transition-all"
           >
             ⚙️ إعدادات الصم/البكم وقارئات الشاشة
           </button>

           <button 
             onClick={() => {
               localStorage.setItem("elderlyModeEnabled", "false");
               localStorage.setItem("fontSizeScale", "1.0");
               window.dispatchEvent(new Event("storage"));
               window.dispatchEvent(new Event("elderly-mode-change"));
               toast.success("تم الخروج من وضع كبار السن وعودة الواجهة للوضع المعتاد.");
             }} 
             className="w-full py-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-black text-sm rounded-2xl border border-red-100 dark:border-red-900/20 transition-all flex items-center justify-center gap-2"
           >
             <span>👋 العودة للوضع المعتاد للتطبيق</span>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-28 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* Premium Header Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-[32px] bg-[#0A1914] text-white shadow-2xl shadow-emerald-900/20"
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none" style={{ backgroundImage: 'url("/src/assets/images/hajj_kaaba_dome_1779803270795.png")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-900/60 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10 p-6 flex flex-col justify-center space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-medium text-emerald-50 tracking-wide">{getGreeting()}</h2>
              <button 
                onClick={() => setLocationModalOpen(true)}
                className="flex items-center gap-1.5 mt-1 text-emerald-250 hover:text-white bg-white/10 dark:bg-white/5 hover:bg-white/20 transition-all px-3 py-1 rounded-full border border-white/10 active:scale-95 text-xs font-semibold shadow-sm"
                title="تعديل أو تحديد الموقع الجغرافي"
              >
                <MapPin size={11} className="text-emerald-400 animate-pulse animate-duration-3000" />
                <span>{locationName || t('locating')}</span>
                <ChevronDown size={11} className="text-emerald-300/80" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/10">
                  <Flame size={14} className="text-orange-400" />
                  <span>{streak} {t('days_streak')}</span>
                </div>
              )}
              <button 
                onClick={() => {
                  setKeyInput(localStorage.getItem('user_custom_gemini_key') || '');
                  setIsKeyModalOpen(true);
                }}
                className={`relative p-2 rounded-full border transition-all ${
                  hasCustomKey 
                    ? 'bg-amber-400/25 border-amber-400/40 text-amber-300 hover:bg-amber-400/40 active:scale-95' 
                    : 'bg-white/10 border-white/10 text-white hover:bg-white/20 active:scale-95'
                }`}
                title="إعداد الذكاء الاصطناعي ومفتاح الـ API"
              >
                <Key size={18} className={hasCustomKey ? "animate-pulse" : ""} />
                {hasCustomKey && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-[#0A1914]"></span>
                )}
              </button>
              <button 
                onClick={() => onNavigate("notifications")}
                className="relative bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 text-white hover:bg-white/20 transition-colors"
                title="الإشعارات"
              >
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A1914]"></span>
              </button>
            </div>
          </div>

          {hijriDate && (
            <div className="flex flex-col items-center justify-center py-4 border-y border-white/5">
              <h1 className="text-3xl font-bold font-serif mb-1 text-white tracking-wide">
                {hijriDate.day} {hijriDate.month.ar} {hijriDate.year}
              </h1>
              <p className="text-emerald-200/70 text-sm font-medium tracking-wide">
                {hijriDate.weekday.ar} • {gregorianDate}
              </p>
            </div>
          )}

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                {t('next_prayer')}
              </p>
              <h3 className="text-xl font-bold text-white mt-0.5">{nextPrayerName}</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono tracking-tighter text-emerald-400">
                {nextPrayerTime}
              </p>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Spiritual First sanctuary mode switcher card */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-[28px] bg-[#05110B] text-slate-100 border border-[#C59F60]/30 shadow-lg text-right p-5"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-8 -mt-8 pointer-events-none"></div>
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex flex-shrink-0 items-center justify-center text-[#C59F60] border border-amber-500/20">
            <span className="text-2xl animate-pulse">🌱</span>
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-black text-[#E2C392] font-serif leading-tight flex items-center gap-1.5">
              <span>الوضع الروحي (روحانية أولاً) 📿</span>
              <span className="text-[9px] bg-emerald-900 border border-emerald-800 text-emerald-400 font-sans font-extrabold px-1.5 py-0.5 rounded-full">جديد</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              أعد تصميم واجهتك لتركز فقط على أوراد طاعتك وقرآنك الملائم لساعة يومك الحالية، وتخلص من كافة عناصر التشتت.
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-emerald-950">
          <button
            onClick={() => onNavigate("trust-covenant")}
            className="text-[11px] font-black text-amber-500/90 hover:underline flex items-center gap-1"
          >
            🔐 ميثاق الثقة والأمانة
          </button>
          
          <button
            onClick={() => {
              localStorage.setItem("spiritualFirstModeEnabled", "true");
              window.dispatchEvent(new Event("storage"));
              window.dispatchEvent(new Event("spiritual-mode-change"));
              toast.success("مرحباً بك في الروضة الروحية؛ تم تنظيف الواجهة لأجلك 🍃");
            }}
            className="px-5 py-2 text-xs font-black text-emerald-950 bg-gradient-to-r from-amber-400 to-[#C59F60] rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
          >
            تفـعيل الوضع الروحي 📿
          </button>
        </div>
      </motion.div>


      {/* Custom Designed Notification Permission Banner */}
      {showNotificationRequest && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 border border-emerald-500/10 dark:border-emerald-500/20 rounded-3xl p-5 shadow-[0_8px_30px_-12px_rgba(16,185,129,0.15)] relative overflow-hidden text-right"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full -ml-8 -mt-8 pointer-events-none"></div>
          <div className="relative z-10 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex flex-shrink-0 items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              <span className="relative flex h-5 w-5 justify-center items-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <Bell size={20} className="relative z-10 animate-bounce text-emerald-600" />
              </span>
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-emerald-50 font-serif leading-tight">
                تفعيل تنبيهات الأذان والإشعارات الإيمانية 🔔
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                احصل على تنبيهات الأذان في مواقيتها الدقيقة وتذكيرات الأذكار اليومية لتعمر يومك بذكر الله واليقين.
              </p>
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={handleRequestNotifications}
                  className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-xl shadow-md cursor-pointer"
                >
                  تفعيل الآن (سماح)
                </button>
                <button
                  onClick={handleDismissNotificationRequest}
                  className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  لاحقاً بالمساء
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}



      {/* Interactive AI Personalization Onboarding / Customized Routine Checklist */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.04 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full -ml-10 -mt-10 blur-xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          
          {/* Header Title of AI Routine Section */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950 text-[#0D5C4D] dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <Bot size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0A1914] dark:text-emerald-50 text-sm font-serif">
                  منهج التقوى المخصص بالذكاء الاصطناعي
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">خطتك المبرمجة ديناميكياً لليوم</p>
              </div>
            </div>
            {!showAiOnboarding && (
              <button
                onClick={handleResetRoutine}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1.5 rounded-xl transition-colors"
                title="إعادة التخصيص"
              >
                <Sliders size={13} />
                <span>تعديل</span>
              </button>
            )}
          </div>

          {/* ONBOARDING QUIZ */}
          {showAiOnboarding ? (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-xs font-black text-amber-500 dark:text-amber-400">مطلوب التخصيص الإيماني</span>
                <span className="text-[10px] font-mono text-slate-400">سؤال {quizStep + 1} من ٣</span>
              </div>

              {quizStep === 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">١. ما هو هدفك الإيماني الأكبر حالياً لكي نركز عليه؟</p>
                  <div className="grid gap-2">
                    {[
                      { id: "quran", label: "تلاوة وحفظ القرآن الكريم 📖" },
                      { id: "prayers", label: "المواظبة والخشوع في الصلوات والسنن الرواتب 🕌" },
                      { id: "knowledge", label: "التفقه في الدين والحديث الشريف والسيرة النبوية 📚" },
                      { id: "peace", label: "السكينة والأدعية وأذكار التحصين والرقية 🌿" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, goal: opt.id })}
                        className={`text-right p-3 rounded-xl text-xs font-bold transition-all border ${
                          quizAnswers.goal === opt.id
                            ? "bg-[#0D5C4D] text-white border-[#0D5C4D] shadow-md shadow-emerald-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 1 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">٢. ما هو الوقت الذي تستطيع التزامه يومياً في تطبيق اليقين؟</p>
                  <div className="grid gap-2">
                    {[
                      { id: "10m", label: "١٠ دقائق خفيفة ومستمرة يومياً ⏱️" },
                      { id: "30m", label: "٣٠ dقيقة مباركة هادئة خاشعة ⏳" },
                      { id: "1h", label: "ساعة مباركة فأكثر للاستثمار الإيماني العميق 🕋" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, time: opt.id })}
                        className={`text-right p-3 rounded-xl text-xs font-bold transition-all border ${
                          quizAnswers.time === opt.id
                            ? "bg-[#0D5C4D] text-white border-[#0D5C4D] shadow-md shadow-emerald-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">٣. كيف تعرّف خلفيتك في العلوم الشرعية والعبادات حالياً؟</p>
                  <div className="grid gap-2">
                    {[
                      { id: "beginner", label: "مبتدئ يبحث عن الأساسيات وبناء العادة والالتزام 🌟" },
                      { id: "mid", label: "متوسط يبحث عن تكثيف الأوردة والمحافظة والتفسير 📈" },
                      { id: "advanced", label: "متقدم يسعى للتفكر العميق ومراجعة محفوظات المتون 🎓" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, level: opt.id })}
                        className={`text-right p-3 rounded-xl text-xs font-bold transition-all border ${
                          quizAnswers.level === opt.id
                            ? "bg-[#0D5C4D] text-white border-[#0D5C4D] shadow-md shadow-emerald-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Navigation Trigger Bar */}
              <div className="flex justify-between items-center pt-2">
                {quizStep > 0 ? (
                  <button
                    onClick={() => setQuizStep(quizStep - 1)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg"
                  >
                    السابق
                  </button>
                ) : (
                  <div></div>
                )}

                {quizStep < 2 ? (
                  <button
                    onClick={() => setQuizStep(quizStep + 1)}
                    disabled={
                      (quizStep === 0 && !quizAnswers.goal) ||
                      (quizStep === 1 && !quizAnswers.time)
                    }
                    className="text-xs font-bold text-white bg-[#0D5C4D] hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-all shadow-md"
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateAiRoutine}
                    disabled={!quizAnswers.level || aiLoading}
                    className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 px-5 py-2 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>جاري صياغة خطتك...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon size={14} />
                        <span>تأكيد وصياغة كإضافة بالذكاء الاصطناعي ✨</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* COMPLIMENTARY REGISTERED GOALS */
            <div className="space-y-3">
              <div className="grid gap-2">
                {userRoutine.map((task, index) => {
                  const isChecked = !!routineChecked[index];
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        const copy = { ...routineChecked };
                        copy[index] = !copy[index];
                        handleSaveRoutineChecked(copy);
                      }}
                      className={`flex gap-3 items-center p-3 rounded-2xl cursor-pointer border transition-all ${
                        isChecked
                          ? "bg-emerald-50/50 dark:bg-emerald-500/5 text-slate-400 border-emerald-400/40 line-through"
                          : "bg-slate-50 dark:bg-slate-800/40 text-[#0A1914] dark:text-slate-100 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30"
                      }`}
                    >
                      <button
                        className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center transition-colors border-2 shrink-0 ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {isChecked && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        )}
                      </button>
                      <span className="text-xs font-serif leading-relaxed font-bold flex-1 text-right">{task}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress metrics */}
              {userRoutine.length > 0 && (
                <div className="flex justify-between items-center bg-emerald-500/5 dark:bg-[#111A16] p-3 rounded-2xl border border-emerald-500/10 dark:border-slate-800">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400">معدل الانجاز لجرعة اليوم:</span>
                    <span className="text-xs font-serif font-black text-[#0D5C4D] dark:text-emerald-400">
                      {Object.keys(routineChecked).filter(k => routineChecked[k]).length} من {userRoutine.length} طاعات مكتملة
                    </span>
                  </div>
                  {Object.keys(routineChecked).filter(k => routineChecked[k]).length === userRoutine.length ? (
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg animate-bounce">
                      طوبى لك مكتمل تماماً! 🎉
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-500 font-serif">ثابر لتحقيق طموحاتك</span>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>

      {/* Structured Quranic Khatmah Dashboard Integration */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0A1914] dark:text-emerald-50 text-sm font-serif">
                  صيانة الورد والختمة القرآنية المقررة
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">الورد الإلزامي والورد اليومي المبارك</p>
              </div>
            </div>
            {quranPlanData && (
              <button
                onClick={() => {
                  localStorage.setItem("quran_sub_tab", "plans");
                  onNavigate("quran");
                }}
                className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-xl transition-colors"
              >
                <span>إدارة الخطة</span>
                <ChevronLeft size={13} />
              </button>
            )}
          </div>

          {!quranPlanData ? (
            /* CTA to build a Quran plan */
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 border border-dashed border-amber-300 dark:border-amber-500/20 rounded-2xl text-center space-y-3">
              <div className="text-amber-500 animate-bounce flex justify-center"><AlertCircle size={28} /></div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                🚨 لم تقم بإعداد خطة ختمة قرآنية تلتزم بها يومياً بعد! صمّم خطتك الآن في ثوانٍ لتحافظ على ورد تلاوتك وتفادي الهجر.
              </p>
              <button
                onClick={() => {
                  localStorage.setItem("quran_sub_tab", "plans");
                  onNavigate("quran");
                }}
                className="w-full bg-amber-500 text-white hover:bg-amber-600 transition-colors py-2.5 rounded-xl font-bold text-xs shadow-md shadow-amber-500/20"
              >
                تخصيص وبرمجة خطة ختمتي الآن 📖
              </button>
            </div>
          ) : (
            /* Show actual Khatmah track details */
            (() => {
              // Find the active 'current' target
              const planArray = quranPlanData.plan || [];
              const currIdx = planArray.findIndex((p: any) => p.status === "current");
              const completedCount = planArray.filter((p: any) => p.status === "completed").length;
              const totalDays = planArray.length;
              const progressPercentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

              if (currIdx === -1) {
                // All items completed
                return (
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-4 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                    <p className="text-xs font-black text-[#10b981] dark:text-emerald-400 leading-relaxed">
                      🎉 هنيئاً لك! لقد تم إكمال الختمة المباركة بالكامل ومصادقة التلاوات كاملة. نسأل الله القبول والثبات.
                    </p>
                    <button
                      onClick={() => {
                        localStorage.setItem("quran_sub_tab", "plans");
                        onNavigate("quran");
                      }}
                      className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all"
                    >
                      ابدأ ختمة جديدة ببركة ومستوى آخر 📖
                    </button>
                  </div>
                );
              }

              const activeDay = planArray[currIdx];

              return (
                <div className="space-y-3">
                  
                  {/* Strict Red Pulsing Banner to enforce reading Khatmah */}
                  <div className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-2xl flex items-center gap-3 text-xs">
                    <AlertCircle size={20} className="shrink-0 animate-pulse text-red-500" />
                    <p className="font-extrabold leading-normal font-serif text-[11px] block">
                      انتبه: لم تسجل إكمال ورد تلاوة القرآن ومراجعتك المقررة لهذا اليوم بعد! لا تهجر كتابك الحكيم وبادر الآن لتبلغ الأجور.
                    </p>
                  </div>

                  {/* Active target display & checking option */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 font-mono">اليوم المقرّر {activeDay.day} من {totalDays}</span>
                      <span className="text-xs font-bold text-[#0A1914] dark:text-slate-100 font-serif block mt-0.5">{activeDay.target}</span>
                    </div>
                    <button
                      onClick={() => handleCompleteQuranPlanDay(currIdx)}
                      className="bg-[#10b981] hover:bg-emerald-600 transition-colors text-white font-black text-[11px] px-3.5 py-2 rounded-xl shadow-md shadow-emerald-500/10"
                    >
                      تمت القراءة ✔️
                    </button>
                  </div>

                  {/* Overall Khatmah target progress bar */}
                  <div className="space-y-1.5 px-0.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>إجمالي رصيد الإنجاز في الختمة:</span>
                      <span className="font-bold text-amber-500">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>

                </div>
              );
            })()
          )}
        </div>
      </motion.div>

      {/* Daily Niyyah (Intention) Tracker */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-xl transition-transform group-hover:scale-110 duration-700"></div>
        <div className="relative z-10">
           <div className="flex items-center justify-between gap-3 mb-3">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                 <Sparkles size={20} className={niyyahLoading ? "animate-spin" : ""} />
               </div>
               <div>
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">نية اليوم</h3>
                 <p className="text-[10px] text-slate-400 font-medium">إنما الأعمال بالنيات وصحة النية أساس العمل</p>
               </div>
             </div>
             
             {!isEditingNiyyah && (
               <button
                 onClick={handleGenerateNiyyah}
                 disabled={niyyahLoading}
                 className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-[#be8113] dark:text-amber-300 px-3 py-1.5 rounded-full font-black flex items-center gap-1.5 transition-all"
               >
                 <span>💡</span>
                 <span>{niyyahLoading ? "جاري الاقتراح..." : "اقتراح نيات بالذكاء الاصطناعي"}</span>
               </button>
             )}
           </div>
           
           {isEditingNiyyah ? (
             <div className="flex gap-2">
               <input 
                 autoFocus
                 type="text" 
                 value={dailyNiyyah} 
                 onChange={(e) => setDailyNiyyah(e.target.value)}
                 className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 font-bold"
                 placeholder="اكتب هدفك الروحي لليوم..."
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     setIsEditingNiyyah(false);
                     localStorage.setItem('dailyNiyyah', JSON.stringify({ date: new Date().toDateString(), text: dailyNiyyah }));
                   }
                 }}
               />
               <button 
                 onClick={() => {
                   setIsEditingNiyyah(false);
                   localStorage.setItem('dailyNiyyah', JSON.stringify({ date: new Date().toDateString(), text: dailyNiyyah }));
                 }}
                 className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md transition-colors"
               >
                 حفظ
               </button>
             </div>
           ) : (
             <div className="space-y-4">
               <div 
                 onClick={() => setIsEditingNiyyah(true)}
                 className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-xs text-slate-700 dark:text-slate-300 font-bold cursor-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors leading-5"
               >
                 {dailyNiyyah || <span className="text-slate-400">اضغط هنا لكتابة نيتك أو هدفك لليوم...</span>}
               </div>

               {niyyahSuggestions.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-2 border-t border-black/5 dark:border-white/5 pt-3.5"
                 >
                   <span className="block text-[10px] text-slate-400 font-black mb-1">اختر من النوايا الربانية المقترحة لليوم:</span>

                                     {niyyahSuggestions.map((suggestion, idx) => (
                     <button
                       key={idx}
                       onClick={() => {
                         setDailyNiyyah(suggestion);
                         localStorage.setItem('dailyNiyyah', JSON.stringify({ date: new Date().toDateString(), text: suggestion }));
                         setNiyyahSuggestions([]);
                       }}
                       className="w-full text-right p-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/25 rounded-2xl text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-all duration-200 block"
                     >
                       {suggestion}
                     </button>
                   ))}
                 </motion.div>
               )}
             </div>
           )}
        </div>
      </motion.div>

      {/* Daily Good Deeds & Charity Booster */}
      <CharityToday />
      {/* Arabic Widget */}
      <ArabicWidget onNavigate={onNavigate} />

      {/* Modern Quick Access */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3 bg-white dark:bg-slate-900 rounded-[32px] p-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800"
      >
        <button onClick={() => onNavigate("quran")} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
            <BookOpen size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">القرآن</span>
        </button>
        <button onClick={() => onNavigate("azkar")} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
            <Heart size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">الأذكار</span>
        </button>
        <button onClick={() => onNavigate("qibla")} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/40 dark:to-teal-800/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
            <Compass size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">القبلة</span>
        </button>
        <button onClick={() => onNavigate("tasbeeh")} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-[#C59F60]/20 dark:to-[#9F793E]/10 flex items-center justify-center text-[#9F793E] dark:text-[#E5C185] shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
            <Activity size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">السبحة</span>
        </button>
      </motion.div>

      {/* Explore More Row */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 pt-1 px-1 -mx-1"
      >
        {lastReadQuran && (
          <button onClick={() => onNavigate("quran")} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-l from-emerald-600 to-emerald-800 pr-2 pl-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-shadow">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <BookOpen size={16} />
            </div>
            <div className="text-right">
               <span className="block text-[10px] text-emerald-100/90 leading-none mb-0.5">تابع القراءة</span>
               <span className="block text-[11px] font-bold text-white leading-none">{lastReadQuran.surahName}</span>
            </div>
          </button>
        )}

        <button onClick={() => setWhatToReadOpen(true)} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-l from-[#C59F60] to-[#E2A247] pr-2 pl-4 py-2.5 rounded-full border border-amber-400/30 shadow-md hover:shadow-lg transition-shadow">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <span className="text-[11px] font-bold text-white">ماذا أقرأ الآن؟</span>
        </button>

        <button onClick={() => onNavigate("radio")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Radio size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الإذاعة</span>
        </button>

        <button onClick={() => onNavigate("hadith")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Quote size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الحديث</span>
        </button>

        <button onClick={() => onNavigate("names")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Heart size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">أسماء الله</span>
        </button>

        <button onClick={() => onNavigate("ruqyah")} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 pr-2 pl-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Activity size={16} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">الرقية الشرعية</span>
        </button>

        <button onClick={() => onNavigate("tajweed-education-hub")} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30 pr-2 pl-4 py-2.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <span>🎓</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">مصحح التجويد والتعليم</span>
        </button>

        <button onClick={() => onNavigate("accessibility-hub")} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 pr-2 pl-4 py-2.5 rounded-full border border-amber-100 dark:border-amber-900/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <span>⚙️</span>
          </div>
          <span className="text-[11px] font-bold text-amber-850 dark:text-amber-300">تسهيل الاستخدام وكبار السن</span>
        </button>
      </motion.div>

      {/* AI Assistant Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        onClick={() => onNavigate("muslim-ai")}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0D5C4D] to-[#041d15] shadow-xl shadow-emerald-950/20 p-5 flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-all"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none group-hover:scale-105 transition-transform duration-700" 
          style={{ backgroundImage: 'url("/src/assets/images/names_allah_background_1779805712797.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D5C4D]/90 to-[#073B31]/90"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-10 -mt-10 blur-md group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-[18px] flex items-center justify-center border border-white/20">
            <Sparkles size={24} className="text-[#C59F60]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-0.5 tracking-wide flex items-center gap-2">
              {t('muslim_ai')} 
              <span className="bg-[#C59F60] text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">NEW</span>
            </h3>
            <p className="text-emerald-100 text-xs font-medium opacity-90">{t('ai_assistant_desc')}</p>
          </div>
        </div>
        <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-[#0D5C4D] transition-colors">
          <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} />
        </div>
      </motion.div>


      {/* Prayers Row */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card-3d bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex justify-between items-center mb-5 px-1 relative z-10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>
            {t('prayer_times')}
          </h3>
          <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
             {locationName || "مكة المكرمة"}
          </span>
        </div>
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-[24px] shadow-inner relative z-10 border border-slate-100 dark:border-slate-700/50">
          {prayersList.map((prayer) => {
            const isNext = nextPrayer?.id === prayer.id;
            const time = prayerTimes ? prayerTimes[prayer.id as keyof typeof prayerTimes] : "--:--";
            return (
              <div
                key={prayer.id}
                className={`flex flex-col items-center justify-center py-3 px-1 rounded-[20px] transition-all flex-1 min-w-0 ${
                  isNext
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 transform scale-[1.05]"
                    : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                <span className={`text-[11px] font-bold mb-1 truncate w-full text-center ${isNext ? 'opacity-100' : ''}`}>{prayer.name}</span>
                <span className={`text-sm font-bold font-mono tracking-tight ${isNext ? '' : 'text-slate-800 dark:text-slate-200'}`}>{formatTime(time).split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
        {nextPrayer && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium px-2">
             <span>باقي على الصلاة القادمة: <span className="font-bold text-emerald-500">{nextPrayerTime}</span></span>
             <span className="text-[10px] text-slate-400">({nextPrayerName})</span>
          </div>
        )}
        <div className="mt-3 text-[10px] text-center text-emerald-600/70 dark:text-emerald-400/70 font-medium flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          المصدر: Aladhan (معتمد للأوقات الشرعية)
        </div>
      </motion.div>

      {/* Mosque Mode & Voice Search Widget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Mosque Mode Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between"
        >
          {/* Decorative mosque icon background */}
          <div className="absolute top-0 right-0 w-20 h-20 text-emerald-500/5 dark:text-emerald-500/2 pointer-events-none -mr-4 -mt-4">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v4zm-.5-5.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z"/>
            </svg>
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5 mr-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  {mosqueModeEnabled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><path d="m10 13 4-4"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  )}
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">الوقاية والسكينة</h4>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">وضع المسجد الصامت</h3>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={toggleMosqueMode}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 relative ${
                  mosqueModeEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    mosqueModeEnabled ? '-translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4 text-right">
              يكتم الأذان والتنبيهات تلقائياً عند حلول وقت الفريضة وصلاة الجماعة صيانةً لخشوع المسجد.
            </p>
          </div>

          {/* Active Status Display and configs */}
          {mosqueModeEnabled ? (
            <div className="space-y-4">
              {/* Duration selector buttons */}
              <div className="flex gap-1 justify-end items-center flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 ml-1">مدة الكتم:</span>
                {[15, 20, 30, 45].map((d) => (
                  <button
                    key={d}
                    onClick={() => updateMosqueModeDuration(d)}
                    className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border transition-all ${
                      mosqueModeMuteDuration === d
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {d} د
                  </button>
                ))}
              </div>

              {/* Real-time mute status feedback */}
              {activeMuteInfo ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl flex items-center gap-2.5 animate-pulse text-right">
                  <span className="text-sm">🕌</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black">وضع المسجد نشط حالياً</p>
                    <p className="text-[10px] leading-tight opacity-95">مكتوم الآن احتراماً لصلاة {activeMuteInfo.prayerName} (يتبقى {activeMuteInfo.remaining} د)</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl flex items-center gap-2 text-right">
                  <span className="text-xs">🔒</span>
                  <p className="text-[10px] font-bold text-slate-400 leading-tight">
                    جاهز للعمل التلقائي. سيتم كتم الرنين فور الأذان التالي ولمدة {mosqueModeMuteDuration} دقيقة.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-center text-center">
              <span className="text-[10.5px] font-bold text-slate-400">«فعّل وضع المسجد لتجنب الرنين في الصلاة»</span>
            </div>
          )}

        </motion.div>

        {/* Voice Search Assistant Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.24 }}
          onClick={() => setIsVoiceAssistantOpen(true)}
          className="bg-gradient-to-br from-[#0D5C4D] to-[#041d15] rounded-[32px] p-6 shadow-lg shadow-emerald-950/20 relative overflow-hidden flex flex-col justify-between cursor-pointer border border-emerald-400/20 group active:scale-[0.98] transition-all"
        >
          {/* Arabesque background overlay for beautiful identity */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-br-full pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-2.5 mb-3 text-right">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                <Mic size={20} className="animate-pulse" />
              </div>
              <div className="text-right">
                <span className="bg-[#C59F60] text-white text-[8px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase inline-block">VOICE AI</span>
                <h3 className="text-sm font-bold text-white leading-none mt-1">البحث الصوتي الذكي</h3>
              </div>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed text-right mb-4">
              ابحث بصوتك ودع معالج الآيات يستقطب التنزيل والحديث ومخرجهما مع الشرح الإيماني الفوري الميسر بلمحة عين.
            </p>
          </div>

          <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/5 hover:bg-white/20 transition-colors">
            <span className="text-[10px] font-black text-amber-300">انطق ودعنا ننصت 🗣️</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white">ابدأ التحدث الآن</span>
              <svg className="w-4 h-4 text-white transform rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Voice Assistant Modal Overlay Component */}
      <VoiceSearchAssistant 
        isOpen={isVoiceAssistantOpen} 
        onClose={() => setIsVoiceAssistantOpen(false)} 
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Daily Content Bento - Ayah */}
        {dailyAyah && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 cursor-pointer shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] group hover:shadow-xl hover:-translate-y-1 transition-all"
            onClick={() => handleShare(`${dailyAyah.text}\n\n[${dailyAyah.surah}]`, t('ayah_of_day'))}
          >
            <div className="flex items-center gap-2 mb-4 text-emerald-500">
              <BookOpen size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('ayah_of_day')}</span>
            </div>
            <p className="text-lg font-serif text-slate-800 dark:text-slate-100 leading-loose mb-4">
              {dailyAyah.text}
            </p>
            <p className={`text-[10px] font-bold text-slate-400 text-${isRTL ? 'left' : 'right'}`}>
              {dailyAyah.surah}
            </p>
          </motion.div>
        )}

        {/* Daily Content Bento - Hadith */}
        {dailyHadith && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 cursor-pointer shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] group hover:shadow-xl hover:-translate-y-1 transition-all"
            onClick={() => handleShare(`${dailyHadith.text}\n\n[${dailyHadith.narrator}]`, t('hadith_of_day'))}
          >
            <div className="flex items-center gap-2 mb-4 text-amber-500">
              <Quote size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('hadith_of_day')}</span>
            </div>
            <p className="text-sm font-serif text-slate-800 dark:text-slate-100 leading-relaxed mb-4">
              {dailyHadith.text}
            </p>
            <p className={`text-[10px] font-bold text-slate-400 text-${isRTL ? 'left' : 'right'}`}>
              {dailyHadith.narrator}
            </p>
          </motion.div>
        )}
      </div>

      {/* Smart Athkar Bento */}
      {smartAthkar && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-[32px] p-5 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between"
          onClick={() => onNavigate(smartAthkar.id)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[20px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {smartAthkar.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-0.5">{smartAthkar.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{smartAthkar.desc}</p>
            </div>
          </div>
          <ChevronLeft size={16} className={`text-slate-400 ${isRTL ? '' : 'rotate-180'} group-hover:-translate-x-1 transition-transform`} />
        </motion.div>
      )}



      {/* Highlighted Hijri Calendar Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.48 }}
          className="col-span-1 sm:col-span-2 md:col-span-3 mt-4"
        >
          <div 
            onClick={() => onNavigate("calendar")}
            className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-[24px] p-6 shadow-lg shadow-amber-500/20 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-amber-400/50"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none group-hover:scale-105 transition-transform duration-700" 
              style={{ backgroundImage: 'url("/src/assets/images/hadith_scroll_background_1779805688768.png")' }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/80 to-orange-600/80"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-md group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-900/10 rounded-full -ml-10 -mb-10 blur-sm"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-white/90 text-sm font-bold mb-1 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} />
                  التقويم الهجري
                </h2>
                {hijriDate ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-serif text-white">{hijriDate.day}</span>
                    <span className="text-xl font-bold text-white/90">{hijriDate.month.ar}</span>
                    <span className="text-white/80 font-medium ml-2">{hijriDate.year}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-white">جاري التحميل...</span>
                )}
              </div>
              
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                <ChevronLeft size={24} className={isRTL ? '' : 'rotate-180'} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Features Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-1 sm:col-span-2 md:col-span-3 mt-4"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <Bot size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('ai_features')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div 
              onClick={() => {
                localStorage.setItem("ai_starting_prompt", "أريدك أن تساعدني وتفسر لي رؤيا أو حلماً رأيته بالتفصيل واليقين...");
                onNavigate("muslim-ai");
              }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Moon size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('dream_interpretation')}</span>
            </div>
            <div 
              onClick={() => {
                localStorage.setItem("ai_starting_prompt", "أريد منك مراجعة وتصحيح تلاوة آيات من القرآن الكريم...");
                onNavigate("muslim-ai");
              }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('recitation_correction')}</span>
            </div>
            <div 
              onClick={() => {
                localStorage.setItem("quran_sub_tab", "reflections");
                onNavigate("quran");
              }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">تأملات قرآنية</span>
            </div>
            <div 
              onClick={() => onNavigate("halal-checker")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-center group shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-[16px] bg-teal-50 dark:bg-teal-500/10 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scan size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">الماسح الغذائي</span>
            </div>
          </div>
        </motion.div>



      {/* Dynamic Spiritual Diagnosis & Quran Recommender Drawer/Modal */}
      {whatToReadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0D5C4D] to-[#041d15] p-6 text-white text-right relative">
              <button
                onClick={() => {
                  setWhatToReadOpen(false);
                  setSelectedSpiritualState(null);
                  setAiPrescription("");
                }}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all text-sm font-bold"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <SparklesIcon size={20} className="text-amber-300 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-black font-serif">ماذا أقرأ اليوم؟ • الطبيب القرآني الذكي</h3>
                  <p className="text-[11px] text-emerald-100 font-medium">اختر حالتك النفسية أو الروحية لنصف لك الدواء الإشعاعي</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-right overflow-y-auto max-h-[70vh]">
              {!selectedSpiritualState ? (
                /* Select Spiritual Mood state */
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500">من فضلك كيف تجد فؤادك الآن؟</p>
                  <div className="grid gap-2.5">
                    {[
                      { id: "anxious", label: "أشعر بالقلق والتوتر وتشتت التفكير 😰", color: "hover:border-[#C59F60] bg-amber-500/5 dark:bg-amber-500/10" },
                      { id: "sad", label: "أشعر بالحزن والضيق وانكسار الصدر 😞", color: "hover:border-rose-500 bg-rose-500/5 dark:bg-rose-500/10" },
                      { id: "gratitude", label: "أعيش في شكر ونعمة وفرح بفضل ربي 🥰", color: "hover:border-[#0D5C4D] bg-emerald-500/5 dark:bg-emerald-500/10" },
                      { id: "sluggish", label: "أجد كسلاً وفتوراً عن العبادة والواجبات 🥱", color: "hover:border-[#C59F60] bg-amber-500/5 dark:bg-amber-500/10" },
                      { id: "guidance", label: "أطلب الهداية واليقين وزيادة الثبات 🕋", color: "hover:border-[#0D5C4D] bg-emerald-500/5 dark:bg-emerald-500/10" }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedSpiritualState(m.id);
                          setAiPrescription("");
                        }}
                        className={`w-full p-4 rounded-2xl text-xs font-bold transition-all border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-right flex items-center justify-between ${m.color}`}
                      >
                        <span className="font-serif font-black">{m.label}</span>
                        <ChevronLeft size={16} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Mood Recommendation Results screen */
                (() => {
                  const moodRecommendations: { [key: string]: { title: string, text: string, surah: string, explanation: string, page: number } } = {
                    anxious: {
                      title: "علاج القلق والتوتر بآيات السكينة",
                      text: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
                      surah: "سورة الرعد - آية ٢٨",
                      explanation: "هذه الآية الكريمة تطمئن القلوب وتذهب الروع والوجل بمجرد الذكر والتسبيح والثقة بجبر الله للنفوس الضعيفة الواجلة.",
                      page: 253
                    },
                    sad: {
                      title: "علاج الحزن والضيق بآيات الانشراح واليسر",
                      text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
                      surah: "سورة الشرح - آية ٥-٦",
                      explanation: "تأكيد رباني قاطع بأن العسر لا يغلب يسرين، وأن بعد كل انقباض في الصدر تساع وفرج عظيم يمسح دمعة المحزونين.",
                      page: 596
                    },
                    gratitude: {
                      title: "آيات الشكر واستدامة النعم وزيادتها",
                      text: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
                      surah: "سورة إبراهيم - آية ٧",
                      explanation: "قانون رباني واضح ومؤكد؛ شكر الله على نعمة الصحة، الإسلام، والتوفيق هو مفتاح الاستدامة والزيادة الدائمة في الخيرات.",
                      page: 256
                    },
                    sluggish: {
                      title: "علاج الكسل وفتور العبادة بآيات الشوق للجنة",
                      text: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ",
                      surah: "سورة آل عمران - آية ١٣٣",
                      explanation: "دعوة ملؤها المحبة والشغف من علام الغيوب، تحث المسافر إلى ربه على الإسراع والمنافسة في جني الحسنات وبلوغ درجات الفردوس.",
                      page: 66
                    },
                    guidance: {
                      title: "آيات طلب الهداية واليقين وسؤال الثبات",
                      text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ • صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
                      surah: "سورة الفاتحة - آية ٦-٧",
                      explanation: "أعظم دعاء يكرره المسلم في كل ركعة، يسأل فيه ربه الهداية لسبل السلام والتمسك بالحق حتى الممات.",
                      page: 1
                    }
                  };

                  const rec = moodRecommendations[selectedSpiritualState];
                  if (!rec) return null;
                  return (
                    <div className="space-y-5">
                      
                      {/* Back handle */}
                      <button
                        onClick={() => {
                          setSelectedSpiritualState(null);
                          setAiPrescription("");
                        }}
                        className="text-xs font-bold text-[#0D5C4D] dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <ChevronRightIcon size={14} />
                        <span>العودة لقائمة الحالات</span>
                      </button>

                      {/* Spiritual Prescription Main Verse */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 p-5 rounded-3xl text-center space-y-3 shadow-inner">
                        <span className="bg-[#C59F60]/10 dark:bg-[#C59F60]/20 text-[#9F793E] dark:text-[#E2C392] border border-[#C59F60]/30 text-[10px] font-black px-2.5 py-1 rounded-full">{rec.title}</span>
                        <p className="text-base text-slate-900 dark:text-emerald-100 font-serif font-extrabold leading-loose py-2">
                          「 {rec.text} 」
                        </p>
                        <p className="text-[11px] font-black text-slate-400 font-serif">{rec.surah}</p>
                      </div>

                      {/* Human Explanation brief */}
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                        <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1 font-serif">💡 أثر وتفسير الآية لشفائك:</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif font-bold">
                          {rec.explanation}
                        </p>
                      </div>

                      {/* Interactive AI Prescriber Button with live Gemini SDK proxy */}
                      <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-400">استشارة الطبيب الإيماني بالذكاء الاصطناعي:</span>
                          <button
                            onClick={() => handleAskAiPrescription(selectedSpiritualState, rec.text)}
                            disabled={aiPrescriptionLoading}
                            className="bg-[#C59F60] hover:bg-[#9F793E] text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1 disabled:opacity-50"
                          >
                            {aiPrescriptionLoading ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                <span>جاري تحضير البلسم...</span>
                              </>
                            ) : (
                              <>
                                <Bot size={12} />
                                <span>اطلب مواساة روحية خاصة ✨</span>
                              </>
                            )}
                          </button>
                        </div>

                        {aiPrescription && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0D5C4D]/5 dark:bg-[#0D5C4D]/10 border border-emerald-500/20 p-4 rounded-2xl"
                          >
                            <p className="text-xs text-slate-700 dark:text-emerald-100 leading-relaxed font-serif font-bold whitespace-pre-wrap">
                              {aiPrescription}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Primary Navigation to Read full Pages button */}
                      <button
                        onClick={() => {
                          setWhatToReadOpen(false);
                          onNavigate("quran");
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors py-3 rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/15"
                      >
                        اذهب لتصفح السورة كاملة بالقرآن العظيم 📖
                      </button>

                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/40 px-6 py-4 flex justify-end border-t border-slate-100 dark:border-slate-800/60 font-black">
              <button
                onClick={() => {
                  setWhatToReadOpen(false);
                  setSelectedSpiritualState(null);
                  setAiPrescription("");
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-600 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= SMART LOCATION OVERLAY ================= */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] max-w-sm w-full shadow-2xl p-6 space-y-5 text-right overflow-hidden relative"
            dir="rtl"
          >
            {/* Header decor */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500"></div>

            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white font-serif flex items-center gap-1.5 font-black">
                  <Globe className="text-emerald-500 animate-spin-slow text-emerald-650" size={16} />
                  <span>مستكشف ومحرر الموقع الجغرافي ✨</span>
                </h3>
                <span className="block text-[9px] text-slate-400 font-medium leading-relaxed">اختر مدينتك لتعديل مواقيت الصلاة والقبلة تلقائياً</span>
              </div>
              <button 
                onClick={() => {
                  setLocationModalOpen(false);
                  setLocateError("");
                  setLocateState("idle");
                }} 
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-xs font-bold bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full leading-none h-6 w-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Quick Kaaba Distance Tracker */}
            {userLocation && (
              <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 text-center space-y-1">
                <div className="text-[10px] font-bold text-slate-400 dark:text-emerald-300/80">الموقع الحالي: {locationName}</div>
                <div className="text-[11px] font-black text-slate-800 dark:text-emerald-100 flex flex-wrap items-center justify-center gap-0.5 leading-relaxed">
                  <span>أنت تبعد حالياً</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black underline decoration-wavy decoration-amber-400 decoration-1 mx-0.5">
                    {calculateDistanceToKaaba(userLocation.lat, userLocation.lon).toLocaleString('ar-EG')} كم
                  </span>
                  <span>عن الكعبة المشرفة بمكة 🕋</span>
                </div>
              </div>
            )}

            {/* Auto Detect Button */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={async () => {
                  setLocateState("locating");
                  setLocateError("");
                  try {
                    await detectLocation();
                    setLocateState("success");
                    setTimeout(() => {
                      setLocateState("idle");
                    }, 1500);
                  } catch (err: any) {
                    setLocateState("error");
                    setLocateError(err.message || "فشلت عملية تحديد الموقع التلقائية");
                  }
                }}
                disabled={locateState === "locating"}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
              >
                <MapPin size={14} className={locateState === "locating" ? "animate-bounce" : ""} />
                <span>
                  {locateState === "locating" 
                    ? "جاري تحديد إحداثياتك الحالية..." 
                    : locateState === "success" 
                    ? "✅ تم تحديد موقعك وتحديث المواقيت!" 
                    : "تحديد موقعي الجغرافي تلقائياً (GPS) 📡"}
                </span>
              </button>
              {locateError && (
                <div className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-xl text-center font-bold flex items-center justify-center gap-1">
                  <AlertCircle size={11} />
                  <span>{locateError}</span>
                </div>
              )}
            </div>

            {/* Search City Row */}
            <div className="space-y-2">
              <span className="block text-[10px] font-black text-slate-400">ابحث عن مدينة إسلامية مشهورة:</span>
              <div className="relative">
                <Search size={13} className="absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="مثال: القاهرة، المدينة المنورة، القدس..."
                  value={searchCityQuery}
                  onChange={(e) => setSearchCityQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Grid of Cities */}
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {POPULAR_CITIES.filter(city => 
                  city.name.includes(searchCityQuery) || 
                  city.country.includes(searchCityQuery)
                ).map(city => {
                  const dist = calculateDistanceToKaaba(city.lat, city.lon);
                  const isSelected = locationName === city.name;
                  return (
                    <button
                      key={city.name}
                      onClick={() => {
                        updateLocation(city.lat, city.lon, city.name);
                        setSearchCityQuery("");
                        setLocateState("success");
                        setTimeout(() => {
                          setLocateState("idle");
                          setLocationModalOpen(false);
                        }, 800);
                      }}
                      className={`p-2 rounded-xl border text-right transition-all text-[10px] font-black flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-inner' 
                          : 'bg-white dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-extrabold">{city.name}</span>
                        <span className="text-[8px] text-slate-400 font-normal">{city.country}</span>
                      </div>
                      <span className="text-[8px] text-slate-400 mt-0.5">تبعد {dist.toLocaleString('ar-EG')} كم 🕋</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Coordinates Inputs (Collapsible/Advanced) */}
            <div className="pt-3.5 border-t border-slate-105 dark:border-slate-805/80 space-y-2">
              <span className="block text-[10px] font-black text-slate-400">إدخال إحداثيات مخصصة (متقدم):</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] text-slate-400 mb-0.5">خط العرض (Latitude):</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="30.0444"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full text-center p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-slate-400 mb-0.5">خط الطول (Longitude):</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="31.2357"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    className="w-full text-center p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[8px] text-slate-400 mb-0.5">اسم الموقع المخصص:</label>
                <input
                  type="text"
                  placeholder="مثال: مكتبي بجدة / بيت جدي"
                  value={customLocName}
                  onChange={(e) => setCustomLocName(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const lat = parseFloat(customLat);
                    const lon = parseFloat(customLon);
                    if (isNaN(lat) || isNaN(lon) || !customLocName.trim()) {
                      alert("نرجو إدخال خط طول وعرض صحيحين مع اسم للبلد!");
                      return;
                    }
                    updateLocation(lat, lon, customLocName.trim());
                    setLocationModalOpen(false);
                  }}
                  className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold text-[10px] transition-colors cursor-pointer"
                >
                  حفظ الموقع المخصص 💾
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetToDefault();
                    setLocationModalOpen(false);
                  }}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-black text-[10px] transition-colors cursor-pointer"
                >
                  الرجوع للرسمي 🕋
                </button>
              </div>
            </div>

            <div className="text-[8px] text-center text-slate-400 pt-1 leading-normal">
              يتم تخزين الإعدادات محلياً لتخصيص كامل تجربة طاعاتك ومواقيتك 🌸
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= AI KEY CONFIGURATION OVERLAY ================= */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] max-w-sm w-full shadow-2xl p-6 space-y-5 text-right overflow-hidden relative"
            dir="rtl"
          >
            {/* Header decor */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white font-serif flex items-center gap-1.5 font-black">
                  <Key className="text-amber-500 text-amber-650" size={16} />
                  <span>تفعيل الذكاء الاصطناعي الإيماني ✨</span>
                </h3>
                <span className="block text-[9px] text-slate-400 font-medium leading-relaxed">أدخل مفتاح الـ API الخاص بك لتشغيل ميزات الذكاء الاصطناعي بشكل دائم ومجاني</span>
              </div>
              <button 
                onClick={() => setIsKeyModalOpen(false)} 
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-xs font-bold bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full leading-none h-6 w-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/10 text-right space-y-2">
              <p className="text-[10px] text-amber-850 dark:text-amber-305 leading-relaxed font-semibold">
                ⚠️ عذراً، لقد تم إيقاف مفتاح الـ API الافتراضي المشترك الخاص بالتطبيق بسبب قيام Google بحظره لتسريبه. لتتمكن من استخدام ميزة تسميع القرآن بالذكاء الاصطناعي، ومولد النوايا الإيمانية المخصصة اليومية، واقترحات الصدقات، ومرافقة الواعظ الذكي، يرجى تزويد مفتاح خاص بك.
              </p>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-normal">
                الخطوات مجانية ١٠٠٪ وبدقيقتين فقط:
                <br />
                ١. افتح موقع <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-amber-605 hover:underline font-bold">Google AI Studio</a> وسجل دخولك
                <br />
                ٢. انقر على <b>Create API Key</b> وانسخ المفتاح الذي يبدأ بـ <code>AIzaSy...</code> ثم الصقه هنا بالأسفل.
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <label className="block text-[10px] font-black text-slate-400">مفتاح الـ API للذكاء الاصطناعي (Gemini أو OpenAI):</label>
              <input
                type="password"
                placeholder="مثال: AIzaSyBgDbX..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full text-center p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white rounded-xl text-xs font-mono select-all focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const trimmed = keyInput.trim();
                  if (!trimmed) {
                    alert("نرجو إدخال مفتاح API صحيح!");
                    return;
                  }
                  localStorage.setItem('user_custom_gemini_key', trimmed);
                  setHasCustomKey(true);
                  setIsKeyModalOpen(false);
                  toast.success("تم تفعيل طاقات الذكاء الاصطناعي المخصصة بنجاح! طاعات مقبولة بإذن الله.");
                }}
                className="flex-1 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 rounded-xl font-bold text-[10px] transition-colors cursor-pointer text-center"
              >
                حفظ الرمز وتفعيل الميزات 💾
              </button>
              
              {hasCustomKey && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('user_custom_gemini_key');
                    setKeyInput('');
                    setHasCustomKey(false);
                    setIsKeyModalOpen(false);
                    toast.success("تم مسح المفتاح المخصص.");
                  }}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-black text-[10px] transition-colors cursor-pointer text-center"
                  title="مسح المفتاح المخصص"
                >
                  حذف المفتاح 🗑️
                </button>
              )}
            </div>

            <div className="text-[8px] text-center text-slate-400 pt-1 leading-normal">
              🔒 يتم تخزين الرمز على متصفحك الشخصي محلياً بكل أمان ولا يتم تداوله على أي خوادم أخرى.
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

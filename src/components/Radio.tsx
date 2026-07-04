import React, { useState, useRef, useEffect } from "react";
import {
  Radio as RadioIcon,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Search,
  ArrowRight,
  Sparkles,
  Award,
  Heart,
  Music,
  Bookmark,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

interface RadioStation {
  id: string;
  name: string;
  url: string;
  type: string;
  isPopular?: boolean;
}

// Famous core reciters & live channels requested by the user
const STATIONS: RadioStation[] = [
  // New Trending & Young famous reciters
  {
    id: "young_islam_sobhi",
    name: "الشيخ إسلام صبحي (تلاوات خاشعة وتراويح)",
    url: "https://qurango.net/radio/islam_sobhi",
    type: "القراء الشباب والجدد",
    isPopular: true,
  },
  {
    id: "young_raad_alkurdi",
    name: "الشيخ رعد محمد الكردي (رقة وخشوع نادر)",
    url: "https://qurango.net/radio/raad_alkurdi",
    type: "القراء الشباب والجدد",
    isPopular: true,
  },
  {
    id: "young_sherif_mostafa",
    name: "الشيخ شريف مصطفى (تلاوات مبكية وهادئة)",
    url: "https://qurango.net/radio/sherif_mostafa",
    type: "القراء الشباب والجدد",
    isPopular: true,
  },
  {
    id: "young_hazza_alblushi",
    name: "الشيخ هزاع البلوشي (صوت هادئ يريح القلب)",
    url: "https://qurango.net/radio/hazza_alblushi",
    type: "القراء الشباب والجدد",
    isPopular: true,
  },
  {
    id: "young_mansour_alsalimi",
    name: "الشيخ منصور السالمي (تلاوات مؤثرة وقريبة للقلب)",
    url: "https://qurango.net/radio/mansour_alsalimi",
    type: "القراء الشباب والجدد",
    isPopular: true,
  },
  {
    id: "young_abdulrahman_alosi",
    name: "الشيخ عبدالرحمن العوسي (أعذب المقامات القرآنية)",
    url: "https://qurango.net/radio/abdulrahman_alosi",
    type: "القراء الشباب والجدد",
    isPopular: true,
  },

  // Classic Legendary Reciters (سلاطين التلاوة)
  {
    id: "classic_abdulbasit",
    name: "الشيخ عبدالباسط عبدالصمد - المصحف المجود الشريف",
    url: "https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad",
    type: "سلاطين التلاوة",
    isPopular: true,
  },
  {
    id: "classic_alminshawi",
    name: "الشيخ محمد صديق المنشاوي - مرتل بخنوع وخشوع",
    url: "https://qurango.net/radio/mohammed_siddiq_alminshawi",
    type: "سلاطين التلاوة",
    isPopular: true,
  },
  {
    id: "classic_alhussary",
    name: "الشيخ محمود خليل الحصري - الترتيل التعليمي الدقيق",
    url: "https://qurango.net/radio/mahmoud_khalil_alhussary",
    type: "سلاطين التلاوة",
  },
  {
    id: "classic_mustafa_ismail",
    name: "الشيخ مصطفى إسماعيل - ملك المقامات والنغم القرآني",
    url: "https://qurango.net/radio/mustafa_ismail",
    type: "سلاطين التلاوة",
  },
  {
    id: "classic_mahmoud_ali_banna",
    name: "الشيخ محمود علي البنا - قوة الأداء وعذوبة الصوت",
    url: "https://qurango.net/radio/mahmoud_ali__albanna",
    type: "سلاطين التلاوة",
  },

  // Famous GCC & Haram Imams (كبار القراء وأئمة الحرمين)
  {
    id: "imam_mishary_alafasi",
    name: "الشيخ مشاري بن راشد العفاسي - باقة تلاوات شاملة",
    url: "https://qurango.net/radio/mishary_alafasi",
    type: "أئمة الحرمين والشيوخ",
    isPopular: true,
  },
  {
    id: "imam_maher_almuaiqly",
    name: "الشيخ ماهر المعيقلي - أستاذ الخشوع والسكينة",
    url: "https://qurango.net/radio/maher_almuaiqly",
    type: "أئمة الحرمين والشيوخ",
    isPopular: true,
  },
  {
    id: "imam_yasser_aldosari",
    name: "الشيخ ياسر الدوسري - نبرات مذهلة تزلزل القلوب",
    url: "https://qurango.net/radio/yasser_aldosari",
    type: "أئمة الحرمين والشيوخ",
    isPopular: true,
  },
  {
    id: "imam_alsudaes",
    name: "الشيخ عبدالرحمن السديس - نبرات الحرم المكي الشريف",
    url: "https://qurango.net/radio/abdulrahman_alsudaes",
    type: "أئمة الحرمين والشيوخ",
  },
  {
    id: "imam_saad_alghamidi",
    name: "الشيخ سعد الغامدي - نعومة وسلاسة الصوت العذب",
    url: "https://qurango.net/radio/saad_alghamidi",
    type: "أئمة الحرمين والشيوخ",
  },
  {
    id: "imam_ahmad_alajmy",
    name: "الشيخ أحمد بن علي العجمي - تلاوات حماسية خاشعة",
    url: "https://qurango.net/radio/ahmad_alajmy",
    type: "أئمة الحرمين والشيوخ",
  },
  {
    id: "imam_saud_alshuraim",
    name: "الشيخ سعود الشريم - عمق وفصاحة النبرة المكاوية",
    url: "https://qurango.net/radio/saud_alshuraim",
    type: "أئمة الحرمين والشيوخ",
  },
  {
    id: "imam_fares_abbad",
    name: "الشيخ فارس عباد - تلاوة واثقة وهادئة على مدار الساعة",
    url: "https://qurango.net/radio/fares_abbad",
    type: "أئمة الحرمين والشيوخ",
  },
  {
    id: "imam_khaled_aljileel",
    name: "الشيخ خالد الجليل - خاشع جداً ونضير الآيات",
    url: "https://qurango.net/radio/khalid_aljileel",
    type: "أئمة الحرمين والشيوخ",
  },
  {
    id: "imam_idrees_abkr",
    name: "الشيخ إدريس أبكر - ترانيم سماوية تبكي العيون",
    url: "https://qurango.net/radio/idrees_abkr",
    type: "أئمة الحرمين والشيوخ",
  },
  {
    id: "imam_ali_jaber",
    name: "الشيخ علي جابر - أذان وتلاوات محراب الحرم المكي",
    url: "https://qurango.net/radio/ali_jaber",
    type: "أئمة الحرمين والشيوخ",
  },

  // Remembrance & Ruqyah (الأذكار والرقية الشرعية)
  {
    id: "athkar_sabah",
    name: "بث أذكار الصباح بالتكرار الإيماني المبارك",
    url: "https://qurango.net/radio/athkar_sabah",
    type: "الأذكار والرقية الشرعية",
    isPopular: true,
  },
  {
    id: "athkar_masaa",
    name: "بث أذكار المساء المهدئة للنفوس الحائرة",
    url: "https://qurango.net/radio/athkar_masaa",
    type: "الأذكار والرقية الشرعية",
    isPopular: true,
  },
  {
    id: "ruqyah_sharia",
    name: "الرقية الشرعية المتكاملة لطرد السوء والتحصين الشديد",
    url: "https://qurango.net/radio/roqiah",
    type: "الأذكار والرقية الشرعية",
    isPopular: true,
  },
  {
    id: "eid_takbeer",
    name: "تكبيرات العيد المبارك بأعذب الأصوات في الحرم",
    url: "https://qurango.net/radio/takbeer",
    type: "الأذكار والرقية الشرعية",
  },

  // General Quran Programs & Interpretations (البرامج والعلوم)
  {
    id: "prog_tafseer",
    name: "إذاعة تفسير القرآن الكريم الميسر والمستفيض",
    url: "https://qurango.net/radio/tafseer",
    type: "البرامج والعلوم الإسلامية",
  },
  {
    id: "prog_fatwa",
    name: "إذاعة الفتاوى والأحكام الفقهية وتوعية الأمة",
    url: "https://qurango.net/radio/fatwa",
    type: "البرامج والعلوم الإسلامية",
  },
  {
    id: "prog_albaqarah",
    name: "بث سورة البقرة المستمر لبركة البيت والتحصين",
    url: "https://qurango.net/radio/albaqarah",
    type: "البرامج والعلوم الإسلامية",
  },
  {
    id: "prog_mix",
    name: "الإذاعة العامة - باقة شاملة من الخطب والقصص والتلاوات",
    url: "https://qurango.net/radio/mix",
    type: "البرامج والعلوم الإسلامية",
  },
];

// Helper to assign a gorgeous islamic image dynamically to each Sheikh/station based on its metadata and keywords
const getStationImage = (name: string, type: string): string => {
  const n = name.toLowerCase();

  // Makkah, Al-Haram, and Imams of Makkah
  if (
    n.includes("السديس") ||
    n.includes("الشريم") ||
    n.includes("بليلة") ||
    n.includes("جابر") ||
    n.includes("المعيقلي")
  ) {
    return "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=500&auto=format&fit=crop";
  }

  // Nabawi Shrine & Madinah Imams
  if (n.includes("الدوسري") || n.includes("أيوب") || n.includes("الحذيفي")) {
    return "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500&auto=format&fit=crop";
  }

  // Classic Legends
  if (
    n.includes("عبدالباسط") ||
    n.includes("عبد الباسط") ||
    n.includes("المنشاوي") ||
    n.includes("الحصري") ||
    n.includes("البنا")
  ) {
    return "https://images.unsplash.com/photo-1609599006353-e629f1d40e4a?q=80&w=500&auto=format&fit=crop";
  }

  // Modern and emotional teenagers/youth
  if (
    n.includes("إسلام صبحي") ||
    n.includes("رعد") ||
    n.includes("شريف مصطفى") ||
    n.includes("هزاع") ||
    n.includes("السالمي") ||
    n.includes("العفاسي")
  ) {
    return "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=500&auto=format&fit=crop";
  }

  // Remembrance / Azkar / Ruqyah
  if (
    n.includes("أذكار") ||
    n.includes("الصباح") ||
    n.includes("المساء") ||
    n.includes("الرقية") ||
    n.includes("روقية")
  ) {
    return "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=500&auto=format&fit=crop";
  }

  // Eid
  if (n.includes("تكبيرات") || n.includes("العيد")) {
    return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop";
  }

  // Golden domes & Mosques
  if (type.includes("العلوم") || n.includes("تفسير") || n.includes("الفتاوى")) {
    return "https://images.unsplash.com/photo-1542816417-0983cb9c62ce?q=80&w=500&auto=format&fit=crop";
  }

  // Classic mosque artwork fallback
  return "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=500&auto=format&fit=crop";
};

const cleanRadioUrl = (url: string) => {
  let cleaned = url.replace("http://", "https://");
  cleaned = cleaned.replace("https://qurango.net/", "https://backup.qurango.net/");
  cleaned = cleaned.replace("athkar_masaa", "athkar_masa");
  cleaned = cleaned.replace("takbeer", "eid");
  cleaned = cleaned.replace("saad_alghamidi", "saad_alghamdi");
  cleaned = cleaned.replace("maher_almuaiqly", "maher");
  cleaned = cleaned.replace("abu_bakr_alshatri", "shaik_abu_bakr_al_shatri");
  cleaned = cleaned.replace("salah_bukhatir", "slaah_bukhatir");
  cleaned = cleaned.replace("bandar_balila", "bandar_balilah");
  cleaned = cleaned.replace("mohammad_al_tablaway", "mohammad_altablaway");
  return cleaned;
};

export default function IslamicRadio({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation();
  const [stations, setStations] = useState<RadioStation[]>(() =>
    STATIONS.map((s) => ({
      ...s,
      url: cleanRadioUrl(s.url),
    }))
  );

  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Categories list
  const categories = [
    { id: "all", label: "الكل 🌍" },
    { id: "القراء الشباب والجدد", label: "القراء الشباب ✨" },
    { id: "سلاطين التلاوة", label: "سلاطين التلاوة 📜" },
    { id: "أئمة الحرمين والشيوخ", label: "أئمة الحرمين 🕋" },
    { id: "الأذكار والرقية الشرعية", label: "أذكار ورقية 📿" },
    { id: "البرامج والعلوم الإسلامية", label: "برامج وتفاسير 📖" },
  ];

  useEffect(() => {
    // Fetch live directories from MP3Quran API securely
    fetch("https://www.mp3quran.net/api/v3/radios?language=ar")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.radios) {
          const fetchedStations = data.radios.map((r: any) => ({
            id: `api_${r.id}`,
            name: `${r.name} (بث متواصل)`,
            url: cleanRadioUrl(r.url),
            type: "إذاعات عامة متنوعة",
          }));

          const finalStations = STATIONS.map((s) => ({
            ...s,
            url: cleanRadioUrl(s.url),
          }));

          // Avoid duplicate names
          fetchedStations.forEach((fs: any) => {
            if (!finalStations.find((s) => s.name === fs.name)) {
              finalStations.push(fs);
            }
          });
          setStations(finalStations);
        }
      })
      .catch((err) => console.error("Could not fetch extra radios:", err));
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        try {
          audioRef.current.load();
        } catch (e) {}
      }
    };
  }, []);

  const handlePlayStation = (station: RadioStation) => {
    setError(null);
    if (currentStation?.id === station.id) {
      togglePlay();
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = station.url;
        audioRef.current.load();

        // Setup Modern Media Session API
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: station.name,
            artist: station.type || "إذاعة إسلامية نضرة",
            album: "الأثير الإيماني الشريف",
            artwork: [
              {
                src: getStationImage(station.name, station.type),
                sizes: "512x512",
                type: "image/jpeg",
              },
            ],
          });

          navigator.mediaSession.setActionHandler("play", () => {
            audioRef.current?.play();
            setIsPlaying(true);
          });
          navigator.mediaSession.setActionHandler("pause", () => {
            audioRef.current?.pause();
            setIsPlaying(false);
          });
        }

        audioRef.current.play().catch((e) => {
          console.error("Playback error:", e);
          setIsPlaying(false);
          setError(
            "عذراً، الخادم الخاص بهذه الإذاعة تحت الصيانة الفنية أو الرابط معطل حالياً. يرجى اختيار صوت آخر."
          );
        });
      }
    }
  };

  const togglePlay = () => {
    setError(null);
    if (!currentStation && stations.length > 0) {
      handlePlayStation(stations[0]);
      return;
    }
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (currentStation) {
      if (!audioRef.current?.src || audioRef.current.src === window.location.href) {
        if (audioRef.current) {
          audioRef.current.src = currentStation.url;
          audioRef.current.load();
        }
      }
      audioRef.current?.play().catch((e) => {
        console.error("Playback error:", e);
        setIsPlaying(false);
        setError("تعذر الاتصال بالبث الحي في المقر المختار.");
      });
      setIsPlaying(true);
    }
  };

  // Filter stations based on search queries and category buttons
  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.name.includes(searchQuery) || station.type.includes(searchQuery);
    const matchesCategory =
      selectedCategory === "all" ||
      station.type === selectedCategory ||
      (selectedCategory === "إذاعات عامة" && station.type.includes("عامة"));
    return matchesSearch && matchesCategory;
  });

  const handleShare = (station: RadioStation) => {
    if (navigator.share) {
      navigator.share({
        title: station.name,
        text: `استمع إلى ${station.name} عبر تطبيقنا الإيماني العظيم 🌸`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(station.url);
      toast.success("تم نسخ رابط البث المباشر بنجاح 📋");
    }
  };

  return (
    <div
      className="max-w-xl mx-auto p-4 space-y-6 pb-36 min-h-screen bg-[#FAF9F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100"
      dir="rtl"
    >
      {/* Back to Home Button */}
      {onBack && (
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = "";
              try {
                audioRef.current.load();
              } catch (e) {}
            }
            onBack();
          }}
          className="group mb-2 flex items-center justify-center p-3 hover:bg-emerald-500/10 rounded-2xl transition-all border border-slate-200/60 dark:border-emerald-950/40 bg-white dark:bg-[#0A1914] shadow-sm text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
        >
          <ArrowRight size={18} className="ml-1.5 transition-transform group-hover:translate-x-1" />
          <span>العودة للرئيسية</span>
        </button>
      )}

      <audio
        ref={audioRef}
        onError={(e) => {
          console.error("Audio internal error:", e);
          setIsPlaying(false);
          setError("البث المختار غير متاح مؤقتاً كإذاعة حية. تم إيقاف المشغل.");
        }}
      />

      {/* Decorative High Resolution Islamic Banner */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative rounded-[2.5rem] p-8 text-white shadow-xl overflow-hidden min-h-[190px] flex flex-col justify-end border border-[#E2C392]/20"
      >
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.45] scale-105"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1542816417-0983cb9c62ce?q=80&w=1200&auto=format&fit=crop")',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#04120E] via-[#0B2117]/65 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-15"></div>
        
        {/* Live indicator top badge */}
        <div className="absolute top-4 left-4 bg-red-600/35 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-red-500/30 text-rose-200 animate-pulse flex items-center gap-1.5 direction-ltr">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          بث مباشر 24 ساعة
        </div>

        <div className="relative z-10 text-right space-y-1">
          <div className="flex items-center gap-1.5 text-[#E2C392]">
            <Sparkles size={14} className="animate-spin duration-3050" />
            <span className="text-[10px] font-bold uppercase tracking-wider">سلسلة الأثير الإيماني الشاملة</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-serif leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            أعذب الأصوات والشيوخ الجدد
          </h1>
          <p className="text-slate-200 text-xs font-medium opacity-90 max-w-sm leading-relaxed pt-1">
            استكشف باقة واسعة من كبار علماء القراءات بالعالم الإسلامي بالإضافة إلى القراء الشباب، مع قنوات التحصين الشرعي والذكر.
          </p>
        </div>
      </motion.div>

      {/* Featured Core Sheikhs List (Carousel style for fast access) */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-[#0D5C4D] dark:text-[#E2C392] flex items-center gap-1.5 px-1 font-serif">
          <Award size={16} />
          شيوخ وقراء بارزين (مختار لك)
        </h2>
        
        {/* Horizontal scroll of premium cards */}
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none snap-x scroll-smooth">
          {stations.filter(s => s.isPopular).slice(0, 8).map((station) => {
            const isActive = currentStation?.id === station.id;
            const bgImage = getStationImage(station.name, station.type);
            
            return (
              <motion.div
                key={`feat_${station.id}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePlayStation(station)}
                className={`flex-none w-36 snap-start rounded-[1.75rem] overflow-hidden relative cursor-pointer shadow-md bg-[#0B2117] group aspect-[3/4.2] border-2 transition-all ${
                  isActive 
                    ? "border-[#E2C392] ring-4 ring-[#E2C392]/20 shadow-[0_0_20px_rgba(226,195,146,0.3)]" 
                    : "border-slate-100 dark:border-emerald-950/60"
                }`}
              >
                {/* Background cover image of the sheikh portrait style */}
                <img
                  src={bgImage}
                  alt={station.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.5] group-hover:scale-105 transition-all duration-300 pointer-events-none"
                />
                
                {/* Soft glow shader overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent"></div>
                
                {/* Glowing golden circle if active */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E2C392] animate-ping" />
                )}

                <div className="absolute inset-0 p-3 flex flex-col justify-between text-right">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-300 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full w-max border border-white/5">
                    {station.type.split(" ")[0]}
                  </span>
                  
                  <div>
                    <h3 className="text-xs font-extrabold text-white leading-snug font-serif drop-shadow line-clamp-2">
                      {station.name.replace("الشيخ ", "")}
                    </h3>
                    <p className="text-[8px] text-[#E2C392] font-semibold mt-1">
                      {isActive && isPlaying ? "🟢 يتم الاستماع" : "🔇 حط للبث"}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Advanced Filter Tabs Panel */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-serif font-bold transition-all border shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[#0D5C4D] border-[#0D5C4D] text-white shadow-md shadow-emerald-900/10"
                : "bg-white dark:bg-[#0A1914] border-slate-200 dark:border-emerald-950/40 text-slate-600 dark:text-emerald-300 hover:border-[#0D5C4D]/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Instant Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-4.5 flex items-center pointer-events-none">
          <Search size={18} className="text-[#0D5C4D] dark:text-[#E2C392]/80" />
        </div>
        <input
          type="text"
          placeholder="ابحث بالاسم مثل (إسلام صبحي، عبد الباسط، العفاسي)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#0A1914] border border-slate-200 dark:border-emerald-950/40 rounded-2xl py-3.5 pr-11 pl-4 text-xs font-serif text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]/30 focus:border-[#0D5C4D] transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-emerald-800"
        />
      </div>

      {/* Error dynamic message warning banner if streaming offline */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-center text-xs font-bold shadow-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID CONFIG OF BROADCAST CARDS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {filteredStations.length > 0 ? (
          filteredStations.map((station, index) => {
            const isActive = currentStation?.id === station.id;
            const imageCover = getStationImage(station.name, station.type);

            return (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.4) }}
                whileHover={{ y: -3 }}
                className={`group rounded-3xl overflow-hidden border bg-white dark:bg-[#0A1914] transition-all relative ${
                  isActive
                    ? "border-[#E2C392] ring-1 ring-[#E2C392]/30 shadow-lg shadow-amber-500/5 bg-gradient-to-l from-white dark:from-[#0A1914] to-amber-500/5"
                    : "border-slate-100 dark:border-emerald-950/30 shadow-sm hover:border-slate-300 dark:hover:border-emerald-900"
                }`}
              >
                {/* Minimalist preview banner behind each card for richness */}
                <div className="h-20 relative overflow-hidden">
                  <img
                    src={imageCover}
                    alt={station.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover brightness-[0.45] saturate-[0.8] group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0A1914] to-transparent"></div>
                  
                  {/* Category tiny floating tag */}
                  <span className="absolute top-3.5 right-3.5 bg-black/45 backdrop-blur-md text-[9px] font-bold text-slate-200 px-2.5 py-1 rounded-full border border-white/10">
                    {station.type}
                  </span>
                </div>

                {/* Card Body contents */}
                <div className="p-4 flex flex-col justify-between -mt-4 relative z-10 space-y-4">
                  <div className="space-y-1 text-right">
                    <h3
                      className={`text-sm font-extrabold font-serif leading-snug line-clamp-1 transition-colors ${
                        isActive ? "text-emerald-600 dark:text-[#E2C392]" : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {station.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {station.name.includes("الشيخ") ? "تلاوات عطرة ومجالس قرآنية شريفة" : "بث حي وتوعية فقهية مستمرة"}
                    </p>
                  </div>

                  {/* Play & action controls layout inside the card */}
                  <div className="flex items-center justify-between gap-3 pt-1.5">
                    {/* Share Button icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(station);
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#07130F] dark:hover:bg-emerald-950/20 rounded-xl transition-all cursor-pointer text-slate-500 dark:text-emerald-400 border border-slate-100 dark:border-emerald-950/20"
                      title="مشاركة البث"
                    >
                      <Share2 size={13} />
                    </button>

                    {/* Core play toggle trigger */}
                    <button
                      onClick={() => handlePlayStation(station)}
                      className={`flex-1 py-1.5 px-4.5 rounded-xl border font-bold text-[11px] font-serif transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-[#E2C392] border-[#E2C392] text-slate-900 shadow-md animate-pulse"
                          : "bg-[#0D5C4D]/10 hover:bg-[#0D5C4D] border-transparent text-[#0D5C4D] dark:text-emerald-300 dark:bg-emerald-950/30 hover:text-white"
                      }`}
                    >
                      {isActive && isPlaying ? (
                        <>
                          <PauseCircle size={15} />
                          <span>إيقاف التشغيل</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle size={15} />
                          <span>استماع الآن 📡</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Animated active wave overlay indicators */}
                {isActive && isPlaying && (
                  <div className="absolute bottom-2 left-3 flex items-end gap-0.5 h-4 pointer-events-none">
                    {[1, 2, 3].map((bar) => (
                      <motion.div
                        key={bar}
                        className="w-0.5 bg-emerald-500 dark:bg-[#E2C392] rounded-t-sm"
                        animate={{ height: ["20%", "100%", "40%", "100%"] }}
                        transition={{
                          duration: 0.8 + bar * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10 text-slate-500 dark:text-emerald-850 text-xs font-serif">
            🔍 لا توجد نتائج مطابقة لبحثك في هذا القسم، ابحث بكلمات بسيطة أخرى.
          </div>
        )}
      </motion.div>

      {/* HEAVENLY FLOATING GLOWING CENTRAL MINI CONTROLLER */}
      <AnimatePresence>
        {currentStation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 z-40"
          >
            <div className="p-4 bg-[#0B2117]/95 dark:bg-[#030E0A]/95 backdrop-blur-md border border-[#E2C392]/30 flex flex-col gap-3 shadow-2xl rounded-3xl relative overflow-hidden text-white">
              {/* Islamic background watermark pattern inside mini player */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E2C392]/20 to-emerald-800/10 text-[#E2C392] flex items-center justify-center border border-[#E2C392]/30 shrink-0 rotate-3 animate-pulse">
                    <RadioIcon size={22} />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black tracking-wider text-[#E2C392] uppercase">
                      الإذاعة الإيمانية تشغل الآن 🎧
                    </span>
                    <h4 className="text-xs font-extrabold text-white truncate max-w-[200px] leading-relaxed">
                      {currentStation.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Share current */}
                  <button
                    onClick={() => handleShare(currentStation)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-200 cursor-pointer"
                    title="مشاركة المحطة"
                  >
                    <Share2 size={16} />
                  </button>

                  {/* Play Control */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#E2C392] text-slate-900 flex items-center justify-center shadow-lg transform active:scale-90 transition-all shrink-0 cursor-pointer"
                  >
                    {isPlaying ? (
                      <PauseCircle size={22} className="text-[#0B2117]" />
                    ) : (
                      <PlayCircle size={22} className="text-[#0B2117]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Volume Slider row inside controller */}
              <div className="flex items-center gap-3 px-1 mt-1 relative z-10 text-[11px]">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-[#E2C392] hover:text-white shrink-0 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E2C392]"
                  dir="ltr"
                />
                <span className="font-mono text-[9px] text-slate-300 w-6 text-left">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

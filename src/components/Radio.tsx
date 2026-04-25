import React, { useState, useRef, useEffect } from "react";
import {
  Radio as RadioIcon,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Search,
  Tv
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RadioStation {
  id: string;
  name: string;
  url: string;
  type: string;
}

const STATIONS: RadioStation[] = [
  {
    id: "1",
    name: "مختارات من التلاوات",
    url: "https://qurango.net/radio/tarteel",
    type: "عام",
  },
  {
    id: "2",
    name: "الفتاوى",
    url: "https://qurango.net/radio/fatwa",
    type: "عام",
  },
  {
    id: "3",
    name: "تفسير القرآن الكريم",
    url: "https://qurango.net/radio/tafseer",
    type: "عام",
  },
  {
    id: "4",
    name: "الرقية الشرعية",
    url: "https://qurango.net/radio/roqiah",
    type: "عام",
  },
  {
    id: "63",
    name: "أذكار الصباح",
    url: "https://qurango.net/radio/athkar_sabah",
    type: "أذكار",
  },
  {
    id: "24",
    name: "أذكار المساء",
    url: "https://qurango.net/radio/athkar_masaa",
    type: "أذكار",
  },
  {
    id: "67",
    name: "الرقية الشرعية",
    url: "https://qurango.net/radio/roqiah",
    type: "أذكار",
  },
  {
    id: "68",
    name: "تكبيرات العيد",
    url: "https://qurango.net/radio/takbeer",
    type: "أذكار",
  },
  {
    id: "5",
    name: "تلاوات خاشعة",
    url: "https://qurango.net/radio/tarteel",
    type: "تلاوات",
  },
  {
    id: "6",
    name: "الفتاوى",
    url: "https://qurango.net/radio/fatwa",
    type: "برامج",
  },
  {
    id: "7",
    name: "عبدالباسط عبدالصمد - مجود",
    url: "https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad",
    type: "قراء",
  },
  {
    id: "8",
    name: "مشاري العفاسي",
    url: "https://qurango.net/radio/mishary_alafasi",
    type: "قراء",
  },
  {
    id: "9",
    name: "عبدالرحمن السديس",
    url: "https://qurango.net/radio/abdulrahman_alsudaes",
    type: "قراء",
  },
  {
    id: "10",
    name: "سعود الشريم",
    url: "https://qurango.net/radio/saud_alshuraim",
    type: "قراء",
  },
  {
    id: "11",
    name: "سعد الغامدي",
    url: "https://qurango.net/radio/saad_alghamidi",
    type: "قراء",
  },
  {
    id: "12",
    name: "ماهر المعيقلي",
    url: "https://qurango.net/radio/maher_almuaiqly",
    type: "قراء",
  },
  {
    id: "13",
    name: "ياسر الدوسري",
    url: "https://qurango.net/radio/yasser_aldosari",
    type: "قراء",
  },
  {
    id: "14",
    name: "محمود خليل الحصري",
    url: "https://qurango.net/radio/mahmoud_khalil_alhussary",
    type: "قراء",
  },
  {
    id: "15",
    name: "محمد صديق المنشاوي",
    url: "https://qurango.net/radio/mohammed_siddiq_alminshawi",
    type: "قراء",
  },
  {
    id: "16",
    name: "فارس عباد",
    url: "https://qurango.net/radio/fares_abbad",
    type: "قراء",
  },
  {
    id: "17",
    name: "إدريس أبكر",
    url: "https://qurango.net/radio/idrees_abkr",
    type: "قراء",
  },
  {
    id: "18",
    name: "خالد القحطاني",
    url: "https://qurango.net/radio/khaled_alqahtani",
    type: "قراء",
  },
  {
    id: "19",
    name: "ناصر القطامي",
    url: "https://qurango.net/radio/nasser_alqatami",
    type: "قراء",
  },
  {
    id: "20",
    name: "أبو بكر الشاطري",
    url: "https://qurango.net/radio/abu_bakr_alshatri",
    type: "قراء",
  },
  {
    id: "21",
    name: "أحمد العجمي",
    url: "https://qurango.net/radio/ahmad_alajmy",
    type: "قراء",
  },
  {
    id: "25",
    name: "تفسير القرآن الكريم",
    url: "https://qurango.net/radio/tafseer",
    type: "برامج",
  },
  {
    id: "26",
    name: "الإذاعة العامة - إذاعة متنوعة",
    url: "https://qurango.net/radio/mix",
    type: "منوعات",
  },
  {
    id: "27",
    name: "سورة البقرة - لعدد من القراء",
    url: "https://qurango.net/radio/albaqarah",
    type: "تلاوات",
  },
  {
    id: "28",
    name: "عبدالباسط عبدالصمد - مرتل",
    url: "https://qurango.net/radio/abdulbasit_abdulsamad",
    type: "قراء",
  },
  {
    id: "29",
    name: "محمد أيوب",
    url: "https://qurango.net/radio/mohammed_ayyub",
    type: "قراء",
  },
  {
    id: "30",
    name: "علي جابر",
    url: "https://qurango.net/radio/ali_jaber",
    type: "قراء",
  },
  {
    id: "31",
    name: "عبدالله المطرود",
    url: "https://qurango.net/radio/abdullah_almattrod",
    type: "قراء",
  },
  {
    id: "32",
    name: "محمد جبريل",
    url: "https://qurango.net/radio/mohammed_jibreel",
    type: "قراء",
  },
  {
    id: "33",
    name: "عبدالودود حنيف",
    url: "https://qurango.net/radio/abdulwadood_haneef",
    type: "قراء",
  },
  {
    id: "34",
    name: "خالد الجليل",
    url: "https://qurango.net/radio/khalid_aljileel",
    type: "قراء",
  },
  {
    id: "35",
    name: "محمود علي البنا",
    url: "https://qurango.net/radio/mahmoud_ali__albanna",
    type: "قراء",
  },
  {
    id: "36",
    name: "مصطفى إسماعيل",
    url: "https://qurango.net/radio/mustafa_ismail",
    type: "قراء",
  },
  {
    id: "37",
    name: "الزين محمد أحمد",
    url: "https://qurango.net/radio/alzain_mohammad_ahmad",
    type: "قراء",
  },
  {
    id: "38",
    name: "صلاح بو خاطر",
    url: "https://qurango.net/radio/salah_bukhatir",
    type: "قراء",
  },
  {
    id: "39",
    name: "عبدالرشيد صوفي",
    url: "https://qurango.net/radio/abdulrasheed_soufi_khalaf",
    type: "قراء",
  },
  {
    id: "40",
    name: "هيثم الجدعاني",
    url: "https://qurango.net/radio/hitham_aljadani",
    type: "قراء",
  },
  {
    id: "41",
    name: "أحمد الحواشي",
    url: "https://qurango.net/radio/ahmad_alhawashi",
    type: "قراء",
  },
  {
    id: "42",
    name: "أحمد نعينع",
    url: "https://qurango.net/radio/ahmad_nauina",
    type: "قراء",
  },
  {
    id: "43",
    name: "أكرم العلاقمي",
    url: "https://qurango.net/radio/akram_alalaqmi",
    type: "قراء",
  },
  {
    id: "44",
    name: "علي الحذيفي",
    url: "https://qurango.net/radio/ali_alhuthaifi",
    type: "قراء",
  },
  {
    id: "45",
    name: "علي حجاج السويسي",
    url: "https://qurango.net/radio/ali_hajjaj_alsouasi",
    type: "قراء",
  },
  {
    id: "46",
    name: "أيمن سويد",
    url: "https://qurango.net/radio/ayman_sowaid",
    type: "قراء",
  },
  {
    id: "47",
    name: "بندر بليلة",
    url: "https://qurango.net/radio/bandar_balila",
    type: "قراء",
  },
  {
    id: "48",
    name: "هاني الرفاعي",
    url: "https://qurango.net/radio/hani_arrifai",
    type: "قراء",
  },
  {
    id: "49",
    name: "حاتم فريد الواعر",
    url: "https://qurango.net/radio/hatem_fareed_alwaer",
    type: "قراء",
  },
  {
    id: "50",
    name: "إبراهيم الأخضر",
    url: "https://qurango.net/radio/ibrahim_alakhdar",
    type: "قراء",
  },
  {
    id: "51",
    name: "خليفة الطنيجي",
    url: "https://qurango.net/radio/khalifa_altunaiji",
    type: "قراء",
  },
  {
    id: "52",
    name: "محمد محمود الطبلاوي",
    url: "https://qurango.net/radio/mohammad_al_tablaway",
    type: "قراء",
  },
  {
    id: "53",
    name: "نبيل الرفاعي",
    url: "https://qurango.net/radio/nabil_al_rifay",
    type: "قراء",
  },
  {
    id: "54",
    name: "صلاح الهاشم",
    url: "https://qurango.net/radio/salah_alhashim",
    type: "قراء",
  },
  {
    id: "55",
    name: "شيرزاد طاهر",
    url: "https://qurango.net/radio/shirazad_taher",
    type: "قراء",
  },
  {
    id: "56",
    name: "طارق دعوب",
    url: "https://qurango.net/radio/tareq_abdulgani_daawob",
    type: "قراء",
  },
  {
    id: "57",
    name: "توفيق الصايغ",
    url: "https://qurango.net/radio/tawfeeq_assayegh",
    type: "قراء",
  },
  {
    id: "58",
    name: "وديع اليمني",
    url: "https://qurango.net/radio/wadee_hammadi_alyamani",
    type: "قراء",
  },
  {
    id: "59",
    name: "زكي داغستاني",
    url: "https://qurango.net/radio/zaki_daghistani",
    type: "قراء",
  },
  {
    id: "60",
    name: "المنشاوي - مجود",
    url: "https://qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad",
    type: "قراء",
  },
  {
    id: "61",
    name: "الحصري - مجود",
    url: "https://qurango.net/radio/mahmoud_khalil_alhussary_mojawwad",
    type: "قراء",
  },
  {
    id: "62",
    name: "عبدالباسط - ورش",
    url: "https://qurango.net/radio/abdulbasit_abdulsamad_warsh",
    type: "قراء",
  },
  {
    id: "64",
    name: "الإذاعة الإنجليزية",
    url: "https://qurango.net/radio/english",
    type: "لغات",
  },
  {
    id: "65",
    name: "الإذاعة الفرنسية",
    url: "https://qurango.net/radio/fr",
    type: "لغات",
  },
  {
    id: "66",
    name: "الإذاعة الأردية",
    url: "https://qurango.net/radio/ur",
    type: "لغات",
  },
];

const TV_CHANNELS = [
  {
    id: "tv1",
    name: "قناة القرآن الكريم - مكة المكرمة",
    videoId: "5qap5aO4i9A", // Makkah Live
  },
  {
    id: "tv2",
    name: "قناة السنة النبوية - المدينة المنورة",
    videoId: "a1aB5m-c1O0", // Madinah Live
  }
];

export default function IslamicRadio() {
  const [activeTab, setActiveTab] = useState<"radio" | "tv">("radio");
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const [error, setError] = useState<string | null>(null);

  const handlePlayStation = (station: RadioStation) => {
    setError(null);
    if (currentStation?.id === station.id) {
      togglePlay();
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = station.url;
        audioRef.current
          .play()
          .catch((e) => {
            console.error("Error playing audio:", e);
            setIsPlaying(false);
            setError("عذراً، هذه الإذاعة لا تعمل حالياً أو متوقفة مؤقتاً. يرجى المحاولة في وقت لاحق.");
          });
      }
    }
  };

  const togglePlay = () => {
    setError(null);
    if (!currentStation && STATIONS.length > 0) {
      handlePlayStation(STATIONS[0]);
      return;
    }
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (currentStation) {
      if (!audioRef.current?.src) {
        if (audioRef.current) audioRef.current.src = currentStation.url;
      }
      audioRef.current
        ?.play()
        .catch((e) => {
          console.error("Error playing audio:", e);
          setIsPlaying(false);
          setError("عذراً، هذه الإذاعة لا تعمل حالياً أو متوقفة مؤقتاً. يرجى المحاولة في وقت لاحق.");
        });
      setIsPlaying(true);
    }
  };

  const filteredStations = STATIONS.filter(station => 
    station.name.includes(searchQuery) || station.type.includes(searchQuery)
  );

  return (
    <div
      className="max-w-md mx-auto p-4 space-y-6 pb-32 min-h-screen bg-slate-50 dark:bg-slate-950"
      dir="rtl"
    >
      <audio 
        ref={audioRef} 
        onError={(e) => {
          console.error("Audio playback error:", e);
          setIsPlaying(false);
          setError("عذراً، هذه الإذاعة لا تعمل حالياً أو متوقفة مؤقتاً. يرجى اختيار إذاعة أخرى.");
        }}
      />

      {/* Header 3D */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden text-center border border-white/5"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/40 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-serif mb-2 flex justify-center items-center gap-3 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] text-emerald-400">
            {activeTab === "radio" ? <RadioIcon size={32} /> : <Tv size={32} />}
            {activeTab === "radio" ? "الإذاعة الإسلامية" : "البث التلفزيوني"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            بث مباشر على مدار الساعة
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
        <button
          onClick={() => setActiveTab("radio")}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "radio"
              ? "bg-emerald-500 text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <RadioIcon size={18} />
          الإذاعة
        </button>
        <button
          onClick={() => {
            setActiveTab("tv");
            if (isPlaying) togglePlay();
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "tv"
              ? "bg-emerald-500 text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Tv size={18} />
          التلفزيون
        </button>
      </div>

      {activeTab === "radio" ? (
        <>
          {/* Search Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="relative"
      >
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-500 dark:text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="ابحث عن إذاعة أو قارئ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl py-3 pr-10 pl-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] placeholder:text-slate-500 dark:text-slate-400"
        />
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center text-sm font-bold shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stations List 3D */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {filteredStations.length > 0 ? (
          filteredStations.map((station, index) => {
            const isActive = currentStation?.id === station.id;

            return (
              <motion.button
                key={station.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlayStation(station)}
                className={`w-full card-3d p-4 flex items-center justify-between group transition-all rounded-2xl ${
                  isActive
                    ? "bg-gradient-to-r from-white dark:from-slate-900 to-emerald-500/10 border border-emerald-400/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    : "bg-white dark:bg-slate-900 border border-white/5 hover:border-emerald-400/20 hover:bg-white/5 shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner transition-colors shrink-0 ${
                      isActive
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-emerald-400/50"
                        : "bg-black/5 dark:bg-white/5 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 border border-black/10 dark:border-white/10"
                    }`}
                  >
                    {isActive && isPlaying ? (
                      <PauseCircle size={24} />
                    ) : (
                      <PlayCircle size={24} />
                    )}
                  </div>
                  <div className="text-right">
                    <h3
                      className={`font-bold font-serif text-lg transition-colors ${isActive ? "text-emerald-400" : "text-slate-800 dark:text-slate-100"}`}
                    >
                      {station.name}
                    </h3>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md inline-block mt-1 border border-black/10 dark:border-white/10">
                      {station.type}
                    </span>
                  </div>
                </div>

                {isActive && isPlaying && (
                  <div className="flex items-end gap-1 h-6 shrink-0">
                    {[1, 2, 3, 4].map((bar) => (
                      <motion.div
                        key={bar}
                        className="w-1 bg-emerald-500 rounded-t-sm shadow-[0_0_5px_rgba(212,175,55,0.5)]"
                        animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                        transition={{
                          duration: 1 + Math.random(),
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            لا توجد نتائج مطابقة للبحث
          </div>
        )}
      </motion.div>

      {/* Player Controls 3D */}
      <AnimatePresence>
        {currentStation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 z-40"
          >
            <div className="card-3d p-4 bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-emerald-400/20 flex flex-col gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] animate-pulse shrink-0 border border-emerald-400/50">
                    <RadioIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      يتم التشغيل الآن
                    </p>
                    <p className="text-sm font-bold text-emerald-400 truncate w-40">
                      {currentStation.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] transform active:scale-95 transition-all shrink-0 border border-emerald-400/50"
                >
                  {isPlaying ? (
                    <PauseCircle size={28} />
                  ) : (
                    <PlayCircle size={28} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 px-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 shrink-0 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
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
                  className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 shadow-inner"
                  dir="ltr"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {TV_CHANNELS.map((channel) => (
            <div key={channel.id} className="card-3d overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-lg">
              <div className="p-4 border-b border-black/5 dark:border-white/5">
                <h3 className="font-bold font-serif text-lg text-emerald-500 flex items-center gap-2">
                  <Tv size={20} />
                  {channel.name}
                </h3>
              </div>
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${channel.videoId}?autoplay=0&mute=0&controls=1&rel=0`}
                  title={channel.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

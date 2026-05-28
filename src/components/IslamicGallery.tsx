import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Download, 
  Share2, 
  Sparkles, 
  Check, 
  Camera, 
  Heart, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Copy, 
  ExternalLink 
} from "lucide-react";
import toast from "react-hot-toast";

interface Wallpaper {
  id: string;
  title: string;
  category: string;
  url: string;
  author: string;
}

const WALLPAPERS: Wallpaper[] = [
  // 1. Haramain
  {
    id: "h1",
    title: "الكعبة المشرفة بمكة المكرمة",
    category: "haramain",
    url: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "h2",
    title: "مآذن المسجد النبوي الشريف بالمدينة المنورة",
    category: "haramain",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "h3",
    title: "تفاصيل الكعبة المشرفة والكسوة الذهبية",
    category: "haramain",
    url: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "h4",
    title: "ساحات مسجد الحرام الروحانية ليلاً",
    category: "haramain",
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },

  // 2. Mosques
  {
    id: "m1",
    title: "قبة الصخرة المشرفة بالمسجد الأقصى",
    category: "mosques",
    url: "https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "m2",
    title: "المسجد الأزرق المهيب بإسطنبول",
    category: "mosques",
    url: "https://images.unsplash.com/photo-1527838832700-50592524df73?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "m3",
    title: "مئذنة تاريخية مع ضياء الصباح الساحر",
    category: "mosques",
    url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "m4",
    title: "مسجد الحسن الثاني الفخم الدار البيضاء",
    category: "mosques",
    url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },

  // 3. Calligraphy
  {
    id: "c1",
    title: "زخرفة إسلامية ذهبية مذهلة",
    category: "calligraphy",
    url: "https://images.unsplash.com/photo-1609599006353-e629f1d40939?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "c2",
    title: "نقوش الخط العربي بمتحف الآثار",
    category: "calligraphy",
    url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "c3",
    title: "فنون هندسية وإضاءة الأرابيسك",
    category: "calligraphy",
    url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "c4",
    title: "خامة الكسوة وعقدة الفضة والخطوط البارزة",
    category: "calligraphy",
    url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },

  // 4. Verses
  {
    id: "v1",
    title: "ملمس الورق القديم المريح للعين",
    category: "verses",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "v2",
    title: "خلفية الطبيعة والغابات البديعة والأمل",
    category: "verses",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "v3",
    title: "سماء الليل والنجوم الروحانية السبارة",
    category: "verses",
    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  },
  {
    id: "v4",
    title: "قماش اخضر حريري ذهبي مزخرف",
    category: "verses",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1080&q=80",
    author: "Unsplash"
  }
];

const PRESET_TEXTS = [
  "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
  "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
  "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ"
];

const CARD_BACKGROUNDS = [
  { id: "bg-emerald", name: "أخضر زمردي", css: "bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950" },
  { id: "bg-midnight", name: "أزرق نيلي", css: "bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" },
  { id: "bg-amber", name: "ذهبي دافئ", css: "bg-gradient-to-br from-amber-950 via-amber-900 to-[#1c1204]" },
  { id: "bg-purple", name: "أرجواني ملكي", css: "bg-gradient-to-br from-purple-950 via-violet-950 to-neutral-950" },
  { id: "bg-maccah", name: "خلفية الكعبة", css: "bg-cover bg-center brightness-[0.4]", url: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&w=800&q=80" },
  { id: "bg-nature", name: "طبيعة ساحرة", css: "bg-cover bg-center brightness-[0.4]", url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80" }
];

export default function IslamicGallery({ onBack }: { onBack: () => void }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  
  // Greeting card generator states
  const [customText, setCustomText] = useState("أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ");
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [textColor, setTextColor] = useState("#fef08a"); // text-yellow-200
  const [alignment, setAlignment] = useState<"center" | "right">("center");
  const [fontSize, setFontSize2] = useState(24);
  const [isCopiedId, setIsCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "الكل" },
    { id: "haramain", name: "الحرمين الشريفين" },
    { id: "mosques", name: "مساجد بدائع" },
    { id: "calligraphy", name: "خط وزخارف" },
    { id: "verses", name: "آيات وعبر" }
  ];

  const filteredWallpapers = WALLPAPERS.filter(wp => 
    activeCategory === "all" ? true : wp.category === activeCategory
  );

  const handleDownload = (wp: Wallpaper) => {
    // Open in a new tab for saving, or initiate download if possible
    window.open(wp.url, '_blank');
    toast.success("تم فتح الصورة بدقة عالية في نافذة جديدة لتحميلها بسهولة! ✨");
  };

  const handleShare = (wp: Wallpaper, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(wp.url);
    setIsCopiedId(wp.id);
    toast.success("تم نسخ رابط الصورة بدقة عالية إلى الحافظة!");
    setTimeout(() => setIsCopiedId(null), 2000);
  };

  const handleCopyCard = () => {
    // Fallback share card text
    const textToShare = `💡 بطاقتي الإسلامية المصممة:\n\n"${customText}"\n\nتفضل بزيارة تطبيق اليقين للمزيد وبطاقات مخصصة 🕋`;
    navigator.clipboard.writeText(textToShare);
    toast.success("تم نسخ نص وتصميم البطاقة الإسلامية لمشاركتها!");
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28 min-h-screen" dir="rtl">
      {/* Decorative Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#0b221a] rounded-[2.5rem] p-7 text-white shadow-xl relative overflow-hidden text-center border border-emerald-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-slate-900/40 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <button 
            onClick={onBack}
            className="self-start mb-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all border border-white/10 flex items-center gap-1"
          >
            <ArrowRight size={14} />
            <span>العودة للرئيسية</span>
          </button>
          
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner mb-3">
            <ImageIcon size={28} className="text-emerald-400" />
          </div>
          
          <h1 className="text-3xl font-black font-serif text-white tracking-wide">معرض الصور والخلفيات</h1>
          <p className="text-emerald-200/80 text-xs font-medium mt-1">تأمل الجلال الإلهي والعمارة الروحانية الفخمة</p>
        </div>
      </motion.div>

      {/* SECTION 1: Interactiv Design Studio */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#fafafa] dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white">صانع البطاقات الإسلامية المبتكر 🎨</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">صمم، اكتب واشحن روحك بعبارات مريحة للقلب</p>
          </div>
        </div>

        {/* Live Card Preview */}
        <div 
          className={`aspect-[4/3] rounded-3xl relative overflow-hidden flex flex-col justify-center p-6 text-center border border-black/10 shadow-md ${
            CARD_BACKGROUNDS[selectedBgIndex].url ? "" : CARD_BACKGROUNDS[selectedBgIndex].css
          }`}
          style={{
            backgroundImage: CARD_BACKGROUNDS[selectedBgIndex].url ? `url(${CARD_BACKGROUNDS[selectedBgIndex].url})` : undefined
          }}
        >
          {/* Subtle Arabesque Grid overlay */}
          <div className="absolute inset-0 bg-black/10 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
          
          <div className="relative z-10 w-full px-2">
            <p 
              className="font-serif font-bold leading-relaxed mb-1"
              style={{ 
                color: textColor, 
                textAlign: alignment,
                fontSize: `${fontSize}px`
              }}
            >
              {customText || "اكتب جملة طيبة..."}
            </p>
            <span className="text-[9px] text-white/50 block tracking-widest font-mono mt-2">— بطاقة يقين الروحانية</span>
          </div>
        </div>

        {/* Card Controls */}
        <div className="mt-4 space-y-4">
          {/* Preset Buttons */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">أفكار وعبارات مقترحة:</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_TEXTS.map((txt, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomText(txt)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  {txt.substring(0, 20)}...
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Type size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={90}
                placeholder="اكتب هنا لإنشاء بطاقتك الخاصة..."
                className="w-full pl-3 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
            {/* Background Selector */}
            <div>
              <span className="block mb-2">اختر النمط الفني:</span>
              <div className="flex gap-1.5 flex-wrap">
                {CARD_BACKGROUNDS.map((bg, idx) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBgIndex(idx)}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      selectedBgIndex === idx ? "ring-2 ring-emerald-500 scale-110" : "border-slate-300/50"
                    }`}
                    style={{
                      background: bg.url ? `url(${bg.url}) center/cover` : undefined,
                      backgroundColor: bg.url ? undefined : bg.css.match(/from-([a-z0-9-]+)/)?.[1] || "#047857"
                    }}
                    title={bg.name}
                  />
                ))}
              </div>
            </div>

            {/* Colors and Alignments */}
            <div className="space-y-2">
              <div>
                <span className="block mb-1.5">لون الخط:</span>
                <div className="flex gap-1.5">
                  {["#ffffff", "#fef08a", "#a7f3d0", "#fed7aa"].map(c => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Copy Card button */}
          <button
            onClick={handleCopyCard}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border border-emerald-500/20 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <Share2 size={15} />
            <span>نسخ تصميم ونصوص البطاقة للمشاركة 🚀</span>
          </button>
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all border ${
              activeCategory === cat.id
                ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-805"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* WALLPAPERS GRID */}
      <div className="grid grid-cols-2 gap-4">
        {filteredWallpapers.map((wp, idx) => (
          <motion.div
            key={wp.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative"
            onClick={() => setSelectedWallpaper(wp)}
          >
            {/* Wallpaper Image */}
            <div className="aspect-[3/4] overflow-hidden relative bg-slate-100 dark:bg-slate-800">
              <img 
                src={wp.url} 
                alt={wp.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-75 transition-opacity pointer-events-none"></div>
              
              {/* Category tag */}
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-emerald-300 border border-emerald-500/25">
                {categories.find(c => c.id === wp.category)?.name || "حديث"}
              </span>

              {/* Action shortcuts */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
                <div className="truncate pr-2">
                  <h3 className="text-[11px] font-black text-white truncate text-right">
                    {wp.title}
                  </h3>
                  <span className="text-[8px] text-slate-300 block text-right">عدسة: {wp.author}</span>
                </div>
                
                <button
                  onClick={(e) => handleShare(wp, e)}
                  className="w-7 h-7 bg-white/20 hover:bg-white/35 text-white backdrop-blur-md rounded-full flex items-center justify-center transition-all shrink-0 shadow-inner"
                  title="نسخ الرابط"
                >
                  {isCopiedId === wp.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* WALLPAPER DETAIL LIGHTBOX / PREVIEW MODAL */}
      <AnimatePresence>
        {selectedWallpaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col justify-between p-4"
            onClick={() => setSelectedWallpaper(null)}
          >
            {/* Modal Top Actions */}
            <div className="flex justify-between items-center py-2 z-10" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedWallpaper(null)}
                className="bg-white/10 text-white hover:bg-white/20 p-2.5 rounded-full transition-all border border-white/10"
              >
                <ArrowRight size={20} />
              </button>
              <div className="text-center">
                <h2 className="text-sm font-black text-white">{selectedWallpaper.title}</h2>
                <p className="text-[10px] text-slate-300 font-medium">عرض بدقة كاملة ممتازة</p>
              </div>
              <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Immersive Central Image */}
            <div className="flex-1 flex items-center justify-center p-4">
              <motion.img
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                src={selectedWallpaper.url}
                alt={selectedWallpaper.title}
                className="max-h-[70vh] rounded-[2rem] object-contain shadow-2xl border border-white/5"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Modal Bottom Actions */}
            <div 
              className="bg-slate-900/80 border border-white/5 p-5 rounded-[2.5rem] flex flex-col gap-4 max-w-sm mx-auto w-full z-10 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-3">
                {/* Download / Open in new window */}
                <button
                  onClick={() => handleDownload(selectedWallpaper)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Download size={16} />
                  <span>تحميل الخلفية 📥</span>
                </button>
                
                {/* Copy path or share */}
                <button
                  onClick={(e) => handleShare(selectedWallpaper, e)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy size={16} />
                  <span>نسخ الرابط</span>
                </button>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-slate-400 px-2">
                <span>تأثيرات روحية ملونة للعين</span>
                <span>المصدر الشريك: {selectedWallpaper.author}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

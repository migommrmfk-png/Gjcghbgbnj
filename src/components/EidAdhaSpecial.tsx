import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Share2, 
  Download, 
  Heart, 
  Calendar, 
  Sparkles, 
  Check, 
  Clock, 
  BookOpen, 
  Award,
  Book,
  PenTool,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EidAdhaSpecialProps {
  onBack: () => void;
}

export default function EidAdhaSpecial({ onBack }: EidAdhaSpecialProps) {
  const [activeTab, setActiveTab] = useState<'takbeerat' | 'greeting' | 'sunnah' | 'arafah'>('takbeerat');
  const [senderName, setSenderName] = useState('');
  const [isTakbeerPlaying, setIsTakbeerPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const takbeeratLines = [
    "اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ",
    "لَا إِلٰهَ إِلَّا اللهُ",
    "اللهُ أَكْبَرُ، اللهُ أَكْبَرُ",
    "وَلِلّٰهِ الْحَمْدُ",
    "اللهُ أَكْبَرُ كَبِيرًا",
    "وَالْحَمْدُ لِلّٰهِ كَثِيرًا",
    "وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيلًا",
    "لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ",
    "صَدَقَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ",
    "وَأَعَزَّ جُنْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ",
    "لَا إِلٰهَ إِلَّا اللهُ",
    "وَلَا نَعْبُدُ إِلَّا إِيَّاهُ",
    "مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ",
    "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ",
    "وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ",
    "وَعَلَى أَصْحَابِ سَيِّدِنَا مُحَمَّدٍ",
    "وَعَلَى أَنْصَارِ سَيِّدِنَا مُحَمَّدٍ",
    "وَعَلَى أَزْوَاجِ سَيِّدِنَا مُحَمَّدٍ",
    "وَعَلَى ذُرِّيَّةِ سَيِّدِنَا مُحَمَّدٍ",
    "وَسَلِّمْ تَسْلِيمًا كَثِيرًا"
  ];

  // Auto-scroller for Takbeerat lyrics
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTakbeerPlaying) {
      interval = setInterval(() => {
        setCurrentLineIndex((prev) => (prev + 1) % takbeeratLines.length);
        playSpiritualTone(currentLineIndex);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isTakbeerPlaying, currentLineIndex]);

  // Gentle spiritual synth tones mapping to beautiful modal scales
  const playSpiritualTone = (index: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const frequencies = [220, 247.5, 264, 297, 330, 352, 396, 440]; // A minor pentatonic spiritual scale
      const freq = frequencies[index % frequencies.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 4.0);
    } catch (e) {
      console.log('Web Audio tone blocked or unsupported', e);
    }
  };

  const handleToggleTakbeer = () => {
    if (isTakbeerPlaying) {
      setIsTakbeerPlaying(false);
    } else {
      setIsTakbeerPlaying(true);
      playSpiritualTone(0);
      toast.success('تم تشغيل الأجواء الإيمانية بصوت خاشع ومؤثرات صوتية هادئة');
    }
  };

  const copyGreetingText = () => {
    const text = `🎉 أتقدم إليكم بأصدق التهاني والتبريكات بمناسبة عيد الأضحى المبارك، أعاده الله علينا وعليكم بالخير واليمن والبركات. 

كل عام وأنتم بخير ✨
محبكم: ${senderName || 'محبكم في الله'}`;
    
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ نص التهنئة في الحافظة!');
  };

  const shareGreetingCard = () => {
    if (navigator.share) {
      navigator.share({
        title: 'تهنئة عيد الأضحى المبارك',
        text: `كل عام وأنتم بخير بمناسبة عيد الأضحى المبارك ✨ أطيب الأماني من ${senderName || 'محبكم في الله'}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      copyGreetingText();
    }
  };

  const arafahDeeds = [
    { text: "صيام يوم عرفة", desc: "يكفر السنة الماضية والسنة القابلة كما في الحديث الشريف.", checked: false, key: 'arafah_fasting' },
    { text: "الإكثار من الدعاء", desc: "خير الدعاء دعاء يوم عرفة (لا إله إلا الله وحده لا شريك له).", checked: false, key: 'arafah_dua' },
    { text: "التكبير المطلق والمقيد", desc: "يبدأ عقب الصلوات من فجر يوم عرفة إلى آخر أيام التشريق.", checked: false, key: 'arafah_takbeer' },
    { text: "كثرة الاستغفار والتهليل", desc: "ترديد الباقيات الصالحات والاستغفار وذكر الله بكثرة.", checked: false, key: 'arafah_dhikr' },
    { text: "الصدقة وصلة الرحم", desc: "مواساة الفقراء والمساكين وإدخال السرور على الأهل والأحباب.", checked: false, key: 'arafah_charity' }
  ];

  const [deeds, setDeeds] = useState(() => {
    const saved = localStorage.getItem('dhul_hijjah_deeds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return arafahDeeds;
  });

  const toggleDeed = (index: number) => {
    const newDeeds = [...deeds];
    newDeeds[index].checked = !newDeeds[index].checked;
    setDeeds(newDeeds);
    localStorage.setItem('dhul_hijjah_deeds', JSON.stringify(newDeeds));
    
    if (newDeeds[index].checked) {
      toast.success(`تقبل الله منك! طاعة مباركة ✨`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-28 min-h-screen bg-[#040D0B] text-slate-100 font-sans" dir="rtl">
      {/* Premium Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 bg-emerald-950/40 hover:bg-emerald-900/40 rounded-full text-emerald-400 border border-emerald-500/20 active:scale-95 transition-all"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black font-serif text-white flex items-center gap-2 drop-shadow-md">
            بوابة عيد الأضحى المبارك
            <Sparkles size={20} className="text-amber-400 animate-pulse" />
          </h1>
          <p className="text-emerald-400/80 text-xs font-semibold">باقة متكاملة من التكبيرات، بطاقات التهنئة، ودليل مناسك الحج ويوم عرفة</p>
        </div>
      </div>

      {/* Greeting card hero with custom image */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0A1D18] aspect-[16/10] mb-6 border border-emerald-500/30 shadow-2xl shadow-emerald-950/80">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/src/assets/images/eid_adha_greeting_1779803251178.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#040D0B] via-transparent to-transparent"></div>
        
        {/* Real-time customization text onto the card! */}
        <div className="absolute inset-x-4 bottom-6 text-center z-10 bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-emerald-500/20">
          <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">🎁 بطاقة تهنئة حصرية ومخصصة</p>
          <p className="font-serif text-lg text-white font-extrabold drop-shadow">
            {senderName ? `يُهنئكم البارئ بالعيد: ${senderName}` : "كل عام وأنتم بخير وعافية بالمسرات"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 bg-emerald-950/40 rounded-2xl p-1 border border-emerald-500/10 mb-6 font-medium text-xs text-center">
        <button
          onClick={() => setActiveTab('takbeerat')}
          className={`py-2 px-1 rounded-xl transition-all ${
            activeTab === 'takbeerat' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔊 تكبيرات العيد
        </button>
        <button
          onClick={() => setActiveTab('greeting')}
          className={`py-2 px-1 rounded-xl transition-all ${
            activeTab === 'greeting' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          ✍️ صانع البطاقات
        </button>
        <button
          onClick={() => setActiveTab('arafah')}
          className={`py-2 px-1 rounded-xl transition-all ${
            activeTab === 'arafah' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          ⛰️ يوم عرفة
        </button>
        <button
          onClick={() => setActiveTab('sunnah')}
          className={`py-2 px-1 rounded-xl transition-all ${
            activeTab === 'sunnah' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          📜 سنن وآداب
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Eid Takbeerat */}
        {activeTab === 'takbeerat' && (
          <motion.div
            key="takbeerat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5"
          >
            {/* Audio Panel */}
            <div className="bg-[#0B1E19]/90 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden text-center shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg text-2xl animate-pulse mb-2">
                  🕌
                </div>
                <h3 className="text-xl font-bold text-white font-serif">تكبيرات العيد والتشريق</h3>
                <p className="text-emerald-400/80 text-xs">سُنّة مهجورة جليلة تملأ القلوب هيبة ونوراً</p>

                {/* Lyrics Scroller Carousel */}
                <div className="h-28 flex flex-col justify-center items-center bg-black/40 rounded-2xl p-4 border border-emerald-500/10 min-h-[110px]">
                  <p className="text-amber-300 font-extrabold text-xl leading-relaxed text-center font-serif transition-all duration-500">
                    {takbeeratLines[currentLineIndex]}
                  </p>
                  <p className="text-slate-400 text-xs mt-3 opacity-60">
                    التالي: {takbeeratLines[(currentLineIndex + 1) % takbeeratLines.length]}
                  </p>
                </div>

                <div className="flex justify-center items-center gap-4 pt-2">
                  <button
                    onClick={handleToggleTakbeer}
                    className={`flex items-center justify-center gap-3 px-8 py-3 rounded-full text-sm font-black transition-all shadow-md active:scale-95 border ${
                      isTakbeerPlaying 
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-400/30'
                    }`}
                  >
                    {isTakbeerPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    {isTakbeerPlaying ? 'إيقاف التكبير الروحي' : 'تشغيل التكبير الروحي'}
                  </button>
                </div>
              </div>
            </div>

            {/* Read text option */}
            <div className="bg-[#081713] rounded-3xl p-6 border border-emerald-500/10 space-y-4">
              <h3 className="font-serif font-black text-lg text-white flex items-center gap-2">
                <span>📖 الصيغة الكاملة للتكبير</span>
              </h3>
              <div className="bg-black/30 p-4 rounded-2xl border border-emerald-500/5">
                <p className="text-slate-200 text-base leading-loose font-medium text-center font-serif whitespace-pre-line">
                  {`الله أكبر، الله أكبر، الله أكبر، لا إله إلا الله،
الله أكبر، الله أكبر، ولله الحمد.

الله أكبر كبيراً، والحمد لله كثيراً،
وسبحان الله بكرة وأصيلاً.

لا إله إلا الله وحده، صدق وعده،
ونصر عبده، وأعز جنده،
وهزم الأحزاب وحده.

لا إله إلا الله، ولا نعبد إلا إياه،
مخلصين له الدين ولو كره الكافرون.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Custom Name Eid Card Creator */}
        {activeTab === 'greeting' && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5"
          >
            <div className="bg-[#0B1E19]/90 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <PenTool size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-white">صنع تبريكات مخصصة باسمك</h3>
                  <p className="text-xs text-slate-400">اكتب اسمك وسهّل مشاركة التهنئة المميزة مع عائلتك وأصحابك</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-emerald-400 font-bold block">اكتب اسمك الكريم هنا:</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  maxLength={40}
                  className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 placeholder-slate-500 text-right"
                  placeholder="مثال: عائلة أحمد القحطاني"
                />
              </div>

              {/* Dynamic Live Preview */}
              <div className="relative border border-emerald-500/30 rounded-2xl overflow-hidden shadow-inner group p-6 aspect-[16/11] bg-emerald-950/20 flex flex-col justify-end items-center text-center">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: 'url("/src/assets/images/eid_adha_greeting_1779803251178.png")' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#040D0B] via-emerald-950/60 to-black/30"></div>
                
                <div className="relative z-10 p-4 space-y-2 max-w-[90%]">
                  <p className="text-amber-400 font-black text-xs uppercase tracking-widest drop-shadow">EID MUBARAK</p>
                  <p className="font-serif text-xl font-bold text-white drop-shadow-md">بمناسبة حلول عيد الأضحى المبارك</p>
                  <p className="text-slate-200 text-[11px] leading-relaxed drop-shadow">نرسل إليكم باقة محملة بأجمل باقات الورد والرياحين، معطر بذكر الرحمن.</p>
                  <div className="pt-2 border-t border-white/10 mt-2">
                    <p className="text-emerald-300 font-extrabold font-serif text-sm drop-shadow">
                      {senderName ? `المهنئ: ${senderName}` : "اسمك يُعرض هنا"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyGreetingText}
                  className="flex items-center justify-center gap-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  <Copy size={16} />
                  نسخ نص التهنئة
                </button>
                <button
                  onClick={shareGreetingCard}
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-black transition-all active:scale-95"
                >
                  <Share2 size={16} />
                  مشاركة وتصدير
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Day of Arafah virtues and checklist */}
        {activeTab === 'arafah' && (
          <motion.div
            key="arafah"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5"
          >
            {/* Banner info */}
            <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl"></div>
              <h3 className="font-serif font-black text-lg text-amber-300 flex items-center gap-2 mb-2">
                ⛰️ يوم عرفة • أعظم أيام الدنيا
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                قال رسول الله ﷺ: <span className="text-white font-semibold">"خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ، وَخَيْرُ مَا قُلْتُ أَنَا وَالنَّبِيُّونَ مِنْ قَبْلِي: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ"</span>.
              </p>
            </div>

            {/* Checklist items */}
            <div className="bg-[#0B1E19]/90 border border-emerald-500/20 rounded-3xl p-6 space-y-4 shadow-xl">
              <div>
                <h3 className="font-serif font-black text-lg text-white">تحدي طاعات يوم عرفة</h3>
                <p className="text-xs text-slate-400">سجل إنجازاتك الروحية وذكر نفسك بالطاعات الثمينة</p>
              </div>

              <div className="space-y-3">
                {deeds.map((deed: any, index: number) => (
                  <div
                    key={deed.key}
                    onClick={() => toggleDeed(index)}
                    className={`flex items-start gap-4 p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                      deed.checked
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/40' 
                        : 'bg-black/20 border-emerald-500/10 text-slate-200 hover:bg-emerald-950/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      deed.checked 
                        ? 'bg-emerald-500 border-emerald-400 text-white scale-110' 
                        : 'border-emerald-500/30 text-transparent'
                    }`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{deed.text}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{deed.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Eid Sunnahs & Adab */}
        {activeTab === 'sunnah' && (
          <motion.div
            key="sunnah"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5"
          >
            {/* Bento block of Sunnahs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Sparkles className="text-amber-400" size={24} />, title: "الاغتسال للتجمل", desc: "سنة الاغتسال والتطيب ولبس أحسن الثياب قبل الخروج لصلاة العيد." },
                { icon: <Award className="text-amber-400" size={24} />, title: "الأضحية", desc: "ذبح الأضحية بعد صلاة العيد وتوزيعها أثلاثاً (أهل البيت، الأقارب، الفقراء)." },
                { icon: <Check className="text-emerald-400" size={24} />, title: "طريق الصلاة", desc: "الذهاب إلى مصلى العيد من طريق، والعودة من طريق آخر لمصافحة المصلّين." },
                { icon: <Heart className="text-amber-400" size={24} />, title: "التهنئة بالعدل", desc: "تبادل تبريكات العيد بقول: (تقبل الله منا ومنكم صالح الأعمال)." },
                { icon: <BookOpen className="text-amber-400" size={24} />, title: "الطعام بعد الصلاة", desc: "الأكل في عيد الأضحى من ثمار أضحيتك بعد الصلاة تشبهاً بفعل النبي ﷺ." },
                { icon: <Volume2 className="text-amber-400" size={24} />, title: "كثرة التكبير", desc: "رفع الصوت بالتكبير في البيت والمسجد والطريق والأسواق." }
              ].map((sunnah, index) => (
                <div key={index} className="bg-[#0B1E19]/90 border border-[#00ADB5]/25 rounded-2xl p-4 space-y-2 hover:bg-emerald-950/30 transition-all duration-300">
                  <div className="mb-1">{sunnah.icon}</div>
                  <h4 className="font-bold text-sm text-emerald-300">{sunnah.title}</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{sunnah.desc}</p>
                </div>
              ))}
            </div>

            {/* Sacrifice laws quick panel */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-serif font-black text-lg text-white flex items-center gap-2">
                <span>🔔 أحكام الأضحية وشروطها باختصار</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>أن تكون الأضحية من بهيمة الأنعام (الإبل، البقر، الغنم، المعز).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>أن تبلغ السن المعتبرة شرعاً (أقلها الجذع من الضأن وهو ما أتم نصف سنة).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>أن تكون سليمة مبريِّة من العيوب الواضحة (مثل العوراء، البتراء، العرجاء، المريضة).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>أن تذبح في الوقت الشرعي (من بعد صلاة العيد إلى غروب شمس آخر أيام التشريق - 13 ذي الحجة).</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

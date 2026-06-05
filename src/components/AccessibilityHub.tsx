import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Shield, Eye, Settings, Heart, HelpCircle, 
  Smartphone, Volume2, Type, Wifi, Key, Sparkles, Check, 
  Copy, ArrowRight, Video, Cloud, Lock, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AccessibilityHubProps {
  onBack: () => void;
}

export default function AccessibilityHub({ onBack }: AccessibilityHubProps) {
  // Elderly mode state
  const [elderlyMode, setElderlyMode] = useState(() => localStorage.getItem("elderlyModeEnabled") === "true");
  // Font scale (1=default, 1.25=large, 1.5=extra-large)
  const [fontScale, setFontScale] = useState(() => parseFloat(localStorage.getItem("fontSizeScale") || "1"));
  // Screen Reader assistance guide state
  const [screenReaderGuidance, setScreenReaderGuidance] = useState(() => localStorage.getItem("screenReaderGuidance") === "true");
  // Active watch tab
  const [watchActiveTab, setWatchActiveTab] = useState<'clock' | 'qibla' | 'azkar'>('clock');
  const [activeTab, setActiveTab] = useState<'access' | 'smart'>('access');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Time for the smart watch preview
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update Elderly Mode
  const handleToggleElderlyMode = () => {
    const nextVal = !elderlyMode;
    setElderlyMode(nextVal);
    localStorage.setItem("elderlyModeEnabled", String(nextVal));
    
    // Automatically adjust font scale to 1.35 when entering elderly mode for maximum legibility
    if (nextVal) {
      setFontScale(1.35);
      localStorage.setItem("fontSizeScale", "1.35");
      toast.success("تم تفعيل وضع كبار السن: تم تكبير الخطوط والتبسيط التام للواجهة واختصار القائمة العبادية! 👵👴");
    } else {
      setFontScale(1.0);
      localStorage.setItem("fontSizeScale", "1.0");
      toast.success("تم العودة للوضع المعتاد للتطبيق.");
    }

    // Trigger a window resize & storage event so other components adapt immediately
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("elderly-mode-change"));
  };

  // Update font scale slider
  const handleFontScaleChange = (scale: number) => {
    setFontScale(scale);
    localStorage.setItem("fontSizeScale", String(scale));
    
    // Trigger update
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("fontSizeChange"));
  };

  // Copy assistant
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    toast.success("تم نسخ الأمر الذكي لتشغيل التلاوة المنزلية! 🏠🔊");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const smartHomeCommands = [
    {
      id: "alexa-adhan",
      trigger: "أليكسا، شغلي أذان الحرم المكي في مواقيت الصلاة",
      system: "Amazon Alexa (إجراءات الروتين)",
      description: "يقوم بتشغيل صوت الأذان العذب تلقائياً في المنزل عند كل فريضة بربط منبه الظهر والعصر والمغرب والعشاء."
    },
    {
      id: "google-baqarah",
      trigger: "جوجل، اقرأ سورة البقرة بصوت الشيخ المنشاوي في السادسة صباحاً",
      system: "Google Home Routine",
      description: "برمجة يومية تلقائية لقراءة سورة البقرة في أرجاء المنزل والتحصين الشرعي المنهجي."
    },
    {
      id: "siri-azkar",
      trigger: "يا سيري، ردد أذكار الصباح بصوت ميسر",
      system: "Apple Shortcuts (Siri)",
      description: "تشغيل النفحات اليومية وأوراد الصباح فور الاستيقاظ أو قراءة المنبه المالي."
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#FAF9F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 overflow-y-auto pb-24" dir="rtl">
      
      {/* Banner Header */}
      <div className="pt-12 pb-8 px-6 bg-[#0B392B] text-white rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"
             style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1590076214567-9679412df859?q=80&w=1080")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900/60 via-[#0B392B]/95 to-[#052119]/100"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20"></div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-white/10 rounded-full transition-all border border-white/10 bg-white/5 shadow-md flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft size={22} className="text-white transform rotate-180" />
            </button>
            <div className="text-right">
              <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-2.5 py-0.5 rounded-full inline-block leading-normal mb-1">
                توسيع الوصول الشامل
              </span>
              <h1 className="text-xl md:text-2xl font-black font-serif text-[#E2C392] leading-tight">
                الوصول الشامل والأنظمة الذكية
              </h1>
              <p className="text-emerald-100/80 text-xs font-semibold mt-0.5">
                تسهيل الاستخدام لذوي الهمم وكبار السن ومعاينة الساعات الذكية والمنزل
              </p>
            </div>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-400/20 shadow-md">
            <Eye size={22} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="p-4 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 p-1 bg-white dark:bg-[#0A1914] rounded-2xl border border-slate-100 dark:border-emerald-950/20 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('access')}
            className={`py-3 text-xs font-black rounded-xl font-serif transition-all flex items-center justify-center gap-2 ${
              activeTab === 'access'
                ? 'bg-[#0D5C4D] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`}
          >
            <Eye size={15} />
            <span>كبار السن وذوي الهمم (Accessibility)</span>
          </button>
          <button
            onClick={() => setActiveTab('smart')}
            className={`py-3 text-xs font-black rounded-xl font-serif transition-all flex items-center justify-center gap-2 ${
              activeTab === 'smart'
                ? 'bg-[#0D5C4D] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone size={15} />
            <span>الساعات الذكية والمنزل (IoT / Watch)</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: ACCESSIBILITY & ELDERLY */}
          {activeTab === 'access' && (
            <motion.div
              key="tab-access"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Senior Citizens Elder Mode Panel */}
              <div className="bg-white dark:bg-[#0A1914] border border-slate-100 dark:border-emerald-950/40 rounded-[32px] p-6 shadow-sm space-y-5 text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black px-2.5 py-0.5 rounded-full inline-block">
                      سهل وبأزرار عملاقة 👵👴
                    </span>
                    <h3 className="font-serif font-black text-base text-slate-900 dark:text-white">وضع كبار السن (Elderly-friendly Mode)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      واجهة مخصصة تبسط العبادة اليومية وتلغي الأزرار الصغيرة لآبائنا وأمهاتنا؛ لتكون الخيارات الأساسية (المصحف، الأذكار، القبلة، الصلاة) في أزرار لوحية عملاقة بخط كبير جداً يحمي عين كبار السن ويمنحهم سهولة تنقل مطلقة.
                    </p>
                  </div>

                  {/* Elder Mode Toggle */}
                  <button
                    onClick={handleToggleElderlyMode}
                    className={`w-14 h-7.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 relative shrink-0 ${
                      elderlyMode ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`bg-white w-5.5 h-5.5 rounded-full shadow-md transform transition-transform duration-300 ${
                        elderlyMode ? '-translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {elderlyMode && (
                  <div className="bg-amber-500/5 border border-dashed border-amber-500/25 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                    <span className="text-2xl">👵</span>
                    <div>
                      <p className="text-xs font-extrabold text-amber-800 dark:text-amber-400">الوضع النشط والتبسيط قيد التشغيل</p>
                      <p className="text-[10px] text-slate-500 leading-tight">تلقائياً، تم تكبير الخطوط بمقدار 1.35x لسهولة تامة في القراءة داخل صفحات المصحف والأذكار.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Font Scale Slider Customizer */}
              <div className="bg-white dark:bg-[#0A1914] border border-slate-100 dark:border-emerald-950/40 rounded-[32px] p-6 shadow-sm space-y-4 text-right">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-emerald-950/20 pb-2.5">
                  <Type size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">مقياس التكبير اليدوي للخطوط (Font Sizing)</h4>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    اسحب المؤشر لزيادة حجم الخط أو تقليله للتطبيق بأكمله (يتأثر به كلاً من التفسير، نصوص الأوراد، وقراءة الفتاوى والتنبيهات).
                  </p>

                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#07130F] p-4 rounded-2xl">
                    <span className="text-xs text-slate-450 font-bold shrink-0">أصغر (1.0x)</span>
                    <input
                      type="range"
                      min="1"
                      max="1.6"
                      step="0.1"
                      value={fontScale}
                      onChange={(e) => handleFontScaleChange(parseFloat(e.target.value))}
                      className="flex-1 accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0">({fontScale.toFixed(2)}x)</span>
                  </div>

                  <div className="border border-dashed border-slate-200 dark:border-[#122A21] p-3.5 rounded-2xl text-center">
                    <p style={{ fontSize: `${12 * fontScale}px` }} className="text-slate-700 dark:text-slate-350 transition-all font-serif font-black">
                      «المعاينة: بَلْ هُوَ قُرْآنٌ مَّجِيدٌ • فِي لَوْحٍ مَّحْفُوظٍ»
                    </p>
                  </div>
                </div>
              </div>

              {/* Speech-to-Text Support and Sign Language video placeholders */}
              <div className="bg-white dark:bg-[#0A1914] border border-slate-100 dark:border-emerald-950/40 rounded-[32px] p-6 shadow-sm space-y-5 text-right">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-emerald-950/20 pb-2.5">
                  <Video size={18} className="text-indigo-500" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">دعم لغة الإشارة وفاقدي السمع (Hearing impaired)</h4>
                </div>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  تسهيلاً لإخوتنا الصم والبكم، نوفر ترجمة بصرية وإيمانية غنية لخطب الجمعة والدروس الفقهية لتوفير المحتوى الشرعي بلغة الإشارة التفاعلية ونماذج تفصيلية:
                </p>

                <div className="space-y-3">
                  {/* Sign Video Player Mockup Card */}
                  <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden aspect-video flex flex-col justify-between text-white">
                    <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=640")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg">
                        محاكاة مترجم لغة الإشارة المعتمد
                      </span>
                      <span className="text-[10px] text-slate-300 font-mono">دروس الفقه الميسر</span>
                    </div>

                    {/* Centered Sign Language Avatar Simulation Card */}
                    <div className="relative z-10 flex justify-center items-center gap-2.5">
                      <div className="w-18 h-18 rounded-full border-2 border-indigo-400 bg-slate-800/80 p-0.5 flex items-center justify-center relative overflow-hidden animate-bounce shrink-0">
                        <span className="text-2xl">🤟</span>
                        <div className="absolute bottom-0 inset-x-0 bg-indigo-500/95 py-0.5 text-[8px] text-center font-black">نشط</div>
                      </div>
                      <div className="space-y-1 text-right max-w-xs">
                        <p className="text-xs font-extrabold text-[#E2C392]">شرح أركان الصلاة بلغة الإشارة</p>
                        <p className="text-[10px] text-slate-350 leading-tight">شرح حركي تفصيلي للنية، تكبيرة الإحرام، والركوع والسجود لأركان الفريضة.</p>
                      </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px]">
                      <span className="text-emerald-400 font-bold">● جاري معالجة الإشارة</span>
                      <span className="text-slate-300 font-bold">التوقيت: 01:24 : 05:00</span>
                    </div>
                  </div>

                  {/* Speech to text translation support features */}
                  <div className="p-3 bg-slate-50 dark:bg-[#07130F] rounded-2xl border border-slate-100 dark:border-emerald-950/20 text-[11px] leading-relaxed flex items-start gap-2.5">
                    <span className="text-base shrink-0 mt-0.5 font-bold">🎙️</span>
                    <div>
                      <h5 className="font-bold text-[#C59F60] mb-0.5">تحويل التلاوة والخطب إلى نصوص مرئية (Speech-to-Text Support)</h5>
                      <span className="text-slate-505 text-slate-550 dark:text-slate-350">
                        تكامل مدمج يتيح تفريغ صوت المقاطع التلاوية في ريلز التطبيق أو الدروس الصوتية المسجلة ونقلها مكتوبة ومقروءة بوضوح على الشاشة مباشرة لخدمة الفئة السمعية.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: WEARABLES WORK & SMART HOME */}
          {activeTab === 'smart' && (
            <motion.div
              key="tab-smart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Apple Watch / Wear OS Interactive Simulator Block */}
              <div className="bg-white dark:bg-[#0A1914] border border-slate-100 dark:border-emerald-950/40 rounded-[32px] p-6 shadow-sm text-right space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-50 dark:border-[#122A21] pb-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-500">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">تطبيق الساعات الذكية (Apple Watch / Wear OS UI)</h3>
                    <p className="text-[10px] text-slate-500 font-medium">لوحة معاينة محاكاة للتطبيق على المعصم لعرض مواقيت الطاعة</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  في الساعات الذكية، من غير المناسب عرض نصوص ضخمة بقوائم معقدة. صممنا واجهة مرسلة خفيفة الحجم تتميز بالحيوية التامة؛ تظهر على شاشات السيرك أو المربعات الصغيرة كالتالي:
                </p>

                {/* The Physical Watch Frame Mockup */}
                <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-[#07130F] rounded-3xl border border-slate-100 dark:border-emerald-950/15 relative">
                  
                  {/* Apple Watch Shell */}
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="w-48 h-56 bg-black rounded-[42px] p-3 shadow-2xl border-[5px] border-slate-800 flex flex-col items-center justify-center relative overflow-hidden select-none"
                  >
                    {/* Watch crown decor */}
                    <div className="absolute right-[-4px] top-12 w-2.5 h-10 bg-slate-700 rounded-l-lg border-l border-slate-900"></div>
                    <div className="absolute right-[-2px] top-26 w-1.5 h-6 bg-slate-700 rounded-l cursor-pointer"></div>

                    {/* Inside Watch Screen Face */}
                    <div className="w-full h-full bg-[#030c08] rounded-[32px] p-3.5 flex flex-col justify-between text-white text-center font-sans select-none relative">
                      
                      {/* Top Tiny status bar */}
                      <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono px-0.5">
                        <span className="text-emerald-400">🕌 الوفاء</span>
                        <span>{currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Display content based on active mini watch tabs */}
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                          {watchActiveTab === 'clock' && (
                            <motion.div
                              key="watch-clock"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-1"
                            >
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.5 rounded-full inline-block">العصر بعد ساعة</span>
                              <h5 className="text-[20px] font-extrabold text-[#E2C392] leading-none">03:45</h5>
                              <p className="text-[8px] text-slate-350">باقي 01:22 لرفع الأذان</p>
                            </motion.div>
                          )}

                          {watchActiveTab === 'qibla' && (
                            <motion.div
                              key="watch-qibla"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex flex-col items-center justify-center space-y-1"
                            >
                              <div className="w-12 h-12 rounded-full border border-dashed border-emerald-500/40 flex items-center justify-center relative animate-spin-slow">
                                <span className="text-xs text-amber-400">🕋</span>
                                <div className="absolute top-0 w-1 h-3 bg-[#E2C392] rounded"></div>
                              </div>
                              <span className="text-[9px] font-bold text-slate-300">القبلة: بمطابقة 182°</span>
                            </motion.div>
                          )}

                          {watchActiveTab === 'azkar' && (
                            <motion.div
                              key="watch-azkar"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-0.5"
                            >
                              <span className="text-[8px] text-amber-300">أذكار دينية سريعة</span>
                              <p className="text-[10px] font-serif font-black text-[#E2C392] leading-tight px-1 truncate">«سبحان الله وبحمده»</p>
                              <span className="text-[8px] text-slate-400">العدد المتبقي: 30</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Bottom mini watch navigation dots */}
                      <div className="flex justify-center gap-1.5 pt-1 border-t border-slate-900">
                        {(['clock', 'qibla', 'azkar'] as const).map((t) => (
                          <div 
                            key={t}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              watchActiveTab === t ? 'bg-[#E2C392] scale-125' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                    </div>
                  </motion.div>

                  {/* Switch click simulation buttons of Watch */}
                  <div className="flex gap-2.5 mt-5">
                    {[
                      { id: 'clock', label: 'المواقيت' },
                      { id: 'qibla', label: 'القبلة 🕋' },
                      { id: 'azkar', label: 'الأذكار الميسرة' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setWatchActiveTab(btn.id as any)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                          watchActiveTab === btn.id
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-sm'
                            : 'bg-white dark:bg-[#0A1914] border-slate-250 border-slate-200 dark:border-slate-850 text-slate-500'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* IoT Smart Home Integration guidelines & Alexa Commands */}
              <div className="bg-white dark:bg-[#0A1914] border border-slate-100 dark:border-emerald-950/40 rounded-[32px] p-6 shadow-sm text-right space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-[#122A21] pb-2.5">
                  <Cloud size={18} className="text-[#C59F60]" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">تكامل المنزل الذكي (Smart Home - Google/Alexa)</h4>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  يمكنك الاستعانة ببروتوكولات المنزل الذكي لرفع الأذان وتلاوة سورة البقرة يومياً عبر ربط التطبيق بالمساعدات الصوتية الكبرى عن طريق الأوامر السهلة التالية:
                </p>

                <div className="space-y-3">
                  {smartHomeCommands.map((command) => (
                    <div 
                      key={command.id}
                      className="bg-slate-50/70 dark:bg-[#07130F] border border-slate-100 dark:border-[#122A21] p-4 rounded-2xl space-y-2 relative"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold">{command.system}</span>
                        <button
                          onClick={() => handleCopy(command.trigger, command.id)}
                          className="text-emerald-600 hover:text-emerald-800 text-[10px] font-black flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 transition-colors"
                        >
                          {copiedText === command.id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedText === command.id ? 'تم النسخ' : 'نسخ العبارة'}</span>
                        </button>
                      </div>

                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-[#122A21] p-3 rounded-xl font-mono text-xs font-bold text-slate-800 dark:text-emerald-400 leading-relaxed text-center">
                        "{command.trigger}"
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        {command.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

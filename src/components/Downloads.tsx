import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Trash2, Play, Pause, Volume2, VolumeX, Shield, 
  Database, Battery, Sparkles, AlertCircle, CheckCircle2, Bookmark,
  TrendingDown, Info, HelpCircle, Heart, Lock, Globe, Cpu
} from 'lucide-react';
import { DownloadedAudio, getAllDownloadedAudios, removeAudio } from '../lib/audioStore';
import toast from 'react-hot-toast';

interface DownloadsProps {
  onBack: () => void;
}

const Downloads: React.FC<DownloadsProps> = ({ onBack }) => {
  const [downloads, setDownloads] = useState<DownloadedAudio[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  
  // Tab control: 'surahs' or 'performance'
  const [activeTab, setActiveTab] = useState<'surahs' | 'performance'>('surahs');

  // Smart Storage settings saved in localStorage
  const [autoClean, setAutoClean] = useState<boolean>(() => {
    return localStorage.getItem("downloads_auto_clean") === "true";
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const data = await getAllDownloadedAudios();
      setDownloads(data);
    } catch (error) {
      console.error('Error loading downloads:', error);
    }
  };

  const handleRemove = async (id: string) => {
    if (isPlaying === id) {
      audioRef.current?.pause();
      setIsPlaying(null);
    }
    await removeAudio(id);
    await loadDownloads();
    toast.success("تم حذف الملف وتطهير المساحة المستهلكة بنجاح 🧼");
  };

  // Toggle Auto-clean setting
  const toggleAutoClean = () => {
    const nextVal = !autoClean;
    setAutoClean(nextVal);
    localStorage.setItem("downloads_auto_clean", String(nextVal));
    if (nextVal) {
      toast.success("تم تفعيل الأرشفة الذكية: سيتم مسح السورة تلقائياً بعد استماعك الكامل لها لتوفير المساحة 💾");
    } else {
      toast.success("تم إيقاف الأرشفة التلقائية؛ ستبقى الملفات مخزنة حتى تحذفها يدوياً.");
    }
  };

  const togglePlay = (item: DownloadedAudio) => {
    if (!audioRef.current) return;

    if (isPlaying === item.id) {
      audioRef.current.pause();
      setIsPlaying(null);
    } else {
      if (isPlaying) {
        audioRef.current.pause();
      }
      
      const objectUrl = URL.createObjectURL(item.blob);
      audioRef.current.pause();
      audioRef.current.src = objectUrl;
      audioRef.current.load();
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => console.error("Audio playback error:", e?.message || String(e)));
      setIsPlaying(item.id);

      // On finished playback
      audioRef.current.onended = () => {
        setIsPlaying(null);
        URL.revokeObjectURL(objectUrl);

        // Functional implementation of Auto-Clean after listening
        if (autoClean) {
          console.log(`[Auto-Clean] Complete listening detected of ${item.surahName}. Purging from cache...`);
          removeAudio(item.id).then(() => {
            loadDownloads();
            toast("تمت أرشفة السورة ومسح ملفها تلقائياً بعد انتهائها 🧼", {
              icon: '🔄',
              style: {
                borderRadius: '16px',
                background: '#0D5C4D',
                color: '#fff',
                fontSize: '12px'
              },
            });
          });
        }
      };
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  // Calculate total consumed storage size of downloaded audios in Megabytes (MB)
  const calculateTotalSizeMB = () => {
    const bytes = downloads.reduce((acc, curr) => acc + (curr.blob?.size || 0), 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const totalSizeMB = calculateTotalSizeMB();

  return (
    <div className="h-full flex flex-col bg-[#FAF9F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 overflow-y-auto pb-24" dir="rtl">
      <audio ref={audioRef} />

      {/* Hero Header */}
      <div className="pt-12 pb-8 px-6 bg-[#041D15] text-white rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden border-b border-rose-300/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1080&auto=format&fit=crop")',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-950/40 via-[#041D15]/90 to-[#03140F]/95 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.src = "";
                  try {
                    audioRef.current.load();
                  } catch (e) {}
                }
                if (onBack) onBack();
              }}
              className="p-2.5 hover:bg-white/10 rounded-full transition-all border border-white/10 bg-white/5 shadow-md flex items-center justify-center cursor-pointer"
            >
              <ArrowRight size={22} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-serif leading-tight text-[#E2C392]">
                إدارة السعة والأداء الفني
              </h1>
              <p className="text-emerald-100/80 text-xs md:text-sm font-medium mt-1">
                التحكم الذكي بالتخزين، واستهلاك الطاقة وموثوقية السند
              </p>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-400/20 shadow-md">
            <Database size={24} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Tab Switcher Grid */}
      <div className="p-4 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 p-1.5 bg-white dark:bg-[#0A1914] rounded-2xl border border-slate-100 dark:border-emerald-950/20 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`py-3.5 text-xs font-black rounded-xl font-serif transition-all flex items-center justify-center gap-2 ${
              activeTab === 'surahs'
                ? 'bg-[#0D5C4D] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`}
          >
            <Database size={16} />
            <span>إدارة التنزيلات (سعة {totalSizeMB} MB)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-3.5 text-xs font-black rounded-xl font-serif transition-all flex items-center justify-center gap-2 ${
              activeTab === 'performance'
                ? 'bg-[#0D5C4D] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`}
          >
            <Cpu size={16} />
            <span>البطارية وتوثيق السند والتمويل</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: SURAHS AND STORAGE */}
          {activeTab === 'surahs' && (
            <motion.div
              key="tab-surahs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Storage Analyzer & Clean Widget */}
              <div className="bg-gradient-to-br from-emerald-950 to-[#0A261D] rounded-3xl p-6 text-white border border-emerald-500/20 shadow-md relative overflow-hidden text-right">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-x-10 translate-y-10"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-1.5">
                      محلل التخزين الصوتي الذكي
                    </span>
                    <h2 className="text-xl font-bold font-serif text-[#E2C392]">إجمالي مساحة السور المحفّظة: {totalSizeMB} ميجابايت</h2>
                    <p className="text-xs text-slate-350 leading-relaxed max-w-md">
                      تتجمع التلاوات المحملة محلياً في ذاكرة التصفح الآمنة بجهازك (IndexedDB)، للتمكين من الاستماع الكامل وقت انقطاع الإنترنت (Offline mode) دون أي استهلاك لباقة البيانات.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-18 h-18 rounded-full border-[3px] border-emerald-500/30 flex items-center justify-center bg-emerald-900/20 shadow-inner">
                      <Database size={22} className="text-[#E2C392]" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 mt-2">{downloads.length} سورة بالذاكرة</span>
                  </div>
                </div>
              </div>

              {/* Toggle option for Auto-Clean after listening */}
              <div className="p-4 bg-white dark:bg-[#0A1914] border border-slate-100 dark:border-emerald-950/20 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="flex items-start gap-3 flex-1 ml-4 text-right">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">الأرشفة والمسح التلقائي الذكي</h4>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed mt-0.5">
                      عند تمكين هذا الخيار، سيقوم التطبيق بحذف ملف السورة الصوتية تلقائياً من ذاكرة جهازك بمجرد انتهائك من الاستماع الكامل لها، توفيراً للذاكرة وصيانةً مستمرة للمساحة.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={autoClean}
                    onChange={toggleAutoClean}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Downloaded Surahs List card */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 border-b border-slate-50 dark:border-emerald-950/20 pb-2.5 flex items-center gap-2">
                  <Bookmark size={16} className="text-[#0D5C4D]" />
                  <span>الملفات الصوتية المحفوظة والتخلص منها</span>
                </h3>

                <div className="space-y-3">
                  {downloads.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <HelpCircle size={32} className="text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-400">لا توجد سور محملة حالياً بذاكرة جهازك.</p>
                      <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                        انتقل إلى صفحة المصحف الشريف واقترب من أي تلاوة وانقر زر التحميل لتخزينها محلياً لسماع فوري بلا تغطية إنترنت.
                      </p>
                    </div>
                  ) : (
                    downloads.map((item) => {
                      const fileSizeMB = (item.blob.size / (1024 * 1024)).toFixed(2);
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={item.id}
                          className="bg-slate-50/70 dark:bg-[#07130F] border border-slate-100 dark:border-[#122A21] p-4 rounded-2xl flex items-center justify-between text-right gap-3"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => togglePlay(item)}
                              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all scale-100 active:scale-95 shrink-0 ${
                                isPlaying === item.id 
                                  ? 'bg-red-500 shadow-md shadow-red-500/10 animate-pulse' 
                                  : 'bg-[#0D5C4D] hover:bg-emerald-800 shadow-md shadow-emerald-500/5'
                              }`}
                            >
                              {isPlaying === item.id ? <Pause size={18} /> : <Play size={18} className="mr-0.5" />}
                            </button>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-850 dark:text-white truncate">{item.surahName}</h4>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">القراء: {item.reciterName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono tracking-wider bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-emerald-950 px-2 py-1 rounded-lg text-slate-500 font-extrabold">
                              {fileSizeMB} MB
                            </span>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-2 text-red-500 hover:bg-red-55/10 bg-red-500/5 dark:bg-red-500/10 rounded-xl hover:text-red-700 transition-colors shrink-0"
                              title="حذف الملف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recommendation Box of Compression WebM Mono / Opus */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-3.5 text-right">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-emerald-950/20 pb-2.5">
                  <TrendingDown size={18} className="text-amber-500" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">تقنيات ضغط التلاوة الذكية (Acoustic Compression)</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-1">
                  نحن نوظف تقنيات رياضية متكاملة لضغط الملفات الصوتية دون التأثير على مخارج الحروف والخشوع في نبرة الصوت:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] leading-relaxed">
                  <div className="p-3 bg-slate-50 dark:bg-[#07130F] rounded-2xl border border-slate-150-none dark:border-emerald-950/15">
                    <h5 className="font-bold text-[#C59F60] mb-1">ترميز Opus الصوتي الفائق</h5>
                    <p className="text-slate-600 dark:text-slate-350">
                      يُفضّل التطبيق تحزيم التلاوات بصيغة <strong>Opus</strong> أو <strong>WebM Mono 32kbps</strong> الصوتية؛ حيث توفر خفضاً جذرياً في المساحة يصل إلى <strong>80%</strong> مقارنة بملفات MP3 التقليدية، مع محاكاة ممتازة للترددات العلوية وتألق مخارج التجويد.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-[#07130F] rounded-2xl border border-slate-150-none dark:border-emerald-950/15">
                    <h5 className="font-bold text-[#C59F60] mb-1">تعديل قنوات تجميع الصوت</h5>
                    <p className="text-slate-600 dark:text-slate-350">
                      نفرز مجمل تلاواتنا بقناة مفرجة واحدة <strong>(Mono)</strong> بدلاً من القنوات المجسمة الكثيفة (Stereo)، نظراً لأن مادة الصوت البشري المُنطق لا تحتاج قنوات استقطاب عريضة، مما يوفر النصف التام من استهلاك الباقات والتخزين.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: POWER / BATTERY OPTIMIZATION & AUTHENTICATION */}
          {activeTab === 'performance' && (
            <motion.div
              key="tab-perf"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Battery optimization engineering */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4 text-right">
                <div className="flex items-center gap-2.5 mb-1 border-b border-slate-50 dark:border-emerald-950/20 pb-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-500">
                    <Battery size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">تحسين البطارية واستقرار الخلفية</h3>
                    <p className="text-[10px] text-slate-500">كيف نضمن دقة الأذان والتنبيهات دون استنزاف طاقة هاتفك</p>
                  </div>
                </div>

                <div className="space-y-3.5 leading-relaxed text-xs">
                  <p className="text-slate-500">
                    من أكبر التحديات في التطبيقات الدينية حساب وتنبيه العباد بمواعيد الأذان في أوقاتها الدقيقة، لأن تشغيل خادم خلفية دائم يستيقظ مراراً يمتص طاقة معالج الهاتف. التطبيق يحل هذا رياضياً بأقصى كفاءة:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-[#07130F] p-3 rounded-2xl border border-slate-100 dark:border-emerald-950/15">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px] mb-1">⏱️ المؤقت الفلكي اللحظي الآمن</h4>
                      <p className="text-slate-500 text-[11px]">
                        نحن لا نقم بالاتصال بخوادم رصد مستمرة في الخلفية لمعرفة وقت الصلاة؛ بدلاً من ذلك، نستخدم معادلات رياضية معتمدة فلكياً تُجري جميع العمليات والاحتساب للصلوات داخلياً، مما ينهي تماماً سحب طاقة باقتك وبطاريتك.
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#07130F] p-3 rounded-2xl border border-slate-100 dark:border-emerald-950/15">
                      <h4 className="font-extrabold text-[#C59F60] text-[11px] mb-1">⚙️ تكيّف الأنظمة (اندرويد والويب)</h4>
                      <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        في بيئة أندرويد للهواتف الذكية، تُشير تصاميمنا البرمجية الموصى بها إلى استخدام الـ <strong>WorkManager API</strong> بالاقتران مع <strong>AlarmManager.setExactAndAllowWhileIdle</strong> لتجنب غلق نظام التشغيل للتنبيه مع تمكين الأجهزة من السبات التام (Doze Mode) لتوفير دقيق للطاقة.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document/Content Authenticity King Fahd Complex validation block */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4 text-right">
                <div className="flex items-center gap-2.5 mb-1 border-b border-slate-50 dark:border-emerald-950/20 pb-2.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">توثيق ونقاء المحتوى الإسلامي والآيات</h3>
                    <p className="text-[10px] text-slate-500 font-medium">سلسلة من السند المعتمد والتدقيق الإملائي والفني الخالي من الأخطاء</p>
                  </div>
                </div>

                <div className="space-y-3 leading-relaxed text-xs">
                  <div className="border-r-4 border-[#C59F60] pr-3 text-[11.5px] font-serif font-semibold text-[#0D5C4D] dark:text-emerald-400">
                    «إنّا نحنُ نزّلنا الذّكرَ وإنّا لهُ لحافظُون»
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    لحماية كلام الله تعالى وأحاديث نبينا صلى الله عليه وسلم من السقوط اللفظي أو الأخطاء الإملائية والتقنية العارضة، نتبع تصميماً معتمداً وصارماً لربط المحتوى والتحقق منه:
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-[#07130F] rounded-2xl border border-slate-100 dark:border-emerald-950/15">
                      <span className="text-base shrink-0 mt-0.5">🕋</span>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 dark:text-slate-201 text-[11px] mb-0.5">مصحف المدينة النبوية ومجمع الملك فهد</h4>
                        <p className="text-slate-600 dark:text-slate-350 text-[10.5px]">
                          نربط فهارس القرآن وسوره ونصوصه الشريفة بالرسم العثماني المعتمد في <strong>مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة</strong>، للتأكد من موافقتها التامة وبمحركات مصادقة تقارن كل آية بمطابقتها للأصل قبل حفظها التلقائي بالمتصفح.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-[#07130F] rounded-2xl border border-slate-100 dark:border-emerald-950/15">
                      <span className="text-base shrink-0 mt-0.5">📜</span>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 dark:text-slate-201 text-[11px] mb-0.5">كتب السنة الستة وغرفة التدقيق</h4>
                        <p className="text-slate-600 dark:text-slate-350 text-[10.5px]">
                          نفرز الأحاديث النبوية الشريفة من الموسوعة الحديثية الشاملة وقرارات اللجنة الدائمة ومجامع البحث الموثوقة (مثل رواية البخاري ومسلم)، مُرفقاً معها بابها وتخريجها وحكم المحدثين عليها لضمان عدم الخلط بالضعيف والموضوع.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sustainable Ad-Free Waqf/Donator Model of App */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4 text-right">
                <div className="flex items-center gap-2.5 mb-1 border-b border-slate-50 dark:border-emerald-950/20 pb-2.5">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Heart size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">نموذج الاستدامة الوقفي (خالٍ 100% من الإعلانات)</h3>
                    <p className="text-[10px] text-slate-500 font-medium">سياج من الهيبة والبركة يمنع وجود إشغار أو إعلانات تشتت خشوع المصلي</p>
                  </div>
                </div>

                <div className="space-y-3 leading-relaxed text-xs">
                  <p className="text-slate-500">
                    العديد من التطبيقات الإسلامية للأسف تضع إعلانات تجارية غريبة تضر بالجو الروحاني لتغطية تكاليف السيرفرات والتطوير. نلتزم كلياً كواحد من المبادئ الأخلاقية الراسخة بنموذج مستقل تام الأمان:
                  </p>

                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-2xl border border-emerald-500/10 text-[11px] text-slate-600 dark:text-slate-300">
                    💡 <strong>صيغة وقفية ومساهمة طوعية:</strong> يعتمد استمرار وصيانة خدمات التطبيق ومساعد "اليقين" الذكي على برامج التبرعات أو الوقف الديني المستقل وتخصيص اشتراكات كفالة فخرية لمن يرغب. هذا يمنع الإعلانات تماماً ويجعل القارئ ينعم بالصفاء من أول دقيقة يدخل فيها للتطبيق.
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-[#07130F] p-3 rounded-xl border border-slate-150-none dark:border-emerald-950/20">
                    <span className="font-bold text-[#C59F60]">الاستدامة الودية:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">مصنّف كبرنامج وقفي ديني خالص لله تعالى</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

        {/* Action Bottom to Return */}
        <div className="pt-6">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                try {
                  audioRef.current.load();
                } catch (e) {}
              }
              if (onBack) onBack();
            }}
            className="w-full py-4 bg-[#041D15] hover:bg-emerald-950 text-[#E2C392] font-extrabold font-serif rounded-2xl transition-all shadow-lg text-center text-sm border border-emerald-500/20 active:scale-[0.99]"
          >
            تأكيد والعودة للقائمة العبادية الكبرى
          </button>
        </div>

      </div>
    </div>
  );
};

export default Downloads;

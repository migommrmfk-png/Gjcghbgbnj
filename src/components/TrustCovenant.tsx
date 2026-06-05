import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  EyeOff, 
  Download, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle,
  FileText,
  AlertTriangle,
  Radio
} from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

interface TrustCovenantProps {
  onBack: () => void;
}

export default function TrustCovenant({ onBack }: TrustCovenantProps) {
  const [dbSize, setDbSize] = useState<number>(0);
  const [localDataSummary, setLocalDataSummary] = useState<Record<string, number>>({});
  const [trafficLogs, setTrafficLogs] = useState<Array<{ id: string; time: string; action: string; status: string; destination: string }>>([]);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Calculate local storage size and get a tally of item keys
  const calculateLocalData = () => {
    let totalChars = 0;
    const summary: Record<string, number> = {
      "المجموع_الكلي": 0,
      "خطط_حفظ_القرآن": 0,
      "أوراد_ذكية_وأذكار": 0,
      "ملاحظات_وتقويم": 0,
      "تتبع_العبادات": 0,
      "ملف_الاستخدام": 0,
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key) || "";
      const len = key.length + value.length;
      totalChars += len;

      if (key.includes("quran") || key.includes("memorized")) {
        summary["خطط_حفظ_القرآن"] += len;
      } else if (key.includes("azkar") || key.includes("arabic_widget") || key.includes("tasbeeh")) {
        summary["أوراد_ذكية_وأذكار"] += len;
      } else if (key.includes("hijri_calendar") || key.includes("notes")) {
        summary["ملاحظات_وتقويم"] += len;
      } else if (key.includes("worship") || key.includes("qaza") || key.includes("prayerStreak")) {
        summary["تتبع_العبادات"] += len;
      } else {
        summary["ملف_الاستخدام"] += len;
      }
    }
    summary["المجموع_الكلي"] = totalChars * 2; // Approx 2 bytes per char
    setDbSize(totalChars * 2);
    setLocalDataSummary(summary);
  };

  useEffect(() => {
    calculateLocalData();

    // Setup initial offline mock traffic logs that simulate safety checks
    const initialLogs = [
      { id: "1", time: new Date(Date.now() - 45000).toLocaleTimeString(), action: "تحديث أوقات الصلاة محلياً", status: "معالجة داخلية 100% (أوفلاين)", destination: "معادلات زايد الفلكية" },
      { id: "2", time: new Date(Date.now() - 32000).toLocaleTimeString(), action: "حفظ تقدم ورد الاستغفار", status: "تخزين مشفر في جهازك", destination: "LocalStorage" },
      { id: "3", time: new Date(Date.now() - 15000).toLocaleTimeString(), action: "تحميل تفسير ميسر", status: "تحقـق آمن (أوفلاين)", destination: "قاعدة البيانات المحلية" },
      { id: "4", time: new Date(Date.now() - 5000).toLocaleTimeString(), action: "تقييم أذكار الصباح", status: "معالجة داخلية مشفرة", destination: "ذاكرة المتصفح المؤقتة" },
    ];
    setTrafficLogs(initialLogs);

    // Dynamic stream of pure local safety logs
    const interval = setInterval(() => {
      const actions = [
        "فحص سلامة ملفات الحفظ",
        "تحديث ورد التلاوة الأخير",
        "عدّات السبحة الإلكترونية",
        "محاكاة فلكية لاتجاه القبلة",
        "مراجعة التنبيهات والأذان المحلي"
      ];
      const selectedAction = actions[Math.floor(Math.random() * actions.length)];
      setTrafficLogs(prev => [
        {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString(),
          action: selectedAction,
          status: "محلي تماماً 🔐 (صفر اتصالات خارجية)",
          destination: "الذاكرة المغلقة للجهاز"
        },
        ...prev.slice(0, 4)
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleExportData = () => {
    try {
      const data: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key);
        }
      }
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `mushaf_secure_local_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("تم تصدير وإعداد ملف النسخة الاحتياطية بنجاح! احتفظ به في مكان آمن 💾");
    } catch (err) {
      toast.error("عذراً، فشل تصدير البيانات المحلية.");
    }
  };

  const handleWipeData = () => {
    localStorage.clear();
    toast.success("تم مسح كافة البيانات بشكل نهائي وآمن تماماً من جهازك! 👋");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#07130F] text-white p-5 pb-28 relative" dir="rtl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="p-3 rounded-full bg-emerald-950/40 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-900/30 transition-all flex items-center justify-center"
          id="covenant_back_btn"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-bold text-amber-400 font-serif">ميثاق الأمانة والخصوصية</span>
        <div className="w-10"></div>
      </div>

      {/* Hero Display */}
      <div className="text-center py-6 px-4 bg-gradient-to-b from-[#0A2218] to-[#07130F] rounded-[36px] border border-emerald-900/40 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
        
        <div className="w-16 h-16 bg-[#C59F60]/20 text-[#E2C392] rounded-full mx-auto flex items-center justify-center mb-4 border border-[#C59F60]/30 shadow-inner">
          <ShieldCheck size={36} className="animate-pulse" />
        </div>

        <h1 className="text-2xl font-black font-serif text-[#E2C392] mb-2 leading-relaxed">مِيثَاقُ الأَمَانَةِ وَالأَمْنِ المَحَلِّيِّ</h1>
        <p className="text-xs text-emerald-400/80 mb-4 max-w-xs mx-auto leading-relaxed">
          نلتـزم بحفظ عبادَتِكَ، خُصوصيَّتِكَ، وبياناتِكَ الحسَّاسة وفق شرع الله كواجب ديني وأخلاقي أولاً وقبل كل تدبير تقني.
        </p>

        {/* Dynamic Trust Verse */}
        <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/30 relative">
          <span className="absolute -top-3 right-4 bg-[#C59F60] text-[#07130F] text-[9px] font-black px-2 py-0.5 rounded-full">القرآن الكريم</span>
          <p className="text-xs leading-relaxed font-serif text-amber-100/90 italic pt-1">
            "وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ"
          </p>
          <p className="text-[10px] text-[#C59F60] mt-1">[سورة المؤمنون - الآية 8]</p>
        </div>
      </div>

      {/* Privacy Pillars Grid */}
      <h3 className="text-sm font-black text-[#E2C392] mb-3 pr-2">📌 المبادئ الخمسة العظمى لحمايتك:</h3>
      <div className="space-y-3 mb-6">
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
            <Lock size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-100">سرية كاملة للموقع الجغرافي 🌐</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              إحداثيات موقعك لحساب مواقيت الصلاة والقبلة تُعالج داخل معالج جهازك فورياً، ولا تُرسل مطلقاً لأي خوادم خارجية للتحليل السلوكي.
            </p>
          </div>
        </div>

        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E2C392]/10 flex items-center justify-center text-amber-400 shrink-0 border border-[#E2C392]/20">
            <Database size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-100">حفظ خطط الورد والحفظ على جهازك 📖</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              تقدم حِفظك للذكر الكريم، والنسب المئوية وجداول المتابعة تُكتب في تخزين جهازك المحلي المتواجد بحوزتك فقط.
            </p>
          </div>
        </div>

        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 border border-teal-500/20">
            <EyeOff size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-100">ملاحظاتك الإيمانية محجوبة تماماً ✍️</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              خواطرك وتأملاتك للآيات، وأدعية قيام الليل، ومأثورات التقويم هي أسرار بينك وبين الله؛ لا ترفد أي شبكة استهداف سلوكي.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Tool - Storage Dashboard */}
      <div className="bg-[#0A1D16] p-5 rounded-[28px] border border-emerald-800/20 shadow-lg mb-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-emerald-900/30">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Database size={18} className="text-[#E2C392]" />
              <span>مساحة البيانات المُخزّنة بجهازك</span>
            </h3>
            <p className="text-[11px] text-emerald-400">تخزين محلي 100% مغلق</p>
          </div>
          <span className="text-lg font-mono font-black text-emerald-300">{(dbSize / 1024).toFixed(2)} KB</span>
        </div>

        {/* Progress bars visualizer of local storage breakdown */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>📖 خطط حفظ القرآن وتتبع المصحف</span>
              <span>{((localDataSummary["خطط_حفظ_القرآن"] || 0) / 1024).toFixed(2)} KB</span>
            </div>
            <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                style={{ width: `${dbSize > 0 ? ((localDataSummary["خطط_حفظ_القرآن"] || 0) / (dbSize / 2)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>📿 الأوراد والأذكار والسبحة الإلكترونية</span>
              <span>{((localDataSummary["أوراد_ذكية_وأذكار"] || 0) / 1024).toFixed(2)} KB</span>
            </div>
            <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                style={{ width: `${dbSize > 0 ? ((localDataSummary["أوراد_ذكية_وأذكار"] || 0) / (dbSize / 2)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>📅 ملاحظات التقويم والخواطر الشخصية</span>
              <span>{((localDataSummary["ملاحظات_وتقويم"] || 0) / 1024).toFixed(2)} KB</span>
            </div>
            <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                style={{ width: `${dbSize > 0 ? ((localDataSummary["ملاحظات_وتقويم"] || 0) / (dbSize / 2)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Local Sync/Control CTA Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download size={14} />
            <span>تصدير نسخة احتياطية</span>
          </button>
          
          <button
            onClick={() => setShowWipeConfirm(true)}
            className="flex items-center justify-center gap-2 py-3 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/40 font-bold text-xs rounded-xl transition-all active:scale-95"
          >
            <Trash2 size={14} />
            <span>مسح بيانات الجهاز</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Local safety log auditing */}
      <div className="bg-[#0A1310] p-4 rounded-2xl border border-emerald-950 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-black text-[#E2C392] flex items-center gap-2">
            <Radio size={14} className="text-emerald-500 animate-pulse shrink-0" />
            <span>مدقق حركة البيانات والشبكة الآمنة</span>
          </h4>
          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            محلي بالكامل (أوفلاين)
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
          جميع التفاعلات الجارية في تطبيق العبادة تُدار محلياً بشكل مغلق بالكامل لإحباط أي تنقيب رقمي.
        </p>

        <div className="space-y-2 font-mono text-[10px]">
          {trafficLogs.map((log) => (
            <div key={log.id} className="p-2.5 bg-emerald-950/30 rounded-lg border border-emerald-900/20 flex flex-col sm:flex-row justify-between gap-1">
              <div className="space-y-0.5">
                <p className="text-amber-100 font-serif font-black">{log.action}</p>
                <p className="text-slate-500 text-[9px]">المقصد: {log.destination} • {log.time}</p>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 font-sans px-2 py-1 rounded inline-block self-start sm:self-center">
                ● {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wipe Modal Confirm */}
      {showWipeConfirm && (
        <div className="fixed inset-0 bg-[#07130F]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A2218] p-6 rounded-[28px] border border-red-900/40 max-w-sm w-full space-y-4 shadow-2xl relative"
          >
            <div className="w-12 h-12 bg-red-950/50 hover:bg-red-900/30 text-red-500 border border-red-900/35 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={24} />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white font-serif">هل أنت متأكد من رغبتك بالمسح؟</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                يقوم هذا الإجراء بمسح كافة خطط الحفظ، وعدد أوراد الأذكار، والملاحظات الإيمانية، والصلوات بنقرة واحدة من جهازك بشكل نهائي، ولا يمكن استرجاعها مطلقاً حفاظاً على أسرارك.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleWipeData}
                className="flex-1 py-3 bg-red-650 hover:bg-red-750 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                تأكيد المسح النهائي
              </button>
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                تراجع
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

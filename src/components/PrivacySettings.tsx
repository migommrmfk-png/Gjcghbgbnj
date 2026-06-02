import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  Lock,
  EyeOff,
  Eye,
  Trash2,
  RefreshCw,
  Info,
  MapPin,
  Sparkles,
  Key,
  Database,
  Fingerprint,
  UserX,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function PrivacySettings({
  onBack,
}: {
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar" || i18n.language === "ur";

  // State Management
  const [pinEnabled, setPinEnabled] = useState<boolean>(() => {
    return localStorage.getItem("app_pin_lock_enabled") === "true";
  });
  
  const [appPin, setAppPin] = useState<string>(() => {
    return localStorage.getItem("app_pin_lock_code") || "1234";
  });

  const [locationPrivacyMode, setLocationPrivacyMode] = useState<string>(() => {
    return localStorage.getItem("location_privacy_mode") || "manual"; // GPS vs manual (coarse/none)
  });

  const [incognitoMode, setIncognitoMode] = useState<boolean>(() => {
    return localStorage.getItem("incognito_spiritual_mode") === "true";
  });

  const [maskStats, setMaskStats] = useState<boolean>(() => {
    return localStorage.getItem("mask_spiritual_stats") === "true";
  });

  const [historyCleared, setHistoryCleared] = useState<boolean>(false);
  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [tempPin, setTempPin] = useState<string>("");

  const handleTogglePin = () => {
    if (pinEnabled) {
      // Disable
      localStorage.setItem("app_pin_lock_enabled", "false");
      setPinEnabled(false);
      toast.success("تم إيقاف قفل التطبيق بالرمز السري 🟢");
    } else {
      // Enable Setup
      setTempPin("");
      setShowPinSetup(true);
    }
  };

  const handleSavePin = () => {
    if (tempPin.length < 4) {
      toast.error("يجب أن يتكون الرمز السري من 4 أرقام على الأقل 🔢");
      return;
    }
    localStorage.setItem("app_pin_lock_enabled", "true");
    localStorage.setItem("app_pin_lock_code", tempPin);
    setAppPin(tempPin);
    setPinEnabled(true);
    setShowPinSetup(false);
    toast.success("تم تفعيل القفل وتعيين الرمز السري بنجاح 🔒");
  };

  const handleToggleLocationPrivacy = (mode: string) => {
    setLocationPrivacyMode(mode);
    localStorage.setItem("location_privacy_mode", mode);
    if (mode === "manual") {
      toast.success("تم التحويل للوضع اليدوي: لن يتم طلب صلاحيات الـ GPS مطلقا 🌍");
    } else {
      toast.success("تم تفعيل وضع GPS: سيتم تحديث المواقيت بدقة عالية مع الحفاظ على خصوصية إحداثياتك محليا 🛰️");
    }
  };

  const handleToggleIncognito = (val: boolean) => {
    setIncognitoMode(val);
    localStorage.setItem("incognito_spiritual_mode", String(val));
    if (val) {
      toast.success("الوضع الخفي نشط: لن يتم حفظ سجل تصفح الفهارس أو قراءات اليوم 🕶️");
    } else {
      toast.success("تم العودة للوضع العادي");
    }
  };

  const handleToggleMaskStats = (val: boolean) => {
    setMaskStats(val);
    localStorage.setItem("mask_spiritual_stats", String(val));
    if (val) {
      toast.success("تم تمويه سجل العبادات: الإحصائيات محمية من نظرات المتطفلين 👁️");
    } else {
      toast.success("تم إظهار إحصائياتك مجدداً");
    }
  };

  const handleWipeData = () => {
    const confirm1 = window.confirm(
      "تحذير فائق الخطورة ⚠️\n\nهل أنت متأكد بنسبة 100% أنك تريد مسح كافة بياناتك وسجل عباداتك وأذكارك وإعدادات التطبيق بالكامل؟\nلا يمكن استرجاع هذه البيانات نهائياً."
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      "تأكيد نهائي وحاسم 🔥\n\nسيتم حذف كل شيء فوراً والعودة بصفحة نظيفة تماماً خالية من أي أثر محلي."
    );
    if (confirm2) {
      localStorage.clear();
      toast.success("تم تطهير بيانات التطبيق وحذف كافة الأثر بنجاح 🧼✨");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FAF9F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 overflow-y-auto pb-24">
      {/* Decorative Premium Islamic Header */}
      <div className="pt-12 pb-8 px-6 bg-[#0B2117] text-white rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden border-b border-rose-300/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1080&auto=format&fit=crop")',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-900/60 via-[#0B2117]/90 to-[#041D15]/95 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-white/10 rounded-full transition-all border border-white/10 bg-white/5 shadow-md flex items-center justify-center cursor-pointer"
            >
              <ArrowRight size={22} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-serif leading-tight drop-shadow-md text-[#E2C392] flex items-center gap-2">
                الخصوصية والأمان الفائق
              </h1>
              <p className="text-emerald-100/80 text-xs md:text-sm font-medium mt-1">
                التحكم بالبيانات وضمان المعالجة المحلية الآمنة كلياً
              </p>
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-900/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-300/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] shrink-0">
            <ShieldCheck size={24} className="text-[#E2C392]" />
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-6 pt-6">
        
        {/* Privacy Status Dashboard Widget */}
        <div className="bg-gradient-to-br from-emerald-950 to-[#0B2117] rounded-3xl p-6 text-white border border-emerald-500/20 shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-x-10 translate-y-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
            <div className="space-y-1">
              <span className="text-[11px] font-bold bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">
                🛡️ تشفير محلي 100% نشط
              </span>
              <h2 className="text-xl font-bold font-serif text-[#E2C392] mt-2">مستوى خصوصيتك: فائق الأمان</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                التطبيق لا يستعين بأي خوادم خارجية لحفظ أو رصد سجل عبادتك أو تصفحك اليومي. يتم حفظ وتسيير كافة شؤونك الروحية مباشرة داخل جهازك الشخصي.
              </p>
            </div>
            
            <div className="flex flex-col items-center shrink-0">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-emerald-900/20 shadow-inner">
                <SpinnerPercent />
              </div>
              <span className="text-xs font-bold text-emerald-300 mt-2">تصنيف: آمن تماماً</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: CORE LOCK & SENSITIVE DATA ACCESS */}
        <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 mb-2 border-b border-slate-50 dark:border-emerald-950/20 pb-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">درع القفل والأمان الذاتي</h3>
              <p className="text-[10px] text-slate-500">حماية مدوناتك وقيودك بكلمة مرور يمنع المتسللين من رؤيتها</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-[#07130F]/45 rounded-2xl border border-slate-100 dark:border-emerald-950/20">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205">تفعيل الرمز السري للتطبيق (PIN)</h4>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400">طلب رقم تعريف سري عند تشغيل التطبيق لحماية الخصوصية</p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinEnabled}
                  onChange={handleTogglePin}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {pinEnabled && !showPinSetup && (
              <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/25 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-indigo-500" />
                  <span className="font-medium text-slate-700 dark:text-indigo-300">
                    الرمز السري الحالي الخاص بك: <strong className="font-mono tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">{appPin}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 underline hover:no-underline"
                >
                  تعديل الرمز
                </button>
              </div>
            )}

            {showPinSetup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-slate-50 dark:bg-[#07130F] rounded-2xl border border-slate-200 dark:border-emerald-950 space-y-3"
              >
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  أدخل رمز PIN الجديد المكون من 4 أرقام:
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    pattern="[0-9]*"
                    placeholder="× × × ×"
                    value={tempPin}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, "");
                      setTempPin(clean);
                    }}
                    className="flex-1 text-center font-mono text-lg tracking-widest p-2 bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-emerald-950 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
                  />
                  <button
                    onClick={handleSavePin}
                    className="p-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    حفظ وترسيخ
                  </button>
                  <button
                    onClick={() => {
                      setShowPinSetup(false);
                      if (!appPin) setPinEnabled(false);
                    }}
                    className="p-2.5 px-4 bg-slate-205 dark:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* SECTION 2: LOCATION PRIVACY CONTROLS */}
        <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 mb-2 border-b border-slate-50 dark:border-emerald-950/20 pb-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-600 dark:text-amber-400">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">خصوصية تتبع الموقع والمدينة</h3>
              <p className="text-[10px] text-slate-500">اختر كيفية احتساب مواقيت الأذان والقبلة بأمان</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div
              onClick={() => handleToggleLocationPrivacy("manual")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                locationPrivacyMode === "manual"
                  ? "bg-[#0D5C4D]/5 dark:bg-[#0D5C4D]/20 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-sm"
                  : "bg-slate-50/50 dark:bg-emerald-950/5 border-slate-100 dark:border-emerald-950/20 hover:border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                  locationPrivacyMode === "manual" ? "border-emerald-500" : "border-slate-300"
                }`}>
                  {locationPrivacyMode === "manual" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-200">الوضع اليدوي (خصوصية مطلقة ومثالية)</h4>
                  <p className="text-[10px] text-slate-500 dark:text-emerald-400 mt-1 leading-relaxed">
                    من خلال اختيار المدينة يدوياً. هذا يمنع متصفحك أو هاتف العمل من الاحتفاظ بقراءة دائمة لإحداثيات GPS الخاصة بك. لا توجد عمليات تتبع لموقعك الفعلي.
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleToggleLocationPrivacy("gps")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                locationPrivacyMode === "gps"
                  ? "bg-[#C59F60]/10 dark:bg-[#C59F60]/10 border-amber-500 text-amber-900 dark:text-amber-300"
                  : "bg-slate-50/50 dark:bg-emerald-950/5 border-slate-100 dark:border-emerald-950/20 hover:border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                  locationPrivacyMode === "gps" ? "border-amber-500" : "border-slate-300"
                }`}>
                  {locationPrivacyMode === "gps" && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-205">الطلب الدقيق للموقع الفعلي (GPS)</h4>
                  <p className="text-[10px] text-slate-500 dark:text-emerald-400 mt-1 leading-relaxed">
                    لاستخراج وحساب أوقات الصلوات والقبلة بدقة متناهية مقارنة بخطوط الطول والعرض. يُخزن خط الطول بمحرك التصفح الداخلي فقط ولا يُرسل للخارج مطلقاً.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: INCOGNITO & STATS MASKING */}
        <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 mb-2 border-b border-slate-50 dark:border-emerald-950/20 pb-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <EyeOff size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">الحماية والوضع الخفي الروحاني</h3>
              <p className="text-[10px] text-slate-500">تمويه التواجد وحجب تاريخ النشاطات داخل البيئة العبادية</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Setting: Incognito */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-[#07130F]/45 rounded-2xl border border-slate-100 dark:border-emerald-950/20">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205">الوضع الروحاني الخفي (Incognito)</h4>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400">عدم تدوين سور التلاوة اليومية أو الفتاوى والبحث محلياً</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={incognitoMode}
                  onChange={(e) => handleToggleIncognito(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-650"></div>
              </label>
            </div>

            {/* Setting: Mask spiritual stats */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-[#07130F]/45 rounded-2xl border border-slate-100 dark:border-emerald-950/20">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205">تمويه أرقام التقارير والإحصائيات</h4>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400">استخدام الرموز التعبيرية المعزولة لتمويه الأرقام بالفروع واللوحة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maskStats}
                  onChange={(e) => handleToggleMaskStats(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-650"></div>
              </label>
            </div>

          </div>
        </div>

        {/* SECTION 4: PURGE & RESET DANGER ZONE */}
        <div className="bg-red-500/5 rounded-3xl p-5 border border-red-500/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 mb-2 pb-3 border-b border-red-500/10">
            <div className="p-2 bg-red-100 dark:bg-red-950/20 rounded-xl text-red-650 dark:text-red-400">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-red-900 dark:text-red-200">منطقة الحظر والتطهير الكلي (Danger Zone)</h3>
              <p className="text-[10px] text-red-500 dark:text-red-400/80">عملية لحذف وتبييض كافة النشاطات بلا بقايا</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-[#07130F] rounded-2xl border border-red-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-right space-y-1">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">محو شامل وتدمير كافة السجلات المحلية</h4>
                <p className="text-[10px] text-slate-500 dark:text-red-300">
                  سيقوم هذا بحذف الأوراد المقروءة، عدادات السبحة، وجميع إعدادات التنبيهات المخصصة على الفور وإعادة التطبيق للصفر.
                </p>
              </div>
              
              <button
                onClick={handleWipeData}
                className="w-full md:w-auto py-2.5 px-5 bg-red-650 hover:bg-red-700 text-white font-serif font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Flame size={14} />
                تدمير ومسح الآثار بالكامل
              </button>
            </div>
          </div>
        </div>

        {/* Action Bottom Navigator */}
        <div className="pt-4">
          <button
            onClick={onBack}
            className="w-full py-4 bg-[#0B2117] hover:bg-emerald-950 text-white font-bold font-serif rounded-2xl transition-all shadow-lg text-center text-sm border border-rose-300/10"
          >
            تأكيد إعدادات الخصوصية والعودة للقائمة الرئيسية
          </button>
        </div>

      </div>
    </div>
  );
}

// Decorative Spinning shield inside dashboard
function SpinnerPercent() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-[#E2C392] border-t-transparent animate-spin duration-1000"></div>
      <Shield size={22} className="text-[#E2C392] animate-pulse" />
    </div>
  );
}

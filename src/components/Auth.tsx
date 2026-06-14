import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LogIn, 
  User, 
  AlertCircle, 
  Loader, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";
import toast from "react-hot-toast";

// Beautiful, extremely subtle Islamic geometric background star
const IslamicGeometricPattern = () => (
  <svg 
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] opacity-[0.03] text-emerald-500 pointer-events-none select-none" 
    viewBox="0 0 100 100" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="0.15"
  >
    <polygon points="50,0 65,35 100,50 65,65 50,100 35,65 0,50 35,35" />
    <polygon points="50,15 60,40 85,50 60,60 50,85 41,60 15,50 41,40" transform="rotate(22.5 50 50)" />
    <polygon points="50,25 56,44 75,50 56,56 50,75 44,56 25,50 44,44" transform="rotate(45 50 50)" />
    <circle cx="50" cy="50" r="12" />
    <circle cx="50" cy="50" r="3" fill="currentColor" />
  </svg>
);

// Quranic reflections that set a serene spiritual and professional atmosphere
const REFLECTIONS = [
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", surah: "سورة الرعد • الآية ٢٨" },
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", surah: "سورة الشرح • الآية ٦" },
  { text: "إِنَّ رَبِّي قَرِيبٌ مُّجِيبٌ", surah: "سورة هود • الآية ٦١" },
  { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", surah: "سورة الطلاق • الآية ٢" },
  { text: "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ", surah: "سورة الفرقان • الآية ٥٨" },
];

export default function Auth({ onBack }: { onBack?: () => void }) {
  const { 
    signInAsGuest, 
    signIn, 
    signUp, 
    resetPassword, 
    signInWithGoogle, 
    error: authError 
  } = useAuth();
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentReflection, setCurrentReflection] = useState({ text: "", surah: "" });

  // Load a fixed reflection based on day or random on mount to prevent layout shifts
  useEffect(() => {
    const day = new Date().getDay();
    setCurrentReflection(REFLECTIONS[day % REFLECTIONS.length]);
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("الرجاء إدخال البريد الإلكتروني للمتابعة.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (resetPassword) {
         await resetPassword(email);
         setResetSent(true);
         toast.success("تم إرسال رابط استعادة كلمة المرور بنجاح.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "فشل إرسال طلب تذكير كلمة المرور. يرجى تكرار المحاولة.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      if (signInWithGoogle) {
        await signInWithGoogle();
        if (onBack) onBack();
      } else {
        throw new Error("خدمة تسجيل الدخول بواسطة Google غير متوفرة حالياً.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "تعذر إتمام تسجيل الدخول عبر حساب Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }
    if (isSignUp && !name) {
      setError("يرجى إدخال اسمك الكريم لتخصيص تجربتك.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const data = await signUp(email, password, name);
        if (data?.user && !data?.session) {
          setError("");
          setResetSent(false);
          toast.success("تم إنشاء حسابك! يرجى مراجعة بريدك لتفعيل الحساب.");
          setIsSignUp(false); // Switch to login state
        } else {
          if (onBack) onBack();
        }
      } else {
        await signIn(email, password);
        if (onBack) onBack();
      }
    } catch (err: any) {
      console.error(err);
      let msg = err?.message || "حدث خطأ غير متوقع. يرجى إعادة المحاولة.";
      if (msg.includes("Invalid login credentials") || msg.includes("auth/invalid-credential")) {
        msg = "بيانات الدخول غير صحيحة. يرجى التحقق من صحة بريدك الإلكتروني ورمز المرور.";
      } else if (msg.includes("User already registered") || msg.includes("already registered") || msg.includes("auth/email-already-in-use")) {
        msg = "البريد الإلكتروني المدخل مسجل مسبقاً. حاول تسجيل الدخول.";
      } else if (msg.includes("Email not confirmed")) {
        msg = "يرجى تفعيل بريدك الإلكتروني عبر الرابط المرسل إليك مسبقاً.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "كلمة المرور ضعيفة جداً. يجب ألا تقل عن 6 خانات.";
      } else if (msg.includes("auth/invalid-email")) {
        msg = "صيغة البريد الإلكتروني غير صحيحة.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInAsGuest();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      let msg = err?.message || "تعذر الدخول بصفة زائر.";
      if (msg.includes("Anonymous Sign-ins are disabled") || msg.includes("provider is not enabled")) {
         msg = "بوابة المتابعة كزائر غير مفعلة، يرجى التسجيل ببريدك الإلكتروني.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth_screen_wrapper"
      className="max-w-md mx-auto min-h-screen flex flex-col justify-between py-10 px-6 relative overflow-hidden bg-[#07130F] font-sans text-slate-100"
      dir="rtl"
    >
      {/* Premium Subtle Vector Accent Art Cover */}
      <div 
        id="arabic_art_bg"
        className="absolute inset-0 bg-cover bg-center opacity-[0.035] mix-blend-screen pointer-events-none select-none" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=2074&auto=format&fit=crop")' }}
      />
      
      {/* High-end design visual layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07130F] via-[#050e0b] to-[#030907] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none" />

      {/* Islamic Star Vector Graphic Background (Extremely Clean) */}
      <IslamicGeometricPattern />

      {/* Header element */}
      <div className="w-full flex items-center justify-between relative z-20">
        {onBack ? (
          <motion.button
            id="auth_back_btn"
            whileHover={{ scale: 1.03, x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowRight size={18} />
          </motion.button>
        ) : <div className="w-10" />}

        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Logo className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-serif font-semibold text-white tracking-widest text-lg">يقين</span>
        </div>
        
        <div className="w-10" />
      </div>

      {/* Primary form wrapper */}
      <div className="relative z-10 my-auto py-8">
        <div className="text-center mb-8 select-none">
          <h1 className="text-3xl font-bold text-white mb-2 font-serif tracking-tight">
            بوابة الوصول الإسلامي
          </h1>
          <p className="text-emerald-400/60 text-xs font-medium tracking-wide">
            منصتك المتكاملة لتنظيم العبادات وتلاوة كتاب الله الكريم
          </p>
        </div>

        {/* Minimalist Solid Card Container */}
        <div className="bg-[#0b1b16]/60 border border-emerald-950/40 backdrop-blur-md rounded-2xl p-6 shadow-xl w-full">
          
          {/* Tab Selector Buttons */}
          {!isForgotPassword && (
            <div className="bg-[#050f0c] rounded-xl p-1 mb-6 flex relative border border-emerald-950/60 select-none">
              <div 
                className={`absolute top-1 bottom-1 ${isSignUp ? 'left-1 w-[48%]' : 'right-1 w-[48%]'} rounded-lg bg-emerald-600/95 shadow-md transition-all duration-300 ease-in-out`}
              />
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(""); }}
                className={`flex-1 text-center py-2 rounded-lg font-medium text-xs transition-all duration-300 relative z-10 ${!isSignUp ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(""); }}
                className={`flex-1 text-center py-2 rounded-lg font-medium text-xs transition-all duration-300 relative z-10 ${isSignUp ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                إنشاء حساب جديد
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isForgotPassword ? (
              <motion.div
                key="forgot-password-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-white mb-1">
                    استعادة كلمة المرور
                  </h2>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    سيصلك رابط مخصص لتعيين كلمة مرور جديدة بشكل آمن على بريدك الشخصي.
                  </p>
                </div>

                {resetSent ? (
                  <div className="text-center bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-xl">
                    <p className="text-emerald-400 font-bold mb-1 shadow-sm">تم إرسال الرابط!</p>
                    <p className="text-emerald-500/80 text-[11px] leading-relaxed">
                      تفقد صندوق الوارد أو البريد العشوائي (Spam) للمتابعة.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                        <Mail size={16} />
                      </div>
                      <input
                        id="auth_reset_email"
                        type="email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="البريد الإلكتروني"
                        className="w-full bg-[#050f0c] border border-emerald-950 focus:border-emerald-500/50 rounded-xl pr-12 pl-4 py-3 text-slate-100 placeholder:text-slate-600 text-xs focus:ring-0 focus:outline-none transition-all text-right"
                        disabled={loading}
                        dir="ltr"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-950/10 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader className="animate-spin text-white" size={16} />
                      ) : (
                        "إرسال تعليمات الاستعادة"
                      )}
                    </button>
                  </form>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetSent(false);
                      setError("");
                    }}
                    className="text-emerald-400 text-[11px] font-semibold hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    العودة لصفحة الدخول الأساسية
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={isSignUp ? "signup-form" : "login-form"}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {/* Name Input for Signup */}
                  {isSignUp && (
                    <div className="relative">
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                        <User size={16} />
                      </div>
                      <input
                        id="auth_signup_name"
                        type="text"
                        value={name}
                        required
                        onChange={(e) => setName(e.target.value)}
                        placeholder="الاسم الكريم"
                        className="w-full bg-[#050f0c] border border-emerald-950 focus:border-emerald-500/50 rounded-xl pr-12 pl-4 py-3 text-slate-100 placeholder:text-slate-600 text-xs focus:ring-0 focus:outline-none transition-all text-right"
                        disabled={loading}
                        dir="auto"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div className="relative">
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                      <Mail size={16} />
                    </div>
                    <input
                      id="auth_login_email"
                      type="email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      className="w-full bg-[#050f0c] border border-emerald-950 focus:border-emerald-500/50 rounded-xl pr-12 pl-4 py-3 text-slate-100 placeholder:text-slate-600 text-xs focus:ring-0 focus:outline-none transition-all text-right"
                      disabled={loading}
                      dir="ltr"
                    />
                  </div>

                  {/* Password with visible toggle */}
                  <div className="relative">
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                      <Lock size={16} />
                    </div>
                    <input
                      id="auth_login_password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="كلمة المرور"
                      className="w-full bg-[#050f0c] border border-emerald-950 focus:border-emerald-500/50 rounded-xl pr-12 pl-12 py-3 text-slate-100 placeholder:text-slate-600 text-xs focus:ring-0 focus:outline-none transition-all text-right"
                      disabled={loading}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-4 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Forgot Password Trigger */}
                  {!isSignUp && (
                    <div className="text-left select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError("");
                        }}
                        className="text-slate-500 text-[10px] hover:text-emerald-400 transition-colors"
                      >
                        نسيت رمز الدخول الخاص بك؟
                      </button>
                    </div>
                  )}

                  {/* Submit Action */}
                  <button
                    type="submit"
                    disabled={loading || !email || !password || (isSignUp && !name)}
                    className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 shadow-md shadow-emerald-950/10"
                  >
                    {loading ? (
                      <Loader className="animate-spin text-white" size={16} />
                    ) : (
                      <>
                        <LogIn size={15} />
                        {isSignUp ? "تسجيل وأداء العبادة" : "دخول آمن وبدء الاستخدام"}
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation/Error alerts */}
          <AnimatePresence>
            {(error || authError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="rounded-xl p-3 flex items-start gap-2 text-[11px] bg-red-950/30 border border-red-900/40 text-red-300">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-right flex-1">{error || authError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alternative Authentications */}
          {!isForgotPassword && (
            <>
              <div className="flex items-center gap-4 my-4 select-none">
                <div className="flex-1 h-px bg-emerald-950/40" />
                <span className="text-slate-500 text-[10px] tracking-wider shrink-0">طرق دخول إضافية</span>
                <div className="flex-1 h-px bg-emerald-950/40" />
              </div>

              <div className="space-y-2">
                {/* Genuine Sign In via Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-medium text-[11px] text-slate-200 bg-[#050f0c] hover:bg-emerald-950/30 border border-emerald-950 hover:border-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>الدخول المباشر بحساب Google</span>
                </button>

                {/* Secure Anonymous Fast Login */}
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-[11px] text-emerald-400 bg-emerald-500/[0.02] border border-emerald-500/10 hover:bg-emerald-500/[0.05] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>الاستمرار السريع وزيارة التطبيق</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Daily Spiritual Uplift banner - clean, publisher grade */}
      {currentReflection.text && (
        <div className="relative z-10 w-full text-center bg-emerald-950/[0.04] border border-emerald-500/[0.03] rounded-xl px-4 py-3 backdrop-blur-sm mt-3 select-none">
          <div className="text-emerald-500/10 flex justify-center mb-1">
            <BookOpen size={18} />
          </div>
          <p className="text-emerald-100/70 text-xs tracking-wide font-medium leading-relaxed font-serif px-2">
            " {currentReflection.text} "
          </p>
          <span className="block text-[9px] text-slate-500 font-medium mt-1">
            {currentReflection.surah}
          </span>
        </div>
      )}

      {/* Footer copyright - highly stylized, authentic, minimalist */}
      <div className="relative z-10 text-center text-slate-600 font-medium text-[9px] mt-4 tracking-wider select-none">
        تطبيق يقين للهواتف والأجهزة اللوحية • جميع الحقوق محفوظة
      </div>
    </div>
  );
}

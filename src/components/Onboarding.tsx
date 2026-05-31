import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Compass, Heart, Moon, Star, ArrowLeft, Clock, CheckCircle2, Radio, Calendar, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestPermissions = async () => {
    try {
      if ('Notification' in window) {
        await Notification.requestPermission();
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(() => {}, () => {});
      }
    } catch (e) {
      console.error("Permission request failed", e);
    }
    onComplete();
  };

  const steps = [
    {
      title: 'مرحبًا بك في "يقين"',
      desc: "تطبيق إسلامي رائد وآمن يساعدك على توثيق علاقتك بالله وتنظيم عبادتك اليومية في بيئة إسلامية مميزة.",
      icon: (
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[#eab308]/10 rounded-full blur-3xl animate-pulse"></div>
          <motion.div 
            animate={{ y: [0, -6, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex flex-col items-center justify-center"
          >
            <Logo className="w-48 h-48 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
          </motion.div>
        </div>
      ),
      features: ["بيئة آمنة للمحتوى الهادف", "حسابات موثقة وبطاقات حماية للأطفال", "فرص تسميع وتلاوة مباشرة"]
    },
    {
      title: "القرآن الكريم كامل",
      desc: "اقرأ واستمع للقرآن الكريم بأصوات خاشعة خالية من الانقطاع، مع محرك تتبع ذكي لوردك الشخصي.",
      icon: (
        <div className="relative w-48 h-48 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"></div>
          <motion.div 
            animate={{ y: [0, -8, 0], rotateY: [0, 5, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            {/* Custom 3D Matte Quran open book drawing glowing upwards */}
            <svg viewBox="0 0 120 120" className="w-36 h-36 drop-shadow-[0_12px_24px_rgba(16,185,129,0.3)]">
              <defs>
                <linearGradient id="quranCover" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#047857" />
                  <stop offset="100%" stopColor="#064e3b" />
                </linearGradient>
                <linearGradient id="quranPages" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fefefe" />
                  <stop offset="50%" stopColor="#f3f4f6" />
                  <stop offset="100%" stopColor="#e5e7eb" />
                </linearGradient>
                <linearGradient id="glowEffect" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Upward Glow emitting from the center */}
              <ellipse cx="60" cy="50" rx="30" ry="40" fill="url(#glowEffect)" className="animate-pulse" />
              
              {/* Quran Book Stand (Rehal) */}
              <path d="M25,85 L95,85 L85,95 L35,95 Z" fill="#78350f" />
              <path d="M40,82 L80,82 L75,87 L45,87 Z" fill="#451a03" />

              {/* Book Cover Backing */}
              <path d="M15,75 L55,80 L60,82 L65,80 L105,75 V60 L60,67 L15,60 Z" fill="url(#quranCover)" />

              {/* Thick Book Pages depth */}
              <path d="M18,58 L57,63 L60,64 L63,63 L102,58 C103,68 102,71 102,71 L63,77 L60,78 L57,77 L18,71 Z" fill="#d1d5db" />
              
              {/* Top Pages (Open) */}
              <path d="M20,53 C38,57 55,59 58,60 V73 C55,72 38,70 20,66 Z" fill="url(#quranPages)" />
              <path d="M100,53 C82,57 65,59 62,60 V73 C65,72 82,70 100,66 Z" fill="url(#quranPages)" />

              {/* Gold Ornament circle in middle of the pages */}
              <path d="M35,62 C37,60 41,60 43,62" stroke="#eab308" strokeWidth="1.5" fill="none" />
              <path d="M85,62 C83,60 79,60 77,62" stroke="#eab308" strokeWidth="1.5" fill="none" />
              
              <circle cx="39" cy="62" r="3" fill="#eab308" />
              <circle cx="81" cy="62" r="3" fill="#eab308" />

              {/* Decorative Ribbon Bookmark */}
              <path d="M60,64 L60,88 L57,85 L54,88" fill="#dc2626" />
            </svg>
          </motion.div>
        </div>
      ),
      features: ["تلاوة عصرية سلسة", "تفسير مفصل للكلمات", "تحديد مكان انتهاء الورد", "مصحف تفاعلي مستدير"]
    },
    {
      title: "مواقيت الصلاة الدقيقة",
      desc: "انتظر الصلاة وتأمل عظيم الأجر؛ تعرف على المواقيت المحدثة لمكانك الحالي مع تنبيهات صوتية للأذان.",
      icon: (
        <div className="relative w-48 h-48 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-indigo-550/10 rounded-full blur-2xl"></div>
          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            {/* Hourglass digital smart design with rising stars inside */}
            <svg viewBox="0 0 120 120" className="w-36 h-36 drop-shadow-[0_12px_24px_rgba(245,158,11,0.2)]">
              <defs>
                <linearGradient id="glassBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#312e81" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
                <linearGradient id="sandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              
              {/* Wooden Frames (Islamic arched look) */}
              <path d="M25,18 H95 A5,5 0 0,1 100,23 V28 A5,5 0 0,1 95,33 H25 A5,5 0 0,1 20,28 V23 A5,5 0 0,1 25,18 Z" fill="url(#glassBorder)" />
              <path d="M25,87 H95 A5,5 0 0,1 100,92 V97 A5,5 0 0,1 95,102 H25 A5,5 0 0,1 20,97 V92 A5,5 0 0,1 25,87 Z" fill="url(#glassBorder)" />

              {/* Main Connecting Glass Body */}
              <path d="M30,33 C30,55 52,60 55,60 C52,60 30,65 30,87 H90 C90,65 68,60 65,60 C68,60 90,55 90,33 Z" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeOpacity="0.4" />
              
              {/* Golden Sand on Top (half full) */}
              <path d="M32,35 C32,50 55,54 55,59 C65,54 88,50 88,35 Z" fill="url(#sandGrad)" fillOpacity="0.4" />
              
              {/* Falling Drip of Sand */}
              <line x1="60" y1="58" x2="60" y2="82" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" strokeLinecap="round" />

              {/* Sand accumulating on bottom */}
              <path d="M32,85 C32,71 52,70 60,70 C68,70 88,71 88,85 Z" fill="url(#sandGrad)" />

              {/* Rising Star Icons (Instead of sand going down, turning into rising stars) */}
              {/* Sparkle 1 */}
              <g>
                <path d="M70,45 L71,48 L74,48 L71.5,50 L72.5,53 L70,51 L67.5,53 L68.5,50 L66,48 L69,48 Z" fill="#fbbf24" />
              </g>
              {/* Sparkle 2 */}
              <g>
                <path d="M48,38 L49,41 L52,41 L49.5,43 L50.5,46 L48,44 L45.5,46 L46.5,43 L44,41 L47,41 Z" fill="#fbbf24" />
              </g>
              {/* Sparkle 3 (rising in bottom chamber) */}
              <g>
                <path d="M55,70 L56,72 L58,72 L56.5,73.5 L57.5,75.5 L55,74.5 L52.5,75.5 L53.5,73.5 L52,72 L54,72 Z" fill="#fef08a" />
              </g>
            </svg>
          </motion.div>
        </div>
      ),
      features: ["حساب إحداثي دقيق", "تنبيهات صوتية بالأذان", "عداد تنازلي للصلاة التالية", "أوقات صيام تطوعية"]
    },
    {
      title: "البيئة الآمنة الواقية",
      desc: "حماية تامة من التشوهات الفقهية عبر مكتبة الفتاوى الرسمية وفلترة المنشورات من الأنس الطائش.",
      icon: (
        <div className="relative w-48 h-48 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <motion.div 
            animate={{ scale: [1, 1.03, 1], rotate: [0, 2, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            {/* Safe environment: Crystalline protective shield with concentric Islamic lines */}
            <svg viewBox="0 0 120 120" className="w-36 h-36 drop-shadow-[0_12px_24px_rgba(16,185,129,0.25)]">
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {/* Outer Glowing Rings */}
              <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 6" className="animate-[spin_120s_linear_infinite]" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.4" />
              
              {/* Concentric Islamic Octagon Frame */}
              <polygon points="60,18 90,30 102,60 90,90 60,102 30,90 18,60 30,30" fill="none" stroke="#eab308" strokeWidth="1.5" strokeOpacity="0.6" className="rotate-45" />

              {/* Protective Shield Shape (Crystalline Glass look) */}
              <path d="M35,32 C50,28 60,24 60,24 C60,24 70,28 85,32 C85,32 88,58 75,78 C68,88 60,94 60,94 C60,94 52,88 45,78 C32,58 35,32 35,32 Z" fill="url(#shieldGrad)" stroke="#10b981" strokeWidth="2.5" />
              
              {/* Inner details: Shining Sparkle */}
              <path d="M60,35 L62,45 L72,47 L62,49 L60,59 L58,49 L48,47 L58,45 Z" fill="#eab308" className="animate-pulse" />
              <circle cx="60" cy="74" r="5" fill="#10b981" />
              <path d="M57,74 L63,74 M60,71 L60,77" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </motion.div>
        </div>
      ),
      features: ["مكتبة فتاوى معتمدة", "بيئة خالية من التطرف والشذوذ", "رقابة أخلاقية وتوجيه هادف", "الربط بدور الإفتاء بوطنك"]
    },
    {
      title: "التواصل الأخوي والأسري",
      desc: "تواصل مع إخوانك في الله عبر حلقات الذكر وغرف الصوت المستديرة في كنف الاحترام العميم والسلم المسلم.",
      icon: (
        <div className="relative w-48 h-48 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-teal-500/15 rounded-full blur-2xl"></div>
          <motion.div 
            animate={{ y: [0, -6, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            {/* Mobile-to-mobile brotherhood interaction with "السلام عليكم" popup */}
            <svg viewBox="0 0 120 120" className="w-38 h-38 drop-shadow-[0_12px_24px_rgba(20,184,166,0.3)]">
              {/* Two phone silhouettes */}
              {/* Phone 1 (Left, rotated) */}
              <g transform="rotate(-10 35 65)">
                <rect x="15" y="30" width="30" height="60" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                <rect x="18" y="36" width="24" height="48" rx="2" fill="#1e293b" />
                {/* User avatar shape on screen */}
                <circle cx="30" cy="50" r="6" fill="#14b8a6" />
                <path d="M22,64 C22,58 38,58 38,64 Z" fill="#14b8a6" />
              </g>

              {/* Phone 2 (Right, rotated) */}
              <g transform="rotate(10 85 65)">
                <rect x="75" y="30" width="30" height="60" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                <rect x="78" y="36" width="24" height="48" rx="2" fill="#1e293b" />
                {/* User avatar on screen */}
                <circle cx="90" cy="50" r="6" fill="#f59e0b" />
                <path d="M82,64 C82,58 98,58 98,64 Z" fill="#f59e0b" />
              </g>

              {/* Connective Wave Line between them */}
              <path d="M43,45 C55,30 65,30 77,45" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />

              {/* "السلام عليكم" Greeting Bubble in the center */}
              <g transform="translate(28, 62)">
                <rect x="0" y="0" width="64" height="25" rx="10" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                {/* Tail pointing down */}
                <polygon points="32,25 27,31 37,25" fill="#10b981" />
                {/* Arabic Greeting text */}
                <text x="32" y="16" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">السلام عليكم</text>
              </g>
            </svg>
          </motion.div>
        </div>
      ),
      features: ["حملات دعاء مشتركة", "بث صوتي وتسميع لايف", "إشراف عائلي دقيق وحماية", "جوائز وتحسين رتب دينية"]
    },
    {
      title: "جاهز للبدء؟",
      desc: "اجعل تطبيق \"يقين\" رفيقك اليومي وتزود من بحار الطاعات والخير والتعبد.",
      icon: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/30 rounded-full  animate-pulse"></div>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.6)]">
              <CheckCircle2 size={60} className="text-white" />
            </div>
          </motion.div>
        </div>
      ),
      features: []
    }
  ];

  // Generate random stars
  const stars = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 3 + 2
  }));

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a2818] to-[#061a10] z-50 overflow-x-hidden overflow-y-auto" dir="rtl">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.07] mix-blend-screen pointer-events-none" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1590076215667-873dcb3f3fbb?q=80&w=2000&auto=format&fit=crop")' }}
      ></div>
      <div className="min-h-[100dvh] flex flex-col items-center justify-between relative z-10">
      {/* Animated Stars Background */}
      {mounted && stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.2, 1] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Background Mosque Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 opacity-15 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-auto" preserveAspectRatio="none">
          <path fill="#10b981" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          {/* Simple Domes */}
          <path fill="#10b981" d="M200,224 C200,180 250,150 250,150 C250,150 300,180 300,224 Z"></path>
          <path fill="#10b981" d="M700,235 C700,190 750,160 750,160 C750,160 800,190 800,235 Z"></path>
          <path fill="#10b981" d="M1100,250 C1100,200 1150,170 1150,170 C1150,170 1200,200 1200,250 Z"></path>
          {/* Minarets */}
          <rect x="245" y="100" width="10" height="124" fill="#10b981"></rect>
          <polygon points="240,100 250,70 260,100" fill="#10b981"></polygon>
          <rect x="745" y="110" width="10" height="125" fill="#10b981"></rect>
          <polygon points="740,110 750,80 760,110" fill="#10b981"></polygon>
          <rect x="1145" y="120" width="10" height="130" fill="#10b981"></rect>
          <polygon points="1140,120 1150,90 1160,120" fill="#10b981"></polygon>
        </svg>
      </div>

      {/* Top Section: Logo & App Name */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="w-full pt-12 pb-4 px-6 text-center relative z-20"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(212,175,55,0.4)] mb-3">
          <Moon size={28} className="text-white fill-white" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-white mb-2 tracking-wide drop-shadow-md">
          يقين
        </h1>
      </motion.div>

      {/* Middle Section: Slider Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 250, damping: 25 }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className="mb-6">
              {steps[step].icon}
            </div>
            
            <h2 className="text-2xl font-bold font-serif text-white mb-3 drop-shadow-md">
              {steps[step].title}
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-[280px] mb-6 min-h-[40px] font-bold">
              {steps[step].desc}
            </p>

            {/* Features List (if any) */}
            {steps[step].features.length > 0 && (
              <div className="w-full max-w-[260px] bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <ul className="space-y-3 text-right">
                  {steps[step].features.map((feature, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                      className="flex items-center gap-3 text-white/90 text-sm font-bold"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      </div>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section: Controls & Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full max-w-md px-6 pb-10 relative z-20 flex flex-col items-center"
      >
        {/* Pagination Dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-emerald-400 shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'}`} 
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
        
        {/* Main Button */}
        <button
          onClick={() => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              requestPermissions();
            }
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-lg shadow-[0_10px_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {step < steps.length - 1 ? (
            <>التالي <ArrowLeft size={20} /></>
          ) : (
            <>ابدأ الآن</>
          )}
        </button>
      </motion.div>
      </div>
    </div>
  );
}

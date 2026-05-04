import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Compass, Heart, Moon, Star, ArrowLeft, Clock, CheckCircle2, Radio, Calendar, MapPin } from 'lucide-react';

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
      title: 'مرحبًا بك في "اليقين"',
      desc: "تطبيق إسلامي شامل يساعدك على تنظيم عبادتك اليومية بسهولة.",
      icon: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full  animate-pulse"></div>
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex flex-col items-center justify-center"
          >
            <Moon size={80} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] absolute -top-4 -right-4" />
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              <path d="M3 22v-4a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4" />
              <path d="M12 14v8" />
              <path d="M8 14v8" />
              <path d="M16 14v8" />
              <path d="M12 2a3 3 0 0 0-3 3v9a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="currentColor" fillOpacity="0.2"/>
            </svg>
          </motion.div>
        </div>
      ),
      features: []
    },
    {
      title: "القرآن الكريم كامل",
      desc: "اقرأ واستمع للقرآن الكريم بأصوات أكثر من 100 قارئ مع إمكانية البحث والتفسير.",
      icon: (
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full "></div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <BookOpen size={70} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
          </motion.div>
        </div>
      ),
      features: ["تشغيل التلاوة", "أكثر من 100 قارئ", "تفسير الآيات", "حفظ مكان القراءة"]
    },
    {
      title: "مواقيت الصلاة الدقيقة",
      desc: "تعرف على أوقات الصلاة حسب موقعك مع تنبيهات الأذان.",
      icon: (
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full "></div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Clock size={70} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
          </motion.div>
        </div>
      ),
      features: ["مواقيت الصلاة", "تنبيه قبل الصلاة", "صوت الأذان", "عداد للصلاة القادمة"]
    },
    {
      title: "الأذكار اليومية",
      desc: "مجموعة كاملة من الأذكار اليومية.",
      icon: (
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full "></div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Heart size={70} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
          </motion.div>
        </div>
      ),
      features: ["أذكار الصباح", "أذكار المساء", "أذكار النوم", "عداد التسبيح"]
    },
    {
      title: "أدوات إسلامية مفيدة",
      desc: "مجموعة من الأدوات التي يحتاجها كل مسلم.",
      icon: (
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full "></div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Compass size={70} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
          </motion.div>
        </div>
      ),
      features: ["اتجاه القبلة", "التقويم الهجري", "أسماء الله الحسنى", "حديث يومي"]
    },
    {
      title: "ميزات إضافية",
      desc: "المزيد من الميزات لاكتشافها داخل التطبيق.",
      icon: (
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full "></div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Star size={70} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
          </motion.div>
        </div>
      ),
      features: ["راديو قرآن مباشر", "قصص الأنبياء", "خلفيات إسلامية", "مشاركة الآيات والأدعية"]
    },
    {
      title: "جاهز للبدء؟",
      desc: "اجعل تطبيق \"اليقين\" رفيقك اليومي للقرآن والأذكار.",
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
    <div className="fixed inset-0 bg-gradient-to-b from-[var(--color-bg)] via-[#1a221d] to-[var(--color-bg)] z-50 overflow-x-hidden overflow-y-auto" dir="rtl">
      <div className="min-h-[100dvh] flex flex-col items-center justify-between relative">
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
          اليقين
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

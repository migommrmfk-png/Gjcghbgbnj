import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  ChevronRight, 
  Sparkles, 
  Settings as SettingsIcon, 
  X, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Award, 
  ShieldAlert, 
  BookOpen, 
  Flame, 
  Bookmark, 
  Info,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AZKAR_WITH_REWARDS = [
  {
    zikr: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    target: 100,
    hasanat: 100,
    sayyiat: 100,
    slaves: 10,
    hadith: "«من قالها مئة مرة كانت له عدل عشر رقاب، وكتبت له مئة حسنة، ومحيت عنه مئة سيئة، وكانت له حرزاً من الشيطان يومه ذلك حتى يمسي، ولم يأت أحد بأفضل مما جاء به إلا رجل عمل أكثر منه.» [صحيح البخاري ومسلم]",
    shortDesc: "عدل عتق ١٠ رقاب، ١٠٠ حسنة، محو ١٠٠ سيئة وحرز متين من الشيطان"
  },
  {
    zikr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    target: 100,
    hasanat: 100,
    sayyiat: 100,
    hadith: "«من قالها مائة مرة حطت خطاياه وإن كانت مثل زبد البحر» [صحيح مسلم]",
    shortDesc: "مغفرة شاملة لجميع الخطايا والسيئات ولو كانت مثل زبد البحر"
  },
  {
    zikr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    target: 100,
    hasanat: 200,
    sayyiat: 100,
    hadith: "«كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ» [خطبة البخاري]",
    shortDesc: "أثقل العبارات في ميزان العبد الإيماني وحبيبة للرحمن"
  },
  {
    zikr: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    target: 100,
    hasanat: 100,
    sayyiat: 100,
    hadith: "«من لزم الاستغفار جعل الله له من كل ضيق مخرجاً، ومن كل هم فرجاً، ورزقه من حيث لا يحتسب» [صحيح سنن ابن ماجه]",
    shortDesc: "تيسير للرزق ومخرج عاجل من الضيق والهم والهموم"
  },
  {
    zikr: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    target: 33,
    hasanat: 33,
    hadith: "«ألا أدلك على كنز من كنوز الجنة؟ لا حول ولا قوة إلا بالله» [متفق عليه]",
    shortDesc: "كنز عظيم من كنوز الجنة تحمي من سبعين باباً من الأذى"
  },
  {
    zikr: "سُبْحَانَ اللَّهِ",
    target: 33,
    hasanat: 33,
    hadith: "«أيعجز أحدكم أن يكسب كل يوم ألف حسنة؟ يسبح مائة تسبيحة، فيكتب له ألف حسنة، أو يحط عنه مائة خطيئة» [صحيح مسلم]",
    shortDesc: "تسجيل ألف حسنة ومحو مائة سيئة عاجلة بفضل الله"
  },
  {
    zikr: "الْحَمْدُ لِلَّهِ",
    target: 33,
    hasanat: 33,
    hadith: "«والحمد لله تملأ الميزان، وسبحان الله والحمد لله تملآن ما بين السماوات والأرض» [صحيح مسلم]",
    shortDesc: "تملأ ميزان العبد بالحسنات والرضا والسكينة المطلقة"
  },
  {
    zikr: "اللَّهُ أَكْبَرُ",
    target: 33,
    hasanat: 33,
    hadith: "التكبير يطهر القلب ويرسخ كبرياء الإله وعظمته على كل جبار وطاغية وصعوبة دنيوية.",
    shortDesc: "إعلاء توحيد الله وعظمته الفوقية فوق كل هم طريد"
  }
];

export default function Tasbeeh({ onBack }: { onBack?: () => void }) {
  // Cumulative rewards stats persistent
  const [hasanatCredits, setHasanatCredits] = useState<number>(() => {
    return parseInt(localStorage.getItem('tasbeehHasanatV2') || '0', 10);
  });
  const [sayyiatErased, setSayyiatErased] = useState<number>(() => {
    return parseInt(localStorage.getItem('tasbeehSayyiatErasedV2') || '0', 10);
  });
  const [slaveFrees, setSlaveFrees] = useState<number>(() => {
    return parseInt(localStorage.getItem('tasbeehSlaveFreesV2') || '0', 10);
  });

  const [count, setCount] = useState(() => {
    return parseInt(localStorage.getItem('tasbeehCountV2') || '0', 10);
  });
  const [target, setTarget] = useState(() => {
    return parseInt(localStorage.getItem('tasbeehTargetV2') || '33', 10);
  });
  const [rounds, setRounds] = useState(() => {
    return parseInt(localStorage.getItem('tasbeehRoundsV2') || '1', 10);
  });
  const [currentZikr, setCurrentZikr] = useState(() => {
    return localStorage.getItem('tasbeehZikrV2') || AZKAR_WITH_REWARDS[0].zikr;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZikrSelectOpen, setIsZikrSelectOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tasbeehSoundV2') !== 'false';
  });
  const [vibrationPattern, setVibrationPattern] = useState<'short' | 'long' | 'none'>(() => {
    return (localStorage.getItem('tasbeehVibrationV2') as any) || 'short';
  });

  // Modal reward popup
  const [activeRewardPopup, setActiveRewardPopup] = useState<{
    title: string;
    hadith: string;
    hasanat: number;
    sayyiat?: number;
    slaves?: number;
  } | null>(null);

  const [isPressed, setIsPressed] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(target.toString());
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('tasbeehCountV2', count.toString());
    localStorage.setItem('tasbeehTargetV2', target.toString());
    localStorage.setItem('tasbeehRoundsV2', rounds.toString());
    localStorage.setItem('tasbeehZikrV2', currentZikr);
    localStorage.setItem('tasbeehSoundV2', soundEnabled.toString());
    localStorage.setItem('tasbeehVibrationV2', vibrationPattern);
    localStorage.setItem('tasbeehHasanatV2', hasanatCredits.toString());
    localStorage.setItem('tasbeehSayyiatErasedV2', sayyiatErased.toString());
    localStorage.setItem('tasbeehSlaveFreesV2', slaveFrees.toString());
  }, [count, target, rounds, currentZikr, soundEnabled, vibrationPattern, hasanatCredits, sayyiatErased, slaveFrees]);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(540, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);
      gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.04);
    } catch (err) {}
  };

  const executeVibration = () => {
    if (navigator.vibrate && vibrationPattern !== 'none') {
      if (vibrationPattern === 'short') navigator.vibrate(30);
      else if (vibrationPattern === 'long') navigator.vibrate(100);
    }
  };

  const handlePressDown = (e?: React.SyntheticEvent) => {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    setIsPressed(true);

    playClickSound();
    executeVibration();

    // Raw points progression - each tap earns 1 stable hasanah credit
    const nextHasanatCredits = hasanatCredits + 1;
    setHasanatCredits(nextHasanatCredits);

    const nextCount = count + 1;

    // Standard matching reward triggers
    const matchedReward = AZKAR_WITH_REWARDS.find(item => item.zikr === currentZikr);

    if (nextCount >= target) {
      // Loop complete
      setCount(0);
      const nextR = rounds + 1;
      setRounds(nextR);

      // Trigger heavy double vibration on round completes
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // Check matched target reward completion popups
      if (matchedReward) {
        // Multipliers check for completes
        const hGift = matchedReward.hasanat || 33;
        const sGift = matchedReward.sayyiat || 0;
        const slavesGift = matchedReward.slaves || 0;

        const newH = nextHasanatCredits + hGift;
        const newS = sayyiatErased + sGift;
        const newF = slaveFrees + slavesGift;

        setHasanatCredits(newH);
        setSayyiatErased(newS);
        setSlaveFrees(newF);

        // Display Hadith Reward overlay modal!
        setActiveRewardPopup({
          title: "تهنئة ثواب الحديث النبوي الشريف ✨",
          hadith: matchedReward.hadith,
          hasanat: hGift,
          sayyiat: sGift > 0 ? sGift : undefined,
          slaves: slavesGift > 0 ? slavesGift : undefined
        });

        toast.success("🏆 تم تسجيل أجر وثواب الذكر النبوي العظيم لهذا اليوم!");
      } else {
        toast.success("✨ أحسنت! تواصل بذكر الله والتقرب لمقامات الرضا.");
      }
    } else {
      setCount(nextCount);

      // Check inside loop for specific landmark targets (e.g. hitting exactly 100 for Tawheed Du'a)
      if (nextCount === 100 && currentZikr === AZKAR_WITH_REWARDS[0].zikr) {
        const hGift = 100;
        const sGift = 100;
        const slavesGift = 10;

        const newH = nextHasanatCredits + hGift;
        const newS = sayyiatErased + sGift;
        const newF = slaveFrees + slavesGift;

        setHasanatCredits(newH);
        setSayyiatErased(newS);
        setSlaveFrees(newF);

        setActiveRewardPopup({
          title: "عتق ومغفرة مائة توحيد كاملة 👑",
          hadith: AZKAR_WITH_REWARDS[0].hadith,
          hasanat: hGift,
          sayyiat: sGift,
          slaves: slavesGift
        });
        toast.success("🎉 تهانينا! أدركت فوز عتق مائة تهليلة كاملة!");
      } else if (nextCount === 100 && currentZikr === AZKAR_WITH_REWARDS[1].zikr) {
        const hGift = 100;
        const sGift = 100;

        const newH = nextHasanatCredits + hGift;
        const newS = sayyiatErased + sGift;

        setHasanatCredits(newH);
        setSayyiatErased(newS);

        setActiveRewardPopup({
          title: "كسب عظيم: مائة تسبيحة وحمد 🌊",
          hadith: AZKAR_WITH_REWARDS[1].hadith,
          hasanat: hGift,
          sayyiat: sGift
        });
        toast.success("🌊 تساقطت خطاياك وإن كانت مثل زبد البحر!");
      }
    }
  };

  const handlePressUp = () => {
    setIsPressed(false);
  };

  // Keyboard spaces trigger clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingTarget || isSettingsOpen || isZikrSelectOpen) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handlePressDown();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (isEditingTarget || isSettingsOpen || isZikrSelectOpen) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handlePressUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [count, target, rounds, soundEnabled, vibrationPattern, isEditingTarget, isSettingsOpen, isZikrSelectOpen, currentZikr, hasanatCredits, sayyiatErased, slaveFrees]);

  const handleReset = () => {
    setCount(0);
    setRounds(1);
    toast.success('تم تصفير كاونتر الجلسة الحالية');
  };

  const selectZikr = (zikrText: string, newTarget: number) => {
    setCurrentZikr(zikrText);
    setTarget(newTarget);
    setTempTarget(newTarget.toString());
    setCount(0);
    setRounds(1);
    setIsZikrSelectOpen(false);
  };

  const saveTarget = () => {
    const tVal = parseInt(tempTarget, 10);
    if (!isNaN(tVal) && tVal > 0) {
      setTarget(tVal);
      setCount(0);
      setRounds(1);
    }
    setIsEditingTarget(false);
  };

  const matchedReward = AZKAR_WITH_REWARDS.find(i => i.zikr === currentZikr);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden pb-24 text-right" dir="rtl">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* App Header */}
      <div className="flex items-center justify-between p-4 z-10 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-2xl transition-all border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm"
          >
            <SettingsIcon className="text-slate-500 dark:text-slate-400" size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-serif font-black text-slate-800 dark:text-slate-100 text-lg">المسبحة وكنز الأجور</span>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-2xl transition-all border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xs mr-1"
            >
              <ChevronRight size={22} className="text-slate-500 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        
        {/* --- Authentic Spiritual Statement Board (كشف حساب مدخرات الآخرة التراكمي) --- */}
        <div className="bg-gradient-to-br from-[#0F291E] via-[#05110C] to-[#010503] border-2 border-emerald-500/20 rounded-[2.2rem] p-5 shadow-xl relative overflow-hidden">
          {/* Subtle gold grid effect */}
          <div className="absolute inset-0 bg-grid-slate-850 opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <span className="block text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest text-center mb-4.5">
              📈 لوحة الأجور النبوية المستمرة والسيئات الممحوة (المتراكم الفردي)
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-emerald-300 font-black">الحسنات المكتسبة</span>
                <span className="text-xl md:text-2xl font-mono font-black text-white block mt-2 drop-shadow">
                  {hasanatCredits.toLocaleString('ar-EG')}
                </span>
                <span className="text-[8px] text-slate-400 block mt-1">+1 حسنة لكل نقرة</span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-rose-300 font-black">السيئات الممحوة</span>
                <span className="text-xl md:text-2xl font-mono font-black text-rose-400 block mt-2 drop-shadow">
                  -{sayyiatErased.toLocaleString('ar-EG')}
                </span>
                <span className="text-[8px] text-slate-400 block mt-1">مغفرة ومحو الخطايا</span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-amber-300 font-black">عتق رقاب لوجه الله</span>
                <span className="text-xl md:text-2xl font-mono font-black text-amber-400 block mt-2 drop-shadow">
                  {slaveFrees.toLocaleString('ar-EG')}
                </span>
                <span className="text-[8px] text-slate-400 block mt-1">عدل عتق بالتوحيد</span>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto italic font-light">
                * تُجمع الأجور الإيمانية يومياً لبناء الأمل في مغفرة الغفور الرحيم وزيادة الطمع في عظيم رحمتة التي وسعت كل شيء.
              </p>
            </div>
          </div>
        </div>

        {/* --- Active Zikr Select Card --- */}
        <div 
          onClick={() => setIsZikrSelectOpen(true)}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-black/5 dark:border-white/5 p-5 shadow-sm text-right cursor-pointer hover:shadow-md hover:border-emerald-500/20 active:scale-[0.99] transition-all relative overflow-hidden"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-black/5 dark:border-white/5">
            <ChevronRight size={16} className="rotate-180 text-slate-400" />
          </div>

          <div className="pl-8">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">الذِكر النشط الحالي (اضغط لتغييره) 🔄</span>
            <p className="font-serif font-black text-[15px] text-emerald-600 dark:text-emerald-400 mt-1 leading-relaxed leading-[1.6]">
              {currentZikr}
            </p>
            {matchedReward && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black mt-2 leading-relaxed flex items-center gap-1">
                <Award size={12} className="text-amber-500 shrink-0" />
                <span>{matchedReward.shortDesc}</span>
              </p>
            )}
          </div>
        </div>

        {/* --- Digital Dashboard Counter Canvas --- */}
        <div className="flex flex-col items-center justify-center space-y-6 max-w-xs mx-auto">
          
          {/* Target state editor option */}
          <div className="flex items-center gap-4 text-xs font-bold font-sans bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span>الجولات: {rounds}</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">مرة</span>
            </div>

            <div className="w-px h-3 bg-black/15 dark:bg-white/10" />

            {isEditingTarget ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-12 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1 py-0.5 font-bold focus:border-emerald-500 outline-none"
                />
                <button 
                  onClick={saveTarget}
                  className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px]"
                >
                  حفظ
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingTarget(true)}
                className="flex items-center gap-1 text-slate-500 dark:text-slate-400 cursor-pointer hover:text-emerald-500"
              >
                <span>الهدف:</span>
                <span className="text-emerald-500 font-bold">{target}</span>
                <span className="text-[9px] text-slate-400">(تعديل)</span>
              </div>
            )}
          </div>

          {/* Central Press Area Button */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Soft radiating visual rings */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/10 dark:border-emerald-500/5 animate-pulse" />
            <div className="absolute inset-4 rounded-full border border-emerald-500/10 dark:border-emerald-500/5" />
            
            {/* SVG circle stroke representation */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-slate-200 dark:stroke-slate-900 fill-transparent"
                strokeWidth="8"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-emerald-500 dark:stroke-emerald-400 fill-transparent"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 110}`}
                animate={{ strokeDashoffset: `${2 * Math.PI * 110 * (1 - count / target)}` }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>

            {/* Tap/Click Activator Circular Panel */}
            <motion.button
              onMouseDown={() => handlePressDown()}
              onMouseUp={() => handlePressUp()}
              onTouchStart={(e) => handlePressDown(e)}
              onTouchEnd={() => handlePressUp()}
              whileTap={{ scale: 0.94 }}
              className={`absolute w-48 h-48 rounded-full bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center border-4 border-slate-200/40 dark:border-slate-800/60 shadow-lg select-none outline-none cursor-pointer transition-colors ${
                isPressed ? 'from-emerald-50 to-emerald-100/20 dark:from-emerald-950/20' : ''
              }`}
            >
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">اضغط للتسبيح</span>
              <span className="text-6xl font-mono font-black text-slate-800 dark:text-slate-100 tabular-nums my-1 animate-fade-in pr-2">
                {count}
              </span>
              <span className="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                {target - count} متبقي
              </span>
            </motion.button>
          </div>

          {/* Reset current sessions and manual controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-full transition-colors border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm cursor-pointer"
              title="تصفير الجولة الحالية"
            >
              <RotateCcw size={18} />
            </button>
            <p className="text-xs text-slate-400 font-bold font-sans">تصفير العداد لذكر جديد</p>
          </div>
        </div>

        {/* --- Display Selected Quote references underneath --- */}
        {matchedReward && (
          <div className="bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-5 text-right">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <BookOpen size={16} />
              <h4 className="text-xs font-black font-serif uppercase tracking-widest">مستند الأثر والفائدة الشرعية لـ هذا الذِكر 📚</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-serif text-[13px] italic leading-[1.6]">
              {matchedReward.hadith}
            </p>
          </div>
        )}

      </div>

      {/* ====================================================================== */}
      {/* 1. Modal Dialog for Prophet's Rewards Popup CITATIONS */}
      {/* ====================================================================== */}
      <AnimatePresence>
        {activeRewardPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveRewardPopup(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-br from-emerald-900 to-slate-950 border-2 border-emerald-400/30 rounded-[2.5rem] p-7 text-center shadow-2xl overflow-hidden z-10"
            >
              <div className="absolute -right-20 -top-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
              
              <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400 border border-amber-400/30">
                <Sparkles size={28} className="animate-pulse" />
              </div>

              <h3 className="text-lg font-black font-serif text-amber-400 mb-1 leading-snug">
                {activeRewardPopup.title}
              </h3>
              <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mb-4">
                لقد أتممت بفضل الله عدداً مبروراً للذكر النبوي!
              </p>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-right mb-5">
                <span className="block text-[9px] font-black text-amber-400 mb-1.5 uppercase tracking-wider">الحديث النبوي الصحيح لفضل هذا الذِكر:</span>
                <p className="text-slate-105 dark:text-slate-200 text-xs font-serif leading-relaxed italic leading-[1.6]">
                  {activeRewardPopup.hadith}
                </p>
              </div>

              {/* Incremented variables summary panel inside pop */}
              <div className="bg-emerald-950/20 border-2 border-emerald-500/20 rounded-2xl p-3.5 mb-5 flex justify-around text-center">
                <div>
                  <span className="text-[10px] text-emerald-300 font-black block">حسنات مضافة</span>
                  <span className="text-lg font-mono font-black text-emerald-400 block mt-1">+{activeRewardPopup.hasanat}</span>
                </div>
                {activeRewardPopup.sayyiat && (
                  <div className="border-r border-white/5 pr-3.5">
                    <span className="text-[10px] text-rose-300 font-black block">سيئات ممحوة</span>
                    <span className="text-lg font-mono font-black text-rose-400 block mt-1">-{activeRewardPopup.sayyiat}</span>
                  </div>
                )}
                {activeRewardPopup.slaves && (
                  <div className="border-r border-white/5 pr-3.5">
                    <span className="text-[10px] text-amber-300 font-black block">عتق رقاب</span>
                    <span className="text-lg font-mono font-black text-amber-400 block mt-1">{activeRewardPopup.slaves} رقاب</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveRewardPopup(null)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-650 hover:to-teal-650 text-white font-black rounded-xl text-xs active:scale-95 transition-all shadow-md border border-white/10 cursor-pointer"
              >
                الحمد لله، ثبت الله أجرنا وعملك
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================== */}
      {/* 2. Zikr Select Drawer List */}
      {/* ====================================================================== */}
      <AnimatePresence>
        {isZikrSelectOpen && (
          <div className="fixed inset-0 z-40 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZikrSelectOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] border-t border-black/5 dark:border-white/5 p-6 shadow-2xl z-10 max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-5" />
              
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-sm font-black font-serif text-slate-800 dark:text-slate-100">اختر الذِكر للأجور المضاعفة 📖</span>
                <button 
                  onClick={() => setIsZikrSelectOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {AZKAR_WITH_REWARDS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectZikr(item.zikr, item.target)}
                    className={`p-4 rounded-2xl border text-right cursor-pointer transition-all ${
                      currentZikr === item.zikr
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-950 border-black/5 dark:border-white/5 hover:border-emerald-500/20'
                    }`}
                  >
                    <p className="font-serif font-black text-xs md:text-sm text-slate-800 dark:text-slate-100 leading-normal">
                      {item.zikr}
                    </p>
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 text-[9px] text-slate-400 font-extrabold pb-0.5">
                      <span className="text-emerald-500">الهدف المفضل: {item.target} مرة</span>
                      <span className="text-amber-500 font-black">{item.shortDesc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================== */}
      {/* 3. Settings configurations modal */}
      {/* ====================================================================== */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-[2rem] p-6 shadow-xl z-20"
            >
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-5">
                <span className="font-serif font-black text-md text-slate-800 dark:text-slate-100">إعدادات المسبحة المتقدمة</span>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Audio parameters */}
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <div>
                    <span className="block text-xs font-black text-slate-700 dark:text-slate-200">الصوت التفاعلي للجلسة</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">إصدار صوت نقرة ناعمة عند كل تسبيحة</span>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      soundEnabled 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>

                {/* Vibration parameters */}
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                  <div>
                    <span className="block text-xs font-black text-slate-700 dark:text-slate-200">الاهتزاز اللمسي الذكي</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">تقديم ردة اهتزاز عند كل تسبيحة وهدف</span>
                  </div>
                  <div className="flex gap-1.5">
                    {(['short', 'long', 'none'] as const).map(pattern => (
                      <button
                        key={pattern}
                        onClick={() => setVibrationPattern(pattern)}
                        className={`text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          vibrationPattern === pattern
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450'
                        }`}
                      >
                        {pattern === 'short' ? 'ناعم' : pattern === 'long' ? 'عميق' : 'إعطال'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warning / caution on accumulated counters */}
                <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-right">
                  <p className="text-[9px] text-yellow-600 dark:text-yellow-400 leading-normal font-bold">
                    ⚠️ تتم جميع الحسابات للأجور التراكمية وسجلاتك الإيمانية محلياً بالكامل على متصفحك وسيرفرك لأجل التسهيل، ونأمل أن يتقبل الله منا ومنكم صالح الأعمال ويعفو عنا بمنّه الواسع.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
              >
                تحديث وحفظ الإعدادات
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

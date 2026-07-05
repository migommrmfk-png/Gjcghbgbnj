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
  CheckCircle,
  Cloud,
  CloudOff,
  RefreshCw,
  LogIn
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// Safe deterministic ID generation for each active task/zikr
export const getZikrId = (text: string): string => {
  const defaults = [
    "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "سُبْحَانَ اللَّهِ",
    "الْحَمْدُ لِلَّهِ",
    "اللَّهُ أَكْبَرُ"
  ];
  const idx = defaults.indexOf(text);
  if (idx !== -1) {
    return `default_zikr_${idx}`;
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `custom_zikr_${Math.abs(hash)}`;
};

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
  const { user, logout } = useAuth();

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

  // Daily Goal & Cumulative Progress
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    return parseInt(localStorage.getItem('tasbeeh_daily_goal') || '1000', 10);
  });
  const [dailyCount, setDailyCount] = useState<number>(() => {
    const savedDate = localStorage.getItem('tasbeeh_daily_date');
    const today = new Date().toLocaleDateString('en-CA');
    if (savedDate === today) {
      return parseInt(localStorage.getItem('tasbeeh_daily_count') || '0', 10);
    }
    return 0;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZikrSelectOpen, setIsZikrSelectOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tasbeehSoundV2') !== 'false';
  });
  const [vibrationPattern, setVibrationPattern] = useState<'short' | 'medium' | 'long' | 'double' | 'none'>(() => {
    return (localStorage.getItem('tasbeehVibrationV3') as any) || 'short';
  });

  // Firestore sync state
  const [dbTasbeehs, setDbTasbeehs] = useState<Record<string, { count: number; rounds: number; updatedAt: string }>>({});
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(() => {
    return localStorage.getItem('tasbeehAutoSyncV1') !== 'false';
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

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

  const syncTimeoutRef = useRef<any>(null);
  const progressSyncInitializedRef = useRef<Record<string, boolean>>({});

  // Real-time Firestore synchronization subscription
  useEffect(() => {
    if (!user || user.uid === 'local_guest') {
      setDbTasbeehs({});
      return;
    }

    const tasbeehCollectionRef = collection(db, 'users', user.uid, 'tasbeeh');
    setSyncStatus('syncing');
    
    const unsubscribe = onSnapshot(tasbeehCollectionRef, (snapshot) => {
      const dbData: Record<string, { count: number; rounds: number; updatedAt: string }> = {};
      snapshot.forEach((doc) => {
        dbData[doc.id] = doc.data() as any;
      });
      setDbTasbeehs(dbData);
      setSyncStatus('synced');
    }, (error) => {
      console.error("Firestore onSnapshot subscription failed:", error);
      setSyncStatus('error');
      try {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/tasbeeh`);
      } catch (err) {}
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Loading specific counts from database on zikr selection or on initial load
  useEffect(() => {
    const zikrId = getZikrId(currentZikr);
    if (!progressSyncInitializedRef.current[zikrId]) {
      const dbData = dbTasbeehs[zikrId];
      if (dbData) {
        setCount(dbData.count);
        setRounds(dbData.rounds);
        progressSyncInitializedRef.current[zikrId] = true;
      } else {
        const localC = parseInt(localStorage.getItem(`tasbeehCount_${zikrId}`) || '0', 10);
        const localR = parseInt(localStorage.getItem(`tasbeehRounds_${zikrId}`) || '1', 10);
        setCount(localC);
        setRounds(localR);
        // If we don't have db data but local storage is empty, we consider it initialized to default 0/1
        if (Object.keys(dbTasbeehs).length > 0 || user?.uid === 'local_guest') {
          progressSyncInitializedRef.current[zikrId] = true;
        }
      }
    }
  }, [currentZikr, dbTasbeehs, user]);

  // Save changes to LocalStorage instantly and handle per-zikr localStorage
  useEffect(() => {
    const zikrId = getZikrId(currentZikr);
    localStorage.setItem(`tasbeehCount_${zikrId}`, count.toString());
    localStorage.setItem(`tasbeehRounds_${zikrId}`, rounds.toString());

    localStorage.setItem('tasbeehCountV2', count.toString());
    localStorage.setItem('tasbeehTargetV2', target.toString());
    localStorage.setItem('tasbeehRoundsV2', rounds.toString());
    localStorage.setItem('tasbeehZikrV2', currentZikr);
    localStorage.setItem('tasbeehSoundV2', soundEnabled.toString());
    localStorage.setItem('tasbeehVibrationV3', vibrationPattern);
    localStorage.setItem('tasbeehAutoSyncV1', isAutoSyncEnabled.toString());
    localStorage.setItem('tasbeehHasanatV2', hasanatCredits.toString());
    localStorage.setItem('tasbeehSayyiatErasedV2', sayyiatErased.toString());
    localStorage.setItem('tasbeehSlaveFreesV2', slaveFrees.toString());
  }, [count, target, rounds, currentZikr, soundEnabled, vibrationPattern, isAutoSyncEnabled, hasanatCredits, sayyiatErased, slaveFrees]);

  // Save daily goal changes to LocalStorage
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    localStorage.setItem('tasbeeh_daily_goal', dailyGoal.toString());
    localStorage.setItem('tasbeeh_daily_count', dailyCount.toString());
    localStorage.setItem('tasbeeh_daily_date', today);
  }, [dailyGoal, dailyCount]);

  // Save to Firestore with a debounce to minimize writes and prevent wallet drain
  const triggerFirestoreSync = (nextCount: number, nextRounds: number) => {
    if (!user || user.uid === 'local_guest' || !isAutoSyncEnabled) return;
    
    setSyncStatus('syncing');
    const zikrId = getZikrId(currentZikr);
    
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(async () => {
      const path = `users/${user.uid}/tasbeeh/${zikrId}`;
      try {
        const docRef = doc(db, 'users', user.uid, 'tasbeeh', zikrId);
        await setDoc(docRef, {
          userId: user.uid,
          zikr: currentZikr,
          count: nextCount,
          rounds: nextRounds,
          updatedAt: new Date().toISOString()
        });
        setSyncStatus('synced');
      } catch (error) {
        console.error("Firestore write failed:", error);
        setSyncStatus('error');
        try {
          handleFirestoreError(error, OperationType.WRITE, path);
        } catch (err) {}
      }
    }, 1000); // 1 second debounce
  };

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
      
      // Warm organic wood bead sound synthesis
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(320, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.06);
      
      gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.06);
    } catch (err) {}
  };

  const executeVibration = (type?: 'count' | 'round') => {
    if (!navigator.vibrate) return;
    
    if (type === 'round') {
      // Robust victory vibration for matching a completed round
      navigator.vibrate([100, 50, 100]);
      return;
    }
    
    if (vibrationPattern === 'none') return;
    
    switch (vibrationPattern) {
      case 'short':
        navigator.vibrate(30);
        break;
      case 'medium':
        navigator.vibrate(60);
        break;
      case 'long':
        navigator.vibrate(120);
        break;
      case 'double':
        navigator.vibrate([40, 30, 40]);
        break;
      default:
        navigator.vibrate(30);
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

    // Daily target rollover & increment
    const today = new Date().toLocaleDateString('en-CA');
    const savedDate = localStorage.getItem('tasbeeh_daily_date');
    let currentDailyCount = dailyCount;
    if (savedDate !== today) {
      currentDailyCount = 0;
    }
    const nextDailyCount = currentDailyCount + 1;
    setDailyCount(nextDailyCount);

    if (nextDailyCount === dailyGoal) {
      toast.success("🎉 هنيئًا لك! لقد حققت هدفك اليومي للتسبيح بنجاح! 🏆", {
        duration: 5000
      });
    }

    const nextCount = count + 1;

    // Standard matching reward triggers
    const matchedReward = AZKAR_WITH_REWARDS.find(item => item.zikr === currentZikr);

    if (nextCount >= target) {
      // Loop complete
      setCount(0);
      const nextR = rounds + 1;
      setRounds(nextR);

      // Trigger heavy double vibration on round completes
      executeVibration('round');
      triggerFirestoreSync(0, nextR);

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
      triggerFirestoreSync(nextCount, rounds);

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
  }, [count, target, rounds, soundEnabled, vibrationPattern, isEditingTarget, isSettingsOpen, isZikrSelectOpen, currentZikr, hasanatCredits, sayyiatErased, slaveFrees, isAutoSyncEnabled]);

  const handleReset = () => {
    setCount(0);
    setRounds(1);
    triggerFirestoreSync(0, 1);
    toast.success('تم تصفير كاونتر الجلسة الحالية');
  };

  const selectZikr = (zikrText: string, newTarget: number) => {
    setCurrentZikr(zikrText);
    setTarget(newTarget);
    setTempTarget(newTarget.toString());
    
    // Switch to target zikr state loaded from DB or local
    const zikrId = getZikrId(zikrText);
    if (dbTasbeehs[zikrId]) {
      setCount(dbTasbeehs[zikrId].count);
      setRounds(dbTasbeehs[zikrId].rounds);
    } else {
      const localC = parseInt(localStorage.getItem(`tasbeehCount_${zikrId}`) || '0', 10);
      const localR = parseInt(localStorage.getItem(`tasbeehRounds_${zikrId}`) || '1', 10);
      setCount(localC);
      setRounds(localR);
    }
    
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

        {/* --- 🎯 Daily Tasbeeh Goal & Live Progress Bar --- */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[2.2rem] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                <Flame size={20} className={dailyCount >= dailyGoal ? "animate-bounce text-amber-500" : "animate-pulse"} />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-extrabold block">الهدف اليومي للتسبيح</span>
                <span className="text-xs font-black text-slate-700 dark:text-slate-200">إنجازك اليوم التقريبي للسبحة</span>
              </div>
            </div>
            
            {/* Goal adjustment selector */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-2xl border border-black/5 dark:border-white/5 self-end sm:self-auto">
              <button 
                type="button"
                onClick={() => setDailyGoal(prev => Math.max(100, prev - 100))}
                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-black/5 dark:border-white/5 cursor-pointer text-sm"
                title="تقليل الهدف اليومي"
              >
                -
              </button>
              <div className="flex flex-col items-center px-2">
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 leading-none">{dailyGoal}</span>
                <span className="text-[7.5px] text-slate-400 font-extrabold leading-none mt-1">تسبيحة</span>
              </div>
              <button 
                type="button"
                onClick={() => setDailyGoal(prev => prev + 100)}
                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-black/5 dark:border-white/5 cursor-pointer text-sm"
                title="زيادة الهدف اليومي"
              >
                +
              </button>
            </div>
          </div>

          {/* Preset options */}
          <div className="flex justify-start gap-1.5 pb-2 overflow-x-auto scrollbar-none pr-0.5">
            {[100, 300, 500, 1000, 3000, 5000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setDailyGoal(val);
                  toast.success(`تم ضبط هدفك اليومي الجديد: ${val} تسبيحة 🎯`);
                }}
                className={`text-[9.5px] font-black px-3 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                  dailyGoal === val
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 border-black/5 dark:border-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {val.toLocaleString('ar-EG')}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-bold font-sans">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>تم إنجاز:</span>
                <span className="text-slate-800 dark:text-white font-extrabold text-[14px] font-mono">{dailyCount.toLocaleString('ar-EG')}</span>
                <span className="text-slate-400 font-normal">/ {dailyGoal.toLocaleString('ar-EG')}</span>
              </span>

              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold font-mono ${
                dailyCount >= dailyGoal 
                  ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-400'
              }`}>
                {Math.min(100, Math.round((dailyCount / dailyGoal) * 100))}%
              </span>
            </div>

            {/* Glowing progress line */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-black/5 dark:border-white/5 p-[2px] relative">
              <motion.div 
                className={`h-full rounded-full ${
                  dailyCount >= dailyGoal
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dailyCount / dailyGoal) * 100)}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 font-sans">
              <span className="text-[10px] text-slate-400 font-bold leading-none">
                {dailyCount >= dailyGoal 
                  ? "🎉 الحمد لله! تجاوزت حد هدفك المقرر لليوم بنجاح." 
                  : `متبقي ${Math.max(0, dailyGoal - dailyCount).toLocaleString('ar-EG')} تسبيحة للوصول غايتك.`}
              </span>
              {dailyCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const confirmReset = window.confirm("هل أنت متأكد من تصفير إنجاز التسبيح المقرر لليوم؟");
                    if (confirmReset) {
                      setDailyCount(0);
                      toast.success("تم إعادة ضبط إنجاز اليوم 🧼");
                    }
                  }}
                  className="text-[9.5px] font-black text-rose-500 dark:text-rose-450 hover:underline cursor-pointer"
                >
                  إعادة تعيين اليوم 🔄
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- Unified Cloud Synchronization Status Block --- */}
        {user && user.uid !== 'local_guest' ? (
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                syncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                syncStatus === 'syncing' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}>
                {syncStatus === 'syncing' ? (
                  <RefreshCw size={17} className="animate-spin" />
                ) : syncStatus === 'synced' ? (
                  <Cloud size={17} />
                ) : (
                  <CloudOff size={17} />
                )}
              </div>
              <div className="text-right">
                <span className="text-[9.5px] text-slate-400 font-extrabold block">مزامنة السحاب الإيماني ☁️</span>
                <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                  {syncStatus === 'syncing' ? 'جاري مزامنة تسبيحاتك سحابياً...' :
                   syncStatus === 'synced' ? 'تسبيحاتك محفوظة ومؤمّنة سحابياً بأمان' :
                   'فشل الاتصال بسيرفر المزامنة السحابية'}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  const nextSync = !isAutoSyncEnabled;
                  setIsAutoSyncEnabled(nextSync);
                  if (nextSync) {
                    toast.success("تم تفعيل المزامنة التلقائية سحابياً");
                    triggerFirestoreSync(count, rounds);
                  } else {
                    toast.success("تم إيقاف المزامنة السحابية المؤقتة");
                  }
                }}
                className={`text-[9px] font-extrabold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isAutoSyncEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500'
                }`}
              >
                {isAutoSyncEnabled ? 'مزامنة تلقائية نشطة' : 'تفعيل الحفظ التلقائي'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-3xl p-4.5 text-right relative overflow-hidden shadow-xs">
            <div className="absolute left-3 bottom-3 text-amber-500/10 pointer-events-none">
              <CloudOff size={64} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1.5 max-w-sm">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-xs">
                  <CloudOff size={14} />
                  <span>التسبيح بصيغة زائر محلي 💾</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-medium">
                  أنت تسخدم المسبحة بصيغة زائر. سجل حساباً مستقل كاملاً الآن لتأمين وحفظ جميع تسبيحاتك وأجورك من الضياع ونقلها لأي جهاز آخر لاحقاً! ✨
                </p>
              </div>
              
              <button
                onClick={async () => {
                  try {
                    await logout();
                    toast.success("يرجى إنشاء حساب لتفعيل مزامنة السحاب!");
                  } catch (err) {
                    toast.error("حدث خطأ أثناء الانتقال لصفحة التسجيل");
                  }
                }}
                className="py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all outline-none cursor-pointer self-start"
              >
                <LogIn size={11} />
                <span>تسجيل حساب لتفعيل مزامنة السحاب</span>
              </button>
            </div>
          </div>
        )}

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
            <div className="absolute inset-4 rounded-full border border-emerald-500/15 dark:border-emerald-500/10" />
            
            {/* Dynamic, interactive sliding beads rail */}
            <motion.svg 
              className="absolute inset-0 w-full h-full"
              style={{ transformOrigin: "128px 128px" }}
              animate={{ rotate: -90 + (count * (360 / 33)) }}
              transition={{ type: "spring", stiffness: 22, damping: 15, mass: 1.6 }}
            >
              {/* Background circular guide track */}
              <circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-slate-200/50 dark:stroke-slate-900/80 fill-transparent"
                strokeWidth="6"
              />
              
              {/* 33 High-fidelity glowing beads */}
              {Array.from({ length: 33 }).map((_, i) => {
                const angle = (i * 360) / 33;
                const angleRad = (angle * Math.PI) / 180;
                const r = 110;
                const cx = 128 + r * Math.cos(angleRad);
                const cy = 128 + r * Math.sin(angleRad);
                
                // Progress threshold calculation
                const beadProgress = (count / target) * 33;
                const isActive = i < beadProgress;
                const isCurrent = i === Math.floor(beadProgress) % 33;

                return (
                  <g key={i}>
                    {/* Active bead ambient bloom */}
                    {isActive && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="10"
                        className="fill-emerald-400/20 dark:fill-emerald-400/10 blur-[3px]"
                      />
                    )}
                    
                    {/* The physical-looking bead */}
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={isCurrent ? 8 : 6.5}
                      className="transition-colors duration-300"
                      style={{
                        fill: isActive 
                          ? (isCurrent ? '#34d399' : '#10b981') 
                          : '#475569',
                        stroke: isActive 
                          ? (isCurrent ? '#10b981' : '#047857') 
                          : '#475569',
                        strokeWidth: isCurrent ? 2 : 1,
                        filter: isActive ? 'drop-shadow(0 0 3px rgba(16,185,129,0.4))' : 'none'
                      }}
                      animate={{
                        scale: isCurrent ? 1.25 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    />
                    
                    {/* Realistic pearl core-glow highlight */}
                    <circle
                      cx={cx - 1.8}
                      cy={cy - 1.8}
                      r={isCurrent ? 2.5 : 1.8}
                      className="fill-white/40"
                    />
                  </g>
                );
              })}
            </motion.svg>

            {/* Seamlessly accurate outer goal indicator stroke */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
              <motion.circle
                cx="128"
                cy="128"
                r="122"
                className="stroke-emerald-500/40 dark:stroke-emerald-400/20 fill-transparent"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 122}`}
                animate={{ strokeDashoffset: `${2 * Math.PI * 122 * (1 - count / target)}` }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                strokeLinecap="round"
              />
            </svg>

            {/* Tap/Click Activator Circular Panel */}
            <motion.button
              onPointerDown={(e) => {
                if (e.button !== 0) return; // Only primary mouse clicks / touch
                e.preventDefault();
                e.stopPropagation();
                handlePressDown();
              }}
              onPointerUp={() => setIsPressed(false)}
              onPointerLeave={() => setIsPressed(false)}
              whileTap={{ scale: 0.94 }}
              className={`absolute w-48 h-48 rounded-full bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center border-4 border-slate-200/40 dark:border-slate-800/60 shadow-lg select-none outline-none cursor-pointer transition-colors ${
                isPressed ? 'from-emerald-50 to-emerald-100/20 dark:from-emerald-950/20 border-emerald-500/20' : ''
              }`}
            >
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-widest uppercase font-serif">اضغط للتسبيح</span>
              
              {/* Popping animated counter display */}
              <div className="h-16 flex items-center justify-center relative overflow-hidden w-full">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={count}
                    initial={{ y: 15, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -15, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 140, damping: 14 }}
                    className="absolute text-6xl font-mono font-black text-slate-800 dark:text-slate-100 tabular-nums pr-2"
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </div>
              
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
                {AZKAR_WITH_REWARDS.map((item, idx) => {
                  const itemZikrId = getZikrId(item.zikr);
                  const itemDb = dbTasbeehs[itemZikrId];
                  const itemLocalCount = parseInt(localStorage.getItem(`tasbeehCount_${itemZikrId}`) || '0', 10);
                  const itemLocalRounds = parseInt(localStorage.getItem(`tasbeehRounds_${itemZikrId}`) || '1', 10);
                  
                  const hasDb = !!itemDb;
                  const displayCount = itemDb ? itemDb.count : itemLocalCount;
                  const displayRounds = itemDb ? itemDb.rounds : itemLocalRounds;

                  return (
                    <div
                      key={idx}
                      onClick={() => selectZikr(item.zikr, item.target)}
                      className={`p-4 rounded-3xl border text-right cursor-pointer transition-all relative overflow-hidden ${
                        currentZikr === item.zikr
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-black/5 dark:border-white/5 hover:border-emerald-500/20'
                      }`}
                    >
                      {/* Synced Cloud progress indicator label for each item */}
                      {(displayRounds > 1 || displayCount > 0) && (
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 px-2 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-extrabold antialiased">
                          {hasDb && <Cloud size={10} />}
                          <span>الجولة {displayRounds} • {displayCount} تسبيحة</span>
                        </div>
                      )}

                      <p className="font-serif font-black text-xs md:text-sm text-slate-800 dark:text-slate-100 leading-relaxed pl-24 pt-2">
                        {item.zikr}
                      </p>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 text-[9px] text-slate-400 font-extrabold pb-0.5">
                        <span className="text-emerald-500 font-black">الهدف المفضل: {item.target} مرة</span>
                        <span className="text-amber-500 font-extrabold">{item.shortDesc}</span>
                      </div>
                    </div>
                  );
                })}
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
                <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-right">
                  <div>
                    <span className="block text-xs font-black text-slate-700 dark:text-slate-200">الاهتزاز اللمسي الذكي للجهاز 📱</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">تقديم ردة اهتزاز متنوعة عند كل نقرة (تستلزم الجوال)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(['short', 'medium', 'long', 'double', 'none'] as const).map(pattern => (
                      <button
                        key={pattern}
                        onClick={() => {
                          setVibrationPattern(pattern);
                          if (navigator.vibrate) {
                            if (pattern === 'short') navigator.vibrate(30);
                            else if (pattern === 'medium') navigator.vibrate(60);
                            else if (pattern === 'long') navigator.vibrate(120);
                            else if (pattern === 'double') navigator.vibrate([40, 30, 40]);
                          }
                        }}
                        className={`text-[9px] font-extrabold px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          vibrationPattern === pattern
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450'
                        }`}
                      >
                        {pattern === 'short' ? 'ناعم ⚡' : pattern === 'medium' ? 'متوسط ✨' : pattern === 'long' ? 'عميق 💥' : pattern === 'double' ? 'نبضتان 🔄' : 'تعطيل ❌'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warning / caution on accumulated counters */}
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-right">
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 leading-normal font-bold">
                    ✨ يتم حفظ ومزامنة جميع الأجور التراكمية وسجلاتك الإيمانية سحابياً مع قاعدة البيانات عند تسجيل الدخول، ومحلياً على متصفحك عند الدخول كزائر لراحتك. يتقبل الله منا ومنكم.
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

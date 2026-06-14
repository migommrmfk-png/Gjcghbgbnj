import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getGeminiClient } from '../lib/gemini';
import { BookOpen, Target, Sparkles, Plus, Trash2, Share2, Award, Flame, CheckCircle, Search, Edit3, Calendar, Download, RefreshCw, Star, Mic, MicOff, Lock, Play, Pause, Heart, MessageCircle } from 'lucide-react';

interface MemorizedPortion {
  id: string;
  surahName: string;
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  status: 'memorizing' | 'memorized' | 'needs_revision';
  dateAdded: string;
  lastRevisedDate?: string; // date string or ISO string representing the last revision
  notes?: string;
}

// 114 Surahs structural helper to make searching seamless and precise
const SURAHS_METADATA = [
  { number: 1, name: "الفاتحة", verses: 7 },
  { number: 2, name: "البقرة", verses: 286 },
  { number: 3, name: "آل عمران", verses: 200 },
  { number: 4, name: "النساء", verses: 176 },
  { number: 5, name: "المائدة", verses: 120 },
  { number: 6, name: "الأنعام", verses: 165 },
  { number: 7, name: "الأعراف", verses: 206 },
  { number: 8, name: "الأنفال", verses: 75 },
  { number: 9, name: "التوبة", verses: 129 },
  { number: 10, name: "يونس", verses: 109 },
  { number: 11, name: "هود", verses: 123 },
  { number: 12, name: "يوسف", verses: 111 },
  { number: 13, name: "الرعد", verses: 43 },
  { number: 14, name: "إبراهيم", verses: 52 },
  { number: 15, name: "الحجر", verses: 99 },
  { number: 16, name: "النحل", verses: 128 },
  { number: 17, name: "الإسراء", verses: 111 },
  { number: 18, name: "الكهف", verses: 110 },
  { number: 19, name: "مريم", verses: 98 },
  { number: 20, name: "طه", verses: 135 },
  { number: 21, name: "الأنبياء", verses: 112 },
  { number: 22, name: "الحج", verses: 78 },
  { number: 23, name: "المؤمنون", verses: 118 },
  { number: 24, name: "النور", verses: 64 },
  { number: 25, name: "الفرقان", verses: 77 },
  { number: 26, name: "الشعراء", verses: 227 },
  { number: 27, name: "النمل", verses: 93 },
  { number: 28, name: "القصص", verses: 88 },
  { number: 29, name: "العنكبوت", verses: 69 },
  { number: 30, name: "الروم", verses: 60 },
  { number: 31, name: "لقمان", verses: 34 },
  { number: 32, name: "السجدة", verses: 30 },
  { number: 33, name: "الأحزاب", verses: 73 },
  { number: 34, name: "سبأ", verses: 54 },
  { number: 35, name: "فاطر", verses: 45 },
  { number: 36, name: "يس", verses: 83 },
  { number: 37, name: "الصافات", verses: 182 },
  { number: 38, name: "ص", verses: 88 },
  { number: 39, name: "الزمر", verses: 75 },
  { number: 40, name: "غافر", verses: 85 },
  { number: 41, name: "فصلت", verses: 54 },
  { number: 42, name: "الشورى", verses: 53 },
  { number: 43, name: "الزخرف", verses: 89 },
  { number: 44, name: "الدخان", verses: 59 },
  { number: 45, name: "الجاثية", verses: 37 },
  { number: 46, name: "الأحقاف", verses: 35 },
  { number: 47, name: "محمد", verses: 38 },
  { number: 48, name: "الفتح", verses: 29 },
  { number: 49, name: "الحجرات", verses: 18 },
  { number: 50, name: "ق", verses: 45 },
  { number: 51, name: "الذاريات", verses: 60 },
  { number: 52, name: "الطور", verses: 49 },
  { number: 53, name: "النجم", verses: 62 },
  { number: 54, name: "القمر", verses: 55 },
  { number: 55, name: "الرحمن", verses: 78 },
  { number: 56, name: "الواقعة", verses: 96 },
  { number: 57, name: "الحديد", verses: 29 },
  { number: 58, name: "المجادلة", verses: 22 },
  { number: 59, name: "الحشر", verses: 24 },
  { number: 60, name: "الممتحنة", verses: 13 },
  { number: 61, name: "الصف", verses: 14 },
  { number: 62, name: "الجمعة", verses: 11 },
  { number: 63, name: "المنافقون", verses: 11 },
  { number: 64, name: "التغابن", verses: 18 },
  { number: 65, name: "الطلاق", verses: 12 },
  { number: 66, name: "التحريم", verses: 12 },
  { number: 67, name: "الملك", verses: 30 },
  { number: 68, name: "القلم", verses: 52 },
  { number: 69, name: "الحاقة", verses: 52 },
  { number: 70, name: "المعارج", verses: 44 },
  { number: 71, name: "نوح", verses: 28 },
  { number: 72, name: "الجن", verses: 28 },
  { number: 73, name: "المزمل", verses: 20 },
  { number: 74, name: "المدثر", verses: 56 },
  { number: 75, name: "القيامة", verses: 40 },
  { number: 76, name: "الإنسان", verses: 31 },
  { number: 77, name: "المرسلات", verses: 50 },
  { number: 78, name: "النبأ", verses: 40 },
  { number: 79, name: "النازعات", verses: 46 },
  { number: 80, name: "عبس", verses: 42 },
  { number: 81, name: "التكوير", verses: 29 },
  { number: 82, name: "الانفطار", verses: 19 },
  { number: 83, name: "المطففين", verses: 36 },
  { number: 84, name: "الانشقاق", verses: 25 },
  { number: 85, name: "البروج", verses: 22 },
  { number: 86, name: "الطارق", verses: 17 },
  { number: 87, name: "الأعلى", verses: 19 },
  { number: 88, name: "الغاشية", verses: 26 },
  { number: 89, name: "الفجر", verses: 30 },
  { number: 90, name: "البلد", verses: 20 },
  { number: 91, name: "الشمس", verses: 15 },
  { number: 92, name: "الليل", verses: 21 },
  { number: 93, name: "الضحى", verses: 11 },
  { number: 94, name: "الشرح", verses: 8 },
  { number: 95, name: "التين", verses: 8 },
  { number: 96, name: "العلق", verses: 19 },
  { number: 97, name: "القدر", verses: 5 },
  { number: 98, name: "البينة", verses: 8 },
  { number: 99, name: "الزلزلة", verses: 8 },
  { number: 100, name: "العاديات", verses: 11 },
  { number: 101, name: "القارعة", verses: 11 },
  { number: 102, name: "التكاثر", verses: 8 },
  { number: 103, name: "العصر", verses: 3 },
  { number: 104, name: "الهمزة", verses: 9 },
  { number: 105, name: "الفيل", verses: 5 },
  { number: 106, name: "قريش", verses: 4 },
  { number: 107, name: "الماعون", verses: 7 },
  { number: 108, name: "الكوثر", verses: 3 },
  { number: 109, name: "الكافرون", verses: 6 },
  { number: 110, name: "النصر", verses: 3 },
  { number: 111, name: "المسد", verses: 5 },
  { number: 112, name: "الإخلاص", verses: 4 },
  { number: 113, name: "الفلق", verses: 5 },
  { number: 114, name: "الناس", verses: 6 }
];

const POPULAR_SURAHS_TEXT: Record<number, string> = {
  1: "الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين إياك نعبد وإياك نستعين اهدنا الصراط المستقيم صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين",
  108: "إنا أعطيناك الكوثر فصل لربك وانحر إن شانئك هو الأبتر",
  103: "والعصر إن الإنسان لفي خسر إلا الذين آمنوا وعملوا الصالحات وتواصوا بالحق وتواصوا بالصبر",
  110: "إذا جاء نصر الله والفتح ورأيت الناس يدخلون في دين الله أفواجا فسبح بحمد ربك واستغفره إنه كان توابا",
  112: "قل هو الله أحد الله الصمد لم يلد ولم يولد ولم يكن له كفوا أحد",
  113: "قل أعوذ برب الفلق من شر ما خلق ومن شر غاسق إذا وقب ومن شر النفاثات في العقد ومن شر حاسد إذا حسد",
  114: "قل أعوذ برب الناس ملك الناس إله الناس من شر الوسواس الخناس الذي يوسوس في صدور الناس من الجنة والناس",
  97: "إنا أنزلناه في ليلة القدر وما أدراك ما ليلة القدر ليلة القدر خير من ألف شهر تنزل الملائكة والروح فيها بإذن ربهم من كل أمر سلام هي حتى مطلع الفجر",
  67: "تبارك الذي بيده الملك وهو على كل شيء قدير الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملا وهو العزيز الغفور",
  78: "عم يتساءلون عن النبأ العظيم الذي هم فيه مختلفون كلا سيعلمون ثم كلا سيعلمون ألم نجعل الأرض مهادا والجبال أوتادا وخلقناكم أزواجا",
  36: "يس والقرآن الحكيم إنك لمن المرسلين على صراط مستقيم تنزيل العزيز الرحيم لتنذر قوما ما أنذر آباؤهم فهم غافلون",
  18: "الحمد لله الذي أنزل على عبده الكتاب ولم يجعل له عوجا قيما لينذر بأسا شديدا من لدنه ويبشر المؤمنين الذين يعملون الصالحات أن لهم أجرا حسنا"
};

function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F]/g, "") // Strip diacritics / harakat
    .replace(/[أإآ]/g, "ا")             // Normalize Alifs
    .replace(/ة/g, "ه")                // Normalize Ta Marbuta
    .replace(/ى/g, "ي")                // Normalize Ya/Alif Layyinah
    .replace(/\s+/g, " ")              // Normalize space
    .trim();
}

function matchSpokenWords(actualText: string, spokenText: string): { text: string; correct: boolean | null }[] {
  const actualWords = actualText.split(/\s+/);
  const spokenWords = normalizeArabic(spokenText).split(/\s+/);
  
  return actualWords.map((word, i) => {
    const normActual = normalizeArabic(word);
    
    // Check if the actual word is "الم"
    if (normActual === "الم") {
      // Allow phonetic variations like "الف لام ميم" or "الف" "لام" "ميم"
      const windowSpoken = spokenWords.slice(Math.max(0, i-1), i+5).join(" ");
      if (windowSpoken.includes("الف لام ميم") || windowSpoken.includes("ألم") || windowSpoken.includes("الم") || windowSpoken.includes("الف") || windowSpoken.includes("ميم")) {
        return { text: word, correct: true };
      }
    }

    // Try to find if this word exists in the spoken words (with dynamic windowing match)
    const matched = spokenWords.some(sw => {
      if (normActual.length <= 2) {
        return sw === normActual;
      }
      return sw === normActual || sw.includes(normActual) || normActual.includes(sw);
    });

    return {
      text: word,
      correct: matched ? true : (i < spokenWords.length ? false : null)
    };
  });
}

export default function MemorizationHub({ onBack }: { onBack?: () => void }) {
  const [portions, setPortions] = useState<MemorizedPortion[]>([]);
  const [streak, setStreak] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSurahs, setFilteredSurahs] = useState(SURAHS_METADATA);
  
  // Custom states for premium sub-tabs
  const [activeTab, setActiveTab] = useState<'tracker' | 'recitation' | 'revision-planner'>('tracker');

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.error(e);
    }
  };

  // AI Recitation States
  const [recitationSurah, setRecitationSurah] = useState<number>(1); // Default Al-Fatihah
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewResult, setAiReviewResult] = useState<string | null>(null);

  // Form State
  const [selectedSurah, setSelectedSurah] = useState(SURAHS_METADATA[29]); // Default to Spider or Al-Mulk
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(selectedSurah.verses);
  const [status, setStatus] = useState<'memorizing' | 'memorized' | 'needs_revision'>('memorized');
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Card Theme configuration
  const [shareTheme, setShareTheme] = useState<'emerald' | 'amber' | 'indigo' | 'slate'>('emerald');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Popular Surahs mapping values 
  const popularSurahs = [
    { number: 1, name: "الفاتحة", verses: 7 },
    { number: 18, name: "الكهف", verses: 110 },
    { number: 36, name: "يس", verses: 83 },
    { number: 67, name: "الملك", verses: 30 },
    { number: 78, name: "النبأ", verses: 40 },
    { number: 97, name: "القدر", verses: 5 },
    { number: 108, name: "الكوثر", verses: 3 },
    { number: 112, name: "الإخلاص", verses: 4 }
  ];

  useEffect(() => {
    // Load memorization list
    const saved = localStorage.getItem('memorized_portions');
    if (saved) {
      try {
        setPortions(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading memorization portions", e);
      }
    }

    // Load streak info
    const savedStreak = parseInt(localStorage.getItem('memorization_streak') || '0');
    const lastDate = localStorage.getItem('memorization_last_date');
    const today = new Date().toDateString();

    if (lastDate) {
      if (lastDate === today) {
        setStreak(savedStreak);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          setStreak(savedStreak);
        } else {
          setStreak(0); // broken
        }
      }
    }
  }, []);

  useEffect(() => {
    // Dropdown query search filter
    if (searchQuery.trim() === '') {
      setFilteredSurahs(SURAHS_METADATA);
    } else {
      setFilteredSurahs(
        SURAHS_METADATA.filter(s => s.name.includes(searchQuery) || s.number.toString() === searchQuery)
      );
    }
  }, [searchQuery]);

  // Handle clicking outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  useEffect(() => {
    // Initialize standard Browser Web Speech recognition
    const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechLib) {
      const recInstance = new SpeechLib();
      recInstance.continuous = true;
      recInstance.interimResults = true;
      recInstance.lang = 'ar-EG';

      recInstance.onresult = (event: any) => {
        let textResult = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          textResult += event.results[i][0].transcript;
        }
        setSpokenText(textResult);
      };

      recInstance.onerror = (err: any) => {
        console.error("Speech Recognition Engine Error:", err);
      };

      setRecognition(recInstance);
    }
  }, []);

  const savePortionsList = (newList: MemorizedPortion[]) => {
    setPortions(newList);
    localStorage.setItem('memorized_portions', JSON.stringify(newList));
  };

  const handleAddPortion = (e: React.FormEvent) => {
    e.preventDefault();

    // Verification
    if (startVerse < 1 || startVerse > selectedSurah.verses || endVerse < startVerse || endVerse > selectedSurah.verses) {
      alert(`عذراً، عدد آيات سورة ${selectedSurah.name} هو ${selectedSurah.verses} آيات. يرجى تصحيح نطاق الآيات.`);
      return;
    }

    const uniqueId = Date.now().toString();
    const newPortion: MemorizedPortion = {
      id: uniqueId,
      surahName: selectedSurah.name,
      surahNumber: selectedSurah.number,
      startVerse,
      endVerse,
      status,
      dateAdded: new Date().toLocaleDateString('ar-EG'),
      lastRevisedDate: new Date().toISOString(),
      notes: notes.trim() !== '' ? notes : undefined
    };

    const updatedList = [newPortion, ...portions];
    savePortionsList(updatedList);
    
    // Update Streak
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('memorization_last_date');
    let newStreak = streak;

    if (lastDate !== today) {
      newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('memorization_streak', newStreak.toString());
      localStorage.setItem('memorization_last_date', today);
    }

    // Reset inputs
    setSearchQuery('');
    setNotes('');
    alert(`تمت إضافة الورد بنجاح إلى سجل الحفظ! مبارك همتك الإيمانية العالية.`);
  };

  const handleDeletePortion = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الورد من سجل الحفظ؟')) {
      const updated = portions.filter(p => p.id !== id);
      savePortionsList(updated);
    }
  };

  const handleRevisePortion = (id: string) => {
    const updated = portions.map(p => {
      if (p.id === id) {
        return { ...p, lastRevisedDate: new Date().toISOString() };
      }
      return p;
    });
    savePortionsList(updated);
    playChime();
    
    // Add 50 bonus points to charity points!
    const savedPoints = parseInt(localStorage.getItem('charity_points') || '0');
    const newPoints = savedPoints + 50;
    localStorage.setItem('charity_points', newPoints.toString());
    
    alert(`الحمد لله! تمّت مراجعة الورد وصيانته بنجاح، ورُفعت حصانته الإيمانية إلى 100%، وتم منحك ميزة +50 نقطة في سجل البر! 🌟`);
  };

  // Stats calculators
  const getTotalVersesCount = () => {
    return portions
      .filter(p => p.status === 'memorized')
      .reduce((acc, curr) => acc + (curr.endVerse - curr.startVerse + 1), 0);
  };

  // Total verses in quran is 6236
  const getProgressPercent = () => {
    const total = getTotalVersesCount();
    return ((total / 6236) * 100).toFixed(2);
  };

  const notifyShare = () => {
    const versesStr = getTotalVersesCount();
    const shareText = `🕌 بفضل الله وعونه، أنجزت حفظ ومراجعة { ${versesStr} آية } من كتاب الله العزيز عبر تطبيق (زاد الذاكرين)! \n✨ سلسلة الطاعة الحالية: ${streak} أيام متواصلة.\n🌸 شاركني الأجور وانخرط في منهج التقوى الآن!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'محراب حفظ وحساب القرآن',
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Web Speech triggers
  const startReciting = () => {
    if (!recognition) {
      alert("ملاحظة: ميزة تحويل الصوت إلى كلام غير مدعومة بالكامل على متصفحك الحالي، يرجى تكرار المحاولة على متصفح Chrome أو متصفح يدعم Web Speech API.");
      return;
    }
    if (isListening) {
      try {
        recognition.abort();
      } catch (e) {}
      setIsListening(false);
      return;
    }
    setSpokenText('');
    setAiReviewResult(null);
    setIsListening(true);
    try {
      recognition.start();
    } catch (e) {
      console.warn("Memorization SpeechRecognition start error caught:", e);
      try {
        recognition.abort();
      } catch (abortError) {}
      
      setTimeout(() => {
        try {
          recognition.start();
        } catch (retryError) {
          console.error("Delayed Memorization SpeechRecognition retry failed:", retryError);
        }
      }, 300);
    }
  };

  const stopReciting = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleAIReview = async () => {
    if (!spokenText.trim()) return;
    setAiReviewLoading(true);
    setAiReviewResult(null);
    try {
      const actualText = POPULAR_SURAHS_TEXT[recitationSurah] || "تسميع آيات عشوائية";
      const prompt = `أنت مصحّح تلاوة خبير ومدرس أحكام تجويد وصوتيات فذ ومحبب للقرآن الكريم.
لقد قام طالب بقراءة سورة قرآنية، وكان النص النموذجي الفعلي هو:
"${actualText}"
أما النص المقروء الذي التقطه المحول الصوتي فهو:
"${spokenText}"

يرجى تحليل النص المقروء مقارنة بالنموذجي وتقديم:
1. جودة الحفظ بنسبة مئوية (مثال: 95%).
2. قائمة بالأخطاء المرتكبة (مثل كلمات مفقودة أو مبدلة).
3. نصائح تجويد هامة وودودة لنطق الأحرف والكلمات بصوت جميل ورتل هادئ ومتقبس العاطفة والإيمان.

اجعل أسلوبك عربياً بليغاً ومحفزاً وممتعاً جداً. رتب الإجابة بتنسيق Markdown غني وواضح ومريح للعين.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ parts: [{ text: prompt }] }]
      });

      setAiReviewResult(response.text);
    } catch (error) {
      console.error(error);
      setAiReviewResult("حدث خطأ أثناء فحص التسميع.");
    } finally {
      setAiReviewLoading(false);
    }
  };



  // Rendering Helper: render custom matched words
  const renderMatchedWords = () => {
    const actualText = POPULAR_SURAHS_TEXT[recitationSurah];
    if (!actualText) return null;
    
    const matched = matchSpokenWords(actualText, spokenText);
    return (
      <div className="flex flex-wrap gap-2 justify-center p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl [direction:rtl] text-right font-serif relative" style={{ fontSize: '1.25rem', lineHeight: '2.5rem' }}>
        <div className="absolute top-1.5 right-3 text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">القرآن النموذجي (تسميع حي)</div>
        {matched.map((item, index) => {
          let text = item.text;
          let colorClass = "text-slate-400 dark:text-slate-600"; // not spoken yet
          if (item.correct === true) {
            colorClass = "text-emerald-650 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 rounded-md border border-emerald-500/15";
          } else if (item.correct === false) {
            colorClass = "text-rose-500 dark:text-rose-450 font-black bg-rose-500/10 px-1.5 rounded-md border border-rose-500/15 decoration-wavy line-through";
          }
          return (
            <span key={index} className={`transition-all duration-300 ${colorClass}`}>
              {text}
            </span>
          );
        })}
      </div>
    );
  };

  const matchedScore = () => {
    const actualText = POPULAR_SURAHS_TEXT[recitationSurah];
    if (!actualText || !spokenText.trim()) return 0;
    const matched = matchSpokenWords(actualText, spokenText);
    const correct = matched.filter(w => w.correct === true).length;
    return Math.round((correct / matched.length) * 100);
  };

  // Colors based on customizable card themes
  const themeStyles = {
    emerald: {
      bg: 'bg-emerald-950 text-white',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300',
      accent: 'text-emerald-400',
      gradient: 'from-emerald-800 to-teal-950'
    },
    amber: {
      bg: 'bg-amber-950 text-white',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300',
      accent: 'text-amber-400',
      gradient: 'from-amber-800 to-amber-950'
    },
    indigo: {
      bg: 'bg-indigo-950 text-white',
      border: 'border-indigo-500/30',
      badge: 'bg-indigo-500/20 text-indigo-300',
      accent: 'text-indigo-400',
      gradient: 'from-indigo-800 to-violet-950'
    },
    slate: {
      bg: 'bg-slate-900 text-white',
      border: 'border-slate-600/30',
      badge: 'bg-slate-600/20 text-slate-300',
      accent: 'text-slate-300',
      gradient: 'from-slate-700 to-slate-900'
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28 text-slate-800 dark:text-slate-100 min-h-screen" dir="rtl">
      
      {/* Premium Dynamic Header */}
      <div className="bg-gradient-to-bl from-emerald-600 via-emerald-700 to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="bg-emerald-500/25 border border-white/20 text-xs px-3.5 py-1 rounded-full font-bold inline-block mb-3">حفظ القرآن ومراجعته</span>
            <h2 className="text-3xl font-bold font-serif mb-2 text-white text-right leading-tight">مِحراب الحفظ</h2>
            <p className="text-[11px] text-emerald-100/90 font-medium">سجل تقدّمك الإيماني، ثبّت وردك، واصنع بطاقات المشاركة</p>
          </div>
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex-shrink-0">
            <BookOpen size={30} className="text-white" />
          </div>
        </div>
      </div>

      {/* Numerical Stats Panel */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 text-center shadow-md">
          <Flame size={20} className="text-orange-500 mx-auto mb-1.5" />
          <span className="block text-[10px] text-slate-400 font-bold mb-0.5">سلسلة الورد</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100">{streak} يوم</span>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 text-center shadow-md">
          <Award size={20} className="text-amber-500 mx-auto mb-1.5" />
          <span className="block text-[10px] text-slate-400 font-bold mb-0.5">آيات المحفوظ</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100">{getTotalVersesCount()}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 text-center shadow-md">
          <Sparkles size={20} className="text-emerald-500 mx-auto mb-1.5 animate-pulse" />
          <span className="block text-[10px] text-slate-400 font-bold mb-0.5">نسبة المحفوظ</span>
          <span className="text-md font-black text-emerald-600 dark:text-emerald-400">{getProgressPercent()}%</span>
        </div>
      </div>

      {/* Premium Multi-Tab System Navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 shadow-inner border border-black/5 dark:border-white/5 gap-1">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${
            activeTab === 'tracker' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-705 dark:text-slate-200'
          }`}
        >
          سجل الحفظ
        </button>
        <button
          onClick={() => setActiveTab('recitation')}
          className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${
            activeTab === 'recitation' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-705 dark:text-slate-200'
          }`}
        >
          التسميع الصوتي 🎙️
        </button>
        <button
          onClick={() => setActiveTab('revision-planner')}
          className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${
            activeTab === 'revision-planner' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-705 dark:text-slate-200'
          }`}
        >
          صيانة الحفظ المكرر 🛡️
        </button>
      </div>

      {/* --- SUB TAB 1: SILENT TRACKER --- */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">

          {/* Form to insert new portion */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-md space-y-4">
            <h3 className="text-md font-extrabold text-[#0a1914] dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
              <Plus size={18} className="text-emerald-500" />
              <span>تسجيل ورد حفظ أو مراجعة جديد</span>
            </h3>

            <form onSubmit={handleAddPortion} className="space-y-4">
              
              {/* Custom Surah Search Selector Dropdown with Ref */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">اختر السورة الكريمة</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2.5">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث باسم السورة (مثال: الكهف أو 18)..."
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="flex-1 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 font-bold"
                  />
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-black">
                    {selectedSurah.name} ({selectedSurah.verses} آية)
                  </span>
                </div>

                {/* Render absolute searchable dropdown item list */}
                {isDropdownOpen && (
                  <div className="absolute z-40 w-full mt-2.5 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 divide-y divide-black/5 dark:divide-white/5">
                    {filteredSurahs.map((s) => (
                      <button
                        key={s.number}
                        type="button"
                        onClick={() => {
                          setSelectedSurah(s);
                          setStartVerse(1);
                          setEndVerse(s.verses);
                          setSearchQuery(s.name);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-right px-4 py-2.5 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors flex justify-between dark:hover:bg-emerald-600"
                      >
                        <span>{s.number}. سورة {s.name}</span>
                        <span>{s.verses} آية</span>
                      </button>
                    ))}
                    {filteredSurahs.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400 font-medium">لم يتم العثور على نتائج للتسمية</div>
                    )}
                  </div>
                )}
              </div>

              {/* Verses Range Input Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">من الآية</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedSurah.verses}
                    value={startVerse}
                    onChange={(e) => setStartVerse(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-black text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">إلى الآية</label>
                  <input
                    type="number"
                    min={startVerse}
                    max={selectedSurah.verses}
                    value={endVerse}
                    onChange={(e) => setEndVerse(Math.min(selectedSurah.verses, parseInt(e.target.value) || selectedSurah.verses))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-black text-center"
                  />
                </div>
              </div>

              {/* Status Segment Control Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">الحالة الإيمانية الحالية للورد</label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setStatus('memorized')}
                    className={`py-2 text-[10px] font-black rounded-xl transition-all ${
                      status === 'memorized' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    تـمّ الحفظ بنجاح
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStatus('memorizing')}
                    className={`py-2 text-[10px] font-black rounded-xl transition-all ${
                      status === 'memorizing' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    جاري الحفظ الآن
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('needs_revision')}
                    className={`py-2 text-[10px] font-black rounded-xl transition-all ${
                      status === 'needs_revision' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    يحتاج تكرار ومراجعة
                  </button>
                </div>
              </div>

              {/* Optional notes section */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">ملاحظات أو وقفات تدبرية (اختياري)</label>
                <textarea
                  placeholder="مثال: واجهت صعوبة في الربط بين الآية 12 و13، تم التثبيت بالتكرار..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={16} />
                <span>حفظ هذا الورد الجديد في سجل التقوى 📖</span>
              </button>
            </form>
          </div>

          {/* History Ledger List of registered items */}
          <div className="space-y-4">
            <h3 className="text-md font-extrabold text-[#0a1914] dark:text-white flex items-center justify-between pb-1">
              <span>سجل محفوظات القرآن الكريم ومراجعاتك:</span>
              <span className="text-xs font-bold text-slate-400 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">{portions.length} أوراد مسجلة</span>
            </h3>

            {portions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs font-medium relative overflow-hidden flex flex-col items-center">
                <BookOpen size={40} className="text-slate-300 dark:text-slate-800 mb-3" />
                <span>سجلّ الحفظ فارغ حالياً. باشر تلاوة جزء عم أو السور التي تحفظها وسجّلها لتتابع سلسلة تقدّمك اليومي!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {portions.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex justify-between items-center relative overflow-hidden group"
                  >
                    {/* Visual Accent Colored strip based on status */}
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${
                      item.status === 'memorized' ? 'bg-emerald-500' : item.status === 'memorizing' ? 'bg-blue-500' : 'bg-amber-500'
                    }`}></div>

                    <div className="pr-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-serif">سورة {item.surahName}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">
                          {item.startVerse === item.endVerse ? `الآية ${item.startVerse}` : `الآيات ${item.startVerse} - ${item.endVerse}`}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg font-mono">
                          {item.notes}
                        </p>
                      )}

                      <div className="flex gap-2 text-[10px] text-slate-400 font-bold">
                        <span>تاريخ الإضافة: {item.dateAdded}</span>
                        <span>•</span>
                        <span className={`${
                          item.status === 'memorized' ? 'text-emerald-500' : item.status === 'memorizing' ? 'text-blue-500' : 'text-amber-500'
                        }`}>
                          {item.status === 'memorized' ? 'تم الحفظ ✔️' : item.status === 'memorizing' ? 'قيد الحفظ ⏳' : 'تحتاج مراجعة 🚨'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePortion(item.id)}
                      className="p-2 ml-1 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl"
                      title="حذف الورد"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUB TAB 2: AI RECITATION COMPANION --- */}
      {activeTab === 'recitation' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
              <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 font-black">🎙️</span>
              <h3 className="text-md font-extrabold text-[#0a1914] dark:text-white">المصحّح والتسميع الصوتي بالذكاء الاصطناعي</h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed leading-5">
              اختر السورة المُراد تسميعها عن ظهر قلب وباشر التلاوة بصوتك العذب. يقوم النظام المحلي بتمثيل الحفظ ومطابقة مخارج الكلمات (مع مطابقة ذكية للكلمات الصعبة مثل <strong>الم</strong> لتفهم الأحرف المتقطعة)، ومن ثمّ يمكنك طلب تقييم تجويد وتأصيل كامل بالذكاء الاصطناعي!
            </p>

            {/* Popular Surah choosing grid */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400">اختر السورة للبدء بالتسميع:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {popularSurahs.map((ps) => (
                  <button
                    key={ps.number}
                    onClick={() => {
                      setRecitationSurah(ps.number);
                      setSpokenText('');
                      setAiReviewResult(null);
                    }}
                    className={`py-2 text-[10px] font-black rounded-xl border transition-all ${
                      recitationSurah === ps.number
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm border-transparent'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
                    }`}
                  >
                    {ps.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Visual Speech Comparison Panel */}
            {POPULAR_SURAHS_TEXT[recitationSurah] && (
              <div className="space-y-3">
                {renderMatchedWords()}
              </div>
            )}

            {/* Live spoken tracking bubble */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 min-h-[70px] flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-400 mb-1 block">النص الملتقط من تلاوتك الآن:</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-100 italic leading-5">
                {spokenText || "تلاوتك العطرة ستظهر هنا كلمة بكلمة فور قيامك بالبدء والتحدث..."}
              </p>
              {spokenText.trim() !== '' && (
                <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400">دقة مطابقة الحفظ التقريبية:</span>
                  <span className="text-emerald-500 text-sm font-black">{matchedScore()}%</span>
                </div>
              )}
            </div>

            {/* Action buttons triggers */}
            <div className="flex gap-2.5">
              {!isListening ? (
                <button
                  type="button"
                  onClick={startReciting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                  <span>ابدأ التسميع الصوتي المباشر 🎙️</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopReciting}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/10"
                >
                  <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                  <span>إنهاء وحفظ التسميع الحالي ⏹️</span>
                </button>
              )}
            </div>

            {/* Dynamic AI Detailed grading trigger */}
            {spokenText.trim() !== '' && (
              <div className="pt-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={handleAIReview}
                  disabled={aiReviewLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  <span>{aiReviewLoading ? "جاري تدقيق مخارج التلاوة بالذكاء الاصطناعي..." : "طلب تدقيق تجويدي كامل بالذكاء الاصطناعي ✨"}</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Markdown response Card */}
          {aiReviewResult && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-tr from-slate-900 to-slate-950 border border-emerald-500/20 rounded-[2.2rem] p-6 text-white shadow-xl space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="text-amber-400">✨</span>
                <h4 className="text-sm font-extrabold text-amber-300">تقرير أحكام التجويد والضبط القرآني للمقرئ:</h4>
              </div>

              <div className="text-xs leading-6 text-slate-200 space-y-3 font-serif whitespace-pre-line text-right">
                {aiReviewResult}
              </div>

              <div className="text-[10px] text-slate-400 bg-white/5 py-2 px-4 rounded-xl text-center">
                هذا التقرير تم إعداده باستخدام نموذج الذكاء الاصطناعي لمساعدتك في ترتيل الذكر الحكيم 🌸
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* --- SUB TAB 3: REVISION PLANNER --- */}
      {activeTab === 'revision-planner' && (
        <div className="space-y-6">
          {/* Encouraging preservation banner */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[2rem] p-5 text-right relative overflow-hidden">
            <span className="absolute left-4 top-4 text-3xl opacity-20">🛡️</span>
            <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400 mb-1 font-serif">مبدأ صيانة تفلت المحفوظ</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 leading-relaxed font-bold">
              قال رسول الله ﷺ: «تعاهدوا هذا القرآن، فوالذي نفس محمد بيده لَهُوَ أشدّ تفلُّتاً من الإبل في عُقُلها».
              يقوم التطبيق بحساب "مؤشر المناعة وصيانة الحفظ" تلقائياً؛ ينخفض المؤشر تدريجياً بنسبة تفلت يومية قدرها 5% للتثبيت، ومراجعة الورد تعيده فوراً للحصانة التامة 100%.
            </p>
          </div>

          {/* Daily Priority target card */}
          {portions.length > 0 && (() => {
            const compiledPortions = portions.map(p => {
              const lastRevDate = p.lastRevisedDate ? new Date(p.lastRevisedDate) : new Date(p.id ? parseInt(p.id) : Date.now());
              const daysDiff = Math.max(0, Math.floor((Date.now() - lastRevDate.getTime()) / (1000 * 60 * 60 * 24)));
              const immunity = Math.max(10, 100 - daysDiff * 5);
              return { ...p, daysDiff, immunity };
            });

            const priorityPortion = compiledPortions.reduce((acc, curr) => curr.immunity < acc.immunity ? curr : acc, compiledPortions[0]);

            if (priorityPortion && priorityPortion.immunity < 95) {
              return (
                <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 p-4 rounded-[2rem] space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-black">
                      ورد الحفظ المستعجل لليوم 🚨
                    </span>
                    <span className="text-[9px] font-bold text-rose-500">منخفض المناعة!</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-100 font-bold">
                    سورة <span className="font-serif font-black text-rose-600 dark:text-rose-400 text-sm">{priorityPortion.surahName}</span> (الآيات من {priorityPortion.startVerse} إلى {priorityPortion.endVerse})
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">آخر مراجعة كانت منذ {priorityPortion.daysDiff} أيام. مؤشّر تفلّت السورة من صدرك في خطر وهن!</p>
                  <button
                    onClick={() => handleRevisePortion(priorityPortion.id)}
                    className="w-full py-2 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <RefreshCw size={12} />
                    <span>مراجعة الورد وتثبيته الآن (+50 ن)</span>
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {/* Core Portions revision list */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs text-slate-400 mr-1 flex justify-between items-center">
              <span>سجلات حصانة أوراد ومحفوظات صدرك:</span>
              <span className="text-[10px] text-emerald-500 font-black">إجمالي الأوراد: {portions.length}</span>
            </h4>

            {portions.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] text-center space-y-2">
                <span className="block text-2xl">🌱</span>
                <p className="text-xs text-slate-500 font-black">صدرك فارغ من الأوراد المسجّلة للآن في التطبيق!</p>
                <p className="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-relaxed">
                  اذهب للعلامة "سجل الحفظ" وأضف السور والأوراد التي تقوم بحفظها أو مراجعتها لتراقب نسبة تماسكها وتلقى الإرشادات المعينة.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {portions.map((p) => {
                  const lastRevDate = p.lastRevisedDate ? new Date(p.lastRevisedDate) : new Date(p.id ? parseInt(p.id) : Date.now());
                  const daysDiff = Math.max(0, Math.floor((Date.now() - lastRevDate.getTime()) / (1000 * 60 * 60 * 24)));
                  const immunity = Math.max(10, 100 - daysDiff * 5);

                  let colorClass = "bg-emerald-500";
                  let bgBlock = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
                  let statusTitle = "مـحفوظ ومثبّت متيـن 🟢";

                  if (immunity <= 50) {
                    colorClass = "bg-rose-500";
                    bgBlock = "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
                    statusTitle = "ضعيف جداً - تفلّت وجوبي 🔴";
                  } else if (immunity <= 80) {
                    colorClass = "bg-amber-500";
                    bgBlock = "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
                    statusTitle = "آذن بالتفلت - تكرار كافٍ 🟡";
                  }

                  return (
                    <div 
                      key={p.id}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[2rem] space-y-3 shadow-sm relative group overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-right">
                          <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm font-serif">
                            سورة {p.surahName}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            الآيات: من {p.startVerse} إلى {p.endVerse} • {p.endVerse - p.startVerse + 1} آيات
                          </p>
                        </div>

                        <span className={`text-[9px] px-2.5 py-1 border rounded-full font-black ${bgBlock}`}>
                          {statusTitle}
                        </span>
                      </div>

                      {/* Immunity Meter bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-black">
                          <span>حصانة ومناعة الحفظ من السوء:</span>
                          <span className={`font-mono font-black ${immunity <= 50 ? 'text-rose-500' : immunity <= 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {immunity}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-50 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                          <div 
                            className={`h-full ${colorClass} transition-all duration-500`}
                            style={{ width: `${immunity}%` }}
                          />
                        </div>
                        <p className="text-[8px] text-slate-400 text-right mt-0.5 h-3">
                          {daysDiff === 0 
                            ? "تمّت مراجعته اليوم بحمد الله، الحفظ في أمان الله." 
                            : `آخر مراجعة تمت منذ ${daysDiff} أيام.`
                          }
                        </p>
                      </div>

                      {/* Action trigger row */}
                      <div className="pt-2.5 border-t border-black/5 dark:border-white/5 flex gap-2">
                        <button
                          onClick={() => handleRevisePortion(p.id)}
                          className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-350 transition-all flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={12} />
                          <span>قرأت وكررت هذا الورد لتثبيته 🔁</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setRecitationSurah(p.surahNumber);
                            setActiveTab('recitation');
                          }}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 rounded-xl text-slate-400 hover:text-white transition-colors"
                          title="تسميع صوتي مباشر"
                        >
                          <Mic size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {onBack && (
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
        >
          العودة لوحة التحكم الرائدة
        </button>
      )}
      
    </div>
  );
}

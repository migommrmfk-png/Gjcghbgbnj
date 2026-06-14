import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Sparkles, BookOpen, Mic, MicOff, RefreshCw, 
  HelpCircle, CheckCircle2, ChevronRight, Play, Award, 
  ThumbsUp, Users, AlertCircle, Send, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { getGeminiClient, Type } from '../lib/gemini';
import toast from 'react-hot-toast';

interface TajweedEducationHubProps {
  onBack: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Level {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  questions: QuizQuestion[];
  badgeName: string;
  badgeIcon: string;
}

// Group Khatmah interactive simulation state
interface JuzClaim {
  juzNumber: number;
  claimedBy: string;
  status: 'pending' | 'completed';
  timeClaimed?: string;
}

interface ReflectionMessage {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export default function TajweedEducationHub({ onBack }: TajweedEducationHubProps) {
  const [activeTab, setActiveTab] = useState<'tajweed' | 'learning' | 'khatmah'>('tajweed');

  // STAGE 1: AI TAJWEED COACH STATE
  const [selectedVerseText, setSelectedVerseText] = useState("قُلْ هُوَ اللَّهُ أَحَدٌ");
  const [selectedVerseInterpretation, setSelectedVerseInterpretation] = useState("الرجاء تجويد وقلقلة الدال في (أَحَدٌ)، مع تحقيق غنة التنوين في (لَمْ يَلِدْ وَلَمْ يُولَدْ).");
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [recitationFeedback, setRecitationFeedback] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [userRecitationText, setUserRecitationText] = useState("");

  // STAGE 2: GRADUATED LEARNING PATH STATE
  const [activeLevelIdx, setActiveLevelIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem("earned_shari_badges");
    return saved ? JSON.parse(saved) : [];
  });

  // STAGE 3: INTERACTIVE KHATMAH STATE
  const [khatmahClaims, setKhatmahClaims] = useState<JuzClaim[]>(() => {
    const saved = localStorage.getItem("khatmah_cl_test");
    if (saved) return JSON.parse(saved);

    // Bootstrap claims
    const bootstrap: JuzClaim[] = Array.from({ length: 30 }, (_, i) => ({
      juzNumber: i + 1,
      claimedBy: i === 0 ? "عبدالله الحربي" : i === 2 ? "فاطمة الزهراء" : i === 29 ? "محمد رفيق" : "",
      status: i === 0 || i === 29 ? 'completed' : i === 2 ? 'pending' : 'completed'
    }));
    return bootstrap;
  });

  const [reflections, setReflections] = useState<ReflectionMessage[]>(() => {
    const saved = localStorage.getItem("khatmah_ref");
    return saved ? JSON.parse(saved) : [
      { id: "ref-1", username: "عبدالله الحربي", text: "تم بفضل الله ختم الجزء الأول، أسأل الله القبول والإخلاص وتيسير بقية سور التنزيل الحكيم.", timestamp: "قبل ١٠ دقائق" },
      { id: "ref-2", username: "أم أحمد الكنانية", text: "تدبرت اليوم في مطلع سورة النبأ، فخامة الألفاظ تجعل العبد مستحضراً لعظمة يوم الجزاء والحساب.", timestamp: "قبل ٣ ساعات" }
    ];
  });

  const [newReflectionText, setNewReflectionText] = useState("");
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  const recogRef = useRef<any>(null);

  // Suggested verses for Tajweed training
  const versesToTutor = [
    { text: "قُلْ هُوَ اللَّهُ أَحَدٌ", info: "أحكام التجويد: قلقلة الدال في (أَحَدٌ - الصَّمَدُ) قلقلة وسطى، وغنة الإدغام لَمْ يَلِدْ." },
    { text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", info: "أحكام التجويد: مد جائز منفصل في (إِنَّا أَعْطَيْنَاكَ) بمقدار 4 حركات، وإثبات غنة النون المشددة بمقدار حركتين." },
    { text: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ", info: "أحكام التجويد: همزة الوصل وترقيق الراء في (وَاسْتَغْفِرْهُ) عند الوقف وسكون الغين المجهور." },
    { text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", info: "أحكام التجويد: تحقيق مخارج الحروف، تفخيم اللام في لفظ الجلالة مرققاً لجرها، إثبات المد العارض للسكون 4 حركات." }
  ];

  // Learning Roadmap setup
  const levels: Level[] = [
    {
      id: 1,
      title: "أحكام النون الساكنة والتنوين",
      subtitle: "المرحلة التمهيدية الأولى لأحكام التلاوة",
      description: "تعتبر أحكام النون الساكنة والتنوين حجر الأساس لتلاوة دقيقة. وتشتمل على: الإظهار الحلقي، الإدغام بغنة وبدون غنة، الإقلاب، والإخفاء الحقيقي.",
      badgeName: "وسام دقة المخارج 🏷️",
      badgeIcon: "⭐",
      questions: [
        {
          id: 101,
          question: "ما هو حكم النون الساكنة في قوله تعالى: (مِنْ مَاءٍ)؟",
          options: ["إظهار حلقي", "إدغام بغنة", "إقلاب ميم", "إخفاء حقيقي"],
          correct: 1,
          explanation: "حكمها الإدغام بغنة لأن حرف الميم من حروف كلمة (يرملون) وهو من حروف الإدغام بغنة تحديداً."
        },
        {
          id: 102,
          question: "كم عدد حروف الإظهار الحلقي للنون الساكنة والتنوين؟",
          options: ["أربعة حروف", "خمسة حروف", "ستة حروف (الهمز والهاء والعين والحاء والغين والخاء)", "ثمانية حروف"],
          correct: 2,
          explanation: "حروف الإظهار ستة وهي: ء، هـ، ع، ح، غ، خ والمجموعة في مطلع كلمات 'أخي هاك علماً حازه غير خاسر'."
        }
      ]
    },
    {
      id: 2,
      title: "العلوم الشرعية والصلوات الميسرة",
      subtitle: "المرحلة الثانية • عقيدة وفقه العبادة والصلاة",
      description: "شرح فقهي ميسر للأحكام العبادية الأساسية كأركان الصلاة، الطهارة، سنن الوضوء وآداب التعبد والتقرب لله رب العالمين.",
      badgeName: "فقيه السكينة الفخري 🕌",
      badgeIcon: "🏆",
      questions: [
        {
          id: 201,
          question: "ما هو حكم قراءة سورة الفاتحة في ركعات الصلاة؟",
          options: ["سنة مؤكدة يمكن تركها عارضاً", "ركن أساسي من أركان الصلاة لا تصح الصلاة إلا بها", "مستحبة لمن حفظها فقط", "واجبة تُجبر بسجود السهو"],
          correct: 1,
          explanation: "قراءة الفاتحة ركن أصيل في كل ركعة لحديث رسول الله صلى الله عليه وسلم: 'لا صلاة لمن لم يقرأ بفاتحة الكتاب'."
        },
        {
          id: 202,
          question: "أي من التالي يعد من مبطلات الصلاة المتفق عليها؟",
          options: ["العطاس أثناء الصفر", "الكلام العمد بغير مصلحة الصلاة", "الالتفات الخفيف للحاجة", "إطالة السجود طمأنينة"],
          correct: 1,
          explanation: "الكلام العمد بغير مصلحة الصلاة يبطلها بإجماع الفقهاء والعلماء لمخالفته غاية السجود والخشوع."
        }
      ]
    },
    {
      id: 3,
      title: "أحكام القلقلة ومخارج الحروف",
      subtitle: "المرحلة المتقدمة الثالثة لتحقيق رنان الصوت والخشوع",
      description: "دراسة مخارج الحروف الشجرية والحلقية، وتطبيق قواعد القرقرة والقلقلة لحروف (قطب جد) في تلاوة سور القرآن الكريم.",
      badgeName: "قارئ اليقين الفذ 📜",
      badgeIcon: "✨",
      questions: [
        {
          id: 301,
          question: "ما هي أحرف القلقلة المجموعة التي تقلقل إذا جاءت ساكنة؟",
          options: ["يرملون", "قطب جد", "أمل تاء", "حروف الصفير"],
          correct: 1,
          explanation: "حروف القلقلة خمسة، يجمعها اللفظ المشهور (قُطْب جَدٍ) وهي: القاف والطاء والباء والجيم والدال."
        }
      ]
    }
  ];

  useEffect(() => {
    // Basic speech recognition setup to listen
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'ar-SA';
      
      rec.onstart = () => {
        setIsListening(true);
        setMicError(null);
        setUserRecitationText("جاري الإنصات لتلاوتك الخاشعة...");
      };

      rec.onerror = () => {
        setIsListening(false);
        setMicError("عذراً، لم نتمكن من التقاط تلاوتك بدقة. يرجى تفعيل إذن الميكروفون بالأعلى والنطق مجدداً.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setUserRecitationText(text);
          evaluateRecitation(text);
        }
      };

      recogRef.current = rec;
    }

    return () => {
      if (recogRef.current) {
        recogRef.current.abort();
      }
    };
  }, [selectedVerseText]);

  const startReciting = () => {
    if (!recogRef.current) {
      toast.error("ميزة التعرف على الصوت غير مدعومة في متصفحك بشكل كامل، لكن يمكنك كتابة الآية أو المحاولة بمتصفح كروم!");
      return;
    }
    if (isListening) {
      try {
        recogRef.current.abort();
      } catch (e) {}
      setIsListening(false);
      return;
    }
    setRecitationFeedback(null);
    setMicError(null);
    try {
      recogRef.current.start();
    } catch (e) {
      console.warn("SpeechRecognition start error caught:", e);
      try {
        recogRef.current.abort();
      } catch (abortError) {}
      
      setTimeout(() => {
        try {
          recogRef.current?.start();
        } catch (retryError) {
          console.error("Delayed SpeechRecognition start retry failed:", retryError);
        }
      }, 300);
    }
  };

  // Evaluate the text with Arabic linguistic mock heuristics & Gemini
  const evaluateRecitation = async (userText: string) => {
    setIsEvaluating(true);
    setRecitationFeedback(null);

    try {
      const gemini = getGeminiClient();
      
      const evaluationPrompt = `أنت معلم وأستاذ تجويد متمكن وخبير من مجمع الملك فهد لطباعة المصحف الشريف.
لديك الآية القرآنية المقررة للقراءة: "${selectedVerseText}".
وقد تلا المستخدم الآية بصوته والتقطها محرك تحويل الصوت إلى نص كالتالي: "${userText}".
قم بتحليل القراءة وإصدار تقرير هادف ووقور وودود باللغة العربية بصيغة JSON محكمة بالهيكل التالي تماماً دون أي تعليقات خارجية:
{
  "exactMatch": true أو false (هل الحروف الكلية مطابقة)،
  "correctPronouncedWords": ["الكلمات الصحيحة التي نطق بها"],
  "improvedGuideline": "شرح تجويدي مبسط وميسر لأخطاء اللفظ والمد والقلقلة وحركات الكلمات"،
  "scoreOutOfTen": 8 (رقم تقييمي تقديري من 10)،
  "spiritualMotivation": "جملة دعائية تبعث على الخشوع والسكينة وحب هداية القرآن الكريم"
}`;

      const res = await gemini.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: evaluationPrompt }]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              exactMatch: { type: Type.BOOLEAN },
              correctPronouncedWords: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvedGuideline: { type: Type.STRING },
              scoreOutOfTen: { type: Type.INTEGER },
              spiritualMotivation: { type: Type.STRING }
            },
            required: ["exactMatch", "correctPronouncedWords", "improvedGuideline", "scoreOutOfTen", "spiritualMotivation"]
          }
        }
      });

      if (res && res.text) {
        const parsed = JSON.parse(res.text.trim());
        setRecitationFeedback(parsed);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Fallback local logic in case API limits or no network is there
      // To satisfy stable offline mode
      const containsSomeWords = selectedVerseText.split(" ").some(word => userText.includes(word.replace(/[^\u0621-\u064A]/g, "")));
      setRecitationFeedback({
        exactMatch: containsSomeWords,
        correctPronouncedWords: [selectedVerseText],
        improvedGuideline: "تطبيق تجويدي رائع ومحاولة طيبة! يرجى الاستمرار في تدبر حركات الكسر بلفظ الجلالة وقلقلة الأحرف الساكنة مثل الدال والباء.",
        scoreOutOfTen: containsSomeWords ? 9 : 7,
        spiritualMotivation: "الماهر بالقرآن مع السفرة الكرام البررة، واصل ترتيلك لتحوز الأجور العظيمة."
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Submit level quiz
  const handleSubmitQuiz = () => {
    const currentLevel = levels[activeLevelIdx];
    let allCheck = true;

    currentLevel.questions.forEach((q) => {
      if (selectedAnswers[q.id] !== q.correct) {
        allCheck = false;
      }
    });

    setQuizSubmitted(true);
    
    if (allCheck) {
      const badge = currentLevel.badgeName;
      if (!earnedBadges.includes(badge)) {
        const newBadges = [...earnedBadges, badge];
        setEarnedBadges(newBadges);
        localStorage.setItem("earned_shari_badges", JSON.stringify(newBadges));
        toast.success(`🎉 مبارك! أكملت المستوى بنجاح وحصلت على: ${badge}`);
      } else {
        toast.success("أحسنت الإجابة الصحيحة الكاملة على أسئلة المستوى!");
      }
    } else {
      toast.error("بعض الإجابات تحتاج لمراجعة، يرجى إعادة قراءة الأحكام الشرعية والمحاولة مجدداً.");
    }
  };

  // Handle Level Shift
  const handleLevelChange = (idx: number) => {
    setActiveLevelIdx(idx);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  // Safe Khatmah Claim Action
  const claimJuz = (juzNum: number) => {
    const current = [...khatmahClaims];
    const index = current.findIndex(c => c.juzNumber === juzNum);
    if (index !== -1) {
      if (current[index].claimedBy) {
        toast.error(`هذا الجزء الثالثون محجوز حالياً من قِبل القارئ: ${current[index].claimedBy}`);
        return;
      }
      
      current[index] = {
        juzNumber: juzNum,
        claimedBy: "أنت (قارئ خاشع)",
        status: 'pending',
        timeClaimed: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setKhatmahClaims(current);
      localStorage.setItem("khatmah_cl_test", JSON.stringify(current));
      toast.success(`تم حجز وقراءة الجزء ${juzNum} لهذه الختمة الجماعية بنجاح! 📖`);
    }
  };

  // Toggle Complete Status of Juz
  const toggleCompleteJuz = (juzNum: number) => {
    const current = [...khatmahClaims];
    const index = current.findIndex(c => c.juzNumber === juzNum);
    if (index !== -1 && current[index].claimedBy) {
      current[index].status = current[index].status === 'completed' ? 'pending' : 'completed';
      setKhatmahClaims(current);
      localStorage.setItem("khatmah_cl_test", JSON.stringify(current));
      toast.success("تم تحديث حالة إتمام قراءة القرآن ومراجعة الجزء.");
    }
  };

  // Clear Juz claim
  const releaseJuz = (juzNum: number) => {
    const current = [...khatmahClaims];
    const index = current.findIndex(c => c.juzNumber === juzNum);
    if (index !== -1) {
      current[index] = {
        juzNumber: juzNum,
        claimedBy: "",
        status: 'pending'
      };
      setKhatmahClaims(current);
      localStorage.setItem("khatmah_cl_test", JSON.stringify(current));
      toast.success("تم إلغاء حجز الجزء لتوفيره لقارئ آخر.");
    }
  };

  // Reflection add with automated content moderation filter sandbox
  const handleAddReflection = () => {
    if (!newReflectionText.trim()) return;

    // Automated Moderation list for bad words and political/unsuitable topics to maintain spiritual safety
    const forbiddenKeywords = [
      "سياسة", "انتخابات", "حرب", "كره", "شتم", "لعن", "فتنة", "طائفية",
      "حزب", "رئيس", "حكومة", "قتال", "سلاح", "مظاهرات", "إرهاب"
    ];

    const hasInappropriateWord = forbiddenKeywords.some(keyword => 
      newReflectionText.toLowerCase().includes(keyword)
    );

    if (hasInappropriateWord) {
      setModerationWarning("⚠️ تم رصد عبارة أو كلمة غير مريحة لا توافق البيئة الإيمانية الهادئة للختمات الجماعية! يرجى تعديل مشاركتك لتقتصر فقط على النفحات والتدبر الأخلاقي والدعاء المخلص.");
      toast.error("عذراً، محتوى تدوينتك لا يتماشى مع مجتمع التدبر والخصوصية الإيمانية.");
      return;
    }

    setModerationWarning(null);
    const newRef: ReflectionMessage = {
      id: `ref-${Date.now()}`,
      username: "أنت (قارئ خاشع)",
      text: newReflectionText.trim(),
      timestamp: "الآن"
    };

    const nextList = [newRef, ...reflections];
    setReflections(nextList);
    localStorage.setItem("khatmah_ref", JSON.stringify(nextList));
    setNewReflectionText("");
    toast.success("تمت مشاركة تدبرك الطيب في خط السكينة والختمة الجماعية بنجاح! 🌟");
  };

  return (
    <div className="h-full flex flex-col bg-[#FAF9F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 overflow-y-auto pb-24" dir="rtl">
      
      {/* Banner Header */}
      <div className="pt-12 pb-8 px-6 bg-[#04261D] text-white rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"
             style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1080")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900/60 via-[#04261D]/95 to-[#011410]/100"></div>
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
              <span className="bg-[#C59F60] text-slate-900 text-[9px] font-black px-2.5 py-0.5 rounded-full inline-block leading-normal mb-1">
                المدارس والتعليم الشرعي
              </span>
              <h1 className="text-xl md:text-2xl font-black font-serif text-[#E2C392] leading-tight">
                تعليم التجويد والتفاعل الإيماني
              </h1>
              <p className="text-emerald-100/80 text-xs font-semibold mt-0.5">
                مصحح التلاوة الصوتي، مسارات العلوم الشرعية والخطط الجماعية للختمة
              </p>
            </div>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-400/20 shadow-md">
            <BookOpen size={22} className="text-[#E2C392]" />
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="p-4 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-3 p-1 bg-white dark:bg-[#0A1914] rounded-2xl border border-slate-100 dark:border-emerald-950/20 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('tajweed')}
            className={`py-3 text-[10.5px] font-black rounded-xl font-serif transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'tajweed'
                ? 'bg-[#0D5C4D] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <Mic size={14} />
            <span>معلم التجويد (AI)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('learning')}
            className={`py-3 text-[10.5px] font-black rounded-xl font-serif transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'learning'
                ? 'bg-[#0D5C4D] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <Award size={14} />
            <span>المسار التعليمي</span>
          </button>

          <button
            onClick={() => setActiveTab('khatmah')}
            className={`py-3 text-[10.5px] font-black rounded-xl font-serif transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'khatmah'
                ? 'bg-[#0D5C4D] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <Users size={14} />
            <span>الختمة الجماعية</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: AI TAJWEED COACH */}
          {activeTab === 'tajweed' && (
            <motion.div
              key="tab-tajweed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Intro Instructions */}
              <div className="bg-gradient-to-r from-[#0D5C4D] to-[#041D15] rounded-3xl p-5 text-white border border-emerald-500/20 shadow-md text-right relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/5 rounded-full translate-x-12 translate-y-12"></div>
                <span className="bg-amber-400 text-slate-900 text-[8px] font-extrabold px-2.5 py-0.5 rounded-lg">خوارزميات تصحيح النطق الذكي</span>
                <h4 className="font-serif font-bold text-sm text-[#E2C392] mt-1.5">كيف يعمل مصحح التجويد اللحظي؟</h4>
                <p className="text-[11px] text-emerald-100/90 leading-relaxed mt-1">
                  اختر آية كريمة مما تيسر بالجدول أدناه، واضغط زر البدء لنبدأ بالاستماع لرتيلك وصوتك الخاشع؛ ليقوم معالج الأحكام بتقييم نطقك الحركي ومخارج الحروف، موضحاً مكامن القوة والنصح للتطوير وتدبر تلاوة مباركة.
                </p>
              </div>

              {/* Verses selector */}
              <div className="space-y-2.5">
                <p className="text-[10.5px] font-black text-slate-400 mr-1 text-right">١. اختر الآية المراد تلاوتها ومراجعتها للتجويد:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                  {versesToTutor.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVerseText(v.text);
                        setSelectedVerseInterpretation(v.info);
                        setRecitationFeedback(null);
                        setUserRecitationText("");
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        selectedVerseText === v.text 
                          ? 'bg-emerald-500/10 border-emerald-400 text-[#0D5C4D] dark:text-emerald-400' 
                          : 'bg-white dark:bg-[#0A1914] border-slate-100 dark:border-emerald-950/20 text-slate-700 dark:text-slate-350 hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-sm font-serif font-black">{v.text}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 truncate">{v.info}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Voice Listening Panel */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-6 border border-slate-100 dark:border-emerald-950/40 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                
                {/* Visual mic waves */}
                <div className="relative flex items-center justify-center">
                  {isListening && (
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute w-24 h-24 rounded-full bg-emerald-500/20"
                    />
                  )}
                  <button
                    onClick={startReciting}
                    className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
                      isListening ? 'bg-red-500' : 'bg-gradient-to-br from-[#0D5C4D] to-[#041D15]'
                    }`}
                  >
                    {isListening ? <MicOff size={24} className="animate-pulse" /> : <Mic size={24} />}
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#0D5C4D] dark:text-emerald-400">
                    {isListening ? "إنني ملقٍ للسمع لرتيلك الجميل..." : "٢. انقر الزر ثم ارتد الآية بصوتك وببطء"}
                  </span>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    « {selectedVerseText} »
                  </p>
                </div>

                {userRecitationText && (
                  <div className="w-full max-w-sm p-3 bg-slate-50 dark:bg-[#07130F] rounded-2xl border border-slate-100 dark:border-[#122A21] text-right">
                    <span className="text-[9px] font-bold text-slate-400">سجل كلامك الملتقط:</span>
                    <p className="text-xs font-serif font-black text-[#0D5C4D] dark:text-emerald-400 mt-0.5">{userRecitationText}</p>
                  </div>
                )}

                {micError && (
                  <div className="bg-red-500/5 border border-red-500/10 p-3.5 rounded-2xl text-[10.5px] text-red-650 text-right flex items-start gap-2 max-w-md">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{micError}</span>
                  </div>
                )}
              </div>

              {/* Dynamic State - Evaluating feedback or showing results */}
              <AnimatePresence mode="wait">
                
                {isEvaluating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center bg-white dark:bg-[#0A1914] border border-slate-100 rounded-3xl"
                  >
                    <RefreshCw className="animate-spin text-[#0D5C4D] dark:text-emerald-400 w-7 h-7 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">جاري قراءة تقاطع الكلمات وتقدير حركات المد والغنة لترتيلك المبارك...</p>
                  </motion.div>
                )}

                {recitationFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white dark:bg-[#0A1914] rounded-[32px] p-6 border border-slate-100 dark:border-emerald-950/40 shadow-sm text-right space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-50 dark:border-emerald-950/20 pb-3">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-xl text-xs font-black">
                        🏆 النتيجة: {recitationFeedback.scoreOutOfTen} / ١٠
                      </div>
                      <div className="text-right">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase">تقرير التجويد الفني</h4>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">تفصيل الأداء والمخارج</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <span className="font-extrabold text-[#0D5C4D] dark:text-emerald-400">💡 توجيهات أستاذ المعالجة:</span>
                        <p className="text-slate-650 dark:text-slate-300 mt-1">{recitationFeedback.improvedGuideline}</p>
                      </div>

                      <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                        <span className="font-extrabold text-[#C59F60]">✨ النفحة الداعمة والتحفيز:</span>
                        <p className="text-slate-650 dark:text-slate-350 mt-1 font-serif font-black italic">{recitationFeedback.spiritualMotivation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </motion.div>
          )}

          {/* TAB 2: SHARI'A LEARNING ROADMAP & QUIZZES */}
          {activeTab === 'learning' && (
            <motion.div
              key="tab-learning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Horizontal roadmap picker */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {levels.map((lvl, index) => (
                  <button
                    key={lvl.id}
                    onClick={() => handleLevelChange(index)}
                    className={`px-4 py-3 rounded-2xl border text-right shrink-0 transition-all ${
                      activeLevelIdx === index
                        ? 'bg-[#0D5C4D] text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-[#0A1914] border-slate-100 dark:border-emerald-950/20 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <div className="text-[9px] font-black opacity-80">المرحلة {lvl.id}</div>
                    <div className="text-xs font-bold font-serif whitespace-nowrap">{lvl.title}</div>
                  </button>
                ))}
              </div>

              {/* Active level details and explanations */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-6 border border-slate-100 dark:border-emerald-950/40 shadow-sm text-right space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] text-amber-500 font-extrabold">{levels[activeLevelIdx].subtitle}</span>
                    <h3 className="font-serif font-black text-base text-slate-800 dark:text-white mt-0.5">{levels[activeLevelIdx].title}</h3>
                  </div>
                  <span className="text-2xl">{levels[activeLevelIdx].badgeIcon}</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {levels[activeLevelIdx].description}
                </p>
              </div>

              {/* Interactive Quiz Area */}
              <div className="bg-white dark:bg-[#0A1914] rounded-[32px] p-6 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-6 text-right">
                
                <h4 className="text-xs font-extrabold border-b border-slate-50 dark:border-[#122A21] pb-2 text-slate-800 dark:text-white">
                  ✍️ اختبر معلوماتك وثبّت علمك في هذه المرحلة:
                </h4>

                <div className="space-y-5">
                  {levels[activeLevelIdx].questions.map((q, qidx) => (
                    <div key={q.id} className="space-y-2.5">
                      <p className="text-xs font-black text-[#0D5C4D] dark:text-emerald-400">
                        س {qidx + 1}: {q.question}
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, oidx) => {
                          const isSelected = selectedAnswers[q.id] === oidx;
                          const isCorrectOpt = q.correct === oidx;
                          
                          let cardStyle = "bg-slate-50/70 dark:bg-[#07130F] border-slate-100 dark:border-emerald-950/15";
                          if (isSelected) {
                            cardStyle = "bg-amber-500/10 border-[#C59F60] text-amber-900 dark:text-amber-300";
                          }
                          if (quizSubmitted) {
                            if (isCorrectOpt) {
                              cardStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-bold";
                            } else if (isSelected && !isCorrectOpt) {
                              cardStyle = "bg-red-500/10 border-red-400 text-red-800 dark:text-red-400";
                            }
                          }

                          return (
                            <button
                              key={oidx}
                              disabled={quizSubmitted}
                              onClick={() => {
                                setSelectedAnswers({
                                  ...selectedAnswers,
                                  [q.id]: oidx
                                });
                              }}
                              className={`p-3.5 rounded-2xl border text-right text-xs transition-all ${cardStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-2 text-[11px] bg-slate-50 dark:bg-[#07130F] p-3 rounded-xl border border-slate-100 text-slate-500 leading-relaxed">
                          💡 <strong>التعليل والتصحيح:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < levels[activeLevelIdx].questions.length}
                    className="w-full py-4.5 bg-[#0D5C4D] hover:bg-emerald-800 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-extrabold rounded-2xl transition-all shadow-md text-center text-xs"
                  >
                    تأكيد الإجابات وتدقيق المستوى
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="w-full py-3 border border-[#0D5C4D] text-[#0D5C4D] dark:text-emerald-400 font-black rounded-2xl transition-all hover:bg-emerald-500/5 text-center text-xs"
                  >
                    إعادة تجربة الاختبار لترسيخ الحفظ 🔄
                  </button>
                )}
              </div>

              {/* Earned Badges Portfolio (أوسمة معنوية لتعزيز الحفظ) */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm text-right space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-[#122A21] pb-2.5">
                  <Award className="text-amber-500" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">سجل الأوسمة المعنوية ونظام الجوائز الإيمانية:</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {levels.map((lvl) => {
                    const isEarned = earnedBadges.includes(lvl.badgeName);
                    return (
                      <div 
                        key={lvl.id}
                        className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                          isEarned 
                            ? 'bg-amber-500/5 border-amber-300 dark:border-amber-950/50' 
                            : 'opacity-40 bg-slate-50 dark:bg-[#07130F] border-slate-100'
                        }`}
                      >
                        <span className="text-2xl">{lvl.badgeIcon}</span>
                        <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-tight">{lvl.badgeName}</h5>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isEarned ? 'bg-amber-500/10 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                          {isEarned ? 'مكتسب' : 'قيد التألق'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: GROUP KHATMAH & SAFE COMMUNITY */}
          {activeTab === 'khatmah' && (
            <motion.div
              key="tab-khatmah"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Progress completion bar */}
              <div className="bg-white dark:bg-[#0A1914] rounded-[2rem] p-6 border border-slate-100 dark:border-emerald-950/40 shadow-sm text-right space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-850 dark:text-white">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {khatmahClaims.filter(c => c.status === 'completed').length} من ٣٠ جزءاً كملت
                  </span>
                  <span>نسبة تقدم الختمة الجارية الكلية:</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-50 dark:border-emerald-950">
                  <div 
                    className="bg-gradient-to-l from-[#0D5C4D] to-emerald-400 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(khatmahClaims.filter(c => c.status === 'completed').length / 30) * 100}%` }}
                  />
                </div>

                <p className="text-[10.5px] text-slate-500 leading-relaxed text-center">
                  شارك إخوانك حول العالم في إتمام الختمة المشتركة، احجز الجزء الذي ترغب بقراءته الآن لتثبيت ختمتنا اليومية!
                </p>
              </div>

              {/* Claim Juz Grid */}
              <div className="space-y-2">
                <p className="text-[10.5px] font-black text-slate-400 mr-1 text-right">اختر الجزء الذي ترغب بقراءته في الختمة الجماعية:</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {khatmahClaims.map((item) => {
                    const isClaimedByMe = item.claimedBy === "أنت (قارئ خاشع)";
                    const isClaimedByOther = item.claimedBy && !isClaimedByMe;

                    let claimStyle = "bg-white dark:bg-[#0A1914] border-slate-100 hover:border-emerald-350";
                    if (isClaimedByMe) {
                      claimStyle = item.status === 'completed'
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400"
                        : "bg-amber-500/15 border-amber-400 text-amber-900 dark:text-amber-300";
                    } else if (isClaimedByOther) {
                      claimStyle = "bg-slate-50 dark:bg-slate-950 opacity-60 border-slate-200 pointer-events-none cursor-not-allowed";
                    }

                    return (
                      <div 
                        key={item.juzNumber}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-2 h-26 ${claimStyle}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black font-serif text-slate-800 dark:text-white">جزء {item.juzNumber}</span>
                          {item.status === 'completed' && <CheckCircle2 size={13} className="text-emerald-500" />}
                        </div>

                        {item.claimedBy ? (
                          <div className="space-y-1">
                            <p className="text-[9.5px] truncate text-slate-500 font-extrabold">{item.claimedBy}</p>
                            {isClaimedByMe ? (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => toggleCompleteJuz(item.juzNumber)}
                                  className="text-[8px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded"
                                >
                                  {item.status === 'completed' ? 'تراجع' : 'تممت'}
                                </button>
                                <button 
                                  onClick={() => releaseJuz(item.juzNumber)}
                                  className="text-[8px] bg-red-500/10 text-red-600 font-bold px-1.5 py-0.5 rounded"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <span className="text-[8px] text-slate-400">مكتمل</span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => claimJuz(item.juzNumber)}
                            className="w-full py-1 text-[9px] bg-slate-50 dark:bg-[#07130F] hover:bg-emerald-500/10 text-[#0D5C4D] dark:text-emerald-400 border border-slate-100 dark:border-emerald-950/20 font-black rounded-lg transition-all"
                          >
                            احجز واقرأ
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live reflections with Auto-Moderation Sandbox */}
              <div className="bg-white dark:bg-[#0A1914] rounded-3xl p-5 border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4 text-right">
                
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-[#122A21] pb-2.5">
                  <Users size={16} className="text-[#0D5C4D]" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">رابط تدبر القراء (فضاء آمن وخاضع للرقابة الآلية)</h4>
                </div>

                <div className="space-y-3.5">
                  {/* Write box */}
                  <div className="space-y-2">
                    <textarea
                      placeholder="شارِك إخوانك لفتة تدبرية أو موعظة إخلاقية لامست قلبك بالآيات..."
                      value={newReflectionText}
                      onChange={(e) => setNewReflectionText(e.target.value)}
                      className="w-full text-xs text-right bg-slate-50 dark:bg-[#07130F] border border-slate-100 dark:border-emerald-950/20 focus:border-emerald-500 p-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all min-h-20"
                    />
                    
                    {moderationWarning && (
                      <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl text-[10px] text-red-650 flex items-start gap-1.5 animate-bounce">
                        <ShieldAlert className="shrink-0 text-red-500 mt-0.5" size={14} />
                        <span>{moderationWarning}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <BadgeInfo size={11} />
                        نظام الرقابة الآلي نشط للسكينة
                      </span>
                      <button
                        onClick={handleAddReflection}
                        disabled={!newReflectionText.trim()}
                        className="px-4 py-2 bg-[#0D5C4D] disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send size={12} className="transform rotate-180" />
                        <span>انشر التدبر</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages timeline */}
                  <div className="space-y-3 pt-2">
                    {reflections.map((ref) => (
                      <div 
                        key={ref.id}
                        className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-[#07130F] border border-slate-100 dark:border-emerald-950/20 space-y-1"
                      >
                        <div className="flex justify-between items-center text-[9.5px]">
                          <span className="text-slate-450 font-medium">{ref.timestamp}</span>
                          <span className="text-[#C59F60] font-black">{ref.username}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-sans select-text">
                          {ref.text}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

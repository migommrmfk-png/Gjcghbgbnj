import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, Star, CheckCircle2, XCircle, Brain, Book, Puzzle, History, Users, Grid3X3, Loader2, Sparkles } from 'lucide-react';
import { Type } from "@google/genai";
import { getGeminiClient } from '../lib/gemini';

// --- Default Game Data ---
const defaultQuizQuestions = [
  {
    question: "من هو النبي الذي ابتلعه الحوت؟",
    options: ["يونس عليه السلام", "موسى عليه السلام", "عيسى عليه السلام", "نوح عليه السلام"],
    correct: 0,
  },
  {
    question: "ما هي أطول سورة في القرآن الكريم؟",
    options: ["سورة آل عمران", "سورة النساء", "سورة البقرة", "سورة المائدة"],
    correct: 2,
  },
  {
    question: "كم عدد سور القرآن الكريم؟",
    options: ["110 سورة", "114 سورة", "120 سورة", "112 سورة"],
    correct: 1,
  },
  {
    question: "من هو أول الخلفاء الراشدين؟",
    options: ["عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب", "أبو بكر الصديق"],
    correct: 3,
  },
  {
    question: "ما هي السورة التي تسمى قلب القرآن؟",
    options: ["سورة يس", "سورة الرحمن", "سورة الملك", "سورة الكهف"],
    correct: 0,
  }
];

const defaultAyahQuestions = [
  {
    ayah: "قُلْ هُوَ اللَّهُ _____ (1)",
    options: ["أَحَدٌ", "الصَّمَدُ", "كُفُوًا", "يَلِدْ"],
    correct: 0,
    surah: "سورة الإخلاص"
  },
  {
    ayah: "الْحَمْدُ لِلَّهِ رَبِّ _____ (2)",
    options: ["النَّاسِ", "الْعَالَمِينَ", "الْفَلَقِ", "الْعَرْشِ"],
    correct: 1,
    surah: "سورة الفاتحة"
  },
  {
    ayah: "إِنَّا أَعْطَيْنَاكَ _____ (1)",
    options: ["الْكَوْثَرَ", "الْحِكْمَةَ", "الْقُرْآنَ", "الْمُلْكَ"],
    correct: 0,
    surah: "سورة الكوثر"
  }
];

const defaultHistoryQuestions = [
  {
    question: "متى كانت غزوة بدر الكبرى؟",
    options: ["2 هـ", "3 هـ", "4 هـ", "5 هـ"],
    correct: 0,
  },
  {
    question: "في أي عام هجري تم فتح مكة؟",
    options: ["6 هـ", "7 هـ", "8 هـ", "9 هـ"],
    correct: 2,
  },
  {
    question: "من هو القائد المسلم الذي فتح الأندلس؟",
    options: ["خالد بن الوليد", "طارق بن زياد", "عمرو بن العاص", "صلاح الدين الأيوبي"],
    correct: 1,
  },
  {
    question: "ما هي المعركة التي سُميت بفتح الفتوح؟",
    options: ["القادسية", "اليرموك", "نهاوند", "حطين"],
    correct: 2,
  },
  {
    question: "متى كانت غزوة الخندق (الأحزاب)؟",
    options: ["3 هـ", "4 هـ", "5 هـ", "6 هـ"],
    correct: 2,
  }
];

const defaultProphetsData = [
  { id: 1, name: "إبراهيم عليه السلام", title: "خليل الله" },
  { id: 2, name: "موسى عليه السلام", title: "كليم الله" },
  { id: 3, name: "عيسى عليه السلام", title: "روح الله" },
  { id: 4, name: "محمد ﷺ", title: "خاتم الأنبياء" },
  { id: 5, name: "نوح عليه السلام", title: "شيخ المرسلين" }
];

const defaultMemoryCardsData = [
  "سورة الإخلاص", "سورة الإخلاص",
  "سورة الفلق", "سورة الفلق",
  "سورة الناس", "سورة الناس",
  "سورة الكوثر", "سورة الكوثر",
  "سورة النصر", "سورة النصر",
  "سورة العصر", "سورة العصر"
];

const defaultChronologyEvents = [
  { id: 1, event: "نزول الوحي على النبي ﷺ بمكة وبدء الرسالة", year: "قبل الهجرة بـ 13 سنة" },
  { id: 2, event: "رحلة الإسراء والمعراج المباركة وفرض الصلوات الخمس", year: "قبل الهجرة بـ 3 سنوات" },
  { id: 3, event: "الهجرة النبوية الشريفة وتأسيس الدولة بالمدينة المنورة", year: "1 هـ" },
  { id: 4, event: "غزوة بدر الكبرى (الفرقان) ونصر المسلمين العظيم", year: "2 هـ" },
  { id: 5, event: "غزوة أحد وشهادة حمزة بن عبد المطلب رضي الله عنه", year: "3 هـ" },
  { id: 6, event: "صلح الحديبية التاريخي مع قريش", year: "6 هـ" },
  { id: 7, event: "فتح مكة المظفر وتحطيم الأصنام الكبرى حول الكعبة", year: "8 هـ" },
  { id: 8, event: "حجة الوداع للرسول ﷺ وخطبته البليغة الشهيرة", year: "10 هـ" },
  { id: 9, event: "وفاة الرسول ﷺ والتحاقه بالرفيق الأعلى بالمدينة", year: "11 هـ" }
];

const defaultTrueFalseQuestions = [
  { statement: "نزلت سورة الفاتحة بمكة المكرمة وتسمى السبع المثاني.", isTrue: true, explanation: "سميت بالسبع المثاني لأنها سبع آيات وتثنى (تكرر) في كل ركعة من الصلاة المباركة." },
  { statement: "عمر بن الخطاب رضي الله عنه هو أول من أسلم من الرجال الأحرار.", isTrue: false, explanation: "أبو بكر الصديق رضي الله عنه هو أول من أسلم من الرجال الأحرار وبذل ماله لله." },
  { statement: "صام المسلمون شهر Ramadan المبارك لأول مرة في السنة الثانية للهجرة.", isTrue: true, explanation: "فُرِضَ صيام شهر رمضان المبارك في شعبان من السنة الثانية للهجرة النبوية الشريفة." },
  { statement: "عدد أجزاء القرآن الكريم خمسة وعشرون جزءاً فقط.", isTrue: false, explanation: "عدد أجزاء القرآن الكريم هو ثلاثون جزءاً كاملاً مفصلاً." },
  { statement: "النبي الذي أرسله الله سبحانه وتعالى لقوم عاد هو هود عليه السلام.", isTrue: true, explanation: "أرسل الله سيدنا هوداً عليه السلام إلى قومه قوم عاد في منطقة الأحقاف." }
];

export default function Games({ onBack }: { onBack: () => void }) {
  const [activeGame, setActiveGame] = useState<'menu' | 'quiz' | 'ayah' | 'history' | 'prophets' | 'memory' | 'chronology' | 'trueFalse'>('menu');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Dynamic AI Questions State
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicQuizQuestions, setDynamicQuizQuestions] = useState(defaultQuizQuestions);
  const [dynamicAyahQuestions, setDynamicAyahQuestions] = useState(defaultAyahQuestions);
  const [dynamicHistoryQuestions, setDynamicHistoryQuestions] = useState(defaultHistoryQuestions);
  const [dynamicProphetsData, setDynamicProphetsData] = useState(defaultProphetsData);
  const [dynamicMemoryCardsData, setDynamicMemoryCardsData] = useState(defaultMemoryCardsData);
  const [dynamicTrueFalseQuestions, setDynamicTrueFalseQuestions] = useState(defaultTrueFalseQuestions);

  // Prophets Game State
  const [selectedProphet, setSelectedProphet] = useState<number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [shuffledNames, setShuffledNames] = useState<any[]>([]);
  const [shuffledTitles, setShuffledTitles] = useState<any[]>([]);

  // Memory Game State
  const [cards, setCards] = useState<string[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);

  // Chronology Game State
  const [dynamicChronologyData, setDynamicChronologyData] = useState<any[]>(defaultChronologyEvents);
  const [chronologySelectedIds, setChronologySelectedIds] = useState<number[]>([]);
  const [chronologyScrambled, setChronologyScrambled] = useState<any[]>([]);
  const [chronologyChecked, setChronologyChecked] = useState(false);
  const [chronologyIsCorrect, setChronologyIsCorrect] = useState(false);

  // True or False Game State
  const [selectedTrueFalseAnswer, setSelectedTrueFalseAnswer] = useState<boolean | null>(null);
  const [trueFalseIsAnswered, setTrueFalseIsAnswered] = useState(false);

  const generateNewQuestions = async (type: 'quiz' | 'ayah' | 'history' | 'prophets' | 'memory' | 'chronology' | 'trueFalse') => {
    setIsGenerating(true);
    try {
      const ai = getGeminiClient();
      
      let prompt = "";
      let schema: any = {};
      const randomSeed = Math.floor(Math.random() * 1000000);

      if (type === 'quiz') {
        prompt = `قم بتوليد 5 أسئلة دينية إسلامية متنوعة (في السيرة، الفقه، القرآن، قصص الأنبياء). تجنب الأسئلة الشائعة جداً والمكررة. لكل سؤال 4 خيارات وحدد الإجابة الصحيحة.
يجب أن يكون الرد مصفوفة JSON بهذا الشكل:
[{"question": "السؤال", "options": ["خ1", "خ2", "خ3", "خ4"], "correct": 0}]
(رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
      } else if (type === 'ayah') {
        prompt = `قم بتوليد 5 أسئلة 'أكمل الآية' من القرآن الكريم. اختر آيات من سور مختلفة.
يجب أن يكون الرد مصفوفة JSON بهذا الشكل:
[{"ayah": "قُلْ هُوَ اللَّهُ _____", "options": ["أحد", "الصمد", "كفوا", "لم"], "correct": 0, "surah": "الإخلاص"}]
(رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
      } else if (type === 'history') {
        prompt = `قم بتوليد 5 أسئلة عن التاريخ الإسلامي، الغزوات، الفتوحات.
يجب أن يكون الرد مصفوفة JSON بهذا الشكل:
[{"question": "السؤال", "options": ["خ1", "خ2", "خ3", "خ4"], "correct": 0}]
(رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
      } else if (type === 'prophets') {
        prompt = `قم بتوليد 5 أزواج من أسماء الأنبياء وألقابهم (أو صفاتهم).
يجب أن يكون الرد مصفوفة JSON بهذا الشكل:
[{"id": 1, "name": "ابراهيم", "title": "خليل الله"}]
(رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
      } else if (type === 'memory') {
        prompt = `قم بتوليد قائمة بـ 6 أسماء سور قرآنية مختلفة.
يجب أن يكون الرد مصفوفة خطية JSON بهذا الشكل:
["البقرة", "يوسف", "الكهف", "طه", "مريم", "النور"]
(رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
      } else if (type === 'chronology') {
        prompt = `قم بتوليد 5 أحداث تاريخية إسلامية هامة (غزوات، بيعات، فتوحات، معاهدات، أحداث السيرة) مرتبةً من الأقدم للأحدث تصاعدياً بصورة صحيحة ودقيقة، مع كتابة العام الهجري أو الفترة التاريخية المقترنة بكل حدث.
يجب أن يكون الرد مصفوفة JSON مرتبة زمنياً بهذا الشكل تماماً، مع الحفاظ على الترتيب الزمني التصاعدي الدقيق عبر المعرف (id) من 1 إلى 5:
[
  {"id": 1, "event": "الحدث الأقدم", "year": "الفترة الزمنية"},
  {"id": 2, "event": "الحدث التالي", "year": "الفترة الزمنية"},
  {"id": 3, "event": "الحدث الثالث", "year": "الفترة الزمنية"},
  {"id": 4, "event": "الحدث الرابع", "year": "الفترة الزمنية"},
  {"id": 5, "event": "الحدث الأحدث", "year": "الفترة الزمنية"}
]
(رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
      } else if (type === 'trueFalse') {
        prompt = `قم بتوليد 5 عبارات دينية إسلامية متنوعة غنية ومعرفية (في السيرة، الفقه، التفسير، قصص الأنبياء، الحديث الشريف). يجب أن يحتوي بعضها على معلومات صحيحة تماماً والبعض الآخر على مغالطات علمية أو تاريخية واضحة ومحددة. لكل عبارة، حدد القيمة المنطقية (صح = true، خطأ = false) مع كتابة تعليق أو شرح موجز ومفيد جداً (في حدود سطرين) يوضح السبب العلمي أو يصحح المعلومة الخاطئة بأسلوب ميسر.
يجب أن يكون الرد مصفوفة JSON دقيقة بهذا الشكل تماماً:
[
  {"statement": "العبارة الأولى هنا", "isTrue": true, "explanation": "الشرح الموجز أو التصحيح هنا"},
  {"statement": "العبارة الثانية هنا", "isTrue": false, "explanation": "الشرح الموجز أو التصحيح هنا"}
]
(رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt + "\n\nيجب أن يكون الرد عبارة عن مصفوفة JSON صالحة فقط ولا شيء غير ذلك. (Array of objects).",
        config: {
          temperature: 0.9,
        }
      });

      let text = response.text || "[]";
      // Clean up potential markdown formatting
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(text);
      
      if (data && data.length > 0) {
        if (type === 'quiz') setDynamicQuizQuestions(data);
        else if (type === 'ayah') setDynamicAyahQuestions(data);
        else if (type === 'history') setDynamicHistoryQuestions(data);
        else if (type === 'trueFalse') setDynamicTrueFalseQuestions(data);
        else if (type === 'prophets') {
          setDynamicProphetsData(data);
          setShuffledNames([...data].sort(() => Math.random() - 0.5));
          setShuffledTitles([...data].sort(() => Math.random() - 0.5));
        }
        else if (type === 'memory') {
          // Double the array to create pairs for memory game
          const pairs = [...data, ...data];
          const shuffledPairs = pairs.sort(() => Math.random() - 0.5);
          setDynamicMemoryCardsData(shuffledPairs);
          setCards(shuffledPairs);
        }
        else if (type === 'chronology') {
          const sorted = [...data].sort((a, b) => a.id - b.id);
          setDynamicChronologyData(sorted);
          setChronologyScrambled([...sorted].sort(() => Math.random() - 0.5));
        }
      } else {
        throw new Error("Empty data returned from AI");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      // Fallback to default data if generation fails
      if (type === 'prophets') {
        setShuffledNames([...defaultProphetsData].sort(() => Math.random() - 0.5));
        setShuffledTitles([...defaultProphetsData].sort(() => Math.random() - 0.5));
      } else if (type === 'memory') {
        setCards([...defaultMemoryCardsData].sort(() => Math.random() - 0.5));
      } else if (type === 'trueFalse') {
        setDynamicTrueFalseQuestions([...defaultTrueFalseQuestions].sort(() => Math.random() - 0.5));
      } else if (type === 'chronology') {
        const sorted = [...defaultChronologyEvents].sort((a, b) => a.id - b.id);
        const selectRandom = sorted.sort(() => Math.random() - 0.5).slice(0, 5);
        const reindexed = selectRandom
          .sort((a, b) => a.id - b.id)
          .map((ev, index) => ({
            ...ev,
            id: index + 1
          }));
        setDynamicChronologyData(reindexed);
        setChronologyScrambled([...reindexed].sort(() => Math.random() - 0.5));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGameSelect = async (game: 'quiz' | 'ayah' | 'history' | 'prophets' | 'memory' | 'chronology' | 'trueFalse') => {
    setActiveGame(game);
    setScore(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setGameOver(false);

    if (game === 'prophets') {
      setMatchedPairs([]);
      setSelectedProphet(null);
      setSelectedTitle(null);
    } else if (game === 'memory') {
      setFlippedCards([]);
      setMatchedCards([]);
    } else if (game === 'chronology') {
      setChronologySelectedIds([]);
      setChronologyChecked(false);
      setChronologyIsCorrect(false);
    } else if (game === 'trueFalse') {
      setSelectedTrueFalseAnswer(null);
      setTrueFalseIsAnswered(false);
    }

    await generateNewQuestions(game);
  };

  const handleProphetSelect = (id: number, type: 'name' | 'title') => {
    if (type === 'name') setSelectedProphet(id);
    else setSelectedTitle(id);
  };

  useEffect(() => {
    if (selectedProphet !== null && selectedTitle !== null) {
      if (selectedProphet === selectedTitle) {
        setMatchedPairs(prev => [...prev, selectedProphet]);
        setScore(s => s + 20);
        if (navigator.vibrate) navigator.vibrate(50);
        if (matchedPairs.length + 1 === dynamicProphetsData.length) {
          setTimeout(() => setGameOver(true), 500);
        }
      } else {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => {
        setSelectedProphet(null);
        setSelectedTitle(null);
      }, 500);
    }
  }, [selectedProphet, selectedTitle]);

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) return;

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatchedCards(prev => [...prev, newFlipped[0], newFlipped[1]]);
        setScore(s => s + 15);
        if (navigator.vibrate) navigator.vibrate(50);
        if (matchedCards.length + 2 === cards.length) {
          setTimeout(() => setGameOver(true), 500);
        }
      } else {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => setFlippedCards([]), 1000);
    }
  };

  const handleAnswer = (index: number, correctIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === correctIndex) {
      setScore(score + 10);
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    setTimeout(() => {
      const questionsList = activeGame === 'quiz' ? dynamicQuizQuestions : activeGame === 'history' ? dynamicHistoryQuestions : dynamicAyahQuestions;
      if (currentQuestion < questionsList.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setGameOver(true);
      }
    }, 1500);
  };

  const renderMenu = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border border-white/20"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12  animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full -ml-12 -mb-12 "></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
           <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] mb-4 transform rotate-3">
             <Puzzle size={32} className="text-white drop-shadow-md" />
           </div>
          <h1 className="text-4xl font-bold font-serif mb-3 drop-shadow-md">
            ألعاب وتحديات
          </h1>
          <p className="text-emerald-50 text-sm font-bold bg-black/20 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 mt-2 leading-relaxed">اختبر معلوماتك الدينية بأسئلة متجددة تلقائياً بالذكاء الاصطناعي</p>
        </div>
      </motion.div>

      <div className="grid gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('quiz')}
          className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-5 text-right hover:border-emerald-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10  group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-[0_8px_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform relative z-10">
            <Brain size={32} className="drop-shadow-sm" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-emerald-500 transition-colors">مسابقة المعلومات الإسلامية</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">أسئلة متنوعة في السيرة والقرآن والتاريخ الإسلامي</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('ayah')}
           className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-5 text-right hover:border-teal-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-10 -mt-10  group-hover:bg-teal-500/20 transition-colors"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-[0_8px_20px_rgba(20,184,166,0.3)] group-hover:scale-110 transition-transform relative z-10">
            <Book size={32} className="drop-shadow-sm" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-teal-500 transition-colors">أكمل الآية</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">اختبر حفظك للقرآن الكريم من خلال إكمال الكلمة الناقصة</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('history')}
           className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-5 text-right hover:border-amber-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-10 -mt-10  group-hover:bg-amber-500/20 transition-colors"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-[0_8px_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform relative z-10">
            <History size={32} className="drop-shadow-sm" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-amber-500 transition-colors">أحداث تاريخية</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">اختبر معلوماتك في التاريخ الإسلامي والغزوات</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('prophets')}
           className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-5 text-right hover:border-indigo-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-10 -mt-10  group-hover:bg-indigo-500/20 transition-colors"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-[0_8px_20px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform relative z-10">
            <Users size={32} className="drop-shadow-sm" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-500 transition-colors">ألقاب الأنبياء</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">قم بتوصيل اسم النبي باللقب الخاص به</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('memory')}
           className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-5 text-right hover:border-purple-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-10 -mt-10  group-hover:bg-purple-500/20 transition-colors"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-[0_8px_20px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform relative z-10">
            <Grid3X3 size={32} className="drop-shadow-sm" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-purple-500 transition-colors">لعبة الذاكرة</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">طابق بين السور القرآنية المتشابهة</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('chronology')}
          className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-5 text-right hover:border-emerald-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-emerald-500 to-teal-500 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-[0_8px_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform relative z-10">
            <Trophy size={32} className="drop-shadow-sm" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-emerald-500 transition-colors">ترتيب أحداث السيرة</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">رتب أحداث السيرة النبوية والمشاهد التاريخية من الأقدم للأحدث</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('trueFalse')}
          className="card-3d bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-5 text-right hover:border-emerald-500/50 hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-[0_8px_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform relative z-10">
            <Sparkles size={32} className="drop-shadow-sm" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-emerald-500 transition-colors">مسابقة صح أم خطأ</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">اختبر سرعة بديهتك ودقة معلوماتك بعبارات صحيحة وخاطئة</p>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderProphetsGame = () => {
    if (gameOver) {
      return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-3d bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 mt-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-transparent text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-inner">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 drop-shadow-md">أحسنت!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">لقد قمت بتوصيل جميع الأنبياء بألقابهم</p>
          
          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 mb-8 border border-black/10 dark:border-white/10 shadow-inner">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-1">النتيجة النهائية</div>
            <div className="text-5xl font-bold text-emerald-400 drop-shadow-sm">{score}</div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { if (activeGame !== 'menu') handleGameSelect(activeGame); }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 border border-emerald-400/50"
            >
              <Sparkles size={20} />
              تحدي جديد
            </button>
            <button 
              onClick={() => setActiveGame('menu')}
              className="w-full py-4 bg-black/5 dark:bg-white/5 text-slate-800 dark:text-slate-100 rounded-xl font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/10 dark:border-white/10"
            >
              العودة للقائمة
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold drop-shadow-md">
            <Star size={20} className="fill-current" />
            <span>{score} نقطة</span>
          </div>
          <div className="text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 rounded-full shadow-inner border border-emerald-400/50">
            {matchedPairs.length} / {dynamicProphetsData.length}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-center font-bold text-slate-800 dark:text-slate-100 mb-4 drop-shadow-md">أسماء الأنبياء</h3>
            {shuffledNames.map((p) => {
              const isMatched = matchedPairs.includes(p.id);
              const isSelected = selectedProphet === p.id;
              return (
                <button
                  key={`name-${p.id}`}
                  disabled={isMatched}
                  onClick={() => handleProphetSelect(p.id, 'name')}
                  className={`w-full p-4 rounded-xl text-center font-bold transition-all border-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)] ${
                    isMatched ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50' :
                    isSelected ? 'bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                    'bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-100 hover:border-emerald-500/50 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
          <div className="space-y-3">
            <h3 className="text-center font-bold text-slate-800 dark:text-slate-100 mb-4 drop-shadow-md">الألقاب</h3>
            {shuffledTitles.map((p) => {
              const isMatched = matchedPairs.includes(p.id);
              const isSelected = selectedTitle === p.id;
              return (
                <button
                  key={`title-${p.id}`}
                  disabled={isMatched}
                  onClick={() => handleProphetSelect(p.id, 'title')}
                  className={`w-full p-4 rounded-xl text-center font-bold transition-all border-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)] ${
                    isMatched ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50' :
                    isSelected ? 'bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                    'bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-100 hover:border-emerald-500/50 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {p.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMemoryGame = () => {
    if (gameOver) {
      return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-3d bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center shadow-xl border border-black/5 dark:border-white/5 mt-10 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-20 -mt-20 "></div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-white/20 transform rotate-3 relative z-10">
            <Trophy size={48} className="drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 drop-shadow-md relative z-10">أحسنت!</h2>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-6 relative z-10">لقد أكملت لعبة الذاكرة بنجاح</p>
          
          <div className="glass dark:glass-dark rounded-[1.5rem] p-6 mb-8 shadow-inner relative z-10">
            <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">النتيجة النهائية</div>
            <div className="text-5xl font-bold text-emerald-500 drop-shadow-sm">{score}</div>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <button 
              onClick={() => { if (activeGame !== 'menu') handleGameSelect(activeGame); }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[1.5rem] font-bold hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border border-white/20 shadow-md"
            >
              <Sparkles size={20} />
              تحدي جديد
            </button>
            <button 
              onClick={() => setActiveGame('menu')}
              className="w-full py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-[1.5rem] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              العودة للقائمة
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold drop-shadow-md">
            <Star size={20} className="fill-current" />
            <span>{score} نقطة</span>
          </div>
          <div className="text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 rounded-full shadow-inner border border-emerald-400/50">
            {matchedCards.length / 2} / {cards.length / 2}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {cards.map((card, index) => {
            const isFlipped = flippedCards.includes(index) || matchedCards.includes(index);
            const isMatched = matchedCards.includes(index);
            return (
              <motion.button
                key={index}
                whileHover={{ scale: isFlipped ? 1 : 1.05 }}
                whileTap={{ scale: isFlipped ? 1 : 0.95 }}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-2xl flex items-center justify-center p-2 text-center font-bold transition-all duration-300 border-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)] ${
                  isMatched ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50' :
                  isFlipped ? 'bg-white dark:bg-slate-900 border-emerald-400 text-slate-800 dark:text-slate-100 shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                  'bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500/30 text-transparent hover:border-emerald-400/50'
                }`}
              >
                <span className={isFlipped ? 'opacity-100' : 'opacity-0'}>{card}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderChronologyGame = () => {
    if (gameOver) {
      return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-3d bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center shadow-xl border border-black/5 dark:border-white/5 mt-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-20 -mt-20"></div>
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-white/20 transform rotate-3 relative z-10 font-bold">
            <Trophy size={48} className="drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 drop-shadow-md relative z-10">أحسنت الترتيب!</h2>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-6 relative z-10">لقد رتّبت أحداث السّيرة الشّريفة بِنجاح</p>
          
          <div className="glass dark:glass-dark rounded-[1.5rem] p-6 mb-8 shadow-inner relative z-10">
            <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">النتيجة الحالية</div>
            <div className="text-5xl font-bold text-emerald-500 drop-shadow-sm">+{score} نقطة</div>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <button 
              onClick={() => { if (activeGame !== 'menu') handleGameSelect(activeGame); }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[1.5rem] font-bold hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border border-white/20 shadow-md"
            >
              <Sparkles size={20} />
              ترتيب أحداث جديدة
            </button>
            <button 
              onClick={() => setActiveGame('menu')}
              className="w-full py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-[1.5rem] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              العودة للقائمة
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-emerald-500 font-bold drop-shadow-md">
            <Star size={20} className="fill-current" />
            <span>{score} نقطة</span>
          </div>
          <div className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full border border-black/5">
            تحدي الترتيب الزمني
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 space-y-2">
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            💡 <span className="font-bold">طريقة اللعب:</span> اضغط على الأحداث في الأسفل لترتيبها في الجدول الزمني من <span className="text-emerald-500 font-bold">الأقدم (في الأعلى)</span> إلى <span className="text-teal-600 font-bold">الأحدث (في الأسفل)</span>. اضغط على أي حدث في الجدول لإلغاء اختياره.
          </p>
        </div>

        {/* Selected Timeline */}
        <div className="space-y-3">
          <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm px-1">الجدول الزمني للمسار التاريخي:</h3>
          <div className="relative border-r-2 border-emerald-500/20 mr-4 pr-4 space-y-4 py-2">
            {[0, 1, 2, 3, 4].map((index) => {
              const selectedId = chronologySelectedIds[index];
              const event = dynamicChronologyData.find(e => e.id === selectedId);
              const isEventPlaced = !!event;

              let cardStyle = "w-full p-4 rounded-2xl text-right font-medium transition-all border shadow-sm relative flex items-center justify-between ";
              let feedbackIcon = null;

              if (isEventPlaced) {
                if (chronologyChecked) {
                  const correctEvent = dynamicChronologyData[index];
                  if (event.id === correctEvent.id) {
                    cardStyle += "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-inner";
                    feedbackIcon = <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />;
                  } else {
                    cardStyle += "bg-red-50/80 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400 shadow-inner";
                    feedbackIcon = <XCircle className="text-red-500 shrink-0" size={20} />;
                  }
                } else {
                  cardStyle += "bg-white dark:bg-slate-800/80 border-emerald-500/30 text-slate-800 dark:text-slate-100 cursor-pointer hover:border-red-400";
                }
              } else {
                cardStyle += "bg-slate-100/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 select-none px-6 h-14 items-center justify-center";
              }

              return (
                <div key={index} className="relative">
                  {/* Timeline node bullet */}
                  <div className={`absolute right-[-23px] top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-2 transition-colors ${isEventPlaced ? 'bg-emerald-500 border-white dark:border-slate-950' : 'bg-slate-200 dark:bg-slate-800 border-transparent'}`}></div>

                  <div 
                    onClick={() => {
                      if (chronologyChecked || !isEventPlaced) return;
                      // Remove event from order
                      setChronologySelectedIds(prev => prev.filter(id => id !== selectedId));
                    }}
                    className={cardStyle}
                  >
                    {isEventPlaced ? (
                      <>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[15px]">{event.event}</span>
                          {chronologyChecked && (
                            <span className="text-[12px] font-mono text-emerald-600 dark:text-emerald-400">{event.year}</span>
                          )}
                        </div>
                        {feedbackIcon}
                      </>
                    ) : (
                      <span className="text-[13px] font-bold text-slate-400">--- الحدث {index + 1} ---</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Pool of unsorted events */}
        {!chronologyChecked && (
          <div className="space-y-3">
            <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm px-1">الأحداث المتاحة (اضغط للترتيب):</h3>
            <div className="flex flex-wrap gap-2">
              {chronologyScrambled.map((item) => {
                const isSelected = chronologySelectedIds.includes(item.id);
                if (isSelected) return null;

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (chronologySelectedIds.length >= 5) return;
                      setChronologySelectedIds(prev => [...prev, item.id]);
                    }}
                    className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-emerald-500 rounded-2xl text-right font-medium text-[14px] text-slate-800 dark:text-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-150"
                  >
                    {item.event}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error or correct feedback details */}
        {chronologyChecked && !chronologyIsCorrect && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-950 p-4 rounded-2xl text-amber-800 dark:text-amber-400 text-sm leading-relaxed font-medium">
            ⚠️ <span className="font-bold">الترتيب لم يكن دقيقاً بالكامل.</span> تصفّح الترتيب الصحيح بالأعلى لتعرُّف التواريخ الصحيحة للأحداث وتعلُّمها!
          </div>
        )}

        {/* Control Actions */}
        <div className="pt-4 flex flex-col gap-3">
          {!chronologyChecked ? (
            <button
              disabled={chronologySelectedIds.length < 5}
              onClick={() => {
                // Check order
                const isCorrect = chronologySelectedIds.every((id, idx) => {
                  return id === dynamicChronologyData[idx].id;
                });
                
                setChronologyChecked(true);
                setChronologyIsCorrect(isCorrect);

                if (isCorrect) {
                  setScore(s => s + 50);
                  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                  setTimeout(() => setGameOver(true), 2000);
                } else {
                  if (navigator.vibrate) navigator.vibrate([200, 100]);
                }
              }}
              className={`w-full py-4 rounded-[1.5rem] font-bold text-white transition-all shadow-md text-center flex items-center justify-center gap-2 border ${
                chronologySelectedIds.length < 5
                  ? 'bg-slate-300 dark:bg-slate-800 border-transparent cursor-not-allowed opacity-60 text-slate-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 border-white/10 hover:shadow-lg cursor-pointer hover:-translate-y-0.5'
              }`}
            >
              التحقق من صحة الترتيب
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setChronologySelectedIds([]);
                  setChronologyChecked(false);
                  setChronologyIsCorrect(false);
                }}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 rounded-[1.5rem] font-bold transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => handleGameSelect('chronology')}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[1.5rem] font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all border border-white/10"
              >
                تحدي جديد
              </button>
            </div>
          )}
          <button
            onClick={() => setActiveGame('menu')}
            className="w-full py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-[1.5rem] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            العودة للقائمة الرئيسية
          </button>
        </div>
      </div>
    );
  };

  const renderTrueFalseGame = () => {
    if (gameOver) {
      return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-3d bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center shadow-xl border border-black/5 dark:border-white/5 mt-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-20 -mt-20"></div>
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-white/20 transform rotate-3 relative z-10 font-bold">
            <Trophy size={48} className="drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 drop-shadow-md relative z-10">مبارك إتمام التحدي!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-6 relative z-10">لقد أتممت تحدي صح أم خطأ بنجاح</p>
          
          <div className="glass dark:glass-dark rounded-[1.5rem] p-6 mb-8 shadow-inner relative z-10 bg-slate-100 dark:bg-slate-850/50">
            <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">النتيجة النهائية</div>
            <div className="text-5xl font-bold text-emerald-500 drop-shadow-sm">{score} نقطة</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">من {dynamicTrueFalseQuestions.length * 10} نقطة</div>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <button 
              onClick={() => { handleGameSelect('trueFalse'); }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[1.5rem] font-bold hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border border-white/20 shadow-md cursor-pointer"
            >
              <Sparkles size={20} />
              تحدي جديد
            </button>
            <button 
              onClick={() => setActiveGame('menu')}
              className="w-full py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-[1.5rem] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
            >
              العودة للقائمة
            </button>
          </div>
        </motion.div>
      );
    }

    const currentQ = dynamicTrueFalseQuestions[currentQuestion];

    if (isGenerating || !currentQ) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 size={48} className="text-emerald-500 animate-spin mb-6 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif mb-2 drop-shadow-md">جاري توليد الأسئلة...</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400 animate-pulse" />
            يتم الآن إنشاء العبارات الحصرية لك بالذكاء الاصطناعي
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-emerald-500 font-bold drop-shadow-md">
            <Star size={20} className="fill-current" />
            <span>{score} نقطة</span>
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
            العبارة {currentQuestion + 1} / {dynamicTrueFalseQuestions.length}
          </div>
        </div>

        <motion.div 
          key={currentQuestion}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="card-3d bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-black/5 dark:border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>

          <div className="text-center font-serif text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed px-2">
            "{currentQ.statement}"
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10 mb-6 font-bold text-lg">
            {/* True Button */}
            <button
              disabled={trueFalseIsAnswered}
              onClick={() => {
                let isCorrect = currentQ.isTrue === true;
                setSelectedTrueFalseAnswer(true);
                setTrueFalseIsAnswered(true);
                if (isCorrect) {
                  setScore(s => s + 10);
                  if (navigator.vibrate) navigator.vibrate(50);
                } else {
                  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                }
              }}
              className={`py-5 rounded-2xl font-bold border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm ${
                !trueFalseIsAnswered
                  ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 hover:border-emerald-500 hover:bg-emerald-50/10 text-emerald-600 dark:text-emerald-400 active:scale-95"
                  : currentQ.isTrue
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_8px_15px_rgba(16,185,129,0.3)] scale-[1.02]"
                    : selectedTrueFalseAnswer === true
                      ? "bg-red-500 text-white border-red-500 shadow-[0_8px_15px_rgba(239,68,68,0.3)]"
                      : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 opacity-50"
              }`}
            >
              <CheckCircle2 size={24} />
              <span>صــح</span>
            </button>

            {/* False Button */}
            <button
              disabled={trueFalseIsAnswered}
              onClick={() => {
                let isCorrect = currentQ.isTrue === false;
                setSelectedTrueFalseAnswer(false);
                setTrueFalseIsAnswered(true);
                if (isCorrect) {
                  setScore(s => s + 10);
                  if (navigator.vibrate) navigator.vibrate(50);
                } else {
                  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                }
              }}
              className={`py-5 rounded-2xl font-bold border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm ${
                !trueFalseIsAnswered
                  ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 hover:border-red-500 hover:bg-red-50/10 text-red-600 dark:text-red-400 active:scale-95"
                  : !currentQ.isTrue
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_8px_15px_rgba(16,185,129,0.3)] scale-[1.02]"
                    : selectedTrueFalseAnswer === false
                      ? "bg-red-500 text-white border-red-500 shadow-[0_8px_15px_rgba(239,68,68,0.3)]"
                      : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 opacity-50"
              }`}
            >
              <XCircle size={24} />
              <span>خـطـأ</span>
            </button>
          </div>

          {/* Explanation reveal */}
          <AnimatePresence>
            {trueFalseIsAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border mb-6 text-right relative z-10 ${
                  selectedTrueFalseAnswer === currentQ.isTrue
                    ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                    : "bg-amber-50/80 dark:bg-amber-950/20 border-amber-500/20 text-amber-800 dark:text-amber-300"
                }`}
              >
                <div className="font-bold mb-1.5 flex items-center gap-1.5 text-base">
                  <span>💡 فائدة علمية وتاريخية:</span>
                </div>
                <p className="text-[14px] leading-relaxed font-semibold">{currentQ.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {trueFalseIsAnswered && (
            <button
              onClick={() => {
                if (currentQuestion < dynamicTrueFalseQuestions.length - 1) {
                  setCurrentQuestion(prev => prev + 1);
                  setSelectedTrueFalseAnswer(null);
                  setTrueFalseIsAnswered(false);
                } else {
                  setGameOver(true);
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-[1.5rem] font-bold border border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all text-center cursor-pointer"
            >
              {currentQuestion < dynamicTrueFalseQuestions.length - 1 ? "العبارة التالية" : "عرض النتيجة النهائية"}
            </button>
          )}
        </motion.div>
      </div>
    );
  };

  const renderGame = () => {
    if (activeGame === 'prophets') return renderProphetsGame();
    if (activeGame === 'memory') return renderMemoryGame();
    if (activeGame === 'chronology') return renderChronologyGame();
    if (activeGame === 'trueFalse') return renderTrueFalseGame();

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 size={48} className="text-emerald-500 animate-spin mb-6 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif mb-2 drop-shadow-md">جاري توليد أسئلة جديدة...</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            يتم الآن إنشاء أسئلة حصرية لك بالذكاء الاصطناعي
          </p>
        </div>
      );
    }

    const questionsList = activeGame === 'quiz' ? dynamicQuizQuestions : activeGame === 'history' ? dynamicHistoryQuestions : dynamicAyahQuestions;
    const currentQ = questionsList[currentQuestion];
    
    if (gameOver) {
      return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-3d bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/5 mt-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-transparent text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-inner">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 drop-shadow-md">انتهى التحدي!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">لقد أتممت جميع الأسئلة بنجاح</p>
          
          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 mb-8 border border-black/10 dark:border-white/10 shadow-inner">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-1">النتيجة النهائية</div>
            <div className="text-5xl font-bold text-emerald-500 drop-shadow-sm">{score}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">من {questionsList.length * 10} نقطة</div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { if (activeGame !== 'menu') handleGameSelect(activeGame); }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-[1.5rem] font-bold hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border border-white/20 shadow-[0_5px_15px_rgba(0,0,0,0.3)] relative z-10"
            >
              <Sparkles size={20} />
              توليد أسئلة جديدة
            </button>
            <button 
              onClick={() => setActiveGame('menu')}
              className="w-full py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-[1.5rem] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm relative z-10"
            >
              العودة للقائمة
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-amber-500 font-bold">
            <Star size={20} className="fill-current" />
            <span>{score} نقطة</span>
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
            السؤال {currentQuestion + 1} / {questionsList.length}
          </div>
        </div>

        <motion.div 
          key={currentQuestion}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="card-3d bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-black/5 dark:border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 "></div>

          {activeGame === 'ayah' && 'surah' in currentQ && (
            <div className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-bold mb-6 bg-emerald-50 dark:bg-emerald-500/10 py-1.5 px-5 rounded-full inline-block border border-emerald-100 dark:border-emerald-500/20 shadow-sm relative z-10">
              {currentQ.surah}
            </div>
          )}
          
          <h2 className={`text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-relaxed text-center relative z-10 ${activeGame === 'ayah' ? 'font-serif text-3xl text-emerald-600 dark:text-emerald-400' : ''}`}>
            {'question' in currentQ ? currentQ.question : currentQ.ayah}
          </h2>

          <div className="space-y-3 relative z-10">
            {currentQ.options.map((option, index) => {
              let btnClass = "w-full p-4 rounded-2xl text-right font-bold transition-all border shadow-sm ";
              
              if (!isAnswered) {
                btnClass += "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md text-slate-800 dark:text-slate-100 active:scale-[0.98]";
              } else {
                if (index === currentQ.correct) {
                  btnClass += "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                } else if (index === selectedAnswer) {
                  btnClass += "bg-red-50 dark:bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                } else {
                  btnClass += "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={index}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(index, currentQ.correct)}
                  className={btnClass}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg leading-relaxed">{option}</span>
                    {isAnswered && index === currentQ.correct && <CheckCircle2 className="text-emerald-500" />}
                    {isAnswered && index === selectedAnswer && index !== currentQ.correct && <XCircle className="text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-4 -mx-4 mb-6">
        <button
          onClick={() => activeGame === 'menu' ? onBack() : setActiveGame('menu')}
          className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-white dark:bg-slate-900 shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
        >
          <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-400" />
        </button>
        <h1 className="text-xl font-bold font-serif text-emerald-400 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          {activeGame === 'menu' ? 'الألعاب' : activeGame === 'quiz' ? 'مسابقة المعلومات' : activeGame === 'ayah' ? 'أكمل الآية' : activeGame === 'history' ? 'أحداث تاريخية' : activeGame === 'prophets' ? 'ألقاب الأنبياء' : activeGame === 'memory' ? 'لعبة الذاكرة' : 'ترتيب أحداث السيرة'}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeGame === 'menu' ? renderMenu() : renderGame()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

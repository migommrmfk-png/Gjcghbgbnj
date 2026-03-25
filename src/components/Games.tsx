import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, Star, CheckCircle2, XCircle, Brain, Book, Puzzle, History, Users, Grid3X3, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

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

export default function Games({ onBack }: { onBack: () => void }) {
  const [activeGame, setActiveGame] = useState<'menu' | 'quiz' | 'ayah' | 'history' | 'prophets' | 'memory'>('menu');
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

  const generateNewQuestions = async (type: 'quiz' | 'ayah' | 'history' | 'prophets' | 'memory') => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let prompt = "";
      let schema: any = {};
      const randomSeed = Math.floor(Math.random() * 1000000);

      if (type === 'quiz') {
        prompt = `قم بتوليد 5 أسئلة دينية إسلامية متنوعة (في السيرة، الفقه، القرآن، قصص الأنبياء). تجنب الأسئلة الشائعة جداً والمكررة (مثل من أول الخلفاء أو ما أطول سورة). أريد أسئلة جديدة كلياً وتفصيلية. لكل سؤال 4 خيارات وحدد الإجابة الصحيحة. (رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
        schema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correct: { type: Type.INTEGER, description: "Index of the correct option (0-3)" }
            },
            required: ["question", "options", "correct"]
          }
        };
      } else if (type === 'ayah') {
        prompt = `قم بتوليد 5 أسئلة 'أكمل الآية' من القرآن الكريم. اختر آيات من سور مختلفة من منتصف القرآن أو طوال السور (تجنب السور القصيرة جداً والمشهورة دائماً). أعطني جزء من آية مع كلمة ناقصة، و4 خيارات للكلمة الناقصة، واسم السورة. (رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
        schema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ayah: { type: Type.STRING, description: "الآية مع فراغ مكان الكلمة الناقصة مثل: قُلْ هُوَ اللَّهُ _____ (1)" },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correct: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              surah: { type: Type.STRING, description: "اسم السورة" }
            },
            required: ["ayah", "options", "correct", "surah"]
          }
        };
      } else if (type === 'history') {
        prompt = `قم بتوليد 5 أسئلة عن التاريخ الإسلامي، الغزوات، الفتوحات، والشخصيات التاريخية. تجنب الأسئلة المكررة والبديهية (مثل متى كانت غزوة بدر). اسأل عن أحداث وتفاصيل أعمق. لكل سؤال 4 خيارات وحدد الإجابة الصحيحة. (رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
        schema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correct: { type: Type.INTEGER, description: "Index of the correct option (0-3)" }
            },
            required: ["question", "options", "correct"]
          }
        };
      } else if (type === 'prophets') {
        prompt = `قم بتوليد 5 أزواج من أسماء الأنبياء وألقابهم (أو صفاتهم المشهورة في القرآن). تجنب تكرار نفس الأنبياء في كل مرة. أريد أنبياء مختلفين وألقاب دقيقة. (رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
        schema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              name: { type: Type.STRING, description: "اسم النبي" },
              title: { type: Type.STRING, description: "لقب النبي أو صفته" }
            },
            required: ["id", "name", "title"]
          }
        };
      } else if (type === 'memory') {
        prompt = `قم بتوليد قائمة بـ 6 أسماء سور قرآنية مختلفة (يفضل سور متوسطة أو قصيرة). أريد السور أن تتغير في كل مرة. (رقم عشوائي لتنويع الأسئلة: ${randomSeed})`;
        schema = {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of exactly 6 strings representing Surah names."
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
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
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGameSelect = async (game: 'quiz' | 'ayah' | 'history' | 'prophets' | 'memory') => {
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
        className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-3xl p-8 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/40 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-serif mb-3 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] text-[var(--color-primary-light)]">
            <Puzzle size={32} className="text-[var(--color-primary)]" />
            ألعاب وتحديات
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm font-bold">اختبر معلوماتك الدينية بأسئلة متجددة تلقائياً بالذكاء الاصطناعي</p>
        </div>
      </motion.div>

      <div className="grid gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('quiz')}
          className="card-3d bg-[var(--color-surface)] p-6 rounded-3xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5 flex items-center gap-4 text-right hover:border-[var(--color-primary-light)]/30 transition-all group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-2xl flex items-center justify-center shrink-0 border border-[var(--color-primary)]/30 shadow-inner group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
            <Brain size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[var(--color-primary-light)] transition-colors drop-shadow-md">مسابقة المعلومات الإسلامية</h3>
            <p className="text-sm text-[var(--color-text-muted)] font-bold">أسئلة متنوعة في السيرة والقرآن والتاريخ الإسلامي</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('ayah')}
          className="card-3d bg-[var(--color-surface)] p-6 rounded-3xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5 flex items-center gap-4 text-right hover:border-[var(--color-primary-light)]/30 transition-all group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-2xl flex items-center justify-center shrink-0 border border-[var(--color-primary)]/30 shadow-inner group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
            <Book size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[var(--color-primary-light)] transition-colors drop-shadow-md">أكمل الآية</h3>
            <p className="text-sm text-[var(--color-text-muted)] font-bold">اختبر حفظك للقرآن الكريم من خلال إكمال الكلمة الناقصة</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('history')}
          className="card-3d bg-[var(--color-surface)] p-6 rounded-3xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5 flex items-center gap-4 text-right hover:border-[var(--color-primary-light)]/30 transition-all group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-2xl flex items-center justify-center shrink-0 border border-[var(--color-primary)]/30 shadow-inner group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
            <History size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[var(--color-primary-light)] transition-colors drop-shadow-md">أحداث تاريخية</h3>
            <p className="text-sm text-[var(--color-text-muted)] font-bold">اختبر معلوماتك في التاريخ الإسلامي والغزوات</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('prophets')}
          className="card-3d bg-[var(--color-surface)] p-6 rounded-3xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5 flex items-center gap-4 text-right hover:border-[var(--color-primary-light)]/30 transition-all group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-2xl flex items-center justify-center shrink-0 border border-[var(--color-primary)]/30 shadow-inner group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[var(--color-primary-light)] transition-colors drop-shadow-md">ألقاب الأنبياء</h3>
            <p className="text-sm text-[var(--color-text-muted)] font-bold">قم بتوصيل اسم النبي باللقب الخاص به</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameSelect('memory')}
          className="card-3d bg-[var(--color-surface)] p-6 rounded-3xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5 flex items-center gap-4 text-right hover:border-[var(--color-primary-light)]/30 transition-all group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-2xl flex items-center justify-center shrink-0 border border-[var(--color-primary)]/30 shadow-inner group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
            <Grid3X3 size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[var(--color-primary-light)] transition-colors drop-shadow-md">لعبة الذاكرة</h3>
            <p className="text-sm text-[var(--color-text-muted)] font-bold">طابق بين السور القرآنية المتشابهة</p>
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
          className="card-3d bg-[var(--color-surface)] rounded-3xl p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 mt-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-primary)]/30 shadow-inner">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">أحسنت!</h2>
          <p className="text-[var(--color-text-muted)] font-bold mb-6">لقد قمت بتوصيل جميع الأنبياء بألقابهم</p>
          
          <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5 shadow-inner">
            <div className="text-sm text-[var(--color-text-muted)] font-bold mb-1">النتيجة النهائية</div>
            <div className="text-5xl font-bold text-[var(--color-primary-light)] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">{score}</div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleGameSelect(activeGame)}
              className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-black rounded-xl font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 border border-[var(--color-primary-light)]/50"
            >
              <Sparkles size={20} />
              تحدي جديد
            </button>
            <button 
              onClick={() => setActiveGame('menu')}
              className="w-full py-4 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10"
            >
              العودة للقائمة
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5">
          <div className="flex items-center gap-2 text-[var(--color-primary-light)] font-bold drop-shadow-md">
            <Star size={20} className="fill-current" />
            <span>{score} نقطة</span>
          </div>
          <div className="text-sm font-bold text-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-4 py-1.5 rounded-full shadow-inner border border-[var(--color-primary-light)]/50">
            {matchedPairs.length} / {dynamicProphetsData.length}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-center font-bold text-white mb-4 drop-shadow-md">أسماء الأنبياء</h3>
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
                    isSelected ? 'bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent border-[var(--color-primary)] text-[var(--color-primary-light)] shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                    'bg-[var(--color-surface)] border-white/5 text-white hover:border-[var(--color-primary-light)]/30 hover:bg-white/5'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
          <div className="space-y-3">
            <h3 className="text-center font-bold text-white mb-4 drop-shadow-md">الألقاب</h3>
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
                    isSelected ? 'bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent border-[var(--color-primary)] text-[var(--color-primary-light)] shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                    'bg-[var(--color-surface)] border-white/5 text-white hover:border-[var(--color-primary-light)]/30 hover:bg-white/5'
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
          className="card-3d bg-[var(--color-surface)] rounded-3xl p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 mt-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-primary)]/30 shadow-inner">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">أحسنت!</h2>
          <p className="text-[var(--color-text-muted)] font-bold mb-6">لقد أكملت لعبة الذاكرة بنجاح</p>
          
          <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5 shadow-inner">
            <div className="text-sm text-[var(--color-text-muted)] font-bold mb-1">النتيجة النهائية</div>
            <div className="text-5xl font-bold text-[var(--color-primary-light)] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">{score}</div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleGameSelect(activeGame)}
              className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-black rounded-xl font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 border border-[var(--color-primary-light)]/50"
            >
              <Sparkles size={20} />
              تحدي جديد
            </button>
            <button 
              onClick={() => setActiveGame('menu')}
              className="w-full py-4 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10"
            >
              العودة للقائمة
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5">
          <div className="flex items-center gap-2 text-[var(--color-primary-light)] font-bold drop-shadow-md">
            <Star size={20} className="fill-current" />
            <span>{score} نقطة</span>
          </div>
          <div className="text-sm font-bold text-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-4 py-1.5 rounded-full shadow-inner border border-[var(--color-primary-light)]/50">
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
                  isFlipped ? 'bg-[var(--color-surface)] border-[var(--color-primary-light)] text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                  'bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent border-[var(--color-primary)]/30 text-transparent hover:border-[var(--color-primary-light)]/50'
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

  const renderGame = () => {
    if (activeGame === 'prophets') return renderProphetsGame();
    if (activeGame === 'memory') return renderMemoryGame();

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 size={48} className="text-[var(--color-primary)] animate-spin mb-6 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
          <h2 className="text-2xl font-bold text-white font-serif mb-2 drop-shadow-md">جاري توليد أسئلة جديدة...</h2>
          <p className="text-[var(--color-text-muted)] font-bold flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--color-primary-light)]" />
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
          className="card-3d bg-[var(--color-surface)] rounded-3xl p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 mt-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-primary)]/30 shadow-inner">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">انتهى التحدي!</h2>
          <p className="text-[var(--color-text-muted)] font-bold mb-6">لقد أتممت جميع الأسئلة بنجاح</p>
          
          <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5 shadow-inner">
            <div className="text-sm text-[var(--color-text-muted)] font-bold mb-1">النتيجة النهائية</div>
            <div className="text-5xl font-bold text-[var(--color-primary-light)] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">{score}</div>
            <div className="text-sm text-white/40 font-bold mt-2">من {questionsList.length * 10} نقطة</div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleGameSelect(activeGame)}
              className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-black rounded-xl font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 border border-[var(--color-primary-light)]/50"
            >
              <Sparkles size={20} />
              توليد أسئلة جديدة
            </button>
            <button 
              onClick={() => setActiveGame('menu')}
              className="w-full py-4 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10"
            >
              العودة للقائمة
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5">
          <div className="flex items-center gap-2 text-[var(--color-primary-light)] font-bold drop-shadow-md">
            <Star size={20} className="fill-current" />
            <span>{score} نقطة</span>
          </div>
          <div className="text-sm font-bold text-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-4 py-1.5 rounded-full shadow-inner border border-[var(--color-primary-light)]/50">
            السؤال {currentQuestion + 1} / {questionsList.length}
          </div>
        </div>

        <motion.div 
          key={currentQuestion}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="card-3d bg-[var(--color-surface)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5"
        >
          {activeGame === 'ayah' && 'surah' in currentQ && (
            <div className="text-center text-sm text-[var(--color-primary-light)] font-bold mb-4 bg-[var(--color-primary)]/10 py-1 px-4 rounded-full inline-block border border-[var(--color-primary)]/20 shadow-inner">
              {currentQ.surah}
            </div>
          )}
          
          <h2 className={`text-2xl font-bold text-white mb-8 leading-relaxed text-center drop-shadow-md ${activeGame === 'ayah' ? 'font-serif text-3xl text-[var(--color-primary-light)]' : ''}`}>
            {'question' in currentQ ? currentQ.question : currentQ.ayah}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              let btnClass = "w-full p-4 rounded-xl text-right font-bold transition-all border-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)] ";
              
              if (!isAnswered) {
                btnClass += "bg-black/20 border-white/5 hover:border-[var(--color-primary-light)]/30 hover:bg-white/5 text-white";
              } else {
                if (index === currentQ.correct) {
                  btnClass += "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                } else if (index === selectedAnswer) {
                  btnClass += "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                } else {
                  btnClass += "bg-black/20 border-transparent text-white/30 opacity-50";
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
                    <span className="text-lg">{option}</span>
                    {isAnswered && index === currentQ.correct && <CheckCircle2 className="text-emerald-400 drop-shadow-md" />}
                    {isAnswered && index === selectedAnswer && index !== currentQ.correct && <XCircle className="text-red-400 drop-shadow-md" />}
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
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-4 -mx-4 mb-6">
        <button
          onClick={() => activeGame === 'menu' ? onBack() : setActiveGame('menu')}
          className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
        >
          <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" />
        </button>
        <h1 className="text-xl font-bold font-serif text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          {activeGame === 'menu' ? 'الألعاب' : activeGame === 'quiz' ? 'مسابقة المعلومات' : activeGame === 'ayah' ? 'أكمل الآية' : activeGame === 'history' ? 'أحداث تاريخية' : activeGame === 'prophets' ? 'ألقاب الأنبياء' : 'لعبة الذاكرة'}
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

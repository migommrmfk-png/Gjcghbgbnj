import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Send, User, Sparkles, ArrowRight, Loader2, Trash2, Mic, Square, 
  Key, Check, Info, Award, Volume2, VolumeX, History, Heart, BrainCircuit 
} from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { AI_TRAINING_SYSTEM_PROMPT } from '../data/aiTrainingRules';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: number;
}

interface UserMemory {
  preferredName: string;
  spiritualGoal: string;
  currentChallenge: string;
  lastUpdated: string;
  faithActivityCount: number;
}

export default function MuslimAI({ onBack, onNavigate }: { onBack: () => void, onNavigate?: (tab: string) => void }) {
  const { user, userData } = useAuth();
  
  // States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(() => localStorage.getItem('sheikh_voice_active') === 'true');
  const [speakingText, setSpeakingText] = useState('');
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(() => localStorage.getItem('user_custom_gemini_key') || '');
  const [hasCustomKey, setHasCustomKey] = useState(() => !!localStorage.getItem('user_custom_gemini_key'));
  
  // User Memory fields
  const [memory, setMemory] = useState<UserMemory>({
    preferredName: userData?.displayName || 'أخي الكريم',
    spiritualGoal: 'المحافظة على الورد القرآني وقيام الليل',
    currentChallenge: 'مقاومة الكسل الفجرى وتحصين اللسان',
    lastUpdated: new Date().toISOString(),
    faithActivityCount: 1
  });
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [savingMemory, setSavingMemory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat and memory on mount
  useEffect(() => {
    async function loadData() {
      if (user && user.uid !== 'local_guest') {
        try {
          // 1. Load memory from Firestore
          const memoryDocRef = doc(db, 'users', user.uid, 'ai_settings', 'memory');
          const memorySnap = await getDoc(memoryDocRef);
          if (memorySnap.exists()) {
            setMemory(memorySnap.data() as UserMemory);
          } else {
            // Provision initial memory document
            const initialMemory: UserMemory = {
              preferredName: userData?.displayName || user.displayName || 'أخي الكريم',
              spiritualGoal: 'المحافظة على الصلوات الخمس في أوقاتها وتحسين الترتيل',
              currentChallenge: 'المواظبة على أذكار الصباح والمساء في وقتهما الصحيح',
              lastUpdated: new Date().toISOString(),
              faithActivityCount: 1
            };
            await setDoc(memoryDocRef, initialMemory);
            setMemory(initialMemory);
          }

          // 2. Load latest messages limit 25 to save server resources
          const chatColRef = collection(db, 'users', user.uid, 'ai_chats');
          const chatQuery = query(chatColRef, orderBy('timestamp', 'asc'), limit(30));
          const chatSnap = await getDocs(chatQuery);
          
          if (!chatSnap.empty) {
            const loadedMessages = chatSnap.docs.map(d => ({
              role: d.data().role as 'user' | 'model',
              text: d.data().text
            }));
            setMessages(loadedMessages);
          } else {
            setMessages([
              { 
                role: 'model', 
                text: `السلام عليكم ورحمة الله وبركاته يا ${userData?.displayName || 'صاحب الهمة'}. أنا مستشارك التقني والإيماني "الشيخ الروبوتي" المتدرب على كامل أرجاء اليقين وثناياه الفقهية. يتذكر خادمي السحابي معلوماتك وأهدافك الإيمانية دوماً لمساعدتك، كما يمكنك الحديث معي صوتياً وسأجيبك بوقار شيوخنا الأفاضل. كيف يمكنني إعانتك الليلة في رحلتك الروحانية؟ 🌙🕌` 
              }
            ]);
          }

        } catch (e) {
          console.error("Failed to load cloud chats and memory:", e);
          loadLocalFallback();
        }
      } else {
        loadLocalFallback();
      }
    }
    
    function loadLocalFallback() {
      const savedChat = localStorage.getItem('muslimAIChatHistory');
      const savedMem = localStorage.getItem('muslimAIMemory');
      if (savedChat) {
        try {
          setMessages(JSON.parse(savedChat));
        } catch (_) {
          setMessagesDefault();
        }
      } else {
        setMessagesDefault();
      }
      if (savedMem) {
        try {
          setMemory(JSON.parse(savedMem));
        } catch (_) {}
      }
    }

    function setMessagesDefault() {
      setMessages([
        { 
          role: 'model', 
          text: `السلام عليكم ورحمة الله وبركاته. أنا المساعد الإسلامي والتقني الذكي "الشيخ الروبوتي" المتدرب على كل تفصيلة في تطبيق اليقين. مبرمج خصيصاً لمرافقة همتك الروحانية وحفظ أهدافك وذاكرتك لمساعدتك بصدق، كما يمكنك التحدث معي بوقار الصوت الفصيح. كيف يمكنني إعانتك وتوجيهك الليلة؟ ✨` 
        }
      ]);
    }

    loadData();
  }, [user]);

  // Handle Dynamic starting prompt from other pages (e.g. Dreams interpretation or Recitation correction)
  useEffect(() => {
    const startPrompt = localStorage.getItem("ai_starting_prompt");
    if (startPrompt) {
      setInput(startPrompt);
      localStorage.removeItem("ai_starting_prompt");
    }
  }, []);

  // Scroll and Save Hook
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!user || user.uid === 'local_guest') {
      localStorage.setItem('muslimAIChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Handle SpeechSynthesis Toggle and Cancel
  useEffect(() => {
    localStorage.setItem('sheikh_voice_active', String(isVoiceActive));
    if (!isVoiceActive) {
      window.speechSynthesis?.cancel();
    }
  }, [isVoiceActive]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Speech Recognition Setup (User voice communication)
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("عذراً، متصفحك الحالي لا يدعم نظام التعرف الصوتي المباشر. يرجى استخدام متصفح كروم أو سفاري.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const recog = new SpeechRecognition();
      recog.lang = 'ar-EG';
      recog.continuous = false;
      recog.interimResults = false;

      recog.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      };

      recog.onresult = (event: any) => {
        const textResult = event.results[0][0].transcript;
        if (textResult) {
          setInput(textResult);
        }
      };

      recog.onerror = (errEvent: any) => {
        console.error("Speech recognition error:", errEvent);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recog.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recog;
      try {
        recog.start();
      } catch (e) {
        console.warn("Speech recognition start failed natively, attempting abort:", e);
        try {
          recog.abort();
        } catch (abortErr) {}
        setTimeout(() => {
          try {
            recog.start();
          } catch (retryErr) {
            console.error("Delayed MuslimAI start failed:", retryErr);
          }
        }, 300);
      }
    } catch (e) {
      console.error("Speech Recognition failed to initialize:", e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Sound Synthesis with elderly, calm Sheikh parameters
  const speakWithSheikhVoice = (text: string) => {
    if (!isVoiceActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      
      // Clean up markdown syntax for voice reading
      const speechReadyText = text
        .replace(/[*#_`~\\-]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/[a-zA-Z]/g, '') // Hide non-arabic letters to avoid robotic spells
        .trim();

      const utterance = new SpeechSynthesisUtterance(speechReadyText);
      utterance.rate = 0.78;  // Highly calm, measured, deliberate pacing
      utterance.pitch = 0.82; // Deep, elderly, wise tone of voice

      // Try finding Microsoft Naayf / Hoda or other direct Arabic voices
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arVoice) {
        utterance.voice = arVoice;
      } else {
        utterance.lang = 'ar-EG';
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis failure:", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsgText = input.trim();
    setInput('');
    setIsLoading(true);

    const newUserMessage: ChatMessage = { role: 'user', text: userMsgText };
    setMessages(prev => [...prev, newUserMessage]);

    // Save user message to Firestore if logged in
    if (user && user.uid !== 'local_guest') {
      try {
        await addDoc(collection(db, 'users', user.uid, 'ai_chats'), {
          role: 'user',
          text: userMsgText,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error("Failed to commit user message in Firestore server:", e);
      }
    }

    try {
      const ai = getGeminiClient();

      // Combine user memory + system training config + chats
      const memoryContextString = `
[ذاكرة وسلوك المستخدم الحالي]:
- اسم المستخدم المفضل للنداء: ${memory.preferredName}
- هدفه الإيماني النشط: ${memory.spiritualGoal}
- تحديه التقويمي وروتينه المنظم: ${memory.currentChallenge}
- عدد طاعاته الأخيرة بالتطبيق: ${memory.faithActivityCount}

توجه إلى المستخدم مباشرة باسمه المفضل وعالج أهدافه وتطلعاته ومخاوفه بلطف شديد وأسلوب شرعي سديد ومبهر وموقر.
`;

      const contents = [
        ...messages.map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: userMsgText }] }
      ];

      const mergedSystemInstruction = `${AI_TRAINING_SYSTEM_PROMPT}\n\n${memoryContextString}`;

      // Insert blank model message placeholder which will hold streamed chunks
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      let accumulatedText = '';

      await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: mergedSystemInstruction
        },
        onChunk: (chunkText) => {
          accumulatedText += chunkText;
          setMessages(prev => {
            const nextList = [...prev];
            const lastIndex = nextList.length - 1;
            if (lastIndex >= 0 && nextList[lastIndex].role === 'model') {
              nextList[lastIndex] = {
                ...nextList[lastIndex],
                text: accumulatedText
              };
            }
            return nextList;
          });
        }
      });

      const robotText = accumulatedText || "عذراً يا أخي، تعذر صياغة الرأي السديد حالياً. تفاءل واستغفر ربك الحليم.";
      
      // Speak back using Sheikh Voice Synthesis
      speakWithSheikhVoice(robotText);

      // Save robot reply to server database (Firestore)
      if (user && user.uid !== 'local_guest') {
        try {
          await addDoc(collection(db, 'users', user.uid, 'ai_chats'), {
            role: 'model',
            text: robotText,
            timestamp: Date.now()
          });

          // Incremental count of spiritual activities
          const memoryDocRef = doc(db, 'users', user.uid, 'ai_settings', 'memory');
          const updatedMemory = {
            ...memory,
            faithActivityCount: memory.faithActivityCount + 1,
            lastUpdated: new Date().toISOString()
          };
          await setDoc(memoryDocRef, updatedMemory);
          setMemory(updatedMemory);
        } catch (e) {
          console.error("Failed to update AI stats and reply in Cloud database:", e);
        }
      } else {
        const updatedLocalMemory = {
          ...memory,
          faithActivityCount: memory.faithActivityCount + 1,
          lastUpdated: new Date().toISOString()
        };
        setMemory(updatedLocalMemory);
        localStorage.setItem('muslimAIMemory', JSON.stringify(updatedLocalMemory));
      }

    } catch (error: any) {
      console.error("Analytical or connection AI error:", error);
      const errText = error?.message || "حدث تداخل تقني طفيف. استغفر الله العظيم وحاول ثانية.";
      setMessages(prev => {
        const nextList = [...prev];
        const lastIndex = nextList.length - 1;
        if (lastIndex >= 0 && nextList[lastIndex].role === 'model' && nextList[lastIndex].text === '') {
          nextList[lastIndex] = { role: 'model', text: errText };
          return nextList;
        } else {
          return [...prev, { role: 'model', text: errText }];
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      if (user && user.uid !== 'local_guest') {
        // Purge memory and chat collections on the server
        const chatColRef = collection(db, 'users', user.uid, 'ai_chats');
        const snaps = await getDocs(chatColRef);
        await Promise.all(snaps.docs.map(d => deleteDoc(d.ref)));
      }
      
      localStorage.removeItem('muslimAIChatHistory');
      setMessages([
        { 
          role: 'model', 
          text: 'تم بحمد الله تطهير سجل المحادثات والبدء على طهارة تامة ونية مستأنفة. تفضل بطلبك الروحي والتقني يا رعاك الله. ✨🕌' 
        }
      ]);
      setShowClearConfirm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const saveMemoryToCloud = async () => {
    setSavingMemory(true);
    const updatedMemory = {
      ...memory,
      lastUpdated: new Date().toISOString()
    };
    try {
      if (user && user.uid !== 'local_guest') {
        const memoryDocRef = doc(db, 'users', user.uid, 'ai_settings', 'memory');
        await setDoc(memoryDocRef, updatedMemory);
      }
      setMemory(updatedMemory);
      localStorage.setItem('muslimAIMemory', JSON.stringify(updatedMemory));
      setShowMemoryModal(false);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          text: `أبشر يا ${updatedMemory.preferredName}؛ تم تثبيت ذاكرتك السحابية بنجاح. أصبحت أعلم جيداً أن هدفك هو [${updatedMemory.spiritualGoal}] وتحديك هو [${updatedMemory.currentChallenge}]. سأعمل جاهداً لتطويع نصائحي من أجل تسديد خطاك. 🌸🤲` 
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMemory(false);
    }
  };

  const saveCustomKey = () => {
    if (customKeyInput.trim() === '') {
      localStorage.removeItem('user_custom_gemini_key');
      setHasCustomKey(false);
      setMessages(prev => [...prev, { role: 'model', text: 'تمت إزالة المفتاح المخصص. سيتم الآن استخدام خادم اليقين الموحد.' }]);
    } else {
      localStorage.setItem('user_custom_gemini_key', customKeyInput.trim());
      setHasCustomKey(true);
      setMessages(prev => [...prev, { role: 'model', text: 'تم حفظ وتفعيل مفتاح الذكاء الاصطناعي بنجاح! طاقات التوليد لليقين أصبحت تحت سيطرتك الكاملة والآمنة. 🔒🚀' }]);
    }
    setShowKeyConfig(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-slate-50 dark:bg-[#07130F] relative overflow-hidden text-slate-800 dark:text-slate-100" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 bg-white/90 dark:bg-slate-900/95 sticky top-0 border-b border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <ArrowRight className="text-slate-500 hover:text-emerald-500" size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm font-serif leading-none flex items-center gap-1.5">
              مستشار الشيخ الذكي
              <span className="bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none shadow-sm">نشط</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">الذكاء الاصطناعي الإرشادي لليقين</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* User Memory Button */}
          <button 
            onClick={() => setShowMemoryModal(true)} 
            className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-full transition-all shadow-xs"
            title="ذاكرة الشيخ وحفظ البيانات"
          >
            <BrainCircuit size={17} />
          </button>
          
          {/* Key Customizer */}
          <button 
            onClick={() => setShowKeyConfig(true)} 
            className={`p-2 rounded-full transition-all border shadow-xs ${
              hasCustomKey 
                ? 'bg-amber-500/10 text-amber-500 border-amber-300/30' 
                : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-500 border-slate-100 dark:border-slate-800'
            }`} 
            title="إعداد مفتاح ذكاء اصطناعي خاص"
          >
            <Key size={17} />
          </button>

          {/* Sheikh Voice Toggle */}
          <button 
            onClick={() => setIsVoiceActive(prev => !prev)} 
            className={`p-2 rounded-full transition-all border shadow-xs ${
              isVoiceActive 
                ? 'bg-emerald-500/10 text-emerald-550 border-emerald-300/30' 
                : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-500 border-slate-100 dark:border-slate-800'
            }`}
            title="تفعيل قراءة الشيخ الصوتية"
          >
            {isVoiceActive ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          
          <button onClick={() => setShowClearConfirm(true)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-450 rounded-full transition-colors border border-transparent" title="تطهير ومسح المحادثة">
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {/* Connection Indicator banner */}
      <div className="px-4 py-2 flex flex-col items-center justify-center gap-1 text-center shrink-0 border-b border-slate-100 dark:border-slate-800 bg-emerald-500/5 dark:bg-emerald-500/5 text-[10px] font-bold leading-normal">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Sparkles size={11} className="text-amber-400 animate-spin" />
          <span>مرشدك الذكي متصل حالياً بقاعدة بيانات سحابة اليقين ونظام القواعد الشرعي الصارم.</span>
        </div>
        <p className="text-[9.5px] text-teal-600 dark:text-teal-400 font-black">
          🔒 لا يتم تسريب المحادثات نهائياً ومحفوظة محلياً بخصوصية وتشفير كامل 100%.
        </p>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl rounded-3xl"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 text-center font-serif">مسح المحادثة</h3>
              <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">هل أنت متأكد من مسح وتطهير سجل محادثاتك مع الشيخ؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-slate-650 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-650 text-sm shadow-md"
                >
                  مسح وتأكيد
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Manager Model (The user memory block) */}
      <AnimatePresence>
        {showMemoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl rounded-3xl text-right"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="text-emerald-500" size={24} />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif leading-none">تخصيص ذاكرة الشيخ الروبوتية</h3>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mb-4">
                تُخزن هذه البيانات السلوكية بأمان بمخزنك السحابي لتوجيه حوارات الشيخ ونماذجه بدقة فائقة لتلائم أهدافك الحقيقية.
              </p>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">الاسم المفضل للنداء</label>
                  <input
                    type="text"
                    value={memory.preferredName}
                    onChange={(e) => setMemory({ ...memory, preferredName: e.target.value })}
                    placeholder="مثال: أخي الحبيب أحمد، أمينة الفاضلة..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">هدفك الروحاني الحالي</label>
                  <textarea
                    value={memory.spiritualGoal}
                    onChange={(e) => setMemory({ ...memory, spiritualGoal: e.target.value })}
                    rows={2}
                    placeholder="مثال: ختم ربع الحزب يوميًا وتثبيت حفظ سورة البقرة..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">تحديك الإيماني الرئيسي</label>
                  <input
                    type="text"
                    value={memory.currentChallenge}
                    onChange={(e) => setMemory({ ...memory, currentChallenge: e.target.value })}
                    placeholder="مثال: مقاومة سهر الليل والالتزام بصلاة الفتح جماعة..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMemoryModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveMemoryToCloud}
                  disabled={savingMemory}
                  className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1 shadow-md"
                >
                  {savingMemory ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  حفظ الذاكرة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key customizer modal */}
      <AnimatePresence>
        {showKeyConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 max-w-sm w-full shadow-2xl rounded-3xl text-right"
            >
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 text-center flex items-center justify-center gap-2 font-serif">
                <Key className="text-amber-500" size={20} />
                مفتاح ذكاء اصطناعي مخصص
              </h3>
              <p className="text-slate-500 text-[11px] text-center mb-4 leading-relaxed font-semibold">
                املك مفاتيح المعالجة الكاملة لنماذج ذكائك الاصطناعي دون حدود من خلال دمج رمز Gemini أو OpenAI الخاص بك بأمان تام في متصفحك.
              </p>
              
              <div className="space-y-4 mb-5">
                <div>
                  <input
                    type="password"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder="قم بلصق الكود السجل الخاص بك (Gemini key / OpenAI sk-)..."
                    className="w-full text-center font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {hasCustomKey && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                      ✓ مسجل ومستخدم حالياً. لمسحه، اترك الحقل فارغاً ثم اضغط حفظ.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowKeyConfig(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-550 bg-slate-100 dark:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveCustomKey}
                  className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600"
                >
                  تأكيد وحفظ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {onNavigate && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-[0_4px_15px_-5px_rgba(16,185,129,0.3)] border border-white/15 relative overflow-hidden text-right">
            <div className="absolute left-0 top-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mt-6 pointer-events-none"></div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎙️</span>
              <div>
                <h4 className="text-xs font-bold font-serif">ركن تسميع القرآن الكريم الذكي</h4>
                <p className="text-[10px] text-emerald-50/90 font-semibold mt-0.5">سمِّع السور أو الآيات بصوتك واحصل على فحص فوري للأخطاء!</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem("quran_sub_tab", "memorize");
                onNavigate("quran");
              }}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-black text-[10px] px-3 py-1.5 rounded-full shadow-md whitespace-nowrap active:scale-95 transition-all shrink-0"
            >
              ابدأ التسميع
            </button>
          </div>
        )}

        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-start gap-2.5 shadow-xs">
          <span className="text-lg">🌾</span>
          <p className="text-[10px] text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
            <strong className="block mb-0.5">تنويه إخلاء مسؤولية فقهي:</strong>
            الإجابات التقنية والفقهية تتم معالجتها وتوليدها ذكياً عبر روبوتنا المبارك المتدرب على كامل النظم. في حالة المسائل الأسرية أو الفتاوى الشائكة والمعقدة يرجى دائماً مراجعة لجان الفتاوى وعلماء الأمة المعاصرة.
          </p>
        </div>

        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => setInput("ما هو أسلوبي الإيماني الحالي، وكيف أبدأ مسيرتي؟")}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl text-[11px] font-bold shadow-xs hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:scale-[1.01] transition-all"
            >
              موقفي الإيماني الحالي 📿
            </button>
            <button
              onClick={() => setInput("أعطني خطة عملية للمحافظة على صلاة الفجر بانتظام وبلا كسل")}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl text-[11px] font-bold shadow-xs hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:scale-[1.01] transition-all"
            >
              المحافظة على صلاة الفجر 🕌
            </button>
            <button
              onClick={() => setInput("ما هي أطوار وأسماء درجات الارتقاء الروحي بالتطبيق؟")}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl text-[11px] font-bold shadow-xs hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:scale-[1.01] transition-all"
            >
              درجات الارتقاء الروحي 🏆
            </button>
            <button
              onClick={() => setInput("حدثني بالتفصيل عن أهم أعمال اليوم وكيف يزيد رصيد مهاراتي اليومي")}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl text-[11px] font-bold shadow-xs hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:scale-[1.01] transition-all"
            >
              طريقة كسب الـ XP والورد 📈
            </button>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border shadow-xs ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' 
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div className={`p-3 px-4 rounded-2xl border shadow-xs leading-relaxed text-xs font-semibold whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-none border-emerald-600'
                    : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                  {msg.role === 'model' && isVoiceActive && (
                    <button
                      onClick={() => speakWithSheikhVoice(msg.text)}
                      className="block mt-2 mr-auto text-[10px] text-emerald-500 font-bold hover:underline"
                    >
                      🔊 تكرار قراءة الشيخ بوقار
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-2.5 max-w-[85%] flex-row">
                <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                  <Bot size={14} />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-emerald-500" />
                  <span className="text-[10px] text-slate-500 font-bold">الشيخ يتلقى ويتأمل...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input panel situated at bottom */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 shrink-0 z-10 w-full">
        <div className="flex items-center gap-2">
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? `الشيخ يستمع إلى صوتك... اضغط للإرسال` : "اسأل الشيخ سؤالاً أو ناقش رداءة همتك..."}
              className={`w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 rounded-xl py-3 pr-4 pl-12 focus:outline-none focus:border-emerald-500 transition-all text-xs font-semibold ${
                isRecording ? 'text-red-500 font-bold border-red-500' : ''
              }`}
              disabled={isLoading}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-xs disabled:opacity-50 hover:bg-emerald-600 transition-colors"
            >
              <Send size={13} className="rotate-180" />
            </button>
          </div>

          <button
            onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
            disabled={isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-xs ${
              isRecording 
                ? 'bg-red-500 text-white border-red-650 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800 text-emerald-500 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
            }`}
            title="تحدث بالصوت صوتياً مع الشيخ"
          >
            {isRecording ? <Square size={14} className="fill-current" /> : <Mic size={15} />}
          </button>
        </div>

        <div className="text-center mt-2 flex items-center justify-center gap-1 text-[8px] text-slate-400 font-bold">
          <Award size={9} className="text-amber-400" />
          <span>تم تفعيل الفحص التلقائي وذاكرة التتبع السحابي بفضل قواعد التدريب الفقهية المنظمة لليقين.</span>
        </div>
      </div>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Search, Sparkles, Volume2, VolumeX, X, RefreshCw, 
  BookOpen, Quote, AlertCircle, HelpCircle, ArrowLeft, Copy, Check 
} from 'lucide-react';
import { getGeminiClient, Type } from '../lib/gemini';
import toast from 'react-hot-toast';

interface SearchResult {
  type: 'quran' | 'hadith';
  title: string;
  text: string;
  reference: string;
  explanation: string;
}

interface VoiceSearchAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToQuran?: () => void;
}

export default function VoiceSearchAssistant({ isOpen, onClose }: VoiceSearchAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);

  // Suggestions for user
  const suggestions = [
    "ابحث عن آية الكرسي",
    "حديث عن الصدق والأمانة",
    "آية الذين آمنوا وتطمئن قلوبهم",
    "حديث لتدخلن الجنة",
    "آية وإنك لعلى خلق عظيم",
    "حديث اتق الله حيثما كنت"
  ];

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'ar-SA'; // Set to Arabic (Saudi Arabia)

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('جاري الإنصات لصوتك الروحي...');
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError("تم رفض صلاحية استخدام الميكروفون. يرجى تفعيل الصلاحية من إعدادات المتصفح.");
        } else {
          setError("عذراً، لم نتمكن من التقاط صوتك بوضوح. أعد المحاولة أو اكتب بحثك.");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        if (text) {
          setTranscript(text);
          triggerSearch(text);
        }
      };

      recognitionRef.current = rec;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (synthesisRef.current) synthesisRef.current.cancel();
    if (!speechSupported) {
      toast.error("البحث الصوتي غير مدعوم في متصفحك الحالي، يمكنك الكتابة في حقل البحث");
      return;
    }
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      setResult(null);
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("SpeechRecognition start error caught in voice search:", e);
        try {
          recognitionRef.current.abort();
        } catch (abortError) {}
        
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (retryError) {
            console.error("Delayed VoiceSearch SpeechRecognition start retry failed:", retryError);
          }
        }, 300);
      }
    }
  };

  const triggerSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const gemini = getGeminiClient();
      const prompt = `أنت مساعد إسلامي ومستشار قرآني ذكي ومحدث أثري. ابحث في القرآن الكريم والأحاديث النبوية الشريفة في كتب السنة الستة المعتمدة عن النص أو المفهوم المطابق لطلب المستخدم: "${queryText}".
قم بإرجاع النتيجة بتنسيق JSON دقيق باتباع الهيكل التالي تماماً دون أي تعليقات أو نصوص خارجية:
{
  "type": "quran" أو "hadith",
  "title": "اسم السورة أو موضوع الحديث الكلي وبابه",
  "text": "النص الكامل للآية أو الآيات الكريمة مخرجة مشكولة بدقة، أو النص الكامل للحديث الشريف المشكول بالسند أو المتن بوقار",
  "reference": "مثلاً لآيات القرآن [البقرة: آية 255]، وللحديث مخرجه ورقمه [رواه البخاري ومسلم، رقم 58] أو المصدر المعتمد",
  "explanation": "شرح إيماني، بلاغي، أو فقهي طيب مختصر للآية أو الحديث الشريف يبعث على التقوى وسكينة النفس ويزيد من إيمان العبد باللغة العربية"
}`;

      const res = await gemini.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "quran or hadith" },
              title: { type: Type.STRING, description: "Surah/Topic title" },
              text: { type: Type.STRING, description: "Exact Arabic text" },
              reference: { type: Type.STRING, description: "Reference metadata" },
              explanation: { type: Type.STRING, description: "Spiritual translation/explanation" }
            },
            required: ["type", "title", "text", "reference", "explanation"]
          }
        }
      });

      if (res && res.text) {
        const cleanJson = res.text.trim();
        const parsed = JSON.parse(cleanJson) as SearchResult;
        setResult(parsed);

        // Speak result text if audio is enabled
        if (audioFeedback && synthesisRef.current) {
          const intro = parsed.type === 'quran' ? 'قال الله تعالى في محكم كتابه العظيم: ' : 'قال نبينا الكريم صلى الله عليه وسلم: ';
          const speechText = (intro + parsed.text)
            .replace(/[*#_`~\\-]/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/[a-zA-Z]/g, '')
            .trim();

          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = 0.80;  // Calm pacing
          utterance.pitch = 0.90; // Deep masculine/sheikh voice tone

          // Try finding direct Arabic male voices or fallback to avoiding female voices
          const voices = synthesisRef.current.getVoices();
          const arVoices = voices.filter(v => v.lang.startsWith('ar') || v.lang.startsWith('AR'));
          
          const maleKeywords = ['naayf', 'maged', 'tarik', 'male', 'hazem', 'zakaria', 'shakir', 'youssef', 'saeed', 'hamzah', 'musa', 'salem', 'faisal', 'khalid', 'bassam', 'mohamed', 'omar', 'ali', 'ibrahim', 'boy', 'man', 'sheikh'];
          const femaleKeywords = ['hoda', 'mariam', 'leila', 'yasmin', 'zeina', 'sana', 'female', 'laila', 'salma', 'amina', 'rauda', 'zara', 'kamala', 'kamilah', 'fawzia', 'ghada', 'latifa', 'maha', 'noha', 'ranya', 'salwa', 'warda', 'girl', 'woman', 'lady'];

          let selectedVoice = arVoices.find(v => {
            const nameLower = v.name.toLowerCase();
            return maleKeywords.some(keyword => nameLower.includes(keyword));
          });

          if (!selectedVoice) {
            selectedVoice = arVoices.find(v => {
              const nameLower = v.name.toLowerCase();
              return !femaleKeywords.some(keyword => nameLower.includes(keyword));
            });
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          } else if (arVoices.length > 0) {
            utterance.voice = arVoices[0];
          } else {
            utterance.lang = 'ar-SA';
          }

          synthesisRef.current.speak(utterance);
        }
      } else {
        throw new Error("لم نتمكن من الحصول على نتيجة دقيقة.");
      }
    } catch (e: any) {
      console.error(e);
      setError("عذراً، لم نتمكن من العثور على مطابقة دقيقة للآية أو الحديث. حاورني بمرادفات أخرى أو جرب الاقتراحات المقترحة.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `« ${result.text} »\n${result.reference}\n\nالشرح والتدبر:\n${result.explanation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("تم نسخ الآية/الحديث مع مخرجه وتدبره بنجاح!");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAudio = () => {
    setAudioFeedback(!audioFeedback);
    if (!audioFeedback && synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f4f7f6] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#122A21] bg-white dark:bg-[#0A1914] z-10 shadow-sm">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-50 dark:bg-[#122A21] flex items-center justify-center text-slate-500 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#1C3E32] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500 w-5 h-5 animate-pulse" />
          <h2 className="text-base font-black font-serif text-[#0D5C4D] dark:text-emerald-400">مساعد "اليقين" الصوتي الذكي</h2>
        </div>
        <button 
          onClick={toggleAudio}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            audioFeedback 
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-slate-50 dark:bg-slate-900 text-slate-400"
          }`}
          title={audioFeedback ? "إيقاف القراءة الصوتية التلقائية" : "تشغيل القراءة الصوتية التلقائية"}
        >
          {audioFeedback ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        
        {/* Intro Card */}
        <div className="bg-gradient-to-l from-[#0D5C4D] to-[#052820] rounded-[28px] p-6 text-white text-right relative overflow-hidden shadow-lg border border-emerald-400/20">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
          <div className="relative z-10 space-y-2">
            <span className="bg-amber-500 text-white text-[9.5px] px-2.5 py-1 rounded-full font-black tracking-wider uppercase inline-block mb-1">
              مبني بنظام التقاط الدلالات والبحث الصوتي الذكي Gemini
            </span>
            <h3 className="text-lg font-bold font-serif leading-none">تحدث بمرادك، واليقين يجيبك!</h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              انطق بكلمات أو معانٍ أو أجزاء من آيات قرآنية أو أحاديث نبوية؛ كعبارة أو موضوع (مثل "حديث الصدق" أو "آية الطمأنينة") ليقوم محرك المساعد الذكي بالبحث والاستخلاص والتدبر الفوري لك وتلاوتها بصوت وقور.
            </p>
          </div>
        </div>

        {/* Suggestions Row */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <HelpCircle size={14} className="text-[#0D5C4D] dark:text-emerald-400" />
            جرب النطق بأحد هذه العبارات النموذجية:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(s);
                  triggerSearch(s);
                }}
                className="bg-white dark:bg-[#0A1914] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-medium text-slate-700 dark:text-slate-300 p-3 rounded-2xl border border-slate-100 dark:border-[#122A21] flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-all text-right group"
              >
                <span className="truncate">{s}</span>
                <Mic size={12} className="text-slate-400 group-hover:text-emerald-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Speech input core view */}
        <div className="bg-white dark:bg-[#0A1914] rounded-[32px] p-6 border border-slate-100 dark:border-[#122A21] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Micro Indicator and Wave animation */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="absolute w-24 h-24 rounded-full bg-emerald-500/20"
                />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: 0.6 }}
                  className="absolute w-32 h-32 rounded-full bg-emerald-500/10"
                />
              </>
            )}

            <button
              onClick={startListening}
              className={`w-18 h-18 rounded-[28px] flex items-center justify-center text-white shadow-lg transition-all ${
                isListening 
                  ? "bg-red-500 shadow-red-500/30 scale-105" 
                  : "bg-gradient-to-br from-[#0D5C4D] to-[#041D15] shadow-emerald-500/20 hover:scale-105"
              }`}
            >
              {isListening ? (
                <MicOff size={28} className="animate-pulse" />
              ) : (
                <Mic size={28} />
              )}
            </button>
          </div>

          <div className="space-y-2 w-full px-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0D5C4D] dark:text-emerald-400">
              {isListening ? "إنني مستمع بقلبي وصوتك مسموع..." : "انقر لتفعيل البحث الصوتي الفوري"}
            </span>
            <p className={`text-sm font-bold ${isListening ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"} max-w-sm mx-auto leading-relaxed`}>
              {transcript || "«انطق بالآية أو موضوع الحديث الذي يشغل فكرك»"}
            </p>
          </div>

          {/* Typing fallback form */}
          <div className="w-full max-w-md pt-4 border-t border-slate-50 dark:border-[#122A21] flex gap-2">
            <input 
              type="text"
              placeholder="أو اكتب اسم الآية أو الحديث يدوياً..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && triggerSearch(transcript)}
              className="flex-1 text-xs text-right bg-slate-50 dark:bg-[#07130F] border border-slate-100 dark:border-[#122A21] px-4 py-3 rounded-2xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
            />
            <button 
              onClick={() => triggerSearch(transcript)}
              disabled={isSearching || !transcript.trim()}
              className="px-4 py-3 bg-[#0D5C4D] hover:bg-emerald-800 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-1 shrink-0"
            >
              {isSearching ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
              <span>ابحث</span>
            </button>
          </div>
        </div>

        {/* Dynamic States - Loading / Error / Results */}
        <AnimatePresence mode="wait">
          
          {isSearching && (
            <motion.div 
              key="loader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12 text-center"
            >
              <RefreshCw className="animate-spin text-[#0D5C4D] dark:text-emerald-400 w-8 h-8 mb-3" />
              <p className="text-xs font-bold text-slate-500">جاري الإفادة من مجمع الذكاء وتدبر المطابقة في كتب الأثر والتنزيل الحكيم...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/5 border border-red-500/10 rounded-[28px] p-5 flex items-start gap-3.5"
            >
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1 text-right">
                <p className="text-xs font-bold text-red-600 dark:text-red-400">عذراً، لم نزدد تطابقاً دقيقاً</p>
                <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative overflow-hidden bg-white dark:bg-[#0A1914] border border-slate-100 dark:border-[#122A21] rounded-[32px] p-6 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.08)] text-right space-y-5"
            >
              <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-br-full pointer-events-none"></div>
              
              {/* Result Header Badge */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleCopy}
                  className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-[#122A21] flex items-center justify-center text-slate-400 hover:text-emerald-500"
                  title="نسخ الآية أو الحديث والتدبر"
                >
                  {copied ? <Check className="text-emerald-500" size={16} /> : <Copy size={16} />}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">« {result.title} »</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    result.type === 'quran' 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}>
                    {result.type === 'quran' ? <BookOpen size={12} /> : <Quote size={12} />}
                    {result.type === 'quran' ? 'آية محكمة' : 'حديث شريف'}
                  </span>
                </div>
              </div>

              {/* Exact Source Content Text */}
              <div className="bg-emerald-500/5 dark:bg-emerald-500/2 rounded-2xl p-5 border border-emerald-500/10 dark:border-emerald-500/5">
                <p className="text-xl font-serif text-[#0D5C4D] dark:text-emerald-400 leading-loose text-center">
                  {result.text}
                </p>
                <div className="mt-3.5 text-center text-[10px] font-black text-slate-400 tracking-wider">
                  {result.reference}
                </div>
              </div>

              {/* Spiritual Explanation and Reflection */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mr-1">
                  <Sparkles size={14} />
                  <span>لتتدبر قلوبنا • النفحات الإيمانية:</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans bg-amber-500/5 dark:bg-amber-500/2 rounded-2xl p-4 border border-amber-500/10">
                  {result.explanation}
                </p>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}

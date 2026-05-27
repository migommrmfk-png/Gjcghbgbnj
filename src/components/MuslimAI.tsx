import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Sparkles, ArrowRight, Loader2, Trash2, Mic, Square, Key, Check, Info } from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';

export default function MuslimAI({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>(() => {
    const saved = localStorage.getItem('muslimAIChatHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
    return [
      { role: 'model', text: 'السلام عليكم ورحمة الله وبركاته. أنا المساعد الإسلامي الذكي، كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي في أمور الدين، تفسير الأحلام، الفتاوى، أو حتى لعب ألعاب إسلامية تفاعلية! كما يمكنك إرسال تسجيل صوتي لتلاوتك وسأقوم بتقييمها. 🌙✨' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(() => localStorage.getItem('user_custom_gemini_key') || '');
  const [hasCustomKey, setHasCustomKey] = useState(() => !!localStorage.getItem('user_custom_gemini_key'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('muslimAIChatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const clearHistory = () => {
    setMessages([{ role: 'model', text: 'السلام عليكم ورحمة الله وبركاته. أنا المساعد الإسلامي الذكي، كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي في أمور الدين، تفسير الأحلام، الفتاوى، أو حتى لعب ألعاب إسلامية تفاعلية! كما يمكنك إرسال تسجيل صوتي لتلاوتك وسأقوم بتقييمها. 🌙✨' }]);
    setShowClearConfirm(false);
  };

  const saveCustomKey = () => {
    if (customKeyInput.trim() === '') {
      localStorage.removeItem('user_custom_gemini_key');
      setHasCustomKey(false);
      setMessages(prev => [...prev, { role: 'model', text: 'تمت إزالة الكود المخصص بنجاح. سيتم الآن استخدام رمز الاتصال العام المشترك للتطبيق.' }]);
    } else {
      localStorage.setItem('user_custom_gemini_key', customKeyInput.trim());
      setHasCustomKey(true);
      setMessages(prev => [...prev, { role: 'model', text: 'تم حفظ مفتاح الذكاء الاصطناعي (API Key) المخصص الخاص بك بنجاح! تم تفعيل استخدام الذكاء الاصطناعي غير المحدود بأمان فائقة. 🔒🚀' }]);
    }
    setShowKeyConfig(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          await handleAudioSubmit(base64Data, 'audio/webm');
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، تعذر الوصول إلى الميكروفون. يرجى التحقق من صلاحيات المتصفح أو بيئة تشغيل التطبيق.' }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleAudioSubmit = async (base64Data: string, mimeType: string) => {
    setMessages(prev => [...prev, { role: 'user', text: '🎤 [تسجيل صوتي للتقييم]' }]);
    setIsLoading(true);

    try {
      const ai = getGeminiClient();
      
      const audioPart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };
      
      const textPart = {
        text: "استمع إلى هذا التسجيل الصوتي (تلاوة قرآن أو أذان). قيم الصوت والتجويد، استخرج الأخطاء إن وجدت، وقدم نصائح عملية وتدريبات لتحسين الصوت والأداء. اخلق أجواء إيمانية مبهجة في ردك، وكن مشجعاً وإيجابياً جداً.",
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [audioPart, textPart] },
        config: {
          systemInstruction: "أنت مساعد إسلامي ذكي وموثوق وخبير في المقامات والتجويد. هدفك هو تقييم تلاوة المستخدم، وتوجيهه لتحسين صوته وأدائه. كن إيجابياً، مشجعاً، وقدم نصائح عملية للتدريب الصوتي.",
        }
      });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'عذراً، لم أتمكن من معالجة التسجيل الصوتي.' }]);
    } catch (error: any) {
      console.error("Error calling Gemini AI for audio:", error);
      let errorMessage = error?.message || 'عذراً، حدث خطأ في معالجة الصوت. يرجى المحاولة مرة أخرى لاحقاً.';
      
      const errorStr = String(error?.message || error);
      if (errorStr.includes('API key') || errorStr.includes('key not valid') || errorStr.includes('400') || errorStr.includes('PERMISSION_DENIED')) {
        errorMessage = error?.message || 'مفتاح الذكاء الاصطناعي الخاص بك غير صالح أو مفقود. يرجى النقر على أيقونة المفتاح الذهبي في الأعلى لإدخال رمز API الخاص بك.';
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getGeminiClient();
      
      let chatHistory = [...messages];
      if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
        chatHistory = chatHistory.slice(1);
      }

      const contents = [
        ...chatHistory.map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "أنت مساعد إسلامي ذكي وموثوق. هدفك هو الإجابة على أسئلة المستخدمين المتعلقة بالإسلام، القرآن، السنة، الفقه، السيرة النبوية، والأخلاق الإسلامية. كما يمكنك تفسير الأحلام بناءً على كتب التفسير المعتمدة كابن سيرين، وتقديم فتاوى موثوقة (مع التنبيه على الرجوع للعلماء في المسائل المعقدة). يمكنك أيضاً لعب ألعاب إسلامية تفاعلية مع المستخدم (مثل مسابقات ثقافية إسلامية، أسئلة وأجوبة، ألغاز قرآنية). استخدم لغة عربية فصحى واضحة ومبسطة. كن دائماً مهذباً ولطيفاً.",
        },
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'عذراً، لم أتمكن من معالجة طلبك.' }]);
    } catch (error: any) {
      console.error("Error calling Gemini AI:", error);
      let errorMessage = error?.message || 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً.';
      
      const errorStr = String(error?.message || error);
      if (errorStr.includes('API key') || errorStr.includes('key not valid') || errorStr.includes('400') || errorStr.includes('PERMISSION_DENIED')) {
        errorMessage = error?.message || 'مفتاح الذكاء الاصطناعي الخاص بك غير صالح أو غير موجود. يرجى النقر على أيقونة المفتاح الذهبي بالأعلى لإدخال مفتاح مخصص مجاني والحصول على وصول غير محدود.';
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
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
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
            <Bot size={18} className="text-emerald-500" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-base font-serif leading-none">
              المساعد الإسلامي الذكي
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              مبني على نموذج الذكاء الاصطناعي Gemini
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Custom API Key Button */}
          <button 
            onClick={() => {
              setCustomKeyInput(localStorage.getItem('user_custom_gemini_key') || '');
              setShowKeyConfig(true);
            }} 
            className={`p-2 rounded-full transition-colors border shadow-sm flex items-center justify-center relative ${
              hasCustomKey 
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-500/30' 
                : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-500 border-slate-100 dark:border-slate-800'
            }`} 
            title="إعداد مفتاح مخصص غير محدود"
          >
            <Key size={18} />
            {hasCustomKey && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />
            )}
          </button>
          
          <button onClick={() => setShowClearConfirm(true)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 rounded-full transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-500/20" title="مسح المحادثة">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Connection Mode Indicator */}
      <div className="px-4 py-1.5 text-center shrink-0 border-b border-dashed border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/30 text-[10px] font-bold">
        {hasCustomKey ? (
          <span className="text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
            <Check size={12} className="text-emerald-500 shrink-0" />
            تم تفعيل استخدام الذكاء الاصطناعي غير المحدود بأمان (باستخدام رمزك المخصص)
          </span>
        ) : (
          <span className="text-slate-400 flex items-center justify-center gap-1">
            <Sparkles size={11} className="text-emerald-500 shrink-0" />
            أنت تستخدم مفتاح التطبيق المشترك. انقر على رمز المفتاح الذهبي بالأعلى لإدخال مفتاح غير محدود.
          </span>
        )}
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
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">مسح المحادثة</h3>
              <p className="text-slate-500 text-xs text-center mb-6">هل أنت متأكد من مسح سجل المحادثة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm"
                >
                  مسح
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Key Config Modal */}
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
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 text-center flex items-center justify-center gap-2">
                <Key className="text-amber-500" size={22} />
                تفعيل الذكاء الاصطناعي غير المحدود
              </h3>
              <p className="text-slate-500 text-xs text-center mb-4 leading-relaxed">
                لاستخدام الذكاء الاصطناعي دون قيود، يرجى تزويد رمز واجهة برمجة تطبيقات Gemini أو OpenAI الخاصة بك. يتم حفظ الكود بأمان تام داخل تخزين متصفحك الشخصي فقط.
              </p>
              
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-right text-xs font-bold text-slate-500 mb-1.5">مفتاح API الخاص بك (Gemini key أو OpenAI sk-)</label>
                  <input
                    type="password"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder="قم بلصق الكود السري الخاص بك هنا (Gemini أو OpenAI sk-)..."
                    className="w-full text-center font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                  />
                  {hasCustomKey && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-right mt-1.5 font-bold">
                      ✓ مستلم ومسجل حالياً. لإزالته والعودة للوضع المشترك، امسح الحقل تماماً واحفظ.
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-center text-emerald-600 dark:text-emerald-400 hover:underline py-1.5 bg-emerald-500/10 rounded-xl"
                  >
                    🌐 مفتاح Gemini مجاني
                  </a>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-center text-indigo-600 dark:text-indigo-400 hover:underline py-1.5 bg-indigo-500/10 rounded-xl"
                  >
                    🗝️ مفتاح OpenAI (sk-)
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowKeyConfig(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveCustomKey}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors text-xs"
                >
                  حفظ وتفعيل
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-2xl flex items-start gap-3 shadow-xs">
          <span className="text-lg">⚠️</span>
          <p className="text-[11px] text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
            <strong className="block mb-1">تنبيه هام ومسوؤلية مخلية:</strong>
            الإجابات هنا يتم توليدها خوارزمياً عبر الذكاء الاصطناعي. رغم التدريب والحرص الشديد على صوابيتها الفقهية، يرجى التثبت من أهل العلم في الفتاوى والأطروحات الفقهية المعقدة.
          </p>
        </div>

        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setInput("أريد تفسير حلم رأيته الليلة")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors text-center shadow-xs"
            >
              تفسير الأحلام 🌙
            </button>
            <button
              onClick={() => setInput("لدي سؤال فقهي أو فتوى ومسألة دينية")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors text-center shadow-xs"
            >
              فتاوى وأسئلة 📚
            </button>
            <button
              onClick={() => setInput("هيا نلعب لعبة مسابقات ثقافية إسلامية ممتعة")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors text-center shadow-xs"
            >
              مسابقات إسلامية 🎮
            </button>
            <button
              onClick={() => setInput("أريد تقييم تلاوة القرآن بصوتي وسأقوم بالتسجيل الان")}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors text-center shadow-xs"
            >
              تقييم التلاوة 🎤
            </button>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center border ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' 
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-100 dark:border-emerald-500/20'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 px-4 rounded-2xl shadow-xs border ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-tr-none border-emerald-600'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                }`}>
                  <p className={`text-xs leading-relaxed whitespace-pre-wrap font-medium ${msg.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-2.5 max-w-[85%] flex-row">
                <div className="w-7 h-7 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                  <Bot size={14} />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none shadow-xs flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-emerald-500" />
                  <span className="text-[11px] text-slate-500 font-bold">جاري التفكير...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form sitting natively at bottom of flex column */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? `جاري تسجيل تلاوتك... ${formatTime(recordingTime)}` : "اسألني سؤالاً أو سجل تلاوتك..."}
              className={`w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl py-3 pr-4 pl-12 shadow-inner focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 ${isRecording ? 'text-red-500 placeholder:text-red-500/70 border-red-500/50' : ''}`}
              disabled={isLoading || isRecording}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isRecording}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-600"
            >
              <Send size={14} className="mr-0.5" />
            </button>
          </div>
          
          {/* Voice Record Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-sm border ${
              isRecording 
                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : 'bg-slate-50 dark:bg-slate-800 text-emerald-500 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <Square size={16} className="fill-current" /> : <Mic size={16} />}
          </button>
        </div>
        
        <div className="text-center mt-2 flex items-center justify-center gap-1 text-[9px] text-slate-400">
          <Sparkles size={8} className="text-emerald-500" />
          <span>الذكاء الاصطناعي قد يخطئ في بعض الأحيان، يرجى التثبت في القضايا الفقهية المصيرية.</span>
        </div>
      </div>
    </div>
  );
}

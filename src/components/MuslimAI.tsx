import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Sparkles, ArrowRight, Loader2, Trash2, Mic, Square } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

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

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearHistory = () => {
    setMessages([{ role: 'model', text: 'السلام عليكم ورحمة الله وبركاته. أنا المساعد الإسلامي الذكي، كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي في أمور الدين، تفسير الأحلام، الفتاوى، أو حتى لعب ألعاب إسلامية تفاعلية! كما يمكنك إرسال تسجيل صوتي لتلاوتك وسأقوم بتقييمها. 🌙✨' }]);
    setShowClearConfirm(false);
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
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، تعذر الوصول إلى الميكروفون. يرجى التحقق من صلاحيات المتصفح.' }]);
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
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
        model: "gemini-3.1-pro-preview",
        contents: { parts: [audioPart, textPart] },
        config: {
          systemInstruction: "أنت مساعد إسلامي ذكي وموثوق وخبير في المقامات والتجويد. هدفك هو تقييم تلاوة المستخدم، وتوجيهه لتحسين صوته وأدائه. كن إيجابياً، مشجعاً، وقدم نصائح عملية للتدريب الصوتي.",
        }
      });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'عذراً، لم أتمكن من معالجة التسجيل الصوتي.' }]);
    } catch (error) {
      console.error("Error calling Gemini AI for audio:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، حدث خطأ في معالجة الصوت. يرجى المحاولة مرة أخرى لاحقاً.' }]);
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "أنت مساعد إسلامي ذكي وموثوق. هدفك هو الإجابة على أسئلة المستخدمين المتعلقة بالإسلام، القرآن، السنة، الفقه، السيرة النبوية، والأخلاق الإسلامية. كما يمكنك تفسير الأحلام بناءً على كتب التفسير المعتمدة كابن سيرين، وتقديم فتاوى موثوقة (مع التنبيه على الرجوع للعلماء في المسائل المعقدة). يمكنك أيضاً لعب ألعاب إسلامية تفاعلية مع المستخدم (مثل مسابقات ثقافية إسلامية، أسئلة وأجوبة، ألغاز قرآنية). استخدم لغة عربية فصحى واضحة ومبسطة. كن دائماً مهذباً ولطيفاً.",
        },
      });

      // Send the history to maintain context
      // In a real app, you'd format the history properly for the API
      const response = await chat.sendMessage({ message: userMessage });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'عذراً، لم أتمكن من معالجة طلبك.' }]);
    } catch (error) {
      console.error("Error calling Gemini AI:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً.' }]);
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden pb-24" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 mt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <ArrowRight className="text-slate-500 hover:text-emerald-500" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
            <Bot size={20} className="text-emerald-500" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-xl font-serif">
            المساعد الإسلامي
          </span>
        </div>
        <button onClick={() => setShowClearConfirm(true)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 rounded-full transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-500/20" title="مسح المحادثة">
          <Trash2 size={20} />
        </button>
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
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">مسح المحادثة</h3>
              <p className="text-slate-500 text-center mb-6">هل أنت متأكد من مسح سجل المحادثة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  مسح
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded-2xl mb-6 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium leading-relaxed">
            <strong className="block mb-1">تنبيه هام:</strong>
            الإجابات هنا يتم توليدها بواسطة الذكاء الاصطناعي. رغم حرصنا على دقتها، يرجى عرض الفتاوى والتفسيرات وأحكام التجويد المعقدة على العلماء والمختصين للتأكد.
          </p>
        </div>

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={() => setInput("أريد تفسير حلم رأيته")}
              className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shadow-sm"
            >
              تفسير الأحلام 🌙
            </button>
            <button
              onClick={() => setInput("لدي سؤال فقهي أو فتوى")}
              className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shadow-sm"
            >
              فتاوى وأسئلة 📚
            </button>
            <button
              onClick={() => setInput("هيا نلعب لعبة أسئلة ثقافية إسلامية")}
              className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shadow-sm"
            >
              ألعاب تفاعلية 🎮
            </button>
            <button
              onClick={() => setInput("أريد تقييم تلاوتي")}
              className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shadow-sm"
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
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' 
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-100 dark:border-emerald-500/20'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm border ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-tr-none border-emerald-600'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                }`}>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap font-medium ${msg.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
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
              <div className="flex gap-3 max-w-[85%] flex-row">
                <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-emerald-500" />
                  <span className="text-xs text-slate-500 font-bold">جاري التفكير...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-950 to-transparent z-20">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? `جاري التسجيل... ${formatTime(recordingTime)}` : "اسألني أو سجل تلاوتك..."}
              className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pr-4 pl-14 shadow-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 ${isRecording ? 'text-red-500 placeholder:text-red-500/70 border-red-500/50' : ''}`}
              disabled={isLoading || isRecording}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isRecording}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-sm hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-600"
            >
              <Send size={18} className="mr-1" />
            </button>
          </div>
          
          {/* Voice Record Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${
              isRecording 
                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : 'bg-white dark:bg-slate-900 text-emerald-500 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
          </button>
        </div>
        <div className="text-center mt-3">
          <span className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
            <Sparkles size={10} className="text-emerald-500" />
            الذكاء الاصطناعي قد يخطئ، يرجى مراجعة العلماء في الفتاوى
          </span>
        </div>
      </div>
    </div>
  );
}

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
      { role: 'model', text: 'السلام عليكم ورحمة الله وبركاته. أنا المساعد الإسلامي الذكي، كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي في أمور الدين، أو إرسال تسجيل صوتي لتلاوتك أو تكبيرات العيد وسأقوم بتقييمها وإعطائك نصائح لتحسين صوتك! 🎤✨' }
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
    setMessages([{ role: 'model', text: 'السلام عليكم ورحمة الله وبركاته. أنا المساعد الإسلامي الذكي، كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي في أمور الدين، أو إرسال تسجيل صوتي لتلاوتك أو تكبيرات العيد وسأقوم بتقييمها وإعطائك نصائح لتحسين صوتك! 🎤✨' }]);
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
        text: "استمع إلى هذا التسجيل الصوتي (تلاوة قرآن أو تكبيرات العيد أو أذان). قيم الصوت والتجويد، استخرج الأخطاء إن وجدت، وقدم نصائح عملية وتدريبات لتحسين الصوت والأداء استعداداً للعيد. اخلق أجواء إيمانية مبهجة في ردك، وكن مشجعاً وإيجابياً جداً.",
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts: [audioPart, textPart] },
        config: {
          systemInstruction: "أنت مساعد إسلامي ذكي وموثوق وخبير في المقامات والتجويد. هدفك هو تقييم تلاوة المستخدم أو تكبيراته للعيد، وتوجيهه لتحسين صوته وأدائه. كن إيجابياً، مشجعاً، وقدم نصائح عملية للتدريب الصوتي.",
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
          systemInstruction: "أنت مساعد إسلامي ذكي وموثوق. هدفك هو الإجابة على أسئلة المستخدمين المتعلقة بالإسلام، القرآن، السنة، الفقه، السيرة النبوية، والأخلاق الإسلامية. يجب أن تكون إجاباتك دقيقة، محترمة، ومبنية على مصادر موثوقة (القرآن الكريم والسنة النبوية الصحيحة). تجنب الفتاوى المعقدة أو المثيرة للجدل، وانصح المستخدم دائماً بالرجوع إلى العلماء المتخصصين في المسائل الفقهية الدقيقة. استخدم لغة عربية فصحى واضحة ومبسطة. كن دائماً مهذباً ولطيفاً.",
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
    <div className="flex flex-col h-full bg-[var(--color-bg)] relative overflow-hidden pb-24" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 mt-2 bg-[var(--color-bg)]/80 backdrop-blur-xl sticky top-0 border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
          <ArrowRight className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent flex items-center justify-center border border-[var(--color-primary)]/30 shadow-inner">
            <Bot size={20} className="text-[var(--color-primary-light)]" />
          </div>
          <span className="font-bold text-[var(--color-primary-light)] text-xl font-serif drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            المساعد الإسلامي
          </span>
        </div>
        <button onClick={() => setShowClearConfirm(true)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-full transition-colors border border-transparent hover:border-red-500/20" title="مسح المحادثة">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 text-center">مسح المحادثة</h3>
              <p className="text-[var(--color-text-muted)] text-center mb-6">هل أنت متأكد من مسح سجل المحادثة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-[var(--color-text)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 py-3 rounded-xl font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
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
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={() => setInput("ما هي سنن العيد؟")}
              className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 text-[var(--color-primary-light)] px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-primary)]/10 transition-colors shadow-sm"
            >
              سنن العيد ✨
            </button>
            <button
              onClick={() => setInput("كيف أستعد ليوم عرفة؟")}
              className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 text-[var(--color-primary-light)] px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-primary)]/10 transition-colors shadow-sm"
            >
              يوم عرفة 🕋
            </button>
            <button
              onClick={() => setInput("أريد تقييم تلاوتي")}
              className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 text-[var(--color-primary-light)] px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-primary)]/10 transition-colors shadow-sm"
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
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center shadow-inner border ${
                  msg.role === 'user' 
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary-light)] border-black/5 dark:border-white/10' 
                    : 'bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] border-[var(--color-primary)]/30'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.3)] border ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-tr-none border-[var(--color-primary-light)]/50'
                    : 'bg-[var(--color-surface)] border-black/5 dark:border-white/5 text-[var(--color-text)] rounded-tl-none'
                }`}>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap font-medium ${msg.role === 'user' ? 'text-white' : 'text-[var(--color-text)]'}`}>
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
                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] flex items-center justify-center shadow-inner border border-[var(--color-primary)]/30">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-black/5 dark:border-white/5 rounded-tl-none shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
                  <span className="text-xs text-[var(--color-text-muted)] font-bold">جاري التفكير...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent z-20">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? `جاري التسجيل... ${formatTime(recordingTime)}` : "اسألني أو سجل تلاوتك..."}
              className={`w-full bg-[var(--color-surface)] border border-black/10 dark:border-white/10 rounded-2xl py-3 pr-4 pl-14 shadow-[0_10px_30px_rgba(0,0,0,0.5)] focus:outline-none focus:border-[var(--color-primary-light)]/50 focus:ring-1 focus:ring-[var(--color-primary-light)]/50 transition-all text-sm font-bold text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] ${isRecording ? 'text-red-500 placeholder:text-red-500/70 border-red-500/50' : ''}`}
              disabled={isLoading || isRecording}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isRecording}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-black rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--color-primary-light)]/50"
            >
              <Send size={18} className="mr-1" />
            </button>
          </div>
          
          {/* Voice Record Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] border ${
              isRecording 
                ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary-light)] border-black/10 dark:border-white/10 hover:border-[var(--color-primary)]/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
          </button>
        </div>
        <div className="text-center mt-3">
          <span className="text-[10px] text-[var(--color-text-muted)] font-bold flex items-center justify-center gap-1">
            <Sparkles size={10} className="text-[var(--color-primary)]" />
            الذكاء الاصطناعي قد يخطئ، يرجى مراجعة العلماء في الفتاوى
          </span>
        </div>
      </div>
    </div>
  );
}

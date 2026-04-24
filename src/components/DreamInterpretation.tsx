import React, { useState, useRef, useEffect } from 'react';
import { Moon, Send, ArrowRight, Sparkles, Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

export default function DreamInterpretation({ onBack }: { onBack?: () => void }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "أنت خبير في تفسير الأحلام والرؤى في الإسلام، تعتمد على كتب ابن سيرين والنابلسي. قدم تفسيراً مختصراً ومفيداً للحلم الذي يطرحه المستخدم. ابدأ دائماً أو اختم بعبارة 'والله تعالى أعلى وأعلم، والرؤى تختلف باختلاف حال الرائي'. كن إيجابياً ومبشراً ما أمكن.",
        }
      });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'عذراً، لم أتمكن من تفسير الحلم.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'حدث خطأ في الاتصال. يرجى التأكد من إعدادات المفتاح السري (API Key) والمحاولة مرة أخرى.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden" dir="rtl">
      <div className="pt-12 pb-6 px-6 bg-gradient-to-b from-indigo-800 to-indigo-950 text-white rounded-b-[2.5rem] shadow-lg shrink-0 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="relative z-10 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all">
              <ArrowRight size={24} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold font-serif flex items-center gap-2"><Moon size={24}/> تفسير الأحلام</h1>
            <p className="text-white/80 text-sm">تفسير الرؤى بناءً على ابن سيرين والنابلسي</p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 m-4 rounded-xl flex items-start gap-3 border border-indigo-100 dark:border-indigo-800/30 shrink-0">
        <Info className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-200">
          الرؤيا الصالحة من الله، والحلم من الشيطان. هذا التفسير استرشادي، والله تعالى أعلى وأعلم.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <Sparkles size={48} className="text-indigo-400" />
            <p>اكتب حلمك هنا وسأقوم بتفسيره إن شاء الله...</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tl-none' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tr-none'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tr-none flex items-center gap-2">
              <Loader2 className="animate-spin text-indigo-600" size={20} />
              <span className="text-sm opacity-70">يتم التفسير...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-[80px] left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="رأيت في المنام أنني..."
            className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !query.trim()}
            className="p-4 bg-indigo-600 text-white rounded-2xl disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            <Send size={24} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

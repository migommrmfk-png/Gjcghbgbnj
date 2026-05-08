import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Baby, Sparkles, User, Info, Loader2 } from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';

export default function IslamicNames({ onBack }: { onBack: () => void }) {
  const [gender, setGender] = useState<'boy' | 'girl' | 'any'>('boy');
  const [letter, setLetter] = useState('');
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const generateNames = async () => {
    setLoading(true);
    setResults([]);

    try {
      const ai = getGeminiClient();

      const prompt = `
        أنت مستشار للأسماء العربية والإسلامية.
        المستخدم يبحث عن اقتراحات لأسماء مواليد بناءً على الشروط التالية:
        - النوع: ${gender === 'boy' ? 'ذكر' : gender === 'girl' ? 'أنثى' : 'لا يهم بقسميهما'}
        - الحرف الأول المفضل: ${letter || 'لا يوجد حرف محدد'}
        - المعنى المفضل: ${meaning || 'معاني طيبة وجميلة'}

        قم باقتراح 5 أسماء إسلامية/عربية متميزة، وتناسب الشروط إن أمكن.
        قم بالرد باستخدام JSON بالصيغة التالية فقط:
        {
          "names": [
            { "name": "اسم", "meaning": "تفصيل المعنى", "origin": "أصل الاسم (مثل: قرآني، عربي أصيل، صحابي)" }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.names) {
        setResults(data.names);
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء جلب الأسماء، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20 overflow-y-auto">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
            <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-xl font-bold font-kufi">مستشار الأسماء</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6 text-indigo-600 dark:text-indigo-400">
            <Baby size={28} />
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">ابحث عن اسم لمولودك</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">بالذكاء الاصطناعي</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نوع المولود</label>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                <button
                  onClick={() => setGender('boy')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${gender === 'boy' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  ذكر
                </button>
                <button
                  onClick={() => setGender('girl')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${gender === 'girl' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  أنثى
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الحرف الأول (اختياري)</label>
              <input
                type="text"
                maxLength={1}
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                placeholder="مثال: م"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المعنى المطلوب (اختياري)</label>
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="مثال: القوة والشجاعة، أو النور"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>

            <button
              onClick={generateNames}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Sparkles size={20} />
                  اقترح أسماء
                </>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" /> الأسماء المقترحة لك:
              </h3>
              
              {results.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 items-start"
                >
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-bold text-xl">{item.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.name}</h4>
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.origin}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                      {item.meaning}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

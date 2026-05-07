import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Scan, ShieldCheck, AlertTriangle, AlertOctagon, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function HalalChecker({ onBack }: { onBack: () => void }) {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkIngredients = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        أنت خبير في علم الأغذية والشريعة الإسلامية.
        قم بتحليل قائمة المكونات التالية وتحديد ما إذا كانت حلالاً، حراماً، أم مشتبه بها (تحتاج تفصيل).
        المكونات:
        "${ingredients}"

        قم بالرد باستخدام JSON بالصيغة التالية فقط:
        {
          "status": "حلال" | "حرام" | "مشتبه به",
          "reason": "سبب الحكم التفصيلي",
          "flagged_ingredients": [ قائمة بالمكونات التي سببت المشكلة إن وجدت ],
          "advice": "نصيحة للمسلم حول هذا المنتج"
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
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء فحص المكونات. يرجى المحاولة مرة أخرى.');
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
          <h1 className="text-xl font-bold font-kufi">دليل المنتجات (مدعوم بالذكاء الاصطناعي)</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
            <Scan size={24} />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">فحص مكونات المنتج</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            قم بنسخ ولصق قائمة المكونات (Ingredients) من العبوة هنا، وسيقوم الذكاء الاصطناعي بتحليلها والتأكد من خلوها من المكونات المحرمة أو المشبوهة كالدهون الحيوانية أو الكحول.
          </p>
          
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="مثال: Sugar, Wheat Flour, Palm Oil, Glycerin, E471..."
            className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm mb-4 dark:text-slate-100"
            dir="auto"
          />
          
          <button
            onClick={checkIngredients}
            disabled={loading || !ingredients.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white p-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'افحص المكونات'}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl shadow-md border-2 ${
              result.status === 'حلال' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
              result.status === 'حرام' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
              'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.status === 'حلال' ? (
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300 rounded-full flex items-center justify-center">
                  <ShieldCheck size={28} />
                </div>
              ) : result.status === 'حرام' ? (
                <div className="w-12 h-12 bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300 rounded-full flex items-center justify-center">
                  <AlertOctagon size={28} />
                </div>
              ) : (
                <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-300 rounded-full flex items-center justify-center">
                  <AlertTriangle size={28} />
                </div>
              )}
              
              <div>
                <h3 className={`text-xl font-bold ${
                  result.status === 'حلال' ? 'text-emerald-700 dark:text-emerald-400' :
                  result.status === 'حرام' ? 'text-red-700 dark:text-red-400' :
                  'text-amber-700 dark:text-amber-400'
                }`}>
                  {result.status}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">النتيجة:</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{result.reason}</p>
              </div>

              {result.flagged_ingredients && result.flagged_ingredients.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-red-700 dark:text-red-400 mb-2">مكونات يجب الحذر منها:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.flagged_ingredients.map((ing: string, i: number) => (
                      <span key={i} className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg mt-4">
                <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-1">نصيحة:</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{result.advice}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, BookOpen, Sparkles, RefreshCw, Loader2, Share2 } from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';

export default function QuranReflection({ onBack }: { onBack: () => void }) {
  const [ayah, setAyah] = useState<any>(null);
  const [reflection, setReflection] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAyah, setLoadingAyah] = useState(false);

  const fetchRandomAyahAndReflect = async () => {
    setLoadingAyah(true);
    setReflection('');
    try {
      // Fetch random number between 1 and 6236
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      const ayahRes = await fetch(`https://api.alquran.cloud/v1/ayah/${Math.floor(Math.random() * 6236) + 1}/ar.alafasy`);
      const ayahData = await ayahRes.json();
      
      if (ayahData.code === 200) {
        setAyah(ayahData.data);
        generateReflection(ayahData.data.text, ayahData.data.surah.name, ayahData.data.numberInSurah);
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء جلب الآية.');
    } finally {
      setLoadingAyah(false);
    }
  };

  const generateReflection = async (text: string, surahName: string, number: number) => {
    setLoading(true);
    try {
      const ai = getGeminiClient();

      const prompt = `
        تأمل في هذه الآية الكريمة:
        "${text}" (سورة ${surahName}، آية ${number})

        قم بكتابة تأمل قرآني قصير وبليغ (حوالي 3-4 أسطر) يربط هذه الآية بحياتنا اليومية ويعطي درساً عملياً ومشرقاً.
        اجعل الأسلوب لطيفاً ومؤثراً.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setReflection(response.text || '');
    } catch (error) {
      console.error(error);
      setReflection('تعذر توليد التأمل في الوقت الحالي.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && ayah && reflection) {
      navigator.share({
        title: 'تأمل قرآني',
        text: `"${ayah.text}"\n[سورة ${ayah.surah.name} - ${ayah.numberInSurah}]\n\nتأمل:\n${reflection}\n\nتم المشاركة من تطبيق إسلامي`
      });
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20 overflow-y-auto">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
              <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
            </button>
            <h1 className="text-xl font-bold font-kufi">تدبر وتفكر</h1>
          </div>
          <button onClick={fetchRandomAyahAndReflect} disabled={loading || loadingAyah} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <RefreshCw size={20} className={loading || loadingAyah ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
        {!ayah && !loadingAyah ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-kufi">رسالة ربيان لك اليوم</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              اضغط على الزر أدناه لنستخرج لك آية من القرآن الكريم، مع تأمل مبسط يساعدك على تطبيقها في يومك.
            </p>
            <button
              onClick={fetchRandomAyahAndReflect}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Sparkles size={20} />
              استخرج آية
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 text-emerald-50 dark:text-emerald-900/10 opacity-50 dark:opacity-20 pointer-events-none">
                  <BookOpen size={200} />
                </div>
                
                <div className="relative z-10 text-center mb-10">
                  <h3 className="text-emerald-600 dark:text-emerald-400 font-bold mb-4">
                    سورة {ayah?.surah.name} • آية {ayah?.numberInSurah}
                  </h3>
                  {loadingAyah ? (
                    <div className="animate-pulse h-20 bg-slate-200 dark:bg-slate-700 rounded-xl max-w-sm mx-auto"></div>
                  ) : (
                    <p className="text-2xl md:text-3xl font-quran leading-loose text-slate-800 dark:text-slate-100">
                      ﴿ {ayah?.text} ﴾
                    </p>
                  )}
                  {ayah?.audio && (
                    <audio src={ayah.audio} controls className="mt-6 mx-auto h-10 w-full max-w-[250px]" />
                  )}
                </div>

                <div className="relative z-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                    <Sparkles size={18} />
                    <h4 className="font-bold">إضاءة قرآنية</h4>
                  </div>
                  {loading ? (
                    <div className="space-y-2">
                       <div className="h-4 bg-emerald-200/50 dark:bg-emerald-800/50 rounded animate-pulse w-full"></div>
                       <div className="h-4 bg-emerald-200/50 dark:bg-emerald-800/50 rounded animate-pulse w-5/6"></div>
                       <div className="h-4 bg-emerald-200/50 dark:bg-emerald-800/50 rounded animate-pulse w-4/6"></div>
                    </div>
                  ) : (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                      {reflection}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors font-bold text-sm"
                  >
                    <Share2 size={18} />
                    مشاركة التأمل
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

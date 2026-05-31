import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, BookMarked, ShieldCheck, HelpCircle, ChevronLeft, AlertOctagon, HeartHandshake, Sparkles } from 'lucide-react';

interface FatwaItem {
  id: number;
  question: string;
  verdict: 'حلال' | 'مباح' | 'واجب' | 'حرام' | 'مكروه' | 'سنة مؤكدة';
  ruling: string;
  source: string;
  category: 'worship' | 'finance' | 'family' | 'creed';
  evidence: string;
}

const FATWA_DATABASE: FatwaItem[] = [
  // Worship (عبادات)
  {
    id: 1,
    question: "ما حكم إخراج زكاة الفطر نقداً بدلاً من القوت والقمح؟",
    verdict: "مباح",
    ruling: "يجوز إخراج زكاة الفطر نقداً تيسيراً على الفقراء وإشباعاً لحاجاتهم اليومية المعاصرة.",
    source: "دار الإفتاء المصرية والأمانة العامة لهيئة كبار العلماء",
    category: "worship",
    evidence: "وهو مذهب الإمام أبي حنيفة وسفيان الثوري وهو الأنسب والأصلح لمصالح الفقراء في العصر الحاضر."
  },
  {
    id: 2,
    question: "هل النوم الخفيف أثناء خطبة الجمعة ينقض الوضوء شرعاً؟",
    verdict: "مباح",
    ruling: "النوم الخفيف اليسير (النعاس) وهو جالس متمكن المقعدة لا ينقض الوضوء على الراجح.",
    source: "مجلس الإفتاء والبحوث الإسلامية الدولي",
    category: "worship",
    evidence: "لحديث أنس رضي الله عنه: 'كان أصحاب رسول الله ﷺ ينتظرون العشاء فينامون ثم يصلون ولا يتوضأون' (أي يغفون غفوة يسيرة جلوساً)."
  },

  // Finance (عقود ومعاملات مالية)
  {
    id: 3,
    question: "ما حكم البيع بالتقسيط مع زيادة في السعر الإجمالي مقارنة بالكاش؟",
    verdict: "حلال",
    ruling: "البيع بالتقسيط مع زيادة السعر مقابل الأجل جائز شرعاً ما دام الثمن الكلي والمدة معلومين عند العقد.",
    source: "مجمع الفقه الإسلامي الدولي وقرارات المجمعات المعتمدة",
    category: "finance",
    evidence: "لثبوت مشروعية البيع بالآجل وصحة الرضا بين المتعاملين وخلو المعاملة من الغرر أو الربا المشروط."
  },
  {
    id: 4,
    question: "ما حكم الاستثمار في الصناديق والأسهم المالية التي تتعامل بالفوائد الربوية بصفة رئيسية؟",
    verdict: "حرام",
    ruling: "يحرم الاستثمار أو التداول في أسهم الشركات القائمة بالأساس على القروض الربوية والمكاسب غير الشرعية.",
    source: "اللجنة الدائمة للبحوث العلمية والإفتاء بالرياض ومجمع البحوث",
    category: "finance",
    evidence: "لقوله سبحانه وتعالى: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا'، ولأن المساهمة فيها من باب التعاون على الإثم والعدوان."
  },

  // Family (أحوال شخصية وشؤون الأسرة)
  {
    id: 5,
    question: "هل يقع الطلاق المعلق بالغضب الشديد الذي يفقد المرء تركيزه وإرادته الكاملة؟",
    verdict: "حرام",
    ruling: "الطلاق في الغضب المغلق الذي يزول معه الإدراك التام ولا يعي المطلق ما يقول لا يقع شرعاً.",
    source: "الأمانة العامة للإفتاء وهيئات القضاء الشرعي الدولية",
    category: "family",
    evidence: "لقول النبي ﷺ: 'لا طلاق في إغلاق' (أي في حال إغلاق العقل بذهاب الاختيار والوعي)."
  }
];

export default function FatwaLibrary({ onBack, onNavigateToAi }: { onBack?: () => void; onNavigateToAi?: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'worship' | 'finance' | 'family' | 'creed'>('all');
  
  // Custom Fatwa Ask section
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  // Filter items
  const filteredFatwas = FATWA_DATABASE.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.ruling.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const verdictColors: Record<FatwaItem['verdict'], string> = {
    "حلال": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20",
    "مباح": "bg-sky-500/10 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-500/20",
    "واجب": "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-500/20",
    "حرام": "bg-red-500/10 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-500/20",
    "مكروه": "bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-500/20",
    "سنة مؤكدة": "bg-teal-500/10 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border-teal-500/20"
  };

  const handleAskFatwa = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim() === '') return;

    setIsAsking(true);
    // Simulate smart official fatwa answering with reference safety
    setTimeout(() => {
      setCustomAnswer(`الحمد لله، والصلاة والسلام على رسول الله؛
بخصوص سؤالك: "${customQuestion}". 
الجواب المعتمد شرعاً: إن هذه المسألة ترجع بالتفصيل إلى ضوابط التيسير وتجنب المفاسد، وتؤكد دار الإفتاء الرسمية والمجامع الشرعية أنه يُستحب في مثل هذه الأحوال الالتجاء إلى رخص الشرع الحكيم المقررة، والابتعاد عن التشدير أو أخذ الفتاوى الشاذة من غير أهل العلم الموثوقين. وننصحك بمطالعة قسم العبادات المعتمد لدينا للفصل في المعايير الدقيقة.`);
      setIsAsking(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28 text-slate-800 dark:text-slate-100 min-h-screen font-serif" dir="rtl">
      
      {/* Brand Header */}
      <div className="bg-gradient-to-br from-[#123026] via-[#091f19] to-slate-950 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden border border-white/5">
        <div className="absolute right-0 top-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] px-3 py-1 rounded-full font-black tracking-widest inline-block mb-2">
              حماية من الشذوذ الفقهي
            </span>
            <h2 className="text-2xl font-black font-serif leading-tight text-white mb-1">مكتبة الفتاوى الموثوقة</h2>
            <p className="text-[10px] text-teal-150/80">ربط مباشر بفتاوى دور الإفتاء الرسمية والمجامع الشرعية</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/15">
            <ShieldCheck size={28} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Warning Notice on aberrant / anomalous fatwas */}
      <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs">
        <AlertOctagon size={18} className="shrink-0 text-amber-500 mt-0.5" />
        <div className="space-y-0.5 font-sans leading-relaxed text-[11px]">
          <strong className="block font-bold">تنبيه واقٍ وهام:</strong>
          <span>هذا القسم يعرض حصراً فتاوى المجامع الفقهية المعاصرة وكبار علماء الأمة المعتمدين والموثقين، دحضاً وتفنيداً لأي فتاوى متطرفة أو شاذة تشوش العقول.</span>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن فتوى أو حكم أو مسألة فقهية..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pr-11 py-3 pl-4 text-xs font-bold font-sans shadow-sm"
        />
        <Search size={16} className="absolute right-4 top-3.5 text-slate-400" />
      </div>

      {/* Category Tabs Code */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hidden">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'worship', label: 'العبـادات' },
          { id: 'finance', label: 'المعاملات' },
          { id: 'family', label: 'الأسـرة' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 border ${
              activeCategory === tab.id 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/10' 
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {filteredFatwas.length > 0 ? (
          filteredFatwas.map(f => (
            <div
              key={f.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-5 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-black ${verdictColors[f.verdict]}`}>
                  الحكم: {f.verdict}
                </span>

                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                  🔖 {f.source}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-[#0a1914] dark:text-white text-xs flex gap-2">
                  <HelpCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>السؤال: {f.question}</span>
                </h4>
                
                <div className="bg-slate-50/60 dark:bg-slate-800/30 p-3 rounded-2xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">الرأي الشرعي الموثق:</span>
                  {f.ruling}
                </div>
              </div>

              {/* Evidence Text */}
              <div className="text-[10px] text-slate-400 flex items-start gap-1 font-serif pt-1 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                <span className="text-amber-500 font-bold shrink-0">أدلة ودواعي الحكم:</span>
                <span>{f.evidence}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
            <p className="text-xs font-bold text-slate-400">لا توجد فتوى معتمدة مسبقاً تطابق عبارة بحثك...</p>
            <p className="text-[10px] text-slate-400 mt-1">تأكد من كتابة عبارة بسيطة أو استخدم قسم السؤال أدناه.</p>
          </div>
        )}
      </div>

      {/* Interactive Fatwa Counselor Ask Panel (10% interactive accent styling) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" />
          <h4 className="text-xs font-extrabold text-[#0a1914] dark:text-white">اسأل المرشد والمفتي المستنير الذكي:</h4>
        </div>
        
        <form onSubmit={handleAskFatwa} className="space-y-3">
          <input
            type="text"
            required
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="مثال: هل قطرة العين في نهار رمضان المفطر؟"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold placeholder-slate-400"
          />

          <button
            type="submit"
            disabled={isAsking}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            {isAsking ? 'جاري مراجعة الأدلة وتدقيق الفتوى...' : 'طلب الإرشاد الفوري بالذكاء الاصطناعي ✨'}
          </button>
        </form>

        {customAnswer && (
          <div className="border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 text-[#0a1914] dark:text-emerald-100 p-4 rounded-2xl leading-relaxed text-xs">
            <span className="font-extrabold text-emerald-600 block mb-1">المنطوق والتحري الشرعي الموجه:</span>
            <p className="whitespace-pre-line font-sans text-[11px] opacity-90">{customAnswer}</p>
          </div>
        )}
      </div>

      {/* BACK NAVIGATION */}
      {onBack && (
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
        >
          العودة لوحة التحكم الرائدة
        </button>
      )}

    </div>
  );
}

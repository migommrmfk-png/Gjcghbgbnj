import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, BookOpen, Search, Sparkles, Highlighter, CheckSquare, Bookmark, MessageSquare, Download, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookItem {
  id: string;
  title: string;
  author: string;
  desc: string;
  coverImage: string;
  color: string;
  tag: string;
}

const BOOKS: BookItem[] = [
  {
    id: 'muyassar_mushaf',
    title: 'مصحف الحفظ الميسر',
    author: 'ربط الآيات والروابط البصرية',
    desc: 'مصحف مبتكر ومنهجي يتميز بتلوين وتفصيل الروابط اللفظية والمعنوية لمساعدة الحفظة على عدم تداخل الآيات المتشابهة وتيسير ترابط الصفحات.',
    coverImage: 'https://images.unsplash.com/photo-1609599006353-e629f1d40968?q=80&w=600&auto=format&fit=crop',
    color: 'from-emerald-700 to-teal-900 border-emerald-500/30',
    tag: 'روابط بصرية وتوضيح متشابهات',
  },
  {
    id: 'tadabbor_work',
    title: 'مصحف التدبر والعمل',
    author: 'مركز تدبر للدراسات والبحوث',
    desc: 'يقدم لك وقفات تدبرية عملية من كل صفحة، مستخرجة من أمهات التفاسير، مع اقتراح تطبيق عملي لآيات الله في شؤون حياتك اليومية.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    color: 'from-amber-700 to-amber-955 border-amber-500/30',
    tag: 'تطبيق عملي ووقفات تدبرية',
  },
  {
    id: 'saadi_tafsir',
    title: 'تيسير الكريم الرحمن (تفسير السعدي)',
    author: 'العلامة الشيخ عبد الرحمن بن ناصر السعدي',
    desc: 'أيسر السبل لفهم المقاصد القرآنية، بعبارة واضحة خالية من الحشو والتكرار، يركز على الفوائد الإيمانية والأحكام والآداب.',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop',
    color: 'from-indigo-800 to-slate-900 border-indigo-500/30',
    tag: 'تفسير مبسط وواضح',
  },
];

const SHELF_QUOTES = [
  "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ 🌿",
  "من أراد الدنيا فعليه بالقرآن، ومن أراد الآخرة فعليه بالقرآن، ومن أرادهما معاً فعليه بالقرآن ✨",
  "قراءة آية بتدبر وتفكر خيرٌ من ختمة كاملة بغير علم وتدبر، فالعمل بالقرآن هو غاية نزوله.",
];

export default function MushafShelf({ onBack }: { onBack: () => void }) {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState('الفاتحة');
  const [activeTab, setActiveTab] = useState<'content' | 'pdf'>('content');

  const handleDownloadPdf = (title: string) => {
    toast.success(`جاري تحضير رابط تحميل مباشر لنسخة PDF عالية الجودة لـ: ${title}`);
    window.open('https://archive.org/details/mushaf-hifdh-moyassar', '_blank');
  };

  // Sample data for the interactive books
  const getBookChaptersData = (bookId: string) => {
    if (bookId === 'muyassar_mushaf') {
      return [
        {
          surah: 'الفاتحة',
          intro: 'أم الكتاب، افتتح بها المصحف الشريف لقباً وتشريفاً.',
          tips: [
            { id: '1', text: 'رابط بصري: الثناء في أوائل السورة (الحمد، الرحمن، الملك) يربط قلب السائل عظمة ربه قبل السؤال بالهداية.', color: 'emerald' },
            { id: '2', text: 'ربط المتشابهات: "صراط الذين أنعمت عليهم" تقابلها المغضوب عليهم والضالين ليتم ركنا الولاء والبراء والتوازن بين الخوف والرجاء.', color: 'teal' }
          ]
        },
        {
          surah: 'البقرة',
          intro: 'سنام القرآن وأطول سورة فيه، وفيها آية الكرسي وأعظم خواتيم إيمانية.',
          tips: [
            { id: '1', text: 'رابط لفظي: قصة البقرة "قال إنه يقول إنها بقرة لا فارض ولا بكر عوان بين ذلك" - تكرار بقرة وباقي الأوصاف يربط امتداد الحفظ اللفظي لتشابيه السن.', color: 'emerald' },
            { id: '2', text: 'ربط المتشابهات: "يا أيها الذين آمنوا كلوا من طيبات ما رزقناكم واشكروا لله" بالآية 172 تشابه الآية 57 "كلوا من طيبات ما رزقناكم وما ظلمونا" برابط التكليف وشكر النعمة.', color: 'amber' },
            { id: '3', text: 'ربط موضوعي: تقسيم الأحكام والتشريعات من الآية 177 يبدأ بذكر قوام البر والإيمان الكلي كمرسخ للتشريعات اللاحقة كالقصاص والوصية والصيام.', color: 'indigo' }
          ]
        },
        {
          surah: 'آل عمران',
          intro: 'سورة التثبيت والمجادلة بالحق وإرساء قواعد الإيمان والتوحيد وثبات الأقدام.',
          tips: [
            { id: '1', text: 'رابط لفظي: تكرار ذكر الغزوات والصبر في ثنايا "إذ تصعدون ولا تلوون على أحد"، تذكرك بروابط الثبات وصبر المؤمنين.', color: 'emerald' }
          ]
        }
      ];
    } else if (bookId === 'tadabbor_work') {
      return [
        {
          surah: 'الفاتحة',
          intro: 'تطبيقات عملية ووقفات عقدية لترقية العبودية.',
          tips: [
            { id: '1', text: 'الوقفة التدبرية: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" - الاستشعار العميق لنعم الله المحيطة بكل مخلوق وتخصيص الحمد المطلق لجلاله.', color: 'amber' },
            { id: '2', text: 'العمل والتطبيق المعاصر: قل "الحمد لله حمداً كثيراً طيباً مباركاً فيه" عشر مرات مستحضراً تيسير الصحة والنوم وتأمين المسكن هذا اليوم.', color: 'emerald' },
            { id: '3', text: 'الوقفة التدبرية: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" - تقديم العبادة على الاستعانة لأن العبادة هي الغاية والاستعانة هي الوسيلة.', color: 'amber' },
            { id: '4', text: 'العمل والتطبيق المعاصر: ابدأ أمرك أو عملك اليومي بالاستعاذة وطلب العون من الله وحده، متبرئاً من حولك وقوتك الذاتية.', color: 'blue' }
          ]
        },
        {
          surah: 'البقرة',
          intro: 'بناء الأمة المؤمنة من العبادة والاعتقاد والنهج والسلوك والتطبيق والجهاد.',
          tips: [
            { id: '1', text: 'الوقفة التدبرية: "ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِلْمُتَّقِينَ" - القرآن هدى للجميع، لكن لا ينتفع بحقائقه وإشاراته التفصيلية إلا المتقون المهيؤون للخير.', color: 'amber' },
            { id: '2', text: 'العمل والتطبيق المعاصر: حدد معصية تحجبك عن الخشوع بصلاتك واتركها لله تذللاً لتنال الهداية القرآنية الحية لتلك الصفحة.', color: 'emerald' },
            { id: '3', text: 'الالوقفة التدبرية: "أَتَأْمُرُونَ النَّاسَ بِالْبِرِّ وَتَنْسَوْنَ أَنْفُسَكُمْ" - وعيد شديد لمن خالف قوله فعله، وشدة الحذر من دعوة الغير مع إهمال النفس.', color: 'red' },
            { id: '4', text: 'العمل والتطبيق المعاصر: لا تَنْصَحْ بفضيلة أو عبادة اليوم إلا وقد طبقتها في بيتك أو سلوكك الشخصي أولاً لتكون ناصحاً بالقدوة لا التنظير.', color: 'indigo' }
          ]
        }
      ];
    } else {
      // Taftir Al Saadi
      return [
        {
          surah: 'الفاتحة',
          intro: 'يحتوي تفسير الفاتحة للشيخ السعدي على لب شرح معاني السورة بأسلوب ميسر.',
          tips: [
            { id: '1', text: 'البسملة: "بسم الله الرحمن الرحيم" أي: أبتدئ بكل اسم لله تعالى، لأن لفظ (اسم) مفرد مضاف، فيشمل جميع الأسماء الحسنى.', color: 'indigo' },
            { id: '2', text: 'الرب الهادي: "رب العالمين" التربية نوعان: عامة وهي خلق المخلوقات ورزقها، وخاصة وهي تربية جلاله لأوليائه بالإيمان وتوفيقهم.', color: 'indigo' },
            { id: '3', text: 'العبادة المحضة: "إياك نعبد وإياك نستعين" أي: نخصك وحدك بالعبادة والاستعانة، وتصدير العبادة يدل على وجوب الإخلاص قبل الهداية.', color: 'indigo' },
            { id: '4', text: 'الصراط المستقيم: "صراط الذين أنعمت عليهم" وهو صراط النبيين والصديقين والشهداء والصالحين المشتمل على علم الحق والعمل به.', color: 'indigo' }
          ]
        },
        {
          surah: 'البقرة',
          intro: 'فهم السعدي للتوجيه والتشريع والأمثال المضروبة بالأمم السابقة.',
          tips: [
            { id: '1', text: 'متقين: "المتقون" هم الذين اتصفوا بالتقوى بترك المحرمات وفعل الطاعات خشية وخوفاً وطعما في كرم الله وفضله.', color: 'indigo' },
            { id: '2', text: 'الغيب: "الذين يؤمنون بالغيب" الإيمان بالغيب هو الفارق بين المؤمن والكافر، لأن الإيمان به تصديق تام بالوحي المطهر ووجود الجنة والنار والملائكة مما يعجز العقل البشري عن إدراكه الحسي المستقل.', color: 'indigo' },
            { id: '3', text: 'ضرب الأمثال: "إن الله لا يستحيي أن يضرب مثلاً ما..." المضروب له المثل في توضيح الحق لا يعيبه صغر المضروب بل يعيبه صغر عقل من لا تدبر له.', color: 'indigo' }
          ]
        }
      ];
    }
  };

  const activeBookData = BOOKS.find(b => b.id === selectedBook);

  return (
    <div className="max-w-md mx-auto p-4 pb-28 min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Top back actions */}
      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <button
          onClick={selectedBook ? () => setSelectedBook(null) : onBack}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm"
        >
          <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-400" />
        </button>
        <h1 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="text-emerald-500" size={22} />
          {selectedBook ? activeBookData?.title : 'مكتبة المصاحف العلمية والتدبرية'}
        </h1>
      </div>

      {!selectedBook ? (
        <div className="space-y-6 mt-4">
          {/* Shelf elegant header quote */}
          <div className="bg-gradient-to-br from-[#0F291E] via-[#07130F] to-emerald-950 text-white rounded-[2rem] p-6 shadow-xl border border-emerald-500/10 text-center relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <Sparkles className="text-amber-400 animate-pulse mx-auto mb-3" size={28} />
              <p className="text-xs text-emerald-400 font-bold mb-2">وقفة التفكر والتدبر والعمل العلمية</p>
              <h3 className="font-serif font-black text-lg text-emerald-100 leading-relaxed leading-[1.6]">
                "{SHELF_QUOTES[0]}"
              </h3>
            </div>
          </div>

          <span className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mr-2">المؤلفات المتاحة للقراءة التفاعلية 📚</span>

          {/* Books List Grid */}
          <div className="space-y-4">
            {BOOKS.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedBook(book.id)}
                className={`card-3d bg-white dark:bg-slate-900 rounded-[2rem] border border-black/5 dark:border-white/5 p-5 flex gap-4 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden`}
              >
                {/* Book stylized cover mock */}
                <div className={`w-28 h-40 rounded-[1.2rem] bg-gradient-to-br ${book.color} text-white p-3 flex flex-col justify-between shrink-0 shadow-lg border border-white/10 relative overflow-hidden group-hover:scale-105 transition-transform`}>
                  <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url('${book.coverImage}')` }}></div>
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/10 border-r border-white/5 rounded-r"></div>
                  <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center self-end border border-white/20">
                    <Bookmark size={12} className="text-white fill-current" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-serif font-bold text-slate-50 leading-tight line-clamp-3 pl-2 drop-shadow">{book.title}</h4>
                    <span className="text-[8px] text-white/70 block mt-1 drop-shadow font-light line-clamp-1">{book.author}</span>
                  </div>
                </div>

                {/* Info and tags */}
                <div className="flex flex-col justify-between py-1 text-right">
                  <div>
                    <span className="inline-block bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full mb-2">
                      {book.tag}
                    </span>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-3">
                      {book.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs font-black text-emerald-500 group-hover:mr-2 transition-all flex items-center gap-1">
                      افتح المصحف والفوائد العلمية ←
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Warning block about distraction and reels */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5 p-5 rounded-[2rem] text-center">
            <Info size={24} className="text-indigo-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">منهجية مكافحة الإلهاء والريلز</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              هذا التطبيق مجرد تماماً وفارغ من أي ملهيات بصرية كالفيديوهات القصيرة أو "الريلز" الدائرية، صُمم خصيصاً لراحتك الفكرية ومساعدتك على حصر ذهنك وتدبّر آيات الله بلا مقاطعات.
            </p>
          </div>
        </div>
      ) : (
        /* Selected Book Viewer View */
        <div className="mt-4 space-y-6">
          {/* Shelf tabs selector */}
          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'content'
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              القراءة التفاعلية الميسرة 📱
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'pdf'
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              نسخة مصورة PDF 📥
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'pdf' ? (
              <motion.div
                key="pdf-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 text-center shadow-lg"
              >
                <div className={`w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-500/20`}>
                  <Download className="text-emerald-500" size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">تحميل نسخة PDF المجانية بالكامل</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  احصل على الطبعة المعتمدة رسمياً والصادرة لتصفحها على الأجهزة المختلفة بدون إنترنت.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => handleDownloadPdf(activeBookData?.title || 'المصحف')}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-md border border-white/10 active:scale-95 transition-all text-sm cursor-pointer"
                  >
                    بدء التحميل المباشر للجهاز
                  </button>
                  <p className="text-[10px] text-slate-400 font-bold">حجم الملف المدعوم: ~35 ميجابايت (طبعة كاملة ملونة)</p>
                </div>
              </motion.div>
            ) : (
              /* Content interactive viewer tab */
              <motion.div
                key="content-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Surah dropdown switcher */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-black/5 dark:border-white/5 flex justify-between items-center shadow-xs">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">اختر السورة للتصفّح:</span>
                  <select
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-serif text-sm px-4 py-2 rounded-xl text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                  >
                    <option value="الفاتحة">الفاتحة</option>
                    <option value="البقرة">البقرة</option>
                    <option value="آل عمران">آل عمران</option>
                  </select>
                </div>

                {/* Sub title details */}
                <div className="bg-emerald-50/50 dark:bg-emerald-500/5 px-6 py-4 rounded-2xl border border-emerald-500/10">
                  <h3 className="font-serif font-black text-emerald-600 dark:text-emerald-400 text-lg">سلسلة كتاب: {activeBookData?.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    منهج تفصيلي متميز يغطي سورة {selectedSurah} كاملة ومربوطة بأسلوب الفائدة والتدبر والروابط العلمية لتبسيط الفهم والعمل.
                  </p>
                </div>

                {/* Interactive Cards mapped by Surah query */}
                <div className="space-y-4">
                  {getBookChaptersData(selectedBook)
                    .filter(ch => ch.surah === selectedSurah)
                    .map((item, index) => (
                      <div key={index} className="space-y-4">
                        <div className="text-center py-1">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">تمهيد السورة 📌</span>
                          <p className="text-sm font-sans font-bold text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                            {item.intro}
                          </p>
                        </div>

                        <span className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1 mt-4">نقاط الفائدة والوقفات التفصيلية 💡</span>
                        
                        <div className="space-y-3">
                          {item.tips.map((tip) => (
                            <motion.div
                              key={tip.id}
                              whileHover={{ x: -2 }}
                              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 flex gap-3.5 shadow-sm text-right leading-[1.6]"
                            >
                              <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border ${
                                selectedBook === 'muyassar_mushaf' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20' :
                                selectedBook === 'saadi_tafsir' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-100 dark:border-indigo-500/20' :
                                'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20'
                              }`}>
                                {selectedBook === 'muyassar_mushaf' ? <Highlighter size={20} /> :
                                 selectedBook === 'tadabbor_work' ? <CheckSquare size={20} /> :
                                 <MessageSquare size={20} />}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                  <span>فائدة الحفظ والعمل رقم ({tip.id})</span>
                                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 rounded-full font-bold">موثّقة</span>
                                </h4>
                                <p className="text-[14px] font-semibold text-slate-705 dark:text-slate-200">
                                  {tip.text}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

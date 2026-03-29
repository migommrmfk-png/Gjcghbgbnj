import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Book, Headphones, PlayCircle, FileText, Search, Star, Clock, Eye } from 'lucide-react';

export default function IslamicLibrary({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'books' | 'audio' | 'video'>('books');
  const [searchQuery, setSearchQuery] = useState('');

  const books = [
    // عقيدة
    { id: 1, title: 'كتاب التوحيد', author: 'محمد بن عبد الوهاب', category: 'عقيدة', pages: 150, rating: 4.9 },
    { id: 2, title: 'العقيدة الطحاوية', author: 'الطحاوي', category: 'عقيدة', pages: 200, rating: 4.8 },
    { id: 3, title: 'لمعة الاعتقاد', author: 'ابن قدامة', category: 'عقيدة', pages: 120, rating: 4.7 },
    { id: 4, title: 'شرح العقيدة الواسطية', author: 'ابن تيمية', category: 'عقيدة', pages: 350, rating: 4.9 },
    { id: 5, title: 'الواسطية', author: 'ابن تيمية', category: 'عقيدة', pages: 80, rating: 4.9 },
    { id: 6, title: 'العقيدة السفارينية', author: 'السفاريني', category: 'عقيدة', pages: 250, rating: 4.8 },
    { id: 7, title: 'أصول السنة', author: 'الإمام أحمد', category: 'عقيدة', pages: 90, rating: 4.9 },
    { id: 8, title: 'الإيمان', author: 'ابن تيمية', category: 'عقيدة', pages: 400, rating: 4.9 },
    { id: 9, title: 'الشريعة', author: 'الآجري', category: 'عقيدة', pages: 600, rating: 4.8 },
    { id: 10, title: 'السنة', author: 'ابن أبي عاصم', category: 'عقيدة', pages: 450, rating: 4.8 },
    // تفسير
    { id: 11, title: 'تفسير ابن كثير', author: 'ابن كثير', category: 'تفسير', pages: 3200, rating: 4.9 },
    { id: 12, title: 'تفسير الطبري', author: 'الطبري', category: 'تفسير', pages: 4500, rating: 4.9 },
    { id: 13, title: 'تفسير القرطبي', author: 'القرطبي', category: 'تفسير', pages: 3800, rating: 4.8 },
    { id: 14, title: 'تفسير السعدي', author: 'السعدي', category: 'تفسير', pages: 1100, rating: 4.9 },
    { id: 15, title: 'أضواء البيان', author: 'الشنقيطي', category: 'تفسير', pages: 2100, rating: 4.8 },
    { id: 16, title: 'في ظلال القرآن', author: 'سيد قطب', category: 'تفسير', pages: 2500, rating: 4.7 },
    { id: 17, title: 'التحرير والتنوير', author: 'ابن عاشور', category: 'تفسير', pages: 3000, rating: 4.8 },
    { id: 18, title: 'البحر المحيط', author: 'أبو حيان', category: 'تفسير', pages: 2800, rating: 4.7 },
    { id: 19, title: 'زاد المسير', author: 'ابن الجوزي', category: 'تفسير', pages: 1800, rating: 4.8 },
    { id: 20, title: 'فتح القدير', author: 'الشوكاني', category: 'تفسير', pages: 2200, rating: 4.8 },
    // حديث
    { id: 21, title: 'صحيح البخاري', author: 'البخاري', category: 'حديث', pages: 3500, rating: 5.0 },
    { id: 22, title: 'صحيح مسلم', author: 'مسلم', category: 'حديث', pages: 3000, rating: 5.0 },
    { id: 23, title: 'سنن أبي داود', author: 'أبو داود', category: 'حديث', pages: 2000, rating: 4.9 },
    { id: 24, title: 'سنن الترمذي', author: 'الترمذي', category: 'حديث', pages: 1800, rating: 4.9 },
    { id: 25, title: 'سنن النسائي', author: 'النسائي', category: 'حديث', pages: 1900, rating: 4.9 },
    { id: 26, title: 'سنن ابن ماجه', author: 'ابن ماجه', category: 'حديث', pages: 1700, rating: 4.8 },
    { id: 27, title: 'موطأ مالك', author: 'مالك بن أنس', category: 'حديث', pages: 1500, rating: 4.9 },
    { id: 28, title: 'رياض الصالحين', author: 'النووي', category: 'حديث', pages: 600, rating: 4.9 },
    { id: 29, title: 'الأربعين النووية', author: 'النووي', category: 'حديث', pages: 100, rating: 4.9 },
    { id: 30, title: 'بلوغ المرام', author: 'ابن حجر', category: 'حديث', pages: 450, rating: 4.8 },
    // فقه
    { id: 31, title: 'الفقه على المذاهب الأربعة', author: 'عبد الرحمن الجزيري', category: 'فقه', pages: 2000, rating: 4.7 },
    { id: 32, title: 'المغني', author: 'ابن قدامة', category: 'فقه', pages: 4000, rating: 4.9 },
    { id: 33, title: 'المجموع', author: 'النووي', category: 'فقه', pages: 3500, rating: 4.9 },
    { id: 34, title: 'بداية المجتهد', author: 'ابن رشد', category: 'فقه', pages: 1200, rating: 4.8 },
    { id: 35, title: 'الأم', author: 'الشافعي', category: 'فقه', pages: 2500, rating: 4.9 },
    { id: 36, title: 'بدائع الصنائع', author: 'الكاساني', category: 'فقه', pages: 2200, rating: 4.8 },
    { id: 37, title: 'الهداية', author: 'المرغيناني', category: 'فقه', pages: 1800, rating: 4.8 },
    { id: 38, title: 'المدونة', author: 'مالك بن أنس', category: 'فقه', pages: 2800, rating: 4.9 },
    { id: 39, title: 'كشاف القناع', author: 'البهوتي', category: 'فقه', pages: 2400, rating: 4.8 },
    { id: 40, title: 'زاد المستقنع', author: 'الحجاوي', category: 'فقه', pages: 300, rating: 4.8 },
    // سيرة وتاريخ
    { id: 41, title: 'السيرة النبوية', author: 'ابن هشام', category: 'سيرة وتاريخ', pages: 1500, rating: 4.9 },
    { id: 42, title: 'زاد المعاد', author: 'ابن القيم', category: 'سيرة وتاريخ', pages: 1800, rating: 4.9 },
    { id: 43, title: 'الرحيق المختوم', author: 'المباركفوري', category: 'سيرة وتاريخ', pages: 550, rating: 4.9 },
    { id: 44, title: 'فقه السيرة', author: 'الغزالي', category: 'سيرة وتاريخ', pages: 400, rating: 4.8 },
    { id: 45, title: 'البداية والنهاية', author: 'ابن كثير', category: 'سيرة وتاريخ', pages: 5000, rating: 4.9 },
    { id: 46, title: 'دلائل النبوة', author: 'البيهقي', category: 'سيرة وتاريخ', pages: 2000, rating: 4.8 },
    { id: 47, title: 'الشمائل المحمدية', author: 'الترمذي', category: 'سيرة وتاريخ', pages: 350, rating: 4.9 },
    { id: 48, title: 'السيرة النبوية', author: 'ابن كثير', category: 'سيرة وتاريخ', pages: 1200, rating: 4.9 },
    { id: 49, title: 'نور اليقين', author: 'الخضري', category: 'سيرة وتاريخ', pages: 450, rating: 4.7 },
    { id: 50, title: 'السيرة الحلبية', author: 'الحلبي', category: 'سيرة وتاريخ', pages: 1600, rating: 4.8 },
    // تزكية وأخلاق
    { id: 51, title: 'إحياء علوم الدين', author: 'الغزالي', category: 'تزكية وأخلاق', pages: 2500, rating: 4.8 },
    { id: 52, title: 'مدارج السالكين', author: 'ابن القيم', category: 'تزكية وأخلاق', pages: 1200, rating: 4.9 },
    { id: 53, title: 'الوابل الصيب', author: 'ابن القيم', category: 'تزكية وأخلاق', pages: 300, rating: 4.9 },
    { id: 54, title: 'الفوائد', author: 'ابن القيم', category: 'تزكية وأخلاق', pages: 400, rating: 4.9 },
    { id: 55, title: 'عدة الصابرين', author: 'ابن القيم', category: 'تزكية وأخلاق', pages: 350, rating: 4.8 },
    { id: 56, title: 'مختصر منهاج القاصدين', author: 'ابن قدامة', category: 'تزكية وأخلاق', pages: 450, rating: 4.8 },
    { id: 57, title: 'تهذيب مدارج السالكين', author: 'عبد المنعم العزي', category: 'تزكية وأخلاق', pages: 600, rating: 4.7 },
    { id: 58, title: 'خلق المسلم', author: 'محمد الغزالي', category: 'تزكية وأخلاق', pages: 250, rating: 4.8 },
    { id: 59, title: 'الأدب المفرد', author: 'البخاري', category: 'تزكية وأخلاق', pages: 500, rating: 4.9 },
    { id: 60, title: 'حلية الأولياء', author: 'أبو نعيم', category: 'تزكية وأخلاق', pages: 3000, rating: 4.8 },
    // فكر ودعوة
    { id: 61, title: 'معالم في الطريق', author: 'سيد قطب', category: 'فكر ودعوة', pages: 200, rating: 4.7 },
    { id: 62, title: 'ماذا خسر العالم بانحطاط المسلمين', author: 'الندوي', category: 'فكر ودعوة', pages: 350, rating: 4.8 },
    { id: 63, title: 'الإسلام بين الشرق والغرب', author: 'علي عزت بيجوفيتش', category: 'فكر ودعوة', pages: 400, rating: 4.9 },
    { id: 64, title: 'الطريق إلى القرآن', author: 'إبراهيم السكران', category: 'فكر ودعوة', pages: 150, rating: 4.9 },
    { id: 65, title: 'رقائق القرآن', author: 'إبراهيم السكران', category: 'فكر ودعوة', pages: 180, rating: 4.9 },
    { id: 66, title: 'لأنك الله', author: 'علي جابر الفيفي', category: 'فكر ودعوة', pages: 200, rating: 4.9 },
    { id: 67, title: 'استمتع بحياتك', author: 'محمد العريفي', category: 'فكر ودعوة', pages: 350, rating: 4.8 },
    { id: 68, title: 'لا تحزن', author: 'عائض القرني', category: 'فكر ودعوة', pages: 450, rating: 4.8 },
    { id: 69, title: 'جدد حياتك', author: 'محمد الغزالي', category: 'فكر ودعوة', pages: 250, rating: 4.8 },
    { id: 70, title: 'خواطر قرآنية', author: 'عمرو خالد', category: 'فكر ودعوة', pages: 300, rating: 4.7 },
    // كتب متنوعة
    { id: 71, title: 'فقه السنة', author: 'سيد سابق', category: 'كتب متنوعة', pages: 1000, rating: 4.8 },
    { id: 72, title: 'الحلال والحرام', author: 'القرضاوي', category: 'كتب متنوعة', pages: 350, rating: 4.7 },
    { id: 73, title: 'كيف تتعامل مع القرآن', author: 'يوسف القرضاوي', category: 'كتب متنوعة', pages: 250, rating: 4.7 },
    { id: 74, title: 'قواعد التدبر الأمثل', author: 'عبد الرحمن الميداني', category: 'كتب متنوعة', pages: 300, rating: 4.8 },
    { id: 75, title: 'أصول التفسير', author: 'ابن تيمية', category: 'كتب متنوعة', pages: 150, rating: 4.9 },
    { id: 76, title: 'علوم القرآن', author: 'الزركشي', category: 'كتب متنوعة', pages: 800, rating: 4.8 },
    { id: 77, title: 'البرهان في علوم القرآن', author: 'الزركشي', category: 'كتب متنوعة', pages: 1200, rating: 4.9 },
    { id: 78, title: 'مناهل العرفان', author: 'الزرقاني', category: 'كتب متنوعة', pages: 900, rating: 4.8 },
    { id: 79, title: 'القواعد الفقهية', author: 'الندوي', category: 'كتب متنوعة', pages: 400, rating: 4.8 },
    { id: 80, title: 'الأشباه والنظائر', author: 'السيوطي', category: 'كتب متنوعة', pages: 600, rating: 4.8 },
    // إضافي
    { id: 81, title: 'الوصايا العشر', author: 'حسن البنا', category: 'إضافي', pages: 100, rating: 4.7 },
    { id: 82, title: 'كتاب الزهد', author: 'ابن المبارك', category: 'إضافي', pages: 450, rating: 4.9 },
    { id: 83, title: 'التذكرة', author: 'القرطبي', category: 'إضافي', pages: 800, rating: 4.8 },
    { id: 84, title: 'التوابين', author: 'ابن قدامة', category: 'إضافي', pages: 350, rating: 4.8 },
    { id: 85, title: 'الكبائر', author: 'الذهبي', category: 'إضافي', pages: 250, rating: 4.8 },
    { id: 86, title: 'سير أعلام النبلاء', author: 'الذهبي', category: 'إضافي', pages: 6000, rating: 5.0 },
    { id: 87, title: 'طبقات ابن سعد', author: 'ابن سعد', category: 'إضافي', pages: 4000, rating: 4.8 },
    { id: 88, title: 'التاريخ الإسلامي', author: 'محمود شاكر', category: 'إضافي', pages: 3500, rating: 4.8 },
    { id: 89, title: 'الفتوى الحموية', author: 'ابن تيمية', category: 'إضافي', pages: 150, rating: 4.9 },
    { id: 90, title: 'رفع الملام', author: 'ابن تيمية', category: 'إضافي', pages: 100, rating: 4.9 },
    // ختام القائمة
    { id: 91, title: 'اقتضاء الصراط المستقيم', author: 'ابن تيمية', category: 'ختام القائمة', pages: 500, rating: 4.9 },
    { id: 92, title: 'الصارم المسلول', author: 'ابن تيمية', category: 'ختام القائمة', pages: 600, rating: 4.9 },
    { id: 93, title: 'مفتاح دار السعادة', author: 'ابن القيم', category: 'ختام القائمة', pages: 800, rating: 4.9 },
    { id: 94, title: 'الروح', author: 'ابن القيم', category: 'ختام القائمة', pages: 450, rating: 4.8 },
    { id: 95, title: 'عدة الصابرين', author: 'ابن القيم', category: 'ختام القائمة', pages: 350, rating: 4.8 },
    { id: 96, title: 'أحكام القرآن', author: 'ابن العربي', category: 'ختام القائمة', pages: 1200, rating: 4.8 },
    { id: 97, title: 'القواعد النورانية', author: 'ابن تيمية', category: 'ختام القائمة', pages: 300, rating: 4.9 },
    { id: 98, title: 'الرسالة', author: 'الشافعي', category: 'ختام القائمة', pages: 400, rating: 4.9 },
    { id: 99, title: 'الأدب الشرعي', author: 'ابن مفلح', category: 'ختام القائمة', pages: 900, rating: 4.8 },
    { id: 100, title: 'جامع العلوم والحكم', author: 'ابن رجب', category: 'ختام القائمة', pages: 700, rating: 4.9 },
  ];

  const audios = [
    { id: 1, title: 'شرح الأربعين النووية', speaker: 'الشيخ ابن عثيمين', duration: '45:00', type: 'درس' },
    { id: 2, title: 'السيرة النبوية كاملة', speaker: 'د. طارق السويدان', duration: '1:20:00', type: 'محاضرة' },
    { id: 3, title: 'تفسير سورة البقرة', speaker: 'الشيخ الشعراوي', duration: '55:30', type: 'تفسير' },
  ];

  const videos = [
    { id: 1, title: 'قصة سيدنا إبراهيم', channel: 'قصص الأنبياء', duration: '15:20', views: '1.2M' },
    { id: 2, title: 'كيف تخشع في صلاتك', channel: 'دروس إيمانية', duration: '12:45', views: '850K' },
    { id: 3, title: 'علامات الساعة الكبرى', channel: 'محاضرات إسلامية', duration: '25:10', views: '2.1M' },
  ];

  const filteredBooks = books.filter(book => 
    book.title.includes(searchQuery) || 
    book.author.includes(searchQuery) || 
    book.category.includes(searchQuery)
  );

  const groupedBooks = filteredBooks.reduce((acc, book) => {
    if (!acc[book.category]) {
      acc[book.category] = [];
    }
    acc[book.category].push(book);
    return acc;
  }, {} as Record<string, typeof books>);

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex flex-col gap-4 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
          >
            <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" />
          </button>
          <h1 className="text-2xl font-bold font-serif text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            المكتبة الإسلامية
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن كتاب، درس، أو فيديو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-black/5 dark:border-white/5 rounded-2xl py-3 pr-12 pl-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)]/50 focus:ring-1 focus:ring-[var(--color-primary-light)]/50 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
          />
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>

        {/* Tabs */}
        <div className="flex bg-[var(--color-surface)] rounded-2xl p-1.5 shadow-[0_5px_15px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/5">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-inner ${
              activeTab === 'books' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-[var(--color-primary-light)]/50' : 'text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-primary-light)]'
            }`}
          >
            <Book size={18} />
            كتب
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-inner ${
              activeTab === 'audio' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-[var(--color-primary-light)]/50' : 'text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-primary-light)]'
            }`}
          >
            <Headphones size={18} />
            صوتيات
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-inner ${
              activeTab === 'video' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-[var(--color-primary-light)]/50' : 'text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-primary-light)]'
            }`}
          >
            <PlayCircle size={18} />
            مرئيات
          </button>
        </div>
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'books' && (
            <motion.div
              key="books"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {Object.entries(groupedBooks).map(([category, categoryBooks]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold font-serif text-[var(--color-primary-light)] mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[var(--color-primary)] rounded-full inline-block"></span>
                    {category}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {categoryBooks.map((book) => (
                      <div key={book.id} className="card-3d bg-[var(--color-surface)] rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col items-center text-center hover:border-[var(--color-primary-light)]/30 transition-all cursor-pointer group">
                        <div className="w-24 h-32 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl shadow-[0_10px_20px_rgba(212,175,55,0.3)] mb-4 flex items-center justify-center text-white/20 group-hover:shadow-[0_15px_30px_rgba(212,175,55,0.5)] transition-all relative overflow-hidden border border-[var(--color-primary-light)]/50 group-hover:scale-105">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay"></div>
                          <Book size={48} className="relative z-10" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text)] text-sm mb-1 line-clamp-2 group-hover:text-[var(--color-primary-light)] transition-colors">{book.title}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mb-3">{book.author}</p>
                        <div className="flex items-center gap-1 text-[var(--color-primary-light)] text-xs font-bold mt-auto bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-lg border border-[var(--color-primary)]/20 shadow-inner">
                          <Star size={14} className="fill-current" />
                          {book.rating}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedBooks).length === 0 && (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                  <Book size={48} className="mx-auto mb-4 opacity-20" />
                  <p>لم يتم العثور على كتب مطابقة للبحث</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'audio' && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {audios.map((audio) => (
                <div key={audio.id} className="card-3d bg-[var(--color-surface)] rounded-3xl p-4 shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-white/5 flex items-center gap-4 hover:bg-[var(--color-surface)]/80 hover:border-[var(--color-primary-light)]/30 transition-all cursor-pointer group">
                  <button className="w-14 h-14 bg-black/5 dark:bg-white/5 text-[var(--color-primary-light)] rounded-full flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-[var(--color-primary)] group-hover:to-[var(--color-primary-dark)] group-hover:text-white transition-all border border-white/10 group-hover:border-[var(--color-primary-light)]/50 shadow-inner group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110">
                    <PlayCircle size={28} />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--color-text)] text-base mb-1 group-hover:text-[var(--color-primary-light)] transition-colors">{audio.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{audio.speaker}</p>
                  </div>
                  <div className="text-xs text-[var(--color-primary-light)] font-mono bg-[var(--color-primary)]/10 px-3 py-2 rounded-xl border border-[var(--color-primary)]/20 shadow-inner">
                    {audio.duration}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {videos.map((video) => (
                <div key={video.id} className="card-3d bg-[var(--color-surface)] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 cursor-pointer group hover:border-[var(--color-primary-light)]/30 transition-all">
                  <div className="relative h-48 bg-black/40 overflow-hidden">
                    <img src={`https://picsum.photos/seed/video${video.id}/800/400`} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-black/40 to-transparent group-hover:from-black/90 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-[var(--color-primary-light)] shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-all border border-white/20 group-hover:border-[var(--color-primary-light)]/50 group-hover:bg-gradient-to-br group-hover:from-[var(--color-primary)] group-hover:to-[var(--color-primary-dark)] group-hover:text-white group-hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]">
                        <PlayCircle size={36} className="ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl text-white text-xs font-mono px-3 py-1.5 rounded-xl border border-white/20 shadow-inner">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-5 bg-[var(--color-surface)]">
                    <h3 className="font-bold text-[var(--color-text)] text-base mb-3 group-hover:text-[var(--color-primary-light)] transition-colors">{video.title}</h3>
                    <div className="flex justify-between items-center text-sm text-[var(--color-text-muted)]">
                      <span className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">{video.channel}</span>
                      <span className="flex items-center gap-1.5"><Eye size={16} /> {video.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

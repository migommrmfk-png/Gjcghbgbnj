import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Book, Download, ExternalLink, Search, Filter } from 'lucide-react';

const CATEGORIES = [
  "الكل",
  "القرآن وعلومه",
  "الحديث وشرح السنّة",
  "العقيدة والتوحيد",
  "الأذكار والعبادات",
  "السيرة النبوية",
  "قصص الأنبياء",
  "الفقه المبسط",
  "رمضان والزكاة والحج"
];

const BOOKS = [
  {
    id: 1,
    title: "التفسير الميسر",
    author: "نخبة من العلماء",
    category: "القرآن وعلومه",
    description: "تفسير مبسط وواضح لمعاني القرآن الكريم، أعده نخبة من علماء التفسير.",
    readUrl: "https://shamela.ws/book/93",
    downloadUrl: "https://archive.org/download/tafseer-moyassar/tafseer-moyassar.pdf",
    image: "https://images.unsplash.com/photo-1584282869372-00b8e6bb2345?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    title: "رياض الصالحين",
    author: "الإمام النووي",
    category: "الحديث وشرح السنّة",
    description: "مختارات من أحاديث الرسول ﷺ في الشؤون الدينية والدنيوية.",
    readUrl: "https://shamela.ws/book/21808",
    downloadUrl: "https://archive.org/download/waq46401/46401.pdf",
    image: "https://images.unsplash.com/photo-1542816417-0983cb9c62ce?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    title: "كتاب التوحيد",
    author: "الإمام محمد بن عبدالوهاب",
    category: "العقيدة والتوحيد",
    description: "كتاب يبين حق الله على العبيد، في توحيد العبادة والتحذير من الشرك.",
    readUrl: "https://shamela.ws/book/11559",
    downloadUrl: "https://archive.org/download/waq17849/17849.pdf",
    image: "https://images.unsplash.com/photo-1590076215667-873dcb3f3fbb?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    title: "حصن المسلم",
    author: "سعيد بن علي بن وهف القحطاني",
    category: "الأذكار والعبادات",
    description: "من أذكار الكتاب والسنة، كتاب مختصر يجمع الأذكار المهمة للمسلم.",
    readUrl: "https://shamela.ws/book/1888",
    downloadUrl: "https://archive.org/download/waq108398/108398.pdf",
    image: "https://images.unsplash.com/photo-1519817914152-2a241f6e2325?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 5,
    title: "الرحيق المختوم",
    author: "صفي الرحمن المباركفوري",
    category: "السيرة النبوية",
    description: "كتاب في السيرة النبوية، حاز المركز الأول في مسابقة رابطة العالم الإسلامي.",
    readUrl: "https://shamela.ws/book/27339",
    downloadUrl: "https://archive.org/download/waq88523/88523.pdf",
    image: "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 6,
    title: "قصص الأنبياء",
    author: "الإمام ابن كثير",
    category: "قصص الأنبياء",
    description: "يستعرض سيرة الأنبياء والرسل كما وردت في القرآن الكريم والسنّة المطهرة.",
    readUrl: "https://shamela.ws/book/12170",
    downloadUrl: "https://archive.org/download/waq13276/13276.pdf",
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 7,
    title: "الفقه الميسر",
    author: "نخبة من العلماء",
    category: "الفقه المبسط",
    description: "فقه العبادات والمعاملات مدعماً بالأدلة من الكتاب والسنّة وبأسلوب مبسط.",
    readUrl: "https://shamela.ws/book/11413",
    downloadUrl: "https://archive.org/download/waq88524/88524.pdf",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 8,
    title: "صفة صوم النبي ﷺ",
    author: "محمد ناصر الدين الألباني",
    category: "رمضان والزكاة والحج",
    description: "بيان لصفة صوم النبي ﷺ في رمضان كأنك تراه.",
    readUrl: "https://shamela.ws/book/10531",
    downloadUrl: "https://archive.org/download/sifat-sawm/sifat-sawm.pdf",
    image: "https://images.unsplash.com/photo-1519406086208-cb2687c4f1c1?auto=format&fit=crop&q=80&w=400"
  }
];

export default function IslamicLibrary({ onBack }: { onBack: () => void }) {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = BOOKS.filter(book => {
    const matchesCategory = activeCategory === "الكل" || book.category === activeCategory;
    const matchesSearch = book.title.includes(searchQuery) || book.author.includes(searchQuery) || book.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 bg-[#0A1914] text-white rounded-b-[2.5rem] shadow-xl shrink-0 border-b border-emerald-900/30 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none" 
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542816417-0983cb9c62ce?auto=format&fit=crop&q=80&w=1200")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-900/60 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10"
            >
               <ArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-serif">المكتبة الإسلامية</h1>
              <p className="text-emerald-200/80 text-sm mt-1">«اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ»</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative z-10 mt-6 max-w-md mx-auto">
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن كتاب، مؤلف، أو موضوع..."
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-10 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all font-medium text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Categories */}
        <div className="py-4 px-4 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-10 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {CATEGORIES.map(category => (
               <button
                 key={category}
                 onClick={() => setActiveCategory(category)}
                 className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all shadow-sm ${
                   activeCategory === category 
                     ? 'bg-emerald-600 text-white font-bold shadow-emerald-600/30'
                     : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                 }`}
               >
                 {category}
               </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 max-w-7xl mx-auto">
           <AnimatePresence>
             {filteredBooks.length > 0 ? (
               filteredBooks.map((book) => (
                 <motion.div 
                   key={book.id}
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.2 }}
                   className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative group"
                 >
                   {/* Cover Image or Simulated Cover */}
                   <div className="w-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-6 border-b border-slate-200 dark:border-slate-700 min-h-[160px] relative overflow-hidden shrink-0">
                     {book.image ? (
                       <>
                         <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${book.image})` }}></div>
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/40"></div>
                       </>
                     ) : (
                       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                     )}
                     <Book className={`w-10 h-10 absolute top-4 left-4 z-20 ${book.image ? 'text-white/40' : 'text-emerald-600/40 dark:text-emerald-400/40'}`} />
                     <div className="relative z-10 text-center w-full mt-4">
                       <h3 className={`font-serif font-extrabold text-lg leading-tight ${book.image ? 'text-white drop-shadow-md' : 'text-slate-800 dark:text-slate-200'}`}>{book.title}</h3>
                       <p className={`text-[11px] mt-2 font-medium ${book.image ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{book.author}</p>
                     </div>
                   </div>

                   <div className="p-5 flex-1 flex flex-col justify-between">
                     <div>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                           {book.category}
                         </span>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                         {book.description}
                       </p>
                     </div>
                     
                     <div className="mt-5 flex items-center gap-2">
                       <a 
                         href={book.readUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                       >
                         <ExternalLink size={16} />
                         اقرأ
                       </a>
                       {book.downloadUrl && (
                         <a 
                           href={book.downloadUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors border border-slate-200 dark:border-slate-700"
                         >
                           <Download size={18} />
                         </a>
                       )}
                     </div>
                   </div>
                 </motion.div>
               ))
             ) : (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center"
               >
                 <Book size={48} className="mb-4 opacity-20" />
                 <p className="font-medium">لم يتم العثور على كتب تطابق بحثك</p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

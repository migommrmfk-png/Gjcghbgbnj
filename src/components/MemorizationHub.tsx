import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Target, Sparkles, Plus, Trash2, Share2, Award, Flame, CheckCircle, Search, Edit3, Calendar, Download, RefreshCw, Star } from 'lucide-react';

interface MemorizedPortion {
  id: string;
  surahName: string;
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  status: 'memorizing' | 'memorized' | 'needs_revision';
  dateAdded: string;
  notes?: string;
}

// 114 Surahs structural helper to make searching seamless and precise
const SURAHS_METADATA = [
  { number: 1, name: "الفاتحة", verses: 7 },
  { number: 2, name: "البقرة", verses: 286 },
  { number: 3, name: "آل عمران", verses: 200 },
  { number: 4, name: "النساء", verses: 176 },
  { number: 5, name: "المائدة", verses: 120 },
  { number: 6, name: "الأنعام", verses: 165 },
  { number: 7, name: "الأعراف", verses: 206 },
  { number: 8, name: "الأنفال", verses: 75 },
  { number: 9, name: "التوبة", verses: 129 },
  { number: 10, name: "يونس", verses: 109 },
  { number: 11, name: "هود", verses: 123 },
  { number: 12, name: "يوسف", verses: 111 },
  { number: 13, name: "الرعد", verses: 43 },
  { number: 14, name: "إبراهيم", verses: 52 },
  { number: 15, name: "الحجر", verses: 99 },
  { number: 16, name: "النحل", verses: 128 },
  { number: 17, name: "الإسراء", verses: 111 },
  { number: 18, name: "الكهف", verses: 110 },
  { number: 19, name: "مريم", verses: 98 },
  { number: 20, name: "طه", verses: 135 },
  { number: 21, name: "الأنبياء", verses: 112 },
  { number: 22, name: "الحج", verses: 78 },
  { number: 23, name: "المؤمنون", verses: 118 },
  { number: 24, name: "النور", verses: 64 },
  { number: 25, name: "الفرقان", verses: 77 },
  { number: 26, name: "الشعراء", verses: 227 },
  { number: 27, name: "النمل", verses: 93 },
  { number: 28, name: "القصص", verses: 88 },
  { number: 29, name: "العنكبوت", verses: 69 },
  { number: 30, name: "الروم", verses: 60 },
  { number: 31, name: "لقمان", verses: 34 },
  { number: 32, name: "السجدة", verses: 30 },
  { number: 33, name: "الأحزاب", verses: 73 },
  { number: 34, name: "سبأ", verses: 54 },
  { number: 35, name: "فاطر", verses: 45 },
  { number: 36, name: "يس", verses: 83 },
  { number: 37, name: "الصافات", verses: 182 },
  { number: 38, name: "ص", verses: 88 },
  { number: 39, name: "الزمر", verses: 75 },
  { number: 40, name: "غافر", verses: 85 },
  { number: 41, name: "فصلت", verses: 54 },
  { number: 42, name: "الشورى", verses: 53 },
  { number: 43, name: "الزخرف", verses: 89 },
  { number: 44, name: "الدخان", verses: 59 },
  { number: 45, name: "الجاثية", verses: 37 },
  { number: 46, name: "الأحقاف", verses: 35 },
  { number: 47, name: "محمد", verses: 38 },
  { number: 48, name: "الفتح", verses: 29 },
  { number: 49, name: "الحجرات", verses: 18 },
  { number: 50, name: "ق", verses: 45 },
  { number: 51, name: "الذاريات", verses: 60 },
  { number: 52, name: "الطور", verses: 49 },
  { number: 53, name: "النجم", verses: 62 },
  { number: 54, name: "القمر", verses: 55 },
  { number: 55, name: "الرحمن", verses: 78 },
  { number: 56, name: "الواقعة", verses: 96 },
  { number: 57, name: "الحديد", verses: 29 },
  { number: 58, name: "المجادلة", verses: 22 },
  { number: 59, name: "الحشر", verses: 24 },
  { number: 60, name: "الممتحنة", verses: 13 },
  { number: 61, name: "الصف", verses: 14 },
  { number: 62, name: "الجمعة", verses: 11 },
  { number: 63, name: "المنافقون", verses: 11 },
  { number: 64, name: "التغابن", verses: 18 },
  { number: 65, name: "الطلاق", verses: 12 },
  { number: 66, name: "التحريم", verses: 12 },
  { number: 67, name: "الملك", verses: 30 },
  { number: 68, name: "القلم", verses: 52 },
  { number: 69, name: "الحاقة", verses: 52 },
  { number: 70, name: "المعارج", verses: 44 },
  { number: 71, name: "نوح", verses: 28 },
  { number: 72, name: "الجن", verses: 28 },
  { number: 73, name: "المزمل", verses: 20 },
  { number: 74, name: "المدثر", verses: 56 },
  { number: 75, name: "القيامة", verses: 40 },
  { number: 76, name: "الإنسان", verses: 31 },
  { number: 77, name: "المرسلات", verses: 50 },
  { number: 78, name: "النبأ", verses: 40 },
  { number: 79, name: "النازعات", verses: 46 },
  { number: 80, name: "عبس", verses: 42 },
  { number: 81, name: "التكوير", verses: 29 },
  { number: 82, name: "الانفطار", verses: 19 },
  { number: 83, name: "المطففين", verses: 36 },
  { number: 84, name: "الانشقاق", verses: 25 },
  { number: 85, name: "البروج", verses: 22 },
  { number: 86, name: "الطارق", verses: 17 },
  { number: 87, name: "الأعلى", verses: 19 },
  { number: 88, name: "الغاشية", verses: 26 },
  { number: 89, name: "الفجر", verses: 30 },
  { number: 90, name: "البلد", verses: 20 },
  { number: 91, name: "الشمس", verses: 15 },
  { number: 92, name: "الليل", verses: 21 },
  { number: 93, name: "الضحى", verses: 11 },
  { number: 94, name: "الشرح", verses: 8 },
  { number: 95, name: "التين", verses: 8 },
  { number: 96, name: "العلق", verses: 19 },
  { number: 97, name: "القدر", verses: 5 },
  { number: 98, name: "البينة", verses: 8 },
  { number: 99, name: "الزلزلة", verses: 8 },
  { number: 100, name: "العاديات", verses: 11 },
  { number: 101, name: "القارعة", verses: 11 },
  { number: 102, name: "التكاثر", verses: 8 },
  { number: 103, name: "العصر", verses: 3 },
  { number: 104, name: "الهمزة", verses: 9 },
  { number: 105, name: "الفيل", verses: 5 },
  { number: 106, name: "قريش", verses: 4 },
  { number: 107, name: "الماعون", verses: 7 },
  { number: 108, name: "الكوثر", verses: 3 },
  { number: 109, name: "الكافرون", verses: 6 },
  { number: 110, name: "النصر", verses: 3 },
  { number: 111, name: "المسد", verses: 5 },
  { number: 112, name: "الإخلاص", verses: 4 },
  { number: 113, name: "الفلق", verses: 5 },
  { number: 114, name: "الناس", verses: 6 }
];

export default function MemorizationHub({ onBack }: { onBack?: () => void }) {
  const [portions, setPortions] = useState<MemorizedPortion[]>([]);
  const [streak, setStreak] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSurahs, setFilteredSurahs] = useState(SURAHS_METADATA);
  
  // Form State
  const [selectedSurah, setSelectedSurah] = useState(SURAHS_METADATA[29]); // Default to Spider or Al-Mulk
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(selectedSurah.verses);
  const [status, setStatus] = useState<'memorizing' | 'memorized' | 'needs_revision'>('memorized');
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Card Theme configuration
  const [shareTheme, setShareTheme] = useState<'emerald' | 'amber' | 'indigo' | 'slate'>('emerald');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load memorization list
    const saved = localStorage.getItem('memorized_portions');
    if (saved) {
      try {
        setPortions(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading memorization portions", e);
      }
    }

    // Load streak info
    const savedStreak = parseInt(localStorage.getItem('memorization_streak') || '0');
    const lastDate = localStorage.getItem('memorization_last_date');
    const today = new Date().toDateString();

    if (lastDate) {
      if (lastDate === today) {
        setStreak(savedStreak);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          setStreak(savedStreak);
        } else {
          setStreak(0); // broken
        }
      }
    }
  }, []);

  useEffect(() => {
    // Dropdown query search filter
    if (searchQuery.trim() === '') {
      setFilteredSurahs(SURAHS_METADATA);
    } else {
      setFilteredSurahs(
        SURAHS_METADATA.filter(s => s.name.includes(searchQuery) || s.number.toString() === searchQuery)
      );
    }
  }, [searchQuery]);

  // Handle clicking outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const savePortionsList = (newList: MemorizedPortion[]) => {
    setPortions(newList);
    localStorage.setItem('memorized_portions', JSON.stringify(newList));
  };

  const handleAddPortion = (e: React.FormEvent) => {
    e.preventDefault();

    // Verification
    if (startVerse < 1 || startVerse > selectedSurah.verses || endVerse < startVerse || endVerse > selectedSurah.verses) {
      alert(`عذراً، عدد آيات سورة ${selectedSurah.name} هو ${selectedSurah.verses} آيات. يرجى تصحيح نطاق الآيات.`);
      return;
    }

    const uniqueId = Date.now().toString();
    const newPortion: MemorizedPortion = {
      id: uniqueId,
      surahName: selectedSurah.name,
      surahNumber: selectedSurah.number,
      startVerse,
      endVerse,
      status,
      dateAdded: new Date().toLocaleDateString('ar-EG'),
      notes: notes.trim() !== '' ? notes : undefined
    };

    const updatedList = [newPortion, ...portions];
    savePortionsList(updatedList);
    
    // Update Streak
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('memorization_last_date');
    let newStreak = streak;

    if (lastDate !== today) {
      newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('memorization_streak', newStreak.toString());
      localStorage.setItem('memorization_last_date', today);
    }

    // Reset inputs
    setSearchQuery('');
    setNotes('');
    alert(`تمت إضافة الورد بنجاح إلى سجل الحفظ! مبارك همتك الإيمانية العالية.`);
  };

  const handleDeletePortion = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الورد من سجل الحفظ؟')) {
      const updated = portions.filter(p => p.id !== id);
      savePortionsList(updated);
    }
  };

  // Stats calculators
  const getTotalVersesCount = () => {
    return portions
      .filter(p => p.status === 'memorized')
      .reduce((acc, curr) => acc + (curr.endVerse - curr.startVerse + 1), 0);
  };

  // Total verses in quran is 6236
  const getProgressPercent = () => {
    const total = getTotalVersesCount();
    return ((total / 6236) * 100).toFixed(2);
  };

  const notifyShare = () => {
    const versesStr = getTotalVersesCount();
    const shareText = `🕌 بفضل الله وعونه، أنجزت حفظ ومراجعة { ${versesStr} آية } من كتاب الله العزيز عبر تطبيق (الحق)! \n✨ سلسلة الطاعة الحالية: ${streak} أيام متواصلة.\n🌸 شاركني الأجور وانخرط في منهج التقوى الآن!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'محراب حفظ وحساب القرآن',
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Colors based on customizable card themes
  const themeStyles = {
    emerald: {
      bg: 'bg-emerald-950 text-white',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300',
      accent: 'text-emerald-400',
      gradient: 'from-emerald-800 to-teal-950'
    },
    amber: {
      bg: 'bg-amber-950 text-white',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300',
      accent: 'text-amber-400',
      gradient: 'from-amber-800 to-amber-950'
    },
    indigo: {
      bg: 'bg-indigo-950 text-white',
      border: 'border-indigo-500/30',
      badge: 'bg-indigo-500/20 text-indigo-300',
      accent: 'text-indigo-400',
      gradient: 'from-indigo-800 to-violet-950'
    },
    slate: {
      bg: 'bg-slate-900 text-white',
      border: 'border-slate-600/30',
      badge: 'bg-slate-600/20 text-slate-300',
      accent: 'text-slate-300',
      gradient: 'from-slate-700 to-slate-900'
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28 text-slate-800 dark:text-slate-100 min-h-screen" dir="rtl">
      
      {/* Premium Dynamic Header */}
      <div className="bg-gradient-to-bl from-emerald-600 via-emerald-700 to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="bg-emerald-500/25 border border-white/20 text-xs px-3.5 py-1 rounded-full font-bold inline-block mb-3">حفظ القرآن ومراجعته</span>
            <h2 className="text-3xl font-bold font-serif mb-2 text-white text-right leading-tight">مِحراب الحفظ</h2>
            <p className="text-[11px] text-emerald-100/90 font-medium">سجل تقدّمك الإيماني، ثبّت وردك، واصنع بطاقات المشاركة</p>
          </div>
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex-shrink-0">
            <BookOpen size={30} className="text-white" />
          </div>
        </div>
      </div>

      {/* Numerical Stats Panel */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 text-center shadow-md">
          <Flame size={20} className="text-orange-500 mx-auto mb-1.5" />
          <span className="block text-[10px] text-slate-400 font-bold mb-0.5">سلسلة الورد</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100">{streak} يوم</span>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 text-center shadow-md">
          <Award size={20} className="text-amber-500 mx-auto mb-1.5" />
          <span className="block text-[10px] text-slate-400 font-bold mb-0.5">آيات المحفوظ</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100">{getTotalVersesCount()}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 text-center shadow-md">
          <Sparkles size={20} className="text-emerald-500 mx-auto mb-1.5 animate-pulse" />
          <span className="block text-[10px] text-slate-400 font-bold mb-0.5">نسبة المحفوظ</span>
          <span className="text-md font-black text-emerald-600 dark:text-emerald-400">{getProgressPercent()}%</span>
        </div>
      </div>

      {/* Button to quickly open Share Card overlay */}
      {portions.length > 0 && (
        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => setShowShareModal(true)}
          className="w-full py-4 bg-gradient-to-l from-amber-500 to-yellow-600 text-[#0a1914] rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15"
        >
          <Share2 size={18} />
          <span>تصدير بطاقة مشاركة تقدّم الحفظ الفخمة ✨</span>
        </motion.button>
      )}

      {/* Form to insert new portion */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-md space-y-4">
        <h3 className="text-md font-extrabold text-[#0a1914] dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
          <Plus size={18} className="text-emerald-500" />
          <span>تسجيل ورد حفظ أو مراجعة جديد</span>
        </h3>

        <form onSubmit={handleAddPortion} className="space-y-4">
          
          {/* Custom Surah Search Selector Dropdown with Ref */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">اختر السورة الكريمة</label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2.5">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="ابحث باسم السورة (مثال: الكهف أو 18)..."
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="flex-1 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 font-bold"
              />
              <span className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-black">
                {selectedSurah.name} ({selectedSurah.verses} آية)
              </span>
            </div>

            {/* Render absolute searchable dropdown item list */}
            {isDropdownOpen && (
              <div className="absolute z-40 w-full mt-2.5 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 divide-y divide-black/5 dark:divide-white/5">
                {filteredSurahs.map((s) => (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      setSelectedSurah(s);
                      setStartVerse(1);
                      setEndVerse(s.verses);
                      setSearchQuery(s.name);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-right px-4 py-2.5 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors flex justify-between dark:hover:bg-emerald-600"
                  >
                    <span>{s.number}. سورة {s.name}</span>
                    <span>{s.verses} آية</span>
                  </button>
                ))}
                {filteredSurahs.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400 font-medium">لم يتم العثور على نتائج للتسمية</div>
                )}
              </div>
            )}
          </div>

          {/* Verses Range Input Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">من الآية</label>
              <input
                type="number"
                min={1}
                max={selectedSurah.verses}
                value={startVerse}
                onChange={(e) => setStartVerse(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-black text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">إلى الآية</label>
              <input
                type="number"
                min={startVerse}
                max={selectedSurah.verses}
                value={endVerse}
                onChange={(e) => setEndVerse(Math.min(selectedSurah.verses, parseInt(e.target.value) || selectedSurah.verses))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-black text-center"
              />
            </div>
          </div>

          {/* Status Segment Control Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">الحالة الإيمانية الحالية للورد</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setStatus('memorized')}
                className={`py-2 text-[10px] font-black rounded-xl transition-all ${
                  status === 'memorized' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                تـمّ الحفظ بنجاح
              </button>
              
              <button
                type="button"
                onClick={() => setStatus('memorizing')}
                className={`py-2 text-[10px] font-black rounded-xl transition-all ${
                  status === 'memorizing' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                جاري الحفظ الآن
              </button>

              <button
                type="button"
                onClick={() => setStatus('needs_revision')}
                className={`py-2 text-[10px] font-black rounded-xl transition-all ${
                  status === 'needs_revision' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                يحتاج تكرار ومراجعة
              </button>
            </div>
          </div>

          {/* Optional notes section */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">ملاحظات أو وقفات تدبرية (اختياري)</label>
            <textarea
              placeholder="مثال: واجهت صعوبة في الربط بين الآية 12 و13، تم التثبيت بالتكرار..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <CheckCircle size={16} />
            <span>حفظ هذا الورد الجديد في سجل التقوى 📖</span>
          </button>
        </form>
      </div>

      {/* History Ledger List of registered items */}
      <div className="space-y-4">
        <h3 className="text-md font-extrabold text-[#0a1914] dark:text-white flex items-center justify-between pb-1">
          <span>سجل محفوظات القرآن الكريم ومراجعاتك:</span>
          <span className="text-xs font-bold text-slate-400 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">{portions.length} أوراد مسجلة</span>
        </h3>

        {portions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs font-medium relative overflow-hidden flex flex-col items-center">
            <BookOpen size={40} className="text-slate-300 dark:text-slate-800 mb-3" />
            <span>سجلّ الحفظ فارغ حالياً. باشر تلاوة جزء عم أو السور التي تحفظها وسجّلها لتتابع سلسلة تقدّمك اليومي!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {portions.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex justify-between items-center relative overflow-hidden group"
              >
                {/* Visual Accent Colored strip based on status */}
                <div className={`absolute top-0 right-0 w-1.5 h-full ${
                  item.status === 'memorized' ? 'bg-emerald-500' : item.status === 'memorizing' ? 'bg-blue-500' : 'bg-amber-500'
                }`}></div>

                <div className="pr-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-serif">سورة {item.surahName}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">
                      {item.startVerse === item.endVerse ? `الآية ${item.startVerse}` : `الآيات ${item.startVerse} - ${item.endVerse}`}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg font-mono">
                      {item.notes}
                    </p>
                  )}

                  <div className="flex gap-2 text-[10px] text-slate-400 font-bold">
                    <span>تاريخ الإضافة: {item.dateAdded}</span>
                    <span>•</span>
                    <span className={`${
                      item.status === 'memorized' ? 'text-emerald-500' : item.status === 'memorizing' ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {item.status === 'memorized' ? 'تم الحفظ ✔️' : item.status === 'memorizing' ? 'قيد الحفظ ⏳' : 'تحتاج مراجعة 🚨'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePortion(item.id)}
                  className="p-2 ml-1 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl"
                  title="حذف الورد"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
        >
          العودة لوحة التحكم الرائدة
        </button>
      )}

      {/* Visual Overlay of the Share progress Card Creator */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3">
                <h3 className="text-md font-extrabold text-[#0a1914] dark:text-white font-serif">صانع بطاقة مشاركة التقدم الإيمانية ✨</h3>
                <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-black">إغلاق</button>
              </div>

              {/* Theme customization row selection */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-400">اختر طابع البطاقة البصري:</span>
                <div className="flex gap-2">
                  {Object.keys(themeStyles).map((t) => (
                    <button
                      key={t}
                      onClick={() => setShareTheme(t as any)}
                      className={`flex-1 py-1.5 text-[10px] font-black rounded-lg border uppercase transition-all ${
                        shareTheme === t 
                          ? 'bg-emerald-500 border-none text-white font-black' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 bg-transparent'
                      }`}
                    >
                      {t === 'emerald' ? 'زبرجد' : t === 'amber' ? 'كهرمان' : t === 'indigo' ? 'ياقوت' : 'رمادي ملحمي'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Visual Share Card - Perfectly styled to emulate high-end graphic design */}
              <div className={`p-6 rounded-[2.5rem] border ${themeStyles[shareTheme].border} ${themeStyles[shareTheme].bg} relative overflow-hidden shadow-xl text-center self-center`}>
                {/* Decorative Geometric Overlays */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full -mr-16 -mt-16 border border-white/5"></div>
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-black/10 rounded-full -ml-16 -mb-16"></div>

                <div className="relative z-10 space-y-4">
                  {/* Arabic Icon Frame */}
                  <div className="w-12 h-12 bg-white/10 rounded-2xl mx-auto flex items-center justify-center border border-white/20 shadow-md">
                    <Star size={24} className="text-amber-400 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-extrabold font-serif tracking-wide text-white">بطاقة تقدّم مَحراب التقوى</h4>
                    <span className="block text-[10px] text-slate-300 font-medium">خطوة بخطوة نحو ختم كتاب الله الجليل</span>
                  </div>

                  {/* Highlights statistics list */}
                  <div className="p-4 bg-black/20 rounded-2xl border border-white/5 divide-y divide-white/5 text-right space-y-2 text-xs font-bold font-serif shadow-inner">
                    <div className="flex justify-between py-1 items-center">
                      <span className="text-slate-300">إجمالي الآيات المحفوظة:</span>
                      <span className="text-sm font-black text-white">{getTotalVersesCount()} آيات</span>
                    </div>
                    <div className="flex justify-between py-1.5 items-center">
                      <span className="text-slate-300">نسبة الإنجاز الفعلي للقرآن:</span>
                      <span className={`text-sm font-black ${themeStyles[shareTheme].accent}`}>{getProgressPercent()}%</span>
                    </div>
                    <div className="flex justify-between py-1 items-center">
                      <span className="text-slate-300">سلسلة الورد المتتالية:</span>
                      <span className="text-sm font-black text-amber-300">{streak} أيام طاعة</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300/80 leading-relaxed font-mono antialiased px-2">
                    "يقال لصاحب القرآن اقرأ وارق ورتل كما كنت ترتل في الدنيا فإن منزلتك عند آخر آية تقرؤها"
                  </p>

                  <div className="text-[9px] bg-white/10 backdrop-blur-md py-1 px-4 rounded-full inline-block border border-white/15">
                     صُنعت بـ حُب وتدبر عبر تطبيق الحق 🕌
                  </div>
                </div>
              </div>

              {/* Share copy button trigger */}
              <div className="space-y-2.5">
                <button
                  onClick={notifyShare}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Share2 size={16} />
                  <span>{copiedLink ? 'تم نسخ التقديم لقلبك! 👍' : 'نسخ نص التقدم للمشاركة'}</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium">تستطيع مشاركتها مع أهلك وأصحابك ومجموعات الواتساب تشجيعاً وتحفيزاً للقرآن</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { BookOpen, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Hadith {
  id: number;
  text: string;
  source: string;
}

const dailyHadiths: Hadith[] = [
  {
    id: 1,
    text: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...",
    source: "رواه البخاري ومسلم",
  },
  {
    id: 2,
    text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.",
    source: "رواه مسلم",
  },
  {
    id: 3,
    text: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ.",
    source: "رواه البخاري ومسلم",
  },
  {
    id: 4,
    text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.",
    source: "رواه البخاري",
  },
  {
    id: 5,
    text: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.",
    source: "رواه البخاري ومسلم",
  },
];

export default function Hadith() {
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Select a pseudo-random hadith based on the day of the year
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24,
    );
    const index = dayOfYear % dailyHadiths.length;
    setHadith(dailyHadiths[index]);
  }, []);

  const handleShare = async () => {
    if (!hadith) return;

    const shareData = {
      title: "الحديث اليومي",
      text: `${hadith.text}\n\n${hadith.source}\n\nعبر تطبيق هذا ديني`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareData.text);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (!hadith) return null;

  return (
    <div
      className="max-w-md mx-auto p-4 space-y-6 pb-24 min-h-screen bg-[var(--color-bg)] flex flex-col"
      dir="rtl"
    >
      {/* Header 3D */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-[var(--color-surface)] to-[#1a221d] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden text-center border border-white/5"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/40 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-serif mb-2 flex justify-center items-center gap-3 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] text-[var(--color-primary-light)]">
            <BookOpen size={32} className="text-[var(--color-primary)]" />
            الحديث اليومي
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm font-medium">بلغوا عني ولو آية</p>
        </div>
      </motion.div>

      {/* Hadith Card 3D */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="card-3d p-8 relative overflow-hidden bg-[var(--color-surface)] border border-[var(--color-primary-light)]/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-[2rem]">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-primary)]/20 rounded-br-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--color-primary-dark)]/20 rounded-tl-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.5)] mb-4 border border-[var(--color-primary-light)]/50">
              <BookOpen size={40} />
            </div>

            <p className="text-2xl leading-loose font-serif text-[var(--color-primary-light)] font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
              "{hadith.text}"
            </p>

            <div className="w-full border-t border-white/10 pt-6 flex flex-col items-center gap-4">
              <span className="text-sm font-bold text-[var(--color-primary-light)] bg-[var(--color-primary)]/10 px-4 py-2 rounded-full border border-[var(--color-primary)]/20 shadow-inner">
                {hadith.source}
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition-colors mt-4 font-bold"
              >
                <Share2 size={20} />
                <span>مشاركة الحديث</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[var(--color-primary)] text-black px-6 py-3 rounded-full shadow-lg z-50 font-bold text-sm whitespace-nowrap"
          >
            تم نسخ الحديث إلى الحافظة
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

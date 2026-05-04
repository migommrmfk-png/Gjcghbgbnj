import React, { useState, useEffect } from "react";
import { BookOpen, Share2, Info, Star, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Hadith {
  id: number;
  text: string;
  source: string;
  explanation: string;
  benefits: string[];
}

export const dailyHadiths: Hadith[] = [
  {
    id: 1,
    text: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...",
    source: "رواه البخاري ومسلم",
    explanation: "هذا الحديث أصل عظيم من أصول الإسلام، يبين أن قبول الأعمال وصلاحها مرتبط بالنية الخالصة لله تعالى. فمن نوى الخير أُجر عليه، ومن نوى غير ذلك فليس له من عمله إلا ما نوى.",
    benefits: [
      "أهمية الإخلاص لله في كل عمل.",
      "النية تميز العبادات عن العادات.",
      "يؤجر المسلم على نيته الصالحة حتى وإن لم يتمكن من أداء العمل."
    ]
  },
  {
    id: 2,
    text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.",
    source: "رواه مسلم",
    explanation: "يحثنا النبي ﷺ على طلب العلم الشرعي والنافع، ويبشر طالب العلم بأن الله ييسر له أسباب دخول الجنة جزاءً لسعيه واجتهاده.",
    benefits: [
      "فضل طلب العلم ومكانة العلماء.",
      "العلم طريق موصل إلى الجنة.",
      "الحث على الصبر في طلب العلم وتحصيله."
    ]
  },
  {
    id: 3,
    text: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ.",
    source: "رواه البخاري ومسلم",
    explanation: "المسلم الحقيقي هو الذي يكف أذاه عن الناس، فلا يغتابهم أو يسبهم بلسانه، ولا يعتدي عليهم أو يظلمهم بيده، بل يكون مصدر أمن وسلام لمن حوله.",
    benefits: [
      "أهمية حفظ اللسان والجوارح عن إيذاء الآخرين.",
      "الإسلام دين السلام والرحمة.",
      "حسن الخلق من أعظم صفات المسلم."
    ]
  },
  {
    id: 4,
    text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.",
    source: "رواه البخاري",
    explanation: "أفضل الناس منزلة عند الله هم من يجتهدون في تعلم تلاوة القرآن وفهم معانيه، ثم يقومون بتعليم ذلك لغيرهم لنشر الخير والهدى.",
    benefits: [
      "فضل تلاوة القرآن وتعلمه.",
      "أهمية نشر العلم وتعليم كتاب الله.",
      "القرآن هو مصدر العز والرفعة في الدنيا والآخرة."
    ]
  },
  {
    id: 5,
    text: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.",
    source: "رواه البخاري ومسلم",
    explanation: "من كمال الإيمان أن تتمنى للآخرين من الخير والنجاح والسعادة ما تتمناه لنفسك، وأن تكره لهم من الشر ما تكرهه لنفسك، مما ينشر المحبة والتآلف في المجتمع.",
    benefits: [
      "الحث على المحبة والتآخي بين المسلمين.",
      "تطهير القلب من الحسد والأنانية.",
      "المجتمع المسلم كالجسد الواحد في تواده وتراحمه."
    ]
  },
  {
    id: 6,
    text: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.",
    source: "رواه البخاري ومسلم",
    explanation: "يرشدنا النبي ﷺ إلى فضل ذكر الله، وخاصة هاتين الكلمتين، لسهولة نطقهما وعظم أجرهما ومحبة الله تعالى لقائلهما.",
    benefits: [
      "فضل الذكر وسهولته على المسلم.",
      "سعة رحمة الله وعظيم فضله بمضاعفة الأجر.",
      "إثبات صفة المحبة لله تعالى."
    ]
  },
  {
    id: 7,
    text: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ.",
    source: "رواه مسلم",
    explanation: "يصحح الحديث بعض المفاهيم الخاطئة؛ فالصدقة تبارك المال ولا تنقصه، والعفو عن الناس يزيد الإنسان كرامة وعزة، والتواضع لله يرفع قدر العبد في الدنيا والآخرة.",
    benefits: [
      "الحث على الإنفاق والصدقة.",
      "فضل العفو والتسامح مع الناس.",
      "أهمية التواضع ونبذ الكبر."
    ]
  },
  {
    id: 8,
    text: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.",
    source: "رواه البخاري ومسلم",
    explanation: "يجمع هذا الحديث بين خصال الخير وأصول الآداب الإسلامية، ويربطها بالإيمان بالله واليوم الآخر، مما يدل على أهميتها في حياة المسلم.",
    benefits: [
      "حفظ اللسان من الكلام السيء.",
      "الإحسان إلى الجار.",
      "إكرام الضيف وحسن استقباله."
    ]
  },
  {
    id: 9,
    text: "لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا، وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ.",
    source: "رواه مسلم",
    explanation: "يحث النبي ﷺ على فعل الخير مهما كان صغيراً، حتى الابتسامة في وجه أخيك المسلم تعتبر صدقة وتؤجر عليها.",
    benefits: [
      "الحث على فعل الخير بجميع أشكاله.",
      "الابتسامة وبشاشة الوجه من الأخلاق الإسلامية.",
      "عدم استصغار أي عمل صالح."
    ]
  },
  {
    id: 10,
    text: "الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ.",
    source: "رواه مسلم",
    explanation: "يبين الحديث أن قوام الدين وعماده هو النصح والإخلاص في كل الأمور، لله ولرسوله ولكتابه وللمسلمين قادة وعامة.",
    benefits: [
      "أهمية النصيحة في الإسلام.",
      "النصيحة تكون لله ولرسوله ولكتابه بالإيمان والعمل.",
      "النصيحة للمسلمين بإرشادهم للخير ومعاونتهم."
    ]
  },
  {
    id: 11,
    text: "مَنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ.",
    source: "رواه الترمذي وابن ماجه",
    explanation: "من كمال إيمان المسلم وحسن إسلامه أن يبتعد عن التدخل في شؤون الآخرين التي لا تخصه، وأن ينشغل بما يفيده في دينه ودنياه.",
    benefits: [
      "الابتعاد عن الفضول والتدخل في شؤون الناس.",
      "حفظ الوقت والجهد فيما ينفع.",
      "راحة البال وسلامة الصدر."
    ]
  },
  {
    id: 12,
    text: "الْبِرُّ حُسْنُ الْخُلُقِ، وَالْإِثْمُ مَا حَاكَ فِي صَدْرِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ.",
    source: "رواه مسلم",
    explanation: "البر والخير كله يكمن في حسن الخلق، والذنب والإثم هو ما يسبب قلقاً في النفس وتكره أن يراه الناس، وهذا ميزان دقيق لمعرفة الخير من الشر.",
    benefits: [
      "أهمية حسن الخلق ومكانته في الإسلام.",
      "الفطرة السليمة تميز بين الخير والشر.",
      "الحياء من الناس من علامات الإيمان."
    ]
  },
  {
    id: 13,
    text: "لَا تَدْخُلُونَ الْجَنَّةَ حَتَّى تُؤْمِنُوا، وَلَا تُؤْمِنُوا حَتَّى تَحَابُّوا، أَوَلَا أَدُلُّكُمْ عَلَى شَيْءٍ إِذَا فَعَلْتُمُوهُ تَحَابَبْتُمْ؟ أَفْشُوا السَّلَامَ بَيْنَكُمْ.",
    source: "رواه مسلم",
    explanation: "يربط الحديث بين دخول الجنة بالإيمان، والإيمان بالمحبة بين المسلمين، ويدل على أن إفشاء السلام هو مفتاح هذه المحبة.",
    benefits: [
      "المحبة بين المسلمين شرط لكمال الإيمان.",
      "إفشاء السلام ينشر المودة والألفة.",
      "أهمية الترابط الاجتماعي في الإسلام."
    ]
  },
  {
    id: 14,
    text: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.",
    source: "رواه الترمذي",
    explanation: "وصية جامعة من النبي ﷺ بتقوى الله في كل مكان وزمان، والمبادرة بالتوبة والعمل الصالح بعد الذنب، والتعامل مع الناس بأخلاق حسنة.",
    benefits: [
      "تقوى الله هي أساس كل خير.",
      "الحسنات يذهبن السيئات.",
      "حسن الخلق من أعظم القربات إلى الله."
    ]
  },
  {
    id: 15,
    text: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا، نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ، وَمَنْ يَسَّرَ عَلَى مُعْسِرٍ، يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالْآخِرَةِ.",
    source: "رواه مسلم",
    explanation: "يحث الحديث على التعاون والتكافل بين المسلمين، ويبشر من يساعد الآخرين ويخفف عنهم بأن الله سيجازيه بالمثل في الدنيا والآخرة.",
    benefits: [
      "فضل تفريج الكربات ومساعدة المحتاجين.",
      "الجزاء من جنس العمل.",
      "أهمية التيسير على المعسرين."
    ]
  }
];

export default function Hadith() {
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

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
      text: `${hadith.text}\n\n${hadith.source}\n\nشرح مبسط:\n${hadith.explanation}\n\nالفوائد المستفادة:\n${hadith.benefits.map(b => `- ${b}`).join('\n')}\n\nعبر تطبيق اليقين`,
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
      className="max-w-md mx-auto p-4 space-y-6 pb-28 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-bl from-emerald-600 via-emerald-700 to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden text-center border border-white/20"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12  animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full -ml-12 -mb-12 "></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] mb-4 transform rotate-3">
             <BookOpen size={32} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-2 drop-shadow-md">
            الحديث اليومي
          </h1>
          <p className="text-emerald-50 text-sm font-bold bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 mt-2">بلغوا عني ولو آية</p>
        </div>
      </motion.div>

      {/* Hadith Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="card-3d bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl border border-black/5 dark:border-white/5">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-20 -mt-20 "></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full -ml-20 -mb-20 "></div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-4xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-white/20 text-white mb-4">
              <BookOpen size={36} className="drop-shadow-sm" />
            </div>

            <p className="text-2xl leading-[2.2] font-serif text-slate-800 dark:text-slate-100 font-bold drop-shadow-sm">
              "{hadith.text}"
            </p>

            <div className="w-full border-t border-slate-100 dark:border-slate-800/50 pt-6 flex flex-col items-center gap-5">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 glass dark:glass-dark px-5 py-2.5 rounded-full shadow-sm">
                {hadith.source}
              </span>

              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mt-2 font-bold glass dark:glass-dark px-5 py-2.5 rounded-full hover:scale-105 active:scale-95"
              >
                <Info size={18} />
                <span>{showExplanation ? "إخفاء الشرح" : "شرح الحديث"}</span>
              </button>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden w-full"
                  >
                    <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800/50 dark:to-emerald-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 mt-2 text-right space-y-5 shadow-inner">
                      <div>
                        <h4 className="text-emerald-600 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2 text-lg">
                          <Info size={20} />
                          المعنى:
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-loose text-[15px] font-medium">
                          {hadith.explanation}
                        </p>
                      </div>
                      
                      <div className="border-t border-emerald-100/50 dark:border-emerald-900/30 pt-5">
                        <h4 className="text-amber-500 font-bold mb-4 flex items-center gap-2 text-lg">
                          <Star size={20} />
                          الفوائد المستفادة:
                        </h4>
                        <ul className="space-y-3">
                          {hadith.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 size={16} />
                              </div>
                              <span className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed font-medium">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-6 py-3 rounded-full transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] mt-2 font-bold w-full justify-center"
              >
                <Share2 size={20} />
                <span>مشاركة الحديث و كسب أجر</span>
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
            className="fixed bottom-28 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50 font-bold text-sm whitespace-nowrap flex items-center gap-3 border border-slate-800"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            تم نسخ الحديث للمشاركة 
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Share2, Copy, Sparkles, RefreshCw, Send, CheckCircle, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

const DAWAH_CONTENT = [
  {
    type: 'whatsapp',
    title: 'رسالة واتساب',
    icon: <Send size={20} />,
    color: 'bg-emerald-500',
    templates: [
      "مِن سُنن النبي ﷺ المهجورة: صلاة الضحى.. صلاة الأوابين. ركعتين فقط تكفيك صدقة عن كل مفاصل جسمك 🤍✨",
      "هل استغفرت اليوم؟ 🪴\nاستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه.",
      "تذكير 💡\nقال ﷺ: «من قرأ حرفاً من كتاب الله فله به حسنة، والحسنة بعشر أمثالها».",
      "لا تدري أي حسنة تدخلك الجنة! \nسبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر. 🌿",
      "رسالة لك 💌\n(وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى) اطمئن، الله يدبر لك ما فيه الخير."
    ]
  },
  {
    type: 'instagram',
    title: 'ستوري إنستجرام',
    icon: <Smartphone size={20} />,
    color: 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-500',
    templates: [
      "🌱\n\nنصيبك من محبة الله، \nعلى قدر ذكرك له.\n\nاذكر الله يذكرك ✨",
      "🤍\n\nوَلَا تَحْزَنْ ۖ إِنَّا مُنَجُّوكَ\n\nرسالة اطمئنان لقلبك اليوم.",
      "✨\n\nإذا ضاقت بك الدنيا، \nفاسأل الله من فضله، \nتُفتح لك أبواب الرحمة.",
      "🪴\n\nصَلاةٌ واحدةٌ على النَّبيِّ ﷺ \nتَرفعُ دَرجاتِكَ وتَحطُّ خَطاياكَ.\n\nاللهم صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
      "🕊\n\nأحسن الظن بالله.. \nفإن الدُعاء يغير القضاء."
    ]
  }
];

export default function DawahGenerator({ onBack }: { onBack: () => void }) {
  const [activeType, setActiveType] = useState(DAWAH_CONTENT[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentText = activeType.templates[currentIndex];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'رسالة دعوية',
          text: currentText,
        });
        toast.success("تمت المشاركة بنجاح");
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    toast.success("تم النسخ بنجاح");
  };

  const nextTemplate = () => {
    setCurrentIndex((prev) => (prev + 1) % activeType.templates.length);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 bg-[#0A1914] text-white rounded-b-[2.5rem] shadow-xl shrink-0 border-b border-emerald-900/30 relative overflow-hidden">
         <div 
           className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none" 
           style={{ backgroundImage: 'url("/src/assets/images/names_allah_background_1779805712797.png")' }}
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
               <h1 className="text-2xl font-bold font-serif">منبر دعوي</h1>
               <p className="text-emerald-200/80 text-sm mt-1">«بلّغوا عنّي ولو آية»</p>
             </div>
           </div>
           <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
             <Sparkles size={24} className="text-emerald-400" />
           </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32">
         {/* Tabs */}
         <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
            {DAWAH_CONTENT.map((type) => (
              <button
                 key={type.type}
                 onClick={() => {
                   setActiveType(type);
                   setCurrentIndex(0);
                 }}
                 className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                   activeType.type === type.type 
                     ? `${type.color} text-white shadow-md` 
                     : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                 }`}
              >
                 {type.icon}
                 {type.title}
              </button>
            ))}
         </div>

         {/* Content Card */}
         <AnimatePresence mode="wait">
            <motion.div
               key={activeType.type + currentIndex}
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 1.05, y: -10 }}
               className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative min-h-[300px] flex flex-col justify-center items-center text-center group"
            >
               {/* Decorative commas */}
               <div className="absolute top-6 right-6 text-6xl text-slate-100 dark:text-slate-800 font-serif leading-none opacity-50 select-none">"</div>
               <div className="absolute bottom-12 left-6 text-6xl text-slate-100 dark:text-slate-800 font-serif leading-none opacity-50 select-none">"</div>

               <p className="text-xl md:text-2xl font-medium leading-loose text-slate-700 dark:text-slate-200 whitespace-pre-wrap relative z-10 font-serif">
                 {currentText}
               </p>
            </motion.div>
         </AnimatePresence>

         <div className="flex justify-center mt-6">
            <button
               onClick={nextTemplate}
               className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
            >
               <RefreshCw size={18} />
               توليد رسالة أخرى
            </button>
         </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 z-40 flex gap-3">
         <button
            onClick={handleCopy}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
         >
            <Copy size={20} />
            نسخ النص
         </button>
         <button
            onClick={handleShare}
            className={`flex-[2] py-4 rounded-2xl font-bold text-white ${activeType.color} hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2`}
         >
            <Share2 size={20} />
            مشاركة 
         </button>
      </div>
    </div>
  );
}

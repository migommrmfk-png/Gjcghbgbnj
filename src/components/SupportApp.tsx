import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Copy, Phone, CheckCircle, Share2, ArrowRight, Gift, HandHeart } from 'lucide-react';

const THANK_YOU_MESSAGES = [
  "جزاك الله خيرًا على دعمك لتطبيق \"هذا ديني\". دعمك يساعدنا على الاستمرار في تطوير التطبيق.",
  "شكراً لك، بدعمك نستطيع إضافة ميزات جديدة لخدمة المسلمين حول العالم.",
  "نسأل الله أن يجعل دعمك هذا في ميزان حسناتك."
];

const ENCOURAGEMENT_TEXTS = [
  "إذا أعجبك التطبيق يمكنك دعمه حتى نستمر في تطويره.",
  "بدعمك يمكننا تحسين التطبيق وإضافة ميزات جديدة.",
  "التبرع اختياري بالكامل لكنه يساعدنا على الاستمرار.",
  "حتى دعم بسيط يمكن أن يساعد في تطوير التطبيق."
];

export default function SupportApp({ onBack }: { onBack?: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  
  // Pick a random encouragement text on load
  const [encouragement] = useState(() => ENCOURAGEMENT_TEXTS[Math.floor(Math.random() * ENCOURAGEMENT_TEXTS.length)]);

  const vFashNumber = "01093726416";

  const handleCopy = () => {
    navigator.clipboard.writeText(vFashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = () => {
    window.open(`tel:${vFashNumber}`, '_self');
  };

  const handleDonated = () => {
    const randomMessage = THANK_YOU_MESSAGES[Math.floor(Math.random() * THANK_YOU_MESSAGES.length)];
    setThankYouMessage(randomMessage);
    setShowThankYou(true);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 5000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق هذا ديني',
          text: 'ساهم في نشر الخير بدعم تطبيق "هذا ديني". تطبيق إسلامي شامل خالي من الإعلانات المزعجة.',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback copy link
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-950/90 backdrop-blur-md shadow-sm z-20 px-4 py-3 flex items-center border-b-2 border-amber-500/30">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-amber-500/10 rounded-full transition-colors ml-2"
          >
            <ArrowRight size={24} className="text-slate-800 dark:text-slate-100" />
          </button>
        )}
        <h1 className="text-xl font-bold font-serif text-emerald-600 flex-1 text-center pr-8">
          ادعم التطبيق
        </h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden text-center"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-2 border-amber-500/50 shadow-inner">
              <HandHeart size={40} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold font-serif mb-3 text-amber-400">
              ادعم تطبيق "هذا ديني"
            </h2>
            <p className="text-slate-800 dark:text-slate-100/90 text-sm leading-relaxed font-medium">
              هذا التطبيق صُمم لخدمة المسلمين ومساعدتهم في حياتهم اليومية من خلال القرآن الكريم والأذكار ومواقيت الصلاة.
            </p>
          </div>
        </motion.div>

        {/* Description & Encouragement */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-black/5 dark:border-white/5 text-center"
        >
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-3">
            إذا أعجبك التطبيق وساعدك في حياتك اليومية يمكنك دعم تطويره حتى نستمر في إضافة ميزات جديدة وتحسين التجربة للجميع.
          </p>
          <div className="inline-block bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full text-xs font-bold">
            {encouragement}
          </div>
        </motion.div>

        {/* Donation Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card-3d bg-white dark:bg-slate-900 p-6 relative overflow-hidden border-2 border-amber-500/20"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
          
          <div className="text-center mb-6 relative z-10">
            <span className="inline-block bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-red-100">
              فودافون كاش (Vodafone Cash)
            </span>
            <div className="text-3xl font-bold tracking-wider text-slate-800 dark:text-slate-100 font-mono bg-gray-50 dark:bg-black/20 py-3 rounded-xl border border-gray-200 dark:border-white/10 shadow-inner">
              {vFashNumber}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 relative z-10">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-black/40 active:bg-gray-200 dark:active:bg-black/60 text-slate-500 dark:text-slate-400 p-3 rounded-xl transition-colors border border-gray-200 dark:border-white/10"
            >
              {copied ? <CheckCircle size={24} className="text-green-500" /> : <Copy size={24} className="text-emerald-500" />}
              <span className="text-xs font-bold">{copied ? 'تم النسخ' : 'نسخ الرقم'}</span>
            </button>
            
            <button
              onClick={handleCall}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-black/40 active:bg-gray-200 dark:active:bg-black/60 text-slate-500 dark:text-slate-400 p-3 rounded-xl transition-colors border border-gray-200 dark:border-white/10"
            >
              <Phone size={24} className="text-emerald-500" />
              <span className="text-xs font-bold">فتح الاتصال</span>
            </button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <button
            onClick={handleDonated}
            className="w-full btn-3d-primary py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
          >
            <Heart size={24} className="text-amber-400 fill-amber-400" />
            تم التبرع، شكراً لكم
          </button>

          <button
            onClick={handleShare}
            className="w-full bg-white dark:bg-slate-900 hover:bg-black/5 dark:hover:bg-white/5 text-emerald-500 border-2 border-emerald-500/20 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Share2 size={20} />
            مشاركة التطبيق
          </button>
        </motion.div>
      </div>

      {/* Thank You Modal */}
      <AnimatePresence>
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowThankYou(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative overflow-hidden border border-black/5 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-emerald-500"></div>
              
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-100 dark:border-green-800/30">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif mb-3">
                جزاك الله خيراً
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-6">
                {thankYouMessage}
              </p>
              
              <button
                onClick={() => setShowThankYou(false)}
                className="w-full py-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100 rounded-xl font-bold transition-colors"
              >
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg z-50 font-bold text-sm whitespace-nowrap"
          >
            تم نسخ رابط التطبيق للمشاركة
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

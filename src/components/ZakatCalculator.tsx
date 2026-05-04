import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calculator, Coins, CircleDollarSign, Info } from 'lucide-react';

export default function ZakatCalculator({ onBack }: { onBack?: () => void }) {
  const [cash, setCash] = useState<string>('');
  const [gold, setGold] = useState<string>(''); // in grams
  const [silver, setSilver] = useState<string>(''); // in grams
  
  // Approximate prices in local currency (e.g., USD or SAR)
  const goldPricePerGram = 65; 
  const silverPricePerGram = 0.8;
  
  // Nisab thresholds
  const nisabGold = 85 * goldPricePerGram;
  const nisabSilver = 595 * silverPricePerGram;
  
  const calculateZakat = () => {
    const cashValue = parseFloat(cash) || 0;
    const goldValue = (parseFloat(gold) || 0) * goldPricePerGram;
    const silverValue = (parseFloat(silver) || 0) * silverPricePerGram;
    
    const totalWealth = cashValue + goldValue + silverValue;
    
    // Using the lower Nisab (Silver) is safer and more beneficial to the poor
    if (totalWealth >= nisabSilver) {
      return totalWealth * 0.025; // 2.5%
    }
    return 0;
  };

  const totalZakat = calculateZakat();

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <ArrowRight size={24} className="text-slate-500 hover:text-emerald-500" />
          </button>
        )}
        <h1 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100">
          حاسبة الزكاة
        </h1>
      </div>

      <div className="space-y-6 mt-2">
        {/* Info Banner */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-emerald-500/10 rounded-[2rem] p-6 border border-emerald-500/20 flex items-start gap-4 shadow-inner"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30 shadow-inner">
            <Info size={24} />
          </div>
          <div>
            <h3 className="font-bold text-emerald-400 mb-2 text-lg">نصاب الزكاة الحالي</h3>
            <p className="text-sm text-emerald-500/80 leading-relaxed font-medium">
              تجب الزكاة (2.5%) إذا بلغ المال النصاب وحال عليه الحول.
              <br/>
              <span className="text-slate-800 dark:text-slate-100">نصاب الذهب:</span> 85 جرام
              <br/>
              <span className="text-slate-800 dark:text-slate-100">نصاب الفضة:</span> 595 جرام
            </p>
          </div>
        </motion.div>

        {/* Calculator Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5"
        >
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <CircleDollarSign size={18} className="text-emerald-400" />
              الأموال النقدية والمدخرات
            </label>
            <input
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="أدخل المبلغ..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Coins size={18} className="text-emerald-500" />
              الذهب (بالجرام)
            </label>
            <input
              type="number"
              value={gold}
              onChange={(e) => setGold(e.target.value)}
              placeholder="وزن الذهب عيار 24..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Coins size={18} className="text-slate-400" />
              الفضة (بالجرام)
            </label>
            <input
              type="number"
              value={silver}
              onChange={(e) => setSilver(e.target.value)}
              placeholder="وزن الفضة..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 transition-all shadow-sm"
            />
          </div>
        </motion.div>

        {/* Result Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-500 rounded-[2rem] p-8 text-white shadow-sm text-center relative overflow-hidden border border-emerald-600"
        >
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/20 rounded-full -mr-10 -mt-10 "></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
          
          <h3 className="text-lg font-bold mb-3 relative z-10 drop-shadow-sm">مقدار الزكاة الواجب إخراجها</h3>
          <div className="text-5xl font-bold font-serif text-white mb-3 relative z-10 drop-shadow-md">
            {totalZakat.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <p className="text-white/80 text-sm font-bold relative z-10 bg-black/10 inline-block px-4 py-2 rounded-xl backdrop-blur-sm border border-black/10">
            {totalZakat > 0 ? 'تقبل الله طاعتكم وزادكم من فضله' : 'لم يبلغ المال النصاب بعد'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

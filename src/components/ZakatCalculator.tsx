import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calculator, Coins, CircleDollarSign, Info } from 'lucide-react';

export default function ZakatCalculator({ onBack }: { onBack: () => void }) {
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
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-white/5">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)]"
        >
          <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-white" />
        </button>
        <h1 className="text-xl font-bold font-serif text-white drop-shadow-md">
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
              <span className="text-white">نصاب الذهب:</span> 85 جرام
              <br/>
              <span className="text-white">نصاب الفضة:</span> 595 جرام
            </p>
          </div>
        </motion.div>

        {/* Calculator Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card-3d bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-lg border border-white/5 space-y-5"
        >
          <div>
            <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CircleDollarSign size={18} className="text-emerald-400" />
              الأموال النقدية والمدخرات
            </label>
            <input
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="أدخل المبلغ..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Coins size={18} className="text-[var(--color-primary)]" />
              الذهب (بالجرام)
            </label>
            <input
              type="number"
              value={gold}
              onChange={(e) => setGold(e.target.value)}
              placeholder="وزن الذهب عيار 24..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Coins size={18} className="text-slate-400" />
              الفضة (بالجرام)
            </label>
            <input
              type="number"
              value={silver}
              onChange={(e) => setSilver(e.target.value)}
              placeholder="وزن الفضة..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-slate-400/50 transition-all shadow-inner"
            />
          </div>
        </motion.div>

        {/* Result Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-[2rem] p-8 text-black shadow-2xl text-center relative overflow-hidden border border-[var(--color-primary)]/30"
        >
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
          
          <h3 className="text-lg font-bold mb-3 relative z-10 drop-shadow-sm">مقدار الزكاة الواجب إخراجها</h3>
          <div className="text-5xl font-bold font-serif text-black mb-3 relative z-10 drop-shadow-md">
            {totalZakat.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <p className="text-black/80 text-sm font-bold relative z-10 bg-black/10 inline-block px-4 py-2 rounded-xl backdrop-blur-sm border border-black/10">
            {totalZakat > 0 ? 'تقبل الله طاعتكم وزادكم من فضله' : 'لم يبلغ المال النصاب بعد'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

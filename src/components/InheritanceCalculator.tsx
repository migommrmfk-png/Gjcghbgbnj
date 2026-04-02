import React, { useState } from 'react';
import { Calculator, ArrowRight, Info, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export default function InheritanceCalculator({ onBack }: { onBack?: () => void }) {
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [spouseCount, setSpouseCount] = useState(0);
  const [sons, setSons] = useState(0);
  const [daughters, setDaughters] = useState(0);
  const [father, setFather] = useState(false);
  const [mother, setMother] = useState(false);
  const [totalWealth, setTotalWealth] = useState<number | ''>('');
  
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    let shares = [];
    let remaining = 1.0;
    let hasChildren = sons > 0 || daughters > 0;

    if (spouseCount > 0) {
      let spouseShare = 0;
      if (deceasedGender === 'male') {
        spouseShare = hasChildren ? 1/8 : 1/4;
        shares.push({ name: spouseCount > 1 ? 'الزوجات' : 'الزوجة', share: spouseShare, fraction: hasChildren ? '1/8' : '1/4' });
      } else {
        spouseShare = hasChildren ? 1/4 : 1/2;
        shares.push({ name: 'الزوج', share: spouseShare, fraction: hasChildren ? '1/4' : '1/2' });
      }
      remaining -= spouseShare;
    }

    if (father) {
      let fatherShare = hasChildren ? 1/6 : (sons === 0 && daughters === 0 ? 0 : 1/6);
      shares.push({ name: 'الأب', share: fatherShare, fraction: '1/6' + (sons === 0 ? ' + الباقي تعصيباً' : '') });
      remaining -= fatherShare;
    }
    if (mother) {
      let motherShare = hasChildren ? 1/6 : 1/3;
      shares.push({ name: 'الأم', share: motherShare, fraction: hasChildren ? '1/6' : '1/3' });
      remaining -= motherShare;
    }

    if (hasChildren) {
      if (sons > 0) {
        let totalParts = (sons * 2) + daughters;
        let partValue = remaining / totalParts;
        if (sons > 0) shares.push({ name: 'الأبناء (للذكر مثل حظ الأنثيين)', share: partValue * 2 * sons, fraction: 'الباقي تعصيباً' });
        if (daughters > 0) shares.push({ name: 'البنات', share: partValue * daughters, fraction: 'الباقي تعصيباً' });
      } else if (daughters > 0) {
        let daughterShare = daughters === 1 ? 1/2 : 2/3;
        daughterShare = Math.min(daughterShare, remaining);
        shares.push({ name: daughters === 1 ? 'البنت' : 'البنات', share: daughterShare, fraction: daughters === 1 ? '1/2' : '2/3' });
      }
    }

    setResults(shares);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden" dir="rtl">
      <div className="pt-12 pb-6 px-6 bg-gradient-to-b from-emerald-600 to-emerald-800 text-white rounded-b-[2.5rem] shadow-lg shrink-0 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="relative z-10 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all">
              <ArrowRight size={24} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold font-serif">حاسبة المواريث</h1>
            <p className="text-white/80 text-sm">حساب المواريث الشرعية (نسخة مبسطة)</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">
        <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] flex items-start gap-3 shadow-sm">
          <Info className="text-emerald-600 shrink-0 mt-1" size={20} />
          <p className="text-sm leading-relaxed opacity-80">
            هذه الحاسبة تقدم تقديراً مبسطاً للحالات الشائعة. في الحالات المعقدة يجب الرجوع إلى المحاكم الشرعية أو المتخصصين.
          </p>
        </div>

        <div className="space-y-4 bg-[var(--color-surface)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
          <div>
            <label className="block text-sm font-bold mb-2">جنس المتوفى</label>
            <div className="flex gap-4">
              <button onClick={() => {setDeceasedGender('male'); setSpouseCount(0);}} className={`flex-1 py-2 rounded-xl border ${deceasedGender === 'male' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-[var(--color-border)]'}`}>ذكر</button>
              <button onClick={() => {setDeceasedGender('female'); setSpouseCount(0);}} className={`flex-1 py-2 rounded-xl border ${deceasedGender === 'female' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-[var(--color-border)]'}`}>أنثى</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">{deceasedGender === 'male' ? 'الزوجات (0-4)' : 'الزوج (0-1)'}</label>
            <input type="number" min="0" max={deceasedGender === 'male' ? 4 : 1} value={spouseCount} onChange={(e) => setSpouseCount(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-2">الأبناء (ذكور)</label>
              <input type="number" min="0" value={sons} onChange={(e) => setSons(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-2">البنات (إناث)</label>
              <input type="number" min="0" value={daughters} onChange={(e) => setDaughters(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]" />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 flex-1 p-3 border border-[var(--color-border)] rounded-xl cursor-pointer">
              <input type="checkbox" checked={father} onChange={(e) => setFather(e.target.checked)} className="w-5 h-5 accent-emerald-600" />
              <span>الأب حي</span>
            </label>
            <label className="flex items-center gap-2 flex-1 p-3 border border-[var(--color-border)] rounded-xl cursor-pointer">
              <input type="checkbox" checked={mother} onChange={(e) => setMother(e.target.checked)} className="w-5 h-5 accent-emerald-600" />
              <span>الأم حية</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">التركة (اختياري)</label>
            <div className="relative">
              <input type="number" value={totalWealth} onChange={(e) => setTotalWealth(parseFloat(e.target.value) || '')} className="w-full p-3 pl-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]" placeholder="المبلغ..." />
              <DollarSign className="absolute left-3 top-3 opacity-50" size={20} />
            </div>
          </div>

          <button onClick={calculate} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
            <Calculator size={20} />
            احسب الميراث
          </button>
        </div>

        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] space-y-4">
            <h3 className="font-bold text-lg border-b border-[var(--color-border)] pb-2">النتيجة التقريبية</h3>
            {results.map((res: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-[var(--color-bg)] rounded-xl">
                <div>
                  <div className="font-bold">{res.name}</div>
                  <div className="text-sm opacity-70">النصيب الشرعي: {res.fraction}</div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-emerald-600">{(res.share * 100).toFixed(1)}%</div>
                  {totalWealth !== '' && (
                    <div className="text-sm font-bold">{(res.share * (totalWealth as number)).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

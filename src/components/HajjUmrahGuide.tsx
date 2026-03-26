import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Map, Navigation, CheckCircle2, Info } from 'lucide-react';

export default function HajjUmrahGuide({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'umrah' | 'hajj'>('umrah');

  const umrahSteps = [
    { id: 1, title: 'الإحرام', desc: 'الاغتسال والتطيب ولبس ملابس الإحرام، ثم النية والتلبية: "لبيك اللهم عمرة".' },
    { id: 2, title: 'الطواف', desc: 'الطواف حول الكعبة 7 أشواط بدءاً من الحجر الأسود، مع الدعاء والذكر.' },
    { id: 3, title: 'السعي', desc: 'السعي بين الصفا والمروة 7 أشواط، يبدأ بالصفا وينتهي بالمروة.' },
    { id: 4, title: 'الحلق أو التقصير', desc: 'حلق شعر الرأس أو تقصيره للرجل، وتقصيره للمرأة قدر أنملة، وبذلك تنتهي العمرة.' },
  ];

  const hajjSteps = [
    { id: 1, day: 'اليوم الثامن', title: 'يوم التروية', desc: 'الإحرام والتوجه إلى منى والمبيت بها.' },
    { id: 2, day: 'اليوم التاسع', title: 'يوم عرفة', desc: 'الوقوف بعرفة والدعاء حتى غروب الشمس، ثم النفرة إلى مزدلفة والمبيت بها.' },
    { id: 3, day: 'اليوم العاشر', title: 'يوم النحر', desc: 'رمي جمرة العقبة الكبرى، النحر، الحلق أو التقصير، وطواف الإفاضة.' },
    { id: 4, day: 'اليوم الحادي عشر', title: 'أيام التشريق', desc: 'المبيت بمنى ورمي الجمرات الثلاث (الصغرى، الوسطى، الكبرى).' },
    { id: 5, day: 'اليوم الأخير', title: 'طواف الوداع', desc: 'الطواف حول الكعبة قبل مغادرة مكة المكرمة.' },
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex flex-col gap-4 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowRight size={24} className="text-[var(--color-primary)]" />
          </button>
          <h1 className="text-xl font-bold font-serif text-[var(--color-text)] drop-shadow-md">
            دليل الحج والعمرة
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/5 dark:bg-white/5 rounded-2xl p-1 shadow-inner border border-black/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab('umrah')}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'umrah' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Navigation size={16} />
            مناسك العمرة
          </button>
          <button
            onClick={() => setActiveTab('hajj')}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'hajj' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Map size={16} />
            مناسك الحج
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-6">
        {activeTab === 'umrah' && (
          <motion.div
            key="umrah"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-primary)] before:to-transparent"
          >
            {umrahSteps.map((step, index) => (
              <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--color-bg)] bg-[var(--color-primary)] text-[var(--color-bg)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg shadow-[var(--color-primary)]/20 font-bold z-10">
                  {step.id}
                </div>
                
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl card-3d border border-white/5 shadow-lg hover:shadow-[var(--color-primary)]/10 transition-shadow">
                  <h4 className="font-bold text-[var(--color-primary-light)] mb-2">{step.title}</h4>
                  <p className="text-sm text-white/70 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'hajj' && (
          <motion.div
            key="hajj"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-primary)] before:to-transparent"
          >
            {hajjSteps.map((step, index) => (
              <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--color-bg)] bg-[var(--color-primary)] text-[var(--color-bg)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg shadow-[var(--color-primary)]/20 font-bold z-10">
                  {step.id}
                </div>
                
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl card-3d border border-white/5 shadow-lg hover:shadow-[var(--color-primary)]/10 transition-shadow">
                  <div className="text-xs font-bold text-[var(--color-primary-light)] bg-[var(--color-primary)]/10 px-2 py-1 rounded-lg inline-block mb-2 border border-[var(--color-primary)]/20">
                    {step.day}
                  </div>
                  <h4 className="font-bold text-[var(--color-primary-light)] mb-2">{step.title}</h4>
                  <p className="text-sm text-white/70 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

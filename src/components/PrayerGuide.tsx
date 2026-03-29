import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function PrayerGuide({ onBack }: { onBack: () => void }) {
  const steps = [
    {
      title: "النية وتكبيرة الإحرام",
      description: "النية محلها القلب، تنوي الصلاة التي تريد أداءها لله تعالى. ثم ترفع يديك حذو منكبيك أو أذنيك وتقول: الله أكبر.",
      dua: "اللَّهُ أَكْبَرُ"
    },
    {
      title: "دعاء الاستفتاح",
      description: "سنة مستحبة، تقرأه سراً بعد تكبيرة الإحرام وقبل الفاتحة.",
      dua: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ."
    },
    {
      title: "قراءة الفاتحة وما تيسر من القرآن",
      description: "تستعيذ بالله من الشيطان الرجيم، وتسمي، ثم تقرأ سورة الفاتحة (وهي ركن لا تصح الصلاة إلا بها)، وبعدها تقرأ ما تيسر من القرآن في الركعتين الأوليين.",
      dua: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ * الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ..."
    },
    {
      title: "الركوع",
      description: "تكبر وتركع وتضع يديك على ركبتيك وتطمئن في ركوعك بحيث يستوي ظهرك.",
      dua: "سُبْحَانَ رَبِّيَ الْعَظِيمِ (ثلاث مرات أو أكثر)"
    },
    {
      title: "الرفع من الركوع",
      description: "ترفع رأسك من الركوع وتقول: سمع الله لمن حمده (للإمام والمنفرد)، وعندما تستوي قائماً تقول: ربنا ولك الحمد.",
      dua: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ... رَبَّنَا وَلَكَ الْحَمْدُ حَمْداً كَثِيراً طَيِّباً مُبَارَكاً فِيهِ"
    },
    {
      title: "السجود الأول",
      description: "تكبر وتسجد على الأعضاء السبعة (الجبهة مع الأنف، اليدين، الركبتين، أطراف القدمين) وتطمئن.",
      dua: "سُبْحَانَ رَبِّيَ الْأَعْلَى (ثلاث مرات أو أكثر)"
    },
    {
      title: "الجلوس بين السجدتين",
      description: "ترفع رأسك مكبراً وتجلس مطمئناً مفترشاً رجلك اليسرى وناصباً اليمنى.",
      dua: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي، وَارْحَمْنِي وَاجْبُرْنِي وَارْزُقْنِي وَاهْدِنِي"
    },
    {
      title: "السجود الثاني",
      description: "تكبر وتسجد السجدة الثانية وتفعل كما فعلت في الأولى.",
      dua: "سُبْحَانَ رَبِّيَ الْأَعْلَى (ثلاث مرات)"
    },
    {
      title: "التشهد الأول (في الصلاة الرباعية والثلاثية)",
      description: "تجلس بعد الركعة الثانية وتقرأ التحيات فقط.",
      dua: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ."
    },
    {
      title: "التشهد الأخير والصلاة الإبراهيمية",
      description: "في آخر ركعة من الصلاة، تجلس وتقرأ التحيات كاملة مع الصلاة الإبراهيمية، وتستعيذ من أربع.",
      dua: "التَّحِيَّاتُ لِلَّهِ... (إلى قوله: وَرَسُولُهُ). اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ."
    },
    {
      title: "التسليم",
      description: "تلتفت يميناً وتقول: السلام عليكم ورحمة الله، ثم تلتفت يساراً وتقول: السلام عليكم ورحمة الله.",
      dua: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ"
    }
  ];

  const conditions = [
    "الإسلام والعقل والتمييز.",
    "دخول وقت الصلاة.",
    "الطهارة من الحدثين (الأصغر والأكبر) بالوضوء أو الغسل.",
    "طهارة البدن والثوب والمكان من النجاسة.",
    "ستر العورة (للرجل من السرة للركبة، وللمرأة كل جسدها عدا الوجه والكفين).",
    "استقبال القبلة."
  ];

  const invalidators = [
    "الأكل والشرب عمداً.",
    "الكلام العمد بغير جنس الصلاة.",
    "الضحك بصوت (القهقهة).",
    "انتقاض الوضوء (خروج ريح، بول، إلخ).",
    "كشف العورة عمداً.",
    "الانحراف الكثير عن القبلة بالبدن.",
    "الحركة الكثيرة المتوالية لغير حاجة.",
    "ترك ركن من أركان الصلاة عمداً (كالركوع أو السجود)."
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-4 -mx-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
        >
          <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" />
        </button>
        <h1 className="text-xl font-bold font-serif text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          الدليل الشامل للصلاة
        </h1>
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-3xl p-6 text-[var(--color-text)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden mb-6 border border-black/5 dark:border-white/5"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-primary)]/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 dark:bg-black/40 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold font-serif mb-2 flex items-center gap-2 text-[var(--color-primary-light)] drop-shadow-md">
            <BookOpen size={24} className="text-[var(--color-primary)]" />
            كيفية الصلاة الصحيحة
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed font-bold">
            الصلاة عماد الدين، وهي أول ما يُسأل عنه العبد يوم القيامة. هذا الدليل المفصل يشرح لك كيفية أدائها، شروط صحتها، ومبطلاتها.
          </p>
        </div>
      </motion.div>

      {/* Conditions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-[var(--color-primary-light)] mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-500" />
          شروط صحة الصلاة (قبل البدء)
        </h3>
        <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-black/5 dark:border-white/5 shadow-lg space-y-3">
          {conditions.map((condition, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
              <p className="text-[var(--color-text)] text-sm leading-relaxed">{condition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <h3 className="text-xl font-bold text-[var(--color-primary-light)] mb-4 flex items-center gap-2">
        <Clock size={20} className="text-[var(--color-primary)]" />
        خطوات أداء الصلاة
      </h3>
      <div className="space-y-6 mb-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-primary)]/30 before:to-transparent">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--color-bg)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-bold shadow-[0_0_10px_rgba(212,175,55,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {index + 1}
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[var(--color-surface)] p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/5 relative">
              <h3 className="font-bold text-[var(--color-primary-light)] text-lg mb-2 font-serif drop-shadow-md">
                {step.title}
              </h3>
              <p className="text-[var(--color-text)] text-sm leading-relaxed mb-3">
                {step.description}
              </p>
              {step.dua && (
                <div className="bg-black/5 dark:bg-black/30 p-4 rounded-xl border border-black/5 dark:border-white/5">
                  <p className="text-[var(--color-primary)] text-sm font-bold leading-loose text-center">
                    "{step.dua}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Invalidators */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <XCircle size={20} className="text-red-500" />
          مبطلات الصلاة (متى لا تصح؟)
        </h3>
        <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 border border-red-200 dark:border-red-500/20 shadow-lg space-y-3">
          {invalidators.map((inv, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
              <p className="text-red-900 dark:text-red-100/80 text-sm leading-relaxed">{inv}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

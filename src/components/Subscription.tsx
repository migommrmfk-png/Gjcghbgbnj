import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Crown, CheckCircle, Send, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function Subscription({ onBack }: { onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';
  const { userData } = useAuth();
  
  const currentPlan = userData?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: 'الباقة الأساسية',
      price: 'مجاناً',
      features: [
        'تصفح القرآن الكريم',
        'أوقات الصلاة والأذان',
        'أذكار الصباح والمساء',
        'المسابقات الإسلامية (أسئلة محدودة)',
      ],
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
      borderColor: 'border-slate-200 dark:border-slate-700',
      iconColor: 'text-slate-500',
    },
    {
      id: 'plus',
      name: 'باقة Plus',
      price: '50 ج.م / شهرياً',
      features: [
        'جميع مميزات الباقة المجانية',
        'تفسير الأحلام بالذكاء الاصطناعي (محدود)',
        'المستشار الإسلامي الذكي (محدود)',
        'الخطة الذكية للقرآن والعبادات',
        'تجربة خالية من الإعلانات',
      ],
      color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'pro',
      name: 'باقة Pro',
      price: '100 ج.م / شهرياً',
      features: [
        'جميع مميزات الباقة المتقدمة',
        'ذكاء اصطناعي غير محدود (تفسير ومستشار)',
        'أولوية في التحديثات والدعم الفني',
        'شارات حصرية في مجتمع التطبيق',
        'ميزات إضافية قريباً...',
      ],
      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200',
      borderColor: 'border-amber-200 dark:border-amber-700',
      iconColor: 'text-amber-500',
    }
  ];

  const handleWhatsApp = () => {
    const text = encodeURIComponent('السلام عليكم، أود الاشتراك في التطبيق. ما هي الخطوات؟');
    window.open(`https://wa.me/201062082229?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-24 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-emerald-600 text-white rounded-b-[2rem] pt-12 pb-8 px-6 shadow-md relative overflow-hidden">
        <button
          onClick={onBack}
          className={`absolute top-10 ${isRTL ? 'right-6' : 'left-6'} p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors`}
        >
          <ChevronRight size={24} className={isRTL ? '' : 'rotate-180'} />
        </button>
        <div className="text-center mt-6 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Crown size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold font-serif mb-2">الباقات والاشتراكات</h1>
          <p className="text-emerald-100/90 text-sm">ارتقِ بتجربتك مع باقاتنا المتميزة واستفد من الذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 relative z-20 space-y-6">
        
        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-[1.5rem] p-5 shadow-lg border-2 ${plan.color} ${plan.borderColor} ${currentPlan === plan.id ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 border-none relative overflow-hidden' : ''}`}
            >
              {currentPlan === plan.id && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                  باقتك الحالية
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="font-bold text-xl mt-1">{plan.price}</p>
                </div>
                {currentPlan === plan.id && (
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                )}
              </div>

              <ul className="space-y-2 mt-4 border-t border-black/10 dark:border-white/10 pt-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-medium">
                    <CheckCircle size={16} className={`shrink-0 mt-0.5 ${plan.iconColor}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Subscription Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
              <Send size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">كيفية الاشتراك؟</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">فعل عبر الإيميل</p>
            </div>
          </div>
          
          <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            <li>قم بتحويل قيمة الباقة المطلوبة على فودافون كاش أو إنستاباي على الرقم: <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded ml-1">01062082229</span></li>
            <li>أرسل صورة إشعار التحويل مع <strong className="text-emerald-600 dark:text-emerald-400">البريد الإلكتروني</strong> الخاص بحسابك عبر الواتساب.</li>
            <li>سيتم تفعيل الباقة لحسابك المسجل بهذا البريد الإلكتروني خلال ساعات.</li>
          </ol>

          <button
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white p-4 rounded-xl font-bold shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            تواصل معنا عبر واتساب
          </button>
        </motion.div>
      </div>
    </div>
  );
}


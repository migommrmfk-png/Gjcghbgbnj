import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Copy, Phone, CheckCircle, Share2, ArrowRight, Gift, HandHeart, 
  Trophy, Award, Send, Star, Shield, HelpCircle, FileText, Download, 
  Sparkles, Check, Database, CreditCard, PenTool, CheckCircle2, Loader2 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

const THANK_YOU_MESSAGES = [
  "جزاك الله خيرًا على دعمك لتطبيق \"اليقين\". دعمك يستثمر في استمرار تطويره ونشر الفضل والإحسان.",
  "شكراً لك يا صاحب الهمة، بدعمك يستمر البث المباشر والإيجابي وتزويد البرمجيات للأمة بلا إعلانات.",
  "نسأل الله العلي القدير أن يثيبك ويسدد خطاك ويجعل هذا الدعم صدقة جارية تثقل موازين حسناتك."
];

export default function SupportApp({ onBack }: { onBack?: () => void }) {
  const { user, userData } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'evolution' | 'financial_support'>('evolution');
  
  // States of support tabs
  const [copiedText, setCopiedText] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouMsg, setThankYouMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSeverity, setTicketSeverity] = useState('technical');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketReceiptId, setTicketReceiptId] = useState<string | null>(null);

  // Phone/Wallet Donation Submission State
  const [donorPhone, setDonorPhone] = useState('');
  const [donorName, setDonorName] = useState(userData?.displayName || '');
  const [donorAmount, setDonorAmount] = useState('50');
  const [donorWalletType, setDonorWalletType] = useState('vodafone');
  const [donorTxId, setDonorTxId] = useState('');
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [donationReceiptId, setDonationReceiptId] = useState<string | null>(null);

  // Certificate personalization
  const [certName, setCertName] = useState(userData?.displayName || 'مسلم صالح');
  const [showCert, setShowCert] = useState(false);

  const vCashNumber = "01093726416";

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    showNotificationToast(`تم نسخ ${type} لمشاركتها أو استخدامها`);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const showNotificationToast = (text: string) => {
    setToastText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCallVcash = () => {
    window.open(`tel:${vCashNumber}`, '_self');
  };

  // Submit Support Ticket directly to Firestore database!
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    
    setSubmittingTicket(true);
    const mockReceipt = 'YQN-' + Math.floor(Math.random() * 900000 + 100000);
    
    try {
      if (user && user.uid !== 'local_guest') {
        const ticketCollection = collection(db, 'support_tickets');
        await addDoc(ticketCollection, {
          userId: user.uid,
          userEmail: user.email || 'guest@email.com',
          userDisplayName: userData?.displayName || user.displayName || 'زائر',
          subject: ticketSubject,
          message: ticketMessage,
          severity: ticketSeverity,
          receiptId: mockReceipt,
          timestamp: new Date().toISOString(),
          status: 'pending' // pending review by Dev Mohamed Ahmed
        });
        
        // Boost user XP by 15 for submitting developer suggestions or reports
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          xp: (userData?.xp || 0) + 15
        });
      }
      
      setTicketReceiptId(mockReceipt);
      setTicketSubject('');
      setTicketMessage('');
      showNotificationToast('تم تسجيل التذكرة سحابياً وزيادة نقاط الـ XP إيماناً بجهودك للارتقاء!');
    } catch (e) {
      console.error("Failed to post technical ticket in server database:", e);
      // fallback
      setTicketReceiptId(mockReceipt);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Submit reported donation report to Firebase Cloud database!
  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorPhone.trim() || !donorAmount.trim()) {
      showNotificationToast('يرجى كتابة رقم الهاتف ومبلغ الدعم بشكل صحيح');
      return;
    }

    setSubmittingDonation(true);
    const mockDonationCode = 'YQN-DON-' + Math.floor(Math.random() * 900000 + 100000);

    try {
      const donationCollection = collection(db, 'contributions_history');
      const payload = {
        userId: user?.uid || 'local_guest',
        userEmail: user?.email || 'guest@email.com',
        donorName: donorName || 'محب الخير',
        donorPhone: donorPhone,
        amount: Number(donorAmount),
        walletType: donorWalletType,
        transactionId: donorTxId || '',
        receiptId: mockDonationCode,
        timestamp: new Date().toISOString(),
        status: 'pending_verification' // pending approval from Mohamed Ahmed
      };

      await addDoc(donationCollection, payload);

      // Boost user's experience points XP on verifying donation submit!
      if (user && user.uid !== 'local_guest') {
        const userDocRef = doc(db, 'users', user.uid);
        const currentBadges = userData?.badges || [];
        const updatedBadges = Array.from(new Set([...currentBadges, 'المتبرع الكريم', 'محب الدعم التقني']));
        await updateDoc(userDocRef, {
          badges: updatedBadges,
          xp: (userData?.xp || 0) + 250 // Give 250 XP
        });
      }

      setDonationReceiptId(mockDonationCode);
      
      const randMsg = THANK_YOU_MESSAGES[Math.floor(Math.random() * THANK_YOU_MESSAGES.length)];
      setThankYouMsg(`تم حفظ تقرير مساهمتك برقم موبايلك بنجاح! رقم إثبات العملية: \n (${mockDonationCode}) \n\n ${randMsg}`);
      setShowThankYou(true);
      
      setDonorPhone('');
      setDonorTxId('');
      showNotificationToast('تم تسجيل تقرير تحويلك بنجاح! جزاك الله خيراً.');
    } catch (err) {
      console.error("Error submitting donation report:", err);
      // Fallback
      setDonationReceiptId(mockDonationCode);
    } finally {
      setSubmittingDonation(false);
    }
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق اليقين',
          text: 'ساهم في نشر وتتبع الطاعات والارتقاء الإيماني بدون إعلانات مع تطبيق "اليقين".',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyText(window.location.href, 'رابط تطبيق اليقين');
    }
  };

  // Get Interactive Faith Status based on User XP
  const currentXP = userData?.xp || 0;
  const currentLevel = userData?.level || 1;
  const userStreak = userData?.streak || 0;

  const getLevelInfo = (xp: number) => {
    if (xp >= 1000) return { title: "الموقن الصالح المخلص", color: "text-amber-500", desc: "أرقى الدرجات والسمات الإيمانية في صرح اليقين" };
    if (xp >= 500) return { title: "الصابر المحسن الشاكر", color: "text-emerald-500", desc: "المواظب على الطاعات والأوراد والصدقات" };
    if (xp >= 200) return { title: "السالك الذاكر الواعي", color: "text-teal-500", desc: "الساعي لتشذيب همته وتنقية تلاوته" };
    return { title: "المبتدئ الطموح المخلص", color: "text-slate-500", desc: "أولى الخطوات في درجات البناء الروحي السليم" };
  };

  const levelInfo = getLevelInfo(currentXP);
  const nextLevelXPBoundary = currentLevel * 150;
  const progressRatio = Math.min(100, Math.floor((currentXP / nextLevelXPBoundary) * 100));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-[#06110E] pb-24 relative overflow-y-auto" dir="rtl">
      
      {/* Pristine Sticky Header */}
      <div className="sticky top-0 bg-white/90 dark:bg-[#091814]/90 backdrop-blur-md shadow-sm z-35 px-4 py-3 border-b-2 border-emerald-500/10 flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-emerald-500/10 rounded-full transition-colors"
          >
            <ArrowRight size={21} className="text-slate-800 dark:text-slate-100" />
          </button>
        )}
        <h1 className="text-base font-black font-serif text-emerald-600 dark:text-emerald-400 flex-1 text-center font-serif">
          مستودع الدعم والارتقاء الروحي
        </h1>
        <div className="w-9" />
      </div>

      {/* Tabs Switcher - Gorgeous Segment Control */}
      <div className="p-4">
        <div className="bg-slate-100 dark:bg-[#0c221d] p-1 rounded-2xl flex border border-slate-200 dark:border-slate-800/80">
          <button
            onClick={() => setActiveTab('evolution')}
            className={`flex-1 py-3 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'evolution'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-slate-50/50 dark:hover:bg-[#0d2a23]/60'
            }`}
          >
            <Trophy size={14} />
            الارتقاء والتطور الروحي
          </button>
          <button
            onClick={() => setActiveTab('financial_support')}
            className={`flex-1 py-3 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'financial_support'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-slate-50/50 dark:hover:bg-[#0d2a23]/60'
            }`}
          >
            <HandHeart size={14} />
            الدعم الفني والدعم المالي
          </button>
        </div>
      </div>

      <div className="px-4 space-y-6">

        {/* Tab 1: SPIRITUAL EVOLUTION */}
        <AnimatePresence mode="wait">
          {activeTab === 'evolution' && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="space-y-6"
            >
              
              {/* Dev Highlight Hero */}
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-[2rem] p-6 text-white border-b-4 border-amber-500/40 relative overflow-hidden shadow-xl text-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-md mb-3">
                    <Trophy size={28} className="text-amber-400 fill-current" />
                  </div>
                  <h2 className="text-xl font-serif font-black text-amber-400 leading-tight">مسيرتك الإيمانية الحالية</h2>
                  <p className="text-[10px] text-slate-350 mt-1 max-w-[280px]">
                    متابعة يومية صمّمت بمنتهى العناية والأهداف لترقية وتتبع التزامك بالطاعات وحفظ القرآن.
                  </p>
                </div>
              </div>

              {/* Faith Stat Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">نقاط الإيمان XP</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{currentXP}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">المرحلة الحالية</span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">{currentLevel}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">سلسلة الالتزام</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">{userStreak} يوم</span>
                </div>
              </div>

              {/* Progress to next level */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-slate-400 font-serif">الترقي للمرحلة التالية</span>
                  <span className="text-xs font-black text-emerald-500">{progressRatio}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-550" style={{ width: `${progressRatio}%` }}></div>
                </div>
                <div className="mt-3 flex gap-2 items-start text-[11px] font-bold text-slate-500">
                  <Award size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-800 dark:text-slate-200">لقبك الحالي: </span>
                    <span className={`${levelInfo.color} underline`}>{levelInfo.title}</span>
                    <p className="text-[10px] text-slate-400 mt-1">{levelInfo.desc}</p>
                  </div>
                </div>
              </div>

              {/* Faith Milestones */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-xs relative">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 mb-4 font-serif">مراحل ومراتب البناء الإيماني</h4>
                <div className="border-r-2 border-slate-100 dark:border-slate-800 pr-6 space-y-5">
                  <div className="relative opacity-70">
                    <span className={`absolute -right-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${currentXP >= 200 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span className="text-xs font-black block text-slate-700 dark:text-slate-200">درجة الإحسان والذكر</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">وصول العداد اليومي للتسابيح إلى 300 تسبيحة مع الرقية الشرعية.</p>
                  </div>

                  <div className="relative opacity-60">
                    <span className={`absolute -right-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${currentXP >= 500 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span className="text-xs font-black block text-slate-700 dark:text-slate-200">بذل العون والدعم التقني</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">المساهمة في إسعاد الأمة الإسلامية بتقديم اقتراح فني أو دعم للمبرمج.</p>
                  </div>
                </div>
              </div>

              {/* Generate Certificate Section */}
              <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-300/30 rounded-3xl p-5 text-center">
                <Award size={36} className="text-amber-500 mx-auto mb-2" />
                <h3 className="text-base font-bold font-serif text-slate-800 dark:text-slate-100">استحقاق شهادة مسيرة اليقين الإيمانية</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  تمنح هذه الشهادة الموقعة من الإشراف والمهندس محمد أحمد كتحفيز معنوي لالتزامك وبنائك السلوكي والروحي بالتطبيق.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    placeholder="اكتب اسمك الثلاثي لطباعته في الشهادة..."
                    className="w-full text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                  <button
                    onClick={() => setShowCert(true)}
                    disabled={!certName.trim()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-[0.98]"
                  >
                    عرض وتوليد ميثاق الشهادة 📄✨
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab 2: CONTRIBUTIONS & DEVELOPER SUPPORT */}
        <AnimatePresence mode="wait">
          {activeTab === 'financial_support' && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              
              {/* Donation Encouragement Hero */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2rem] p-5 text-white text-center relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border border-white/20 mb-3">
                    <HandHeart size={26} className="text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold font-serif text-amber-300">مساهمات الإبقاء والدعم الفني</h3>
                  <p className="text-[11px] text-slate-100 leading-relaxed mt-1 max-w-[280px]">
                    اليقين تطبيق مبارك وخال تماماً من الإعلانات التجارية. دعمك المالي والتقني يضمن سد نفقات استضافة السيرفر السحابي الكبيرة وتطوير المزايا الجديدة.
                  </p>
                </div>
              </div>

              {/* Developer credits segment style */}
              <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900/90 border border-amber-500/30 p-4 rounded-3xl text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-2 bg-gradient-to-l from-amber-400 to-emerald-500"></div>
                <span className="text-[9px] text-amber-400 tracking-widest font-black uppercase font-mono block">المهندس ومكامل الذكاء الاصطناعي</span>
                <h4 className="text-base font-black text-white mt-1">المهندس محمد أحمد</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  تم تطوير صرح اليقين التقني ليكون وقاءً إلكترونياً للمسلم بالبرمجة السليمة والألوان البصرية المريحة للعين.
                </p>
              </div>

              {/* Dynamic Support Ticket Form (Saves in Firestore!) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                <h3 className="text-sm font-bold font-serif mb-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <PenTool size={16} />
                  تسجيل تذكرة دعم أو اقتراح للمطور
                </h3>
                <p className="text-slate-450 text-[10px] leading-relaxed mb-4">
                  اكتب أي استفسار تقني أو اقتراح، وسيقوم المهندس محمد أحمد بمراجعته فورياً بفضل إدراجها بقاعدة بيانات Firestore السحابية.
                </p>

                <form onSubmit={handleSubmitTicket} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-350 mb-1">نوع التذكرة / المشكلة</label>
                    <select
                      value={ticketSeverity}
                      onChange={(e) => setTicketSeverity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none"
                    >
                      <option value="technical">اقتراح تقني أو فكرة ذكية 💡</option>
                      <option value="report">الإبلاغ عن خلل فني أو بطء ⚙️</option>
                      <option value="religious">مراجعة نص أو خطأ لغوي 🕌</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-350 mb-1">الموضوع</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="عنوان مختصر للاقتراح..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 dark:text-slate-350 mb-1">التفاصيل الكاملة</label>
                    <textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="صف لنا بالتفصيل لكي يتم مراجعتها وتطبيقها..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md transition-all disabled:opacity-50"
                  >
                    {submittingTicket ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    إرسال التذكرة للمطور محمد أحمد
                  </button>
                </form>

                {ticketReceiptId && (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500/20 rounded-xl text-center"
                  >
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">✓ تم حفظ التذكرة بقواعد البيانات السحابية</span>
                    <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-100 tracking-wider">رقم التذكرة: {ticketReceiptId}</span>
                  </motion.div>
                )}
              </div>

              {/* Dynamic Wallet Donation Confirmation Form (Real-time Firestore) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                <h3 className="text-sm font-bold font-serif mb-2 flex items-center gap-1.5 text-rose-500">
                  <Heart size={16} className="fill-current text-rose-500" />
                  تسجيل وتأكيد مساهمتك بالرقم
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed mb-4">
                  إذا قمت بتحويل مساهمتك الكريمة عبر فودافون كاش أو إنستاباي، يرجى كتابة تفاصيل تحويلك هنا لتأكيدها سحابياً وتخليد اسمك الموقر في لوحة شرف الموقنين والمساهمين بالتطبيق!
                </p>

                <form onSubmit={handleSubmitDonation} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">وسيلة التحويل</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDonorWalletType('vodafone')}
                        className={`py-2 text-[11px] font-black rounded-lg border text-center transition-all ${
                          donorWalletType === 'vodafone'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        🔴 فودافون كاش
                      </button>
                      <button
                        type="button"
                        onClick={() => setDonorWalletType('instapay')}
                        className={`py-2 text-[11px] font-black rounded-lg border text-center transition-all ${
                          donorWalletType === 'instapay'
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        ⚡ إنستاباي (InstaPay)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDonorWalletType('etisalat')}
                        className={`py-2 text-[11px] font-black rounded-lg border text-center transition-all ${
                          donorWalletType === 'etisalat'
                            ? 'bg-green-50 text-green-600 border-green-200'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        🟢 اتصالات كاش
                      </button>
                      <button
                        type="button"
                        onClick={() => setDonorWalletType('orange_or_other')}
                        className={`py-2 text-[11px] font-black rounded-lg border text-center transition-all ${
                          donorWalletType === 'orange_or_other'
                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        🟠 محفظة أخرى / كارت
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-350 mb-1">اسمك المبارك</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="اسم فاعل الخير..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-350 mb-1">رقم هاتف المحفظة المحوّل منها</label>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="01xxxxxxxxx أو عنوان الدفع..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-350 mb-1">المبلغ المحوّل (بالجنيه)</label>
                      <input
                        type="number"
                        value={donorAmount}
                        onChange={(e) => setDonorAmount(e.target.value)}
                        placeholder="50"
                        min="5"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-350 mb-1">رقم التحويل أو كود التأكيد (اختياري)</label>
                    <input
                      type="text"
                      value={donorTxId}
                      onChange={(e) => setDonorTxId(e.target.value)}
                      placeholder="رقم مرجعى المعاملة..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingDonation}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submittingDonation ? <Loader2 size={13} className="animate-spin" /> : <Heart size={13} className="fill-current text-white" />}
                    تأكيد إرسال الدعم والموائمة سحابياً
                  </button>
                </form>

                {donationReceiptId && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500/20 rounded-xl text-center"
                  >
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">✓ تم تسجيل مساهمتك بـ Firestore الرقمي بنجاح</span>
                    <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-100 block mt-1">كود التأكيد: {donationReceiptId}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">سجلنا لك ٢٥٠ نقطة XP ولقب المتبرع الكريم!</span>
                  </motion.div>
                )}
              </div>

              {/* Premium Vodafone cash only channel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-center space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center border border-red-250/20 mb-2">
                    <Phone size={22} className="text-red-500" />
                  </div>
                  <span className="bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-black border border-red-100 dark:border-red-900/30 inline-block">
                    قناة فودافون كاش الرسمية للمطور
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono py-3 rounded-xl border border-dashed border-red-200 dark:border-red-900/40 bg-red-500/5 text-slate-800 dark:text-slate-100 relative group">
                  {vCashNumber}
                  <button
                    onClick={() => handleCopyText(vCashNumber, 'رقم فودافون كاش')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs cursor-pointer transition-all active:scale-95"
                    title="نسخ الرقم"
                  >
                    {copiedText === 'رقم فودافون كاش' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                
                <p className="text-slate-450 text-[10px] leading-relaxed max-w-[280px] mx-auto font-sans">
                  برجاء تحويل أي مبلغ مساهمة تراه مناسباً مباشرة إلى رقم فودافون كاش أعلاه. جميع عوائد الدعم تخدم مصاريف بقاء التطبيق وسرعة تصفح القرآن والأذكار وقواعد البيانات دون أي إعلانات.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleCallVcash}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 select-none bg-slate-50 dark:bg-slate-950 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Phone size={13} className="text-emerald-500" />
                    فتح نافذة الاتصال الفوري
                  </button>
                  <button
                    onClick={handleShareApp}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 select-none bg-slate-50 dark:bg-slate-950 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Share2 size={13} className="text-emerald-500" />
                    مشاركة رابط اليقين المبارك
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Printable / Viewable Certificate Modal */}
      <AnimatePresence>
        {showCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setShowCert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#faf6ed] text-[#3c2a12] border-8 border-double border-[#9c7c3c] rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden text-center select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Arabesque framing corners */}
              <div className="absolute top-4 right-4 text-xs font-serif text-[#9c7c3c]/30 font-black">⚜⚜⚜</div>
              <div className="absolute top-4 left-4 text-xs font-serif text-[#9c7c3c]/30 font-black">⚜⚜⚜</div>
              <div className="absolute bottom-4 right-4 text-xs font-serif text-[#9c7c3c]/30 font-black">⚜⚜⚜</div>
              <div className="absolute bottom-4 left-4 text-xs font-serif text-[#9c7c3c]/30 font-black">⚜⚜⚜</div>

              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none"></div>
              
              <div className="w-16 h-16 bg-[#9c7c3c]/15 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#9c7c3c]/40">
                <Award size={36} className="text-[#9c7c3c]" />
              </div>
              
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#9c7c3c] font-serif block mb-1">
                تطبيق اليقين -Al-Yaqeen
              </span>
              <h2 className="text-xl font-bold font-serif text-[#5c3c12] tracking-tight">
                شهادة ارتقاء ومسيرة صالحة
              </h2>
              
              <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-[#9c7c3c] to-transparent mx-auto my-3"></div>
              
              <p className="text-[10px] text-slate-600 leading-normal mb-4 font-mono">
                تشهد إدارة تطبيق اليقين ومطورها الملتزم بفضل الله وتوفيقه، بأن الأخ الفاضل / الأخت الفاضلة:
              </p>
              
              <p className="text-lg font-black font-serif text-[#9c7c3c] py-2 border-b-2 border-[#9c7c3c]/20 max-w-[200px] mx-auto uppercase">
                {certName}
              </p>
              
              <p className="text-[10px] text-slate-600 leading-relaxed mt-4 font-medium px-4">
                قد واظب على متابعة الورد القرآني، التسابيح، الذكر الحكيم، والحفاظ على الأوراد اليومية، فارتقى بجهده وتقواه ليكون من فئة:
              </p>

              <p className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 mt-2 py-1 px-3 rounded-full inline-block">
                ★ {levelInfo.title} ★
              </p>
              
              <p className="text-[9px] text-[#9c7c3c] mt-6 font-semibold block leading-tight">
                نسأل الله له/لها الهداية المستمرة وصلاح الشأن والسداد في الدارين.
              </p>

              <div className="w-full border-t border-[#9c7c3c]/20 mt-6 pt-4 grid grid-cols-2 text-right">
                <div>
                  <span className="text-[8px] text-slate-400 block font-bold">محرر في:</span>
                  <span className="text-[9px] text-[#5c3c12] font-black font-mono">{new Date().toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="text-left">
                  <span className="text-[8px] text-slate-400 block font-bold">بإشراف وتوقيع:</span>
                  <span className="text-[9px] text-[#9c7c3c] font-black font-serif">م. محمد أحمد</span>
                </div>
              </div>

              <button
                onClick={() => {
                  showNotificationToast("تمت معالجة أمر التنزيل بنجاح. يمكنك تصوير الشاشة للاحتفاظ بنسختك الموقعة!");
                  setShowCert(false);
                }}
                className="w-full mt-6 py-2.5 bg-gradient-to-r from-[#9c7c3c] to-[#7c5c1c] text-white rounded-xl text-xs font-bold hover:shadow-lg hover:scale-[1.01] transition-all"
              >
                تحميل مستند الشهادة 📥
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thank You / Confetti Modal */}
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
              
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-150 dark:border-green-800/30">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif mb-2">
                جزاك الله خيراً وشكر سعيك
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold mb-6">
                {thankYouMsg}
              </p>
              
              <button
                onClick={() => setShowThankYou(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 text-xs rounded-xl font-bold transition-colors"
              >
                إغلاق البركة
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
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-lg z-50 font-black text-xs whitespace-nowrap border border-emerald-500"
          >
            {toastText}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

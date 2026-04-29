import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Key, Plus, ShieldCheck, Loader, Users, Crown, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, getDeviceId } from '../contexts/AuthContext';
import { doc, setDoc, getDocs, collection, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

function generateKey() {
  return 'XXXX-XXXX-XXXX'.replace(/X/g, () =>
    Math.random().toString(36)[2].toUpperCase()
  );
}

interface UserStats {
  total: number;
  pro: number;
  plus: number;
  free: number;
}

export default function SubscriptionAdmin({ onBack }: { onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';
  const { userData, user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'pro'>('pro');
  const [loading, setLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState<string>('');
  
  const [stats, setStats] = useState<UserStats>({ total: 0, pro: 0, plus: 0, free: 0 });
  const [licenses, setLicenses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const isAdmin = userData?.role === 'admin' || user?.email === 'mmrmfkmigo@gmail.com';

  const fetchData = async () => {
    if (!isAdmin) return;
    setFetching(true);
    try {
      const usersQuery = query(collection(db, 'users'));
      const userSnaps = await getDocs(usersQuery);
      let s = { total: 0, pro: 0, plus: 0, free: 0 };
      userSnaps.forEach(doc => {
        s.total++;
        const p = doc.data().plan;
        if (p === 'pro') s.pro++;
        else if (p === 'plus') s.plus++;
        else s.free++;
      });
      setStats(s);

      const licensesQuery = query(collection(db, 'licenses'), orderBy('createdAt', 'desc'));
      const licenseSnaps = await getDocs(licensesQuery);
      const l: any[] = [];
      licenseSnaps.forEach(doc => {
        l.push({ id: doc.id, ...doc.data() });
      });
      setLicenses(l);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;

    setLoading(true);
    setGeneratedKey(null);

    const key = customKey.trim() || generateKey();
    
    try {
      await setDoc(doc(db, 'licenses', key), {
        key: key,
        plan: selectedPlan,
        used: false,
        createdAt: Date.now()
      });
      
      setGeneratedKey(key);
      setCustomKey('');
      fetchData(); // Refresh list
    } catch (err: any) {
      alert("خطأ أثناء توليد المفتاح: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLicense = async (key: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المفتاح؟')) return;
    try {
      await deleteDoc(doc(db, 'licenses', key));
      fetchData();
    } catch (err: any) {
      alert("خطأ أثناء الحذف: " + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <ShieldCheck size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold">غير مصرح لك بالدخول</h2>
          <button onClick={onBack} className="mt-4 text-indigo-600 font-bold underline">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-24 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-indigo-600 text-white rounded-b-[2rem] pt-12 pb-8 px-6 shadow-md relative overflow-hidden">
        <button
          onClick={onBack}
          className={`absolute top-10 ${isRTL ? 'right-6' : 'left-6'} p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors`}
        >
          <ChevronRight size={24} className={isRTL ? '' : 'rotate-180'} />
        </button>
        <div className="text-center mt-6 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold font-serif mb-2">لوحة تحكم الاشتراكات</h1>
          <p className="text-indigo-100/90 text-sm">إدارة المفاتيح والمستخدمين</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
            <Users size={24} className="mx-auto text-indigo-500 mb-2" />
            <p className="text-xs text-slate-500 font-bold mb-1">الكل</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
            <Crown size={24} className="mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-slate-500 font-bold mb-1">Pro</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pro}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
            <ShieldCheck size={24} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-xs text-slate-500 font-bold mb-1">Plus</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.plus}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
            <Users size={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-500 font-bold mb-1">مجاني</p>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{stats.free}</p>
          </div>
        </div>

        {/* Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Key size={20} className="text-indigo-600" />
            توليد مفتاح جديد
          </h2>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedPlan('plus')}
              className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                selectedPlan === 'plus' 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Plus
            </button>
            <button
              onClick={() => setSelectedPlan('pro')}
              className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                selectedPlan === 'pro' 
                  ? 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Pro
            </button>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="مفتاح مخصص (اختياري، اتركه فارغاً لتوليد عشوائي)"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center uppercase tracking-widest font-mono focus:outline-none focus:border-indigo-500 dark:text-white"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : (
                <>
                  <Plus size={20} />
                  إصدار المفتاح
                </>
              )}
            </button>
          </form>

          {generatedKey && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-500 mb-2">تم إصدار مفتاح لـ {selectedPlan.toUpperCase()}</p>
              <div className="font-mono text-xl tracking-widest font-bold text-indigo-600 dark:text-indigo-400 user-select-all selection:bg-indigo-200 selection:text-indigo-900">
                {generatedKey}
              </div>
            </div>
          )}
        </motion.div>

        {/* Existing Licenses */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">المفاتيح المصدرة</h2>
            <button onClick={fetchData} className="text-indigo-600 text-sm font-bold flex items-center gap-1">
              تحديث
            </button>
          </div>

          {fetching ? (
            <div className="flex justify-center p-8"><Loader className="animate-spin text-indigo-600" /></div>
          ) : (
            <div className="space-y-4">
              {licenses.map(license => (
                <div key={license.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        license.plan === 'pro' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                      }`}>
                        {license.plan.toUpperCase()}
                      </span>
                      {license.used ? (
                        <span className="text-xs flex items-center gap-1 text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                          مستخدم
                        </span>
                      ) : (
                        <span className="text-xs flex items-center gap-1 text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full font-bold">
                          متاح
                        </span>
                      )}
                    </div>
                    <p className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">{license.key}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(license.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteLicense(license.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {licenses.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-4">لا توجد مفاتيح مصدرة</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

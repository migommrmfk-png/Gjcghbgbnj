import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, AlertCircle, Loader, MessageCircle, Moon, Star } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDeviceId } from '../contexts/AuthContext';

// Floating particle component
const FloatingParticle = ({ delay, x, y, size }: { key?: number | string; delay: number; x: number; y: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-emerald-400/20 pointer-events-none"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [-10, 10, -10],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 4 + delay,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

// Arabic calligraphy star decoration
const StarDecoration = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="currentColor">
    <path d="M20 2 L22.5 15 L35 10 L25 20 L35 30 L22.5 25 L20 38 L17.5 25 L5 30 L15 20 L5 10 L17.5 15 Z" />
  </svg>
);

export default function Auth({ onBack }: { onBack?: () => void }) {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = accessKey.trim().toUpperCase();
    if (!cleanKey) return;

    setLoading(true);
    setError('');

    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const cred = await signInAnonymously(auth);
        currentUser = cred.user;
        // Small delay to let AuthContext potentially create the default user document
        await new Promise(res => setTimeout(res, 1000));
      }

      const deviceId = getDeviceId();

      // Master admin backdoor functionality
      if (cleanKey === 'MIGO-ADMIN-2026') {
         await setDoc(doc(db, 'users', currentUser.uid), {
            role: 'admin',
            plan: 'pro',
            licenseKey: cleanKey,
            licenseDevice: deviceId,
            uid: currentUser.uid,
            createdAt: Date.now(),
            xp: 0,
            level: 1,
            streak: 0,
            badges: []
         }, { merge: true });
         window.location.reload();
         return;
      }

      // Check license key
      const licenseRef = doc(db, 'licenses', cleanKey);
      const licenseSnap = await getDoc(licenseRef);

      if (!licenseSnap.exists()) {
        throw new Error('مفتاح الدخول غير صحيح');
      }

      const licenseData = licenseSnap.data();

      // Ensure user doc is initialized before updating
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
         await setDoc(userRef, {
            uid: currentUser.uid,
            createdAt: Date.now(),
            role: 'user',
            xp: 0,
            level: 1,
            streak: 0,
            badges: []
         });
      }

      if (licenseData.used) {
        if (licenseData.usedByDevice !== deviceId) {
            throw new Error('هذا المفتاح مستخدم بالفعل على جهاز آخر');
        }
        // Valid recovery on same device
        await setDoc(userRef, {
            plan: licenseData.plan,
            licenseKey: cleanKey,
            licenseDevice: deviceId
        }, { merge: true });
        window.location.reload();
        return;
      }

      // New Activation
      await updateDoc(licenseRef, {
        used: true,
        usedBy: currentUser.uid,
        usedByDevice: deviceId
      });

      await setDoc(userRef, {
        plan: licenseData.plan,
        licenseKey: cleanKey,
        licenseDevice: deviceId,
        role: 'user'
      }, { merge: true });

      window.location.reload();
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/admin-restricted-operation') {
         setError('خاصية الدخول المجهول (Anonymous) غير مفعلة في قاعدة البيانات (Firebase). يرجى تفعيلها من لوحة تحكم Firebase في قسم Authentication -> Sign-in method.');
      } else {
         setError(err.message || 'حدث خطأ. يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent('السلام عليكم، أحتاج إلى مفتاح دخول للتطبيق.');
    window.open(`https://wa.me/201062082229?text=${text}`, '_blank');
  };

  const particles = [
    { delay: 0, x: 10, y: 20, size: 8 },
    { delay: 0.5, x: 85, y: 15, size: 12 },
    { delay: 1, x: 70, y: 70, size: 6 },
    { delay: 1.5, x: 20, y: 75, size: 10 },
    { delay: 2, x: 50, y: 10, size: 7 },
  ];

  return (
    <div
      className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden"
      dir="rtl"
      style={{
        background: 'linear-gradient(160deg, #0a1628 0%, #0d2137 30%, #0a2818 70%, #061a10 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{ width: 400, height: 400, top: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,5 55,15 55,45 30,55 5,45 5,15" fill="none" stroke="#10b981" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
        {particles.map((p, i) => (
          <FloatingParticle key={i} delay={p.delay} x={p.x} y={p.y} size={p.size} />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <div className="relative inline-block mb-6">
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.3) 100%)',
                border: '1px solid rgba(16,185,129,0.3)',
                boxShadow: '0 0 40px rgba(16,185,129,0.3)',
              }}
            >
              <Moon size={40} className="text-emerald-400" />
              <motion.div className="absolute top-2 right-3">
                <Star size={10} className="text-emerald-300" fill="currentColor" />
              </motion.div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
            مسلم
          </h1>
          <p className="text-emerald-400/60 text-sm">التطبيق الإسلامي الشامل</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div
            className="rounded-3xl p-7 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'serif' }}>مفتاح الدخول</h2>
              <p className="text-white/50 text-sm">أدخل مفتاح الترخيص الخاص بك للمتابعة</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="rounded-xl p-3 flex items-start gap-2 text-sm bg-red-500/10 border border-red-500/20 text-red-300"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center uppercase tracking-widest font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-white/20"
                  dir="ltr"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !accessKey.trim()}
                className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 text-slate-900 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
              >
                {loading ? <Loader className="animate-spin" size={20} /> : <><Key size={20} /> تسجيل الدخول</>}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-white/50 text-sm mb-3">ليس لديك مفتاح دخول؟</p>
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/30 transition-colors"
              >
                <MessageCircle size={18} />
                تواصل معنا للحصول عليه
              </button>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/20 text-xs mt-8"
        >
          تم تصميم هذا التطبيق لخدمة المسلم في حياته اليومية
        </motion.p>
      </div>
    </div>
  );
}

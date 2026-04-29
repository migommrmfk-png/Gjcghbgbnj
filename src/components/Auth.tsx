import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, User, AlertCircle, Loader, Moon, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

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

export default function Auth({ onBack }: { onBack?: () => void }) {
  const { signInWithGoogle, signInAsGuest, error: authError } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAsGuest();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/admin-restricted-operation') {
         setError('خاصية الدخول المجهول (Anonymous) غير مفعلة في قاعدة البيانات (Firebase). يرجى تفعيلها من لوحة تحكم Firebase في قسم Authentication -> Sign-in method.');
      } else {
         setError(err.message || 'حدث خطأ أثناء المتابعة كزائر.');
      }
    } finally {
      setLoading(false);
    }
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
      {onBack && (
        <button
          onClick={onBack}
           className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      )}

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
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'serif' }}>تسجيل الدخول</h2>
              <p className="text-white/50 text-sm">اختر طريقة الدخول المناسبة لك</p>
            </div>

            <AnimatePresence>
              {(error || authError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="rounded-xl p-3 flex items-start gap-2 text-sm bg-red-500/10 border border-red-500/20 text-red-300"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{error || authError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 text-slate-900 pr-5 disabled:opacity-50 relative overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 15px rgba(255,255,255,0.1)' }}
              >
                {loading ? <Loader className="animate-spin text-slate-400" size={20} /> : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 opacity-80 shrink-0" />
                    <span>المتابعة بحساب جوجل</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 text-white disabled:opacity-50 border border-white/20 hover:bg-white/5"
              >
                {loading ? <Loader className="animate-spin" size={20} /> : <><User size={20} /> الدخول كزائر</>}
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

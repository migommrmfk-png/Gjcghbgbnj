import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ArrowRight, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Auth({ onBack }: { onBack?: () => void }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInAsGuest } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء تسجيل الدخول باستخدام جوجل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInAsGuest();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء الدخول كزائر. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="py-4 flex items-center gap-4 mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
          >
            <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-400" />
          </button>
        )}
        <h1 className="text-2xl font-bold font-serif text-emerald-400 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          تسجيل الدخول
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-black/5 dark:border-white/5 relative overflow-hidden">
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4">
                <LogIn size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">أهلاً بك في مسلم</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                اختر طريقة تسجيل الدخول للمتابعة
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 mb-6 text-sm"
              >
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mt-3 py-3.5 bg-white dark:bg-black/20 text-gray-800 dark:text-white border border-gray-300 dark:border-white/10 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              المتابعة باستخدام حساب جوجل
            </button>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User size={20} />
              المتابعة كزائر (بدون تسجيل)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

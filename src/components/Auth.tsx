import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Auth({ onBack }: { onBack?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithTwitter, signInAsGuest } = useAuth();

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

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithFacebook();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء تسجيل الدخول باستخدام فيسبوك. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwitterLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithTwitter();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء تسجيل الدخول باستخدام تويتر. يرجى المحاولة مرة أخرى.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مستخدم بالفعل.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صحيحة.');
      } else {
        setError('حدث خطأ أثناء المصادقة. يرجى المحاولة مرة أخرى.');
      }
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
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
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
                {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">أهلاً بك في مسلم</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {isLogin ? 'سجل دخولك لمتابعة تقدمك وحفظ بياناتك' : 'أنشئ حساباً جديداً للانضمام لمجتمعنا'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">الاسم</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User size={18} className="text-emerald-500" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                      placeholder="أدخل اسمك"
                      dir="rtl"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-emerald-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all text-left"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">كلمة المرور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-emerald-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all text-left"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
              <span className="text-slate-500 dark:text-slate-400 text-sm">أو</span>
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User size={20} />
              المتابعة كزائر (بدون تسجيل)
            </button>

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
              المتابعة باستخدام جوجل
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              className="w-full mt-3 py-3.5 bg-[#1877F2] text-white rounded-xl font-bold shadow-sm flex items-center justify-center gap-3 hover:bg-[#1877F2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              المتابعة باستخدام فيسبوك
            </button>

            <button
              type="button"
              onClick={handleTwitterLogin}
              disabled={loading}
              className="w-full mt-3 py-3.5 bg-black text-white rounded-xl font-bold shadow-sm flex items-center justify-center gap-3 hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              المتابعة باستخدام X
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-emerald-500 hover:text-emerald-600 transition-colors text-sm font-bold"
              >
                {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب بالفعل؟ سجل دخولك'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

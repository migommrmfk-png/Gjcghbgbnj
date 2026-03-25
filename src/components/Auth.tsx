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
  const { signIn, signUp } = useAuth();

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
    <div className="max-w-md mx-auto p-4 min-h-screen bg-[var(--color-bg)] flex flex-col" dir="rtl">
      {/* Header */}
      <div className="py-4 flex items-center gap-4 mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
          >
            <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" />
          </button>
        )}
        <h1 className="text-2xl font-bold font-serif text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="card-3d bg-[var(--color-surface)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-3xl flex items-center justify-center text-black mx-auto mb-4 shadow-[0_0_20px_rgba(212,175,55,0.5)] transform rotate-3">
                {isLogin ? <LogIn size={40} /> : <UserPlus size={40} />}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">أهلاً بك في مسلم</h2>
              <p className="text-[var(--color-text-muted)] text-sm">
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
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">الاسم</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User size={18} className="text-[var(--color-primary)]" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                      placeholder="أدخل اسمك"
                      dir="rtl"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-[var(--color-primary)]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all text-left"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">كلمة المرور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-[var(--color-primary)]" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all text-left"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-black rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-[var(--color-primary-light)] hover:text-white transition-colors text-sm font-bold"
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

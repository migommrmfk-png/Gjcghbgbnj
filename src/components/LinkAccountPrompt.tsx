import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Mail, X, ShieldCheck } from 'lucide-react';

export default function LinkAccountPrompt() {
  const { user, linkWithGoogle } = useAuth();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('hideLinkPrompt') !== 'true';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { linkWithEmail } = useAuth();

  // Only show if user is anonymous and has used the app for a bit (streak >= 2)
  const streak = parseInt(localStorage.getItem('appStreak') || '0', 10);
  if (!user || !user.isAnonymous || !isVisible || streak < 2) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hideLinkPrompt', 'true');
  };

  const handleLinkGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await linkWithGoogle();
      setIsVisible(false);
    } catch (err: any) {
      console.error("Failed to link account", err);
      if (err.code === 'auth/credential-already-in-use') {
        setError(t('account_already_linked', 'هذا الحساب مستخدم بالفعل. يرجى تسجيل الخروج وتسجيل الدخول بحسابك.'));
      } else {
        setError(t('link_failed', 'حدث خطأ أثناء ربط الحساب. يرجى المحاولة مرة أخرى.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError(t('fill_all_fields', 'يرجى ملء جميع الحقول.'));
      return;
    }
    if (password.length < 6) {
      setError(t('password_too_short', 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.'));
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await linkWithEmail(email, password, name);
      setIsVisible(false);
    } catch (err: any) {
      console.error("Failed to link email", err);
      if (err.code === 'auth/email-already-in-use') {
        setError(t('email_already_in_use', 'البريد الإلكتروني مستخدم بالفعل.'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('invalid_email', 'صيغة البريد الإلكتروني غير صحيحة.'));
      } else {
        setError(t('link_failed', 'حدث خطأ أثناء ربط الحساب. يرجى المحاولة مرة أخرى.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-white/20 rounded-full shrink-0">
            <ShieldCheck size={24} className="text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              {t('save_your_progress', 'احفظ تقدمك!')}
            </h3>
            <p className="text-sm text-emerald-50 mb-4 opacity-90 leading-relaxed">
              {t('link_account_desc', 'أنت تستخدم حساب زائر. اربط حسابك الآن لحفظ نقاطك (XP)، مستواك، وإنجازاتك بشكل دائم.')}
            </p>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-100 p-2 rounded-lg text-xs mb-3">
                {error}
              </div>
            )}
            
            {!showEmailForm ? (
              <div className="space-y-2">
                <button
                  onClick={handleLinkGoogle}
                  disabled={loading}
                  className="w-full bg-white text-emerald-700 font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>{t('link_with_google', 'المتابعة باستخدام Google')}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowEmailForm(true)}
                  disabled={loading}
                  className="w-full bg-emerald-700/30 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-emerald-700/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Mail size={18} />
                  <span>{t('link_with_email', 'المتابعة بالبريد الإلكتروني')}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleLinkEmail} className="space-y-3">
                <input
                  type="text"
                  placeholder={t('your_name', 'الاسم')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  dir="rtl"
                />
                <input
                  type="email"
                  placeholder={t('email', 'البريد الإلكتروني')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  dir="ltr"
                />
                <input
                  type="password"
                  placeholder={t('password', 'كلمة المرور')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  dir="ltr"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-white text-emerald-700 font-bold py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm"
                  >
                    {loading ? '...' : t('save', 'حفظ')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    disabled={loading}
                    className="flex-1 bg-emerald-700/30 text-white font-bold py-2 rounded-lg hover:bg-emerald-700/50 transition-colors text-sm"
                  >
                    {t('cancel', 'إلغاء')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

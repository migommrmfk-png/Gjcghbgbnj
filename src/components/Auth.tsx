import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, User, AlertCircle, Shield, Sparkles, Moon, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Floating particle component
const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) => (
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'google' | 'guest' | null>(null);
  const [mounted, setMounted] = useState(false);
  const { signInWithGoogle, signInAsGuest } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setLoadingType('google');
      setError('');
      await signInWithGoogle();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء تسجيل الدخول باستخدام جوجل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setLoadingType('guest');
      setError('');
      await signInAsGuest();
      if (onBack) onBack();
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء الدخول كزائر. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const particles = [
    { delay: 0, x: 10, y: 20, size: 8 },
    { delay: 0.5, x: 85, y: 15, size: 12 },
    { delay: 1, x: 70, y: 70, size: 6 },
    { delay: 1.5, x: 20, y: 75, size: 10 },
    { delay: 2, x: 50, y: 10, size: 7 },
    { delay: 2.5, x: 90, y: 45, size: 9 },
    { delay: 0.8, x: 5, y: 50, size: 5 },
    { delay: 1.8, x: 60, y: 85, size: 11 },
  ];

  return (
    <div
      className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden"
      dir="rtl"
      style={{
        background: 'linear-gradient(160deg, #0a1628 0%, #0d2137 30%, #0a2818 70%, #061a10 100%)',
      }}
    >
      {/* Animated background mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Radial glow effects */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 400,
            height: 400,
            top: '-100px',
            right: '-100px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 350,
            height: 350,
            bottom: '-80px',
            left: '-80px',
            background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-2xl"
          style={{
            width: 200,
            height: 200,
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Geometric Islamic pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,5 55,15 55,45 30,55 5,45 5,15" fill="none" stroke="#10b981" strokeWidth="0.5" />
              <polygon points="30,15 45,22 45,38 30,45 15,38 15,22" fill="none" stroke="#10b981" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="5" fill="none" stroke="#10b981" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>

        {/* Floating particles */}
        {mounted && particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex items-center gap-4">
        {onBack && (
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl border transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <ArrowRight size={20} className="text-emerald-400" />
          </motion.button>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-10">
        {/* Logo/Brand section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          {/* Ornamental frame */}
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.4) 25%, transparent 50%, rgba(16,185,129,0.4) 75%, transparent 100%)',
                padding: '2px',
              }}
            />
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.3) 100%)',
                border: '1px solid rgba(16,185,129,0.3)',
                boxShadow: '0 0 40px rgba(16,185,129,0.3), inset 0 0 20px rgba(16,185,129,0.1)',
              }}
            >
              <Moon size={40} className="text-emerald-400" />
              <motion.div
                className="absolute top-2 right-3"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star size={10} className="text-emerald-300" fill="currentColor" />
              </motion.div>
            </div>
          </div>

          {/* Arabic greeting */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <StarDecoration className="w-4 h-4 text-emerald-500/50" />
              <p className="text-emerald-400/70 text-sm tracking-widest font-light" style={{ fontFamily: 'serif' }}>
                بسم الله الرحمن الرحيم
              </p>
              <StarDecoration className="w-4 h-4 text-emerald-500/50" />
            </div>
            <h1
              className="text-4xl font-bold text-white mb-2"
              style={{
                fontFamily: 'Georgia, serif',
                textShadow: '0 0 30px rgba(16,185,129,0.4)',
              }}
            >
              مسلم
            </h1>
            <p className="text-emerald-400/60 text-sm">رفيقك في رحلتك الإيمانية</p>
          </motion.div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
        >
          <div
            className="rounded-3xl p-7 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            {/* Card inner glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)',
              }}
            />

            {/* Card header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'serif' }}>
                أهلاً وسهلاً
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                سجّل دخولك للاستفادة من جميع المميزات
              </p>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="rounded-2xl p-4 flex items-start gap-3 text-sm overflow-hidden"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign In Button */}
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full py-4 rounded-2xl font-bold text-base relative overflow-hidden transition-all duration-300 flex items-center justify-center gap-3 mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                color: '#1a1a2e',
                boxShadow: loadingType === 'google'
                  ? '0 0 30px rgba(255,255,255,0.3)'
                  : '0 8px 25px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
              }}
            >
              {/* Button shimmer */}
              {!loading && (
                <motion.div
                  className="absolute inset-0 opacity-0 hover:opacity-100"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 100%)',
                  }}
                />
              )}

              {loadingType === 'google' ? (
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-emerald-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
              )}
              <span className="font-semibold" style={{ fontFamily: 'serif', letterSpacing: '0.01em' }}>
                {loadingType === 'google' ? 'جاري تسجيل الدخول...' : 'المتابعة بحساب جوجل'}
              </span>
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-white/25 text-xs px-1">أو</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Guest Login Button */}
            <motion.button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full py-4 rounded-2xl font-bold text-base relative overflow-hidden transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                color: '#34d399',
                boxShadow: loadingType === 'guest'
                  ? '0 0 25px rgba(16,185,129,0.3)'
                  : '0 4px 15px rgba(0,0,0,0.3)',
              }}
            >
              {loadingType === 'guest' ? (
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-emerald-700 border-t-emerald-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <User size={20} />
              )}
              <span style={{ fontFamily: 'serif', letterSpacing: '0.01em' }}>
                {loadingType === 'guest' ? 'جاري الدخول...' : 'المتابعة كزائر'}
              </span>
            </motion.button>

            {/* Guest note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-white/20 text-xs mt-4 leading-relaxed"
            >
              الدخول كزائر لن يحفظ بياناتك وإنجازاتك
            </motion.p>
          </div>
        </motion.div>

        {/* Features row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center gap-6 mt-8"
        >
          {[
            { icon: Shield, label: 'آمن تماماً' },
            { icon: Sparkles, label: 'مجاني' },
            { icon: Moon, label: 'شامل' },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.15)',
                }}
              >
                <Icon size={16} className="text-emerald-500/70" />
              </div>
              <span className="text-white/25 text-xs">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Bottom copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/15 text-xs mt-8"
        >
          بتسجيلك، أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </motion.p>
      </div>
    </div>
  );
}

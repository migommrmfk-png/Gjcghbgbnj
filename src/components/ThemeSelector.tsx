import React from 'react';
import { useTheme } from './ThemeProvider';
import { Palette, Check, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const themes = [
  { id: 'emerald-light', name: 'أخضر زمردي', color: '#059669', mode: 'light' },
  { id: 'emerald-dark', name: 'أخضر ليلي', color: '#10B981', mode: 'dark' },
];

export default function ThemeSelector({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[var(--color-surface)] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-black/5 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Palette className="text-[var(--color-primary)]" size={24} />
                <h3 className="text-xl font-bold text-[var(--color-text)] font-serif drop-shadow-sm">مظهر التطبيق</h3>
              </div>
              <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5">
                <X size={20} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as any);
                    setTimeout(onClose, 300);
                  }}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    theme === t.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-105 shadow-sm'
                      : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 bg-black/5 dark:bg-white/5'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-inner border border-black/10 dark:border-white/10 flex items-center justify-center relative"
                    style={{ backgroundColor: t.color }}
                  >
                    {theme === t.id && <Check size={20} className="text-white drop-shadow-md" />}
                    <div className="absolute -bottom-1 -right-1 bg-[var(--color-surface)] rounded-full p-0.5 shadow-sm">
                      {t.mode === 'light' ? <Sun size={12} className="text-amber-500" /> : <Moon size={12} className="text-indigo-400" />}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${theme === t.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>{t.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

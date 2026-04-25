import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Heart, MessageCircle, Send, User, ShieldAlert, Clock, Flame, Share2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface DuaPost {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  createdAt: any;
  ameenCount: number;
  isAnonymous: boolean;
}

export default function DuaWall({ onBack }: { onBack: () => void }) {
  const [duas, setDuas] = useState<DuaPost[]>([]);
  const [newDua, setNewDua] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  const [ameenedDuas, setAmeenedDuas] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load previously ameened duas from local storage to prevent spamming
    const saved = localStorage.getItem('ameenedDuas');
    if (saved) {
      try {
        setAmeenedDuas(new Set(JSON.parse(saved)));
      } catch (e) {}
    }

    const q = query(collection(db, 'duaWall'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDuas: DuaPost[] = [];
      snapshot.forEach((doc) => {
        fetchedDuas.push({ id: doc.id, ...doc.data() } as DuaPost);
      });
      setDuas(fetchedDuas);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching duas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDua.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'duaWall'), {
        text: newDua.trim(),
        authorName: isAnonymous ? 'فاعل خير' : (user.displayName || 'مستخدم'),
        authorId: user.uid,
        createdAt: serverTimestamp(),
        ameenCount: 0,
        isAnonymous
      });
      
      // Reward user with XP for posting a dua
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          xp: increment(10)
        });
      } catch (xpError) {
        console.error("Error updating XP:", xpError);
      }
      
      setNewDua('');
    } catch (error) {
      console.error("Error posting dua:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmeen = async (duaId: string) => {
    if (ameenedDuas.has(duaId)) return;

    // Optimistic UI update
    const newAmeened = new Set(ameenedDuas).add(duaId);
    setAmeenedDuas(newAmeened);
    localStorage.setItem('ameenedDuas', JSON.stringify(Array.from(newAmeened)));

    try {
      const duaRef = doc(db, 'duaWall', duaId);
      await updateDoc(duaRef, {
        ameenCount: increment(1)
      });
      
      // Reward user with XP for saying Ameen
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            xp: increment(2)
          });
        } catch (xpError) {
          console.error("Error updating XP:", xpError);
        }
      }
    } catch (error) {
      console.error("Error updating ameen count:", error);
      // Revert on failure
      const reverted = new Set(ameenedDuas);
      reverted.delete(duaId);
      setAmeenedDuas(reverted);
      localStorage.setItem('ameenedDuas', JSON.stringify(Array.from(reverted)));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'الآن';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    return `منذ ${diffDays} أيام`;
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950/90 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm"
          >
            <ArrowRight size={24} className="text-slate-500 dark:text-slate-400 hover:text-emerald-400" />
          </button>
          <h1 className="text-2xl font-bold font-serif text-emerald-400 drop-shadow-sm">
            حائط الدعاء
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 px-2">
          شارك دعاءك ليؤمن عليه إخوانك، أو ادعُ لمن طلب الدعاء.
        </p>
      </div>

      {/* Write Dua Form */}
      <div className="mt-6 bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-lg border border-black/5 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <form onSubmit={handleSubmit} className="relative z-10">
          <textarea
            value={newDua}
            onChange={(e) => setNewDua(e.target.value)}
            placeholder="اكتب دعاءك هنا... (مثال: ادعوا لوالدي بالشفاء)"
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 resize-none h-28 text-sm leading-relaxed"
            maxLength={300}
          />
          
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAnonymous ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 dark:border-slate-400 group-hover:border-emerald-500'}`}>
                {isAnonymous && <User size={12} className="text-white" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:text-slate-100 transition-colors">نشر كمجهول</span>
            </label>
            
            <button
              type="submit"
              disabled={!newDua.trim() || isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>نشر الدعاء</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Duas List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : duas.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <Heart size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا توجد أدعية بعد. كن أول من يشارك دعاءه!</p>
          </div>
        ) : (
          <AnimatePresence>
            {duas.map((dua, index) => {
              const hasAmeened = ameenedDuas.has(dua.id);
              return (
                <motion.div
                  key={dua.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-md border border-black/5 dark:border-white/5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-inner ${dua.isAnonymous ? 'bg-gray-500' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                        {dua.isAnonymous ? <User size={20} /> : dua.authorName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{dua.authorName}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <Clock size={10} />
                          <span>{formatDate(dua.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed mb-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                    "{dua.text}"
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-bold w-1/2">
                      <Heart size={14} className={dua.ameenCount > 0 ? 'text-rose-500 fill-rose-500' : ''} />
                      <span className="truncate">{dua.ameenCount} شخص أمّن</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'شارك الدعاء',
                              text: `"${dua.text}"\nأمنوا معي على هذا الدعاء! (عبر تطبيق مسلم AI)`,
                            }).catch(console.error);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all bg-black/5 dark:bg-white/5 text-slate-800 dark:text-slate-100 hover:bg-emerald-500/10 hover:text-emerald-500 border border-transparent"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={() => handleAmeen(dua.id)}
                        disabled={hasAmeened}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          hasAmeened 
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                            : 'bg-black/5 dark:bg-white/5 text-slate-800 dark:text-slate-100 hover:bg-emerald-500/10 hover:text-emerald-500 border border-transparent'
                        }`}
                      >
                        <Heart size={16} className={hasAmeened ? 'fill-rose-500' : ''} />
                        <span>{hasAmeened ? 'دعوت له' : 'آمين'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

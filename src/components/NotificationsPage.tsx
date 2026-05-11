import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Bell, BellRing, Settings, Info, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc } from 'firebase/firestore';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: number;
}

export default function NotificationsPage({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app with push notifications, you would fetch from a 'notifications' collection 
    // tailored for the user. For demonstration, we'll use some local/mock data mixed with global ones.
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (user && !userData?.isAnonymous) {
         // Example structure for firestore
         // const q = query(collection(db, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'), limit(20));
         // const snap = await getDocs(q);
      }
      
      // Mock notifications for now
      setNotifications([
        {
          id: '1',
          title: 'تحديث جديد',
          body: 'تم إضافة ميزات الذكاء الاصطناعي الجديدة مثل الفتاوى ومستشار الأسماء، جربها الآن!',
          type: 'info',
          read: false,
          createdAt: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
        },
        {
          id: '2',
          title: 'ورد القرآن',
          body: 'لا تنسَ قراءة وردك اليومي من القرآن الكريم للحفاظ على خطتك متصلة.',
          type: 'alert',
          read: false,
          createdAt: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
        },
        {
          id: '3',
          title: 'اشتراك مفعّل',
          body: 'تم تفعيل باقة Plus بنجاح، يمكنك الآن الاستمتاع بجميع الميزات الاحترافية.',
          type: 'success',
          read: true,
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 days ago
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={24} className="text-emerald-500" />;
      case 'alert': return <BellRing size={24} className="text-amber-500" />;
      case 'warning': return <Info size={24} className="text-red-500" />;
      default: return <Bell size={24} className="text-indigo-500" />;
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'الآن';
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20 overflow-y-auto">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
              <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
            </button>
            <h1 className="text-xl font-bold font-kufi">الإشعارات</h1>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllAsRead} className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition">
              قراءة الكل
            </button>
          )}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto py-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-16">
            <Bell size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
            <p className="font-bold">لا توجد إشعارات</p>
            <p className="text-sm mt-1">ستظهر إشعارات التطبيق هنا</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                    notif.read 
                      ? 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 opacity-70' 
                      : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    notif.read ? 'bg-slate-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-800 shadow-sm'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={`font-bold ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] whitespace-nowrap text-slate-400 mt-1">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${notif.read ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      {notif.body}
                    </p>
                  </div>
                  
                  {!notif.read && (
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

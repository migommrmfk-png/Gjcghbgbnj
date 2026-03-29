import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Users, Trophy, Heart, Flame, Medal, HandHeart } from 'lucide-react';

export default function SocialChallenges({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends'>('leaderboard');

  const leaderboard = [
    { rank: 1, name: 'أحمد محمود', points: 15400, avatar: 'bg-blue-500' },
    { rank: 2, name: 'عمر خالد', points: 14200, avatar: 'bg-green-500' },
    { rank: 3, name: 'أنت', points: 12500, avatar: 'bg-[var(--color-gold-dark)]' },
    { rank: 4, name: 'فاطمة علي', points: 11800, avatar: 'bg-purple-500' },
    { rank: 5, name: 'يوسف حسن', points: 10500, avatar: 'bg-orange-500' },
  ];

  const friends = [
    { id: 1, name: 'عمر خالد', status: 'online', streak: 15 },
    { id: 2, name: 'أحمد محمود', status: 'offline', streak: 8 },
    { id: 3, name: 'فاطمة علي', status: 'online', streak: 22 },
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen bg-[var(--color-bg)]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 py-4 flex flex-col gap-4 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)]"
          >
            <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-white" />
          </button>
          <h1 className="text-xl font-bold font-serif text-white drop-shadow-md">
            المجتمع والتحديات
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 shadow-inner border border-black/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'leaderboard' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-text)]'
            }`}
          >
            <Trophy size={16} />
            لوحة الشرف
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'friends' ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-text)]'
            }`}
          >
            <Users size={16} />
            الأصدقاء
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-6">
        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Weekly Challenge Banner */}
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-[var(--color-primary)]/30">
              <div className="absolute left-0 top-0 w-32 h-32 bg-white/20 rounded-full -ml-10 -mt-10 blur-xl"></div>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={24} className="text-white" />
                  <h2 className="text-xl font-bold font-serif drop-shadow-sm">تحدي الأسبوع</h2>
                </div>
                <p className="text-white/80 font-bold mb-4">قراءة سورة الكهف يوم الجمعة</p>
                <div className="flex justify-between items-center bg-black/10 rounded-xl p-3 backdrop-blur-sm border border-black/10">
                  <span className="text-sm font-bold">المشاركون: 1,245</span>
                  <button className="bg-black text-[var(--color-primary)] px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg hover:bg-black/80 transition-colors">
                    انضمام
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="card-3d bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-lg border border-white/5">
              <h3 className="font-bold text-[var(--color-text)] text-xl font-serif mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center text-[var(--color-primary-light)] border border-[var(--color-primary)]/20 shadow-inner">
                  <Trophy size={20} />
                </div>
                أفضل المستخدمين هذا الشهر
              </h3>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div key={index} className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${user.name === 'أنت' ? 'bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent border-[var(--color-primary)]/30 shadow-md' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner border ${
                      user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      user.rank === 2 ? 'bg-gray-400/20 text-gray-300 border-gray-400/30' :
                      user.rank === 3 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-black/5 dark:bg-white/5 text-[var(--color-text-muted)] border-black/10 dark:border-white/10'
                    }`}>
                      {user.rank <= 3 ? <Medal size={20} /> : user.rank}
                    </div>
                    
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-inner border border-white/10 ${user.avatar}`}>
                      {user.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-bold text-sm mb-1 ${user.name === 'أنت' ? 'text-[var(--color-primary-light)]' : 'text-[var(--color-text)]'}`}>{user.name}</h4>
                      <p className="text-xs text-[var(--color-text-muted)]">{user.points.toLocaleString()} نقطة</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="card-3d bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-lg border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[var(--color-text)] text-xl font-serif flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center text-[var(--color-primary-light)] border border-[var(--color-primary)]/20 shadow-inner">
                    <Users size={20} />
                  </div>
                  قائمة الأصدقاء
                </h3>
                <button className="text-sm font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.3)] border border-[var(--color-primary)]/50">
                  إضافة صديق
                </button>
              </div>
              
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner border border-white/10">
                          {friend.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--color-surface)] shadow-sm ${friend.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--color-text)] text-sm mb-1">{friend.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20">
                          <Flame size={12} className="fill-current" />
                          {friend.streak} يوم متتالي
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-inner border border-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]" title="إرسال دعاء">
                      <HandHeart size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

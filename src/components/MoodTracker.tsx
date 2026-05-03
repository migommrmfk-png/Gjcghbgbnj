import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Frown, Meh, Heart, Coffee, CloudRain, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';

const moods = [
  { id: 'happy', icon: <Smile className="w-8 h-8" />, label: 'سعيد', color: 'bg-emerald-500' },
  { id: 'grateful', icon: <Heart className="w-8 h-8" />, label: 'ممتن', color: 'bg-rose-500' },
  { id: 'tired', icon: <Coffee className="w-8 h-8" />, label: 'مرهق', color: 'bg-amber-500' },
  { id: 'anxious', icon: <Meh className="w-8 h-8" />, label: 'قلق', color: 'bg-orange-500' },
  { id: 'sad', icon: <Frown className="w-8 h-8" />, label: 'حزين', color: 'bg-blue-500' },
  { id: 'stressed', icon: <CloudRain className="w-8 h-8" />, label: 'متوتر', color: 'bg-indigo-500' },
];

export default function MoodTracker() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ text: string, source: string, type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  useEffect(() => {
    if (user) {
      checkTodayMood();
    }
  }, [user]);

  const checkTodayMood = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'moods'),
        where('userId', '==', user.id),
        where('timestamp', '>=', today + 'T00:00:00Z'),
        where('timestamp', '<=', today + 'T23:59:59Z'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setHasLoggedToday(true);
        const data = snapshot.docs[0].data();
        setSelectedMood(data.mood);
        // We could also save the suggestion in the DB, but for now we just show they logged it.
      }
    } catch (error) {
      console.error("Error checking mood:", error);
    }
  };

  const handleMoodSelect = async (moodId: string) => {
    if (!user) return;
    setSelectedMood(moodId);
    setSaving(true);
    setLoading(true);

    try {
      // Save to Firestore
      const now = new Date().toISOString();
      await addDoc(collection(db, 'moods'), {
        userId: user.id,
        mood: moodId,
        timestamp: now
      });
      setHasLoggedToday(true);

      // Generate AI Suggestion
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const moodLabel = moods.find(m => m.id === moodId)?.label || moodId;
      const prompt = `The user is feeling "${moodLabel}". Provide a comforting Islamic suggestion. 
      It can be a short Ayah, a Dua, or a Hadith that fits this mood.
      Return JSON matching this schema:
      {
        "text": "The Arabic text of the Ayah/Dua/Hadith",
        "source": "The source (e.g., Surah Yusuf, Sahih Bukhari)",
        "type": "ayah" | "dua" | "hadith"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              source: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["text", "source", "type"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setSuggestion(data);

    } catch (error) {
      console.error("Error logging mood:", error);
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {t('howAreYouFeeling', 'كيف تشعر اليوم؟')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('moodTrackerDesc', 'تتبع حالتك المزاجية للحصول على توصيات مخصصة')}
          </p>
        </div>
      </div>

      {!hasLoggedToday || !suggestion ? (
        <div className="grid grid-cols-3 gap-4">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              disabled={saving}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                selectedMood === mood.id
                  ? `${mood.color} text-white shadow-lg scale-105`
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {mood.icon}
              <span className="text-sm font-bold">{mood.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center py-8"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </motion.div>
        )}

        {suggestion && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30"
          >
            <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wider">
                {t('aiSuggestion', 'رسالة لك')}
              </span>
            </div>
            <p className="text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-4 text-center font-serif">
              "{suggestion.text}"
            </p>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/70 text-left font-bold">
              — {suggestion.source}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

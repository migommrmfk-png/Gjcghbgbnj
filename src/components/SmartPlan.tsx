import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Loader2, Sparkles, Trophy, Flame, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xpReward: number;
}

interface DailyPlan {
  id?: string;
  userId: string;
  date: string;
  tasks: Task[];
}

interface UserStats {
  xp: number;
  level: number;
  streak: number;
  badges?: string[];
}

export default function SmartPlan() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1, streak: 0, badges: [] });

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchTodayPlan();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setStats({
          xp: data.xp || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          badges: data.badges || [],
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchTodayPlan = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'plans'),
        where('userId', '==', user.uid),
        where('date', '==', today)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const planDoc = querySnapshot.docs[0];
        setPlan({ id: planDoc.id, ...planDoc.data() } as DailyPlan);
      } else {
        // No plan for today, need to generate
        setPlan(null);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const today = new Date().toISOString().split('T')[0];
      
      const prompt = `Generate a personalized daily Islamic plan for a user. The plan should include 3-5 tasks. 
      Tasks should be a mix of prayers, Quran reading, Azkar, and good deeds.
      Return the response in JSON format matching this schema:
      {
        "tasks": [
          {
            "id": "unique-string-id",
            "title": "Task title (e.g., Read Surah Al-Kahf)",
            "description": "Short description or motivation",
            "xpReward": number (between 10 and 50)
          }
        ]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    xpReward: { type: Type.NUMBER }
                  },
                  required: ["id", "title", "description", "xpReward"]
                }
              }
            },
            required: ["tasks"]
          }
        }
      });

      const generatedData = JSON.parse(response.text || '{}');
      const tasks: Task[] = (generatedData.tasks || []).map((t: any) => ({
        ...t,
        completed: false
      }));

      const newPlan: DailyPlan = {
        userId: user.uid,
        date: today,
        tasks
      };

      const docRef = await addDoc(collection(db, 'plans'), newPlan);
      setPlan({ id: docRef.id, ...newPlan });
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!plan || !plan.id || !user) return;

    const taskIndex = plan.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = plan.tasks[taskIndex];
    const newCompletedState = !task.completed;
    
    // Optimistic update
    const updatedTasks = [...plan.tasks];
    updatedTasks[taskIndex] = { ...task, completed: newCompletedState };
    setPlan({ ...plan, tasks: updatedTasks });

    try {
      // Update plan in Firestore
      const planRef = doc(db, 'plans', plan.id);
      await updateDoc(planRef, { tasks: updatedTasks });

      // If task was just completed, award XP
      if (newCompletedState) {
        awardXP(task.xpReward);
      } else {
        // If un-completed, we might want to deduct XP, but usually gamification doesn't deduct.
        // For simplicity, we'll just deduct it if they uncheck it to prevent abuse.
        awardXP(-task.xpReward);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert optimistic update
      setPlan(plan);
    }
  };

  const awardXP = async (amount: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        let newXp = (data.xp || 0) + amount;
        if (newXp < 0) newXp = 0;
        
        // Simple leveling logic: 100 XP per level
        const newLevel = Math.floor(newXp / 100) + 1;
        
        await updateDoc(userRef, {
          xp: newXp,
          level: newLevel
        });
        
        setStats(prev => ({ ...prev, xp: newXp, level: newLevel }));
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const progress = plan ? (plan.tasks.filter(t => t.completed).length / plan.tasks.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Stats Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            {t('smartPlan', 'AI Smart Plan')}
          </h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Trophy className="w-5 h-5" />
              <span>Lvl {stats.level}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-500 font-semibold">
              <Flame className="w-5 h-5" />
              <span>{stats.streak}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500 font-semibold">
              <Sparkles className="w-5 h-5" />
              <span>{stats.xp} XP</span>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-1">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${(stats.xp % 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
          {100 - (stats.xp % 100)} XP to Level {stats.level + 1}
        </p>

        {/* Badges Display */}
        {stats.badges && stats.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            {stats.badges.map((badge, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <Trophy className="w-3 h-3" />
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Plan Content */}
      {!plan ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {t('noPlanYet', 'No Plan for Today')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            {t('generatePlanDesc', 'Let AI create a personalized daily plan based on your goals and progress.')}
          </p>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 w-full sm:w-auto mx-auto disabled:opacity-70"
          >
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {generating ? t('generating', 'Generating...') : t('generatePlan', 'Generate My Plan')}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {t('todaysTasks', "Today's Tasks")}
            </h3>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
              {Math.round(progress)}% {t('completed', 'Completed')}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-6">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="space-y-3">
            {plan.tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                  task.completed 
                    ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30' 
                    : 'bg-white border-slate-100 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-emerald-700'
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <button className="mt-0.5 flex-shrink-0 text-emerald-500">
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
                <div className="flex-1">
                  <h4 className={`font-semibold ${task.completed ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-70' : 'text-slate-800 dark:text-white'}`}>
                    {task.title}
                  </h4>
                  <p className={`text-sm mt-1 ${task.completed ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-slate-500 dark:text-slate-400'}`}>
                    {task.description}
                  </p>
                </div>
                <div className={`text-sm font-bold flex items-center gap-1 ${task.completed ? 'text-emerald-600/50 dark:text-emerald-400/50' : 'text-blue-500'}`}>
                  +{task.xpReward} XP
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { ChevronRight } from 'lucide-react';
import { useTranslation } from "react-i18next";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CATEGORIES = [
  { id: "tafseer", label: "تفسير الآيات", icon: "📖" },
  { id: "complete", label: "أكمل الآية", icon: "✍️" },
  { id: "surah", label: "اسم السورة", icon: "🔍" },
  { id: "hukm", label: "أحكام التجويد", icon: "🎵" },
];

const DIFFICULTIES = [
  { id: "easy", label: "سهل", color: "#4ade80" },
  { id: "medium", label: "متوسط", color: "#facc15" },
  { id: "hard", label: "صعب", color: "#f87171" },
];

const SYSTEM_PROMPT = `أنت مسابقة قرآنية إسلامية ذكية. مهمتك:
1. توليد سؤال قرآني واحد فقط بصيغة JSON
2. الفئات: tafseer (تفسير آية), complete (أكمل الآية), surah (اسم السورة), hukm (حكم تجويد)
3. مستويات: easy (سهل), medium (متوسط), hard (صعب)

أرجع JSON فقط بهذا الشكل بدون أي نص إضافي وبدون علامات Code Block:
{
  "question": "نص السؤال",
  "options": ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
  "correct": 0,
  "explanation": "شرح مختصر للإجابة الصحيحة",
  "verse": "الآية أو النص القرآني المرتبط (اختياري)"
}`;

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  verse?: string;
}

export default function IslamicQuiz({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState("home"); // home, quiz, result, leaderboard
  const [category, setCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef<any>(null);
  const [particles, setParticles] = useState<any[]>([]);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';

  useEffect(() => {
    // Generate background particles
    const p = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 4,
      dur: Math.random() * 6 + 6,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    if (screen === "quiz" && question && !revealed) {
      setTimeLeft(30);
      setTimeExpired(false);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setTimeExpired(true);
            setRevealed(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [question, screen, revealed]);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setRevealed(false);
    clearInterval(timerRef.current);
    try {
      const prompt = `أنشئ سؤالاً قرآنياً من فئة "${category}" بمستوى "${difficulty}". 
      تأكد أن الأسئلة متنوعة ومختلفة في كل مرة ولم تسألني إياه في هذه الجلسة. الرقم العشوائي للتميز: ${Math.random()}`;

      const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              systemInstruction: SYSTEM_PROMPT,
              responseMimeType: "application/json"
          }
      });
      const text = res.text || "";
      const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestion(parsed);
      setQuestionsCount((q) => q + 1);
    } catch (e) {
      console.error(e);
      setQuestion({
        question: "ما اسم أطول سورة في القرآن الكريم؟",
        options: ["سورة البقرة", "سورة آل عمران", "سورة النساء", "سورة المائدة"],
        correct: 0,
        explanation: "سورة البقرة هي أطول سور القرآن الكريم وتحتوي على 286 آية.",
        verse: "",
      });
      setQuestionsCount((q) => q + 1);
    }
    setLoading(false);
  };

  const startQuiz = () => {
    if (!category || !difficulty) return;
    setScore(0);
    setStreak(0);
    setQuestionsCount(0);
    setScreen("quiz");
    setTimeout(fetchQuestion, 100);
  };

  const handleSelect = (idx: number) => {
    if (revealed) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setRevealed(true);
    if (question && idx === question.correct) {
      const bonus = streak >= 2 ? 20 : 0;
      const timeBonus = Math.floor(timeLeft / 3);
      setScore((s) => s + 10 + bonus + timeBonus);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (questionsCount >= 10) {
      setScreen("result");
    } else {
      fetchQuestion();
    }
  };

  const timerPercent = (timeLeft / 30) * 100;
  const timerColor =
    timeLeft > 15 ? "#4ade80" : timeLeft > 7 ? "#facc15" : "#f87171";

  // ---- SCREENS ----

  if (screen === "home") {
    return (
      <div style={styles.root}>
        <Stars particles={particles} />
        <div style={styles.container}>
          <button
            onClick={onBack}
            style={styles.backBtn}
          >
            <ChevronRight size={24} className={isRTL ? '' : 'rotate-180'} />
          </button>
          
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logoWrap}>
              <span style={styles.logoAr}>بِسْمِ اللَّهِ</span>
              <div style={styles.logoIcon}>🕌</div>
            </div>
            <h1 style={styles.title}>مسابقة القرآن الكريم</h1>
            <p style={styles.subtitle}>اختبر معلوماتك القرآنية بمساعدة الذكاء الاصطناعي</p>
          </div>

          {/* Category */}
          <div style={styles.section}>
            <p style={styles.sectionLabel}>اختر الفئة</p>
            <div style={styles.grid2}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  style={{
                    ...(styles.card as any),
                    ...(category === c.id ? styles.cardActive : {}),
                  }}
                  onClick={() => setCategory(c.id)}
                >
                  <span style={styles.cardIcon}>{c.icon}</span>
                  <span style={styles.cardLabel}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={styles.section}>
            <p style={styles.sectionLabel}>مستوى الصعوبة</p>
            <div style={styles.diffRow}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  style={{
                    ...(styles.diffBtn as any),
                    borderColor: difficulty === d.id ? d.color : "transparent",
                    background:
                      difficulty === d.id
                        ? `${d.color}22`
                        : "rgba(255,255,255,0.05)",
                    color: difficulty === d.id ? d.color : "#9ca3af",
                  }}
                  onClick={() => setDifficulty(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            style={{
              ...(styles.startBtn as any),
              opacity: category && difficulty ? 1 : 0.4,
              cursor: category && difficulty ? "pointer" : "not-allowed",
            }}
            onClick={startQuiz}
            disabled={!category || !difficulty}
          >
            ابدأ المسابقة ✨
          </button>

          <p style={styles.disclaimer}>
            ⚠️ الأسئلة مولّدة بالذكاء الاصطناعي — يُنصح بمراجعة العلماء للتحقق
          </p>
        </div>
      </div>
    );
  }

  if (screen === "quiz") {
    return (
      <div style={styles.root}>
        <Stars particles={particles} />
        <div style={styles.container}>
          <button
            onClick={onBack}
            style={{...styles.backBtn, top: 16, right: 16}}
          >
            <ChevronRight size={24} className={isRTL ? '' : 'rotate-180'} />
          </button>
          
          {/* Top bar */}
          <div style={styles.topBar}>
            <div style={styles.scoreBadge}>⭐ {score}</div>
            <div style={styles.questionCount}>
              سؤال {questionsCount} / 10
            </div>
            {streak >= 2 && (
              <div style={styles.streakBadge}>🔥 {streak}</div>
            )}
          </div>

          {/* Timer */}
          <div style={styles.timerWrap}>
            <div style={styles.timerBar}>
              <div
                style={{
                  ...styles.timerFill,
                  width: `${timerPercent}%`,
                  background: timerColor,
                  transition: "width 1s linear, background 0.5s",
                }}
              />
            </div>
            <span style={{ ...styles.timerNum, color: timerColor }}>
              {timeLeft}s
            </span>
          </div>

          {loading ? (
            <div style={styles.loadingWrap}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>جاري توليد السؤال...</p>
            </div>
          ) : question ? (
            <>
              {question.verse ? (
                <div style={styles.verseBox}>
                  <p style={styles.verseText}>{question.verse}</p>
                </div>
              ) : null}

              <div style={styles.questionBox}>
                <p style={styles.questionText}>{question.question}</p>
              </div>

              <div style={styles.optionsGrid}>
                {question.options.map((opt, idx) => {
                  let bg = "rgba(255,255,255,0.06)";
                  let border = "rgba(255,255,255,0.12)";
                  let color = "#e5e7eb";
                  if (revealed) {
                    if (idx === question.correct) {
                      bg = "rgba(74,222,128,0.18)";
                      border = "#4ade80";
                      color = "#4ade80";
                    } else if (idx === selected && idx !== question.correct) {
                      bg = "rgba(248,113,113,0.18)";
                      border = "#f87171";
                      color = "#f87171";
                    }
                  } else if (selected === idx) {
                    bg = "rgba(251,191,36,0.18)";
                    border = "#fbbf24";
                  }
                  return (
                    <button
                      key={idx}
                      style={{
                        ...(styles.optionBtn as any),
                        background: bg,
                        borderColor: border,
                        color,
                      }}
                      onClick={() => handleSelect(idx)}
                      disabled={revealed}
                    >
                      <span style={styles.optionLetter}>
                        {["أ", "ب", "ج", "د"][idx]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div style={styles.explanationBox}>
                  <p style={styles.explanationTitle}>
                    {timeExpired
                      ? "⏰ انتهى الوقت!"
                      : selected === question.correct
                      ? "✅ إجابة صحيحة!"
                      : "❌ إجابة خاطئة"}
                  </p>
                  <p style={styles.explanationText}>{question.explanation}</p>
                  <button style={styles.nextBtn as any} onClick={nextQuestion}>
                    {questionsCount >= 10 ? "عرض النتيجة 🏆" : "السؤال التالي ←"}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    );
  }

  if (screen === "result") {
    const percent = Math.round((score / 150) * 100);
    const grade =
      score >= 120
        ? { text: "ممتاز 🏆", color: "#fbbf24" }
        : score >= 80
        ? { text: "جيد جداً ⭐", color: "#4ade80" }
        : score >= 50
        ? { text: "جيد 👍", color: "#60a5fa" }
        : { text: "تحتاج مراجعة 📖", color: "#f87171" };

    return (
      <div style={styles.root}>
        <Stars particles={particles} />
        <div style={styles.container}>
          <button
            onClick={onBack}
            style={styles.backBtn}
          >
            <ChevronRight size={24} className={isRTL ? '' : 'rotate-180'} />
          </button>
          
          <div style={styles.resultCard}>
            <div style={styles.resultEmoji}>🎉</div>
            <h2 style={styles.resultTitle}>انتهت المسابقة!</h2>
            <p style={{ ...styles.resultGrade, color: grade.color }}>
              {grade.text}
            </p>
            <div style={styles.scoreCircle}>
              <span style={styles.scoreNum}>{score}</span>
              <span style={styles.scoreLabel}>نقطة</span>
            </div>
            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={styles.statNum}>10</span>
                <span style={styles.statLabel}>سؤال</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNum}>{streak}</span>
                <span style={styles.statLabel}>أطول سلسلة</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNum}>{percent}%</span>
                <span style={styles.statLabel}>النسبة</span>
              </div>
            </div>
            <p style={styles.resultAyah}>
              ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
            </p>
            <div style={styles.resultBtns}>
              <button
                style={styles.startBtn as any}
                onClick={() => {
                  setScreen("home");
                  setCategory(null);
                  setDifficulty(null);
                  setQuestion(null);
                }}
              >
                العب مجدداً 🔄
              </button>
            </div>
            <p style={styles.disclaimer}>
              ⚠️ الأسئلة مولّدة بالذكاء الاصطناعي — يُنصح بمراجعة العلماء للتحقق
            </p>
          </div>
        </div>
      </div>
    );
  }
}

function Stars({ particles }: { particles: any[] }) {
  return (
    <div style={styles.starsWrap}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: "rgba(251,191,36,0.6)",
            animation: `twinkle ${p.dur}s ${p.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle { from { opacity:0.1; } to { opacity:0.9; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);} }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100%",
    background: "linear-gradient(135deg, #0a0a1a 0%, #0f1a2e 50%, #0a1a0f 100%)",
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
    direction: "rtl" as const,
    position: "relative" as const,
    overflowX: "hidden" as const,
    padding: "0 0 40px",
  },
  starsWrap: {
    position: "absolute" as const,
    inset: 0,
    pointerEvents: "none" as const,
    zIndex: 0,
  },
  backBtn: {
    position: "absolute" as const,
    top: 24,
    right: 16,
    zIndex: 10,
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    padding: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  container: {
    maxWidth: 520,
    margin: "0 auto",
    padding: "60px 16px 24px",
    position: "relative" as const,
    zIndex: 1,
  },
  header: {
    textAlign: "center" as const,
    marginBottom: 32,
    animation: "fadeIn 0.7s ease",
  },
  logoWrap: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  logoAr: {
    fontSize: 13,
    color: "#fbbf24",
    letterSpacing: 2,
    opacity: 0.8,
  },
  logoIcon: { fontSize: 44 },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: "#f9fafb",
    margin: "8px 0 6px",
  },
  subtitle: { fontSize: 14, color: "#9ca3af", margin: 0 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 13,
    color: "#fbbf24",
    marginBottom: 10,
    fontWeight: 600,
    letterSpacing: 1,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#d1d5db",
  },
  cardActive: {
    background: "rgba(251,191,36,0.15)",
    border: "1.5px solid #fbbf24",
    color: "#fbbf24",
  },
  cardIcon: { fontSize: 24 },
  cardLabel: { fontSize: 13, fontWeight: 600 },
  diffRow: { display: "flex", gap: 10 },
  diffBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    border: "1.5px solid",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  startBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #d97706, #fbbf24)",
    border: "none",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: 800,
    color: "#1a1a1a",
    cursor: "pointer",
    marginTop: 8,
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: "0 4px 20px rgba(251,191,36,0.3)",
  },
  disclaimer: {
    textAlign: "center" as const,
    fontSize: 11,
    color: "#6b7280",
    marginTop: 14,
    lineHeight: 1.6,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between" as const,
    alignItems: "center",
    marginBottom: 16,
  },
  scoreBadge: {
    background: "rgba(251,191,36,0.15)",
    border: "1px solid #fbbf24",
    color: "#fbbf24",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 14,
    fontWeight: 700,
  },
  questionCount: { color: "#9ca3af", fontSize: 14 },
  streakBadge: {
    background: "rgba(248,113,113,0.15)",
    border: "1px solid #f87171",
    color: "#f87171",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 14,
    fontWeight: 700,
  },
  timerWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  timerBar: {
    flex: 1,
    height: 6,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    overflow: "hidden",
  },
  timerFill: { height: "100%", borderRadius: 10 },
  timerNum: { fontSize: 13, fontWeight: 700, minWidth: 28, textAlign: "right" as const },
  loadingWrap: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 16,
    padding: "60px 0",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(251,191,36,0.2)",
    borderTop: "3px solid #fbbf24",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#9ca3af", fontSize: 14 },
  verseBox: {
    background: "rgba(251,191,36,0.08)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 16,
    textAlign: "center" as const,
  },
  verseText: {
    color: "#fbbf24",
    fontSize: 16,
    lineHeight: 2,
    margin: 0,
    fontFamily: "'Traditional Arabic', serif",
  },
  questionBox: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "18px 16px",
    marginBottom: 16,
    animation: "fadeIn 0.4s ease",
  },
  questionText: {
    color: "#f9fafb",
    fontSize: 17,
    lineHeight: 1.7,
    margin: 0,
    fontWeight: 600,
    textAlign: "center" as const,
  },
  optionsGrid: { display: "flex", flexDirection: "column" as const, gap: 10 },
  optionBtn: {
    border: "1.5px solid",
    borderRadius: 12,
    padding: "13px 16px",
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.25s",
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontFamily: "inherit",
    textAlign: "right" as const,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  explanationBox: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    animation: "fadeIn 0.4s ease",
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f9fafb",
    margin: "0 0 8px",
    textAlign: "center" as const,
  },
  explanationText: { color: "#d1d5db", fontSize: 14, lineHeight: 1.7, margin: "0 0 14px" },
  nextBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #d97706, #fbbf24)",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a1a",
    cursor: "pointer",
  },
  resultCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "32px 20px",
    textAlign: "center" as const,
    animation: "fadeIn 0.6s ease",
  },
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultTitle: { fontSize: 22, fontWeight: 800, color: "#f9fafb", margin: "0 0 8px" },
  resultGrade: { fontSize: 20, fontWeight: 700, margin: "0 0 20px" },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    background: "rgba(251,191,36,0.1)",
    border: "3px solid #fbbf24",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  scoreNum: { fontSize: 32, fontWeight: 800, color: "#fbbf24", lineHeight: 1 },
  scoreLabel: { fontSize: 13, color: "#9ca3af" },
  statsRow: { display: "flex", justifyContent: "center", gap: 24, marginBottom: 20 },
  statItem: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2 },
  statNum: { fontSize: 22, fontWeight: 800, color: "#f9fafb" },
  statLabel: { fontSize: 12, color: "#9ca3af" },
  resultAyah: {
    color: "#fbbf24",
    fontSize: 16,
    fontFamily: "'Traditional Arabic', serif",
    marginBottom: 20,
  },
  resultBtns: { display: "flex", gap: 10 },
};

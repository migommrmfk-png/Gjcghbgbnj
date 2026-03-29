import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ChevronLeft, ArrowRight, Star, Clock } from 'lucide-react';

interface Story {
  id: string;
  prophet: string;
  title: string;
  brief: string;
  fullStory: string[];
  lessons: string[];
  icon: string;
}

const stories: Story[] = [
  {
    id: "adam",
    prophet: "آدم عليه السلام",
    title: "أبو البشر وأول الأنبياء",
    brief: "قصة خلق آدم عليه السلام، وسجود الملائكة له، وخروجه من الجنة.",
    icon: "🌍",
    fullStory: [
      "خلق الله تعالى آدم عليه السلام من طين، ونفخ فيه من روحه، وأمر الملائكة بالسجود له تكريماً، فسجدوا جميعاً إلا إبليس أبى واستكبر.",
      "أسكن الله آدم وزوجته حواء الجنة، وأباح لهما الأكل من كل ثمارها إلا شجرة واحدة. لكن إبليس وسوس لهما فأكلا منها.",
      "أهبط الله آدم وحواء إلى الأرض لتبدأ رحلة البشرية، وتاب الله على آدم فكان أول نبي يرسل ليعبد الله وحده."
    ],
    lessons: [
      "التوبة النصوح تمحو الخطيئة.",
      "الكبر هو أول ذنب عُصي به الله (من إبليس).",
      "تكريم الله للإنسان بالعقل والعلم."
    ]
  },
  {
    id: "nuh",
    prophet: "نوح عليه السلام",
    title: "أول رسل الله إلى الأرض",
    brief: "قصة دعوة نوح لقومه 950 سنة، وبناء السفينة، والطوفان العظيم.",
    icon: "⛵",
    fullStory: [
      "أرسل الله نوحاً عليه السلام إلى قوم عبدوا الأصنام، فدعاهم ليلاً ونهاراً، سراً وجهاراً لمدة 950 عاماً، ولم يؤمن معه إلا قليل.",
      "أوحى الله إليه ببناء سفينة عظيمة، فكان قومه يسخرون منه وهو يبنيها في الصحراء.",
      "جاء أمر الله وفار التنور، وحمل نوح في السفينة من كل زوجين اثنين ومن آمن معه، وأغرق الله الكافرين بالطوفان، حتى ابنه الذي رفض الركوب."
    ],
    lessons: [
      "الصبر والمثابرة في الدعوة إلى الله.",
      "النجاة دائماً تكون للمؤمنين مهما قل عددهم.",
      "القرابة لا تنفع إذا انقطعت رابطة الإيمان (قصة ابنه)."
    ]
  },
  {
    id: "ibrahim",
    prophet: "إبراهيم عليه السلام",
    title: "خليل الرحمن وأبو الأنبياء",
    brief: "قصة تحطيم الأصنام، والنجاة من النار، وبناء الكعبة المشرفة.",
    icon: "🔥",
    fullStory: [
      "نشأ إبراهيم عليه السلام في قوم يعبدون الأصنام والكواكب، فهداه الله للتوحيد. حطم أصنام قومه ليثبت لهم عجزها.",
      "ألقاه قومه في نار عظيمة، لكن الله أمر النار أن تكون برداً وسلاماً عليه.",
      "أمره الله بترك زوجته هاجر وابنه إسماعيل في وادٍ غير ذي زرع (مكة)، ثم عاد لاحقاً ليبني مع ابنه إسماعيل الكعبة المشرفة."
    ],
    lessons: [
      "التوكل المطلق على الله يجلب المعجزات.",
      "استخدام العقل والمنطق في إثبات الحق.",
      "الابتلاءات العظيمة ترفع درجات المؤمن."
    ]
  },
  {
    id: "musa",
    prophet: "موسى عليه السلام",
    title: "كليم الله",
    brief: "قصة مواجهة فرعون، وانشقاق البحر، وتلقي التوراة.",
    icon: "🌊",
    fullStory: [
      "وُلد موسى في عام يقتل فيه فرعون المواليد، فألقت به أمه في اليم، ليتربى في قصر فرعون نفسه.",
      "أرسله الله لدعوة فرعون وتحرير بني إسرائيل. أيده الله بمعجزات كالعصا التي تتحول لثعبان واليد البيضاء.",
      "عندما طارده فرعون وجيشه، شق الله البحر لموسى وقومه، وأغرق فرعون وجنوده."
    ],
    lessons: [
      "تدبير الله فوق كل تدبير (تربية موسى في قصر عدوه).",
      "نهاية الظلم والطغيان حتمية.",
      "معية الله تنقذ المؤمن في أحلك اللحظات."
    ]
  },
  {
    id: "isa",
    prophet: "عيسى عليه السلام",
    title: "كلمة الله وروحه",
    brief: "قصة ولادته المعجزة، ومعجزاته في الشفاء، ورفعه إلى السماء.",
    icon: "✨",
    fullStory: [
      "ولد عيسى عليه السلام من مريم العذراء بمعجزة إلهية بدون أب، وتكلم في المهد ليبرئ أمه.",
      "أيده الله بمعجزات عظيمة كإبراء الأكمه والأبرص وإحياء الموتى بإذن الله.",
      "تآمر عليه بنو إسرائيل لقتله، لكن الله نجاه ورفعه إليه، وشُبّه لهم فصلبوا رجلاً آخر."
    ],
    lessons: [
      "قدرة الله لا تحدها الأسباب الطبيعية.",
      "الرحمة والشفقة في التعامل مع الناس.",
      "الله يدافع عن الذين آمنوا وينجيهم من مكر الأعداء."
    ]
  },
  {
    id: "muhammad",
    prophet: "محمد ﷺ",
    title: "خاتم الأنبياء والمرسلين",
    brief: "قصة نزول الوحي، والهجرة، وبناء الدولة الإسلامية.",
    icon: "🕋",
    fullStory: [
      "نزل الوحي على النبي ﷺ في غار حراء وهو في الأربعين من عمره، وبدأ دعوته سراً ثم جهراً في مكة.",
      "واجه أذى شديداً من قريش، فهاجر إلى المدينة المنورة حيث أسس أول دولة إسلامية.",
      "عاد فاتحاً لمكة بعد سنوات، وعفا عن أهلها، وأكمل الله به الدين وأتم النعمة."
    ],
    lessons: [
      "الرحمة للعالمين والعفو عند المقدرة.",
      "أهمية الصبر واليقين بنصر الله.",
      "الإسلام دين شامل يصلح لكل زمان ومكان."
    ]
  }
];

export default function ProphetStories({ onBack }: { onBack: () => void }) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors bg-[var(--color-surface)] shadow-sm border border-black/5 dark:border-white/5"
        >
          <ArrowRight size={24} className="text-[var(--color-text-muted)]" />
        </button>
        <h1 className="text-2xl font-bold font-serif text-[var(--color-primary)]">قصص الأنبياء</h1>
      </div>

      <div className="p-4 flex-1">
        <AnimatePresence mode="wait">
          {!selectedStory ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 gap-4 pb-20"
            >
              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 rounded-3xl text-white mb-4 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mt-10 blur-2xl"></div>
                <h2 className="text-xl font-bold mb-2">أحسن القصص</h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  تأمل في سير الأنبياء والمرسلين، واستلهم من صبرهم ويقينهم دروساً تضيء دربك.
                </p>
              </div>

              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedStory(story)}
                  className="bg-[var(--color-surface)] rounded-3xl p-5 cursor-pointer hover:scale-[1.02] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/5 dark:border-white/5 relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-3xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(27,67,50,0.4)] transform group-hover:rotate-6 group-hover:scale-110 transition-all border border-white/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <span className="relative z-10 drop-shadow-md">{story.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">{story.prophet}</h3>
                      <p className="text-xs text-[var(--color-primary-light)] font-bold mb-2">{story.title}</p>
                      <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                        {story.brief}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                      <ChevronLeft size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-20"
            >
              <button
                onClick={() => setSelectedStory(null)}
                className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-6 hover:opacity-80 transition-opacity"
              >
                <ArrowRight size={20} />
                <span>العودة للقائمة</span>
              </button>

              <div className="bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-xl border border-black/5 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-4xl shadow-[0_10px_20px_rgba(27,67,50,0.3)]">
                    {selectedStory.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">{selectedStory.prophet}</h2>
                    <p className="text-[var(--color-primary)] font-bold">{selectedStory.title}</p>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-[var(--color-primary)]">
                      <BookOpen size={20} />
                      <h3 className="text-lg font-bold">القصة</h3>
                    </div>
                    <div className="space-y-4">
                      {selectedStory.fullStory.map((paragraph, idx) => (
                        <p key={idx} className="text-[var(--color-text)] leading-loose text-justify bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-4 text-[var(--color-gold)]">
                      <Star size={20} />
                      <h3 className="text-lg font-bold">الدروس المستفادة</h3>
                    </div>
                    <ul className="space-y-3">
                      {selectedStory.lessons.map((lesson, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-[var(--color-gold)]/10 p-4 rounded-2xl">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-gold)] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-[var(--color-text)] font-medium leading-relaxed">{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

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
  },
  {
    id: "yusuf",
    prophet: "يوسف عليه السلام",
    title: "الصديق",
    brief: "قصة إلقائه في الجب، وسجنه، ثم توليه خزائن مصر.",
    icon: "👑",
    fullStory: [
      "رأى يوسف في منامه أحد عشر كوكباً والشمس والقمر يسجدون له، فقص الرؤيا على أبيه يعقوب الذي حذره من إخوته.",
      "حسده إخوته وألقوه في البئر، ثم بيع كعبد في مصر، وتربى في بيت العزيز. تعرض لفتنة عظيمة فآثر السجن على المعصية.",
      "فسر رؤيا الملك فخرج من السجن وأصبح عزيز مصر، وجمع الله شمله بأهله وتحققت رؤياه."
    ],
    lessons: [
      "الصبر على البلاء والمحن يؤدي إلى التمكين.",
      "العفة والتقوى طوق النجاة من الفتن.",
      "عاقبة الحسد وخيمة، والتسامح من شيم الكرام."
    ]
  },
  {
    id: "yunus",
    prophet: "يونس عليه السلام",
    title: "ذو النون",
    brief: "قصة خروجه غاضباً من قومه، وابتلاع الحوت له، ثم نجاته.",
    icon: "🐋",
    fullStory: [
      "دعا يونس قومه طويلاً فلم يستجيبوا، فغضب وخرج من بينهم قبل أن يأذن الله له.",
      "ركب سفينة وهاج البحر، فاقترعوا وألقوه في البحر، فابتلعه حوت عظيم بأمر الله.",
      "نادى في الظلمات: 'لا إله إلا أنت سبحانك إني كنت من الظالمين'، فنجاه الله وعاد لقومه فوجدهم قد آمنوا."
    ],
    lessons: [
      "عدم اليأس من رحمة الله مهما اشتدت الكروب.",
      "فضل التسبيح والدعاء في تفريج الهموم.",
      "الالتزام بأوامر الله وعدم التسرع."
    ]
  },
  {
    id: "ayyub",
    prophet: "أيوب عليه السلام",
    title: "رمز الصبر",
    brief: "قصة ابتلائه في ماله وولده وصحته، وصبره الجميل.",
    icon: "🤲",
    fullStory: [
      "كان أيوب غنياً وله أولاد كثيرون، فابتلاه الله بفقد ماله وولده، ثم ابتلاه في جسده بمرض شديد طال سنوات.",
      "صبر أيوب صبراً عظيماً ولم يشتكِ إلا لله، وكانت زوجته وفية له تخدمه في مرضه.",
      "دعا ربه: 'أني مسني الضر وأنت أرحم الراحمين'، فكشف الله ضره وعوضه أهله وماله مضاعفاً."
    ],
    lessons: [
      "الصبر على الابتلاء يرفع الدرجات ويكفر السيئات.",
      "الدعاء والتضرع لله هو مفتاح الفرج.",
      "وفاء الزوجة الصالحة في وقت الشدة."
    ]
  },
  {
    id: "sulaiman",
    prophet: "سليمان عليه السلام",
    title: "الملك النبي",
    brief: "قصة ملكه العظيم، وتسخير الجن والطير والرياح له.",
    icon: "🏰",
    fullStory: [
      "ورث سليمان الملك والنبوة عن أبيه داود، وسأل الله ملكاً لا ينبغي لأحد من بعده، فاستجاب له.",
      "سخر الله له الرياح تجري بأمره، والجن يبنون له ما يشاء، وعلمه منطق الطير والحيوانات.",
      "قصته مع ملكة سبأ (بلقيس) حيث دعاها للإيمان، فجاءت مسلمة لله رب العالمين."
    ],
    lessons: [
      "الشكر على النعم يزيدها ويبارك فيها.",
      "استخدام القوة والملك في طاعة الله ونشر الحق.",
      "التواضع لله رغم امتلاك أعظم ملك في الأرض."
    ]
  },
  {
    id: "idris",
    prophet: "إدريس عليه السلام",
    title: "أول من خط بالقلم",
    brief: "قصة رفعه مكاناً علياً، واجتهاده في العبادة والدعوة.",
    icon: "✍️",
    fullStory: [
      "كان إدريس عليه السلام أول نبي بعد آدم وشيث، وأول من خط بالقلم وخاط الثياب ولبس المخيط.",
      "دعا قومه إلى الله بالحكمة والموعظة الحسنة، وكان كثير العبادة والصيام والقيام.",
      "رفعه الله مكاناً علياً تكريماً له على اجتهاده وإخلاصه في طاعة ربه."
    ],
    lessons: [
      "فضل العلم والتعلم والعمل باليد.",
      "الاجتهاد في العبادة يرفع درجات المؤمن.",
      "الدعوة إلى الله بالحكمة والموعظة."
    ]
  },
  {
    id: "hud",
    prophet: "هود عليه السلام",
    title: "نبي عاد",
    brief: "قصة دعوته لقوم عاد أصحاب القوة والبطش، وإهلاكهم بالريح الصرصر.",
    icon: "🌪️",
    fullStory: [
      "أرسل الله هوداً إلى قوم عاد الذين كانوا يتمتعون بقوة جسدية هائلة وبنوا إرم ذات العماد.",
      "دعاهم هود لعبادة الله وحده وترك الأصنام، لكنهم استكبروا واغتروا بقوتهم وقالوا: من أشد منا قوة؟",
      "أرسل الله عليهم ريحاً صرصراً عاتية سبع ليال وثمانية أيام حسوماً، فأهلكتهم ونجى الله هوداً والذين آمنوا معه."
    ],
    lessons: [
      "القوة المادية لا تغني عن الإنسان شيئاً أمام عذاب الله.",
      "الكبر والغرور يؤديان إلى الهلاك.",
      "شكر النعم يكون بطاعة المنعم."
    ]
  },
  {
    id: "salih",
    prophet: "صالح عليه السلام",
    title: "نبي ثمود",
    brief: "قصة الناقة المعجزة، وعقر قومه لها، والصيحة التي أهلكتهم.",
    icon: "🐪",
    fullStory: [
      "أرسل الله صالحاً إلى قوم ثمود الذين كانوا ينحتون من الجبال بيوتاً، فدعاهم إلى التوحيد.",
      "طلبوا منه معجزة ليؤمنوا، فأخرج الله لهم ناقة عظيمة من صخرة، وأمرهم صالح ألا يمسوها بسوء.",
      "طغى قومه وعقروا الناقة وتحدوا صالحاً أن يأتيهم بالعذاب، فأخذتهم الصيحة فأصبحوا في ديارهم جاثمين."
    ],
    lessons: [
      "المعجزات لا تكفي لهداية من أصر على العناد.",
      "التعدي على حرمات الله يجلب غضبه وعقابه.",
      "عاقبة المفسدين في الأرض الهلاك."
    ]
  },
  {
    id: "lut",
    prophet: "لوط عليه السلام",
    title: "نبي سدوم",
    brief: "قصة دعوته لقومه الذين أتوا الفاحشة، وإهلاكهم بحجارة من سجيل.",
    icon: "☄️",
    fullStory: [
      "أرسل الله لوطاً إلى قرية سدوم، وكان قومه يأتون فاحشة لم يسبقهم بها أحد من العالمين.",
      "نصحهم لوط وحذرهم من عذاب الله، لكنهم تمادوا في غيهم وحاولوا الاعتداء على ضيوفه (الملائكة).",
      "أمر الله لوطاً بالخروج من القرية ليلاً مع أهله إلا امرأته، ثم قلب الله القرية عاليها سافلها وأمطر عليهم حجارة من سجيل."
    ],
    lessons: [
      "خطورة الانحراف عن الفطرة السليمة.",
      "الأمر بالمعروف والنهي عن المنكر واجب على كل مؤمن.",
      "النجاة للمؤمنين الطاهرين، والهلاك للمفسدين."
    ]
  },
  {
    id: "shuayb",
    prophet: "شعيب عليه السلام",
    title: "خطيب الأنبياء",
    brief: "قصة دعوته لأهل مدين، ونهيهم عن التطفيف في المكيال والميزان.",
    icon: "⚖️",
    fullStory: [
      "أرسل الله شعيباً إلى أهل مدين، وكانوا يعبدون الأيكة ويبخسون الناس أشياءهم ويطففون الكيل والميزان.",
      "دعاهم شعيب إلى التوحيد وإيفاء الكيل والميزان بالقسط، وحذرهم من الفساد في الأرض.",
      "كذبوه وسخروا منه، فأخذتهم الرجفة وعذاب يوم الظلة، ونجى الله شعيباً والذين آمنوا معه."
    ],
    lessons: [
      "الأمانة والصدق في المعاملات التجارية من صميم الدين.",
      "الفساد الاقتصادي والظلم يؤديان إلى دمار المجتمعات.",
      "الدعوة إلى الإصلاح بالحسنى واللين."
    ]
  },
  {
    id: "dawud",
    prophet: "داود عليه السلام",
    title: "النبي الملك",
    brief: "قصة قتله لجالوت، وإلانة الحديد له، وتسبيح الجبال والطير معه.",
    icon: "🛡️",
    fullStory: [
      "كان داود جندياً في جيش طالوت، وقتل جالوت الجبار بحجر من مقلاعه، فآتاه الله الملك والحكمة.",
      "ألان الله له الحديد فكان يصنع منه الدروع السابغات، وكان يصوم يوماً ويفطر يوماً، ويقوم نصف الليل.",
      "آتاه الله الزبور، وكان إذا سبح سبحت معه الجبال والطير، وحكم بين الناس بالعدل."
    ],
    lessons: [
      "الشجاعة والإيمان يهزمان القوة المادية.",
      "العمل باليد وكسب الرزق الحلال من سنن الأنبياء.",
      "العدل في الحكم بين الناس."
    ]
  },
  {
    id: "zakariya",
    prophet: "زكريا عليه السلام",
    title: "كافل مريم",
    brief: "قصة كفالته لمريم، ودعائه ربه ليهب له ولداً في كبره.",
    icon: "🕌",
    fullStory: [
      "كان زكريا نبياً ونجاراً، وكفل مريم العذراء في المحراب، وكان كلما دخل عليها وجد عندها رزقاً.",
      "دعا ربه نداءً خفياً أن يهب له ولياً يرث النبوة، رغم كبر سنه وعقم زوجته.",
      "استجاب الله دعاءه وبشره بيحيى، وجعل له آية ألا يكلم الناس ثلاثة أيام إلا رمزاً."
    ],
    lessons: [
      "الدعاء بيقين وإخلاص لا يرد مهما كانت الأسباب الظاهرة مستحيلة.",
      "فضل كفالة الأيتام والصالحين.",
      "العمل لكسب الرزق لا ينافي النبوة والعبادة."
    ]
  },
  {
    id: "yahya",
    prophet: "يحيى عليه السلام",
    title: "الحصور العفيف",
    brief: "قصة إيتائه الحكم صبياً، وبره بوالديه، واستشهاده.",
    icon: "📜",
    fullStory: [
      "آتى الله يحيى الحكم والنبوة وهو صبي، وكان تقياً باراً بوالديه، ولم يكن جباراً عصياً.",
      "كان يدعو إلى الله ويأمر بالمعروف وينهى عن المنكر، وكان حصوراً لا يقرب الذنوب.",
      "استشهد دفاعاً عن الحق ورفضاً لزواج محرم لملك ظالم، فكان من الشهداء الأبرار."
    ],
    lessons: [
      "التقوى والصلاح منذ الصغر.",
      "بر الوالدين من أعظم القربات.",
      "الثبات على الحق وقول كلمة الحق عند سلطان جائر."
    ]
  }
];

export default function ProphetStories({ onBack }: { onBack: () => void }) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors bg-white dark:bg-slate-900 shadow-sm border border-black/5 dark:border-white/5"
        >
          <ArrowRight size={24} className="text-slate-500 dark:text-slate-400" />
        </button>
        <h1 className="text-2xl font-bold font-serif text-emerald-500">قصص الأنبياء</h1>
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
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-3xl text-white mb-4 shadow-lg relative overflow-hidden">
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
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 cursor-pointer hover:scale-[1.02] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/5 dark:border-white/5 relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-3xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(27,67,50,0.4)] transform group-hover:rotate-6 group-hover:scale-110 transition-all border border-white/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <span className="relative z-10 drop-shadow-md">{story.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{story.prophet}</h3>
                      <p className="text-xs text-emerald-400 font-bold mb-2">{story.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {story.brief}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
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
              className="pb-28"
            >
              <button
                onClick={() => setSelectedStory(null)}
                className="flex items-center gap-2 text-emerald-500 font-bold mb-6 hover:opacity-80 transition-opacity"
              >
                <ArrowRight size={20} />
                <span>العودة للقائمة</span>
              </button>

              <div className="card-3d bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-4xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-white/20">
                    {selectedStory.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{selectedStory.prophet}</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 inline-block rounded-full text-sm border border-emerald-100 dark:border-emerald-500/20">{selectedStory.title}</p>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-emerald-500">
                      <BookOpen size={20} />
                      <h3 className="text-xl font-bold">القصة</h3>
                    </div>
                    <div className="space-y-4">
                      {selectedStory.fullStory.map((paragraph, idx) => (
                        <p key={idx} className="text-slate-800 dark:text-slate-200 leading-loose text-justify glass dark:glass-dark p-5 rounded-2xl text-[15px] shadow-sm">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-4 text-amber-500">
                      <Star size={20} />
                      <h3 className="text-xl font-bold">الدروس المستفادة</h3>
                    </div>
                    <ul className="space-y-3">
                      {selectedStory.lessons.map((lesson, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-gradient-to-l from-amber-50/50 to-transparent dark:from-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/30">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                            {idx + 1}
                          </div>
                          <span className="text-slate-800 dark:text-slate-100 font-medium leading-relaxed">{lesson}</span>
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ChevronLeft, ArrowRight, Star, Clock, Sparkles, RefreshCw, Volume2, VolumeX, Search } from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';

interface Story {
  id: string;
  prophet: string;
  title: string;
  brief: string;
  fullStory: string[];
  lessons: string[];
  icon: string;
  image?: string;
}

const stories: Story[] = [
  {
    id: "adam",
    prophet: "آدم عليه السلام",
    title: "أبو البشر وأول الأنبياء",
    brief: "قصة خلق آدم عليه السلام، وسجود الملائكة له، وخروجه من الجنة.",
    icon: "🌍",
    image: "/src/assets/images/prophet_adam_1779801968069.png",
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
    image: "/src/assets/images/prophet_nuh_1779801987104.png",
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
    image: "/src/assets/images/prophet_ibrahim_1779802003890.png",
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
    image: "/src/assets/images/prophet_musa_1779802023223.png",
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
    image: "/src/assets/images/prophet_isa_1779802038520.png",
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
    image: "/src/assets/images/prophet_muhammad_1779802054739.png",
    fullStory: [
      "نزل الوحي على النبي ﷺ في غار حراء وهو في الأربعين من عمره، وبدأ دعوته سراً ثم جهراً في مكة.",
      "واجه أذى شديداً من قريش، فهاجر إلى المدينة المنورة حيث أسس أول دولة إسلامية.",
      "عاد فاتحاً لمكة بعد سنوات، وعفا عن أهلها، وأكمال الله به الدين وأتم النعمة."
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
    brief: "قصة إلقائه في الجب, وسجنه، ثم توليه خزائن مصر.",
    icon: "👑",
    image: "/src/assets/images/prophet_yusuf_1779802073332.png",
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
    image: "/src/assets/images/prophet_yunus_1779802090194.png",
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
    image: "/src/assets/images/prophet_ayyub_1779802108779.png",
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
    image: "/src/assets/images/prophet_sulaiman_1779802125526.png",
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
    image: "/src/assets/images/prophet_idris_1779802142314.png",
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
    image: "/src/assets/images/prophet_hud_1779802162051.png",
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
    image: "/src/assets/images/prophet_salih_1779802184298.png",
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
    image: "/src/assets/images/prophet_lut_1779802202937.png",
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
    image: "/src/assets/images/prophet_shuayb_1779802221816.png",
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
    image: "/src/assets/images/prophet_dawud_1779802236780.png",
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
    image: "/src/assets/images/hajj_kaaba_dome_1779803270795.png",
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
    image: "/src/assets/images/hadith_scroll_background_1779805688768.png",
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
  const [activeTab, setActiveTab] = useState<'stories' | 'ai_teller'>('stories');
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStoryResult, setAiStoryResult] = useState<{title: string, story: string[], lessons: string[]} | null>(null);
  
  // Voice states
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(() => {
    return localStorage.getItem('sheikh_voice_active') !== 'false';
  });

  // Handle SpeechSynthesis Toggle and Cancel
  useEffect(() => {
    localStorage.setItem('sheikh_voice_active', String(isVoiceActive));
    if (!isVoiceActive) {
      window.speechSynthesis?.cancel();
    }
  }, [isVoiceActive]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakWithSheikhVoice = (text: string) => {
    if (!isVoiceActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      
      // Clean up markdown syntax for voice reading
      const speechReadyText = text
        .replace(/[*#_`~\\-]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/[a-zA-Z]/g, '') // Hide non-arabic letters to avoid robotic spells
        .trim();

      const utterance = new SpeechSynthesisUtterance(speechReadyText);
      utterance.rate = 0.80;  // Calm, deliberate pacing
      utterance.pitch = 0.90; // Deep, masculine, wise sheikh tone of voice

      // Try finding direct Arabic male voices or fallback to avoiding female voices
      const voices = window.speechSynthesis.getVoices();
      const arVoices = voices.filter(v => v.lang.startsWith('ar') || v.lang.startsWith('AR'));
      
      const maleKeywords = ['naayf', 'maged', 'tarik', 'male', 'hazem', 'zakaria', 'shakir', 'youssef', 'saeed', 'hamzah', 'musa', 'salem', 'faisal', 'khalid', 'bassam', 'mohamed', 'omar', 'ali', 'ibrahim', 'boy', 'man', 'sheikh'];
      const femaleKeywords = ['hoda', 'mariam', 'leila', 'yasmin', 'zeina', 'sana', 'female', 'laila', 'salma', 'amina', 'rauda', 'zara', 'kamala', 'kamilah', 'fawzia', 'ghada', 'latifa', 'maha', 'noha', 'ranya', 'salwa', 'warda', 'girl', 'woman', 'lady'];

      let selectedVoice = arVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        return maleKeywords.some(keyword => nameLower.includes(keyword));
      });

      if (!selectedVoice) {
        selectedVoice = arVoices.find(v => {
          const nameLower = v.name.toLowerCase();
          return !femaleKeywords.some(keyword => nameLower.includes(keyword));
        });
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else if (arVoices.length > 0) {
        utterance.voice = arVoices[0];
      } else {
        utterance.lang = 'ar-EG';
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis failure:", e);
    }
  };

  const suggestedTopics = [
    "أصحاب الكهف واليقين بالله",
    "قصة ذي القرنين ورحلته لغروب الشمس",
    "فتنة الثراء الزائف في قصة قارون",
    "أصحاب الأخدود والثبات الراسخ",
    "لقاء طالوت وجالوت ونصرة الفئة القليلة",
    "قصة مؤمن آل فرعون البليغ وشجاعته"
  ];

  const handleGenerateAiStory = async (topic: string) => {
    if (!topic.trim()) return;
    setAiLoading(true);
    setAiStoryResult(null);
    window.speechSynthesis?.cancel();
    try {
      const gemini = getGeminiClient();
      const prompt = `أنت راوي قصص إسلامي حكيم، بليغ اللسان ومتمكن من السير النبوية والقرآنية وقصص الصالحين والتابعين.
يرغب المستخدم في سرد قصة ملهمة وعميقة ومعبرة عن: "${topic}".
قم بصياغة القصة بأسلوب أدبي بليغ، مشوق، وموثق بالدروس الروحية الهادفة لقلب العبد الخاشع.
أرجع النتيجة بصيغة JSON محكمة بالهيكل التالي تماماً دون أي علامات تحيط بالبيانات سوى الكود نفسه:
{
  "title": "عنوان القصة البليغ والمهيب",
  "story": ["الفقرة الأولى السردية بوضوح وحركات إعرابية بليغة", "الفقرة الثانية...", "الفقرة الثالثة..."],
  "lessons": ["الدرس والعبرة الأولى بطريقة وعظية مؤثرة", "الدرس الثاني...", "الدرس الثالث..."]
}`;

      const res = await gemini.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (res && res.text) {
        const parsed = JSON.parse(res.text.trim());
        setAiStoryResult(parsed);
        const voiceText = `${parsed.title}. ${parsed.story[0]}`;
        speakWithSheikhVoice(voiceText);
      }
    } catch (e) {
      console.error(e);
      // Fallback stable offline story
      const fallback = {
        title: `قصة العبرة والإيمان في ${topic}`,
        story: [
          `كان في غابر الأزمان نفحات وتجارب إيمانية عظيمة تتجلى في الصدق واليقين بالله تعالى. وتعتبر هذه القصة منارة لكل سائر يسعى للسكينة الإيمانية والتقرب لله رب العالمين.`,
          `إن الصدق مع الله والعمل الصالح والتوكل المطلق في السراء والضراء هما الأساس المتين الذي نجا به الصالحون وحازوا به الدرجات الرفيعة ونالوا به رضوان الله.`
        ],
        lessons: [
          "الإيمان المطلق والتوكل على الله يجلب السكينة والنصر والفتح المبين.",
          "الصدق والثبات في المحن يرفع قدر العبد ويعز مكانه في الدنيا والآخرة."
        ]
      };
      setAiStoryResult(fallback);
      speakWithSheikhVoice(`${fallback.title}. ${fallback.story[0]}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors bg-white dark:bg-slate-900 shadow-sm border border-black/5 dark:border-white/5"
        >
          <ArrowRight size={24} className="text-slate-500 dark:text-slate-400" />
        </button>
        <h1 className="text-2xl font-bold font-serif text-emerald-500">قصص الأنبياء</h1>
      </div>

      <div className="p-4 flex-1">
        {!selectedStory && (
          <div className="grid grid-cols-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs mb-4">
            <button
              onClick={() => {
                setActiveTab('stories');
                window.speechSynthesis?.cancel();
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'stories'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              مكتبة القصص ({stories.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('ai_teller');
                window.speechSynthesis?.cancel();
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ai_teller'
                  ? 'bg-[#0D5C4D] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              <Sparkles size={12} className="text-amber-400" />
              <span>الراوي الذكي (AI)</span>
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!selectedStory ? (
            activeTab === 'stories' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 gap-4 pb-20"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-3xl text-white mb-4 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mt-10 "></div>
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
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity z-20"></div>
                    {story.image && (
                       <div className="absolute inset-0 z-0">
                         <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundImage: `url(${story.image})` }}></div>
                         <div className="absolute inset-0 bg-gradient-to-l from-white/95 via-white/80 to-transparent dark:from-slate-900/95 dark:via-slate-900/80 dark:to-transparent"></div>
                       </div>
                    )}
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center shadow-lg transform group-hover:rotate-3 group-hover:scale-110 transition-all relative overflow-hidden shrink-0">
                        {story.image ? (
                          <img 
                            src={story.image} 
                            alt={story.prophet} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-white text-lg">
                            {story.prophet[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{story.prophet}</h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-2">{story.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {story.brief}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                        <ChevronLeft size={18} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="ai_teller"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pb-20 text-right"
              >
                {/* AI banner */}
                <div className="bg-gradient-to-br from-[#0D5C4D] to-[#041D15] p-5 rounded-3xl text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full translate-x-6 translate-y-6"></div>
                  <div className="flex justify-between items-start">
                    <span className="bg-amber-400 text-slate-900 text-[9px] font-extrabold px-2.5 py-0.5 rounded-lg">راوي السير والنفحات</span>
                    <button
                      onClick={() => setIsVoiceActive(prev => !prev)}
                      className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                        isVoiceActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                      title="تفعيل قراءة الشيخ"
                    >
                      {isVoiceActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
                    </button>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#E2C392] mt-1.5">راوي قصص الأنبياء والصالحين الذكي</h4>
                  <p className="text-[10.5px] text-emerald-100/90 leading-relaxed mt-1">
                    أدخل موضوع قصة قرآنية، قصة صحابي، أو نبي تريد سماع تفاصيلها بأسلوب أدبي وعظي بليغ، ودع الذكاء الاصطناعي يروي لك روائع العبر والدروس.
                  </p>
                </div>

                {/* Input area */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-black/5 dark:border-white/5 shadow-xs space-y-3">
                  <p className="text-[10.5px] font-black text-slate-400">اطلب قصة مخصصة أو اكتب اسم صحابي:</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="مثال: أصحاب الكهف، ذو القرنين، عثمان بن عفان..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGenerateAiStory(aiTopic);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-2xl text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-serif font-black"
                    />
                    <button
                      onClick={() => handleGenerateAiStory(aiTopic)}
                      disabled={aiLoading || !aiTopic.trim()}
                      className="absolute left-2.5 top-2.5 p-1.5 bg-[#0D5C4D] hover:bg-emerald-700 text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    </button>
                  </div>

                  {/* Suggested buttons */}
                  <div className="space-y-1.5">
                    <p className="text-[9.5px] font-bold text-slate-400">💡 نفحات مقترحة:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedTopics.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setAiTopic(topic);
                            handleGenerateAiStory(topic);
                          }}
                          disabled={aiLoading}
                          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-emerald-500/10 text-[10px] text-slate-650 dark:text-slate-350 border border-black/5 dark:border-white/5 rounded-xl transition-all cursor-pointer"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Output area */}
                {aiLoading && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-black/5 dark:border-white/5 text-center space-y-2">
                    <RefreshCw size={24} className="animate-spin text-[#0D5C4D] mx-auto" />
                    <p className="text-xs text-slate-500">يقوم الراوي بصياغة القصة بأسلوب بليغ مشوق ومراجعة المصادر والدروس...</p>
                  </div>
                )}

                {aiStoryResult && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E2C392]/30 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full translate-x-12 -translate-y-12"></div>
                    
                    <div className="border-b border-slate-50 dark:border-slate-800 pb-3">
                      <h4 className="text-[10px] font-black text-amber-500 mb-1">القصة الذكية الملهمة</h4>
                      <h3 className="text-xl font-black text-[#0D5C4D] dark:text-emerald-400 font-serif leading-tight">
                        {aiStoryResult.title}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <BookOpen size={16} />
                        <span className="text-xs font-black">السرد والتفاصيل:</span>
                      </div>
                      <div className="space-y-3">
                        {aiStoryResult.story.map((para, idx) => (
                          <p key={idx} className="text-[13px] text-slate-850 dark:text-slate-200 leading-relaxed text-justify bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-black/5 dark:border-white/5 font-serif font-medium">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <Star size={16} />
                        <span className="text-xs font-black">العبر والدروس المستفادة:</span>
                      </div>
                      <div className="space-y-2">
                        {aiStoryResult.lessons.map((lesson, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-[12px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {lesson}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
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
                {selectedStory.image ? (
                  <>
                    <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none" style={{ backgroundImage: `url(${selectedStory.image})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-white/95 to-white dark:from-slate-900/90 dark:via-slate-900/95 dark:to-slate-900"></div>
                  </>
                ) : (
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-20 -mt-20 "></div>
                )}
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900 border border-emerald-500/20 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
                    {selectedStory.image ? (
                      <img 
                        src={selectedStory.image} 
                        alt={selectedStory.prophet} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-white text-xl">
                        {selectedStory.prophet[0]}
                      </div>
                    )}
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

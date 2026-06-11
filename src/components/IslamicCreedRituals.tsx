import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Compass,
  Activity,
  Heart,
  ChevronLeft,
  Search,
  Quote,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  Lock,
  Globe,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

interface CreedItem {
  title: string;
  sub: string;
  desc: string;
  quranVerse: string;
  quranReference: string;
  insights: string[];
}

interface RitualItem {
  id: string;
  title: string;
  desc: string;
  steps: { title: string; content: string }[];
  proof: string;
}

const CREED_ITEMS: CreedItem[] = [
  {
    title: "الإيمان بالله تبارك وتعالى",
    sub: "إفراد الخالق بالعبادة والربوبية والأسماء الحسنى",
    desc: "هو الركن الأعظم والأساس المعين لعقيدة المسلم، ويعني التصديق الجازم واليقين المطلق بوجود الله سبحانه وتعالى، وأنه رب كل شيء ومليكه والخالق الرازق المدبر لكل أمر الكون، وأنه الفرد الصمد المستحق وحده لجميع أنواع العبادة، وتنزيهه عن كل شريك أو والد أو ولد.",
    quranVerse: "۞ شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ ۚ لَا إِلَٰهَ إِلَّا هُوَ الْعَزِيزُ الْحَكِيمُ",
    quranReference: "[سورة آل عمران: 18]",
    insights: [
      "مبدأ الوحدانية المطلقة وتجريد العبادة من الرياء والشرك.",
      "عبادة المحبة والرجاء والخوف إيماناً بقدرته ورحمته.",
      "التسليم الكامل لأمر الله وحكمه في كونه وخلقه مع التوكل عليه وحسن الظن به."
    ]
  },
  {
    title: "الإيمان بالملائكة الأبرار",
    sub: "التصديق بخلق الله الطائعين والموكلين بتدبير كونه",
    desc: "الملائكة هم عباد مكرمون جُبلوا على الطاعة التامة لا يعصون الله ما أمرهم ويفعلون ما يؤمرون. خلقهم الله تبارك وتعالى من نور للقيام بوظائف غيبية دقيقة أمرهم بها كإنزال الوحي وكتابة الحسنات والسيئات وحفظ العباد وقبض الأرواح في الآجال المقدرة.",
    quranVerse: "۞ لَّا يَعْصُونَ اللَّهَ مَا أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ",
    quranReference: "[سورة التحريم: 6]",
    insights: [
      "جبريل عليه السلام: الروح الأمين الموكل بإنزال الوحي الإلهي على الأنبياء والرسل.",
      "ميكائيل عليه السلام: الموكل بالقطر والمطر والنبات والرزق بإذن ربه.",
      "إسرافيل عليه السلام: الموكل بالنفخ في الصور إيذاناً بقيام القيامة والبعث الكلي.",
      "الكرام الكاتبون: ملائكة ملازمون للعبد يكتبون أعماله وأقواله بدقة وأمانة بالليل والنهار."
    ]
  },
  {
    title: "الإيمان بالكتب السماوية المنزلة",
    sub: "التصديق بكلام الله الموجه لهداية البشرية وتعبيدهم له",
    desc: "يعني التصديق بجميع الكتب والرسالات التي أنزلها سبحانه على رسله لهداية البشر، ومحبة ما جاء فيها من النور والحق. وتتضمن الكتب الإلهية المنزلة: التوراة (على موسى عليه السلام)، الإنجيل (على عيسى عليه السلام)، الزبور (على داود عليه السلام)، صحف إبراهيم وموسى، والقرآن الكريم وهو الكتاب الخاتم المهيمن على ما قبله من الكتب وحافظها ولا يطاله تحريف.",
    quranVerse: "۞ آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ",
    quranReference: "[سورة البقرة: 285]",
    insights: [
      "القرآن الكريم هو كلام الله تعالى اللفظي المنزل على نبينا محمد ﷺ المتعبد بتلاوته والمعجز إلى يوم البعث.",
      "تكفل الله سبحانه بحفظ القرآن الكريم كلياً من الزيادة والنقص والتبديل بخلاف الكتب السابقة المنسوخة.",
      "يتحتم على المسلم تدبر آيات القرآن والعمل بآياته وأحكامه وجعله دستوراً شاملاً لحياته."
    ]
  },
  {
    title: "الإيمان بالرسل والأنبياء عليهم السلام",
    sub: "التصديق بسفراء الوحي وأئمة الهدى المختارين",
    desc: "هو الإيمان والاعتراف الجازم بأن الله سبحانه اختار صفوة وخياراً من عباده البشر واصطفاهم بالرسالة والنبوة ليبلغوا دينه وعقيدة التوحيد للناس، وإخراجهم من ظلمات الشرك والجهل إلى نور اليقين والهدى. هؤلاء هم الأنبياء والرسل، نقر بصدقهم وتأييد الله لهم بالمعجزات المشرقة ولا نفرق بين أحد منهم.",
    quranVerse: "۞ وَلَقَدْ بَعَثْنَا فِي كُلِّ أُمَّةٍ رَّسُولًا أَنِ اعْبُدُوا اللَّهَ وَاجْتَنِبُوا الطَّاغُوتَ",
    quranReference: "[سورة النحل: 36]",
    insights: [
      "أولو العزم من الرسل هم الأكثر صبراً وتحملاً في الله: نوح، إبراهيم، موسى، عيسى، ومحمد (عليهم أفضل الصلاة والسلام).",
      "نبينا وحبيبنا محمد ﷺ هو خاتم الأنبياء والمرسلين المبعوث رحمة للعالمين، كافة للناس أجمعين.",
      "الأنبياء معصومون في تبليغ الرسالة والدعوة للحق والتوحيد لله الأحد الفرد الصمد."
    ]
  },
  {
    title: "الإيمان باليوم الآخر والبعث والحساب",
    sub: "اليقين باليوم الموعود وجزاء العدل الإلهي المطلق",
    desc: "هو الإيمان الراسخ المتين بيوم القيامة؛ اليوم الذي يبعث الله فيه الخلائق من القبور لحساب موازينهم وجزائهم على أعمالهم في الحياة الدنيا. يشمل الإيمان باليوم الآخر كل ما يحدث بعد الموت من فتنة القبر ونعيمه وعذابه، والنفخ في الصور، والنشور والحشر، وتطاير الصحف، والميزان، والصراط، وحوض النبي ﷺ العذب، والاستقرار الدائم إما في الجنة برحمة الباري أو في النار بعدله وغضبه.",
    quranVerse: "۞ وَتَرَى الْأَرْضَ هَامِدَةً فَإِذَا أَنزَلْنَا عَلَيْهَا الْمَاءَ اهْتَزَّتْ وَرَبَتْ وَأَنبَتَتْ مِن كُلِّ زَوْجٍ بَهِيجٍ * ذَٰلِكَ بِأَنَّ اللَّهَ هُوَ الْحَقُّ وَأَنَّهُ يُحْيِي الْمَوْتَىٰ وَأَنَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    quranReference: "[سورة الحج: 5-6]",
    insights: [
      "عذاب القبر ونعيمه وفتنة سؤال الملكين (من ربك؟ ما دينك؟ من نبيك؟) هي أول منازل الآخرة.",
      "الميزان حقيقة لوزن حسنات العباد وسيئاتهم بدقة متناهية لا تظلم نفساً شيئاً.",
      "الجنة هي دار الأبرار ونعيمها أبدي سرمدي لا ينقطع، وأعظم نعمها رؤية وجه ربها تبارك وتعالى."
    ]
  },
  {
    title: "الإيمان بالقدر خيره وشره من الله",
    sub: "التسليم بعلم الله التام وتدبيره ومشيئته الخالقة",
    desc: "هو التصديق الجازم بأن الله سبحانه علم مقادير الأشياء وكتبها في اللوح المحفوظ قبل خلق السماوات والأرض بخمسين ألف سنة، وأن كل ما يقع في الكون من حركة أو سكون، خير أو شر، نفع أو ضر، يجري بتقديره ومشيئته التي لا تقهر وخلقه المبدع لكل كائن وفعل. للمسلم في هذا الركن طمأنينة ووقاية من الجزع والقنوط واليأس.",
    quranVerse: "۞ إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ",
    quranReference: "[سورة القمر: 49]",
    insights: [
      "علم الله التام المحيط بالأشياء قبل كونها وحدوثها.",
      "الكتابة: كتابة كافة الأقدار وتفاصيل حركات الخلائق في الذكر الحكيم (اللوح المحفوظ).",
      "المشيئة والنافذة: فما شاء الله كان وما لم يشأ لم يكن ولا تخرج ذرة في الوجود عن مشيئته.",
      "الخلق: فالله خالق العباد وأفعالهم وقدراتهم، مع منحهم إرادة اختيارية بموجب تكليفهم وابتلائهم."
    ]
  }
];

const TOWHEED_SECTION = {
  title: "منهج توحيد الله سبحانه وتعالى",
  desc: "التوحيد هو أول دعائم الإسلام ومطلب العبودية الأول ومفتاح الفوز برضا الله، وينقسم فقهياً وتدبرياً إلى ثلاثة أقسام تضمن سلامة العقيدة والتصديق:",
  categories: [
    {
      title: "1. توحيد الربوبية (توحيد الأفعال)",
      definition: "هو إفراد الله تعالى بأفعاله جلّ وعلا كالخلق والملك والتنظيم والإحياء والإماتة وسائر التدابير الكونية.",
      meaning: "أن يوقن المؤمن يقيناً حاداً لا مرية فيه بأن المدبر والمشرف والرازق لهذا العالم والكون هو الله تبارك وتعالى وحده، مسبب الأسباب ولا حراك في ذرات الفضاء ومجرات الأثير إلا بسلطانه.",
      verse: "ۗ أَلَا لَهُ الْخَلْقُ وَالْأَمْرُ ۗ تَبَارَكَ اللَّهُ رَبُّ الْعَالَمِينَ [سورة الأعراف: 54]"
    },
    {
      title: "2. توحيد الألوهية (توحيد العبادة)",
      definition: "هو إفراد الله سبحانه وتعالى بجميع أنواع العبادات الظاهرة والباطنة القولية والفعلية.",
      meaning: "فلا يجوز التوجه بذرة خشوع أو دعاء أو صلاة أو ذبح أو نذر أو خوف أو رجاء أو توكل إلا لله الأحد؛ فمن توجه بشيء من العبادة لغير الله فقد وقع في الشرك الأكبر عافانا الله.",
      verse: "۞ وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا [سورة الإسراء: 23]"
    },
    {
      title: "3. توحيد الأسماء والصفات",
      definition: "هو إثبات ما أثبته الله لنفسه وما أثبته له رسوله مـن الأسماء والصفات من غير تحريف ولا تعطيل ولا تكييف ولا تمثيل.",
      meaning: "نصف الخالق تبارك وتعالى بما وصف به جلاله في كتابه الكريم وسنة نبيه ﷺ كسميع بصير، رحمن رحيم، ذو قدرة وقوة، دون تشبيه بصفات المخلوقين أو تعطيل لمعانيها الربانية العظيمة.",
      verse: "۞ لَيْسَ كَمِثْلِهِ شَيْءٌ ۖ وَهُوَ السَّمِيعُ الْبَصِيرُ [سورة الشورى: 11]"
    }
  ]
};

const RITUALS_ITEMS: RitualItem[] = [
  {
    id: "prayer",
    title: "كيفية الوضوء والصلاة الصحيحة",
    desc: "الصلاة هي عماد الدين ورأس العبادات البدنية وصلة الوصل اليومية بين العبد وخالقه ومرباه تبارك وتعالى.",
    proof: "«صلوا كما رأيتموني أصلي» [حديث صحيح رواه البخاري]",
    steps: [
      { title: "إلزام الطهارة والوضوء", content: "البدء بالنية الباطنة للتطهر، غسل الكفين ثلاثاً، المضمضة والاستنشاق ثلاثاً، غسل الوجه كاملاً من منابت الشعر إلى أسفل الذقن، غسل الذراعين حتى المرفقين ثلاثاً، مسح الرأس والأذنين مرة واحدة، وغسل الرجلين للكعبين ثلاثاً." },
      { title: "استقبال القبلة وتكبيرة الإحرام", content: "تستقبل الكعبة الشريفة وتستحضر النية بقلبك خاشعاً لله، ترفع يديك محاذاة منكبيك وتقول جازماً: 'اللهُ أَكْبَر' واضعاً يدك اليمنى على اليسرى فوق صدرك." },
      { title: "قراءة دعاء الاستفتاح والفاتحة وما تيسر", content: "تقرأ دعاء الاستفتاح سراً، ثم تقرأ سورة الفاتحة مستشعراً وقوفك بين يدي ربك وتؤمن بعدها (آمين). ثم تقرأ سورة أو آيات من القرآن الكريم بالخشوع والتدبر." },
      { title: "الركوع والرفع منه بركوع تام طمأنينة", content: "تكبر وتركع حانياً ظهرك وممسكاً ركبتيك بيديك، معظماً ربك قائلاً: 'سبحان ربي العظيم' ثلاثاً. ثم ترفع قائلاً: 'سمع الله لمن حمده' وتقول مستوياً: 'ربنا ولك الحمد'." },
      { title: "السجود التام العظيم لرب العالمين", content: "تكبر وتسجد على الأعضاء السبعة (الجبهة والأنف، الكفان، الركبتان، أطراف القدمين) في خشوع مطلق، معلناً ذلّتك وعزتك بربك قائلاً: 'سبحان ربي الأعلى' ثلاثاً، وتكثر من طمأنينة الدعاء." },
      { title: "التشهد والتسليم", content: "بعد الركعات تقوم بالجلوس لقول التحيات المباركة لله والشهادتين والصلاة الإبراهيمية، ثم تلتفت يميناً قائلاً: 'السلام عليكم ورحمة الله' ويساراً كذلك." }
    ]
  },
  {
    id: "zakat",
    title: "فقه وفريضة الزكاة",
    desc: "الزكاة هي حق الله الواجب في أموال الأغنياء يُدفع للفقراء والمستحقين تطهيراً للمال ونماء للخير في النفوس.",
    proof: "«وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ...» [سورة البقرة: 43]",
    steps: [
      { title: "بلوغ النصاب", content: "وهو الحد الأدنى من المال الذي يوجب الزكاة إذا ملكه العبد. يقدر نصاب الذهب بـ 85 غراماً من الذهب الصافي (عيار 24) أو ما يعادلها نقداً من العملات السائدة." },
      { title: "مرور الحول الشرعي", content: "يتحتم بقاء هذا المال البالغ للنصاب في حوزة صاحبه عاماً هجرياً كاملاً (حول كامل) ولا تراجع دون النصاب في منعرجه." },
      { title: "مقدار الزكاة المستحقة", content: "المقدار الواجب إخراجه من النقود وعروض التجارة هو ربع العشر (2.5%) من إجمالي المال المدخر الزائد عن حوايجك الأساسية." },
      { title: "أوجه الصرف الشرعية (المستحقون)", content: "تصرف في المصارف الثمانية التي بينها الله تعالى: وفي الصدارة الفقراء والمساكين وابن السبيل وفي الرقاب والغارمون والمؤلفة قلوبهم وفي سبيل الله والذين يحملون عوز الجسد للعيش." }
    ]
  },
  {
    id: "fasting",
    title: "فريضة الصيام المباركة",
    desc: "الصيام هو الإمساك التعبدي الطاهر عن المفطرات والشهوات من طلوع الفجر الثاني الصادق إلى غروب الشمس بكامل النية لله.",
    proof: "«يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ» [سورة البقرة: 183]",
    steps: [
      { title: "تبييت النية الإيمانية", content: "تستوجب العبادة نية باطنة مسبقة صالحة لله للقيام بالصوم الواجب فرضاً طيلة أيام شهر رمضان المبارك، وتكون النية بالقلب دون حاجة للتلفظ." },
      { title: "الإمساك وحفظ الحواس", content: "الكف عن الطعام والشراب والشهوات، وصون اللسان والسمع والبصر عن اللغو والرفث والغيبة والنميمة لتمام الأجر ونقاء الروح." },
      { title: "سنن وآداب الصيام المستحبة", content: "في مقدمتها السحور وتأخيره لقوله ﷺ بركة، وتعجيل الإفطار فور التحقق من الغروب، والدعاء بالخير عند الفطر فإنه مستجاب واجتناب الغضب والسب." },
      { title: "مفسدات ومبطلات الصوم المتفق عليها", content: "كل ما يدلف مـن وجع طعام أو شراب عمداً للحلق والجوف، التقيؤ المتعمد، وخروج دم الحيض والنفاس لدى النساء المرضعات المكلفات." }
    ]
  },
  {
    id: "hajj",
    title: "مناسك الحج والعمرة خطوة بخطوة",
    desc: "الحج هو عبادة العمر وهو الرحلة الروحانية المطهّرة التي فرضها الله مرة في العمر لكل مسلم باسط للقدرة والاستطاعة البدنية والمالية.",
    proof: "«وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا...» [سورة آل عمران: 97]",
    steps: [
      { title: "الإحرام والتلبية الروحية", content: "الاغتسال للتطهر وارتداء لباس الإحرام الأبيض الخالي من الخياطة (للرجال)، التلبية بقلب باسط للتوحيد: 'لبيك اللهم لبيك، لبيك لا شريك لك لبيك'." },
      { title: "طواف القدوم بالبيت العتيق", content: "دخول المسجد الحرام للبدء بالطواف حول الكعبة الشريفة سبعة أشواط متتالية بدءاً من الحجر الأسود والانتهاء به، والإكثار من التهليل والدعاء." },
      { title: "السعي بين الصفا والمروة", content: "السعي بوقار وتأنٍ سبعة أشواط بدايتها الصفا وخاتمتها المروة، واضعاً نصب عينيك سعي أمنا هاجر رضي الله عنها بالتوكل." },
      { title: "يوم التروية والوقوف بعرفة العظيم", content: "التوجه لمنى في اليوم الثامن من ذي الحجة والمبيت بها السنن. ثم التوجه صبيحة اليوم التاسع للوقوف بصعيد عرفة الطاهر والاجتهاد بالدعاء حتى غروب شمسه." },
      { title: "المزدلفة والمبيت بمنى ورمي الجمرات", content: "بعد الإفاضة مـن عرفة، تبيت بمزدلفة لجمع الحصى وصلاتها غافلاً، ثم العبور لمنى في اليوم العاشر لرمي جمرة العقبة الكبرى والذبح والحلق، ثم طواف الإفاضة والتحلل." },
      { title: "طواف الوداع والختام", content: "يكون هو آخر عهدك بالبيت قبل الخروج والعودة لوطنك سالماً غانماً من المغفرة وعفو ربه الملك الأكبر." }
    ]
  }
];

export default function IslamicCreedRituals({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"creed" | "towheed" | "rituals" | "zakat_calc">("creed");
  const [activeCreedIndex, setActiveCreedIndex] = useState<number | null>(0);
  const [activeRitual, setActiveRitual] = useState<string>("prayer");

  // Simple Offline Zakat Calculator states
  const [goldPrice, setGoldPrice] = useState<string>("2400"); // Local price fallback
  const [cashAmount, setCashAmount] = useState<string>("");
  const [goldWeight, setGoldWeight] = useState<string>("");
  const [silverWeight, setSilverWeight] = useState<string>("");
  const [calcResult, setCalcResult] = useState<{
    cashZakat: number;
    goldZakat: number;
    silverZakat: number;
    totalZakat: number;
    reachedNisab: boolean;
    nisabLimit: number;
  } | null>(null);

  const calculateZakat = () => {
    const goldP = parseFloat(goldPrice) || 2400; // default average price in EGP/SAR/USD of 24k
    const cash = parseFloat(cashAmount) || 0;
    const goldW = parseFloat(goldWeight) || 0;
    const silverW = parseFloat(silverWeight) || 0;

    // Calculate Gold Nisab limit: 85g gold 24k
    const nisabLimit = 85 * goldP;
    
    let cashZ = 0;
    let goldZ = 0;
    let silverZ = 0;
    let reachedNisab = false;

    // Cash check
    if (cash >= nisabLimit) {
      reachedNisab = true;
      cashZ = cash * 0.025;
    }

    // Gold check (Nisab: 85g)
    if (goldW >= 85) {
      goldZ = (goldW * goldP) * 0.025;
    }

    // Silver check (Nisab: 595g)
    const silverP = goldP / 35; // Rough silver price ratio fallback
    if (silverW >= 595) {
      silverZ = (silverW * silverP) * 0.025;
    }

    setCalcResult({
      cashZakat: cashZ,
      goldZakat: goldZ,
      silverZakat: silverZ,
      totalZakat: cashZ + goldZ + silverZ,
      reachedNisab,
      nisabLimit
    });

    toast.success("تم احتساب مقادير زكاة المال والذهب الشرعية بنظام الفرز 🕌");
  };

  const handleShareArticle = (title: string, sub: string, text: string) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `${title}\n${sub}\n\n${text}\n\n- عبر تطبيق اليقين الإيماني 🕊️`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${title}\n${sub}\n\n${text}`);
      toast.success("تم نسخ مقال الإيمان والشعائر لمشاركته مع الصحبة الصالحة ✨");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 flex flex-col" dir="rtl">
      
      {/* Top Banner */}
      <div className="pt-12 pb-8 px-6 bg-[#0A1914] text-white rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden border-b border-amber-300/20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1080&auto=format&fit=crop")',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-[#0D5C4D]/60 via-[#0A1914]/90 to-[#041D15]/95 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-white/10 rounded-full transition-all border border-white/10 bg-white/5 shadow-md flex items-center justify-center cursor-pointer"
            >
              <ArrowRight size={22} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-serif leading-tight drop-shadow-md text-[#E2C392]">
                بوابة العقيدة والشعائر الإسلامية
              </h1>
              <p className="text-emerald-100/80 text-xs md:text-sm font-medium mt-1">
                دليلٌ تفاعلي مبسط يعزز فقه أركان الإيمان والتوحيد وشعائر العبادات الكبرى
              </p>
            </div>
          </div>
          <div className="w-12 h-12 bg-[#0D5C4D] backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-300/30 shadow-md shrink-0">
            <BookOpen size={24} className="text-[#E2C392]" />
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="p-4 max-w-2xl mx-auto w-full shrink-0">
        <div className="bg-white dark:bg-[#0A1914] p-1.5 rounded-2xl border border-slate-100 dark:border-emerald-950/30 shadow-sm flex gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("creed")}
            className={`flex-1 min-w-[90px] py-3 text-xs font-black rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeTab === "creed"
                ? "bg-[#0D5C4D] text-white shadow-md shadow-emerald-900/10"
                : "text-slate-500 hover:text-slate-800 dark:text-emerald-400 dark:hover:text-amber-300"
            }`}
          >
            🌟 أركان الإيمان الستة
          </button>
          
          <button
            onClick={() => setActiveTab("towheed")}
            className={`flex-1 min-w-[90px] py-3 text-xs font-black rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeTab === "towheed"
                ? "bg-[#0D5C4D] text-white shadow-md shadow-emerald-900/10"
                : "text-slate-500 hover:text-slate-800 dark:text-emerald-400 dark:hover:text-amber-300"
            }`}
          >
            🕋 عقيدة التوحيد
          </button>

          <button
            onClick={() => setActiveTab("rituals")}
            className={`flex-1 min-w-[90px] py-3 text-xs font-black rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeTab === "rituals"
                ? "bg-[#0D5C4D] text-white shadow-md shadow-emerald-900/10"
                : "text-slate-500 hover:text-slate-800 dark:text-emerald-400 dark:hover:text-amber-300"
            }`}
          >
            📖 شعائر الإسلام والكيفيات
          </button>

          <button
            onClick={() => setActiveTab("zakat_calc")}
            className={`flex-1 min-w-[90px] py-3 text-xs font-black rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeTab === "zakat_calc"
                ? "bg-[#0D5C4D] text-white shadow-md shadow-emerald-900/10"
                : "text-slate-500 hover:text-slate-800 dark:text-emerald-400 dark:hover:text-amber-300"
            }`}
          >
            💰 فقه وحاسبة الزكاة
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pb-28">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CREED (أركان الإيمان الستة) */}
          {activeTab === "creed" && (
            <motion.div
              key="creed-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/10 p-5 rounded-3xl mb-2 flex gap-3.5 items-start">
                <Sparkles size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-emerald-300 mb-1">أركان الإيمان الستة</h3>
                  <p className="text-xs text-slate-600 dark:text-emerald-100/70 leading-relaxed">
                    هي أساس العقيدة والاعتقاد الراسخ في الصدور الذي يحقق الطمأنينة الكاملة للوجدان الإنساني ويربط العبد بخالقه وغايات كونه. انقر على الركن للتفصيل والتدبر.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {CREED_ITEMS.map((item, idx) => {
                  const isOpen = activeCreedIndex === idx;
                  return (
                    <motion.div
                      key={idx}
                      className="bg-white dark:bg-[#0A1914] rounded-3xl overflow-hidden border border-slate-100 dark:border-emerald-950/40 shadow-sm"
                    >
                      <button
                        onClick={() => setActiveCreedIndex(isOpen ? null : idx)}
                        className="w-full text-right p-5 flex items-center justify-between select-none hover:bg-slate-50/40 dark:hover:bg-emerald-950/10 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-[#9F793E] dark:text-[#E2C392] flex items-center justify-center font-bold font-serif shadow-inner">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[#0D5C4D] dark:text-emerald-200 text-sm md:text-base">{item.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{item.sub}</p>
                          </div>
                        </div>
                        <ChevronLeft size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "transform -rotate-90 text-amber-500" : ""}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50/50 dark:bg-[#07130F]/45 border-t border-slate-50 dark:border-emerald-950/20"
                          >
                            <div className="p-6 space-y-5 text-right">
                              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                {item.desc}
                              </p>

                              {/* Quranic Verse display card */}
                              <div className="bg-emerald-500/5 dark:bg-[#0A261D]/80 border border-emerald-500/15 p-5 rounded-2xl text-center space-y-2">
                                <Quote size={20} className="text-amber-500/60 mx-auto" />
                                <p className="text-base md:text-lg font-serif font-semibold text-emerald-800 dark:text-emerald-200 leading-loose">
                                  {item.quranVerse}
                                </p>
                                <span className="block text-[10px] text-slate-400 font-bold tabular-nums">
                                  {item.quranReference}
                                </span>
                              </div>

                              {/* Insights Points */}
                              <div className="space-y-2.5">
                                <span className="block text-xs font-black text-amber-500">💡 وقفات وتجليات إيمانية للعمل بالفريضة:</span>
                                <ul className="space-y-2">
                                  {item.insights.map((insight, insIdx) => (
                                    <li key={insIdx} className="text-xs text-slate-600 dark:text-emerald-100/80 flex items-start gap-2 leading-relaxed">
                                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-1" />
                                      <span>{insight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Share bar */}
                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => handleShareArticle(item.title, item.sub, `${item.desc}\n\nدلائل: ${item.quranVerse}`)}
                                  className="p-2 px-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 text-xs font-bold text-slate-500 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-emerald-950/20 flex items-center gap-1.5 transition-all"
                                >
                                  <Share2 size={14} />
                                  <span>نشر العلم الروحاني</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: TOWHEED (منهج توحيد الله) */}
          {activeTab === "towheed" && (
            <motion.div
              key="towheed-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <div className="bg-gradient-to-r from-[#0D5C4D] to-[#0A1914] text-white p-6 rounded-[2rem] border border-emerald-500/20 shadow-md">
                <span className="bg-[#C59F60] text-black text-[8px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase inline-block mb-2">منار التوحيد</span>
                <h3 className="text-lg font-bold font-serif text-[#E2C392] mb-1">{TOWHEED_SECTION.title}</h3>
                <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                  {TOWHEED_SECTION.desc}
                </p>
              </div>

              <div className="space-y-4">
                {TOWHEED_SECTION.categories.map((cat, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#0A1914] border border-slate-100 dark:border-emerald-950/40 p-6 rounded-3xl shadow-sm space-y-4"
                  >
                    <h4 className="font-extrabold text-[#0D5C4D] dark:text-amber-300 text-sm md:text-base border-r-4 border-amber-500 pr-3.5">
                      {cat.title}
                    </h4>

                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-normal">
                        🔍 <b>التعريف الشرعي:</b> {cat.definition}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-emerald-100/75 leading-relaxed bg-slate-50 dark:bg-emerald-950/10 p-3.5 rounded-xl border border-slate-100 dark:border-emerald-950/10">
                        🤝 <b>دلالته ووجوبه:</b> {cat.meaning}
                      </p>
                    </div>

                    <div className="bg-[#FAF9F5] dark:bg-[#07130F] p-4 rounded-2xl border border-amber-500/10 text-center">
                      <span className="block text-[9px] font-black text-slate-400 mb-1">الشهادة والدليل الشرعي 📖</span>
                      <p className="text-sm font-serif font-bold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        {cat.verse}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: RITUALS (شعائر الإسلام وكيفيات الصلاة والحج والصوم) */}
          {activeTab === "rituals" && (
            <motion.div
              key="rituals-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              {/* Horizontal Choice for Ritual Section */}
              <div className="flex gap-2 p-1 bg-white/60 dark:bg-[#0C1210] border border-slate-150 dark:border-emerald-950/30 rounded-2xl overflow-x-auto">
                {RITUALS_ITEMS.map((rit) => (
                  <button
                    key={rit.id}
                    onClick={() => setActiveRitual(rit.id)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                      activeRitual === rit.id
                        ? "bg-[#0D5C4D] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:text-emerald-300 dark:hover:text-amber-200"
                    }`}
                  >
                    {rit.title.split(" ")[0]} {rit.id === "prayer" ? "الصلاة" : rit.id === "zakat" ? "الزكاة" : rit.id === "fasting" ? "الصيام" : "الحج"}
                  </button>
                ))}
              </div>

              {RITUALS_ITEMS.filter(r => r.id === activeRitual).map((rit) => (
                <div key={rit.id} className="space-y-4">
                  
                  {/* Head Info Card */}
                  <div className="bg-white dark:bg-[#0A1914] p-6 rounded-3xl border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-3">
                    <h3 className="font-black text-base md:text-lg text-[#0D5C4D] dark:text-[#E2C392]">{rit.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-emerald-100/70 leading-relaxed">{rit.desc}</p>
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center">
                      <span className="block text-[8px] text-slate-400 font-bold mb-0.5">الدليل من السنة والأثر 📖</span>
                      <p className="text-xs font-serif font-semibold text-amber-600 dark:text-amber-400 italic">
                        {rit.proof}
                      </p>
                    </div>
                  </div>

                  {/* Progressive Steps */}
                  <div className="space-y-3">
                    <span className="block text-xs font-black text-[#9F793E] px-1">🕊️ خطوات وإجراء العمل الشرعي الكامل:</span>
                    {rit.steps.map((st, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white dark:bg-[#0A1914] p-5 rounded-2xl border border-slate-100 dark:border-emerald-950/40 shadow-sm flex gap-4 items-start"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#0D5C4D]/10 dark:bg-[#0D5C4D]/25 text-[#0D5C4D] dark:text-[#E2C392] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-inner">
                          {sIdx + 1}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-xs md:text-sm font-extrabold text-[#0D5C4D] dark:text-emerald-200">
                            {st.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                            {st.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}

            </motion.div>
          )}

          {/* TAB 4: ZAKAT CALCULATOR (حاسبة الزكاة وفقه الأنصبة) */}
          {activeTab === "zakat_calc" && (
            <motion.div
              key="zakat-calc-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              
              <div className="bg-white dark:bg-[#0A1914] p-5 rounded-3xl border border-slate-100 dark:border-emerald-950/40 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  حاسبة الزكاة الذكية الميسرة
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-100/70 leading-relaxed p-1">
                  الزكاة ربع العشر (2.5%) مـن المال الذي حال عليه الحول وقد بلغ النصاب المقدر بـ <b>85 غراماً من الذهب الصافي عيار 24</b>. أدخل المدخرات والذهب والمقادير أدناه للتدقيق الفوري:
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-emerald-400 block mb-1">
                      سعر غرام الذهب عيار 24 حالياً بعملتك المحلية (افتراضي 2400):
                    </label>
                    <input
                      type="number"
                      value={goldPrice}
                      onChange={(e) => setGoldPrice(e.target.value)}
                      placeholder="امتداد السعر مثل 2400"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 dark:border-emerald-950/40 bg-slate-50 dark:bg-[#07130F] focus:outline-none focus:border-[#0D5C4D] text-slate-700 dark:text-slate-100"
                    />
                  </div>

                  <hr className="border-slate-100 dark:border-emerald-950/15" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-emerald-400 block mb-1">
                        المال والسيولة النقدية:
                      </label>
                      <input
                        type="number"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        placeholder="الأموال المدخرة"
                        className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 dark:border-emerald-950/40 bg-slate-50 dark:bg-[#07130F] focus:outline-none text-slate-700 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-emerald-400 block mb-1">
                        وزن الذهب الكلي بالجرام:
                      </label>
                      <input
                        type="number"
                        value={goldWeight}
                        onChange={(e) => setGoldWeight(e.target.value)}
                        placeholder="جرامات الذهب عيار 24"
                        className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 dark:border-emerald-950/40 bg-slate-50 dark:bg-[#07130F] focus:outline-none text-slate-700 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-emerald-400 block mb-1">
                        وزن الفضة بالجرام (اختياري):
                      </label>
                      <input
                        type="number"
                        value={silverWeight}
                        onChange={(e) => setSilverWeight(e.target.value)}
                        placeholder="مثال 600 جرام"
                        className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 dark:border-emerald-950/40 bg-slate-50 dark:bg-[#07130F] focus:outline-none text-slate-700 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    onClick={calculateZakat}
                    className="w-full py-3.5 bg-[#0D5C4D] hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all uppercase tracking-wider"
                  >
                    💡 احتساب مقادير الزكاة والنصاب الشرعي
                  </button>
                </div>
              </div>

              {calcResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-[#0A1914] p-6 rounded-[2rem] border-2 border-[#E2C392]/30 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-[#E2C392]">نتائج التدقيق والاحتساب المفتوح:</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                      calcResult.reachedNisab 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                    }`}>
                      {calcResult.reachedNisab ? "⚠️ بلغ مالك النصاب الشرعي (تجب الزكاة)" : "🍃 لم يبلغ مالك النصاب الشرعي"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-emerald-950/10 p-4 rounded-xl border border-slate-100 dark:border-emerald-950/10">
                      <span className="block text-[9px] text-[#9F793E] font-bold">نصاب زكاة المال النقدية:</span>
                      <span className="font-mono font-black text-base text-slate-800 dark:text-slate-100 tabular-nums">
                        {(calcResult.nisabLimit).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">(قيمة 85g ذهب عيار 24)</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-emerald-950/10 p-4 rounded-xl border border-slate-100 dark:border-emerald-950/10">
                      <span className="block text-[9px] text-emerald-600 font-bold">الزكاة المستحقة نقدياً:</span>
                      <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {(calcResult.cashZakat).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">(إذا حال عليها الحول كاملة)</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-emerald-950/10 p-4 rounded-xl border border-slate-100 dark:border-emerald-950/10">
                      <span className="block text-[9px] text-amber-500 font-bold">زكاة الذهب الوجوبية:</span>
                      <span className="font-mono font-black text-base text-amber-500 dark:text-amber-400 tabular-nums">
                        {(calcResult.goldZakat).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-emerald-950/10 p-4 rounded-xl border border-slate-100 dark:border-emerald-950/10">
                      <span className="block text-[9px] text-indigo-500 font-bold">إجمالي زكاة أموالك:</span>
                      <span className="font-mono font-black text-lg text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {(calcResult.totalZakat).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-500/5 rounded-2xl text-[10px] text-indigo-400/95 leading-normal flex gap-2">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span>
                      <b>تنويه فقهي:</b> زكاة الحلي المخصص للزينة والملبوس للمرأة اختلف فيه الفقهاء؛ فمنهم مـن أوجب فيه الزكاة ومنهم مـن عفا عنه. والشرع يسير وسؤال أهل الذكر أولى للورع والاحتياط.
                    </span>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

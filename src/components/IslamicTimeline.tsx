import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Hourglass } from 'lucide-react';

const timelineEvents = [
  { year: "1 هـ", event: "الهجرة النبوية", desc: "هجرة النبي محمد ﷺ وأصحابه من مكة إلى يثرب (التي سُميت بالمدينة المنورة). شكلت هذه الهجرة نقطة فاصلة، حيث تم تأسيس أول مجتمع إسلامي متكامل وبداية التقويم الهجري." },
  { year: "2 هـ", event: "غزوة بدر الكبرى", desc: "أول معركة فاصلة في تاريخ الإسلام، حيث خرج المسلمون لاعتراض قافلة لقريش، فالتقوا بجيش المشركين وانتصر المسلمون رغم قلة عددهم. وفي نفس العام تم فرض صيام رمضان وتحويل القبلة إلى الكعبة." },
  { year: "3 هـ", event: "غزوة أحد", desc: "وقعت عند جبل أحد، وفي البداية كان النصر للمسلمين، لكن مخالفة الرماة لأوامر النبي ﷺ أدت إلى تراجعهم واستشهاد 70 من الصحابة أبرزهم حمزة بن عبد المطلب." },
  { year: "5 هـ", event: "غزوة الخندق (الأحزاب)", desc: "تحالف بين قريش وغطفان وقبائل أخرى للقضاء على الإسلام. قام المسلمون بحفر خندق حول المدينة باقتراح من سلمان الفارسي، وانتهى الحصار بتفرق الأحزاب بسبب الرياح العاتية وضعف التحالف." },
  { year: "6 هـ", event: "صلح الحديبية", desc: "معاهدة سلام بين المسلمين ومشركي قريش لمدة 10 سنوات. مهد هذا الصلح للاعتراف بالمسلمين كقوة مستقلة، وساهم في دخول الكثير من القبائل العربية في الإسلام." },
  { year: "8 هـ", event: "غزوة مؤتة وفتح مكة", desc: "أول مواجهة مع الروم في مؤتة. وفي نفس العام، تم فتح مكة بعد نقض قريش لصلح الحديبية. دخل النبي ﷺ مكة سلمياً وعفا عن أهلها، وتم تطهير الكعبة من الأصنام." },
  { year: "10 هـ", event: "حجة الوداع", desc: "الحجة الوحيدة والأخيرة التي أداها النبي ﷺ، وشهدها أكثر من 100 ألف مسلم. ألقى فيها خطبة الوداع التي أرست مبادئ حقوق الإنسان الأساسية وأكمل فيها الدين." },
  { year: "11 هـ", event: "وفاة النبي ﷺ وتولي أبو بكر", desc: "انتقال النبي ﷺ إلى الرفيق الأعلى في ربيع الأول. تولي أبو بكر الصديق الخلافة وبدء حروب الردة لإعادة استقرار شبه الجزيرة العربية وتثبيت أركان الدولة." },
  { year: "13 هـ", event: "تولي عمر بن الخطاب", desc: "في عهده (الفاروق) توسعت الفتوحات وانهارت إمبراطورية الفرس وتقلص نفوذ الروم. وشهد عهده تأسيس الدواوين واعتماد التقويم الهجري القائم على الهجرة." },
  { year: "23 هـ", event: "تولي عثمان بن عفان", desc: "في عهده (ذو النورين) وصلت الفتوحات إلى إفريقية وخراسان. وتم بأمره نسخ القرآن الكريم في مصحف واحد (مصحف عثمان) وتوزيعه على الأمصار لتوحيد القراءة، بالإضافة لإنشاء أول أسطول بحري." },
  { year: "35 هـ", event: "تولي علي بن أبي طالب", desc: "تولى الخلافة في فترة مليئة بالاضطرابات والفتن. نقل العاصمة إلى الكوفة بالعراق، ووقع في عهده معارك الجمل وصفين والنهروان حفاظًا على وحدة الأمة." },
  { year: "41 هـ", event: "تأسيس الدولة الأموية", desc: "تنازل الحسن بن علي عن الخلافة لمعاوية بن أبي سفيان لحقن الدماء (عام الجماعة). وتأسست الدولة الأموية واتخذت دمشق عاصمة لها، واستأنفت الفتوحات حتى وصلت إلى الأندلس والسند." },
  { year: "132 هـ", event: "تأسيس الدولة العباسية", desc: "سقوط الدولة الأموية وقيام الخلافة العباسية التي نقلت العاصمة إلى بغداد. شهد العصر العباسي نهضة علمية وحضارية كبرى وحركة ترجمة وتأسيس بيت الحكمة." },
  { year: "492 هـ", event: "سقوط القدس بيد الصليبيين", desc: "بعد ضعف الدولة العباسية وانقسام المسلمين، سقطت القدس وما حولها في أيدي الحملات الصليبية، وارتكبت مجازر في المسجد الأقصى." },
  { year: "583 هـ", event: "معركة حطين وتحرير القدس", desc: "انتصر صلاح الدين الأيوبي على الصليبيين في حطين، مما مهد الطريق لتحرير القدس واستعادة المسجد الأقصى بعد قرابة 90 عاماً من الاحتلال." },
  { year: "656 هـ", event: "اجتياح المغول لبغداد", desc: "سقوط بغداد عاصمة الخلافة العباسية على يد هولاكو المغولي، حيث قُتل الخليفة المستعصم ودُمرت مكتبات بغداد في فاجعة عظيمة للمسلمين." },
  { year: "658 هـ", event: "معركة عين جالوت", desc: "انتصر جيش المماليك بقيادة سيف الدين قطز على المغول في فلسطين، مما أوقف الزحف المغولي وحمى مصر والشام والمقدسات الإسلامية من الدمار." },
  { year: "857 هـ", event: "فتح القسطنطينية (1453 م)", desc: "فتح السلطان العثماني محمد الفاتح القسطنطينية (إسطنبول حالياً) عاصمة الإمبراطورية البيزنطية، محققاً بذلك نبوءة النبي ﷺ. وانتقلت العاصمة العثمانية إليها." }
];

export default function IslamicTimeline({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20 overflow-y-auto">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
            <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-xl font-bold font-kufi">خط الزمن الإسلامي</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto py-8">
        <div className="flex items-center gap-3 mb-8 text-emerald-600 dark:text-emerald-400 justify-center">
          <Hourglass size={32} />
          <h2 className="text-2xl font-bold font-kufi">أحداث شكلت التاريخ الإسلامي</h2>
        </div>

        <div className="relative border-r-2 border-emerald-200 dark:border-emerald-800 pr-6 mr-3 space-y-8">
          {timelineEvents.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Timeline Dot */}
              <div className="absolute -right-8 top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-50 dark:ring-slate-900 z-10"></div>
              
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="inline-block bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold font-mono mb-2">
                  {item.year}
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{item.event}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

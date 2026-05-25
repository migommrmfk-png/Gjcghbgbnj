import{a as n,j as e,A as h,m as p}from"./motion-3-as3UaB.js";import{d as f,A as u,q as g,c as j,z as i,o as v}from"./index-DNSG3ZNF.js";import{R as y}from"./refresh-cw-gNUV-B33.js";import{C as w}from"./copy-xwxAVE2Z.js";import"./vendor-D4L0Or5X.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]],N=f("smartphone",k),d=[{type:"whatsapp",title:"رسالة واتساب",icon:e.jsx(v,{size:20}),color:"bg-emerald-500",templates:["مِن سُنن النبي ﷺ المهجورة: صلاة الضحى.. صلاة الأوابين. ركعتين فقط تكفيك صدقة عن كل مفاصل جسمك 🤍✨",`هل استغفرت اليوم؟ 🪴
استغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه.`,`تذكير 💡
قال ﷺ: «من قرأ حرفاً من كتاب الله فله به حسنة، والحسنة بعشر أمثالها».`,`لا تدري أي حسنة تدخلك الجنة! 
سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر. 🌿`,`رسالة لك 💌
(وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى) اطمئن، الله يدبر لك ما فيه الخير.`]},{type:"instagram",title:"ستوري إنستجرام",icon:e.jsx(N,{size:20}),color:"bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-500",templates:[`🌱

نصيبك من محبة الله، 
على قدر ذكرك له.

اذكر الله يذكرك ✨`,`🤍

وَلَا تَحْزَنْ ۖ إِنَّا مُنَجُّوكَ

رسالة اطمئنان لقلبك اليوم.`,`✨

إذا ضاقت بك الدنيا، 
فاسأل الله من فضله، 
تُفتح لك أبواب الرحمة.`,`🪴

صَلاةٌ واحدةٌ على النَّبيِّ ﷺ 
تَرفعُ دَرجاتِكَ وتَحطُّ خَطاياكَ.

اللهم صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ`,`🕊

أحسن الظن بالله.. 
فإن الدُعاء يغير القضاء.`]}];function E({onBack:c}){const[s,x]=n.useState(d[0]),[r,l]=n.useState(0),a=s.templates[r],m=async()=>{if(navigator.share)try{await navigator.share({title:"رسالة دعوية",text:a}),i.success("تمت المشاركة بنجاح")}catch(t){console.log("Error sharing",t)}else o()},o=()=>{navigator.clipboard.writeText(a),i.success("تم النسخ بنجاح")},b=()=>{l(t=>(t+1)%s.templates.length)};return e.jsxs("div",{className:"h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100",dir:"rtl",children:[e.jsxs("div",{className:"pt-12 pb-6 px-6 bg-[#0A1914] text-white rounded-b-[2.5rem] shadow-xl shrink-0 border-b border-emerald-900/30 relative overflow-hidden",children:[e.jsx("div",{className:"absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none",style:{backgroundImage:'url("https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80&w=1200")'}}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-900/60 mix-blend-overlay"}),e.jsx("div",{className:"absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-2xl"}),e.jsx("div",{className:"absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full -ml-10 -mb-10 blur-2xl"}),e.jsxs("div",{className:"relative z-10 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("button",{onClick:c,className:"p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10",children:e.jsx(u,{size:24})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold font-serif",children:"منبر دعوي"}),e.jsx("p",{className:"text-emerald-200/80 text-sm mt-1",children:"«بلّغوا عنّي ولو آية»"})]})]}),e.jsx("div",{className:"w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20",children:e.jsx(g,{size:24,className:"text-emerald-400"})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto p-5 pb-32",children:[e.jsx("div",{className:"flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6",children:d.map(t=>e.jsxs("button",{onClick:()=>{x(t),l(0)},className:`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${s.type===t.type?`${t.color} text-white shadow-md`:"text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`,children:[t.icon,t.title]},t.type))}),e.jsx(h,{mode:"wait",children:e.jsxs(p.div,{initial:{opacity:0,scale:.95,y:10},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:1.05,y:-10},className:"bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative min-h-[300px] flex flex-col justify-center items-center text-center group",children:[e.jsx("div",{className:"absolute top-6 right-6 text-6xl text-slate-100 dark:text-slate-800 font-serif leading-none opacity-50 select-none",children:'"'}),e.jsx("div",{className:"absolute bottom-12 left-6 text-6xl text-slate-100 dark:text-slate-800 font-serif leading-none opacity-50 select-none",children:'"'}),e.jsx("p",{className:"text-xl md:text-2xl font-medium leading-loose text-slate-700 dark:text-slate-200 whitespace-pre-wrap relative z-10 font-serif",children:a})]},s.type+r)}),e.jsx("div",{className:"flex justify-center mt-6",children:e.jsxs("button",{onClick:b,className:"bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700",children:[e.jsx(y,{size:18}),"توليد رسالة أخرى"]})})]}),e.jsxs("div",{className:"fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 z-40 flex gap-3",children:[e.jsxs("button",{onClick:o,className:"flex-1 py-4 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2",children:[e.jsx(w,{size:20}),"نسخ النص"]}),e.jsxs("button",{onClick:m,className:`flex-[2] py-4 rounded-2xl font-bold text-white ${s.color} hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2`,children:[e.jsx(j,{size:20}),"مشاركة"]})]})]})}export{E as default};

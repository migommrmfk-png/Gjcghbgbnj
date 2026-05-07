import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Info, Youtube } from 'lucide-react';

export default function LiveMakkah({ onBack }: { onBack: () => void }) {
  const [channel, setChannel] = useState<'makkah' | 'madinah'>('makkah');

  // Typically, YouTube IDs change. It's better to use an iframe search or an app that embeds specific channels.
  // We'll use the official 24/7 channels or common ones
  const channels = {
    makkah: "https://www.youtube.com/embed/live_stream?channel=UC8Wb-lS4k9nUEXzZ8bXg7Lg", // Quran Channel Makkah
    madinah: "https://www.youtube.com/embed/live_stream?channel=UCc_7c-fXW4gC9n-s2p4Tq9A" // Sunnah Channel Madinah
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20 flex flex-col">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
            <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-xl font-bold font-kufi">البث المباشر (الحرمين)</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setChannel('makkah')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all text-sm ${channel === 'makkah' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            مكة المكرمة
          </button>
          <button
            onClick={() => setChannel('madinah')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all text-sm ${channel === 'madinah' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            المدينة المنورة
          </button>
        </div>

        <div className="bg-black rounded-2xl overflow-hidden aspect-video relative shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="flex flex-col items-center text-slate-500">
               <Youtube size={48} className="text-slate-700/50 mb-2" />
               <p className="text-sm">جاري تحميل البث...</p>
             </div>
          </div>
          <iframe
            src={channels[channel]}
            className="w-full h-full relative z-10"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="mt-8 bg-emerald-50 dark:bg-emerald-900/20 p-4 justify-start rounded-2xl flex items-start gap-3">
          <Info className="text-emerald-500 shrink-0 mt-1" size={24} />
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mon">
            يتم جلب البث المباشر من القنوات الرسمية (قناة القرآن الكريم للقرآن الكريم من مكة المكرمة وقناة السنة النبوية من المدينة المنورة) المتوفرة على موقع يوتيوب.
          </p>
        </div>
      </div>
    </div>
  );
}

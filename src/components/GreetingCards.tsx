import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Image as ImageIcon, Download, Share2, Type, Paintbrush } from 'lucide-react';

const BACKGROUNDS = [
  { id: 'ramadan-1', url: 'https://images.unsplash.com/photo-1617300768434-620ee6ecadd3?w=800&auto=format&fit=crop', label: 'رمضان (هلال)' },
  { id: 'eid-1', url: 'https://images.unsplash.com/photo-1529126388484-9d56ebbaebf5?w=800&auto=format&fit=crop', label: 'عيد (نقوش)' },
  { id: 'jummah-1', url: 'https://images.unsplash.com/photo-1572889617482-628d09aa11de?w=800&auto=format&fit=crop', label: 'جمعة (مسجد)' },
  { id: 'general-1', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&auto=format&fit=crop', label: 'زخرفة إسلامية' },
];

const PRESETS = [
  "رمضان كريم",
  "عيدكم مبارك",
  "تقبل الله منا ومنكم",
  "جمعة مباركة",
  "كل عام وأنتم بخير"
];

export default function GreetingCards({ onBack }: { onBack: () => void }) {
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0].url);
  const [greetingText, setGreetingText] = useState(PRESETS[0]);
  const [customName, setCustomName] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    drawCard();
  }, [selectedBg, greetingText, customName, textColor]);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedBg;
    img.onload = () => {
      // Set canvas size
      canvas.width = 1080;
      canvas.height = 1080;

      // Draw Background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw Dark Overlay for readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Main Greeting Text
      ctx.textAlign = 'center';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 120px Arial';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillText(greetingText, canvas.width / 2, canvas.height / 2);

      // Draw Sender Name
      if (customName) {
        ctx.font = '50px Arial';
        ctx.fillText(`مع تحيات: ${customName}`, canvas.width / 2, (canvas.height / 2) + 150);
      }

      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
    };
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.download = 'islamic_greeting.jpg';
    link.href = previewUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    try {
      const blob = await (await fetch(previewUrl)).blob();
      const file = new File([blob], 'islamic_greeting.jpg', { type: 'image/jpeg' });
      if (navigator.share) {
        await navigator.share({
          title: greetingText,
          files: [file]
        });
      }
    } catch (error) {
      console.error('Share failed', error);
      alert('ميزة المشاركة غير مدعومة في متصفحك، استخدم زر التحميل.');
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20 overflow-y-auto">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
            <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-xl font-bold font-kufi">صانع البطاقات</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* Preview Area */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
            <ImageIcon size={20} className="text-emerald-500" /> معاينة البطاقة
          </h2>
          
          <div className="relative w-full aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="hidden"></canvas>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">جاري التحميل...</div>
            )}
          </div>

          <div className="flex gap-2 mt-4 mt-4">
            <button
              onClick={handleDownload}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              تحميل
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              مشاركة
            </button>
          </div>
        </div>

        {/* Controls Area */}
        <div className="space-y-4">
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
              <Type size={18} className="text-indigo-500" /> النص المكتوب
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setGreetingText(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${greetingText === p ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={greetingText}
              onChange={(e) => setGreetingText(e.target.value)}
              placeholder="نص التهنئة (مثال: عيد سعيد)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-bold mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
            
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="اسم المرسل (خياري)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
              <Paintbrush size={18} className="text-amber-500" /> الخلفية واللون
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedBg === bg.url ? 'border-amber-500 scale-95' : 'border-transparent hover:scale-95'}`}
                >
                  <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-white text-[10px] text-center font-bold">
                    {bg.label}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">لون النص:</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

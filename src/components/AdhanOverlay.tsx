import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

export default function AdhanOverlay({ prayerName, time, onClose }: { prayerName: string, time: string, onClose: () => void }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [audioError, setAudioError] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const audio = new Audio('https://download.quranicaudio.com/adhan/makkah.mp3');
    setAudioElement(audio);
    
    const playAudio = async () => {
      try {
        await audio.play();
      } catch (e) {
        console.log("Audio play failed, user interaction might be required", e);
        setAudioError(true);
      }
    };
    
    playAudio();
    
    return () => {
      clearInterval(timer);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  const handleManualPlay = () => {
    if (audioElement) {
      audioElement.play().then(() => setAudioError(false)).catch(e => console.error(e));
    }
  };

  const getMosqueImage = () => {
    switch (prayerName) {
      case "الفجر":
        return "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1080&auto=format&fit=crop"; // Dawn
      case "الظهر":
        return "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=1080&auto=format&fit=crop"; // Noon
      case "العصر":
        return "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1080&auto=format&fit=crop"; // Afternoon
      case "المغرب":
        return "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1080&auto=format&fit=crop"; // Sunset
      case "العشاء":
        return "https://images.unsplash.com/photo-1534269222346-5a896154c41d?q=80&w=1080&auto=format&fit=crop"; // Night
      default:
        return "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=1080&auto=format&fit=crop";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white overflow-hidden"
      dir="rtl"
    >
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear" }}
          src={getMosqueImage()} 
          alt="Mosque" 
          className="w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-8 p-6 w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-32 h-32 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <Clock size={64} className="text-amber-400" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-black/40 backdrop-blur-md p-8 sm:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl w-full"
        >
          <h1 className="text-6xl sm:text-7xl font-serif font-bold mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] text-amber-400">
            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] text-white leading-relaxed">حان الآن موعد أذان {prayerName}</h2>
          <p className="text-xl mt-6 text-white/80 font-bold drop-shadow-md">حسب التوقيت المحلي</p>
        </motion.div>

        {audioError && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleManualPlay}
            className="mt-4 px-6 py-3 rounded-full bg-white/20 text-white font-bold border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <span>تشغيل الأذان</span>
          </motion.button>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onClose}
          className="mt-12 px-8 py-4 rounded-full bg-emerald-500 text-white font-bold text-lg shadow-lg hover:bg-emerald-600 transition-colors border border-white/20 backdrop-blur-md"
        >
          إغلاق
        </motion.button>
      </div>
    </motion.div>
  );
}

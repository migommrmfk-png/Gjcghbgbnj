import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ArrowRight, Heart, Share2, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

const REELS = [
  {
    id: 1,
    reciter: 'ياسر الدوسري',
    surah: 'سورة الفاتحة',
    audio: 'https://server11.mp3quran.net/yasser/001.mp3',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800&h=1200'
  },
  {
    id: 2,
    reciter: 'مشاري العفاسي',
    surah: 'سورة الإخلاص',
    audio: 'https://server8.mp3quran.net/afs/112.mp3',
    image: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=800&h=1200'
  },
  {
    id: 3,
    reciter: 'عبدالباسط عبدالصمد',
    surah: 'سورة الضحى',
    audio: 'https://server7.mp3quran.net/basit/093.mp3',
    image: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80&w=800&h=1200'
  }
];

export default function QuranReels({ onBack }: { onBack?: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  useEffect(() => {
    audioRefs.current.forEach((audio, index) => {
      if (audio) {
        if (index === currentIndex) {
          if (isPlaying) {
            audio.play().catch(e => console.log("Autoplay prevented", e));
          } else {
            audio.pause();
          }
        } else {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    });
  }, [currentIndex, isPlaying]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < REELS.length) {
      setCurrentIndex(newIndex);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="h-full bg-black text-white overflow-hidden relative" dir="rtl">
      <div className="absolute top-0 left-0 right-0 z-50 p-6 pt-12 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              <ArrowRight size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold font-serif">تلاوات خاشعة</h1>
        </div>
        <button onClick={toggleMute} className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      <div 
        className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar pb-20"
        onScroll={handleScroll}
      >
        {REELS.map((reel, index) => (
          <div key={reel.id} className="h-full w-full snap-start relative flex items-center justify-center bg-black">
            <img 
              src={reel.image} 
              alt={reel.surah} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            
            <audio
              ref={el => audioRefs.current[index] = el}
              src={reel.audio}
              loop
              muted={isMuted}
            />

            <div 
              className="absolute inset-0 z-10 flex items-center justify-center"
              onClick={togglePlay}
            >
              {!isPlaying && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <Play size={40} className="ml-2" />
                </motion.div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold font-serif mb-1">{reel.surah}</h2>
                <p className="text-white/80 flex items-center gap-2">
                  <Volume2 size={16} /> القارئ {reel.reciter}
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <button className="p-3 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <Heart size={24} />
                </button>
                <button className="p-3 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <Share2 size={24} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

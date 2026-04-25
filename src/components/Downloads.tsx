import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trash2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { DownloadedAudio, getAllDownloadedAudios, removeAudio } from '../lib/audioStore';

interface DownloadsProps {
  onBack: () => void;
}

const Downloads: React.FC<DownloadsProps> = ({ onBack }) => {
  const [downloads, setDownloads] = useState<DownloadedAudio[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const data = await getAllDownloadedAudios();
      setDownloads(data);
    } catch (error) {
      console.error('Error loading downloads:', error);
    }
  };

  const handleRemove = async (id: string) => {
    if (isPlaying === id) {
      audioRef.current?.pause();
      setIsPlaying(null);
    }
    await removeAudio(id);
    await loadDownloads();
  };

  const togglePlay = (item: DownloadedAudio) => {
    if (!audioRef.current) return;

    if (isPlaying === item.id) {
      audioRef.current.pause();
      setIsPlaying(null);
    } else {
      if (isPlaying) {
        audioRef.current.pause();
      }
      
      const objectUrl = URL.createObjectURL(item.blob);
      audioRef.current.src = objectUrl;
      audioRef.current.volume = volume;
      audioRef.current.play();
      setIsPlaying(item.id);

      audioRef.current.onended = () => {
        setIsPlaying(null);
        URL.revokeObjectURL(objectUrl);
      };
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
      }
    };
  }, [isPlaying]);

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-[var(--color-bg)] pb-24" dir="rtl">
      <audio ref={audioRef} />

      <div className="sticky top-0 z-20 py-4 flex items-center gap-4 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-4 -mx-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
        >
          <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" />
        </button>
        <h1 className="text-xl font-bold font-serif text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          التنزيلات
        </h1>
      </div>

      <div className="space-y-4">
        {downloads.length === 0 ? (
          <div className="text-center text-[var(--color-text-muted)] mt-10">
            <p>لا توجد تلاوات محملة بعد.</p>
          </div>
        ) : (
          downloads.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={item.id}
              className="bg-[var(--color-surface)] border border-white/5 p-4 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePlay(item)}
                  className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] rounded-full flex items-center justify-center border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors"
                >
                  {isPlaying === item.id ? <Pause size={20} /> : <Play size={20} className="mr-1" />}
                </button>
                <div>
                  <h3 className="text-white font-bold">{item.surahName}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{item.reciterName}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {isPlaying && (
         <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto p-4 bg-[var(--color-surface)] border-t border-white/10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-30">
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                 <button
                   onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                   className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition-colors"
                 >
                   {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                 </button>
                 {isVolumeOpen && (
                   <input
                     type="range"
                     min={0}
                     max={1}
                     step={0.01}
                     value={volume}
                     onChange={(e) => setVolume(Number(e.target.value))}
                     className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                     dir="ltr"
                   />
                 )}
               </div>
               <div className="text-white font-bold text-sm text-left flex-1" dir="ltr">
                  قيد التشغيل
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Downloads;

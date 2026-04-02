import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Book,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  Settings,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

interface ReciterOption {
  id: string;
  name: string;
  server: string;
  surahList: number[];
}

export default function Quran() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [fontSize, setFontSize] = useState(36);
  
  const [reciters, setReciters] = useState<ReciterOption[]>([]);
  const [selectedReciterServer, setSelectedReciterServer] = useState("");
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [selectedAyahTafsir, setSelectedAyahTafsir] = useState<{ text: string, tafsir: string, number: number } | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);

  const [lastRead, setLastRead] = useState<{ surahNumber: number, surahName: string } | null>(() => {
    const saved = localStorage.getItem('quranLastRead');
    return saved ? JSON.parse(saved) : null;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check cache first
    const cachedSurahs = localStorage.getItem('quran_surahs');
    if (cachedSurahs) {
      setSurahs(JSON.parse(cachedSurahs));
      setLoading(false);
    } else {
      // Fetch Surahs list
      fetch("https://api.alquran.cloud/v1/surah")
        .then((res) => res.json())
        .then((data) => {
          setSurahs(data.data);
          localStorage.setItem('quran_surahs', JSON.stringify(data.data));
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }

    // Check reciters cache
    const cachedReciters = localStorage.getItem('quran_reciters_v2');
    if (cachedReciters) {
      const parsed = JSON.parse(cachedReciters);
      setReciters(parsed);
      const defaultReciter = parsed.find((r: any) => r.name.includes("مشاري العفاسي")) || parsed[0];
      if (defaultReciter) {
        setSelectedReciterServer(defaultReciter.server);
      }
    } else {
      // Fetch Reciters from mp3quran.net
      fetch("https://www.mp3quran.net/api/v3/reciters?language=ar")
        .then((res) => res.json())
        .then((data) => {
          const options: ReciterOption[] = [];
          data.reciters.forEach((reciter: any) => {
            reciter.moshaf.forEach((m: any) => {
              const surahListStr = m.surah_list || "";
              const surahList = surahListStr.split(',').filter(Boolean).map(Number);
              
              if (surahList.length > 0) {
                let serverUrl = m.server;
                if (serverUrl.startsWith('http://')) {
                  serverUrl = serverUrl.replace('http://', 'https://');
                }
                if (!serverUrl.endsWith('/')) {
                  serverUrl += '/';
                }
                options.push({
                  id: `${reciter.id}-${m.id}`,
                  name: `${reciter.name} (${m.name.split('-')[0].trim()})`,
                  server: serverUrl,
                  surahList,
                });
              }
            });
          });
          setReciters(options);
          localStorage.setItem('quran_reciters_v2', JSON.stringify(options));
          
          // Find a default reciter (e.g., Mishary Alafasy)
          const defaultReciter = options.find(r => r.name.includes("مشاري العفاسي")) || options[0];
          if (defaultReciter) {
            setSelectedReciterServer(defaultReciter.server);
          }
        })
        .catch(err => console.error("Error fetching reciters:", err));
    }
  }, []);

  const fetchSurah = async (surahNumber: number, surahName?: string) => {
    setLoadingSurah(true);
    try {
      // Check cache first
      const cacheKey = `quran_surah_${surahNumber}`;
      const cachedSurah = localStorage.getItem(cacheKey);
      let surahData;

      if (cachedSurah) {
        surahData = JSON.parse(cachedSurah);
      } else {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        const data = await res.json();
        surahData = data.data;
        try {
          localStorage.setItem(cacheKey, JSON.stringify(surahData));
        } catch (e) {
          console.warn("Could not cache surah, storage might be full");
        }
      }

      setSelectedSurah(surahData);
      
      const newLastRead = { surahNumber, surahName: surahName || surahData.name };
      setLastRead(newLastRead);
      localStorage.setItem('quranLastRead', JSON.stringify(newLastRead));
      
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      
      let activeReciterServer = selectedReciterServer;
      const currentReciter = reciters.find(r => r.server === selectedReciterServer);
      if (!currentReciter || !currentReciter.surahList.includes(surahNumber)) {
        // Find a fallback reciter
        const fallback = reciters.find(r => r.surahList.includes(surahNumber));
        if (fallback) {
          activeReciterServer = fallback.server;
          setSelectedReciterServer(fallback.server);
        }
      }

      if (audioRef.current && activeReciterServer) {
        audioRef.current.pause();
        const paddedNumber = String(surahNumber).padStart(3, '0');
        audioRef.current.src = `${activeReciterServer}${paddedNumber}.mp3`;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSurah(false);
    }
  };

  const fetchTafsir = async (ayahNumber: number, ayahText: string, numberInSurah: number) => {
    setLoadingTafsir(true);
    setSelectedAyahTafsir({ text: ayahText, tafsir: "", number: numberInSurah });
    try {
      // ar.muyassar is the easy tafsir
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/ar.muyassar`);
      const data = await res.json();
      setSelectedAyahTafsir({ text: ayahText, tafsir: data.data.text, number: numberInSurah });
    } catch (err) {
      console.error(err);
      setSelectedAyahTafsir({ text: ayahText, tafsir: "عذراً، تعذر تحميل التفسير.", number: numberInSurah });
    } finally {
      setLoadingTafsir(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !selectedSurah) return;
    
    // Ensure src is set before playing
    if (!audioRef.current.src || audioRef.current.src === window.location.href) {
      if (selectedReciterServer) {
        const paddedNumber = String(selectedSurah.number).padStart(3, '0');
        audioRef.current.src = `${selectedReciterServer}${paddedNumber}.mp3`;
      } else {
        return; // Cannot play without a server
      }
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error("Audio play failed", e);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

    if (selectedSurah) {
    return (
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        className="max-w-md mx-auto min-h-screen pb-40 relative bg-[var(--color-bg)]"
        dir="rtl"
      >
        <audio 
          ref={audioRef} 
          className="hidden" 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Tafsir Modal */}
        <AnimatePresence>
          {selectedAyahTafsir && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setSelectedAyahTafsir(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-[var(--color-surface)] w-full max-w-md rounded-t-[2rem] p-6 shadow-2xl max-h-[80vh] overflow-y-auto border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[var(--color-primary-light)] font-serif">
                    تفسير الآية {selectedAyahTafsir.number}
                  </h3>
                  <button onClick={() => setSelectedAyahTafsir(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <X size={20} className="text-[var(--color-text-muted)]" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-[var(--color-primary)]/10 rounded-2xl border border-[var(--color-primary)]/20">
                    <p className="font-quran text-2xl leading-loose text-center text-[var(--color-text)]">
                      {selectedAyahTafsir.text}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-[var(--color-text-muted)] mb-2 flex items-center gap-2">
                      <Book size={18} />
                      التفسير الميسر
                    </h4>
                    {loadingTafsir ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                      </div>
                    ) : (
                      <p className="text-[var(--color-text)] leading-relaxed text-justify font-sans">
                        {selectedAyahTafsir.tafsir}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header 3D */}
        <div className="sticky top-0 bg-[var(--color-bg)]/80 backdrop-blur-md shadow-sm z-20 px-4 py-3 flex items-center justify-between border-b border-white/5">
          <button
            onClick={() => {
              setSelectedSurah(null);
              audioRef.current?.pause();
              setIsPlaying(false);
            }}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)]"
          >
            <ArrowRight size={24} className="text-[var(--color-text-muted)] hover:text-white" />
          </button>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="px-6 py-1 border border-[var(--color-primary)]/30 rounded-full bg-[var(--color-primary)]/10">
              <h1 className="text-xl font-bold font-quran text-[var(--color-primary-light)]">
                سُورَةُ {selectedSurah.name.replace('سُورَةُ ', '')}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setFontSize((prev) => (prev < 60 ? prev + 4 : 24))}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)]"
          >
            <Settings size={24} className="text-[var(--color-text-muted)] hover:text-white" />
          </button>
        </div>

        {/* Content - Mushaf Style */}
        <div className="p-2 sm:p-6 min-h-screen bg-[var(--color-bg)]">
          <div className="bg-[#FAF4E6] dark:bg-[var(--color-surface)] border-8 border-[var(--color-primary)]/30 rounded-[1rem] p-4 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-[var(--color-primary)]/60 rounded-tr-xl"></div>
            <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-[var(--color-primary)]/60 rounded-tl-xl"></div>
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-[var(--color-primary)]/60 rounded-br-xl"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-[var(--color-primary)]/60 rounded-bl-xl"></div>
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat pointer-events-none"></div>

            <div
              className="font-quran text-center text-[var(--color-text)] relative z-10"
              style={{ 
                fontSize: `${fontSize}px`, 
                lineHeight: '2.4',
                wordSpacing: '0.15em'
              }}
            >
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-8 mt-4 flex justify-center"
                >
                  <div className="px-10 py-3 border-y-2 border-[var(--color-primary)]/40 text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]" style={{ fontSize: `${fontSize * 1.1}px` }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </motion.div>
              )}

              {loadingSurah ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                </div>
              ) : (
                <div className="text-justify" dir="rtl" style={{ textAlignLast: 'center' }}>
                  {selectedSurah.ayahs.map((ayah) => {
                    // Pre-process text to remove Bismillah if it's the first ayah of a surah (except Al-Fatiha and At-Tawba)
                    let text = ayah.text;
                    if (
                      selectedSurah.number !== 1 &&
                      selectedSurah.number !== 9 &&
                      ayah.numberInSurah === 1
                    ) {
                      text = text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, "");
                      text = text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "");
                      text = text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "");
                    }

                    // Convert English numbers to Arabic numbers
                    const arabicNumber = ayah.numberInSurah.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

                    return (
                      <span
                        key={ayah.number}
                        className="inline cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors rounded px-1 leading-loose"
                        onClick={() => fetchTafsir(ayah.number, text, ayah.numberInSurah)}
                      >
                        {text}
                        <span className="inline-flex items-center justify-center relative mx-2 text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)] opacity-90 select-none">
                          <span style={{ fontSize: `${fontSize * 1.2}px` }}>۝</span>
                          <span className="absolute inset-0 flex items-center justify-center font-sans font-bold" style={{ fontSize: `${fontSize * 0.4}px`, marginTop: '2px' }}>
                            {arabicNumber}
                          </span>
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio Player 3D */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 max-w-md mx-auto p-4 z-30"
        >
          <div className="card-3d p-4 flex flex-col gap-3 bg-[var(--color-surface)]/95 backdrop-blur-md border border-white/10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] rounded-[2rem]">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] transform active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <PauseCircle size={28} />
                ) : (
                  <PlayCircle size={28} />
                )}
              </button>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-bold text-[var(--color-text)] mb-1">
                  القارئ
                </span>
                <select
                  className="text-xs text-[var(--color-text)] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2 outline-none font-bold w-full truncate shadow-inner focus:border-[var(--color-primary)]/50"
                  value={selectedReciterServer}
                  onChange={(e) => {
                    setSelectedReciterServer(e.target.value);
                    if (selectedSurah && audioRef.current) {
                       const paddedNumber = String(selectedSurah.number).padStart(3, '0');
                       const wasPlaying = isPlaying;
                       audioRef.current.src = `${e.target.value}${paddedNumber}.mp3`;
                       if (wasPlaying) {
                         audioRef.current.play();
                       }
                    }
                  }}
                >
                  {reciters
                    .filter(r => r.surahList.includes(selectedSurah.number))
                    .map((r) => (
                    <option key={r.id} value={r.server} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-mono font-bold mt-1" dir="ltr">
               <span>{formatTime(currentTime)}</span>
               <input 
                 type="range" 
                 min={0} 
                 max={duration || 100} 
                 value={currentTime} 
                 onChange={handleSeek}
                 className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
               />
               <span>{formatTime(duration)}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-32 min-h-screen bg-[var(--color-bg)]" dir="rtl">
      {/* Header 3D */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden text-center border border-white/5"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/40 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-serif mb-2 flex justify-center items-center gap-3 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] text-[var(--color-primary-light)]">
            <Book size={32} className="text-[var(--color-primary)]" />
            القرآن الكريم
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm font-medium">اقرأ وارتقِ</p>
        </div>
      </motion.div>

      {/* Search Bar 3D */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative card-3d overflow-hidden rounded-[1.5rem] bg-[var(--color-surface)] border border-white/5 shadow-lg"
      >
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[var(--color-text-muted)]" />
        </div>
        <input
          type="text"
          className="block w-full pl-4 pr-12 py-4 bg-black/5 dark:bg-white/5 border-none focus:ring-0 text-[var(--color-text)] font-bold placeholder-[var(--color-text-muted)] outline-none shadow-inner"
          placeholder="ابحث عن سورة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Continue Reading */}
      {lastRead && !searchQuery && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="card-3d p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors rounded-[1.5rem] bg-[var(--color-surface)] border border-white/5 shadow-lg"
          onClick={() => fetchSurah(lastRead.surahNumber, lastRead.surahName)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Book size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text)] text-sm">متابعة القراءة</h3>
              <p className="text-xs text-[var(--color-primary-light)] font-bold">{lastRead.surahName}</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-[var(--color-text-muted)]" />
        </motion.div>
      )}

      {/* Surahs List 3D */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card-3d overflow-hidden rounded-[2rem] bg-[var(--color-surface)] border border-white/5 shadow-lg"
      >
        <div className="divide-y divide-white/5">
          {filteredSurahs.map((surah, index) => (
            <motion.button
              key={surah.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.5) }}
              onClick={() => fetchSurah(surah.number, surah.name)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 active:bg-white/10 transition-colors text-right group"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full text-[var(--color-primary)] opacity-20 group-hover:opacity-40 transition-opacity" viewBox="0 0 36 36" fill="currentColor">
                    <path d="M18 0L21.5 6.5L29 4.5L28 12L34.5 16L29 21.5L32.5 28.5L25 27.5L22 34.5L16.5 29L10 33L10.5 25.5L3.5 22.5L8.5 17L3 11L10 9.5L12.5 2.5L18 7.5L18 0Z" />
                  </svg>
                  <span className="relative z-10 font-bold text-[var(--color-text)] text-sm">{surah.number}</span>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-[var(--color-text)] font-serif text-lg group-hover:text-[var(--color-primary-light)] transition-colors">
                    {surah.name}
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-muted)] font-bold mt-0.5">
                    {surah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {surah.numberOfAyahs} آية
                  </p>
                </div>
              </div>
              <div className="text-left flex flex-col justify-center items-end">
                <p className="font-bold text-[var(--color-text-muted)] text-sm font-sans">
                  {surah.englishName}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold mt-0.5">
                  {surah.englishNameTranslation}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

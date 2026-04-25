import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Book,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  Settings,
  X,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Loader,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { saveAudio } from "../lib/audioStore";
import { fetchWithProxy, AUDIO_PROXIES } from "../lib/proxies";

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

const TAFSIR_OPTIONS = [
  { id: 'ar.muyassar', name: 'التفسير الميسر' },
  { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
  { id: 'ar.qurtubi', name: 'تفسير القرطبي' },
];

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
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [selectedAyahTafsir, setSelectedAyahTafsir] = useState<{ text: string, tafsir: string, number: number, globalNumber: number } | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [selectedTafsir, setSelectedTafsir] = useState('ar.muyassar');

  const [lastRead, setLastRead] = useState<{ surahNumber: number, surahName: string, ayahNumber?: number } | null>(() => {
    const saved = localStorage.getItem('quranLastRead');
    return saved ? JSON.parse(saved) : null;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  const fetchSurah = async (surahNumber: number, surahName?: string, scrollToAyah?: number) => {
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
      
      const newLastRead = { surahNumber, surahName: surahName || surahData.name, ayahNumber: scrollToAyah || 1 };
      setLastRead(newLastRead);
      localStorage.setItem('quranLastRead', JSON.stringify(newLastRead));
      
      setIsPlaying(false);
      setIsAudioLoading(false);
      setAudioError("");
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
        const directUrl = `${activeReciterServer}${paddedNumber}.mp3`;
        
        let currentProxyIndex = 0;
        
        const tryPlay = (url: string) => {
          if (!audioRef.current) return;
          audioRef.current.src = url;
          audioRef.current.volume = volume;
          setIsAudioLoading(true);
          
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setIsAudioLoading(false);
              setAudioError("");
            })
            .catch(e => {
              console.warn(`Playback failed for ${url}`, e);
              currentProxyIndex++;
              if (currentProxyIndex < AUDIO_PROXIES.length) {
                // Try next proxy
                tryPlay(AUDIO_PROXIES[currentProxyIndex](directUrl));
              } else {
                console.error("All proxies failed for audio playback");
                setIsPlaying(false);
                setIsAudioLoading(false);
                setAudioError("تعذر تشغيل التلاوة. يرجى التحقق من اتصالك بالإنترنت.");
              }
            });
        };
        
        tryPlay(AUDIO_PROXIES[0](directUrl));
      }

      // Scroll to specific ayah if provided
      if (scrollToAyah) {
        setTimeout(() => {
          const element = ayahRefs.current[scrollToAyah];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-emerald-500/20');
            setTimeout(() => element.classList.remove('bg-emerald-500/20'), 2000);
          }
        }, 500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSurah(false);
    }
  };

  const fetchTafsir = async (ayahNumber: number, ayahText: string, numberInSurah: number, tafsirId: string = selectedTafsir) => {
    setLoadingTafsir(true);
    setSelectedAyahTafsir({ text: ayahText, tafsir: "", number: numberInSurah, globalNumber: ayahNumber });
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${tafsirId}`);
      const data = await res.json();
      setSelectedAyahTafsir({ text: ayahText, tafsir: data.data.text, number: numberInSurah, globalNumber: ayahNumber });
    } catch (err) {
      console.error(err);
      setSelectedAyahTafsir({ text: ayahText, tafsir: "عذراً، تعذر تحميل التفسير.", number: numberInSurah, globalNumber: ayahNumber });
    } finally {
      setLoadingTafsir(false);
    }
  };

  const handleTafsirChange = (newTafsirId: string) => {
    setSelectedTafsir(newTafsirId);
    if (selectedAyahTafsir) {
      fetchTafsir(selectedAyahTafsir.globalNumber, selectedAyahTafsir.text, selectedAyahTafsir.number, newTafsirId);
    }
  };

  const toggleBookmark = () => {
    if (!selectedSurah || !selectedAyahTafsir) return;
    const newBookmark = {
      surahNumber: selectedSurah.number,
      surahName: selectedSurah.name,
      ayahNumber: selectedAyahTafsir.number
    };
    setLastRead(newBookmark);
    localStorage.setItem('quranLastRead', JSON.stringify(newBookmark));
  };

  const togglePlay = () => {
    if (!audioRef.current || !selectedSurah) return;
    
    setAudioError("");

    // Ensure src is set before playing
    if (!audioRef.current.src || audioRef.current.src === window.location.href) {
      if (selectedReciterServer) {
        const paddedNumber = String(selectedSurah.number).padStart(3, '0');
        audioRef.current.src = `${selectedReciterServer}${paddedNumber}.mp3`;
      } else {
        setAudioError("يرجى اختيار قارئ أولاً");
        return; // Cannot play without a server
      }
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsAudioLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsAudioLoading(false);
        })
        .catch(e => {
          console.error("Audio play failed", e);
          setIsPlaying(false);
          setIsAudioLoading(false);
          setAudioError("عذراً، لا يمكن تشغيل هذا القارئ حالياً. جرب قارئاً آخر.");
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

  const handleDownload = async () => {
    if (!selectedSurah || !selectedReciterServer) return;
    
    setIsDownloading(true);
    try {
      const url = `${selectedReciterServer}${String(selectedSurah.number).padStart(3, '0')}.mp3`;
      const response = await fetchWithProxy(url);
      const blob = await response.blob();
      
      const currentReciter = reciters.find(r => r.server === selectedReciterServer);
      
      await saveAudio({
        id: `surah_${selectedSurah.number}_${selectedReciterServer}`,
        surahNumber: selectedSurah.number,
        surahName: selectedSurah.name,
        reciterName: currentReciter?.name || 'مجهول',
        blob,
        downloadedAt: new Date().toISOString()
      });
      alert('تم تحميل التلاوة بنجاح. يمكنك العثور عليها في قائمة التنزيلات.');
    } catch (error) {
      console.error('Download error:', error);
      alert('حدث خطأ أثناء تحميل التلاوة');
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (selectedSurah) {
    const currentAudioUrl = selectedReciterServer && selectedSurah 
      ? `${selectedReciterServer}${String(selectedSurah.number).padStart(3, '0')}.mp3` 
      : '';

    return (
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        className="max-w-md mx-auto min-h-screen pb-40 relative bg-slate-50 dark:bg-slate-950"
        dir="rtl"
      >
        <audio 
          ref={audioRef} 
          className="hidden" 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onPlaying={() => { setIsAudioLoading(false); setIsPlaying(true); }}
          onWaiting={() => setIsAudioLoading(true)}
          onError={(e) => {
            console.error("Audio error", e);
            setIsAudioLoading(false);
            setIsPlaying(false);
            setAudioError("حدث خطأ في الصوت. يرجى تجربة قارئ آخر.");
          }}
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
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl p-6 shadow-xl max-h-[80vh] overflow-y-auto border border-slate-100 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif">
                    الآية {selectedAyahTafsir.number}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleBookmark}
                      className={`p-2 rounded-full transition-colors ${lastRead?.surahNumber === selectedSurah.number && lastRead?.ayahNumber === selectedAyahTafsir.number ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {lastRead?.surahNumber === selectedSurah.number && lastRead?.ayahNumber === selectedAyahTafsir.number ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                    </button>
                    <button onClick={() => setSelectedAyahTafsir(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <X size={20} className="text-slate-500" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                    <p className="font-quran text-2xl leading-loose text-center text-slate-800 dark:text-slate-100">
                      {selectedAyahTafsir.text}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Book size={18} />
                        التفسير
                      </h4>
                      <select
                        value={selectedTafsir}
                        onChange={(e) => handleTafsirChange(e.target.value)}
                        className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 outline-none text-slate-700 dark:text-slate-300"
                      >
                        {TAFSIR_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                    {loadingTafsir ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                      </div>
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify font-sans">
                        {selectedAyahTafsir.tafsir}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm z-20 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setSelectedSurah(null);
              audioRef.current?.pause();
              setIsPlaying(false);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          >
            <ArrowRight size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="px-6 py-1 border border-emerald-200 dark:border-emerald-800 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
              <h1 className="text-xl font-bold font-quran text-emerald-700 dark:text-emerald-300">
                سُورَةُ {selectedSurah.name.replace('سُورَةُ ', '')}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setFontSize((prev) => (prev < 60 ? prev + 4 : 24))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          >
            <Settings size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content - Mushaf Style */}
        <div className="p-2 sm:p-6 min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="bg-[#FAF4E6] dark:bg-slate-900 border-8 border-emerald-500/30 rounded-3xl p-4 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-emerald-500/60 rounded-tr-xl"></div>
            <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-emerald-500/60 rounded-tl-xl"></div>
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-emerald-500/60 rounded-br-xl"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-emerald-500/60 rounded-bl-xl"></div>
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat pointer-events-none"></div>

            <div
              className="font-quran text-center text-slate-800 dark:text-slate-100 relative z-10"
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
                  <div className="px-10 py-3 border-y-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-400" style={{ fontSize: `${fontSize * 1.1}px` }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </motion.div>
              )}

              {loadingSurah ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
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
                        ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                        className={`inline cursor-pointer hover:bg-emerald-500/10 transition-colors rounded px-1 leading-loose ${lastRead?.surahNumber === selectedSurah.number && lastRead?.ayahNumber === ayah.numberInSurah ? 'bg-emerald-500/10' : ''}`}
                        onClick={() => fetchTafsir(ayah.number, text, ayah.numberInSurah)}
                      >
                        {text}
                        <span className="inline-flex items-center justify-center relative mx-2 text-emerald-700 dark:text-emerald-400 opacity-90 select-none">
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

        {/* Audio Player */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 max-w-md mx-auto p-4 z-30"
        >
          {audioError && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-t-2xl text-center text-xs font-bold -mb-4 pt-3 pb-5 border border-red-200 dark:border-red-800/50 relative z-20 shadow-[-0_4px_10px_rgba(0,0,0,0.1)]">
              {audioError}
            </div>
          )}
          <div className="p-4 flex flex-col gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-lg rounded-3xl relative z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={isAudioLoading}
                className={`w-12 h-12 shrink-0 rounded-full text-white flex items-center justify-center shadow-sm transform active:scale-95 transition-all outline-none ${isAudioLoading ? 'bg-slate-300 dark:bg-slate-700' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {isAudioLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <PauseCircle size={28} />
                ) : (
                  <PlayCircle size={28} />
                )}
              </button>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  القارئ
                </span>
                <select
                  className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none font-bold w-full truncate shadow-sm focus:border-emerald-500/50"
                  value={selectedReciterServer}
                  onChange={(e) => {
                    setSelectedReciterServer(e.target.value);
                    setAudioError("");
                    if (selectedSurah && audioRef.current) {
                       const paddedNumber = String(selectedSurah.number).padStart(3, '0');
                       const wasPlaying = isPlaying;
                       audioRef.current.src = `${e.target.value}${paddedNumber}.mp3`;
                       if (wasPlaying) {
                         setIsAudioLoading(true);
                         audioRef.current.play().catch(() => {
                           setIsPlaying(false);
                           setIsAudioLoading(false);
                           setAudioError("لا يمكن تشغيل التلاوة. جرب قارئ آخر.");
                         });
                       }
                    }
                  }}
                >
                  {reciters
                    .filter(r => r.surahList.includes(selectedSurah.number))
                    .map((r) => (
                    <option key={r.id} value={r.server} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                  className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="التحكم بالصوت"
                >
                  {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                {currentAudioUrl && (
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
                    title="تحميل التلاوة"
                  >
                    {isDownloading ? <Loader size={20} className="animate-spin" /> : <Download size={20} />}
                  </button>
                )}
              </div>
            </div>
            
            {/* Volume Control Slider */}
            {isVolumeOpen && (
              <div className="flex items-center gap-3 px-2 mt-1 -mb-1 animate-in slide-in-from-top-2" dir="ltr">
                <VolumeX size={16} className="text-slate-400" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <Volume2 size={16} className="text-slate-400" />
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono font-bold mt-1" dir="ltr">
               <span>{formatTime(currentTime)}</span>
               <input 
                 type="range" 
                 min={0} 
                 max={duration || 100} 
                 value={currentTime} 
                 onChange={handleSeek}
                 className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
               />
               <span>{formatTime(duration)}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28 min-h-screen" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-bl from-emerald-600 via-emerald-700 to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden text-center border border-white/20"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full -ml-12 -mb-12 blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] mb-4 transform rotate-3">
             <Book size={32} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-2 drop-shadow-md">
            القرآن الكريم
          </h1>
          <p className="text-emerald-50 text-sm font-bold bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 mt-2">اقرأ وارتقِ</p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all"
      >
        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-5 pr-14 py-4 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 font-bold placeholder-slate-400 outline-none"
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
          className="card-3d p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/30 group"
          onClick={() => fetchSurah(lastRead.surahNumber, lastRead.surahName, lastRead.ayahNumber)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Book size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">متابعة القراءة</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">{lastRead.surahName} {lastRead.ayahNumber ? `(آية ${lastRead.ayahNumber})` : ''}</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-emerald-500/50 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
        </motion.div>
      )}

      {/* Surahs List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card-3d overflow-hidden rounded-[2.5rem]"
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredSurahs.map((surah, index) => (
            <motion.button
              key={surah.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.5) }}
              onClick={() => fetchSurah(surah.number, surah.name)}
              className="w-full flex items-center justify-between p-5 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 active:bg-emerald-100/50 dark:active:bg-emerald-500/10 transition-colors text-right group"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:border-emerald-500/30 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-all">
                  <span className="font-bold text-slate-600 dark:text-slate-400 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{surah.number}</span>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 font-serif text-xl group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {surah.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold mt-1">
                    {surah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {surah.numberOfAyahs} آية
                  </p>
                </div>
              </div>
              <div className="text-left flex flex-col justify-center items-end opacity-60 group-hover:opacity-100 transition-opacity">
                <p className="font-bold text-slate-500 dark:text-slate-400 text-sm font-sans group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {surah.englishName}
                </p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1">
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

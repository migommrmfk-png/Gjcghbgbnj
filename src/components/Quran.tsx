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
  Download,
  BookOpen,
  Check,
  Brain,
  Calendar,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { saveAudio } from "../lib/audioStore";
import toast from 'react-hot-toast';
import { DEFAULT_SURAHS } from "../data/surahs";
import MemorizationHub from "./MemorizationHub";
import QuranPlan from "./QuranPlan";
import QuranReflection from "./QuranReflection";

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
  { id: 'muyassar', name: 'التفسير الميسر' },
  { id: 'ibn_kathir_ar', name: 'تفسير ابن كثير' },
  { id: 'ibn_kathir', name: 'تفسير ابن كثير (إنجليزي)' },
];

const THEMES = {
  light: {
    bg: "bg-white",
    containerBg: "bg-[#FCFBF9]",
    text: "text-slate-900",
    border: "border-emerald-600/20",
    name: "فاتح"
  },
  sepia: {
    bg: "bg-[#FAFAF5]",
    containerBg: "bg-[#FAF4E6]",
    text: "text-amber-950",
    border: "border-amber-600/30",
    name: "دافئ مريح"
  },
  dark: {
    bg: "bg-slate-950",
    containerBg: "bg-slate-900/60 border border-slate-800/80",
    text: "text-slate-100",
    border: "border-slate-800",
    name: "داكن خافت"
  },
  midnight: {
    bg: "bg-[#020617]",
    containerBg: "bg-[#091124] border border-[#064E3B]",
    text: "text-emerald-100",
    border: "border-[#064E3B]",
    name: "ليلي أخضر"
  }
};

export default function Quran() {
  const [subTab, setSubTab] = useState<'read' | 'memorize' | 'plans' | 'reflections'>('read');
  const [surahs, setSurahs] = useState<Surah[]>(DEFAULT_SURAHS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('quran_font_size') || '36', 10);
  });
  const [readingMode, setReadingMode] = useState<'mushaf' | 'list'>(() => {
    return (localStorage.getItem('quran_reading_mode') || 'mushaf') as 'mushaf' | 'list';
  });
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark' | 'midnight'>(() => {
    return (localStorage.getItem('quran_reading_theme') || 'sepia') as 'light' | 'sepia' | 'dark' | 'midnight';
  });
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  
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

  const [textSearchResults, setTextSearchResults] = useState<{ ayah: any, surah: any }[]>([]);
  const [isSearchingText, setIsSearchingText] = useState(false);
  const [searchMode, setSearchMode] = useState<'surah' | 'ayah'>('surah');

  const [lastRead, setLastRead] = useState<{ surahNumber: number, surahName: string, ayahNumber?: number } | null>(() => {
    const saved = localStorage.getItem('quranLastRead');
    return saved ? JSON.parse(saved) : null;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        try {
          audioRef.current.load();
        } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('quran_font_size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('quran_reading_mode', readingMode);
  }, [readingMode]);

  useEffect(() => {
    localStorage.setItem('quran_reading_theme', readingTheme);
  }, [readingTheme]);

  useEffect(() => {
    // Check cache first
    const cachedSurahs = localStorage.getItem('quran_surahs');
    if (cachedSurahs) {
      setSurahs(JSON.parse(cachedSurahs));
      setLoading(false);
    } else {
      // Fetch Surahs list
      fetch("https://ummahapi.com/api/quran/surahs")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const mappedSurahs = data.data.surahs.map((s: any) => ({
              number: s.number,
              name: s.name_arabic,
              englishName: s.name_english,
              englishNameTranslation: s.name_translation,
              numberOfAyahs: s.verses_count,
              revelationType: s.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'
            }));
            setSurahs(mappedSurahs);
            localStorage.setItem('quran_surahs', JSON.stringify(mappedSurahs));
          } else {
            setSurahs(DEFAULT_SURAHS);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch surahs, using offline fallback:", err);
          setSurahs(DEFAULT_SURAHS);
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
        const res = await fetch(`https://ummahapi.com/api/quran/surah/${surahNumber}`);
        const resData = await res.json();
        
        if (resData.success) {
          const s = resData.data.surah;
          surahData = {
            number: s.number,
            name: s.name_arabic,
            englishName: s.name_english,
            englishNameTranslation: s.name_translation,
            revelationType: s.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
            numberOfAyahs: s.verses_count,
            ayahs: resData.data.verses.map((v: any) => ({
              number: parseInt(v.verse_key.split(":")[1]),
              text: v.arabic,
              numberInSurah: v.ayah
            }))
          };
        } else {
          throw new Error("Failed to load surah");
        }
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
        
        audioRef.current.src = directUrl;
        audioRef.current.load();
        audioRef.current.volume = volume;
        setIsAudioLoading(true);
        
        // Setup Media Session API
        if ('mediaSession' in navigator) {
          const fallbackReciterName = reciters.find(r => r.server === activeReciterServer)?.name || 'مقرئ';
          navigator.mediaSession.metadata = new MediaMetadata({
            title: surahName || surahData.name || 'القرآن الكريم',
            artist: fallbackReciterName,
            album: 'القرآن الكريم',
            artwork: [
              { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
            ]
          });
          
          navigator.mediaSession.setActionHandler('play', () => {
            audioRef.current?.play();
          });
          navigator.mediaSession.setActionHandler('pause', () => {
             audioRef.current?.pause();
          });
        }
        
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsAudioLoading(false);
            setAudioError("");
          })
          .catch(e => {
            console.warn(`Playback failed for ${directUrl}`, e);
            setIsPlaying(false);
            setIsAudioLoading(false);
            setAudioError("تعذر تشغيل التلاوة. يرجى التحقق من اتصالك بالإنترنت.");
          });
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
      if (!selectedSurah) throw new Error("No surah selected");
      const res = await fetch(`https://ummahapi.com/api/tafsir/${tafsirId}/surah/${selectedSurah.number}/ayah/${numberInSurah}`);
      const data = await res.json();
      if (data.success) {
        setSelectedAyahTafsir({ text: ayahText, tafsir: data.data.tafsir.text, number: numberInSurah, globalNumber: ayahNumber });
      } else {
        throw new Error("Failed to load tafsir");
      }
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
        audioRef.current.load();
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
      const response = await fetch(url);
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
      toast.success('تم تحميل التلاوة بنجاح. يمكنك العثور عليها في قائمة التنزيلات.');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('حدث خطأ أثناء تحميل التلاوة');
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (searchMode !== 'ayah' || searchQuery.length < 3) {
      setTextSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingText(true);
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/search/${searchQuery}/all/quran-simple-clean`);
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.matches) {
          setTextSearchResults(data.data.matches);
        } else {
          setTextSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setTextSearchResults([]);
      } finally {
        setIsSearchingText(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchMode]);

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
            console.error("Audio error", e?.type || String(e));
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
        <div className={`sticky top-0 border-b backdrop-blur-md shadow-sm z-25 px-4 py-3 flex items-center justify-between transition-all duration-300 ${THEMES[readingTheme].bg}/90 ${THEMES[readingTheme].border}`}>
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                try {
                  audioRef.current.load();
                } catch (e) {}
              }
              setIsPlaying(false);
              setSelectedSurah(null);
            }}
            className="p-2 hover:opacity-85 rounded-full transition-all border bg-white/10 dark:bg-slate-900/40 shadow-sm animate-in fade-in zoom-in-50"
            style={{ borderColor: readingTheme === 'light' || readingTheme === 'sepia' ? '#e2e8f0' : '#1e293b' }}
          >
            <ArrowRight size={22} className={readingTheme === 'light' || readingTheme === 'sepia' ? 'text-slate-700' : 'text-slate-300'} />
          </button>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="px-5 py-1 border border-emerald-500/20 rounded-full bg-emerald-500/10">
              <h1 className="text-lg font-black font-quran text-emerald-600 dark:text-emerald-400">
                سُورَةُ {selectedSurah.name.replace('سُورَةُ ', '')}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowSettingsDrawer(true)}
            className="p-2 hover:opacity-85 rounded-full transition-all border bg-white/10 dark:bg-slate-900/40 shadow-sm flex items-center justify-center"
            style={{ borderColor: readingTheme === 'light' || readingTheme === 'sepia' ? '#e2e8f0' : '#1e293b' }}
            title="الإعدادات المتقدمة"
          >
            <Settings size={22} className={readingTheme === 'light' || readingTheme === 'sepia' ? 'text-slate-700' : 'text-slate-300'} />
          </button>
        </div>

        {/* Content - Adaptive Reading Styles */}
        <div className={`p-2 sm:p-6 min-h-screen transition-all duration-300 ${THEMES[readingTheme].bg}`}>
          <div className={`${THEMES[readingTheme].containerBg} ${readingMode === 'mushaf' ? 'border-8' : 'border'} ${THEMES[readingTheme].border} rounded-[2rem] p-4 sm:p-7 shadow-xs relative overflow-hidden transition-all duration-300`}>
            {/* Decorative corners - only show in Mushaf mode */}
            {readingMode === 'mushaf' && (
              <>
                <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-emerald-500/40 rounded-tr-xl"></div>
                <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-emerald-500/40 rounded-tl-xl"></div>
                <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-emerald-500/40 rounded-br-xl"></div>
                <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-emerald-500/40 rounded-bl-xl"></div>
              </>
            )}
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat pointer-events-none"></div>

            <div
              className={`font-quran relative z-10 ${THEMES[readingTheme].text}`}
              style={{ 
                fontSize: `${fontSize}px`, 
                lineHeight: '2.5',
                wordSpacing: '0.15em'
              }}
            >
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-8 mt-4 flex justify-center"
                >
                  <div className="px-8 py-2.5 border-y-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" style={{ fontSize: `${fontSize * 1.1}px` }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </motion.div>
              )}

              {loadingSurah ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
              ) : readingMode === 'mushaf' ? (
                <div className="text-justify font-serif" dir="rtl" style={{ textAlignLast: 'center' }}>
                  {selectedSurah.ayahs.map((ayah) => {
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

                    const arabicNumber = ayah.numberInSurah.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

                    return (
                      <span
                        key={ayah.number}
                        ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
                        className={`inline cursor-pointer hover:bg-emerald-500/10 transition-colors rounded px-1.5 py-1 leading-loose ${lastRead?.surahNumber === selectedSurah.number && lastRead?.ayahNumber === ayah.numberInSurah ? 'bg-emerald-500/15 ring-1 ring-emerald-500/20' : ''}`}
                        onClick={() => fetchTafsir(ayah.number, text, ayah.numberInSurah)}
                      >
                        {text}
                        <span className="inline-flex items-center justify-center relative mx-1.5 text-emerald-600 dark:text-emerald-400 opacity-95 select-none font-bold">
                          <span style={{ fontSize: `${fontSize * 1.2}px` }}>۝</span>
                          <span className="absolute inset-0 flex items-center justify-center font-sans font-black" style={{ fontSize: `${fontSize * 0.38}px`, marginTop: '3px' }}>
                            {arabicNumber}
                          </span>
                        </span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-4 text-right" dir="rtl">
                  {selectedSurah.ayahs.map((ayah) => {
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

                    const arabicNumber = ayah.numberInSurah.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
                    const isLastRead = lastRead?.surahNumber === selectedSurah.number && lastRead?.ayahNumber === ayah.numberInSurah;

                    return (
                      <div
                        key={ayah.number}
                        ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
                        onClick={() => fetchTafsir(ayah.number, text, ayah.numberInSurah)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-justify hover:bg-emerald-500/5 ${
                          isLastRead 
                            ? 'bg-emerald-500/15 border-emerald-500/30 shadow-xs ring-1 ring-emerald-500/20' 
                            : 'bg-black/5 dark:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex gap-4 items-start justify-between">
                          <p className="font-quran flex-1 leading-loose" style={{ fontSize: `${fontSize}px` }}>
                            {text}
                          </p>
                          <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-3 border border-emerald-500/20 select-none">
                            {arabicNumber}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings bottom sheet drawer */}
        <AnimatePresence>
          {showSettingsDrawer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-4"
              onClick={() => setShowSettingsDrawer(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header inside settings */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Settings size={20} />
                    </div>
                    <div className="text-right">
                      <h3 className="text-base font-black text-slate-800 dark:text-white font-serif">
                        إعدادات التلاوة والقراءة
                      </h3>
                      <p className="text-[10px] text-slate-400">خصص مظهر وحجم ولون خط المصحف</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSettingsDrawer(false)} 
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all"
                  >
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* FONT SIZE SETTING */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>حجم خط القرآن والآيات:</span>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg font-mono">
                        {fontSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 font-bold">أصغر</span>
                      <input 
                        type="range"
                        min={20}
                        max={54}
                        step={2}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-lg text-slate-855 dark:text-slate-100 font-bold font-serif">أكبر</span>
                    </div>
                    {/* Size Reset */}
                    <button
                      onClick={() => setFontSize(36)}
                      className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline block text-right"
                    >
                      إعادة تعيين الحجم الافتراضي (36px)
                    </button>
                  </div>

                  {/* READING MODE SETTING */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">وضع قراءة المصحف الشريف:</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setReadingMode('mushaf')}
                        className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all text-center ${
                          readingMode === 'mushaf' 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-805 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <BookOpen size={18} />
                        </div>
                        <span className="text-xs font-black">وضع المصحف المتصل</span>
                        <span className="text-[9px] text-slate-400">قراءة متصلة ومريحة للختم</span>
                      </button>

                      <button
                        onClick={() => setReadingMode('list')}
                        className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all text-center ${
                          readingMode === 'list' 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-805 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <Book size={18} />
                        </div>
                        <span className="text-xs font-black">وضع السرد (آية بآية)</span>
                        <span className="text-[9px] text-slate-400">تسهل التركيز والتفسير المباشر</span>
                      </button>
                    </div>
                  </div>

                  {/* READING THEME SETTING */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">سمات القراءة (مظهر الخلفية):</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {Object.entries(THEMES).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => setReadingTheme(key as any)}
                          className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                            readingTheme === key 
                              ? 'ring-2 ring-emerald-500 border-transparent shadow-md' 
                              : 'border-slate-200 dark:border-slate-800'
                          } ${key === 'light' ? 'bg-white text-slate-900 shadow-inner' : key === 'sepia' ? 'bg-[#FAF4E6] text-[#2c1c04]' : key === 'dark' ? 'bg-slate-900 border border-slate-800 text-slate-100' : 'bg-[#091124] border border-[#064E3B] text-emerald-100'}`}
                        >
                          <span className={`w-4 h-4 rounded-full border border-black/10 flex items-center justify-center ${readingTheme === key ? 'bg-emerald-500 text-white' : 'bg-transparent'}`}>
                            {readingTheme === key && <Check size={10} />}
                          </span>
                          <span className="text-xs font-black">
                            {value.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-[0.98]"
                >
                  تأكيد وحفظ الخيارات 👍
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="p-4 flex flex-col gap-3 bg-white/95 dark:bg-slate-900/95 backdrop- border border-slate-200 dark:border-slate-800 shadow-lg rounded-3xl relative z-30">
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
                       audioRef.current.pause();
                       audioRef.current.src = `${e.target.value}${paddedNumber}.mp3`;
                       audioRef.current.load();
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

  if (subTab === 'memorize') {
    return <MemorizationHub onBack={() => setSubTab('read')} />;
  }

  if (subTab === 'plans') {
    return <QuranPlan onBack={() => setSubTab('read')} />;
  }

  if (subTab === 'reflections') {
    return <QuranReflection onBack={() => setSubTab('read')} />;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28 min-h-screen" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#0A1914] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden text-center border border-white/20"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none" 
          style={{ backgroundImage: 'url("/src/assets/images/quran_gold_light_1779803230036.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-600/60 via-emerald-700/80 to-teal-900/90 mix-blend-overlay"></div>
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -mr-12 -mt-12 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-12 -mb-12"></div>
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

      {/* 360° Quran Dimensions Bento Hub */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mr-2">أبعاد القرآن الشامل ٣٦٠° 🌟</span>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setSubTab('memorize')}
            className="flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-emerald-50/50 to-emerald-100/20 dark:from-slate-900 dark:to-slate-900/60 border border-emerald-500/10 dark:border-slate-800 rounded-[2rem] hover:border-emerald-500/30 dark:hover:border-emerald-500/20 active:scale-95 transition-all shadow-xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Brain size={18} />
            </div>
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">التسميع الذكي</span>
            <span className="text-[8px] text-slate-400 font-bold mt-0.5 leading-none">مراجعة وحفظ</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('plans')}
            className="flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-amber-50/50 to-amber-100/20 dark:from-slate-900 dark:to-slate-900/60 border border-amber-500/10 dark:border-slate-800 rounded-[2rem] hover:border-amber-500/30 dark:hover:border-amber-500/20 active:scale-95 transition-all shadow-xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Calendar size={18} />
            </div>
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">خطط الختم</span>
            <span className="text-[8px] text-slate-400 font-bold mt-0.5 leading-none">ورد مخصص</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('reflections')}
            className="flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-teal-50/50 to-teal-100/20 dark:from-slate-900 dark:to-slate-900/60 border border-teal-500/10 dark:border-slate-800 rounded-[2rem] hover:border-teal-500/30 dark:hover:border-teal-500/20 active:scale-95 transition-all shadow-xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Sparkles size={18} />
            </div>
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">تدبر وتعلم</span>
            <span className="text-[8px] text-slate-400 font-bold mt-0.5 leading-none">تأمل الآيات</span>
          </button>
        </div>
      </motion.div>

      {/* Last Read Quick Access */}
      {lastRead && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-5 flex items-center justify-between cursor-pointer shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-lg hover:-translate-y-1 transition-all"
          onClick={() => fetchSurah(lastRead.surahNumber, lastRead.surahName, lastRead.ayahNumber)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookmarkCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">متابعة القراءة</p>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-serif">{lastRead.surahName} {lastRead.ayahNumber ? `(آية ${lastRead.ayahNumber})` : ''}</h3>
            </div>
          </div>
          <button className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition-colors shadow-sm">
            <PlayCircle size={20} />
          </button>
        </motion.div>
      )}

      {/* Search Bar */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all flex flex-col"
      >
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
            {isSearchingText ? (
              <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
            ) : (
              <Search className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            className="block w-full pl-5 pr-14 py-4 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 font-bold placeholder-slate-400 outline-none"
            placeholder={searchMode === 'surah' ? "ابحث عن سورة..." : "ابحث في آيات القرآن..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex border-t border-slate-100 dark:border-slate-800">
          <button
            className={`flex-1 py-3 text-sm font-bold transition-colors ${searchMode === 'surah' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            onClick={() => { setSearchMode('surah'); setTextSearchResults([]); }}
          >
            أسماء السور
          </button>
          <div className="w-px bg-slate-100 dark:bg-slate-800"></div>
          <button
            className={`flex-1 py-3 text-sm font-bold transition-colors ${searchMode === 'ayah' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            onClick={() => setSearchMode('ayah')}
          >
            البحث في الآيات
          </button>
        </div>
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

      {/* Search Results */}
      {searchMode === 'ayah' && searchQuery.length >= 3 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          <h3 className="font-bold text-slate-600 dark:text-slate-400 text-sm px-2">
            {textSearchResults.length > 0 ? `نتائج البحث (${textSearchResults.length})` : (isSearchingText ? 'جاري البحث...' : 'لا توجد نتائج')}
          </h3>
          <div className="space-y-3">
            {textSearchResults.slice(0, 20).map((result: any, index: number) => (
              <motion.div
                key={`${result.surah.number}-${result.numberInSurah}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => fetchSurah(result.surah.number, result.surah.name, result.numberInSurah)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] p-5 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-emerald-500/30 transition-all"
              >
                <p className="font-quran text-xl leading-relaxed text-slate-800 dark:text-slate-100 mb-4">{result.text}</p>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 w-fit px-3 py-1.5 rounded-full">
                  <BookOpen size={14} />
                  <span>سورة {result.surah.name} - آية {result.numberInSurah}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Surahs List */}
      {searchMode === 'surah' && (
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
      )}
    </div>
  );
}

export const QURAN_API_BASE = 'https://api.quran.com/api/v4';

export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  translations?: { id: number; resource_id: number; text: string }[];
}

export interface Reciter {
  id: number;
  reciter_name: string;
  style: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export const quranService = {
  // 1. Get all chapters (Surahs)
  async getChapters(): Promise<Chapter[]> {
    const response = await fetch(`${QURAN_API_BASE}/chapters?language=ar`);
    const data = await response.json();
    return data.chapters;
  },

  // 2. Get verses for a specific chapter
  async getChapterVerses(chapterId: number, page: number = 1): Promise<Verse[]> {
    const response = await fetch(`${QURAN_API_BASE}/quran/verses/uthmani?chapter_number=${chapterId}`);
    const data = await response.json();
    return data.verses;
  },

  // 3. Search Quran
  async searchQuran(query: string, language: string = 'ar'): Promise<any> {
    const response = await fetch(`${QURAN_API_BASE}/search?q=${query}&size=20&page=1&language=${language}`);
    const data = await response.json();
    return data.search.results;
  },

  // 4. Get Tafsir for a verse
  async getTafsir(tafsirId: number, verseKey: string): Promise<any> {
    // tafsirId: 169 for Tafsir Ibn Kathir (Arabic), 16 for Tafsir Al-Jalalayn (Arabic)
    const response = await fetch(`${QURAN_API_BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    const data = await response.json();
    return data.tafsir;
  },

  // 5. Get list of reciters
  async getReciters(): Promise<Reciter[]> {
    const response = await fetch(`${QURAN_API_BASE}/resources/recitations?language=ar`);
    const data = await response.json();
    return data.recitations;
  },

  // 6. Get audio for a specific chapter by a specific reciter
  async getChapterAudio(reciterId: number, chapterId: number): Promise<string> {
    const response = await fetch(`${QURAN_API_BASE}/chapter_recitations/${reciterId}/${chapterId}`);
    const data = await response.json();
    return data.audio_file.audio_url;
  }
};

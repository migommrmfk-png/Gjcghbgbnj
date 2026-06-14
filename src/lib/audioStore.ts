import localforage from 'localforage';

localforage.config({
  name: 'HathaDeeniApp',
  storeName: 'audio_downloads', // Should be alphanumeric, with underscores.
  description: 'Stores downloaded audio files for offline use'
});

export interface DownloadedAudio {
  id: string; // e.g. "surah_1_1" for Surah 1, Reciter 1
  surahNumber: number;
  surahName: string;
  reciterName: string;
  blob: Blob;
  downloadedAt: string;
}

export const saveAudio = async (item: DownloadedAudio) => {
  try {
    await localforage.setItem(item.id, item);
  } catch (error: any) {
    console.error("localforage save error:", error);
    if (
      error?.name === 'QuotaExceededError' || 
      error?.name === 'AbortError' || 
      error?.message?.includes('No space') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('FILE_ERROR_NO_SPACE')
    ) {
      throw new Error("سعة التخزين ممتلئة! يرجى تحرير مساحة على جهازك أو حذف تلاوات قديمة.");
    }
    throw error;
  }
};

export const getAudio = async (id: string): Promise<DownloadedAudio | null> => {
  try {
    return await localforage.getItem<DownloadedAudio>(id);
  } catch (error) {
    console.error("Error reading audio ID from localforage:", error);
    return null;
  }
};

export const removeAudio = async (id: string) => {
  try {
    await localforage.removeItem(id);
  } catch (error) {
    console.error("Error removing audio ID from localforage:", error);
  }
};

export const getAllDownloadedAudios = async (): Promise<DownloadedAudio[]> => {
  try {
    const audios: DownloadedAudio[] = [];
    await localforage.iterate((value: DownloadedAudio) => {
      audios.push(value);
    });
    return audios.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
  } catch (error) {
    console.error("Error iterating audios from localforage:", error);
    return [];
  }
};

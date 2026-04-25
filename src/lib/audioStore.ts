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
  await localforage.setItem(item.id, item);
};

export const getAudio = async (id: string): Promise<DownloadedAudio | null> => {
  return await localforage.getItem<DownloadedAudio>(id);
};

export const removeAudio = async (id: string) => {
  await localforage.removeItem(id);
};

export const getAllDownloadedAudios = async (): Promise<DownloadedAudio[]> => {
  const audios: DownloadedAudio[] = [];
  await localforage.iterate((value: DownloadedAudio) => {
    audios.push(value);
  });
  return audios.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
};

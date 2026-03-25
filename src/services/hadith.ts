export const HADITH_API_BASE = 'https://api.hadith.gading.dev';

export interface HadithBook {
  id: string;
  name: string;
  available: number;
}

export interface Hadith {
  number: number;
  arab: string;
  id: string; // Indonesian translation usually
}

export const hadithService = {
  // 1. Get list of books
  async getBooks(): Promise<HadithBook[]> {
    const response = await fetch(`${HADITH_API_BASE}/books`);
    const data = await response.json();
    return data.data;
  },

  // 2. Get hadiths from a specific book
  async getHadiths(bookId: string, page: number = 1, limit: number = 20): Promise<{ name: string; id: string; available: number; hadiths: Hadith[] }> {
    // Note: This API might return all hadiths or paginate depending on the endpoint.
    // We'll fetch a range
    const response = await fetch(`${HADITH_API_BASE}/books/${bookId}?range=${(page - 1) * limit + 1}-${page * limit}`);
    const data = await response.json();
    return data.data;
  },

  // 3. Get a random Hadith of the day
  async getHadithOfDay(): Promise<Hadith> {
    // We can fetch from Bukhari randomly
    const randomNum = Math.floor(Math.random() * 7000) + 1;
    const response = await fetch(`${HADITH_API_BASE}/books/bukhari/${randomNum}`);
    const data = await response.json();
    return data.data.contents;
  }
};

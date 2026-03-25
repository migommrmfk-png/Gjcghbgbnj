export const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
  holidays: string[];
}

export const prayerService = {
  // 1. Get timings by city and country
  async getTimingsByCity(city: string, country: string): Promise<{ timings: PrayerTimings; date: { hijri: HijriDate } }> {
    const response = await fetch(`${ALADHAN_API_BASE}/timingsByCity?city=${city}&country=${country}&method=5`); // Method 5: Egyptian General Authority of Survey
    const data = await response.json();
    return data.data;
  },

  // 2. Get timings by coordinates
  async getTimingsByCoordinates(lat: number, lng: number): Promise<{ timings: PrayerTimings; date: { hijri: HijriDate } }> {
    const response = await fetch(`${ALADHAN_API_BASE}/timings?latitude=${lat}&longitude=${lng}&method=5`);
    const data = await response.json();
    return data.data;
  },

  // 3. Get Qibla direction
  async getQibla(lat: number, lng: number): Promise<{ direction: number }> {
    const response = await fetch(`${ALADHAN_API_BASE}/qibla/${lat}/${lng}`);
    const data = await response.json();
    return data.data;
  },

  // 4. Convert Gregorian to Hijri
  async gregorianToHijri(date: string): Promise<HijriDate> {
    // date format: DD-MM-YYYY
    const response = await fetch(`${ALADHAN_API_BASE}/gToH?date=${date}`);
    const data = await response.json();
    return data.data.hijri;
  }
};

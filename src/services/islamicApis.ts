// Collection of Islamic APIs for future use

export const ISLAMIC_APIS = {
  // Quran APIs
  QURAN_TEXT: 'https://api.alquran.cloud/v1/quran/ar.alafasy', // Full Quran Text
  QURAN_EDITIONS: 'https://api.alquran.cloud/v1/edition', // List all editions (translations, tafsirs)
  QURAN_SEARCH: 'https://api.alquran.cloud/v1/search/', // Search Quran {query}/all/ar
  QURAN_AUDIO: 'https://api.quran.com/api/v4/chapter_recitations/1/', // Audio recitations
  
  // Hadith APIs
  HADITH_BASE: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/', // Contains Bukhari, Muslim, etc.
  HADITH_COLLECTIONS: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json', // List of collections

  // Tafsir APIs
  TAFSIR_BASE: 'https://api.alquran.cloud/v1/tafsir/', // Tafsir for specific Ayah (e.g. ar.jalalayn)

  // Prayer Times & Hijri Calendar
  ALADHAN_TIMINGS: 'https://api.aladhan.com/v1/timingsByCity', // By City
  ALADHAN_TIMINGS_LOCATION: 'https://api.aladhan.com/v1/timings', // By Latitude/Longitude
  ALADHAN_CALENDAR: 'https://api.aladhan.com/v1/hijriCalendar', // Full month Hijri calendar
  ALADHAN_QIBLA: 'https://api.aladhan.com/v1/qibla', // Qibla direction

  // MP3 Quran (Radio & Reciters)
  MP3_QURAN_RECITERS: 'https://www.mp3quran.net/api/v3/reciters?language=ar',
  MP3_QURAN_RADIOS: 'https://www.mp3quran.net/api/v3/radios?language=ar',
  MP3_QURAN_TAFSIR: 'https://www.mp3quran.net/api/v3/tafsir?language=ar',

  // OSM Overpass (Mosques)
  OSM_OVERPASS: 'https://overpass-api.de/api/interpreter', // Query using Overpass QL

  // Geolocation
  GEO_IP: 'https://get.geojs.io/v1/ip/geo.json', // IP to Location
  REVERSE_GEO: 'https://nominatim.openstreetmap.org/reverse', // Lat/Lng to City Name

  // Names of Allah
  ASMA_AL_HUSNA: 'https://api.aladhan.com/v1/asmaAlHusna', // 99 Names of Allah
};

/**
 * Examples of how to fetch these APIs
 */
export async function testAPIs() {
  // 1. Fetch random Ayat
  const ayahRes = await fetch('https://api.alquran.cloud/v1/ayah/262');
  const ayahData = await ayahRes.json();
  console.log("Ayah:", ayahData.data.text);

  // 2. Fetch specific Hadith
  const hadithRes = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari1/1.json');
  const hadithData = await hadithRes.json();
  console.log("Hadith:", hadithData.hadiths[0].text);

  // 3. Fetch Radio Stations
  const radioRes = await fetch('https://www.mp3quran.net/api/v3/radios?language=ar');
  const radioData = await radioRes.json();
  console.log("Radios:", radioData.radios[0].name);
}

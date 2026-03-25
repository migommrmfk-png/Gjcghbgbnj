export const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';

export interface WeatherData {
  temperature: number;
  condition: string;
  isDay: boolean;
}

export const weatherService = {
  // 1. Get current weather
  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    // Using open-meteo as a free alternative to openweathermap (no API key required)
    const response = await fetch(`${WEATHER_API_BASE}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,is_day,weather_code`);
    const data = await response.json();
    
    // Map WMO weather codes to simple descriptions
    const code = data.current.weather_code;
    let condition = 'صافي';
    if (code >= 1 && code <= 3) condition = 'غائم جزئياً';
    if (code >= 45 && code <= 48) condition = 'ضباب';
    if (code >= 51 && code <= 67) condition = 'مطر خفيف';
    if (code >= 71 && code <= 77) condition = 'ثلج';
    if (code >= 80 && code <= 82) condition = 'مطر غزير';
    if (code >= 95) condition = 'عاصفة رعدية';

    return {
      temperature: data.current.temperature_2m,
      condition,
      isDay: data.current.is_day === 1
    };
  }
};

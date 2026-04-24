import React, { createContext, useState, useEffect, useContext } from 'react';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  day: string;
  weekday: { ar: string };
  month: { ar: string };
  year: string;
}

interface PrayerTimesContextType {
  prayerTimes: PrayerTimes | null;
  hijriDate: HijriDate | null;
  gregorianDate: string;
  locationName: string;
  userLocation: { lat: number; lon: number } | null;
  loading: boolean;
  error: string | null;
  autoAdhanEnabled: boolean;
  setAutoAdhanEnabled: (enabled: boolean) => void;
  calculationMethod: number;
  setCalculationMethod: (method: number) => void;
  asrMethod: number;
  setAsrMethod: (method: number) => void;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [gregorianDate, setGregorianDate] = useState("");
  const [locationName, setLocationName] = useState("مكة المكرمة");
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [autoAdhanEnabled, setAutoAdhanEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('autoAdhanEnabled') !== 'false'; // Default to true
  });

  const [calculationMethod, setCalculationMethodState] = useState<number>(() => {
    return parseInt(localStorage.getItem('calculationMethod') || '4', 10); // Default to Umm Al-Qura
  });

  const [asrMethod, setAsrMethodState] = useState<number>(() => {
    return parseInt(localStorage.getItem('asrMethod') || '0', 10); // Default to Standard (Shafi, Maliki, Hanbali)
  });

  const setAutoAdhanEnabled = (enabled: boolean) => {
    setAutoAdhanEnabledState(enabled);
    localStorage.setItem('autoAdhanEnabled', enabled.toString());
  };

  const setCalculationMethod = (method: number) => {
    setCalculationMethodState(method);
    localStorage.setItem('calculationMethod', method.toString());
  };

  const setAsrMethod = (method: number) => {
    setAsrMethodState(method);
    localStorage.setItem('asrMethod', method.toString());
  };

  useEffect(() => {
    const fetchPrayerTimes = async (lat?: number, lng?: number, cityStr?: string) => {
      try {
        setLoading(true);
        let url =
          `https://api.aladhan.com/v1/timingsByCity?city=Makkah&country=Saudi Arabia&method=${calculationMethod}&school=${asrMethod}`;

        if (lat && lng) {
          const timestamp = Math.floor(Date.now() / 1000);
          url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${calculationMethod}&school=${asrMethod}`;
          setUserLocation({ lat, lon: lng });
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch prayer times");

        const data = await response.json();
        setPrayerTimes(data.data.timings);
        setHijriDate(data.data.date.hijri);
        setGregorianDate(data.data.date.gregorian.date);

        if (cityStr) {
          setLocationName(cityStr);
        } else if (lat && lng && !locationName || locationName === "مكة المكرمة") {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
              {
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'IslamicApp/1.0'
                }
              }
            );
            if (!geoRes.ok) throw new Error("Geocoding failed");
            const geoText = await geoRes.text();
            try {
              const geoData = JSON.parse(geoText);
              if (geoData.address) {
                const city =
                  geoData.address.city ||
                  geoData.address.town ||
                  geoData.address.village ||
                  geoData.address.state ||
                  geoData.address.country;
                if (city) setLocationName(city);
              }
            } catch (e) {
              console.error("Invalid JSON from Nominatim:", geoText.substring(0, 100));
              setLocationName("موقعك الحالي");
            }
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            setLocationName("موقعك الحالي");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    const fetchByIP = async () => {
      try {
        const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const data = await res.json();
        fetchPrayerTimes(parseFloat(data.latitude), parseFloat(data.longitude), data.city || data.country);
      } catch (e) {
        fetchPrayerTimes();
      }
    };

    if (userLocation) {
      fetchPrayerTimes(userLocation.lat, userLocation.lon, locationName);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          fetchByIP();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      fetchByIP();
    }
  }, [calculationMethod, asrMethod]); // Re-fetch when settings change

  return (
    <PrayerTimesContext.Provider value={{ 
      prayerTimes, hijriDate, gregorianDate, locationName, userLocation, loading, error, 
      autoAdhanEnabled, setAutoAdhanEnabled,
      calculationMethod, setCalculationMethod,
      asrMethod, setAsrMethod
    }}>
      {children}
    </PrayerTimesContext.Provider>
  );
};

export const usePrayerTimes = () => {
  const context = useContext(PrayerTimesContext);
  if (context === undefined) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
};

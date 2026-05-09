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
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
            );
            if (!geoRes.ok) throw new Error("Geocoding failed");
            const geoData = await geoRes.json();
            if (geoData.city || geoData.locality || geoData.countryName) {
              const city = geoData.city || geoData.locality || geoData.countryName;
              if (city) setLocationName(city);
            }
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            setLocationName("موقع غير معروف");
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
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("ipapi failed");
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
           fetchPrayerTimes(parseFloat(data.latitude), parseFloat(data.longitude), data.city || data.country_name);
           return;
        }
        throw new Error("Invalid IP geo data");
      } catch (e) {
        try {
          const res2 = await fetch("https://get.geojs.io/v1/ip/geo.json");
          if (!res2.ok) throw new Error("geojs failed");
          const data2 = await res2.json();
          if (data2 && data2.latitude) {
            fetchPrayerTimes(parseFloat(data2.latitude), parseFloat(data2.longitude), data2.city || data2.country);
            return;
          }
          throw new Error("Invalid geojs data");
        } catch (e2) {
          fetchPrayerTimes(); // fallback to default (Makkah)
        }
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

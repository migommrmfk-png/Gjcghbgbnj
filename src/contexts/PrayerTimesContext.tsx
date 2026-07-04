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
  updateLocation: (lat: number, lon: number, name: string) => void;
  detectLocation: () => Promise<void>;
  resetToDefault: () => void;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(() => {
    const cached = localStorage.getItem('prayerTimes');
    return cached ? JSON.parse(cached) : null;
  });
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(() => {
    const cached = localStorage.getItem('hijriDate');
    return cached ? JSON.parse(cached) : null;
  });
  const [gregorianDate, setGregorianDate] = useState(() => {
    return localStorage.getItem('gregorianDate') || "";
  });
  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem('locationName') || "مكة المكرمة";
  });
  const [userLocation, setUserLocationState] = useState<{ lat: number; lon: number } | null>(() => {
    const cached = localStorage.getItem('userLocation');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('prayerTimes');
  });
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

  const updateLocation = (lat: number, lon: number, name: string) => {
    setUserLocationState({ lat, lon });
    localStorage.setItem('userLocation', JSON.stringify({ lat, lon }));
    setLocationName(name);
    localStorage.setItem('locationName', name);
  };

  const resetToDefault = () => {
    setUserLocationState(null);
    localStorage.removeItem('userLocation');
    setLocationName("مكة المكرمة");
    localStorage.setItem('locationName', "مكة المكرمة");
  };

  const detectLocationByIP = async (): Promise<void> => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const cityName = data.city || data.region || data.country_name || "موقعي الحالي";
        updateLocation(data.latitude, data.longitude, cityName);
      } else {
        throw new Error();
      }
    } catch (e) {
      try {
        const res = await fetch('https://ip-api.com/json/');
        const data = await res.json();
        if (data.status === 'success') {
          updateLocation(data.lat, data.lon, data.city || "موقعي الحالي");
        } else {
          throw new Error();
        }
      } catch (err) {
        throw new Error("عذرًا، لم نتمكن من تحديد موقعك تلقائيًا. يرجى اختيار بلدك أو مدينتك يدويًا.");
      }
    }
  };

  const detectLocation = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        detectLocationByIP().then(resolve).catch(reject);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`
            );
            if (!geoRes.ok) throw new Error();
            const geoData = await geoRes.json();
            const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.state || geoData.display_name || "موقعي الحالي";
            updateLocation(lat, lon, city.split(',')[0]);
            resolve();
          } catch (e) {
            try {
              const geoRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`
              );
              const geoData = await geoRes.json();
              const city = geoData.city || geoData.locality || geoData.countryName || "موقعي الحالي";
              updateLocation(lat, lon, city);
              resolve();
            } catch (err) {
              updateLocation(lat, lon, "موقعي الحالي");
              resolve();
            }
          }
        },
        async (err) => {
          try {
            await detectLocationByIP();
            resolve();
          } catch (ipErr) {
            reject(new Error("عذرًا، لم نتمكن من الوصول لموقعك الجغرافي. يرجى تفعيل إذن الموقع أو كتابة اسم مدينتك في مربع البحث يدويًا."));
          }
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    });
  };

  useEffect(() => {
    const fetchPrayerTimes = async (lat?: number, lng?: number, cityStr?: string) => {
      try {
        setLoading(true);
        let url =
          `https://api.aladhan.com/v1/timingsByCity?city=Makkah&country=Saudi Arabia&method=${calculationMethod}&school=${asrMethod}`;

        if (lng !== undefined && lat !== undefined) {
          const timestamp = Math.floor(Date.now() / 1000);
          url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${calculationMethod}&school=${asrMethod}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch prayer times");

        const data = await response.json();
        setPrayerTimes(data.data.timings);
        localStorage.setItem('prayerTimes', JSON.stringify(data.data.timings));
        setHijriDate(data.data.date.hijri);
        localStorage.setItem('hijriDate', JSON.stringify(data.data.date.hijri));
        setGregorianDate(data.data.date.gregorian.date);
        localStorage.setItem('gregorianDate', data.data.date.gregorian.date);

        if (cityStr) {
          setLocationName(cityStr);
          localStorage.setItem('locationName', cityStr);
        } else if (lat !== undefined && lng !== undefined && (!locationName || locationName === "مكة المكرمة")) {
          try {
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
            );
            if (!geoRes.ok) throw new Error("Geocoding failed");
            const geoData = await geoRes.json();
            if (geoData.city || geoData.locality || geoData.countryName) {
              const city = geoData.city || geoData.locality || geoData.countryName;
              if (city) {
                setLocationName(city);
                localStorage.setItem('locationName', city);
              }
            }
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            setLocationName("موقع غير معروف");
            localStorage.setItem('locationName', "موقع غير معروف");
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
    } else {
      // If there is no cached location, let's try browser geolocation first, then fallback to IP
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.warn("Geolocation error:", err.message);
            fetchByIP();
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        fetchByIP();
      }
    }
  }, [calculationMethod, asrMethod, userLocation, locationName]);

  return (
    <PrayerTimesContext.Provider value={{ 
      prayerTimes, hijriDate, gregorianDate, locationName, userLocation, loading, error, 
      autoAdhanEnabled, setAutoAdhanEnabled,
      calculationMethod, setCalculationMethod,
      asrMethod, setAsrMethod,
      updateLocation,
      detectLocation,
      resetToDefault
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

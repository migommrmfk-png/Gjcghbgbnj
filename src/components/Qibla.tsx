import React, { useState, useEffect } from "react";
import { Compass, MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const makkahCoords: [number, number] = [21.422487, 39.826206];

export default function Qibla() {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState("جاري تحديد الموقع...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateQibla = (lat: number, lng: number) => {
      const latRad = lat * (Math.PI / 180);
      const makkahLatRad = makkahCoords[0] * (Math.PI / 180);
      const lngDiffRad = (makkahCoords[1] - lng) * (Math.PI / 180);

      const y = Math.sin(lngDiffRad);
      const x =
        Math.cos(latRad) * Math.tan(makkahLatRad) -
        Math.sin(latRad) * Math.cos(lngDiffRad);

      let qibla = Math.atan2(y, x) * (180 / Math.PI);
      qibla = (qibla + 360) % 360;
      setQiblaDirection(qibla);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          calculateQibla(latitude, longitude);
          
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`,
              { headers: { 'Accept': 'application/json' } }
            );
            if (!geoRes.ok) throw new Error("Geocoding failed");
            const geoData = await geoRes.json();
            if (geoData.address) {
              const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state;
              if (city) setLocationName(city);
            }
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            setLocationName("موقع غير معروف");
          }
        },
        (err) => {
          setError("يرجى تفعيل خدمة الموقع لتحديد القبلة");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("جهازك لا يدعم تحديد الموقع");
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let alpha = event.alpha;
      const webkitCompassHeading = (event as any).webkitCompassHeading;
      if (webkitCompassHeading !== undefined) {
        alpha = webkitCompassHeading;
      } else if (alpha !== null) {
        alpha = 360 - alpha;
      }
      setHeading(alpha);
    };

    if (window.DeviceOrientationEvent) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        // iOS 13+ requires user interaction to request permission
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  const requestCompassPermission = () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === "granted") {
            window.addEventListener("deviceorientation", (event: any) => {
              let alpha = event.alpha;
              const webkitCompassHeading = event.webkitCompassHeading;
              if (webkitCompassHeading !== undefined) {
                alpha = webkitCompassHeading;
              } else if (alpha !== null) {
                alpha = 360 - alpha;
              }
              setHeading(alpha);
            }, true);
          } else {
            setError("تم رفض إذن البوصلة");
          }
        })
        .catch(console.error);
    }
  };

  const isQiblaAligned = heading !== null && qiblaDirection !== null && Math.abs(heading - qiblaDirection) < 5;

  return (
    <div className="space-y-6 pb-28" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-bl from-emerald-600 via-emerald-700 to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full -ml-12 -mb-12 blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold font-serif mb-2 text-white drop-shadow-md">اتجاه القبلة</h2>
            <div className="flex items-center gap-2 text-emerald-50 text-sm bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              <MapPin size={16} className="text-emerald-300" />
              <span className="font-medium">{locationName}</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <Compass size={32} className="text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="glass dark:glass-dark p-6 rounded-[2rem]">
        <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-3 text-sm flex items-center gap-2">
          <Navigation size={18} />
          تعليمات الاستخدام الدقيق:
        </h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-none p-0">
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>ضع هاتفك بشكل مسطح (أفقي) تماماً.</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>ابتعد عن الأجهزة الإلكترونية والمعادن لتجنب التشويش.</li>
        </ul>
      </div>

      {error ? (
        <div className="card-3d bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-6 text-center font-medium rounded-[1.5rem] shadow-sm">
          {error}
        </div>
      ) : (
        <div className="relative">
          <div className="card-3d bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[480px] shadow-xl overflow-hidden">
            {/* Compass UI Background Effects */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isQiblaAligned ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem]"></div>
            </div>

            {typeof (DeviceOrientationEvent as any).requestPermission === "function" && heading === null && (
              <button 
                onClick={requestCompassPermission}
                className="mb-8 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full shadow-sm transition-colors relative z-10"
              >
                تفعيل البوصلة
              </button>
            )}

            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-[8px] border-slate-50 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 border-opacity-70 dark:border-opacity-50"></div>
              <div className="absolute inset-4 rounded-full border border-slate-100 dark:border-slate-800"></div>
              
              {/* Degree Marks */}
              {[...Array(72)].map((_, i) => (
                <div 
                  key={i}
                  className={`absolute rounded-full w-0.5 ${i % 6 === 0 ? 'h-3 bg-emerald-500' : 'h-1.5 bg-slate-200 dark:bg-slate-700'}`}
                  style={{
                    top: 20,
                    transformOrigin: '50% 124px', // 144 (half w-72) - 20 = 124
                    transform: `rotate(${i * 5}deg)`
                  }}
                ></div>
              ))}

              {/* Compass Dial */}
              <motion.div
                className="absolute inset-[32px] rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700"
                animate={{ rotate: heading ? -heading : 0 }}
                transition={{ type: "spring", stiffness: 40, damping: 20 }}
              >
                
                <div className="absolute top-4 text-emerald-600 dark:text-emerald-500 font-bold text-xl font-serif">N</div>
                <div className="absolute bottom-4 text-slate-400 font-bold text-lg font-serif">S</div>
                <div className="absolute right-4 text-slate-400 font-bold text-lg font-serif">E</div>
                <div className="absolute left-4 text-slate-400 font-bold text-lg font-serif">W</div>
                
                {/* Qibla Indicator on Dial */}
                {qiblaDirection !== null && (
                  <div 
                    className="absolute w-full h-full"
                    style={{ transform: `rotate(${qiblaDirection}deg)` }}
                  >
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                       <div className="w-10 h-10 bg-[url('https://cdn-icons-png.flaticon.com/512/1000/1000141.png')] bg-contain bg-center bg-no-repeat transition-transform hover:scale-105 opacity-80 mix-blend-multiply dark:mix-blend-normal"></div>
                       <div className="w-1 h-6 bg-emerald-500 -mt-1 rounded-full"></div>
                     </div>
                  </div>
                )}
              </motion.div>

              {/* Center Needle */}
              <div className="absolute z-10 w-4 h-[180px] flex flex-col items-center justify-center pointer-events-none">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[80px] border-b-rose-500"></div>
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[80px] border-t-slate-700 dark:border-t-slate-300"></div>
              </div>
              
               {/* Center Pin */}
               <div className="absolute z-20 w-6 h-6 bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-full shadow-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               </div>
            </div>

            <div className="mt-12 text-center relative z-10 min-h-[60px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isQiblaAligned ? (
                  <motion.div
                    key="aligned"
                    initial={{ scale: 0.9, opacity: 0, y: 5 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: -5 }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold text-xl flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-full border border-emerald-100 dark:border-emerald-800/50"
                  >
                    <Compass size={24} />
                    أنت متجه نحو القبلة
                  </motion.div>
                ) : (
                  <motion.div
                    key="not-aligned"
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -5 }}
                    className="text-slate-500 dark:text-slate-400 font-medium text-sm px-6 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800"
                  >
                    قم بتدوير الجهاز حتى يتطابق المؤشر مع الكعبة
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

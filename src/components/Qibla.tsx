import React, { useState, useEffect } from "react";
import { Compass, MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";

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
    <div className="space-y-6 pb-24" dir="rtl">
      {/* Header with Background Image */}
      <div 
        className="relative rounded-[2rem] p-6 text-white shadow-2xl overflow-hidden border border-white/5"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('https://i.pinimg.com/736x/60/76/8b/60768b598b049d53c7a36e1c94411d73.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif mb-1 text-[var(--color-primary-light)] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">اتجاه القبلة</h2>
            <div className="flex items-center gap-2 text-[var(--color-text)]/80 text-sm">
              <MapPin size={16} className="text-[var(--color-primary)]" />
              <span>{locationName}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl flex items-center justify-center border border-[var(--color-primary-light)]/50 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <Compass size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 p-4 rounded-2xl">
        <h3 className="text-[var(--color-primary-light)] font-bold mb-2 text-sm flex items-center gap-2">
          <Navigation size={16} />
          تعليمات الاستخدام:
        </h3>
        <ul className="text-xs text-[var(--color-text)]/80 space-y-1.5 list-disc list-inside">
          <li>ضع هاتفك بشكل مسطح (أفقي) تماماً.</li>
          <li>ابتعد عن الأجهزة الإلكترونية والمعادن لتجنب التشويش.</li>
          <li>قم بتحريك الهاتف على شكل رقم 8 باللغة الإنجليزية لمعايرة البوصلة.</li>
        </ul>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center text-sm">
          {error}
        </div>
      ) : (
        <div className="relative">
          <div className="card-3d bg-[var(--color-surface)] rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[450px] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {/* Compass UI */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isQiblaAligned ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-[var(--color-primary)]/10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[var(--color-primary)]/20 rounded-full blur-3xl"></div>
            </div>

            {typeof (DeviceOrientationEvent as any).requestPermission === "function" && heading === null && (
              <button 
                onClick={requestCompassPermission}
                className="mb-8 px-6 py-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-bold rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                تفعيل البوصلة
              </button>
            )}

            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-[12px] border-[var(--color-primary)]/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.5),0_10px_30px_rgba(0,0,0,0.3)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)]"></div>
              <div className="absolute inset-3 rounded-full border-2 border-[var(--color-primary)]/40"></div>
              
              {/* Degree Marks */}
              {[...Array(72)].map((_, i) => (
                <div 
                  key={i}
                  className={`absolute rounded-full ${i % 6 === 0 ? 'w-1.5 h-4 bg-[var(--color-primary)]/80' : 'w-0.5 h-2 bg-[var(--color-text-muted)]/40'}`}
                  style={{
                    top: 12,
                    transformOrigin: '50% 132px',
                    transform: `rotate(${i * 5}deg)`
                  }}
                ></div>
              ))}

              {/* Compass Dial */}
              <motion.div
                className="absolute inset-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 shadow-inner"
                animate={{ rotate: heading ? -heading : 0 }}
                transition={{ type: "spring", stiffness: 40, damping: 20 }}
              >
                {/* Compass Rose */}
                <div className="absolute inset-0 bg-[url('https://cdn-icons-png.flaticon.com/512/3253/3253138.png')] bg-contain bg-center bg-no-repeat opacity-30 dark:invert"></div>
                
                <div className="absolute top-2 text-red-500 font-bold text-xl drop-shadow-md font-serif">N</div>
                <div className="absolute bottom-2 text-[var(--color-text)]/60 font-bold text-xl font-serif">S</div>
                <div className="absolute right-2 text-[var(--color-text)]/60 font-bold text-xl font-serif">E</div>
                <div className="absolute left-2 text-[var(--color-text)]/60 font-bold text-xl font-serif">W</div>
                
                {/* Qibla Indicator on Dial */}
                {qiblaDirection !== null && (
                  <div 
                    className="absolute w-full h-full"
                    style={{ transform: `rotate(${qiblaDirection}deg)` }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-10 h-10 bg-[url('https://cdn-icons-png.flaticon.com/512/1000/1000141.png')] bg-contain bg-center bg-no-repeat drop-shadow-[0_0_15px_rgba(212,175,55,1)]"></div>
                      <div className="w-1.5 h-4 bg-gradient-to-b from-[var(--color-primary)] to-transparent mt-1 rounded-full"></div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Center Needle */}
              <div className="absolute z-10 w-6 h-48 flex flex-col items-center justify-center">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[100px] border-b-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"></div>
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[100px] border-t-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"></div>
              </div>
              
              {/* Center Pin */}
              <div className="absolute z-20 w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-600 border-4 border-[var(--color-primary)]/50 rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.5)]"></div>
              <div className="absolute z-30 w-3 h-3 bg-[var(--color-primary-light)] rounded-full shadow-inner"></div>
            </div>

            <div className="mt-10 text-center relative z-10">
              {isQiblaAligned ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[var(--color-primary)] font-bold text-2xl drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2"
                >
                  <Compass className="animate-pulse" />
                  أنت متجه نحو القبلة
                </motion.div>
              ) : (
                <div className="text-[var(--color-text-muted)] font-bold text-lg">
                  قم بتدوير الجهاز حتى يتطابق المؤشر مع الكعبة
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

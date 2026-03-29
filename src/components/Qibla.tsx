import React, { useState, useEffect } from "react";
import { Compass, MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const makkahCoords: [number, number] = [21.422487, 39.826206];

const kaabaIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1000/1000141.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function Qibla() {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState("جاري تحديد الموقع...");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'compass' | 'map'>('map');

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
        // We will handle this with a button if needed, but for now we try to listen
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

      {/* View Toggle */}
      <div className="flex bg-[var(--color-surface)] p-1 rounded-xl border border-black/5 dark:border-white/5">
        <button
          onClick={() => setViewMode('map')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            viewMode === 'map' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <MapPin size={18} />
          الخريطة
        </button>
        <button
          onClick={() => setViewMode('compass')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            viewMode === 'compass' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Compass size={18} />
          البوصلة
        </button>
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
          <li>في حال عدم عمل البوصلة، استخدم "الخريطة" لتحديد الاتجاه بدقة.</li>
        </ul>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center text-sm">
          {error}
        </div>
      ) : (
        <div className="relative">
          {viewMode === 'map' && userLocation ? (
            <div className="h-[400px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative z-0">
              <MapContainer 
                center={userLocation} 
                zoom={4} 
                style={{ height: '100%', width: '100%', backgroundColor: '#1a1a1a' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Marker position={userLocation} icon={userIcon} />
                <Marker position={makkahCoords} icon={kaabaIcon} />
                <Polyline 
                  positions={[userLocation, makkahCoords]} 
                  color="var(--color-primary)" 
                  weight={3} 
                  dashArray="10, 10" 
                  opacity={0.8}
                />
                <MapUpdater center={userLocation} />
              </MapContainer>
              <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center">
                <p className="text-white text-sm">
                  المسافة إلى مكة: <span className="text-[var(--color-primary)] font-bold">
                    {Math.round(L.latLng(userLocation).distanceTo(makkahCoords) / 1000)} كم
                  </span>
                </p>
              </div>
            </div>
          ) : viewMode === 'compass' ? (
            <div className="card-3d bg-[var(--color-surface)] rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[400px] border border-white/5 relative overflow-hidden">
              {/* Compass UI */}
              <div className={`absolute inset-0 transition-opacity duration-1000 ${isQiblaAligned ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-[var(--color-primary)]/5"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-primary)]/20 rounded-full blur-3xl"></div>
              </div>

              {typeof (DeviceOrientationEvent as any).requestPermission === "function" && heading === null && (
                <button 
                  onClick={requestCompassPermission}
                  className="mb-8 px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg"
                >
                  تفعيل البوصلة
                </button>
              )}

              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                
                {/* Degree Marks */}
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-1 h-3 bg-white/20 rounded-full"
                    style={{
                      top: 4,
                      transformOrigin: '50% 124px',
                      transform: `rotate(${i * 30}deg)`
                    }}
                  ></div>
                ))}

                {/* Compass Dial */}
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-white/20 bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                  animate={{ rotate: heading ? -heading : 0 }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                  <div className="absolute top-2 text-red-500 font-bold text-sm">N</div>
                  <div className="absolute bottom-2 text-white/50 font-bold text-sm">S</div>
                  <div className="absolute right-2 text-white/50 font-bold text-sm">E</div>
                  <div className="absolute left-2 text-white/50 font-bold text-sm">W</div>
                  
                  {/* Qibla Indicator on Dial */}
                  {qiblaDirection !== null && (
                    <div 
                      className="absolute w-full h-full"
                      style={{ transform: `rotate(${qiblaDirection}deg)` }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
                    </div>
                  )}
                </motion.div>

                {/* Center Needle */}
                <div className="absolute z-10 w-2 h-32 bg-gradient-to-b from-red-500 to-white rounded-full shadow-lg"></div>
                <div className="absolute z-20 w-4 h-4 bg-black border-2 border-[var(--color-primary)] rounded-full"></div>
              </div>

              <div className="mt-8 text-center relative z-10">
                {isQiblaAligned ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[var(--color-primary)] font-bold text-xl drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  >
                    أنت متجه نحو القبلة
                  </motion.div>
                ) : (
                  <div className="text-[var(--color-text-muted)]">
                    قم بتدوير الجهاز حتى يتطابق المؤشر مع نقطة القبلة
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-[var(--color-surface)] rounded-[2rem] border border-white/5">
              <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, ArrowRight, Loader2 } from 'lucide-react';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';

interface Mosque {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'name:ar'?: string;
    amenity?: string;
  };
  distance?: number;
}

export default function MosquesMap({ onBack }: { onBack: () => void }) {
  const { userLocation } = usePrayerTimes();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMosques = async () => {
      if (!userLocation) {
        setError("لم نتمكن من تحديد موقعك. يرجى تفعيل خدمات الموقع.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Using Overpass API to find nearby mosques (within 5km)
        const radius = 5000;
        const query = `
          [out:json];
          (
            node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${userLocation.lat},${userLocation.lon});
            way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${userLocation.lat},${userLocation.lon});
          );
          out center;
        `;
        
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `data=${encodeURIComponent(query)}`
        });
        
        if (!response.ok) {
          // Try fallback endpoint
          const fallbackResponse = await fetch('https://lz4.overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `data=${encodeURIComponent(query)}`
          });
          if (!fallbackResponse.ok) throw new Error("Failed to fetch mosques");
          const data = await fallbackResponse.json();
          processMosques(data);
          return;
        }
        
        const data = await response.json();
        processMosques(data);
      } catch (err) {
        console.error("Error fetching mosques:", err);
        setError("حدث خطأ أثناء البحث عن المساجد القريبة.");
      } finally {
        setLoading(false);
      }
    };

    const processMosques = (data: any) => {
      // Process and calculate distance
      const processedMosques = data.elements.map((el: any) => {
        const mLat = el.lat || el.center?.lat;
        const mLon = el.lon || el.center?.lon;
        
        // Simple distance calculation (Haversine formula)
        const R = 6371; // Radius of the earth in km
        const dLat = (mLat - userLocation!.lat) * Math.PI / 180;
        const dLon = (mLon - userLocation!.lon) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(userLocation!.lat * Math.PI / 180) * Math.cos(mLat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distance in km

        return {
          id: el.id,
          lat: mLat,
          lon: mLon,
          tags: el.tags || {},
          distance: distance
        };
      }).sort((a: Mosque, b: Mosque) => (a.distance || 0) - (b.distance || 0));

      setMosques(processedMosques);
    };

    fetchMosques();
  }, [userLocation]);

  const openInMaps = (lat: number, lon: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors bg-[var(--color-surface)] shadow-sm border border-black/5 dark:border-white/5"
        >
          <ArrowRight size={24} className="text-[var(--color-text-muted)]" />
        </button>
        <h1 className="text-2xl font-bold font-serif text-[var(--color-primary)]">المساجد القريبة</h1>
      </div>

      <div className="p-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 size={40} className="text-[var(--color-primary)] animate-spin" />
            <p className="text-[var(--color-text-muted)] font-medium">جاري البحث عن المساجد القريبة...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <MapPin size={40} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        ) : mosques.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-2xl p-8 text-center shadow-sm border border-black/5 dark:border-white/5">
            <MapPin size={48} className="text-[var(--color-text-muted)] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">لا توجد مساجد قريبة</h3>
            <p className="text-[var(--color-text-muted)] text-sm">
              لم نتمكن من العثور على مساجد في نطاق 5 كيلومتر من موقعك الحالي.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 pb-20"
          >
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 rounded-3xl text-white mb-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mt-10 blur-2xl"></div>
              <h2 className="text-xl font-bold mb-2">المساجد من حولك</h2>
              <p className="text-white/80 text-sm">
                تم العثور على {mosques.length} مسجد بالقرب منك (نطاق 5 كم).
              </p>
            </div>

            {mosques.map((mosque, index) => (
              <motion.div
                key={mosque.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[var(--color-surface)] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/5 dark:border-white/5 flex items-center gap-4 group hover:border-[var(--color-primary-light)] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                  <MapPin size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--color-text)] truncate">
                    {mosque.tags['name:ar'] || mosque.tags.name || "مسجد"}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                    <Navigation size={14} />
                    <span>يبعد {mosque.distance?.toFixed(2)} كم</span>
                  </p>
                </div>

                <button
                  onClick={() => openInMaps(mosque.lat, mosque.lon, mosque.tags['name:ar'] || mosque.tags.name || "مسجد")}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors shrink-0 shadow-md"
                >
                  الاتجاهات
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

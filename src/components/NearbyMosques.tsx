import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin, Navigation, Navigation2 } from 'lucide-react';

interface Mosque {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    ['name:ar']?: string;
    ['name:en']?: string;
    amenity?: string;
    religion?: string;
  };
  distanceTo?: number;
}

export default function NearbyMosques({ onBack }: { onBack: () => void }) {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchMosques();
  }, []);

  const fetchMosques = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('الموقع الجغرافي غير مدعوم في متصفحك.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          // Overpass API to find nearby mosques (within 5000 meters)
          const radius = 5000;
          const query = `
            [out:json];
            node
              ["amenity"="place_of_worship"]
              ["religion"="muslim"]
              (around:${radius},${latitude},${longitude});
            out;
          `;

          const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
          });

          if (!response.ok) throw new Error('فشل إحضار البيانات');
          
          const data = await response.json();
          let results = data.elements as Mosque[];

          // Calculate distance
          results = results.map(node => {
            const R = 6371e3; // metres
            const p1 = latitude * Math.PI/180;
            const p2 = node.lat * Math.PI/180;
            const dp = (node.lat - latitude) * Math.PI/180;
            const dlambda = (node.lon - longitude) * Math.PI/180;

            const a = Math.sin(dp/2) * Math.sin(dp/2) +
                      Math.cos(p1) * Math.cos(p2) *
                      Math.sin(dlambda/2) * Math.sin(dlambda/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            const d = R * c; // in metres
            node.distanceTo = d;
            return node;
          });

          // Sort by distance
          results.sort((a, b) => (a.distanceTo || 0) - (b.distanceTo || 0));

          setMosques(results);
        } catch (err: any) {
          setError(err.message || 'حدث خطأ أثناء إحضار البيانات');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('يرجى السماح بالوصول للموقع لتحديد المساجد القريبة منك.');
        setLoading(false);
      }
    );
  };

  const getMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pb-20">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0">
            <ChevronLeft size={24} className={document.documentElement.dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-xl font-bold font-kufi">المساجد القريبة</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p>جاري البحث عن المساجد القريبة...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-center">
            <p className="mb-3">{error}</p>
            <button 
              onClick={fetchMosques}
              className="bg-red-100 dark:bg-red-800/50 px-4 py-2 rounded-xl text-sm font-bold"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : mosques.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <MapPin size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p>عذراً، لم نتمكن من العثور على مساجد في محيط 5 كيلومتر.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-2">
              تم العثور على {mosques.length} مسجد(اً) بالقرب منك
            </p>
            {mosques.map((mosque, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={mosque.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      {mosque.tags['name:ar'] || mosque.tags.name || mosque.tags['name:en'] || 'مسجد غير مسمى'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Navigation2 size={12} />
                      {mosque.distanceTo ? (mosque.distanceTo < 1000 
                        ? `${Math.round(mosque.distanceTo)} متر` 
                        : `${(mosque.distanceTo / 1000).toFixed(1)} كم`) 
                        : ''}
                    </p>
                  </div>
                </div>
                
                <a 
                  href={getMapsUrl(mosque.lat, mosque.lon)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors shrink-0"
                >
                  <Navigation size={20} />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

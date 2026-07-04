import { useEffect, useState } from 'react';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { requestNotificationPermission, sendNotification } from '../services/NotificationService';

export const usePrayerNotifications = (onPrayerTime: (prayerName: string, time: string) => void) => {
  const { prayerTimes, autoAdhanEnabled } = usePrayerTimes();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('prayerNotificationsEnabled') === 'true';
  });
  const [lastNotifiedPrayer, setLastNotifiedPrayer] = useState<string | null>(null);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('prayerNotificationsEnabled', 'true');
        return true;
      } else {
        console.warn("يرجى تفعيل الإشعارات من إعدادات المتصفح");
        return false;
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('prayerNotificationsEnabled', 'false');
      return true;
    }
  };

  useEffect(() => {
    if (!prayerTimes) return;

    const checkPrayerTimes = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

      const prayersList = [
        { id: "Fajr", name: "الفجر" },
        { id: "Dhuhr", name: "الظهر" },
        { id: "Asr", name: "العصر" },
        { id: "Maghrib", name: "المغرب" },
        { id: "Isha", name: "العشاء" },
      ];

      for (const prayer of prayersList) {
        const timeStr = prayerTimes[prayer.id as keyof typeof prayerTimes];
        if (!timeStr) continue;

        const isPrayerReminderEnabled = localStorage.getItem(`prayer_reminder_enabled_${prayer.id}`) !== 'false';
        if (!isPrayerReminderEnabled) continue;

        // Extract HH:MM from API time (e.g. "05:30 (EEST)" -> "05:30")
        const cleanTimeStr = timeStr.split(' ')[0];

        if (cleanTimeStr === currentTimeStr) {
          const todayStr = now.toDateString();
          const prayerKey = `${prayer.id}-${todayStr}`;
          
          if (lastNotifiedPrayer !== prayerKey) {
            setLastNotifiedPrayer(prayerKey);
            
            const mosqueMuted = (() => {
              const parsedEnabled = localStorage.getItem('mosqueModeEnabled') === 'true';
              if (!parsedEnabled) return false;
              const durationMin = parseInt(localStorage.getItem('mosqueModeMuteDuration') || '20', 10);
              const nowCheck = new Date();
              const currentMins = nowCheck.getHours() * 60 + nowCheck.getMinutes();
              const [prH, prM] = cleanTimeStr.split(':').map(Number);
              const prayerMins = prH * 60 + prM;
              return currentMins >= prayerMins && currentMins <= (prayerMins + durationMin);
            })();

            if (mosqueMuted) {
              console.log(`[Mosque Mode] Muting prayer time notification for ${prayer.name}`);
              // Send a quiet notification reminding the user that Mosque Mode has successfully kept their session silent
              sendNotification(`وضع المسجد نشط 🕌 • حان وقت صلاة ${prayer.name}`, {
                body: `تم كتم أذان ${prayer.name} تلقائياً تفادياً للرنين وصيانةً لحرمة المسجد والسكينة.`,
                icon: '/icon.png',
                silent: true
              });
              continue;
            }

            // Trigger the in-app overlay (Auto Adhan) ONLY if enabled
            if (autoAdhanEnabled) {
              onPrayerTime(prayer.name, cleanTimeStr);
            }

            // Trigger system notification ONLY if enabled
            if (notificationsEnabled) {
              const bodyText = prayer.id === 'Fajr' 
                ? `الصلاة خير من النوم - حان وقت صلاة ${prayer.name}`
                : `حي على الصلاة - حان وقت صلاة ${prayer.name}`;
                
              sendNotification(`حان الآن موعد أذان ${prayer.name}`, {
                body: bodyText,
                icon: '/icon.png', // Assuming there's an icon, or fallback to default
                requireInteraction: true,
              });
            }
          }
        }
      }
    };

    const intervalId = setInterval(checkPrayerTimes, 10000); // Check every 10 seconds
    checkPrayerTimes(); // Initial check

    return () => clearInterval(intervalId);
  }, [prayerTimes, notificationsEnabled, autoAdhanEnabled, lastNotifiedPrayer, onPrayerTime]);

  return { notificationsEnabled, toggleNotifications, setNotificationsEnabled };
};

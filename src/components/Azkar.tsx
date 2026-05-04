import React, { useState, useRef } from "react";
import {
  Heart,
  Sun,
  Moon,
  Bed,
  Shield,
  ArrowRight,
  CheckCircle2,
  Play,
  Pause,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Zikr {
  id: number;
  text: string;
  count: number;
  reference: string;
  audioUrl?: string;
}

interface ZikrCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  items: Zikr[];
}

const azkarData: ZikrCategory[] = [
  {
    id: "morning",
    title: "أذكار الصباح",
    icon: <Sun size={32} />,
    color: "text-amber-600",
    bg: "from-amber-500 to-yellow-600",
    items: [
      {
        id: 1,
        text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.",
        count: 1,
        reference: "سورة البقرة: 255",
        audioUrl: "https://server8.mp3quran.net/afs/0020255.mp3"
      },
      {
        id: 2,
        text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ.",
        count: 3,
        reference: "سورة الإخلاص",
        audioUrl: "https://server8.mp3quran.net/afs/112.mp3"
      },
      {
        id: 3,
        text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ.",
        count: 3,
        reference: "سورة الفلق",
        audioUrl: "https://server8.mp3quran.net/afs/113.mp3"
      },
      {
        id: 4,
        text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَ النَّاسِ.",
        count: 3,
        reference: "سورة الناس",
        audioUrl: "https://server8.mp3quran.net/afs/114.mp3"
      },
      {
        id: 5,
        text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        count: 1,
        reference: "رواه مسلم",
      },
      {
        id: 6,
        text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
        count: 1,
        reference: "سيد الاستغفار - رواه البخاري",
      },
      {
        id: 7,
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
        count: 1,
        reference: "رواه أبو داود وابن ماجه",
      },
      {
        id: 8,
        text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
        count: 3,
        reference: "رواه أبو داود والترمذي",
      },
      {
        id: 9,
        text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.",
        count: 3,
        reference: "رواه أبو داود والترمذي",
      },
      {
        id: 10,
        text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
        count: 1,
        reference: "رواه الحاكم",
      },
      {
        id: 11,
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
        count: 100,
        reference: "رواه مسلم",
      },
      {
        id: 12,
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        count: 100,
        reference: "رواه البخاري ومسلم",
      },
      {
        id: 13,
        text: "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ.",
        count: 1,
        reference: "رواه أحمد",
      },
      {
        id: 14,
        text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ.",
        count: 3,
        reference: "رواه أبو داود",
      },
      {
        id: 15,
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.",
        count: 1,
        reference: "رواه ابن ماجه",
      },
      {
        id: 16,
        text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.",
        count: 100,
        reference: "رواه البخاري ومسلم",
      },
      {
        id: 17,
        text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
        count: 7,
        reference: "رواه أبو داود",
      },
      {
        id: 18,
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
        count: 3,
        reference: "رواه مسلم",
      },
      {
        id: 19,
        text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
        count: 10,
        reference: "رواه الطبراني",
      }
    ],
  },
  {
    id: "evening",
    title: "أذكار المساء",
    icon: <Moon size={32} />,
    color: "text-indigo-600",
    bg: "from-indigo-600 to-blue-800",
    items: [
      {
        id: 1,
        text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.",
        count: 1,
        reference: "سورة البقرة: 255",
        audioUrl: "https://server8.mp3quran.net/afs/0020255.mp3"
      },
      {
        id: 2,
        text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ.",
        count: 3,
        reference: "سورة الإخلاص",
        audioUrl: "https://server8.mp3quran.net/afs/112.mp3"
      },
      {
        id: 3,
        text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ.",
        count: 3,
        reference: "سورة الفلق",
        audioUrl: "https://server8.mp3quran.net/afs/113.mp3"
      },
      {
        id: 4,
        text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَ النَّاسِ.",
        count: 3,
        reference: "سورة الناس",
        audioUrl: "https://server8.mp3quran.net/afs/114.mp3"
      },
      {
        id: 5,
        text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        count: 1,
        reference: "رواه مسلم",
      },
      {
        id: 6,
        text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.",
        count: 1,
        reference: "رواه الترمذي",
      },
      {
        id: 7,
        text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
        count: 1,
        reference: "رواه البخاري",
      },
      {
        id: 8,
        text: "أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.",
        count: 1,
        reference: "رواه أحمد",
      },
      {
        id: 9,
        text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
        count: 3,
        reference: "رواه أبو داود والترمذي",
      },
      {
        id: 10,
        text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
        count: 3,
        reference: "رواه مسلم",
      },
      {
        id: 11,
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
        count: 100,
        reference: "رواه مسلم",
      },
      {
        id: 12,
        text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ.",
        count: 3,
        reference: "رواه أبو داود",
      },
      {
        id: 13,
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي...",
        count: 1,
        reference: "رواه أبو داود وابن ماجه",
      },
      {
        id: 14,
        text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
        count: 7,
        reference: "رواه أبو داود",
      },
      {
        id: 15,
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        count: 100,
        reference: "رواه البخاري ومسلم",
      },
      {
        id: 16,
        text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.",
        count: 100,
        reference: "رواه البخاري ومسلم",
      },
      {
        id: 17,
        text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
        count: 10,
        reference: "رواه الطبراني",
      }
    ],
  },
  {
    id: "sleep",
    title: "أذكار النوم",
    icon: <Bed size={32} />,
    color: "text-sky-600",
    bg: "from-sky-500 to-cyan-700",
    items: [
      {
        id: 1,
        text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.",
        count: 1,
        reference: "رواه البخاري",
      },
      {
        id: 2,
        text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
        count: 1,
        reference: "رواه البخاري ومسلم",
      },
      {
        id: 3,
        text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
        count: 3,
        reference: "رواه أبو داود والترمذي",
      },
      {
        id: 4,
        text: "سُبْحَانَ اللَّهِ (33)، وَالْحَمْدُ لِلَّهِ (33)، وَاللَّهُ أَكْبَرُ (34).",
        count: 1,
        reference: "رواه البخاري ومسلم",
      },
      {
        id: 5,
        text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ.",
        count: 3,
        reference: "سورة الإخلاص",
        audioUrl: "https://server8.mp3quran.net/afs/112.mp3"
      },
      {
        id: 6,
        text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...",
        count: 1,
        reference: "آية الكرسي - رواه البخاري",
        audioUrl: "https://server8.mp3quran.net/afs/0020255.mp3"
      }
    ],
  },
  {
    id: "protection",
    title: "أذكار التحصين",
    icon: <Shield size={32} />,
    color: "text-emerald-600",
    bg: "from-emerald-600 to-green-800",
    items: [
      {
        id: 1,
        text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
        count: 3,
        reference: "رواه أبو داود والترمذي",
      },
      {
        id: 2,
        text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
        count: 3,
        reference: "رواه مسلم",
      },
      {
        id: 3,
        text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
        count: 7,
        reference: "رواه أبو داود",
      },
      {
        id: 4,
        text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ.",
        count: 1,
        reference: "رواه البخاري",
      },
      {
        id: 5,
        text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ.",
        count: 1,
        reference: "رواه مسلم",
      }
    ],
  },
  {
    id: "after_prayer",
    title: "أذكار بعد الصلاة",
    icon: <CheckCircle2 size={32} />,
    color: "text-teal-600",
    bg: "from-teal-500 to-emerald-700",
    items: [
      {
        id: 1,
        text: "أَسْتَغْفِرُ اللَّهَ (ثَلَاثًا)\nاللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.",
        count: 1,
        reference: "رواه مسلم",
      },
      {
        id: 2,
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدِّ.",
        count: 1,
        reference: "رواه البخاري ومسلم",
      },
      {
        id: 3,
        text: "سُبْحَانَ اللَّهِ (33)، وَالْحَمْدُ لِلَّهِ (33)، وَاللَّهُ أَكْبَرُ (33)، وَقَالَ تَمَامَ الْمِائَةِ: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        count: 1,
        reference: "رواه مسلم",
      },
      {
        id: 4,
        text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ هُوَ اللَّهُ أَحَدٌ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ...",
        count: 1,
        reference: "سورة الإخلاص والمعوذتين - رواه أبو داود",
      },
      {
        id: 5,
        text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...",
        count: 1,
        reference: "آية الكرسي - رواه النسائي",
      }
    ],
  },
];

export default function Azkar() {
  const [selectedCategory, setSelectedCategory] = useState<ZikrCategory | null>(
    null,
  );
  
  const [counts, setCounts] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('azkarCounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if it's from today
        const today = new Date().toDateString();
        if (parsed.date === today) {
          return parsed.counts;
        }
      } catch (e) {
        console.error("Error parsing azkar counts", e);
      }
    }
    return {};
  });

  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('azkarCounts', JSON.stringify({ date: today, counts }));
  }, [counts]);

  const handleZikrClick = (zikr: Zikr) => {
    setCounts((prev) => {
      const current = prev[zikr.id] || 0;
      if (current < zikr.count) {
        if (navigator.vibrate) navigator.vibrate(50);
        return { ...prev, [zikr.id]: current + 1 };
      }
      return prev;
    });
  };

  const resetCounts = () => {
    // Only reset counts for the currently selected category
    if (selectedCategory) {
      setCounts((prev) => {
        const newCounts = { ...prev };
        selectedCategory.items.forEach(item => {
          delete newCounts[item.id];
        });
        return newCounts;
      });
    } else {
      setCounts({});
    }
  };

  const toggleAudio = (zikr: Zikr, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!zikr.audioUrl) return;

    if (playingId === zikr.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(zikr.audioUrl);
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(zikr.id);
    }
  };

  // Cleanup audio on unmount or category change
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedCategory]);

  if (selectedCategory) {
    return (
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen pb-24"
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`sticky top-0 shadow-sm z-20 px-4 py-4 flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800`}
        >
          <button
            onClick={() => {
              setSelectedCategory(null);
            }}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-slate-500 hover:text-emerald-500"
          >
            <ArrowRight size={24} />
          </button>
          <div className="flex-1 text-center flex items-center justify-center gap-2">
            <span className="text-emerald-500">{selectedCategory.icon}</span>
            <h1 className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100">
              {selectedCategory.title}
            </h1>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          <AnimatePresence>
            {selectedCategory.items.map((zikr, index) => {
              const currentCount = counts[zikr.id] || 0;
              const isCompleted = currentCount >= zikr.count;

              return (
                <motion.div
                  key={zikr.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileTap={{ scale: isCompleted ? 1 : 0.98 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleZikrClick(zikr)}
                  className={`p-6 relative overflow-hidden transition-all duration-500 cursor-pointer ${
                    isCompleted
                      ? "card-3d bg-slate-50/50 dark:bg-slate-800/50 opacity-70 border-emerald-500/30"
                      : "card-3d hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-500/30"
                  }`}
                >
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center z-0"
                    >
                      <CheckCircle2
                        size={120}
                        className="text-emerald-500/10"
                      />
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      {zikr.audioUrl && (
                        <button
                          onClick={(e) => toggleAudio(zikr, e)}
                          className={`p-3 rounded-full shadow-sm transition-colors border ${
                            playingId === zikr.id
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : "bg-slate-50 dark:bg-slate-800 text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-100 dark:border-slate-700"
                          }`}
                        >
                          {playingId === zikr.id ? <Pause size={20} /> : <Volume2 size={20} />}
                        </button>
                      )}
                    </div>
                    <p className="text-xl leading-loose font-serif text-slate-800 dark:text-slate-100 text-justify mb-6 font-bold whitespace-pre-line">
                      {zikr.text}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 font-bold">
                        {zikr.reference}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500">
                          التكرار: {zikr.count}
                        </span>
                        <motion.div
                          key={currentCount}
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-colors shadow-sm border-2 ${
                            isCompleted
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : "bg-slate-50 dark:bg-slate-800 text-emerald-500 border-emerald-500/30"
                          }`}
                        >
                          {currentCount}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-bl from-emerald-600 via-emerald-700 to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden text-center border border-white/20"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -mr-12 -mt-12 animate-pulse"></div>
        <div className="absolute left-0 bottom-0 w-40 h-40 bg-black/10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl flex items-center justify-center text-white mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transform rotate-3">
            <Heart size={40} className="drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-2 text-white drop-shadow-md">
            حصن المسلم
          </h1>
          <p className="text-emerald-100 text-sm font-bold bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            ألا بذكر الله تطمئن القلوب
          </p>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        {azkarData.map((category, index) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedCategory(category)}
            className="card-3d rounded-[2rem] p-6 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center gap-4 text-center relative overflow-hidden group hover:border-emerald-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform bg-gradient-to-br ${category.bg} text-white border border-white/20`}>
              {category.icon}
            </div>
            <h3 className="relative z-10 font-bold font-serif text-lg text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {category.title}
            </h3>
            <span className="relative z-10 text-xs font-bold glass dark:glass-dark text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full shadow-sm">
              {category.items.length} أذكار
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

// Local database for Azkar
// This could be expanded or fetched from an external API if needed.

export interface Zikr {
  category: string;
  count: string;
  description: string;
  reference: string;
  content: string;
}

export const azkarDatabase: Record<string, Zikr[]> = {
  morning: [
    {
      category: "أذكار الصباح",
      count: "1",
      description: "من قالها حين يصبح أجير من الجن حتى يمسي.",
      reference: "آية الكرسي",
      content: "اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ."
    },
    {
      category: "أذكار الصباح",
      count: "3",
      description: "من قالها حين يصبح وحين يمسي كفته من كل شيء.",
      reference: "سورة الإخلاص والمعوذتين",
      content: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم. قُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ."
    },
    {
      category: "أذكار الصباح",
      count: "1",
      description: "سيد الاستغفار.",
      reference: "رواه البخاري",
      content: "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي ، فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ."
    }
  ],
  evening: [
    {
      category: "أذكار المساء",
      count: "1",
      description: "من قالها حين يمسي أجير من الجن حتى يصبح.",
      reference: "آية الكرسي",
      content: "اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ..."
    },
    {
      category: "أذكار المساء",
      count: "3",
      description: "من قالها حين يصبح وحين يمسي كفته من كل شيء.",
      reference: "سورة الإخلاص والمعوذتين",
      content: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم. قُلْ هُوَ ٱللَّهُ أَحَدٌ..."
    }
  ],
  sleep: [
    {
      category: "أذكار النوم",
      count: "1",
      description: "يقرأها وينفث في يديه ويمسح بهما ما استطاع من جسده.",
      reference: "سورة الإخلاص والمعوذتين",
      content: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم. قُلْ هُوَ ٱللَّهُ أَحَدٌ..."
    },
    {
      category: "أذكار النوم",
      count: "1",
      description: "من قرأها في ليلة كفتاه.",
      reference: "أواخر سورة البقرة",
      content: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ..."
    }
  ],
  postPrayer: [
    {
      category: "أذكار بعد الصلاة",
      count: "3",
      description: "يقولها دبر كل صلاة مكتوبة.",
      reference: "رواه مسلم",
      content: "أستغفر الله، أستغفر الله، أستغفر الله. اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ ذَا الْجَلَالِ وَالْإِكْرَامِ."
    },
    {
      category: "أذكار بعد الصلاة",
      count: "33",
      description: "التسبيح والتحميد والتكبير.",
      reference: "رواه مسلم",
      content: "سبحان الله (33)، والحمد لله (33)، والله أكبر (33)، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير (1)."
    }
  ]
};

export const azkarService = {
  async getAzkarByCategory(category: 'morning' | 'evening' | 'sleep' | 'postPrayer'): Promise<Zikr[]> {
    // Simulating an API call with local data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(azkarDatabase[category] || []);
      }, 100);
    });
  },

  async getAllAzkar(): Promise<Record<string, Zikr[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(azkarDatabase);
      }, 100);
    });
  }
};

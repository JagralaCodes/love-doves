/**
 * ─────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH
 * ─────────────────────────────────────────────────────────────
 *  Every name, date, time, place, number and line of copy on the
 *  site is read from this file. No component hardcodes content.
 *  Change a value here and it updates everywhere.
 *
 *  NOTE: all values below are DUMMY PLACEHOLDERS for development.
 *  Replace them with the real details before sharing the link.
 * ─────────────────────────────────────────────────────────────
 */

export const wedding = {
  bride: {
    name: 'Zauja',
    parents: 'Mr. & Mrs. Abdul Rahman Jagrala',
  },
  groom: {
    name: 'Zaujj',
    parents: 'Mr. & Mrs. Mohammed Yusuf Jagrala',
  },

  /** Shown on the wax seal, the family cards and the OG image. */
  monogram: 'A & S',

  /**
   * The ONE main event the single site-wide countdown targets.
   * ISO 8601 with an explicit offset so it is correct in every timezone.
   */
  countdownTarget: '2026-11-13T11:00:00+05:30',

  events: [
    {
      name: 'Nikah',
      /** YYYY-MM-DD — formatted for display by lib/date.ts */
      date: '2026-11-13',
      /** HH:mm in 24h — formatted for display by lib/date.ts */
      time: '11:00',
      /** Optional end time, used for the .ics calendar file. */
      endTime: '13:00',
      venue: 'Masjid Al-Noor',
      address: '14 Jumma Masjid Road, Shivajinagar, Bengaluru 560051',
      mapsLink: 'https://maps.google.com/?q=Masjid+Al-Noor+Shivajinagar+Bengaluru',
      /** One short line of context shown under the venue. */
      note: 'The marriage contract, followed by dua.',
    },
    {
      name: 'Walima',
      date: '2026-11-14',
      time: '19:00',
      endTime: '22:30',
      venue: 'The Emerald Hall',
      address: '88 Cunningham Road, Vasanth Nagar, Bengaluru 560052',
      mapsLink: 'https://maps.google.com/?q=The+Emerald+Hall+Cunningham+Road+Bengaluru',
      note: 'Dinner reception. Please join us.',
    },
  ],

  texts: {
    inviteLine: 'You are invited',
    tapToOpen: 'Tap to open',

    /** Surah Ar-Rum 30:21 — verified against quran.com/30/21 */
    quranArabic:
      'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
    quranEnglish:
      'And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.',
    quranReference: 'Surah Ar-Rum 30:21',

    closingDua:
      "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fi khayr",
    closingDuaArabic: 'بَارَكَ اللهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
    closingDuaMeaning:
      'May Allah bless you both, and shower His blessings upon you, and unite you both in goodness.',

    presenceLine: 'Your presence and duas mean the world to us',
    thankYou: 'Jazakallahu Khairan',

    scratchPrompt: 'Scratch to reveal our special day',
    tapToReveal: 'Or tap to reveal',
    saveTheDate: 'Save the date',
    countdownHeading: 'Counting the days',
    dayIsHere: 'Alhamdulillah, the day is here',
    venueHeading: 'Where to find us',
    envelopePrompt: 'Tap to open',

    familiesHeading: 'Together with our families',
    eventsHeading: 'The celebrations',
    addToCalendar: 'Add to calendar',
    calendarSaved: 'Saved',
    swipeHint: 'Swipe',
    previousEvent: 'Previous event',
    nextEvent: 'Next event',
    viewOnMap: 'View on map',
    daughterOf: 'Daughter of',
    sonOf: 'Son of',
  },

  /**
   * Urdu, shown via the EN / اردو toggle. Scripture stays in Arabic; only
   * the translations and labels switch language.
   *
   * NOTE: please have a native speaker proofread before sharing the link.
   */
  urdu: {
    inviteLine: 'آپ کو دعوت ہے',
    tapToOpen: 'کھولنے کے لیے چھوئیں',
    quranTranslation:
      'اور اس کی نشانیوں میں سے یہ ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے جوڑے بنائے تاکہ تم ان سے سکون پاؤ، اور تمہارے درمیان محبت اور رحمت رکھ دی۔',
    quranReference: 'سورۃ الروم ۳۰:۲۱',
    closingDuaMeaning:
      'اللہ تم دونوں کو برکت دے اور تمہیں بھلائی پر جمع فرمائے۔',
    presenceLine: 'آپ کی شرکت اور دعائیں ہمارے لیے سب کچھ ہیں',
    thankYou: 'جزاک اللہ خیراً',
    saveTheDate: 'تاریخ محفوظ رکھیں',
    scratchPrompt: 'ہمارا خاص دن دیکھنے کے لیے کھرچیں',
    tapToReveal: 'یا چھو کر دیکھیں',
    venueHeading: 'مقام',
    familiesHeading: 'ہمارے خاندانوں کے ساتھ',
    eventsHeading: 'تقریبات',
    addToCalendar: 'کیلنڈر میں شامل کریں',
    calendarSaved: 'محفوظ ہو گیا',
    swipeHint: 'سوائپ کریں',
    previousEvent: 'پچھلی تقریب',
    nextEvent: 'اگلی تقریب',
    viewOnMap: 'نقشہ دیکھیں',
    daughterOf: 'دختر',
    sonOf: 'پسر',
    events: {
      Nikah: 'نکاح',
      Walima: 'ولیمہ',
    } as Record<string, string>,
  },

  rsvp: {
    deadline: '2026-11-20',
    /** Free key from https://web3forms.com — the form is disabled until this is set. */
    formAccessKey: '[WEB3FORMS ACCESS KEY]',
    receiverEmail: 'letsbegin81@gmail.com',
    heading: 'Will you join us?',
  },

  /** Used for <title>, OG tags and the .ics organiser field. */
  site: {
    url: 'https://example.vercel.app',
    description:
      'With the blessings of Allah, we invite you to share in our Nikah and Walima.',
  },

  /** Optional soft ambience. Drop a file at public/audio/ and name it here. */
  audio: {
    src: '/audio/ambience.mp3',
    label: 'Soft ambience',
  },
} as const

export type Wedding = typeof wedding
export type WeddingEvent = Wedding['events'][number]

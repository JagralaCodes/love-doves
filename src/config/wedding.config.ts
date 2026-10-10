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

/** The Nikah's date and clock time — the event card, the hero's date line,
 *  the journey and the countdown all read these, so they can never disagree. */
const NIKAH_DATE = '2026-11-13'
/** 16:45 is an ASSUMPTION (see the Nikah event's note). */
const NIKAH_TIME = '16:45'

export const wedding = {
  bride: {
    /** Full name, as it reads on the family card. */
    name: 'Huda',
    shortName: 'Huda',
    parents: 'Fahad Dhukka & Memuna Fahad Dhukka',
  },
  groom: {
    name: 'Mohammed',
    shortName: 'Mohammed',
    parents: 'Maajid Abdul Rahim Saliya & Rehana Maajid Saliya',
  },

  /** Shown on the wax seal, the family cards and the OG image. */
  monogram: 'H & M',

  /**
   * The ONE main event the single site-wide countdown targets.
   * ISO 8601 with an explicit offset so it is correct in every timezone.
   */
  // Derived, not typed twice. Explicit IST offset so it is right everywhere.
  countdownTarget: `${NIKAH_DATE}T${NIKAH_TIME}:00+05:30`,

  events: [
    {
      name: 'Nikah',
      /** YYYY-MM-DD — formatted for display by lib/date.ts */
      date: NIKAH_DATE,
      /**
       * HH:mm in 24h. The family's timing is "after Asr namaz", which is
       * what the page shows (timeLabel). The countdown still needs a
       * clock time: 16:45 is an ASSUMPTION — Asr (Hanafi)
       * in Mira Road in mid-November begins around 4:25 PM, so jamaat is
       * usually 4:35–4:45. Set it to the masjid's actual time if it differs.
       */
      time: NIKAH_TIME,
      /** Optional end time (Maghrib is about 6:00 PM; this runs past it). */
      endTime: '19:30',
      /** Shown instead of the clock time. */
      timeLabel: 'After Asr Namaz',
      /** The same, short, for a one-line "Friday, 13 Nov · After Asr". */
      timeShort: 'After Asr',
      /** Which line-art icon stands for the venue. */
      icon: 'masjid',
      /** The same evening, after the Nikah. No venue of its own on the page. */
      followedBy: {
        name: 'Rukhsati',
        timeLabel: 'After Maghrib Namaz',
        icon: 'doli',
        /** TODO: CONFIRM — assumed to be from the masjid; change if the
         *  Rukhsati leaves from somewhere else (e.g. the bride's home). */
        venue: 'Masjid e Abu Bakar',
      },
      venue: 'Masjid e Abu Bakar',
      /** Locality confirmed from the map pin below (19.2735, 72.8913). */
      address: 'Western Park, Mira Road (E), Thane',
      /** Shared by the family. Pins the exact place rather than searching. */
      mapsLink: 'https://maps.app.goo.gl/NqRjKr9MH6i4qUWC6',
      /** One short line of context shown under the venue. */
      note: 'The marriage contract, followed by dua.',
    },
    {
      name: 'Walima',
      date: '2026-11-14',
      time: '19:00',
      endTime: '22:00',
      icon: 'banquet',
      venue: 'Central Plaza Banquet',
      address:
        '1st Floor, Above Bank of India, Opp. HDFC Bank, Shanti Park, Mira Road (E), Thane 401107',
      /** Shared by the family. Pins the exact place rather than searching. */
      mapsLink: 'https://maps.app.goo.gl/UcoHkz6YoZaoEv4U6',
      /** No dinner is being served, so the line does not promise one. */
      note: 'Please join us for the Walima.',
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
    /** Shown in place of the clock once the Nikah time has passed. */
    dayIsHere: 'Alhamdulillah — the Nikah has taken place. Please keep the couple in your duas.',
    venueHeading: 'Where to find us',
    /** The letter's opening line, before the two venues. */
    honouredLine: 'We would be honoured by your presence at',
    /** Under the monogram on the folded letter's cover. */
    coverLine: 'With love',
    getDirections: 'Get directions',
    /** Accessible name of the heart seal on the venue envelope. */
    envelopePrompt: 'Peel off the heart seal to open the envelope',

    familiesHeading: 'Together with our families',
    eventsHeading: 'The celebrations',
    daughterOf: 'Daughter of',
    sonOf: 'Son of',

    /* Countdown */
    countdownTo: 'until the Nikah',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',

    /* Venue envelope */
    swipeUp: 'Slide the heart away to open',

    /* Reply form */
    rsvpHeading: 'Our joy is incomplete without you',
    rsvpInvite: "Tell us you're coming, so we can keep a place for you and your family.",
    rsvpName: 'Your name',
    rsvpFamily: 'Family name',
    rsvpMembers: 'Number of guests',
    rsvpFewer: 'One fewer guest',
    rsvpMore: 'One more guest',
    rsvpDua: 'A dua or a message (optional)',
    rsvpSubmit: 'Count us in',
    rsvpSending: 'Sending…',
    rsvpThanks: "JazakAllahu Khairan — we've saved your seat.",
    rsvpAlready: "JazakAllahu Khairan — we've already received your RSVP 💕",
    rsvpUpdate: 'Update my RSVP',
    rsvpError: 'That did not go through. Please try again, or message us directly.',
    rsvpDisabled: 'Replies open soon',
    required: 'Required',
    /** Shown beneath the names on the closing page. */
    withLove: 'With love and duas',
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
    honouredLine: 'آپ کی تشریف آوری ہمارے لیے باعثِ عزت ہوگی',
    coverLine: 'محبت کے ساتھ',
    getDirections: 'راستہ دیکھیں',
    familiesHeading: 'ہمارے خاندانوں کے ساتھ',
    eventsHeading: 'تقریبات',
    daughterOf: 'دختر',
    sonOf: 'پسر',

    countdownHeading: 'دن گن رہے ہیں',
    countdownTo: 'نکاح تک',
    dayIsHere: 'الحمدللہ — نکاح ہو چکا ہے۔ براہِ کرم جوڑے کو اپنی دعاؤں میں یاد رکھیں۔',
    days: 'دن',
    hours: 'گھنٹے',
    minutes: 'منٹ',
    seconds: 'سیکنڈ',

    envelopePrompt: 'لفافہ کھولنے کے لیے دل کی مہر ہٹائیں',
    swipeUp: 'کھولنے کے لیے دل کو کھسکائیں',

    rsvpHeading: 'آپ کے بغیر ہماری خوشی ادھوری ہے',
    rsvpInvite: 'ہمیں بتائیں کہ آپ تشریف لا رہے ہیں، تاکہ ہم آپ اور آپ کے گھر والوں کے لیے جگہ رکھ سکیں۔',
    rsvpName: 'آپ کا نام',
    rsvpFamily: 'خاندان کا نام',
    rsvpMembers: 'مہمانوں کی تعداد',
    rsvpFewer: 'ایک مہمان کم',
    rsvpMore: 'ایک مہمان زیادہ',
    rsvpDua: 'دعا یا پیغام (اختیاری)',
    rsvpSubmit: 'ہم ضرور آئیں گے',
    rsvpSending: 'بھیجا جا رہا ہے…',
    rsvpThanks: 'جزاک اللہ خیراً — آپ کی جگہ محفوظ ہے',
    rsvpAlready: 'جزاک اللہ خیراً — آپ کا جواب ہمیں پہلے ہی مل چکا ہے 💕',
    rsvpUpdate: 'جواب بدلیں',
    rsvpError: 'جواب نہیں پہنچ سکا۔ دوبارہ کوشش کریں، یا ہمیں براہِ راست پیغام بھیجیں۔',
    rsvpDisabled: 'جوابات جلد کھلیں گے',
    required: 'لازمی',
    withLove: 'محبت اور دعاؤں کے ساتھ',
    events: {
      Nikah: 'نکاح',
      Rukhsati: 'رخصتی',
      Walima: 'ولیمہ',
    } as Record<string, string>,
    /** Urdu for each event's timeLabel, keyed by event name. */
    timeLabels: {
      Nikah: 'نمازِ عصر کے بعد',
      Rukhsati: 'نمازِ مغرب کے بعد',
    } as Record<string, string>,
  },

  rsvp: {
    /**
     * Web3Forms access key. Public by design (it sits in the page source on
     * every Web3Forms site): it can only ever deliver to the inbox it was
     * created for. Lock it to the final domain in the Web3Forms dashboard.
     */
    formAccessKey: 'e849ca0e-5731-4f49-aa73-8067f81ff1dc',
    /**
     * For reference only — NOT used by the code. Web3Forms delivers to the
     * email address the access key belongs to; to change where RSVPs land,
     * change it on the Web3Forms side (see TODO.md).
     */
    receiverEmail: 'letsbegin81@gmail.com',
    /**
     * Other people who should see every reply. NOT sent to Web3Forms:
     * copying (`ccemail`) is a paid feature there and a free key rejects
     * the whole submission with it. Forward from the key's inbox instead.
     */
    alsoNotify: ['jagralashihab7786@gmail.com', 'jagralashihab786@gmail.com'],
  },

  /** Used for <title> and the OG tags. */
  site: {
    url: 'https://love-doves.vercel.app',
    description:
      'With the blessings of Allah, we invite you to share in our Nikah and Walima.',
  },

} as const

export type Wedding = typeof wedding
export type WeddingEvent = Wedding['events'][number]

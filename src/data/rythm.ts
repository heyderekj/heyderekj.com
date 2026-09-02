/** Content for `/rythm/` — curated for the Rythm Health Web Designer application. */

export const rythmMeta = {
  title: 'Derek Castelli — For Rythm',
  description:
    'Healthtech landing pages, design systems, and solo product craft—curated for the Rythm team.',
  ogImage: '/images/work/claimable/thumbnail.webp',
};

export const rythmIntro = {
  photoSrc: '/assets/about/derek-photo.jpeg',
  photoAlt: 'Derek Castelli',
};

export const rythmLetter = {
  to: 'Kelsie',
  from: 'Derek Castelli',
  salutation: 'Hey Kelsie,',
  paragraphs: [
    "I figured I'd reach out to you directly, given you're the Chief Design Officer at Rythm.",
    "Claimable and Care Continuity, both through Kem Design, are the closest thing I have to this role already: healthtech marketing sites built in Webflow on Mast's 12-column grid, so heroes, proof bands, and CTAs compose as reusable blocks instead of one-off pages. The test I care about came after handoff—I trained Claimable's marketing team on the system, and in a live demo they assembled a new medication landing page in minutes, in front of their own engineers. A system only the designer can drive isn't a system.",
    "I also ship my own products solo, front to back. Harvous—a Bible study notes app—is two years of that: the product, the site that explains it, a refactor and a database migration when user feedback said the note view had gotten heavy, and my own support ticketing system instead of a bolted-on widget. Same person doing brand, product, and web, which is the part of \"own it end to end\" most portfolios can't actually back up.",
    "This is personal for me too. In college I was so anxious about a blood draw they gave me a stress ball—I squeezed it so hard I could feel the needle move with every poke. More recently I tried to donate plasma at BioLife and didn't make it through the visit, too anxious to go through with it. Your device is the first blood-draw device I've seen that doesn't actually look like a needle. That matters to me.",
    "I already have opinions on the site, for what it's worth. The hero reads premium—serif headline, dark background—then a few seconds later you're in full direct-response mode: strikethrough pricing, an urgency banner, a floating discount bubble sitting right on top of your compliance badges. Neither register is wrong, but making them feel like one brand instead of two is the actual problem, and it's close to what I solved taking Claimable from clinical trust to fast, self-serve landing pages. I'd also guess that Labor Day banner isn't the last campaign page you run this year—that's the system I want to be building, so the next one takes an afternoon instead of a sprint.",
    "I'd love to talk.",
  ],
  signoff: '-Derek',
};

export const rythmHealthtechLead =
  "Two healthtech marketing sites—brand, layout, and the system that outlives the first launch—built with the kind of ownership this role is actually asking for.";

export type RythmShot = {
  src: string;
  alt: string;
  type?: 'image' | 'video';
  poster?: string;
  /** Intrinsic video size — keeps the shell from cropping the frame */
  width?: number;
  height?: number;
  /** Wide artifacts (sites, splash pages) lead their block full-width. */
  full?: boolean;
};

export type RythmBlock = {
  html: string | string[];
  shots: RythmShot[];
  caption?: string;
  more?: { href: string; label: string };
};

export const rythmHealthtechBlocks: RythmBlock[] = [
  {
    html: [
      `<a href="/work/claimable/">Claimable</a> helps patients appeal denied insurance claims with AI-assisted appeals. Working with Kem Design, I designed and built the marketing site in Webflow on <a href="https://www.nocodesupply.co/mast">Mast</a>'s 12-column grid—heroes, proof bands, and CTAs as reusable blocks that keep the same color system, type hierarchy, and voice whether it's the homepage or a GLP-1 landing page nobody's seen yet.`,
      `New medications enter the pipeline constantly, so marketing needed to launch a landing page without waiting on a dev queue. In a live demo, their team assembled a new page in minutes using the same components I'd built—and marketing and engineering both said so themselves, unprompted.`,
    ],
    shots: [
      {
        src: '/images/work/claimable/thumbnail.webp',
        alt: 'Claimable homepage hero — "We make it easy to appeal denied health claims," with an approved-appeal notification and press logos for The New York Times, Bloomberg, Politico, and Time',
        full: true,
      },
      {
        src: '/images/work/claimable/gallery-02.webp',
        alt: 'Claimable appeal preview showing an AI-drafted letter with clinical evidence highlighted inline',
      },
      {
        src: '/images/work/claimable/gallery-01.webp',
        alt: 'Claimable "Why Appeal?" proof section with denial-rate and success-rate stat cards',
      },
    ],
    caption: 'One component system, one consistent brand, every new medication page assembled from it.',
    more: { href: '/work/claimable/', label: 'Claimable' },
  },
  {
    html: [
      `<a href="/work/care-continuity/">Care Continuity</a> helps hospitals and health systems close the loop on follow-up care—100+ health systems, 3M+ patients navigated. Together with Kem Design, I reworked the site's IA and evolved the brand (dated illustration out, real photography and a ribbon motif in), then built it in Webflow with Mast.`,
      `Four solution lines—ED Connect, Referral IQ, Readmission IQ, CarePath IQ—needed to read as one family without collapsing into the same page four times. Modular templates on the same grid let each one keep its own color and photography while sharing every underlying section.`,
    ],
    shots: [
      {
        src: '/images/work/care-continuity/thumbnail.png',
        alt: 'Care Continuity homepage hero — "Close the loop on follow-up care across your health system," with a patient-and-provider photo and 100+/3M+/50%/30% outcome stats',
        full: true,
      },
      {
        src: '/images/work/care-continuity/gallery-02.png',
        alt: 'Care Continuity solutions grid — ED Connect, Referral IQ, Readmission IQ, and CarePath IQ as four color-coded modules',
      },
      {
        src: '/images/work/care-continuity/gallery-03.png',
        alt: 'Referral IQ solution page applying the same template with its own color and photography',
      },
    ],
    caption: 'Four products, one template—each keeps its own color without its own layout.',
    more: { href: '/work/care-continuity/', label: 'Care Continuity' },
  },
];

export const rythmCraftLead =
  "Harvous is both a product I've shipped for two years and the site that explains it—same designer building both ends of that loop.";

export const rythmCraftBlocks: RythmBlock[] = [
  {
    html: [
      `<a href="/projects/harvous/">Harvous</a> is a Bible study notes app I've been building for two years—threads, inline scripture lookup, recall. When real feedback said the note view had gotten heavy, I didn't reskin it: I refactored the interface and ran a database migration, because the old shape had stopped serving the people using it.`,
      `Small decisions got the same rigor—thread colors went through four side-by-side options before one won, onboarding through two full redesign rounds. I even built Harvous its own internal support ticketing system rather than bolt on a third-party widget, because staying close to the people using it is the whole point.`,
    ],
    shots: [
      {
        type: 'video',
        src: '/assets/images/projects/harvous-demo.mp4',
        poster: '/assets/images/projects/harvous-demo-poster.webp',
        alt: 'A quick tour of Harvous — capturing a note, keeping scripture in the flow, and picking up where you left off',
        width: 1240,
        height: 770,
      },
      {
        src: '/assets/images/projects/harvous-3.webp',
        alt: "Harvous My Home with a personalized greeting, Today's Passage, and pick-up-where-you-left-off cards",
      },
      {
        src: '/assets/images/projects/harvous-9.webp',
        alt: 'Harvous Appearance settings with Light Paper and Dark Night theme previews and accent color swatches',
      },
    ],
    caption: 'Two years, one product, refactors and migrations when the feedback said so.',
    more: { href: '/projects/harvous/', label: 'Harvous' },
  },
  {
    html: [
      `<a href="/work/harvouscom/">harvous.com</a> is the site that has to explain that product to someone who's never heard of it, without sounding like a Bible reader or a devotional app. I designed and built the current site end to end—positioning, page system, use-case cards, a founder letter, blog, and release notes.`,
      `The site's had two lives. The first version was a founder letter and a signup count—enough to launch. The current one leads with a sharper line and opens into proof before it asks anyone to take my word for it.`,
    ],
    shots: [
      {
        src: '/images/work/harvouscom/gallery-01.webp',
        alt: 'harvous.com homepage — "Make a study Bible one note at a time," with sign-up CTAs over an app screenshot',
        full: true,
      },
      {
        src: '/images/work/harvouscom/gallery-02.webp',
        alt: 'harvous.com feature detail — auto-folders, threads, scripture pills, and recall, paired with app UI',
      },
    ],
    caption: 'Same product, two sites—the second one earns the sentence instead of stating it.',
    more: { href: '/work/harvouscom/', label: 'harvous.com' },
  },
];

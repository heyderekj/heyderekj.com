/** Content for `/customerio/` — curated for Customer.io Senior Product Designer application. */

export const customerioMeta = {
  title: 'Derek Castelli — For Customer.io',
  description:
    'Product design through building, shipping, and watching real users—curated for the Customer.io team.',
  ogImage: '/assets/images/projects/harvous-preview.webp',
};

export const customerioIntro = {
  photoSrc: '/assets/about/derek-photo.jpeg',
  photoAlt: 'Derek Castelli',
};

export const customerioLetter = {
  to: 'Matt Wensing',
  from: 'Derek Castelli',
  salutation: 'Hey Matt,',
  paragraphs: [
    "When Will King sent me this opportunity it made my day! It’s the chance to move from making websites with other teams to focusing on product design with one—a team that makes \"The Thank You Economy\" more of a reality.",
    "Shipping things—letting strangers experience something you made without ever knowing you—is what matters most to me. That’s why I wanted to become an architect and stumbled into digital design instead, teaching myself ever since. Or as I tell my family, \"I make rectangles.\"",
    "On the side, I’ve always wanted to make an app—something people choose to open and use again and again, not a building most people take for granted or see once. I dabbled for years and even got close to launching one, with the whole frontend built in Webflow. Then AI happened, and I could finally turn the designs and half-formed ideas in my head into working prototypes and real products.",
    "AI has completely changed my world as a designer who loves building. Being able to prototype quickly and test what actually feels right is my favorite part—I can go further, faster, from idea to a real flow people can try, not just a polished frame. I’ve actually written about how I think AI should show up in products: subtle, useful, not a checkbox.",
    "This Senior Product Designer role would push me to ask lots of questions and look closely at how people actually behave—session recordings, support threads, the messy real stuff. 2026 has been a roller coaster of a year, lulls and all, but designing and shipping products with AI is what’s made it worth it. I’d love to bring that here, moving from making websites for visitors to building experiences that actually create impact. I’m eager to chat more!",
  ],
  signoff: '-Derek',
};

/** Linked after the letter’s AI paragraph — viewpoint reading strip. */
export const customerioLetterAiNotes = {
  lead: 'A few notes on how I think about that:',
  posts: [
    {
      title: 'The AI Checkbox Fallacy',
      href: '/posts/2025-03-01-the-ai-checkbox-fallacy/',
    },
    {
      title: 'The Seduction of Sparkle',
      href: '/posts/2025-03-06-the-seduction-of-sparkle/',
    },
    {
      title: 'App First. AI Second.',
      href: '/posts/2025-03-11-app-first-ai-second/',
    },
    {
      title: 'Dogfood or die because of AI',
      href: '/posts/2026-02-22-dogfood-or-die-because-of-ai/',
    },
  ],
};

export const customerioProofLead =
  "I’ve learned a lot by building things I actually use. These aren’t side demos—they’re products I ship, support, and keep improving until they work better in practice.";

/**
 * Narrative proof blocks. Each is a self-contained unit: the story, two money
 * shots that show a decision (not a feature), and a link into the project.
 */
export type CustomerioProofShot = {
  src: string;
  alt: string;
  type?: 'image' | 'video';
  poster?: string;
  /** Intrinsic video size — keeps the proof shell from cropping the frame */
  width?: number;
  height?: number;
  /**
   * Window chrome corner radius as a fraction of video width
   * (e.g. 0.057 ≈ macOS app window on a square-cropped capture).
   */
  windowRadius?: number;
};

export const customerioProofBlocks: {
  html: string | string[];
  href: string;
  label: string;
  shots: CustomerioProofShot[];
  caption: string;
  /** Mat treatment behind transparent screenshots (e.g. dark macOS wallpaper). */
  mat?: 'macos-dark';
}[] = [
  {
    html: [
      `<a href="/projects/harvous/" class="cio-chip cio-chip--harvous"><i class="ph-bold ph-book-open-text" aria-hidden="true"></i>Harvous</a> is two years of product work—multiple iterations, a massive messy Figma file, then a complete redesign driven by real feedback that included a refactor and a database migration.`,
      `The first version went head-on at my problem of notes not getting organized, but it made organizing the primary act and making a note secondary. The redesign flipped that: capture first, structure after (or honestly no organizing needed as everything is now auto/“smart”). So the thing people actually came to do wasn’t buried under the system meant to help them.`,
      `This app matters a lot to me as I made it to help me first. I needed a notes app to better remember my study. But with over 200 users I have a responsibility which is why I also created a custom internal customer support ticketing system.`,
    ],
    href: '/projects/harvous/',
    label: 'Harvous',
    shots: [
      {
        type: 'video',
        src: '/assets/images/projects/harvous-demo.mp4',
        poster: '/assets/images/projects/harvous-demo-poster.webp',
        alt: 'Harvous product tour — notes, scripture in the flow, and My Home',
        width: 1240,
        height: 770,
        /* Browser chrome is subtler than a native app window */
        windowRadius: 0.007,
      },
      {
        src: '/assets/images/projects/harvous-1.png',
        alt: 'Inline Exodus scripture card with translation and verse-range controls over a study note',
      },
      {
        src: '/assets/images/projects/harvous-11.png',
        alt: 'Harvous admin Support inbox with ticket list, selected question, device context, and triage notes',
      },
    ],
    caption: 'Product tour · scripture stays in the note · support is a custom inbox, not a bolted-on widget.',
  },
  {
    html: [
      `<a href="/projects/dinky/" class="cio-chip cio-chip--dinky"><i class="ph-bold ph-file-arrow-down" aria-hidden="true"></i>Dinky</a> started as a local image-compression Mac app because the tool I normally used kept crashing. Then people wanted it too. I cared about clear tradeoffs—honest format choices, preview, batch controls—so people knew what they were getting, not magic.`,
      `The goal was to make it user-friendly for both casual and pro users and it felt like many either were one or the other. So, I tuned it, took PRs, replied to users on <a href="https://github.com/heyderekj/dinky">GitHub</a>, and it grew past 400 stars—from an image compressor into a full file compression app.`,
    ],
    href: '/projects/dinky/',
    label: 'Dinky',
    mat: 'macos-dark',
    shots: [
      {
        type: 'video',
        src: '/assets/images/projects/dinky-demo.mp4',
        poster: '/assets/images/projects/dinky-demo-poster.webp',
        alt: 'Dinky compression tour — drop files in, watch them shrink, undo any file',
        width: 440,
        height: 492,
        /* Soft clip for square-cropped window — enough to hide corner fill, not chrome */
        windowRadius: 0.028,
      },
      {
        src: '/assets/images/projects/dinky-1.png',
        alt: 'Dinky main window with Adjust settings open — Image mode and WebP selected',
      },
      {
        src: '/assets/images/projects/dinky-5.png',
        alt: 'Dinky Presets settings editing a Websites preset with Smart quality, media types, and format options',
      },
    ],
    caption: 'Full compression tour · honest format choices · presets for the workflow you repeat.',
  },
  {
    html: [
      `<a href="/projects/heres-my-church/" class="cio-chip cio-chip--hmc"><i class="ph-bold ph-map-trifold" aria-hidden="true"></i>Here's My Church</a> began while I was playing with Figma Make and wanted to prototype a map with a dataset. First it was world conflicts. Then I thought about how church directories are outdated and poorly maintained—which is disappointing for the church community.`,
      `Through multiple datasets and any data I could pull together, a church directory was born. To keep improving it with as little friction as possible, updates are anonymous and reviewed—no account required. Oh, and I was proud of how I used existing data to improve estimated attendance numbers.`,
    ],
    href: '/projects/heres-my-church/',
    label: "Here's My Church",
    shots: [
      {
        src: '/assets/images/projects/hmc-1.png',
        alt: "Here's My Church filters with verified criteria and attendance size ranges",
      },
      {
        src: '/assets/images/projects/hmc-2.png',
        alt: 'Church detail card with estimated weekly attendance clearly labeled as an estimate',
      },
    ],
    caption: '“Verified” has a definition you can read · estimates stay labeled estimates.',
  },
  {
    html: [
      `My latest side project is <a href="/projects/revisemy/" class="cio-chip cio-chip--revisemy"><i class="ph-bold ph-selection-plus" aria-hidden="true"></i>ReviseMy</a>. I’d had the idea since 2024 for a self-serve feedback loop tool—it sat as an unused domain until a weekend challenge building on Laravel Cloud for the first time.`,
      `It was reborn as an MCP that captures visuals and lets people leave honest marks through a shareable link, all from inside an AI agent chat session—so the agent gets a real point of view, not guesses. I wanted to take what I learned from Here's My Church with no account required to make this AI-forward-thinking feedback tool thinking through the owner vs user and guest.`,
    ],
    href: '/projects/revisemy/',
    label: 'ReviseMy',
    shots: [
      {
        src: '/assets/images/projects/revisemy-1.png',
        alt: 'ReviseMy review with an M1 mark on the design, My marks panel, and Second opinion hints',
      },
      {
        src: '/assets/images/projects/revisemy-2.png',
        alt: 'ReviseMy guest link menu with expiry options and disable comments',
      },
    ],
    caption: 'Marks you leave are the ones that count · guests review from a link you can expire.',
  },
];

export const customerioFoundationsLead =
  "Before I was shipping my own products, Apple Retail and leading creative at my local church taught me to care about real journeys—how people move through something when they’re trying to solve a problem, not how it should work from a doc.";

export const customerioFoundationsParagraphs: string[] = [
  `Even as lead sales at my local Apple Store, I found myself designing. That job made me pay attention to customer experience in a more real way—the details of how people move through something when they’re stuck or deciding. Empathy wasn’t a slide; it was how you helped someone understand something complicated.`,
  `At my local church I owned the creative end to end—print, digital screens, the website, merch, and weekend production. Physical spaces and digital properties had to work together for real people every Sunday. That kind of ownership is why I care about the full journey, not just a single artifact.`,
  `Client work like Claimable and Care Continuity—done with <a href="https://kemdesign.co">Kem Design</a>—is where I practiced systems and structured experiences at scale. I owned design through development, client communication, and handoff while collaborating with the CD—closing the gap between the design and what actually shipped.`,
];

export const customerioWhyParagraphs: string[] = [
  `Honestly, three things.`,
  `I'd get to stay close to a product all the way through—design into what actually ships—which is already how I work, even if it hasn't been the job title yet. And it feels like the right place to go deeper into product, with a team treating AI as something that should actually help people, not just check a box (I've written about that more than once).`,
  `Secondly, \"The Thank You Economy\"—software that feels like a small local business that knows you. I’d rather make experiences strangers choose to use than rectangles people visit once—and Customer.io is that problem at scale.`,
  `And it's remote, so I keep building from Iowa (or wherever my wife needs to be for her education and work).`,
];

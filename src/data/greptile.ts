/** Content for `/greptile/` — curated for the Greptile Brand Designer application. */

export const greptileMeta = {
  title: 'Derek Castelli — For Greptile',
  description:
    'Identity, launches, and web craft—brand work that landed with a developer audience, curated for the Greptile team.',
  ogImage: '/images/work/scenery/thumbnail.webp',
};

export const greptileIntro = {
  photoSrc: '/assets/about/derek-photo.jpeg',
  photoAlt: 'Derek Castelli',
};

export const greptileLetter = {
  to: 'Christine',
  from: 'Derek Castelli',
  salutation: 'Hey Christine,',
  paragraphs: [
    "I've spent the last two years designing, shipping, and launching developer tools in public. Mac apps built with Cursor and Claude, a notes app I dogfood daily, an MCP server—all of it announced on X to people who build things for a living. I know what makes engineers stop scrolling, because I've done it to them.",
    "Before that I was doing brand work: identity and websites for Scenery (Adobe acquired them not long after), and two years owning every piece of creative at my church—print, screens, merch, the website, weekend production. Physical and digital, same brand, real people every week. Or as I tell my family, \"I make rectangles.\"",
    "Most brand designers applying here will have beautiful work. Fewer will have evidence it ever landed with developers. That's the part I'd bring: a launch instinct tuned on the exact audience Greptile sells to, plus the web craft to build the thing rather than hand it off.",
    "I'd love to talk.",
  ],
  signoff: '-Derek',
};

export const greptileBrandLead =
  "Identity work, and the part most portfolios skip—owning a brand across everything it touches, on a screen and in a room.";

export type GreptileShot = {
  src: string;
  alt: string;
  type?: 'image' | 'video';
  poster?: string;
  /** Intrinsic video size — keeps the shell from cropping the frame */
  width?: number;
  height?: number;
  /**
   * Window chrome corner radius as a fraction of video width
   * (e.g. 0.057 ≈ macOS app window on a square-cropped capture).
   */
  windowRadius?: number;
  /** Wide artifacts (sites, splash pages) lead their block full-width. */
  full?: boolean;
};

/** A launch post on X, shown with its like count. No commentary added. */
export type GreptilePost = {
  title: string;
  href: string;
  likes: string;
};

export type GreptileBlock = {
  html: string | string[];
  shots: GreptileShot[];
  caption?: string;
  /** Case-study link — used by brand blocks. */
  more?: { href: string; label: string };
  /** Launch posts — used instead of `more` so the proof stays the post itself. */
  posts?: GreptilePost[];
};

export const greptileBrandBlocks: GreptileBlock[] = [
  {
    html: [
      `<a href="/work/scenery/" class="cio-chip cio-chip--scenery"><i class="ph-bold ph-film-slate" aria-hidden="true"></i>Scenery</a> is the identity work I'd point at first. A launch was weeks away and the brand wasn't ready to carry it, so I refined the mark, built the type and color system around it, and designed and shipped the site it all lived on.`,
      `The wordmark had to hold up small in a product nav and large on a homepage headline. Collaborator labels—Editor, Designer, Marketer—became a brand device, not just a UI detail: the product's whole pitch was multiplayer, so the brand said multiplayer everywhere it showed up. Adobe acquired the team later on.`,
    ],
    shots: [
      {
        src: '/images/work/scenery/thumbnail.webp',
        alt: 'Scenery homepage — wordmark in the nav, oversized display headline over the editor timeline, collaborator name tags on the canvas',
        full: true,
      },
      {
        src: '/images/work/scenery/gallery-02.png',
        alt: 'Scenery product page with feature tabs and the timeline editor on a deep blue panel',
      },
      {
        src: '/images/work/scenery/gallery-03.png',
        alt: 'Scenery page section pairing product UI with brand type and color',
      },
    ],
    caption:
      'The mark works at nav scale and headline scale · the multiplayer story is carried by the brand, not just the UI.',
    more: { href: '/work/scenery/', label: 'Scenery' },
  },
  {
    html: [
      `From 2018 to 2020 I led creative at <span class="cio-chip cio-chip--eternity"><i class="ph-bold ph-church" aria-hidden="true"></i>Eternity Church</span>, and it's the closest thing I have to owning a brand end to end. Walls, digital screens, print, merch, the website, and the weekend production that put all of it in front of thousands of people every week.`,
      `Every series meant a full system on a deadline that never moved: the mark, the stage design, the screen graphics, the shirts, the printed pieces, the social cuts. My favorite was Love Month, where the physical space and the digital environment were designed as one thing—that's still the kind of work I chase. Doing it weekly is what taught me a brand isn't an artifact, it's everything someone walks through.`,
      `I came back in 2025 to <a href="/work/eternity-church-2/">redesign the site</a>—Squarespace to Webflow, solo, six weeks.`,
    ],
    // TODO: No 2018–2020 Eternity assets exist in the repo (walls, screens, merch,
    // the foyer photo box, Love Month mixed media). This block is text-only until
    // Derek digs up photos — see the asset list.
    shots: [],
    more: { href: '/posts/2022-01-06-my-church-i-once-designed-for/', label: 'that season' },
  },
  {
    html: [
      `My first client was <a href="https://www.chrisducker.com/" class="cio-chip cio-chip--ducker"><i class="ph-bold ph-signature" aria-hidden="true"></i>Chris Ducker</a>. I was in college, I charged him $100 for a logo, and it was 2010.`,
      `He's still using it. Slightly revised, core intact—sixteen years on. I've never made a better argument for getting the mark right than that one accidentally makes for me.`,
    ],
    shots: [],
    more: { href: 'https://www.chrisducker.com/', label: 'Chris Ducker' },
  },
];

export const greptileLaunchLead =
  "I ship my own products, which means I also name them, design their splash pages, cut the announcement, and post it. Here's what that's looked like, with the numbers as they are.";

export const greptileLaunchBlocks: GreptileBlock[] = [
  {
    html: [
      `<a href="/projects/binky/" class="cio-chip cio-chip--binky"><i class="ph-bold ph-folders" aria-hidden="true"></i>Binky</a> is a Mac app that sorts your Downloads folder. The name, the voice, and the whole launch leaned into one joke—files were screaming, Binky helped—and the empty states, the notifications, and the announcement post all told it the same way.`,
      `The launch itself was the sorting animation: files lifting out of a pile and dropping into buckets, captioned and posted with no explanation. It's the single best-performing thing I've made.`,
    ],
    shots: [
      {
        src: '/assets/images/projects/binky-sorting-2.webp',
        alt: 'Binky mid-sort — a PDF lifting toward Images, Videos, and Docs buckets while the progress bar reads 71 of 215',
        full: true,
      },
      {
        src: '/assets/images/projects/binky-1.png',
        alt: 'Binky main window with Quick Sort for Downloads and routines in the sidebar',
      },
      {
        src: '/assets/images/projects/binky-3.webp',
        alt: 'Binky routines and templates sheet for recurring sorting rules',
      },
    ],
    caption: 'The joke is the product and the product is the joke · the animation was the announcement.',
    posts: [
      {
        title: 'Binky sorting animation',
        href: 'https://x.com/heyderekj/status/2051669495995912305',
        likes: '1.5k',
      },
    ],
  },
  {
    html: [
      `<a href="/projects/dinky/" class="cio-chip cio-chip--dinky"><i class="ph-bold ph-file-arrow-down" aria-hidden="true"></i>Dinky</a> started as an image compressor and grew into a full file compression app. Binky and Dinky are deliberately a set—same naming logic, same tone, same icon language—so shipping the second one made the first one land harder.`,
      `Dinky 2.0 got its own moment: a tour cut showing files dropping in and shrinking, posted the way I'd want to see it if someone else made it. Both apps passed 200 stars on <a href="https://github.com/heyderekj/dinky">GitHub</a> within weeks of launching; Dinky is past 400 now.`,
    ],
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
    caption: 'Two apps built as one family · the 2.0 tour was the launch asset.',
    posts: [
      {
        title: 'Dinky 2.0',
        href: 'https://x.com/heyderekj/status/2044789183613460545',
        likes: '455',
      },
    ],
  },
  {
    html: [
      `<a href="/work/harvouscom/" class="cio-chip cio-chip--harvous"><i class="ph-bold ph-book-open-text" aria-hidden="true"></i>Harvous</a> launched on a splash page before it was a product anyone could use. One headline, a short letter, my actual signature, the logos of churches already using it, and a signup count that updated as people came in.`,
      `That page was the whole campaign. I posted it, posted the button animation from it, and posted the app itself—three separate moments off one launch, each one built to work as a single image or a short loop in a feed.`,
    ],
    shots: [
      {
        src: '/images/work/harvouscom/prior/thumbnail.webp',
        alt: 'Harvous splash page — "Keep your Bible app, just add Harvous" headline, founder letter with signature, church logos, and a live signup count',
        full: true,
      },
      {
        src: '/images/work/harvouscom/gallery-01.webp',
        alt: 'The current harvous.com homepage with use-case cards and product proof',
      },
      {
        src: '/images/work/harvouscom/gallery-03.webp',
        alt: 'Harvous features section pairing narrative copy with product UI callouts',
      },
    ],
    caption: 'One splash page, three launch moments · every asset sized for a feed.',
    /* Narrative order, not ranked by likes — the splash page is the block's subject. */
    posts: [
      {
        title: 'Splash page',
        href: 'https://x.com/heyderekj/status/1993165228700209195',
        likes: '476',
      },
      {
        title: 'Button animation',
        href: 'https://x.com/heyderekj/status/1893052042295287981',
        likes: '785',
      },
      {
        title: 'The Bible notes app I’ve been making',
        href: 'https://x.com/heyderekj/status/1884366451118858554',
        likes: '686',
      },
    ],
  },
  {
    html: [
      `<a href="/projects/heres-my-church/" class="cio-chip cio-chip--hmc"><i class="ph-bold ph-map-trifold" aria-hidden="true"></i>Here's My Church</a> is a free, crowdsourced directory of churches in America. The launch line did the work: I accidentally made a free crowdsourced database of churches in America. True, a little absurd, and it explains the whole thing in one sentence.`,
      `The map is the brand. A national view that reads as one image at any size is what made it shareable—the announcement post is essentially that screenshot plus the sentence.`,
    ],
    shots: [
      {
        src: '/assets/images/projects/hmc-9.webp',
        alt: "Here's My Church national map with churches plotted across the United States",
        full: true,
      },
      {
        src: '/assets/images/projects/hmc-1.png',
        alt: "Here's My Church filters with verified criteria and attendance size ranges",
      },
      {
        src: '/assets/images/projects/hmc-4.webp',
        alt: "Here's My Church search results for Iowa with the map and listings side by side",
      },
    ],
    caption: 'The map is the identity · one sentence carried the launch.',
    posts: [
      {
        title: 'I accidentally made a free crowdsourced database of churches in America.',
        href: 'https://x.com/heyderekj/status/2030730217140994310',
        likes: '137',
      },
    ],
  },
];

export const greptileWebLead =
  "Typography and layout on the web is where my craft ceiling is highest, and I own design through development—so what ships is what was designed.";

export const greptileWebParagraphs: string[] = [
  `<a href="/work/claimable/">Claimable</a> and <a href="/work/care-continuity/">Care Continuity</a>, both through <a href="https://kemdesign.co">Kem Design</a>, are where I built type and layout as systems rather than pages. Both run on <a href="https://www.nocodesupply.co/mast">Mast</a>—a component system on a 12-column grid—so heroes, proof bands, and content sections compose predictably and a new page is assembly, not a redesign.`,
  `The test I care about came after handoff: I trained Claimable's marketing team on the system, and they turned around and demoed it to their own engineers, assembling a new medication landing page in minutes. Marketing and engineering both praised how easy new pages were to add. A system that only the designer can drive isn't a system.`,
  `I design and build, which is the part that matters for docs, marketing pages, and one-off launch microsites—there's no gap between the file and the thing on the internet, because I'm the one closing it.`,
];

export const greptileWhyParagraphs: string[] = [
  `Three honest reasons.`,
  `Their audience is my audience. I build the kind of tool Greptile sells, for the kind of person Greptile sells to—Mac apps, an MCP server, repos with stars on them, shipped with Cursor and Claude and posted to developers who react to launches. I'm not studying that audience from the outside; I'm in it.`,
  `Then there's the category. AI code review is crowded and getting more crowded, and most of it looks the same, which means brand is the actual differentiator—across the website, the docs, social, launch moments, and the physical stuff at events. That's full-journey ownership, and it's the work I actually like. I'd rather own all of it than perfect one artifact.`,
  `And it's remote, so I keep building from Iowa.`,
];

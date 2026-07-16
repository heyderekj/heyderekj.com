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
    "When Will King sent me this opportunity it made my day! What I care about is helping teams reach people in a way that actually feels useful—as if every company were a small local business. My strength is the whole journey: where people get stuck, whether it works, and staying close enough to build and ship until it does.",
    "I’ve always been a little unconventional about this, and self-taught. I learn by building, tweaking, shipping, and paying close attention to what real users do—oh, and I’m the first real user. I often don’t know what direction things will take until I start messing around, and I learn a lot by experimenting and iterating until the shape of the thing becomes clear.",
    "While I care about how it all looks, I care even more about whether it works: flows that don’t lose people, where friction lives, and whether the thing does what we intended. I want to understand the problems before trying to solve them. That’s why I’m a designer.",
    "AI has completely changed my world as a designer who loves building. I can go further, faster—from idea to a real flow people can try, not just a polished frame. I’ve actually written about how I think AI should show up in products: subtle, useful, not a checkbox on my personal blog.",
    "This Senior Product Designer role would push me to ask lots of questions and look closely at actual user behavior, watching recordings (if any) and finding the real problems to fix. It would challenge me, I’d keep growing, and I’d be going full circle—helping people better reach and support their customers. That’s why Senior Product Designer at Customer.io, right now, just feels right.",
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

/** Narrative proof blocks with project chips; optional figure after the paragraph. */
export const customerioProofBlocks: {
  html: string;
  figure?: { src: string; alt: string; caption: string };
}[] = [
  {
    html: `<a href="/projects/harvous/" class="cio-chip cio-chip--harvous"><i class="ph-bold ph-book-open-text" aria-hidden="true"></i>Harvous</a> is two years of product work—multiple iterations, a massive messy Figma file, then a complete redesign driven by real feedback that included a refactor and a database migration. Customer support mattered so much that I built Harvous its own internal support ticketing system. I stayed with it because the problem was mine first: remembering Scripture better. Long-term product thinking looks like that—willing to rebuild when the old shape stops serving the people using it.`,
    figure: {
      src: '/assets/images/projects/harvous-start-to-launch.png',
      alt: 'Harvous UI evolution from early wireframes through intermediate designs to the launched product',
      caption: 'Harvous — start → launched: the long messy path through the Figma file.',
    },
  },
  {
    html: `<a href="/projects/dinky/" class="cio-chip cio-chip--dinky"><i class="ph-bold ph-file-arrow-down" aria-hidden="true"></i>Dinky</a> started as a local image-compression Mac app because the tool I normally used kept crashing. Then people wanted it too. I cared about clear tradeoffs—honest format choices, preview, batch controls—so people knew what they were getting, not magic. I tuned it, took PRs, replied to users on <a href="https://github.com/heyderekj/dinky">GitHub</a>, and it grew past 400 stars—from an image compressor into a full file compression app. That’s the loop I care about: ship something useful, listen, and let real use decide what it becomes.`,
  },
  {
    html: `<a href="/projects/heres-my-church/" class="cio-chip cio-chip--hmc"><i class="ph-bold ph-map-trifold" aria-hidden="true"></i>Here's My Church</a> began while I was playing with Figma Make and wanted to prototype a map with a dataset. First it was world conflicts. Then I thought about how church directories are outdated and poorly maintained—which is disappointing for the church community. Through multiple datasets and any data I could pull together, a church directory was born. To keep improving it with as little friction as possible, updates are anonymous and reviewed—no account required.`,
  },
  {
    html: `My latest is <a href="/projects/revisemy/" class="cio-chip cio-chip--revisemy"><i class="ph-bold ph-selection-plus" aria-hidden="true"></i>ReviseMy</a>. I’d had the idea since 2024 for a self-serve feedback loop tool—it sat as an unused domain until a weekend challenge building on Laravel Cloud for the first time. It was reborn as an MCP that captures visuals and lets people leave honest marks through a shareable link, all from inside an AI agent chat session—so the agent gets a real point of view, not guesses. Same instinct: take a real problem, ship something people can use, and learn from the loop.`,
  },
];

/** Ordered project cards in the proof grid. */
export const customerioProofProjectSlugs = [
  'harvous',
  'dinky',
  'heres-my-church',
  'revisemy',
] as const;

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
  `Billions of messages a day is billions of chances for software to feel like a small local business that knows you—that's a problem worth sweating.`,
  `And it's remote, so I keep building from Iowa (or wherever my wife needs to be for her education and work).`,
];

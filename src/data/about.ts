/** Content for `/about/`. Edit here; layout lives in `src/pages/about.astro`. */

export const aboutMeta = {
  title: 'About — Derek Castelli',
  description:
    'Design journey from Micro Machines sketches to Webflow, client work, and Harvous. Freelance designer, Lead UI/UX at One Branding, Webflow Expert with Kem Design Co.',
  ogImage: '/assets/about/derek-photo.jpeg',
};

export const aboutHero = {
  headline: 'I tell my family that I make rectangles for a living.',
  introParagraphs: [
    "People say that I'm able to adapt to various styles, work fast, and always think through possible better experiences that challenge the norm.",
    'At the end of the day, I like the color orange and try to stay minimal for my own sake while also being playful.',
  ],
  designJourneyKicker: "Here's my design journey…",
  photoSrc: '/assets/about/derek-photo.jpeg',
  photoAlt: 'Derek Castelli',
  avatarSrc: '/assets/about/derek-avatar.png',
  avatarAlt: 'Illustrated avatar of Derek',
  /** Shown in a slide-up panel on hero hover / focus. */
  avatarCredit: {
    href: 'https://tiny.supply/pfp/derek',
    artist: 'Darius Dan',
    line: 'Illustration by',
  },
};

export type AboutSection = {
  heading: string;
  paragraphs: string[];
  bulletsTitle?: string;
  bullets?: string[];
};

export const aboutSections: AboutSection[] = [
  {
    heading: 'How I got into design',
    paragraphs: [
      'The first moment of me designing that I remember is creating custom environments for my Micro Machines on notebook paper with markers. From there, I would witness my dad design our house in AutoCad and would enjoy drawing floor plans and elevations on grid paper.',
      "Then came downloading the Sketch app, my first digital design tool that wasn't MS Paint.",
    ],
  },
  {
    heading: 'My first ever client',
    paragraphs: [
      'My first ever client was Chris Ducker. He needed a logo for his blog and I only charged $100. This would be in 2010 and throughout my college days I would contribute to a blog about blogging, tinker with Wordpress themes on Themeforest, and launch a design blog and then a college tips blog while having an opinion column in the student newspaper, Iowa State Daily.',
      'Side note: The Chris Ducker logo has been slightly updated but the core still exists today.',
    ],
  },
  {
    heading: 'First serious design job',
    paragraphs: [
      'In 2018, I was given the opportunity to lead experience design at my then church. The responsibilities included designing all physical spaces, digital screens, and managing our digital properties.',
      'Months prior to the world shutting down in 2020 I learned Webflow and began redesigning the entire website. One of the new features of the site was something called “Chat with a Pastor” where I used no-code tools to create a service that would allow anyone to schedule a chat with a pastor as soon as same day. This got the attention of Hillsong Church.',
    ],
  },
  {
    heading: 'Freelancing full-time',
    paragraphs: [
      'Shortly after Easter I started thinking about leaving my design job at the church. Then came June and I had left to start my own business for the first time. Setup an LLC, focused on the connections I did have, and slowly got business.',
      "Things weren't great, but from June till March I was able to get by. In late March I would work at a local creative agency to focus on making Webflow sites. This would last less than 30 days as my personal life quickly fell apart and needed to regroup.",
    ],
  },
  {
    heading: 'The latest',
    paragraphs: [
      "Fast forward to October 2022 when I was able to go full-time as a freelancer for a different local creative agency (One Branding) focused again on Webflow. They've worked with Yelp and so far I've had the opportunity to work with GoGuardian, IGN, and many others.",
      "Since moving on from this team I've been blessed and happy working with Kem Design Co. as a Webflow Expert, supporting the team on site builds. Oh, and of course working with my own clients through Testament Made LLC DBA Derek J Design",
    ],
  },
  {
    heading: 'In my free time',
    paragraphs: [
      "A goal of mine has always been to transition away from doing client work. I'd rather have customers. Ever since I worked directly with customers in Apple Retail from 2012 to 2018 I loved to surprise and delight customers. Designing and contributing to the customer journey was also rewarding for me so I want to design my own for my own product/service.",
      'This adventure started in 2021 when I had the idea of a family journaling app called Hike (fully designed in Webflow).',
      "Now, I'm focused on building a Bible app called Harvous.",
      "When I'm not working, I'm spending time with my fiancé (my best friend), my pets (my kids), friends over coffee or on X, and family FaceTime sessions.",
    ],
    bulletsTitle: 'Oh, I also like to:',
    bullets: [
      'Drive around playing music',
      'Watch movies with a good soundtrack',
      'Watch Dr. Disrespect play (shoutout to #ChampionsClub)',
      'Play Cities: Skylines',
      'Watch F1',
    ],
  },
];

export type AboutExpLink = {
  label: string;
  href: string;
  icon: 'arrow' | 'newspaper';
};

export type AboutExpItem = {
  name: string;
  range: string;
  description: string;
  link?: AboutExpLink;
};

export type AboutExpGroup = {
  title: string;
  items: AboutExpItem[];
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  context: string;
  /** The line to pull out big on the Work page; must appear word for word in `quote` */
  pull?: string;
  /** How we know each other, for the Work page's tag (otherwise read from `context`) */
  relation?: string;
  /** Where it was said (a post, an episode at the moment), so the tag links there */
  href?: string;
};

export const testimonials: Testimonial[] = [
  {
    quote: "Derek helped me revamp Scenery's brand, logo, and website in the first two months of my tenure and was a crucial, fun partner to work with throughout the process. Derek had a well defined process, integrated into the team well, and came up with creative approaches when they were most needed — at both the start and finish of the project. Thank you Derek!",
    author: 'Barrett Johnson',
    role: 'Former Head of Marketing at Scenery',
    context: "Barrett was Derek's client · Nov 2023",
    pull: 'a crucial, fun partner to work with',
  },
  {
    quote: 'I highly recommend Derek for his exceptional skills in User Interface (UI) design and Webflow Development. Derek\'s creative approach to UI consistently delivers visually exceptional and user-friendly interfaces that drives results. His proficiency in Webflow empowers him to bring his designs to life with seamless functionality and responsiveness. Derek\'s attention to detail, collaborative nature, and commitment to staying current with design trends makes him a valuable asset to any project.',
    author: 'Danny Begnoche',
    role: 'Owner at One Branding',
    context: 'Danny worked with Derek on the same team · Aug 2023',
    pull: 'visually exceptional and user-friendly interfaces',
  },
  {
    quote: 'Derek is an incredibly talented Designer and Webflow Developer with a unique drive to always seek out the best solution and learn new things along the way.',
    author: 'Corey Moen',
    role: 'Former Brand/Web Designer at Webflow',
    context: "Corey was Derek's mentor · Apr 2023",
    pull: 'a unique drive to always seek out the best solution',
    relation: 'Friend',
  },
];

/** The Work page's testimonials: the ones above plus shout-outs that only live there, newest first. */
export const workTestimonials: Testimonial[] = [
  {
    quote: "We're celebrating the launch of River Valley's new website! Go check it out! Shoutout to Josh Coyle and Derek Castelli for what happens to be my favorite website we've completed in just 6 months!",
    author: 'Shelley Martin',
    role: 'Apollos',
    context: 'A shout-out in the Apollos Slack · Dec 2024',
    pull: "my favorite website we've completed in just 6 months",
    relation: 'Teammate',
  },
  {
    quote: 'There’s a guy named Derek who, whenever I post these side projects, he’s like, “Hey man, I made a logo for you.” And then I’ll be like, oh man, that’s legit. Send me a Stripe invoice link and I’ll send you some money. This has happened maybe like five times now, where he does this and then I just give him money, unprompted.',
    author: 'Josh Pigford',
    role: 'Founder of Baremetrics, maker of NameSnag',
    context: 'On Greg Isenberg’s podcast, about the NameSnag logo · Jul 2025',
    pull: 'oh man, that’s legit',
    relation: 'Client',
    href: 'https://youtu.be/OAqCyVuZ_6o?t=884',
  },
  ...testimonials,
];

export const aboutExperienceGroups: AboutExpGroup[] = [
  {
    title: 'Current',
    items: [
      {
        name: 'Testament Made, LLC',
        range: 'Jun 2020 — Present',
        description:
          'Freelance web designer partnering with clients and teams to make sites in Webflow, and making apps on the side.',
        link: { label: 'testamentmade.com', href: 'https://testamentmade.com', icon: 'arrow' },
      },
      {
        name: 'Kem Design Co.',
        range: 'May 2024 — Present',
        description: 'Webflow Expert assisting the team when it comes to making sites.',
        link: { label: 'kemdesign.co', href: 'https://kemdesign.co', icon: 'arrow' },
      },
    ],
  },
  {
    title: 'Past experience',
    items: [
      {
        name: 'Jamm Designs',
        range: 'Jan 2025 — May 2026',
        description:
          'Senior Web Designer (Freelance), designing sites and developing them in Webflow one update at a time.',
      },
      {
        name: 'Apollos',
        range: 'Jun 2024 — Sep 2025',
        description:
          'Partnered with the Apollos web team to design and develop Webflow sites for churches.',
      },
      {
        name: 'One Branding',
        range: 'Oct 2022 — Sep 2024',
        description:
          'Web designer and Webflow developer working with various clients from edutech to video gaming.',
      },
      {
        name: 'Eternity Church',
        range: 'Oct 2018 — Jun 2020',
        description:
          'Created and oversaw all creative elements of the church from graphics to merch to production.',
      },
      {
        name: 'Apple Retail',
        range: 'Aug 2012 — Oct 2018',
        description:
          'A mentor and leader in sales connecting with customers to truly get the Apple products they need.',
      },
    ],
  },
  {
    title: 'Education',
    items: [
      {
        name: 'Iowa State University',
        range: 'Aug 2007 — May 2014',
        description:
          'Obtained a Bachelor of Arts in Communication Studies with supplementary time in Advertising and the College of Design.',
        link: {
          label: 'Articles at Iowa State Daily',
          href: 'https://iowastatedaily.com/staff_name/derek-jensen/',
          icon: 'newspaper',
        },
      },
    ],
  },
];

/** The About page's story: short chapters in my own words, the year in the margin. */
export type AboutChapter = { when: string; title: string; text: string };
export const aboutChapters: AboutChapter[] = [
  {
    when: 'As a kid',
    title: 'It started on paper.',
    text: 'The first designing I remember is making custom environments for my Micro Machines on notebook paper with markers. Then I watched my dad design our house in AutoCAD, and I’d draw floor plans and elevations on grid paper.',
  },
  {
    when: '2010',
    title: 'A $100 logo.',
    text: 'My first ever client was Chris Ducker. He needed a logo for his blog and I only charged $100. Through college I wrote for a blog about blogging, launched a design blog and a college tips blog, and had an opinion column in the Iowa State Daily.',
  },
  {
    when: '2012',
    title: 'Apple Retail.',
    text: 'For six years I worked directly with customers, and loved to surprise and delight them. It’s why I’d still rather have customers than clients.',
  },
  {
    when: '2018',
    title: 'Designing a church.',
    text: 'I led experience design at my then church: the physical spaces, the screens and our digital properties. Months before the world shut down I learned Webflow and redesigned the site, with a “Chat with a Pastor” service anyone could book as soon as the same day. It got the attention of Hillsong Church.',
  },
  {
    when: '2020',
    title: 'Out on my own.',
    text: 'That June I left to start my own business for the first time: an LLC, the connections I had, and slowly, work. Things weren’t great, but I got by.',
  },
  {
    when: '2022',
    title: 'Sites, and apps.',
    text: 'I went full-time freelancing in Webflow, first with One Branding (GoGuardian, IGN), now as the website design/dev with Kem Design. On the side, Testament Made: apps with customers of their own, starting with Harvous.',
  },
];

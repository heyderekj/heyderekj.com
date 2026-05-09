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
      "Things weren't great, but from June till March I was able to get by. In late March I would work at a local creative agency to focus on making Webflow websites. This would last less than 30 days as my personal life quickly fell apart and needed to regroup.",
    ],
  },
  {
    heading: 'The latest',
    paragraphs: [
      "Fast forward to October 2022 when I was able to go full-time as a freelancer for a different local creative agency (One Branding) focused again on Webflow. They've worked with Yelp and so far I've had the opportunity to work with GoGuardian, IGN, and many others.",
      "While contracting full-time, I have focused more on my design skills in Figma where I'm the Lead UI/UX Designer at said agency. We have a small, nimble team. Outside of the agency I take on my own clients from time-to-time where I focus on a content-first approach to designing and developing websites. I'm also a Webflow Expert with Kem Design Co., supporting the team on website builds.",
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
};

export const testimonials: Testimonial[] = [
  {
    quote: "Derek helped me revamp Scenery's brand, logo, and website in the first two months of my tenure and was a crucial, fun partner to work with throughout the process. Derek had a well defined process, integrated into the team well, and came up with creative approaches when they were most needed — at both the start and finish of the project. Thank you Derek!",
    author: 'Barrett Johnson',
    role: 'Product & Marketing at Mercury',
    context: "Barrett was Derek's client · Nov 2023",
  },
  {
    quote: 'I highly recommend Derek Jensen for his exceptional skills in User Interface (UI) design and Webflow Development. Derek\'s creative approach to UI consistently delivers visually exceptional and user-friendly interfaces that drives results. His proficiency in Webflow empowers him to bring his designs to life with seamless functionality and responsiveness. Derek\'s attention to detail, collaborative nature, and commitment to staying current with design trends makes him a valuable asset to any project.',
    author: 'Danny Begnoche',
    role: 'Award winning branding and Webflow sites · webflow.com/@onebranding',
    context: 'Danny worked with Derek on the same team · Aug 2023',
  },
  {
    quote: 'Derek is an incredibly talented Designer and Webflow Developer with a unique drive to always seek out the best solution and learn new things along the way.',
    author: 'Corey Moen',
    role: 'Lead Brand Designer and Web Developer',
    context: "Corey was Derek's mentor · Apr 2023",
  },
];

export const aboutExperienceGroups: AboutExpGroup[] = [
  {
    title: 'Current',
    items: [
      {
        name: 'Derek J Design',
        range: 'Jun 2020 — Present',
        description:
          'Freelance web designer partnering with clients and teams to make websites in Webflow.',
      },
      {
        name: 'Jamm Designs',
        range: 'Jan 2025 — Present',
        description:
          'Senior Web Designer (Freelance), designing websites and developing them in Webflow one update at a time.',
        link: { label: 'jamm.co', href: 'https://jamm.co', icon: 'arrow' },
      },
      {
        name: 'Kem Design Co.',
        range: 'May 2024 — Present',
        description: 'Webflow Expert assisting the team when it comes to making websites.',
        link: { label: 'kemdesign.co', href: 'https://kemdesign.co', icon: 'arrow' },
      },
    ],
  },
  {
    title: 'Past experience',
    items: [
      {
        name: 'Apollos',
        range: 'Jun 2024 — Sep 2025',
        description:
          'Partnered with the Apollos web team to design and develop Webflow websites for churches.',
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

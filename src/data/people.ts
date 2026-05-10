/** Content for `/people/`. Edit here; layout lives in `src/pages/people/index.astro`. */

export type Person = {
  name: string;
  handle: string;
  xUrl: string;
  tagline: string;
  met?: boolean;
  /** No longer living — show tribute styling instead of meet/checkbox UI */
  remembered?: boolean;
};

export const peopleMeta = {
  title: "People I'd like to meet — Derek Castelli",
  description: "A running list of people Derek hopes to high-five IRL.",
};

export const people: Person[] = [
  { name: 'Aaron Francis',  handle: '@aarondfrancis', xUrl: 'https://x.com/aarondfrancis', tagline: 'Developer, educator, sincere poster' },
  { name: 'Carlos Sainz',   handle: '@Carlossainz55', xUrl: 'https://x.com/Carlossainz55', tagline: 'Formula 1 driver' },
  { name: 'Drew Wilson',    handle: '@drewwilson',    xUrl: 'https://x.com/drewwilson',    tagline: 'Designer, maker, entrepreneur' },
  { name: 'Franz von Holzhausen', handle: '@woodhaus2', xUrl: 'https://x.com/woodhaus2', tagline: 'Chief designer, Tesla' },
  { name: 'Gary Vaynerchuk', handle: '@garyvee',      xUrl: 'https://x.com/garyvee',       tagline: 'Entrepreneur, author, VaynerMedia', met: true },
  { name: 'Guy Beahm',      handle: '@GuyBeahm',      xUrl: 'https://x.com/GuyBeahm',      tagline: 'The two-time · streamer · Dr Disrespect' },
  { name: 'Jared Erickson', handle: '@alliswell',     xUrl: 'https://x.com/alliswell',     tagline: 'Head of design at Switchyards' },
  { name: 'Jason Fried',    handle: '@jasonfried',    xUrl: 'https://x.com/jasonfried',    tagline: 'Started and runs 37signals' },
  { name: 'Jeff Sheldon',   handle: '@ugmonk',        xUrl: 'https://x.com/ugmonk',        tagline: 'Founder & designer of Ugmonk' },
  { name: 'Josh Pigford',   handle: '@Shpigford',     xUrl: 'https://x.com/Shpigford',     tagline: 'Maker. Can\'t stop starting things.' },
  {
    name: 'Michael Jackson',
    handle: '1958–2009',
    xUrl: 'https://en.wikipedia.org/wiki/Michael_Jackson',
    tagline: 'Singer, dancer, King of Pop',
    remembered: true,
  },
  {
    name: 'Robin Williams',
    handle: '1951–2014',
    xUrl: 'https://en.wikipedia.org/wiki/Robin_Williams',
    tagline: 'Actor, comedian, singular talent',
    remembered: true,
  },
  {
    name: 'Steve Jobs',
    handle: '1955–2011',
    xUrl: 'https://en.wikipedia.org/wiki/Steve_Jobs',
    tagline: 'Apple, Pixar, NeXT',
    remembered: true,
  },
];

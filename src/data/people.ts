/** Content for `/people/`. Edit here; layout lives in `src/pages/people/index.astro`. */

export type Person = {
  name: string;
  handle: string;
  xUrl: string;
  tagline: string;
  met?: boolean;
};

export const peopleMeta = {
  title: "People I'd like to meet — Derek Castelli",
  description: "A running list of people Derek hopes to high-five IRL.",
};

export const people: Person[] = [
  { name: 'Aaron Francis',  handle: '@aarondfrancis', xUrl: 'https://x.com/aarondfrancis', tagline: 'Developer, educator, sincere poster' },
  { name: 'Carlos Sainz',   handle: '@Carlossainz55', xUrl: 'https://x.com/Carlossainz55', tagline: 'Formula 1 driver' },
  { name: 'Coach Hoskees',  handle: '@CoachHoskees',  xUrl: 'https://x.com/CoachHoskees',  tagline: 'Content creator & streamer, T.I.E. Crew' },
  { name: 'Drew Wilson',    handle: '@drewwilson',    xUrl: 'https://x.com/drewwilson',    tagline: 'Designer, maker, entrepreneur' },
  { name: 'Franz von Holzhausen', handle: '@woodhaus2', xUrl: 'https://x.com/woodhaus2', tagline: 'Chief designer, Tesla' },
  { name: 'Gary Vaynerchuk', handle: '@garyvee',      xUrl: 'https://x.com/garyvee',       tagline: 'Entrepreneur, author, VaynerMedia', met: true },
  { name: 'Guy Beahm',      handle: '@DrDisrespect',  xUrl: 'https://x.com/DrDisrespect',  tagline: 'The two-time · streamer · Dr Disrespect' },
  { name: 'Jared Erickson', handle: '@alliswell',     xUrl: 'https://x.com/alliswell',     tagline: 'Head of design at Switchyards' },
  { name: 'Jared Erondu',   handle: '@erondu',        xUrl: 'https://x.com/erondu',        tagline: 'Design exec & advisor' },
  { name: 'Jason Fried',    handle: '@jasonfried',    xUrl: 'https://x.com/jasonfried',    tagline: 'Started and runs 37signals' },
  { name: 'Jeff Sheldon',   handle: '@ugmonk',        xUrl: 'https://x.com/ugmonk',        tagline: 'Founder & designer of Ugmonk' },
  { name: 'Josh Pigford',   handle: '@Shpigford',     xUrl: 'https://x.com/Shpigford',     tagline: 'Maker. Can\'t stop starting things.' },
  { name: 'Kevin Rose',     handle: '@kevinrose',     xUrl: 'https://x.com/kevinrose',     tagline: 'Angel investor, founder of Digg & Oak' },
  { name: 'Lee Robinson',   handle: '@leerob',        xUrl: 'https://x.com/leerob',        tagline: 'Teaching developers at Cursor, ex-Vercel' },
];

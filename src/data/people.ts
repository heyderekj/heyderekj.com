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
  { name: 'Cam Pak',        handle: '@CameronPak',    xUrl: 'https://x.com/CameronPak',    tagline: 'I play the keys so I can write the codes' },
  { name: 'Coach Hoskees',  handle: '@CoachHoskees',  xUrl: 'https://x.com/CoachHoskees',  tagline: 'Content creator & streamer, T.I.E. Crew' },
  { name: 'Ezekiel Rochat', handle: '@ezekielrochat', xUrl: 'https://x.com/ezekielrochat', tagline: 'Founder of ROCSHIP' },
  { name: 'Guy Beahm',      handle: '@DrDisrespect',  xUrl: 'https://x.com/DrDisrespect',  tagline: 'The two-time · streamer · Dr Disrespect' },
  { name: 'Jared Erickson', handle: '@alliswell',     xUrl: 'https://x.com/alliswell',     tagline: 'Head of design at Switchyards' },
  { name: 'Jason Fried',    handle: '@jasonfried',    xUrl: 'https://x.com/jasonfried',    tagline: 'Started and runs 37signals' },
  { name: 'Jeff Sheldon',   handle: '@ugmonk',        xUrl: 'https://x.com/ugmonk',        tagline: 'Founder & designer of Ugmonk' },
  { name: 'Josh Pigford',   handle: '@Shpigford',     xUrl: 'https://x.com/Shpigford',     tagline: 'Maker. Can\'t stop starting things.' },
  { name: 'Lee Robinson',   handle: '@leerob',        xUrl: 'https://x.com/leerob',        tagline: 'Teaching developers at Cursor, ex-Vercel' },
  { name: 'Micky',          handle: '@Rasmic',        xUrl: 'https://x.com/Rasmic',        tagline: 'Full stack engineer & YouTuber' },
  { name: 'Ridd',           handle: '@ridd_design',   xUrl: 'https://x.com/ridd_design',   tagline: 'Building Inflight · designer' },
];

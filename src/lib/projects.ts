import { Cog, Gamepad2, Rocket, Code2, ImageDown } from 'lucide-astro';

export interface Project {
  title: string;
  url: string;
  /** One or two sentences. Rendered as HTML, so inline links are allowed. */
  description?: string;
  /** 16:9 image under public/, e.g. '/images/projects/foo.webp'. Falls back to the icon. */
  image?: string;
  /** Optional variant shown instead of `image` when the site is in light mode. */
  imageLight?: string;
  /** Alt text for the image. Leave empty if the image is purely decorative. */
  imageAlt?: string;
  /** Fallback shown when there's no image. */
  icon: typeof Cog;
}

// Order here is the order on the page.
export const PROJECTS: Project[] = [
  {
    title: 'Doodle Engine',
    url: 'https://doodleengine.dev',
    description:
      'A renderer-agnostic TypeScript engine for narrative games and RPGs. Dialogue, quests, and conditions are written in a custom scripting language, with a React renderer and visual editor included.',
    image: '/images/projects/doodle-engine-dark.webp',
    imageLight: '/images/projects/doodle-engine-light.webp',
    imageAlt: 'The Doodle Studio editor',
    icon: Cog,
  },
  {
    title: 'Starglyphs',
    url: 'https://starglyphs.com',
    description:
      'An Euler path puzzle game on Steam with procedurally generated, always-solvable puzzles. iOS and Android versions are coming soon, and you can <a href="https://starglyphs.com" target="_blank" rel="noopener noreferrer">try it on the web</a>.',
    image: '/images/projects/starglyphs.webp',
    imageAlt: 'The Starglyphs logo above a glowing purple constellation',
    icon: Gamepad2,
  },
  {
    title: 'Second Star',
    url: 'https://secondstargame.com',
    description:
      'A fully voiced first-person sci-fi narrative adventure, built with a very talented team of devs. I was creative director and composed the score. Development has ended, but a public demo is available!',
    image: '/images/projects/second-star.webp',
    imageAlt: 'The Second Star logo over a starfield',
    icon: Rocket,
  },
  {
    title: 'Galactic Color Match',
    url: 'https://galacticcolormatch.com',
    description:
      'A solo-made arcade game for iOS and Android about matching colors in space.',
    image: '/images/projects/galactic-color-match.webp',
    imageAlt:
      'The Galactic Color Match title over a starfield and five colored circles',
    icon: Gamepad2,
  },
  {
    title: 'Pixel Converter',
    url: 'https://pixel-converter.app',
    description: 'A fast, offline image converter for macOS and Windows.',
    image: '/images/projects/pixel-converter.webp',
    imageAlt: 'The Pixel Converter app icon',
    icon: ImageDown,
  },
  {
    title: 'Infinity Engine Modding',
    url: 'https://gibberlings3.net',
    description:
      'Where it all started! I made mods for the Infinity Engine games, like Baldur’s Gate and Planescape: Torment, and currently co-maintain the Gibberlings3 community.',
    image: '/images/projects/gibberlings3.webp',
    imageAlt: 'The Gibberlings3 Infinity Engine modding community logo',
    icon: Code2,
  },
];

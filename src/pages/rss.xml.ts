import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import {
  getNoteRssDescription,
  getNoteUrl,
  getPublishedNotes,
} from '../lib/notes';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL('https://katbella.com');
  const notes = await getPublishedNotes();

  return rss({
    title: 'Kat Bella Notes',
    description: 'Notes by Kat Bella.',
    site: baseUrl,
    trailingSlash: false,
    customData: '<language>en-us</language>',
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.publishedAt,
      description: getNoteRssDescription(note),
      link: getNoteUrl(note),
    })),
  });
};

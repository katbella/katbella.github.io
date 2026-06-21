import { getCollection, type CollectionEntry } from 'astro:content';
import { assertKnownTopic } from './taxonomy';

export type NoteEntry = CollectionEntry<'notes'>;

export function getNoteUrl(note: Pick<NoteEntry, 'id'>): string {
  return `/notes/${note.id}`;
}

export function formatNoteDate(date: Date): string {
  return date.toLocaleDateString('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export async function getAllNotes(): Promise<NoteEntry[]> {
  const notes = await getCollection('notes');
  assertUniqueNoteSlugs(notes);

  return notes.sort((a, b) => {
    const dateSort =
      b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
    return dateSort || a.data.title.localeCompare(b.data.title);
  });
}

export async function getPublishedNotes(): Promise<NoteEntry[]> {
  return (await getAllNotes()).filter((note) => !note.data.draft);
}

export function getNotesForTopic(
  notes: NoteEntry[],
  topicSlug: string,
): NoteEntry[] {
  assertKnownTopic(topicSlug);
  return notes.filter((note) => note.data.topics.includes(topicSlug));
}

export function getNoteRssDescription(note: NoteEntry): string {
  return markdownToPlainText(note.body ?? '');
}

function assertUniqueNoteSlugs(notes: NoteEntry[]): void {
  const seen = new Map<string, NoteEntry>();

  for (const note of notes) {
    const existing = seen.get(note.id);
    if (existing) {
      throw new Error(
        `Duplicate note slug "${note.id}" in ${existing.id} and ${note.id}.`,
      );
    }
    seen.set(note.id, note);
  }
}

function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

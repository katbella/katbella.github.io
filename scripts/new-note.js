#!/usr/bin/env node
// Create a new note: npm run new-note -- "My Title" [--topic music] [--images] [--publish]
// Run with no arguments for interactive prompts.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { TOPICS } from '../src/lib/taxonomy.ts';

const root = new URL('..', import.meta.url).pathname;
const notesDir = join(root, 'src/content/notes');
const stableSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const topicSlugs = TOPICS.map((t) => t.slug);

const HELP = `Usage: npm run new-note -- [title] [options]

  title              Note title (prompted if omitted)
  -s, --slug <slug>  Custom slug (default: made from the title)
  -t, --topic <t>    Topic, repeatable or comma-separated (${topicSlugs.join(', ')})
  -d, --date <date>  Publish date, YYYY-MM-DD (default: today)
  -i, --images       Also create public/images/notes/<slug>/
  -p, --publish      Set draft: false (default is draft: true)
  -h, --help         Show this help
`;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function existingSlugs() {
  return new Set(
    readdirSync(notesDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const match = readFileSync(join(notesDir, f), 'utf8').match(
          /^slug:\s*(\S+)\s*$/m,
        );
        return match ? match[1] : f.replace(/\.md$/, '');
      }),
  );
}

function validateTopics(topics) {
  const bad = topics.filter((t) => !topicSlugs.includes(t));
  if (bad.length) {
    fail(
      `Unknown topic: ${bad.join(', ')}. Valid topics: ${topicSlugs.join(', ')}.\nAdd new ones in src/lib/taxonomy.ts first.`,
    );
  }
  return [...new Set(topics)];
}

function validateDate(date) {
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
    new Date(`${date}T00:00:00Z`).toISOString().startsWith(date);
  if (!valid) fail(`Invalid date "${date}". Use YYYY-MM-DD.`);
  return date;
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    slug: { type: 'string', short: 's' },
    topic: { type: 'string', short: 't', multiple: true },
    date: { type: 'string', short: 'd' },
    images: { type: 'boolean', short: 'i' },
    publish: { type: 'boolean', short: 'p' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

let title = positionals.join(' ').trim();
let topics = (values.topic ?? [])
  .flatMap((t) => t.split(','))
  .map((t) => t.trim())
  .filter(Boolean);
let images = values.images ?? false;
const interactive = !title;

if (interactive) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const lines = rl[Symbol.asyncIterator]();
  // Reads one line; works for typed input and piped input alike.
  const ask = async (prompt) => {
    process.stdout.write(prompt);
    const { value } = await lines.next();
    return value ?? '';
  };
  title = (await ask('Title: ')).trim();
  if (!title) {
    rl.close();
    fail('A title is required.');
  }
  if (!topics.length) {
    console.log('\nTopics:');
    TOPICS.forEach((t, i) => console.log(`  ${i + 1}. ${t.slug}`));
    const answer = (
      await ask(
        'Pick topics by number or name, comma-separated (enter for none): ',
      )
    ).trim();
    topics = answer
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
      .map((a) => (/^\d+$/.test(a) ? (topicSlugs[Number(a) - 1] ?? a) : a));
  }
  if (values.images === undefined) {
    images = /^y/i.test(
      (await ask('Create an images folder for this note? (y/N) ')).trim(),
    );
  }
  rl.close();
}

topics = validateTopics(topics);
const slug = values.slug ?? slugify(title);
const date = validateDate(values.date ?? today());
const draft = !values.publish;

if (!stableSlug.test(slug)) {
  fail(
    `Could not make a valid slug from "${title}" (got "${slug}"). Pass one with --slug.`,
  );
}
if (existingSlugs().has(slug))
  fail(`A note with the slug "${slug}" already exists.`);

const file = join(notesDir, `${slug}.md`);
if (existsSync(file)) fail(`${file} already exists.`);

const imageDir = join(root, 'public/images/notes', slug);
const imageHint = images
  ? `\n\n<!-- Images: put files in public/images/notes/${slug}/ and use ![alt text](/images/notes/${slug}/file.webp) -->`
  : '';

const frontmatter = [
  '---',
  `slug: ${slug}`,
  `title: ${JSON.stringify(title)}`,
  `publishedAt: ${date}`,
  topics.length
    ? `topics:\n${topics.map((t) => `  - ${t}`).join('\n')}`
    : 'topics: []',
  `draft: ${draft}`,
  '---',
].join('\n');

writeFileSync(file, `${frontmatter}\n\nWrite your note here.${imageHint}\n`);
if (images) {
  mkdirSync(imageDir, { recursive: true });
  writeFileSync(join(imageDir, '.gitkeep'), '');
}

console.log(`\nCreated ${file.replace(root, '')}`);
if (images) console.log(`Created ${imageDir.replace(root, '')}/`);
console.log(
  draft
    ? `It's a draft: visible in \`npm run dev\` at /notes/${slug}, hidden in production.`
    : `It's published (draft: false) and will go live on the next deploy.`,
);

export const TOPICS = [
  { slug: 'projects', label: 'Projects' },
  { slug: 'music', label: 'Music' },
] as const;

export type Topic = (typeof TOPICS)[number];
export type TopicSlug = Topic['slug'];

export const topicSlugValues = TOPICS.map((topic) => topic.slug) as [
  TopicSlug,
  ...TopicSlug[],
];

const topicsBySlug = new Map(TOPICS.map((topic) => [topic.slug, topic]));

export function getTopicBySlug(slug: string): Topic | undefined {
  return topicsBySlug.get(slug as TopicSlug);
}

export function assertKnownTopic(slug: string): asserts slug is TopicSlug {
  if (!getTopicBySlug(slug)) {
    throw new Error(
      `Unknown note topic "${slug}". Add it to src/lib/taxonomy.ts first.`,
    );
  }
}

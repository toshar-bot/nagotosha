import type { ConditionSummary, TopicCard } from '@/types/decision-home';

export const DEVELOPMENT_CONDITION_SUMMARY: ConditionSummary = {
  party: 'デート・ふたり',
  budget: '〜2,000円',
  mood: '新しい体験',
  area: '栄',
  updatedAt: '2026-07-25T00:00:00.000Z',
};

export const DEVELOPMENT_TOPIC_FIXTURES: readonly TopicCard[] = [
  {
    kind: 'event',
    id: 'demo-event',
    title: '開発確認用イベント',
    startsAt: '2026-08-01',
    image: { kind: 'none' },
    href: '#demo-event',
  },
  {
    kind: 'sponsored',
    id: 'demo-sponsored',
    title: '開発確認用タイアップ',
    advertiserName: '開発確認用',
    disclosure: 'PR',
    image: { kind: 'none' },
    href: '#demo-sponsored',
  },
  {
    kind: 'ticket',
    id: 'demo-ticket',
    title: '開発確認用チケット',
    affiliateDisclosure: 'アフィリエイトリンクを含みます',
    image: { kind: 'none' },
    href: '#demo-ticket',
  },
] as const;

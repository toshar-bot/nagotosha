'use client';

import type { TopicCard as TopicCardData } from '@/types/decision-home';
import styles from './home-functional.module.css';

const KIND_LABEL: Record<TopicCardData['kind'], string> = {
  'new-store': 'NEW',
  event: 'EVENT',
  feature: 'FEATURE',
  sponsored: 'PR',
  ticket: 'TICKET',
};

type TopicCardProps = {
  readonly topic: TopicCardData;
  readonly onOpen: () => void;
};

export default function TopicCard({ topic, onOpen }: TopicCardProps) {
  const disclosure =
    topic.kind === 'sponsored'
      ? `${topic.disclosure}・${topic.advertiserName}`
      : topic.kind === 'ticket'
        ? topic.affiliateDisclosure
        : null;

  return (
    <a className={styles.topicCard} href={topic.href} onClick={onOpen}>
      <span className={styles.demoBadge}>DEMO</span>
      <span className={styles.topicKind}>{KIND_LABEL[topic.kind]}</span>
      <span className={styles.topicVisualNone}>画像権利未確認のため画像なし</span>
      <strong>{topic.title}</strong>
      {disclosure ? <small>{disclosure}</small> : null}
    </a>
  );
}

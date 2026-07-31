'use client';

import type { TopicCard as TopicCardData } from '@/types/decision-home';
import TopicCard from './TopicCard';
import styles from './home-functional.module.css';

type TrendingNagoyaSectionProps = {
  readonly topics: readonly TopicCardData[];
  readonly onTopicClick: (topic: TopicCardData) => void;
};

export default function TrendingNagoyaSection({ topics, onTopicClick }: TrendingNagoyaSectionProps) {
  return (
    <section className={styles.trending} aria-labelledby="home-pickup-title">
      <div className={styles.trendingHeading}>
        <span aria-hidden="true" className={styles.headingBar} />
        <h2 id="home-pickup-title">ピックアップ</h2>
      </div>
      {topics.length === 0 ? (
        <div className={styles.topicEmpty}>
          <strong>名古屋の新着を準備中</strong>
          <span>確認できた情報から順にお届けします</span>
        </div>
      ) : (
        <div className={styles.topicRail}>
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onOpen={() => onTopicClick(topic)} />
          ))}
        </div>
      )}
    </section>
  );
}

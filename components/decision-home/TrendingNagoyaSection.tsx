import Link from 'next/link';
import styles from './home-functional.module.css';

const INFORMATION_LINKS = [
  {
    href: '/event',
    label: 'EVENT',
    title: '今日・今週末のイベント',
    description: '開催日と公式情報から探す',
  },
  {
    href: '/new',
    label: 'ARTICLE',
    title: '新着記事を読む',
    description: '新店・グルメ・おでかけ情報',
  },
  {
    href: '/area',
    label: 'AREA',
    title: 'エリアから探す',
    description: '栄・名駅・大須などから見る',
  },
] as const;

export default function TrendingNagoyaSection() {
  return (
    <section className={styles.trending} aria-labelledby="home-information-title">
      <div className={styles.trendingHeading}>
        <span aria-hidden="true" className={styles.headingBar} />
        <h2 id="home-information-title">名古屋の今を見る</h2>
      </div>
      <div className={styles.informationLinkList}>
        {INFORMATION_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className={styles.informationLink}>
            <span className={styles.informationLinkLabel} aria-hidden="true">{item.label}</span>
            <span className={styles.informationLinkContent}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
            <span className={styles.informationLinkArrow} aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

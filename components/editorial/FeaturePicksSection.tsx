import type { FeaturePick } from '@/lib/article-experience';
import styles from './editorial-article.module.css';

type FeaturePicksSectionProps = {
  picks: FeaturePick[];
};

export function FeaturePicksSection({ picks }: FeaturePicksSectionProps) {
  if (picks.length === 0) return null;

  return (
    <section className={styles.structuredSection} aria-labelledby="feature-picks-title">
      <div className={styles.structuredHeading}>
        <p>PICKS</p>
        <h2 id="feature-picks-title">最初に押さえる3候補</h2>
      </div>

      <ol className={styles.pickList}>
        {picks.map((pick, index) => (
          <li key={pick.name} className={styles.pickCard}>
            {pick.imageUrl ? (
              <figure className={styles.pickImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pick.imageUrl} alt={pick.imageAlt ?? ''} />
                <span aria-label={`編集順 ${String(index + 1).padStart(2, '0')}`}>{String(index + 1).padStart(2, '0')}</span>
              </figure>
            ) : (
              <span className={styles.pickNumber} aria-label={`編集順 ${String(index + 1).padStart(2, '0')}`}>{String(index + 1).padStart(2, '0')}</span>
            )}
            <div className={styles.pickBody}>
              <span className={styles.areaChip}>{pick.area}</span>
              <h3>{pick.name}</h3>
              <p>{pick.description}</p>
              {pick.imageCredit && <small>画像出典: {pick.imageCredit}</small>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

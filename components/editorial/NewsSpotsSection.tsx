import type { NewsSpot } from '@/lib/article-experience';
import styles from './editorial-article.module.css';

type NewsSpotsSectionProps = {
  spots: NewsSpot[];
  onMapClick?: () => void;
};

export function NewsSpotsSection({ spots, onMapClick }: NewsSpotsSectionProps) {
  if (spots.length === 0) return null;

  return (
    <section id="news-spots" className={styles.structuredSection} aria-labelledby="news-spots-title">
      <div className={styles.structuredHeading}>
        <p>SPOTS</p>
        <h2 id="news-spots-title">掲載スポット</h2>
      </div>

      <ol className={styles.newsSpotList}>
        {spots.map((spot) => (
          <li key={spot.name} className={`${styles.newsSpotCard}${spot.imageUrl ? ` ${styles.newsSpotCardWithImage}` : ''}`}>
            {spot.imageUrl && (
              // External editorial images are verified source URLs; Next Image would require a global remote-image config change.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.newsSpotImage}
                src={spot.imageUrl}
                alt={spot.imageAlt}
              />
            )}
            <div className={styles.newsSpotBody}>
              <div className={styles.newsSpotTitleRow}>
                <span className={styles.areaChip}>{spot.area}</span>
                <span className={styles.genreChip}>{spot.genre}</span>
                <h3>{spot.name}</h3>
              </div>
              <p>{spot.summary}</p>
              {(spot.officialUrl || spot.mapUrl) && (
                <div className={styles.newsSpotActions}>
                  {spot.officialUrl && <a href={spot.officialUrl} target="_blank" rel="noopener noreferrer">公式情報 <span aria-hidden="true">↗</span></a>}
                  {spot.mapUrl && <a href={spot.mapUrl} target="_blank" rel="noopener noreferrer" onClick={onMapClick}>Google Maps <span aria-hidden="true">↗</span></a>}
                </div>
              )}
              <small>
                出典: {spot.source}
                {spot.imageCredit && <>／{spot.imageCredit}</>}
              </small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

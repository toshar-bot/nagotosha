import type { FeatureVenue } from '@/lib/article-experience';
import styles from './editorial-article.module.css';

type VenueListSectionProps = {
  venues: FeatureVenue[];
  onMapClick?: () => void;
};

export function VenueListSection({ venues, onMapClick }: VenueListSectionProps) {
  if (venues.length === 0) return null;

  return (
    <section id="feature-venues" className={styles.structuredSection} aria-labelledby="feature-venues-title">
      <div className={styles.structuredHeading}>
        <p>VENUES</p>
        <h2 id="feature-venues-title">各会場詳細</h2>
      </div>

      <ol className={styles.venueList}>
        {venues.map((venue) => (
          <li key={venue.name} className={styles.venueCard}>
            <div className={styles.venueTitleRow}>
              <span className={styles.areaChip}>{venue.area}</span>
              <h3>{venue.name}</h3>
            </div>
            <p>{venue.feature}</p>
            {(venue.officialUrl || venue.mapUrl) && (
              <div className={styles.venueActions}>
                {venue.officialUrl && <a href={venue.officialUrl} target="_blank" rel="noopener noreferrer">公式情報 <span aria-hidden="true">↗</span></a>}
                {venue.mapUrl && <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" onClick={onMapClick}>Google Maps <span aria-hidden="true">↗</span></a>}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

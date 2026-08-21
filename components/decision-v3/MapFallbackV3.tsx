import styles from './decision-v3.module.css';

export function MapFallbackV3({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`${styles.mapFallbackArtwork} ${compact ? styles.mapFallbackArtworkCompact : ''}`}
      role="status"
    >
      {/* This pack asset is explicitly a truthful fallback, not a map. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/decision/v3/maps/map-fallback.webp"
        alt=""
        aria-hidden="true"
        width={1200}
        height={700}
        decoding="async"
      />
      <span className={styles.srOnly}>
        地図素材を読み込めませんでした。エリアは下のボタンから選べます。
      </span>
    </div>
  );
}

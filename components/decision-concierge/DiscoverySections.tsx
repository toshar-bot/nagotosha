import Image from 'next/image';
import Link from 'next/link';
import type { HomeNewOpenStore } from '@/lib/home-new-open';
import { isVerifiedImageDisplayable } from '@/lib/decision-safety';
import type { PreviewEditorialArticle, PreviewSeasonalGuide } from '@/data/decision-preview';
import styles from './decision-concierge.module.css';

export function EmptyRecommendation() {
  return (
    <section id="recommendation-status" className={styles.emptyStage} aria-labelledby="empty-title">
      <p className={styles.eyebrow}>YOUR NEXT IDEA</p>
      <h2 id="empty-title">あなた向けの提案を準備しています</h2>
      <p>候補データがそろうまで、<br />イベント・特集・新店から名古屋を探せます。</p>
      <nav className={styles.emptyLinks} aria-label="ページ内の発見メニュー">
        <a href="#discover">注目イベント</a>
        <a href="#editorial">編集部の特集</a>
        <a href="#new-stores">新店を見る</a>
      </nav>
    </section>
  );
}

export function SeasonalGuideStage({ guide }: { guide: PreviewSeasonalGuide }) {
  const imageDisplayable = isVerifiedImageDisplayable(guide.image);

  return (
    <section id="discover" className={styles.eventStage} aria-labelledby="event-title">
      <figure className={styles.eventFigure}>
        <div className={styles.eventImageWrap}>
          {imageDisplayable ? (
            <Image src={guide.image.src} alt={guide.image.alt} fill sizes="(max-width: 448px) 100vw, 448px" className={styles.coverImage} />
          ) : (
            <div className={styles.imageBlocked}>画像権利を確認中</div>
          )}
        </div>
        {imageDisplayable && (
          <figcaption className={styles.eventPhotoCaption}>
            <span>{guide.image.caption}</span>
            <a href={guide.image.sourceUrl} target="_blank" rel="noreferrer">
              {guide.image.credit} / {guide.image.license}
            </a>
          </figcaption>
        )}
      </figure>
      <div className={styles.eventCopy}>
        <p className={styles.eventEyebrow}>SEASONAL GUIDE</p>
        {typeof guide.eventCount === 'number' && guide.eventCount > 0 && (
          <p className={styles.eventMeta}>{guide.eventCount}大会を比較</p>
        )}
        <h2 id="event-title">{guide.title}</h2>
        <p className={styles.eventDescription}>{guide.description}</p>
        <Link href={guide.articleUrl} className={styles.lightCta}>花火大会まとめを見る</Link>
      </div>
    </section>
  );
}

export function EditorialStage({ articles }: { articles: PreviewEditorialArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section id="editorial" className={styles.editorialStage} aria-labelledby="editorial-title">
      <div className={styles.stageIntro}>
        <p className={styles.eyebrow}>EDITORIAL NOTE</p>
        <h2 id="editorial-title">編集部の特集</h2>
        <p>名古屋で過ごす前に知っておきたい特集です。</p>
      </div>
      <ol className={styles.editorialList}>
        {articles.map((article, index) => (
          <li key={article.id}>
            <span className={styles.articleIndex}>{String(index + 1).padStart(2, '0')}</span>
            <div>
              {article.category && <p className={styles.categoryLabel}>{article.category}</p>}
              <h3>{article.title}</h3>
              {article.publishedAt && (
                <time className={styles.articlePublishDate} dateTime={article.publishedAt}>
                  公開 {formatPublishedDate(article.publishedAt)}
                </time>
              )}
              <Link href={article.href}>{article.ctaLabel}</Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function NewStoreStage({ stores }: { stores: HomeNewOpenStore[] }) {
  if (stores.length === 0) return null;

  return (
    <section id="new-stores" className={styles.newStoreStage} aria-labelledby="new-store-title">
      <div className={styles.scalePattern} aria-hidden="true" />
      <div className={styles.stageIntro}>
        <p className={styles.eyebrow}>VERIFIED NEW STORE</p>
        <h2 id="new-store-title">新しくオープンしたお店</h2>
        <p>開店日を確認できた、名古屋の新店を紹介します。</p>
      </div>
      <div className={styles.storeList}>
        {stores.map((store) => (
          <Link key={store.articleId} href={store.articleUrl} className={styles.storeRow}>
            <span className={styles.openBadge}>NEW OPEN</span>
            <time className={styles.openDate} dateTime={store.openingDate}>
              {formatOpeningDate(store.openingDate)} OPEN
            </time>
            <span className={styles.storeName}>{store.name}</span>
            <span className={styles.storePlace}>{store.placeLabel}</span>
            <span className={styles.rowArrow} aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function formatOpeningDate(date: string): string {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${Number(match[2])}/${Number(match[3])}` : date;
}

function formatPublishedDate(date: string): string {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${Number(match[2])}/${Number(match[3])}` : date;
}

import Image from 'next/image';
import Link from 'next/link';
import TosharMascot from '@/components/mascot/TosharMascot';
import ConditionPanel from './ConditionPanel';
import PreviewBottomNav from './PreviewBottomNav';
import {
  EditorialStage,
  EmptyRecommendation,
  NewStoreStage,
  SeasonalGuideStage,
} from './DiscoverySections';
import { DECISION_CANDIDATES, DECISION_MODES, PREVIEW_ASSET_AVAILABILITY } from '@/data/decision-candidates';
import { HERO_IMAGE, PREVIEW_EDITORIAL_ARTICLES, PREVIEW_SEASONAL_GUIDE } from '@/data/decision-preview';
import { resolveContentRelationship } from '@/lib/content-relationships';
import { getVerifiedHomeNewOpenStores } from '@/lib/home-new-open';
import { getDecisionModeAvailability, isSafeInternalUrl, isVerifiedImageDisplayable } from '@/lib/decision-safety';
import styles from './decision-concierge.module.css';

export default function DecisionHome() {
  const foodAvailability = getDecisionModeAvailability('food', DECISION_CANDIDATES);
  const modeAvailability = DECISION_MODES.map((mode) => getDecisionModeAvailability(mode, DECISION_CANDIDATES));
  const article214Relationship = resolveContentRelationship(PREVIEW_SEASONAL_GUIDE.articleId);
  const seasonalGuide = article214Relationship.relationship === 'editorial'
    && article214Relationship.displayableOnRedesignedSurfaces
    && isSafeInternalUrl(PREVIEW_SEASONAL_GUIDE.articleUrl)
    ? PREVIEW_SEASONAL_GUIDE
    : undefined;
  const editorialArticles = PREVIEW_EDITORIAL_ARTICLES.filter((article) => {
    const relationship = resolveContentRelationship(article.id);
    return (
      relationship.relationship === 'editorial'
      && relationship.displayableOnRedesignedSurfaces
      && isSafeInternalUrl(article.href)
    );
  }).slice(0, 3);
  const verifiedNewStores = getVerifiedHomeNewOpenStores().filter((store) => {
    const relationship = resolveContentRelationship(store.articleId);
    return (
      relationship.relationship === 'editorial'
      && relationship.displayableOnRedesignedSurfaces
      && isSafeInternalUrl(store.articleUrl)
    );
  });
  const heroImageDisplayable = isVerifiedImageDisplayable(HERO_IMAGE);

  return (
    <div id="top" className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="なごとしゃ本番ホームへ" className={styles.logoLink}>
          <Image src="/subjects/nagotosha-header-complete-tight.png" alt="なごとしゃ" width={1181} height={403} priority />
        </Link>
        <span className={styles.previewBadge}>PREVIEW 0.1</span>
      </header>

      <main>
        <section className={styles.heroStage} aria-labelledby="hero-title">
          <figure className={styles.heroFigure}>
            <div className={styles.heroCanvas}>
              <div className={styles.heroPhoto}>
                {heroImageDisplayable ? (
                  <Image src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} fill priority sizes="(max-width: 448px) 100vw, 448px" className={styles.coverImage} />
                ) : (
                  <div className={styles.imageBlocked}>Hero画像を確認中</div>
                )}
              </div>
              <div className={styles.heroPhotoWash} aria-hidden="true" />
              <div className={styles.heroCopy}>
                <p className={styles.heroEyebrow}>NAGOYA DECISION CONCIERGE</p>
                <h1 id="hero-title">
                  <span>今日は、</span>
                  <span><strong>名古屋</strong>で</span>
                  <span>どう過ごす？</span>
                </h1>
                <p>あなたの気分や条件に合う候補を、確認済み情報からご提案します。</p>
                <a href="#decision" className={styles.heroCta}>条件を選んでみる</a>
              </div>
              <TosharMascot
                pose="welcome"
                className={styles.heroMascot}
                priority
                sizes="(max-width: 340px) 86px, (min-width: 420px) 108px, 100px"
              />
            </div>
            {heroImageDisplayable && (
              <figcaption className={styles.heroPhotoCaption}>
                <span>{HERO_IMAGE.caption}</span>
                <a href={HERO_IMAGE.sourceUrl} target="_blank" rel="noreferrer">
                  {HERO_IMAGE.credit} / {HERO_IMAGE.license}
                </a>
              </figcaption>
            )}
          </figure>
        </section>

        <ConditionPanel foodAvailability={foodAvailability} />
        <EmptyRecommendation />
        {seasonalGuide && <SeasonalGuideStage guide={seasonalGuide} />}
        <EditorialStage articles={editorialArticles} />
        <NewStoreStage stores={verifiedNewStores} />
      </main>

      <footer id="footer" className={styles.footer}>
        <p className={styles.footerEyebrow}>NAGOTOSHA</p>
        <h2>名古屋で、次に何をするか決められる場所へ。</h2>
        <div className={styles.footerLinks}>
          <Link href="/privacy">プライバシー</Link>
          <Link href="/terms">利用規約</Link>
          <Link href="/partner">掲載相談</Link>
        </div>
        <small>© 2026 なごとしゃ</small>
        <details className={styles.footerPreviewDetails}>
          <summary>Preview技術情報</summary>
          <ul>
            <li>候補registry: {DECISION_CANDIDATES.length}件</li>
            {modeAvailability.map((availability) => (
              <li key={availability.mode}>
                {availability.mode}: {availability.candidateCount}件 / 公開基準 {availability.minimumCandidateCount}件
              </li>
            ))}
            <li>写真権利・relationship・確認日が揃わない候補は非表示</li>
            <li>mascotAssetAvailable: {String(PREVIEW_ASSET_AVAILABILITY.mascotAssetAvailable)}</li>
          </ul>
        </details>
      </footer>
      <PreviewBottomNav />
    </div>
  );
}

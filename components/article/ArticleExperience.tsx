'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { isSaved, toggleSavedItem } from '@/lib/saved';
import type { ArticleExperienceData, ArticleSpot, ArticleCard, ArticleRelated } from '@/lib/article-experience';

/* ── Global CSS ── */
const GLOBAL_CSS = `
  .exp-scroll::-webkit-scrollbar { display: none; }
  .exp-scroll { scrollbar-width: none; -webkit-overflow-scrolling: touch; }

  .exp-body { color: #374151; font-size: 15px; line-height: 1.9; word-break: normal; overflow-wrap: anywhere; }
  .exp-body p { margin: 0 0 1.15em; }
  .exp-body h2 {
    font-size: 19px; font-weight: 900; color: #071A4D;
    margin: 1.8em 0 0.65em;
    padding-left: 13px;
    border-left: 4px solid #E8483F;
    line-height: 1.4;
  }
  .exp-body h3 { font-size: 16px; font-weight: 900; color: #071A4D; margin: 1.4em 0 0.55em; }
  .exp-body ul, .exp-body ol { padding-left: 1.5em; margin: 0 0 1.15em; }
  .exp-body li { margin-bottom: 0.4em; }
  .exp-body a { color: #E8483F; text-decoration: underline; }
  .exp-body strong { font-weight: 900; color: #071A4D; }
  .exp-body img { max-width: 100%; height: auto; border-radius: 12px; margin: 0.8em 0; display: block; }
  .exp-body blockquote { border-left: 3px solid #E8483F; padding-left: 1em; margin: 1em 0; color: #667085; }
  .exp-body table { width: 100%; max-width: 100%; border-collapse: collapse; font-size: 14px; overflow-x: auto; display: block; }
  .exp-body th { background: #071A4D; color: #fff; font-weight: 700; padding: 9px 11px; text-align: left; white-space: nowrap; }
  .exp-body td { padding: 9px 11px; border-bottom: 1px solid #E6ECF5; vertical-align: top; }
  .exp-body figure { margin: 1em 0; }
  .exp-body figcaption { font-size: 12px; color: #9BA3B0; margin-top: 0.3em; text-align: center; }
`;

/* ── Types ── */
type Props = {
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  area?: string;
  tag: string;
  mapUrl?: string;
  officialUrl?: string;
  storeName?: string;
  address?: string;
  dateStr: string;
  articleId: string;
  postId: number;
  postLink: string;
  saveCount: number;
  experience?: ArticleExperienceData;
};

const BADGE_STYLES = [
  { background: '#071A4D', color: '#fff' },
  { background: '#E8483F', color: '#fff' },
  { background: 'linear-gradient(135deg, #F8C861 0%, #DAB559 100%)', color: '#5C3A00' },
];

const CARD_TONES: Record<ArticleCard['tone'], { bg: string; border: string; label: string; num: string }> = {
  green:  { bg: '#EAF7EE', border: '#A8D8B0', label: '#1D6B3B', num: '#2E9E58' },
  yellow: { bg: '#FFFBEA', border: '#F3D06B', label: '#7A5200', num: '#C8870A' },
  red:    { bg: '#FFF0EE', border: '#F5BFBB', label: '#B33326', num: '#E8483F' },
  blue:   { bg: '#EEF3FF', border: '#B4C8F0', label: '#1A3A7A', num: '#2B5FD9' },
};

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
export function ArticleExperience({
  title, excerpt, content, imageUrl, imageCredit, imageSourceUrl,
  area, tag, mapUrl, officialUrl, storeName, address, dateStr,
  articleId, postId, postLink, saveCount, experience,
}: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSaved(isSaved(articleId)); }, [articleId]);

  const handleSave = useCallback(() => {
    const result = toggleSavedItem({
      id: articleId, type: 'article', title,
      area: area ?? undefined, imageUrl: imageUrl ?? undefined,
      articleUrl: `/article/${postId}`, mapUrl: mapUrl ?? undefined,
    });
    setSaved(result.saved);
  }, [articleId, title, area, imageUrl, postId, mapUrl]);

  const scrollToTop = useCallback(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title, url: window.location.href }); } catch { /* dismissed */ }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try { await navigator.clipboard.writeText(window.location.href); } catch { /* ignore */ }
    }
  }, [title]);

  const effectiveMapUrl    = mapUrl ?? experience?.mapUrl;
  const effectiveOfficialUrl = officialUrl ?? experience?.officialUrl;
  const badges             = experience?.badges ?? (area ? [area, tag] : [tag]);
  const quickPoints        = experience?.quickPoints ?? [];
  const spots              = experience?.spots ?? [];
  const cards              = experience?.cards ?? [];
  const recommendedFor     = experience?.recommendedFor ?? [];
  const related            = experience?.related ?? [];
  const formattedSaveCount = saveCount.toLocaleString('ja-JP');

  return (
    <div style={{ background: 'linear-gradient(180deg, #fffaf2 0%, #fff8e8 40%, #fff9f0 70%, #ffffff 100%)', minHeight: '100dvh', paddingBottom: 120 }}>
      <style>{GLOBAL_CSS}</style>

      {/* ══════════════════════════════════════════
          ヘッダー
      ══════════════════════════════════════════ */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid rgba(7,26,77,0.07)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 2px 10px rgba(7,26,77,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px' }}>
          <Link href="/" aria-label="なごとしゃ ホーム" style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/subjects/nagotosha-header-complete-tight.png"
              alt="名古屋情報局なごとしゃ"
              style={{ height: 48, maxWidth: 240, objectFit: 'contain', objectPosition: 'left center', display: 'block' }}
            />
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NavIconBtn label="検索" href="/new"><SearchIcon /></NavIconBtn>
            {effectiveMapUrl && <NavIconBtn label="地図" href={effectiveMapUrl} external><MapIcon /></NavIconBtn>}
            <NavIconBtn label="メニュー" href="/"><MenuIcon /></NavIconBtn>
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          タイトルカード（インパクト重視）
      ══════════════════════════════════════════ */}
      <div style={{ padding: '18px 14px 0' }}>
        <div style={{
          background: '#fff',
          borderRadius: 28,
          padding: '22px 22px 20px',
          boxShadow: '0 12px 40px rgba(7,26,77,0.13), 0 2px 8px rgba(7,26,77,0.06)',
          border: '1px solid rgba(218,181,89,0.22)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 右上装飾 */}
          <div style={{
            position: 'absolute', top: -24, right: -24,
            width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,72,63,0.06) 0%, transparent 70%)',
          }} />

          {/* バッジ */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {badges.map((badge, i) => (
              <span key={badge} style={{
                padding: '5px 13px', borderRadius: 999,
                fontSize: 11, fontWeight: 900, letterSpacing: '0.08em',
                lineHeight: 1,
                ...BADGE_STYLES[Math.min(i, BADGE_STYLES.length - 1)],
              }}>
                {badge}
              </span>
            ))}
          </div>

          {/* タイトル */}
          <h1 style={{
            fontSize: 'clamp(30px, 9vw, 44px)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.04em',
            color: '#071A4D',
            wordBreak: 'normal',
            overflowWrap: 'anywhere',
            margin: 0,
          }}>
            {title}
          </h1>

          {/* 抜粋 */}
          {excerpt && (
            <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748B', lineHeight: 1.75, fontWeight: 500 }}>
              {excerpt}
            </p>
          )}

          {/* メタ行 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #E8483F 0%, #071A4D 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>N</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>名古屋情報局なごとしゃ</div>
                {dateStr && <div style={{ fontSize: 10, color: '#9BA3B0', marginTop: 1 }}>{dateStr} 更新</div>}
              </div>
            </div>
            {/* 保存数ピル — 常に赤ベース */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(232,72,63,0.09)',
              borderRadius: 999, padding: '5px 12px',
              border: '1px solid rgba(232,72,63,0.22)',
              flexShrink: 0,
            }}>
              <SmallBookmarkIcon filled={saved} />
              <span style={{ fontSize: 13, fontWeight: 900, color: '#E8483F', whiteSpace: 'nowrap' }}>
                {formattedSaveCount} 保存
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          アイキャッチ画像
      ══════════════════════════════════════════ */}
      <div style={{ margin: '14px 14px 0', borderRadius: 22, overflow: 'hidden', position: 'relative', boxShadow: '0 8px 30px rgba(7,26,77,0.12)' }}>
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              style={{ width: '100%', height: 'clamp(210px, 56vw, 360px)', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(7,26,77,0.35) 100%)' }} />
            <div style={{
              position: 'absolute', bottom: 12, right: 14,
              background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)',
              borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              1 / {Math.max(spots.length, 1)}
            </div>
            {/* 画像クレジット（将来用） */}
            {imageCredit && (
              <div style={{
                position: 'absolute', bottom: 12, left: 14,
                background: 'rgba(0,0,0,0.40)', borderRadius: 999,
                padding: '3px 9px', fontSize: 10, color: 'rgba(255,255,255,0.85)',
              }}>
                {imageSourceUrl
                  ? <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>画像出典：{imageCredit}</a>
                  : `画像出典：${imageCredit}`
                }
              </div>
            )}
          </>
        ) : (
          <div style={{
            height: 'clamp(180px, 52vw, 300px)',
            background: 'linear-gradient(135deg, #FFF8EE 0%, #FFF2E0 50%, #FFE8D6 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* 装飾円 */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(232,72,63,0.06)' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(7,26,77,0.04)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 200, height: 200, borderRadius: '50%', background: 'rgba(218,181,89,0.06)' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/subjects/nagotosha-header-complete-tight.png"
              alt=""
              aria-hidden
              style={{ height: 38, objectFit: 'contain', opacity: 0.18, position: 'relative', zIndex: 1 }}
            />
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#071A4D', opacity: 0.72, letterSpacing: '0.04em' }}>公式写真を確認中</p>
              <p style={{ margin: '5px 0 0', fontSize: 11, color: '#667085', fontWeight: 700 }}>掲載許可を確認できた写真から追加予定</p>
              <p style={{ margin: '7px auto 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, padding: '4px 10px', background: 'rgba(232,72,63,0.08)', color: '#E8483F', fontSize: 10, fontWeight: 900, letterSpacing: '0.04em' }}>なごとしゃ編集部が確認中</p>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          アクションバー
      ══════════════════════════════════════════ */}
      <div className="exp-scroll" style={{ display: 'flex', gap: 8, padding: '14px 14px 0', overflowX: 'auto' }}>
        {/* 保存 */}
        <button type="button" onClick={handleSave} aria-pressed={saved} style={{
          flex: '1 1 auto', minWidth: 88,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          height: 52, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: '#E8483F',
          color: '#fff', fontSize: 14, fontWeight: 900,
          boxShadow: '0 8px 22px rgba(232,72,63,0.42)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          flexShrink: 0, letterSpacing: '0.02em',
          opacity: saved ? 0.82 : 1,
        }}>
          <BookmarkIcon filled={saved} />
          {saved ? '保存済み' : '保存'}
        </button>

        {/* 地図を見る */}
        {effectiveMapUrl && (
          <a href={effectiveMapUrl} target="_blank" rel="noopener noreferrer" style={{
            flex: '1 1 auto', minWidth: 104,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 52, borderRadius: 999, textDecoration: 'none', flexShrink: 0,
            background: '#071A4D',
            color: '#fff', fontSize: 13, fontWeight: 900,
            boxShadow: '0 6px 18px rgba(7,26,77,0.28)',
          }}>
            <MapPinIcon color="#fff" />
            地図を見る
          </a>
        )}

        {/* 公式リンク */}
        {effectiveOfficialUrl && (
          <a href={effectiveOfficialUrl} target="_blank" rel="noopener noreferrer" style={{
            flex: '1 1 auto', minWidth: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 52, borderRadius: 999, textDecoration: 'none', flexShrink: 0,
            background: '#fff', border: '1.5px solid #E6ECF5',
            color: '#334155', fontSize: 13, fontWeight: 900,
            boxShadow: '0 2px 8px rgba(7,26,77,0.06)',
          }}>
            <LinkIcon />
            公式リンク
          </a>
        )}

        {/* シェア */}
        <button type="button" onClick={handleShare} aria-label="シェア" style={{
          width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #E6ECF5',
          background: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 2px 8px rgba(7,26,77,0.06)',
        }}>
          <ShareIcon />
        </button>
      </div>

      {/* ══════════════════════════════════════════
          30秒でわかるポイント
      ══════════════════════════════════════════ */}
      {quickPoints.length > 0 && (
        <div style={{ margin: '18px 14px 0' }}>
          <div style={{
            background: 'linear-gradient(160deg, #FFF3B0 0%, #FFF8D0 40%, #FFFDE8 100%)',
            border: '1.5px solid #EAC93A',
            borderRadius: 22,
            padding: '20px 20px 18px',
            boxShadow: '0 4px 20px rgba(234,201,58,0.22)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #F5C800 0%, #DAB559 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 3px 10px rgba(218,181,89,0.40)',
              }}>
                <ClockIcon />
              </div>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#3D2800', letterSpacing: '0.04em' }}>
                30秒でわかるポイント
              </span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {quickPoints.map((point) => (
                <li key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <StarBullet />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#3D2800', lineHeight: 1.65, flex: 1 }}>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          スポット横スクロール
      ══════════════════════════════════════════ */}
      {spots.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#071A4D' }}>
              {experience?.spotsLabel ?? 'スポット情報'}
            </span>
            <span style={{ fontSize: 12, color: '#E8483F', fontWeight: 800 }}>一覧を見る &rsaquo;</span>
          </div>
          <div className="exp-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 14px 10px' }}>
            {spots.map((spot) => <SpotCard key={spot.name} spot={spot} />)}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          予算別・シーン別カード
      ══════════════════════════════════════════ */}
      {cards.length > 0 && (
        <div style={{ margin: '20px 14px 0' }}>
          <p style={{ fontSize: 15, fontWeight: 900, color: '#071A4D', marginBottom: 12 }}>
            {experience?.cardsLabel ?? '選び方ガイド'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {cards.map((card, i) => <BudgetCard key={card.title} card={card} index={i} />)}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          インライン関連コンテンツ
      ══════════════════════════════════════════ */}
      {related.length > 0 && (
        <div style={{ margin: '20px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {related.slice(0, 2).map((rel) => <InlineRelatedCard key={rel.href} related={rel} />)}
        </div>
      )}

      {/* ══════════════════════════════════════════
          こんな人におすすめ
      ══════════════════════════════════════════ */}
      {recommendedFor.length > 0 && (
        <div style={{ margin: '20px 14px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 22,
            padding: '20px 20px', border: '1px solid #E6ECF5',
            boxShadow: '0 6px 22px rgba(7,26,77,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <CheckCircleIcon />
              <span style={{ fontSize: 15, fontWeight: 900, color: '#071A4D' }}>こんな人におすすめ</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {recommendedFor.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <CheckDot />
                  <span style={{ fontSize: 12, color: '#334155', fontWeight: 600, lineHeight: 1.6, flex: 1 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          店舗情報
      ══════════════════════════════════════════ */}
      {(storeName || address) && (
        <div style={{ margin: '16px 14px 0' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #E6ECF5' }}>
            {storeName && <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#071A4D' }}>{storeName}</p>}
            {address && <p style={{ margin: storeName ? '4px 0 0' : 0, fontSize: 12, color: '#667085', lineHeight: 1.65 }}>{address}</p>}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          公式写真・投稿プレースホルダー
      ══════════════════════════════════════════ */}
      <div style={{ margin: '24px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#071A4D' }}>みんなが保存＆シェア中</span>
          <span style={{ fontSize: 12, color: '#E8483F', fontWeight: 800 }}>もっと見る &rsaquo;</span>
        </div>
        <div className="exp-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[1, 2, 3, 4, 5].map((i) => <PhotoPlaceholder key={i} index={i} />)}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 11, color: '#9BA3B0', textAlign: 'center', fontWeight: 500 }}>
          掲載許可を確認できた写真から順次追加予定
        </p>
      </div>

      {/* ══════════════════════════════════════════
          関連記事
      ══════════════════════════════════════════ */}
      <div style={{ margin: '24px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#071A4D' }}>関連記事</span>
          <Link href="/new" style={{ fontSize: 12, color: '#E8483F', fontWeight: 800, textDecoration: 'none' }}>
            もっと見る &rsaquo;
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <RelatedCard href="/article/32" title="行列のできるマーラータン専門店が新栄にオープン" label="NEW OPEN" />
          <RelatedCard href="/article/39" title="JR名古屋タカシマヤ デリシャスコートがリニューアルオープン" label="名駅" />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          外部サイトで見る
      ══════════════════════════════════════════ */}
      <div style={{ margin: '16px 14px 0' }}>
        <a href={postLink} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', height: 50, borderRadius: 999,
          background: '#fff', border: '1.5px solid #E6ECF5', color: '#334155',
          textDecoration: 'none', fontSize: 13, fontWeight: 900,
          boxShadow: '0 2px 8px rgba(7,26,77,0.05)',
        }}>
          外部サイトで見る
          <ExternalIcon />
        </a>
      </div>

      {/* ══════════════════════════════════════════
          WordPress本文
      ══════════════════════════════════════════ */}
      {content && (
        <div style={{ margin: '24px 14px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 22,
            padding: '26px 20px', border: '1px solid rgba(7,26,77,0.05)',
            boxShadow: '0 6px 24px rgba(7,26,77,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F0F2F5' }}>
              <div style={{ width: 3, height: 18, borderRadius: 2, background: '#E8483F' }} />
              <p style={{ fontSize: 12, fontWeight: 800, color: '#9BA3B0', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                記事本文
              </p>
            </div>
            <div className="exp-body" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      )}

      {/* 新着一覧へ戻る */}
      <div style={{ margin: '20px 14px 8px' }}>
        <Link href="/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#E8483F', fontSize: 13, fontWeight: 900, textDecoration: 'none' }}>
          <ChevronLeftIcon />
          新着記事一覧へ戻る
        </Link>
      </div>

      {/* ══════════════════════════════════════════
          下部固定CTA
      ══════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -6px 24px rgba(7,26,77,0.12)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        <div style={{ display: 'flex', gap: 10, padding: '10px 14px' }}>
          {/* 保存する */}
          <button type="button" onClick={handleSave} aria-pressed={saved} style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
            height: 60, borderRadius: 18, border: 'none', cursor: 'pointer',
            background: '#E8483F', color: '#fff',
            boxShadow: '0 8px 24px rgba(232,72,63,0.40)',
            transition: 'opacity 0.15s',
            opacity: saved ? 0.82 : 1,
          }}>
            <BookmarkIcon filled={saved} />
            <span style={{ fontSize: 12, fontWeight: 900, marginTop: 2 }}>{saved ? '保存済み' : '保存する'}</span>
            <span style={{ fontSize: 10, opacity: 0.82, fontWeight: 600 }}>{formattedSaveCount}人が保存中</span>
          </button>

          {/* 地図を開く */}
          {effectiveMapUrl ? (
            <a href={effectiveMapUrl} target="_blank" rel="noopener noreferrer" style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
              height: 60, borderRadius: 18, textDecoration: 'none',
              background: '#071A4D', color: '#fff',
              boxShadow: '0 6px 20px rgba(7,26,77,0.30)',
            }}>
              <MapPinIcon color="#fff" />
              <span style={{ fontSize: 12, fontWeight: 900, marginTop: 2 }}>地図を開く</span>
              <span style={{ fontSize: 10, opacity: 0.75, fontWeight: 600 }}>近くの売り場をチェック</span>
            </a>
          ) : (
            <button type="button" onClick={scrollToTop} aria-label="上へ戻る" style={{
              width: 60, height: 60, borderRadius: 18, border: '1.5px solid #E6ECF5',
              background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <UpIcon />
            </button>
          )}

          {/* 上へ */}
          {effectiveMapUrl && (
            <button type="button" onClick={scrollToTop} aria-label="上へ戻る" style={{
              width: 60, height: 60, borderRadius: 18, border: '1.5px solid #E6ECF5',
              background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <UpIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */

function NavIconBtn({ label, href, external, children }: { label: string; href: string; external?: boolean; children: React.ReactNode }) {
  const style: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: '6px 9px', borderRadius: 12, color: '#334155',
    textDecoration: 'none', fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
  };
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={style} aria-label={label}>{children}<span>{label}</span></a>;
  }
  return <Link href={href} style={style} aria-label={label}>{children}<span>{label}</span></Link>;
}

function SpotCard({ spot }: { spot: ArticleSpot }) {
  return (
    <div style={{
      width: 188, flexShrink: 0,
      background: '#fff', borderRadius: 20,
      border: '1px solid #E6ECF5',
      boxShadow: '0 8px 24px rgba(7,26,77,0.09)',
      overflow: 'hidden',
    }}>
      {/* 画像枠 */}
      <div style={{
        height: 118,
        background: 'linear-gradient(135deg, #FFF8EE 0%, #EEF2FF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ fontSize: 11, color: '#C0C8D8', fontWeight: 600 }}>写真準備中</span>
        <div style={{
          position: 'absolute', top: 9, left: 10,
          background: '#071A4D', color: '#fff',
          fontSize: 9, fontWeight: 900, padding: '3px 9px', borderRadius: 999, letterSpacing: '0.06em',
        }}>{spot.area}</div>
      </div>
      {/* テキスト */}
      <div style={{ padding: '12px 13px 13px' }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#071A4D', lineHeight: 1.35 }}>{spot.name}</p>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#64748B', lineHeight: 1.65 }}>{spot.description}</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 11 }}>
          {spot.mapUrl && (
            <a href={spot.mapUrl} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, textAlign: 'center', padding: '6px 0',
              background: 'rgba(7,26,77,0.06)', border: '1px solid rgba(7,26,77,0.11)',
              borderRadius: 999, fontSize: 10, fontWeight: 900, color: '#071A4D', textDecoration: 'none',
            }}>地図</a>
          )}
          {spot.detailHref && (
            <Link href={spot.detailHref} style={{
              flex: 1, textAlign: 'center', padding: '6px 0',
              background: '#E8483F', borderRadius: 999,
              fontSize: 10, fontWeight: 900, color: '#fff', textDecoration: 'none',
            }}>詳細</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function BudgetCard({ card, index }: { card: ArticleCard; index: number }) {
  const tone = CARD_TONES[card.tone];
  return (
    <div style={{
      background: tone.bg, border: `1.5px solid ${tone.border}`,
      borderRadius: 18, padding: '16px 15px',
      boxShadow: '0 3px 12px rgba(7,26,77,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: tone.num, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{index + 1}</span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.08em', color: tone.label, opacity: 0.8 }}>{card.label}</span>
      </div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#071A4D', lineHeight: 1.3 }}>{card.title}</p>
      <p style={{ margin: '6px 0 0', fontSize: 11, color: '#334155', lineHeight: 1.65 }}>{card.description}</p>
    </div>
  );
}

function InlineRelatedCard({ related }: { related: ArticleRelated }) {
  return (
    <Link href={related.href} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: '#fff', borderRadius: 20,
      border: '1px solid #E6ECF5', padding: '14px 16px',
      textDecoration: 'none',
      boxShadow: '0 6px 18px rgba(7,26,77,0.08)',
    }}>
      <div style={{
        width: 74, height: 60, borderRadius: 13, flexShrink: 0,
        background: 'linear-gradient(135deg, #EEF2FF, #FFF0EF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 9, color: '#9BA3B0' }}>画像</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {related.label && (
          <span style={{
            display: 'inline-block', marginBottom: 5,
            fontSize: 9, fontWeight: 900, color: '#E8483F',
            background: 'rgba(232,72,63,0.09)', padding: '2px 8px', borderRadius: 999,
          }}>{related.label}</span>
        )}
        <p style={{
          margin: 0, fontSize: 13, fontWeight: 900, color: '#071A4D', lineHeight: 1.38,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{related.title}</p>
      </div>
      <ChevronRightIcon />
    </Link>
  );
}

function PhotoPlaceholder({ index }: { index: number }) {
  const hues = ['#FFF8EE', '#EEF2FF', '#FFF0EF', '#EAFAF0', '#FFF8EE'];
  return (
    <div style={{
      width: 106, height: 106, flexShrink: 0, borderRadius: 16,
      background: `linear-gradient(135deg, ${hues[index % hues.length]}, #F4F7FF)`,
      border: '1px solid #E6ECF5',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(7,26,77,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CameraIcon />
      </div>
      <span style={{ fontSize: 9, color: '#9BA3B0', fontWeight: 600 }}>確認中</span>
    </div>
  );
}

function RelatedCard({ href, title, label }: { href: string; title: string; label?: string }) {
  return (
    <Link href={href} style={{
      display: 'block', background: '#fff', borderRadius: 20,
      border: '1px solid #E6ECF5', overflow: 'hidden',
      textDecoration: 'none', boxShadow: '0 6px 18px rgba(7,26,77,0.08)',
    }}>
      <div style={{
        height: 84, background: 'linear-gradient(135deg, #EEF2FF 0%, #FFF0EF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 10, color: '#9BA3B0' }}>画像</span>
      </div>
      <div style={{ padding: '11px 13px' }}>
        {label && (
          <span style={{
            display: 'inline-block', marginBottom: 5,
            fontSize: 9, fontWeight: 900, color: '#E8483F',
            background: 'rgba(232,72,63,0.09)', padding: '2px 8px', borderRadius: 999,
          }}>{label}</span>
        )}
        <p style={{
          margin: 0, fontSize: 12, fontWeight: 900, color: '#071A4D', lineHeight: 1.42,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{title}</p>
      </div>
    </Link>
  );
}

/* ── SVG Icons ── */
function SearchIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function MapIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}
function MenuIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}
function BookmarkIcon({ filled }: { filled: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
}
function SmallBookmarkIcon({ filled }: { filled: boolean }) {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#E8483F' : 'none'} stroke="#E8483F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
}
function MapPinIcon({ color = '#071A4D' }: { color?: string }) {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
}
function ShareIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
}
function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>;
}
function StarBullet() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(218,181,89,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#C8870A" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  );
}
function CheckCircleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8483F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function CheckDot() {
  return (
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#E8483F', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}
function ChevronLeftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
}
function ChevronRightIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9BA3B0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6" /></svg>;
}
function ExternalIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
}
function UpIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>;
}
function CameraIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9BA3B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
}

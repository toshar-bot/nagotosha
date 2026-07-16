'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';

import { GachaExperience } from '@/components/GachaExperience';
import { MoodPicksSection } from '@/components/MoodPicksSection';
import { buildGachaPool } from '@/lib/gacha-pool';
import { OFFICIAL_INSTAGRAM_URL } from '@/lib/site';
import type { FeaturedArticle } from '@/types/portal';

const THEME = {
  navy: '#071A4D',
  red: '#E8483F',
  paleRed: '#FFF0F0',
  text: '#0F172A',
  gray: '#667085',
  border: '#E6ECF5',
  white: '#FFFFFF',
};

const JP = {
  cityGuide: '\u540d\u53e4\u5c4b\u306e\u4eca\u304c\u5206\u304b\u308b\u30b7\u30c6\u30a3\u30ac\u30a4\u30c9',
  nagotosha: '\u306a\u3054\u3068\u3057\u3083',
  agency: '\u540d\u53e4\u5c4b\u60c5\u5831\u5c40 \u30c8\u30fc\u30b7\u30e3\u30fc',
  nagoya: '\u540d\u53e4\u5c4b',
  toshaLogo: '\u3068\u30fc\u3057\u3083\u30fc\u30ed\u30b4',
  search: '\u691c\u7d22',
  gacha: '\u30ac\u30c1\u30e3',
  menu: '\u30e1\u30cb\u30e5\u30fc',
  today: '\u4eca\u65e5',
  event: '\u30a4\u30d9\u30f3\u30c8',
  newStore: '\u65b0\u5e97',
  weekend: '\u9031\u672b',
  area: '\u30a8\u30ea\u30a2',
  heroTitleA: '\u540d\u53e4\u5c4b\u3067\u697d\u3057\u3080',
  heroTitleB: '\u590f\u306e\u591c',
  heroCopyA: '\u30d3\u30a2\u30ac\u30fc\u30c7\u30f3\u7279\u96c62026',
  heroCopyB: '\u30d3\u30fc\u30eb\u3084\u30af\u30e9\u30d5\u30c8\u30d3\u30fc\u30eb\u3092\u697d\u3057\u3081\u308b',
  heroCopyC: '\u540d\u53e4\u5c4b\u306e\u60c5\u5831\u3092\u304a\u5c4a\u3051\u3002',
  featureBadge: '\u7279\u96c6',
  detail: '\u8a73\u3057\u304f\u898b\u308b',
  newOpenSubtitle: '\u4eca\u6708\u30aa\u30fc\u30d7\u30f3\u306e\u30cb\u30e5\u30fc\u30b9\u30dd\u30c3\u30c8',
  featuresSubtitle: '\u5b63\u7bc0\u30fb\u30c6\u30fc\u30de\u5225\u306e\u7279\u96c6',
  hitsumabushi: '\u3072\u3064\u307e\u3076\u3057',
  misoKatsu: '\u5473\u564c\u30ab\u30c4',
  tebasaki: '\u624b\u7fbd\u5148',
  kishimen: '\u304d\u3057\u3081\u3093',
  nagoyaAquarium: '\u540d\u53e4\u5c4b\u6e2f\u6c34\u65cf\u9928',
  higashiyamaZoo: '\u6771\u5c71\u52d5\u690d\u7269\u5712',
  dot: '\u30fb',
  articlesSubtitle: '\u65b0\u7740\u8a18\u4e8b',
  viewAll: '\u3059\u3079\u3066\u898b\u308b',
  storeOwnerTitle: '\u540d\u53e4\u5c4b\u306e\u304a\u5e97\u3092\u3001\u884c\u304d\u305f\u3044\u4eba\u3078\u5c4a\u3051\u307e\u305b\u3093\u304b\uff1f',
  storeOwnerCopyA: '\u8a18\u4e8b\u63b2\u8f09\u30fbNEW!\u63b2\u8f09\u30fbGoogle\u30de\u30c3\u30d7\u5c0e\u7dda\u30fbSNS\u6295\u7a3f\u307e\u3067',
  storeOwnerCopyB: '\u307e\u3068\u3081\u3066\u30b5\u30dd\u30fc\u30c8\u3057\u307e\u3059\u3002',
  partnerCta: '\u63b2\u8f09\u306b\u3064\u3044\u3066\u76f8\u8ac7\u3059\u308b',
  closePrev: '\u524d\u3078',
  closeNext: '\u6b21\u3078',
  bookmark: '\u4fdd\u5b58',
  focus: '\u6ce8\u76ee',
  cafeMorni: '\u30ab\u30d5\u30a7 \u30e2\u30fc\u30cb\u30fc',
  craftBurger: '\u30af\u30e9\u30d5\u30c8\u30d0\u30fc\u30ac\u30fc\u6804\u5e97',
  trattoria: 'TRATTORIA LUCE',
  shachihokoCafe: 'Cafe \u30b7\u30e3\u30c1\u30db\u30b3\u73c8\u7432',
  bakery: '\u30d9\u30fc\u30ab\u30ea\u30fc \u30ce\u30a4',
  ramen: '\u30e9\u30fc\u30e1\u30f3\u96f7\u795e \u4e45\u5c4b\u5e97',
  sakae: '\u6804',
  meieki: '\u540d\u99c5',
  osU: '\u5927\u9808',
  hisaya: '\u4e45\u5c4b',
  cafe: '\u30ab\u30d5\u30a7',
  gourmet: '\u30b0\u30eb\u30e1',
  bread: '\u30d1\u30f3',
  ramenTag: '\u30e9\u30fc\u30e1\u30f3',
  italian: '\u30a4\u30bf\u30ea\u30a2\u30f3',
  beerGarden: '\u590f\u306e\u30d3\u30a2\u30ac\u30fc\u30c7\u30f3\u7279\u96c6',
  beerCopy: '\u591c\u98a8\u3092\u611f\u3058\u308b\u5c4b\u4e0a\u30c6\u30e9\u30b9\u3068\u30af\u30e9\u30d5\u30c8\u30d3\u30fc\u30eb\u3002',
  rainyCafe: '\u96e8\u306e\u65e5\u30ab\u30d5\u30a7\u6848\u5185',
  rainyCopy: '\u99c5\u8fd1\u3067\u3086\u3063\u304f\u308a\u904e\u3054\u305b\u308b\u304a\u5e97\u3092\u53b3\u9078\u3002',
  weekendMarket: '\u9031\u672b\u30de\u30fc\u30b1\u30c3\u30c8',
  marketCopy: '\u96d1\u8ca8\u3068\u713c\u304d\u83d3\u5b50\u3092\u697d\u3057\u3080\u540d\u53e4\u5c4b\u6563\u6b69\u3002',
  giftSweets: '\u624b\u571f\u7523\u30b9\u30a4\u30fc\u30c4',
  giftCopy: '\u559c\u3070\u308c\u308b\u540d\u53e4\u5c4b\u306e\u304a\u3084\u3064\u3092\u63a2\u3059\u3002',
  dinner: '\u591c\u3054\u306f\u3093\u306e\u65b0\u5b9a\u756a',
  dinnerCopy: '\u4ed5\u4e8b\u5e30\u308a\u306b\u5bc4\u308a\u305f\u3044\u8a71\u984c\u306e\u304a\u5e97\u3002',
  articleCafe: '\u540d\u53e4\u5c4b\u30fb\u6804\u306b\u8a71\u984c\u306e\u30ab\u30d5\u30a7\u304c\u30aa\u30fc\u30d7\u30f3',
  articleRestaurant: '\u540d\u99c5\u30a8\u30ea\u30a2\u306b\u65b0\u611f\u899a\u30ec\u30b9\u30c8\u30e9\u30f3\u8a95\u751f',
  articleCastle: '\u540d\u53e4\u5c4b\u57ce\u3042\u3058\u3055\u3044\u307e\u3064\u308a2026',
  nakaSakae: '\u4e2d\u533a\u30fb\u6804',
  nakamuraMeieki: '\u4e2d\u6751\u533a\u30fb\u540d\u99c5',
  castleArea: '\u4e2d\u533a\u30fb\u540d\u53e4\u5c4b\u57ce',
};

const HOME_CSS =
  '.home-scroll::-webkit-scrollbar{display:none}' +
  '@keyframes gacha-float-a{0%,100%{transform:translateY(0) rotate(var(--rotate))}50%{transform:translateY(-7px) rotate(calc(var(--rotate) + 1.5deg))}}' +
  '@keyframes gacha-float-b{0%,100%{transform:translateY(0) rotate(var(--rotate))}50%{transform:translateY(6px) rotate(calc(var(--rotate) - 1.5deg))}}' +
  '@keyframes gacha-card-pulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.018)}}' +
  '@keyframes gacha-sparkle{0%,100%{opacity:.34;transform:scale(.86)}50%{opacity:.9;transform:scale(1.08)}}' +
  '@keyframes portal-pack-open{0%{transform:translate(-50%,0) rotateX(0) scale(1);opacity:1}22%{transform:translate(-50%,-8px) rotateX(-18deg) scale(1.01);opacity:1}100%{transform:translate(-50%,-118px) rotateX(-86deg) scale(1.03);opacity:.98}}' +
  '@keyframes portal-pack-float{0%,100%{transform:translate(-50%,0) rotate(-1.2deg)}50%{transform:translate(-50%,-10px) rotate(1.2deg)}}' +
  '@keyframes portal-pack-body-open{0%{transform:translate(-50%,0) scale(1);opacity:1}45%{transform:translate(-50%,22px) scale(.98);opacity:.94}100%{transform:translate(-50%,42px) scale(.92);opacity:.52}}' +
  '@keyframes portal-card-rise{0%{transform:translateY(52px) scale(.88) rotate(-2deg);opacity:0;filter:blur(8px)}45%{transform:translateY(14px) scale(.96) rotate(-.8deg);opacity:.72;filter:blur(2px)}100%{transform:translateY(0) scale(1) rotate(0);opacity:1;filter:blur(0)}}' +
  '@keyframes portal-reveal-card-rise{0%{transform:translate(-50%,136px) scale(.62) rotate(-4deg);opacity:0}28%{transform:translate(-50%,96px) scale(.72) rotate(-2deg);opacity:.45}62%{transform:translate(-50%,22px) scale(.94) rotate(.8deg);opacity:1}100%{transform:translate(-50%,-10px) scale(1) rotate(0);opacity:1}}' +
  '@keyframes portal-pack-flash{0%,100%{opacity:.16;transform:scale(.86)}50%{opacity:1;transform:scale(1.16)}}' +
  '@keyframes portal-rainbow-burst{0%{opacity:0;transform:translate(-50%,16px) scale(.64)}28%{opacity:.72;transform:translate(-50%,2px) scale(.92)}58%{opacity:1;transform:translate(-50%,-8px) scale(1.18)}100%{opacity:.34;transform:translate(-50%,-12px) scale(1.42)}}' +'@keyframes portal-card-back-glow{0%{filter:hue-rotate(0deg) brightness(1)}100%{filter:hue-rotate(360deg) brightness(1.16)}}' +
  '@keyframes portal-card-shimmer{0%{transform:translateX(-130%) skewX(-16deg);opacity:0}35%{opacity:.9}100%{transform:translateX(150%) skewX(-16deg);opacity:0}}' +
  '@keyframes portal-star-drift{0%,100%{opacity:.35;transform:translateY(0) scale(.8)}50%{opacity:1;transform:translateY(-7px) scale(1.18)}}' +
  '@keyframes portal-holo-pan{0%{background-position:0% 50%;opacity:.18}50%{background-position:100% 50%;opacity:.34}100%{background-position:0% 50%;opacity:.18}}' +
  '@keyframes home-gacha-card-float{0%,100%{transform:translateY(0) rotate(var(--rotate))}50%{transform:translateY(-7px) rotate(calc(var(--rotate) + .9deg))}}' +
  '@keyframes home-gacha-cta{0%,100%{transform:scale(1);box-shadow:0 15px 30px rgba(232,72,63,.30)}50%{transform:scale(1.025);box-shadow:0 18px 42px rgba(232,72,63,.38)}}' +
  '@keyframes home-gacha-pack-float{0%,100%{transform:translateY(0) rotate(-1.1deg)}50%{transform:translateY(-10px) rotate(1.1deg)}}' +
  '@keyframes home-gacha-pack-sink{0%{transform:translate(-50%,0) scale(1)}100%{transform:translate(-50%,34px) scale(.93)}}' +
  '@keyframes home-gacha-pack-cut{0%{transform:translate(-50%,0) rotateX(0);opacity:1}100%{transform:translate(-50%,-76px) rotateX(-80deg);opacity:.96}}' +
  '@keyframes home-gacha-opening-light{0%{opacity:0;transform:translate(-50%,10px) scale(.62)}34%{opacity:1;transform:translate(-50%,0) scale(.94)}100%{opacity:.18;transform:translate(-50%,-8px) scale(1.24)}}' +
  '@keyframes home-gacha-sun-burst{0%{opacity:0;transform:translate(-50%,22px) scale(.72);filter:blur(8px)}28%{opacity:.95;transform:translate(-50%,2px) scale(1);filter:blur(2px)}72%{opacity:.72;transform:translate(-50%,-8px) scale(1.08);filter:blur(3px)}100%{opacity:.18;transform:translate(-50%,-18px) scale(1.18);filter:blur(7px)}}' +
  '@keyframes home-gacha-core-glow{0%{opacity:0;transform:translate(-50%,0) scale(.74)}30%{opacity:1;transform:translate(-50%,-2px) scale(1.02)}100%{opacity:.46;transform:translate(-50%,-6px) scale(1.18)}}' +
  '@keyframes home-gacha-dust-rise{0%{opacity:0;transform:translateY(14px) scale(.55)}20%{opacity:.95}100%{opacity:0;transform:translateY(-74px) scale(1.12)}}' +
  '@keyframes home-gacha-white-flash{0%,58%,100%{opacity:0}70%{opacity:.95}82%{opacity:.18}}' +
  '@keyframes home-gacha-particle{0%{opacity:0;transform:translateY(18px) scale(.7)}20%{opacity:1}100%{opacity:0;transform:translateY(-82px) scale(1.1)}}' +
  '@keyframes home-gacha-result-in{0%{opacity:0;transform:translateY(18px) scale(.88)}100%{opacity:1;transform:translateY(0) scale(1)}}' +
  '@keyframes home-gacha-card-shine{0%,22%{transform:translateX(-62%) rotate(8deg);opacity:0}38%{opacity:.92}62%{transform:translateX(52%) rotate(8deg);opacity:.78}100%{transform:translateX(76%) rotate(8deg);opacity:0}}' +
  '@keyframes home-gacha-card-twinkle{0%,100%{opacity:.28;transform:scale(.76)}50%{opacity:1;transform:scale(1.16)}}';

const CATEGORY_TABS = [
  { key: 'today', label: JP.today, icon: SunIcon },
  { key: 'event', label: JP.event, icon: PartyIcon },
  { key: 'new', label: JP.newStore, icon: ShopIcon, isNew: true },
  { key: 'weekend', label: JP.weekend, icon: CalendarIcon },
  { key: 'area', label: JP.area, icon: PinIcon },
];


const HERO_SLIDES = [
  {
    eyebrow: '\u4eca\u65e5\u306e\u540d\u53e4\u5c4b\u3092\u5199\u771f\u3067\u63a2\u3059',
    title: '\u540d\u53e4\u5c4b\u306e\u65b0\u5e97\u30fb\u30a4\u30d9\u30f3\u30c8\u30fb\u3054\u306f\u3093\u3092\n\u5199\u771f\u3067\u30b5\u30af\u30c3\u3068\u63a2\u305b\u308b',
    copy: '\u4eca\u65e5\u884c\u3051\u308b\u304a\u5e97\u3001\u9031\u672b\u306e\u304a\u3067\u304b\u3051\u3001\u6c17\u306b\u306a\u308b\u65b0\u5e97\u3092\u4fdd\u5b58\u3057\u3066\u3042\u3068\u304b\u3089\u898b\u8fd4\u305b\u307e\u3059\u3002',
    imageUrl: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&w=1200&q=80',
    badge: 'NAGOYA TODAY',
    ctaText: '\u4eca\u65e5\u306e\u540d\u53e4\u5c4b\u3092\u898b\u308b',
    ctaHref: '/new',
  },
  {
    eyebrow: '\u4eca\u6708\u30aa\u30fc\u30d7\u30f3\u306e\u65b0\u5e97\u3092\u30c1\u30a7\u30c3\u30af',
    title: '\u540d\u53e4\u5c4b\u306e\n\u65b0\u3057\u3044\u304a\u5e97',
    copy: '\u8a71\u984c\u306e\u30cb\u30e5\u30fc\u30aa\u30fc\u30d7\u30f3\u3001\u30aa\u30fc\u30d7\u30f3\u76f4\u5f8c\u306e\u8a18\u4e8b\u3092\u3044\u3061\u65e9\u304f\u304a\u5c4a\u3051\u3057\u307e\u3059\u3002',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    badge: 'NEW OPEN',
    ctaText: '\u65b0\u7740\u8a18\u4e8b\u3092\u898b\u308b',
    ctaHref: '/new',
  },
  {
    eyebrow: '\u6c17\u306b\u306a\u3063\u305f\u3089\u4fdd\u5b58\u3057\u3066\u304a\u304f',
    title: '\u4fdd\u5b58\u3057\u3066\n\u9031\u672b\u306b\u4f7f\u3048\u308b',
    copy: '\u884c\u304d\u305f\u3044\u304a\u5e97\u3084\u30a4\u30d9\u30f3\u30c8\u3092\u4fdd\u5b58\u3002\u9031\u672b\u306e\u4e88\u5b9a\u3092\u7acb\u3066\u308b\u3068\u304d\u306b\u3059\u3050\u4f7f\u3048\u307e\u3059\u3002',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    badge: 'MY LIST',
    ctaText: '\u4fdd\u5b58\u30ea\u30b9\u30c8\u3092\u898b\u308b',
    ctaHref: '/saved',
  },
];
const NEW_OPEN_STORES = [
  { name: JP.bakery, area: JP.nagoya, tag: JP.bread, openDate: '06/22 OPEN!!', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  { name: JP.ramen, area: JP.hisaya, tag: JP.ramenTag, openDate: '06/24 OPEN!!', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80' },
  { name: JP.trattoria, area: JP.meieki, tag: JP.italian, openDate: '06/15 OPEN!!', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
  { name: JP.shachihokoCafe, area: JP.osU, tag: JP.cafe, openDate: '06/18 OPEN!!', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
  { name: JP.craftBurger, area: JP.sakae, tag: JP.gourmet, openDate: '06/12 OPEN!!', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80' },
];

const FEATURE_CARDS = [
  { title: '名古屋ビアガーデン特集2026', copy: '名駅・栄・金山で夏に行きたい屋上・駅近ビアガーデンを整理。', imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-beer-garden-2026-eyecatch.png', href: '/article/79', tag: '夏のおでかけ' },
  { title: '雨の日の屋内スポット7選', copy: '子連れ・デート・ひとりで使いやすい屋内スポットを紹介。', imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/codex-clipboard-1bb1e995-d46b-4fc8-bfa6-69e6dd6cf39d.png', href: '/article/58', tag: '雨の日' },
  { title: '名古屋の手土産ガイド', copy: '職場・取引先・帰省で選びやすい名古屋手土産を整理。', imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-omiyage-eyecatch.png', href: '/article/73', tag: '手土産' },
  { title: '名古屋モーニング文化ガイド', copy: '初めてでも楽しめる喫茶店の朝時間を紹介。', imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-morning-culture-eyecatch.png', href: '/article/66', tag: 'モーニング' },
];

const EDITOR_CHOICE_CARDS = [
  { title: '名古屋ビアガーデン特集2026', href: '/article/79', imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-beer-garden-2026-eyecatch.png', tag: '夏のおでかけ' },
  { title: '名古屋の新店オープン情報2026年夏版', href: '/article/83', imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-haera-prtimes.jpg', tag: '新店まとめ' },
  { title: 'PASTA MANIA 鶴舞店', href: '/article/92', imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pasta-mania-tsurumai-prtimes.jpg', tag: '鶴舞' },
] as const;

const FALLBACK_ARTICLES = [
  { id: 'mock-article-1', title: JP.articleCafe, description: '駅近で立ち寄りやすい、気分を変えるカフェ時間。', tag: JP.focus, area: JP.nakaSakae, publishedAt: '2026.06.16', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
  { id: 'mock-article-2', title: JP.articleRestaurant, description: '名駅で見つけたい、新しい夜ごはんの候補。', tag: 'NEW', area: JP.nakamuraMeieki, publishedAt: '2026.06.14', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
  { id: 'mock-article-3', title: JP.articleCastle, description: '季節の花と街歩きを楽しむ、名古屋城まわりのおでかけ。', tag: JP.focus, area: JP.castleArea, publishedAt: '2026.06.10', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80' },
];

type ArticleLike = Pick<FeaturedArticle, 'id' | 'title'> & Partial<FeaturedArticle>;

const ARCHIVE_ARTICLE_URLS = new Set(['/article/8']);
const ARCHIVE_ARTICLE_IDS = new Set(['8', 'wp-8']);

function resolveArticleHref(article: ArticleLike) {
  return article.id.startsWith('wp-') ? `/article/${article.id.slice(3)}` : article.articleUrl || '/new';
}

function isArchiveArticle(article: ArticleLike) {
  const href = resolveArticleHref(article);
  return ARCHIVE_ARTICLE_URLS.has(href) || ARCHIVE_ARTICLE_IDS.has(article.id);
}

export default function PortalHomeClient({
  featuredArticles,
  gachaSourceArticles,
}: {
  featuredArticles: FeaturedArticle[];
  gachaSourceArticles: FeaturedArticle[];
}) {
  const gachaArticles = useMemo(() => buildGachaPool(gachaSourceArticles), [gachaSourceArticles]);
  const articles = useMemo<ArticleLike[]>(() => {
    const source = (featuredArticles.length > 0 ? featuredArticles : FALLBACK_ARTICLES).filter(
      (article) => !isArchiveArticle(article),
    );
    return source.slice(0, 6).map((article, index) => ({
      ...article,
      imageUrl: article.imageUrl || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].imageUrl,
      tag: article.tag || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].tag,
      area: article.area || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].area,
      publishedAt: article.publishedAt || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].publishedAt,
      articleUrl: resolveArticleHref(article),
    }));
  }, [featuredArticles]);

  useBottomNavAutoHide();

  return (
    <div
      className="min-h-dvh"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #FFFDF7 34%, #FFFFFF 68%, #FFF8F7 100%)',
        color: THEME.text,
        overflowX: 'hidden',
      }}
    >
      <style>{HOME_CSS}</style>
      <Header />
      <main className="overflow-hidden pb-28">
        <HeroSection />
        <FreshArticlesSection articles={articles} />
        <NewsSection articles={featuredArticles} />
        <EditorChoiceSection />
        <FeaturesSection />
        <AreaCtaSection />
        <ArticlesSection articles={articles} />
        {gachaArticles.length > 0 && (
          <section id="home-gacha" className="scroll-mt-4 px-4 py-5">
            <div className="mx-auto w-full max-w-[940px]">
              <GachaExperience articles={gachaArticles} location="home" />
            </div>
          </section>
        )}
        <HomeFooterCta />
      </main>
    </div>
  );
}

function useBottomNavAutoHide() {
  useEffect(() => {
    const navs = Array.from(document.querySelectorAll<HTMLElement>('nav.fixed.bottom-0.left-0.right-0'));
    if (navs.length === 0) return;

    let lastY = window.scrollY;
    let hidden = false;
    const threshold = 14;

    const setHidden = (nextHidden: boolean) => {
      if (hidden === nextHidden) return;
      hidden = nextHidden;
      navs.forEach((nav) => {
        nav.style.transition = 'transform 240ms ease, opacity 240ms ease';
        nav.style.transform = nextHidden ? 'translateY(110%)' : 'translateY(0)';
        nav.style.opacity = nextHidden ? '0' : '1';
        nav.style.pointerEvents = nextHidden ? 'none' : 'auto';
      });
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastY;
      if (Math.abs(diff) < threshold) return;
      if (currentY < 24 || diff < 0) setHidden(false);
      if (diff > 0 && currentY > 120) setHidden(true);
      lastY = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      navs.forEach((nav) => {
        nav.style.transition = '';
        nav.style.transform = '';
        nav.style.opacity = '';
        nav.style.pointerEvents = '';
      });
    };
  }, []);
}
function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) return;
    window.location.href = '/new?tag=' + encodeURIComponent(query);
  };

  return (
    <header className="border-b border-[#f2d9d8] bg-white">
      <div className="mx-auto flex min-h-[100px] max-w-[940px] items-center justify-between gap-1 px-2 py-2">
        <Link href="/" className="flex min-w-0 flex-1 items-center" aria-label="なごとしゃ ホーム">
          <span className="block h-[88px] w-full max-w-[calc(100vw-142px)] sm:h-[104px] sm:max-w-[620px]">
            <img
              src="/subjects/nagotosha-header-complete-tight.png"
              alt="なごとしゃ 名古屋情報局 トーシャー"
              className="block h-full w-full object-contain object-left"
            />
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-0" aria-label="ヘッダーナビ">
          <HeaderAction label="検索" type="search" onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }} />
          <HeaderAction label="エリア" href="/area" type="area" />
          <HeaderAction label="カテゴリ" href="/new" type="category" />
          <HeaderAction label="メニュー" type="menu" onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }} />
        </nav>
      </div>
      {searchOpen && (
        <form onSubmit={submitSearch} className="mx-auto flex max-w-[940px] items-center gap-2 px-4 pb-3">
          <input
            ref={inputRef}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            type="search"
            placeholder="キーワードで検索"
            className="h-11 min-w-0 flex-1 rounded-full border border-[#f2caca] bg-[#fff8f8] px-4 text-[15px] font-bold text-[#071A4D] outline-none focus:border-[#E8483F] focus:bg-white"
          />
          <button type="submit" className="h-11 shrink-0 rounded-full bg-[#E8483F] px-5 text-[14px] font-black text-white shadow-[0_8px_18px_rgba(232,72,63,.22)]">
            検索
          </button>
        </form>
      )}
      {menuOpen && (
        <div className="mx-auto max-w-[940px] px-4 pb-4">
          <nav className="grid grid-cols-2 gap-2 rounded-[18px] border border-[#f2d9d8] bg-[#fffafa] p-3 shadow-[0_12px_26px_rgba(7,26,77,.08)]" aria-label="メニュー">
            {[
              { label: 'ホーム', href: '/' },
              { label: '新着記事', href: '/new' },
              { label: 'イベント', href: '/event' },
              { label: 'エリア', href: '/area' },
              { label: '保存', href: '/saved' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center justify-center rounded-[14px] border border-[#f4cdca] bg-white text-[14px] font-black text-[#071A4D] no-underline active:scale-[0.99]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function HeaderAction({ label, type, href, onClick }: { label: string; type: 'search' | 'area' | 'category' | 'menu'; href?: string; onClick?: () => void }) {
  const icon = type === 'search' ? <SearchIcon /> : type === 'area' ? <PinIcon /> : type === 'category' ? <CategoryIcon /> : <MenuIcon />;
  const style: CSSProperties = { minWidth: 36, color: THEME.navy, textDecoration: 'none', padding: '5px 1px 4px', borderRadius: 8, flexDirection: 'column', gap: 2 };
  const content = <><span style={{ display: 'grid', placeItems: 'center', height: 24 }}>{icon}</span><span style={{ fontSize: 9.5, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap' }}>{label}</span></>;
  if (href) return <Link href={href} aria-label={label} className="flex items-center justify-center active:opacity-60 transition-opacity" style={style}>{content}</Link>;
  return <button type="button" onClick={onClick} aria-label={label} className="flex items-center justify-center active:opacity-60 transition-opacity" style={{ ...style, border: 0, background: 'transparent' }}>{content}</button>;
}

function CategoryTabs() {
  return (
    <nav className="home-scroll flex overflow-x-auto" style={{ gap: 10, padding: '8px 14px 11px', borderBottom: '1px solid #F2F4F8' }}>
      {CATEGORY_TABS.map((tab, index) => {
        const Icon = tab.icon;
        const active = index === 0;
        return (
          <Link key={tab.key} href={tab.key === 'event' || tab.key === 'weekend' ? '/event' : tab.key === 'new' ? '/new' : tab.key === 'area' ? '/area' : '/'} style={{ position: 'relative', flexShrink: 0, textDecoration: 'none' }}>
            <span style={{ height: 44, padding: '0 17px', borderRadius: 16, display: 'inline-flex', alignItems: 'center', gap: 7, background: active ? THEME.red : '#fff', color: active ? '#fff' : THEME.navy, border: '1.5px solid ' + (active ? THEME.red : '#F1B9B5'), fontSize: 14, fontWeight: 900, boxShadow: active ? '0 7px 16px rgba(232,72,63,0.22)' : '0 2px 8px rgba(7,26,77,0.05)' }}><Icon />{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HeroSection() {
  const [keyword, setKeyword] = useState('');
  const categories = ['グルメ', 'おでかけ', '新店・NEW OPEN', '手土産・おみやげ', 'イベント'];

  const submitHeroSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = keyword.trim();
    window.location.href = query ? '/new?tag=' + encodeURIComponent(query) : '/new';
  };

  return (
    <section className="px-3 pt-3">
      <div
        className="relative mx-auto max-w-[940px] overflow-hidden rounded-[26px] border border-[#e9d9c7] shadow-[0_18px_42px_rgba(7,26,77,0.12)]"
        style={{ backgroundImage: 'url(/hero/nagoya-hero.webp)', backgroundSize: 'cover', backgroundPosition: 'center 40%' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 22%, rgba(255,253,248,0.42) 0%, rgba(255,253,248,0.12) 45%, rgba(255,253,248,0.06) 100%)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ height: '55%', background: 'linear-gradient(180deg,transparent,rgba(255,253,248,.88) 68%,#fffdf8 100%)' }}
          aria-hidden="true"
        />
        <div className="relative px-5 pb-6 pt-20 text-center sm:px-12 sm:pt-28">
          <h1 className="mx-auto max-w-[760px] text-[30px] font-black leading-[1.16] tracking-[-0.03em] text-[#071A4D] sm:text-[52px]">
            名古屋の「今」を発見。
          </h1>
          <p className="mt-2 text-[13px] font-black leading-relaxed text-[#071A4D]/80 sm:text-[18px]">
            グルメ・おでかけ・新店情報ならなごとしゃ
          </p>
          <div className="mx-auto mt-4 flex max-w-[660px] flex-wrap justify-center gap-2">
            {categories.map((label) => (
              <Link
                key={label}
                href={label === 'イベント' ? '/event' : '/new?tag=' + encodeURIComponent(label)}
                className={label === 'グルメ'
                  ? 'rounded-full border border-[#E8483F] bg-[#E8483F] px-3 py-1.5 text-[11px] font-black text-white no-underline shadow-[0_5px_15px_rgba(232,72,63,.24)]'
                  : 'rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-black text-[#071A4D] no-underline shadow-[0_4px_14px_rgba(7,26,77,.09)]'}
              >
                {label}
              </Link>
            ))}
          </div>
          <form
            onSubmit={submitHeroSearch}
            className="mx-auto mt-5 flex max-w-[640px] items-center gap-2 rounded-full border border-[#DDE5F0] bg-white p-2 shadow-[0_14px_30px_rgba(7,26,77,.14)]"
          >
            <SearchIcon />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              type="search"
              aria-label="気になるキーワードで検索"
              placeholder="気になるキーワードで検索（例：名古屋駅 ランチ）"
              className="min-w-0 flex-1 bg-transparent text-[12px] font-bold text-[#071A4D] outline-none placeholder:text-[#8A94A6] sm:text-[14px]"
            />
            <button
              type="submit"
              className="h-10 shrink-0 rounded-full bg-[#E8483F] px-4 text-[12px] font-black text-white shadow-[0_8px_16px_rgba(232,72,63,.22)] sm:px-6 sm:text-[14px]"
            >
              検索する
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function NewOpenSection() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const stores = useMemo(() => [...NEW_OPEN_STORES, ...NEW_OPEN_STORES], []);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
  };

  const resumeLater = () => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 1400);
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const speed = 84;

    const tick = (now: number) => {
      const el = scrollerRef.current;
      if (el && !pausedRef.current) {
        const delta = Math.min((now - last) / 1000, 0.035);
        el.scrollLeft += speed * delta;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft = el.scrollLeft - half;
        }
      }
      last = now;
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
    };
  }, []);

  return (
    <section className="py-6">
      <CenteredHeading en="NEW OPEN" ja={JP.newOpenSubtitle} />
      <div
        ref={scrollerRef}
        className="mt-5 flex gap-3.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onMouseEnter={pause}
        onMouseLeave={resumeLater}
        onTouchStart={pause}
        onTouchEnd={resumeLater}
      >
        {stores.map((store, index) => (
          <article
            key={`${store.name}-${index}`}
            className="flex h-[242px] w-[164px] shrink-0 flex-col overflow-hidden rounded-[16px] border border-[#eadedf] bg-white shadow-[0_10px_24px_rgba(23,34,64,0.10)] sm:w-[188px]"
          >
            <div
              className="h-[112px] bg-cover bg-center"
              style={{ backgroundImage: `url(${store.imageUrl})` }}
            />
            <div className="flex min-h-0 flex-1 flex-col px-3.5 py-3">
              <h3 className="line-clamp-2 text-[14px] font-black leading-snug text-[#0b173d]">{store.name}</h3>
              <p className="mt-2 text-[12px] font-bold text-[#7c8292]">
                {store.area}{JP.dot}{store.tag}
              </p>
              <p className="mt-auto text-[15px] font-black tracking-[0.03em] text-[#e8272d]">{store.openDate}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EditorChoiceSection() {
  return (
    <section style={{ padding: '18px 16px 16px' }}>
      <div style={{ marginBottom: 12 }}>
        <SectionKicker en="EDITOR'S CHOICE" ja="編集部が今推す3本" align="left" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {EDITOR_CHOICE_CARDS.map((item) => (
          <Link key={item.href} href={item.href} className="block min-w-0 text-inherit no-underline" aria-label={item.title}>
            <article style={{ overflow: 'hidden', borderRadius: 16, border: '1px solid ' + THEME.border, background: '#fff', boxShadow: '0 8px 18px rgba(7,26,77,.08)' }}>
              <div style={{ height: 72, ...bgPhoto(item.imageUrl) }} />
              <div style={{ padding: '8px 8px 9px' }}>
                <p style={{ display: 'inline-flex', margin: 0, borderRadius: 999, background: '#FFF4D7', color: '#8A6400', padding: '3px 6px', fontSize: 9, lineHeight: 1, fontWeight: 900 }}>{item.tag}</p>
                <h3 style={{ margin: '6px 0 0', color: THEME.navy, fontSize: 11.2, fontWeight: 950, lineHeight: 1.34 }}>{item.title}</h3>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="px-4 py-5">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionKicker en="FEATURE" ja="特集" align="left" />
        <Link href="/new" style={{ color: THEME.red, fontSize: 12, fontWeight: 950, textDecoration: 'none', paddingBottom: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>
          新着記事を見る {String.fromCharCode(8250)}
        </Link>
      </div>
      <div className="mx-auto grid max-w-[940px] grid-cols-2 gap-3">
        {FEATURE_CARDS.map((item) => (
          <FeatureCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ item }: { item: (typeof FEATURE_CARDS)[number] }) {
  return (
    <Link href={item.href} className="block min-w-0 text-inherit no-underline" aria-label={item.title}>
    <article
      className="relative flex h-[194px] min-w-0 flex-col overflow-hidden rounded-[16px] border border-[#E6ECF5] bg-white shadow-[0_10px_24px_rgba(14,24,55,0.10)] sm:h-[230px]"
    >
      <div className="relative h-[98px] overflow-hidden sm:h-[128px]">
        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        <span className="absolute left-2 top-2 rounded-full bg-[#E8483F] px-2 py-0.5 text-[9px] font-black text-white shadow-[0_4px_10px_rgba(7,26,77,.16)]">
          {item.tag}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-[13px] font-black leading-snug text-[#071A4D] sm:text-[15px]">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-[10.5px] font-bold leading-relaxed text-[#667085] sm:text-[12px]">{item.copy}</p>
      </div>
    </article>
    </Link>
  );
}

function ArticlesSection({ articles }: { articles: ArticleLike[] }) {
  const picks = articles.slice(0, 5);
  return (
    <section style={{ padding: '22px 0 20px' }}>
      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <SectionKicker en="EDITOR'S PICK" ja="編集部おすすめ記事" align="left" />
        <Link href="/new" style={{ color: THEME.red, fontSize: 12, fontWeight: 950, textDecoration: 'none', paddingBottom: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>もっと見る {String.fromCharCode(8250)}</Link>
      </div>
      <div className="home-scroll flex overflow-x-auto" style={{ gap: 10, padding: '14px 16px 4px' }}>
        {picks.map((article, index) => (
          <Link key={article.id || index} href={article.articleUrl || '/new'} style={{ flexShrink: 0, width: 150, borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid ' + THEME.border, boxShadow: '0 9px 22px rgba(7,26,77,0.10)', textDecoration: 'none', color: THEME.text }}>
            <div style={{ position: 'relative', height: 104, ...bgPhoto(article.imageUrl || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].imageUrl || '') }}>
              <span style={{ position: 'absolute', left: 8, top: 8, borderRadius: 999, background: '#fff', color: THEME.navy, fontSize: 10, fontWeight: 950, padding: '5px 8px', boxShadow: '0 5px 12px rgba(7,26,77,.14)' }}>{article.tag || JP.focus}</span>
            </div>
            <div style={{ padding: '10px 10px 11px' }}>
              <p style={{ margin: 0, minHeight: 38, color: THEME.text, fontSize: 12.5, fontWeight: 950, lineHeight: 1.42 }}>{article.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 10, color: THEME.gray, fontSize: 10, fontWeight: 750 }}><span>{formatDate(article.publishedAt)}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FreshArticlesSection({ articles }: { articles: ArticleLike[] }) {
  return (
    <section style={{ padding: '20px 0 22px' }}>
      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <SectionKicker en="NEW ARTICLES" ja="新着記事" align="left" />
        <Link href="/new" style={{ color: THEME.red, fontSize: 12, fontWeight: 950, textDecoration: 'none', paddingBottom: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>もっと見る {String.fromCharCode(8250)}</Link>
      </div>
      <div className="home-scroll flex overflow-x-auto" style={{ gap: 12, padding: '15px 16px 4px' }}>
        {articles.map((article, index) => (
          <Link key={article.id || index} href={article.articleUrl || '/new'} style={{ flexShrink: 0, width: 184, borderRadius: 18, overflow: 'hidden', background: '#fff', border: '1px solid ' + THEME.border, boxShadow: '0 8px 22px rgba(7,26,77,0.09)', textDecoration: 'none', color: THEME.text }}>
            <div style={{ position: 'relative', height: 118, ...bgPhoto(article.imageUrl || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].imageUrl || '') }}>
              <span style={{ position: 'absolute', left: 10, top: 10, background: THEME.red, color: '#fff', fontSize: 9, fontWeight: 950, borderRadius: 7, padding: '4px 7px' }}>NEW</span>
            </div>
            <div style={{ padding: '12px 12px 13px' }}>
              <p style={{ margin: 0, minHeight: 40, color: THEME.text, fontSize: 13.5, fontWeight: 950, lineHeight: 1.42 }}>{article.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10, color: THEME.gray, fontSize: 10, fontWeight: 800 }}><span>{article.tag || JP.focus}</span><span>{formatDate(article.publishedAt)}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const AREAS = [
  { label: '名駅', href: '/area' },
  { label: '栄', href: '/area' },
  { label: '大須', href: '/area' },
  { label: '名古屋城', href: '/area' },
  { label: '覚王山', href: '/area' },
  { label: '東山', href: '/area' },
  { label: '金山', href: '/area' },
  { label: '千種', href: '/area' },
];

function EventCtaSection() {
  const items = [
    { label: '今日行ける', sub: 'すぐ行けるスポット', href: '/event', bg: THEME.navy, shadow: '0 10px 22px rgba(7,26,77,0.22)' },
    { label: '週末おでかけ', sub: '週末の予定に使える', href: '/event', bg: THEME.red, shadow: '0 10px 22px rgba(232,72,63,0.26)' },
  ];
  return (
    <section style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionKicker en="EVENT" ja="今週のイベント・おでかけ" align="left" />
        <Link href="/event" style={{ color: THEME.red, fontSize: 12, fontWeight: 950, textDecoration: 'none', paddingBottom: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {JP.viewAll} {String.fromCharCode(8250)}
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map((item) => (
          <Link key={item.label} href={item.href} style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            minHeight: 96, borderRadius: 18, padding: '15px 15px',
            background: item.bg, color: '#fff', textDecoration: 'none',
            boxShadow: item.shadow,
          }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 950, lineHeight: 1.25 }}>{item.label}</p>
            <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 800, opacity: 0.80 }}>{item.sub}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

type HomeNewsCard = {
  title: string;
  href: string;
  imageUrl: string;
  background: string;
  openLabel: string;
  areaTag: string;
};

const NEW_OPEN_PATTERN = /新店|オープン|NEW\s*OPEN|open/i;
const CLOSED_PATTERN = /閉店|終了|クローズ/;

function isNewOpenArticle(article: ArticleLike): boolean {
  const haystack = `${article.tag ?? ''} ${article.title}`;
  if (CLOSED_PATTERN.test(haystack)) return false;
  return NEW_OPEN_PATTERN.test(haystack) || article.isNew === true;
}

function toArticleTime(publishedAt?: string): number {
  if (!publishedAt) return 0;
  const t = new Date(publishedAt.replace(/\./g, '-')).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function NewsSection({ articles }: { articles: ArticleLike[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  // 固定カードを廃止し、取得済み記事から新店系を公開日降順で自動抽出する。
  // 新しい新店記事が公開されれば、このスライダーに自動で並ぶ。
  const cards: HomeNewsCard[] = useMemo(() => {
    return articles
      .filter(isNewOpenArticle)
      .filter((article) => !isArchiveArticle(article))
      .sort((a, b) => toArticleTime(b.publishedAt) - toArticleTime(a.publishedAt))
      .slice(0, 8)
      .map((article) => ({
        title: article.title,
        href: resolveArticleHref(article),
        imageUrl: article.imageUrl || '',
        background: 'radial-gradient(circle at 72% 20%, rgba(255,255,255,.45), transparent 28%), linear-gradient(135deg, #071A4D 0%, #E8483F 58%, #F8C861 100%)',
        openLabel: `${formatDate(article.publishedAt)} 掲載`,
        areaTag: normalizeAreaTag(article.area),
      }));
  }, [articles]);
  // 無限ループ演出用の複製。元データが実記事であることが前提。
  const loopCards = cards.length > 0 ? [...cards, ...cards] : [];

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
  };

  const resumeLater = () => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 1200);
  };

  useEffect(() => {
    const speed = 1.2;
    const interval = window.setInterval(() => {
      const el = scrollerRef.current;
      if (el && !pausedRef.current && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
    }, 50);

    return () => {
      window.clearInterval(interval);
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section style={{ padding: '16px 0 18px' }}>
      <div style={{ padding: '0 16px' }}>
        <SectionKicker en="NEW OPEN" ja="新店舗情報" align="left" />
      </div>
      <div
        ref={scrollerRef}
        className="home-scroll flex overflow-x-auto"
        style={{ gap: 10, padding: '12px 16px 4px', scrollBehavior: 'auto' }}
        onTouchStart={pause}
        onTouchEnd={resumeLater}
        onPointerDown={pause}
        onPointerUp={resumeLater}
      >
        {loopCards.map((card, index) => (
          <Link
            key={`${card.href}-${index}`}
            href={card.href}
            style={{ flexShrink: 0, width: 154, color: 'inherit', textDecoration: 'none' }}
            aria-label={card.title}
          >
            <article style={{ overflow: 'hidden', borderRadius: 16, border: '1px solid ' + THEME.border, background: '#fff', boxShadow: '0 7px 18px rgba(7,26,77,.08)' }}>
              <div style={{ height: 88, position: 'relative', background: card.imageUrl ? `url(${card.imageUrl})` : card.background, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>
                {!card.imageUrl && (
                  <>
                    <span aria-hidden style={{ position: 'absolute', right: -22, bottom: -22, width: 96, height: 96, borderRadius: '50%', border: '1px solid rgba(7,26,77,.16)' }} />
                    <span aria-hidden style={{ position: 'absolute', left: 22, top: 18, width: 1, height: 78, background: 'rgba(255,255,255,.34)', transform: 'rotate(18deg)' }} />
                    <span aria-hidden style={{ position: 'absolute', left: 58, top: 8, width: 1, height: 96, background: 'rgba(255,255,255,.28)', transform: 'rotate(18deg)' }} />
                  </>
                )}
              </div>
              <div style={{ padding: '9px 10px 10px' }}>
                <p style={{ margin: 0, color: THEME.red, fontSize: 10, lineHeight: 1.1, fontWeight: 950, letterSpacing: '0.02em' }}>{card.openLabel}</p>
                <h3 style={{ margin: '5px 0 0', color: THEME.navy, fontSize: 13, lineHeight: 1.28, fontWeight: 950, minHeight: 34 }}>{card.title}</h3>
                <p style={{ display: 'inline-flex', margin: '7px 0 0', borderRadius: 999, background: '#F4F7FB', color: THEME.gray, padding: '3px 7px', fontSize: 10, lineHeight: 1, fontWeight: 900 }}>{card.areaTag}</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HomeFooterCta() {
  return (
    <footer style={{ margin: '10px 12px 28px', borderRadius: 26, overflow: 'hidden', background: '#071A4D', color: '#fff', boxShadow: '0 16px 34px rgba(7,26,77,.22)' }}>
      <div style={{ padding: '24px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/subjects/nagotosha-header-complete-tight.png" alt="なごとしゃ" style={{ width: 150, height: 52, objectFit: 'contain', objectPosition: 'left' }} />
          <p style={{ margin: 0, color: 'rgba(255,255,255,.76)', fontSize: 11, fontWeight: 800, lineHeight: 1.55 }}>名古屋の「今」を探せる<br />シティガイドメディア</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
          <div>
            <p style={{ margin: 0, color: '#F8C861', fontSize: 12, fontWeight: 950 }}>便利なリンク</p>
            <FooterLink href="/new" label="新着記事" />
            <FooterLink href="/event" label="イベント" />
            <FooterLink href="/area" label="エリアから探す" />
          </div>
          <div>
            <p style={{ margin: 0, color: '#F8C861', fontSize: 12, fontWeight: 950 }}>お役立ち情報</p>
            <FooterLink href="/saved" label="保存した記事" />
            <FooterLink href="/partner" label="掲載相談" />
            <FooterLink href="/privacy" label="プライバシーポリシー" />
            <FooterLink href="/terms" label="利用規約" />
          </div>
        </div>
        <p style={{ margin: '18px 0 0', color: 'rgba(255,255,255,.52)', fontSize: 10, fontWeight: 700 }}>© 2026 nagotosha. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} style={{ display: 'block', marginTop: 8, color: 'rgba(255,255,255,.82)', textDecoration: 'none', fontSize: 12, fontWeight: 800 }}>{label}</Link>;
}

function AreaCtaSection() {
  return <MoodPicksSection />;
}

function StoreOwnerSection() {
  return (
    <section style={{ padding: '20px 16px 18px' }}>
      <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', background: 'radial-gradient(circle at 86% 18%, rgba(255,255,255,0.72), transparent 25%), linear-gradient(135deg, #FFF1ED 0%, #FFE0DD 48%, #FFF4D7 100%)', border: '1.5px solid #F7BDB7', boxShadow: '0 14px 30px rgba(232,72,63,0.16)' }}>
        <div style={{ height: 5, background: 'linear-gradient(90deg, #E8483F, #FF8748, #FFD36B)' }} />
        <div style={{ position: 'absolute', right: -28, top: -26, width: 128, height: 128, borderRadius: 999, background: 'rgba(255,255,255,0.52)' }} />
        <div style={{ position: 'absolute', right: 22, bottom: 22, width: 46, height: 46, borderRadius: 999, background: 'rgba(232,72,63,0.08)' }} />
        <div style={{ padding: '26px 23px 27px', position: 'relative' }}>
          <p style={{ margin: '0 0 12px', color: THEME.red, fontSize: 12, fontWeight: 950, letterSpacing: '0.18em' }}>STORE OWNER</p>
          <h2 style={{ margin: 0, color: THEME.navy, fontSize: 24, fontWeight: 950, lineHeight: 1.32, letterSpacing: '-0.02em' }}>名古屋近辺のお店を<br />行きたい人へ<br />届けませんか？</h2>
          <p style={{ margin: '14px 0 0', color: '#6B4B4A', fontSize: 14, fontWeight: 800, lineHeight: 1.85 }}>記事掲載・NEW!掲載・Googleマップ導線・SNS投稿まで。<br />お店の魅力が届く形を<br />一緒に作ります。</p>
          <Link href="/partner" style={{ marginTop: 22, minHeight: 54, padding: '0 28px', borderRadius: 999, background: 'linear-gradient(135deg,#E8483F,#FF4F52)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, textDecoration: 'none', fontSize: 14, fontWeight: 950, boxShadow: '0 12px 24px rgba(232,72,63,0.30)' }}>{JP.partnerCta} <ArrowRightIcon /></Link>
        </div>
      </div>
    </section>
  );
}

function FollowSection() {
  return (
    <section style={{ padding: '0 16px 34px' }}>
      <div style={{ borderRadius: 26, background: 'linear-gradient(180deg,#FFFFFF 0%,#FFF8F7 100%)', border: '1px solid #F0D6D2', boxShadow: '0 8px 22px rgba(7,26,77,0.08)', padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: THEME.red, fontSize: 16, fontWeight: 950, letterSpacing: '0.18em' }}>FOLLOW US</p>
        <h2 style={{ margin: '8px 0 0', color: THEME.navy, fontSize: 18, fontWeight: 950 }}>なごとしゃ公式SNS</h2>
        <div style={{ position: 'relative', margin: '14px auto 0', maxWidth: 390, borderRadius: 20, background: '#fff', color: THEME.gray, fontSize: 11.5, fontWeight: 800, lineHeight: 1.65, padding: '12px 10px', boxShadow: '0 10px 22px rgba(7,26,77,0.08)' }}>
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>名古屋のおでかけ・新店・イベント情報を</span>
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>SNSでもチェックできます。</span>
          <span style={{ position: 'absolute', left: '50%', bottom: -7, width: 14, height: 14, transform: 'translateX(-50%) rotate(45deg)', background: '#fff' }} aria-hidden="true" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 22 }}>
          <a href={OFFICIAL_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ minWidth: 68, minHeight: 68, color: '#18181B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><InstagramLogo /></a>
        </div>
      </div>
    </section>
  );
}

function CenteredHeading({ en, ja }: { en: string; ja: string }) {
  return <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ flex: 1, borderTop: '1.5px dashed rgba(232,72,63,0.36)' }} /><div style={{ textAlign: 'center', flexShrink: 0 }}><p style={{ margin: 0, color: THEME.red, fontSize: 18, fontWeight: 950, letterSpacing: '0.18em', lineHeight: 1 }}>{en}</p><p style={{ margin: '6px 0 0', color: THEME.navy, fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>{ja}</p></div><div style={{ flex: 1, borderTop: '1.5px dashed rgba(232,72,63,0.36)' }} /></div>;
}

function SectionKicker({ en, ja, align = 'center' }: { en: string; ja: string; align?: 'left' | 'center' }) {
  return (
    <div style={{ display: 'inline-flex', minWidth: 0, flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      <p style={{ margin: 0, color: THEME.red, fontSize: 18, fontWeight: 950, lineHeight: 1, letterSpacing: '0.12em', textAlign: align, textTransform: 'uppercase' }}>
        {en}
      </p>
      <h2 style={{ margin: '5px 0 0', color: THEME.navy, fontSize: 13.5, fontWeight: 950, lineHeight: 1.25, letterSpacing: '-0.01em', textAlign: align }}>
        <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{ja}</span>
      </h2>
    </div>
  );
}

function bgPhoto(url: string): CSSProperties { return { backgroundImage: 'url("' + url + '")', backgroundSize: 'cover', backgroundPosition: 'center' }; }
function formatDate(date?: string) { if (!date) return '2026.06'; if (/^\d{4}\.\d{2}\.\d{2}$/.test(date)) return date; if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10).replace(/-/g, '.'); return date; }
function normalizeAreaTag(area?: string) {
  if (!area) return '名古屋';
  if (area.includes('鶴舞')) return '鶴舞';
  if (area.includes('新栄')) return '新栄';
  if (area.includes('名駅') || area.includes('名古屋駅')) return '名駅';
  if (area.includes('栄')) return '栄';
  if (area.includes('大須')) return '大須';
  if (area.includes('金山')) return '金山';
  return area.split(/[ /／・]/)[0] || area;
}

function SectionTitleIcon({ kind }: { kind: string }) {
  if (kind === 'RANKING') {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 9.5 9.2 13 12 6l2.8 7L19 9.5l-1.1 8.2H6.1L5 9.5Z" fill="currentColor" opacity=".95"/><path d="M6.4 20h11.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>;
  }
  if (kind === 'AREA' || kind === 'AREA ARTICLES') {
    return <PinIcon />;
  }
  if (kind === 'FEATURES') {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2 14.5 9l6.2.55-4.7 4.05 1.4 6.1L12 16.5l-5.4 3.2 1.4-6.1-4.7-4.05L9.5 9 12 3.2Z" fill="currentColor"/></svg>;
  }
  if (kind === 'INSTAGRAM') {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.4" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="2"/><circle cx="16.8" cy="7.2" r="1.1" fill="currentColor"/></svg>;
  }
  if (kind === 'NEW ARTICLES') {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5h10.5L19 8v11.5H5V4.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M8 10h8M8 14h8M8 18h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.2"/><path d="M12 8v4l2.8 2.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function InstagramLogo() { return <svg width="54" height="54" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5.2" stroke="currentColor" strokeWidth="1.9"/><circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.9"/><circle cx="17.1" cy="6.9" r="1.35" fill="currentColor"/></svg>; }
function SearchIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="17" y1="17" x2="22" y2="22" /></svg>; }
function MenuIcon() { return <svg width="25" height="19" viewBox="0 0 25 19" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="2" y1="2" x2="23" y2="2" /><line x1="2" y1="9.5" x2="23" y2="9.5" /><line x1="2" y1="17" x2="23" y2="17" /></svg>; }
function CategoryIcon() { return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="6.6" height="6.6" rx="1.4" fill="currentColor" opacity=".92"/><rect x="13.4" y="4" width="6.6" height="6.6" rx="1.4" fill="currentColor" opacity=".72"/><rect x="4" y="13.4" width="6.6" height="6.6" rx="1.4" fill="currentColor" opacity=".72"/><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.4" fill="currentColor" opacity=".92"/></svg>; }
function GachaIcon() { return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.2" fill="#EFF6FF" /><path d="M9 4v3M12 4v3M15 4v3" /><path d="M10 11.2c.2-1.2 1-2 2.3-2s2.2.8 2.2 2c0 .8-.4 1.3-1.2 1.8-.7.4-1 .8-1 1.5" /><circle cx="12.3" cy="17.1" r="1" fill="currentColor" stroke="none" /></svg>; }
function SunIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.2" fill="currentColor" opacity="0.18" /><circle cx="12" cy="12" r="3.6" /><line x1="12" y1="1.8" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22.2" /><line x1="1.8" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22.2" y2="12" /><line x1="4.8" y1="4.8" x2="7" y2="7" /><line x1="17" y1="17" x2="19.2" y2="19.2" /><line x1="19.2" y1="4.8" x2="17" y2="7" /><line x1="7" y1="17" x2="4.8" y2="19.2" /></svg>; }
function PartyIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-14 10 10-14 4z" /><path d="M13 5l1-3" /><path d="M18 10l3-1" /><path d="M10 9l5 5" /></svg>; }
function ShopIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16l-1.5-6h-13L4 10z" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg>; }
function CalendarIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>; }
function PinIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function ArrowRightIcon() { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>; }
function BookmarkIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v17l-6-4-6 4V4z" /></svg>; }












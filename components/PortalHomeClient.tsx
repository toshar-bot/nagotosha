'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';

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
  gachaTitle: '\u304a\u3067\u304b\u3051\u30ac\u30c1\u30e3',
  gachaDescA: '\u540d\u53e4\u5c4b\u306e\u6ce8\u76ee\u30b0\u30eb\u30e1\u3084',
  gachaDescB: '\u304a\u3067\u304b\u3051\u5148\u3092\u30e9\u30f3\u30c0\u30e0\u3067',
  gachaDescC: '\u3054\u7d39\u4ecb\u3057\u307e\u3059\uff01',
  gachaCta: '\u30ac\u30c1\u30e3\u3092\u5f15\u304f',
  gachaSpinCta: '\u30ac\u30c1\u30e3\u3092\u56de\u3057\u3066\u307f\u308b',
  gachaBubbleA: '\u304a\u3067\u304b\u3051\u5148\u3092\u30e9\u30f3\u30c0\u30e0\u3067\u3054\u7d39\u4ecb\u3002',
  gachaBubbleB: '\u4f55\u304c\u51fa\u308b\u304b\u306f\u304a\u697d\u3057\u307f\uff01',
  gachaBubbleC: '\u60c5\u5831\u304c\u5f53\u305f\u308b\uff01',
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
  '@keyframes home-gacha-pack-sink{0%{transform:translate(-50%,0) scale(1);opacity:1}100%{transform:translate(-50%,34px) scale(.93);opacity:.62}}' +
  '@keyframes home-gacha-pack-cut{0%{transform:translate(-50%,0) rotateX(0);opacity:1}100%{transform:translate(-50%,-76px) rotateX(-80deg);opacity:.96}}' +
  '@keyframes home-gacha-opening-light{0%{opacity:0;transform:translate(-50%,10px) scale(.62)}34%{opacity:1;transform:translate(-50%,0) scale(.94)}100%{opacity:.18;transform:translate(-50%,-8px) scale(1.24)}}' +
  '@keyframes home-gacha-white-flash{0%,58%,100%{opacity:0}70%{opacity:.95}82%{opacity:.18}}' +
  '@keyframes home-gacha-particle{0%{opacity:0;transform:translateY(18px) scale(.7)}20%{opacity:1}100%{opacity:0;transform:translateY(-82px) scale(1.1)}}' +
  '@keyframes home-gacha-result-in{0%{opacity:0;transform:translateY(32px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}' +
  '@keyframes home-gacha-luxury-float{0%,100%{transform:translateY(0) rotate(-.9deg)}50%{transform:translateY(-5px) rotate(.8deg)}}' +
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
    eyebrow: '\u540d\u53e4\u5c4b\u3067\u697d\u3057\u3080\u590f\u306e\u591c',
    title: '\u30d3\u30a2\u30ac\u30fc\u30c7\u30f3\u7279\u96c62026',
    copy: '\u30d3\u30fc\u30eb\u3084\u30af\u30e9\u30d5\u30c8\u30d3\u30fc\u30eb\u3092\u697d\u3057\u3081\u308b\u540d\u53e4\u5c4b\u306e\u30d3\u30a2\u30ac\u30fc\u30c7\u30f3\u60c5\u5831\u3092\u304a\u5c4a\u3051\u3002',
    imageUrl: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: '\u9031\u672b\u306e\u304a\u3067\u304b\u3051',
    title: '\u590f\u796d\u308a\u30fb\u82b1\u706b\u5927\u4f1a\u7279\u96c6',
    copy: '\u591c\u98a8\u3068\u5149\u306b\u5305\u307e\u308c\u308b\u3001\u540d\u53e4\u5c4b\u306e\u5b63\u7bc0\u30a4\u30d9\u30f3\u30c8\u3092\u307e\u3068\u3081\u307e\u3057\u305f\u3002',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: '\u65b0\u3057\u3044\u5bc4\u308a\u9053',
    title: '\u591c\u306b\u884c\u304d\u305f\u3044\u540d\u53e4\u5c4b\u30b0\u30eb\u30e1',
    copy: '\u98df\u5f8c\u3082\u697d\u3057\u3081\u308b\u304a\u5e97\u3084\u3001\u4ed5\u4e8b\u5e30\u308a\u306e\u4e00\u8ed2\u3092\u63a2\u305b\u307e\u3059\u3002',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
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
  { title: JP.beerGarden, copy: JP.beerCopy, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80' },
  { title: JP.rainyCafe, copy: JP.rainyCopy, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80' },
  { title: JP.weekendMarket, copy: JP.marketCopy, imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80' },
  { title: JP.giftSweets, copy: JP.giftCopy, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80' },
  { title: JP.dinner, copy: JP.dinnerCopy, imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80' },
];

const FALLBACK_ARTICLES = [
  { id: 'mock-article-1', title: JP.articleCafe, tag: JP.focus, area: JP.nakaSakae, publishedAt: '2026.06.16', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
  { id: 'mock-article-2', title: JP.articleRestaurant, tag: 'NEW', area: JP.nakamuraMeieki, publishedAt: '2026.06.14', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
  { id: 'mock-article-3', title: JP.articleCastle, tag: JP.focus, area: JP.castleArea, publishedAt: '2026.06.10', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80' },
];

type ArticleLike = Pick<FeaturedArticle, 'id' | 'title'> & Partial<FeaturedArticle>;

export default function PortalHomeClient({ featuredArticles }: { featuredArticles: FeaturedArticle[] }) {
  const articles = useMemo<ArticleLike[]>(() => {
    const source = featuredArticles.length > 0 ? featuredArticles : FALLBACK_ARTICLES;
    return source.slice(0, 6).map((article, index) => ({
      ...article,
      imageUrl: article.imageUrl || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].imageUrl,
      tag: article.tag || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].tag,
      area: article.area || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].area,
      publishedAt: article.publishedAt || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].publishedAt,
    }));
  }, [featuredArticles]);

  useBottomNavAutoHide();

  return (
    <div className="min-h-dvh" style={{ background: THEME.white, color: THEME.text }}>
      <style>{HOME_CSS}</style>
      <Header />
      <main className="pb-28">
        <CategoryTabs />
        <HeroSection />
        <NewOpenSection />
        <FeaturesSection />
        <ArticlesSection articles={articles} />
        <GachaSection articles={articles} />
        <StoreOwnerSection />
        <FollowSection />
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
  return (
    <header className="border-b border-[#f2d9d8] bg-white">
      <div className="mx-auto flex min-h-[92px] max-w-[940px] items-center justify-between gap-2 overflow-hidden px-2 py-2">
        <Link href="/" className="flex min-w-0 flex-1 items-center overflow-hidden" aria-label="縺ｪ縺斐→縺励ｃ 繝帙・繝">
          <img
            src="/subjects/nagotosha-header-complete.png"
            alt="縺ｪ縺斐→縺励ｃ 蜷榊商螻区ュ蝣ｱ螻 繝医・繧ｷ繝｣繝ｼ"
            className="block h-[84px] w-full max-w-[calc(100vw-100px)] object-cover object-center sm:h-[96px] sm:max-w-[560px]"
          />
        </Link>
        <nav className="flex shrink-0 items-end gap-1 text-[#061744]" aria-label="header actions">
          <HeaderAction label="讀懃ｴ｢" href="/new" type="search" />
          <HeaderAction label="繧ｬ繝√Ε" href="/game" type="gacha" />
          <HeaderAction label="繝｡繝九Η繝ｼ" href="/area" type="menu" />
        </nav>
      </div>
    </header>
  );
}

function HeaderAction({ label, type, href }: { label: string; type: 'search' | 'gacha' | 'menu'; href?: string }) {
  const icon = type === 'search' ? <SearchIcon /> : type === 'gacha' ? <GachaIcon /> : <MenuIcon />;
  const content = <>{icon}<span style={{ fontSize: 8, fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap' }}>{label}</span></>;
  const style: CSSProperties = { minWidth: 28, color: THEME.navy, textDecoration: 'none', gap: 2 };
  if (href) return <Link href={href} aria-label={label} className="flex flex-col items-center justify-center active:opacity-70" style={style}>{content}</Link>;
  return <button type="button" aria-label={label} className="flex flex-col items-center justify-center active:opacity-70" style={{ ...style, border: 0, padding: 0, background: 'transparent' }}>{content}</button>;
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
  const slides = useMemo(() => [HERO_SLIDES[HERO_SLIDES.length - 1], ...HERO_SLIDES, HERO_SLIDES[0]], []);
  const [position, setPosition] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const active = position <= 0 ? HERO_SLIDES.length - 1 : position >= HERO_SLIDES.length + 1 ? 0 : position - 1;

  const go = (delta: number) => {
    setWithTransition(true);
    setPosition((current) => {
      if (current <= 0 && delta < 0) return current;
      if (current >= HERO_SLIDES.length + 1 && delta > 0) return current;
      return current + delta;
    });
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      go(1);
    }, 4600);
    return () => window.clearInterval(timer);
  }, []);

  const handleTransitionEnd = () => {
    if (position === 0) {
      setWithTransition(false);
      setPosition(HERO_SLIDES.length);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setWithTransition(true));
      });
    }
    if (position === HERO_SLIDES.length + 1) {
      setWithTransition(false);
      setPosition(1);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setWithTransition(true));
      });
    }
  };

  const jumpTo = (index: number) => {
    setWithTransition(true);
    setPosition(index + 1);
  };

  return (
    <section className="px-3 pt-3">
      <div
        className="relative mx-auto max-w-[940px] overflow-hidden rounded-[18px] border border-[#ead7d4] bg-[#120c12] shadow-[0_16px_34px_rgba(28,18,24,0.16)]"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
          const diff = endX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(diff) < 36) return;
          go(diff < 0 ? 1 : -1);
        }}
      >
        <div
          className={`flex ${withTransition ? 'transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]' : ''}`}
          style={{ transform: `translateX(-${position * 100}%)` }}
          onTransitionEnd={(event) => {
            if (event.currentTarget !== event.target) return;
            handleTransitionEnd();
          }}
        >
          {slides.map((slide, index) => (
            <article
              key={`${slide.title}-${index}`}
              className="relative min-h-[280px] min-w-full overflow-hidden sm:min-h-[330px]"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(8,12,24,0.82) 0%, rgba(8,12,24,0.56) 45%, rgba(8,12,24,0.16) 100%), url(${slide.imageUrl})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            >
              <div className="flex h-full min-h-[280px] flex-col justify-center px-8 py-8 text-white sm:min-h-[330px] sm:px-12">
                <p className="text-[15px] font-black tracking-[0.03em] drop-shadow">{slide.eyebrow}</p>
                <h2 className="mt-4 max-w-[560px] text-[31px] font-black leading-tight tracking-[-0.01em] drop-shadow sm:text-[44px]">
                  {slide.title}
                </h2>
                <p className="mt-4 max-w-[520px] text-[14px] font-bold leading-relaxed text-white/92 sm:text-[17px]">
                  {slide.copy}
                </p>
                <Link
                  href="/event"
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-[13px] bg-[#e8212a] px-7 py-3 text-[15px] font-black text-white shadow-[0_12px_24px_rgba(232,33,42,0.26)] transition hover:bg-[#c91720]"
                >
                  {JP.detail}
                  <span aria-hidden="true">{String.fromCharCode(8594)}</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => jumpTo(index)}
            className={`h-3 w-3 rounded-full transition ${active === index ? 'bg-[#e8212a]' : 'bg-[#c7c9cf]'}`}
          />
        ))}
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
    <section className="py-7">
      <CenteredHeading en="NEW OPEN" ja={JP.newOpenSubtitle} />
      <div
        ref={scrollerRef}
        className="mt-5 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onMouseEnter={pause}
        onMouseLeave={resumeLater}
        onTouchStart={pause}
        onTouchEnd={resumeLater}
      >
        {stores.map((store, index) => (
          <article
            key={`${store.name}-${index}`}
            className="flex h-[230px] w-[150px] shrink-0 flex-col overflow-hidden rounded-[14px] border border-[#eadedf] bg-white shadow-[0_10px_24px_rgba(23,34,64,0.1)] sm:w-[178px]"
          >
            <div
              className="h-[96px] bg-cover bg-center"
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

function FeaturesSection() {
  return (
    <section className="px-2.5 py-5">
      <CenteredHeading en="FEATURES" ja={JP.featuresSubtitle} />
      <div className="mx-auto mt-4 grid max-w-[940px] grid-cols-2 gap-2">
        {FEATURE_CARDS.slice(0, 4).map((item) => (
          <FeatureCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ item }: { item: (typeof FEATURE_CARDS)[number] }) {
  return (
    <article
      className="relative h-[138px] min-w-0 overflow-hidden rounded-[14px] border border-white/70 bg-cover bg-center shadow-[0_10px_24px_rgba(14,24,55,0.14)] sm:h-[176px]"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(3,8,24,0.08), rgba(3,8,24,0.76)), url(${item.imageUrl})` }}
    >
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <h3 className="line-clamp-2 text-[13px] font-black leading-snug drop-shadow sm:text-[15px]">{item.title}</h3>
        <p className="mt-1 line-clamp-1 text-[11px] font-bold text-white/88">{item.copy}</p>
      </div>
    </article>
  );
}

type HomeGachaPhase = 'intro' | 'pack' | 'opening' | 'result';

type HomeGachaPreviewCard = {
  title: string;
  category: string;
  imageUrl: string;
  className: string;
  rotate: string;
  delay: string;
};

type GachaResult = {
  title: string;
  category: string;
  shopName: string;
  catchCopy: string;
  area: string;
  imageUrl: string;
  articleUrl: string;
};

function GachaSection({ articles }: { articles: ArticleLike[] }) {
  const [phase, setPhase] = useState<HomeGachaPhase>('intro');
  const [selectedArticle, setSelectedArticle] = useState<ArticleLike | null>(null);
  const resultTimerRef = useRef<number | null>(null);

  const previewCards: HomeGachaPreviewCard[] = [
    {
      title: '東山動植物園',
      category: '人気の動物園',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Koala_in_Higashiyama_Zoo_-_4.jpg',
      className: 'left-[6%] bottom-[8%]',
      rotate: '-9deg',
      delay: '0s',
    },
    {
      title: '名古屋港水族館',
      category: '海のおでかけ',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Killer_whale_at_Port_of_Nagoya_Public_Aquarium_2.jpg',
      className: 'right-[5%] top-[9%]',
      rotate: '8deg',
      delay: '.18s',
    },
    {
      title: 'ひつまぶし',
      category: '名古屋名物',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/57/%E3%81%B2%E3%81%A4%E3%81%BE%E3%81%B6%E3%81%97_%288866834170%29.jpg',
      className: 'left-[6%] top-[9%]',
      rotate: '-7deg',
      delay: '.34s',
    },
    {
      title: '味噌カツ',
      category: '名古屋グルメ',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Miso-Katsu-Teishoku-1.jpg',
      className: 'right-[6%] bottom-[8%]',
      rotate: '9deg',
      delay: '.52s',
    },
  ];

  const sourceArticles = articles.length > 0 ? articles : FALLBACK_ARTICLES;
  const resultArticle = selectedArticle || sourceArticles[0] || FALLBACK_ARTICLES[0];

  useEffect(() => {
    return () => {
      if (resultTimerRef.current !== null) window.clearTimeout(resultTimerRef.current);
    };
  }, []);

  const chooseArticle = () => sourceArticles[Math.floor(Math.random() * sourceArticles.length)] || FALLBACK_ARTICLES[0];

  const startDraw = () => {
    if (resultTimerRef.current !== null) window.clearTimeout(resultTimerRef.current);
    setSelectedArticle(chooseArticle());
    setPhase('pack');
  };

  const openPack = () => {
    if (phase !== 'pack') return;
    setPhase('opening');
    if (resultTimerRef.current !== null) window.clearTimeout(resultTimerRef.current);
    resultTimerRef.current = window.setTimeout(() => {
      setPhase('result');
      resultTimerRef.current = null;
    }, 1450);
  };

  const resetGacha = () => {
    if (resultTimerRef.current !== null) window.clearTimeout(resultTimerRef.current);
    resultTimerRef.current = null;
    setSelectedArticle(null);
    setPhase('intro');
  };

  return (
    <section className="px-4 py-5">
      <div className="relative mx-auto w-full max-w-[940px] overflow-hidden rounded-[28px] border border-[#f4d9cd] bg-[linear-gradient(180deg,#fffaf1_0%,#fff1f2_100%)] px-4 pb-5 pt-5 text-center shadow-[0_16px_38px_rgba(232,72,63,0.12)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              'linear-gradient(135deg, transparent 0 13px, rgba(151,105,28,0.14) 13px 14px, transparent 14px 26px), linear-gradient(45deg, transparent 0 13px, rgba(151,105,28,0.10) 13px 14px, transparent 14px 26px)',
            backgroundSize: '42px 42px',
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,226,148,.48),transparent_31%),linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.20)_42%,rgba(255,238,240,.40))]" />

        {phase === 'intro' && (
          <div className="relative z-10">
            <GachaHeading />
            <div className="relative z-10 mx-auto mt-3 max-w-[430px] rounded-[24px] bg-white px-5 py-3 text-[14px] font-black leading-relaxed text-[#071A4D] shadow-[0_14px_28px_rgba(7,26,77,0.10)] sm:text-[16px]">
              <p>名古屋の魅力がつまったおでかけ先を</p>
              <p>ランダムでご紹介！何が出るかはお楽しみ。</p>
              <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white" aria-hidden="true" />
            </div>

            <div className="relative mx-auto mt-5 h-[316px] max-w-[560px] sm:h-[370px]">
              <div className="pointer-events-none absolute left-1/2 top-[48%] h-[246px] w-[246px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-xl sm:h-[300px] sm:w-[300px]" style={{ background: 'conic-gradient(from 20deg, rgba(255,42,109,0.55), rgba(255,199,57,0.58), rgba(85,255,178,0.42), rgba(72,176,255,0.50), rgba(169,95,255,0.48), rgba(255,42,109,0.55))' }} />
              <div className="pointer-events-none absolute left-1/2 top-[48%] h-[178px] w-[178px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/62 blur-md sm:h-[222px] sm:w-[222px]" />

              {previewCards.map((card) => (
                <GachaPreviewCard key={card.title} card={card} />
              ))}

              <div className="absolute left-1/2 top-[49%] grid h-[140px] w-[98px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[20px] border-[3px] border-white bg-[linear-gradient(145deg,#fff7b5,#ffdb35_22%,#d39400_54%,#f2c000_78%,#fff9c9)] text-[62px] font-black text-[#071A4D] shadow-[0_24px_48px_rgba(148,92,0,0.36),0_0_34px_rgba(255,74,167,0.30),0_0_48px_rgba(77,183,255,0.26)] sm:h-[164px] sm:w-[116px] sm:text-[76px]" style={{ animation: 'gacha-card-pulse 3.8s ease-in-out infinite' }}>
                ?
              </div>
            </div>

            <button type="button" onClick={startDraw} className="relative z-10 mx-auto mt-3 inline-flex h-[54px] min-w-[240px] items-center justify-center rounded-full bg-[#e8483f] px-8 text-[17px] font-black text-white shadow-[0_15px_30px_rgba(232,72,63,0.30)]" style={{ animation: 'home-gacha-cta 3.2s ease-in-out infinite' }}>
              カードを引く
              <span className="ml-3" aria-hidden="true">{String.fromCharCode(8594)}</span>
            </button>
          </div>
        )}

        {phase === 'pack' && (
          <GachaPackScreen onOpen={openPack} />
        )}

        {phase === 'opening' && (
          <GachaOpeningScreen />
        )}

        {phase === 'result' && (
          <GachaResultScreen article={resultArticle} onReset={resetGacha} />
        )}
      </div>
    </section>
  );
}

function GachaHeading() {
  return (
    <div className="relative flex items-center justify-center gap-4">
      <span className="h-px flex-1 border-t border-dashed border-[#e8483f]/45" />
      <div>
        <p className="text-[44px] font-black leading-none tracking-[0.22em] text-[#e72f39] sm:text-[48px]">GACHA</p>
        <h2 className="mt-3 text-[23px] font-black leading-none text-[#071A4D] sm:text-[28px]">おでかけガチャ</h2>
      </div>
      <span className="h-px flex-1 border-t border-dashed border-[#e8483f]/45" />
    </div>
  );
}

function GachaPreviewCard({ card }: { card: HomeGachaPreviewCard }) {
  return (
    <div
      className={'absolute h-[130px] w-[92px] overflow-hidden rounded-[15px] border-[2px] border-[#d8ad3d] bg-[#fff8dc] text-left shadow-[0_16px_30px_rgba(7,26,77,0.22)] ring-1 ring-[#fff1a8]/70 sm:h-[158px] sm:w-[110px] ' + card.className}
      style={{ '--rotate': card.rotate, transform: 'rotate(' + card.rotate + ')', animation: 'home-gacha-card-float 4.4s ease-in-out infinite ' + card.delay } as CSSProperties}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("' + card.imageUrl + '")' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-[#fff8e0]/94" />
      <div className="absolute inset-x-2 bottom-2 text-[#06391e]">
        <p className="rounded border border-[#d6ac43]/70 bg-white/90 px-1 py-1 text-center text-[10px] font-black leading-[1.12] tracking-[-0.04em] shadow-sm sm:text-[12px]">{card.title}</p>
        <p className="mt-0.5 text-center text-[6px] font-black tracking-[0.12em] text-[#9a6a08] sm:text-[7px]">{card.category}</p>
      </div>
    </div>
  );
}

function GachaPackScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative z-10 mx-auto min-h-[560px] max-w-[360px] pt-2 text-center">
      <GachaHeading />
      <div className="pointer-events-none absolute left-1/2 top-[172px] h-[310px] w-[310px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,223,112,.62),rgba(232,72,63,.18)_46%,transparent_72%)] blur-[18px]" />
      <button type="button" onClick={onOpen} className="relative mx-auto mt-7 block h-[350px] w-[238px] select-none active:scale-[0.99]" aria-label="お出かけパックをタップして開封">
        <OdekakePackVisual />
      </button>
      <button type="button" onClick={onOpen} className="relative z-10 mx-auto mt-2 inline-flex h-[52px] min-w-[220px] items-center justify-center rounded-full bg-[#e8483f] px-8 text-[16px] font-black text-white shadow-[0_15px_30px_rgba(232,72,63,0.28)]">
        パックを開ける
      </button>
      <p className="relative z-10 mt-3 text-[12px] font-black text-[#667085]">スワイプ / タップで開封</p>
    </div>
  );
}

function OdekakePackVisual({ opening = false, part = 'full' }: { opening?: boolean; part?: 'full' | 'top' }) {
  if (part === 'top') {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <img
          src="/gacha/odekake-pack-cutout.png"
          alt=""
          className="absolute left-0 top-0 block w-full select-none"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 grid place-items-center" style={{ animation: opening ? undefined : 'home-gacha-pack-float 4.4s ease-in-out infinite' }}>
      <div className="absolute inset-[-10px] rounded-[34px] bg-[radial-gradient(circle_at_50%_50%,rgba(255,226,122,.54),rgba(232,72,63,.15)_42%,transparent_72%)] blur-[18px]" />
      <img
        src="/gacha/odekake-pack-cutout.png"
        alt="お出かけパック"
        className="relative z-10 block h-full w-full select-none object-contain drop-shadow-[0_24px_36px_rgba(109,69,10,0.30)]"
        draggable={false}
      />
    </div>
  );
}

function GachaOpeningScreen() {
  return (
    <div className="relative z-10 mx-auto min-h-[560px] max-w-[360px] pt-2 text-center">
      <p className="text-[28px] font-black tracking-[0.08em] text-[#0f5d3a]">開封中...</p>
      <p className="mt-1 text-sm font-black text-[#071A4D]/70">何が出るかはお楽しみ</p>
      <div className="pointer-events-none absolute left-1/2 top-[170px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_24deg,rgba(255,42,109,.50),rgba(255,220,84,.78),rgba(84,255,187,.52),rgba(88,184,255,.58),rgba(172,100,255,.54),rgba(255,42,109,.50))] blur-[24px]" style={{ animation: 'portal-rainbow-burst 1.5s ease-in-out both' }} />
      <div className="absolute left-1/2 top-[154px] h-[342px] w-[238px] -translate-x-1/2 opacity-82" style={{ animation: 'home-gacha-pack-sink 1.35s ease forwards' }}>
        <OdekakePackVisual opening />
      </div>
      <div className="absolute left-1/2 top-[156px] h-[76px] w-[238px] -translate-x-1/2 overflow-hidden" style={{ animation: 'home-gacha-pack-cut 1.05s cubic-bezier(.17,.95,.22,1) .18s both', transformOrigin: '50% 100%' }}>
        <OdekakePackVisual opening part="top" />
        <div className="absolute inset-x-8 bottom-1 h-[8px] rounded-full bg-white shadow-[0_0_26px_rgba(255,238,149,.98),0_0_64px_rgba(255,80,112,.62)]" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[216px] h-[220px] w-[240px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(255,231,113,.86)_22%,rgba(255,88,111,.22)_52%,transparent_72%)]" style={{ animation: 'home-gacha-opening-light 1.18s ease-in-out .2s both' }} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((spark) => (
        <span key={spark} className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[#f7d468] shadow-[0_0_14px_rgba(255,231,130,.95)]" style={{ left: `${20 + (spark % 4) * 18}%`, top: `${230 + Math.floor(spark / 4) * 52}px`, animation: `home-gacha-particle 1.2s ease-out ${spark * .08}s both` }} />
      ))}
      <div className="pointer-events-none absolute inset-[-24px] bg-white" style={{ animation: 'home-gacha-white-flash 1.45s ease-in-out .45s both' }} />
    </div>
  );
}

function toGachaResult(article: ArticleLike): GachaResult {
  const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/5/57/%E3%81%B2%E3%81%A4%E3%81%BE%E3%81%B6%E3%81%97_%288866834170%29.jpg';
  const storeName = (article as ArticleLike & { storeName?: string }).storeName;

  return {
    title: article.title || JP.hitsumabushi,
    category: article.tag || '名古屋名物',
    shopName: storeName || article.title || 'あつた蓬莱軒',
    catchCopy: article.description || '香ばしく焼き上げた、名古屋らしい一杯で。',
    area: article.area || '熱田',
    imageUrl: article.imageUrl || fallbackImage,
    articleUrl: article.articleUrl || '/card/card_010',
  };
}

function GachaResultScreen({ article, onReset }: { article: ArticleLike; onReset: () => void }) {
  const result = toGachaResult(article);
  return (
    <div className="relative z-10 mx-auto max-w-[430px] px-1 pb-1 pt-1 text-center" style={{ animation: 'home-gacha-result-in .68s cubic-bezier(.2,1,.24,1) both' }}>
      <GachaHeading />
      <div className="pointer-events-none absolute inset-x-0 top-20 h-[520px] rounded-full bg-[radial-gradient(circle_at_50%_28%,rgba(255,232,153,.50),transparent_44%),radial-gradient(circle_at_22%_48%,rgba(255,97,116,.12),transparent_30%),radial-gradient(circle_at_85%_60%,rgba(83,150,96,.12),transparent_28%)]" />
      <div
        className="relative mx-auto mt-6 w-[min(86vw,390px)] overflow-hidden rounded-[26px] border-[2px] border-[#dab559] bg-[linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,0)_28%),linear-gradient(145deg,#b7191f_0%,#7f1016_45%,#c7362d_100%)] p-[12px] shadow-[0_20px_48px_rgba(80,20,15,.22),0_0_0_4px_rgba(255,230,160,.35),inset_0_0_30px_rgba(255,220,130,.18)]"
        style={{ animation: 'home-gacha-luxury-float 4.8s ease-in-out infinite' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 16% 18%,rgba(255,232,150,.8) 0 1px,transparent 2px),radial-gradient(circle at 86% 12%,rgba(255,255,255,.9) 0 1.5px,transparent 3px),radial-gradient(circle at 75% 82%,rgba(255,232,150,.85) 0 1px,transparent 2px),linear-gradient(135deg,transparent 0 13px,rgba(255,225,150,.15) 13px 14px,transparent 14px 28px)', backgroundSize: '100% 100%,100% 100%,100% 100%,42px 42px' }} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_38%,rgba(255,255,255,.42)_47%,rgba(255,236,170,.32)_50%,transparent_60%,transparent_100%)] mix-blend-screen" style={{ animation: 'home-gacha-card-shine 3.6s ease-in-out infinite' }} />
        <div className="pointer-events-none absolute left-3 top-3 h-9 w-9 rounded-tl-[18px] border-l-2 border-t-2 border-[#ffe59a]" />
        <div className="pointer-events-none absolute right-3 top-3 h-9 w-9 rounded-tr-[18px] border-r-2 border-t-2 border-[#ffe59a]" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-9 w-9 rounded-bl-[18px] border-b-2 border-l-2 border-[#ffe59a]" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-9 w-9 rounded-br-[18px] border-b-2 border-r-2 border-[#ffe59a]" />

        {[0, 1, 2, 3, 4, 5].map((spark) => (
          <span
            key={spark}
            className="pointer-events-none absolute h-1.5 w-1.5 rotate-45 bg-[#ffe493] shadow-[0_0_12px_rgba(255,232,150,.95)]"
            style={{
              left: `${12 + (spark * 17) % 78}%`,
              top: `${10 + (spark * 23) % 76}%`,
              animation: `home-gacha-card-twinkle 2.6s ease-in-out ${spark * .22}s infinite`,
            }}
          />
        ))}

        <div className="relative overflow-hidden rounded-[21px] border border-[#f4d681] bg-[#fff7df] px-3 pb-4 pt-4 shadow-[inset_0_0_26px_rgba(103,49,10,.08)]">
          <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(255,255,255,.9), transparent 36%), linear-gradient(135deg, transparent 0 12px, rgba(15,93,58,.08) 12px 13px, transparent 13px 26px)', backgroundSize: '100% 100%,38px 38px' }} />
          <div className="relative mx-auto inline-flex rounded-b-[10px] rounded-t-[18px] border border-[#d6b052] bg-[#0f5d3a] px-5 py-1.5 text-[10px] font-black tracking-[0.18em] text-[#ffe493] shadow-[0_6px_12px_rgba(15,93,58,.18)]">
            NAGOYA COLLECTION CARD
          </div>
          <h3 className="relative mt-4 line-clamp-2 text-center text-[38px] font-black leading-[1.05] tracking-[-0.04em] text-[#174B2F] drop-shadow-[0_2px_0_rgba(255,237,178,.88)]">
            {result.title}
          </h3>
          <div className="relative mt-2 inline-flex rounded-full border border-[#d6b052] bg-[#0f5d3a] px-5 py-1.5 text-[12px] font-black text-[#ffe493] shadow-[0_5px_12px_rgba(15,93,58,.14)]">
            {result.category}
          </div>

          <div className="relative mt-4 h-[300px] overflow-hidden rounded-[20px] border-[2px] border-[#d6b052] bg-cover bg-center shadow-[0_14px_26px_rgba(87,45,15,.18)]" style={{ backgroundImage: 'url("' + result.imageUrl + '")' }}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,.06),transparent_58%,rgba(37,20,8,.18))]" />
          </div>

          <div className="relative mx-1 -mt-1 rounded-[20px] border border-[#d6b052]/80 bg-[linear-gradient(180deg,#fff4d6,#f8dda0)] px-4 py-4 text-left shadow-[0_10px_18px_rgba(87,45,15,.14)]">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#d6b052] bg-[#fff9e8] text-[22px] shadow-inner" aria-hidden="true">🏯</div>
              <div className="min-w-0">
                <p className="line-clamp-1 text-[20px] font-black leading-tight text-[#3b2412]">{result.shopName}</p>
                <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-relaxed text-[#5b4530]">{result.catchCopy}</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="inline-flex rounded-full border border-[#d6b052] bg-[#0f5d3a] px-6 py-1.5 text-[14px] font-black text-[#ffe493]">{result.area}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mx-auto mt-6 grid w-[min(86vw,390px)] gap-3">
        <a href={result.articleUrl} className="inline-flex h-[58px] items-center justify-center rounded-full border border-[#d6b052] bg-[linear-gradient(180deg,#ef4444,#c91723)] text-[18px] font-black text-white no-underline shadow-[0_12px_24px_rgba(185,25,31,.28),inset_0_1px_0_rgba(255,255,255,.28)]">詳細を見る<span className="ml-3 grid h-7 w-7 place-items-center rounded-full border border-white/70 text-[18px]" aria-hidden="true">{String.fromCharCode(8250)}</span></a>
        <button type="button" onClick={onReset} className="inline-flex h-[54px] items-center justify-center rounded-full border border-[#e8483f] bg-white text-[16px] font-black text-[#e8483f] shadow-[0_8px_18px_rgba(80,20,15,.10)]">もう一度回す<span className="ml-4 text-[22px] leading-none" aria-hidden="true">↻</span></button>
      </div>
    </div>
  );
}
function ArticlesSection({ articles }: { articles: ArticleLike[] }) {
  return (
    <section style={{ padding: '26px 0 24px' }}>
      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <SectionKicker en="ARTICLES" ja={JP.articlesSubtitle} align="left" />
        <Link href="/new" style={{ color: THEME.red, fontSize: 12, fontWeight: 950, textDecoration: 'none', paddingBottom: 3 }}>{JP.viewAll} {String.fromCharCode(8250)}</Link>
      </div>
      <div className="home-scroll flex overflow-x-auto" style={{ gap: 14, padding: '15px 16px 4px' }}>
        {articles.map((article, index) => (
          <Link key={article.id || index} href={article.articleUrl || '/new'} style={{ flexShrink: 0, width: 168, borderRadius: 18, overflow: 'hidden', background: '#fff', border: '1px solid ' + THEME.border, boxShadow: '0 7px 20px rgba(7,26,77,0.09)', textDecoration: 'none', color: THEME.text }}>
            <div style={{ position: 'relative', height: 104, ...bgPhoto(article.imageUrl || FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length].imageUrl || '') }}>
              <span style={{ position: 'absolute', left: 10, top: 10, background: article.tag === 'NEW' ? THEME.red : '#FFD746', color: article.tag === 'NEW' ? '#fff' : THEME.navy, fontSize: 10, fontWeight: 950, borderRadius: 8, padding: '4px 8px' }}>{article.tag || JP.focus}</span>
              <span style={{ position: 'absolute', right: 10, top: 10, width: 24, height: 24, borderRadius: 999, background: 'rgba(7,26,77,0.46)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookmarkIcon /></span>
            </div>
            <div style={{ padding: '12px 12px 13px' }}>
              <p style={{ margin: 0, minHeight: 42, color: THEME.text, fontSize: 13.5, fontWeight: 950, lineHeight: 1.42 }}>{article.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 13, color: THEME.gray, fontSize: 10, fontWeight: 750 }}><span>{article.area || JP.nagoya}</span><span>{formatDate(article.publishedAt)}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
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
          <h2 style={{ margin: 0, color: THEME.navy, fontSize: 24, fontWeight: 950, lineHeight: 1.32, letterSpacing: '-0.02em' }}>名古屋のお店を、<br />行きたい人へ届けませんか？</h2>
          <p style={{ margin: '14px 0 0', color: '#6B4B4A', fontSize: 14, fontWeight: 800, lineHeight: 1.85 }}>記事掲載・NEW!掲載・Googleマップ導線・SNS投稿まで。<br />お店の魅力が届く形を一緒に作ります。</p>
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
        <div style={{ position: 'relative', margin: '14px auto 0', maxWidth: 390, borderRadius: 20, background: '#fff', color: THEME.gray, fontSize: 12, fontWeight: 800, lineHeight: 1.65, padding: '12px 14px', boxShadow: '0 10px 22px rgba(7,26,77,0.08)' }}>
          名古屋のおでかけ・新店・イベント情報を<br />SNSでもチェックできます。
          <span style={{ position: 'absolute', left: '50%', bottom: -7, width: 14, height: 14, transform: 'translateX(-50%) rotate(45deg)', background: '#fff' }} aria-hidden="true" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 22 }}>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ minWidth: 68, minHeight: 68, color: '#18181B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><InstagramLogo /></a>
          <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X" style={{ minWidth: 68, minHeight: 68, color: '#18181B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><XLogo /></a>
        </div>
      </div>
    </section>
  );
}

function CenteredHeading({ en, ja }: { en: string; ja: string }) {
  return <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ flex: 1, borderTop: '1.5px dashed rgba(232,72,63,0.36)' }} /><div style={{ textAlign: 'center', flexShrink: 0 }}><p style={{ margin: 0, color: THEME.red, fontSize: 18, fontWeight: 950, letterSpacing: '0.18em', lineHeight: 1 }}>{en}</p><p style={{ margin: '6px 0 0', color: THEME.navy, fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>{ja}</p></div><div style={{ flex: 1, borderTop: '1.5px dashed rgba(232,72,63,0.36)' }} /></div>;
}

function SectionKicker({ en, ja, align = 'center' }: { en: string; ja: string; align?: 'left' | 'center' }) {
  return <div style={{ textAlign: align }}><p style={{ margin: 0, color: THEME.red, fontSize: 19, fontWeight: 950, letterSpacing: '0.18em', lineHeight: 1 }}>{en}</p><p style={{ margin: '6px 0 0', color: THEME.navy, fontSize: 14, fontWeight: 950, lineHeight: 1.25 }}>{ja}</p></div>;
}

function bgPhoto(url: string): CSSProperties { return { backgroundImage: 'url("' + url + '")', backgroundSize: 'cover', backgroundPosition: 'center' }; }
function formatDate(date?: string) { if (!date) return '2026.06'; if (/^\d{4}\.\d{2}\.\d{2}$/.test(date)) return date; if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10).replace(/-/g, '.'); return date; }

function InstagramLogo() { return <svg width="54" height="54" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5.2" stroke="currentColor" strokeWidth="1.9"/><circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.9"/><circle cx="17.1" cy="6.9" r="1.35" fill="currentColor"/></svg>; }
function XLogo() { return <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.4 3.6h5.1l3.55 5.05 4.5-5.05h2.5l-5.8 6.56 6.25 10.24h-5.1l-4.02-5.78-5.13 5.78H3.75l6.46-7.27L4.4 3.6Zm3.02 2.05 9.06 12.64h1.03L8.46 5.65H7.42Z" fill="currentColor"/></svg>; }
function SearchIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="17" y1="17" x2="22" y2="22" /></svg>; }
function MenuIcon() { return <svg width="25" height="19" viewBox="0 0 25 19" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="2" y1="2" x2="23" y2="2" /><line x1="2" y1="9.5" x2="23" y2="9.5" /><line x1="2" y1="17" x2="23" y2="17" /></svg>; }
function GachaIcon() { return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.2" fill="#EFF6FF" /><path d="M9 4v3M12 4v3M15 4v3" /><path d="M10 11.2c.2-1.2 1-2 2.3-2s2.2.8 2.2 2c0 .8-.4 1.3-1.2 1.8-.7.4-1 .8-1 1.5" /><circle cx="12.3" cy="17.1" r="1" fill="currentColor" stroke="none" /></svg>; }
function SunIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.2" fill="currentColor" opacity="0.18" /><circle cx="12" cy="12" r="3.6" /><line x1="12" y1="1.8" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22.2" /><line x1="1.8" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22.2" y2="12" /><line x1="4.8" y1="4.8" x2="7" y2="7" /><line x1="17" y1="17" x2="19.2" y2="19.2" /><line x1="19.2" y1="4.8" x2="17" y2="7" /><line x1="7" y1="17" x2="4.8" y2="19.2" /></svg>; }
function PartyIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-14 10 10-14 4z" /><path d="M13 5l1-3" /><path d="M18 10l3-1" /><path d="M10 9l5 5" /></svg>; }
function ShopIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16l-1.5-6h-13L4 10z" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg>; }
function CalendarIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>; }
function PinIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function ArrowRightIcon() { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>; }
function BookmarkIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v17l-6-4-6 4V4z" /></svg>; }












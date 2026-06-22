import type { CategoryTab, FeaturedArticle, HeroSlide, MoodItem, RankingItem } from '@/types/portal';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: '今日の注目',
    title: '覚王山アパートメント\n秋の手仕事市',
    sub: '10/19(土)・20(日)  10:00〜17:00',
    area: '覚王山',
    /* 晴れた青空 + 白雲 + 地平の暖かさ */
    bg: `
      radial-gradient(ellipse 55% 38% at 22% 18%, rgba(255,255,255,0.88) 0%, transparent 55%),
      radial-gradient(ellipse 40% 28% at 72% 12%, rgba(255,255,255,0.72) 0%, transparent 52%),
      radial-gradient(ellipse 90% 45% at 50% 0%,  rgba(255,255,255,0.58) 0%, transparent 48%),
      linear-gradient(175deg, #c8e8ff 0%, #90c8f0 28%, #5aa8e0 52%, #e8d8b0 78%, #f0e0c0 100%)
    `,
    accentColor: '#0f4a7a',
    badgeBg: 'linear-gradient(135deg, #0f4a7a, #1d6aa8)',
    textShadow: '0 1px 3px rgba(255,255,255,0.6)',
  },
  {
    id: 2,
    badge: 'NEW OPEN',
    title: 'スペシャルティ\nコーヒー専門店',
    sub: '大須に新たな一杯が誕生',
    area: '大須',
    /* 朝の光・コーヒーの温かさ */
    bg: `
      radial-gradient(ellipse 60% 50% at 80% 10%, rgba(255,255,240,0.80) 0%, transparent 58%),
      radial-gradient(ellipse 45% 35% at 15% 22%, rgba(255,245,220,0.65) 0%, transparent 50%),
      radial-gradient(ellipse 100% 40% at 50% 0%, rgba(255,240,200,0.50) 0%, transparent 42%),
      linear-gradient(168deg, #fff3d4 0%, #f5d880 22%, #e8a830 48%, #c07a18 72%, #7a4a10 100%)
    `,
    accentColor: '#5a3008',
    badgeBg: 'linear-gradient(135deg, #c9412d, #e05828)',
    textShadow: '0 1px 3px rgba(255,230,180,0.7)',
  },
  {
    id: 3,
    badge: '週末イベント',
    title: '名古屋港水族館\nシャチ公演が再開',
    sub: '週末は早めの来館がおすすめ',
    area: '名古屋港',
    /* 海の青・深さ・光の差し込み */
    bg: `
      radial-gradient(ellipse 65% 42% at 30% 15%, rgba(220,248,255,0.82) 0%, transparent 55%),
      radial-gradient(ellipse 50% 38% at 78% 8%,  rgba(200,240,255,0.60) 0%, transparent 50%),
      radial-gradient(ellipse 80% 35% at 50% 0%,  rgba(180,230,255,0.55) 0%, transparent 44%),
      linear-gradient(172deg, #d0f0ff 0%, #78ccf0 25%, #2090d8 52%, #0060a8 75%, #003878 100%)
    `,
    accentColor: '#00264e',
    badgeBg: 'linear-gradient(135deg, #007ac0, #0090e0)',
    textShadow: '0 1px 3px rgba(180,230,255,0.7)',
  },
];

export const MOOD_ITEMS: MoodItem[] = [
  { label: '今日',   key: 'today' },
  { label: '今週末', key: 'weekend' },
  { label: '雨の日', key: 'rainy' },
  { label: 'ひとりで', key: 'solo' },
  { label: 'デート', key: 'date' },
  { label: '手土産', key: 'gift' },
];

export const FEATURED_ARTICLES: FeaturedArticle[] = [
  {
    id: 'f1',
    isNew: false,
    tag: 'グルメ',
    title: '矢場とんの新メニュー、みそかつバーガーが話題に',
    area: '矢場町',
    storeName: '矢場とん 矢場町本店',
    address: '愛知県名古屋市中区大須3-6-18',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=%E7%9F%A2%E5%A0%B4%E3%81%A8%E3%82%93%20%E7%9F%A2%E5%A0%B4%E7%94%BA%E6%9C%AC%E5%BA%97',
    mapLabel: '地図で見る',
    trackingId: 'featured-f1-map',
    mapClicks: 0,
    saves: 312,
    views: 4820,
    bg: 'linear-gradient(145deg, #fde8e0 0%, #f8c0a0 55%, #e89070 100%)',
    accentColor: '#9a2810',
  },
  {
    id: 'f2',
    isNew: true,
    tag: '新店',
    title: '錦3丁目に自家製パスタの小さな名店がオープン',
    area: '錦',
    storeName: '錦 自家製パスタ店',
    address: '愛知県名古屋市中区錦3丁目',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=%E5%90%8D%E5%8F%A4%E5%B1%8B%20%E9%8C%A63%E4%B8%81%E7%9B%AE%20%E3%83%91%E3%82%B9%E3%82%BF',
    mapLabel: '地図で見る',
    trackingId: 'featured-f2-map',
    mapClicks: 0,
    saves: 128,
    views: 2430,
    bg: 'linear-gradient(145deg, #e8edf8 0%, #b8c8f0 55%, #8098d8 100%)',
    accentColor: '#1a2f70',
  },
  {
    id: 'f3',
    isNew: false,
    tag: 'イベント',
    title: '栄・久屋大通で光のインスタレーション開催中',
    area: '栄',
    saves: 87,
    views: 1960,
    bg: 'linear-gradient(145deg, #f8f0e0 0%, #e8cc70 55%, #c89830 100%)',
    accentColor: '#5a3a08',
  },
  {
    id: 'f4',
    isNew: true,
    tag: 'カフェ',
    title: '覚王山に映える「白いクリームソーダ」のカフェ',
    area: '覚王山',
    saves: 204,
    views: 3310,
    bg: 'linear-gradient(145deg, #e8f8f0 0%, #a8e0c8 55%, #58b890 100%)',
    accentColor: '#0f4a30',
  },
];

export const RANKING: RankingItem[] = [
  {
    id: 'ranking-osu-mazesoba',
    rank: 1,
    title: '平日でも行列！大須の台湾まぜそば新店が衝撃の旨さ',
    summary: '開店2週間で行列必至の注目店',
    area: '大須',
    storeName: '大須 台湾まぜそば新店',
    address: '愛知県名古屋市中区大須',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=%E5%90%8D%E5%8F%A4%E5%B1%8B%20%E5%A4%A7%E9%A0%88%20%E5%8F%B0%E6%B9%BE%E3%81%BE%E3%81%9C%E3%81%9D%E3%81%B0',
    mapLabel: '地図で見る',
    trackingId: 'ranking-1-map',
    mapClicks: 0,
    date: '10/15',
    views: 6240,
    bg: 'linear-gradient(128deg, #fff0e8 0%, #ffd0a8 60%, #f0a870 100%)',
    rankColor: '#c9412d',
  },
  {
    id: 'ranking-nagoya-castle-garden',
    rank: 2,
    title: '名古屋城二の丸東庭園、紅葉の見頃は今週末',
    summary: '入場無料・アクセスも抜群',
    area: '名古屋城',
    date: '10/14',
    views: 3980,
    bg: 'linear-gradient(128deg, #fdf8e8 0%, #f0e090 60%, #d8c050 100%)',
    rankColor: '#1d5b73',
  },
  {
    id: 'ranking-kakuozan-market',
    rank: 3,
    title: '覚王山アパートメント秋市、出店者リスト公開',
    summary: '今年は60組以上が出店予定',
    area: '覚王山',
    date: '10/13',
    views: 2850,
    bg: 'linear-gradient(128deg, #edf2fd 0%, #b8c8f0 60%, #88a0d8 100%)',
    rankColor: '#4a3010',
  },
  {
    id: 'ranking-sakae-komeda',
    rank: 4,
    title: '栄・コメダ珈琲創業地の限定メニューが復活',
    summary: '懐かしの味が週末限定で登場',
    area: '栄',
    date: '10/12',
    views: 1920,
    bg: 'linear-gradient(128deg, #edf8f2 0%, #a8e0c0 60%, #70c090 100%)',
    rankColor: '#4a6a8a',
  },
];

export const CATEGORY_TABS: CategoryTab[] = [
  { key: 'today', label: '今日', href: '/event' },
  { key: 'event', label: 'イベント', href: '/event' },
  { key: 'new', label: '新店', href: '/new' },
  { key: 'weekend', label: '週末', href: '/event' },
  { key: 'area', label: 'エリア', href: '/area' },
];

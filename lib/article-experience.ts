export type ArticlePoint = {
  title: string;
  description?: string;
};

export type ArticleRelated = {
  title: string;
  href: string;
  label?: string;
};

export type ArticleVisual = {
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  officialUrl?: string;
  instagramEmbedUrl?: string;
};

export type ShopInfoItem = {
  label: string;
  value: string;
};

export type ArticleExperienceData = {
  badges: string[];
  heroTitle?: string;
  lead: string;
  visual?: ArticleVisual;
  quickPoints: string[];
  highlightPoints: ArticlePoint[];
  introTitle: string;
  introBody: string;
  recommendedPoints: ArticlePoint[];
  recommendedFor: string[];
  shopInfo: ShopInfoItem[];
  related: ArticleRelated[];
  officialUrl?: string;
  mapUrl?: string;
};

const EXPERIENCES: Record<number, ArticleExperienceData> = {
  32: {
    badges: ['NEW OPEN', '新栄', '中華'],
    heroTitle: '新栄に話題のマーラータン専門店『七宝麻辣湯』がオープン',
    lead: '薬膳スープと多彩な具材を自分好みにカスタム。ヘルシーで満足感たっぷりの新定番が新栄に登場！',
    quickPoints: [
      '新栄駅から徒歩圏内の好立地にオープン',
      '薬膳スープ×自由カスタムが魅力のマーラータン専門店',
      '低カロリーで栄養たっぷり、女性にも大人気',
    ],
    highlightPoints: [
      {
        title: '選べる具材が豊富',
        description: '野菜・きのこ・海鮮・お肉まで自由に選べる',
      },
      {
        title: '薬膳スープを選べる',
        description: '旨辛・白湯・トマトなど、その日の気分で楽しめる',
      },
      {
        title: '追加トッピングも充実',
        description: 'ヘルシーだけど満足感のある一杯にできる',
      },
    ],
    introTitle: 'どんなお店？',
    introBody:
      '2025年6月、新栄エリアにマーラータン専門店「七宝麻辣湯 新栄店」がオープン。好きな具材を選び、自分だけの一杯を楽しめるのが魅力です。薬膳の力で体の内側から温まる、今注目の新店です。',
    recommendedPoints: [
      {
        title: '自分好みにカスタムできる',
        description: '辛さ・具材・スープを自由に選べる',
      },
      {
        title: 'ヘルシーで罪悪感なし',
        description: '野菜たっぷりで低カロリー、高たんぱくも狙える',
      },
      {
        title: 'テイクアウトOK',
        description: '忙しい日でも手軽に楽しめる',
      },
    ],
    recommendedFor: [
      'ヘルシー志向のランチを探している方',
      '辛いもの・薬膳好きな方',
      '自分だけのオリジナルメニューを楽しみたい方',
      '新しいグルメを開拓したい方',
    ],
    shopInfo: [
      { label: '店名', value: '七宝麻辣湯 新栄店' },
      { label: 'エリア', value: '新栄エリア' },
      { label: '営業時間', value: '公式情報で確認' },
      { label: '定休日', value: '公式情報で確認' },
      { label: '予算目安', value: '¥1,000〜¥1,800' },
      { label: '住所', value: '公式情報で確認' },
      { label: 'ジャンル', value: '中華 / マーラータン' },
    ],
    related: [
      {
        title: '名古屋駅で話題のベーカリーエリアがリニューアル',
        href: '/article/39',
        label: 'NEW OPEN',
      },
      {
        title: '栄エリアの新店カフェまとめ',
        href: '/article/8',
        label: 'グルメ',
      },
    ],
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=七宝麻辣湯+新栄店',
  },

  39: {
    badges: ['名駅', 'ベーカリー', 'NEW OPEN'],
    lead: 'JR名古屋タカシマヤの地下フードフロアに、人気ベーカリーブランドが集まるリニューアルエリアが登場。',
    quickPoints: [
      '名古屋駅直結で立ち寄りやすい',
      '人気ベーカリーをまとめて楽しめる',
      '手土産や雨の日のおでかけにも便利',
    ],
    highlightPoints: [
      {
        title: '駅直結でアクセスしやすい',
        description: '買い物や移動の合間にも立ち寄りやすい立地です。',
      },
      {
        title: '手土産にも使いやすい',
        description: 'パン好きへのギフトや自分用のご褒美にも向いています。',
      },
    ],
    introTitle: 'どんなスポット？',
    introBody:
      'JR名古屋駅直結の便利なフロアで、話題のベーカリーを気軽に楽しめる注目エリアです。',
    recommendedPoints: [
      {
        title: '移動前後に寄りやすい',
        description: '駅直結なので、天気を気にせず使いやすいのが魅力です。',
      },
      {
        title: '複数ブランドを比べられる',
        description: '気になるパンを少しずつ選べます。',
      },
    ],
    recommendedFor: [
      'パンが好きな方',
      '名古屋駅で手土産を探している方',
      '雨の日でも使いやすいスポットを探している方',
    ],
    shopInfo: [
      { label: '施設', value: 'JR名古屋タカシマヤ' },
      { label: 'エリア', value: '名古屋駅' },
      { label: 'ジャンル', value: 'ベーカリー / 手土産' },
    ],
    related: [
      {
        title: '新栄に話題のマーラータン専門店がオープン',
        href: '/article/32',
        label: 'NEW OPEN',
      },
    ],
    officialUrl: 'https://www.jr-takashimaya.co.jp/',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=JR名古屋タカシマヤ',
  },
};

export function getArticleExperience(postId: number): ArticleExperienceData | undefined {
  return EXPERIENCES[postId];
}

export function getFakeSaveCount(id: string | number): number {
  const n = Number(id) || 1;
  return 8200 + ((n * 137) % 6200);
}

export type ArticlePoint = {
  title: string;
  description?: string;
};

export type ArticleExternalVisual = {
  id: string;
  type: 'instagram_embed' | 'permitted_image' | 'official_image' | 'placeholder';
  title: string;
  description?: string;

  // Instagram投稿・公式ページ
  sourceName?: string;
  sourceAccount?: string;
  sourceUrl?: string;
  embedUrl?: string;
  embedHtml?: string;

  // 画像掲載用
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageSourceUrl?: string;

  // 許可管理
  permissionStatus: 'not_contacted' | 'requested' | 'approved' | 'rejected' | 'embed_only' | 'unknown';
  permittedUse?: {
    articleBody?: boolean;
    featuredImage?: boolean;
    listThumbnail?: boolean;
    snsPost?: boolean;
  };

  permissionNote?: string;
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
  layout?: 'store' | 'guide';
  badges: string[];
  heroTitle?: string;
  lead: string;
  visual?: ArticleVisual;
  quickPoints?: string[];
  highlightPoints?: ArticlePoint[];
  introTitle?: string;
  introBody?: string;
  recommendedPoints?: ArticlePoint[];
  recommendedFor?: string[];
  shopInfo?: ShopInfoItem[];
  related: ArticleRelated[];
  officialUrl?: string;
  mapUrl?: string;

  // 外部ビジュアル管理（Instagram埋め込み・許可済み画像）
  externalVisuals?: ArticleExternalVisual[];
  featuredVisual?: ArticleExternalVisual;
  instagramCandidates?: ArticleExternalVisual[];
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

  56: {
    badges: ['名駅', '手土産', 'ガイド'],
    heroTitle: '名古屋駅で買える手土産。定番から新定番まで、もらって嬉しいお菓子ガイド',
    lead: '出張帰りや帰省前に役立つ、名古屋駅の手土産ガイドです。売り場・予算・用途別に選び方をまとめました。',
    quickPoints: [
      '新幹線乗り場から近い売り場を中心に紹介',
      '500円台〜3,000円台まで、予算別の選び方を整理',
      '職場・訪問先・帰省など、シーン別に使い分けしやすい',
    ],
    highlightPoints: [
      {
        title: 'JR名古屋タカシマヤが起点',
        description: 'JR名古屋駅直結で時間がないときも使いやすい',
      },
      {
        title: '用途別に選びやすい',
        description: '職場バラまき・訪問先ご挨拶・帰省土産で選び方を整理',
      },
    ],
    introTitle: 'このガイドについて',
    introBody: '名古屋駅で手土産を選ぶ際、売り場と予算だけ決めておけば迷いにくくなります。新幹線乗車前や出張帰りの短時間でも使いやすいよう、エリア別・予算別・用途別にまとめました。',
    recommendedPoints: [
      {
        title: '短時間で決めやすい',
        description: 'JR名古屋タカシマヤを起点にすると動線が短い',
      },
      {
        title: '予算幅が広い',
        description: '500円台のバラまきから3,000円台のご挨拶用まで対応',
      },
    ],
    recommendedFor: [
      '出張帰りに名古屋駅で手土産を買いたい人',
      '新幹線に乗る前に短時間で選びたい人',
      '訪問先に持っていく手土産で迷っている人',
      '毎回同じ手土産になってしまう人',
    ],
    shopInfo: [
      { label: '主な売り場', value: 'JR名古屋タカシマヤ・エスカ地下街・近鉄パッセ・名鉄百貨店' },
      { label: 'エリア', value: '名古屋駅周辺' },
      { label: '予算目安', value: '500円台〜3,000円台以上' },
    ],
    related: [
      {
        title: 'JR名古屋タカシマヤ デリシャスコートがリニューアルオープン',
        href: '/article/39',
        label: '名駅',
      },
    ],
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=JR名古屋タカシマヤ',

    externalVisuals: [
      {
        id: 'nagoya-station-gift-instagram-slot-1',
        type: 'instagram_embed',
        title: '名古屋駅手土産のInstagram投稿枠',
        description: '許可を取ったInstagram投稿をここに埋め込む想定',
        permissionStatus: 'not_contacted',
        permittedUse: {
          articleBody: false,
          featuredImage: false,
          listThumbnail: false,
          snsPost: false,
        },
        permissionNote: '投稿者へDMで使用範囲（記事本文・アイキャッチ・一覧・SNS投稿）を分けて確認してから掲載する',
      },
      {
        id: 'nagoya-station-gift-featured-slot-1',
        type: 'permitted_image',
        title: 'アイキャッチ候補画像枠',
        description: '許可済み画像をアイキャッチ・一覧カードに使う想定',
        permissionStatus: 'not_contacted',
        permittedUse: {
          articleBody: false,
          featuredImage: false,
          listThumbnail: false,
          snsPost: false,
        },
        permissionNote: '記事内・一覧カード・なごとしゃ公式SNS投稿での使用可否を分けて確認する',
      },
    ],
    instagramCandidates: [],
  },

  58: {
    layout: 'guide',
    badges: ['雨の日', '名古屋', 'おでかけ'],
    lead: '雨の日の名古屋で行き先に迷ったら。水族館、鉄道館、科学館、栄・名駅・大須・ノリタケ周辺など、屋内で過ごしやすいスポットを7つ紹介します。',
    related: [
      {
        title: '名古屋駅で買える手土産。定番から新定番まで、もらって嬉しいお菓子ガイド',
        href: '/article/56',
        label: '手土産',
      },
      {
        title: '新栄に話題のマーラータン専門店『七宝麻辣湯』がオープン',
        href: '/article/32',
        label: 'NEW OPEN',
      },
    ],
  },

  66: {
    layout: 'guide',
    badges: ['モーニング', '名古屋', 'グルメ'],
    lead: 'ドリンクを頼むと朝食がついてくる、名古屋のモーニング文化。仕組み・小倉トーストの楽しみ方・チェーンと純喫茶の選び方・シーン別の使い方を、名古屋の飲食店主がやさしく解説します。',
    related: [
      {
        title: '雨の日の名古屋どこ行く？屋内で過ごしやすいおでかけスポット7選',
        href: '/article/58',
        label: 'おでかけ',
      },
      {
        title: '名古屋駅で買える手土産。定番から新定番まで、もらって嬉しいお菓子ガイド',
        href: '/article/56',
        label: '手土産',
      },
    ],
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

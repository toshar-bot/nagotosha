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
  relationshipLabel?: 'PR・提供情報' | '運営関係';
  imageUrl?: string;
  imageAlt?: string;
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

export type FeaturePick = {
  name: string;
  area: string;
  description: string;
  badges: string[];
  tone?: 'navy' | 'red' | 'gold';
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
};

export type FeatureVenue = {
  name: string;
  area: string;
  feature: string;
  period: string;
  station: string;
  reservation: string;
  place: string;
  hours: string;
  price: string;
  booking: string;
  officialUrl?: string;
  mapUrl?: string;
  source: string;
};

export type FeatureTip = {
  title: string;
  body: string;
};

export type FeatureArticleData = {
  breadcrumb: string[];
  eyebrow: string;
  updatedLabel: string;
  imageCaption: string;
  points: string[];
  audience: string[];
  picks: FeaturePick[];
  venues: FeatureVenue[];
  tips: FeatureTip[];
  sourceNotes: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref: string;
  ctaLabel: string;
};

export type NewsSpot = {
  name: string;
  area: string;
  openDate: string;
  genre: string;
  summary: string;
  forWhom: string;
  tone?: 'warm' | 'cream' | 'blue' | 'navy';
  visualLabel?: string;
  imageUrl?: string;
  imageAlt: string;
  imageCredit?: string;
  officialUrl?: string;
  officialLabel: string;
  mapUrl?: string;
  source: string;
  articleUrl?: string;
};

export type NewsArticleData = {
  breadcrumb: string[];
  eyebrow: string;
  updatedLabel: string;
  imageCaption: string;
  quickJumpLabel: string;
  quickJumpText: string;
  purposeChips?: string[];
  spotsTitle?: string;
  comparisonTitle?: string;
  mapTitle?: string;
  points: string[];
  spots: NewsSpot[];
  editorTips: ArticlePoint[];
  sourceNotes: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref: string;
  ctaLabel: string;
};

export type EventRoundupVisual = {
  type: 'image' | 'generated';
  imageUrl?: string;
  imageAlt?: string;
  creditText?: string;
};

export type EventRoundupFilter = {
  id: string;
  label: string;
};

export type EventRoundupItem = {
  id: string;
  dateLabel: string;
  startDate: string;
  endDate?: string;
  name: string;
  area: string;
  venue: string;
  station: string | null;
  ticketStatus: string | null;
  shortCopy: string;
  shortDescription?: string | null;
  anchorId?: string;
  mapQuery?: string | null;
  officialUrl: string;
  visual: EventRoundupVisual;
  priceSummary?: string | null;
  indoorOutdoor?: string | null;
  familySuitability?: string | null;
  nearestStation?: string | null;
  verifiedAt?: string | null;
  filterTags?: string[];
};

export type EventRoundupData = {
  title: string;
  description: string;
  swipeLabel: string;
  items: EventRoundupItem[];
  variant?: 'rail' | 'list';
  articleType?: 'event_roundup';
  relationship?: 'editorial' | 'pr' | 'owned' | 'unknown';
  filters?: EventRoundupFilter[];
  inlineListClassName?: string;
  placement?: 'afterHero' | 'afterQuickPoints';
};

const ARTICLE_THUMBNAILS: Record<string, { imageUrl: string; imageAlt: string }> = {
  '/article/32': {
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/06/chipao-maratan016.jpg',
    imageAlt: '七宝麻辣湯 新栄店のマーラータン',
  },
  '/article/39': {
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/06/takashimaya-bakery-202606001.jpg',
    imageAlt: 'JR名古屋タカシマヤ デリシャスコートのベーカリーリニューアルイメージ',
  },
  '/article/58': {
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/codex-clipboard-1bb1e995-d46b-4fc8-bfa6-69e6dd6cf39d.png',
    imageAlt: '雨の日の名古屋で屋内スポットを探すイメージ',
  },
  '/article/66': {
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-morning-culture-eyecatch.png',
    imageAlt: '小倉トーストとコーヒーのイラスト',
  },
  '/article/73': {
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-omiyage-eyecatch.png',
    imageAlt: '明るい室内で包装された手土産と焼き菓子を並べたイメージ',
  },
  '/article/79': {
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-beer-garden-2026-eyecatch.png',
    imageAlt: '名古屋の屋上ビアガーデンのイメージイラスト',
  },
  '/article/83': {
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-haera-prtimes.jpg',
    imageAlt: '名古屋の新店オープン情報2026年夏版',
  },
  '/article/92': {
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pasta-mania-tsurumai-prtimes.jpg',
    imageAlt: 'PASTA MANIA 鶴舞店のイメージ',
  },
};

function withRelatedThumbnails(related: ArticleRelated[]): ArticleRelated[] {
  return related.map((item) => ({
    ...ARTICLE_THUMBNAILS[item.href],
    ...item,
  }));
}

export type ShopSpotQuickCard = {
  icon: 'calendar' | 'food' | 'gift' | 'pin';
  title: string;
  body: string;
};

// 単品新店記事の共有データ。将来トップ横スライダー・新店まとめ・エリア別一覧へ再利用する
export type ShopSpot = {
  id: string;
  type: 'new-open';
  name: string;
  title: string;
  area: string;        // 機械用スラッグ(例: 'sakae')
  areaLabel: string;   // 表示用(例: '栄 / HAERA B1F')
  openDate: string;    // ISO形式 'YYYY-MM-DD'
  genre: string[];
  tags: string[];
  summary: string;
  forWhom: string[];
  quickCards?: ShopSpotQuickCard[];
  imageUrl?: string;   // 出典を明記できる画像URL。使用可否は記事ごとに確認する
  imageCredit?: string;
  galleryImages?: { url: string; credit: string }[];
  officialUrl?: string;
  officialLabel?: string;
  mapUrl: string;
  source: string;
  relatedArticleIds: number[];
  parentSpot?: string;
  isFeatured: boolean;
  publishDate: string;
  articleUrl: string;
};

export type ArticleExperienceData = {
  layout?: 'store' | 'guide' | 'feature' | 'news';
  articleType?: 'event_roundup';
  relationship?: 'editorial' | 'pr' | 'owned' | 'unknown';
  shop?: ShopSpot;
  badges: string[];
  heroTitle?: string;
  lead: string;
  visual?: ArticleVisual;
  quickPoints?: string[];
  highlightTitle?: string;
  highlightPoints?: ArticlePoint[];
  introTitle?: string;
  introBody?: string;
  recommendedTitle?: string;
  recommendedPoints?: ArticlePoint[];
  recommendedForTitle?: string;
  recommendedFor?: string[];
  shopInfo?: ShopInfoItem[];
  related: ArticleRelated[];
  officialUrl?: string;
  mapUrl?: string;
  feature?: FeatureArticleData;
  news?: NewsArticleData;
  eventRoundup?: EventRoundupData;

  // 外部ビジュアル管理（Instagram埋め込み・許可済み画像）
  externalVisuals?: ArticleExternalVisual[];
  featuredVisual?: ArticleExternalVisual;
  instagramCandidates?: ArticleExternalVisual[];
};

// 単品新店記事レジストリ。
// ※以下のサンプル1件は development preview 専用の未検証データ。
//   事実項目(オープン日・場所・公式URL等)はすべて「要確認」であり、
//   一次情報での裏取りが済むまで本番記事にしない。
export const SHOP_SPOTS: Record<string, ShopSpot> = {
  'shop-pasta-mania-tsurumai': {
    id: 'shop-pasta-mania-tsurumai',
    type: 'new-open',
    name: 'PASTA MANIA 鶴舞店',
    title: '【鶴舞・新店】PASTA MANIA 鶴舞店がオープン。ランチは通常営業、ディナーは予約制',
    area: 'tsurumai',
    areaLabel: '鶴舞 / 名古屋市中区',
    openDate: '2026-07-03',
    genre: ['パスタ専門店', 'ランチ', 'ディナー'],
    tags: ['新店', '鶴舞', 'パスタ', 'ランチ', 'ディナー'],
    summary: '鶴舞駅から徒歩約3分のパスタ専門店。ランチは通常営業、ディナーは完全予約制と案内されています。',
    forWhom: [
      '鶴舞・千種エリアでランチやディナーの候補を探している人',
      '本格的なパスタを食べたい人',
      'ディナーを予約してゆっくり食事を楽しみたい人',
      '鶴舞の新店を開拓したい人',
    ],
    quickCards: [
      { icon: 'calendar', title: '7月3日オープン', body: '鶴舞にオープンしたパスタ専門店' },
      { icon: 'food', title: '本格パスタ', body: 'パスタ専門店。ランチ・ディナーで利用可' },
      { icon: 'pin', title: '鶴舞駅 徒歩約3分', body: '地下鉄鶴舞線「鶴舞駅」1出口から' },
      { icon: 'calendar', title: 'ディナーは予約制', body: 'ランチは通常営業、ディナーは完全予約制' },
    ],
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pasta-mania-tsurumai-prtimes.jpg',
    imageCredit: '株式会社PASTAMANIA / PR TIMES',
    galleryImages: [
      {
        url: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pasta-mania-tsurumai-prtimes.jpg',
        credit: '株式会社PASTAMANIA / PR TIMES',
      },
    ],
    officialUrl: 'https://www.pastamania.jp',
    officialLabel: 'PASTA MANIA公式サイト',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=PASTA+MANIA+鶴舞店',
    source: 'PR TIMES「PASTA MANIA」リリース（2026年7月時点）',
    relatedArticleIds: [83],
    isFeatured: true,
    publishDate: '2026-07-05',
    articleUrl: '/article/92',
  },
  'shop-shippo-malatang-shinsakae': {
    id: 'shop-shippo-malatang-shinsakae',
    type: 'new-open',
    name: '七宝麻辣湯 新栄店',
    title: '行列のできるマーラータン専門店『七宝麻辣湯』が新栄にオープン',
    area: 'shinsakae',
    areaLabel: '新栄 / 名古屋市中区',
    openDate: '2026-06-19',
    genre: ['マーラータン専門店', '薬膳', 'ランチ', 'ディナー'],
    tags: ['新店', '新栄', 'マーラータン', '中華', '薬膳'],
    summary: '新栄駅から徒歩約3分のマーラータン専門店。約50種類の具材と薬膳スープを組み合わせて楽しめます。',
    forWhom: [
      '新栄エリアでランチやディナーの候補を探している人',
      'マーラータンや薬膳スープを楽しみたい人',
      '具材や辛さを自分好みに選びたい人',
      '中区の新店グルメを開拓したい人',
    ],
    quickCards: [
      { icon: 'calendar', title: '6月19日オープン', body: '新栄にオープンしたマーラータン専門店' },
      { icon: 'food', title: '約50種類の具材', body: '具材を選んで自分好みにカスタマイズ' },
      { icon: 'pin', title: '新栄駅 徒歩約3分', body: '地下鉄新栄町駅から歩きやすい立地' },
      { icon: 'calendar', title: '11:00〜23:00', body: '昼から夜まで通し営業と案内されています' },
    ],
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/06/chipao-maratan016.jpg',
    imageCredit: 'なごとしゃ掲載画像',
    galleryImages: [
      {
        url: 'https://nagotosha.com/wp-content/uploads/2026/06/chipao-maratan016.jpg',
        credit: 'なごとしゃ掲載画像',
      },
    ],
    officialUrl: 'https://maratan.com/七宝麻辣湯　新栄店',
    officialLabel: '七宝麻辣湯公式サイト',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=七宝麻辣湯%20新栄店',
    source: '七宝麻辣湯公式 新栄店ページ、公式6月新店オープン告知',
    relatedArticleIds: [83],
    isFeatured: true,
    publishDate: '2026-06-19',
    articleUrl: '/article/32',
  },
  'shop-pierre-marcolini-haera': {
    id: 'shop-pierre-marcolini-haera',
    type: 'new-open',
    name: 'PIERRE MARCOLINI HAERA店', // 要確認: 正式店舗名
    title: 'PIERRE MARCOLINI HAERA店が栄にオープン！ショコラ×カフェ×ギフトが楽しめる注目店',
    area: 'sakae',
    areaLabel: '栄 / HAERA B1F', // 要確認: フロア
    openDate: '2026-06-11', // 要確認: 開店日
    genre: ['カフェ', 'スイーツ', '手土産'],
    tags: ['栄', 'HAERA内', 'カフェ', 'スイーツ', '手土産'],
    summary: 'HAERA B1Fにオープンしたショコラブランドのカフェ。ショコラや焼き菓子の販売に加え、カフェスペースも併設と案内されています。', // 要確認
    forWhom: [
      '栄で上質なカフェやスイーツを楽しみたい人',
      '手土産・ギフトを探している人',
      'ちょっと特別なカフェ時間を過ごしたい人',
    ],
    quickCards: [
      { icon: 'calendar', title: '6/11オープン', body: '栄の新商業施設HAERA B1Fに新規出店' }, // 要確認
      { icon: 'food', title: 'ショコラ&カフェ', body: '上質なショコラとカフェメニューが楽しめる' }, // 要確認
      { icon: 'gift', title: 'ギフトにも', body: '手土産や贈り物にぴったりの定番ブランド' },
      { icon: 'pin', title: '栄駅直結', body: 'HAERA内なのでアクセスも抜群' }, // 要確認
    ],
    imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pierre-marcolini-haera.jpg',
    imageCredit: 'HAERA公式',
    galleryImages: [
      {
        url: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pierre-marcolini-haera.jpg',
        credit: 'HAERA公式',
      },
    ],
    officialUrl: 'https://haera.parco.jp/shop/detail/?cd=000032',
    officialLabel: 'HAERA公式サイト',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=PIERRE+MARCOLINI+HAERA+%E6%A0%84',
    source: '公式サイト(未検証サンプル・公開前に一次情報で要確認)',
    relatedArticleIds: [83, 79],
    parentSpot: 'HAERA',
    isFeatured: false, // トップ横スライダー接続は別フェーズ。本番未接続
    publishDate: '2026-07-04',
    articleUrl: '/article/104',
  },
};

const EXPERIENCES: Record<number, ArticleExperienceData> = {
  32: {
    layout: 'store',
    shop: SHOP_SPOTS['shop-shippo-malatang-shinsakae'],
    badges: ['NEW OPEN', '新栄', '中華'],
    heroTitle: '行列のできるマーラータン専門店『七宝麻辣湯』が新栄にオープン',
    lead: '新栄駅から徒歩約3分。約50種類の具材と薬膳スープを組み合わせて楽しめるマーラータン専門店です。',
    visual: {
      imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/06/chipao-maratan016.jpg',
      imageAlt: '七宝麻辣湯 新栄店のマーラータン',
      imageCredit: 'なごとしゃ掲載画像',
      imageSourceUrl: 'https://nagotosha.com/2026/06/19/shippo-malatang-shinsakae-new-open/',
    },
    recommendedFor: [
      '新栄エリアでランチやディナーの候補を探している人',
      'マーラータンや薬膳スープを楽しみたい人',
      '具材や辛さを自分好みに選びたい人',
      '中区の新店グルメを開拓したい人',
    ],
    shopInfo: [
      { label: '店名', value: '七宝麻辣湯 新栄店' },
      { label: 'エリア', value: '新栄 / 名古屋市中区' },
      { label: 'オープン日', value: '2026年6月19日' },
      { label: 'ジャンル', value: 'マーラータン専門店 / 薬膳 / ランチ / ディナー' },
      { label: 'アクセス', value: '地下鉄新栄町駅 徒歩3分' },
      { label: '営業時間', value: '11:00〜23:00（L.O.22:30）' },
      { label: '定休日', value: '年中無休（年末年始は休みの場合あり）' },
      { label: '住所', value: '愛知県名古屋市中区新栄1-6-7' },
    ],
    related: [
      {
        title: '名古屋の新店オープン情報2026年夏版',
        href: '/article/83',
        label: '新店まとめ',
      },
    ],
    officialUrl: 'https://maratan.com/七宝麻辣湯　新栄店',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=七宝麻辣湯%20新栄店',
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
    badges: ['保存版ガイド', '雨の日', '屋内スポット'],
    heroTitle: '雨の日の名古屋どこ行く？',
    lead: '屋内で過ごしやすいおでかけスポット7選。子連れ、デート、ひとり、買い物、短時間など、雨の日の目的別に選びやすい候補を整理します。',
    visual: {
      imageAlt: '雨の日の名古屋で屋内スポットを探すイメージ',
      imageCredit: 'なごとしゃ編集部作成のイメージ',
    },
    quickPoints: [
      '子連れなら名古屋港水族館、FUJIなごや科学館、リニア・鉄道館が候補。',
      'デートなら名古屋港水族館、ノリタケの森、栄周辺が使いやすい。',
      'ひとりならトヨタ産業技術記念館や名駅周辺でゆっくり過ごしやすい。',
      '短時間なら名駅・栄の駅近導線を選ぶと雨の日でも動きやすい。',
    ],
    highlightTitle: 'シーン別おすすめ7選',
    highlightPoints: [
      {
        title: '名古屋港水族館',
        description: '名古屋港エリア。子連れ、デート、半日滞在に向く定番スポット。館内展示を中心に楽しめるため、天気に左右されにくい候補です。',
      },
      {
        title: 'FUJIなごや科学館',
        description: '伏見 / 白川公園エリア。子連れ、デート、学び系のおでかけに。展示やプラネタリウムなど、屋内で過ごしやすい要素が多いスポットです。',
      },
      {
        title: 'リニア・鉄道館',
        description: '金城ふ頭エリア。子連れ、鉄道好き、友人とのおでかけに。車両展示やジオラマなど、屋内で見ごたえを作りやすいスポットです。',
      },
      {
        title: 'トヨタ産業技術記念館',
        description: '亀島 / 栄生エリア。子連れ、ひとり、観光に。名古屋らしさを感じながら、ものづくりや産業の展示を屋内でじっくり見られます。',
      },
      {
        title: 'JRゲートタワー / タカシマヤ ゲートタワーモール',
        description: '名駅エリア。買い物、ランチ、ひとり、待ち合わせに。駅直結・駅近の商業施設導線で、短時間でも使いやすい候補です。',
      },
      {
        title: 'オアシス21 / 栄地下街周辺',
        description: '栄エリア。友人、買い物、短時間のおでかけに。地下街や商業施設と組み合わせると、雨の日でも予定を調整しやすくなります。',
      },
      {
        title: 'ノリタケの森',
        description: '亀島 / 名駅北エリア。デート、友人、買い物に。屋外要素もあるため強い雨の日は注意しつつ、ショップやカフェと組み合わせやすい候補です。',
      },
    ],
    recommendedTitle: '雨の日に行く前のチェックリスト',
    recommendedPoints: [
      { title: '屋内でどれくらい過ごせるか', description: '展示や買い物だけでなく、休憩や食事まで含めて滞在時間を考えると選びやすくなります。' },
      { title: '駅から濡れにくいか', description: '雨が強い日は、駅直結・地下街・屋根のある導線を優先すると移動の負担を減らせます。' },
      { title: '予約やチケットが必要か', description: '施設やイベントによっては事前予約やチケット確認が必要です。出発前に公式サイトを見ておくと安心です。' },
      { title: '休館日や臨時休業', description: '雨の日ほど屋内施設に人が集まりやすいため、休館日・臨時休業・混雑しやすい時間を確認しておきます。' },
      { title: '子ども連れで動きやすいか', description: 'ベビーカー、休憩場所、食事導線、トイレの使いやすさなども、子連れのおでかけでは大切です。' },
      { title: 'カフェや食事導線があるか', description: '半日過ごすなら、施設内や周辺でカフェ・ランチを組み合わせられるかも見ておくと動きやすいです。' },
    ],
    recommendedForTitle: '掲載情報について',
    recommendedFor: [
      '料金・営業時間・休館日・営業状況は変更される場合があります。',
      '最新情報は各施設の公式サイトや店頭案内で確認してください。',
      'この記事では公式画像・施設画像を使用していません。',
    ],
    related: [
      {
        title: '名古屋のモーニング文化ガイド。初めてでも楽しめる喫茶店の朝時間',
        href: '/article/66',
        label: 'モーニング',
      },
      {
        title: '名古屋の手土産、結局なにを選べばいい？地元民向けの差し入れガイド',
        href: '/article/73',
        label: '手土産',
      },
      {
        title: '名古屋ビアガーデン特集2026。夏に行きたい屋上・駅近スポットまとめ',
        href: '/article/79',
        label: '特集',
      },
      {
        title: '名古屋の新店オープン情報2026年夏版',
        href: '/article/83',
        label: '新店まとめ',
      },
    ],
  },

  66: {
    layout: 'guide',
    badges: ['保存版ガイド', '名古屋モーニング', '喫茶店'],
    heroTitle: '名古屋のモーニング文化ガイド',
    lead: '初めてでも楽しめる喫茶店の朝時間。名古屋モーニングの基本と、公式情報を確認できる実名候補を整理します。',
    visual: {
      imageAlt: '小倉トーストとコーヒーのイラスト',
      imageCredit: 'なごとしゃ編集部作成のイメージ',
    },
    quickPoints: [
      '初心者なら、分かりやすく選びやすいコメダ珈琲店から。',
      '老舗喫茶らしさを味わうなら、コンパルが候補。',
      '小倉あん系の地元感を楽しみたいなら、BUCYO Coffeeもチェック。',
      '時間・内容・価格は店ごとに違うため、事前確認が大切。',
    ],
    highlightTitle: '実名で見る名古屋モーニング候補3選',
    highlightPoints: [
      {
        title: '初心者向け定番: コメダ珈琲店',
        description: '毎朝開店から午前11時まで、ドリンク注文でパンと具材を選べるモーニングサービスを公式情報で確認。おぐらあんも選べます。',
      },
      {
        title: '老舗喫茶らしさ: コンパル',
        description: '昭和22年創業の老舗喫茶。公式メニューで「モーニングセット（ハムエッグトースト）」と、好きなドリンク+200円を確認。提供時間は店舗確認がおすすめです。',
      },
      {
        title: '小倉あん系・地元感: BUCYO Coffee',
        description: '名駅南の喫茶店。公式サイトで営業時間7:15〜17:00、名物の小倉あん・きなこバターを確認。モーニング条件は公式や店頭で確認してください。',
      },
    ],
    recommendedTitle: '初めて行く前のチェックリスト',
    recommendedPoints: [
      { title: '提供時間', description: '何時までモーニングを頼めるかを確認。' },
      { title: '定休日', description: '臨時休業や年末年始の営業もチェック。' },
      { title: '混雑しやすい時間', description: '週末や観光シーズンの朝は余裕を持って。' },
      { title: 'モーニングの条件', description: 'ドリンク注文だけで付くのか、追加料金が必要かを確認。' },
      { title: '価格', description: 'セット内容と追加料金は店舗ごとに異なります。' },
      { title: '小倉あん系か、食事系か', description: '名古屋らしさ重視なら小倉あん、しっかり朝食なら食事系。' },
      { title: '駅からの行きやすさ', description: '旅行中や出勤前は、名駅・栄など移動しやすい場所が便利。' },
    ],
    recommendedForTitle: '掲載情報について',
    recommendedFor: [
      '価格・提供時間・内容は変更される場合があります。',
      '最新情報は公式サイトや店頭で確認してください。',
      'この記事では商品画像は使用せず、公式画像の転載も行っていません。',
    ],
    related: [
      {
        title: '名古屋の手土産、結局なにを選べばいい？地元民向けの差し入れガイド',
        href: '/article/73',
        label: '手土産',
      },
      {
        title: 'JR名古屋タカシマヤ デリシャスコートのリニューアル情報',
        href: '/article/39',
        label: '名駅',
      },
      {
        title: '名古屋の新店オープン情報2026年夏版',
        href: '/article/83',
        label: '新店まとめ',
      },
    ],
  },
  73: {
    layout: 'guide',
    badges: ['保存版ガイド', '名古屋手土産', '差し入れ'],
    heroTitle: '名古屋の手土産、結局なにを選べばいい？',
    lead: '地元民向けの差し入れガイド。職場、取引先、帰省、友人宅、甘いものが苦手な人向けに、名古屋で選びやすい手土産を整理します。',
    visual: {
      imageAlt: '名古屋の手土産ガイドのイメージ',
      imageCredit: 'なごとしゃ編集部作成のイメージ',
    },
    quickPoints: [
      '職場・取引先なら、老舗感と分けやすさのある両口屋是清「千なり」。',
      '名古屋らしさを出すなら、青柳総本家「青柳ういろう ひとくち」。',
      '甘くないものを選びたいなら、坂角総本舖「ゆかり」。',
      '話題性なら「ぴよりん」。ただし当日中・要冷蔵・持ち歩き注意。',
    ],
    highlightPoints: [
      {
        title: '取引先・職場向け: 両口屋是清「千なり」',
        description: '個包装が公式ページで確認でき、老舗らしいきちんと感もある候補。職場や取引先に渡すときに選びやすい一品です。',
      },
      {
        title: '帰省・友人宅向け: 青柳総本家「青柳ういろう ひとくち」',
        description: '名古屋らしさを分かりやすく出したいときに。名古屋駅周辺でも買いやすく、帰省や友人宅向けに使いやすい候補です。',
      },
      {
        title: '甘いものが苦手な人向け: 坂角総本舖「ゆかり」',
        description: 'えびせんべいの定番。甘いもの以外を選びたいときや、県外の人に説明しやすい名古屋手土産として候補になります。',
      },
      {
        title: '当日手渡し・話題性向け: ぴよりん',
        description: '名古屋駅らしい話題性重視の候補。消費期限は当日中で、要冷蔵・崩れやすさに注意が必要です。',
      },
    ],
    recommendedPoints: [
      { title: '日持ち', description: 'すぐ食べる必要があるか、数日置けるかを確認。' },
      { title: '分けやすさ', description: '職場や取引先では人数分に分けやすい包装が安心。' },
      { title: '持ち歩き時間', description: '長時間移動なら冷蔵品や崩れやすいものは慎重に。' },
      { title: '冷蔵の必要性', description: '当日手渡し向きか、持ち帰り向きかを分けて考える。' },
      { title: '相手の好み', description: '甘いものが苦手な人には、甘くない候補も用意。' },
      { title: '渡す人数', description: '人数が多い場面では多めに入ったものを選ぶ。' },
    ],
    recommendedFor: [
      '価格・日持ち・販売店舗は変更される場合があります。',
      '購入前には公式サイトや店頭で最新情報をご確認ください。',
      'この記事では商品画像は使用せず、公式画像の転載も行っていません。',
    ],
    related: [
      {
        title: 'JR名古屋タカシマヤ デリシャスコートのリニューアル情報',
        href: '/article/39',
        label: '名駅',
      },
      {
        title: '名古屋の新店オープン情報2026年夏版',
        href: '/article/83',
        label: '新店まとめ',
      },
      {
        title: '名古屋ビアガーデン特集2026',
        href: '/article/79',
        label: '特集',
      },
    ],
  },

  92: {
    layout: 'store',
    shop: SHOP_SPOTS['shop-pasta-mania-tsurumai'],
    badges: ['NEW OPEN', '鶴舞', 'パスタ'],
    heroTitle: '【鶴舞・新店】PASTA MANIA 鶴舞店がオープン。ランチは通常営業、ディナーは予約制',
    lead: '鶴舞駅から徒歩約3分のパスタ専門店。ランチは通常営業、ディナーは完全予約制と案内されています。',
    visual: {
      imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pasta-mania-tsurumai-prtimes.jpg',
      imageAlt: 'PASTA MANIA 鶴舞店のイメージ',
      imageCredit: '株式会社PASTAMANIA / PR TIMES',
      imageSourceUrl: 'https://prtimes.jp/main/html/rd/p/000000007.000132055.html',
    },
    recommendedFor: [
      '鶴舞・千種エリアでランチやディナーの候補を探している人',
      '本格的なパスタを食べたい人',
      'ディナーを予約してゆっくり食事を楽しみたい人',
      '鶴舞の新店を開拓したい人',
    ],
    shopInfo: [
      { label: '店名', value: 'PASTA MANIA 鶴舞店' },
      { label: 'エリア', value: '鶴舞 / 名古屋市中区千代田' },
      { label: 'オープン日', value: '2026年7月3日' },
      { label: 'ジャンル', value: 'パスタ専門店（ランチ・ディナー）' },
      { label: 'アクセス', value: '地下鉄鶴舞線「鶴舞駅」1出口より徒歩約3分' },
      { label: '営業時間', value: 'ランチ11:30〜15:00（L.O.14:30）／ディナー18:00〜22:30 ※オープン時点・最新は公式で確認' },
      { label: '予約', value: 'ディナーは完全予約制（予約方法は公式でご確認ください）' },
      { label: '定休日', value: '火曜日 ※最新は公式で確認' },
    ],
    related: [
      {
        title: '名古屋の新店オープン情報2026年夏版',
        href: '/article/83',
        label: '新店まとめ',
      },
    ],
    officialUrl: 'https://www.pastamania.jp',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=PASTA+MANIA+鶴舞店',
  },

  // development preview 専用(未検証サンプル)。本番WPにpost 104は存在しない
  104: {
    layout: 'store',
    shop: SHOP_SPOTS['shop-pierre-marcolini-haera'],
    badges: ['NEW OPEN', '栄', 'HAERA内'],
    heroTitle: 'PIERRE MARCOLINI HAERA店が栄にオープン！ショコラ×カフェ×ギフトが楽しめる注目店',
    lead: 'ベルギー発のショコラブランドが、栄の新商業施設「HAERA(ヘエラ)」に登場。ショコラや焼き菓子に加えてカフェスペースも併設と案内されています。(未検証サンプル)',
    visual: {
      imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pierre-marcolini-haera.jpg',
      imageAlt: 'PIERRE MARCOLINI HAERA店の店舗イメージ',
      imageCredit: 'HAERA公式',
      imageSourceUrl: 'https://haera.parco.jp/shop/detail/?cd=000032',
    },
    introTitle: 'お店の特徴',
    introBody:
      'ベルギー発のショコラブランド「PIERRE MARCOLINI(ピエール マルコリーニ)」が、栄の新商業施設「HAERA(ヘエラ)」地下1階にオープン。ショコラや焼き菓子の販売に加え、落ち着いたカフェスペースも併設されていると案内されています。(要確認: フロア・業態詳細)',
    recommendedFor: [
      '栄で上質なカフェやスイーツを楽しみたい人',
      '手土産・ギフトを探している人',
      'ちょっと特別なカフェ時間を過ごしたい人',
    ],
    shopInfo: [
      { label: '店名', value: 'PIERRE MARCOLINI HAERA店' },
      { label: 'エリア', value: '栄 / HAERA B1F' },
      { label: 'オープン日', value: '2026年6月11日(要確認)' },
      { label: 'ジャンル', value: 'カフェ / スイーツ / 手土産' },
      { label: '営業時間', value: '公式サイトで確認' },
    ],
    related: [
      {
        title: '名古屋の新店オープン情報2026年夏版',
        href: '/article/83',
        label: '新店まとめ',
      },
      {
        title: '名古屋ビアガーデン特集2026。夏に行きたい屋上・駅近スポットまとめ',
        href: '/article/79',
        label: '特集',
      },
    ],
    officialUrl: 'https://haera.parco.jp/shop/detail/?cd=000032',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=PIERRE+MARCOLINI+HAERA+%E6%A0%84',
  },

  83: {
    layout: 'news',
    badges: ['地域ニュース', '新店まとめ'],
    heroTitle: '名古屋の新店オープン情報2026年夏版',
    lead: '栄・鶴舞・港区で気になる新店・新スポットを、公式発表ベースでまとめました。',
    related: [
      {
        title: '名古屋ビアガーデン特集2026。夏に行きたい屋上・駅近スポットまとめ',
        href: '/article/79',
        label: '特集',
      },
      {
        title: '名古屋のモーニング文化ガイド。喫茶店の朝が特別な理由と楽しみ方',
        href: '/article/66',
        label: 'グルメ',
      },
    ],
    news: {
      breadcrumb: ['ホーム', '地域ニュース', '名古屋の新店オープン情報2026年夏版'],
      eyebrow: '地域ニュース / 新店まとめ',
      updatedLabel: '2026.07',
      imageCaption: 'イメージ画像: なごとしゃ編集部作成',
      quickJumpLabel: 'まず場所で見たい人へ',
      quickJumpText: '6件を地図でまとめて見る',
      purposeChips: ['カフェ', 'スイーツ', 'ランチ・ディナー', '手土産', 'ファミリー', '新スポット'],
      points: [
        '鶴舞にパスタ専門店「PASTA MANIA 鶴舞店」がオープン',
        '松坂屋名古屋店にバニラスイーツ専門店「バニラージュ」が東海エリア初出店',
        '港区に「かっぱ寿司 名古屋みなと店」がオープン',
        '栄駅直結に商業施設「HAERA」が開業',
      ],
      spots: [
        {
          name: 'HAERA',
          area: '栄',
          openDate: '2026年6月11日',
          genre: '商業施設・新スポット',
          summary: '栄駅直結、ザ・ランドマーク名古屋栄の地下2階から地上4階に入る新スポット。65店舗規模として案内されています。',
          forWhom: '栄で買い物や食事をまとめて楽しみたい人',
          tone: 'navy',
          visualLabel: '駅直結の都会感',
          imageAlt: 'HAERAの施設構成と周辺アクセスのイメージ',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-haera-prtimes.jpg',
          imageCredit: '画像出典: J.フロント リテイリング株式会社 / PR TIMES',
          officialUrl: 'https://haera.parco.jp/',
          officialLabel: 'HAERA公式サイト / PR TIMES',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=HAERA%20%E5%90%8D%E5%8F%A4%E5%B1%8B%20%E6%A0%84',
          source: 'HAERA公式サイト、PR TIMES',
        },
        {
          name: 'PASTA MANIA 鶴舞店',
          area: '鶴舞',
          openDate: '2026年7月3日',
          genre: 'ランチ・ディナー',
          summary: '鶴舞エリアにオープンした、行列のできるパスタ専門店の新店舗。ランチは通常営業、ディナーは完全予約制と案内されています。',
          forWhom: 'ランチ・ディナー候補を探している人',
          tone: 'warm',
          visualLabel: '鶴舞のレストラン感',
          imageAlt: 'PASTA MANIA 鶴舞店のイメージ',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pasta-mania-tsurumai-prtimes.jpg',
          imageCredit: '画像出典: 株式会社PASTAMANIA / PR TIMES',
          officialUrl: 'https://prtimes.jp/main/html/rd/p/000000007.000132055.html',
          officialLabel: 'PR TIMES',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=PASTAMANIA%20%E9%B6%B4%E8%88%9E%E5%BA%97',
          source: 'PR TIMES「PASTA MANIA 鶴舞店」リリース',
          articleUrl: '/article/92',
        },
        {
          name: 'バニラージュ 松坂屋名古屋店',
          area: '栄',
          openDate: '2026年7月1日',
          genre: 'スイーツ・手土産',
          summary: 'バニラスイーツ専門店が松坂屋名古屋店本館地下1階にオープン。東海エリア初出店として案内されています。',
          forWhom: '手土産や差し入れを探している人',
          tone: 'cream',
          visualLabel: '上品な手土産感',
          imageAlt: 'バニラージュ 松坂屋名古屋店のブランドイメージ',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-vanillage-matsuzakaya-prtimes.jpg',
          imageCredit: '画像出典: 若尾製菓株式会社 / PR TIMES',
          officialUrl: 'https://prtimes.jp/main/html/rd/p/000000074.000083389.html',
          officialLabel: 'PR TIMES / 若尾製菓公式ニュース',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=%E3%83%90%E3%83%8B%E3%83%A9%E3%83%BC%E3%82%B8%E3%83%A5%20%E6%9D%BE%E5%9D%82%E5%B1%8B%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%BA%97',
          source: 'PR TIMES、若尾製菓公式ニュース',
        },
        {
          name: 'PIERRE MARCOLINI HAERA店',
          area: '栄 / HAERA B1F',
          openDate: '2026年6月11日',
          genre: 'カフェ・スイーツ・手土産',
          summary: 'HAERA地下1階に入る、ギフトにも立ち寄りにも使いやすいショコラブランド。',
          forWhom: '栄で上質なカフェやギフトを探す人',
          tone: 'cream',
          visualLabel: '上質なスイーツ感',
          imageAlt: 'PIERRE MARCOLINI HAERA店の抽象イメージ',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-pierre-marcolini-haera.jpg',
          imageCredit: '画像出典: HAERA公式',
          officialUrl: 'https://haera.parco.jp/shop/detail/?cd=000032',
          officialLabel: 'HAERA公式ショップページ',
          source: 'HAERA公式',
        },
        {
          name: 'スターバックス リザーブ® カフェ HAERA',
          area: '栄 / HAERA B2F',
          openDate: '2026年6月11日',
          genre: 'カフェ・ベーカリー',
          summary: 'HAERA地下2階に入る、栄駅直結で朝から夜まで使いやすいカフェ。',
          forWhom: '朝・昼・休憩で使いやすいカフェを探す人',
          tone: 'navy',
          visualLabel: '駅直結カフェ感',
          imageAlt: 'スターバックス リザーブ カフェ HAERAの抽象イメージ',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-starbucks-reserve-haera.jpg',
          imageCredit: '画像出典: HAERA公式',
          officialUrl: 'https://haera.parco.jp/shop/detail/?cd=000015',
          officialLabel: 'HAERA公式ショップページ',
          source: 'HAERA公式',
        },
        {
          name: 'かっぱ寿司 名古屋みなと店',
          area: '港区',
          openDate: '2026年7月3日',
          genre: 'ファミリー',
          summary: '港区方面にオープンした、かっぱ寿司の新店舗。オープン記念商品についても案内されています。',
          forWhom: '家族や港区方面のおでかけ候補を探している人',
          tone: 'blue',
          visualLabel: '明るいファミリー感',
          imageAlt: 'かっぱ寿司 名古屋みなと店のオープン記念商品のイメージ',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/new-open-kappasushi-minato-prtimes.jpg',
          imageCredit: '画像出典: カッパ・クリエイト株式会社 / PR TIMES',
          officialUrl: 'https://prtimes.jp/main/html/rd/p/000001143.000018731.html',
          officialLabel: 'PR TIMES',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=%E3%81%8B%E3%81%A3%E3%81%B1%E5%AF%BF%E5%8F%B8%20%E5%90%8D%E5%8F%A4%E5%B1%8B%E3%81%BF%E3%81%AA%E3%81%A8%E5%BA%97',
          source: 'PR TIMES「かっぱ寿司 名古屋みなと店」リリース',
        },
      ],
      editorTips: [
        { title: '手土産ならバニラージュ', description: '栄で差し入れや手土産を探すときの候補になります。' },
        { title: 'ランチ・ディナー候補ならPASTA MANIA', description: '特に夜は完全予約制のため、訪問前の確認が大切です。' },
        { title: '家族・港区方面ならかっぱ寿司', description: '港区方面のおでかけと合わせやすい新店です。' },
        { title: '栄でまとめて見たいならHAERA', description: '駅直結のため、買い物や食事をまとめて楽しみやすい施設です。' },
      ],
      sourceNotes: [
        '情報は公式発表・PR TIMES・公式サイトをもとに確認',
        '2026年7月時点の情報',
        '営業時間・定休日・商品内容は変更される場合があります',
        '来店前に公式サイトや公式発表をご確認ください',
      ],
      ctaTitle: '新店・リニューアル情報の掲載相談',
      ctaBody: '掲載内容の修正、写真のご提供、掲載希望がありましたら、掲載相談ページまたはお問い合わせよりご連絡ください。掲載は無料です。',
      ctaHref: '/partner',
      ctaLabel: '掲載相談を見る',
    },
  },

  79: {
    layout: 'feature',
    badges: ['特集', '名古屋', 'おでかけ'],
    heroTitle: '名古屋ビアガーデン特集2026。夏に行きたい屋上・駅近スポットまとめ',
    lead: '名駅・栄・金山で夏に行きたいビアガーデンを、公式情報ベースで編集部が整理。開催期間・アクセス・予約導線まで、行く前に知りたい情報をまとめました。',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=名古屋+ビアガーデン',
    related: [
      {
        title: '雨の日の名古屋どこ行く？屋内で過ごしやすいおでかけスポット7選',
        href: '/article/58',
        label: '雨の日',
      },
      {
        title: '名古屋のモーニング文化ガイド。喫茶店の朝が特別な理由と楽しみ方',
        href: '/article/66',
        label: 'モーニング',
      },
    ],
    feature: {
      breadcrumb: ['ホーム', '特集', '名古屋ビアガーデン特集2026'],
      eyebrow: '特集 / 名古屋 / おでかけ',
      updatedLabel: '2026.07',
      imageCaption: 'イメージ画像: なごとしゃ編集部作成',
      points: [
        '名駅・栄・金山の屋上・駅近ビアガーデンを厳選',
        '開催期間、営業時間、予約方法を公式情報ベースで確認',
        '雨の日・駅近・期間限定など、目的別に選びやすい',
        '公式サイトとGoogleマップへの導線つき',
      ],
      audience: ['週末の予定を決めたい', '名駅・栄・金山で探したい', '雨でも行きやすい場所を知りたい', '会社帰りに行きたい', '予約前に比較したい'],
      picks: [
        {
          name: '天空のビアガーデン CARVINO',
          area: '名駅',
          description: 'スカイプロムナード(44〜46F)内 / 高層展望フロア / 10月31日まで開催',
          badges: ['名駅', '高層階', 'WEB予約'],
          tone: 'navy',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-beer-garden-2026-eyecatch.png',
          imageAlt: '天空のビアガーデン CARVINOを含む名古屋ビアガーデン特集のイメージ',
          imageCredit: 'なごとしゃ編集部作成',
        },
        {
          name: 'ビアガーデン マイアミ 名古屋栄店',
          area: '栄',
          description: '栄駅周辺 / 体験型BBQ / 11月28日まで開催',
          badges: ['栄', '屋上', '公式確認'],
          tone: 'red',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-beer-garden-2026-eyecatch.png',
          imageAlt: 'ビアガーデン マイアミ 名古屋栄店を含む名古屋ビアガーデン特集のイメージ',
          imageCredit: 'なごとしゃ編集部作成',
        },
        {
          name: 'アスナル金山ビアガーデン by Kumsan seoul',
          area: '金山',
          description: '駅徒歩約1分 / コリアンBBQ / 屋根付き席あり',
          badges: ['金山', '駅徒歩約1分', '屋根付き席'],
          tone: 'gold',
          imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/nagoya-beer-garden-2026-eyecatch.png',
          imageAlt: 'アスナル金山ビアガーデンを含む名古屋ビアガーデン特集のイメージ',
          imageCredit: 'なごとしゃ編集部作成',
        },
      ],
      venues: [
        {
          name: '天空のビアガーデン CARVINO',
          area: '名駅',
          feature: 'スカイプロムナード(44〜46F)内 / 高層展望フロア / 10月31日まで開催',
          period: '2026年4月20日〜10月31日',
          station: '名古屋駅から徒歩圏',
          reservation: 'WEB予約',
          place: 'ミッドランドスクエア オフィス棟44〜46F 屋外展望台スカイプロムナード内',
          hours: '平日17:00〜22:00 / 土日祝11:00〜22:00',
          price: '大人6,500円〜(飲み放題付き)',
          booking: 'WEBサイトより',
          officialUrl: 'https://www.midland-square.com/beer_garden/',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=ミッドランドスクエア+スカイプロムナード',
          source: 'ミッドランドスクエア公式サイト・名古屋コンシェルジュ(2026年7月時点)',
        },
        {
          name: 'ビアガーデン マイアミ 名古屋栄店',
          area: '栄',
          feature: '栄駅周辺 / 体験型BBQ / 11月28日まで開催',
          period: '2026年4月7日〜11月28日',
          station: '栄駅周辺',
          reservation: '公式サイト確認',
          place: '名古屋三越 栄店 屋上',
          hours: '平日16:00〜22:30 / 土日祝12:00〜22:30',
          price: '公式サイト確認',
          booking: '公式サイト確認',
          officialUrl: 'https://www.mai-ami.jp/',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=名古屋三越栄店+ビアガーデン+マイアミ',
          source: 'ビアガーデン マイアミ公式サイト(2026年7月時点)',
        },
        {
          name: '名古屋ビアガーデン MIRAI TOWERビュー 栄店',
          area: '栄',
          feature: 'MIRAI TOWERビュー / ルーフトップ / BBQ',
          period: '2026年4月1日〜10月31日',
          station: '栄駅・久屋大通駅周辺',
          reservation: '公式サイト確認',
          place: '栄駅・久屋大通駅周辺のルーフトップ',
          hours: '公式サイト確認',
          price: '公式サイト確認',
          booking: '公式サイト確認',
          officialUrl: 'https://bbq-beergarden.jp/',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=名古屋ビアガーデン+MIRAI+TOWERビュー+栄',
          source: 'Aichi Now・公式サイト(2026年7月時点)',
        },
        {
          name: 'ビアガーデン&BBQテラス “URBAN” 金山駅店',
          area: '金山',
          feature: '金山駅1番出口より徒歩約1分 / BBQ / 17:00〜23:00',
          period: '2026年4月1日〜10月31日',
          station: '金山駅1番出口より徒歩約1分',
          reservation: 'WEBまたは電話',
          place: '名古屋市中区金山2-16-16 冨士田ビル5Fテラスフロア',
          hours: '17:00〜23:00',
          price: '大人4,000円〜',
          booking: 'WEBまたは電話',
          officialUrl: 'https://urban-bbq-beergarden.jp/',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=ビアガーデン+URBAN+金山',
          source: '名古屋コンシェルジュ・公式サイト(2026年7月時点)',
        },
        {
          name: 'アスナル金山ビアガーデン by Kumsan seoul',
          area: '金山',
          feature: '駅徒歩約1分 / コリアンBBQ / 屋根付き席あり',
          period: '2026年4月10日〜11月2日',
          station: '金山総合駅から徒歩約1分',
          reservation: '公式サイト確認',
          place: 'アスナル金山 屋上',
          hours: '平日16:00〜23:00 / 土日祝12:00〜23:00(7月・8月は全日16:00〜23:00)',
          price: '公式サイト確認',
          booking: '公式サイト確認',
          officialUrl: 'https://asunal-kanayama.beergardens.jp/',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=アスナル金山+ビアガーデン',
          source: 'アスナル金山公式・Aichi Now(2026年7月時点)',
        },
      ],
      tips: [
        { title: '場所と時間で選ぶ', body: '名駅・栄・金山のどこで集まりやすいか、開始時間に合うかを先に確認すると比較しやすくなります。' },
        { title: '条件で絞る', body: '雨天時対応、予約方法、開催期間、営業時間を先に見ると比較しやすくなります。' },
        { title: '公式で確認する', body: '営業時間・料金・雨天時対応は変わる場合があります。予約前に公式サイトを確認してください。' },
      ],
      sourceNotes: ['情報は各公式サイト・施設発表をもとに確認', '2026年7月時点の情報', '内容は変更される場合があります', '予約前に公式サイトをご確認ください'],
      ctaTitle: '掲載内容の修正・写真提供はこちら',
      ctaBody: '掲載内容の修正、写真のご提供、掲載のご希望がありましたら、お気軽にご連絡ください。掲載は無料です。',
      ctaHref: '/partner',
      ctaLabel: '掲載相談を見る',
    },
  },

  214: {
    badges: ['特集', '花火大会', 'おでかけ'],
    heroTitle: '【2026】名古屋周辺の花火大会まとめ｜開催日・会場・有料席・アクセスを紹介',
    lead: '名古屋周辺で行きたい花火大会を、開催日・エリア・アクセス・有料席の状況から選べる特集です。',
    related: [],
    articleType: 'event_roundup',
    relationship: 'editorial',
    eventRoundup: {
      title: '開催日から選ぶ花火大会',
      description: '横にスワイプして、日付・場所・アクセスをさっと比較できます。',
      swipeLabel: '横にスワイプして選べます',
      articleType: 'event_roundup',
      relationship: 'editorial',
      inlineListClassName: 'fireworks-card-list',
      items: [
        {
          id: 'toyohashi-gion-2026',
          dateLabel: '7/18(土)',
          startDate: '2026-07-18',
          name: '豊橋祇園祭 打上花火',
          area: '豊橋市',
          venue: '豊川河畔',
          station: '札木駅、豊橋駅',
          ticketStatus: '本年度分完売',
          shortCopy: '約12,000発の大迫力',
          anchorId: 'toyohashi-gion-2026',
          mapQuery: '豊橋祇園祭 豊川河畔 豊橋市',
          officialUrl: 'https://www.toyohashigion.org/',
          visual: { type: 'generated' },
        },
        {
          id: 'nakamura-park-2026',
          dateLabel: '7/24(金)',
          startDate: '2026-07-24',
          name: '中村公園夏まつり',
          area: '名古屋市中村区',
          venue: '中村公園 太閤池',
          station: '中村公園駅',
          ticketStatus: '案内なし',
          shortCopy: '名古屋市内で楽しむ',
          anchorId: 'nakamura-park-2026',
          mapQuery: '中村公園 太閤池 名古屋市中村区',
          officialUrl: 'https://aichinow.pref.aichi.jp/events/detail/1587/',
          visual: { type: 'generated' },
        },
        {
          id: 'toyota-oiden-2026',
          dateLabel: '7/26(日)',
          startDate: '2026-07-26',
          name: '豊田おいでんまつり 花火大会',
          area: '豊田市',
          venue: '矢作川河畔・白浜公園一帯',
          station: '豊田市駅',
          ticketStatus: '協賛席あり',
          shortCopy: '多彩な演出を満喫',
          anchorId: 'toyota-oiden-2026',
          mapQuery: '豊田おいでんまつり 白浜公園 矢作川河畔',
          officialUrl: 'https://www.oidenmaturi.com/hanabi/',
          visual: { type: 'generated' },
        },
        {
          id: 'gamagori-2026',
          dateLabel: '7/26(日)',
          startDate: '2026-07-26',
          name: '蒲郡まつり 納涼花火大会',
          area: '蒲郡市',
          venue: '蒲郡駅、竹島ふ頭周辺',
          station: '蒲郡駅',
          ticketStatus: '案内なし',
          shortCopy: '三尺玉と海辺の夜',
          anchorId: 'gamagori-2026',
          mapQuery: '蒲郡まつり 納涼花火大会 竹島ふ頭 蒲郡駅',
          officialUrl: 'https://aichinow.pref.aichi.jp/events/detail/1012/',
          visual: { type: 'generated' },
        },
        {
          id: 'okazaki-2026',
          dateLabel: '8/1(土)',
          startDate: '2026-08-01',
          name: '岡崎城下家康公夏まつり花火大会',
          area: '岡崎市',
          venue: '乙川・矢作川河畔',
          station: '東岡崎駅、岡崎公園前駅',
          ticketStatus: '有料観覧席あり',
          shortCopy: '城下町を彩る名物花火',
          anchorId: 'okazaki-2026',
          mapQuery: '岡崎城下家康公夏まつり花火大会 乙川河畔',
          officialUrl: 'https://www.okazaki-kanko.jp/feature/hanabitaikai/hanabitokusyu',
          visual: {
            type: 'image',
            imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/Okazaki-Hanabitaikai-2015-3.jpg',
            imageAlt: '岡崎の花火大会で夜空に広がる花火の過去写真',
            creditText: 'Evelyn-rose / Wikimedia Commons（CC0）',
          },
        },
        {
          id: 'toyoake-2026',
          dateLabel: '8/1(土)・2(日)',
          startDate: '2026-08-01',
          endDate: '2026-08-02',
          name: '豊明夏まつり',
          area: '豊明市',
          venue: '豊明市文化会館周辺',
          station: '前後駅から徒歩約30分',
          ticketStatus: '案内なし',
          shortCopy: '短時間で夏気分',
          anchorId: 'toyoake-2026',
          mapQuery: '豊明夏まつり 豊明市文化会館',
          officialUrl: 'https://aichinow.pref.aichi.jp/events/detail/1497/',
          visual: { type: 'generated' },
        },
        {
          id: 'japan-rhine-2026',
          dateLabel: '8/1(土)〜10(月)',
          startDate: '2026-08-01',
          endDate: '2026-08-10',
          name: '日本ライン夏まつりロングラン花火',
          area: '犬山市',
          venue: '木曽川河畔',
          station: '犬山遊園駅、新鵜沼駅',
          ticketStatus: '観客席なし',
          shortCopy: '10日間の川辺花火',
          anchorId: 'japan-rhine-2026',
          mapQuery: '日本ライン夏まつりロングラン花火 木曽川河畔 犬山市',
          officialUrl: 'https://aichinow.pref.aichi.jp/events/detail/1513/',
          visual: {
            type: 'image',
            imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/Fireworks_of_Japan_Rhine_summer_festival_from_Daishoji_-_2.jpg',
            imageAlt: '日本ライン夏まつりの木曽川沿いで打ち上がる花火の過去写真',
            creditText: 'KKPCW / Wikimedia Commons（CC BY-SA 4.0）',
          },
        },
        {
          id: 'tokai-2026',
          dateLabel: '8/8(土)',
          startDate: '2026-08-08',
          name: '東海まつり花火大会',
          area: '東海市',
          venue: '大池公園',
          station: '太田川駅',
          ticketStatus: '案内なし',
          shortCopy: '約4,000発を公園で',
          anchorId: 'tokai-2026',
          mapQuery: '東海まつり花火大会 大池公園 東海市',
          officialUrl: 'https://aichinow.pref.aichi.jp/events/detail/1511/',
          visual: { type: 'generated' },
        },
        {
          id: 'kariya-2026',
          dateLabel: '8/15(土)',
          startDate: '2026-08-15',
          name: '刈谷わんさか祭り 花火大会',
          area: '刈谷市',
          venue: '刈谷市総合運動公園',
          station: '富士松駅、一ツ木駅',
          ticketStatus: '案内なし',
          shortCopy: 'シャトルバス予定',
          anchorId: 'kariya-2026',
          mapQuery: '刈谷市総合運動公園',
          officialUrl: 'https://www.kariya-guide.com/festival/000030.html',
          visual: { type: 'generated' },
        },
      ],
    },
  },

  221: {
    layout: 'guide',
    badges: ['編集部企画', 'イベントまとめ', '2026年8月'],
    heroTitle: '【2026年8月】名古屋イベントカレンダー｜夏祭り・夜イベント・子ども向け10選',
    lead: '2026年8月に名古屋で開催されるイベントを、日付・エリア・屋内外・料金の目安で見比べられるイベントまとめです。',
    articleType: 'event_roundup',
    relationship: 'editorial',
    visual: {
      imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/pop-is-you-sakae26-main.jpg',
      imageAlt: 'POP IS YOU SAKAE26 メインビジュアル',
      imageCredit: '画像提供：J.フロント リテイリング株式会社／PR TIMES',
      imageSourceUrl: 'https://prtimes.jp/main/html/rd/p/000000044.000118148.html',
    },
    quickPoints: [
      '8月前半は世界コスプレサミット、大須夏まつり、円頓寺七夕まつり、金山まつりが重なります。',
      '夜のおでかけは東山動植物園ナイトZOO、名古屋港水族館、どまつりなどが候補です。',
      '暑さや雨を避けたい日は、屋内施設の水族館・博物館・科学館イベントを確認しやすい構成です。',
    ],
    highlightTitle: '目的別に選ぶ',
    highlightPoints: [
      { title: '夏祭りで選ぶ', description: '商店街や街なかの祭りを中心に、無料・低予算の候補を見比べられます。' },
      { title: '夜イベントで選ぶ', description: '夕方以降に楽しみやすい動物園、水族館、踊りイベントをまとめています。' },
      { title: '屋内で選ぶ', description: '水族館、資料館、科学館など、暑さや雨の日にも検討しやすい候補があります。' },
    ],
    recommendedForTitle: '出かける前の注意',
    recommendedFor: [
      '開催時間、料金、休館日、交通規制は変更される場合があります。',
      '参加前に各イベントの公式情報を確認してください。',
      '屋外イベントでは暑さ対策、雨具、飲み物、歩きやすい靴を用意しておくと安心です。',
    ],
    related: [],
    eventRoundup: {
      title: '日付順イベントカード',
      description: '日付・エリア・料金・屋内外を縦に見比べて、行きたい候補を選べます。',
      swipeLabel: 'フィルターで候補を絞り込めます',
      variant: 'list',
      articleType: 'event_roundup',
      relationship: 'editorial',
      placement: 'afterQuickPoints',
      filters: [
        { id: 'august-early', label: '8月前半' },
        { id: 'obon', label: 'お盆前後' },
        { id: 'august-late', label: '8月後半' },
        { id: 'summer-festival', label: '夏祭り' },
        { id: 'night-event', label: '夜イベント' },
        { id: 'family', label: '子ども・家族' },
        { id: 'indoor', label: '屋内' },
        { id: 'low-budget', label: '無料・低予算' },
      ],
      items: [
        {
          id: 'endoji-tanabata-2026',
          dateLabel: '7/29(水)〜8/2(日)',
          startDate: '2026-07-29',
          endDate: '2026-08-02',
          name: '円頓寺七夕まつり',
          area: '円頓寺',
          venue: '円頓寺商店街・円頓寺本町商店街',
          station: '国際センター駅、丸の内駅',
          nearestStation: '国際センター駅、丸の内駅',
          ticketStatus: '無料',
          priceSummary: '無料',
          indoorOutdoor: 'アーケード中心',
          familySuitability: '家族での夏祭り',
          shortCopy: 'レトロな商店街の七夕飾り',
          shortDescription: 'アーケードに大きなはりぼて飾りが並ぶ、レトロな商店街の夏祭り。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/119/',
          verifiedAt: '2026-07-20',
          filterTags: ['august-early', 'summer-festival', 'family', 'low-budget'],
          visual: { type: 'generated' },
        },
        {
          id: 'world-cosplay-summit-2026',
          dateLabel: '7/31(金)〜8/2(日)',
          startDate: '2026-07-31',
          endDate: '2026-08-02',
          name: '世界コスプレサミット',
          area: '栄・大須',
          venue: 'オアシス21ほか',
          station: null,
          nearestStation: null,
          ticketStatus: '有料・日指定',
          priceSummary: '有料・日指定',
          indoorOutdoor: '会場による',
          familySuitability: null,
          shortCopy: '世界から集まる大型コスプレイベント',
          shortDescription: '世界各国・地域のコスプレイヤーが名古屋に集まる大型イベント。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/168/',
          verifiedAt: '2026-07-20',
          filterTags: ['august-early'],
          visual: {
            type: 'image',
            imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/world-cosplay-summit-2026.png',
            imageAlt: '世界コスプレサミット2026 告知ビジュアル',
            creditText: '画像提供：世界コスプレサミット実行委員会／PR TIMES',
          },
        },
        {
          id: 'osu-summer-festival-2026',
          dateLabel: '8/1(土)〜8/2(日)',
          startDate: '2026-08-01',
          endDate: '2026-08-02',
          name: '大須夏まつり',
          area: '大須',
          venue: '大須商店街全域',
          station: '上前津駅、大須観音駅',
          nearestStation: '上前津駅、大須観音駅',
          ticketStatus: '無料',
          priceSummary: '無料',
          indoorOutdoor: '屋外中心',
          familySuitability: '夏祭り・食べ歩き',
          shortCopy: '商店街で楽しむ名古屋の夏祭り',
          shortDescription: '大須商店街全域で、盆踊りやパレードなどを楽しめる地域イベント。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/116/',
          verifiedAt: '2026-07-20',
          filterTags: ['august-early', 'summer-festival', 'night-event', 'low-budget'],
          visual: { type: 'generated' },
        },
        {
          id: 'kanayama-festival-2026',
          dateLabel: '8/1(土)〜8/2(日)',
          startDate: '2026-08-01',
          endDate: '2026-08-02',
          name: '金山まつり',
          area: '金山',
          venue: '金山駅周辺',
          station: '金山駅',
          nearestStation: '金山駅',
          ticketStatus: '無料・一部有料',
          priceSummary: '無料・一部有料',
          indoorOutdoor: '複数会場',
          familySuitability: null,
          shortCopy: '駅周辺で回りやすい地域イベント',
          shortDescription: '金山駅周辺の複数施設を会場に、歴史・音楽・グルメなどを楽しめるイベント。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/118/',
          verifiedAt: '2026-07-20',
          filterTags: ['august-early', 'summer-festival', 'low-budget'],
          visual: { type: 'generated' },
        },
        {
          id: 'pop-is-you-sakae26',
          dateLabel: '7/22(水)〜8/16(日)',
          startDate: '2026-07-22',
          endDate: '2026-08-16',
          name: 'POP IS YOU SAKAE26',
          area: '栄・伏見',
          venue: '松坂屋名古屋店、名古屋PARCOほか',
          station: null,
          nearestStation: null,
          ticketStatus: '会場による',
          priceSummary: '会場による',
          indoorOutdoor: '会場による',
          familySuitability: null,
          shortCopy: '栄・伏見を回遊するアート企画',
          shortDescription: '栄・伏見の複数施設が参加する、買い物や美術館めぐりと組み合わせやすい回遊企画。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/1223/',
          verifiedAt: '2026-07-20',
          filterTags: ['august-early', 'obon', 'indoor'],
          visual: { type: 'generated' },
        },
        {
          id: 'higashiyama-night-zoo-2026',
          dateLabel: '8/8(土)・9(日)・11(火祝)・12(水)・14(金)〜16(日)',
          startDate: '2026-08-08',
          endDate: '2026-08-16',
          name: '東山動植物園 ナイトZOO',
          area: '東山',
          venue: '東山動植物園',
          station: '東山公園駅',
          nearestStation: '東山公園駅',
          ticketStatus: '高校生以上500円、中学生以下無料',
          priceSummary: '高校生以上500円、中学生以下無料',
          indoorOutdoor: '夜・屋外',
          familySuitability: '家族向け',
          shortCopy: '夜の動物園を楽しむ',
          shortDescription: '夜の動物やライトアップされた園内を楽しめる、夏休み向けの夜イベント。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/112/',
          verifiedAt: '2026-07-20',
          filterTags: ['obon', 'night-event', 'family'],
          visual: { type: 'generated' },
        },
        {
          id: 'summer-night-aquarium-2026',
          dateLabel: '7/18(土)〜8/31(月)',
          startDate: '2026-07-18',
          endDate: '2026-08-31',
          name: 'サマーナイトアクアリウム',
          area: '名古屋港',
          venue: '名古屋港水族館',
          station: '名古屋港駅',
          nearestStation: '名古屋港駅',
          ticketStatus: '夜間 大人1,620円、小中学生800円、幼児400円',
          priceSummary: '夜間 大人1,620円、小中学生800円、幼児400円',
          indoorOutdoor: '屋内',
          familySuitability: '暑さを避けたい家族',
          shortCopy: '夜の水族館で涼しく過ごす',
          shortDescription: '名古屋港水族館の夜間営業。暑さや天候を避けたい日にも検討しやすい候補です。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/146/',
          verifiedAt: '2026-07-20',
          filterTags: ['obon', 'august-late', 'night-event', 'family', 'indoor'],
          visual: { type: 'generated' },
        },
        {
          id: 'nagoya-utsurikawari-2026',
          dateLabel: '7/18(土)〜8/30(日)',
          startDate: '2026-07-18',
          endDate: '2026-08-30',
          name: '名古屋市のうつりかわり',
          area: '東区',
          venue: '名古屋市市政資料館 第2・3・4一般展示室',
          station: null,
          nearestStation: null,
          ticketStatus: '無料',
          priceSummary: '無料',
          indoorOutdoor: '屋内',
          familySuitability: '小学生・自由研究',
          shortCopy: '自由研究にも使いやすい無料展示',
          shortDescription: '名古屋市の街並みや暮らしの変化を、地図や写真で学べる無料展示。',
          officialUrl: 'https://www.city.nagoya.jp/kankou/rekishi/1004614/1004615/1048866.html',
          verifiedAt: '2026-07-20',
          filterTags: ['obon', 'august-late', 'family', 'indoor', 'low-budget'],
          visual: { type: 'generated' },
        },
        {
          id: 'sukesuke-ten-2-2026',
          dateLabel: '7/18(土)〜9/23(水祝)',
          startDate: '2026-07-18',
          endDate: '2026-09-23',
          name: 'スケスケ展2',
          area: '伏見',
          venue: 'FUJIなごや科学館 理工館地下2階 FUJIイベントホール',
          station: null,
          nearestStation: null,
          ticketStatus: '一般1,800円、大学生1,000円、小中高生500円、未就学児無料',
          priceSummary: '一般1,800円、大学生1,000円、小中高生500円、未就学児無料',
          indoorOutdoor: '屋内',
          familySuitability: '子ども・科学好き',
          shortCopy: '親子で見たい科学館の特別展',
          shortDescription: '透けて見える仕組みを体験できる、子どもや科学好きに向いた特別展。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/1350/',
          verifiedAt: '2026-07-20',
          filterTags: ['obon', 'august-late', 'family', 'indoor'],
          visual: {
            type: 'image',
            imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/07/sukesuke-ten-2-scaled.jpg',
            imageAlt: '特別展 スケスケ展2 紹介ビジュアル',
            creditText: '画像提供：J.フロント リテイリング株式会社／PR TIMES',
          },
        },
        {
          id: 'domatsuri-2026',
          dateLabel: '8/28(金)〜8/30(日)',
          startDate: '2026-08-28',
          endDate: '2026-08-30',
          name: 'にっぽんど真ん中祭り',
          area: '栄ほか',
          venue: '久屋大通公園ほか名古屋市内各所',
          station: null,
          nearestStation: null,
          ticketStatus: '無料',
          priceSummary: '無料',
          indoorOutdoor: '屋外中心',
          familySuitability: null,
          shortCopy: '名古屋の夏を締める踊りイベント',
          shortDescription: '国内外からチームが集まる、名古屋の大型踊りイベント。',
          officialUrl: 'https://www.nagoya-info.jp/event/detail/103/',
          verifiedAt: '2026-07-20',
          filterTags: ['august-late', 'summer-festival', 'night-event', 'low-budget'],
          visual: { type: 'generated' },
        },
      ],
    },
  },

  39: {
    layout: 'news',
    badges: ['名駅', 'ベーカリー', 'NEW OPEN'],
    heroTitle: 'JR名古屋タカシマヤ デリシャスコートがベーカリーゾーンとしてリニューアル',
    lead: '名古屋駅直結のジェイアール名古屋タカシマヤ1階「デリシャスコート」に、人気ベーカリーブランドが集まるリニューアルエリアが登場。手土産や駅前の立ち寄り先として見ておきたい商業施設ニュースです。',
    visual: {
      imageUrl: 'https://nagotosha.com/wp-content/uploads/2026/06/takashimaya-bakery-202606001.jpg',
      imageAlt: 'JR名古屋タカシマヤ デリシャスコートのベーカリーリニューアルイメージ',
      imageCredit: 'なごとしゃ掲載画像',
    },
    related: [
      {
        title: '名古屋の新店オープン情報2026年夏版',
        href: '/article/83',
        label: '新店まとめ',
      },
    ],
    officialUrl: 'https://www.jr-takashimaya.co.jp/floor/',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=ジェイアール名古屋タカシマヤ%20デリシャスコート',
    news: {
      breadcrumb: ['ホーム', '地域ニュース', '名駅ベーカリーリニューアル'],
      eyebrow: '地域ニュース / 名駅 / ベーカリー',
      updatedLabel: '2026.06',
      imageCaption: '画像出典: なごとしゃ掲載画像',
      quickJumpLabel: '名駅で立ち寄りたい人へ',
      quickJumpText: 'デリシャスコートの場所を地図で見る',
      purposeChips: ['名駅', 'ベーカリー', '手土産', 'テイクアウト', '百貨店', 'リニューアル'],
      spotsTitle: 'デリシャスコートで見たい3ブランド',
      comparisonTitle: 'ブランド別に見やすく整理',
      mapTitle: '場所を確認する',
      points: [
        'ジェイアール名古屋タカシマヤ1階「デリシャスコート」のベーカリーゾーンがリニューアル',
        'BOUL’ANGE、MAISON KAYSER、POMPADOURの3ブランドをまとめて見られる構成',
        '名古屋駅直結で、買い物ついでや移動前後にも立ち寄りやすい',
        '手土産や朝食・ランチ用のパンを探したい人にも使いやすいニュース',
      ],
      spots: [
        {
          name: 'BOUL’ANGE',
          area: '名駅',
          openDate: '2026年6月19日',
          genre: 'ベーカリー',
          summary: 'デリシャスコートのリニューアルで注目したいベーカリーブランド。本文では復刻商品や新作商品にも触れられています。',
          forWhom: '駅前で話題性のあるパンを選びたい人',
          tone: 'warm',
          visualLabel: 'ベーカリー',
          imageAlt: 'BOUL’ANGEのベーカリーイメージ',
          officialUrl: 'https://www.jr-takashimaya.co.jp/floor/',
          officialLabel: 'フロアガイド',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=ジェイアール名古屋タカシマヤ%20デリシャスコート',
          source: 'なごとしゃ掲載記事 / JR名古屋タカシマヤ フロアガイド',
        },
        {
          name: 'MAISON KAYSER',
          area: '名駅',
          openDate: '2026年6月19日',
          genre: 'ベーカリー / 手土産',
          summary: '本文では、青柳総本家との名古屋らしいコラボ商品が紹介されています。手土産候補としても見やすいブランドです。',
          forWhom: '名駅で手土産や差し入れ向きのパンを探す人',
          tone: 'cream',
          visualLabel: '手土産',
          imageAlt: 'MAISON KAYSERのベーカリーイメージ',
          officialUrl: 'https://www.jr-takashimaya.co.jp/floor/',
          officialLabel: 'フロアガイド',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=ジェイアール名古屋タカシマヤ%20デリシャスコート',
          source: 'なごとしゃ掲載記事 / JR名古屋タカシマヤ フロアガイド',
        },
        {
          name: 'POMPADOUR',
          area: '名駅',
          openDate: '2026年6月19日',
          genre: 'ベーカリー / テイクアウト',
          summary: '本文では、名古屋・愛知らしさのある限定メニューが紹介されています。駅前で地域感のあるパンを選びたいときの候補です。',
          forWhom: '名古屋らしい味や限定感のあるパンを見たい人',
          tone: 'navy',
          visualLabel: '限定パン',
          imageAlt: 'POMPADOURのベーカリーイメージ',
          officialUrl: 'https://www.jr-takashimaya.co.jp/floor/',
          officialLabel: 'フロアガイド',
          mapUrl: 'https://www.google.com/maps/search/?api=1&query=ジェイアール名古屋タカシマヤ%20デリシャスコート',
          source: 'なごとしゃ掲載記事 / JR名古屋タカシマヤ フロアガイド',
        },
      ],
      editorTips: [
        { title: '名駅で選ぶ', description: '駅直結の百貨店内なので、移動前後や買い物の流れで立ち寄りやすいニュースです。' },
        { title: '目的で見る', description: '朝食、ランチ、手土産、差し入れなど、用途からブランドを見比べると選びやすくなります。' },
        { title: '公式で確認する', description: '営業時間や取り扱い商品は変わる場合があります。来店前に施設公式情報をご確認ください。' },
      ],
      sourceNotes: [
        '情報はなごとしゃ掲載記事とJR名古屋タカシマヤ公式フロア情報をもとに整理しています。',
        '2026年6月時点の情報です。',
        '営業時間、販売商品、限定商品の有無は変更される場合があります。',
        '来店前にジェイアール名古屋タカシマヤ公式サイトをご確認ください。',
      ],
      ctaTitle: '掲載内容の修正・写真提供はこちら',
      ctaBody: '掲載内容の修正、写真のご提供、掲載のご希望がありましたら、お気軽にご連絡ください。掲載は無料です。',
      ctaHref: '/partner',
      ctaLabel: '掲載相談を見る',
    },
  },
};

export function getArticleExperience(postId: number): ArticleExperienceData | undefined {
  const experience = EXPERIENCES[postId];
  if (!experience) return undefined;

  return {
    ...experience,
    related: withRelatedThumbnails(experience.related),
  };
}

export function getFeaturedNewOpenSpots(limit = 6): ShopSpot[] {
  return Object.values(SHOP_SPOTS)
    .filter((spot) => spot.type === 'new-open' && spot.isFeatured)
    .sort((a, b) => {
      const byOpenDate = b.openDate.localeCompare(a.openDate);
      if (byOpenDate !== 0) return byOpenDate;
      return b.publishDate.localeCompare(a.publishDate);
    })
    .slice(0, limit);
}

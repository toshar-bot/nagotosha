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

export type FeaturePick = {
  name: string;
  area: string;
  description: string;
  badges: string[];
  tone?: 'navy' | 'red' | 'gold';
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
  shop?: ShopSpot;
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
  feature?: FeatureArticleData;
  news?: NewsArticleData;

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
        { name: '天空のビアガーデン CARVINO', area: '名駅', description: 'スカイプロムナード(44〜46F)内 / 高層展望フロア / 10月31日まで開催', badges: ['名駅', '高層階', 'WEB予約'], tone: 'navy' },
        { name: 'ビアガーデン マイアミ 名古屋栄店', area: '栄', description: '栄駅周辺 / 体験型BBQ / 11月28日まで開催', badges: ['栄', '屋上', '公式確認'], tone: 'red' },
        { name: 'アスナル金山ビアガーデン by Kumsan seoul', area: '金山', description: '駅徒歩約1分 / コリアンBBQ / 屋根付き席あり', badges: ['金山', '駅徒歩約1分', '屋根付き席'], tone: 'gold' },
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
  return EXPERIENCES[postId];
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

export function getFakeSaveCount(id: string | number): number {
  const n = Number(id) || 1;
  return 8200 + ((n * 137) % 6200);
}

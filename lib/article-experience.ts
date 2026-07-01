export type ArticleSpot = {
  name: string;
  area: string;
  description: string;
  imageUrl?: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  mapUrl?: string;
  detailHref?: string;
};

export type ArticleCard = {
  label: string;
  title: string;
  description: string;
  tone: 'green' | 'yellow' | 'red' | 'blue';
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
  tabelogUrl?: string;
  googleMapUrl?: string;
};

export type ArticleExperienceData = {
  badges: string[];
  lead: string;
  quickPoints: string[];
  spotsLabel: string;
  spots: ArticleSpot[];
  cardsLabel: string;
  cards: ArticleCard[];
  recommendedFor: string[];
  related: ArticleRelated[];
  officialUrl?: string;
  mapUrl?: string;
};

const EXPERIENCES: Record<number, ArticleExperienceData> = {
  32: {
    badges: ['新栄', 'NEW OPEN'],
    lead: '話題のマーラータン専門店が新栄に登場。辛さと具材を自由にカスタマイズできて、一度食べたらハマる味です。',
    quickPoints: [
      '名古屋・新栄エリアに待望のマーラータン専門店がオープン',
      '約50種の具材から自分好みにカスタマイズできる',
      '薬膳スープとモチモチ春雨が人気のポイント',
      '週末は行列になるほど話題の新店',
    ],
    spotsLabel: 'お店情報',
    spots: [
      {
        name: '七宝麻辣湯 新栄店',
        area: '新栄',
        description: '辛さと具材を自由に選べるマーラータン専門店。薬膳スープが自慢。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=七宝麻辣湯+新栄',
        detailHref: '/article/32',
      },
    ],
    cardsLabel: 'シーン別の使い方',
    cards: [
      { label: 'シーン', title: 'ランチに', description: '平日は比較的空いていてランチに使いやすい', tone: 'green' },
      { label: 'シーン', title: '夜ごはんに', description: '夜はにぎわいがあり雰囲気が出る', tone: 'blue' },
      { label: 'シーン', title: '辛い物好き', description: '辛さレベルを上げて本格的な味を楽しめる', tone: 'red' },
      { label: 'シーン', title: '辛さ苦手でも', description: '辛さゼロから選べるのでグループでも安心', tone: 'yellow' },
    ],
    recommendedFor: [
      'マーラータンを初めて食べてみたい方',
      '辛いものが好きな方',
      '新栄・千種エリアで新しいお店を探している方',
      '週末のランチ・ディナーを探している方',
    ],
    related: [
      { title: 'JR名古屋タカシマヤ デリシャスコートがリニューアルオープン', href: '/article/39', label: 'NEW OPEN' },
    ],
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=七宝麻辣湯+新栄',
  },

  39: {
    badges: ['名駅', 'ベーカリー', 'NEW OPEN'],
    lead: 'JR名古屋タカシマヤの地下フードフロアに、人気ベーカリーブランドが集結。パン好きは必見のエリアです。',
    quickPoints: [
      'JR名古屋タカシマヤ地下にベーカリーの聖地が誕生',
      '人気3ブランドが一か所に集まったデリシャスコート',
      '名古屋駅直結で雨の日も便利なアクセス',
      '手土産にも使えるパンが揃う',
    ],
    spotsLabel: 'スポット情報',
    spots: [
      {
        name: 'JR名古屋タカシマヤ デリシャスコート',
        area: '名駅',
        description: '人気ベーカリー3ブランドが集まるリニューアルエリア。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=JR名古屋タカシマヤ',
        detailHref: '/article/39',
      },
    ],
    cardsLabel: '使い方ガイド',
    cards: [
      { label: '使い方', title: '手土産に', description: '見栄えのするパンを選んで手土産にできる', tone: 'yellow' },
      { label: '使い方', title: '自分用に', description: '気になるブランドのパンを買い比べて楽しむ', tone: 'green' },
      { label: '使い方', title: '雨の日に', description: '名古屋駅直結なので天候を気にしない', tone: 'blue' },
      { label: '使い方', title: '出張帰りに', description: '新幹線前の立ち寄りスポットとして便利', tone: 'red' },
    ],
    recommendedFor: [
      'パンが好きな方',
      '名古屋駅で手土産を探している方',
      '新しいお店をいち早く試したい方',
      '出張・帰省前のお土産探しをしている方',
    ],
    related: [
      { title: '行列のできるマーラータン専門店が新栄にオープン', href: '/article/32', label: 'NEW OPEN' },
    ],
    officialUrl: 'https://www.jr-takashimaya.co.jp/',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=JR名古屋タカシマヤ',
  },

  54: {
    badges: ['名古屋市内', 'NEW OPEN', 'まとめ'],
    lead: '名古屋に新しいお店が続々登場。2026年7月オープンの新店をまとめて紹介します。',
    quickPoints: [
      '2026年7月オープンの名古屋新店情報をまとめて紹介',
      'グルメ・スイーツ・ベーカリーなど多ジャンルに対応',
      '各店の詳細記事へのリンクつきで情報が見やすい',
      '随時更新するのでこのページを保存しておくと便利',
    ],
    spotsLabel: 'オープンしたばかりの新店',
    spots: [
      {
        name: '七宝麻辣湯 新栄店',
        area: '新栄',
        description: '辛さと具材をカスタマイズできるマーラータン専門店。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=七宝麻辣湯+新栄',
        detailHref: '/article/32',
      },
      {
        name: 'JR名古屋タカシマヤ デリシャスコート',
        area: '名駅',
        description: '人気ベーカリー3ブランドが集まるリニューアルエリア。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=JR名古屋タカシマヤ',
        detailHref: '/article/39',
      },
    ],
    cardsLabel: '目的別の選び方',
    cards: [
      { label: '目的別', title: '今すぐ行きたい', description: 'オープン直後の話題店へいち早く足を運ぶ', tone: 'red' },
      { label: '目的別', title: '話題性重視', description: 'SNSで話題になっている注目店をチェック', tone: 'blue' },
      { label: '目的別', title: '駅近で便利', description: '主要駅から徒歩でアクセスしやすい店を選ぶ', tone: 'green' },
      { label: '目的別', title: '保存候補に', description: 'まずは保存してタイミングを見て行く', tone: 'yellow' },
    ],
    recommendedFor: [
      '名古屋の新しいお店が気になる方',
      '週末のおでかけ先を探している方',
      'いち早く新店情報を入手したい方',
      'なごとしゃの記事をまとめて見たい方',
    ],
    related: [
      { title: '七宝麻辣湯が新栄にオープン', href: '/article/32', label: 'NEW OPEN' },
      { title: 'JR名古屋タカシマヤ デリシャスコート', href: '/article/39', label: 'NEW OPEN' },
    ],
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=名古屋+新店',
  },

  56: {
    badges: ['名駅', '手土産', 'おすすめ'],
    lead: '出張帰り・帰省前に使える名古屋駅の手土産ガイド。売り場・予算・用途別にまとめました。',
    quickPoints: [
      '名古屋駅で買える手土産を売り場別に整理して紹介',
      '定番の名古屋銘菓から新定番まで幅広くチェック',
      '予算別・シーン別で選びやすいから迷わない',
      '出張帰りや帰省前に保存しておくと便利',
    ],
    spotsLabel: 'どこで買う？主要売り場',
    spots: [
      {
        name: 'JR名古屋タカシマヤ',
        area: '名駅',
        description: 'JR名古屋駅直結。手土産選びの中心になる売り場。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=JR名古屋タカシマヤ',
        detailHref: '/article/39',
      },
      {
        name: 'エスカ地下街',
        area: '名駅・太閤通口側',
        description: '太閤通口側から使いやすい地下街。名古屋定番土産が揃う。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=エスカ地下街+名古屋',
      },
      {
        name: '近鉄パッセ',
        area: '名駅',
        description: '近鉄名古屋駅周辺。スイーツ・洋菓子系が充実。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=近鉄パッセ+名古屋',
      },
      {
        name: '名鉄百貨店',
        area: '名駅',
        description: '名鉄名古屋駅直結。老舗銘菓から話題の新定番まで。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=名鉄百貨店+名古屋',
      },
    ],
    cardsLabel: '予算別の選び方',
    cards: [
      { label: '予算', title: '500円台〜', description: '個包装で数が多い職場のバラまき土産に', tone: 'green' },
      { label: '予算', title: '1,000〜2,000円台', description: 'バランスよく喜ばれる訪問先への定番ギフトに', tone: 'yellow' },
      { label: '予算', title: '3,000円台以上', description: '目上の方や特別な訪問先への手土産に', tone: 'red' },
    ],
    recommendedFor: [
      '職場や取引先への手土産を探している方',
      '名古屋らしいお菓子を贈りたい方',
      '家族や友人へのお土産を探している方',
      '小分けで配りやすいお菓子が欲しい方',
      '名古屋駅でサッと買いたい方',
    ],
    related: [
      { title: 'JR名古屋タカシマヤがパンの聖地に！デリシャスコート', href: '/article/39', label: 'パン好き必見' },
    ],
    officialUrl: 'https://www.jr-takashimaya.co.jp/',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=JR名古屋タカシマヤ',
  },

  57: {
    badges: ['名古屋', 'おでかけ', '雨の日'],
    lead: '名古屋には雨の日でも快適に過ごせる屋内スポットが揃っています。子連れ・カップル・ひとりで使いやすい7か所をまとめました。',
    quickPoints: [
      '雨でも行きやすい名古屋の屋内スポットを7か所紹介',
      '子連れ・デート・ひとり時間に使いやすい場所を整理',
      '駅近・屋内移動しやすいスポットを中心にセレクト',
      '保存して週末の雨の日おでかけに使えます',
    ],
    spotsLabel: '雨の日おでかけスポット 7選',
    spots: [
      {
        name: '名古屋港水族館',
        area: '港区',
        description: 'シャチ・ベルーガなど国内最大級の展示。所要2〜3時間。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=名古屋港水族館',
      },
      {
        name: 'リニア・鉄道館',
        area: '金城ふ頭',
        description: '本物の車両展示とシミュレーター体験。所要2〜3時間。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=リニア鉄道館+名古屋',
      },
      {
        name: '名古屋市科学館',
        area: '栄',
        description: '世界最大級のプラネタリウム。体験型展示も充実。所要2〜4時間。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=名古屋市科学館',
      },
      {
        name: 'オアシス21・栄地下街',
        area: '栄',
        description: '栄駅直結。地下街を活用して雨でも快適に散策できる。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=オアシス21+名古屋',
      },
      {
        name: 'JRゲートタワー・タカシマヤ',
        area: '名駅',
        description: 'JR名古屋駅直結。ショッピング・グルメを天候問わず楽しめる。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=JRゲートタワー+名古屋',
      },
      {
        name: '大須商店街',
        area: '大須',
        description: 'アーケード商店街なので雨でも傘なしで散策できる。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=大須商店街+名古屋',
      },
      {
        name: 'イオンモール Nagoya Noritake Garden',
        area: '則武',
        description: 'ショッピング・映画・グルメが揃う大型屋内施設。',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=イオンモール+Nagoya+Noritake+Garden',
      },
    ],
    cardsLabel: 'シーン別おすすめ',
    cards: [
      { label: 'シーン', title: '子連れで', description: '水族館・科学館・鉄道館は子どもが飽きない構成', tone: 'blue' },
      { label: 'シーン', title: 'デートに', description: 'オアシス21周辺・栄地下街がおすすめ', tone: 'red' },
      { label: 'シーン', title: 'ひとりで', description: 'プラネタリウムや大須をのんびり散策', tone: 'green' },
      { label: 'シーン', title: '短時間で', description: '大須商店街・栄地下街なら1〜2時間で楽しめる', tone: 'yellow' },
    ],
    recommendedFor: [
      '雨の日でも名古屋を楽しみたい方',
      '子連れで屋内スポットを探している方',
      'カップル・デートプランを考えている方',
      '週末のおでかけ先が決まらない方',
    ],
    related: [
      { title: 'JR名古屋タカシマヤ デリシャスコートがリニューアルオープン', href: '/article/39', label: '名駅' },
      { title: '行列のできるマーラータン専門店が新栄にオープン', href: '/article/32', label: 'NEW OPEN' },
    ],
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=名古屋+屋内+おでかけ',
  },
};

export function getArticleExperience(postId: number): ArticleExperienceData | undefined {
  return EXPERIENCES[postId];
}

export function getFakeSaveCount(id: string | number): number {
  const n = Number(id) || 1;
  return 8200 + ((n * 137) % 6200);
}

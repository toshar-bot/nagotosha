import type {
  AreaChoice,
  BudgetChoice,
  CandidateAction,
  CompareAxis,
  DecisionV3Candidate,
  MoodChoice,
  PartyChoice,
  RefineChoice,
} from '@/types/decision-v3';
import { buildGoogleMapsDirectionsUrl } from '@/lib/decision-v3-detail-actions';

// --- demo-b「矢場とん 名古屋駅エスカ店」verified store facts (2026-08-03) ---
const YABATON_ESCA_ADDRESS = '愛知県名古屋市中村区椿町6-9 エスカ地下街';
const YABATON_ESCA_PHONE_HREF = 'tel:0524526500';
const YABATON_ESCA_OFFICIAL_URL =
  'https://www.yabaton.com/modules/shop/index.php?content_id=5';
const YABATON_ESCA_PRIMARY_SOURCE =
  'https://www.yabaton.com/modules/shop/index.php?content_id=5';
const YABATON_ESCA_SUPPORT_SOURCE = 'https://www.esca-sc.com/shop_guide/126/';
const YABATON_ESCA_VERIFIED_AT = '2026-08-03';

export const CONDITION_GROUPS = [
  {
    key: 'party',
    title: '誰と行く？',
    options: [
      { value: 'solo' satisfies PartyChoice, label: '一人でも', icon: '01_party_solo.png' },
      { value: 'pair' satisfies PartyChoice, label: 'デート・ふたり', icon: '02_party_pair.png' },
      { value: 'family' satisfies PartyChoice, label: '家族・子どもと', icon: '03_party_family.png' },
      { value: 'group' satisfies PartyChoice, label: '友人・グループ', icon: '04_party_group.png' },
    ],
  },
  {
    key: 'budget',
    title: '予算は？',
    note: '1人あたりの目安',
    options: [
      { value: 'under1000' satisfies BudgetChoice, label: '〜1,000円', icon: '05_budget_1000.png' },
      { value: 'under2000' satisfies BudgetChoice, label: '〜2,000円', icon: '06_budget_2000.png' },
      { value: 'under4000' satisfies BudgetChoice, label: '〜4,000円', icon: '07_budget_4000.png' },
      { value: 'any' satisfies BudgetChoice, label: '気にしない', icon: '08_budget_any.png' },
    ],
  },
  {
    key: 'mood',
    title: '今の気分は？',
    options: [
      { value: 'hearty' satisfies MoodChoice, label: 'しっかり食べたい', icon: '09_mood_hearty.png' },
      { value: 'light' satisfies MoodChoice, label: '軽く楽しみたい', icon: '10_mood_light.png' },
      { value: 'relax' satisfies MoodChoice, label: 'ゆっくり過ごしたい', icon: '11_mood_relax.png' },
      {
        value: 'new-experience' satisfies MoodChoice,
        label: '新しい体験',
        icon: '12_mood_new_experience.png',
      },
    ],
  },
  {
    key: 'area',
    title: 'エリアは？',
    options: [
      { value: 'sakae' satisfies AreaChoice, label: '栄・伏見', icon: '13_area_sakae_fushimi.png' },
      { value: 'meieki' satisfies AreaChoice, label: '名駅・駅周辺', icon: '14_area_meieki_station.png' },
      { value: 'osu' satisfies AreaChoice, label: '大須・上前津', icon: '15_area_osu_kamimaezu.png' },
      { value: 'any' satisfies AreaChoice, label: 'こだわらない', icon: '16_area_anywhere.png' },
    ],
  },
] as const;

export const CONDITION_LABELS = {
  party: {
    solo: 'ひとり',
    pair: 'ふたり',
    family: '家族',
    group: 'グループ',
  },
  budget: {
    under1000: '〜1,000円',
    under2000: '〜2,000円',
    under4000: '〜4,000円',
    any: '予算は気にしない',
  },
  mood: {
    hearty: 'しっかり',
    light: '軽く',
    relax: 'ゆっくり',
    'new-experience': '新しい体験',
  },
  area: {
    sakae: '栄・伏見',
    meieki: '名駅・駅周辺',
    osu: '大須・上前津',
    any: 'エリアはこだわらない',
  },
} as const;

export const REFINE_CHOICES: ReadonlyArray<{ value: RefineChoice; label: string; initial: boolean }> = [
  { value: 'smoke-free', label: '禁煙', initial: true },
  { value: 'smoking-ok', label: '喫煙可', initial: true },
  { value: 'smoking-any', label: 'こだわらない', initial: true },
  { value: 'private-room', label: '個室あり', initial: true },
  { value: 'tatami', label: '座敷', initial: true },
  { value: 'counter', label: 'カウンター席あり', initial: true },
  { value: 'kids-ok', label: '子連れ・ベビーカーOK', initial: true },
  { value: 'reservable', label: '予約', initial: true },
  { value: 'parking', label: '駐車場あり', initial: false },
  { value: 'rain-safe', label: '雨でも安心', initial: false },
  { value: 'wifi', label: 'Wi-Fiあり', initial: false },
  { value: 'power', label: '電源あり', initial: false },
  { value: 'terrace', label: 'テラス席', initial: false },
  { value: 'late-night', label: '深夜営業', initial: false },
  { value: 'quiet', label: '静か', initial: false },
  { value: 'long-stay', label: '長居しやすい', initial: false },
];

export const COMPARE_AXIS_LABELS: Record<CompareAxis, string> = {
  budget: '予算',
  area: 'エリア',
  access: 'アクセス',
  atmosphere: '雰囲気',
  smoking: '禁煙・喫煙',
  seats: '席・過ごし方',
  'private-room': '個室',
  tatami: '座敷',
  solo: '一人でも',
  kids: '子連れ',
  reservation: '予約',
  'long-stay': '長居しやすさ',
  wifi: 'Wi-Fi',
  power: '電源',
  'rain-safe': '雨でも安心',
  parking: '駐車場',
  terrace: 'テラス席',
  'late-night': '遅い時間',
  quiet: '静かさ',
};

export const ALL_COMPARE_AXES = Object.keys(COMPARE_AXIS_LABELS) as CompareAxis[];

export function isCandidateActionDisplayable(action: CandidateAction) {
  return (
    action.availability === 'verified'
    && Boolean(action.href?.trim())
    && Boolean(action.verifiedAt?.trim())
    && Boolean(action.source?.trim())
  );
}

export const DEMO_CANDIDATES: DecisionV3Candidate[] = [
  {
    id: 'demo-a',
    neutralLabel: '候補A',
    name: '喫茶 カクレガ',
    area: '栄・伏見',
    budget: '¥1,200〜2,000',
    genre: '洋食・喫茶',
    tags: ['一人でも', 'デート・ふたり', 'しっかり食べたい'],
    points: [
      '落ち着いた空間で、ゆっくり過ごせる',
      '2,000円以内で選択肢を見つけやすい',
      '駅から歩く時間を短くしやすい',
    ],
    facts: {
      access: '栄・伏見エリア',
      atmosphere: '落ち着いた喫茶',
      smoking: 'DEMOでは未確認',
      seats: 'テーブル席中心',
      privateRoom: 'DEMOでは未確認',
      tatami: 'なし',
      solo: '一人でも選びやすい',
      kids: 'DEMOでは未確認',
      reservation: 'DEMOでは未確認',
      longStay: 'ゆっくり過ごす想定',
    },
    actions: [
      { type: 'official', label: '公式を見る', availability: 'unknown' },
      { type: 'access', label: 'アクセス（地図）', availability: 'unknown' },
      { type: 'reservation', label: '予約・空席を確認', availability: 'unknown' },
    ],
    photo: {
      src: '/decision/v3/demo-photos/candidate-a.webp',
      detailSrc: '/decision/v3/demo-photos/candidate-a-interior.webp',
      alt: '喫茶店の料理（操作確認用のDEMO画像）',
      availability: 'available',
      rightsStatus: 'unverified',
    },
    demoSelection: {
      supportedPartyTypes: ['solo', 'pair'],
      priceMin: 1200,
      priceMax: 2000,
      supportedPurposes: ['hearty', 'relax', 'new-experience'],
      area: 'sakae',
      smokingPolicy: 'smoke-free',
      privateRoom: false,
      tatami: false,
      counter: true,
      familyAndStroller: 'unknown',
      reservation: 'unknown',
      parking: false,
      rainFriendly: true,
      wifi: true,
      powerOutlet: true,
      terrace: false,
      lateNight: false,
      quiet: true,
      longStay: true,
    },
  },
  {
    id: 'demo-b',
    neutralLabel: '候補B',
    name: '矢場とん 名古屋駅エスカ店',
    area: '名駅・駅周辺',
    budget: '¥1,500〜2,000',
    genre: '名古屋めし',
    tags: ['デート・ふたり', 'しっかり食べたい', '雨でも安心'],
    points: [
      '名駅周辺で名古屋らしい食事を選べる',
      'しっかり食べたい気分に合わせやすい',
      '屋内移動を中心に計画しやすい',
    ],
    facts: {
      access: '名駅・駅周辺エリア',
      atmosphere: '活気のある食事処',
      smoking: 'DEMOでは未確認',
      seats: 'テーブル席の想定',
      privateRoom: 'DEMOでは未確認',
      tatami: 'なし',
      solo: '一人でも利用を検討できる',
      kids: 'DEMOでは未確認',
      reservation: 'DEMOでは未確認',
      longStay: '食事中心',
    },
    actions: [
      {
        type: 'access',
        label: 'Googleマップで行く',
        href: buildGoogleMapsDirectionsUrl(YABATON_ESCA_ADDRESS),
        availability: 'verified',
        verifiedAt: YABATON_ESCA_VERIFIED_AT,
        source: YABATON_ESCA_SUPPORT_SOURCE,
      },
      {
        type: 'reservation',
        label: '電話で予約',
        href: YABATON_ESCA_PHONE_HREF,
        availability: 'verified',
        verifiedAt: YABATON_ESCA_VERIFIED_AT,
        source: YABATON_ESCA_PRIMARY_SOURCE,
      },
      {
        type: 'official',
        label: '公式サイト',
        href: YABATON_ESCA_OFFICIAL_URL,
        availability: 'verified',
        verifiedAt: YABATON_ESCA_VERIFIED_AT,
        source: YABATON_ESCA_PRIMARY_SOURCE,
      },
    ],
    photo: {
      src: '/decision/v3/demo-photos/candidate-b.webp',
      alt: 'みそかつ料理（操作確認用のDEMO画像）',
      availability: 'available',
      rightsStatus: 'unverified',
    },
    detailInfo: {
      address: {
        value: YABATON_ESCA_ADDRESS,
        verifiedAt: YABATON_ESCA_VERIFIED_AT,
        source: YABATON_ESCA_SUPPORT_SOURCE,
      },
      hours: {
        value: '11:00〜22:00（L.O. 21:30）',
        verifiedAt: YABATON_ESCA_VERIFIED_AT,
        source: YABATON_ESCA_PRIMARY_SOURCE,
      },
      phone: {
        value: '052-452-6500',
        verifiedAt: YABATON_ESCA_VERIFIED_AT,
        source: YABATON_ESCA_PRIMARY_SOURCE,
      },
      seats: {
        value: '49席',
        verifiedAt: YABATON_ESCA_VERIFIED_AT,
        source: YABATON_ESCA_PRIMARY_SOURCE,
      },
      reservation: {
        value: '予約可',
        verifiedAt: YABATON_ESCA_VERIFIED_AT,
        source: YABATON_ESCA_PRIMARY_SOURCE,
      },
      confirmedChips: ['予約可', '49席', 'エスカ地下街'],
      highlights: [
        {
          title: '味噌かつ専門店',
          body: '昭和22年創業の矢場とんが運営する店舗です。',
          icon: 'restaurant.svg',
          verifiedAt: YABATON_ESCA_VERIFIED_AT,
          source: YABATON_ESCA_PRIMARY_SOURCE,
        },
        {
          title: '素材へのこだわり',
          body: '南九州産の豚肉を使用し、パン粉と揚げ油にも独自の工夫があります。',
          icon: 'tune.svg',
          verifiedAt: YABATON_ESCA_VERIFIED_AT,
          source: YABATON_ESCA_PRIMARY_SOURCE,
        },
        {
          title: '49席・予約可',
          body: '店内は49席あり、公式情報で予約可と確認できます。',
          icon: 'group.svg',
          verifiedAt: YABATON_ESCA_VERIFIED_AT,
          source: YABATON_ESCA_SUPPORT_SOURCE,
        },
      ],
    },
    demoSelection: {
      supportedPartyTypes: ['solo', 'pair', 'family', 'group'],
      priceMin: 1500,
      priceMax: 2000,
      supportedPurposes: ['hearty', 'new-experience'],
      area: 'meieki',
      smokingPolicy: 'smoke-free',
      privateRoom: false,
      tatami: false,
      counter: false,
      familyAndStroller: true,
      reservation: false,
      parking: 'unknown',
      rainFriendly: true,
      wifi: 'unknown',
      powerOutlet: 'unknown',
      terrace: false,
      lateNight: false,
      quiet: false,
      longStay: false,
    },
  },
  {
    id: 'demo-c',
    neutralLabel: '候補C',
    name: '手打ちそば つむぎ',
    area: '大須・上前津',
    budget: '¥1,100〜1,800',
    genre: 'そば',
    tags: ['一人でも', '軽く楽しみたい', '雨でも安心'],
    points: [
      '軽めの食事を落ち着いて楽しみやすい',
      '2,000円以内で候補に入れやすい',
      '大須散策の途中に組み込みやすい',
    ],
    facts: {
      access: '大須・上前津エリア',
      atmosphere: '和の落ち着き',
      smoking: 'DEMOでは未確認',
      seats: 'カウンター・テーブルの想定',
      privateRoom: 'DEMOでは未確認',
      tatami: 'DEMOでは未確認',
      solo: '一人でも選びやすい',
      kids: 'DEMOでは未確認',
      reservation: 'DEMOでは未確認',
      longStay: '食事中心',
    },
    actions: [
      { type: 'official', label: '公式を見る', availability: 'unknown' },
      { type: 'access', label: 'アクセス（地図）', availability: 'unknown' },
    ],
    photo: {
      src: '/decision/v3/demo-photos/candidate-c.webp',
      alt: 'そば料理（操作確認用のDEMO画像）',
      availability: 'available',
      rightsStatus: 'unverified',
    },
    demoSelection: {
      supportedPartyTypes: ['solo', 'pair'],
      priceMin: 1100,
      priceMax: 1800,
      supportedPurposes: ['light', 'relax', 'new-experience'],
      area: 'osu',
      smokingPolicy: 'unknown',
      privateRoom: 'unknown',
      tatami: 'unknown',
      counter: true,
      familyAndStroller: 'unknown',
      reservation: 'unknown',
      parking: false,
      rainFriendly: true,
      wifi: false,
      powerOutlet: false,
      terrace: false,
      lateNight: false,
      quiet: true,
      longStay: false,
    },
  },
];

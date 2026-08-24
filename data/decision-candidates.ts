import type {
  DecisionCandidate,
  DecisionMode,
  PreviewAssetAvailability,
} from '@/types/decision-candidate';

export const MINIMUM_CANDIDATES_PER_MODE = 3;

const PROPOSED_VERIFIED_AT = '2026-08-24';

/**
 * S2 provisional records only. They intentionally have no approved editorial
 * classification, relationship review, verification artifacts, operator
 * review, or independent review. The formal adapter therefore keeps
 * production presentation candidates at zero until human review is complete.
 */
export const DECISION_CANDIDATES: readonly DecisionCandidate[] = [
  {
    id: 'meieki-yabaton-nagoya-eki-esca',
    relationshipTarget: {
      kind: 'catalog',
      storeId: 'meieki-yabaton-nagoya-eki-esca',
      relationship: 'unknown',
    },
    decisionMode: 'food',
    entityType: 'place',
    displayName: '矢場とん 名古屋駅エスカ店',
    visual: { kind: 'none' },
    // Proposed classifications; no editorial-classification evidence is
    // registered before human review.
    partyTypes: ['solo', 'couple', 'family', 'group'],
    budgetBand: 'under2000',
    moodTags: ['hearty'],
    reservationNeed: 'optional',
    reservationAvailability: 'not-confirmed',
    area: 'meieki',
    location: '愛知県名古屋市中村区椿町6-9 エスカ地下街',
    nearestStation: '名古屋駅',
    openingHours: { opens: '11:00', closes: '22:00', lastOrder: '21:30' },
    timeOfDay: ['lunch', 'dinner'],
    weatherFit: 'indoor',
    currentStatus: 'available',
    statusVerifiedAt: PROPOSED_VERIFIED_AT,
    openingHoursVerifiedAt: PROPOSED_VERIFIED_AT,
    priceVerifiedAt: PROPOSED_VERIFIED_AT,
    actions: [
      {
        type: 'official',
        label: '公式情報を見る',
        url: 'https://www.yabaton.com/modules/shop/index.php?content_id=5',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
      {
        type: 'map',
        label: 'Google Mapsで見る',
        url: 'https://www.google.com/maps/dir/?api=1&destination=%E7%9F%A2%E5%A0%B4%E3%81%A8%E3%82%93%20%E5%90%8D%E5%8F%A4%E5%B1%8B%E9%A7%85%E3%82%A8%E3%82%B9%E3%82%AB%E5%BA%97%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E6%9D%91%E5%8C%BA%E6%A4%BF%E7%94%BA6-9',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
      {
        type: 'phone',
        label: '電話する',
        url: 'tel:0524526500',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
    ],
    evidenceIds: [
      's2-yabaton-status',
      's2-yabaton-hours',
      's2-yabaton-price',
      's2-yabaton-location',
      's2-yabaton-official-url',
      's2-yabaton-phone',
    ],
  },
  {
    id: 'food-178-potama-haera',
    relationshipTarget: { kind: 'article', articleId: 178 },
    decisionMode: 'food',
    entityType: 'place',
    displayName: 'ポーたま 名古屋HAERA店',
    visual: { kind: 'none' },
    // Proposed classifications; no editorial-classification evidence is
    // registered before human review.
    partyTypes: ['solo', 'couple'],
    budgetBand: 'under1000',
    moodTags: ['quick', 'light'],
    reservationNeed: 'not-confirmed',
    reservationAvailability: 'not-confirmed',
    area: 'sakae',
    location: '愛知県名古屋市中区錦3-25-1 HAERA B2F',
    nearestStation: '栄駅',
    openingHours: { opens: '07:00', closes: '21:00' },
    timeOfDay: ['morning', 'lunch', 'dinner'],
    weatherFit: 'indoor',
    currentStatus: 'available',
    statusVerifiedAt: PROPOSED_VERIFIED_AT,
    openingHoursVerifiedAt: PROPOSED_VERIFIED_AT,
    priceVerifiedAt: PROPOSED_VERIFIED_AT,
    actions: [
      {
        type: 'article',
        label: '記事を見る',
        url: '/article/178',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
      {
        type: 'official',
        label: '公式情報を見る',
        url: 'https://porktamago.com/shop/012-pnh/',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
      {
        type: 'map',
        label: 'Google Mapsで見る',
        url: 'https://www.google.com/maps/dir/?api=1&destination=%E3%83%9D%E3%83%BC%E3%81%9F%E3%81%BE%20%E5%90%8D%E5%8F%A4%E5%B1%8B%20HAERA%E5%BA%97%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E5%8C%BA%E9%8C%A63-25-1',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
      {
        type: 'phone',
        label: '電話する',
        url: 'tel:0522126733',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
    ],
    evidenceIds: [
      's2-potama-status',
      's2-potama-hours',
      's2-potama-price',
      's2-potama-location',
      's2-potama-official-url',
      's2-potama-phone',
    ],
  },
  {
    id: 'osu-konparu-honten',
    relationshipTarget: {
      kind: 'catalog',
      storeId: 'osu-konparu-honten',
      relationship: 'unknown',
    },
    decisionMode: 'food',
    entityType: 'place',
    displayName: 'コンパル 大須本店',
    visual: { kind: 'none' },
    // Proposed classifications; no editorial-classification evidence is
    // registered before human review.
    partyTypes: ['solo', 'couple', 'family', 'group'],
    budgetBand: 'under2000',
    moodTags: ['relax', 'light'],
    reservationNeed: 'not-confirmed',
    reservationAvailability: 'not-confirmed',
    area: 'osu',
    location: '愛知県名古屋市中区大須3-20-19',
    nearestStation: '上前津駅',
    openingHours: { opens: '08:00', closes: '19:00', lastOrder: '18:30' },
    timeOfDay: ['morning', 'lunch', 'afternoon'],
    weatherFit: 'indoor',
    currentStatus: 'available',
    statusVerifiedAt: PROPOSED_VERIFIED_AT,
    openingHoursVerifiedAt: PROPOSED_VERIFIED_AT,
    priceVerifiedAt: PROPOSED_VERIFIED_AT,
    actions: [
      {
        type: 'official',
        label: '公式情報を見る',
        url: 'https://www.konparu.co.jp/shop/',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
      {
        type: 'map',
        label: 'Google Mapsで見る',
        url: 'https://www.google.com/maps/dir/?api=1&destination=%E3%82%B3%E3%83%B3%E3%83%91%E3%83%AB%20%E5%A4%A7%E9%A0%88%E6%9C%AC%E5%BA%97%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E5%8C%BA%E5%A4%A7%E9%A0%883-20-19',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
      {
        type: 'phone',
        label: '電話する',
        url: 'tel:0522413883',
        verifiedAt: PROPOSED_VERIFIED_AT,
      },
    ],
    evidenceIds: [
      's2-konparu-status',
      's2-konparu-hours',
      's2-konparu-price',
      's2-konparu-location',
      's2-konparu-official-url',
      's2-konparu-phone',
    ],
  },
];

export const PREVIEW_ASSET_AVAILABILITY: PreviewAssetAvailability = {
  mascotAssetAvailable: true,
};

export const DECISION_MODES: readonly DecisionMode[] = ['food', 'event', 'outing'];

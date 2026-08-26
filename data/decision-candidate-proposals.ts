import type { FormalDecisionV3CandidateDefinition } from '@/lib/decision-v3-formal-adapter';
import type { DecisionAction, DecisionCandidate } from '@/types/decision-candidate';

type StoredSourceArtifactProposal = {
  sourceUrl: string;
  acquiredAt: string;
  originalPath: string;
  sha256: string;
};

type CandidateReviewProposal = {
  candidateId: string;
  catalogStoreId: string;
  identityFactIds: readonly string[];
  formalDefinition: FormalDecisionV3CandidateDefinition;
  proposedPartyTypes: readonly DecisionCandidate['partyTypes'][number][];
  proposedMoodTags: readonly DecisionCandidate['moodTags'][number][];
  relationshipProposal: string;
  visualRightsStatus: 'none';
  reservationStatus: 'not-confirmed' | 'optional';
  actions: readonly Pick<DecisionAction, 'type' | 'label' | 'url' | 'verifiedAt'>[];
  sourceArtifacts: readonly StoredSourceArtifactProposal[];
  requiredOperatorReview: readonly string[];
  requiredIndependentReview: readonly string[];
  gateStatus: 'provisional-blocked';
};

const S2_HELD_ACQUIRED_AT = '2026-08-24T09:07:41Z';
const S2_HELD_REVIEW_ROOT = 'C:/Users/KAIRI/Documents/Codex/reviews/nagotosha/S2-2026-08-24';
const ACQUIRED_AT = '2026-08-24T11:55:43Z';
const REVIEW_ROOT = 'C:/Users/KAIRI/Documents/Codex/reviews/nagotosha/S2-3-2026-08-24';

/**
 * Review metadata for S2. This is not a release-readiness record: no human
 * reviewer, approval, or production-use flag is recorded here. The artifacts
 * stay outside the repository and must be reread during human review.
 */
export const S2_HELD_CANDIDATE_PROPOSALS: readonly CandidateReviewProposal[] = [
  {
    candidateId: 'meieki-yabaton-nagoya-eki-esca',
    catalogStoreId: 'meieki-yabaton-nagoya-eki-esca',
    identityFactIds: [
      'fact-meieki-yabaton-display-name',
      'fact-meieki-yabaton-address',
      'fact-meieki-yabaton-area',
    ],
    formalDefinition: {
      candidateId: 'meieki-yabaton-nagoya-eki-esca',
      area: 'meieki',
      genre: 'みそかつ',
      price: {
        kind: 'fixed',
        amount: 2000,
        label: '¥2,000（わらじとんかつ弁当・テイクアウト）',
      },
    },
    proposedPartyTypes: ['solo', 'couple', 'family', 'group'],
    proposedMoodTags: ['hearty'],
    relationshipProposal: 'catalog relationship: unknown。記事targetは作成しない。',
    visualRightsStatus: 'none',
    reservationStatus: 'optional',
    actions: [
      {
        type: 'official',
        label: '公式情報を見る',
        url: 'https://www.yabaton.com/modules/shop/index.php?content_id=5',
        verifiedAt: '2026-08-24',
      },
      {
        type: 'map',
        label: 'Google Mapsで見る',
        url: 'https://www.google.com/maps/dir/?api=1&destination=%E7%9F%A2%E5%A0%B4%E3%81%A8%E3%82%93%20%E5%90%8D%E5%8F%A4%E5%B1%8B%E9%A7%85%E3%82%A8%E3%82%B9%E3%82%AB%E5%BA%97%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E6%9D%91%E5%8C%BA%E6%A4%BF%E7%94%BA6-9',
        verifiedAt: '2026-08-24',
      },
      {
        type: 'phone',
        label: '電話する',
        url: 'tel:0524526500',
        verifiedAt: '2026-08-24',
      },
    ],
    sourceArtifacts: [
      {
        sourceUrl: 'https://www.yabaton.com/modules/shop/index.php?content_id=5',
        acquiredAt: S2_HELD_ACQUIRED_AT,
        originalPath: `${S2_HELD_REVIEW_ROOT}/sources/yabaton/official-store.html`,
        sha256: '9c9a24b9a14b97ca95ef5159e42f549d35fee69f95fbee9e80040e64731a4af1',
      },
      {
        sourceUrl: 'https://www.esca-sc.com/takeout/',
        acquiredAt: S2_HELD_ACQUIRED_AT,
        originalPath: `${S2_HELD_REVIEW_ROOT}/sources/yabaton/esca-takeout.html`,
        sha256: '13e2740b37946002688da38729b0ff247961fe192f212a519105e487f0acbf50',
      },
    ],
    requiredOperatorReview: [
      '原本で店名、住所、営業時間、電話、49席、予約可を再確認する。',
      'テイクアウト価格を店内通常価格と混同しない表示を承認する。',
      'party・mood・reservationNeedの提案を承認または差し戻す。',
      'catalog relationshipと利益相反を確認する。',
    ],
    requiredIndependentReview: [
      'official／Maps／phone actionと原本の一致を確認する。',
      'relationship unknownを解消する根拠があるかを確認する。',
      'visual:noneのまま公開可能かを確認する。',
    ],
    gateStatus: 'provisional-blocked',
  },
  {
    candidateId: 'food-178-potama-haera',
    catalogStoreId: 'sakae-potama-nagoya-haera',
    identityFactIds: [
      'fact-sakae-potama-display-name',
      'fact-sakae-potama-address',
      'fact-sakae-potama-area',
    ],
    formalDefinition: {
      candidateId: 'food-178-potama-haera',
      area: 'sakae',
      genre: 'ポークたまごおにぎり',
      price: { kind: 'fixed', amount: 980, label: '¥980（味噌カツ）' },
    },
    proposedPartyTypes: ['solo', 'couple'],
    proposedMoodTags: ['quick', 'light'],
    relationshipProposal: 'article 178はregistryでeditorial。ただし候補接続の人間確認は未完了。',
    visualRightsStatus: 'none',
    reservationStatus: 'not-confirmed',
    actions: [
      {
        type: 'article',
        label: '記事を見る',
        url: '/article/178',
        verifiedAt: '2026-08-24',
      },
      {
        type: 'official',
        label: '公式情報を見る',
        url: 'https://porktamago.com/shop/012-pnh/',
        verifiedAt: '2026-08-24',
      },
      {
        type: 'map',
        label: 'Google Mapsで見る',
        url: 'https://www.google.com/maps/dir/?api=1&destination=%E3%83%9D%E3%83%BC%E3%81%9F%E3%81%BE%20%E5%90%8D%E5%8F%A4%E5%B1%8B%20HAERA%E5%BA%97%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E5%8C%BA%E9%8C%A63-25-1',
        verifiedAt: '2026-08-24',
      },
      {
        type: 'phone',
        label: '電話する',
        url: 'tel:0522126733',
        verifiedAt: '2026-08-24',
      },
    ],
    sourceArtifacts: [
      {
        sourceUrl: 'https://porktamago.com/shop/012-pnh/',
        acquiredAt: S2_HELD_ACQUIRED_AT,
        originalPath: `${S2_HELD_REVIEW_ROOT}/sources/potama/official-shop.html`,
        sha256: '132d1f1014a67b9f7352858c202aca15eec8dfab67a89422a33e353666fcb4d8',
      },
      {
        sourceUrl: 'https://porktamago.com/menu/p0003/',
        acquiredAt: S2_HELD_ACQUIRED_AT,
        originalPath: `${S2_HELD_REVIEW_ROOT}/sources/potama/official-menu-misokatsu.html`,
        sha256: '63aa9b145af97e97233273a4dd295c41a3f26a5a321818298a0ff0b1d9630be4',
      },
    ],
    requiredOperatorReview: [
      '原本で店名、住所、営業時間、12席、電話、駅直結を再確認する。',
      '味噌カツ980円の適用範囲とデリバリー別価格を確認する。',
      'party・mood・reservationNeedの提案を承認または差し戻す。',
      'article 178との候補接続および利益相反を確認する。',
    ],
    requiredIndependentReview: [
      'official／Maps／phone actionと原本の一致を確認する。',
      'article 178 relationshipの根拠と開示要否を確認する。',
      'visual:noneのまま公開可能かを確認する。',
    ],
    gateStatus: 'provisional-blocked',
  },
  {
    candidateId: 'osu-konparu-honten',
    catalogStoreId: 'osu-konparu-honten',
    identityFactIds: [
      'fact-osu-konparu-display-name',
      'fact-osu-konparu-address',
      'fact-osu-konparu-area',
    ],
    formalDefinition: {
      candidateId: 'osu-konparu-honten',
      area: 'osu',
      genre: '喫茶・サンドイッチ',
      price: { kind: 'fixed', amount: 1200, label: '¥1,200（エビフライサンド）' },
    },
    proposedPartyTypes: ['solo', 'couple', 'family', 'group'],
    proposedMoodTags: ['relax', 'light'],
    relationshipProposal: 'catalog relationship: unknown。記事targetは作成しない。',
    visualRightsStatus: 'none',
    reservationStatus: 'not-confirmed',
    actions: [
      {
        type: 'official',
        label: '公式情報を見る',
        url: 'https://www.konparu.co.jp/shop/',
        verifiedAt: '2026-08-24',
      },
      {
        type: 'map',
        label: 'Google Mapsで見る',
        url: 'https://www.google.com/maps/dir/?api=1&destination=%E3%82%B3%E3%83%B3%E3%83%91%E3%83%AB%20%E5%A4%A7%E9%A0%88%E6%9C%AC%E5%BA%97%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E5%8C%BA%E5%A4%A7%E9%A0%883-20-19',
        verifiedAt: '2026-08-24',
      },
      {
        type: 'phone',
        label: '電話する',
        url: 'tel:0522413883',
        verifiedAt: '2026-08-24',
      },
    ],
    sourceArtifacts: [
      {
        sourceUrl: 'https://www.konparu.co.jp/shop/',
        acquiredAt: S2_HELD_ACQUIRED_AT,
        originalPath: `${S2_HELD_REVIEW_ROOT}/sources/konparu/official-shop.html`,
        sha256: 'b64524de35ceda20e3ccf513ff2ddb5383d813eb52516c4e8967e5668249b002',
      },
      {
        sourceUrl: 'https://www.konparu.co.jp/menu/index.html',
        acquiredAt: S2_HELD_ACQUIRED_AT,
        originalPath: `${S2_HELD_REVIEW_ROOT}/sources/konparu/official-menu.html`,
        sha256: 'e671b026e88e0ac18f3f6460bb66df4311fe1569074cc9da0aeafb50c8251c38',
      },
    ],
    requiredOperatorReview: [
      '原本で店名、住所、営業時間、86席、電話、全店禁煙を再確認する。',
      'エビフライサンド1,200円が店舗別メニュー差異を越えて使える表記か確認する。',
      'party・mood・reservationNeedの提案を承認または差し戻す。',
      'catalog relationshipと利益相反を確認する。',
    ],
    requiredIndependentReview: [
      'official／Maps／phone actionと原本の一致を確認する。',
      'relationship unknownを解消する根拠があるかを確認する。',
      'visual:noneのまま公開可能かを確認する。',
    ],
    gateStatus: 'provisional-blocked',
  },
];

/**
 * Initial S2.3 candidate proposals. Every entry remains blocked until the
 * original sources and the proposed classifications have both human reviews.
 * They deliberately use catalog targets only: this change does not create an
 * Article→Decision mapping or CTA.
 */
export const INITIAL_FORMAL_CANDIDATE_PROPOSALS: readonly CandidateReviewProposal[] = [
  {
    candidateId: 'meieki-erick-south-kitte-nagoya',
    catalogStoreId: 'meieki-erick-south-kitte-nagoya',
    identityFactIds: [
      'fact-meieki-erick-south-display-name',
      'fact-meieki-erick-south-address',
      'fact-meieki-erick-south-area',
    ],
    formalDefinition: {
      candidateId: 'meieki-erick-south-kitte-nagoya',
      area: 'meieki',
      genre: '南インド料理',
      price: {
        kind: 'range',
        minimum: 1089,
        maximum: 2350,
        label: '¥1,089〜¥2,350（KITTE名古屋店ランチ主食メニュー）',
      },
    },
    proposedPartyTypes: ['solo', 'couple', 'group'],
    proposedMoodTags: ['hearty', 'newExperience'],
    relationshipProposal: 'catalog relationship: unknown。記事targetは作成しない。',
    visualRightsStatus: 'none',
    reservationStatus: 'not-confirmed',
    actions: [
      { type: 'official', label: '公式情報を見る', url: 'https://info.erickcurry.jp/kitte/', verifiedAt: '2026-08-24' },
      { type: 'map', label: 'Google Mapsで見る', url: 'https://www.google.com/maps/dir/?api=1&destination=%E3%82%A8%E3%83%AA%E3%83%83%E3%82%AF%E3%82%B5%E3%82%A6%E3%82%B9%20KITTE%E5%90%8D%E5%8F%A4%E5%B1%8B%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E6%9D%91%E5%8C%BA%E5%90%8D%E9%A7%851-1-1', verifiedAt: '2026-08-24' },
      { type: 'phone', label: '電話する', url: 'tel:0524331780', verifiedAt: '2026-08-24' },
    ],
    sourceArtifacts: [
      {
        sourceUrl: 'https://info.erickcurry.jp/kitte/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/erick-south-kitte/official-store.html`,
        sha256: '21510f116d32025a187de0283389711b76c41971de91ae80303ddaad7b54a550',
      },
      {
        sourceUrl: 'https://info.erickcurry.jp/kitte/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/erick-south-kitte/official-lunch-menu-1.jpg`,
        sha256: '3d737422a6ad15bee834dc3b66a2bca29deee7fdf7d2b69634c5fdf67e8eafeb',
      },
      {
        sourceUrl: 'https://info.erickcurry.jp/kitte/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/erick-south-kitte/official-lunch-menu-3.jpg`,
        sha256: 'a94c0742f7dba70739f8b2d3598aed3855d571ee675878926a111cc59d0407ba',
      },
    ],
    requiredOperatorReview: [
      '原本で店名、住所、営業時間、電話、Maps actionとランチ主食¥1,089〜¥2,350の対象・除外を確認する。',
      'party・mood・reservation・relationship unknown・visual:noneの提案を承認または差し戻す。',
    ],
    requiredIndependentReview: [
      '保存原本SHA256と公式ページ、3 actionの一致を再確認する。',
      '価格範囲が店内ランチ主食だけであり、追加・飲料・デザート・ディナー・テイクアウトを含まないことを確認する。',
    ],
    gateStatus: 'provisional-blocked',
  },
  {
    candidateId: 'sakae-potama-nagoya-haera',
    catalogStoreId: 'sakae-potama-nagoya-haera',
    identityFactIds: [
      'fact-sakae-potama-display-name',
      'fact-sakae-potama-address',
      'fact-sakae-potama-area',
    ],
    formalDefinition: {
      candidateId: 'sakae-potama-nagoya-haera',
      area: 'sakae',
      genre: 'ポークたまごおにぎり',
      price: {
        kind: 'range',
        minimum: 450,
        maximum: 1300,
        label: '¥450〜¥1,300（全店共通7品＋名古屋HAERA店限定主食4品）',
      },
    },
    proposedPartyTypes: ['solo', 'couple'],
    proposedMoodTags: ['quick', 'light'],
    relationshipProposal: 'catalog relationship: unknown。記事targetは作成しない。',
    visualRightsStatus: 'none',
    reservationStatus: 'not-confirmed',
    actions: [
      { type: 'official', label: '公式情報を見る', url: 'https://porktamago.com/shop/012-pnh/', verifiedAt: '2026-08-24' },
      { type: 'map', label: 'Google Mapsで見る', url: 'https://www.google.com/maps/dir/?api=1&destination=%E3%83%9D%E3%83%BC%E3%81%9F%E3%81%BE%20%E5%90%8D%E5%8F%A4%E5%B1%8B%20HAERA%E5%BA%97%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E5%8C%BA%E9%8C%A63-25-1', verifiedAt: '2026-08-24' },
      { type: 'phone', label: '電話する', url: 'tel:0522126733', verifiedAt: '2026-08-24' },
    ],
    sourceArtifacts: [
      {
        sourceUrl: 'https://porktamago.com/shop/012-pnh/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/potama-haera/official-store.html`,
        sha256: '132d1f1014a67b9f7352858c202aca15eec8dfab67a89422a33e353666fcb4d8',
      },
      {
        sourceUrl: 'https://porktamago.com/menu/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/potama-haera/official-menu-index.html`,
        sha256: 'e0a8cd2d1fcc158e08e684bc3d31d536698240655e57b155378d6925cb79f3ea',
      },
      {
        sourceUrl: 'https://porktamago.com/menu/st0001/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/potama-haera/official-standard-01.html`,
        sha256: '2b218c32e68d2a03c69046f663c6f3300374160ae93afd820620fa117b0cbb85',
      },
      {
        sourceUrl: 'https://porktamago.com/menu/p0011/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/potama-haera/official-haera-01.html`,
        sha256: '1714fe1cf6ab6e1f7f660055a0545aa6ea95a55440f87a7f2607e86da9353673',
      },
    ],
    requiredOperatorReview: [
      '原本で店名、住所、営業時間、電話、Maps actionと全店共通7品・HAERA店限定4品の¥450〜¥1,300範囲を確認する。',
      'party・mood・reservation・relationship unknown・visual:noneの提案を承認または差し戻す。',
    ],
    requiredIndependentReview: [
      '保存原本SHA256と公式ページ、3 actionの一致を再確認する。',
      '価格範囲が単品主食のみで、Special・Box・スープ／ドリンク・サイド・モーニング／ランチセット・デリバリーを除外することを確認する。',
    ],
    gateStatus: 'provisional-blocked',
  },
  {
    candidateId: 'osu-sugakiya-osu',
    catalogStoreId: 'osu-sugakiya-osu',
    identityFactIds: [
      'fact-osu-sugakiya-display-name',
      'fact-osu-sugakiya-address',
      'fact-osu-sugakiya-area',
    ],
    formalDefinition: {
      candidateId: 'osu-sugakiya-osu',
      area: 'osu',
      genre: 'ラーメン',
      price: {
        kind: 'range',
        minimum: 290,
        maximum: 680,
        label: '¥290〜¥680（大須店ラーメンカテゴリー）',
      },
    },
    proposedPartyTypes: ['solo', 'family'],
    proposedMoodTags: ['light'],
    relationshipProposal: 'catalog relationship: unknown。記事targetは作成しない。',
    visualRightsStatus: 'none',
    reservationStatus: 'not-confirmed',
    actions: [
      { type: 'official', label: '公式情報を見る', url: 'https://www.sugakico.co.jp/area/%E5%A4%A7%E9%A0%88%E5%BA%97/', verifiedAt: '2026-08-24' },
      { type: 'map', label: 'Google Mapsで見る', url: 'https://www.google.com/maps/dir/?api=1&destination=%E3%82%B9%E3%82%AC%E3%82%AD%E3%83%A4%20%E5%A4%A7%E9%A0%88%E5%BA%97%2C%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E5%8C%BA%E5%A4%A7%E9%A0%883-45-2', verifiedAt: '2026-08-24' },
      { type: 'phone', label: '電話する', url: 'tel:08069939305', verifiedAt: '2026-08-24' },
    ],
    sourceArtifacts: [
      {
        sourceUrl: 'https://www.sugakico.co.jp/area/%E5%A4%A7%E9%A0%88%E5%BA%97/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/sugakiya-osu/official-store.html`,
        sha256: '48a692040d69092e5c3c9aa08c19aed3a85d9230c5fd6938b04a9b04975ef4f0',
      },
      {
        sourceUrl: 'https://www.sugakico.co.jp/menu/osu/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/sugakiya-osu/official-menu.html`,
        sha256: 'da060e9c1f62307ccc68fba9fb7911eaa76d801918807950ee79dcbd87c1a035',
      },
      {
        sourceUrl: 'https://www.sugakico.co.jp/menu/osu/',
        acquiredAt: ACQUIRED_AT,
        originalPath: `${REVIEW_ROOT}/sources/sugakiya-osu/official-menu.jpg`,
        sha256: 'e3a79492b9a8ec19445a4bfe62712f22937118e07567cacd0710fd99e304f008',
      },
    ],
    requiredOperatorReview: [
      '原本で店名、住所、営業時間、32席、電話、Maps actionとラーメン¥290〜¥680の対象・除外を確認する。',
      'party・mood・reservation・relationship unknown・visual:noneの提案を承認または差し戻す。',
    ],
    requiredIndependentReview: [
      '保存原本SHA256と公式ページ、3 actionの一致を再確認する。',
      '価格範囲がラーメンのみで、トッピング・ごはん／サラダ・セット・甘味・飲料・土産・季節商品を含まないことを確認する。',
    ],
    gateStatus: 'provisional-blocked',
  },
];

export const INITIAL_FORMAL_DECISION_V3_DEFINITIONS: readonly FormalDecisionV3CandidateDefinition[] =
  INITIAL_FORMAL_CANDIDATE_PROPOSALS.map((proposal) => proposal.formalDefinition);

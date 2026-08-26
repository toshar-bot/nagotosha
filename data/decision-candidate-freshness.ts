import type { DecisionEvidenceFreshnessRecord } from '../types/decision-freshness';

/**
 * Freshness metadata only. Evidence values and their verification dates remain
 * authoritative in decision-candidate-evidence.ts and are not duplicated here.
 */
export const DECISION_CANDIDATE_FRESHNESS: readonly DecisionEvidenceFreshnessRecord[] = [
  { evidenceId: 'potama-status', reviewStatus: 'verified' },
  { evidenceId: 'potama-hours', reviewStatus: 'verified' },
  {
    evidenceId: 'potama-price',
    reviewStatus: 'provisional',
    lastFailureReason: '現在価格の一次情報による再確認待ち。',
  },
  {
    evidenceId: 'potama-official-url',
    reviewStatus: 'verified',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: '社内利益相反照合の明示的な人間確認記録がrepository内に存在しない。',
    },
  },
  { evidenceId: 'potama-location', reviewStatus: 'verified' },
  { evidenceId: 'potama-party', reviewStatus: 'verified' },
  { evidenceId: 'potama-budget', reviewStatus: 'verified' },
  { evidenceId: 'potama-mood', reviewStatus: 'verified' },
  {
    evidenceId: 'potama-reservation-need',
    reviewStatus: 'provisional',
    lastFailureReason: '予約不要または直接来店可能という一次確認待ち。',
  },

  { evidenceId: 'sawi-status', reviewStatus: 'verified' },
  {
    evidenceId: 'sawi-hours',
    reviewStatus: 'conflicting',
    conflicts: [
      {
        importance: 'important',
        status: 'unresolved',
        sourceUrl: 'https://www.hotpepper.jp/strJ004633449/',
      },
    ],
  },
  { evidenceId: 'sawi-price', reviewStatus: 'verified' },
  {
    evidenceId: 'sawi-official-url',
    reviewStatus: 'verified',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: '社内利益相反照合の明示的な人間確認記録がrepository内に存在しない。',
    },
  },
  { evidenceId: 'sawi-location', reviewStatus: 'verified' },
  { evidenceId: 'sawi-reservation-channel', reviewStatus: 'verified' },
  { evidenceId: 'sawi-party', reviewStatus: 'verified' },
  { evidenceId: 'sawi-budget', reviewStatus: 'verified' },
  { evidenceId: 'sawi-mood', reviewStatus: 'verified' },
  { evidenceId: 'sawi-reservation-need', reviewStatus: 'verified' },

  { evidenceId: 'laduree-status', reviewStatus: 'verified' },
  { evidenceId: 'laduree-hours', reviewStatus: 'verified' },
  { evidenceId: 'laduree-price', reviewStatus: 'verified' },
  {
    evidenceId: 'laduree-official-url',
    reviewStatus: 'verified',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: '社内利益相反照合の明示的な人間確認記録がrepository内に存在しない。',
    },
  },
  { evidenceId: 'laduree-location', reviewStatus: 'verified' },
  { evidenceId: 'laduree-party', reviewStatus: 'verified' },
  { evidenceId: 'laduree-budget', reviewStatus: 'verified' },
  { evidenceId: 'laduree-mood', reviewStatus: 'verified' },
  { evidenceId: 'laduree-reservation-need', reviewStatus: 'verified' },

  // S2 candidates remain deliberately provisional until operator and
  // independent reviews are recorded from the stored originals.
  {
    evidenceId: 's2-yabaton-status',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業状態の再確認待ち。',
  },
  {
    evidenceId: 's2-yabaton-hours',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業時間の再確認待ち。',
  },
  {
    evidenceId: 's2-yabaton-price',
    reviewStatus: 'provisional',
    lastFailureReason: '店内通常メニューと区別したテイクアウト価格の人間確認待ち。',
  },
  {
    evidenceId: 's2-yabaton-location',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's2-yabaton-official-url',
    reviewStatus: 'provisional',
    lastFailureReason: '利益相反照合とrelationship確定待ち。',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: 'catalog targetのrelationshipはunknown。人間の内部照合が完了するまで表示不可。',
    },
  },
  {
    evidenceId: 's2-yabaton-phone',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },

  {
    evidenceId: 's2-potama-status',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業状態の再確認待ち。',
  },
  {
    evidenceId: 's2-potama-hours',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業時間の再確認待ち。',
  },
  {
    evidenceId: 's2-potama-price',
    reviewStatus: 'provisional',
    lastFailureReason: '現行商品価格と配達価格の区別について人間確認待ち。',
  },
  {
    evidenceId: 's2-potama-location',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's2-potama-official-url',
    reviewStatus: 'provisional',
    lastFailureReason: '利益相反照合と記事178とのrelationship確認待ち。',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: 'article 178のeditorial relationshipはregistry上にあるが、候補接続の人間確認は未完了。',
    },
  },
  {
    evidenceId: 's2-potama-phone',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },

  {
    evidenceId: 's2-konparu-status',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業状態の再確認待ち。',
  },
  {
    evidenceId: 's2-konparu-hours',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業時間の再確認待ち。',
  },
  {
    evidenceId: 's2-konparu-price',
    reviewStatus: 'provisional',
    lastFailureReason: '店舗別メニュー差異を含む価格表示の人間確認待ち。',
  },
  {
    evidenceId: 's2-konparu-location',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's2-konparu-official-url',
    reviewStatus: 'provisional',
    lastFailureReason: '利益相反照合とrelationship確定待ち。',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: 'catalog targetのrelationshipはunknown。人間の内部照合が完了するまで表示不可。',
    },
  },
  {
    evidenceId: 's2-konparu-phone',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },

  // S2.3 replacement proposals. Official facts are source-checked, but the
  // two human reviews and relationship determination intentionally remain
  // provisional; this keeps the production adapter fail-closed.
  {
    evidenceId: 's23-erick-south-status',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業状態の再確認待ち。',
  },
  {
    evidenceId: 's23-erick-south-hours',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業時間の再確認待ち。',
  },
  {
    evidenceId: 's23-erick-south-price',
    reviewStatus: 'provisional',
    lastFailureReason: '店内ランチ主食の価格対象・除外について人間確認待ち。',
  },
  {
    evidenceId: 's23-erick-south-location',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's23-erick-south-official-url',
    reviewStatus: 'provisional',
    lastFailureReason: '利益相反照合とrelationship確定待ち。',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: 'catalog targetのrelationshipはunknown。人間の内部照合が完了するまで表示不可。',
    },
  },
  {
    evidenceId: 's23-erick-south-phone',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's23-erick-south-seats',
    reviewStatus: 'provisional',
    lastFailureReason: '公式に席数の掲載がないため、空欄扱いの人間確認待ち。',
  },

  {
    evidenceId: 's23-potama-status',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業状態の再確認待ち。',
  },
  {
    evidenceId: 's23-potama-hours',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業時間の再確認待ち。',
  },
  {
    evidenceId: 's23-potama-price',
    reviewStatus: 'provisional',
    lastFailureReason: '全店共通とHAERA店限定の単品主食価格対象・除外について人間確認待ち。',
  },
  {
    evidenceId: 's23-potama-location',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's23-potama-official-url',
    reviewStatus: 'provisional',
    lastFailureReason: '利益相反照合とrelationship確定待ち。',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: 'catalog targetのrelationshipはunknown。人間の内部照合が完了するまで表示不可。',
    },
  },
  {
    evidenceId: 's23-potama-phone',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's23-potama-seats',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },

  {
    evidenceId: 's23-sugakiya-status',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業状態の再確認待ち。',
  },
  {
    evidenceId: 's23-sugakiya-hours',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認と営業時間の再確認待ち。',
  },
  {
    evidenceId: 's23-sugakiya-price',
    reviewStatus: 'provisional',
    lastFailureReason: '大須店ラーメンの価格対象・除外について人間確認待ち。',
  },
  {
    evidenceId: 's23-sugakiya-location',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's23-sugakiya-official-url',
    reviewStatus: 'provisional',
    lastFailureReason: '利益相反照合とrelationship確定待ち。',
    relationshipReview: {
      reviewStatus: 'provisional',
      note: 'catalog targetのrelationshipはunknown。人間の内部照合が完了するまで表示不可。',
    },
  },
  {
    evidenceId: 's23-sugakiya-phone',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
  {
    evidenceId: 's23-sugakiya-seats',
    reviewStatus: 'provisional',
    lastFailureReason: '人間による原本確認待ち。',
  },
];

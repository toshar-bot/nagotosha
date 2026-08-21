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
];

import type { DecisionEvidenceFreshnessRecord } from '../types/decision-freshness';

/**
 * Freshness metadata only. Evidence values and their verification dates remain
 * authoritative in decision-candidate-evidence.ts and are not duplicated here.
 */
export const DECISION_CANDIDATE_FRESHNESS: readonly DecisionEvidenceFreshnessRecord[] = [
  { evidenceId: 'potama-status', reviewStatus: 'verified' },
  { evidenceId: 'potama-hours', reviewStatus: 'verified' },
  { evidenceId: 'potama-price', reviewStatus: 'verified' },
  { evidenceId: 'potama-official-url', reviewStatus: 'verified' },
  { evidenceId: 'potama-location', reviewStatus: 'verified' },
  { evidenceId: 'potama-party', reviewStatus: 'verified' },
  { evidenceId: 'potama-budget', reviewStatus: 'verified' },
  { evidenceId: 'potama-mood', reviewStatus: 'verified' },
  { evidenceId: 'potama-reservation-need', reviewStatus: 'verified' },

  { evidenceId: 'sawi-status', reviewStatus: 'verified' },
  {
    evidenceId: 'sawi-hours',
    reviewStatus: 'verified',
    conflicts: [
      {
        importance: 'important',
        status: 'resolved',
        sourceUrl: 'https://www.hotpepper.jp/strJ004633449/',
        resolutionReason: '公式店舗一覧の11:00〜22:00を優先し、予約ページの23:00表記で上書きしない。',
      },
    ],
  },
  { evidenceId: 'sawi-price', reviewStatus: 'verified' },
  { evidenceId: 'sawi-official-url', reviewStatus: 'verified' },
  { evidenceId: 'sawi-location', reviewStatus: 'verified' },
  { evidenceId: 'sawi-reservation-channel', reviewStatus: 'verified' },
  { evidenceId: 'sawi-party', reviewStatus: 'verified' },
  { evidenceId: 'sawi-budget', reviewStatus: 'verified' },
  { evidenceId: 'sawi-mood', reviewStatus: 'verified' },
  { evidenceId: 'sawi-reservation-need', reviewStatus: 'verified' },

  { evidenceId: 'laduree-status', reviewStatus: 'verified' },
  { evidenceId: 'laduree-hours', reviewStatus: 'verified' },
  { evidenceId: 'laduree-price', reviewStatus: 'verified' },
  { evidenceId: 'laduree-official-url', reviewStatus: 'verified' },
  { evidenceId: 'laduree-location', reviewStatus: 'verified' },
  { evidenceId: 'laduree-party', reviewStatus: 'verified' },
  { evidenceId: 'laduree-budget', reviewStatus: 'verified' },
  { evidenceId: 'laduree-mood', reviewStatus: 'verified' },
  { evidenceId: 'laduree-reservation-need', reviewStatus: 'verified' },
];

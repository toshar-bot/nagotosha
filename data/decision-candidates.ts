import type {
  DecisionCandidate,
  DecisionMode,
  PreviewAssetAvailability,
} from '@/types/decision-candidate';

export const MINIMUM_CANDIDATES_PER_MODE = 3;

// Phase 1Aでは、必須属性と権利確認を満たす候補が0件のため空を正とする。
// 見た目確認のためのダミー候補は追加しない。
export const DECISION_CANDIDATES: readonly DecisionCandidate[] = [];

export const PREVIEW_ASSET_AVAILABILITY: PreviewAssetAvailability = {
  mascotAssetAvailable: true,
};

export const DECISION_MODES: readonly DecisionMode[] = ['food', 'event', 'outing'];

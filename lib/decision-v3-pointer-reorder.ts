export const DECISION_V3_POINTER_REORDER_THRESHOLD = 18;

export type DecisionV3PointerIntent = 'pending' | 'horizontal' | 'vertical';

export function getDecisionV3PointerIntent(
  deltaX: number,
  deltaY: number,
): DecisionV3PointerIntent {
  const distanceX = Math.abs(deltaX);
  const distanceY = Math.abs(deltaY);
  if (
    Math.max(distanceX, distanceY)
    < DECISION_V3_POINTER_REORDER_THRESHOLD
  ) {
    return 'pending';
  }
  return distanceX > distanceY ? 'horizontal' : 'vertical';
}

export function reorderDecisionV3Ids(
  ids: string[],
  sourceId: string,
  targetId: string,
) {
  const from = ids.indexOf(sourceId);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return ids;

  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

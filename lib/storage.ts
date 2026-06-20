const KEY = 'nagotosha:v2';

export interface CollectionState {
  version: 2;
  ownedCardIds: string[];
  cardCounts: Record<string, number>;
  lastDrawDate: string | null;
  lastDrawnCardId: string | null;
  lastDrawnCardIds: string[];
  streak: number;
  bestStreak: number;
  tutorialDone: boolean;
  totalDraws: number;
}

const INITIAL: CollectionState = {
  version: 2,
  ownedCardIds: [],
  cardCounts: {},
  lastDrawDate: null,
  lastDrawnCardId: null,
  lastDrawnCardIds: [],
  streak: 0,
  bestStreak: 0,
  tutorialDone: false,
  totalDraws: 0,
};

export function loadCollection(): CollectionState {
  if (typeof window === 'undefined') return INITIAL;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...INITIAL };
    const parsed = { ...INITIAL, ...JSON.parse(raw) };
    const fallbackIds = parsed.lastDrawnCardId ? [parsed.lastDrawnCardId] : [];
    return {
      ...parsed,
      cardCounts: parsed.cardCounts ?? {},
      lastDrawnCardIds: parsed.lastDrawnCardIds?.length ? parsed.lastDrawnCardIds : fallbackIds,
    };
  } catch {
    return { ...INITIAL };
  }
}

export function saveCollection(state: CollectionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayStr(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

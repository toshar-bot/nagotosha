const KEY = 'nagotosha:v2';

export interface CollectionState {
  version: 2;
  ownedCardIds: string[];
  lastDrawDate: string | null;
  lastDrawnCardId: string | null;
  streak: number;
  bestStreak: number;
  tutorialDone: boolean;
  totalDraws: number;
}

const INITIAL: CollectionState = {
  version: 2,
  ownedCardIds: [],
  lastDrawDate: null,
  lastDrawnCardId: null,
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
    return { ...INITIAL, ...JSON.parse(raw) };
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
import { DECISION_HOME_CATEGORY_IDS } from '@/data/decision-home-categories';
import type { CategoryId, ConditionSummary, HomeSessionRecord } from '@/types/decision-home';

export const DECISION_HOME_SESSION_KEY = 'nagotosha:decision:home:v1';
export const DECISION_HOME_SESSION_VERSION = 1;
export const DECISION_HOME_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && DECISION_HOME_CATEGORY_IDS.includes(value as CategoryId);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isConditionSummary(value: unknown): value is ConditionSummary {
  if (!value || typeof value !== 'object') return false;
  const summary = value as Partial<ConditionSummary>;
  return (
    isNonEmptyString(summary.party) &&
    isNonEmptyString(summary.budget) &&
    isNonEmptyString(summary.mood) &&
    isNonEmptyString(summary.area) &&
    isNonEmptyString(summary.updatedAt) &&
    !Number.isNaN(Date.parse(summary.updatedAt))
  );
}

function isHomeSessionRecord(value: unknown): value is HomeSessionRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<HomeSessionRecord>;
  return (
    record.version === DECISION_HOME_SESSION_VERSION &&
    isNonEmptyString(record.expiresAt) &&
    !Number.isNaN(Date.parse(record.expiresAt)) &&
    isCategoryId(record.selectedCategoryId) &&
    isConditionSummary(record.conditionSummary)
  );
}

export function readDecisionHomeSession(
  storage: SessionStorageLike | undefined,
  now = Date.now(),
): HomeSessionRecord | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DECISION_HOME_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isHomeSessionRecord(parsed) || Date.parse(parsed.expiresAt) <= now) {
      storage.removeItem(DECISION_HOME_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeDecisionHomeSession(
  storage: SessionStorageLike | undefined,
  selectedCategoryId: CategoryId,
  conditionSummary: ConditionSummary,
  now = Date.now(),
): boolean {
  if (!storage) return false;
  const record: HomeSessionRecord = {
    version: DECISION_HOME_SESSION_VERSION,
    expiresAt: new Date(now + DECISION_HOME_SESSION_TTL_MS).toISOString(),
    selectedCategoryId,
    conditionSummary,
  };
  try {
    storage.setItem(DECISION_HOME_SESSION_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearDecisionHomeSession(storage: SessionStorageLike | undefined): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(DECISION_HOME_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

import { DECISION_HOME_CATEGORY_IDS } from '@/data/decision-home-categories';
import type { CategoryId, ConditionSummary, HomeSessionRecord } from '@/types/decision-home';

export const DECISION_HOME_SESSION_KEY = 'nagotosha:decision:home:v1';
export const DECISION_HOME_SESSION_VERSION = 1;
export const DECISION_HOME_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const DECISION_HOME_FOCUS_SESSION_KEY = 'nagotosha:decision:home:focus:v1';
export const DECISION_HOME_FOCUS_SESSION_VERSION = 1;

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type DecisionHomeFocusSessionV1 = {
  readonly version: 1;
  readonly expiresAt: string;
  readonly focusedCategoryId: CategoryId;
};

const HOME_SESSION_ROOT_KEYS = [
  'version',
  'expiresAt',
  'selectedCategoryId',
  'conditionSummary',
] as const;
const HOME_FOCUS_SESSION_ROOT_KEYS = ['version', 'expiresAt', 'focusedCategoryId'] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === expectedKeys.length &&
    actualKeys.every((key) => expectedKeys.includes(key))
  );
}

function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && DECISION_HOME_CATEGORY_IDS.includes(value as CategoryId);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isConditionSummary(value: unknown): value is ConditionSummary {
  if (!isPlainObject(value)) return false;
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
  if (!isPlainObject(value) || !hasExactKeys(value, HOME_SESSION_ROOT_KEYS)) return false;
  const record = value as Partial<HomeSessionRecord>;
  return (
    record.version === DECISION_HOME_SESSION_VERSION &&
    isNonEmptyString(record.expiresAt) &&
    !Number.isNaN(Date.parse(record.expiresAt)) &&
    isCategoryId(record.selectedCategoryId) &&
    isConditionSummary(record.conditionSummary)
  );
}

function isHomeFocusSessionRecord(value: unknown): value is DecisionHomeFocusSessionV1 {
  if (!isPlainObject(value) || !hasExactKeys(value, HOME_FOCUS_SESSION_ROOT_KEYS)) return false;
  const record = value as Partial<DecisionHomeFocusSessionV1>;
  return (
    record.version === DECISION_HOME_FOCUS_SESSION_VERSION &&
    isNonEmptyString(record.expiresAt) &&
    !Number.isNaN(Date.parse(record.expiresAt)) &&
    isCategoryId(record.focusedCategoryId)
  );
}

function removeInvalidSession(storage: SessionStorageLike, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // A blocked storage implementation is equivalent to unavailable persistence.
  }
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
      removeInvalidSession(storage, DECISION_HOME_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    removeInvalidSession(storage, DECISION_HOME_SESSION_KEY);
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

export function readDecisionHomeFocusSession(
  storage: SessionStorageLike | undefined,
  now = Date.now(),
): DecisionHomeFocusSessionV1 | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DECISION_HOME_FOCUS_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isHomeFocusSessionRecord(parsed) || Date.parse(parsed.expiresAt) <= now) {
      removeInvalidSession(storage, DECISION_HOME_FOCUS_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    removeInvalidSession(storage, DECISION_HOME_FOCUS_SESSION_KEY);
    return null;
  }
}

export function writeDecisionHomeFocusSession(
  storage: SessionStorageLike | undefined,
  focusedCategoryId: CategoryId,
  now = Date.now(),
): boolean {
  if (!storage) return false;
  const record: DecisionHomeFocusSessionV1 = {
    version: DECISION_HOME_FOCUS_SESSION_VERSION,
    expiresAt: new Date(now + DECISION_HOME_SESSION_TTL_MS).toISOString(),
    focusedCategoryId,
  };
  try {
    storage.setItem(DECISION_HOME_FOCUS_SESSION_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearDecisionHomeFocusSession(
  storage: SessionStorageLike | undefined,
): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(DECISION_HOME_FOCUS_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

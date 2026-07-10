import type { SavedItem } from '@/types/portal';

const SAVED_ITEMS_STORAGE_KEY = 'nagotosha:saved-items';
export const SAVED_ITEMS_UPDATED_EVENT = 'nagotosha:saved-items-updated';

type UnsavedItem = Omit<SavedItem, 'savedAt'>;
type SavedItemIdentity = Pick<SavedItem, 'id' | 'type'>;

export function getSavedItems(): SavedItem[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(SAVED_ITEMS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSavedItem);
  } catch {
    return [];
  }
}

export function saveItem(item: UnsavedItem): SavedItem[] {
  const currentItems = getSavedItems();
  const savedItem: SavedItem = {
    ...normalizeUnsavedItem(item),
    savedAt: new Date().toISOString(),
  };

  const nextItems = [
    savedItem,
    ...currentItems.filter(currentItem => !isSameSavedItem(currentItem, savedItem)),
  ];

  return writeSavedItems(nextItems) ? nextItems : currentItems;
}

export function removeSavedItem(target: SavedItemIdentity): SavedItem[] {
  const nextItems = getSavedItems().filter(item => !isSameSavedItem(item, target));
  return writeSavedItems(nextItems) ? nextItems : getSavedItems();
}

export function isSaved(target: SavedItemIdentity | string): boolean {
  return getSavedItems().some(item => {
    if (typeof target === 'string') return String(item.id) === String(target);
    return isSameSavedItem(item, target);
  });
}

export function toggleSavedItem(item: UnsavedItem): { saved: boolean; items: SavedItem[] } {
  const target = normalizeUnsavedItem(item);

  if (isSaved(target)) {
    return {
      saved: false,
      items: removeSavedItem(target),
    };
  }

  return {
    saved: true,
    items: saveItem(item),
  };
}

export function clearSavedItems(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(SAVED_ITEMS_STORAGE_KEY);
    dispatchSavedItemsUpdated();
  } catch {
    // Ignore storage write failures so UI actions do not crash the app.
  }
}

function writeSavedItems(items: SavedItem[]): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    const payload = JSON.stringify(items);
    storage.setItem(SAVED_ITEMS_STORAGE_KEY, payload);
    const didWrite = storage.getItem(SAVED_ITEMS_STORAGE_KEY) === payload;
    if (didWrite) dispatchSavedItemsUpdated();
    return didWrite;
  } catch {
    // Ignore quota and permission failures. Callers still receive the computed list.
    return false;
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeUnsavedItem(item: UnsavedItem): UnsavedItem {
  return {
    id: String(item.id),
    type: item.type,
    title: item.title,
    area: item.area,
    category: item.category,
    articleUrl: item.articleUrl,
    mapUrl: item.mapUrl,
    imageUrl: item.imageUrl,
  };
}

function isSameSavedItem(item: SavedItemIdentity, target: SavedItemIdentity): boolean {
  return item.type === target.type && String(item.id) === String(target.id);
}

function dispatchSavedItemsUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SAVED_ITEMS_UPDATED_EVENT));
}

function isSavedItem(value: unknown): value is SavedItem {
  if (!value || typeof value !== 'object') return false;

  const item = value as Partial<SavedItem>;
  return (
    typeof item.id === 'string' &&
    isSavedItemType(item.type) &&
    typeof item.title === 'string' &&
    typeof item.savedAt === 'string'
  );
}

function isSavedItemType(value: unknown): value is SavedItem['type'] {
  return value === 'article' || value === 'store' || value === 'event' || value === 'area';
}

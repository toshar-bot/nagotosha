import type { SavedItem } from '@/types/portal';

const SAVED_ITEMS_STORAGE_KEY = 'nagotosha:saved-items';

type UnsavedItem = Omit<SavedItem, 'savedAt'>;

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
    ...item,
    savedAt: new Date().toISOString(),
  };

  const nextItems = [
    savedItem,
    ...currentItems.filter(currentItem => currentItem.id !== item.id),
  ];

  writeSavedItems(nextItems);
  return nextItems;
}

export function removeSavedItem(id: string): SavedItem[] {
  const nextItems = getSavedItems().filter(item => item.id !== id);
  writeSavedItems(nextItems);
  return nextItems;
}

export function isSaved(id: string): boolean {
  return getSavedItems().some(item => item.id === id);
}

export function toggleSavedItem(item: UnsavedItem): { saved: boolean; items: SavedItem[] } {
  if (isSaved(item.id)) {
    return {
      saved: false,
      items: removeSavedItem(item.id),
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
  } catch {
    // Ignore storage write failures so UI actions do not crash the app.
  }
}

function writeSavedItems(items: SavedItem[]) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota and permission failures. Callers still receive the computed list.
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
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

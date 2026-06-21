const KEY = 'nagotosha:book:v1';

export interface PlacedStickerData {
  uid: string;       // この配置のユニークID
  stickerId: string; // card.id
  x: number;        // ページ幅に対する% (0-100)
  y: number;        // ページ高さに対する% (0-100)
  rotation: number; // degrees
  zIndex: number;
}

export function loadPlaced(): PlacedStickerData[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch { return []; }
}

function savePlaced(items: PlacedStickerData[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addPlaced(
  stickerId: string,
  x: number,
  y: number,
  rotation: number,
): PlacedStickerData[] {
  const items = loadPlaced();
  const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const maxZ = items.reduce((m, i) => Math.max(m, i.zIndex), 0);
  const newItem: PlacedStickerData = { uid, stickerId, x, y, rotation, zIndex: maxZ + 1 };
  const updated = [...items, newItem];
  savePlaced(updated);
  return updated;
}

export function removePlaced(uid: string): PlacedStickerData[] {
  const updated = loadPlaced().filter(i => i.uid !== uid);
  savePlaced(updated);
  return updated;
}

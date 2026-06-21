// v2: center-based coordinates, pageId per sticker
const KEY = 'nagotosha:book:v2';

export interface PlacedStickerData {
  uid: string;
  stickerId: string;
  pageId: 'left' | 'right';
  cx: number;   // center x as % of page width (0-100)
  cy: number;   // center y as % of page height (0-100)
  rotation: number;
  zIndex: number;
}

export function loadPlaced(): PlacedStickerData[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

function savePlaced(items: PlacedStickerData[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addPlaced(
  stickerId: string,
  pageId: 'left' | 'right',
  cx: number,
  cy: number,
  rotation: number,
): PlacedStickerData[] {
  const items = loadPlaced();
  const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const maxZ = items.reduce((m, i) => Math.max(m, i.zIndex), 0);
  const updated = [...items, { uid, stickerId, pageId, cx, cy, rotation, zIndex: maxZ + 1 }];
  savePlaced(updated);
  return updated;
}

export function movePlaced(uid: string, cx: number, cy: number): PlacedStickerData[] {
  const updated = loadPlaced().map(i => i.uid === uid ? { ...i, cx, cy } : i);
  savePlaced(updated);
  return updated;
}

export function removePlaced(uid: string): PlacedStickerData[] {
  const updated = loadPlaced().filter(i => i.uid !== uid);
  savePlaced(updated);
  return updated;
}

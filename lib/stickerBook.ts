// v3: adds scale, pageIndex (テーマごとのページ)
const KEY = 'nagotosha:book:v3';

export interface PlacedStickerData {
  uid: string;
  stickerId: string;
  pageIndex: number;      // 0-5 corresponds to THEME_ORDER index
  pageId: 'left' | 'right';
  cx: number;             // center x as % of page width
  cy: number;             // center y as % of page height
  rotation: number;       // degrees
  scale: number;          // 1.0 = original size
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
  pageIndex: number,
  pageId: 'left' | 'right',
  cx: number,
  cy: number,
  rotation: number,
): PlacedStickerData[] {
  const items = loadPlaced();
  const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const maxZ = items.filter(i => i.pageIndex === pageIndex).reduce((m, i) => Math.max(m, i.zIndex), 0);
  const updated = [...items, { uid, stickerId, pageIndex, pageId, cx, cy, rotation, scale: 1, zIndex: maxZ + 1 }];
  savePlaced(updated);
  return updated;
}

export function movePlaced(
  uid: string,
  cx: number,
  cy: number,
  rotation: number,
  scale: number,
): PlacedStickerData[] {
  const updated = loadPlaced().map(i =>
    i.uid === uid ? { ...i, cx, cy, rotation, scale } : i,
  );
  savePlaced(updated);
  return updated;
}

export function removePlaced(uid: string): PlacedStickerData[] {
  const updated = loadPlaced().filter(i => i.uid !== uid);
  savePlaced(updated);
  return updated;
}

import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface MySticker {
  id: string;
  name: string;
  createdAt: string;
  cutoutBlob: Blob;   // 背景除去済み透過PNG
  stickerBlob: Blob;  // 白フチ+影合成済み（表示用）
  width: number;
  height: number;
}

interface MyStickerDB extends DBSchema {
  stickers: {
    key: string;
    value: MySticker;
    indexes: { createdAt: string };
  };
}

const DB_NAME = 'nagotosha-my';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MyStickerDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MyStickerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('stickers', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function saveMySticker(sticker: MySticker): Promise<void> {
  const db = await getDB();
  await db.put('stickers', sticker);
}

export async function loadAllMyStickers(): Promise<MySticker[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('stickers', 'createdAt');
  return all.reverse();
}

export async function deleteMySticker(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('stickers', id);
}

export function generateId(): string {
  return `my_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

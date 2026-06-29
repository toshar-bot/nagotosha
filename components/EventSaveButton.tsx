'use client';

import { useEffect, useState } from 'react';
import { isSaved, toggleSavedItem } from '@/lib/saved';
import type { SavedItem } from '@/types/portal';

type Props = Omit<SavedItem, 'savedAt'>;

export function EventSaveButton(props: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSaved(props.id));
  }, [props.id]);

  const toggle = () => {
    const result = toggleSavedItem(props);
    setSaved(result.saved);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black active:scale-95 transition-transform"
      style={{
        minWidth: 104,
        color: saved ? '#E8483F' : '#667085',
        background: saved ? 'rgba(232,72,63,0.10)' : 'rgba(7,26,77,0.05)',
        border: saved ? '1px solid rgba(232,72,63,0.28)' : '1px solid #E6ECF5',
      }}
    >
      <BookmarkIcon filled={saved} />
      {saved ? '保存済み' : '保存'}
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

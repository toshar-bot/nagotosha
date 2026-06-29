'use client';

import { useEffect, useState } from 'react';
import { isSaved, toggleSavedItem } from '@/lib/saved';
import type { SavedItem } from '@/types/portal';

type Props = Omit<SavedItem, 'savedAt'>;

export function ArticleSaveButton(props: Props) {
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
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13px] font-black transition-transform active:scale-[0.98]"
      style={{
        background: saved ? 'rgba(232,72,63,0.10)' : 'rgba(7,26,77,0.06)',
        border: saved ? '1px solid rgba(232,72,63,0.28)' : '1px solid #E6ECF5',
        color: saved ? '#E8483F' : '#071A4D',
        minWidth: 120,
        justifyContent: 'center',
      }}
      aria-pressed={saved}
    >
      <BookmarkIcon filled={saved} />
      {saved ? '保存済み' : '保存する'}
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

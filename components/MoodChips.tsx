import Link from 'next/link';
import type { Mood } from '@/data/moods';

export function MoodChips({ moods }: { moods: Mood[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <Link
          key={mood.slug}
          href={`/mood/${mood.slug}`}
          className="rounded-full px-3.5 py-2 text-[12px] font-black no-underline"
          style={{
            color: mood.accent ? '#E8483F' : '#071A4D',
            background: mood.accent ? 'rgba(232,72,63,.08)' : 'rgba(7,26,77,.06)',
            border: mood.accent ? '1px solid rgba(232,72,63,.18)' : '1px solid rgba(7,26,77,.10)',
          }}
        >
          {mood.label}
        </Link>
      ))}
    </div>
  );
}

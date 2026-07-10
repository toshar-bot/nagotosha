import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Mood } from '@/data/moods';
import { MOODS } from '@/data/moods';

const THEME = {
  navy: '#071A4D',
  red: '#E8483F',
  text: '#0F172A',
  gray: '#667085',
  border: '#E6ECF5',
};

export function MoodPicksSection() {
  return (
    <section style={{ padding: '18px 16px 18px' }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ margin: 0, color: THEME.red, fontSize: 11, fontWeight: 950, letterSpacing: '.18em' }}>
          MOOD PICKS
        </p>
        <h2 style={{ margin: '3px 0 0', color: THEME.navy, fontSize: 21, fontWeight: 950, lineHeight: 1.2 }}>
          気分から探す
        </h2>
        <p style={{ margin: '7px 0 0', color: THEME.gray, fontSize: 12.5, fontWeight: 800, lineHeight: 1.55 }}>
          行き先が決まっていない日は、気分でえらぶのが早い。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {MOODS.map((mood) => (
          <MoodCard key={mood.slug} mood={mood} />
        ))}
      </div>

      <Link
        href="/area"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 13,
          color: THEME.navy,
          fontSize: 12,
          fontWeight: 950,
          textDecoration: 'none',
        }}
      >
        エリアで探したい方は <span style={{ color: THEME.red }}>エリア一覧へ →</span>
      </Link>
    </section>
  );
}

function MoodCard({ mood }: { mood: Mood }) {
  const Icon = getMoodIcon(mood.slug);
  return (
    <Link
      href={`/mood/${mood.slug}`}
      style={{
        minHeight: 112,
        borderRadius: 14,
        border: `1px solid ${mood.accent ? 'rgba(232,72,63,.22)' : THEME.border}`,
        background: mood.accent ? '#FFF3F1' : '#FFFFFF',
        color: THEME.text,
        boxShadow: mood.accent ? '0 8px 18px rgba(232,72,63,.10)' : '0 7px 16px rgba(7,26,77,.06)',
        textDecoration: 'none',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 30,
          height: 30,
          borderRadius: 11,
          color: mood.accent ? THEME.red : THEME.navy,
          background: mood.accent ? 'rgba(232,72,63,.10)' : 'rgba(7,26,77,.06)',
        }}
      >
        <Icon />
      </span>
      <span>
        <span style={{ display: 'block', color: THEME.navy, fontSize: 13.5, fontWeight: 950, lineHeight: 1.28 }}>
          {mood.label}
        </span>
        <span style={{ display: 'block', marginTop: 4, color: THEME.gray, fontSize: 11, fontWeight: 800, lineHeight: 1.35 }}>
          {mood.hint}
        </span>
      </span>
    </Link>
  );
}

function getMoodIcon(slug: Mood['slug']) {
  switch (slug) {
    case 'hearty':
      return BowlIcon;
    case 'solo':
      return CupIcon;
    case 'date':
      return SparkIcon;
    case 'family':
      return SmileIcon;
    case 'rainy':
      return UmbrellaIcon;
    case 'new':
      return ShopLineIcon;
  }
}

function SvgBase({ children }: { children: ReactNode }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function BowlIcon() {
  return <SvgBase><path d="M4 11h16" /><path d="M6 11c.4 4.2 2.7 7 6 7s5.6-2.8 6-7" /><path d="M8 7c1-1 2-1 3 0" /><path d="M13 7c1-1 2-1 3 0" /></SvgBase>;
}

function CupIcon() {
  return <SvgBase><path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8z" /><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" /><path d="M8 4v2" /><path d="M12 4v2" /></SvgBase>;
}

function SparkIcon() {
  return <SvgBase><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /><path d="M5 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" /></SvgBase>;
}

function SmileIcon() {
  return <SvgBase><circle cx="12" cy="12" r="8" /><path d="M8.5 10h.01" /><path d="M15.5 10h.01" /><path d="M8.8 14.2c1.8 1.8 4.6 1.8 6.4 0" /></SvgBase>;
}

function UmbrellaIcon() {
  return <SvgBase><path d="M4 12a8 8 0 0 1 16 0H4z" /><path d="M12 12v5a2 2 0 0 0 4 0" /><path d="M12 4v2" /></SvgBase>;
}

function ShopLineIcon() {
  return <SvgBase><path d="M4 10h16l-1.5-5h-13L4 10z" /><path d="M6 10v9h12v-9" /><path d="M9 19v-5h6v5" /></SvgBase>;
}

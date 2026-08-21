import type { RefineChoice } from '@/types/decision-v3';

type Props = {
  name: RefineChoice;
};

export function FeatureIcon({ name }: Props) {
  const common = {
    width: 19,
    height: 19,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  const paths: Record<RefineChoice, React.ReactNode> = {
    reservable: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16M8 15l2 2 5-5" />
      </>
    ),
    wifi: (
      <>
        <path d="M4 9a12 12 0 0 1 16 0M7 12.5a7.5 7.5 0 0 1 10 0M10 16a3 3 0 0 1 4 0" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    power: (
      <>
        <path d="M9 3v6M15 3v6M7 9h10v2a5 5 0 0 1-5 5v5M9 21h6" />
      </>
    ),
    'private-room': (
      <>
        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M8 21V8h8v13" />
        <circle cx="14" cy="14" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    'rain-safe': (
      <>
        <path d="M3 13a9 9 0 0 1 18 0H3ZM12 13v6a2 2 0 0 0 4 0" />
        <path d="M7 16v1M4 17v1" />
      </>
    ),
    'long-stay': (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2M8 3l-2 2M16 3l2 2" />
      </>
    ),
    'smoke-free': (
      <>
        <path d="M4 15h13M17 12v3M20 12v3M6 12c1.5-1 1.5-2.5 0-3.5S4.5 6 6 5" />
        <path d="M3 3l18 18" />
      </>
    ),
    'smoking-ok': (
      <>
        <path d="M3 15h14M17 12v3M20 12v3M6 12c1.5-1 1.5-2.5 0-3.5S4.5 6 6 5" />
      </>
    ),
    'smoking-any': (
      <>
        <path d="M3 15h14M17 12v3M20 12v3M6 12c1.5-1 1.5-2.5 0-3.5S4.5 6 6 5" />
      </>
    ),
    tatami: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M12 5v14M3 12h18M7 8h1M16 15h1" />
      </>
    ),
    counter: (
      <>
        <path d="M4 8h16M6 8v12M18 8v12M8 12h8" />
        <circle cx="12" cy="4" r="2" />
      </>
    ),
    'kids-ok': (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M4 20c0-4 2-7 5-7s5 3 5 7M16 10h4v8h-5M18 8v2" />
      </>
    ),
    parking: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </>
    ),
    terrace: (
      <>
        <path d="M3 10h18L18 4H6L3 10ZM6 10v10M18 10v10M9 15h6M12 15v5" />
      </>
    ),
    'late-night': (
      <>
        <path d="M18 15a7 7 0 0 1-9-9 8 8 0 1 0 9 9Z" />
        <path d="M17 4v3M15.5 5.5h3" />
      </>
    ),
    quiet: (
      <>
        <path d="M5 9v6h4l5 4V5L9 9H5Z" />
        <path d="M18 9l3 6M21 9l-3 6" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

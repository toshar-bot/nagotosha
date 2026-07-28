import type { DecisionV3Step } from '@/types/decision-v3';
import styles from './decision-v3.module.css';

type Props = {
  step: DecisionV3Step;
  activeHomeSection: 'home' | 'conditions';
  conditionsReady: boolean;
  compareReady: boolean;
  decidedReady: boolean;
  previewWidth?: number | null;
  onNavigate: (step: DecisionV3Step) => void;
  onNavigateHomeSection: (section: 'home' | 'conditions') => void;
};

const navItems: Array<{
  step: DecisionV3Step;
  label: string;
  icon: 'home' | 'conditions' | 'candidates' | 'compare' | 'decided';
}> = [
  { step: 'home', label: 'ホーム', icon: 'home' },
  { step: 'home', label: '条件', icon: 'conditions' },
  { step: 'candidates', label: '候補', icon: 'candidates' },
  { step: 'compare', label: '比較', icon: 'compare' },
  { step: 'decided', label: '決定', icon: 'decided' },
];

function NavIcon({ name }: { name: (typeof navItems)[number]['icon'] }) {
  const paths = {
    home: <path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3v-9.5Z" />,
    conditions: (
      <>
        <path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h8M16 18h4" />
        <circle cx="16" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="14" cy="18" r="2" />
      </>
    ),
    candidates: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    compare: (
      <>
        <path d="M7 4v16M17 4v16M3 8h8M13 16h8" />
        <path d="m8 5-1-1-1 1M16 19l1 1 1-1" />
      </>
    ),
    decided: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.6 2.6L16.5 9" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.navIcon}>
      {paths[name]}
    </svg>
  );
}

export function BottomNavV3({
  step,
  activeHomeSection,
  conditionsReady,
  compareReady,
  decidedReady,
  previewWidth,
  onNavigate,
  onNavigateHomeSection,
}: Props) {
  return (
    <nav
      className={styles.bottomNav}
      aria-label="意思決定フロー"
      style={previewWidth ? { width: previewWidth } : undefined}
    >
      {navItems.map((item, index) => {
        const disabled =
          item.step === 'candidates'
            ? !conditionsReady
            : item.step === 'compare'
              ? !compareReady
              : item.step === 'decided'
                ? !decidedReady
                : false;
        const active =
          item.icon === 'conditions'
            ? step === 'home' && activeHomeSection === 'conditions'
            : item.icon === 'home'
              ? step === 'home' && activeHomeSection === 'home'
              : step === item.step || (item.step === 'candidates' && step === 'detail');
        return (
          <button
            key={`${item.label}-${index}`}
            type="button"
            className={`${styles.navButton} ${active ? styles.navButtonActive : ''}`}
            aria-current={active ? 'page' : undefined}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => {
              if (item.icon === 'conditions') {
                onNavigateHomeSection('conditions');
                return;
              }
              if (item.icon === 'home') {
                onNavigateHomeSection('home');
                return;
              }
              onNavigate(item.step);
            }}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

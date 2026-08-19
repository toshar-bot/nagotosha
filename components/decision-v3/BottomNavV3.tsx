import { AppBottomNav, type AppBottomNavItemId } from '@/components/common/AppBottomNav';
import type { DecisionV3Step } from '@/types/decision-v3';

type Props = {
  step: DecisionV3Step;
  activeHomeSection: 'home' | 'conditions';
  compareReady: boolean;
  previewWidth?: number | null;
  onNavigate: (step: DecisionV3Step) => void;
  onNavigateHomeSection: (section: 'home' | 'conditions') => void;
};

export function BottomNavV3({
  step,
  activeHomeSection,
  compareReady,
  previewWidth,
  onNavigate,
  onNavigateHomeSection,
}: Props) {
  const activeItem: AppBottomNavItemId =
    step === 'compare' || step === 'decided'
      ? 'compare'
      : step === 'candidates' || step === 'detail'
        ? 'search'
        : activeHomeSection === 'conditions'
          ? 'search'
          : 'home';

  const handleNavigate = (item: AppBottomNavItemId) => {
    if (item === 'home') {
      onNavigateHomeSection('home');
      return;
    }
    if (item === 'search') {
      onNavigateHomeSection('conditions');
      return;
    }
    if (item === 'interested') {
      onNavigate('candidates');
      return;
    }
    if (item === 'compare') {
      onNavigate('compare');
    }
  };

  return (
    <AppBottomNav
      activeItem={activeItem}
      disabledItems={[
        'interested',
        ...(!compareReady ? ['compare' as const] : []),
        'history',
      ]}
      maxWidth={previewWidth ?? 430}
      onNavigate={handleNavigate}
    />
  );
}

'use client';

import { AppBottomNav, type AppBottomNavItemId } from '@/components/common/AppBottomNav';

type HomeBottomNavProps = {
  readonly onConditions: () => void;
  readonly onDiscover: () => void;
  readonly onSaved: () => void;
};

export default function HomeBottomNav({ onConditions, onDiscover, onSaved }: HomeBottomNavProps) {
  const handleNavigate = (item: AppBottomNavItemId) => {
    if (item === 'home') {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    if (item === 'search') {
      onConditions();
      return;
    }
    if (item === 'interested') {
      onSaved();
      return;
    }
    if (item === 'history') {
      onDiscover();
    }
  };

  return (
    <AppBottomNav
      activeItem="home"
      disabledItems={['compare']}
      onNavigate={handleNavigate}
    />
  );
}

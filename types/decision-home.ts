export type CategoryId = 'cafe' | 'sweets' | 'food' | 'outing' | 'shopping';

export type HomeCategory = {
  readonly id: CategoryId;
  readonly label: string;
  readonly iconAssetId: string;
  readonly iconSrc: string;
  readonly availability: 'available' | 'coming-soon';
  readonly destination: '/home-decision-preview#decision' | null;
  readonly visualScale: number;
  readonly visualTranslateY: number;
  readonly tone: {
    readonly surface: string;
    readonly border: string;
    readonly shadow: string;
    readonly accent: string;
  };
};

export type ConditionSummary = {
  readonly party: string;
  readonly budget: string;
  readonly mood: string;
  readonly area: string;
  readonly updatedAt: string;
};

export type HomeState =
  | { readonly kind: 'first-visit'; readonly focusedCategoryId: CategoryId }
  | {
      readonly kind: 'category-focused';
      readonly focusedCategoryId: CategoryId;
      readonly selectedCategoryId?: CategoryId;
    }
  | {
      readonly kind: 'conditions-resumable';
      readonly focusedCategoryId: CategoryId;
      readonly selectedCategoryId: CategoryId;
      readonly conditionSummary: ConditionSummary;
    };

export type HomeSessionRecord = {
  readonly version: 1;
  readonly expiresAt: string;
  readonly selectedCategoryId: CategoryId;
  readonly conditionSummary: ConditionSummary;
};

export type TopicImage =
  | { readonly kind: 'licensed'; readonly src: string; readonly alt: string; readonly rightsId: string }
  | { readonly kind: 'none' };

export type TopicCard =
  | {
      readonly kind: 'new-store';
      readonly id: string;
      readonly title: string;
      readonly area: string;
      readonly checkedAt: string;
      readonly image: TopicImage;
      readonly href: string;
    }
  | {
      readonly kind: 'event';
      readonly id: string;
      readonly title: string;
      readonly startsAt: string;
      readonly endsAt?: string;
      readonly image: TopicImage;
      readonly href: string;
    }
  | {
      readonly kind: 'feature';
      readonly id: string;
      readonly title: string;
      readonly checkedAt: string;
      readonly image: TopicImage;
      readonly href: string;
    }
  | {
      readonly kind: 'sponsored';
      readonly id: string;
      readonly title: string;
      readonly advertiserName: string;
      readonly disclosure: 'PR';
      readonly image: TopicImage;
      readonly href: string;
    }
  | {
      readonly kind: 'ticket';
      readonly id: string;
      readonly title: string;
      readonly affiliateDisclosure: string;
      readonly image: TopicImage;
      readonly href: string;
    };

export type HomeAnalyticsEvent =
  | { readonly name: 'home_view'; readonly stateKind: HomeState['kind'] }
  | {
      readonly name: 'category_focus';
      readonly categoryId: CategoryId;
      readonly method: 'tap' | 'swipe' | 'keyboard';
    }
  | { readonly name: 'category_select'; readonly categoryId: CategoryId; readonly method: 'card' | 'cta' }
  | { readonly name: 'category_coming_soon'; readonly categoryId: CategoryId }
  | { readonly name: 'condition_resume_view' }
  | { readonly name: 'condition_resume_continue' }
  | { readonly name: 'condition_resume_edit' }
  | { readonly name: 'topic_impression'; readonly topicId: string; readonly kind: TopicCard['kind'] }
  | { readonly name: 'topic_click'; readonly topicId: string; readonly kind: TopicCard['kind'] };

export type RelativePosition = -2 | -1 | 0 | 1 | 2;

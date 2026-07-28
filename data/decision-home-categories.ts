import type { CategoryId, HomeCategory, RelativePosition } from '@/types/decision-home';

export const DECISION_HOME_CATEGORIES = [
  {
    id: 'cafe',
    label: 'カフェ',
    iconAssetId: '01_cafe',
    iconSrc: '/decision/home-functional/icons/01_cafe.png',
    availability: 'coming-soon',
    destination: null,
    visualScale: 0.86,
    visualTranslateY: 0,
    tone: { surface: '#fbe1e7', border: '#db5377', shadow: '#c74465', accent: '#c9345c' },
  },
  {
    id: 'sweets',
    label: 'スイーツ',
    iconAssetId: '02_sweets',
    iconSrc: '/decision/home-functional/icons/02_sweets.png',
    availability: 'coming-soon',
    destination: null,
    visualScale: 0.82,
    visualTranslateY: 0,
    tone: { surface: '#eee2fb', border: '#8659bf', shadow: '#67419d', accent: '#6f42a8' },
  },
  {
    id: 'food',
    label: '食事',
    iconAssetId: '03_meal',
    iconSrc: '/decision/home-functional/icons/03_meal.png',
    availability: 'available',
    destination: '/home-decision-preview#decision',
    visualScale: 0.98,
    visualTranslateY: 2,
    tone: { surface: '#dce9f7', border: '#173d70', shadow: '#08254c', accent: '#0d315f' },
  },
  {
    id: 'outing',
    label: 'おでかけ',
    iconAssetId: '04_outing',
    iconSrc: '/decision/home-functional/icons/04_outing.png',
    availability: 'coming-soon',
    destination: null,
    visualScale: 0.82,
    visualTranslateY: 0,
    tone: { surface: '#dcefe9', border: '#2c8c75', shadow: '#166855', accent: '#18745e' },
  },
  {
    id: 'shopping',
    label: '買い物',
    iconAssetId: '05_shopping',
    iconSrc: '/decision/home-functional/icons/05_shopping.png',
    availability: 'coming-soon',
    destination: null,
    visualScale: 0.8,
    visualTranslateY: 0,
    tone: { surface: '#fff0d8', border: '#de8b24', shadow: '#bd6713', accent: '#c66f16' },
  },
] as const satisfies readonly HomeCategory[];

export const DECISION_HOME_CATEGORY_IDS = DECISION_HOME_CATEGORIES.map(({ id }) => id) as readonly CategoryId[];

export const INITIAL_DECISION_HOME_CATEGORY_INDEX = 2;

export function getDecisionHomeCategory(categoryId: CategoryId): HomeCategory {
  const category = DECISION_HOME_CATEGORIES.find(({ id }) => id === categoryId);
  if (!category) throw new Error(`Unknown Home category: ${categoryId}`);
  return category;
}

export function getRelativeCategoryPosition(
  itemIndex: number,
  activeIndex: number,
  length: number,
): RelativePosition {
  return (((((itemIndex - activeIndex) % length) + length + 2) % length) - 2) as RelativePosition;
}

export function wrapCategoryIndex(index: number): number {
  const length = DECISION_HOME_CATEGORIES.length;
  return ((index % length) + length) % length;
}

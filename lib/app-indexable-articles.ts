export const APP_INDEXABLE_ARTICLE_IDS = new Set<number>([205]);

export function isAppIndexableArticleId(id: number | string) {
  const numericId = Number(id);
  return Number.isInteger(numericId) && APP_INDEXABLE_ARTICLE_IDS.has(numericId);
}

export function getAppIndexableArticleIds() {
  return Array.from(APP_INDEXABLE_ARTICLE_IDS).sort((a, b) => b - a);
}

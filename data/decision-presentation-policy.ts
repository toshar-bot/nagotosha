import type { DecisionPresentationPolicy } from '../types/decision-presentation';

export const DECISION_PRESENTATION_POLICY: DecisionPresentationPolicy = {
  version: 'decision-presentation-v1',
  candidateCount: {
    minimum: 1,
    maximum: 3,
  },
  roles: [
    {
      key: 'quick',
      label: '短時間・手軽',
      tone: 'blue',
      approvedMoodTags: ['quick'],
    },
    {
      key: 'hearty',
      label: 'しっかり食事',
      tone: 'coral',
      approvedMoodTags: ['hearty', 'spicy'],
    },
    {
      key: 'cafe-relax',
      label: 'カフェ・ゆっくり',
      tone: 'violet',
      approvedMoodTags: ['cafe', 'relax'],
    },
  ],
  budgetLabels: {
    under1000: '〜1,000円',
    under2000: '〜2,000円',
    under4000: '〜4,000円',
    open: '予算は公式情報を確認',
  },
  areaLabels: {
    sakae: '栄',
    meieki: '名駅',
    osu: '大須',
  },
  actionLabels: {
    article: '記事を読む',
    official: '公式サイト',
    map: '地図を見る',
    reservation: '予約ページ',
  },
  relaxHints: {
    budget: '予算を広げて探す',
    area: 'エリアを外して探す',
    mood: '気分を外して探す',
  },
  lastOrderPrefix: 'L.O.',
  maximumMatchReasons: 3,
};

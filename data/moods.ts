export type MoodSlug =
  | 'hearty'
  | 'solo'
  | 'date'
  | 'family'
  | 'rainy'
  | 'new';

export type Mood = {
  slug: MoodSlug;
  label: string;
  hint: string;
  tosharLine: string;
  articleIds: string[];
  accent?: boolean;
};

export const MOODS: Mood[] = [
  {
    slug: 'hearty',
    label: 'がっつり食べたい',
    hint: '麻辣湯・パスタ・肉',
    tosharLine: 'しっかり食べたい日は、味のはっきりした料理から選ぶと決めやすいよ。',
    articleIds: ['32', '92'],
  },
  {
    slug: 'solo',
    label: 'ひとりで気軽に',
    hint: 'モーニング・ひとりごはん',
    tosharLine: 'ひとり時間の日は、朝の喫茶店や入りやすいごはんから探すと楽だよ。',
    articleIds: ['66', '32'],
  },
  {
    slug: 'date',
    label: 'デートで行きたい',
    hint: '夜景・ビアガーデン',
    tosharLine: '少し特別にしたい日は、景色や季節感のある場所から選ぶと見つけやすいよ。',
    articleIds: ['79', '39'],
  },
  {
    slug: 'family',
    label: '子どもと楽しみたい',
    hint: '屋内あそび・家族ごはん',
    tosharLine: '家族で動く日は、天気に左右されにくく、休憩しやすい場所から探すと安心だよ。',
    articleIds: ['58'],
  },
  {
    slug: 'rainy',
    label: '雨の日でも楽しみたい',
    hint: '駅直結・屋内スポット',
    tosharLine: '雨の日は、駅近や屋内で過ごせる候補があると予定を決めやすいよ。',
    articleIds: ['58', '39'],
  },
  {
    slug: 'new',
    label: '新しいお店を見つけたい',
    hint: '今月の新店をチェック',
    tosharLine: '新しいお店を探す日は、新店まとめから眺めるのが早いよ。',
    articleIds: ['83', '92', '32'],
    accent: true,
  },
];

export function getMood(slug: string): Mood | undefined {
  return MOODS.find((mood) => mood.slug === slug);
}

export function getOtherMoods(slug: MoodSlug): Mood[] {
  return MOODS.filter((mood) => mood.slug !== slug);
}

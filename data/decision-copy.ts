export const DECISION_SCREEN_COPY = {
  presenting: {
    title: '今日の候補です',
    multipleCandidatesNote: '気になる候補を残しながら、1件ずつ見られます。',
    singleCandidateNote: 'この候補を確認できます。気になれば残せます。',
    orderNote: '表示順は順位ではありません',
  },
  comparing: {
    title: '気になった候補をくらべる',
    note: '過ごし方の違いで比べられます。順位ではありません。',
  },
  decided: {
    title: '今日はここにしました',
    reasonTitle: 'あなたが選んだ理由',
    note: 'いい時間になりますように。',
  },
  noMatch: {
    title: '条件に合う候補が、今は見つかりませんでした',
    note: '条件を少し変えると見つかるかもしれません。',
  },
  dataUnavailable: {
    title: '候補の情報を確認しています',
    note: '確認が終わるまで、特集や新店から探せます。',
  },
  noRemaining: {
    title: '今回は気になる候補が残りませんでした',
    note: '条件を見直すと、別の候補を探せます。',
  },
} as const;

export const DECISION_BUTTON_COPY = {
  reject: '今日は違う',
  interested: '気になる',
  interestedSelected: '気になる済み',
  back: '‹ 前の候補へ',
  decide: 'これにする ›',
  save: '♡ 保存する',
  saved: '♥ 保存済み',
} as const;

export const DECISION_ARIA_COPY = {
  reject: 'この候補は今日は見送る',
  interested: 'この候補を気になるに残す',
  interestedSelected: '気になるに追加済み。もう一度押すと外せます',
  removeInterested: '気になるから外す',
  back: '前の候補にもどる',
  dataUnavailable: '表示できる候補情報を準備中です',
} as const;

export const DECISION_FEEDBACK_COPY = {
  saved: '保存しました',
  unsaved: '保存を解除しました',
} as const;

export const DECISION_RESERVATION_NOTE = '空席・予約枠は保証されません' as const;

export const FORBIDDEN_DECISION_COPY = [
  '一番おすすめ',
  '最適',
  '絶対',
  '今営業中',
  '営業中です',
  '空席あり',
  '在庫あり',
  '予約できます',
  'すぐ行ける',
  '適合率',
  'おすすめ度',
  'マッチ度',
  'パーセント',
  '%',
  'AIが選びました',
  'おすすめ順',
  '自動的に変更しました',
] as const;

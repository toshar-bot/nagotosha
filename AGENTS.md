# AGENTS.md — なごとしゃ AI開発ルール（Codex / 開発AI向け最上位ルール）

作業開始前に必ず以下をすべて読んでください。

- `docs/AI_WORKFLOW_RULES.md`
- `docs/DESIGN_REPRODUCTION_RULES.md`
- `docs/NAGOTOSHA_ACCEPTANCE_CHECKLIST.md`

---

## 絶対禁止事項

- `git add .` は絶対禁止。addは必ず個別ファイル指定
- `.env` は読まない・表示しない・変更しない
- 認証情報・パスワード・アプリケーションパスワードは一切表示しない
- WordPress投稿・更新・削除・publish は禁止
- ユーザーから明示的に許可されていないコミットは行わない

---

## 触らないファイル（永続）

```
public/gacha/odekake-pack-tight.png
public/gacha/odekake-pack-transparent.png
scripts/wp-draft-new-open.mjs
scripts/wp-draft-omiyage.mjs
scripts/wp-draft-rain.mjs
.env
```

---

## 作業原則

### 対象ファイルの限定
- 作業前に「触るファイル」「触らないファイル」を明示する
- 指定外ファイルは読み取りのみ。変更しない

### モック再現タスク
- モック再現タスクでは、素材不足をCSS・グラデーション・シルエット・汎用画像で勝手に代替してはいけない
- 素材がない場合は作業を止め、必要素材を報告する
- 90%未満の再現度ではコミットしない

### build確認
- build成功は完了条件ではない
- モックとの見た目比較、スマホ表示（390px / 430px）、横スクロールなし、ユーザー承認まで完了扱いしない

### コミット
- コミットはユーザー承認後のみ実施
- `git diff --cached --name-only` で対象ファイルを必ず確認
- 対象外ファイルが staging に入っていたら即停止・報告

---

## 報告フォーマット

作業後は必ず以下を報告する。

1. 変更したファイル一覧
2. 変更内容の要約
3. `npm run build` の結果
4. `git status --short`
5. `git add` / `commit` をまだしていないこと
6. 認証情報を表示していないこと

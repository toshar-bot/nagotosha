# AI_WORKFLOW_RULES.md — なごとしゃ 全AI共通作業手順

このファイルはClaude / Codex / ChatGPT など全AIが作業前に読む共通手順です。

---

## Step 1｜現状確認

作業開始前に必ず以下を実行する。

```powershell
git status --short
```

確認項目：

- 未コミット変更があるファイル（`M`）
- 未追跡ファイル（`??`）
- 今回の作業対象に含まれていないファイルが変更されていないか

**触ってはいけないファイル（永続）**

```
public/gacha/odekake-pack-tight.png
public/gacha/odekake-pack-transparent.png
scripts/wp-draft-new-open.mjs
scripts/wp-draft-omiyage.mjs
scripts/wp-draft-rain.mjs
.env
```

---

## Step 2｜作業前宣言（必須）

コード編集を始める前に、以下を明示する。

```
触るファイル:
触らないファイル:
今回の目的:
完了条件:
```

宣言なしで実装を始めてはいけない。

---

## Step 3｜実装

- 宣言した対象ファイルだけを編集する
- 既存のロジック・スタイルを不必要に壊さない
- 無関係なコードの整形・リファクタは行わない
- 指定外ファイルへの変更は禁止
- 「いい感じ」「なんとなく改善」は禁止。目的に集中する

---

## Step 4｜確認

### ビルド確認

```powershell
npm run build
```

ビルドが通ることは最低条件。ただしビルド成功のみで完了扱いしない。

### ページ確認

対象ページの HTTP 200 を確認する。

```powershell
curl -o /dev/null -s -w "%{http_code}" http://localhost:3000/
curl -o /dev/null -s -w "%{http_code}" http://localhost:3000/new
curl -o /dev/null -s -w "%{http_code}" http://localhost:3000/article/32
```

### スマホ表示確認

- 390px 幅でファーストビューと全体を確認
- 430px 幅でファーストビューと全体を確認
- 横スクロールが発生していないこと

### モック比較

- モック画像と並べて、セクション単位で差分を確認する
- 再現度を %で見積もる
- 90%未満の場合はコミットしない

---

## Step 5｜報告

作業後に以下を必ず報告する。

1. 変更したファイル一覧
2. 変更内容の要約（何をどう変えたか）
3. `npm run build` の結果
4. `git status --short` の出力
5. `git add` / `commit` をまだしていないこと
6. 認証情報・パスワードを表示していないこと
7. 対象外ファイルを触っていないこと

---

## Step 6｜コミット（ユーザー承認後のみ）

コミットはユーザーから明示的に承認を得た後のみ実施する。

```powershell
git add "対象ファイル名"
git diff --cached --name-only  # 必ず確認
```

`git diff --cached --name-only` の結果が想定外ファイルを含む場合は即停止・報告。

```powershell
git commit -m "コミットメッセージ"
git status --short  # コミット後確認
```

`git add .` は絶対禁止。

---

## 禁止事項まとめ

| 禁止事項 | 理由 |
|---|---|
| `git add .` | 対象外ファイルが混入するリスク |
| `.env` の読み取り・表示 | 認証情報漏洩防止 |
| WordPress publish | 下書き記事の誤公開防止 |
| 素材不足をCSSで代替 | モック乖離が広がる |
| build成功=完了扱い | 見た目確認なしでの誤コミット防止 |
| 90%未満でコミット | 不完全な状態を積み重ねない |

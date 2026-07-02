# WordPress Draft Submission Workflow

This workflow creates or updates WordPress drafts from local article files. It never publishes posts. Publishing must always be done by a human in the WordPress admin screen after previewing the draft.

## Files

- `content/drafts/<slug>/post.json`: article metadata
- `content/drafts/<slug>/body.html`: approved article HTML
- `content/drafts/<slug>/.wp-state.json`: local submission state, ignored by git
- `content/drafts/<slug>/eyecatch.png`: optional local image. Do not commit by default; decide per image.

## Commands

Run a dry run first:

```powershell
node scripts/wp/submit-draft.mjs content/drafts/nagoya-morning-culture-guide/post.json --dry-run
```

Set environment variables only for real submission:

```powershell
$env:WORDPRESS_API_BASE="https://example.com/wp-json/wp/v2"
$env:WORDPRESS_USERNAME="your-wordpress-username"
$env:WORDPRESS_APP_PASSWORD="your-wordpress-application-password"
```

Submit the draft:

```powershell
node scripts/wp/submit-draft.mjs content/drafts/nagoya-morning-culture-guide/post.json
```

Upload and set the eyecatch after the draft has local state:

```powershell
node scripts/wp/upload-eyecatch.mjs content/drafts/nagoya-morning-culture-guide/post.json
```

## Safety Rules

- Do not publish from scripts.
- Publish only from the WordPress admin screen after preview.
- Do not paste credentials into chat.
- Do not commit credentials, application passwords, or local state.
- Do not leave credentials in logs.
- Use a dedicated WordPress bot user with Author permissions where possible.
- If a slug already exists but there is no `.wp-state.json`, the script stops instead of updating that post.
- If `.wp-state.json` points to a non-draft post, the script stops and asks for manual review.

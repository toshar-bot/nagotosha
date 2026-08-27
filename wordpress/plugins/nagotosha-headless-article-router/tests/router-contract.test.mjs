import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pluginPath = fileURLToPath(
  new URL('../nagotosha-headless-article-router.php', import.meta.url),
);
const source = await readFile(pluginPath, 'utf8');

const requiredFragments = [
  'Plugin Name: Nagotosha Headless Article Router',
  "const META_ENABLED   = '_nagotosha_app_route_enabled';",
  "const META_PERMANENT = '_nagotosha_app_route_permanent';",
  "register_post_meta( 'post', self::META_ENABLED, $common_args );",
  "register_post_meta( 'post', self::META_PERMANENT, $common_args );",
  "'show_in_rest'      => array(",
  "current_user_can( 'edit_post', (int) $post_id )",
  "'app.nagotosha.com'",
  "is_singular( 'post' )",
  "'publish' !== get_post_status( $post_id )",
  "defined( 'REST_REQUEST' ) && REST_REQUEST",
  'is_preview() || is_feed() || is_embed() || is_trackback() || wp_doing_ajax()',
  'nocache_headers();',
  "? 301 : 302",
  "add_filter( 'wp_sitemaps_posts_query_args'",
  "'compare' => 'NOT EXISTS'",
  "'value'   => '1'",
];

for (const fragment of requiredFragments) {
  assert.ok(source.includes(fragment), `missing router contract: ${fragment}`);
}

assert.equal(source.includes('functions.php'), false, 'theme injection is prohibited');
assert.equal(source.includes('$_GET'), false, 'request input must not control redirect targets');
assert.match(source, /self::APP_ORIGIN\s*\.\s*'\/article\/'/, 'target must be a fixed app article route');
assert.match(source, /if \( ! self::meta_is_enabled\( \$post_id, self::META_ENABLED \) \) \{\s*return;/, 'opt-in gate must fail closed');
assert.match(source, /if \( wp_safe_redirect\( \$target, \$status, 'Nagotosha Headless Article Router' \) \) \{\s*exit;\s*\}/, 'redirect must exit only after a successful safe redirect');
assert.doesNotMatch(source, /wp_safe_redirect\( \$target, \$status, 'Nagotosha Headless Article Router' \);\s*exit;/, 'redirect failure must retain the normal WordPress response');

console.log('Nagotosha headless article router static contract: PASS');

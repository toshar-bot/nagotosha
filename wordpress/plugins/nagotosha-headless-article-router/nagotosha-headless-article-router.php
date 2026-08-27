<?php
/**
 * Plugin Name: Nagotosha Headless Article Router
 * Description: Opt-in routing of published WordPress posts to their canonical app.nagotosha.com article URL.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

final class Nagotosha_Headless_Article_Router {
	const META_ENABLED   = '_nagotosha_app_route_enabled';
	const META_PERMANENT = '_nagotosha_app_route_permanent';
	const APP_ORIGIN     = 'https://app.nagotosha.com';

	/**
	 * Registers the plugin hooks.
	 *
	 * @return void
	 */
	public static function bootstrap() {
		add_action( 'init', array( __CLASS__, 'register_post_meta' ) );
		add_filter( 'allowed_redirect_hosts', array( __CLASS__, 'allow_app_redirect_host' ), 10, 2 );
		add_action( 'template_redirect', array( __CLASS__, 'redirect_enabled_public_post' ), 1 );
		add_filter( 'wp_sitemaps_posts_query_args', array( __CLASS__, 'exclude_enabled_posts_from_core_sitemap' ), 10, 2 );
	}

	/**
	 * Registers the explicit, per-post routing controls for REST-aware editors.
	 *
	 * @return void
	 */
	public static function register_post_meta() {
		$common_args = array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => false,
			'sanitize_callback' => array( __CLASS__, 'sanitize_boolean' ),
			'auth_callback'     => array( __CLASS__, 'can_edit_routing_meta' ),
			'show_in_rest'      => array(
				'schema' => array(
					'type' => 'boolean',
				),
			),
		);

		register_post_meta( 'post', self::META_ENABLED, $common_args );
		register_post_meta( 'post', self::META_PERMANENT, $common_args );
	}

	/**
	 * Sanitizes all meta writes to a real boolean.
	 *
	 * @param mixed $value Candidate value.
	 * @return bool
	 */
	public static function sanitize_boolean( $value ) {
		$sanitized = filter_var( $value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
		return null === $sanitized ? false : $sanitized;
	}

	/**
	 * Allows only a user who can edit the target post to write routing meta.
	 *
	 * @param bool   $allowed Existing authorization result.
	 * @param string $meta_key Meta key.
	 * @param int    $post_id Post ID.
	 * @return bool
	 */
	public static function can_edit_routing_meta( $allowed, $meta_key, $post_id ) {
		return current_user_can( 'edit_post', (int) $post_id );
	}

	/**
	 * Adds the fixed application host to WordPress safe redirects.
	 *
	 * @param string[] $hosts Allowed hosts.
	 * @param string   $host Requested host.
	 * @return string[]
	 */
	public static function allow_app_redirect_host( $hosts, $host ) {
		$hosts[] = 'app.nagotosha.com';
		return array_values( array_unique( $hosts ) );
	}

	/**
	 * Redirects an explicitly enabled, public post to the app article URL.
	 *
	 * @return void
	 */
	public static function redirect_enabled_public_post() {
		if ( is_admin() || self::is_non_public_request() || ! is_singular( 'post' ) ) {
			return;
		}

		$post_id = absint( get_queried_object_id() );
		if ( ! $post_id || 'publish' !== get_post_status( $post_id ) ) {
			return;
		}

		if ( ! self::meta_is_enabled( $post_id, self::META_ENABLED ) ) {
			return;
		}

		$target = self::APP_ORIGIN . '/article/' . $post_id;
		$status = self::meta_is_enabled( $post_id, self::META_PERMANENT ) ? 301 : 302;

		nocache_headers();
		if ( wp_safe_redirect( $target, $status, 'Nagotosha Headless Article Router' ) ) {
			exit;
		}
	}

	/**
	 * Returns whether the current request must retain the normal WordPress response.
	 *
	 * @return bool
	 */
	private static function is_non_public_request() {
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return true;
		}

		return is_preview() || is_feed() || is_embed() || is_trackback() || wp_doing_ajax();
	}

	/**
	 * Reads a boolean routing meta value without treating arbitrary strings as enabled.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $meta_key Meta key.
	 * @return bool
	 */
	private static function meta_is_enabled( $post_id, $meta_key ) {
		return '1' === get_post_meta( $post_id, $meta_key, true );
	}

	/**
	 * Keeps explicitly routed posts out of the WordPress core posts sitemap.
	 *
	 * @param array  $args Query arguments.
	 * @param string $post_type Requested post type.
	 * @return array
	 */
	public static function exclude_enabled_posts_from_core_sitemap( $args, $post_type ) {
		if ( 'post' !== $post_type ) {
			return $args;
		}

		$not_enabled_clause = array(
			'relation' => 'OR',
			array(
				'key'     => self::META_ENABLED,
				'compare' => 'NOT EXISTS',
			),
			array(
				'key'     => self::META_ENABLED,
				'value'   => '1',
				'compare' => '!=',
			),
		);

		if ( empty( $args['meta_query'] ) ) {
			$args['meta_query'] = $not_enabled_clause;
			return $args;
		}

		$args['meta_query'] = array(
			'relation' => 'AND',
			$args['meta_query'],
			$not_enabled_clause,
		);

		return $args;
	}
}

Nagotosha_Headless_Article_Router::bootstrap();

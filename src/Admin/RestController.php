<?php

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Admin;

use MultisiteOverrideStyle\Override\ExemptionChecker;
use MultisiteOverrideStyle\Preview\PreviewHandler;
use MultisiteOverrideStyle\Storage\RevisionRepository;
use MultisiteOverrideStyle\Storage\SettingsRepository;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Registers the mos/v1 REST API namespace consumed by the React admin UI.
 *
 * All endpoints require the manage_network capability.
 *
 * Routes:
 *   GET    /mos/v1/settings                     — current CSS, theme.json, exemptions
 *   POST   /mos/v1/settings                     — save settings (creates a revision first)
 *   GET    /mos/v1/revisions                    — list last 10 revisions
 *   POST   /mos/v1/revisions/{id}/restore       — restore a revision
 *   GET    /mos/v1/sites                        — all sites with exemption status
 *   POST   /mos/v1/sites/{id}/exemption         — set exemption for a site
 *   POST   /mos/v1/preview                      — create a draft, returns preview URL
 *   DELETE /mos/v1/preview/{token}              — discard a draft
 *   GET    /mos/v1/export                       — download the settings bundle
 *   POST   /mos/v1/import                       — import a settings bundle
 */
final class RestController {

	private const NAMESPACE = 'mos/v1';
	private const CAPABILITY = 'manage_network';

	public function __construct(
		private readonly SettingsRepository $settings,
		private readonly RevisionRepository $revisions,
		private readonly ExemptionChecker $exemption,
		private readonly PreviewHandler $preview,
	) {}

	public function register(): void {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes(): void {
		$auth = [ $this, 'check_permission' ];

		register_rest_route( self::NAMESPACE, '/settings', [
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_settings' ],
				'permission_callback' => $auth,
			],
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'save_settings' ],
				'permission_callback' => $auth,
				'args'                => [
					'css'        => [ 'type' => 'string', 'default' => '' ],
					'theme_json' => [ 'type' => 'object', 'default' => [] ],
				],
			],
		] );

		register_rest_route( self::NAMESPACE, '/revisions', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_revisions' ],
			'permission_callback' => $auth,
		] );

		register_rest_route( self::NAMESPACE, '/revisions/(?P<id>[a-z0-9_.]+)/restore', [
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'restore_revision' ],
			'permission_callback' => $auth,
			'args'                => [
				'id' => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/sites', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_sites' ],
			'permission_callback' => $auth,
		] );

		register_rest_route( self::NAMESPACE, '/sites/(?P<id>[\d]+)/exemption', [
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'set_exemption' ],
			'permission_callback' => $auth,
			'args'                => [
				'id'       => [ 'type' => 'integer', 'required' => true ],
				'exempted' => [ 'type' => 'boolean', 'required' => true ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/preview', [
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'create_preview' ],
			'permission_callback' => $auth,
			'args'                => [
				'css'        => [ 'type' => 'string', 'default' => '' ],
				'theme_json' => [ 'type' => 'object', 'default' => [] ],
				'site_url'   => [ 'type' => 'string', 'default' => '', 'sanitize_callback' => 'esc_url_raw' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/preview/(?P<token>[a-z0-9]+)', [
			'methods'             => WP_REST_Server::DELETABLE,
			'callback'            => [ $this, 'discard_preview' ],
			'permission_callback' => $auth,
			'args'                => [
				'token' => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/export', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ $this, 'export_settings' ],
			'permission_callback' => $auth,
		] );

		register_rest_route( self::NAMESPACE, '/import', [
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'import_settings' ],
			'permission_callback' => $auth,
			'args'                => [
				'css'             => [ 'type' => 'string', 'default' => '' ],
				'theme_json'      => [ 'type' => 'object', 'default' => [] ],
				'exemptions'      => [ 'type' => 'array', 'items' => [ 'type' => 'integer' ], 'default' => [] ],
				'theme_overrides' => [ 'type' => 'object', 'default' => [] ],
			],
		] );

		// Theme-specific overrides.
		register_rest_route( self::NAMESPACE, '/network-themes', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_network_themes' ],
			'permission_callback' => $auth,
		] );

		register_rest_route( self::NAMESPACE, '/theme-overrides', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_theme_overrides' ],
			'permission_callback' => $auth,
		] );

		register_rest_route( self::NAMESPACE, '/theme-overrides/(?P<slug>[a-z0-9_-]+)', [
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_theme_override' ],
				'permission_callback' => $auth,
				'args'                => [
					'slug' => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
				],
			],
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'save_theme_override' ],
				'permission_callback' => $auth,
				'args'                => [
					'slug'       => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
					'css'        => [ 'type' => 'string', 'default' => '' ],
					'theme_json' => [ 'type' => 'object', 'default' => [] ],
				],
			],
			[
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => [ $this, 'delete_theme_override' ],
				'permission_callback' => $auth,
				'args'                => [
					'slug' => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
				],
			],
		] );
	}

	public function check_permission(): bool {
		return current_user_can( self::CAPABILITY );
	}

	public function get_settings(): WP_REST_Response {
		return new WP_REST_Response( [
			'css'        => $this->settings->get_css(),
			'theme_json' => $this->settings->get_theme_json(),
			'exemptions' => $this->settings->get_exemptions(),
		] );
	}

	public function save_settings( WP_REST_Request $request ): WP_REST_Response {
		// Snapshot the current state before overwriting.
		$this->revisions->snapshot( get_current_user_id() );

		$this->settings->save_css( (string) $request->get_param( 'css' ) );
		$this->settings->save_theme_json( (array) $request->get_param( 'theme_json' ) );

		return $this->get_settings();
	}

	public function get_revisions(): WP_REST_Response {
		return new WP_REST_Response( $this->revisions->all() );
	}

	public function restore_revision( WP_REST_Request $request ): WP_REST_Response {
		$id = (string) $request->get_param( 'id' );
		$restored = $this->revisions->restore( $id, get_current_user_id() );

		if ( ! $restored ) {
			return new WP_REST_Response( [ 'message' => __( 'Revision not found.', 'multisite-override-style' ) ], 404 );
		}

		return $this->get_settings();
	}

	public function get_sites(): WP_REST_Response {
		$sites = get_sites( [ 'number' => 500, 'fields' => 'ids' ] );
		$exemptions = $this->settings->get_exemptions();
		$result = [];

		foreach ( $sites as $blog_id ) {
			$details = get_blog_details( (int) $blog_id );
			$result[] = [
				'id'       => (int) $blog_id,
				'name'     => $details ? $details->blogname : (string) $blog_id,
				'url'      => $details ? $details->siteurl : '',
				'exempted' => in_array( (int) $blog_id, $exemptions, true ),
			];
		}

		return new WP_REST_Response( $result );
	}

	public function set_exemption( WP_REST_Request $request ): WP_REST_Response {
		$blog_id  = (int) $request->get_param( 'id' );
		$exempted = (bool) $request->get_param( 'exempted' );

		if ( $exempted ) {
			$this->settings->add_exemption( $blog_id );
		} else {
			$this->settings->remove_exemption( $blog_id );
		}

		return new WP_REST_Response( [
			'id'       => $blog_id,
			'exempted' => $exempted,
		] );
	}

	public function create_preview( WP_REST_Request $request ): WP_REST_Response {
		$css        = (string) $request->get_param( 'css' );
		$theme_json = (array) $request->get_param( 'theme_json' );
		$site_url   = (string) $request->get_param( 'site_url' );

		$token = $this->preview->create_draft( $css, $theme_json );

		$base_url = $site_url !== '' ? $site_url : network_home_url( '/' );
		$preview_url = add_query_arg( 'mos_preview', $token, $base_url );

		return new WP_REST_Response( [
			'token'       => $token,
			'preview_url' => $preview_url,
		] );
	}

	public function discard_preview( WP_REST_Request $request ): WP_REST_Response {
		$token = (string) $request->get_param( 'token' );
		$this->preview->discard_draft( $token );

		return new WP_REST_Response( [ 'discarded' => true ] );
	}

	public function export_settings(): WP_REST_Response {
		$bundle = [
			'version'         => MOS_VERSION,
			'exported'        => gmdate( 'c' ),
			'css'             => $this->settings->get_css(),
			'theme_json'      => $this->settings->get_theme_json(),
			'exemptions'      => $this->settings->get_exemptions(),
			'theme_overrides' => $this->settings->get_theme_overrides(),
		];

		return new WP_REST_Response( $bundle );
	}

	public function import_settings( WP_REST_Request $request ): WP_REST_Response {
		// Snapshot current state before overwriting.
		$this->revisions->snapshot( get_current_user_id() );

		$this->settings->save_css( (string) $request->get_param( 'css' ) );
		$this->settings->save_theme_json( (array) $request->get_param( 'theme_json' ) );
		$this->settings->save_exemptions( (array) $request->get_param( 'exemptions' ) );

		// Import theme overrides if provided.
		$theme_overrides = (array) $request->get_param( 'theme_overrides' );
		foreach ( $theme_overrides as $slug => $override ) {
			if ( is_array( $override ) ) {
				$css        = $override['css'] ?? '';
				$theme_json = $override['theme_json'] ?? [];
				$this->settings->save_theme_override( (string) $slug, (string) $css, (array) $theme_json );
			}
		}

		return $this->get_settings();
	}

	/**
	 * Get themes that are active on at least one subsite.
	 */
	public function get_network_themes(): WP_REST_Response {
		global $wpdb;

		// Get all unique stylesheet values from wp_X_options across the network.
		$blog_ids = get_sites( [
			'fields' => 'ids',
			'number' => 0,
		] );

		$themes = [];
		foreach ( $blog_ids as $blog_id ) {
			switch_to_blog( $blog_id );
			$stylesheet = get_option( 'stylesheet' );
			if ( $stylesheet && ! isset( $themes[ $stylesheet ] ) ) {
				$theme = wp_get_theme( $stylesheet );
				if ( $theme->exists() ) {
					$themes[ $stylesheet ] = [
						'slug'          => $stylesheet,
						'name'          => $theme->get( 'Name' ),
						'is_block_theme' => $theme->is_block_theme(),
					];
				}
			}
			restore_current_blog();
		}

		return new WP_REST_Response( array_values( $themes ) );
	}

	/**
	 * Get all theme-specific overrides.
	 */
	public function get_theme_overrides(): WP_REST_Response {
		return new WP_REST_Response( $this->settings->get_theme_overrides() );
	}

	/**
	 * Get override for a specific theme.
	 */
	public function get_theme_override( WP_REST_Request $request ): WP_REST_Response {
		$slug = (string) $request->get_param( 'slug' );

		return new WP_REST_Response( [
			'slug'       => $slug,
			'css'        => $this->settings->get_theme_css( $slug ),
			'theme_json' => $this->settings->get_theme_json_for_theme( $slug ),
		] );
	}

	/**
	 * Save override for a specific theme.
	 */
	public function save_theme_override( WP_REST_Request $request ): WP_REST_Response {
		$slug       = (string) $request->get_param( 'slug' );
		$css        = (string) $request->get_param( 'css' );
		$theme_json = (array) $request->get_param( 'theme_json' );

		$this->settings->save_theme_override( $slug, $css, $theme_json );

		return $this->get_theme_override( $request );
	}

	/**
	 * Delete override for a specific theme.
	 */
	public function delete_theme_override( WP_REST_Request $request ): WP_REST_Response {
		$slug = (string) $request->get_param( 'slug' );
		$this->settings->delete_theme_override( $slug );

		return new WP_REST_Response( [ 'deleted' => $slug ] );
	}
}

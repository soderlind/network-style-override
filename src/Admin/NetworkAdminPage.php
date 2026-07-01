<?php

declare( strict_types=1 );

namespace NetworkStyleOverride\Admin;

use NetworkStyleOverride\Preview\PreviewHandler;
use NetworkStyleOverride\Storage\RevisionRepository;
use NetworkStyleOverride\Storage\SettingsRepository;

/**
 * Registers the "Override Style" page under Network Admin → Settings.
 * Enqueues the React admin application.
 */
final class NetworkAdminPage {

	public const MENU_SLUG = 'network-style-override';
	public const CAPABILITY = 'manage_network';

	public function __construct(
		private readonly SettingsRepository $settings,
		private readonly RevisionRepository $revisions,
		private readonly PreviewHandler $preview,
	) {}

	public function register(): void {
		add_action( 'network_admin_menu', [ $this, 'add_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
	}

	public function add_menu(): void {
		add_submenu_page(
			'themes.php',
			__( 'Override Style', 'network-style-override' ),
			__( 'Override Style', 'network-style-override' ),
			self::CAPABILITY,
			self::MENU_SLUG,
			[ $this, 'render_page' ],
		);
	}

	public function render_page(): void {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'network-style-override' ) );
		}

		echo '<div class="wrap"><div id="nso-admin-app"></div></div>';
	}

	public function enqueue_assets( string $hook ): void {
		// Network admin uses different hook format
		$expected_hooks = [
			'appearance_page_' . self::MENU_SLUG,
			'themes_page_' . self::MENU_SLUG,
		];

		if ( ! in_array( $hook, $expected_hooks, true ) ) {
			return;
		}

		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}

		$asset_file = NSO_PLUGIN_DIR . 'build/index.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'nso-admin',
			NSO_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true,
		);

		wp_set_script_translations(
			'nso-admin',
			'network-style-override',
			NSO_PLUGIN_DIR . 'languages'
		);

		// Only enqueue CSS if it exists.
		$css_file = NSO_PLUGIN_DIR . 'build/index.css';
		if ( file_exists( $css_file ) ) {
			wp_enqueue_style(
				'nso-admin',
				NSO_PLUGIN_URL . 'build/index.css',
				[ 'wp-components' ],
				$asset['version'],
			);
		} else {
			// Just load wp-components styles.
			wp_enqueue_style( 'wp-components' );
		}

		wp_localize_script(
			'nso-admin',
			'nsoAdminData',
			[
				'restUrl'   => esc_url_raw( rest_url( 'nso/v1' ) ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'siteUrl'   => network_home_url( '/' ),
			],
		);
	}
}

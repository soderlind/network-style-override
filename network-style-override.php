<?php
/**
 * Plugin Name:       Network Style Override
 * Plugin URI:        https://github.com/soderlind/network-style-override
 * Description:       Network-wide CSS and theme.json overrides for WordPress Multisite. Enforces brand consistency across all subsites.
 * Version:           1.0.3
 * Author:            Per Søderlind
 * Author URI:        https://soderlind.no
 * Requires at least: 6.8
 * Tested up to:      7.0
 * Requires PHP:      8.3
 * Network:           true
 * Text Domain:       network-style-override
 * Domain Path:       /languages
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NSO_VERSION', '1.0.3' );
define( 'NSO_PLUGIN_FILE', __FILE__ );
define( 'NSO_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NSO_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Load autoloader only if plugin has its own vendor folder (standalone/zip install).
// When installed via Composer, the root project's autoloader handles everything.
$nso_autoloader = NSO_PLUGIN_DIR . 'vendor/autoload.php';
if ( file_exists( $nso_autoloader ) ) {
	require_once $nso_autoloader;

	// Initialize GitHub Updater for automatic updates (standalone installs only).
	\Soderlind\WordPress\GitHubUpdater::init(
		github_url:   'https://github.com/soderlind/network-style-override',
		plugin_file:  __FILE__,
		plugin_slug:  'network-style-override',
		name_regex:   '/network-style-override\.zip/',
		branch:       'main',
		check_period: 6,
	);
}

add_action( 'plugins_loaded', static function (): void {
	( new \NetworkStyleOverride\Plugin() )->init();
} );

<?php

declare( strict_types=1 );

namespace NetworkStyleOverride;

use NetworkStyleOverride\Admin\EditSiteScreen;
use NetworkStyleOverride\Admin\NetworkAdminPage;
use NetworkStyleOverride\Admin\RestController;
use NetworkStyleOverride\Override\CssOverride;
use NetworkStyleOverride\Override\ThemeJsonOverride;
use NetworkStyleOverride\Preview\PreviewHandler;
use NetworkStyleOverride\Service\EffectiveOverrideResolver;
use NetworkStyleOverride\Service\OverrideBundleService;
use NetworkStyleOverride\Service\ThemeCatalogService;
use NetworkStyleOverride\Storage\RevisionRepository;
use NetworkStyleOverride\Storage\SettingsRepository;

final class Plugin {

	public function init(): void {
		if ( ! is_multisite() ) {
			return;
		}

		// Load translations.
		load_plugin_textdomain(
			'network-style-override',
			false,
			dirname( plugin_basename( NSO_PLUGIN_FILE ) ) . '/languages'
		);

		// Migrate from old option keys (mos_* → nso_*) on first load.
		$this->maybe_migrate_options();

		// Storage layer.
		$settings  = new SettingsRepository();
		$revisions = new RevisionRepository( $settings );
		$preview   = new PreviewHandler( $settings );

		// Service layer (deep modules).
		$resolver      = new EffectiveOverrideResolver( $settings, $preview );
		$bundle        = new OverrideBundleService( $settings, $revisions, $preview );
		$theme_catalog = new ThemeCatalogService();

		// Override application (uses resolver for unified logic).
		( new CssOverride( $resolver ) )->register();
		( new ThemeJsonOverride( $resolver ) )->register();

		// REST API (thin adapter over services).
		( new RestController( $settings, $revisions, $bundle, $theme_catalog, $preview ) )->register();

		if ( is_admin() ) {
			( new NetworkAdminPage( $settings, $revisions, $preview ) )->register();
			( new EditSiteScreen( $settings ) )->register();
		}
	}

	/**
	 * Migrate options from old mos_* keys to new nso_* keys.
	 * Runs once on first load after plugin rename.
	 */
	private function maybe_migrate_options(): void {
		// Skip if already migrated or no old data exists.
		if ( get_site_option( 'nso_migrated' ) ) {
			return;
		}

		$migrations = [
			'mos_network_css'        => 'nso_network_css',
			'mos_network_theme_json' => 'nso_network_theme_json',
			'mos_exemptions'         => 'nso_exemptions',
			'mos_theme_overrides'    => 'nso_theme_overrides',
			'mos_css_revisions'      => 'nso_css_revisions',
		];

		$migrated = false;
		foreach ( $migrations as $old_key => $new_key ) {
			$old_value = get_site_option( $old_key, null );
			if ( $old_value !== null && get_site_option( $new_key ) === false ) {
				update_site_option( $new_key, $old_value );
				$migrated = true;
			}
		}

		// Mark migration complete.
		update_site_option( 'nso_migrated', true );

		if ( $migrated ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'Network Style Override: Migrated options from mos_* to nso_* keys.' );
		}
	}
}

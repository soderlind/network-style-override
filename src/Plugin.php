<?php

declare( strict_types=1 );

namespace MultisiteOverrideStyle;

use MultisiteOverrideStyle\Admin\EditSiteScreen;
use MultisiteOverrideStyle\Admin\NetworkAdminPage;
use MultisiteOverrideStyle\Admin\RestController;
use MultisiteOverrideStyle\Override\CssOverride;
use MultisiteOverrideStyle\Override\ThemeJsonOverride;
use MultisiteOverrideStyle\Preview\PreviewHandler;
use MultisiteOverrideStyle\Service\EffectiveOverrideResolver;
use MultisiteOverrideStyle\Service\OverrideBundleService;
use MultisiteOverrideStyle\Service\ThemeCatalogService;
use MultisiteOverrideStyle\Storage\RevisionRepository;
use MultisiteOverrideStyle\Storage\SettingsRepository;

final class Plugin {

	public function init(): void {
		if ( ! is_multisite() ) {
			return;
		}

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
}

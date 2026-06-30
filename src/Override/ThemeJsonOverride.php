<?php

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Override;

use MultisiteOverrideStyle\Service\EffectiveOverrideResolver;
use WP_Theme_JSON_Data;

/**
 * Merges the network theme.json override into the user (Global Styles) layer,
 * giving network values the highest priority in the theme.json resolution stack.
 *
 * Only applies to block themes. Classic themes (no theme.json) are skipped.
 */
final class ThemeJsonOverride {

	public function __construct(
		private readonly EffectiveOverrideResolver $resolver,
	) {}

	public function register(): void {
		add_filter( 'wp_theme_json_data_user', [ $this, 'merge' ] );
	}

	public function merge( WP_Theme_JSON_Data $theme_json ): WP_Theme_JSON_Data {
		// Skip if exempted or not a block theme.
		if ( $this->resolver->isCurrentSiteExempted() ) {
			return $theme_json;
		}

		if ( ! $this->resolver->activeThemeSupportsThemeJson() ) {
			return $theme_json;
		}

		$override = $this->resolver->getThemeJson();

		if ( ! empty( $override ) ) {
			$theme_json->update_with( $override );
		}

		return $theme_json;
	}
}

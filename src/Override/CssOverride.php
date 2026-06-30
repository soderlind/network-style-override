<?php

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Override;

use MultisiteOverrideStyle\Preview\PreviewHandler;
use MultisiteOverrideStyle\Storage\SettingsRepository;

/**
 * Enqueues the network CSS override as an inline <style> block on the front-end,
 * appended after all other stylesheets.
 */
final class CssOverride {

	public function __construct(
		private readonly SettingsRepository $settings,
		private readonly ExemptionChecker $exemption,
		private readonly PreviewHandler $preview,
	) {}

	public function register(): void {
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ], 9999 );
	}

	public function enqueue(): void {
		if ( $this->exemption->is_current_site_exempted() ) {
			return;
		}

		// Get global CSS.
		$css = $this->preview->is_active()
			? $this->preview->get_draft_css()
			: $this->settings->get_css();

		// Append theme-specific CSS (not in preview mode).
		if ( ! $this->preview->is_active() ) {
			$theme_slug = get_stylesheet();
			$theme_css  = $this->settings->get_theme_css( $theme_slug );
			if ( $theme_css !== '' ) {
				$css .= "\n/* Theme-specific: {$theme_slug} */\n" . $theme_css;
			}
		}

		if ( $css === '' ) {
			return;
		}

		// Register a dummy stylesheet with no src so we can attach inline CSS to it.
		wp_register_style( 'mos-override', false, [], MOS_VERSION );
		wp_enqueue_style( 'mos-override' );
		wp_add_inline_style( 'mos-override', $css );
	}
}

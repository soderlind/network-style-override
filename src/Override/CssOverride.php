<?php

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Override;

use MultisiteOverrideStyle\Service\EffectiveOverrideResolver;

/**
 * Enqueues the network CSS override as an inline <style> block on the front-end,
 * appended after all other stylesheets.
 */
final class CssOverride {

	public function __construct(
		private readonly EffectiveOverrideResolver $resolver,
	) {}

	public function register(): void {
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ], 9999 );
	}

	public function enqueue(): void {
		$css = $this->resolver->getCss();

		if ( $css === '' ) {
			return;
		}

		// Register a dummy stylesheet with no src so we can attach inline CSS to it.
		wp_register_style( 'mos-override', false, [], MOS_VERSION );
		wp_enqueue_style( 'mos-override' );
		wp_add_inline_style( 'mos-override', $css );
	}
}

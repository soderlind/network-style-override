<?php

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Override;

use MultisiteOverrideStyle\Service\EffectiveOverrideResolver;

/**
 * Enqueues the network CSS override as an inline <style> block on the front-end,
 * appended after all other stylesheets at the end of <head>.
 */
final class CssOverride {

	public function __construct(
		private readonly EffectiveOverrideResolver $resolver,
	) {}

	public function register(): void {
		// Use wp_head with high priority to print after all enqueued styles.
		add_action( 'wp_head', [ $this, 'print_styles' ], 9999 );
	}

	public function print_styles(): void {
		$css = $this->resolver->getCss();

		if ( $css === '' ) {
			return;
		}

		printf(
			"<style id=\"mos-override\">\n%s\n</style>\n",
			$css // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CSS is admin-controlled.
		);
	}
}

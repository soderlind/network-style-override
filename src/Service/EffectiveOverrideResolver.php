<?php
/**
 * EffectiveOverrideResolver — Deep module for resolving effective overrides.
 *
 * Unifies the logic for determining what CSS and theme.json apply to the current
 * request context. Handles exemption checks, preview vs live, and theme-specific
 * overrides in one place instead of duplicating across CssOverride and ThemeJsonOverride.
 *
 * @package MultisiteOverrideStyle
 */

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Service;

use MultisiteOverrideStyle\Preview\PreviewHandler;
use MultisiteOverrideStyle\Storage\SettingsRepository;

/**
 * Resolves the effective CSS and theme.json for the current request.
 *
 * Interface:
 *   isExempted(blog_id)       — Check if a site is exempted from overrides.
 *   isCurrentSiteExempted()   — Check if current site is exempted.
 *   resolveForCurrentSite()   — Get effective {css, theme_json} for current context.
 *   getCss()                  — Get effective CSS for current context.
 *   getThemeJson()            — Get effective theme.json for current context.
 */
final class EffectiveOverrideResolver {

	public function __construct(
		private readonly SettingsRepository $settings,
		private readonly PreviewHandler $preview,
	) {}

	/**
	 * Check if a specific site is exempted from overrides.
	 *
	 * @param int $blog_id Blog ID to check.
	 * @return bool True if exempted.
	 */
	public function isExempted( int $blog_id ): bool {
		return $this->settings->is_exempted( $blog_id );
	}

	/**
	 * Check if the current site is exempted from overrides.
	 *
	 * @return bool True if exempted.
	 */
	public function isCurrentSiteExempted(): bool {
		return $this->settings->is_exempted( (int) get_current_blog_id() );
	}

	/**
	 * Resolve effective CSS and theme.json for the current site.
	 *
	 * Returns null if site is exempted.
	 *
	 * @return array{css: string, theme_json: array<string, mixed>}|null
	 */
	public function resolveForCurrentSite(): ?array {
		if ( $this->isCurrentSiteExempted() ) {
			return null;
		}

		return [
			'css'        => $this->getCss(),
			'theme_json' => $this->getThemeJson(),
		];
	}

	/**
	 * Get effective CSS for current site.
	 *
	 * Combines global CSS with theme-specific CSS (unless in preview mode).
	 *
	 * @return string Combined CSS or empty string if exempted.
	 */
	public function getCss(): string {
		if ( $this->isCurrentSiteExempted() ) {
			return '';
		}

		// In preview mode, return only draft CSS.
		if ( $this->preview->is_active() ) {
			return $this->preview->get_draft_css();
		}

		// Get global CSS.
		$css = $this->settings->get_css();

		// Append theme-specific CSS.
		$theme_slug = get_stylesheet();
		$theme_css  = $this->settings->get_theme_css( $theme_slug );

		if ( $theme_css !== '' ) {
			$css .= "\n/* Theme-specific: {$theme_slug} */\n" . $theme_css;
		}

		return $css;
	}

	/**
	 * Get effective theme.json for current site.
	 *
	 * Merges global override with theme-specific override (unless in preview mode).
	 * Returns an array ready for use with WP_Theme_JSON_Data::update_with().
	 *
	 * @return array<string, mixed> Merged theme.json or empty array if exempted.
	 */
	public function getThemeJson(): array {
		if ( $this->isCurrentSiteExempted() ) {
			return [];
		}

		// In preview mode, return only draft theme.json.
		if ( $this->preview->is_active() ) {
			$draft = $this->preview->get_draft_theme_json();
			return $this->ensureVersion( $draft );
		}

		// Start with global override.
		$result = $this->settings->get_theme_json();

		// Merge theme-specific override on top.
		$theme_slug     = get_stylesheet();
		$theme_override = $this->settings->get_theme_json_for_theme( $theme_slug );

		if ( ! empty( $theme_override ) ) {
			$result = $this->deepMerge( $result, $theme_override );
		}

		return $this->ensureVersion( $result );
	}

	/**
	 * Check if the active theme supports theme.json (is a block theme).
	 *
	 * @return bool True if block theme with theme.json support.
	 */
	public function activeThemeSupportsThemeJson(): bool {
		$theme = wp_get_theme();
		$theme_json_file = $theme->get_stylesheet_directory() . '/theme.json';

		if ( file_exists( $theme_json_file ) ) {
			return true;
		}

		// Check parent theme.
		if ( $theme->parent() ) {
			$parent_json = $theme->parent()->get_stylesheet_directory() . '/theme.json';
			return file_exists( $parent_json );
		}

		return false;
	}

	/**
	 * Ensure theme.json has a version field.
	 *
	 * @param array<string, mixed> $theme_json Theme.json data.
	 * @return array<string, mixed> Theme.json with version.
	 */
	private function ensureVersion( array $theme_json ): array {
		if ( empty( $theme_json ) ) {
			return $theme_json;
		}

		if ( ! isset( $theme_json['version'] ) ) {
			$theme_json['version'] = 3;
		}

		return $theme_json;
	}

	/**
	 * Deep merge two theme.json arrays.
	 *
	 * @param array<string, mixed> $base    Base array.
	 * @param array<string, mixed> $overlay Overlay array (wins on conflicts).
	 * @return array<string, mixed> Merged array.
	 */
	private function deepMerge( array $base, array $overlay ): array {
		foreach ( $overlay as $key => $value ) {
			if ( is_array( $value ) && isset( $base[ $key ] ) && is_array( $base[ $key ] ) ) {
				// Check if it's a sequential array (list) vs associative array.
				if ( array_is_list( $value ) ) {
					// For lists, overlay replaces entirely.
					$base[ $key ] = $value;
				} else {
					// For associative arrays, recurse.
					$base[ $key ] = $this->deepMerge( $base[ $key ], $value );
				}
			} else {
				$base[ $key ] = $value;
			}
		}

		return $base;
	}
}

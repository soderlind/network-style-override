<?php
/**
 * ThemeCatalogService — Deep module for theme discovery and metadata.
 *
 * Provides a unified API for discovering network themes and fetching
 * original theme.json data from themes.
 *
 * @package MultisiteOverrideStyle
 */

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Service;

/**
 * Theme discovery and metadata service.
 *
 * Interface:
 *   getNetworkThemes()           — Get all themes active on at least one subsite.
 *   getOriginalThemeJson(slug)   — Get original theme.json from a theme file.
 *   themeExists(slug)            — Check if a theme exists.
 *   isBlockTheme(slug)           — Check if a theme is a block theme.
 */
final class ThemeCatalogService {

	/**
	 * Get all themes that are active on at least one subsite.
	 *
	 * @return array<int, array{slug: string, name: string, is_block_theme: bool}>
	 */
	public function getNetworkThemes(): array {
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
						'slug'           => $stylesheet,
						'name'           => $theme->get( 'Name' ),
						'is_block_theme' => $theme->is_block_theme(),
					];
				}
			}
			restore_current_blog();
		}

		return array_values( $themes );
	}

	/**
	 * Get the original theme.json from a theme's file.
	 *
	 * @param string $theme_slug Theme stylesheet slug.
	 * @return array{is_block_theme: bool, theme_json: array<string, mixed>}
	 */
	public function getOriginalThemeJson( string $theme_slug ): array {
		$theme = wp_get_theme( $theme_slug );

		if ( ! $theme->exists() ) {
			return [
				'is_block_theme' => false,
				'theme_json'     => [],
			];
		}

		$is_block_theme = $theme->is_block_theme();
		$theme_json     = [];

		// Try to read theme.json from theme directory.
		$theme_json_path = $theme->get_stylesheet_directory() . '/theme.json';
		if ( file_exists( $theme_json_path ) ) {
			$content  = file_get_contents( $theme_json_path );
			$decoded  = json_decode( $content, true );
			if ( is_array( $decoded ) ) {
				$theme_json = $decoded;
			}
		} elseif ( $theme->parent() ) {
			// Check parent theme.
			$parent_path = $theme->parent()->get_stylesheet_directory() . '/theme.json';
			if ( file_exists( $parent_path ) ) {
				$content  = file_get_contents( $parent_path );
				$decoded  = json_decode( $content, true );
				if ( is_array( $decoded ) ) {
					$theme_json = $decoded;
				}
			}
		}

		return [
			'is_block_theme' => $is_block_theme,
			'theme_json'     => $theme_json,
		];
	}

	/**
	 * Check if a theme exists.
	 *
	 * @param string $theme_slug Theme stylesheet slug.
	 * @return bool True if theme exists.
	 */
	public function themeExists( string $theme_slug ): bool {
		return wp_get_theme( $theme_slug )->exists();
	}

	/**
	 * Check if a theme is a block theme.
	 *
	 * @param string $theme_slug Theme stylesheet slug.
	 * @return bool True if block theme.
	 */
	public function isBlockTheme( string $theme_slug ): bool {
		$theme = wp_get_theme( $theme_slug );
		return $theme->exists() && $theme->is_block_theme();
	}
}

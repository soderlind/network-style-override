<?php

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Storage;

/**
 * Reads and writes the plugin's network-level settings in wp_sitemeta.
 *
 * Option keys:
 *   mos_network_css        — raw CSS string (global)
 *   mos_network_theme_json — JSON-encoded theme.json fragment (global)
 *   mos_exemptions         — JSON-encoded array of blog IDs (int[])
 *   mos_theme_overrides    — JSON-encoded per-theme overrides
 */
final class SettingsRepository {

	public const KEY_CSS             = 'mos_network_css';
	public const KEY_THEME_JSON      = 'mos_network_theme_json';
	public const KEY_EXEMPTIONS      = 'mos_exemptions';
	public const KEY_THEME_OVERRIDES = 'mos_theme_overrides';

	public function get_css(): string {
		return (string) get_site_option( self::KEY_CSS, '' );
	}

	public function save_css( string $css ): void {
		update_site_option( self::KEY_CSS, $css );
	}

	/**
	 * @return array<string, mixed>
	 */
	public function get_theme_json(): array {
		$raw = get_site_option( self::KEY_THEME_JSON, '{}' );
		$decoded = json_decode( (string) $raw, true );

		return is_array( $decoded ) ? $decoded : [];
	}

	/**
	 * @param array<string, mixed> $data
	 */
	public function save_theme_json( array $data ): void {
		update_site_option( self::KEY_THEME_JSON, wp_json_encode( $data ) );
	}

	/**
	 * @return int[]
	 */
	public function get_exemptions(): array {
		$raw = get_site_option( self::KEY_EXEMPTIONS, '[]' );
		$decoded = json_decode( (string) $raw, true );

		return is_array( $decoded ) ? array_map( 'intval', $decoded ) : [];
	}

	/**
	 * @param int[] $blog_ids
	 */
	public function save_exemptions( array $blog_ids ): void {
		update_site_option( self::KEY_EXEMPTIONS, wp_json_encode( array_values( array_map( 'intval', $blog_ids ) ) ) );
	}

	public function add_exemption( int $blog_id ): void {
		$ids = $this->get_exemptions();
		if ( ! in_array( $blog_id, $ids, true ) ) {
			$ids[] = $blog_id;
			$this->save_exemptions( $ids );
		}
	}

	public function remove_exemption( int $blog_id ): void {
		$ids = array_filter( $this->get_exemptions(), static fn( int $id ) => $id !== $blog_id );
		$this->save_exemptions( array_values( $ids ) );
	}

	public function is_exempted( int $blog_id ): bool {
		return in_array( $blog_id, $this->get_exemptions(), true );
	}

	/**
	 * Get all theme-specific overrides.
	 *
	 * @return array<string, array{css: string, theme_json: array<string, mixed>}>
	 */
	public function get_theme_overrides(): array {
		$raw = get_site_option( self::KEY_THEME_OVERRIDES, '{}' );
		$decoded = json_decode( (string) $raw, true );

		return is_array( $decoded ) ? $decoded : [];
	}

	/**
	 * Get CSS override for a specific theme.
	 */
	public function get_theme_css( string $theme_slug ): string {
		$overrides = $this->get_theme_overrides();
		return $overrides[ $theme_slug ]['css'] ?? '';
	}

	/**
	 * Get theme.json override for a specific theme.
	 *
	 * @return array<string, mixed>
	 */
	public function get_theme_json_for_theme( string $theme_slug ): array {
		$overrides = $this->get_theme_overrides();
		return $overrides[ $theme_slug ]['theme_json'] ?? [];
	}

	/**
	 * Save overrides for a specific theme.
	 *
	 * @param array<string, mixed> $theme_json
	 */
	public function save_theme_override( string $theme_slug, string $css, array $theme_json ): void {
		$overrides = $this->get_theme_overrides();
		$overrides[ $theme_slug ] = [
			'css'        => $css,
			'theme_json' => $theme_json,
		];
		update_site_option( self::KEY_THEME_OVERRIDES, wp_json_encode( $overrides ) );
	}

	/**
	 * Delete overrides for a specific theme.
	 */
	public function delete_theme_override( string $theme_slug ): void {
		$overrides = $this->get_theme_overrides();
		unset( $overrides[ $theme_slug ] );
		update_site_option( self::KEY_THEME_OVERRIDES, wp_json_encode( $overrides ) );
	}

	public function delete_all(): void {
		delete_site_option( self::KEY_CSS );
		delete_site_option( self::KEY_THEME_JSON );
		delete_site_option( self::KEY_EXEMPTIONS );
		delete_site_option( self::KEY_THEME_OVERRIDES );
	}
}

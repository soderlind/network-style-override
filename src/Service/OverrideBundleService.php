<?php
/**
 * OverrideBundleService — Deep module owning the canonical interface for network overrides.
 *
 * Provides a unified API for load, save, import, export, and preview operations.
 * All bundle semantics (what settings travel together, payload shape, save ordering)
 * are concentrated here instead of scattered across controllers and UI.
 *
 * @package MultisiteOverrideStyle
 */

declare( strict_types=1 );

namespace MultisiteOverrideStyle\Service;

use MultisiteOverrideStyle\Preview\PreviewHandler;
use MultisiteOverrideStyle\Storage\RevisionRepository;
use MultisiteOverrideStyle\Storage\SettingsRepository;

/**
 * Deep module for network override bundle operations.
 *
 * Interface:
 *   load()                         — Get current bundle (css, theme_json, exemptions, theme_overrides).
 *   save(bundle, user_id)          — Save bundle atomically (creates revision first).
 *   import(bundle, user_id)        — Import a bundle from external source.
 *   export()                       — Export current settings as portable bundle.
 *   createPreview(css, theme_json) — Create draft preview, returns token.
 *   discardPreview(token)          — Discard a draft preview.
 */
final class OverrideBundleService {

	public function __construct(
		private readonly SettingsRepository $settings,
		private readonly RevisionRepository $revisions,
		private readonly PreviewHandler $preview,
	) {}

	/**
	 * Load current bundle.
	 *
	 * @return array{
	 *   css: string,
	 *   theme_json: array<string, mixed>,
	 *   exemptions: int[],
	 *   theme_overrides: array<string, array{css: string, theme_json: array<string, mixed>}>
	 * }
	 */
	public function load(): array {
		return [
			'css'             => $this->settings->get_css(),
			'theme_json'      => $this->settings->get_theme_json(),
			'exemptions'      => $this->settings->get_exemptions(),
			'theme_overrides' => $this->settings->get_theme_overrides(),
		];
	}

	/**
	 * Load global settings only (css, theme_json, exemptions).
	 *
	 * @return array{css: string, theme_json: array<string, mixed>, exemptions: int[]}
	 */
	public function loadGlobal(): array {
		return [
			'css'        => $this->settings->get_css(),
			'theme_json' => $this->settings->get_theme_json(),
			'exemptions' => $this->settings->get_exemptions(),
		];
	}

	/**
	 * Save global settings (creates a revision first).
	 *
	 * @param string               $css        Global CSS override.
	 * @param array<string, mixed> $theme_json Global theme.json override.
	 * @param int                  $user_id    User performing the save.
	 * @return array{css: string, theme_json: array<string, mixed>, exemptions: int[]}
	 */
	public function saveGlobal( string $css, array $theme_json, int $user_id ): array {
		// Snapshot current state before overwriting.
		$this->revisions->snapshot( $user_id );

		$this->settings->save_css( $css );
		$this->settings->save_theme_json( $theme_json );

		return $this->loadGlobal();
	}

	/**
	 * Save a theme-specific override.
	 *
	 * @param string               $theme_slug Theme stylesheet slug.
	 * @param string               $css        Theme-specific CSS.
	 * @param array<string, mixed> $theme_json Theme-specific theme.json.
	 */
	public function saveThemeOverride( string $theme_slug, string $css, array $theme_json ): void {
		$this->settings->save_theme_override( $theme_slug, $css, $theme_json );
	}

	/**
	 * Delete a theme-specific override.
	 *
	 * @param string $theme_slug Theme stylesheet slug.
	 */
	public function deleteThemeOverride( string $theme_slug ): void {
		$this->settings->delete_theme_override( $theme_slug );
	}

	/**
	 * Export current settings as a portable bundle.
	 *
	 * @return array{
	 *   version: string,
	 *   exported: string,
	 *   css: string,
	 *   theme_json: array<string, mixed>,
	 *   exemptions: int[],
	 *   theme_overrides: array<string, array{css: string, theme_json: array<string, mixed>}>
	 * }
	 */
	public function export(): array {
		return [
			'version'         => MOS_VERSION,
			'exported'        => gmdate( 'c' ),
			'css'             => $this->settings->get_css(),
			'theme_json'      => $this->settings->get_theme_json(),
			'exemptions'      => $this->settings->get_exemptions(),
			'theme_overrides' => $this->settings->get_theme_overrides(),
		];
	}

	/**
	 * Import a bundle (creates a revision of current state first).
	 *
	 * @param string                                                                         $css             Global CSS.
	 * @param array<string, mixed>                                                           $theme_json      Global theme.json.
	 * @param int[]                                                                          $exemptions      Blog IDs to exempt.
	 * @param array<string, array{css?: string, theme_json?: array<string, mixed>}>|null    $theme_overrides Per-theme overrides.
	 * @param int                                                                            $user_id         User performing import.
	 * @return array{css: string, theme_json: array<string, mixed>, exemptions: int[]}
	 */
	public function import(
		string $css,
		array $theme_json,
		array $exemptions,
		?array $theme_overrides,
		int $user_id
	): array {
		// Snapshot current state before overwriting.
		$this->revisions->snapshot( $user_id );

		$this->settings->save_css( $css );
		$this->settings->save_theme_json( $theme_json );
		$this->settings->save_exemptions( $exemptions );

		// Import theme overrides if provided.
		if ( is_array( $theme_overrides ) ) {
			foreach ( $theme_overrides as $slug => $override ) {
				if ( is_array( $override ) ) {
					$override_css        = $override['css'] ?? '';
					$override_theme_json = $override['theme_json'] ?? [];
					$this->settings->save_theme_override(
						(string) $slug,
						(string) $override_css,
						(array) $override_theme_json
					);
				}
			}
		}

		return $this->loadGlobal();
	}

	/**
	 * Create a preview draft.
	 *
	 * @param string               $css        CSS to preview.
	 * @param array<string, mixed> $theme_json theme.json to preview.
	 * @param string               $site_url   Optional base URL for preview.
	 * @return array{token: string, preview_url: string}
	 */
	public function createPreview( string $css, array $theme_json, string $site_url = '' ): array {
		$token = $this->preview->create_draft( $css, $theme_json );

		$base_url    = $site_url !== '' ? $site_url : network_home_url( '/' );
		$preview_url = add_query_arg( 'mos_preview', $token, $base_url );

		return [
			'token'       => $token,
			'preview_url' => $preview_url,
		];
	}

	/**
	 * Discard a preview draft.
	 *
	 * @param string $token Preview token.
	 */
	public function discardPreview( string $token ): void {
		$this->preview->discard_draft( $token );
	}
}

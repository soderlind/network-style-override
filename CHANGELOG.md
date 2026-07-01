# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-07-01

### Added

- Add clickable link from "exempted sites" text to Sites tab.

## [1.0.2] - 2026-07-01

### Fixed

- Include build assets in repository for Composer installs.

## [1.0.1] - 2026-07-01

### Fixed

- Fix Composer install: conditionally load autoloader only when vendor folder exists.

## [1.0.0] - 2026-07-01

### Added

- Composer installation instructions in README.
- Keywords to composer.json for package discoverability.

### Fixed

- Rename `mosAdminData` to `nsoAdminData` for namespace consistency.

## [0.7.1] - 2026-06-30

### Fixed

- Update JS container ID to match PHP (mos-admin-app → nso-admin-app).

## [0.7.0] - 2026-06-30

### Changed (BREAKING)

- Renamed plugin from "Multisite Override Style" to "Network Style Override".
- Changed PHP namespace from `MultisiteOverrideStyle` to `NetworkStyleOverride`.
- Changed REST namespace from `mos/v1` to `nso/v1`.
- Changed option keys from `mos_*` to `nso_*`.
- Changed CSS/script handles from `mos-*` to `nso-*`.

### Added

- Automatic migration for existing `mos_*` options to `nso_*` keys on first load.

## [0.6.1] - 2026-06-30

### Fixed

- CSS override now prints at the end of <head> for proper cascade order.

## [0.6.0] - 2026-06-30

### Changed

- Introduce deep module architecture (EffectiveOverrideResolver, OverrideBundleService, ThemeCatalogService, useThemeOverrideDraft hook).

## [0.5.1] - 2026-06-30

### Changed

- Remove delete buttons from theme.json visual editor.

### Added

- Add screenshot.

## [0.5.0] - 2026-06-30

### Added

- REST endpoint to fetch original theme.json from active theme (`GET /nso/v1/theme-json/{slug}`).
- Auto-load theme presets (colors, fonts, spacing) when selecting a theme in Theme Overrides.
- "Reset to theme defaults" button in Theme Overrides to restore original theme values.

### Changed

- Remove global theme.json tab; theme.json overrides are now per-theme only (in Theme Overrides tab).
- Theme preset names and identifiers are now read-only; only values can be modified.
- Add column headers to visual editor fields for cleaner layout.
- Improve font size "Aa" preview with dark background for better visibility.
- Change field descriptions from "Define..." to "Override..." for clarity.

## [0.4.3] - 2026-06-30

### Added

- Norwegian Bokmål (nb_NO) translations.

### Changed

- Improved theme.json visual editor UX: clearer labels ("Display Name", "Identifier"), contextual help text, auto-generated identifiers from names.
- Removed global theme.json tab; theme.json overrides are now per-theme only (in Theme Overrides tab).
- Theme presets (colors, fonts, spacing) loaded from the active theme are now read-only; only values can be modified.
- Added column headers to visual editor fields for cleaner layout.
- Improved "Aa" font size preview visibility with dark background.

## [0.4.2] - 2026-06-30

### Changed

- Refactor: Unified Save button now saves theme overrides with global settings.

## [0.4.1] - 2026-06-30

### Fixed

- Add `__next40pxDefaultSize` to SelectControl for WP 7.1 compatibility.
- Hide global Save/Preview buttons on Theme Overrides tab.
- Make CSS enqueue conditional, support multiple hook name variants.

### Added

- WP-CLI acceptance tests with class loading verification.

## [0.4.0] - 2026-06-30

### Added

- **Theme-specific overrides**: Add CSS and theme.json overrides that apply only to specific themes. These are applied after the global overrides, allowing theme-specific customizations while maintaining network-wide brand consistency.
- New "Theme Overrides" tab in admin UI with theme selector dropdown.
- REST API endpoints: `GET /network-themes`, `GET/POST/DELETE /theme-overrides/{slug}`.
- Theme overrides included in export/import functionality.

## [0.3.2] - 2026-06-30

### Fixed

- Fix dependency vulnerabilities (update @wordpress/scripts, add npm overrides).

## [0.3.1] - 2026-06-30

### Fixed

- Fix GitHub Actions: Update Node.js to 24, pin actions with SHA hashes, add package-lock.json.

## [0.3.0] - 2026-06-30

### Added

- GitHub updater for automatic plugin updates from GitHub releases.
- GitHub Actions workflows for release builds.
- Issue templates (bug report, feature request).

### Changed

- Updated installation guide with GitHub release instructions.


- JSON export/import for dev → staging → production promotion
- Full `uninstall.php` cleanup of all `wp_sitemeta` keys
- Unit tests with PHPUnit 11 and Brain Monkey
- React admin UI built with `@wordpress/scripts` and `@wordpress/components`

### Security

- All endpoints require `manage_network` capability
- Nonce verification on Edit Site screen form
- Preview token validated against transient and requires `manage_network`

[Unreleased]: https://github.com/soderlind/network-style-override/compare/0.4.2...HEAD
[0.4.2]: https://github.com/soderlind/network-style-override/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/soderlind/network-style-override/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/soderlind/network-style-override/compare/0.3.2...0.4.0
[0.3.2]: https://github.com/soderlind/network-style-override/compare/0.3.1...0.3.2
[0.3.1]: https://github.com/soderlind/network-style-override/compare/0.3.0...0.3.1
[0.3.0]: https://github.com/soderlind/network-style-override/releases/tag/0.3.0
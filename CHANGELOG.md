# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.3] - 2026-06-30

### Added

- Norwegian Bokmål (nb_NO) translations.

### Changed

- Improved theme.json visual editor UX: clearer labels ("Display Name", "Identifier"), contextual help text, auto-generated identifiers from names.

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

[Unreleased]: https://github.com/soderlind/multisite-override-style/compare/0.4.2...HEAD
[0.4.2]: https://github.com/soderlind/multisite-override-style/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/soderlind/multisite-override-style/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/soderlind/multisite-override-style/compare/0.3.2...0.4.0
[0.3.2]: https://github.com/soderlind/multisite-override-style/compare/0.3.1...0.3.2
[0.3.1]: https://github.com/soderlind/multisite-override-style/compare/0.3.0...0.3.1
[0.3.0]: https://github.com/soderlind/multisite-override-style/releases/tag/0.3.0
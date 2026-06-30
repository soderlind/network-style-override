# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

## [0.2.0] - 2026-06-30

### Changed

- Move admin menu from Settings to Themes in Network Admin

### Fixed

- Fix REST controller registration to work outside admin context

## [1.0.0] - 2026-06-30

### Added

- Network-wide CSS override with CodeMirror editor
- Network-wide `theme.json` override with visual fields (color palette, typography, spacing, border) and raw JSON editor
- Deep-merge into the user (Global Styles) layer via `wp_theme_json_data_user` hook
- CSS appended after all theme stylesheets (priority 9999)
- Per-site exemption management (network admin only)
- Exemption toggle on Network Admin → Sites → Edit Site screen
- Last 10 revisions with one-click restore
- "Preview on site" with transient-backed draft state
- JSON export/import for dev → staging → production promotion
- Full `uninstall.php` cleanup of all `wp_sitemeta` keys
- Unit tests with PHPUnit 11 and Brain Monkey
- React admin UI built with `@wordpress/scripts` and `@wordpress/components`

### Security

- All endpoints require `manage_network` capability
- Nonce verification on Edit Site screen form
- Preview token validated against transient and requires `manage_network`

[Unreleased]: https://github.com/example/multisite-override-style/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/example/multisite-override-style/releases/tag/v1.0.0

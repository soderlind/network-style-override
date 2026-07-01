=== Network Style Override ===
Contributors: soderlind
Tags: multisite, network, css, theme.json, branding, global styles
Requires at least: 6.8
Tested up to: 7.0
Requires PHP: 8.3
Stable tag: 1.0.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Enforce network-wide CSS and theme.json overrides across all subsites in a WordPress Multisite installation.

== Description ==

**Network Style Override** gives network administrators centralized control over front-end styling across every subsite. Define CSS rules and `theme.json` values once, and they're automatically applied network-wide — ensuring brand consistency without touching individual site themes.

= Key Features =

* **CSS Override** — Write custom CSS in a CodeMirror editor. Styles are appended after all theme stylesheets, giving your rules the final say.
* **Theme Overrides** — Per-theme CSS and theme.json overrides. Set colors, typography, spacing, and border defaults via a visual UI or raw JSON. Values are deep-merged into the Global Styles layer.
* **Per-Site Exemptions** — Exempt specific subsites from overrides when needed (network admin only).
* **Revision History** — Last 10 saves are kept. One-click restore with automatic backup of current settings.
* **Preview Before Publish** — Preview changes on a live subsite before saving.
* **Import / Export** — Move settings between environments (dev → staging → production) with a single JSON file.
* **Block Theme Aware** — `theme.json` overrides apply only to block themes; classic themes receive CSS overrides only.

= Requirements =

* WordPress Multisite installation
* WordPress 6.8 or higher
* PHP 8.3 or higher
* Network activation (plugin cannot be activated per-site)

== Installation ==

= From GitHub Release (recommended) =

1. Download the latest `network-style-override.zip` from the [GitHub Releases page](https://github.com/soderlind/network-style-override/releases).
2. Go to **Network Admin → Plugins → Add New → Upload Plugin** and upload the zip file.
3. Click **Network Activate**.
4. Navigate to **Network Admin → Themes → Override Style** to configure.

The plugin includes automatic updates — you'll receive update notifications in WordPress just like plugins from wordpress.org.

= Manual Installation =

1. Upload the `network-style-override` folder to `/wp-content/plugins/`.
2. Go to **Network Admin → Plugins** and click **Network Activate**.
3. Navigate to **Network Admin → Themes → Override Style** to configure.

== Frequently Asked Questions ==

= Can site admins opt their own sites out? =

No. Only network administrators can exempt sites. This ensures network-wide brand consistency cannot be bypassed by individual site admins.

= What happens on classic (non-block) themes? =

Classic themes receive only the CSS override. The `theme.json` override is skipped because classic themes don't support Global Styles.

= Where is the data stored? =

All settings are stored in `wp_sitemeta` using `get_site_option()` / `update_site_option()`. No custom database tables are created.

= What happens when I uninstall the plugin? =

All plugin data is removed from `wp_sitemeta`, including CSS, theme.json values, exemptions, and revision history.

= Can I preview changes before saving? =

Yes. Click **Preview on site** to open a new tab with your unsaved changes applied. The preview uses a temporary draft that expires after one hour.

== Screenshots ==

1. CSS editor with CodeMirror syntax highlighting
2. Theme Overrides with visual theme.json editor (color palette, typography, spacing, borders)
3. Raw JSON editor for advanced users
4. Site exemption list with search and toggles
5. Revision history with one-click restore

== Changelog ==

= 1.0.4 =
* Fix: Translation loading with load_plugin_textdomain and wp_set_script_translations.
* Fix: Add missing Norwegian (nb_NO) translations.

= 1.0.3 =
* Add: Clickable link from "exempted sites" text to Sites tab.

= 1.0.2 =
* Fix: Include build assets in repository for Composer installs.

= 1.0.1 =
* Fix: Composer install compatibility — conditionally load autoloader only when vendor folder exists.

= 1.0.0 =
* Add: Composer installation instructions in README.
* Add: Keywords to composer.json for package discoverability.
* Fix: Rename mosAdminData to nsoAdminData for namespace consistency.

= 0.7.1 =
* Fix: Update JS container ID to match PHP (mos-admin-app → nso-admin-app).

= 0.7.0 =
* BREAKING: Renamed plugin from "Multisite Override Style" to "Network Style Override".
* BREAKING: Changed PHP namespace from MultisiteOverrideStyle to NetworkStyleOverride.
* BREAKING: Changed REST namespace from mos/v1 to nso/v1.
* BREAKING: Changed option keys from mos_* to nso_*.
* BREAKING: Changed CSS/script handles from mos-* to nso-*.
* Add: Automatic migration for existing mos_* options to nso_* keys on first load.

= 0.6.1 =
* Fix: CSS override now prints at the end of <head> for proper cascade order.

= 0.6.0 =
* Change: Introduce deep module architecture (EffectiveOverrideResolver, OverrideBundleService, ThemeCatalogService, useThemeOverrideDraft hook).

= 0.5.1 =
* Change: Remove delete buttons from theme.json visual editor.
* Add: Screenshot.

= 0.5.0 =
* Add: REST endpoint to fetch original theme.json from active theme.
* Add: Auto-load theme presets when selecting a theme in Theme Overrides.
* Add: "Reset to theme defaults" button in Theme Overrides.
* Change: Remove global theme.json tab; theme.json overrides are now per-theme only.
* Change: Theme preset names and identifiers are now read-only; only values can be modified.
* Change: Add column headers to visual editor fields for cleaner layout.
* Change: Improve font size "Aa" preview with dark background.
* Change: Field descriptions now use "Override" instead of "Define" for clarity.

= 0.4.3 =
* Add: Norwegian Bokmål (nb_NO) translations.
* Change: Improved theme.json visual editor UX with clearer labels, contextual help text, auto-generated identifiers.
* Change: Removed global theme.json tab; theme.json overrides are now per-theme only (in Theme Overrides tab).
* Change: Theme presets (colors, fonts, spacing) are now read-only; only values can be modified.

= 0.4.2 =
* Refactor: Unified Save button now saves theme overrides with global settings.

= 0.4.1 =
* Fix: Add __next40pxDefaultSize to SelectControl for WP 7.1 compatibility.
* Fix: Hide global Save/Preview buttons on Theme Overrides tab.
* Fix: Make CSS enqueue conditional, support multiple hook names.
* Add: WP-CLI acceptance tests with class loading verification.

= 0.4.0 =
* Add: Theme-specific overrides - CSS and theme.json overrides that apply only to specific themes.
* Add: New "Theme Overrides" tab in admin UI with theme selector dropdown.
* Add: REST API endpoints for network themes and theme overrides.
* Add: Theme overrides included in export/import functionality.

= 0.3.2 =
* Fix dependency vulnerabilities (update @wordpress/scripts, add npm overrides).

= 0.3.1 =
* Fix GitHub Actions: Update Node.js to 24, pin actions with SHA hashes, add package-lock.json.

= 0.3.0 =
* Add GitHub updater for automatic plugin updates from GitHub releases.
* Add GitHub Actions workflows for release builds.
* Add issue templates (bug report, feature request).
* Update installation guide with GitHub release instructions.

= 0.2.0 =
* Move admin menu from Settings to Themes in Network Admin
* Fix REST controller registration to work outside admin context

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.0.0 =
Initial release of Network Style Override.

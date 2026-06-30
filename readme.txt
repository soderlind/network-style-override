=== Multisite Override Style ===
Contributors: soderlind
Tags: multisite, network, css, theme.json, branding, global styles
Requires at least: 6.8
Tested up to: 7.0
Requires PHP: 8.3
Stable tag: 0.4.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Enforce network-wide CSS and theme.json overrides across all subsites in a WordPress Multisite installation.

== Description ==

**Multisite Override Style** gives network administrators centralized control over front-end styling across every subsite. Define CSS rules and `theme.json` values once, and they're automatically applied network-wide — ensuring brand consistency without touching individual site themes.

= Key Features =

* **CSS Override** — Write custom CSS in a CodeMirror editor. Styles are appended after all theme stylesheets, giving your rules the final say.
* **theme.json Override** — Set colors, typography, spacing, and border defaults via a visual UI or raw JSON. Values are deep-merged into the Global Styles layer.
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

1. Download the latest `multisite-override-style.zip` from the [GitHub Releases page](https://github.com/soderlind/multisite-override-style/releases).
2. Go to **Network Admin → Plugins → Add New → Upload Plugin** and upload the zip file.
3. Click **Network Activate**.
4. Navigate to **Network Admin → Themes → Override Style** to configure.

The plugin includes automatic updates — you'll receive update notifications in WordPress just like plugins from wordpress.org.

= Manual Installation =

1. Upload the `multisite-override-style` folder to `/wp-content/plugins/`.
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
2. Visual theme.json editor (color palette, typography, spacing, borders)
3. Raw JSON editor for advanced users
4. Site exemption list with search and toggles
5. Revision history with one-click restore

== Changelog ==

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
Initial release of Multisite Override Style.

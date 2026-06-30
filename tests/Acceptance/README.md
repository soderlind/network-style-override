# Acceptance Tests

Acceptance tests for Multisite Override Style plugin using WP-CLI.

## Prerequisites

- WP-CLI installed and in PATH
- Local by Flywheel (or other local WordPress setup) running
- Plugin network-activated on a multisite installation

## Running Tests

```bash
# From plugin directory
composer test:acceptance

# With custom URL
./tests/Acceptance/run-acceptance-tests.sh --url=http://your-site.local/

# Or directly with bash
bash tests/Acceptance/run-acceptance-tests.sh http://plugins.local/
```

## Test Coverage

The acceptance tests verify:

1. **Prerequisites** - WP-CLI, WordPress connection, multisite, plugin activation
2. **REST API Endpoints** - `/settings`, `/network-themes`, `/theme-overrides`
3. **CSS Override** - Save and retrieve global CSS
4. **Theme JSON Override** - Save and retrieve global theme.json
5. **Theme-Specific Overrides** - Per-theme CSS and theme.json overrides
6. **Site Exemptions** - Add/remove site exemptions
7. **Export/Import** - Full settings export including theme overrides
8. **WordPress Hooks** - `wp_enqueue_scripts`, `wp_theme_json_data_user`

## Example Output

```
Multisite Override Style - Acceptance Tests
Site: http://plugins.local/

━━━ Prerequisites ━━━
✓ PASS: WP-CLI available
✓ PASS: WordPress connection OK (7.0)
✓ PASS: Multisite detected
✓ PASS: Plugin multisite-overide-style is active

━━━ REST API Endpoints ━━━
✓ PASS: GET /mos/v1/settings returns expected fields
✓ PASS: GET /mos/v1/network-themes returns array
✓ PASS: GET /mos/v1/theme-overrides returns object

━━━ CSS Override ━━━
✓ PASS: CSS saved and retrieved correctly

━━━ Theme JSON Override ━━━
✓ PASS: theme.json saved and retrieved correctly

━━━ Theme-Specific Overrides ━━━
✓ PASS: Theme-specific CSS saved correctly
✓ PASS: Theme-specific theme.json saved correctly
✓ PASS: Theme override deleted correctly

━━━ Site Exemptions ━━━
✓ PASS: Site exemption added correctly
✓ PASS: Site exemption removed correctly

━━━ Export/Import ━━━
✓ PASS: Export includes all data including theme_overrides

━━━ WordPress Hooks ━━━
✓ PASS: wp_enqueue_scripts hook registered
✓ PASS: wp_theme_json_data_user filter registered

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Passed:  17
  Failed:  0
  Skipped: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

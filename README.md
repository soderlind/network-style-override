# Multisite Override Style

Network-wide CSS and `theme.json` overrides for WordPress Multisite. Enforce brand consistency across all subsites from a single admin panel.

## Features

- **CSS Override** — CodeMirror editor, appended after all theme stylesheets (priority 9999)
- **Theme Overrides** — Per-theme CSS and theme.json overrides with visual fields (colors, typography, spacing, borders) + raw JSON editor
- **Deep Merge** — Values merged into the Global Styles (user) layer via `wp_theme_json_data_user`
- **Per-Site Exemptions** — Network admin can exempt individual sites
- **Revision History** — Last 10 saves with one-click restore
- **Preview** — Test changes on a live site before saving
- **Import / Export** — JSON bundle for dev → staging → production promotion
- **Block Theme Aware** — `theme.json` applies to block themes only; classic themes get CSS only

## Requirements

- WordPress Multisite 6.8+
- PHP 8.3+
- Network activation only

## Installation

### From GitHub Release (recommended)

1. Download the latest `multisite-override-style.zip` from [Releases](https://github.com/soderlind/multisite-override-style/releases)
2. Upload via **Network Admin → Plugins → Add New → Upload Plugin**
3. **Network Activate** from Network Admin → Plugins

The plugin includes automatic updates — you'll see new versions in WordPress like any other plugin.

### For Development

```bash
cd wp-content/plugins
git clone https://github.com/soderlind/multisite-override-style.git
cd multisite-override-style
composer install
npm install && npm run build
```

Then **Network Activate** from Network Admin → Plugins.

## Usage

Navigate to **Network Admin → Themes → Override Style**.

| Tab | Purpose |
|-----|---------|
| CSS | Raw CSS editor (CodeMirror) |
| Theme Overrides | Per-theme CSS + theme.json (Visual fields + Raw JSON) |
| Sites | Per-site exemption toggles |
| History | Revision list with restore |
| Import / Export | JSON download/upload |

## Development

```bash
# Start dev server (hot reload)
npm run start

# Production build
npm run build

# Run PHP tests
composer test

# Lint JS
npm run lint:js
```

### Project Structure

```text
├── multisite-override-style.php   # Plugin bootstrap
├── src/
│   ├── Plugin.php                 # Hook wiring
│   ├── Admin/                     # Network admin page, REST API, Edit Site screen
│   ├── Override/                  # CSS + theme.json injection
│   ├── Preview/                   # Transient-backed draft preview
│   └── Storage/                   # Settings + Revisions repositories
├── resources/js/
│   ├── index.jsx                  # React entry
│   ├── api.js                     # REST client
│   └── components/                # React UI
├── build/                         # Compiled assets
├── languages/                     # POT file
└── tests/                         # PHPUnit + Brain Monkey
```

### Hooks

| Hook | Type | Description |
|------|------|-------------|
| `wp_theme_json_data_user` | Filter | Merges network `theme.json` override |
| `wp_enqueue_scripts` (9999) | Action | Enqueues network CSS override |

### REST API

All endpoints require `manage_network` capability.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wp-json/mos/v1/settings` | Current CSS, theme.json, exemptions |
| POST | `/wp-json/mos/v1/settings` | Save settings (creates revision) |
| GET | `/wp-json/mos/v1/revisions` | List last 10 revisions |
| POST | `/wp-json/mos/v1/revisions/{id}/restore` | Restore a revision |
| GET | `/wp-json/mos/v1/sites` | All sites with exemption status |
| POST | `/wp-json/mos/v1/sites/{id}/exemption` | Toggle exemption |
| POST | `/wp-json/mos/v1/preview` | Create draft, returns preview URL |
| DELETE | `/wp-json/mos/v1/preview/{token}` | Discard draft |
| GET | `/wp-json/mos/v1/export` | Download settings bundle |
| POST | `/wp-json/mos/v1/import` | Import settings bundle |

## License

GPL-2.0-or-later

## Author

[Per Søderlind](https://soderlind.no)

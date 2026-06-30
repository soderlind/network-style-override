# Domain Model — Multisite Override Style

## Glossary

**Network Override**
The authoritative set of CSS rules defined by a network admin that apply across all subsites in the multisite installation. The Network Override is the source of truth; subsite settings cannot supersede it except via an explicit Exemption.

**CSS Override**
The CSS portion of the Network Override. Delivered as an inline `<style>` block, enqueued after all other stylesheets on the front-end. Applies to all subsites regardless of theme type.

**Theme Override**
A per-theme combination of CSS and `theme.json` values. Each theme can have its own override that is applied after the global CSS override. Allows theme-specific customizations while maintaining network-wide brand consistency.

**theme.json Override**
The structured `theme.json` portion of a Theme Override. Deep-merged into the `user` layer via `wp_theme_json_data_user`, so network values win over the active theme's `theme.json` and WordPress defaults. Applies to block-theme subsites only. Theme presets (colors, fonts, spacing) from the active theme are loaded as read-only; only values can be modified.

**Block Theme**
A WordPress theme that ships a `theme.json` file and uses the block editor as its primary layout mechanism. The `theme.json` Override applies only to block themes. If a block theme has no `theme.json`, the plugin synthesises one entirely from the network override values.

**Classic Theme**
A WordPress theme that does not ship a `theme.json` file. Only the CSS Override applies to classic-theme subsites; no `theme.json` injection is attempted.

**Exemption**
A per-site flag, set exclusively by a network admin, that excludes a specific subsite from receiving the Network Override. Exempted sites load no override CSS and no `theme.json` merge. Stored as a list of blog IDs in `wp_sitemeta`.

**Draft Override**
A temporary, unsaved copy of the Network Override stored in a transient. Created when the network admin clicks "Preview on site". Discarded automatically on expiry or when the admin discards it. Never applied to production traffic.

**Revision**
A historical snapshot of a saved Network Override (CSS + `theme.json` values + opted-out site list). The plugin retains the last 10 revisions. Each revision is immutable once written. A network admin can restore any revision, which creates a new save (and new revision) rather than mutating history.

**Visual Fields**
The structured form controls in the Network Admin UI for editing common `theme.json` values without writing raw JSON. In scope for v1: color palette, typography (font families, font size presets), spacing scale, and border defaults (border radius, border width).

**Raw JSON Tab**
The CodeMirror-powered JSON editor tab in the Network Admin UI. Accepts any valid `theme.json` fragment. Takes precedence over Visual Fields on save — the two are merged, with Raw JSON winning on key conflicts.

**Network Admin UI**
The React (`@wordpress/components`) single-page interface mounted in the WordPress Network Admin. Contains: CSS editor (CodeMirror), Theme Overrides (per-theme CSS and `theme.json` with Visual Fields + Raw JSON), Exemption list, Revision history, Import/Export controls, and Preview button.

**Exemption List**
The full-network view within the Network Admin UI showing all subsites with a toggle per site. Writes to the same underlying `wp_sitemeta` key as the Edit Site checkbox.

**Edit Site Checkbox**
A checkbox added to the existing Network Admin → Sites → Edit Site screen. Toggles the Exemption for that specific subsite. Reads and writes the same data as the Exemption List.

**Import/Export Bundle**
A single JSON file containing the current CSS Override text, `theme.json` override values, and the list of exempted blog IDs. Produced by the "Export settings" action. Consumed by the "Import settings" upload with an explicit confirmation step before applying.

## Invariants

- Only users with the `manage_network` capability can read or write any plugin setting.
- A subsite cannot exempt itself; only a network admin can create or remove an Exemption.
- The plugin only activates network-wide (`Network: true`); per-site activation is not supported.
- Deactivating the plugin preserves all stored data. Uninstalling removes all `wp_sitemeta` keys created by the plugin.
- The Draft Override is never persisted to `wp_sitemeta`; it exists only in a transient.
- Revisions are append-only. Restoring a Revision creates a new Revision; it does not delete existing ones.
- The `theme.json` Override is not applied to Classic Theme subsites under any circumstance.

## Architecture

### Service Layer

**EffectiveOverrideResolver**
Resolves the effective CSS and theme.json for the current request context. Combines exemption checking, preview detection, and theme-specific override logic in a single deep module. Interface: `isExempted()`, `resolveForCurrentSite()`, `getCss()`, `getThemeJson()`, `activeThemeSupportsThemeJson()`.

**OverrideBundleService**
Owns the canonical interface for network overrides as a unified bundle (CSS + theme overrides + exemptions). Handles load, save, export, import, and preview operations. Interface: `load()`, `loadGlobal()`, `saveGlobal()`, `saveThemeOverride()`, `deleteThemeOverride()`, `export()`, `import()`, `createPreview()`, `discardPreview()`.

**ThemeCatalogService**
Theme discovery and metadata. Interface: `getNetworkThemes()`, `getOriginalThemeJson()`, `themeExists()`, `isBlockTheme()`.

### Override Modules

**CssOverride**
Enqueues network CSS via wp_head. Delegates all resolution logic to EffectiveOverrideResolver.

**ThemeJsonOverride**
Merges network theme.json into WP user layer via wp_theme_json_data_user filter. Delegates exemption and resolution to EffectiveOverrideResolver.

### React Hooks

**useThemeOverrideDraft**
Deep module for theme override draft state management. Tracks auto-populated vs user-edited changes to prevent false dirty state. Interface: `overrides`, `dirtyThemes`, `hasDirtyChanges`, `getOverride()`, `isDirty()`, `isAutoPopulated()`, `updateOverride()`, `populateFromDefaults()`, `resetToOriginal()`, `resetToDefaults()`, `saveAll()`, `deleteOverride()`, `syncFromExternal()`.

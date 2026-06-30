import { useState, useCallback, useMemo } from '@wordpress/element';

/**
 * Deep module for Theme Override draft state management.
 *
 * Owns original/current/dirty semantics so field components can be dumb adapters.
 * Only marks dirty on actual user changes, not auto-population from theme defaults.
 *
 * @param {Object}   initialOverrides       All theme overrides keyed by slug.
 * @param {Function} onSaveThemeOverride    Called with (slug, override) to persist.
 * @param {Function} onDeleteThemeOverride  Called with (slug) to delete.
 * @returns {Object} Draft state and handlers.
 */
export function useThemeOverrideDraft( {
	initialOverrides = {},
	onSaveThemeOverride,
	onDeleteThemeOverride,
} ) {
	// Current overrides state (may include unsaved changes).
	const [ overrides, setOverrides ] = useState( initialOverrides );

	// Track which themes have unsaved changes.
	const [ dirtyThemes, setDirtyThemes ] = useState( new Set() );

	// Track original values for each theme (from when loaded or after save).
	const [ originals, setOriginals ] = useState( initialOverrides );

	// Track which themes were auto-populated (not dirty until user edits).
	const [ autoPopulated, setAutoPopulated ] = useState( new Set() );

	/**
	 * Update override for a theme.
	 * If isUserEdit is true, marks as dirty. If false (auto-population), doesn't mark dirty.
	 */
	const updateOverride = useCallback( ( slug, override, isUserEdit = true ) => {
		setOverrides( ( prev ) => ( {
			...prev,
			[ slug ]: override,
		} ) );

		if ( isUserEdit ) {
			// User edit — mark as dirty and remove from auto-populated.
			setDirtyThemes( ( prev ) => new Set( [ ...prev, slug ] ) );
			setAutoPopulated( ( prev ) => {
				const next = new Set( prev );
				next.delete( slug );
				return next;
			} );
		} else {
			// Auto-population — track but don't mark dirty.
			setAutoPopulated( ( prev ) => new Set( [ ...prev, slug ] ) );
		}
	}, [] );

	/**
	 * Auto-populate override from theme defaults.
	 * Does NOT mark as dirty — only user edits do that.
	 */
	const populateFromDefaults = useCallback( ( slug, themeJson ) => {
		setOverrides( ( prev ) => {
			// Only populate if no existing override.
			const existing = prev[ slug ];
			if ( existing && ( existing.css || Object.keys( existing.theme_json || {} ).length > 0 ) ) {
				return prev;
			}
			return {
				...prev,
				[ slug ]: { css: '', theme_json: themeJson },
			};
		} );
		setAutoPopulated( ( prev ) => new Set( [ ...prev, slug ] ) );
	}, [] );

	/**
	 * Reset a theme's override to original values.
	 */
	const resetToOriginal = useCallback( ( slug ) => {
		setOverrides( ( prev ) => ( {
			...prev,
			[ slug ]: originals[ slug ] ?? { css: '', theme_json: {} },
		} ) );
		setDirtyThemes( ( prev ) => {
			const next = new Set( prev );
			next.delete( slug );
			return next;
		} );
		setAutoPopulated( ( prev ) => {
			const next = new Set( prev );
			next.delete( slug );
			return next;
		} );
	}, [ originals ] );

	/**
	 * Reset a theme's override to theme defaults (from original theme.json).
	 */
	const resetToDefaults = useCallback( ( slug, themeJson ) => {
		setOverrides( ( prev ) => ( {
			...prev,
			[ slug ]: { ...( prev[ slug ] ?? {} ), css: prev[ slug ]?.css ?? '', theme_json: themeJson },
		} ) );
		setDirtyThemes( ( prev ) => new Set( [ ...prev, slug ] ) );
	}, [] );

	/**
	 * Save all dirty overrides.
	 */
	const saveAll = useCallback( async () => {
		const slugsToSave = [ ...dirtyThemes ];
		const promises = slugsToSave.map( ( slug ) =>
			onSaveThemeOverride( slug, overrides[ slug ] )
		);
		await Promise.all( promises );

		// Update originals and clear dirty.
		setOriginals( ( prev ) => {
			const next = { ...prev };
			for ( const slug of slugsToSave ) {
				next[ slug ] = overrides[ slug ];
			}
			return next;
		} );
		setDirtyThemes( new Set() );
		setAutoPopulated( new Set() );
	}, [ dirtyThemes, overrides, onSaveThemeOverride ] );

	/**
	 * Delete a theme override.
	 */
	const deleteOverride = useCallback( async ( slug ) => {
		await onDeleteThemeOverride( slug );

		setOverrides( ( prev ) => {
			const next = { ...prev };
			delete next[ slug ];
			return next;
		} );
		setOriginals( ( prev ) => {
			const next = { ...prev };
			delete next[ slug ];
			return next;
		} );
		setDirtyThemes( ( prev ) => {
			const next = new Set( prev );
			next.delete( slug );
			return next;
		} );
		setAutoPopulated( ( prev ) => {
			const next = new Set( prev );
			next.delete( slug );
			return next;
		} );
	}, [ onDeleteThemeOverride ] );

	/**
	 * Sync with externally loaded overrides (e.g., after import).
	 */
	const syncFromExternal = useCallback( ( newOverrides ) => {
		setOverrides( newOverrides );
		setOriginals( newOverrides );
		setDirtyThemes( new Set() );
		setAutoPopulated( new Set() );
	}, [] );

	/**
	 * Get override for a specific theme.
	 */
	const getOverride = useCallback( ( slug ) => {
		return overrides[ slug ] ?? { css: '', theme_json: {} };
	}, [ overrides ] );

	/**
	 * Check if any themes have unsaved changes.
	 */
	const hasDirtyChanges = useMemo( () => dirtyThemes.size > 0, [ dirtyThemes ] );

	/**
	 * Check if a specific theme has unsaved changes.
	 */
	const isDirty = useCallback( ( slug ) => dirtyThemes.has( slug ), [ dirtyThemes ] );

	/**
	 * Check if a specific theme was auto-populated (not user-edited).
	 */
	const isAutoPopulated = useCallback( ( slug ) => autoPopulated.has( slug ), [ autoPopulated ] );

	return {
		// State.
		overrides,
		dirtyThemes,
		hasDirtyChanges,

		// Getters.
		getOverride,
		isDirty,
		isAutoPopulated,

		// Actions.
		updateOverride,
		populateFromDefaults,
		resetToOriginal,
		resetToDefaults,
		saveAll,
		deleteOverride,
		syncFromExternal,
	};
}

export default useThemeOverrideDraft;

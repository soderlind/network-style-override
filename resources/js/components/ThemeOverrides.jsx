import { useState, useEffect, useCallback } from '@wordpress/element';
import {
	SelectControl,
	Button,
	Spinner,
	Notice,
	TabPanel,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import CssEditor from './CssEditor';
import ThemeJsonEditor from './ThemeJsonEditor';
import { getOriginalThemeJson } from '../api';

/**
 * Controlled component for theme-specific overrides.
 *
 * @param {Object}   props
 * @param {Array}    props.themes           - List of network themes.
 * @param {Object}   props.overrides        - All theme overrides keyed by slug.
 * @param {Function} props.onOverrideChange - Called with (slug, override, isUserEdit) when override changes.
 * @param {Function} props.onAutoPopulate   - Called with (slug, themeJson) to auto-populate from defaults.
 * @param {Function} props.onDelete         - Called with (slug) to delete an override.
 * @param {boolean}  props.loading          - Whether data is still loading.
 * @param {boolean}  props.deleting         - Whether a delete is in progress.
 */
export default function ThemeOverrides( {
	themes,
	overrides,
	onOverrideChange,
	onAutoPopulate,
	onDelete,
	loading,
	deleting,
	onNavigateToSites,
} ) {
	const [ selectedTheme, setSelectedTheme ] = useState( '' );
	const [ originalThemeJson, setOriginalThemeJson ] = useState( {} );
	const [ loadingOriginal, setLoadingOriginal ] = useState( false );

	// Auto-select first theme when themes load.
	useEffect( () => {
		if ( themes.length > 0 && ! selectedTheme ) {
			setSelectedTheme( themes[ 0 ].slug );
		}
	}, [ themes, selectedTheme ] );

	// Fetch original theme.json when theme changes.
	const fetchOriginalThemeJson = useCallback( async ( slug ) => {
		if ( ! slug ) return;

		setLoadingOriginal( true );
		try {
			const data = await getOriginalThemeJson( slug );
			setOriginalThemeJson( ( prev ) => ( {
				...prev,
				[ slug ]: data.theme_json,
			} ) );

			// If no override exists for this theme, auto-populate from defaults.
			// Use onAutoPopulate which doesn't mark as dirty.
			const existingOverride = overrides[ slug ];
			const hasExistingOverride =
				existingOverride &&
				( existingOverride.css !== '' ||
					Object.keys( existingOverride.theme_json || {} ).length >
						0 );

			if ( ! hasExistingOverride && data.is_block_theme && onAutoPopulate ) {
				onAutoPopulate( slug, data.theme_json );
			}
		} catch ( e ) {
			// Silently fail — theme.json might not exist for classic themes.
			setOriginalThemeJson( ( prev ) => ( {
				...prev,
				[ slug ]: {},
			} ) );
		} finally {
			setLoadingOriginal( false );
		}
	}, [ overrides, onAutoPopulate ] );

	// Fetch original theme.json when selected theme changes.
	useEffect( () => {
		if ( selectedTheme && ! originalThemeJson[ selectedTheme ] ) {
			fetchOriginalThemeJson( selectedTheme );
		}
	}, [ selectedTheme, originalThemeJson, fetchOriginalThemeJson ] );

	const currentOverride = overrides[ selectedTheme ] ?? {
		css: '',
		theme_json: {},
	};

	const handleThemeChange = ( slug ) => {
		setSelectedTheme( slug );
	};

	const handleCssChange = ( css ) => {
		onOverrideChange( selectedTheme, { ...currentOverride, css }, true );
	};

	const handleThemeJsonChange = ( themeJson ) => {
		onOverrideChange( selectedTheme, {
			...currentOverride,
			theme_json: themeJson,
		}, true );
	};

	const handleResetToDefaults = () => {
		const original = originalThemeJson[ selectedTheme ] ?? {};
		const confirmMsg = __(
			'Reset to theme defaults? This will replace your current theme.json override with the original from the theme.',
			'network-style-override'
		);
		if ( ! window.confirm( confirmMsg ) ) {
			return;
		}

		onOverrideChange( selectedTheme, {
			...currentOverride,
			theme_json: original,
		}, true );
	};

	const handleDelete = () => {
		if ( ! selectedTheme ) {
			return;
		}

		const confirmMsg = __(
			'Delete all overrides for this theme?',
			'network-style-override'
		);
		if ( ! window.confirm( confirmMsg ) ) {
			return;
		}

		onDelete( selectedTheme );
	};

	if ( loading ) {
		return (
			<div style={ { padding: '2rem', textAlign: 'center' } }>
				<Spinner />
			</div>
		);
	}

	if ( themes.length === 0 ) {
		return (
			<Notice status="info" isDismissible={ false }>
				{ __(
					'No themes found in the network.',
					'network-style-override'
				) }
			</Notice>
		);
	}

	const themeOptions = themes.map( ( t ) => ( {
		label: `${ t.name } (${ t.slug })${ t.is_block_theme ? '' : ' — Classic' }`,
		value: t.slug,
	} ) );

	const selectedThemeData = themes.find( ( t ) => t.slug === selectedTheme );
	const isBlockTheme = selectedThemeData?.is_block_theme ?? false;

	const hasOverride =
		currentOverride.css !== '' ||
		Object.keys( currentOverride.theme_json ).length > 0;

	const hasOriginalThemeJson =
		originalThemeJson[ selectedTheme ] &&
		Object.keys( originalThemeJson[ selectedTheme ] ).length > 0;

	const tabs = [
		{ name: 'css', title: __( 'CSS', 'network-style-override' ) },
		{
			name: 'theme-json',
			title: __( 'theme.json', 'network-style-override' ),
			disabled: ! isBlockTheme,
		},
	];

	return (
		<div className="mos-theme-overrides">
			<p className="description">
				{ __(
					'Add CSS or theme.json overrides that apply only to specific themes. These are applied after the global overrides.',
					'network-style-override'
				) }
			</p>

			<SelectControl
				label={ __( 'Select Theme', 'network-style-override' ) }
				value={ selectedTheme }
				options={ themeOptions }
				onChange={ handleThemeChange }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>

			{ selectedTheme && (
				<>
					{ loadingOriginal && (
						<div
							style={ {
								padding: '1rem',
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem',
							} }
						>
							<Spinner />
							<span>
								{ __(
									'Loading theme.json…',
									'network-style-override'
								) }
							</span>
						</div>
					) }

					{ ! loadingOriginal && (
						<TabPanel
							tabs={ tabs.filter( ( t ) => ! t.disabled ) }
							className="mos-theme-override-tabs"
						>
							{ ( tab ) => (
								<div className="mos-tab-content">
									{ tab.name === 'css' && (
										<CssEditor
											value={ currentOverride.css }
											onChange={ handleCssChange }
											onNavigateToSites={ onNavigateToSites }
										/>
									) }
									{ tab.name === 'theme-json' && (
										<ThemeJsonEditor
											value={ currentOverride.theme_json }
											onChange={ handleThemeJsonChange }
											originalValue={ originalThemeJson[ selectedTheme ] }
										/>
									) }
								</div>
							) }
						</TabPanel>
					) }

					<div
						className="mos-theme-overrides__actions"
						style={ {
							marginTop: '1rem',
							display: 'flex',
							gap: '0.5rem',
						} }
					>
						{ isBlockTheme && hasOriginalThemeJson && (
							<Button
								variant="secondary"
								onClick={ handleResetToDefaults }
								disabled={ loadingOriginal }
							>
								{ __(
									'Reset to theme defaults',
									'network-style-override'
								) }
							</Button>
						) }

						{ hasOverride && (
							<Button
								variant="secondary"
								isDestructive
								onClick={ handleDelete }
								isBusy={ deleting }
								disabled={ deleting }
							>
								{ __(
									'Delete Override',
									'network-style-override'
								) }
							</Button>
						) }
					</div>
				</>
			) }
		</div>
	);
}

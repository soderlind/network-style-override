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
import {
	getNetworkThemes,
	getThemeOverrides,
	saveThemeOverride,
	deleteThemeOverride,
} from '../api';

export default function ThemeOverrides() {
	const [ themes, setThemes ] = useState( [] );
	const [ overrides, setOverrides ] = useState( {} );
	const [ selectedTheme, setSelectedTheme ] = useState( '' );
	const [ currentOverride, setCurrentOverride ] = useState( {
		css: '',
		theme_json: {},
	} );
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ saved, setSaved ] = useState( false );
	const [ error, setError ] = useState( null );

	const load = useCallback( async () => {
		setLoading( true );
		try {
			const [ themesData, overridesData ] = await Promise.all( [
				getNetworkThemes(),
				getThemeOverrides(),
			] );
			setThemes( themesData );
			setOverrides( overridesData );

			// Auto-select first theme if available.
			if ( themesData.length > 0 && ! selectedTheme ) {
				const first = themesData[ 0 ].slug;
				setSelectedTheme( first );
				setCurrentOverride(
					overridesData[ first ] ?? { css: '', theme_json: {} }
				);
			}
		} catch ( e ) {
			setError( e.message ?? __( 'Failed to load themes.', 'multisite-override-style' ) );
		} finally {
			setLoading( false );
		}
	}, [] );

	useEffect( () => {
		load();
	}, [ load ] );

	const handleThemeChange = ( slug ) => {
		setSelectedTheme( slug );
		setCurrentOverride( overrides[ slug ] ?? { css: '', theme_json: {} } );
		setSaved( false );
	};

	const handleSave = async () => {
		if ( ! selectedTheme ) {
			return;
		}

		setSaving( true );
		setSaved( false );
		try {
			await saveThemeOverride( selectedTheme, currentOverride );
			setOverrides( {
				...overrides,
				[ selectedTheme ]: currentOverride,
			} );
			setSaved( true );
			setTimeout( () => setSaved( false ), 3000 );
		} catch ( e ) {
			setError( e.message ?? __( 'Save failed.', 'multisite-override-style' ) );
		} finally {
			setSaving( false );
		}
	};

	const handleDelete = async () => {
		if ( ! selectedTheme ) {
			return;
		}

		const confirmMsg = __(
			'Delete all overrides for this theme?',
			'multisite-override-style'
		);
		if ( ! window.confirm( confirmMsg ) ) {
			return;
		}

		setSaving( true );
		try {
			await deleteThemeOverride( selectedTheme );
			const newOverrides = { ...overrides };
			delete newOverrides[ selectedTheme ];
			setOverrides( newOverrides );
			setCurrentOverride( { css: '', theme_json: {} } );
			setSaved( true );
			setTimeout( () => setSaved( false ), 3000 );
		} catch ( e ) {
			setError( e.message ?? __( 'Delete failed.', 'multisite-override-style' ) );
		} finally {
			setSaving( false );
		}
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
					'multisite-override-style'
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

	const tabs = [
		{ name: 'css', title: __( 'CSS', 'multisite-override-style' ) },
		{
			name: 'theme-json',
			title: __( 'theme.json', 'multisite-override-style' ),
			disabled: ! isBlockTheme,
		},
	];

	return (
		<div className="mos-theme-overrides">
			{ error && (
				<Notice status="error" onRemove={ () => setError( null ) }>
					{ error }
				</Notice>
			) }
			{ saved && (
				<Notice status="success" isDismissible={ false }>
					{ __( 'Theme override saved.', 'multisite-override-style' ) }
				</Notice>
			) }

			<p className="description">
				{ __(
					'Add CSS or theme.json overrides that apply only to specific themes. These are applied after the global overrides.',
					'multisite-override-style'
				) }
			</p>

			<SelectControl
				label={ __( 'Select Theme', 'multisite-override-style' ) }
				value={ selectedTheme }
				options={ themeOptions }
				onChange={ handleThemeChange }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>

			{ selectedTheme && (
				<>
					<TabPanel
						tabs={ tabs.filter( ( t ) => ! t.disabled ) }
						className="mos-theme-override-tabs"
					>
						{ ( tab ) => (
							<div className="mos-tab-content">
								{ tab.name === 'css' && (
									<CssEditor
										value={ currentOverride.css }
										onChange={ ( css ) =>
											setCurrentOverride( {
												...currentOverride,
												css,
											} )
										}
									/>
								) }
								{ tab.name === 'theme-json' && (
									<ThemeJsonEditor
										value={ currentOverride.theme_json }
										onChange={ ( theme_json ) =>
											setCurrentOverride( {
												...currentOverride,
												theme_json,
											} )
										}
									/>
								) }
							</div>
						) }
					</TabPanel>

					<div
						className="mos-theme-overrides__actions"
						style={ { marginTop: '1rem', display: 'flex', gap: '0.5rem' } }
					>
						<Button
							variant="primary"
							onClick={ handleSave }
							isBusy={ saving }
							disabled={ saving }
						>
							{ __( 'Save Theme Override', 'multisite-override-style' ) }
						</Button>

						{ hasOverride && (
							<Button
								variant="secondary"
								isDestructive
								onClick={ handleDelete }
								disabled={ saving }
							>
								{ __( 'Delete Override', 'multisite-override-style' ) }
							</Button>
						) }
					</div>
				</>
			) }
		</div>
	);
}

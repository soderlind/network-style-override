import { useState, useEffect, useCallback } from '@wordpress/element';
import { Spinner, Notice, TabPanel, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import CssEditor from './CssEditor';
import ThemeOverrides from './ThemeOverrides';
import ExemptionList from './ExemptionList';
import RevisionHistory from './RevisionHistory';
import ImportExport from './ImportExport';
import {
	getSettings,
	saveSettings,
	createPreview,
	discardPreview,
	getNetworkThemes,
	getThemeOverrides,
	saveThemeOverride,
	deleteThemeOverride,
} from '../api';

export default function App() {
	const [ settings, setSettings ] = useState( null );
	const [ error, setError ] = useState( null );
	const [ saving, setSaving ] = useState( false );
	const [ saved, setSaved ] = useState( false );
	const [ previewToken, setPreviewToken ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( 'css' );

	// Theme overrides state (lifted from ThemeOverrides component).
	const [ themes, setThemes ] = useState( [] );
	const [ themeOverrides, setThemeOverrides ] = useState( {} );
	const [ dirtyThemeOverrides, setDirtyThemeOverrides ] = useState(
		new Set()
	);
	const [ themesLoading, setThemesLoading ] = useState( true );
	const [ deleting, setDeleting ] = useState( false );

	const load = useCallback( async () => {
		try {
			const data = await getSettings();
			setSettings( data );
		} catch ( e ) {
			setError(
				e.message ??
					__( 'Failed to load settings.', 'multisite-override-style' )
			);
		}
	}, [] );

	const loadThemes = useCallback( async () => {
		setThemesLoading( true );
		try {
			const [ themesData, overridesData ] = await Promise.all( [
				getNetworkThemes(),
				getThemeOverrides(),
			] );
			setThemes( themesData );
			setThemeOverrides( overridesData );
		} catch ( e ) {
			setError(
				e.message ??
					__(
						'Failed to load theme data.',
						'multisite-override-style'
					)
			);
		} finally {
			setThemesLoading( false );
		}
	}, [] );

	useEffect( () => {
		load();
		loadThemes();
	}, [ load, loadThemes ] );

	const handleSave = async () => {
		setSaving( true );
		setSaved( false );
		try {
			// Save global settings.
			const updated = await saveSettings( settings );
			setSettings( updated );

			// Save any dirty theme overrides.
			const savePromises = [ ...dirtyThemeOverrides ].map( ( slug ) =>
				saveThemeOverride( slug, themeOverrides[ slug ] )
			);
			await Promise.all( savePromises );
			setDirtyThemeOverrides( new Set() );

			setSaved( true );
			setTimeout( () => setSaved( false ), 3000 );
		} catch ( e ) {
			setError(
				e.message ?? __( 'Save failed.', 'multisite-override-style' )
			);
		} finally {
			setSaving( false );
		}
	};

	const handleThemeOverrideChange = ( slug, override ) => {
		setThemeOverrides( {
			...themeOverrides,
			[ slug ]: override,
		} );
		setDirtyThemeOverrides( new Set( [ ...dirtyThemeOverrides, slug ] ) );
	};

	const handleThemeOverrideDelete = async ( slug ) => {
		setDeleting( true );
		try {
			await deleteThemeOverride( slug );
			const newOverrides = { ...themeOverrides };
			delete newOverrides[ slug ];
			setThemeOverrides( newOverrides );

			// Remove from dirty set if present.
			const newDirty = new Set( dirtyThemeOverrides );
			newDirty.delete( slug );
			setDirtyThemeOverrides( newDirty );

			setSaved( true );
			setTimeout( () => setSaved( false ), 3000 );
		} catch ( e ) {
			setError(
				e.message ?? __( 'Delete failed.', 'multisite-override-style' )
			);
		} finally {
			setDeleting( false );
		}
	};

	const handlePreview = async () => {
		try {
			if ( previewToken ) {
				await discardPreview( previewToken );
			}
			const { token, preview_url } = await createPreview( {
				css: settings.css,
				theme_json: settings.theme_json,
				site_url: window.mosAdminData?.siteUrl ?? '',
			} );
			setPreviewToken( token );
			window.open( preview_url, '_blank', 'noopener,noreferrer' );
		} catch ( e ) {
			setError(
				e.message ?? __( 'Preview failed.', 'multisite-override-style' )
			);
		}
	};

	const handleRestored = ( updated ) => {
		setSettings( updated );
		setSaved( true );
		setTimeout( () => setSaved( false ), 3000 );
	};

	const handleImported = ( updated ) => {
		setSettings( updated );
		setSaved( true );
		setTimeout( () => setSaved( false ), 3000 );
	};

	if ( ! settings ) {
		return (
			<div style={ { padding: '2rem' } }>
				{ error ? (
					<Notice status="error" isDismissible={ false }>
						{ error }
					</Notice>
				) : (
					<Spinner />
				) }
			</div>
		);
	}

	const tabs = [
		{ name: 'css', title: __( 'CSS', 'multisite-override-style' ) },
		{
			name: 'theme-overrides',
			title: __( 'Theme Overrides', 'multisite-override-style' ),
		},
		{ name: 'sites', title: __( 'Sites', 'multisite-override-style' ) },
		{ name: 'history', title: __( 'History', 'multisite-override-style' ) },
		{
			name: 'import',
			title: __( 'Import / Export', 'multisite-override-style' ),
		},
	];

	const showFooter =
		activeTab === 'css' ||
		activeTab === 'theme-overrides';

	return (
		<div className="mos-app">
			<div className="mos-app__header">
				<h1>
					{ __(
						'Network Style Override',
						'multisite-override-style'
					) }
				</h1>

				{ error && (
					<Notice status="error" onRemove={ () => setError( null ) }>
						{ error }
					</Notice>
				) }
				{ saved && (
					<Notice status="success" isDismissible={ false }>
						{ __( 'Settings saved.', 'multisite-override-style' ) }
					</Notice>
				) }
			</div>

			<TabPanel tabs={ tabs } onSelect={ setActiveTab }>
				{ ( tab ) => (
					<div className="mos-tab-content">
						{ tab.name === 'css' && (
							<CssEditor
								value={ settings.css }
								onChange={ ( css ) =>
									setSettings( { ...settings, css } )
								}
							/>
						) }
						{ tab.name === 'theme-overrides' && (
							<ThemeOverrides
								themes={ themes }
								overrides={ themeOverrides }
								onOverrideChange={ handleThemeOverrideChange }
								onDelete={ handleThemeOverrideDelete }
								loading={ themesLoading }
								deleting={ deleting }
							/>
						) }
						{ tab.name === 'sites' && (
							<ExemptionList exemptions={ settings.exemptions } />
						) }
						{ tab.name === 'history' && (
							<RevisionHistory onRestored={ handleRestored } />
						) }
						{ tab.name === 'import' && (
							<ImportExport onImported={ handleImported } />
						) }
					</div>
				) }
			</TabPanel>

			{ showFooter && (
				<div className="mos-app__footer">
					<Button
						variant="primary"
						onClick={ handleSave }
						isBusy={ saving }
						disabled={ saving }
					>
						{ __( 'Save', 'multisite-override-style' ) }
					</Button>

					{ activeTab === 'css' && (
						<Button
							variant="secondary"
							onClick={ handlePreview }
							disabled={ saving }
						>
							{ __(
								'Preview on site',
								'multisite-override-style'
							) }
						</Button>
					) }
				</div>
			) }
		</div>
	);
}

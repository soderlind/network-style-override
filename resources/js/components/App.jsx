import { useState, useEffect, useCallback } from '@wordpress/element';
import { Spinner, Notice, TabPanel, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import CssEditor from './CssEditor';
import ThemeOverrides from './ThemeOverrides';
import ExemptionList from './ExemptionList';
import RevisionHistory from './RevisionHistory';
import ImportExport from './ImportExport';
import { useThemeOverrideDraft } from '../hooks/useThemeOverrideDraft';
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

	// Theme state.
	const [ themes, setThemes ] = useState( [] );
	const [ themesLoading, setThemesLoading ] = useState( true );
	const [ deleting, setDeleting ] = useState( false );

	// Use deep module for theme override draft state.
	const themeOverrideDraft = useThemeOverrideDraft( {
		initialOverrides: {},
		onSaveThemeOverride: saveThemeOverride,
		onDeleteThemeOverride: deleteThemeOverride,
	} );

	// Extract stable callback to avoid infinite loop in useEffect.
	const { syncFromExternal } = themeOverrideDraft;

	const load = useCallback( async () => {
		try {
			const data = await getSettings();
			setSettings( data );
		} catch ( e ) {
			setError(
				e.message ??
					__( 'Failed to load settings.', 'network-style-override' )
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
			syncFromExternal( overridesData );
		} catch ( e ) {
			setError(
				e.message ??
					__(
						'Failed to load theme data.',
						'network-style-override'
					)
			);
		} finally {
			setThemesLoading( false );
		}
	}, [ syncFromExternal ] );

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

			// Save any dirty theme overrides via the draft module.
			await themeOverrideDraft.saveAll();

			setSaved( true );
			setTimeout( () => setSaved( false ), 3000 );
		} catch ( e ) {
			setError(
				e.message ?? __( 'Save failed.', 'network-style-override' )
			);
		} finally {
			setSaving( false );
		}
	};

	const handleThemeOverrideChange = ( slug, override, isUserEdit = true ) => {
		themeOverrideDraft.updateOverride( slug, override, isUserEdit );
	};

	const handleThemeOverrideDelete = async ( slug ) => {
		setDeleting( true );
		try {
			await themeOverrideDraft.deleteOverride( slug );
			setSaved( true );
			setTimeout( () => setSaved( false ), 3000 );
		} catch ( e ) {
			setError(
				e.message ?? __( 'Delete failed.', 'network-style-override' )
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
				site_url: window.nsoAdminData?.siteUrl ?? '',
			} );
			setPreviewToken( token );
			window.open( preview_url, '_blank', 'noopener,noreferrer' );
		} catch ( e ) {
			setError(
				e.message ?? __( 'Preview failed.', 'network-style-override' )
			);
		}
	};

	const handleRestored = ( updated ) => {
		setSettings( updated );
		setSaved( true );
		setTimeout( () => setSaved( false ), 3000 );
	};

	const handleImported = async ( updated ) => {
		setSettings( updated );
		// Reload theme overrides after import.
		try {
			const overridesData = await getThemeOverrides();
			themeOverrideDraft.syncFromExternal( overridesData );
		} catch ( e ) {
			// Silently ignore — main settings were imported.
		}
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
		{ name: 'css', title: __( 'CSS', 'network-style-override' ) },
		{
			name: 'theme-overrides',
			title: __( 'Theme Overrides', 'network-style-override' ),
		},
		{ name: 'sites', title: __( 'Sites', 'network-style-override' ) },
		{ name: 'history', title: __( 'History', 'network-style-override' ) },
		{
			name: 'import',
			title: __( 'Import / Export', 'network-style-override' ),
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
						'network-style-override'
					) }
				</h1>

				{ error && (
					<Notice status="error" onRemove={ () => setError( null ) }>
						{ error }
					</Notice>
				) }
				{ saved && (
					<Notice status="success" isDismissible={ false }>
						{ __( 'Settings saved.', 'network-style-override' ) }
					</Notice>
				) }
			</div>

			<TabPanel
				key={ activeTab }
				tabs={ tabs }
				onSelect={ setActiveTab }
				initialTabName={ activeTab }
			>
				{ ( tab ) => (
					<div className="mos-tab-content">
						{ tab.name === 'css' && (
							<CssEditor
								value={ settings.css }
								onChange={ ( css ) =>
									setSettings( { ...settings, css } )
								}
								onNavigateToSites={ () => setActiveTab( 'sites' ) }
							/>
						) }
						{ tab.name === 'theme-overrides' && (
							<ThemeOverrides
								themes={ themes }
								overrides={ themeOverrideDraft.overrides }
								onOverrideChange={ handleThemeOverrideChange }
								onAutoPopulate={ themeOverrideDraft.populateFromDefaults }
								onDelete={ handleThemeOverrideDelete }
								loading={ themesLoading }
								deleting={ deleting }
								onNavigateToSites={ () => setActiveTab( 'sites' ) }
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
						{ __( 'Save', 'network-style-override' ) }
					</Button>

					{ activeTab === 'css' && (
						<Button
							variant="secondary"
							onClick={ handlePreview }
							disabled={ saving }
						>
							{ __(
								'Preview on site',
								'network-style-override'
							) }
						</Button>
					) }
				</div>
			) }
		</div>
	);
}

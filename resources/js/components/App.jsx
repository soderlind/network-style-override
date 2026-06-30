import { useState, useEffect, useCallback } from '@wordpress/element';
import { Spinner, Notice, TabPanel, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import CssEditor from './CssEditor';
import ThemeJsonEditor from './ThemeJsonEditor';
import ThemeOverrides from './ThemeOverrides';
import ExemptionList from './ExemptionList';
import RevisionHistory from './RevisionHistory';
import ImportExport from './ImportExport';
import {
	getSettings,
	saveSettings,
	createPreview,
	discardPreview,
} from '../api';

export default function App() {
	const [ settings, setSettings ] = useState( null );
	const [ error, setError ] = useState( null );
	const [ saving, setSaving ] = useState( false );
	const [ saved, setSaved ] = useState( false );
	const [ previewToken, setPreviewToken ] = useState( null );

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

	useEffect( () => {
		load();
	}, [ load ] );

	const handleSave = async () => {
		setSaving( true );
		setSaved( false );
		try {
			const updated = await saveSettings( settings );
			setSettings( updated );
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
			name: 'theme-json',
			title: __( 'theme.json', 'multisite-override-style' ),
		},
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

			<TabPanel tabs={ tabs }>
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
						{ tab.name === 'theme-json' && (
							<ThemeJsonEditor
								value={ settings.theme_json }
								onChange={ ( theme_json ) =>
									setSettings( { ...settings, theme_json } )
								}
							/>
						) }
						{ tab.name === 'theme-overrides' && (
							<ThemeOverrides />
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

			<div className="mos-app__footer">
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ saving }
					disabled={ saving }
				>
					{ __( 'Save', 'multisite-override-style' ) }
				</Button>

				<Button
					variant="secondary"
					onClick={ handlePreview }
					disabled={ saving }
				>
					{ __( 'Preview on site', 'multisite-override-style' ) }
				</Button>
			</div>
		</div>
	);
}

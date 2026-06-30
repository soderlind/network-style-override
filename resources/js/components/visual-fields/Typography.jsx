import { useState } from '@wordpress/element';
import { Button, TextControl, Panel, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Convert a name to a valid slug (kebab-case).
 */
function toSlug( name ) {
	return name
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-|-$/g, '' );
}

export default function Typography( { fontFamilies, fontSizes, onChange } ) {
	const [ familySlugsEdited, setFamilySlugsEdited ] = useState( {} );
	const [ sizeSlugsEdited, setSizeSlugsEdited ] = useState( {} );

	const updateFontFamilies = ( updated ) =>
		onChange( { fontFamilies: updated, fontSizes } );

	const updateFontSizes = ( updated ) =>
		onChange( { fontFamilies, fontSizes: updated } );

	const addFontFamily = () =>
		updateFontFamilies( [
			...fontFamilies,
			{ name: '', slug: '', fontFamily: '' },
		] );

	const updateFamilyName = ( index, name ) => {
		const next = [ ...fontFamilies ];
		next[ index ] = { ...next[ index ], name };
		if ( ! familySlugsEdited[ index ] ) {
			next[ index ].slug = toSlug( name );
		}
		updateFontFamilies( next );
	};

	const updateFamilySlug = ( index, slug ) => {
		setFamilySlugsEdited( { ...familySlugsEdited, [ index ]: true } );
		const next = [ ...fontFamilies ];
		next[ index ] = { ...next[ index ], slug: toSlug( slug ) };
		updateFontFamilies( next );
	};

	const updateFamily = ( index, field, val ) => {
		const next = [ ...fontFamilies ];
		next[ index ] = { ...next[ index ], [ field ]: val };
		updateFontFamilies( next );
	};

	const removeFamily = ( index ) =>
		updateFontFamilies( fontFamilies.filter( ( _, i ) => i !== index ) );

	const addFontSize = () =>
		updateFontSizes( [ ...fontSizes, { name: '', slug: '', size: '' } ] );

	const updateSizeName = ( index, name ) => {
		const next = [ ...fontSizes ];
		next[ index ] = { ...next[ index ], name };
		if ( ! sizeSlugsEdited[ index ] ) {
			next[ index ].slug = toSlug( name );
		}
		updateFontSizes( next );
	};

	const updateSizeSlug = ( index, slug ) => {
		setSizeSlugsEdited( { ...sizeSlugsEdited, [ index ]: true } );
		const next = [ ...fontSizes ];
		next[ index ] = { ...next[ index ], slug: toSlug( slug ) };
		updateFontSizes( next );
	};

	const updateSize = ( index, field, val ) => {
		const next = [ ...fontSizes ];
		next[ index ] = { ...next[ index ], [ field ]: val };
		updateFontSizes( next );
	};

	const removeSize = ( index ) =>
		updateFontSizes( fontSizes.filter( ( _, i ) => i !== index ) );

	return (
		<>
			<Panel>
				<PanelBody
					title={ __( 'Font Families', 'multisite-override-style' ) }
					initialOpen={ true }
				>
					<p className="description">
						{ __( 'Define font stacks available in the block editor.', 'multisite-override-style' ) }
					</p>
					{ fontFamilies.map( ( family, i ) => (
						<div key={ i } className="mos-font-family-row">
							<TextControl
								label={ __( 'Display Name', 'multisite-override-style' ) }
								help={ __( 'Shown in the font picker dropdown', 'multisite-override-style' ) }
								placeholder={ __( 'e.g. Heading Font', 'multisite-override-style' ) }
								value={ family.name }
								onChange={ ( v ) => updateFamilyName( i, v ) }
							/>
							<TextControl
								label={ __( 'Identifier', 'multisite-override-style' ) }
								help={ __( 'Used in CSS: --wp--preset--font-family--{identifier}', 'multisite-override-style' ) }
								placeholder={ __( 'e.g. heading-font', 'multisite-override-style' ) }
								value={ family.slug }
								onChange={ ( v ) => updateFamilySlug( i, v ) }
							/>
							<TextControl
								label={ __( 'CSS Font Stack', 'multisite-override-style' ) }
								help={ __( 'The actual CSS font-family value', 'multisite-override-style' ) }
								value={ family.fontFamily }
								onChange={ ( v ) =>
									updateFamily( i, 'fontFamily', v )
								}
								placeholder="e.g. Georgia, 'Times New Roman', serif"
							/>
							<Button
								isDestructive
								variant="tertiary"
								onClick={ () => removeFamily( i ) }
							>
								{ __( 'Remove', 'multisite-override-style' ) }
							</Button>
						</div>
					) ) }
					<Button variant="secondary" onClick={ addFontFamily }>
						{ __(
							'+ Add font family',
							'multisite-override-style'
						) }
					</Button>
				</PanelBody>
			</Panel>

			<Panel>
				<PanelBody
					title={ __( 'Font Sizes', 'multisite-override-style' ) }
					initialOpen={ false }
				>
					<p className="description">
						{ __( 'Define font size presets for the block editor.', 'multisite-override-style' ) }
					</p>
					{ fontSizes.map( ( size, i ) => (
						<div key={ i } className="mos-font-size-row">
							<TextControl
								label={ __( 'Display Name', 'multisite-override-style' ) }
								help={ __( 'Shown in the size picker (e.g. Small, Medium, Large)', 'multisite-override-style' ) }
								placeholder={ __( 'e.g. Large', 'multisite-override-style' ) }
								value={ size.name }
								onChange={ ( v ) => updateSizeName( i, v ) }
							/>
							<TextControl
								label={ __( 'Identifier', 'multisite-override-style' ) }
								help={ __( 'Used in CSS: --wp--preset--font-size--{identifier}', 'multisite-override-style' ) }
								placeholder={ __( 'e.g. large', 'multisite-override-style' ) }
								value={ size.slug }
								onChange={ ( v ) => updateSizeSlug( i, v ) }
							/>
							<TextControl
								label={ __( 'CSS Value', 'multisite-override-style' ) }
								help={ __( 'Any valid CSS size value', 'multisite-override-style' ) }
								value={ size.size }
								onChange={ ( v ) => updateSize( i, 'size', v ) }
								placeholder="e.g. 1.5rem, 24px, clamp(1rem,2vw,1.5rem)"
							/>
							<Button
								isDestructive
								variant="tertiary"
								onClick={ () => removeSize( i ) }
							>
								{ __( 'Remove', 'multisite-override-style' ) }
							</Button>
						</div>
					) ) }
					<Button variant="secondary" onClick={ addFontSize }>
						{ __( '+ Add font size', 'multisite-override-style' ) }
					</Button>
				</PanelBody>
			</Panel>
		</>
	);
}

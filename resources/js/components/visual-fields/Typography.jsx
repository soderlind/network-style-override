import { useState } from '@wordpress/element';
import {
	TextControl,
	Panel,
	PanelBody,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import NameSlugFields from './NameSlugFields';

/**
 * Convert a name to a valid slug (kebab-case).
 */
function toSlug( name ) {
	return name
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-|-$/g, '' );
}

const CSS_UNITS = [
	{ value: 'px', label: 'px' },
	{ value: 'em', label: 'em' },
	{ value: 'rem', label: 'rem' },
	{ value: '%', label: '%' },
	{ value: 'vw', label: 'vw' },
	{ value: 'vh', label: 'vh' },
];

export default function Typography( { fontFamilies, fontSizes, onChange, lockedFamilySlugs = new Set(), lockedSizeSlugs = new Set() } ) {
	const [ familySlugsEdited, setFamilySlugsEdited ] = useState( {} );
	const [ sizeSlugsEdited, setSizeSlugsEdited ] = useState( {} );

	const updateFontFamilies = ( updated ) =>
		onChange( { fontFamilies: updated, fontSizes } );

	const updateFontSizes = ( updated ) =>
		onChange( { fontFamilies, fontSizes: updated } );

	const updateFamilyName = ( index, name ) => {
		const next = [ ...fontFamilies ];
		const isLocked = lockedFamilySlugs.has( next[ index ].slug );
		if ( isLocked ) return;
		next[ index ] = { ...next[ index ], name };
		if ( ! familySlugsEdited[ index ] ) {
			next[ index ].slug = toSlug( name );
		}
		updateFontFamilies( next );
	};

	const updateFamilySlug = ( index, slug ) => {
		const isLocked = lockedFamilySlugs.has( fontFamilies[ index ].slug );
		if ( isLocked ) return;
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

	const updateSizeName = ( index, name ) => {
		const next = [ ...fontSizes ];
		const isLocked = lockedSizeSlugs.has( next[ index ].slug );
		if ( isLocked ) return;
		next[ index ] = { ...next[ index ], name };
		if ( ! sizeSlugsEdited[ index ] ) {
			next[ index ].slug = toSlug( name );
		}
		updateFontSizes( next );
	};

	const updateSizeSlug = ( index, slug ) => {
		const isLocked = lockedSizeSlugs.has( fontSizes[ index ].slug );
		if ( isLocked ) return;
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

	return (
		<>
			<Panel>
				<PanelBody
					title={ __( 'Font Families', 'network-style-override' ) }
					initialOpen={ false }
				>
					<p className="description">
						{ __( 'Override font stacks available in the block editor.', 'network-style-override' ) }
					</p>
					<div className="nso-preset-list">
						<div className="nso-preset-list__header is-no-preview">
							<span>{ __( 'Name', 'network-style-override' ) }</span>
							<span>{ __( 'Identifier', 'network-style-override' ) }</span>
						</div>
						{ fontFamilies.map( ( family, i ) => {
							const isLocked = lockedFamilySlugs.has( family.slug );
							return (
								<div key={ i } className="nso-preset-row">
									<div className="nso-preset-row__stack">
										<div className="nso-preset-row__cols">
											<NameSlugFields
												name={ family.name }
												slug={ family.slug }
												isLocked={ isLocked }
												onNameChange={ ( v ) => updateFamilyName( i, v ) }
												onSlugChange={ ( v ) => updateFamilySlug( i, v ) }
												namePlaceholder={ __( 'Heading', 'network-style-override' ) }
												slugPlaceholder={ __( 'heading', 'network-style-override' ) }
											/>
										</div>
										<TextControl
											label={ __( 'CSS Font Stack', 'network-style-override' ) }
											value={ family.fontFamily }
											onChange={ ( v ) => updateFamily( i, 'fontFamily', v ) }
											placeholder="Georgia, 'Times New Roman', serif"
											__nextHasNoMarginBottom
										/>
									</div>
								</div>
							);
						} ) }
					</div>
				</PanelBody>
			</Panel>

			<Panel>
				<PanelBody
					title={ __( 'Font Sizes', 'network-style-override' ) }
					initialOpen={ false }
				>
					<p className="description">
						{ __( 'Override font size presets for the block editor.', 'network-style-override' ) }
					</p>
					<div className="nso-preset-list">
						<div className="nso-preset-list__header">
							<span>{ __( 'Name', 'network-style-override' ) }</span>
							<span>{ __( 'Identifier', 'network-style-override' ) }</span>
							<span>{ __( 'Size', 'network-style-override' ) }</span>
						</div>
						{ fontSizes.map( ( size, i ) => {
							const isLocked = lockedSizeSlugs.has( size.slug );
							const sizeVal = parseFloat( size.size ) || 16;
							const isRem = String( size.size ).includes( 'rem' );
							const previewSize = Math.min( Math.max( isRem ? sizeVal * 16 : sizeVal, 10 ), 20 );
							return (
								<div key={ i } className="nso-preset-row">
									<div className="nso-preset-row__preview">
										<div className="nso-preview-tile" style={ { fontSize: previewSize } }>
											Aa
										</div>
									</div>
									<div className="nso-preset-row__fields">
										<NameSlugFields
											name={ size.name }
											slug={ size.slug }
											isLocked={ isLocked }
											onNameChange={ ( v ) => updateSizeName( i, v ) }
											onSlugChange={ ( v ) => updateSizeSlug( i, v ) }
											namePlaceholder={ __( 'Large', 'network-style-override' ) }
											slugPlaceholder={ __( 'large', 'network-style-override' ) }
										/>
										<UnitControl
											value={ size.size }
											onChange={ ( v ) => updateSize( i, 'size', v ) }
											units={ CSS_UNITS }
											__nextHasNoMarginBottom
										/>
									</div>
								</div>
							);
						} ) }
					</div>
				</PanelBody>
			</Panel>
		</>
	);
}

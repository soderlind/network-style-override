import { useState } from '@wordpress/element';
import {
	Button,
	TextControl,
	Panel,
	PanelBody,
	Flex,
	FlexItem,
	FlexBlock,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalUnitControl as UnitControl,
	Card,
	CardBody,
} from '@wordpress/components';
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

	const addFontFamily = () =>
		updateFontFamilies( [
			...fontFamilies,
			{ name: '', slug: '', fontFamily: '' },
		] );

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

	const removeFamily = ( index ) =>
		updateFontFamilies( fontFamilies.filter( ( _, i ) => i !== index ) );

	const addFontSize = () =>
		updateFontSizes( [ ...fontSizes, { name: '', slug: '', size: '16px' } ] );

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

	const removeSize = ( index ) =>
		updateFontSizes( fontSizes.filter( ( _, i ) => i !== index ) );

	return (
		<>
			<Panel>
				<PanelBody
					title={ __( 'Font Families', 'multisite-override-style' ) }
					initialOpen={ false }
				>
					<p className="description">
						{ __( 'Override font stacks available in the block editor.', 'multisite-override-style' ) }
					</p>
					<div style={ { display: 'flex', padding: '0 56px 8px 0', fontSize: 11, fontWeight: 500, color: '#757575', textTransform: 'uppercase' } }>
						<span style={ { flex: 1 } }>{ __( 'Name', 'multisite-override-style' ) }</span>
						<span style={ { flex: 1 } }>{ __( 'Identifier', 'multisite-override-style' ) }</span>
					</div>
					<VStack spacing={ 3 }>
						{ fontFamilies.map( ( family, i ) => {
							const isLocked = lockedFamilySlugs.has( family.slug );
							return (
								<Card key={ i } size="small">
									<CardBody>
										<Flex align="flex-start" gap={ 3 }>
											<FlexBlock>
												<VStack spacing={ 3 }>
													<HStack alignment="stretch" spacing={ 3 }>
														<TextControl
															placeholder={ __( 'Heading', 'multisite-override-style' ) }
															value={ family.name }
															onChange={ ( v ) => updateFamilyName( i, v ) }
															__nextHasNoMarginBottom
															readOnly={ isLocked }
															disabled={ isLocked }
														/>
														<TextControl
															placeholder={ __( 'heading', 'multisite-override-style' ) }
															value={ family.slug }
															onChange={ ( v ) => updateFamilySlug( i, v ) }
															__nextHasNoMarginBottom
															readOnly={ isLocked }
															disabled={ isLocked }
														/>
													</HStack>
													<TextControl
														label={ __( 'CSS Font Stack', 'multisite-override-style' ) }
														value={ family.fontFamily }
														onChange={ ( v ) => updateFamily( i, 'fontFamily', v ) }
														placeholder="Georgia, 'Times New Roman', serif"
														__nextHasNoMarginBottom
													/>
												</VStack>
											</FlexBlock>
											<FlexItem>
												<Button
													icon="trash"
													isDestructive
													variant="tertiary"
													onClick={ () => removeFamily( i ) }
													label={ __( 'Remove', 'multisite-override-style' ) }
													size="compact"
													style={ { marginTop: 24 } }
												/>
											</FlexItem>
										</Flex>
									</CardBody>
								</Card>
							);
						} ) }
					</VStack>
					<div style={ { marginTop: 16 } }>
						<Button variant="secondary" onClick={ addFontFamily }>
							{ __( '+ Add font family', 'multisite-override-style' ) }
						</Button>
					</div>
				</PanelBody>
			</Panel>

			<Panel>
				<PanelBody
					title={ __( 'Font Sizes', 'multisite-override-style' ) }
					initialOpen={ false }
				>
					<p className="description">
						{ __( 'Override font size presets for the block editor.', 'multisite-override-style' ) }
					</p>
					<div style={ { display: 'flex', padding: '0 56px 8px 56px', fontSize: 11, fontWeight: 500, color: '#757575', textTransform: 'uppercase' } }>
						<span style={ { flex: 1 } }>{ __( 'Name', 'multisite-override-style' ) }</span>
						<span style={ { flex: 1 } }>{ __( 'Identifier', 'multisite-override-style' ) }</span>
						<span style={ { flex: 1 } }>{ __( 'Size', 'multisite-override-style' ) }</span>
					</div>
					<VStack spacing={ 3 }>
						{ fontSizes.map( ( size, i ) => {
							const isLocked = lockedSizeSlugs.has( size.slug );
							const sizeVal = parseFloat( size.size ) || 16;
							const isRem = String( size.size ).includes( 'rem' );
							const previewSize = Math.min( Math.max( isRem ? sizeVal * 16 : sizeVal, 10 ), 20 );
							return (
								<Card key={ i } size="small">
									<CardBody>
										<Flex align="center" gap={ 3 }>
											<FlexItem>
												<div
													style={ {
														width: 40,
														height: 40,
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														background: '#1e1e1e',
														borderRadius: 4,
														fontWeight: 'bold',
														color: '#fff',
														fontSize: previewSize,
													} }
												>
													Aa
												</div>
											</FlexItem>
											<FlexBlock>
												<HStack alignment="stretch" spacing={ 3 }>
													<TextControl
														placeholder={ __( 'Large', 'multisite-override-style' ) }
														value={ size.name }
														onChange={ ( v ) => updateSizeName( i, v ) }
														__nextHasNoMarginBottom
														readOnly={ isLocked }
														disabled={ isLocked }
													/>
													<TextControl
														placeholder={ __( 'large', 'multisite-override-style' ) }
														value={ size.slug }
														onChange={ ( v ) => updateSizeSlug( i, v ) }
														__nextHasNoMarginBottom
														readOnly={ isLocked }
														disabled={ isLocked }
													/>
													<UnitControl
														value={ size.size }
														onChange={ ( v ) => updateSize( i, 'size', v ) }
														units={ CSS_UNITS }
														__nextHasNoMarginBottom
													/>
												</HStack>
											</FlexBlock>
											<FlexItem>
												<Button
													icon="trash"
													isDestructive
													variant="tertiary"
													onClick={ () => removeSize( i ) }
													label={ __( 'Remove', 'multisite-override-style' ) }
													size="compact"
												/>
											</FlexItem>
										</Flex>
									</CardBody>
								</Card>
							);
						} ) }
					</VStack>
					<div style={ { marginTop: 16 } }>
						<Button variant="secondary" onClick={ addFontSize }>
							{ __( '+ Add font size', 'multisite-override-style' ) }
						</Button>
					</div>
				</PanelBody>
			</Panel>
		</>
	);
}

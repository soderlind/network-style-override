import { useState } from '@wordpress/element';
import {
	Button,
	TextControl,
	ColorPicker,
	Dropdown,
	Flex,
	FlexItem,
	FlexBlock,
	Panel,
	PanelBody,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
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

function ColorRow( { color, onChange, onRemove, isLocked } ) {
	const [ slugEdited, setSlugEdited ] = useState( !! color.slug );

	const handleNameChange = ( name ) => {
		if ( isLocked ) return;
		const updates = { ...color, name };
		if ( ! slugEdited ) {
			updates.slug = toSlug( name );
		}
		onChange( updates );
	};

	const handleSlugChange = ( slug ) => {
		if ( isLocked ) return;
		setSlugEdited( true );
		onChange( { ...color, slug: toSlug( slug ) } );
	};

	return (
		<Card size="small">
			<CardBody>
				<Flex align="center" gap={ 3 }>
					<FlexItem>
						<Dropdown
							renderToggle={ ( { isOpen, onToggle } ) => (
								<button
									type="button"
									aria-expanded={ isOpen }
									onClick={ onToggle }
									style={ {
										width: 40,
										height: 40,
										borderRadius: 4,
										border: '1px solid #ddd',
										cursor: 'pointer',
										padding: 0,
										background: color.color || '#000',
									} }
								/>
							) }
							renderContent={ () => (
								<div style={ { padding: 16 } }>
									<ColorPicker
										color={ color.color }
										onChange={ ( newColor ) =>
											onChange( { ...color, color: newColor } )
										}
										enableAlpha={ true }
									/>
								</div>
							) }
						/>
					</FlexItem>

					<FlexBlock>
						<HStack alignment="stretch" spacing={ 3 }>
							<TextControl
								placeholder={ __( 'Primary', 'multisite-override-style' ) }
								value={ color.name }
								onChange={ handleNameChange }
								__nextHasNoMarginBottom
								readOnly={ isLocked }
								disabled={ isLocked }
							/>
							<TextControl
								placeholder={ __( 'primary', 'multisite-override-style' ) }
								value={ color.slug }
								onChange={ handleSlugChange }
								__nextHasNoMarginBottom
								readOnly={ isLocked }
								disabled={ isLocked }
							/>
						</HStack>
					</FlexBlock>

					<FlexItem>
						<Button
							icon="trash"
							isDestructive
							variant="tertiary"
							onClick={ onRemove }
							label={ __( 'Remove', 'multisite-override-style' ) }
							size="compact"
						/>
					</FlexItem>
				</Flex>
			</CardBody>
		</Card>
	);
}

export default function ColorPaletteField( { colors, onChange, lockedSlugs = new Set() } ) {
	const addColor = () => {
		onChange( [ ...colors, { name: '', slug: '', color: '#000000' } ] );
	};

	const updateColor = ( index, updated ) => {
		const next = [ ...colors ];
		next[ index ] = updated;
		onChange( next );
	};

	const removeColor = ( index ) => {
		onChange( colors.filter( ( _, i ) => i !== index ) );
	};

	return (
		<Panel>
			<PanelBody
				title={ __( 'Color Palette', 'multisite-override-style' ) }
				initialOpen={ true }
			>
				<p className="description">
					{ __( 'Override colors available in the block editor.', 'multisite-override-style' ) }
				</p>
				<div style={ { display: 'flex', padding: '0 56px 8px 56px', fontSize: 11, fontWeight: 500, color: '#757575', textTransform: 'uppercase' } }>
					<span style={ { flex: 1 } }>{ __( 'Name', 'multisite-override-style' ) }</span>
					<span style={ { flex: 1 } }>{ __( 'Identifier', 'multisite-override-style' ) }</span>
				</div>

				<VStack spacing={ 3 }>
					{ colors.map( ( color, index ) => (
						<ColorRow
							key={ index }
							color={ color }
							onChange={ ( updated ) => updateColor( index, updated ) }
							onRemove={ () => removeColor( index ) }
							isLocked={ lockedSlugs.has( color.slug ) }
						/>
					) ) }
				</VStack>

				<div style={ { marginTop: 16 } }>
					<Button variant="secondary" onClick={ addColor }>
						{ __( '+ Add color', 'multisite-override-style' ) }
					</Button>
				</div>
			</PanelBody>
		</Panel>
	);
}

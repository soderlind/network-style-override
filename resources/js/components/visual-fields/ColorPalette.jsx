import { useState, useEffect } from '@wordpress/element';
import {
	Button,
	TextControl,
	ColorPicker,
	Popover,
	Panel,
	PanelBody,
	BaseControl,
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

function ColorRow( { color, onChange, onRemove, index } ) {
	const [ pickerOpen, setPickerOpen ] = useState( false );
	const [ slugEdited, setSlugEdited ] = useState( !! color.slug );

	// Auto-generate slug from name if user hasn't manually edited it
	const handleNameChange = ( name ) => {
		const updates = { ...color, name };
		if ( ! slugEdited ) {
			updates.slug = toSlug( name );
		}
		onChange( updates );
	};

	const handleSlugChange = ( slug ) => {
		setSlugEdited( true );
		onChange( { ...color, slug: toSlug( slug ) } );
	};

	return (
		<div className="mos-color-row">
			<div className="mos-color-row__swatch">
				<button
					className="mos-color-swatch"
					style={ { backgroundColor: color.color } }
					onClick={ () => setPickerOpen( ( v ) => ! v ) }
					aria-label={ __( 'Pick color', 'multisite-override-style' ) }
					title={ color.color }
				/>
				<code className="mos-color-hex">{ color.color }</code>
			</div>

			{ pickerOpen && (
				<Popover onClose={ () => setPickerOpen( false ) }>
					<ColorPicker
						color={ color.color }
						onChange={ ( hex ) =>
							onChange( { ...color, color: hex } )
						}
						enableAlpha={ false }
					/>
				</Popover>
			) }

			<div className="mos-color-row__fields">
				<TextControl
					label={ __( 'Display Name', 'multisite-override-style' ) }
					help={ __( 'Shown in the editor color picker', 'multisite-override-style' ) }
					placeholder={ __( 'e.g. Primary Blue', 'multisite-override-style' ) }
					value={ color.name }
					onChange={ handleNameChange }
				/>

				<TextControl
					label={ __( 'Identifier', 'multisite-override-style' ) }
					help={ __( 'Used in CSS variables: --wp--preset--color--{identifier}', 'multisite-override-style' ) }
					placeholder={ __( 'e.g. primary-blue', 'multisite-override-style' ) }
					value={ color.slug }
					onChange={ handleSlugChange }
				/>
			</div>

			<Button
				isDestructive
				variant="tertiary"
				onClick={ onRemove }
				className="mos-color-row__remove"
			>
				{ __( 'Remove', 'multisite-override-style' ) }
			</Button>
		</div>
	);
}

export default function ColorPaletteField( { colors, onChange } ) {
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
					{ __( 'Define colors available in the block editor. Each color needs a display name and an identifier.', 'multisite-override-style' ) }
				</p>
				<div className="mos-color-palette">
					{ colors.map( ( color, index ) => (
						<ColorRow
							key={ index }
							index={ index }
							color={ color }
							onChange={ ( updated ) =>
								updateColor( index, updated )
							}
							onRemove={ () => removeColor( index ) }
						/>
					) ) }

					<Button variant="secondary" onClick={ addColor }>
						{ __( '+ Add color', 'multisite-override-style' ) }
					</Button>
				</div>
			</PanelBody>
		</Panel>
	);
}

import { useState } from '@wordpress/element';
import {
	ColorPicker,
	ColorIndicator,
	Dropdown,
	Panel,
	PanelBody,
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

function ColorRow( { color, onChange, isLocked } ) {
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
		<div className="nso-preset-row">
			<div className="nso-preset-row__preview">
				<Dropdown
					renderToggle={ ( { isOpen, onToggle } ) => (
						<button
							type="button"
							className="nso-swatch-toggle"
							aria-label={ __( 'Edit color', 'network-style-override' ) }
							aria-expanded={ isOpen }
							onClick={ onToggle }
						>
							<ColorIndicator colorValue={ color.color || '#000' } />
						</button>
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
			</div>

			<div className="nso-preset-row__fields">
				<NameSlugFields
					name={ color.name }
					slug={ color.slug }
					isLocked={ isLocked }
					onNameChange={ handleNameChange }
					onSlugChange={ handleSlugChange }
					namePlaceholder={ __( 'Primary', 'network-style-override' ) }
					slugPlaceholder={ __( 'primary', 'network-style-override' ) }
				/>
			</div>
		</div>
	);
}

export default function ColorPaletteField( { colors, onChange, lockedSlugs = new Set() } ) {
	const updateColor = ( index, updated ) => {
		const next = [ ...colors ];
		next[ index ] = updated;
		onChange( next );
	};

	return (
		<Panel>
			<PanelBody
				title={ __( 'Color Palette', 'network-style-override' ) }
				initialOpen={ true }
			>
				<p className="description">
					{ __( 'Override colors available in the block editor.', 'network-style-override' ) }
				</p>

				<div className="nso-preset-list">
					<div className="nso-preset-list__header">
						<span>{ __( 'Name', 'network-style-override' ) }</span>
						<span>{ __( 'Identifier', 'network-style-override' ) }</span>
					</div>

					{ colors.map( ( color, index ) => (
						<ColorRow
							key={ index }
							color={ color }
							onChange={ ( updated ) => updateColor( index, updated ) }
							isLocked={ lockedSlugs.has( color.slug ) }
						/>
					) ) }
				</div>
			</PanelBody>
		</Panel>
	);
}

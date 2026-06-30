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

export default function Spacing( { spacingSizes, onChange } ) {
	const [ slugsEdited, setSlugsEdited ] = useState( {} );

	const add = () =>
		onChange( [ ...spacingSizes, { name: '', slug: '', size: '' } ] );

	const updateName = ( index, name ) => {
		const next = [ ...spacingSizes ];
		next[ index ] = { ...next[ index ], name };
		if ( ! slugsEdited[ index ] ) {
			next[ index ].slug = toSlug( name );
		}
		onChange( next );
	};

	const updateSlug = ( index, slug ) => {
		setSlugsEdited( { ...slugsEdited, [ index ]: true } );
		const next = [ ...spacingSizes ];
		next[ index ] = { ...next[ index ], slug: toSlug( slug ) };
		onChange( next );
	};

	const update = ( index, field, val ) => {
		const next = [ ...spacingSizes ];
		next[ index ] = { ...next[ index ], [ field ]: val };
		onChange( next );
	};

	const remove = ( index ) =>
		onChange( spacingSizes.filter( ( _, i ) => i !== index ) );

	return (
		<Panel>
			<PanelBody
				title={ __( 'Spacing Scale', 'multisite-override-style' ) }
				initialOpen={ false }
			>
				<p className="description">
					{ __(
						'Define spacing presets for padding, margin, and gap. These appear in the block editor spacing controls.',
						'multisite-override-style'
					) }
				</p>

				{ spacingSizes.map( ( item, i ) => (
					<div key={ i } className="mos-spacing-row">
						<TextControl
							label={ __( 'Display Name', 'multisite-override-style' ) }
							help={ __( 'Shown in the spacing picker (e.g. Small, Medium)', 'multisite-override-style' ) }
							placeholder={ __( 'e.g. Medium', 'multisite-override-style' ) }
							value={ item.name }
							onChange={ ( v ) => updateName( i, v ) }
						/>
						<TextControl
							label={ __( 'Identifier', 'multisite-override-style' ) }
							help={ __( 'Used in CSS: --wp--preset--spacing--{identifier}', 'multisite-override-style' ) }
							placeholder={ __( 'e.g. medium', 'multisite-override-style' ) }
							value={ item.slug }
							onChange={ ( v ) => updateSlug( i, v ) }
						/>
						<TextControl
							label={ __( 'CSS Value', 'multisite-override-style' ) }
							help={ __( 'Any valid CSS size', 'multisite-override-style' ) }
							value={ item.size }
							onChange={ ( v ) => update( i, 'size', v ) }
							placeholder="e.g. 1.5rem, 24px, clamp(1rem,3vw,2rem)"
						/>
						<Button
							isDestructive
							variant="tertiary"
							onClick={ () => remove( i ) }
						>
							{ __( 'Remove', 'multisite-override-style' ) }
						</Button>
					</div>
				) ) }

				<Button variant="secondary" onClick={ add }>
					{ __( '+ Add spacing size', 'multisite-override-style' ) }
				</Button>
			</PanelBody>
		</Panel>
	);
}

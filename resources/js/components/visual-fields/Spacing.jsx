import { useState } from '@wordpress/element';
import {
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
];

export default function Spacing( { spacingSizes, onChange, lockedSlugs = new Set() } ) {
	const [ slugsEdited, setSlugsEdited ] = useState( {} );

	const updateName = ( index, name ) => {
		const next = [ ...spacingSizes ];
		const isLocked = lockedSlugs.has( next[ index ].slug );
		if ( isLocked ) return;
		next[ index ] = { ...next[ index ], name };
		if ( ! slugsEdited[ index ] ) {
			next[ index ].slug = toSlug( name );
		}
		onChange( next );
	};

	const updateSlug = ( index, slug ) => {
		const isLocked = lockedSlugs.has( spacingSizes[ index ].slug );
		if ( isLocked ) return;
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

	return (
		<Panel>
			<PanelBody
				title={ __( 'Spacing Scale', 'network-style-override' ) }
				initialOpen={ false }
			>
				<p className="description">
					{ __( 'Override spacing presets for padding, margin, and gap.', 'network-style-override' ) }
				</p>
				<div className="nso-preset-list">
					<div className="nso-preset-list__header">
						<span>{ __( 'Name', 'network-style-override' ) }</span>
						<span>{ __( 'Identifier', 'network-style-override' ) }</span>
						<span>{ __( 'Size', 'network-style-override' ) }</span>
					</div>

					{ spacingSizes.map( ( item, i ) => {
						const isLocked = lockedSlugs.has( item.slug );
						return (
							<div key={ i } className="nso-preset-row">
								<div className="nso-preset-row__preview">
									<div className="nso-preview-tile">
										<div
											style={ {
												width: Math.min( parseInt( item.size ) || 16, 24 ),
												height: Math.min( parseInt( item.size ) || 16, 24 ),
												background: '#fff',
												borderRadius: 2,
											} }
										/>
									</div>
								</div>
								<div className="nso-preset-row__fields">
									<NameSlugFields
										name={ item.name }
										slug={ item.slug }
										isLocked={ isLocked }
										onNameChange={ ( v ) => updateName( i, v ) }
										onSlugChange={ ( v ) => updateSlug( i, v ) }
										namePlaceholder={ __( 'Medium', 'network-style-override' ) }
										slugPlaceholder={ __( 'medium', 'network-style-override' ) }
									/>
									<UnitControl
										value={ item.size }
										onChange={ ( v ) => update( i, 'size', v ) }
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
	);
}

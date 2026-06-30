import ColorPalette from '../visual-fields/ColorPalette';
import Typography from '../visual-fields/Typography';
import Spacing from '../visual-fields/Spacing';
import BorderControls from '../visual-fields/BorderControls';

function getPath( obj, ...keys ) {
	return keys.reduce(
		( acc, key ) =>
			acc && acc[ key ] !== undefined ? acc[ key ] : undefined,
		obj
	);
}

function setPath( obj, keys, value ) {
	if ( keys.length === 0 ) {
		return value;
	}
	const [ head, ...tail ] = keys;
	return {
		...obj,
		[ head ]: setPath( obj?.[ head ] ?? {}, tail, value ),
	};
}

export default function VisualTab( { value, onChange, originalValue } ) {
	const update = ( keys, fieldValue ) => {
		onChange( setPath( value ?? {}, keys, fieldValue ) );
	};

	// Extract original slugs for each preset type to lock them.
	const originalColorSlugs = new Set(
		( getPath( originalValue, 'settings', 'color', 'palette' ) ?? [] ).map(
			( c ) => c.slug
		)
	);
	const originalFontFamilySlugs = new Set(
		(
			getPath( originalValue, 'settings', 'typography', 'fontFamilies' ) ??
			[]
		).map( ( f ) => f.slug )
	);
	const originalFontSizeSlugs = new Set(
		(
			getPath( originalValue, 'settings', 'typography', 'fontSizes' ) ?? []
		).map( ( s ) => s.slug )
	);
	const originalSpacingSlugs = new Set(
		(
			getPath( originalValue, 'settings', 'spacing', 'spacingSizes' ) ?? []
		).map( ( s ) => s.slug )
	);

	return (
		<div className="mos-visual-tab">
			<ColorPalette
				colors={
					getPath( value, 'settings', 'color', 'palette' ) ?? []
				}
				onChange={ ( colors ) =>
					update( [ 'settings', 'color', 'palette' ], colors )
				}
				lockedSlugs={ originalColorSlugs }
			/>

			<Typography
				fontFamilies={
					getPath(
						value,
						'settings',
						'typography',
						'fontFamilies'
					) ?? []
				}
				fontSizes={
					getPath( value, 'settings', 'typography', 'fontSizes' ) ??
					[]
				}
				onChange={ ( typography ) =>
					update( [ 'settings', 'typography' ], {
						...( getPath( value, 'settings', 'typography' ) ?? {} ),
						...typography,
					} )
				}
				lockedFamilySlugs={ originalFontFamilySlugs }
				lockedSizeSlugs={ originalFontSizeSlugs }
			/>

			<Spacing
				spacingSizes={
					getPath( value, 'settings', 'spacing', 'spacingSizes' ) ??
					[]
				}
				onChange={ ( sizes ) =>
					update( [ 'settings', 'spacing', 'spacingSizes' ], sizes )
				}
				lockedSlugs={ originalSpacingSlugs }
			/>

			<BorderControls
				border={ getPath( value, 'styles', 'border' ) ?? {} }
				onChange={ ( border ) =>
					update( [ 'styles', 'border' ], border )
				}
			/>
		</div>
	);
}

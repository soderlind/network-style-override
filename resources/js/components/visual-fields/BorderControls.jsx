import {
	Panel,
	PanelBody,
	BaseControl,
	ColorPicker,
	ColorIndicator,
	Dropdown,
	SelectControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const CSS_UNITS = [
	{ value: 'px', label: 'px' },
	{ value: 'em', label: 'em' },
	{ value: 'rem', label: 'rem' },
];

const BORDER_STYLES = [
	{ value: '', label: __( 'None', 'network-style-override' ) },
	{ value: 'solid', label: __( 'Solid', 'network-style-override' ) },
	{ value: 'dashed', label: __( 'Dashed', 'network-style-override' ) },
	{ value: 'dotted', label: __( 'Dotted', 'network-style-override' ) },
	{ value: 'double', label: __( 'Double', 'network-style-override' ) },
];

export default function BorderControls( { border, onChange } ) {
	const update = ( field, val ) => onChange( { ...border, [ field ]: val } );

	return (
		<Panel>
			<PanelBody
				title={ __( 'Border Defaults', 'network-style-override' ) }
				initialOpen={ false }
			>
				<p className="description">
					{ __( 'Override default border styles.', 'network-style-override' ) }
				</p>

				<div className="nso-border">
					<BaseControl
						label={ __( 'Preview', 'network-style-override' ) }
						__nextHasNoMarginBottom
					>
						<div
							className="nso-border-preview"
							style={ {
								borderRadius: border.radius || 0,
								borderWidth: border.width || '1px',
								borderStyle: border.style || 'solid',
								borderColor: border.color || '#ddd',
							} }
						/>
					</BaseControl>

					<div className="nso-border__controls">
						<UnitControl
							label={ __( 'Radius', 'network-style-override' ) }
							value={ border.radius ?? '' }
							onChange={ ( v ) => update( 'radius', v ) }
							units={ CSS_UNITS }
							__nextHasNoMarginBottom
						/>
						<UnitControl
							label={ __( 'Width', 'network-style-override' ) }
							value={ border.width ?? '' }
							onChange={ ( v ) => update( 'width', v ) }
							units={ CSS_UNITS }
							__nextHasNoMarginBottom
						/>
						<SelectControl
							label={ __( 'Style', 'network-style-override' ) }
							value={ border.style ?? '' }
							options={ BORDER_STYLES }
							onChange={ ( v ) => update( 'style', v ) }
							__nextHasNoMarginBottom
						/>
						<BaseControl
							className="nso-border__color"
							label={ __( 'Color', 'network-style-override' ) }
							__nextHasNoMarginBottom
						>
							<Dropdown
								renderToggle={ ( { isOpen, onToggle } ) => (
									<button
										type="button"
										className="nso-swatch-toggle"
										aria-label={ __( 'Edit border color', 'network-style-override' ) }
										aria-expanded={ isOpen }
										onClick={ onToggle }
									>
										<ColorIndicator colorValue={ border.color || '#ddd' } />
									</button>
								) }
								renderContent={ () => (
									<div style={ { padding: 16 } }>
										<ColorPicker
											color={ border.color ?? '#ddd' }
											onChange={ ( v ) => update( 'color', v ) }
											enableAlpha={ true }
										/>
									</div>
								) }
							/>
						</BaseControl>
					</div>
				</div>
			</PanelBody>
		</Panel>
	);
}

import {
	Panel,
	PanelBody,
	ColorPicker,
	Dropdown,
	SelectControl,
	Flex,
	FlexItem,
	FlexBlock,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const CSS_UNITS = [
	{ value: 'px', label: 'px' },
	{ value: 'em', label: 'em' },
	{ value: 'rem', label: 'rem' },
];

const BORDER_STYLES = [
	{ value: '', label: __( 'None', 'multisite-override-style' ) },
	{ value: 'solid', label: __( 'Solid', 'multisite-override-style' ) },
	{ value: 'dashed', label: __( 'Dashed', 'multisite-override-style' ) },
	{ value: 'dotted', label: __( 'Dotted', 'multisite-override-style' ) },
	{ value: 'double', label: __( 'Double', 'multisite-override-style' ) },
];

export default function BorderControls( { border, onChange } ) {
	const update = ( field, val ) => onChange( { ...border, [ field ]: val } );

	return (
		<Panel>
			<PanelBody
				title={ __( 'Border Defaults', 'multisite-override-style' ) }
				initialOpen={ false }
			>
				<p className="description">
					{ __( 'Override default border styles.', 'multisite-override-style' ) }
				</p>

				<Flex align="flex-start" gap={ 4 }>
					<FlexItem>
						<VStack spacing={ 2 }>
							<span style={ { fontSize: 11, color: '#757575' } }>
								{ __( 'Preview', 'multisite-override-style' ) }
							</span>
							<div
								style={ {
									width: 60,
									height: 60,
									borderRadius: border.radius || 0,
									borderWidth: border.width || '1px',
									borderStyle: border.style || 'solid',
									borderColor: border.color || '#ddd',
									background: '#f9f9f9',
								} }
							/>
						</VStack>
					</FlexItem>

					<FlexBlock>
						<VStack spacing={ 3 }>
							<HStack alignment="stretch" spacing={ 3 }>
								<UnitControl
									label={ __( 'Radius', 'multisite-override-style' ) }
									value={ border.radius ?? '' }
									onChange={ ( v ) => update( 'radius', v ) }
									units={ CSS_UNITS }
									__nextHasNoMarginBottom
								/>
								<UnitControl
									label={ __( 'Width', 'multisite-override-style' ) }
									value={ border.width ?? '' }
									onChange={ ( v ) => update( 'width', v ) }
									units={ CSS_UNITS }
									__nextHasNoMarginBottom
								/>
							</HStack>

							<HStack alignment="stretch" spacing={ 3 }>
								<SelectControl
									label={ __( 'Style', 'multisite-override-style' ) }
									value={ border.style ?? '' }
									options={ BORDER_STYLES }
									onChange={ ( v ) => update( 'style', v ) }
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>

								<VStack spacing={ 1 }>
									<span style={ { fontSize: 11, fontWeight: 500, textTransform: 'uppercase' } }>
										{ __( 'Color', 'multisite-override-style' ) }
									</span>
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
													background: border.color || '#ddd',
												} }
											/>
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
								</VStack>
							</HStack>
						</VStack>
					</FlexBlock>
				</Flex>
			</PanelBody>
		</Panel>
	);
}

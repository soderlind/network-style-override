import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import VisualTab from './VisualTab';
import RawJsonTab from './RawJsonTab';

export default function ThemeJsonEditor( { value, onChange, originalValue } ) {
	const tabs = [
		{ name: 'visual', title: __( 'Visual', 'multisite-override-style' ) },
		{ name: 'raw', title: __( 'Raw JSON', 'multisite-override-style' ) },
	];

	return (
		<div className="mos-theme-json-editor">
			<p className="description">
				{ __(
					'Values are deep-merged into the user (Global Styles) layer — network values take precedence. Applies to block themes only.',
					'multisite-override-style'
				) }
			</p>

			<TabPanel tabs={ tabs }>
				{ ( tab ) => (
					<>
						{ tab.name === 'visual' && (
							<VisualTab value={ value } onChange={ onChange } originalValue={ originalValue } />
						) }
						{ tab.name === 'raw' && (
							<RawJsonTab value={ value } onChange={ onChange } />
						) }
					</>
				) }
			</TabPanel>
		</div>
	);
}

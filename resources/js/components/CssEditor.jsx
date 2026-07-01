import CodeMirror from '@uiw/react-codemirror';
import { css as cssLang } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { Button } from '@wordpress/components';

export default function CssEditor( { value, onChange, onNavigateToSites } ) {
	return (
		<div className="mos-css-editor">
			<p className="description">
				{ createInterpolateElement(
					__(
						'CSS entered here is appended after all theme stylesheets on every subsite front-end (except <link>exempted sites</link>).',
						'network-style-override'
					),
					{
						link: (
							<Button
								variant="link"
								onClick={ onNavigateToSites }
							/>
						),
					}
				) }
			</p>

			<CodeMirror
				value={ value }
				height="500px"
				extensions={ [ cssLang() ] }
				theme={ oneDark }
				onChange={ onChange }
				basicSetup={ {
					lineNumbers: true,
					foldGutter: true,
					autocompletion: true,
				} }
			/>
		</div>
	);
}

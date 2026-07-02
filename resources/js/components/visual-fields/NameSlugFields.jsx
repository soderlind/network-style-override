import { TextControl } from '@wordpress/components';

/**
 * Renders the "Name" and "Identifier" cells for a preset row.
 *
 * Locked presets (those inherited from the active theme) cannot be renamed,
 * so they are shown as static text instead of editable inputs.
 */
export default function NameSlugFields( {
	name,
	slug,
	isLocked,
	onNameChange,
	onSlugChange,
	namePlaceholder,
	slugPlaceholder,
} ) {
	if ( isLocked ) {
		return (
			<>
				<span className="nso-preset-text">{ name }</span>
				<span className="nso-preset-text is-slug">{ slug }</span>
			</>
		);
	}

	return (
		<>
			<TextControl
				placeholder={ namePlaceholder }
				value={ name }
				onChange={ onNameChange }
				__nextHasNoMarginBottom
			/>
			<TextControl
				placeholder={ slugPlaceholder }
				value={ slug }
				onChange={ onSlugChange }
				__nextHasNoMarginBottom
			/>
		</>
	);
}

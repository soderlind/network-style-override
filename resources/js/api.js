import apiFetch from '@wordpress/api-fetch';

const { restUrl, nonce } = window.mosAdminData ?? {};

apiFetch.use( apiFetch.createRootURLMiddleware( restUrl ) );
apiFetch.use( apiFetch.createNonceMiddleware( nonce ) );

export const getSettings = () => apiFetch( { path: '/mos/v1/settings' } );

export const saveSettings = ( { css, theme_json } ) =>
	apiFetch( {
		path: '/mos/v1/settings',
		method: 'POST',
		data: { css, theme_json },
	} );

export const getRevisions = () => apiFetch( { path: '/mos/v1/revisions' } );

export const restoreRevision = ( id ) =>
	apiFetch( {
		path: `/mos/v1/revisions/${ id }/restore`,
		method: 'POST',
	} );

export const getSites = () => apiFetch( { path: '/mos/v1/sites' } );

export const setExemption = ( id, exempted ) =>
	apiFetch( {
		path: `/mos/v1/sites/${ id }/exemption`,
		method: 'POST',
		data: { id, exempted },
	} );

export const createPreview = ( { css, theme_json, site_url } ) =>
	apiFetch( {
		path: '/mos/v1/preview',
		method: 'POST',
		data: { css, theme_json, site_url },
	} );

export const discardPreview = ( token ) =>
	apiFetch( {
		path: `/mos/v1/preview/${ token }`,
		method: 'DELETE',
	} );

export const exportSettings = () => apiFetch( { path: '/mos/v1/export' } );

export const importSettings = ( bundle ) =>
	apiFetch( {
		path: '/mos/v1/import',
		method: 'POST',
		data: bundle,
	} );

// Theme-specific overrides
export const getNetworkThemes = () =>
	apiFetch( { path: '/mos/v1/network-themes' } );

export const getThemeOverrides = () =>
	apiFetch( { path: '/mos/v1/theme-overrides' } );

export const getThemeOverride = ( slug ) =>
	apiFetch( { path: `/mos/v1/theme-overrides/${ slug }` } );

export const saveThemeOverride = ( slug, { css, theme_json } ) =>
	apiFetch( {
		path: `/mos/v1/theme-overrides/${ slug }`,
		method: 'POST',
		data: { slug, css, theme_json },
	} );

export const deleteThemeOverride = ( slug ) =>
	apiFetch( {
		path: `/mos/v1/theme-overrides/${ slug }`,
		method: 'DELETE',
	} );

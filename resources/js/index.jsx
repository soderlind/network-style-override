import { createRoot } from '@wordpress/element';
import App from './components/App';
import './style.scss';

const root = document.getElementById( 'nso-admin-app' );
if ( root ) {
	createRoot( root ).render( <App /> );
}

import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './store';

import { setShortDateFormat } from './utils';
import { setAfterLoginRedirection } from './actions/login';

import Login from './pages/Login';
import Layout from './pages/Layout';
import './utils';

localStorage.removeItem( 'currentUser' );
localStorage.removeItem( 'om-auth-token' );

/* momentjs config */
setShortDateFormat();

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<HashRouter>
					<Switch>
						<Route path='/login/:userId?/:authToken?' component={Login} />
						<Route path='/' render={this.renderLayoutIfUserLoggedIn.bind( this )} />
					</Switch>
				</HashRouter>
			</Provider>
		);
	}

	renderLayoutIfUserLoggedIn( props ) {
		if ( store.getState().currentUser !== null )
			return <Layout location={props.location} />;

		// redirect to login and then back to the original url
		this.setRedictionAfterLogin( props.location.pathname );
		return <Redirect to="/login" />;
	}

	setRedictionAfterLogin( url ) {
		store.dispatch( setAfterLoginRedirection( url ) );
	}
}
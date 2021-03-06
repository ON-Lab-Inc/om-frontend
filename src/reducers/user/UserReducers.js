import {
	RECEIVE_USER_AUTH
} from './../../actions/types';

export function currentUser(state, action) {
	if (state === undefined) return null;

	switch (action.type) {
		case RECEIVE_USER_AUTH:
			let newCurrentUser = { loggedIn : new Date() }
			const { user, error } = action.payload;
			if (user) newCurrentUser.user = user;
			if (error) newCurrentUser.error = error;
			return newCurrentUser;

		default:
			return state;
	}
}
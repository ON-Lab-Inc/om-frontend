import superagent from 'superagent';
import { Endpoints, EndpointAuth, testForErrorReturned } from './endpoints';
import { addError } from './messages';
import { 
	REQUEST_LATEST_ACTIVITY_LIST_PAGE,
	RECEIVE_LATEST_ACTIVITY_LIST_PAGE,
	INVALIDATE_LATEST_ACTIVITY
} from './types';


function requestLatestActvityPage(page) {
	return { type: REQUEST_LATEST_ACTIVITY_LIST_PAGE }
}

function receiveLatestActivityPage(latestActivityPage) {
	return { type: RECEIVE_LATEST_ACTIVITY_LIST_PAGE, payload: latestActivityPage }
}

function fetchLatestActivityPage(page) {
	return function(dispatch) {
		dispatch(requestLatestActvityPage(page));
		superagent
			.get(Endpoints.GET_LATEST_ACTIVITY_PAGE(page))
			.set(...EndpointAuth())
			.then(response => response.body)
			.then(testForErrorReturned)
			.then(body => dispatch(receiveLatestActivityPage(body)))
			// error handling
			.catch(error => dispatch(addError(error.message, 'Latest activity')));
	}
}

function shouldFetchLatestActivityPage(page, state) {
	// already fetching. don't fetch
	if (state.isFetching) return false;
	// fetch if date is different or we've invalidated
	return state.didInvalidate;
}

export function fetchLatestActivityPageIfNeeded(page = 1) {
	return function(dispatch, getState) {
		if (shouldFetchLatestActivityPage(page, getState().dashboardView.latestActivity)) {
			return dispatch(fetchLatestActivityPage(page));
		}
	}
}

export function invalidateLatestActivity() {
	return { type: INVALIDATE_LATEST_ACTIVITY }
}
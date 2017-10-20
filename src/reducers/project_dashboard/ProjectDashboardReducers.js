import { 
	REQUEST_QUERY_OBJECTIVES,
	RECEIVE_QUERY_OBJECTIVES,
	PROJECT_DASHBOARD_SET_VISIBLE_PROJECT,
	INVALIDATE_PROJECT_DASHBOARD,
	REQUEST_BILLING_FOR_PROJECT,
	RECEIVE_BILLING_FOR_PROJECT,
	REQUEST_PROJECT_WORK_ENTRIES,
	RECEIVE_PROJECT_WORK_ENTRIES,
	SET_PROJECT_DASHBOARD_WORK_ENTRIES_FILTER
} from './../../actions/types';

import update from 'immutability-helper';


export function projectDashboardView(state, action) {
	if (state === undefined) return {
		visibleProject 	: null, 
		objectives 		: objectives(),
		billing 		: billing(),
		workEntries		: workEntries()
	}

	switch (action.type) {
		case REQUEST_QUERY_OBJECTIVES:
		case RECEIVE_QUERY_OBJECTIVES:
			return update(state, {objectives: {$set: objectives(state.objectives, action)}})

		case INVALIDATE_PROJECT_DASHBOARD:
			return update(state, {
				objectives: {$set: objectives(state.objectives, action)},
				workEntries: {$set: workEntries(state.workEntries, action)},
				billing: {$set: billing(state.billing, action)}
			})
		
		case PROJECT_DASHBOARD_SET_VISIBLE_PROJECT:
			return update(state, {visibleProject: {$set: action.payload}})

		case RECEIVE_BILLING_FOR_PROJECT:
		case REQUEST_BILLING_FOR_PROJECT:
			return update(state, {billing: {$set: billing(state.billing, action)}})

		case REQUEST_PROJECT_WORK_ENTRIES:
		case RECEIVE_PROJECT_WORK_ENTRIES:
		case SET_PROJECT_DASHBOARD_WORK_ENTRIES_FILTER:
			return update(state, {workEntries: {$set: workEntries(state.workEntries, action)}})

		default:
			return state;
	}
}

function billing(state, action) {
	if (state === undefined) return {
		didInvalidate: true,
		isFetching: false,
		project: null
	}

	switch (action.type) {
		case REQUEST_BILLING_FOR_PROJECT:
			return update(state, {isFetching: {$set: true}})

		case RECEIVE_BILLING_FOR_PROJECT: {
			return update(state, {
				didInvalidate: {$set: false},
				isFetching: {$set: false},
				project: {$set: action.payload}
			})
		}

		case INVALIDATE_PROJECT_DASHBOARD:
			return update(state, {
				didInvalidate: {$set: true},
				project: {$set: null}
			})

		default:
			return state;
	}
}

function objectives(state, action) {
	if (state === undefined) return {
		archived: {
			isFetching 		: false,
			didInvalidate	: true,
			list 			: []
		},
		active: {
			isFetching 		: false,
			didInvalidate	: true,
			list 			: []
		}
	}

	switch (action.type) {
		case RECEIVE_QUERY_OBJECTIVES: {
			const { objectives, collection } = action.payload;
			return update(state, { [collection] : {
				didInvalidate: {$set: false},
				isFetching: {$set: false},
				list: {$set: objectives}
			}})
		}

		case REQUEST_QUERY_OBJECTIVES: {
			const { collection } = action.payload;
			return update(state, { [collection] : {isFetching: {$set: true}}})
		}

		case INVALIDATE_PROJECT_DASHBOARD:
			return update(state, { 
				archived: {
					didInvalidate: {$set: true},
					list: {$set: []}
				},
				active: {
					didInvalidate: {$set: true},
					list: {$set: []}
				}
			})

		default: 
			return state;
	}
}

function workEntries(state, action) {
	if (state === undefined) return {
		isFetching 		: false,
		didInvalidate 	: true,
		entries 		: [],
		filters 		: {}
	}

	switch (action.type) {
		case REQUEST_PROJECT_WORK_ENTRIES:
			return update(state, {isFetching: {$set: true}})

		case RECEIVE_PROJECT_WORK_ENTRIES:
			return update(state, {
				didInvalidate: {$set: false},
				isFetching: {$set: false},
				entries: {$set: action.payload}
			})

		case SET_PROJECT_DASHBOARD_WORK_ENTRIES_FILTER:
			return update(state, {
				didInvalidate: {$set: true},
				filters: {$set: action.payload}
			})

		case INVALIDATE_PROJECT_DASHBOARD:
			return update(state, {
				didInvalidate: {$set: false},
				entries: {$set: []},
				filters: {$set: {}}
			})

		default:
			return state;
	}
}

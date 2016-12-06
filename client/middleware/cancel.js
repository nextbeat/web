import { assign, includes } from 'lodash-es'
import { ActionTypes, API_CANCEL } from '../actions'

// Redux middleware function which looks for actions with a API_CANCEL
// attribute and dispatches an additional CLEAR_FETCH actions
export default store => next => action => {

    const apiCancel = action[API_CANCEL]
    if (typeof apiCancel === 'undefined') {
        return next(action);
    }

    // send the action without the API_CANCEL attribute
    let newAction = assign({}, action)
    delete newAction[API_CANCEL];
    next(newAction);

    // clear fetches
    const fetches = store.getState().get('fetches').filter(f => includes(apiCancel.actionTypes, f.get('type')))
    fetches.forEach(f => {
        f.get('fetchPromise').cancel();
    })

    // dispatch a new CLEAR_FETCH action to clean up state tree in reducer
    let fetchAction = {
        type: ActionTypes.CLEAR_FETCH,
        fetchPromises: fetches.map(f => f.get('fetchPromise')).toJS()
    }
    store.dispatch(fetchAction)
}
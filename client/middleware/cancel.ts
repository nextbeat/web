import assign from 'lodash-es/assign'
import includes from 'lodash-es/includes'
import { ActionType, Action } from '@actions/types'
import { Store, Dispatch, State } from '@types'

// Redux middleware function which looks for actions with a API_CANCEL
// attribute and dispatches an additional CLEAR_FETCH actions
export default (store: Store) => (next: Dispatch) => (action: Action) => {

    const apiCancel = action.API_CANCEL
    if (typeof apiCancel === 'undefined') {
        return next(action);
    }

    // send the action without the API_CANCEL attribute
    let newAction = assign({}, action)
    delete newAction.API_CANCEL
    next(newAction);

    // clear fetches
    const fetches = store.getState().get('fetches').filter((f: State)  => includes(apiCancel.actionTypes, f.get('type')))
    fetches.forEach((f: State) => {
        f.get('fetchPromise').cancel();
    })

    // dispatch a new CLEAR_FETCH action to clean up state tree in reducer
    let fetchAction = {
        type: ActionType.CLEAR_FETCH,
        fetchPromises: fetches.map((f: State) => f.get('fetchPromise')).toJS()
    }
    store.dispatch(fetchAction)
}
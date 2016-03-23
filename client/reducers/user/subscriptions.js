import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { paginate } from '../utils'

export default function subscriptions(state=Map(), action) {

    if (action.type === ActionTypes.SUBSCRIPTIONS) {

        state = paginate(ActionTypes.SUBSCRIPTIONS)(state, action)
        // We don't need (or want) the usual pagination metadata here
        return state.delete('beforeDate').delete('limit').delete('page').delete('total');

    } else if (action.type === ActionTypes.SUBSCRIBE && action.status === Status.SUCCESS) {

        if (state.get('ids', List()).includes(action.id)) {
            return state;
        }
        return state.update('ids', List(), ids => ids.unshift(action.id));

    } else if (action.type === ActionTypes.UNSUBSCRIBE && action.status === Status.SUCCESS) {

        const index = state.get('ids', List()).indexOf(action.id);
        if (index === -1) {
            return state;
        }
        return state.update('ids', List(), ids => ids.delete(index));

    }
    return state;
}

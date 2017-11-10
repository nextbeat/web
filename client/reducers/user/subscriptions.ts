import { Map, List } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { paginate } from '@reducers/utils'

export default function subscriptions(state=Map<string, any>(), action: Action) {

    if (action.type === ActionType.SUBSCRIPTIONS) {

        state = paginate(ActionType.SUBSCRIPTIONS)(state, action)
        // We don't need (or want) the usual pagination metadata here
        return state.delete('beforeDate').delete('limit').delete('page').delete('total');

    } else if (action.type === ActionType.SUBSCRIBE && action.status === Status.SUCCESS) {

        if (state.get('ids', List()).includes(action.id)) {
            return state;
        }
        return state.update('ids', List(), ids => ids.unshift(action.id));

    } else if (action.type === ActionType.UNSUBSCRIBE && action.status === Status.SUCCESS) {

        const index = state.get('ids', List()).indexOf(action.id);
        if (index === -1) {
            return state;
        }
        return state.update('ids', List(), ids => ids.delete(index));

    }
    return state;
}

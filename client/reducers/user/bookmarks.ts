import { Map, List } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { paginate, combineReducers } from '@reducers/utils'
import { State } from '@types'

function bookmarks(stackStatus: 'open' | 'closed') {
    return function (state=Map<string, any>(), action: Action): State {
        if (action.stackStatus === stackStatus) {
            if (action.type === ActionType.BOOKMARKED_STACKS) {

                state = paginate(ActionType.BOOKMARKED_STACKS)(state, action)
                if (action.stackStatus === 'open') {
                    // We don't need (or want) the usual pagination metadata here
                    state = state.delete('beforeDate').delete('limit').delete('page').delete('total');
                }
                return state;

            } else if (action.type === ActionType.BOOKMARK && action.status === Status.SUCCESS && action.stackStatus === 'open') {

                if (state.get('ids', List()).includes(action.roomId)) {
                    return state;
                }
                return state.update('ids', List(), ids => ids.unshift(action.roomId));

            } else if (action.type === ActionType.UNBOOKMARK && action.status === Status.SUCCESS && action.stackStatus === 'open') {

                const index = state.get('ids', List()).indexOf(action.roomId);
                if (index === -1) {
                    return state;
                }
                return state.update('ids', List(), ids => ids.delete(index));

            } else if (action.type === ActionType.CLEAR_CLOSED_BOOKMARKED_STACKS && action.stackStatus === 'closed') {

                return Map();
            }
        }
        return state;
    }
}

export default combineReducers({
    open: bookmarks("open"),
    closed: bookmarks("closed")
})

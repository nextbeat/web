import { Map, List } from 'immutable'
import { ActionTypes, Status } from '../../actions'
import { paginate, combineReducers } from '../utils'

function bookmarks(stackStatus, state=Map(), action) {
    if (action.stackStatus === stackStatus) {
            if (action.type === ActionTypes.BOOKMARKED_STACKS) {

            state = paginate(ActionTypes.BOOKMARKED_STACKS)(state, action)
            if (action.stackStatus === 'open') {
                // We don't need (or want) the usual pagination metadata here
                state = state.delete('beforeDate').delete('limit').delete('page').delete('total');
            }
            return state;

        } else if (action.type === ActionTypes.BOOKMARK && action.status === Status.SUCCESS && action.stackStatus === 'open') {

            if (state.get('ids', List()).includes(action.id)) {
                return state;
            }
            return state.update('ids', List(), ids => ids.unshift(action.id));

        } else if (action.type === ActionTypes.UNBOOKMARK && action.status === Status.SUCCESS && action.stackStatus === 'open') {

            const index = state.get('ids', List()).indexOf(action.id);
            if (index === -1) {
                return state;
            }
            return state.update('ids', List(), ids => ids.delete(index));

        } else if (action.type === ActionTypes.CLEAR_CLOSED_BOOKMARKED_STACKS && action.stackStatus === 'closed') {

            return Map();
        }
    }
    return state;
}

export default combineReducers({
    open: bookmarks.bind(this, "open"),
    closed: bookmarks.bind(this, "closed")
})

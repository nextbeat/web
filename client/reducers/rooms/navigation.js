import { Map, Set } from 'immutable'
import { ActionTypes, Status } from '../../actions'

export default function(state = Map(), action) {
    if (action.type === ActionTypes.SELECT_MEDIA_ITEM) {
        return state
            .set('selected', action.id)
            .update('seen', Set(), v => v.add(action.id))
    } else if (action.type === ActionTypes.DID_PLAY_VIDEO) {
        return state.set('videoDidPlay', true)
    } else if (action.type === ActionTypes.GO_TO_COMMENT) {
        return state.set('selectedComment', action.comment.get('id'))
    } else if (action.type === ActionTypes.COMMENTS) {
        if (action.status === Status.REQUESTING && action.fetchType === 'around') {
            // Delete previous selected comment
            return state.delete('selectedComment')
        }
    }
    return state
}
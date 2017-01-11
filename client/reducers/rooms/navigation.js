import { Map, Set } from 'immutable'
import { ActionTypes } from '../../actions'

export default function(state = Map(), action) {
    if (action.type === ActionTypes.SELECT_MEDIA_ITEM) {
        return state
            .set('selected', action.id)
            .update('seen', Set(), v => v.add(action.id))
    } else if (action.type === ActionTypes.DID_PLAY_VIDEO) {
        return state.set('videoDidPlay', true)
    }
    return state
}
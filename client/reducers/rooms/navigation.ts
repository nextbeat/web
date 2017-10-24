import { Map, Set } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'

export default function(state = Map(), action: Action) {
    if (action.type === ActionType.SELECT_MEDIA_ITEM) {
        return state
            .set('selected', action.id)
            .update('seen', Set<number>(), (v: Set<number>) => v.add(action.id))
    } else if (action.type === ActionType.DID_PLAY_VIDEO) {
        return state.set('videoDidPlay', true)
    } else if (action.type === ActionType.DESELECT_COMMENT) {
        return state.delete('selectedComment')
    } else if (action.type === ActionType.GO_TO_COMMENT) {
        return state.set('selectedComment', action.comment.get('id'))
    }
    return state
}
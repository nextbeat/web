import { Map, Set } from 'immutable'
import { ActionTypes } from '../../actions'

export default function(state = Map(), action) {
    if (action.type === ActionTypes.SELECT_MEDIA_ITEM) {
        return state
            .set('selected', action.id)
            .update('seen', Set(), v => v.add(action.id))
    }
    return state
}
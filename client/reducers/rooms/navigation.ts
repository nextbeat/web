import { Map, Set } from 'immutable'
import { ActionType, Status, Action } from '@actions/types'
import { State } from '@types'

export default function(state = Map(), action: Action) {
    if (action.type === ActionType.SELECT_MEDIA_ITEM) {
        return state
            .set('selected', action.id)
            .set('isAtPlaybackEnd', false)
            .update('seen', Set<number>(), (v: Set<number>) => v.add(action.id))
    } else if (action.type === ActionType.DID_PLAY_VIDEO) {
        return state.merge({
            videoDidPlay: true,
            isAtPlaybackEnd: false
        })
    } else if (action.type === ActionType.PLAYBACK_DID_END) {
        return state.set('isAtPlaybackEnd', true)
    } else if (action.type === ActionType.DESELECT_COMMENT) {
        return state.delete('selectedComment')
    } else if (action.type === ActionType.GO_TO_COMMENT) {
        return state.set('selectedComment', action.comment.get('id'))
    } else if (action.type === ActionType.SET_CONTINUOUS_PLAY) {
        return state.set('isContinuousPlayEnabled', action.enabled)
    } else if (action.type === ActionType.UPDATE_CONTINUOUS_PLAY_COUNTDOWN) {
        return state.merge({
            continuousPlayCountdownTimerId: action.timerId,
            continuousPlayCountdownTimeLeft: action.timeLeft,
            continuousPlayCountdownDuration: action.duration
        })
    } else if (action.type === ActionType.CANCEL_CONTINUOUS_PLAY_COUNTDOWN) {
        return state.deleteAll([
            'continuousPlayCountdownTimerId', 
            'continuousPlayCountdownTimeLeft', 
            'continuousPlayCountdownDuration'
        ])
    }
    return state
}
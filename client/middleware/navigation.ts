import debounce from 'lodash-es/debounce'
import assign from 'lodash-es/assign'
import { ActionType, Action } from '@actions/types'
import { 
    markStack, 
    goForward, 
    playbackDidEnd, 
    updateContinuousPlayCountdown,
    cancelContinuousPlayCountdown
} from '@actions/room'
import CurrentUser from '@models/state/currentUser'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import MediaItem from '@models/entities/mediaItem'
import { Store, Dispatch } from '@types'

let markStackFn = debounce((store, next, action) => {
    store.dispatch(markStack(action.roomId, action.lastRead))
}, 1000)

function runContinuousPlayCountdown(store: Store, action: Action, secondsLeft: number, delay: number, duration: number) {
    let selectedMediaItem = Room.selectedMediaItem(store.getState(), action.roomId)

    if (secondsLeft <= 0) {
        store.dispatch(playbackDidEnd(action.roomId, selectedMediaItem.get('id'), 'mediaItem'))
        return;
    }

    let continuousPlayTimerId = window.setTimeout(() => {
        runContinuousPlayCountdown(store, action, secondsLeft-(delay/1000), delay, duration)
    }, delay)

    store.dispatch(updateContinuousPlayCountdown(action.roomId, continuousPlayTimerId, secondsLeft, duration))
}

function startContinuousPlayCountdown(store: Store, action: Action) {
    runContinuousPlayCountdown(store, action, 9, 500, 9)
}

function stopContinuousPlayCountdown(store: Store, action: Action) {
    const timerId = Room.get(store.getState(), action.roomId, 'continuousPlayCountdownTimerId')
    if (timerId > 0) {
        window.clearTimeout(timerId)
        store.dispatch(cancelContinuousPlayCountdown(action.roomId))
    }
}

export default (store: Store) => (next: Dispatch) => (action: Action) => {
    
    const state = store.getState()    

    if (action.type === ActionType.SELECT_MEDIA_ITEM) 
    {
        // Cancel previous continuous play countdown timer, if it exists
        stopContinuousPlayCountdown(store, action)

        /* Calculate number of media items in the range between the
         * last seen media item and the currently selected media item.
         * Decrement the unreadCount accordingly.
         */
        let lastReadDate = RoomPage.get(state, 'lastRead')
        let selectedMediaItem = new MediaItem(action.id, store.getState().get('entities'))
        let selectedMediaItemDate = new Date(selectedMediaItem.get('user_created_at'))

        if (lastReadDate < selectedMediaItemDate) 
        {
            let numSeenSinceLastSeen = RoomPage.allMediaItems(state).filter(mediaItem => {
                let mediaItemDate = new Date(mediaItem.get('user_created_at'))
                return mediaItemDate > lastReadDate && mediaItemDate <= selectedMediaItemDate;
            }).size 

            assign(action, {
                unreadCount: Math.max(RoomPage.get(state, 'unreadCount') - numSeenSinceLastSeen, 0),
                lastRead: selectedMediaItemDate
            })

            if (CurrentUser.isLoggedIn(state)) 
            {
                // User has read a new media item; we notify the server,
                // but we debounce so that we don't overwhelm the server
                // if the user is navigating quickly through items
                markStackFn(store, next, action);
            }
        }

        // Start countdown if continuous play is enabled
        if (Room.get(state, action.roomId, 'isContinuousPlayEnabled') && selectedMediaItem.get('type') === 'photo') {
            startContinuousPlayCountdown(store, action)
        }

        next(action)
    } 
    else if (action.type === ActionType.RECEIVE_ROOM_MARKED) {
        // Ignore if the locally stored unread count 
        // is greater than or equal to the one received
        if (action.unreadCount < RoomPage.get(state, 'unreadCount'))
        {
            // Calculate last read based on the new unread count
            let lastReadMediaItem = RoomPage.allMediaItems(state).reverse().get(action.unreadCount)
            if (lastReadMediaItem)
            {
                next(assign(action, {
                    lastRead: new Date(lastReadMediaItem.get('user_created_at'))
                }))
            }
        }
    }
    else if (action.type === ActionType.PLAYBACK_DID_END && action.itemType === 'mediaItem') {
        if (Room.get(state, action.roomId, 'isContinuousPlayEnabled')) {
            // Automatically select next media item
            store.dispatch(goForward(action.roomId))
        }
        next(action);
    }
    else if (action.type === ActionType.SET_CONTINUOUS_PLAY) 
    {
        // Start the countdown if the selected media item is an image
        if (action.enabled) {
            let selectedMediaItem = Room.selectedMediaItem(store.getState(), action.roomId)
            if (selectedMediaItem.get('type') === 'photo') {
                startContinuousPlayCountdown(store, action)
            }
        } else {
            stopContinuousPlayCountdown(store, action)
        }
        next(action);
    }
    else
    {
        next(action);
    }
    
}
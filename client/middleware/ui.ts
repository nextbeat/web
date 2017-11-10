import { ActionType, Action } from '@actions/types'
import { addSidebarAnimation, removeSidebarAnimation } from '@actions/app'
import { Store, Dispatch } from '@types'

export default (store: Store) => (next: Dispatch) => (action: Action) => {
    if (action.type === ActionType.SELECT_SIDEBAR ||
        action.type === ActionType.CLOSE_SIDEBAR)
    {   
        next(addSidebarAnimation())
        window.setTimeout(() => {
            next(removeSidebarAnimation())
        }, 250)
    }

    next(action);
}
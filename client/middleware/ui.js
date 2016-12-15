import { ActionTypes } from '../actions'

export default store => next => action => {
    if (action.type === ActionTypes.SELECT_SIDEBAR ||
        action.type === ActionTypes.CLOSE_SIDEBAR)
    {   
        next({
            type: ActionTypes.ADD_SIDEBAR_ANIMATION
        })
        setTimeout(() => {
            next({
                type: ActionTypes.REMOVE_SIDEBAR_ANIMATION
            })
        }, 250)
    }

    next(action);
}
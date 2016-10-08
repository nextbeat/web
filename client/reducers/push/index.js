export default function(state = Map(), action) {
    if (action.pushStatus) {
        return state.merge({
            pushStatus: action.pushStatus
        })
    }
    return state;
}
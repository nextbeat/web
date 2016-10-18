export default function(state = Map(), action) {
    if (action.pushStatus) {
        state = state.set('pushStatus', action.pushStatus)
    }
    if (action.pushType) {
        state = state.set('pushType', action.pushType)
    }
    if (action.subscription) {
        // subscription is a PushSubscription object which for security
        // reasons doesn't output secret values unless we do this silly 
        // noop operation
        state = state.set('subscription', JSON.parse(JSON.stringify(action.subscription)))
    }
    return state;
}
export const Dimensions = {
    STACK_ID: 'dimension1',
    MEDIAITEM_ID: 'dimension2',
    AUTHOR_ID: 'dimension3',
    AUTHOR_USERNAME: 'dimension4',
    TRACKING_VERSION: 'dimension5',
    CLIENT_ID: 'dimension6',
    WINDOW_ID: 'dimension7',
    HIT_ID: 'dimension8',
    HIT_TIME: 'dimension9',
    HIT_TYPE: 'dimension10',
    HIT_SOURCE: 'dimension11',
    VISIBILITY_STATE: 'dimension12',
    URL_QUERY_PARAMS: 'dimension13'
}

export const Metrics = {
    DURATION: 'metric1',
    START_TIME: 'metric2',
    END_TIME: 'metric3',
    VIDEO_DURATION: 'metric4',
    RESPONSE_END_TIME: 'metric5',
    DOM_LOAD_TIME: 'metric6',
    WINDOW_LOAD_TIME: 'metric7',
    PAGE_VISIBLE: 'metric8'
}

/* Gets number from string like dimensionX or metricY */
export function getDefinitionIndex(definition) {
    return parseInt(/\d+$/.exec(definition)[0], 10)
}
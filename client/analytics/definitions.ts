export const Dimensions = {
    TRACKING_VERSION: 'dimension1',
    USER_ID: 'dimension2',
    CLIENT_ID: 'dimension3',
    SESSION_ID: 'dimension4',
    WINDOW_ID: 'dimension5',
    STACK_ID: 'dimension6',
    MEDIAITEM_ID: 'dimension7',
    AUTHOR_ID: 'dimension8',
    HIT_ID: 'dimension9',
    HIT_TIME: 'dimension10',
    HIT_TYPE: 'dimension11',
    HIT_SOURCE: 'dimension12',
    AUTHOR_USERNAME: 'dimension13',
    VISIBILITY_STATE: 'dimension17',
    URL_QUERY_PARAMS: 'dimension18',
    AD_ID: 'dimension19',
    SHOP_PRODUCT_ID: 'dimension20'
}

export const Metrics = {
    DURATION: 'metric1',
    START_TIME: 'metric2',
    END_TIME: 'metric3',
    MEDIAITEM_DURATION: 'metric4',
    SESSION_DURATION: 'metric5',
    RESPONSE_END_TIME: 'metric6',
    DOM_LOAD_TIME: 'metric7',
    WINDOW_LOAD_TIME: 'metric8',
    PAGE_VISIBLE: 'metric9'
}

/* Gets number from string like dimensionX or metricY */
export function getDefinitionIndex(definition: any) {
    return parseInt((/\d+$/.exec(definition) as any[])[0], 10)
}
import { join } from 'path'
import assign from 'lodash-es/assign'
import isEmpty from 'lodash-es/isEmpty'
import * as format from 'date-fns/format'
import * as fetch from 'isomorphic-fetch'
import * as Promise from 'bluebird'
import { stringify } from 'querystring'
import { normalize } from 'normalizr'

import { Store, Dispatch } from '@types'
import { Status, ApiCall, Pagination, ApiCallAction, GenericAction } from '@actions/types'
import CurrentUser from '@models/state/currentUser'
import { baseUrl } from '@utils'
import { NotLoggedInError } from '@errors'

const API_ROOT = '/api/';

function urlWithParams(endpoint: string, pagination: Pagination, queries: any): string {
    let url = endpoint
    if (url[0] !== '/') {
        url = join(API_ROOT, endpoint);
    }
    queries = queries || {};

    if (typeof pagination !== 'undefined') {
        queries = assign({}, queries, { 
            page: pagination.page,
            limit: pagination.limit,
        })
        if (typeof pagination.beforeDate !== "undefined") {
            queries.before = format(pagination.beforeDate)
        }
    }

    if (!isEmpty(queries)) {
        url += "?" + stringify(queries);
    }

    return `${baseUrl()}${url}`;
}

interface FetchInit {
    method: "GET" | "HEAD" | "PUT" | "POST" | "DELETE"
    body?: string
    headers: any
    credentials: "same-origin"
}

function fetchOptions(store: Store, options: ApiCall): FetchInit {
    let { 
        method="GET", 
        body={},
    } = options

    let fetchOptions: FetchInit = {
        method,
        body: ["GET", "HEAD"].indexOf(method) === -1 ? JSON.stringify(body) : undefined, 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin' 
    }

    if (typeof window === 'undefined') {
        // If we're calling api methods server-side, we need to 
        // artificially inject the user's cookies into the request
        // if applicable. (NOTE: is there a better way to do this?)
        let cookie = CurrentUser.get(store.getState(), 'cookie')
        if (cookie) {
            fetchOptions.headers['Cookie'] = cookie
        }
    }

    return fetchOptions
}

function callApi(options: ApiCall, store: Store, action: ApiCallAction): Promise<[object, object]> {
    const { endpoint, schema, pagination, authenticated, queries } = options;
    const url = urlWithParams(endpoint, pagination, queries);

    if (authenticated && !CurrentUser.isLoggedIn(store.getState())) {
        return Promise.reject(new NotLoggedInError());
    }

    // we wrap in a bluebird promise to give access to bluebird methods (e.g. delay) 
    return Promise.resolve()
    .then(function() {
        return fetch(url, fetchOptions(store, options))
    })
    .then(response => {
        return response.json()
            .then( json => ({ json, response }))
            .catch( err => ({ json: {}, response }))
    })
    // .delay(1000) // FOR DEBUG
    .then(({ json, response }) => {
        if (!response.ok) {
            return Promise.reject(new Error(json.error));
        }
        if (typeof pagination !== 'undefined' && typeof schema !== 'undefined') {
            return [assign({}, normalize(json.objects, schema), json.meta), json];
        } else if (typeof schema !== 'undefined') {
            return [normalize(json, schema), json];
        } else {
            return [json, json];
        }
    })
}

// A Redux middleware function which looks for actions
// which call the API server and fetches the data
export default (store: Store) => (next: Dispatch) => (action: ApiCallAction) => {

    const apiCall = action.API_CALL;
    if (!apiCall) {
        return next(action);
    }

    // skip if on server and clientOnly specified
    if (typeof window === 'undefined' && apiCall.clientOnly) {
        return next(action);
    }

    const { pagination, onSuccess, onSuccessImmediate } = apiCall;

    // call api server with the given endpoint, then
    // dispatch action depending on success of the call
    const fetchPromise = callApi(apiCall, store, action)

    function actionWith(data: { status: Status, [key: string]: any }): ApiCallAction {
        var newAction = assign({}, action, data, { fetchPromise });
        return newAction;
    }

    fetchPromise.spread((response, rawResponse) => {

            // success callback which runs after reducer 
            if (typeof onSuccess === 'function') {
                process.nextTick(() => {
                    onSuccess(store, next, action, response, rawResponse);
                })
            }

            // success callback which runs before reducer
            if (typeof onSuccessImmediate === 'function') {
                onSuccessImmediate(store, next, action, response, rawResponse);
            }

            return next(actionWith({
                status: Status.SUCCESS,
                response,
                rawResponse
            }))

        })
        .catch(error => {
            return next(actionWith({
                status: Status.FAILURE,
                error: error
            }))
        });

    // dispatch action which asserts request is being made
    // include fetch promise so we can cancel it if need be
    let requestData: any = { status: Status.REQUESTING }
    if (pagination) {
        requestData.pagination = pagination
    }

    next(actionWith(requestData));
}
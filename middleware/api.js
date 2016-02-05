import { join } from 'path'
import { assign } from 'lodash'
import fetch from 'isomorphic-fetch'
import Promise from 'bluebird'
import moment from 'moment'
import { normalize } from 'normalizr'
import { Status } from '../actions'

const API_ROOT = '/api/';

function urlWithPaginationParams(endpoint, pagination) {
    const url = join(API_ROOT, endpoint);
    if (typeof pagination !== 'undefined') {
        const beforeDate = moment(pagination.before).format();
        return `${url}?page=${pagination.page}&limit=${pagination.limit}&before=${beforeDate}`;
    } else {
        return url;
    }
}

function callApi(endpoint, schema, pagination) {

    const url = urlWithPaginationParams(endpoint, pagination);
    return fetch(url)
        .then(response => response.json().then(json => ({ json, response })))
        .then(({ json, response }) => {
            if (!response.ok) {
                return Promise.reject(json)
            }
            if (typeof pagination !== 'undefined') {
                return assign({}, normalize(json.objects, schema), json.meta);
            } else {
                return normalize(json, schema);
            }
        })
}

export const API_CALL = Symbol('API_CALL');

// A Redux middleware function which looks for actions
// which call the API server and fetches the data
export default store => next => action => {

    const apiCall = action[API_CALL];
    if (typeof apiCall === 'undefined') {
        return next(action);
    }

    const { endpoint, schema, pagination } = apiCall;

    function actionWith(data) {
        var newAction = assign({}, action, data);
        delete newAction[API_CALL];
        return newAction;
    }

    // dispatch action which asserts request is being made
    next(actionWith({ status: Status.REQUESTING }));

    // call api server with the given endpoint, then
    // dispatch action depending on success of the call
    callApi(endpoint, schema, pagination)
        .then(response => next(actionWith({
            status: Status.SUCCESS,
            response 
        })))
        .catch(error => next(actionWith({
            status: Status.FAILURE,
            error
        })));
    

}
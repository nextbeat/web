import fetch from 'isomorphic-fetch'
import Promise from 'bluebird'
import assign from 'lodash/assign'
import find from 'lodash/find'

import { ActionTypes, Status, syncStacks, updateUser, updateNewMediaItem, updateProcessingProgress, initiateProcessingStage as _initiateProcessingStage } from '../actions'
import { App, Upload, CurrentUser } from '../models'
import { generateUuid } from '../utils'

function fetchApi(url, { method = 'GET', body } = {}) {
     const fetchOptions = {
        method,
        body : body ? JSON.stringify(body) : undefined,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'   
    }

    return Promise.resolve()
    .then(() => {
        return fetch(url, fetchOptions)
    })
    .then(response => response.json().then(json => ({ response, json })))
    .then(({ response, json }) => {
        if (!response.ok) {
            return Promise.reject(new Error(`Could not fetch ${url}.`))
        }
        return json;
    })   
}

function keyName(file, type, uuid) {
    var ext = file.name.split('.')[file.name.split('.').length-1]
    var prefix = type === 'video' ? 'videos' : 'images'
    return `${prefix}/${uuid}.${ext}`
}

function uploadFile(store, next, action, policy, key, xhr) {
    let fd = new FormData()
    let file = action.file

    function getCondition(cKey) {
        let condition = find(policy.policy.conditions, c => cKey in c)
        return condition[cKey]
    }

    // construct FormData object

    fd.append('key', key)
    fd.append('Content-Type', file.type)
    fd.append('x-amz-algorithm', getCondition('x-amz-algorithm'))
    fd.append('x-amz-credential', getCondition('x-amz-credential'))
    fd.append('x-amz-date', getCondition('x-amz-date'))
    fd.append('policy', btoa(JSON.stringify(policy.policy)))
    fd.append('x-amz-signature', policy.signature)
    fd.append('file', file)

    // construct and send XMLHttpRequest

    return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", e => {
            if (action.type === ActionTypes.UPLOAD_FILE) {
                next(assign({}, action, {
                    status: Status.REQUESTING,
                    progress: e.loaded / e.total
                }))
            }
        })

        xhr.addEventListener("load", e => {
            if (e.target.status >= 200 && e.target.status < 300) {
                resolve();
            } else {
                reject(new Error(e.target.statusText))
            }
        })

        xhr.addEventListener("error", e => {
            reject(new Error("Error during S3 upload."))
        })

        xhr.open("POST", Upload.bucketUrl(store.getState()), true)
        xhr.send(fd)

    })  
}

function getPolicy() {
    return fetchApi('/api/upload/policy')
}

function initiateProcessingStage(store) {
    let upload      = new Upload(store.getState())
    let mediaItem   = upload.get('mediaItem')

    return fetchApi('/api/upload/process', {
        method: 'POST',
        body: {
            url: mediaItem.get('url'),
            type: mediaItem.get('type') === 'video' ? 'video' : 'image' // TODO: standardize 'image' over 'photo' across the app
        }
    }).then(res => { 
        store.dispatch(updateNewMediaItem({
            resource_id: res.id
        }))
        store.dispatch(_initiateProcessingStage())
        return res.job
    })
}

function checkProcessingProgress(store, job_id) {
    let upload      = new Upload(store.getState())
    let mediaItem   = upload.get('mediaItem')

    return new Promise((resolve, reject) => {

        let checkProgress = function() {
            fetchApi('/api/upload/feedback', {
                method: 'POST',
                body: {
                    job: job_id,
                    type: mediaItem.get('type') === 'video' ? 'video' : 'image'
                }
            }).then(res => {
                store.dispatch(updateProcessingProgress({
                    progress: res.processingProgress.progress,
                    timeLeft: res.processingProgress.timeLeftInSecs,
                    completed: res.initialProcessCompleted
                }))

                if (res.initialProcessCompleted) {
                    clearInterval(intervalId)
                    resolve()
                }

            }).catch(e => {
                reject(e)
                clearInterval(intervalId)
            })
        }

        checkProgress()
        let intervalId = setInterval(checkProgress, 2000)
    })
}

function handleProcessingSuccess(store, next, action) {
    // Trigger sync stacks if requested
    let upload = new Upload(store.getState())
    if (upload.get('submitStackRequested')) {
        store.dispatch(syncStacks('open', true, upload.stackForSubmission()))
    }
}

function handleUploadSuccess(store, next, action) {
    if (action.type === ActionTypes.UPLOAD_FILE) {

        return Promise.resolve()
        .then(() => {
            return initiateProcessingStage(store)
        }).then((job_id) => {
            return checkProcessingProgress(store, job_id)
        }).then(() => {
            return handleProcessingSuccess(store)
        })
    }
} 



// Middleware function which handles 
// the upload process to S3
export default store => next => action => {

    if (action.type !== ActionTypes.UPLOAD_FILE 
        && action.type !== ActionTypes.UPLOAD_THUMBNAIL
        && action.type !== ActionTypes.UPLOAD_PROFILE_PICTURE
        && action.type !== ActionTypes.SUBMIT_STACK_REQUEST
        && action.type !== ActionTypes.CLEAR_UPLOAD) 
    {
        return next(action)
    }

    function callActionWith(data) {
        next(assign({}, action, data))
    }

    if (action.type === ActionTypes.CLEAR_UPLOAD) {
        // We want to abort the upload request if this
        // action is called.
        let upload = new Upload(store.getState())
        let xhr = upload.get('xhr')
        if (xhr) {
            xhr.abort();
        }
        return next(action)
    }

    if (action.type === ActionTypes.SUBMIT_STACK_REQUEST) {
        // We want to delay syncing the stack until the resource
        // has been uploaded to S3, so we intercept this action
        // here and wait until the resource has completed the
        // upload process before we trigger the sync
        let upload = new Upload(store.getState())
        if (!upload.isDoneProcessing()) {
            return next(action)
        } else {
            return store.dispatch(syncStacks('open', true, upload.stackForSubmission()))
        }
    }

    // For all other action types, upload file

    // Check mime type compatibility
    if (!Upload.isCompatibleMimeType(action.file.type)) {
        return callActionWith({
            status: Status.FAILURE,
            error: 'Incompatible file type. We currently accept mp4 videos and jpg or png images.'
        })
    }

    // Check file size
    if (action.file.size > 200*1024*1024) {
        return callActionWith({
            status: Status.FAILURE,
            error: 'File exceeds size limit. Files cannot be greater than 200 MB.'
        })
    }

    let currentUser = new CurrentUser(store.getState())
    if (!currentUser.isLoggedIn()) {
        return callActionWith({
            status: Status.FAILURE,
            error: "User is not logged in."
        })
    }

    // Generate uuid and url for item if not provided
    const fileType = Upload.fileTypeForMimeType(action.file.type)
    const uuid = generateUuid()
    const key = action.key || keyName(action.file, fileType, uuid)
    const url = `${Upload.cloudfrontUrl(store.getState())}${key}`

    // Retrieve open stacks for display on upload page
    if (action.type === ActionTypes.UPLOAD_FILE) {
        store.dispatch(syncStacks('open', false))
    }

    // we keep a reference to the XHR object so we can abort if requested
    let xhr = new XMLHttpRequest() 

    if (action.type === ActionTypes.UPLOAD_FILE) {
        callActionWith({
            status: Status.REQUESTING,
            progress: 0,
            mediaItem: {
                url,
                uuid,
                type: fileType === 'image' ? 'photo' : 'video' 
            },
            xhr
        })
    } else if (action.type === ActionTypes.UPLOAD_THUMBNAIL || action.type === ActionTypes.UPLOAD_PROFILE_PICTURE) {
        callActionWith({
            status: Status.REQUESTING,
            url
        })
    } 


    // Retrieve S3 POST policy from server
    getPolicy()
    // .delay(5000) // FOR DEBUG
    .then(policy => {
        return uploadFile(store, next, action, policy, key, xhr)
    })
    .then(() => {
        callActionWith({
            status: Status.SUCCESS
        })
        handleUploadSuccess(store, next, action, url)
    })
    .catch(error => {
        callActionWith({
            status: Status.FAILURE,
            error: 'Unknown error uploading file. Please try again.'
        })
    })
}
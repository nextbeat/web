import * as fetch from 'isomorphic-fetch'
import * as Promise from 'bluebird'
import assign from 'lodash-es/assign'
import find from 'lodash-es/find'
import keys from 'lodash-es/keys'

import { ActionType, Status, GenericAction } from '@actions/types'
import { 
    updateNewMediaItem,
    updateProcessingProgress,
    stopFileUpload,
    UploadFileAction, 
    StopFileUploadAction, 
    ClearFileUploadAction, 
    UpdateNewMediaItemAction 
} from '@actions/upload'
import { syncStacks } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import Upload from '@models/state/upload'
import { Store, Dispatch } from '@types'
import { UploadType, fileType, cloudfrontUrl, bucketUrl, checkFileCompatibility } from '@upload'
import { generateUuid } from '@utils'

function fetchApi(url: string, method = 'GET', body?: any): Promise<any> {
     const fetchOptions: RequestInit = {
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

function keyName(file: File, type: string, uuid: string) {
    var ext = file.name.split('.')[file.name.split('.').length-1]
    var prefix = type === 'video' ? 'videos' : 'images'
    return `${prefix}/${uuid}.${ext}`
}

function uploadFileToS3(store: Store, next: Dispatch, action: UploadFileAction, policy: any, key: string, xhr: XMLHttpRequest) {
    let fd = new FormData()
    let file = action.file

    function getCondition(cKey: string) {
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
        xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
            next(assign({}, action, {
                status: Status.REQUESTING,
                progress: event.loaded / event.total
            }))
        })

        xhr.addEventListener("load", (event: UIEvent) => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(xhr.statusText))
            }
        })

        xhr.addEventListener("error", (event: Event) => {
            reject(new Error("Error during S3 upload."))
        })

        xhr.open("POST", bucketUrl(), true)
        xhr.send(fd)

    })  
}

function getPolicy(): Promise<any> {
    return fetchApi('/api/upload/policy')
}

function initiateProcessingStage(store: Store): Promise<string> {
    let mediaItem = Upload.get(store.getState(), 'mediaItem')

    return fetchApi('/api/upload/process', 'POST', {
        url: mediaItem.get('url'),
        type: mediaItem.get('type') === 'video' ? 'video' : 'image' // TODO: standardize 'image' over 'photo' across the app
    }).then(res => { 
        store.dispatch(updateNewMediaItem({
            resource_id: res.id
        }))
        return res.job
    })
}

function checkProcessingProgress(store: Store, job_id: string): Promise<any> {
    let mediaItem = Upload.get(store.getState(), 'mediaItem')

    return new Promise((resolve, reject) => {

        let checkProgress = function() {
            fetchApi('/api/upload/feedback', 'POST', {
                job: job_id,
                type: mediaItem.get('type') === 'video' ? 'video' : 'image'
            }).then(res => {
                if (!Upload.hasFile(store.getState(), UploadType.MediaItem)) {
                    // If user has cleared the upload,
                    // we want to exit early
                    clearInterval(intervalId)
                    return resolve()
                }

                if (res.initialProcessCompleted) {
                    store.dispatch(updateNewMediaItem({
                        processedItem: res.processedItem
                    }))
                }

                store.dispatch(updateProcessingProgress(UploadType.MediaItem, {
                    progress: res.processingProgress.progress,
                    timeLeft: res.processingProgress.timeLeftInSecs,
                    completed: res.initialProcessCompleted
                }))

                if (res.initialProcessCompleted) {
                    clearInterval(intervalId)
                    return resolve()
                }

            }).catch(e => {
                reject(e)
                clearInterval(intervalId)
            })
        }

        checkProgress()
        let intervalId = window.setInterval(checkProgress, 2000)
    })
}

function handleProcessingSuccess(store: Store) {
    // Trigger sync stacks if requested
    if (Upload.get(store.getState(), 'submitStackRequested')) {
        store.dispatch(syncStacks('open', true, Upload.stackForSubmission(store.getState())))
    }
}

function handleUploadSuccess(store: Store, next: Dispatch, action: UploadFileAction) {
    if (action.uploadType === UploadType.MediaItem) {
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

function checkVideoDuration(store: Store, next: Dispatch, action: UpdateNewMediaItemAction) {
    let duration = action.mediaItem.duration
    if (duration > 60*15) {
        store.dispatch(stopFileUpload(new Error('Video cannot be longer than 15 minutes.'), UploadType.MediaItem))
    }
}

function uploadFile(store: Store, next: Dispatch, action: UploadFileAction) {

    function callActionWith(data: any) {
        next(assign({}, action, data))
    }

    const state = store.getState()

    if (!CurrentUser.isLoggedIn(state)) {
        return callActionWith({
            status: Status.FAILURE,
            error: "User is not logged in."
        })
    }

    // Generate uuid and url for item if not provided
    const type = fileType(action.file)
    const uuid = generateUuid()
    const key = keyName(action.file, type, uuid)
    const url = `${cloudfrontUrl()}${key}`

    // we keep a reference to the XHR object so we can abort if requested
    let xhr = new XMLHttpRequest() 

    let actionData: any = {
        status: Status.REQUESTING,
        progress: 0,
        xhr,
        url
    }
    if (action.uploadType === UploadType.MediaItem) {
        actionData.mediaItem = {
            url,
            uuid,
            type: type === 'image' ? 'photo' : 'video' 
        }
    }

    Promise.resolve()
    .then(() => {

        // Will throw an error if file type is not supported or file is too large
        checkFileCompatibility(action.uploadType, action.file)

        // Retrieve open stacks for display on upload page
        if (action.uploadType === UploadType.MediaItem) {
            store.dispatch(syncStacks('open', false))
        }

        callActionWith(actionData)

    })
    // Retrieve S3 POST policy from server
    .then(getPolicy)
    // .delay(5000) // FOR DEBUG
    .then(policy => {
        return uploadFileToS3(store, next, action, policy, key, xhr)
    })
    .then(() => {
        callActionWith({
            status: Status.SUCCESS
        })
        handleUploadSuccess(store, next, action)
    })
    .catch(error => {
        callActionWith({
            status: Status.FAILURE,
            error: error.message || 'Unknown error uploading file. Please try again.'
        })
    })
}

// Middleware function which handles 
// the upload process to S3
export default (store: Store) => (next: Dispatch) => (action: GenericAction) => {

    if (action.type !== ActionType.UPLOAD_FILE 
        && action.type !== ActionType.SUBMIT_STACK_REQUEST
        && action.type !== ActionType.UPDATE_NEW_MEDIA_ITEM
        && action.type !== ActionType.STOP_FILE_UPLOAD
        && action.type !== ActionType.CLEAR_FILE_UPLOAD
        && action.type !== ActionType.CLEAR_UPLOAD) 
    {
        return next(action)
    }

    const state = store.getState()
    
    if (action.type === ActionType.STOP_FILE_UPLOAD || action.type === ActionType.CLEAR_FILE_UPLOAD) {
        // We want to abort the upload request if this
        // action is called.
        const uploadType = (action as StopFileUploadAction | ClearFileUploadAction).uploadType        
        let xhr = Upload.getInFile(state, uploadType, 'xhr')
        if (xhr) {
            xhr.abort();
        }
        return next(action)
    }

    if (action.type === ActionType.CLEAR_UPLOAD) {
        // We want to abort ALL upload requests in this case
        keys(UploadType).map(k => UploadType[k as any]).forEach((type: UploadType) => {
            let xhr = Upload.getInFile(state, type, 'xhr')
            if (xhr) {
                xhr.abort();
            }
        })
        return next(action)
    }

    if (action.type === ActionType.SUBMIT_STACK_REQUEST) {
        // We want to delay syncing the stack until the resource
        // has been uploaded to S3, so we intercept this action
        // here and wait until the resource has completed the
        // upload process before we trigger the sync
        if (!Upload.isDoneProcessing(state, UploadType.MediaItem)) {
            return next(action)
        } else {
            return store.dispatch(syncStacks('open', true, Upload.stackForSubmission(state)))
        }
    }

    if (action.type === ActionType.UPDATE_NEW_MEDIA_ITEM) {
        if (Upload.isUploading(state, UploadType.MediaItem) && Upload.fileType(state, UploadType.MediaItem) === 'video') {
            checkVideoDuration(store, next, action as UpdateNewMediaItemAction)
        }
        return next(action)
    }

    if (action.type === ActionType.UPLOAD_FILE) {
        uploadFile(store, next, action as UploadFileAction)
    }

}
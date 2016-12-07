import assign from 'lodash/assign'
import addSeconds from 'date-fns/add_seconds'
import isBefore from 'date-fns/is_before'
import format from 'date-fns/format'

/************
 * FULLSCREEN
 ************/

// Code sourced from https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player

export function isFullScreenEnabled() {
    return !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);
} 

export function isFullScreen() {
    return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
}

export function toggleFullScreen(element, callback) {
    if (isFullScreen()) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      if (callback) callback(false);
   } else {
      if (element.requestFullscreen) element.requestFullscreen();
      else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
      else if (element.webkitRequestFullScreen) element.webkitRequestFullScreen();
      else if (element.msRequestFullscreen) element.msRequestFullscreen();
      if (callback) callback(true);
   }
}


/******
 * UUID
 ******/

/* We're using a less cryptographically secure
 * UUID generator because running node-uuid in
 * the browser requires shimming Node's crypto
 * module, which adds ~800KB to the bundle (before
 * minification). The date addition means that 
 * even if two clients have the same seed for
 * Math.random(), they will only generate the same
 * UUID if they run at the same millisecond (if 
 * the browser has performance, likelihood of
 * collision is even less). Sourced from 
 * http://stackoverflow.com/a/8809472
 */
export function generateUuid() {
    var d = new Date().getTime();
    if (window && window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


/*****
 * URL
 *****/

export function baseUrl(env, secure=true) {
    env = env || process.env.NODE_ENV || 'development'
    const scheme = secure ? 'https://' : 'http://'
    switch(env) {
        case 'production':
            return `${scheme}nextbeat.co`
        case 'development':
            return `${scheme}dev.nextbeat.co`
        case 'local':
            return `http://localhost:8080`
        case 'mac':
        case 'mac-dev':
        default:
            var hostname = (typeof window !== 'undefined' && window.location.hostname) || 'localhost'
            return `http://${hostname}:3000`
    }
}

export function baseApiUrl(env, secure=true) {
    env = env || process.env.NODE_ENV || 'development'
    const scheme = secure ? 'https://' : 'http://'
    switch(env) {
        case 'production':
            return `${scheme}api.nextbeat.co/v1`
        case 'development':
            return `${scheme}api.dev.nextbeat.co/v1`
        case 'local':
            return `http://localhost:8000/v1`
        case 'mac':
        case 'mac-dev':
        default:
            return 'http://api/v1/'
    }
}

export function secureUrl(url) {
  if (!url) {
    return null
  }
  if (!/^https?:\/\//.test(url)) {
    return `https://${url}`
  }
  return url.replace(/http:\/\//, 'https://')
}

export function isValidUrl(url) {
  var urlRegexStr = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$'
  var urlRegex = new RegExp(urlRegexStr, 'i')
  return urlRegex.test(url)
}


/*********
 * STORAGE
 *********/

export function storageAvailable(storageType) {
  try {
    var storage = window[storageType],
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
      return false;
  }
}

const defaultStorageOptions = {
  type: 'localStorage',
  ttl: 60*60*36 // 36 hours
}

export function setStorageItem(key, value, options) {
  options = assign({}, defaultStorageOptions, options)
  var storage = window[options.type]
  var storedValue = {
    value: value,
  }

  if (options.ttl > 0) {
    storedValue.expires = format(addSeconds(new Date(), options.ttl))
  }

  if (storageAvailable(options.type)) {
    storage.setItem(key, JSON.stringify(storedValue))
  }
}

export function getStorageItem(key, options) {
  options = assign({}, defaultStorageOptions, options)
  var value = null;
  var storage = window[options.type];

  if (storageAvailable(options.type)) {
    var storedValueString = storage.getItem(key);
    if (storedValueString !== null) {
      try {
        var storedValue = JSON.parse(storage.getItem(key));      
        if (!('expires' in storedValue && isBefore(storedValue.expires, new Date()))) {
          value = storedValue.value;
        }
      } catch (e) {
        value = null;
      }
    }
  }
  return value;
}

export function getStorageItemExpiration(key, options) {
  options = assign({}, defaultStorageOptions, options)
  var expires = null;
  var storage = window[options.type];

  if (storageAvailable(options.type)) {
    var storedValueString = storage.getItem(key);
    if (storedValueString !== null) {
      try {
        var storedValue = JSON.parse(storage.getItem(key));      
        if ('expires' in storedValue) {
          expires = storedValue.expires;
        }
      } catch (e) {
        expires = null;
      }
    }
  }
  return expires;
}

/*************
 * CONVERSIONS
 *************/

// sourced from https://github.com/web-push-libs/web-push
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


/*****************
 * DATE FORMATTING
 *****************/

export { fromString, fromNowString, timeLeftString } from './date'

/*******
 * OTHER
 *******/

export function createFunctionWithTimeout(fn, timeout=1000) {
  let called = false

  function callFn() {
    if (!called) {
      called = true;
      fn();
    }
  }

  setTimeout(callFn, timeout);
  return callFn;
}

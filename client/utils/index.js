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

/**************
 * AVAILABILITY
 **************/

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

/********
 * DEVICE
 ********/

// Code sourced from http://stackoverflow.com/questions/9038625
export function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/***************
 * MEDIA HELPERS
 ***************/

// Code sourced from http://stackoverflow.com/questions/7584794
export function getOrientationFromFile(file, callback) {
  var reader = new FileReader();
  reader.onload = function(e) {

    var view = new DataView(e.target.result);
    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    var length = view.byteLength, offset = 2;
    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;
      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
        for (var i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) == 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      }
      else if ((marker & 0xFF00) != 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };
  reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
}

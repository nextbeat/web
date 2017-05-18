export function NotLoggedInError(message="User is not logged on.") {
    this.name = 'NotLoggedInError';
    this.message = message;
    this.stack = (new Error()).stack;
}

NotLoggedInError.prototype = Object.create(Error.prototype);
NotLoggedInError.prototype.constructor = NotLoggedInError;

export function EddyError(message) {
    this.name = 'EddyError';
    this.message = message;
    this.stack = (new Error()).stack;
}

EddyError.prototype = Object.create(Error.prototype);
EddyError.prototype.constructor = EddyError;

export function TimeoutError(message) {
    this.name = 'TimeoutError';
    this.message = message;
    this.stack = (new Error()).stack;
}

TimeoutError.prototype = Object.create(Error.prototype);
TimeoutError.prototype.constructor = TimeoutError;